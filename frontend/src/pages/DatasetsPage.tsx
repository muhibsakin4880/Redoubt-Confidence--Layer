import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DatasetCardSkeleton } from '../components/LoadingSkeleton'
import { DATASET_DISCOVERY_SUMMARIES } from '../data/datasetCatalogData'
import {
    dashboardColorTokens,
    dashboardComponentTokens
} from '../dashboardTokens'

type VerificationStatus = 'Verified' | 'Under Review'
type AccessType = 'Restricted' | 'Approved access required'
type SortOption = 'best-match' | 'highest-confidence' | 'highest-provider-trust' | 'most-recent'
type SignalTone = 'healthy' | 'monitoring' | 'scheduled'

type Dataset = {
    id: number
    title: string
    timeRange: string
    description: string
    bestFor: string
    domain: string
    dataType: string
    geography: string
    confidenceScore: number
    providerTrustScore: number
    verificationStatus: VerificationStatus
    lastUpdated: string
    size: string
    coverage: string
    completeness: number
    freshness: number
    consistency: number
    accessType: AccessType
    sampleSchema: { field: string; type: string }[]
    confidenceSummary: string
    contributorTrust: string
    contributionHistory: string
}

type FilterState = {
    searchTerm: string
    domain: string
    dataType: string
    geography: string
    verificationStatus: 'All' | VerificationStatus
    freshnessBucket: string
    minConfidence: number
}

type HeroMetric = {
    label: string
    value: string
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
}

const STORAGE_DATASET_SHORTLIST = 'Redoubt:datasets:shortlist'
const STORAGE_DATASET_COMPARE = 'Redoubt:datasets:compare'

const DATASETS: Dataset[] = DATASET_DISCOVERY_SUMMARIES

const defaultFilters: FilterState = {
    searchTerm: '',
    domain: 'All',
    dataType: 'All',
    geography: 'All',
    verificationStatus: 'All',
    freshnessBucket: 'All',
    minConfidence: 0
}

const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'best-match', label: 'Best match' },
    { value: 'highest-confidence', label: 'Highest confidence' },
    { value: 'highest-provider-trust', label: 'Highest provider trust' },
    { value: 'most-recent', label: 'Most recent' }
]

const domains = ['All', ...new Set(DATASETS.map(dataset => dataset.domain))]
const dataTypes = ['All', ...new Set(DATASETS.map(dataset => dataset.dataType))]
const geographies = ['All', ...new Set(DATASETS.map(dataset => dataset.geography))]
const verificationStates: FilterState['verificationStatus'][] = ['All', 'Verified', 'Under Review']
const freshnessBuckets = ['All', 'Real-time / <1h', 'Daily', 'Weekly']

const discoveryPageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const discoveryPageShellClass = 'relative mx-auto max-w-[2080px] px-5 py-8 sm:px-7 sm:py-10 lg:px-10 lg:py-12 xl:px-12 2xl:px-16'
const discoverySectionClass = 'mb-10 sm:mb-14 xl:mb-16 2xl:mb-20'
const discoveryPanelClass =
    "relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,27,47,0.9),rgba(10,17,31,0.82))] p-6 sm:p-7 xl:p-8 shadow-[0_28px_90px_-42px_rgba(2,6,23,0.98),0_18px_40px_-26px_rgba(15,23,42,0.72)] ring-1 ring-inset ring-white/6 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-28 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.055),transparent)] before:content-['']"
const discoveryCardClass =
    "relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,27,45,0.88),rgba(10,17,31,0.8))] px-6 py-6 sm:px-7 sm:py-7 xl:px-8 xl:py-8 shadow-[0_26px_84px_-40px_rgba(2,6,23,0.98),0_16px_36px_-22px_rgba(8,145,178,0.16)] ring-1 ring-inset ring-white/6 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-20 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] before:content-['']"
const discoveryHeroClass =
    'relative overflow-hidden rounded-[36px] border border-cyan-400/18 bg-[linear-gradient(135deg,rgba(7,13,24,0.98),rgba(17,27,47,0.94)_44%,rgba(13,21,38,0.98))] px-6 py-7 sm:px-8 sm:py-8 xl:px-10 xl:py-10 shadow-[0_38px_120px_-54px_rgba(34,211,238,0.28),0_26px_70px_-42px_rgba(2,6,23,0.98)] ring-1 ring-inset ring-white/6'
const discoveryActionButtonClass =
    'inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold tracking-[-0.01em] text-[#04101d] shadow-[0_22px_48px_-28px_rgba(34,211,238,0.82)] transition-all duration-200 hover:-translate-y-px hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
const discoverySecondaryButtonClass =
    'inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)] transition-all duration-200 hover:-translate-y-px hover:border-cyan-400/30 hover:bg-cyan-400/8 hover:text-cyan-100'
const discoveryFieldClass =
    'mt-3 w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_38px_-32px_rgba(2,6,23,0.9)] backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/15'
const discoveryText = {
    eyebrow: 'text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500/90',
    heroEyebrow: 'text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200/75',
    heroTitle: 'text-[2.55rem] font-semibold tracking-[-0.055em] text-slate-50 sm:text-[3rem] xl:text-[3.55rem] xl:leading-[1.02]',
    sectionTitle: 'text-[1.6rem] font-semibold tracking-[-0.04em] text-slate-50',
    panelTitle: 'text-[1.22rem] font-semibold tracking-[-0.03em] text-slate-50',
    itemTitle: 'text-[1.12rem] font-semibold tracking-[-0.025em] text-slate-50',
    body: 'text-[15px] leading-7 text-slate-400',
    bodyStrong: 'text-[15px] leading-7 text-slate-200',
    meta: 'text-[13px] leading-6 text-slate-500',
    metaStrong: 'text-[13px] font-medium leading-6 text-slate-300',
    value: 'text-[2.25rem] font-semibold tracking-[-0.065em] text-slate-50'
} as const

const matchedDatasetCardGridStyle = {
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 38rem), 1fr))'
} as const

const metricPillGridStyle = {
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11rem), 1fr))'
} as const

export default function DatasetsPage() {
    const [filters, setFilters] = useState<FilterState>(defaultFilters)
    const [sortOption, setSortOption] = useState<SortOption>('best-match')
    const [shortlistIds, setShortlistIds] = useState<number[]>(() => parseStoredIdList(STORAGE_DATASET_SHORTLIST))
    const [compareIds, setCompareIds] = useState<number[]>(() => parseStoredIdList(STORAGE_DATASET_COMPARE))
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setIsLoading(false)
        }, 1200)

        return () => window.clearTimeout(timer)
    }, [])

    useEffect(() => {
        localStorage.setItem(STORAGE_DATASET_SHORTLIST, JSON.stringify(shortlistIds))
    }, [shortlistIds])

    useEffect(() => {
        localStorage.setItem(STORAGE_DATASET_COMPARE, JSON.stringify(compareIds))
    }, [compareIds])

    const filteredDatasets = useMemo(() => {
        const searchTerm = filters.searchTerm.trim().toLowerCase()

        const datasets = DATASETS.filter(dataset => {
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

            return (
                matchesSearch &&
                matchesDomain &&
                matchesType &&
                matchesGeography &&
                matchesVerification &&
                matchesFreshness &&
                matchesConfidence
            )
        })

        return datasets.sort((left, right) => sortDatasetResults(left, right, sortOption))
    }, [filters, sortOption])

    const shortlistDatasets = shortlistIds
        .map(id => DATASETS.find(dataset => dataset.id === id))
        .filter((dataset): dataset is Dataset => Boolean(dataset))

    const compareDatasets = compareIds
        .map(id => DATASETS.find(dataset => dataset.id === id))
        .filter((dataset): dataset is Dataset => Boolean(dataset))

    const verifiedCount = DATASETS.filter(dataset => dataset.verificationStatus === 'Verified').length
    const highConfidenceCount = DATASETS.filter(dataset => dataset.confidenceScore >= 92).length
    const domainCoverageCount = new Set(DATASETS.map(dataset => dataset.domain)).size
    const restrictedCount = DATASETS.filter(dataset => dataset.accessType === 'Restricted').length
    const activeFilters = buildActiveFilters(filters)
    const decisionAction = getDecisionAction(shortlistDatasets, compareDatasets, filteredDatasets)
    const requestReadiness = getRequestReadiness(shortlistDatasets, compareDatasets)
    const firstShortlistedDataset = shortlistDatasets[0] ?? null
    const compareLimitReached = compareIds.length >= 3

    const heroMetrics: HeroMetric[] = [
        { label: 'Verified datasets', value: `${verifiedCount}` },
        { label: 'High confidence', value: `${highConfidenceCount}` },
        { label: 'Domains covered', value: `${domainCoverageCount}` },
        { label: 'Restricted access', value: `${restrictedCount}` }
    ]

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

            if (current.length >= 3) {
                return current
            }

            return [...current, datasetId]
        })
    }

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

    return (
        <div className={discoveryPageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={discoveryPageShellClass}>
                <section className={discoverySectionClass} aria-labelledby="dataset-discovery-hero">
                    <div className={discoveryHeroClass}>
                        <div className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full bg-teal-400/12 blur-3xl" />
                        <div className="pointer-events-none absolute right-4 top-2 h-56 w-56 rounded-full bg-cyan-300/12 blur-3xl" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_64%)]" />

                        <div className="relative grid items-start gap-8 xl:grid-cols-[minmax(0,1.38fr)_minmax(420px,0.94fr)] 2xl:grid-cols-[minmax(0,1.44fr)_minmax(460px,0.96fr)]">
                            <div>
                                <div className={discoveryText.heroEyebrow}>Buyer discovery workspace</div>
                                <h1 id="dataset-discovery-hero" className={`mt-2 ${discoveryText.heroTitle}`}>
                                    Dataset Discovery
                                </h1>
                                <p className={`mt-3 max-w-3xl ${discoveryText.bodyStrong}`}>
                                    Move from browsing into buyer-ready decision making. Shortlist governed datasets, compare trust and access signals, and figure out whether
                                    you should keep researching or move toward request preparation.
                                </p>

                                <div className="mt-7 flex flex-wrap gap-4">
                                    {heroMetrics.map(metric => (
                                        <HeroMetricChip key={metric.label} label={metric.label} value={metric.value} />
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3.5">
                                    <a href="#shortlist-panel" className={discoveryActionButtonClass}>
                                        Review shortlist
                                    </a>
                                    <a href="#compare-panel" className={discoverySecondaryButtonClass}>
                                        Compare datasets
                                    </a>
                                </div>
                            </div>

                            <DiscoveryPanel
                                eyebrow="Decision state"
                                title="Turn discovery into the next action"
                                description="Track what you have shortlisted, what is queued for compare, and the most useful next move for this buyer workflow."
                                className="border-cyan-400/20 bg-[linear-gradient(180deg,rgba(14,23,41,0.92),rgba(10,17,31,0.86))]"
                            >
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <DecisionStat label="Shortlisted" value={`${shortlistDatasets.length}`} />
                                    <DecisionStat label="In compare" value={`${compareDatasets.length}`} />
                                    <DecisionStat label="Visible results" value={`${filteredDatasets.length}`} />
                                </div>

                                <div className={`mt-6 rounded-[26px] border px-5 py-5 shadow-[0_22px_48px_-32px_rgba(2,6,23,0.92)] ${getSignalToneMeta(decisionAction.tone).surfaceClassName}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getSignalToneMeta(decisionAction.tone).dotClassName}`} aria-hidden="true" />
                                        <div>
                                            <div className={discoveryText.itemTitle}>{decisionAction.label}</div>
                                            <p className={`mt-2 ${discoveryText.body}`}>{decisionAction.detail}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <ActionLink
                                            label={decisionAction.label}
                                            to={decisionAction.to}
                                            href={decisionAction.href}
                                            className={discoveryActionButtonClass}
                                        />
                                    </div>
                                </div>
                            </DiscoveryPanel>
                        </div>
                    </div>
                </section>

                <section className={discoverySectionClass} aria-labelledby="dataset-filter-panel">
                    <DiscoveryPanel
                        eyebrow="Search, filter, and sort"
                        title="Narrow the catalog with buyer-relevant signals"
                        description="Search datasets, choose the trust and freshness thresholds you care about, and reset quickly if a filter path gets too narrow."
                        id="dataset-filter-panel"
                    >
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.32fr)_minmax(320px,0.72fr)]">
                            <label className="block">
                                <span className={discoveryText.eyebrow}>Search datasets</span>
                                <input
                                    id="dataset-search"
                                    type="text"
                                    value={filters.searchTerm}
                                    onChange={event => updateFilter('searchTerm', event.target.value)}
                                    placeholder="Search by title, use case, domain, or confidence summary"
                                    className={discoveryFieldClass}
                                />
                            </label>

                            <label className="block">
                                <span className={discoveryText.eyebrow}>Sort datasets</span>
                                <select
                                    aria-label="Sort datasets"
                                    value={sortOption}
                                    onChange={event => setSortOption(event.target.value as SortOption)}
                                    className={discoveryFieldClass}
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="mt-8">
                            <div className={discoveryText.eyebrow}>Priority domains</div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {domains.map(domain => (
                                    <button
                                        key={domain}
                                        type="button"
                                        aria-label={`Filter domain ${domain}`}
                                        aria-pressed={filters.domain === domain}
                                        onClick={() => updateFilter('domain', domain)}
                                        className={`rounded-full border px-4 py-2.5 text-xs font-semibold shadow-[0_14px_32px_-26px_rgba(2,6,23,0.92)] transition-all duration-200 ${
                                            filters.domain === domain
                                                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                                                : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/6 hover:text-slate-100'
                                        }`}
                                    >
                                        {domain}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                            <FilterSelect
                                label="Data type"
                                value={filters.dataType}
                                onChange={value => updateFilter('dataType', value)}
                                options={dataTypes}
                            />
                            <FilterSelect
                                label="Geography"
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
                                options={['0', '85', '90', '95']}
                                renderLabel={value => (value === '0' ? 'Any' : `${value}+`)}
                            />
                        </div>

                        <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex flex-wrap gap-2.5">
                                {activeFilters.length > 0 ? (
                                    activeFilters.map(filter => (
                                        <button
                                            key={filter.label}
                                            type="button"
                                            onClick={() => clearFilter(filter.key)}
                                            aria-label={`Clear filter ${filter.label}`}
                                            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-100 shadow-[0_14px_30px_-24px_rgba(34,211,238,0.38)] transition-colors hover:border-cyan-300"
                                        >
                                            {filter.label} ×
                                        </button>
                                    ))
                                ) : (
                                    <span className={discoveryText.meta}>No active filters. Use the controls above to narrow the catalog.</span>
                                )}
                            </div>

                            <button type="button" onClick={resetFilters} className={discoverySecondaryButtonClass}>
                                Reset filters
                            </button>
                        </div>
                    </DiscoveryPanel>
                </section>

                <section className={discoverySectionClass} aria-labelledby="matched-datasets">
                    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,2.18fr)_minmax(360px,0.72fr)] 2xl:grid-cols-[minmax(0,2.34fr)_minmax(390px,0.76fr)]">
                        <DiscoveryPanel
                            eyebrow="Matched datasets"
                            title="Decision-ready results"
                            description="Cards are organized for buyer evaluation: trust, access path, freshness, and reasons to shortlist come before deeper workflow actions."
                            id="matched-datasets"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className={discoveryText.metaStrong}>
                                    {isLoading ? 'Loading datasets...' : `Showing ${filteredDatasets.length} of ${DATASETS.length} datasets`}
                                </div>
                                <div className={discoveryText.meta}>Sorted by {sortOptions.find(option => option.value === sortOption)?.label}</div>
                            </div>

                            {isLoading ? (
                                <div
                                    className="mt-8 grid gap-6 xl:gap-7 2xl:gap-8"
                                    style={matchedDatasetCardGridStyle}
                                    aria-busy="true"
                                    aria-label="Loading datasets"
                                >
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <DatasetCardSkeleton key={index} />
                                    ))}
                                </div>
                            ) : filteredDatasets.length > 0 ? (
                                <div className="mt-8 grid gap-6 xl:gap-7 2xl:gap-8" style={matchedDatasetCardGridStyle}>
                                    {filteredDatasets.map(dataset => (
                                        <DatasetDecisionCard
                                            key={dataset.id}
                                            dataset={dataset}
                                            shortlisted={shortlistIds.includes(dataset.id)}
                                            compared={compareIds.includes(dataset.id)}
                                            compareLimitReached={compareLimitReached}
                                            onToggleShortlist={() => toggleShortlist(dataset.id)}
                                            onToggleCompare={() => toggleCompare(dataset.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyResultsState activeFilters={activeFilters} onReset={resetFilters} />
                            )}
                        </DiscoveryPanel>

                        <div className="space-y-8 self-start xl:sticky xl:top-[104px]">
                            <DiscoveryPanel
                                eyebrow="Shortlist"
                                title="Review shortlist"
                                description="Build a lightweight candidate list before you move into detail review, quote building, or access preparation."
                                id="shortlist-panel"
                            >
                                {shortlistDatasets.length > 0 ? (
                                    <div className="space-y-4">
                                        {shortlistDatasets.map(dataset => (
                                            <article key={dataset.id} className={discoveryCardClass}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className={discoveryText.itemTitle}>{dataset.title}</div>
                                                        <p className={`mt-2 ${discoveryText.body}`}>{dataset.bestFor}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleShortlist(dataset.id)}
                                                        aria-label={`Remove ${dataset.title} from shortlist`}
                                                        className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-cyan-100"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="mt-5 flex flex-wrap gap-2.5">
                                                    <InlineBadge label={`${dataset.confidenceScore}% confidence`} tone={dataset.confidenceScore >= 90 ? 'healthy' : 'monitoring'} />
                                                    <InlineBadge label={dataset.accessType} tone={dataset.accessType === 'Restricted' ? 'monitoring' : 'healthy'} />
                                                </div>

                                                <div className="mt-6 flex flex-wrap gap-3.5">
                                                    <Link to={`/datasets/${dataset.id}`} className={discoveryActionButtonClass}>
                                                        Open detail
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCompare(dataset.id)}
                                                        aria-label={
                                                            compareIds.includes(dataset.id)
                                                                ? `Remove ${dataset.title} from compare`
                                                                : `Add ${dataset.title} to compare`
                                                        }
                                                        disabled={compareLimitReached && !compareIds.includes(dataset.id)}
                                                        className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                                                            compareIds.includes(dataset.id)
                                                                ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300'
                                                                : 'border-slate-700 bg-slate-950/70 text-slate-200 hover:border-cyan-400/30 hover:text-cyan-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500'
                                                        }`}
                                                    >
                                                        {compareIds.includes(dataset.id) ? 'In compare' : 'Add to compare'}
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)]">
                                        <div className={discoveryText.itemTitle}>No shortlisted datasets yet</div>
                                        <p className={`mt-2 ${discoveryText.body}`}>
                                            Start with verified, high-confidence candidates and use shortlist to keep the strongest options together.
                                        </p>
                                        <Link to="/guided-tour" className={`mt-5 inline-flex ${discoverySecondaryButtonClass}`}>
                                            Open guided tour
                                        </Link>
                                    </div>
                                )}
                            </DiscoveryPanel>

                            <DiscoveryPanel
                                eyebrow="Compare"
                                title="Compare datasets"
                                description="Queue up to three datasets to compare trust, freshness, geography, and access path without leaving discovery."
                                id="compare-panel"
                            >
                                <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 shadow-[0_18px_42px_-30px_rgba(8,145,178,0.34)]">
                                    <div className={discoveryText.itemTitle}>Compare queue</div>
                                    <p className={`mt-2 ${discoveryText.body}`}>Add up to three datasets. Once the queue is full, compare buttons stay disabled until you remove one.</p>
                                </div>

                                {compareDatasets.length > 0 ? (
                                    <div className="mt-5 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className={discoveryText.metaStrong}>{compareDatasets.length} of 3 selected</span>
                                            <button
                                                type="button"
                                                onClick={() => setCompareIds([])}
                                                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-[0_14px_30px_-24px_rgba(2,6,23,0.9)] transition-colors hover:border-cyan-400/30 hover:text-cyan-100"
                                            >
                                                Clear compare
                                            </button>
                                        </div>

                                        {compareDatasets.map(dataset => (
                                            <div key={dataset.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)]">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className={discoveryText.itemTitle}>{dataset.title}</div>
                                                        <div className={`mt-2 ${discoveryText.meta}`}>{dataset.domain} · {bucketFreshness(dataset.freshness)} · {dataset.accessType}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCompare(dataset.id)}
                                                        aria-label={`Remove ${dataset.title} from compare`}
                                                        className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-[0_14px_30px_-24px_rgba(2,6,23,0.9)] transition-colors hover:border-cyan-400/30 hover:text-cyan-100"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {compareDatasets.length >= 2 ? (
                                            <CompareTable datasets={compareDatasets} />
                                        ) : (
                                            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)]">
                                                <div className={discoveryText.itemTitle}>Add one more dataset to compare</div>
                                                <p className={`mt-2 ${discoveryText.body}`}>Comparison becomes useful once at least two candidates are in the queue.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)]">
                                        <div className={discoveryText.itemTitle}>No datasets in compare</div>
                                        <p className={`mt-2 ${discoveryText.body}`}>Use compare when the shortlist has more than one viable option and you need a fast trust and access readout.</p>
                                    </div>
                                )}
                            </DiscoveryPanel>

                            <DiscoveryPanel
                                eyebrow="Request readiness"
                                title="Buyer guidance"
                                description="Use the shortlist and compare state to decide whether to keep researching, inspect details, or move closer to request prep."
                            >
                                <div className={`rounded-[26px] border px-5 py-5 shadow-[0_22px_48px_-32px_rgba(2,6,23,0.92)] ${getSignalToneMeta(requestReadiness.tone).surfaceClassName}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getSignalToneMeta(requestReadiness.tone).dotClassName}`} aria-hidden="true" />
                                        <div>
                                            <div className={discoveryText.itemTitle}>{requestReadiness.title}</div>
                                            <p className={`mt-2 ${discoveryText.body}`}>{requestReadiness.detail}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                        <DecisionStat label="Shortlist" value={`${shortlistDatasets.length}`} />
                                        <DecisionStat label="Verified" value={`${shortlistDatasets.filter(dataset => dataset.verificationStatus === 'Verified').length}`} />
                                        <DecisionStat
                                            label="Average confidence"
                                            value={shortlistDatasets.length > 0 ? `${Math.round(shortlistDatasets.reduce((sum, dataset) => sum + dataset.confidenceScore, 0) / shortlistDatasets.length)}%` : '0%'}
                                        />
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3.5">
                                        <ActionLink
                                            label={requestReadiness.primaryLabel}
                                            to={requestReadiness.primaryTo}
                                            href={requestReadiness.primaryHref}
                                            className={discoveryActionButtonClass}
                                        />
                                        <ActionLink
                                            label={requestReadiness.secondaryLabel}
                                            to={requestReadiness.secondaryTo}
                                            className={discoverySecondaryButtonClass}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <Link to="/guided-tour" className={`block ${discoveryCardClass} transition-all duration-200 hover:-translate-y-px hover:border-cyan-400/30`}>
                                        <div className={discoveryText.itemTitle}>Guided Tour</div>
                                        <p className={`mt-2 ${discoveryText.body}`}>Use the buyer workflow if you want help moving from shortlist into access preparation.</p>
                                    </Link>
                                    <Link to={firstShortlistedDataset ? `/datasets/${firstShortlistedDataset.id}` : '/trust-profile'} className={`block ${discoveryCardClass} transition-all duration-200 hover:-translate-y-px hover:border-cyan-400/30`}>
                                        <div className={discoveryText.itemTitle}>{firstShortlistedDataset ? 'Top shortlist candidate' : 'Trust Profile'}</div>
                                        <p className={`mt-2 ${discoveryText.body}`}>
                                            {firstShortlistedDataset
                                                ? `Open ${firstShortlistedDataset.title} to inspect request rules, rights, and access workflow detail.`
                                                : 'If you are still unsure which datasets to trust, review the trust surface before requesting access.'}
                                        </p>
                                    </Link>
                                </div>
                            </DiscoveryPanel>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

function DiscoveryPanel({
    eyebrow,
    title,
    description,
    children,
    id,
    className = ''
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    id?: string
    className?: string
}) {
    return (
        <section className={`${discoveryPanelClass} ${className}`.trim()} aria-labelledby={id}>
            <div className={discoveryText.eyebrow}>{eyebrow}</div>
            <h2 id={id} className={`mt-3 ${discoveryText.panelTitle}`}>{title}</h2>
            <p className={`mt-3 max-w-3xl ${discoveryText.body}`}>{description}</p>
            <div className="mt-6">{children}</div>
        </section>
    )
}

function HeroMetricChip({ label, value }: HeroMetric) {
    return (
        <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-slate-200 shadow-[0_16px_36px_-28px_rgba(2,6,23,0.92)] backdrop-blur-xl">
            <span className="uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className="text-base font-semibold text-slate-100">{value}</span>
        </span>
    )
}

function DecisionStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] px-5 py-4 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)] backdrop-blur-xl">
            <div className={discoveryText.eyebrow}>{label}</div>
            <div className={`mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] text-slate-50`}>{value}</div>
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
        <label className="block rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)] backdrop-blur-xl">
            <span className={discoveryText.eyebrow}>{label}</span>
            <select
                aria-label={label}
                value={value}
                onChange={event => onChange(event.target.value)}
                className={`${discoveryFieldClass} mt-3`}
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

function ActionLink({
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
        return (
            <Link to={to} className={className}>
                {label}
            </Link>
        )
    }

    return (
        <a href={href} className={className}>
            {label}
        </a>
    )
}

function DatasetDecisionCard({
    dataset,
    shortlisted,
    compared,
    compareLimitReached,
    onToggleShortlist,
    onToggleCompare
}: {
    dataset: Dataset
    shortlisted: boolean
    compared: boolean
    compareLimitReached: boolean
    onToggleShortlist: () => void
    onToggleCompare: () => void
}) {
    const compareDisabled = compareLimitReached && !compared
    const confidenceTone = dataset.confidenceScore >= 90 ? 'healthy' : dataset.confidenceScore >= 85 ? 'scheduled' : 'monitoring'
    const providerTone = dataset.providerTrustScore >= 90 ? 'healthy' : dataset.providerTrustScore >= 82 ? 'scheduled' : 'monitoring'

    return (
        <article aria-label={`Dataset card for ${dataset.title}`} className={`${discoveryCardClass} flex h-full min-h-[540px] flex-col`}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className={discoveryText.eyebrow}>Best for</div>
                    <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.035em] text-slate-50">{dataset.title}</h3>
                    <p className={`mt-3 ${discoveryText.bodyStrong} ${dashboardColorTokens['text-accent-soft']}`}>{dataset.bestFor}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2.5">
                    <InlineBadge label={dataset.verificationStatus} tone={dataset.verificationStatus === 'Verified' ? 'healthy' : 'monitoring'} />
                    <InlineBadge label={dataset.accessType} tone={dataset.accessType === 'Restricted' ? 'monitoring' : 'healthy'} />
                </div>
            </div>

            <p className={`mt-4 ${discoveryText.body}`}>{dataset.description}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <SignalCard label="Confidence score" value={`${dataset.confidenceScore}%`} detail={dataset.coverage} tone={confidenceTone} />
                <SignalCard label="Provider trust" value={`${dataset.providerTrustScore}%`} detail={dataset.contributionHistory} tone={providerTone} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
                <InlineNeutralChip label={dataset.domain} />
                <InlineNeutralChip label={dataset.dataType} />
                <InlineNeutralChip label={dataset.geography} />
                <InlineNeutralChip label={bucketFreshness(dataset.freshness)} />
            </div>

            <div className="mt-6 grid gap-4 xl:gap-5" style={metricPillGridStyle}>
                <MetricPill label="Completeness" value={`${dataset.completeness}%`} tone="healthy" />
                <MetricPill label="Freshness" value={`${dataset.freshness}%`} tone="scheduled" />
                <MetricPill label="Consistency" value={`${dataset.consistency}%`} tone="healthy" />
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)]">
                <div className={discoveryText.eyebrow}>Why consider it</div>
                <div className={`mt-3 ${discoveryText.bodyStrong}`}>{dataset.confidenceSummary}</div>
                <div className={`mt-4 ${discoveryText.meta}`}>Updated {formatDatasetDate(dataset.lastUpdated)} · Range {dataset.timeRange} · {dataset.size}</div>
            </div>

            <div className="mt-auto pt-8">
                <div className="flex flex-wrap gap-3.5">
                <button
                    type="button"
                    onClick={onToggleShortlist}
                    aria-label={shortlisted ? `Remove ${dataset.title} from shortlist` : `Add ${dataset.title} to shortlist`}
                    className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold shadow-[0_18px_40px_-28px_rgba(2,6,23,0.92)] transition-all duration-200 ${
                        shortlisted
                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400'
                            : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-400/30 hover:bg-cyan-400/6 hover:text-cyan-100'
                    }`}
                >
                    {shortlisted ? 'Shortlisted' : 'Add to shortlist'}
                </button>
                <button
                    type="button"
                    onClick={onToggleCompare}
                    aria-label={compared ? `Remove ${dataset.title} from compare` : `Add ${dataset.title} to compare`}
                    disabled={compareDisabled}
                    className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold shadow-[0_18px_40px_-28px_rgba(2,6,23,0.92)] transition-all duration-200 ${
                        compared
                            ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300'
                            : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-400/30 hover:bg-cyan-400/6 hover:text-cyan-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500'
                    }`}
                >
                    {compared ? 'In compare' : 'Add to compare'}
                </button>
                <Link
                    to={`/datasets/${dataset.id}`}
                    className={discoveryActionButtonClass}
                    aria-label={`View details for ${dataset.title}`}
                >
                    View details
                </Link>
                </div>
            </div>

            {compareDisabled ? (
                <p className={`mt-4 ${discoveryText.meta}`}>Compare queue is full. Remove one candidate from compare to add another.</p>
            ) : null}
        </article>
    )
}

function SignalCard({
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
        <div className={`rounded-[22px] border px-5 py-4 shadow-[0_18px_40px_-32px_rgba(2,6,23,0.92)] ${getSignalToneMeta(tone).surfaceClassName}`}>
            <div className={discoveryText.eyebrow}>{label}</div>
            <div className="mt-3 text-[1.08rem] font-semibold tracking-[-0.025em] text-slate-50">{value}</div>
            <div className={`mt-3 ${discoveryText.meta}`}>{detail}</div>
        </div>
    )
}

function MetricPill({
    label,
    value,
    tone
}: {
    label: string
    value: string
    tone: SignalTone
}) {
    return (
        <div className={`min-w-0 rounded-[20px] border px-4 py-4 shadow-[0_16px_34px_-28px_rgba(2,6,23,0.88)] ${getSignalToneMeta(tone).surfaceClassName}`}>
            <div className="max-w-full break-words text-[9px] font-semibold uppercase leading-4 tracking-[0.1em] text-slate-500 whitespace-normal sm:text-[10px]">
                {label}
            </div>
            <div className="mt-3 text-base font-semibold text-slate-100">{value}</div>
        </div>
    )
}

function InlineBadge({ label, tone }: { label: string; tone: SignalTone }) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-[0_14px_30px_-24px_rgba(2,6,23,0.9)] ${getSignalToneMeta(tone).badgeClassName}`}>
            <span className={`h-2 w-2 rounded-full ${getSignalToneMeta(tone).dotClassName}`} />
            {label}
        </span>
    )
}

function InlineNeutralChip({ label }: { label: string }) {
    return (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-[0_12px_28px_-22px_rgba(2,6,23,0.9)]">
            {label}
        </span>
    )
}

function CompareTable({ datasets }: { datasets: Dataset[] }) {
    const attributes = [
        { label: 'Confidence', getValue: (dataset: Dataset) => `${dataset.confidenceScore}%` },
        { label: 'Provider trust', getValue: (dataset: Dataset) => `${dataset.providerTrustScore}%` },
        { label: 'Freshness bucket', getValue: (dataset: Dataset) => bucketFreshness(dataset.freshness) },
        { label: 'Verification', getValue: (dataset: Dataset) => dataset.verificationStatus },
        { label: 'Access path', getValue: (dataset: Dataset) => dataset.accessType },
        { label: 'Geography', getValue: (dataset: Dataset) => dataset.geography }
    ] as const

    return (
        <div className="overflow-x-auto">
            <div
                className="grid min-w-[700px] gap-px rounded-[28px] border border-white/10 bg-[#22304D]/70 shadow-[0_20px_44px_-30px_rgba(2,6,23,0.92)]"
                style={{ gridTemplateColumns: `180px repeat(${datasets.length}, minmax(180px, 1fr))` }}
            >
                <div className="bg-[#0B1221] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Attribute</div>
                {datasets.map(dataset => (
                    <div key={dataset.id} className="bg-[#0B1221] px-5 py-4 text-sm font-semibold leading-6 text-slate-100">
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
            <div className="bg-[#10192E] px-5 py-4 text-xs font-semibold text-slate-400">{label}</div>
            {datasets.map(dataset => (
                <div key={`${label}-${dataset.id}`} className="bg-[#10192E] px-5 py-4 text-sm text-slate-100">
                    {getValue(dataset)}
                </div>
            ))}
        </>
    )
}

function EmptyResultsState({
    activeFilters,
    onReset
}: {
    activeFilters: ActiveFilterChip[]
    onReset: () => void
}) {
    return (
        <div className={`mt-8 ${discoveryCardClass}`}>
            <div className={discoveryText.itemTitle}>No datasets match these filters</div>
            <p className={`mt-2 ${discoveryText.body}`}>
                Clear the current filters and try a broader buyer workflow. Metadata stays visible here, but access still requires governed approval in the next step.
            </p>

            {activeFilters.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                    {activeFilters.map(filter => (
                        <span key={filter.label} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-100 shadow-[0_14px_30px_-24px_rgba(34,211,238,0.38)]">
                            {filter.label}
                        </span>
                    ))}
                </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3.5">
                <button type="button" onClick={onReset} className={discoveryActionButtonClass}>
                    Reset filters
                </button>
                <Link to="/guided-tour" className={discoverySecondaryButtonClass}>
                    Open guided tour
                </Link>
            </div>
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
    const verificationWeight = dataset.verificationStatus === 'Verified' ? 7 : 0
    const accessWeight = dataset.accessType === 'Approved access required' ? 4 : 1
    const freshnessWeight = dataset.freshness >= 93 ? 5 : dataset.freshness >= 88 ? 3 : 1

    return dataset.confidenceScore * 0.55 + dataset.providerTrustScore * 0.3 + verificationWeight + accessWeight + freshnessWeight
}

function parseStoredIdList(storageKey: string) {
    const stored = localStorage.getItem(storageKey)
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
    if (filters.geography !== 'All') chips.push({ key: 'geography', label: `Geography: ${filters.geography}` })
    if (filters.verificationStatus !== 'All') chips.push({ key: 'verificationStatus', label: `Verification: ${filters.verificationStatus}` })
    if (filters.freshnessBucket !== 'All') chips.push({ key: 'freshnessBucket', label: `Freshness: ${filters.freshnessBucket}` })
    if (filters.minConfidence > 0) chips.push({ key: 'minConfidence', label: `Confidence: ${filters.minConfidence}+` })

    return chips
}

function getDecisionAction(shortlistDatasets: Dataset[], compareDatasets: Dataset[], filteredDatasets: Dataset[]): DecisionAction {
    if (compareDatasets.length >= 2) {
        return {
            label: 'Compare queued datasets',
            detail: 'You have enough candidates in compare to inspect trust, freshness, and access path side by side.',
            href: '#compare-panel',
            tone: 'healthy'
        }
    }

    if (shortlistDatasets.length > 0) {
        return {
            label: 'Open top shortlisted dataset',
            detail: `Start with ${shortlistDatasets[0].title} and inspect the governed access detail before preparing a request.`,
            to: `/datasets/${shortlistDatasets[0].id}`,
            tone: 'healthy'
        }
    }

    if (filteredDatasets.length > 0) {
        return {
            label: 'Start a shortlist',
            detail: 'Add one or two strong candidates to shortlist first so the decision surface becomes more useful.',
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

function getRequestReadiness(shortlistDatasets: Dataset[], compareDatasets: Dataset[]): RequestReadiness {
    if (shortlistDatasets.length === 0) {
        return {
            tone: 'scheduled',
            title: 'Build a shortlist first',
            detail: 'Shortlist at least one viable dataset before moving into detail review or buyer workflow guidance.',
            primaryLabel: 'Open guided tour',
            primaryTo: '/guided-tour',
            secondaryLabel: 'Review discovery results',
            secondaryTo: '/datasets'
        }
    }

    if (shortlistDatasets.some(dataset => dataset.verificationStatus === 'Under Review' || dataset.confidenceScore < 90)) {
        return {
            tone: 'monitoring',
            title: 'Inspect details before requesting access',
            detail: 'One or more shortlisted datasets still need a closer trust or verification review before they look request-ready.',
            primaryLabel: `Open ${shortlistDatasets[0].title}`,
            primaryTo: `/datasets/${shortlistDatasets[0].id}`,
            secondaryLabel: 'Compare shortlisted datasets',
            secondaryTo: '/datasets'
        }
    }

    if (compareDatasets.length >= 2) {
        return {
            tone: 'healthy',
            title: 'Ready to compare access paths',
            detail: 'Your shortlist has multiple strong candidates. Compare them now, then open the strongest detail page for request preparation.',
            primaryLabel: 'Review compare panel',
            primaryHref: '#compare-panel',
            secondaryLabel: 'Open access requests',
            secondaryTo: '/access-requests'
        }
    }

    return {
        tone: 'healthy',
        title: 'Ready for detail review',
        detail: 'The shortlist looks strong enough to move into dataset detail, rights, and governed access review.',
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

function getSignalToneMeta(tone: SignalTone) {
    switch (tone) {
        case 'monitoring':
            return {
                badgeClassName: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
                dotClassName: 'bg-amber-300',
                surfaceClassName: 'border-amber-500/25 bg-amber-500/8'
            }
        case 'scheduled':
            return {
                badgeClassName: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
                dotClassName: 'bg-cyan-300',
                surfaceClassName: 'border-cyan-500/25 bg-cyan-500/8'
            }
        default:
            return {
                badgeClassName: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
                dotClassName: 'bg-emerald-300',
                surfaceClassName: 'border-emerald-500/25 bg-emerald-500/8'
            }
    }
}
