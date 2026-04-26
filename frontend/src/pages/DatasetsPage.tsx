import { useEffect, useMemo, useState, type CSSProperties, type ReactNode, type SVGProps } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RiskLabelStrip } from '../components/trust/TrustLayer'
import {
    DISCOVERY_REVIEW_STATE_META,
    DISCOVERY_REVIEW_STATE_OPTIONS,
    type DiscoveryReviewState,
    type DiscoveryReviewStateMeta
} from '../data/discoveryReviewData'
import {
    loadDatasetDiscoverySummaries,
    type AccessType,
    type DatasetDiscoverySummary,
    type VerificationStatus
} from '../data/datasetCatalogData'
import {
    buildDealPath,
    buildDemoDealPath,
    getDealRouteRecordByDatasetId
} from '../data/dealDossierData'
import {
    dashboardColorTokens,
    dashboardComponentTokens
} from '../dashboardTokens'
import {
    buildDiscoveryReviewAction,
    buildDiscoveryReviewCounts,
    getDiscoveryReviewState,
    loadDiscoveryReviewStateMap,
    saveDiscoveryReviewStateMap,
    syncDiscoveryReviewStateMap,
    type DiscoveryReviewAction,
    type DiscoveryReviewStateMap
} from '../domain/discoveryReviewState'
import { getDatasetGeoAccessSignal } from '../domain/datasetGeoAccess'
import { getDatasetTrustRiskLabels } from '../domain/datasetTrustProfile'
import {
    emptyStep1FormState,
    onboardingStorageKeys,
    readOnboardingValue
} from '../onboarding/storage'

type SortOption = 'best-match' | 'highest-confidence' | 'highest-provider-trust' | 'most-recent'
type SignalTone = 'healthy' | 'monitoring' | 'scheduled'
type Dataset = DatasetDiscoverySummary
type RegulatedDiscoveryFilter =
    | 'All'
    | 'UAE local-only'
    | 'Regulated-use ready'
    | 'Cross-border review required'
    | 'Provider-shielded'

type FilterState = {
    searchTerm: string
    domain: string
    dataType: string
    geography: string
    verificationStatus: 'All' | VerificationStatus
    freshnessBucket: string
    minConfidence: number
    regulatedDiscovery: RegulatedDiscoveryFilter
}

type ActiveFilterChip = {
    key: keyof FilterState
    label: string
}

type DecisionAction = {
    label: string
    detail: string
    href?: string
    to?: string
    tone: SignalTone
}

type RequestReadiness = {
    tone: SignalTone
    title: string
    detail: string
    primaryLabel: string
    primaryTo?: string
    primaryHref?: string
    secondaryLabel: string
    secondaryTo?: string
    secondaryHref?: string
}

type TrackedReviewDataset = {
    dataset: Dataset
    reviewState: DiscoveryReviewState
    reviewMeta: DiscoveryReviewStateMeta
    reviewAction: DiscoveryReviewAction
}

type SidebarSectionKey =
    | 'priorityDomains'
    | 'dataType'
    | 'geography'
    | 'freshness'
    | 'verification'
    | 'minConfidence'

type SidebarSectionState = Record<SidebarSectionKey, boolean>

type RailSectionKey = 'shortlist' | 'compare' | 'requestReadiness'
type RailSectionState = Record<RailSectionKey, boolean>

type RegulatedCardBadge = {
    label: string
    tone: SignalTone
}

type RegulatedDiscoveryProfile = {
    uaeLocalOnly: boolean
    regulatedUseReady: boolean
    crossBorderReviewRequired: boolean
    providerShielded: boolean
    cardBadges: RegulatedCardBadge[]
}

type DiscoveryCardBadge =
    | {
        key: string
        label: string
        kind: 'status'
        statusKind: 'verification' | 'access'
    }
    | {
        key: string
        label: string
        kind: 'signal'
        tone: SignalTone
    }

const STORAGE_DATASET_SHORTLIST = 'Redoubt:datasets:shortlist'
const STORAGE_DATASET_COMPARE = 'Redoubt:datasets:compare'
const MAX_COMPARE_ITEMS = 3

const defaultFilters: FilterState = {
    searchTerm: '',
    domain: 'All',
    dataType: 'All',
    geography: 'All',
    verificationStatus: 'All',
    freshnessBucket: 'All',
    minConfidence: 0,
    regulatedDiscovery: 'All'
}

const defaultSidebarSections: SidebarSectionState = {
    priorityDomains: true,
    dataType: true,
    geography: true,
    freshness: true,
    verification: true,
    minConfidence: true
}

const defaultRailSections: RailSectionState = {
    shortlist: true,
    compare: true,
    requestReadiness: true
}

const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'best-match', label: 'Best match' },
    { value: 'highest-confidence', label: 'Highest confidence' },
    { value: 'highest-provider-trust', label: 'Highest provider review signal' },
    { value: 'most-recent', label: 'Most recent' }
]

const verificationStates: FilterState['verificationStatus'][] = ['All', 'Attested', 'Under Review']
const freshnessBuckets = ['All', 'Real-time / <1h', 'Daily', 'Weekly']
const minConfidenceOptions = [0, 85, 90, 95]
const regulatedDiscoveryFilters: RegulatedDiscoveryFilter[] = [
    'All',
    'UAE local-only',
    'Regulated-use ready',
    'Cross-border review required',
    'Provider-shielded'
]

const REGULATED_DISCOVERY_PROFILES: Record<number, RegulatedDiscoveryProfile> = {
    1: {
        uaeLocalOnly: false,
        regulatedUseReady: true,
        crossBorderReviewRequired: true,
        providerShielded: false,
        cardBadges: [
            { label: 'Regulated-use ready', tone: 'healthy' },
            { label: 'Cross-border review', tone: 'monitoring' },
            { label: 'Governed transfer', tone: 'scheduled' }
        ]
    },
    2: {
        uaeLocalOnly: false,
        regulatedUseReady: true,
        crossBorderReviewRequired: true,
        providerShielded: true,
        cardBadges: [
            { label: 'Regulated-use ready', tone: 'healthy' },
            { label: 'Cross-border review', tone: 'monitoring' },
            { label: 'Provider-shielded', tone: 'scheduled' }
        ]
    },
    3: {
        uaeLocalOnly: false,
        regulatedUseReady: true,
        crossBorderReviewRequired: true,
        providerShielded: true,
        cardBadges: [
            { label: 'Regulated-use ready', tone: 'healthy' },
            { label: 'Cross-border review', tone: 'monitoring' },
            { label: 'Provider-shielded', tone: 'scheduled' }
        ]
    },
    4: {
        uaeLocalOnly: true,
        regulatedUseReady: true,
        crossBorderReviewRequired: false,
        providerShielded: true,
        cardBadges: [
            { label: 'UAE local-only', tone: 'healthy' },
            { label: 'Regulated-use ready', tone: 'healthy' },
            { label: 'Provider-shielded', tone: 'scheduled' }
        ]
    },
    5: {
        uaeLocalOnly: false,
        regulatedUseReady: false,
        crossBorderReviewRequired: true,
        providerShielded: false,
        cardBadges: [
            { label: 'Cross-border review', tone: 'monitoring' },
            { label: 'Governed transfer', tone: 'scheduled' }
        ]
    },
    6: {
        uaeLocalOnly: false,
        regulatedUseReady: false,
        crossBorderReviewRequired: true,
        providerShielded: true,
        cardBadges: [
            { label: 'Cross-border review', tone: 'monitoring' },
            { label: 'Provider-shielded', tone: 'scheduled' }
        ]
    },
    7: {
        uaeLocalOnly: true,
        regulatedUseReady: true,
        crossBorderReviewRequired: false,
        providerShielded: true,
        cardBadges: [
            { label: 'UAE local-only', tone: 'healthy' },
            { label: 'Regulated-use ready', tone: 'healthy' },
            { label: 'Provider-shielded', tone: 'scheduled' }
        ]
    },
    8: {
        uaeLocalOnly: false,
        regulatedUseReady: true,
        crossBorderReviewRequired: true,
        providerShielded: true,
        cardBadges: [
            { label: 'Regulated-use ready', tone: 'healthy' },
            { label: 'Cross-border review', tone: 'monitoring' },
            { label: 'Provider-shielded', tone: 'scheduled' }
        ]
    }
}

const focusRingClass =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]'

const discoveryPageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const discoveryShellClass = 'relative mx-auto max-w-[1920px] px-4 py-4 xl:px-6 xl:py-5 2xl:px-8'
const topStripClass =
    'sticky top-0 z-40 mb-6 rounded-[24px] border border-white/10 bg-[#101723]/90 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl'
const panelSurfaceClass =
    'overflow-hidden rounded-[24px] border border-white/10 bg-[#161b22]/92 shadow-[0_24px_64px_-36px_rgba(0,0,0,0.7)] backdrop-blur-xl'
const flatPanelClass =
    'rounded-[18px] border border-white/10 bg-[#0f1621]/95 shadow-[0_14px_32px_-24px_rgba(0,0,0,0.72)]'
const insetPanelClass =
    'rounded-[16px] border border-white/8 bg-[#0d1117]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
const actionButtonClass =
    `inline-flex items-center justify-center rounded-[14px] border border-cyan-400/30 bg-[#0f2a33] px-4 py-2.5 text-sm font-medium text-cyan-100 transition-all duration-200 hover:border-cyan-300 hover:bg-cyan-500/15 ${focusRingClass}`
const secondaryButtonClass =
    `inline-flex items-center justify-center rounded-[14px] border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-cyan-400/30 hover:text-white ${focusRingClass}`
const filterOptionBaseClass =
    `flex w-full items-center justify-between rounded-[14px] border px-3 py-3 text-left text-sm transition-all duration-200 ${focusRingClass}`
const catalogRowGridClass =
    'grid min-w-[1420px] gap-0 xl:grid-cols-[64px_minmax(380px,2.45fr)_minmax(148px,0.95fr)_minmax(118px,0.72fr)_minmax(118px,0.72fr)_minmax(132px,0.82fr)_minmax(132px,0.82fr)_minmax(132px,0.82fr)_minmax(166px,0.95fr)_132px]'
const heroSurfaceClass =
    'relative overflow-hidden rounded-[34px] border border-cyan-400/18 bg-[linear-gradient(135deg,rgba(8,15,29,0.98),rgba(17,27,47,0.95)_44%,rgba(12,20,36,0.98))] p-5 shadow-[0_40px_120px_-56px_rgba(34,211,238,0.22),0_24px_64px_-38px_rgba(2,6,23,0.94)] sm:p-6 xl:p-7'
const cardSurfaceClass =
    'absolute inset-0 flex h-full flex-col overflow-hidden rounded-[28px] border border-[#253550] bg-[linear-gradient(180deg,rgba(17,26,44,0.97),rgba(12,19,34,0.95))] p-5 shadow-[0_28px_70px_-48px_rgba(2,6,23,0.95)] sm:p-5 xl:p-6'
const subCardSurfaceClass =
    'rounded-[24px] border border-white/10 bg-[#10192e]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
const controlSurfaceClass =
    'rounded-[24px] border border-white/10 bg-[#10192e]/82 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
const fieldClass =
    `mt-3 w-full rounded-[18px] border border-white/10 bg-[#0d162a]/95 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 ${focusRingClass}`
const primaryButtonClass =
    `inline-flex items-center justify-center rounded-[15px] bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#04101d] shadow-[0_18px_44px_-24px_rgba(34,211,238,0.75)] transition-all duration-200 hover:-translate-y-px hover:bg-cyan-300 ${focusRingClass}`
const discoveryText = {
    eyebrow: 'text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500/90',
    heroEyebrow: 'text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/75',
    heroTitle: 'text-[2.7rem] font-semibold tracking-[-0.055em] text-slate-50 sm:text-[3.15rem] xl:text-[3.55rem] xl:leading-[1.02]',
    panelTitle: 'text-[1.45rem] font-semibold tracking-[-0.04em] text-slate-50 sm:text-[1.6rem]',
    railTitle: 'text-[1.18rem] font-semibold tracking-[-0.03em] text-slate-50',
    itemTitle: 'text-[1.4rem] font-semibold tracking-[-0.04em] text-slate-50',
    body: 'text-sm leading-6 text-slate-400',
    bodyStrong: 'text-sm leading-6 text-slate-200',
    meta: 'text-[13px] leading-5 text-slate-500',
    metaStrong: 'text-[13px] font-medium leading-5 text-slate-300'
} as const

const getDatasetRouteId = (dataset: Dataset) => dataset.detailId ?? String(dataset.id)

const getDatasetDetailPath = (dataset: Dataset, demo: boolean) =>
    `${demo ? '/demo' : ''}/datasets/${getDatasetRouteId(dataset)}`

const getDatasetDossierPath = (dataset: Dataset, demo: boolean) => {
    const dealRoute = getDealRouteRecordByDatasetId(getDatasetRouteId(dataset))
    if (!dealRoute) return null

    return demo
        ? buildDemoDealPath(dealRoute.dealId, 'dossier')
        : buildDealPath(dealRoute.dealId, 'dossier')
}

export default function DatasetsPage() {
    const location = useLocation()
    const datasets = useMemo(() => loadDatasetDiscoverySummaries(), [location.key])
    const [filters, setFilters] = useState<FilterState>(defaultFilters)
    const [sortOption, setSortOption] = useState<SortOption>('best-match')
    const [shortlistIds, setShortlistIds] = useState<number[]>(() => parseStoredIdList(STORAGE_DATASET_SHORTLIST))
    const [compareIds, setCompareIds] = useState<number[]>(() => parseStoredIdList(STORAGE_DATASET_COMPARE))
    const [reviewStateMap, setReviewStateMap] = useState<DiscoveryReviewStateMap>(() =>
        syncDiscoveryReviewStateMap(
            parseStoredIdList(STORAGE_DATASET_SHORTLIST),
            loadDiscoveryReviewStateMap()
        )
    )
    const prefersReducedMotion = usePrefersReducedMotion()
    const buyerOrgCountry = useMemo(
        () => readOnboardingValue(onboardingStorageKeys.step1, emptyStep1FormState).country.trim(),
        []
    )
    const hasBuyerGeoProfile = buyerOrgCountry.length > 0
    const geoPolicyNoteTone: SignalTone = hasBuyerGeoProfile ? 'scheduled' : 'monitoring'
    const demo = location.pathname.startsWith('/demo/')
    const domains = useMemo(() => ['All', ...new Set(datasets.map(dataset => dataset.domain))], [datasets])
    const dataTypes = useMemo(() => ['All', ...new Set(datasets.map(dataset => dataset.dataType))], [datasets])
    const geographies = useMemo(() => ['All', ...new Set(datasets.map(dataset => dataset.geography))], [datasets])

    useEffect(() => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(STORAGE_DATASET_SHORTLIST, JSON.stringify(shortlistIds))
    }, [shortlistIds])

    useEffect(() => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(STORAGE_DATASET_COMPARE, JSON.stringify(compareIds))
    }, [compareIds])

    useEffect(() => {
        setReviewStateMap(current => syncDiscoveryReviewStateMap(shortlistIds, current))
    }, [shortlistIds])

    useEffect(() => {
        saveDiscoveryReviewStateMap(reviewStateMap)
    }, [reviewStateMap])

    const filteredDatasets = useMemo(() => {
        const searchTerm = filters.searchTerm.trim().toLowerCase()

        const results = datasets.filter(dataset => {
            const regulatedProfile = getRegulatedDiscoveryProfile(dataset)
            const searchableText = [
                dataset.title,
                dataset.description,
                dataset.bestFor,
                dataset.domain,
                dataset.confidenceSummary
            ].join(' ').toLowerCase()

            const matchesSearch = searchTerm.length === 0 || searchableText.includes(searchTerm)
            const matchesDomain = filters.domain === 'All' || dataset.domain === filters.domain
            const matchesType = filters.dataType === 'All' || dataset.dataType === filters.dataType
            const matchesGeography = filters.geography === 'All' || dataset.geography === filters.geography
            const matchesVerification =
                filters.verificationStatus === 'All' || dataset.verificationStatus === filters.verificationStatus
            const matchesFreshness =
                filters.freshnessBucket === 'All' || bucketFreshness(dataset.freshness) === filters.freshnessBucket
            const matchesConfidence = dataset.confidenceScore >= filters.minConfidence
            const matchesRegulatedDiscovery =
                filters.regulatedDiscovery === 'All' ||
                (filters.regulatedDiscovery === 'UAE local-only' && regulatedProfile.uaeLocalOnly) ||
                (filters.regulatedDiscovery === 'Regulated-use ready' && regulatedProfile.regulatedUseReady) ||
                (filters.regulatedDiscovery === 'Cross-border review required' && regulatedProfile.crossBorderReviewRequired) ||
                (filters.regulatedDiscovery === 'Provider-shielded' && regulatedProfile.providerShielded)

            return (
                matchesSearch &&
                matchesDomain &&
                matchesType &&
                matchesGeography &&
                matchesVerification &&
                matchesFreshness &&
                matchesConfidence &&
                matchesRegulatedDiscovery
            )
        })

        return results.sort((left, right) => sortDatasetResults(left, right, sortOption))
    }, [datasets, filters, sortOption])

    const shortlistDatasets = shortlistIds
        .map(id => datasets.find(dataset => dataset.id === id))
        .filter((dataset): dataset is Dataset => Boolean(dataset))

    const trackedReviewDatasets: TrackedReviewDataset[] = shortlistDatasets.map(dataset => {
        const reviewState = getDiscoveryReviewState(dataset.id, true, reviewStateMap) ?? 'shortlisted'

        return {
            dataset,
            reviewState,
            reviewMeta: DISCOVERY_REVIEW_STATE_META[reviewState],
            reviewAction: buildDiscoveryReviewAction(getDatasetRouteId(dataset), reviewState)
        }
    })

    const compareDatasets = compareIds
        .map(id => datasets.find(dataset => dataset.id === id))
        .filter((dataset): dataset is Dataset => Boolean(dataset))

    const reviewCounts = buildDiscoveryReviewCounts(shortlistIds, reviewStateMap)
    const decisionAction = getDecisionAction(shortlistDatasets, compareDatasets, filteredDatasets, trackedReviewDatasets)
    const requestReadiness = getRequestReadiness(shortlistDatasets, compareDatasets, trackedReviewDatasets)
    const firstShortlistedDataset = shortlistDatasets[0] ?? null
    const compareLimitReached = compareIds.length >= MAX_COMPARE_ITEMS
    const activeFilters = buildActiveFilters(filters)
    const attestedCount = datasets.filter(dataset => dataset.verificationStatus === 'Attested').length
    const highConfidenceCount = datasets.filter(dataset => dataset.confidenceScore >= 92).length
    const domainCoverageCount = new Set(datasets.map(dataset => dataset.domain)).size
    const restrictedCount = datasets.filter(dataset => dataset.accessType === 'Restricted').length

    const updateFilter = <Key extends keyof FilterState>(key: Key, value: FilterState[Key]) => {
        setFilters(current => ({
            ...current,
            [key]: value
        }))
    }

    const clearFilter = (key: keyof FilterState) => {
        updateFilter(key, defaultFilters[key])
    }

    const resetFilters = () => {
        setFilters(defaultFilters)
        setSortOption('best-match')
    }

    const toggleShortlist = (datasetId: number) => {
        setShortlistIds(current =>
            current.includes(datasetId)
                ? current.filter(id => id !== datasetId)
                : [...current, datasetId]
        )
    }

    const toggleCompare = (datasetId: number) => {
        setCompareIds(current => {
            if (current.includes(datasetId)) {
                return current.filter(id => id !== datasetId)
            }

            if (current.length >= MAX_COMPARE_ITEMS) {
                return current
            }

            return [...current, datasetId]
        })
    }

    const setDatasetReviewState = (datasetId: number, reviewState: DiscoveryReviewState) => {
        setShortlistIds(current => (current.includes(datasetId) ? current : [...current, datasetId]))
        setReviewStateMap(current => ({
            ...current,
            [String(datasetId)]: reviewState
        }))
    }

    return (
        <div className={discoveryPageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={`${discoveryShellClass} space-y-6 xl:space-y-8`}>
                <section aria-labelledby="dataset-discovery-hero">
                    <div className={heroSurfaceClass}>
                        <div className="pointer-events-none absolute -left-10 bottom-0 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
                        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

                        <div className="relative grid gap-6 2xl:grid-cols-[minmax(0,1.68fr)_minmax(360px,0.96fr)] 2xl:items-start">
                            <div className="min-w-0">
                                <div className={discoveryText.heroEyebrow}>Curated evaluation workspace</div>
                                <h1 id="dataset-discovery-hero" className={`mt-2 ${discoveryText.heroTitle}`}>
                                    Curated Evaluation Opportunities
                                </h1>
                                <p className={`mt-4 max-w-3xl ${discoveryText.bodyStrong}`}>
                                    Review governed dataset opportunities, build a priority set, and compare trust and access signals before protected evaluation.
                                </p>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                                    Discovery stays review-first for sensitive and residency-bound datasets instead of open marketplace self-serve.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <HeroMetricChip label="Attested datasets" value={`${attestedCount}`} />
                                    <HeroMetricChip label="High confidence" value={`${highConfidenceCount}`} />
                                    <HeroMetricChip label="Domains covered" value={`${domainCoverageCount}`} />
                                    <HeroMetricChip label="Restricted access" value={`${restrictedCount}`} />
                                </div>

                                <div className={`mt-5 max-w-3xl rounded-[22px] border px-5 py-4 ${getSignalToneMeta(geoPolicyNoteTone).surfaceClassName}`}>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Geo access policy</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-200">
                                        {hasBuyerGeoProfile
                                            ? `Eligibility signals are tailored to ${buyerOrgCountry}. Provider residency and regional restrictions may narrow access even when dataset coverage is broader.`
                                            : 'Complete your organization country in participant onboarding to personalize geo eligibility signals. Until then, discovery shows policy-level geography guidance only.'}
                                    </p>
                                </div>

                                <div className="mt-4 max-w-3xl rounded-[22px] border border-amber-500/25 bg-amber-500/10 px-5 py-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">Launch posture</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-200">
                                        Early discovery is curated for selected buyers and providers, with guided review and controlled disclosure before protected evaluation is confirmed.
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <a href="#shortlist-panel" className={primaryButtonClass}>
                                        Review priority set
                                    </a>
                                    <a href="#compare-panel" className={secondaryButtonClass}>
                                        Open side-by-side review
                                    </a>
                                </div>
                            </div>

                            <div className={`${subCardSurfaceClass} px-5 py-5 sm:px-6 sm:py-6`}>
                                <div className={discoveryText.eyebrow}>Decision state</div>
                                <h2 className="mt-3 text-[1.3rem] font-semibold tracking-[-0.03em] text-slate-50">
                                    Turn governed sourcing into the next action
                                </h2>
                                <p className={`mt-3 ${discoveryText.body}`}>
                                    Track what sits in your priority set, which candidates are under committee review, and where governance or provider follow-up is blocking the next move.
                                </p>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <DecisionStat label="Priority set" value={`${shortlistDatasets.length}`} />
                                    <DecisionStat label="Committee review" value={`${reviewCounts.committeeReview}`} />
                                    <DecisionStat
                                        label="Needs follow-up"
                                        value={`${reviewCounts.needsGovernanceInput + reviewCounts.awaitingProviderClarification}`}
                                    />
                                </div>

                                <div className={`mt-5 rounded-[22px] border px-5 py-5 ${getSignalToneMeta(decisionAction.tone).surfaceClassName}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${getSignalToneMeta(decisionAction.tone).dotClassName}`} aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="text-base font-semibold text-slate-50">{decisionAction.label}</div>
                                            <p className={`mt-2 ${discoveryText.body}`}>{decisionAction.detail}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <ActionLinkButton
                                            label={decisionAction.label}
                                            to={decisionAction.to}
                                            href={decisionAction.href}
                                            className={primaryButtonClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={panelSurfaceClass} aria-labelledby="dataset-filter-panel">
                    <div className="px-6 py-5 sm:px-7 xl:px-8 xl:py-6">
                        <div className={discoveryText.eyebrow}>Search, filter, and sort</div>
                        <h2 id="dataset-filter-panel" className={`mt-3 ${discoveryText.panelTitle}`}>
                            Narrow the curated slate with buyer-relevant signals
                        </h2>
                        <p className={`mt-2 max-w-4xl ${discoveryText.body}`}>
                            Search opportunities, dial in trust and freshness thresholds, and use Market coverage plus posture filters to narrow the governed shortlist.
                        </p>

                        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.82fr)]">
                            <label className={controlSurfaceClass}>
                                <span className={discoveryText.eyebrow}>Search datasets</span>
                                <input
                                    id="dataset-search"
                                    type="text"
                                    value={filters.searchTerm}
                                    onChange={event => updateFilter('searchTerm', event.target.value)}
                                    placeholder="Search by title, use case, domain, or confidence summary"
                                    className={fieldClass}
                                />
                            </label>

                            <FilterSelect
                                label="Sort datasets"
                                value={sortOption}
                                onChange={value => setSortOption(value as SortOption)}
                                options={sortOptions.map(option => option.value)}
                                renderLabel={value => sortOptions.find(option => option.value === value)?.label ?? value}
                            />
                        </div>

                        <div className="mt-6">
                            <div className={discoveryText.eyebrow}>Priority domains</div>
                            <div className="mt-4 flex flex-wrap gap-2.5">
                                {domains.map(domain => (
                                    <button
                                        key={domain}
                                        type="button"
                                        aria-label={`Filter domain ${domain}`}
                                        aria-pressed={filters.domain === domain}
                                        onClick={() => updateFilter('domain', domain)}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${focusRingClass} ${
                                            filters.domain === domain
                                                ? 'border-cyan-400/35 bg-cyan-500/12 text-cyan-100'
                                                : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/25 hover:text-slate-100'
                                        }`}
                                    >
                                        {domain}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className={discoveryText.eyebrow}>Regulated discovery</div>
                            <p className={`mt-2 max-w-4xl ${discoveryText.body}`}>
                                Focus on provider-shielded, residency-aware opportunities that are better suited to governed evaluation.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2.5">
                                {regulatedDiscoveryFilters.map(filter => (
                                    <button
                                        key={filter}
                                        type="button"
                                        aria-label={`Filter regulated discovery by ${filter}`}
                                        aria-pressed={filters.regulatedDiscovery === filter}
                                        onClick={() => updateFilter('regulatedDiscovery', filter)}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${focusRingClass} ${
                                            filters.regulatedDiscovery === filter
                                                ? 'border-cyan-400/35 bg-cyan-500/12 text-cyan-100'
                                                : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/25 hover:text-slate-100'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                            <FilterSelect
                                label="Data type"
                                value={filters.dataType}
                                onChange={value => updateFilter('dataType', value)}
                                options={dataTypes}
                            />
                            <FilterSelect
                                label="Market coverage"
                                value={filters.geography}
                                onChange={value => updateFilter('geography', value)}
                                options={geographies}
                            />
                            <FilterSelect
                                label="Freshness"
                                value={filters.freshnessBucket}
                                onChange={value => updateFilter('freshnessBucket', value)}
                                options={freshnessBuckets}
                            />
                            <FilterSelect
                                label="Verification"
                                value={filters.verificationStatus}
                                onChange={value => updateFilter('verificationStatus', value as FilterState['verificationStatus'])}
                                options={verificationStates}
                            />
                            <FilterSelect
                                label="Minimum confidence"
                                value={String(filters.minConfidence)}
                                onChange={value => updateFilter('minConfidence', Number(value))}
                                options={minConfidenceOptions.map(option => String(option))}
                                renderLabel={value => (value === '0' ? 'Any' : `${value}+`)}
                            />
                        </div>

                        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex flex-wrap gap-2.5">
                                {activeFilters.length > 0 ? (
                                    activeFilters.map(filter => (
                                        <button
                                            key={filter.label}
                                            type="button"
                                            onClick={() => clearFilter(filter.key)}
                                            aria-label={`Clear filter ${filter.label}`}
                                            className={`rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:border-cyan-300 ${focusRingClass}`}
                                        >
                                            {filter.label} ×
                                        </button>
                                    ))
                                ) : (
                                    <span className={discoveryText.meta}>No active filters. Use the controls above to narrow the curated slate.</span>
                                )}
                            </div>

                            <button type="button" onClick={resetFilters} className={secondaryButtonClass}>
                                Reset filters
                            </button>
                        </div>
                    </div>
                </section>

                <section className={`${panelSurfaceClass} min-w-0`} aria-labelledby="matched-datasets">
                        <div className="px-6 py-5 sm:px-7 xl:px-8 xl:py-6">
                            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
                                <div className="min-w-0">
                                    <div className={discoveryText.eyebrow}>Eligible opportunities</div>
                                    <h2 id="matched-datasets" className={`mt-3 ${discoveryText.panelTitle}`}>
                                        Decision-ready results
                                    </h2>
                                    <p className={`mt-2 max-w-4xl ${discoveryText.body}`}>
                                        Front faces stay discovery-first, while Quick View flips each card into a richer trust and review snapshot.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1 text-left 2xl:items-end 2xl:text-right">
                                    <div className={discoveryText.metaStrong}>Showing {filteredDatasets.length} of {datasets.length} datasets</div>
                                    <div className={discoveryText.meta}>Sorted by {sortOptions.find(option => option.value === sortOption)?.label}</div>
                                </div>
                            </div>

                            {filteredDatasets.length > 0 ? (
                                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                                    {filteredDatasets.map(dataset => {
                                        const reviewState = getDiscoveryReviewState(
                                            dataset.id,
                                            shortlistIds.includes(dataset.id),
                                            reviewStateMap
                                        )

                                        return (
                                        <DatasetDecisionCard
                                            key={dataset.id}
                                            dataset={dataset}
                                            buyerOrgCountry={buyerOrgCountry}
                                            dossierPath={getDatasetDossierPath(dataset, demo)}
                                            detailPath={getDatasetDetailPath(dataset, demo)}
                                            prefersReducedMotion={prefersReducedMotion}
                                            shortlisted={shortlistIds.includes(dataset.id)}
                                            reviewState={reviewState}
                                            compared={compareIds.includes(dataset.id)}
                                            compareLimitReached={compareLimitReached}
                                            onToggleShortlist={() => toggleShortlist(dataset.id)}
                                            onToggleCompare={() => toggleCompare(dataset.id)}
                                        />
                                        )
                                    })}
                                </div>
                            ) : (
                                <EmptyResultsState onReset={resetFilters} />
                            )}
                        </div>
                </section>

                <section className="space-y-8" aria-labelledby="decision-workspace">
                    <div className="px-1">
                        <div className={discoveryText.eyebrow}>Decision workspace</div>
                        <h2 id="decision-workspace" className={`mt-3 ${discoveryText.panelTitle}`}>
                            Priority, review, and readiness
                        </h2>
                        <p className={`mt-3 max-w-4xl ${discoveryText.body}`}>
                            Keep your priority set, side-by-side comparison queue, and buyer guidance in one workspace below the results so the dataset cards have more room to breathe.
                        </p>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <RailSection
                            eyebrow="Priority set"
                            title="Review priority set"
                            description="Build a lightweight review set before you move into detail review, quote building, or protected-evaluation prep."
                            id="shortlist-panel"
                        >
                            {shortlistDatasets.length > 0 ? (
                                <div className="space-y-4">
                                    {trackedReviewDatasets.map(item => {
                                        const { dataset, reviewState, reviewMeta, reviewAction } = item
                                        const geoAccessSignal = getDatasetGeoAccessSignal(getDatasetRouteId(dataset), buyerOrgCountry)
                                        const trustRiskLabels = getDatasetTrustRiskLabels(dataset.trustProfile)
                                        const dossierPath = getDatasetDossierPath(dataset, demo)

                                        return (
                                            <div key={dataset.id} className={`${subCardSurfaceClass} px-5 py-5`}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <div className="text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-50">{dataset.title}</div>
                                                        <p className={`mt-2 ${discoveryText.body}`}>{dataset.bestFor}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleShortlist(dataset.id)}
                                                        aria-label={`Remove ${dataset.title} from shortlist`}
                                                        className={`rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-cyan-100 ${focusRingClass}`}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2.5">
                                                    <StatusChip label={reviewMeta.shortLabel} tone={reviewMeta.tone} />
                                                    <StatusChip label={`${dataset.confidenceScore}% confidence`} tone={dataset.confidenceScore >= 90 ? 'healthy' : 'monitoring'} />
                                                    <StatusChip label={dataset.accessType} tone={dataset.accessType === 'Restricted' ? 'monitoring' : 'healthy'} />
                                                    <StatusChip label={geoAccessSignal.label} tone={geoAccessSignal.tone} />
                                                </div>

                                                <p className="mt-3 text-xs leading-5 text-slate-400">{geoAccessSignal.detail}</p>

                                                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                                                    <div className={`${insetPanelClass} px-4 py-4`}>
                                                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                            Internal review state
                                                        </div>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            <StatusChip label={reviewMeta.label} tone={reviewMeta.tone} />
                                                        </div>
                                                        <p className="mt-3 text-sm leading-6 text-slate-300">{reviewMeta.summary}</p>
                                                    </div>

                                                    <label className={`${insetPanelClass} block px-4 py-4`}>
                                                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                            Set internal review state
                                                        </span>
                                                        <select
                                                            aria-label={`Set internal review state for ${dataset.title}`}
                                                            value={reviewState}
                                                            onChange={event =>
                                                                setDatasetReviewState(dataset.id, event.target.value as DiscoveryReviewState)
                                                            }
                                                            className="mt-3 w-full rounded-[14px] border border-white/10 bg-[#0d162a]/95 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400/40 focus:outline-none"
                                                        >
                                                            {DISCOVERY_REVIEW_STATE_OPTIONS.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Minimum trust layer</div>
                                                    <RiskLabelStrip items={trustRiskLabels} compact className="mt-3" />
                                                </div>

                                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                                    <CompactSignal label="Confidence" value={`${dataset.confidenceScore}%`} />
                                                    <CompactSignal label="Review signal" value={`${dataset.providerTrustScore}%`} />
                                                </div>

                                                <div className="mt-5 flex flex-wrap gap-3">
                                                    {dossierPath ? (
                                                        <Link to={dossierPath} className={primaryButtonClass}>
                                                            Request Evaluation
                                                        </Link>
                                                    ) : null}
                                                    <Link to={getDatasetDetailPath(dataset, demo)} className={secondaryButtonClass}>
                                                        Open detail
                                                    </Link>
                                                    <Link to={reviewAction.to} className={secondaryButtonClass}>
                                                        {reviewAction.label}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCompare(dataset.id)}
                                                        aria-label={compareIds.includes(dataset.id) ? `Remove ${dataset.title} from compare` : `Add ${dataset.title} to compare`}
                                                        disabled={compareLimitReached && !compareIds.includes(dataset.id)}
                                                        className={`inline-flex items-center justify-center rounded-[16px] border px-5 py-3 text-sm font-semibold transition-all duration-200 ${focusRingClass} ${
                                                            compareIds.includes(dataset.id)
                                                                ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300'
                                                                : 'border-white/10 bg-white/[0.04] text-slate-100 hover:border-cyan-400/30 hover:text-cyan-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500'
                                                        }`}
                                                    >
                                                        {compareIds.includes(dataset.id) ? 'In review' : 'Queue for review'}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <EmptyRailState
                                    title="No priority set yet"
                                    detail="Start with attested, high-confidence opportunities and use the priority set to keep the strongest options together."
                                    actionLabel="Open guided tour"
                                    actionTo="/guided-tour"
                                />
                            )}
                        </RailSection>

                        <RailSection
                            eyebrow="Request readiness"
                            title="Buyer guidance"
                            description="Use the priority set and side-by-side review state to decide whether to keep researching, inspect details, or move closer to guided request prep."
                        >
                            <div className={`rounded-[24px] border px-5 py-5 ${getSignalToneMeta(requestReadiness.tone).surfaceClassName}`}>
                                <div className="flex items-start gap-3">
                                    <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${getSignalToneMeta(requestReadiness.tone).dotClassName}`} aria-hidden="true" />
                                    <div className="min-w-0">
                                        <div className="text-base font-semibold text-slate-50">{requestReadiness.title}</div>
                                        <p className={`mt-2 ${discoveryText.body}`}>{requestReadiness.detail}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <CompactDecisionStat label="Priority set" value={`${shortlistDatasets.length}`} />
                                <CompactDecisionStat label="Needs governance" value={`${reviewCounts.needsGovernanceInput}`} />
                                <CompactDecisionStat label="Awaiting clarification" value={`${reviewCounts.awaitingProviderClarification}`} />
                            </div>

                            <div className="mt-5 flex flex-col gap-3">
                                <ActionLinkButton
                                    label={requestReadiness.primaryLabel}
                                    to={requestReadiness.primaryTo}
                                    href={requestReadiness.primaryHref}
                                    className={primaryButtonClass}
                                />
                                <ActionLinkButton
                                    label={requestReadiness.secondaryLabel}
                                    to={requestReadiness.secondaryTo}
                                    href={requestReadiness.secondaryHref}
                                    className={secondaryButtonClass}
                                />
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <Link to="/guided-tour" className={`${subCardSurfaceClass} block px-5 py-5 transition-all duration-200 hover:-translate-y-px hover:border-cyan-400/30`}>
                                    <div className="text-base font-semibold text-slate-50">Guided Tour</div>
                                    <p className={`mt-2 ${discoveryText.body}`}>
                                        Use the guided buyer workflow if you want Redoubt&apos;s team to help move from sourcing into evaluation prep.
                                    </p>
                                </Link>
                                <Link
                                    to={firstShortlistedDataset ? `/datasets/${firstShortlistedDataset.id}` : '/trust-profile'}
                                    className={`${subCardSurfaceClass} block px-5 py-5 transition-all duration-200 hover:-translate-y-px hover:border-cyan-400/30`}
                                >
                                    <div className="text-base font-semibold text-slate-50">
                                        {firstShortlistedDataset ? 'Top priority candidate' : 'Trust Profile'}
                                    </div>
                                    <p className={`mt-2 ${discoveryText.body}`}>
                                        {firstShortlistedDataset
                                            ? `Open ${firstShortlistedDataset.title} to inspect request rules, rights, and protected-evaluation workflow detail.`
                                            : 'If you are still unsure which datasets to trust, review the trust surface before requesting evaluation.'}
                                    </p>
                                </Link>
                            </div>
                        </RailSection>
                    </div>

                    <RailSection
                        eyebrow="Side-by-side review"
                        title="Review opportunities side by side"
                        description="Queue up to three opportunities to compare trust, freshness, coverage geography, geo policy, and access path without leaving governed discovery."
                        id="compare-panel"
                        action={
                            compareDatasets.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setCompareIds([])}
                                    className={`rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-cyan-100 ${focusRingClass}`}
                                >
                                    Clear review queue
                                </button>
                            ) : undefined
                        }
                    >
                        <div className={`${subCardSurfaceClass} px-5 py-5`}>
                            <div className="text-base font-semibold text-slate-50">Side-by-side review queue</div>
                            <p className={`mt-2 ${discoveryText.body}`}>
                                Add up to three opportunities. Once the queue is full, review buttons stay disabled until you remove one.
                            </p>
                        </div>

                        {compareDatasets.length > 0 ? (
                            <div className="mt-5 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className={discoveryText.metaStrong}>{compareDatasets.length} of {MAX_COMPARE_ITEMS} selected</span>
                                </div>

                                {compareDatasets.map(dataset => {
                                    const reviewState = getDiscoveryReviewState(
                                        dataset.id,
                                        shortlistIds.includes(dataset.id),
                                        reviewStateMap
                                    )
                                    const reviewMeta = reviewState ? DISCOVERY_REVIEW_STATE_META[reviewState] : null
                                    const reviewAction = reviewState ? buildDiscoveryReviewAction(getDatasetRouteId(dataset), reviewState) : null
                                    const dossierPath = getDatasetDossierPath(dataset, demo)

                                    return (
                                        <div key={dataset.id} className={`${subCardSurfaceClass} px-5 py-4`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="text-base font-semibold text-slate-50">{dataset.title}</div>
                                                    <div className={`mt-2 ${discoveryText.meta}`}>
                                                        {dataset.domain} · {bucketFreshness(dataset.freshness)} · {dataset.accessType}
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {reviewMeta ? (
                                                            <StatusChip label={reviewMeta.shortLabel} tone={reviewMeta.tone} />
                                                        ) : (
                                                            <StatusChip label="Not in priority set" tone="scheduled" />
                                                        )}
                                                    </div>
                                                    {reviewAction ? (
                                                        <Link
                                                            to={reviewAction.to}
                                                            className="mt-3 inline-flex text-sm font-semibold text-cyan-100 transition-colors hover:text-cyan-200"
                                                        >
                                                            {reviewAction.label}
                                                        </Link>
                                                    ) : null}
                                                    {dossierPath ? (
                                                        <Link
                                                            to={dossierPath}
                                                            className="mt-3 inline-flex text-sm font-semibold text-cyan-100 transition-colors hover:text-cyan-200"
                                                        >
                                                            Request Evaluation
                                                        </Link>
                                                    ) : null}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCompare(dataset.id)}
                                                    aria-label={`Remove ${dataset.title} from compare`}
                                                    className={`rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-cyan-100 ${focusRingClass}`}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}

                                {compareDatasets.length >= 2 ? (
                                    <CompareTable datasets={compareDatasets} buyerOrgCountry={buyerOrgCountry} reviewStateMap={reviewStateMap} shortlistIds={shortlistIds} />
                                ) : (
                                    <div className={`${subCardSurfaceClass} px-5 py-5`}>
                                        <div className="text-base font-semibold text-slate-50">Add one more opportunity to review</div>
                                        <p className={`mt-2 ${discoveryText.body}`}>Side-by-side review becomes useful once at least two governed opportunities are in the queue.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-5">
                                <EmptyRailState
                                    title="No opportunities in review"
                                    detail="Use side-by-side review when the priority set has more than one viable option and you need a fast trust and access readout."
                                />
                            </div>
                        )}
                    </RailSection>
                </section>
            </div>
        </div>
    )
}

function HeroMetricChip({ label, value }: { label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-slate-200 shadow-[0_14px_32px_-24px_rgba(2,6,23,0.92)] backdrop-blur-xl">
            <span className="uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className="text-base font-semibold text-slate-100">{value}</span>
        </span>
    )
}

function DecisionStat({ label, value }: { label: string; value: string }) {
    return (
        <div className={`${subCardSurfaceClass} min-w-0 px-4 py-4`}>
            <div className="max-w-full break-words text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </div>
            <div className="mt-3 text-[1.4rem] font-semibold tracking-[-0.04em] text-slate-50">{value}</div>
        </div>
    )
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
    renderLabel
}: {
    label: string
    value: string
    onChange: (value: string) => void
    options: string[]
    renderLabel?: (value: string) => string
}) {
    return (
        <label className={controlSurfaceClass}>
            <span className={discoveryText.eyebrow}>{label}</span>
            <select
                aria-label={label}
                value={value}
                onChange={event => onChange(event.target.value)}
                className={fieldClass}
            >
                {options.map(option => (
                    <option key={option} value={option}>
                        {renderLabel ? renderLabel(option) : option}
                    </option>
                ))}
            </select>
        </label>
    )
}

function DatasetDecisionCard({
    dataset,
    buyerOrgCountry,
    dossierPath,
    detailPath,
    prefersReducedMotion,
    shortlisted,
    reviewState,
    compared,
    compareLimitReached,
    onToggleShortlist,
    onToggleCompare
}: {
    dataset: Dataset
    buyerOrgCountry: string
    dossierPath: string | null
    detailPath: string
    prefersReducedMotion: boolean
    shortlisted: boolean
    reviewState: DiscoveryReviewState | null
    compared: boolean
    compareLimitReached: boolean
    onToggleShortlist: () => void
    onToggleCompare: () => void
}) {
    const [isFlipped, setIsFlipped] = useState(false)
    const compareDisabled = compareLimitReached && !compared
    const confidenceTone = dataset.confidenceScore >= 95 ? 'healthy' : dataset.confidenceScore >= 90 ? 'scheduled' : 'monitoring'
    const providerTone = dataset.providerTrustScore >= 95 ? 'healthy' : dataset.providerTrustScore >= 90 ? 'scheduled' : 'monitoring'
    const geoAccessSignal = getDatasetGeoAccessSignal(getDatasetRouteId(dataset), buyerOrgCountry)
    const regulatedProfile = getRegulatedDiscoveryProfile(dataset)
    const reviewMeta = reviewState ? DISCOVERY_REVIEW_STATE_META[reviewState] : null
    const frontBadges = [
        ...getDiscoveryFrontBadges(dataset, geoAccessSignal, regulatedProfile),
        ...(reviewMeta
            ? [{
                key: `review-state-${dataset.id}`,
                label: reviewMeta.shortLabel,
                kind: 'signal' as const,
                tone: reviewMeta.tone
            }]
            : [])
    ]
    const backBadges = getDiscoveryBackBadges(dataset, geoAccessSignal, regulatedProfile)
    const trustRiskLabels = getPriorityTrustRiskLabels(dataset.trustProfile)
    const frontTabIndex = isFlipped ? -1 : 0
    const backTabIndex = isFlipped ? 0 : -1
    const cardStageStyle = prefersReducedMotion
        ? undefined
        : {
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1)'
        } satisfies CSSProperties
    const frontFaceStyle = prefersReducedMotion
        ? ({
            opacity: isFlipped ? 0 : 1,
            transition: 'opacity 180ms ease-out'
        } satisfies CSSProperties)
        : ({
            backfaceVisibility: 'hidden'
        } satisfies CSSProperties)
    const backFaceStyle = prefersReducedMotion
        ? ({
            opacity: isFlipped ? 1 : 0,
            transition: 'opacity 180ms ease-out'
        } satisfies CSSProperties)
        : ({
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
        } satisfies CSSProperties)

    return (
        <article
            aria-label={`Dataset card for ${dataset.title}`}
            data-card-flipped={isFlipped ? 'true' : 'false'}
            className="relative h-[560px] min-w-0 sm:h-[532px] xl:h-[512px]"
            style={prefersReducedMotion ? undefined : { perspective: '1600px' }}
        >
            <div className="relative h-full w-full" style={cardStageStyle}>
                <div
                    data-card-face="front"
                    data-face-active={!isFlipped ? 'true' : 'false'}
                    aria-hidden={isFlipped}
                    className={`${cardSurfaceClass} ${isFlipped ? 'pointer-events-none select-none' : ''}`}
                    style={frontFaceStyle}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                {dataset.domain} · {dataset.dataType}
                            </div>
                            <h3 className="mt-3 text-[1.28rem] font-semibold leading-tight tracking-[-0.04em] text-slate-50" style={getLineClampStyle(2)}>
                                {dataset.title}
                            </h3>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <ActionIconButton
                                label={shortlisted ? `Remove ${dataset.title} from shortlist` : `Add ${dataset.title} to shortlist`}
                                active={shortlisted}
                                onClick={onToggleShortlist}
                                tabIndex={frontTabIndex}
                            >
                                <BookmarkIcon className="h-4 w-4" />
                            </ActionIconButton>
                            <ActionIconButton
                                label={compared ? `Remove ${dataset.title} from compare` : `Add ${dataset.title} to compare`}
                                active={compared}
                                disabled={compareDisabled}
                                onClick={onToggleCompare}
                                tabIndex={frontTabIndex}
                            >
                                <CompareIcon className="h-4 w-4" />
                            </ActionIconButton>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {frontBadges.map(badge => (
                            <DiscoveryBadge key={badge.key} badge={badge} />
                        ))}
                    </div>

                    <p className="mt-5 text-sm leading-6 text-slate-200" style={getLineClampStyle(2)}>
                        {dataset.bestFor}
                    </p>

                    {reviewMeta ? (
                        <p className="mt-3 text-xs leading-5 text-slate-400">
                            Internal review state: <span className="font-semibold text-slate-200">{reviewMeta.label}</span>
                        </p>
                    ) : null}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <CompactSignalCard
                            label="Confidence"
                            value={`${dataset.confidenceScore}%`}
                            detail={dataset.verificationStatus}
                            tone={confidenceTone}
                        />
                        <CompactSignalCard
                            label="Coverage"
                            value={dataset.coverage}
                            detail={dataset.geography}
                            tone={geoAccessSignal.tone === 'monitoring' ? 'monitoring' : 'scheduled'}
                        />
                    </div>

                    <div className={`${subCardSurfaceClass} mt-5 px-4 py-3.5`}>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>Updated {formatDatasetDate(dataset.lastUpdated)}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-600" aria-hidden="true" />
                            <span>{dataset.timeRange}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-600" aria-hidden="true" />
                            <span>{dataset.size}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-5">
                        <div className="flex flex-wrap gap-3">
                            {dossierPath ? (
                                <Link
                                    to={dossierPath}
                                    className={`${primaryButtonClass} min-w-[188px]`}
                                    aria-label={`Open evaluation dossier for ${dataset.title}`}
                                    tabIndex={frontTabIndex}
                                >
                                    Request Evaluation
                                </Link>
                            ) : null}
                            <Link
                                to={detailPath}
                                className={`${secondaryButtonClass} min-w-[122px]`}
                                aria-label={`View details for ${dataset.title}`}
                                tabIndex={frontTabIndex}
                            >
                                View details
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsFlipped(true)}
                                aria-label={`Quick View for ${dataset.title}`}
                                className={`${secondaryButtonClass} min-w-[122px]`}
                                tabIndex={frontTabIndex}
                            >
                                Quick View
                            </button>
                        </div>

                        {compareDisabled ? (
                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                Review queue is full. Remove one candidate from side-by-side review to add another.
                            </p>
                        ) : null}
                    </div>
                </div>

                <div
                    data-card-face="back"
                    data-face-active={isFlipped ? 'true' : 'false'}
                    aria-hidden={!isFlipped}
                    className={`${cardSurfaceClass} ${!isFlipped ? 'pointer-events-none select-none' : ''}`}
                    style={backFaceStyle}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Quick view</div>
                            <h3 className="mt-2 text-[1.15rem] font-semibold leading-tight tracking-[-0.04em] text-slate-50" style={getLineClampStyle(2)}>
                                {dataset.title}
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsFlipped(false)}
                            aria-label={`Back to summary for ${dataset.title}`}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-[#161b22] px-3 py-2 text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-cyan-400/30 hover:text-white ${focusRingClass}`}
                            tabIndex={backTabIndex}
                        >
                            Back
                        </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <BackfaceInfoCard
                            label="Provider review"
                            value={`${dataset.providerTrustScore}%`}
                            detail={`${dataset.contributorTrust} · ${dataset.contributionHistory}`}
                            tone={providerTone}
                        />
                        <BackfaceInfoCard
                            label="Market coverage"
                            value={dataset.geography}
                            detail={`${dataset.timeRange} · ${dataset.size}`}
                            tone="scheduled"
                        />
                    </div>

                    <div className="mt-4">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Trust & compliance</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {backBadges.map(badge => (
                                <StatusChip key={badge.label} label={badge.label} tone={badge.tone} />
                            ))}
                        </div>
                        <RiskLabelStrip items={trustRiskLabels} compact className="mt-3" />
                    </div>

                    <div className="mt-5 border-t border-white/8 pt-4">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Quality summary</div>
                        <p className="mt-2 text-sm leading-6 text-slate-200" style={getLineClampStyle(2)}>
                            {dataset.confidenceSummary}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-400" style={getLineClampStyle(2)}>
                            {geoAccessSignal.detail}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    )
}

function CompactSignalCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: SignalTone
}) {
    return (
        <div className={`rounded-[20px] border px-4 py-4 ${getSignalToneMeta(tone).surfaceClassName}`}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
            <div className="mt-3 text-[1.2rem] font-semibold tracking-[-0.04em] text-slate-50" style={getLineClampStyle(2)}>
                {value}
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-400" style={getLineClampStyle(2)}>
                {detail}
            </div>
        </div>
    )
}

function BackfaceInfoCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: SignalTone
}) {
    return (
        <div className={`rounded-[20px] border px-4 py-3.5 ${getSignalToneMeta(tone).surfaceClassName}`}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
            <div className="mt-2.5 text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-50" style={getLineClampStyle(2)}>
                {value}
            </div>
            <div className="mt-1.5 text-xs leading-5 text-slate-400" style={getLineClampStyle(1)}>
                {detail}
            </div>
        </div>
    )
}

function DiscoveryBadge({ badge }: { badge: DiscoveryCardBadge }) {
    if (badge.kind === 'status') {
        return <StatusBadge label={badge.label} kind={badge.statusKind} />
    }

    return <StatusChip label={badge.label} tone={badge.tone} />
}

function StatusChip({
    label,
    tone
}: {
    label: string
    tone: SignalTone
}) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold ${getSignalToneMeta(tone).badgeClassName}`}>
            <span className={`h-2 w-2 rounded-full ${getSignalToneMeta(tone).dotClassName}`} aria-hidden="true" />
            {label}
        </span>
    )
}

function CommandStripStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[#101723] px-4 py-4 xl:px-5">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{label}</div>
            <div className="mt-2 text-[1.15rem] font-semibold text-slate-50">{value}</div>
        </div>
    )
}

function DecisionChip({
    label,
    detail,
    to,
    href,
    tone
}: {
    label: string
    detail: string
    to?: string
    href?: string
    tone: SignalTone
}) {
    const toneMeta = getSignalToneMeta(tone)
    const className = `group flex h-full min-h-[96px] items-center justify-between gap-4 bg-[#101723] px-5 py-4 transition-all duration-200 hover:bg-[#131c29] ${focusRingClass}`
    const content = (
        <>
            <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Decision State</div>
                <div className="mt-2 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${toneMeta.dotClassName}`} aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-50">{label}</span>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
            </div>
            <ArrowTopRightIcon className="h-4 w-4 shrink-0 text-cyan-200 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </>
    )

    if (to) {
        return <Link to={to} className={className}>{content}</Link>
    }

    return <a href={href} className={className}>{content}</a>
}

function QuickJumpLink({ href, label }: { href: string; label: string }) {
    return (
        <a href={href} className={`inline-flex items-center rounded-full border border-white/10 bg-[#0d1117] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white ${focusRingClass}`}>
            {label}
        </a>
    )
}

function SidebarFilterGroup({
    title,
    open,
    onToggle,
    children
}: {
    title: string
    open: boolean
    onToggle: () => void
    children: ReactNode
}) {
    return (
        <section className="border-b border-white/6 pb-5">
            <button type="button" onClick={onToggle} aria-expanded={open} className={`flex w-full items-center justify-between text-left ${focusRingClass}`}>
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{title}</span>
                <ChevronIcon className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open ? <div className="mt-4">{children}</div> : null}
        </section>
    )
}

function FilterToggleButton({
    active,
    label,
    ariaLabel,
    onClick
}: {
    active: boolean
    label: string
    ariaLabel: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            aria-pressed={active}
            onClick={onClick}
            className={`${filterOptionBaseClass} ${
                active
                    ? 'border-cyan-400/35 bg-[#0f2a33] text-cyan-100'
                    : 'border-white/10 bg-[#0d1117] text-slate-300 hover:border-cyan-400/25 hover:text-white'
            }`}
        >
            <span>{label}</span>
            {active ? <CheckCircleIcon className="h-4 w-4 text-cyan-200" /> : null}
        </button>
    )
}

function RailSection({
    eyebrow,
    title,
    description,
    id,
    action,
    children
}: {
    eyebrow: string
    title: string
    description: string
    id?: string
    action?: ReactNode
    children: ReactNode
}) {
    return (
        <section className={panelSurfaceClass} aria-labelledby={id}>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
                <div className={discoveryText.eyebrow}>{eyebrow}</div>
                <div className="mt-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h3 id={id} className={discoveryText.railTitle}>{title}</h3>
                        <p className={`mt-3 ${discoveryText.body}`}>{description}</p>
                    </div>
                    {action}
                </div>
                <div className="mt-6">{children}</div>
            </div>
        </section>
    )
}

function DatasetCatalogRow({
    dataset,
    shortlisted,
    compared,
    expanded,
    compareLimitReached,
    onToggleShortlist,
    onToggleCompare,
    onToggleExpanded
}: {
    dataset: Dataset
    shortlisted: boolean
    compared: boolean
    expanded: boolean
    compareLimitReached: boolean
    onToggleShortlist: () => void
    onToggleCompare: () => void
    onToggleExpanded: () => void
}) {
    const compareDisabled = compareLimitReached && !compared

    return (
        <article aria-label={`Dataset card for ${dataset.title}`} className="group scroll-mt-[176px]">
            <div className={`${catalogRowGridClass} items-start px-5 py-4 xl:px-6 xl:py-5`}>
                <div className="flex justify-center pt-1">
                    <button
                        type="button"
                        aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${dataset.title}`}
                        aria-expanded={expanded}
                        onClick={onToggleExpanded}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-[#101723] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white ${focusRingClass}`}
                    >
                        <ChevronIcon className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className="min-w-0 pr-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <button type="button" onClick={onToggleExpanded} className={`text-left ${focusRingClass}`}>
                                <div className="text-[1rem] font-semibold tracking-[-0.02em] text-slate-50">{dataset.title}</div>
                            </button>
                            <div className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                                Updated {formatDatasetDate(dataset.lastUpdated)} · Range {dataset.timeRange} · {dataset.size}
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap justify-end gap-2">
                            <StatusBadge label={dataset.verificationStatus} kind="verification" />
                            <StatusBadge label={dataset.accessType} kind="access" />
                        </div>
                    </div>

                    <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">{dataset.description}</p>
                    <div className="mt-3 text-sm text-slate-200">{dataset.bestFor}</div>
                </div>

                <CatalogMetric value={dataset.domain} detail={dataset.dataType} />
                <CatalogMetric value={`${dataset.confidenceScore}%`} detail={dataset.coverage} highlight={dataset.confidenceScore} />
                <CatalogMetric value={`${dataset.providerTrustScore}%`} detail={dataset.contributionHistory} highlight={dataset.providerTrustScore} />
                <CatalogMetric value={`${dataset.completeness}%`} detail="Schema coverage" highlight={dataset.completeness} />
                <CatalogMetric value={`${dataset.freshness}%`} detail={bucketFreshness(dataset.freshness)} highlight={dataset.freshness} />
                <CatalogMetric value={`${dataset.consistency}%`} detail="Cross-source match" highlight={dataset.consistency} />
                <CatalogMetric value={dataset.accessType} detail={dataset.geography} />

                <div className="flex min-h-[96px] items-center justify-end">
                    <div className="flex items-center gap-2">
                        <ActionIconButton
                            label={shortlisted ? `Remove ${dataset.title} from shortlist` : `Add ${dataset.title} to shortlist`}
                            active={shortlisted}
                            onClick={onToggleShortlist}
                        >
                            <BookmarkIcon className="h-4 w-4" />
                        </ActionIconButton>
                        <ActionIconButton
                            label={compared ? `Remove ${dataset.title} from compare` : `Add ${dataset.title} to compare`}
                            active={compared}
                            disabled={compareDisabled}
                            onClick={onToggleCompare}
                        >
                            <CompareIcon className="h-4 w-4" />
                        </ActionIconButton>
                        <ActionIconButton label={`View details for ${dataset.title}`} to={`/datasets/${getDatasetRouteId(dataset)}`}>
                            <ArrowTopRightIcon className="h-4 w-4" />
                        </ActionIconButton>
                    </div>
                </div>
            </div>

            {expanded ? (
                <div className="border-t border-white/6 bg-[#0f1621]/95 px-5 py-5 xl:px-6">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,0.85fr)]">
                        <DetailPanel title="Dataset profile">
                            <DetailPair label="Description" value={dataset.description} />
                            <DetailPair label="Best for" value={dataset.bestFor} />
                            <DetailPair label="Coverage" value={dataset.coverage} />
                        </DetailPanel>

                        <DetailPanel title="Trust and provenance">
                            <DetailPair label="Confidence summary" value={dataset.confidenceSummary} />
                            <DetailPair label="Contributor review signal" value={dataset.contributorTrust} />
                            <DetailPair label="Contribution history" value={dataset.contributionHistory} />
                        </DetailPanel>

                        <DetailPanel title="Schema preview">
                            <div className="space-y-2">
                                {dataset.sampleSchema.slice(0, 4).map(field => (
                                    <div key={`${dataset.id}-${field.field}`} className="flex items-center justify-between gap-4 rounded-[12px] border border-white/6 bg-[#0b1119] px-3 py-2.5">
                                        <span className="min-w-0 truncate text-sm text-slate-200">{field.field}</span>
                                        <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-slate-500">{field.type}</span>
                                    </div>
                                ))}
                            </div>
                        </DetailPanel>
                    </div>
                </div>
            ) : null}
        </article>
    )
}

function CatalogMetric({
    value,
    detail,
    highlight
}: {
    value: string
    detail: string
    highlight?: number
}) {
    return (
        <div className="min-w-0 px-3 py-2">
            <div className={`text-sm font-semibold ${highlight === undefined ? 'text-slate-50' : getMetricValueTone(highlight)}`}>{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-500">{detail}</div>
        </div>
    )
}

function StatusBadge({
    label,
    kind
}: {
    label: string
    kind: 'verification' | 'access'
}) {
    const meta = getStatusBadgeMeta(label, kind)
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold ${meta.className}`}>
            <span className={`h-2 w-2 rounded-full ${meta.dotClassName}`} aria-hidden="true" />
            {label}
        </span>
    )
}

function ActionIconButton({
    label,
    to,
    active = false,
    disabled = false,
    tabIndex,
    onClick,
    children
}: {
    label: string
    to?: string
    active?: boolean
    disabled?: boolean
    tabIndex?: number
    onClick?: () => void
    children: ReactNode
}) {
    const className = `group relative inline-flex h-10 w-10 scroll-mt-[176px] items-center justify-center rounded-[12px] border transition-all duration-200 ${focusRingClass} ${
        active
            ? 'border-cyan-400/35 bg-[#0f2a33] text-cyan-100'
            : 'border-white/10 bg-[#161b22] text-slate-300 hover:border-cyan-400/30 hover:text-white'
    } ${disabled ? 'cursor-not-allowed border-slate-800 text-slate-600' : ''}`
    const tooltip = (
        <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-[10px] border border-white/10 bg-[#161b22] px-2 py-1 text-[11px] font-semibold text-slate-100 opacity-0 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.65)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
            {label}
        </span>
    )

    if (to) {
        return (
            <Link to={to} aria-label={label} className={className} tabIndex={tabIndex}>
                {tooltip}
                {children}
            </Link>
        )
    }

    return (
        <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className={className} tabIndex={tabIndex}>
            {tooltip}
            {children}
        </button>
    )
}

function DetailPanel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className={`${insetPanelClass} px-4 py-4`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</div>
            <div className="mt-4 space-y-4">{children}</div>
        </section>
    )
}

function DetailPair({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">{value}</div>
        </div>
    )
}

function CompactSignal({ label, value }: { label: string; value: string }) {
    return (
        <div className={`${subCardSurfaceClass} px-4 py-4`}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
            <div className="mt-3 text-base font-semibold text-slate-50">{value}</div>
        </div>
    )
}

function CompactDecisionStat({ label, value }: { label: string; value: string }) {
    return (
        <div className={`${subCardSurfaceClass} flex min-h-[108px] flex-col justify-between px-4 py-4`}>
            <div className="break-words text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
            <div className="mt-4 text-[1.75rem] font-semibold tracking-[-0.05em] text-slate-50">{value}</div>
        </div>
    )
}

function CompareTable({
    datasets,
    buyerOrgCountry,
    reviewStateMap,
    shortlistIds
}: {
    datasets: Dataset[]
    buyerOrgCountry: string
    reviewStateMap: DiscoveryReviewStateMap
    shortlistIds: number[]
}) {
    const attributes = [
        { label: 'Confidence', getValue: (dataset: Dataset) => `${dataset.confidenceScore}%` },
        { label: 'Provider review signal', getValue: (dataset: Dataset) => `${dataset.providerTrustScore}%` },
        { label: 'Freshness bucket', getValue: (dataset: Dataset) => bucketFreshness(dataset.freshness) },
        { label: 'Verification', getValue: (dataset: Dataset) => dataset.verificationStatus },
        { label: 'Access path', getValue: (dataset: Dataset) => dataset.accessType },
        { label: 'Coverage geography', getValue: (dataset: Dataset) => dataset.geography },
        { label: 'Geo policy', getValue: (dataset: Dataset) => getDatasetGeoAccessSignal(getDatasetRouteId(dataset), buyerOrgCountry).label },
        {
            label: 'Internal review',
            getValue: (dataset: Dataset) => {
                const reviewState = getDiscoveryReviewState(
                    dataset.id,
                    shortlistIds.includes(dataset.id),
                    reviewStateMap
                )

                return reviewState ? DISCOVERY_REVIEW_STATE_META[reviewState].shortLabel : 'Not in priority set'
            }
        }
    ] as const

    return (
        <div className="overflow-x-auto rounded-[18px] border border-white/10">
            <div
                className="grid min-w-[680px] gap-px bg-[#1c2333]"
                style={{ gridTemplateColumns: `180px repeat(${datasets.length}, minmax(180px, 1fr))` }}
            >
                <div className="bg-[#161b22] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Attribute</div>
                {datasets.map(dataset => (
                    <div key={dataset.id} className="bg-[#161b22] px-4 py-3 text-sm font-semibold text-slate-100">
                        {dataset.title}
                    </div>
                ))}

                {attributes.map(attribute => (
                    <CompareRow key={attribute.label} label={attribute.label} datasets={datasets} getValue={attribute.getValue} />
                ))}
            </div>
        </div>
    )
}

function CompareRow({
    label,
    datasets,
    getValue
}: {
    label: string
    datasets: Dataset[]
    getValue: (dataset: Dataset) => string
}) {
    return (
        <>
            <div className="bg-[#0d1117] px-4 py-3 text-xs font-semibold text-slate-400">{label}</div>
            {datasets.map(dataset => (
                <div key={`${label}-${dataset.id}`} className="bg-[#0d1117] px-4 py-3 text-sm text-slate-100">
                    {getValue(dataset)}
                </div>
            ))}
        </>
    )
}

function EmptyRailState({
    title,
    detail,
    actionLabel,
    actionTo
}: {
    title: string
    detail: string
    actionLabel?: string
    actionTo?: string
}) {
    return (
        <div className={`${subCardSurfaceClass} px-5 py-5`}>
            <div className="text-base font-semibold text-slate-50">{title}</div>
            <p className={`mt-2 ${discoveryText.body}`}>{detail}</p>
            {actionLabel && actionTo ? (
                <Link to={actionTo} className={`mt-5 inline-flex ${secondaryButtonClass}`}>
                    {actionLabel}
                </Link>
            ) : null}
        </div>
    )
}

function ActionLinkButton({
    label,
    to,
    href,
    className
}: {
    label: string
    to?: string
    href?: string
    className: string
}) {
    if (to) {
        return <Link to={to} className={className}>{label}</Link>
    }

    return <a href={href ?? '#'} className={className}>{label}</a>
}

function EmptyResultsState({ onReset }: { onReset: () => void }) {
    return (
        <div className="mt-8 rounded-[28px] border border-dashed border-white/10 bg-[#0d162a]/88 px-6 py-12 text-center">
            <div className="text-lg font-semibold text-slate-50">No datasets match these filters</div>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
                    Clear the current filters and try a broader buyer workflow. Metadata stays visible here, but access still requires governed approval in the next step.
            </p>
            <button type="button" onClick={onReset} className={`mt-6 ${primaryButtonClass}`}>
                Reset filters
            </button>
        </div>
    )
}

function bucketFreshness(score: number) {
    if (score >= 93) return 'Real-time / <1h'
    if (score >= 88) return 'Daily'
    return 'Weekly'
}

function sortDatasetResults(left: Dataset, right: Dataset, sortOption: SortOption) {
    if (sortOption === 'highest-confidence') {
        return right.confidenceScore - left.confidenceScore
    }

    if (sortOption === 'highest-provider-trust') {
        return right.providerTrustScore - left.providerTrustScore
    }

    if (sortOption === 'most-recent') {
        return new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime()
    }

    return getBestMatchScore(right) - getBestMatchScore(left)
}

function getBestMatchScore(dataset: Dataset) {
    const verificationWeight = dataset.verificationStatus === 'Attested' ? 7 : 0
    const accessWeight = dataset.accessType === 'Approved access required' ? 4 : 1
    const freshnessWeight = dataset.freshness >= 93 ? 5 : dataset.freshness >= 88 ? 3 : 1

    return dataset.confidenceScore * 0.55 + dataset.providerTrustScore * 0.3 + verificationWeight + accessWeight + freshnessWeight
}

function parseStoredIdList(storageKey: string) {
    if (typeof window === 'undefined') return []
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return []

    try {
        const parsed = JSON.parse(stored)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((value): value is number => typeof value === 'number')
    } catch {
        return []
    }
}

function buildActiveFilters(filters: FilterState): ActiveFilterChip[] {
    const chips: ActiveFilterChip[] = []

    if (filters.searchTerm.trim()) chips.push({ key: 'searchTerm', label: `Search: ${filters.searchTerm}` })
    if (filters.domain !== 'All') chips.push({ key: 'domain', label: `Domain: ${filters.domain}` })
    if (filters.dataType !== 'All') chips.push({ key: 'dataType', label: `Type: ${filters.dataType}` })
    if (filters.geography !== 'All') chips.push({ key: 'geography', label: `Market coverage: ${filters.geography}` })
    if (filters.verificationStatus !== 'All') chips.push({ key: 'verificationStatus', label: `Verification: ${filters.verificationStatus}` })
    if (filters.freshnessBucket !== 'All') chips.push({ key: 'freshnessBucket', label: `Freshness: ${filters.freshnessBucket}` })
    if (filters.minConfidence > 0) chips.push({ key: 'minConfidence', label: `Confidence: ${filters.minConfidence}+` })
    if (filters.regulatedDiscovery !== 'All') chips.push({ key: 'regulatedDiscovery', label: `Regulated: ${filters.regulatedDiscovery}` })

    return chips
}

function getDiscoveryFrontBadges(
    dataset: Dataset,
    geoAccessSignal: ReturnType<typeof getDatasetGeoAccessSignal>,
    regulatedProfile: RegulatedDiscoveryProfile
): DiscoveryCardBadge[] {
    const prioritizedRegulatedBadge = regulatedProfile.cardBadges.find(
        badge =>
            badge.label === 'UAE local-only' ||
            badge.label === 'Cross-border review' ||
            badge.label === 'Provider-shielded' ||
            badge.label === 'Regulated-use ready'
    )
    const prioritizedPostureBadge =
        dataset.accessType === 'Restricted'
            ? {
                key: `access-${dataset.accessType}`,
                label: dataset.accessType,
                kind: 'status',
                statusKind: 'access'
            } satisfies DiscoveryCardBadge
            : prioritizedRegulatedBadge
                ? {
                    key: `regulated-${prioritizedRegulatedBadge.label}`,
                    label: prioritizedRegulatedBadge.label,
                    kind: 'signal',
                    tone: prioritizedRegulatedBadge.tone
                } satisfies DiscoveryCardBadge
                : {
                    key: `access-${dataset.accessType}`,
                    label: dataset.accessType,
                    kind: 'status',
                    statusKind: 'access'
                } satisfies DiscoveryCardBadge

    return [
        {
            key: `verification-${dataset.verificationStatus}`,
            label: dataset.verificationStatus,
            kind: 'status',
            statusKind: 'verification'
        },
        {
            key: `geo-${geoAccessSignal.label}`,
            label: geoAccessSignal.label,
            kind: 'signal',
            tone: geoAccessSignal.tone
        },
        prioritizedPostureBadge
    ]
}

function getDiscoveryBackBadges(
    dataset: Dataset,
    geoAccessSignal: ReturnType<typeof getDatasetGeoAccessSignal>,
    regulatedProfile: RegulatedDiscoveryProfile
) {
    const prioritizedRegulatedBadge =
        regulatedProfile.cardBadges.find(badge => badge.label === 'UAE local-only') ??
        regulatedProfile.cardBadges.find(badge => badge.label === 'Cross-border review') ??
        regulatedProfile.cardBadges.find(badge => badge.label === 'Provider-shielded') ??
        regulatedProfile.cardBadges.find(badge => badge.label === 'Regulated-use ready') ??
        null

    return [
        { label: getBackfaceAccessLabel(dataset.accessType), tone: getAccessTypeTone(dataset.accessType) },
        { label: getBackfaceGeoLabel(geoAccessSignal.label), tone: geoAccessSignal.tone },
        ...(prioritizedRegulatedBadge ? [{ label: getBackfaceRegulatedLabel(prioritizedRegulatedBadge.label), tone: prioritizedRegulatedBadge.tone }] : [])
    ]
}

function getPriorityTrustRiskLabels(profile: Dataset['trustProfile']) {
    const labels = getDatasetTrustRiskLabels(profile)
    const priorityKeys: Array<(typeof labels)[number]['key']> = ['sensitivity', 'legal_basis', 'rights', 'audit']

    return priorityKeys
        .map(key => labels.find(label => label.key === key))
        .filter((label): label is (typeof labels)[number] => Boolean(label))
}

function getAccessTypeTone(accessType: AccessType): SignalTone {
    return accessType === 'Restricted' ? 'monitoring' : 'healthy'
}

function getBackfaceAccessLabel(accessType: AccessType) {
    return accessType === 'Restricted' ? 'Restricted' : 'Approved'
}

function getBackfaceGeoLabel(label: ReturnType<typeof getDatasetGeoAccessSignal>['label']) {
    switch (label) {
        case 'Geo check requires org profile':
            return 'Geo profile'
        case 'Eligible from your org location':
            return 'Geo eligible'
        case 'Region-restricted':
            return 'Region review'
        case 'Residency constrained':
            return 'Residency'
        default:
            return label
    }
}

function getBackfaceRegulatedLabel(label: string) {
    switch (label) {
        case 'Cross-border review':
            return 'Cross-border'
        case 'Regulated-use ready':
            return 'Ready'
        case 'Provider-shielded':
            return 'Shielded'
        default:
            return label
    }
}

function getLineClampStyle(lines: number): CSSProperties {
    return {
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    }
}

function getRegulatedDiscoveryProfile(dataset: Dataset): RegulatedDiscoveryProfile {
    return (
        REGULATED_DISCOVERY_PROFILES[dataset.id] ?? {
            uaeLocalOnly: false,
            regulatedUseReady: false,
            crossBorderReviewRequired: false,
            providerShielded: false,
            cardBadges: []
        }
    )
}

function getDecisionAction(
    shortlistDatasets: Dataset[],
    compareDatasets: Dataset[],
    filteredDatasets: Dataset[],
    trackedReviewDatasets: TrackedReviewDataset[]
): DecisionAction {
    const clarificationCandidate = trackedReviewDatasets.find(item => item.reviewState === 'awaiting_provider_clarification')
    if (clarificationCandidate) {
        return {
            label: 'Open clarification history',
            detail: `${clarificationCandidate.dataset.title} is waiting on a provider-side answer before buyer review can continue.`,
            to: clarificationCandidate.reviewAction.to,
            tone: 'monitoring'
        }
    }

    const governanceCandidate = trackedReviewDatasets.find(item => item.reviewState === 'needs_governance_input')
    if (governanceCandidate) {
        return {
            label: 'Open governance-ready dossier',
            detail: `${governanceCandidate.dataset.title} needs privacy, legal, or governance review before it should move into a broader evaluation lane.`,
            to: governanceCandidate.reviewAction.to,
            tone: 'monitoring'
        }
    }

    if (trackedReviewDatasets.some(item => item.reviewState === 'committee_review')) {
        return {
            label: 'Review committee slate',
            detail: 'One or more tracked opportunities are under committee review. Use the priority set or side-by-side panel to keep internal ranking visible.',
            href: compareDatasets.length >= 2 ? '#compare-panel' : '#shortlist-panel',
            tone: 'scheduled'
        }
    }

    if (compareDatasets.length >= 2) {
        return {
            label: 'Review queued opportunities',
            detail: 'You have enough opportunities in side-by-side review to inspect trust, freshness, and access path together.',
            href: '#compare-panel',
            tone: 'healthy'
        }
    }

    if (
        trackedReviewDatasets.length > 0 &&
        trackedReviewDatasets.every(item => item.reviewState === 'rejected_for_now')
    ) {
        return {
            label: 'Reassess held opportunities',
            detail: 'Every tracked opportunity is on hold for now. Reopen the shortlist if you want to revisit one or clear the held set.',
            href: '#shortlist-panel',
            tone: 'monitoring'
        }
    }

    if (shortlistDatasets.length > 0) {
        return {
            label: 'Open top priority candidate',
            detail: `Start with ${shortlistDatasets[0].title} and inspect the governed access detail before preparing an evaluation request.`,
            to: `/datasets/${shortlistDatasets[0].id}`,
            tone: 'healthy'
        }
    }

    if (filteredDatasets.length > 0) {
        return {
            label: 'Build a priority set',
            detail: 'Add one or two strong opportunities to the priority set first so the decision surface becomes more useful.',
            href: '#matched-datasets',
            tone: 'scheduled'
        }
    }

    return {
        label: 'Reset filters',
        detail: 'The current filter set is too narrow. Reset it and rebuild a candidate pool before comparing.',
        href: '#dataset-filter-panel',
        tone: 'monitoring'
    }
}

function getRequestReadiness(
    shortlistDatasets: Dataset[],
    compareDatasets: Dataset[],
    trackedReviewDatasets: TrackedReviewDataset[]
): RequestReadiness {
    if (shortlistDatasets.length === 0) {
        return {
            tone: 'scheduled',
            title: 'Build a priority set first',
            detail: 'Add at least one viable opportunity to the priority set before moving into detail review or buyer workflow guidance.',
            primaryLabel: 'Open guided tour',
            primaryTo: '/guided-tour',
            secondaryLabel: 'Review discovery results',
            secondaryHref: '#matched-datasets'
        }
    }

    const clarificationCandidate = trackedReviewDatasets.find(item => item.reviewState === 'awaiting_provider_clarification')
    if (clarificationCandidate) {
        return {
            tone: 'monitoring',
            title: 'Awaiting provider clarification',
            detail: `${clarificationCandidate.dataset.title} is blocked on a provider answer or scope clarification. Keep the negotiation thread visible before progressing.`,
            primaryLabel: clarificationCandidate.reviewAction.label,
            primaryTo: clarificationCandidate.reviewAction.to,
            secondaryLabel: 'Review priority set',
            secondaryHref: '#shortlist-panel'
        }
    }

    const governanceCandidate = trackedReviewDatasets.find(item => item.reviewState === 'needs_governance_input')
    if (governanceCandidate) {
        return {
            tone: 'monitoring',
            title: 'Governance review is the next gate',
            detail: `${governanceCandidate.dataset.title} already looks promising, but it still needs governance input before the buyer should treat it as evaluation-ready.`,
            primaryLabel: governanceCandidate.reviewAction.label,
            primaryTo: governanceCandidate.reviewAction.to,
            secondaryLabel: 'Review priority set',
            secondaryHref: '#shortlist-panel'
        }
    }

    if (trackedReviewDatasets.some(item => item.reviewState === 'committee_review')) {
        return {
            tone: 'scheduled',
            title: 'Committee review in progress',
            detail: 'Your tracked opportunities are being ranked internally. Keep the committee slate visible and route the strongest candidate into the deal flow when consensus forms.',
            primaryLabel: compareDatasets.length >= 2 ? 'Review side-by-side panel' : 'Review priority set',
            primaryHref: compareDatasets.length >= 2 ? '#compare-panel' : '#shortlist-panel',
            secondaryLabel: `Open ${shortlistDatasets[0].title}`,
            secondaryTo: `/datasets/${shortlistDatasets[0].id}`
        }
    }

    if (
        trackedReviewDatasets.length > 0 &&
        trackedReviewDatasets.every(item => item.reviewState === 'rejected_for_now')
    ) {
        return {
            tone: 'monitoring',
            title: 'Tracked opportunities are on hold',
            detail: 'Everything in the current priority set is rejected for now. Keep the hold state visible or reopen one candidate if the buyer team wants to revisit it.',
            primaryLabel: 'Review priority set',
            primaryHref: '#shortlist-panel',
            secondaryLabel: 'Review discovery results',
            secondaryHref: '#matched-datasets'
        }
    }

    if (shortlistDatasets.some(dataset => dataset.verificationStatus === 'Under Review' || dataset.confidenceScore < 90)) {
        return {
            tone: 'monitoring',
            title: 'Inspect details before requesting evaluation',
            detail: 'One or more priority-set opportunities still need a closer trust or verification review before they look evaluation-ready.',
            primaryLabel: `Open ${shortlistDatasets[0].title}`,
            primaryTo: `/datasets/${shortlistDatasets[0].id}`,
            secondaryLabel: 'Review queued opportunities',
            secondaryHref: '#compare-panel'
        }
    }

    if (compareDatasets.length >= 2) {
        return {
            tone: 'healthy',
            title: 'Ready for side-by-side review',
            detail: 'Your priority set has multiple strong opportunities. Review them now, then open the strongest detail page for evaluation preparation.',
            primaryLabel: 'Review side-by-side panel',
            primaryHref: '#compare-panel',
            secondaryLabel: 'Open access requests',
            secondaryTo: '/access-requests'
        }
    }

    return {
        tone: 'healthy',
        title: 'Ready for detail review',
        detail: 'The priority set looks strong enough to move into dataset detail, rights, and governed access review.',
        primaryLabel: `Open ${shortlistDatasets[0].title}`,
        primaryTo: `/datasets/${shortlistDatasets[0].id}`,
        secondaryLabel: 'Open trust profile',
        secondaryTo: '/trust-profile'
    }
}

function formatDatasetDate(value: string) {
    const timestamp = new Date(value).getTime()
    if (Number.isNaN(timestamp)) return value

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(timestamp))
}

function getMetricValueTone(score: number) {
    if (score >= 95) return 'text-cyan-100'
    if (score >= 90) return 'text-slate-100'
    return 'text-slate-300'
}

function getStatusBadgeMeta(label: string, kind: 'verification' | 'access') {
    if (kind === 'verification') {
        if (label === 'Attested') {
            return {
                className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
                dotClassName: 'bg-emerald-300'
            }
        }

        return {
            className: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
            dotClassName: 'bg-amber-300'
        }
    }

    if (label === 'Restricted') {
        return {
            className: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
            dotClassName: 'bg-amber-300'
        }
    }

    return {
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
        dotClassName: 'bg-emerald-300'
    }
}

function getSignalToneMeta(tone: SignalTone) {
    switch (tone) {
        case 'monitoring':
            return {
                badgeClassName: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
                dotClassName: 'bg-amber-300',
                surfaceClassName: 'border-amber-500/20 bg-amber-500/8 text-amber-50'
            }
        case 'scheduled':
            return {
                badgeClassName: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
                dotClassName: 'bg-cyan-300',
                surfaceClassName: 'border-cyan-500/20 bg-cyan-500/8 text-cyan-50'
            }
        default:
            return {
                badgeClassName: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
                dotClassName: 'bg-emerald-300',
                surfaceClassName: 'border-emerald-500/20 bg-emerald-500/8 text-emerald-50'
            }
    }
}

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)

        handleChange()

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }

        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
    }, [])

    return prefersReducedMotion
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M12.5 12.5 17 17" strokeLinecap="round" />
        </svg>
    )
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function BookmarkIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M6 3.5h8a1 1 0 0 1 1 1V17l-5-3-5 3V4.5a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function CompareIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M4 5h12M4 10h12M4 15h12" strokeLinecap="round" />
            <circle cx="7" cy="5" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="9.5" cy="15" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    )
}

function ArrowTopRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M7 13 13 7" strokeLinecap="round" />
            <path d="M8 7h5v5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M10 2.5c2 1.5 4.4 2.2 6 2.4V9c0 4-2.4 6.6-6 8-3.6-1.4-6-4-6-8V4.9c1.6-.2 4-.9 6-2.4Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m7.6 9.9 1.7 1.7 3.4-3.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <circle cx="10" cy="10" r="7" />
            <path d="m7 10 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <rect x="4.5" y="9" width="11" height="7" rx="2" />
            <path d="M7 9V7.2a3 3 0 1 1 6 0V9" strokeLinecap="round" />
        </svg>
    )
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <circle cx="10" cy="10" r="7" />
            <path d="M10 6.5v4l2.6 1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
