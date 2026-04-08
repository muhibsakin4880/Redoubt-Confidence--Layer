import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DatasetCardSkeleton } from '../components/LoadingSkeleton'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
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

const DATASETS: Dataset[] = [
    {
        id: 1,
        title: 'Global Climate Observations 2020-2024',
        timeRange: '2020-2024',
        description: 'Harmonized temperature, precipitation, wind, and atmospheric metrics from 5,000+ stations.',
        bestFor: 'Climate risk modeling, resilience scoring, and global baseline analysis.',
        domain: 'Climate',
        dataType: 'Time-series',
        geography: 'Global',
        confidenceScore: 96,
        providerTrustScore: 94,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-15',
        size: '2.4 TB',
        coverage: '1.2M records',
        completeness: 96,
        freshness: 94,
        consistency: 95,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'station_id', type: 'string' },
            { field: 'timestamp_utc', type: 'datetime' },
            { field: 'temperature_c', type: 'float' },
            { field: 'precip_mm', type: 'float' }
        ],
        confidenceSummary: 'Stable ingest with anomaly gating; near-real-time freshness and cross-source reconciliation.',
        contributorTrust: 'Verified Participant',
        contributionHistory: '12 integrity checks'
    },
    {
        id: 2,
        title: 'Urban Mobility Sensor Streams',
        timeRange: '2023-2026 rolling',
        description: 'Speed, occupancy, and flow metrics from smart-city sensors across 50 metros.',
        bestFor: 'Network planning, congestion modeling, and city-scale mobility forecasting.',
        domain: 'Mobility',
        dataType: 'Streaming',
        geography: 'North America, EU, APAC',
        confidenceScore: 91,
        providerTrustScore: 87,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-14',
        size: '1.8 TB',
        coverage: '920K sensors',
        completeness: 92,
        freshness: 90,
        consistency: 89,
        accessType: 'Restricted',
        sampleSchema: [
            { field: 'sensor_id', type: 'string' },
            { field: 'region', type: 'string' },
            { field: 'timestamp_utc', type: 'datetime' },
            { field: 'avg_speed_kph', type: 'float' }
        ],
        confidenceSummary: 'High availability with minor variance during peak hours; governed streaming channel.',
        contributorTrust: 'Trusted Participant',
        contributionHistory: '8 deliveries, zero disputes'
    },
    {
        id: 3,
        title: 'Financial Market Tick Data',
        timeRange: '2024-2026 rolling',
        description: 'Microsecond-level trades and quotes from major equity venues.',
        bestFor: 'Market microstructure studies, execution analysis, and signal research.',
        domain: 'Finance',
        dataType: 'Tick / time-series',
        geography: 'US, EU',
        confidenceScore: 95,
        providerTrustScore: 98,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-12',
        size: '3.2 TB',
        coverage: '450M ticks',
        completeness: 97,
        freshness: 93,
        consistency: 94,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'symbol', type: 'string' },
            { field: 'ts', type: 'datetime' },
            { field: 'price', type: 'decimal' },
            { field: 'size', type: 'int' }
        ],
        confidenceSummary: 'Tight latency distribution; reconciled across venues; anomaly filters for outliers.',
        contributorTrust: 'High Confidence Participant',
        contributionHistory: '18 verified pushes'
    },
    {
        id: 4,
        title: 'Clinical Outcomes (De-identified)',
        timeRange: '2018-2025',
        description: 'Aggregated, de-identified outcomes across multiple clinical trials.',
        bestFor: 'Outcomes research, trial benchmarking, and privacy-preserving cohort analysis.',
        domain: 'Healthcare',
        dataType: 'Tabular',
        geography: 'Global',
        confidenceScore: 92,
        providerTrustScore: 91,
        verificationStatus: 'Under Review',
        lastUpdated: '2026-02-10',
        size: '780 GB',
        coverage: '3.1M patient encounters',
        completeness: 90,
        freshness: 88,
        consistency: 91,
        accessType: 'Restricted',
        sampleSchema: [
            { field: 'trial_id', type: 'string' },
            { field: 'arm', type: 'string' },
            { field: 'outcome_flag', type: 'boolean' },
            { field: 'time_to_event_days', type: 'int' }
        ],
        confidenceSummary: 'De-identification and k-anonymity applied; under review for additional privacy controls.',
        contributorTrust: 'Verified Participant',
        contributionHistory: '5 secure submissions'
    },
    {
        id: 5,
        title: 'Satellite Land Use Dataset 2023',
        timeRange: '2022-2023',
        description: 'Satellite imagery and land use classification data from Landsat and Sentinel-2 missions.',
        bestFor: 'Land-use classification, geospatial monitoring, and climate adaptation mapping.',
        domain: 'Climate',
        dataType: 'Geospatial',
        geography: 'Global',
        confidenceScore: 88,
        providerTrustScore: 82,
        verificationStatus: 'Verified',
        lastUpdated: '2026-01-20',
        size: '450 GB',
        coverage: '2.8M tiles',
        completeness: 88,
        freshness: 85,
        consistency: 87,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'tile_id', type: 'string' },
            { field: 'acquisition_date', type: 'date' },
            { field: 'land_use_class', type: 'string' },
            { field: 'ndvi', type: 'float' },
            { field: 'latitude', type: 'float' },
            { field: 'longitude', type: 'float' }
        ],
        confidenceSummary: 'Multi-spectral analysis with ground truthing; some regions have incomplete coverage.',
        contributorTrust: 'Trusted Participant',
        contributionHistory: '6 verified submissions'
    },
    {
        id: 6,
        title: 'Consumer Behavior Analytics Q4',
        timeRange: 'Q4 2025',
        description: 'Consumer spending patterns and product preferences across demographic segments.',
        bestFor: 'Retail demand planning, audience segmentation, and market basket analysis.',
        domain: 'Finance',
        dataType: 'Tabular',
        geography: 'North America',
        confidenceScore: 79,
        providerTrustScore: 76,
        verificationStatus: 'Under Review',
        lastUpdated: '2026-01-25',
        size: '320 GB',
        coverage: '45M households',
        completeness: 82,
        freshness: 78,
        consistency: 80,
        accessType: 'Restricted',
        sampleSchema: [
            { field: 'household_id', type: 'string' },
            { field: 'category', type: 'string' },
            { field: 'spend_amount', type: 'decimal' },
            { field: 'demographic_segment', type: 'string' }
        ],
        confidenceSummary: 'Aggregated from retail loyalty cards; under review for anonymization compliance.',
        contributorTrust: 'Verified Participant',
        contributionHistory: '4 secure submissions'
    },
    {
        id: 7,
        title: 'Genomics Research Dataset v2',
        timeRange: '2019-2025',
        description: 'Gene expression data and variant calling from research institutions and biobanks.',
        bestFor: 'Biomarker discovery, translational research, and reproducibility-sensitive studies.',
        domain: 'Healthcare',
        dataType: 'Genomic',
        geography: 'Global',
        confidenceScore: 94,
        providerTrustScore: 96,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-01',
        size: '1.5 TB',
        coverage: '125K samples',
        completeness: 94,
        freshness: 92,
        consistency: 95,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'sample_id', type: 'string' },
            { field: 'gene_id', type: 'string' },
            { field: 'expression_value', type: 'float' },
            { field: 'variant_call', type: 'string' },
            { field: 'patient_cohort', type: 'string' }
        ],
        confidenceSummary: 'Peer-reviewed and reproducibility validated; all data has ethical approvals.',
        contributorTrust: 'High Confidence Participant',
        contributionHistory: '15 verified pushes'
    },
    {
        id: 8,
        title: 'Smart Grid Energy Patterns',
        timeRange: '2024-2026 rolling',
        description: 'Energy consumption patterns from smart meters and grid sensors across utilities.',
        bestFor: 'Grid reliability analysis, utility forecasting, and energy optimization models.',
        domain: 'Energy',
        dataType: 'Time-series',
        geography: 'US, EU',
        confidenceScore: 91,
        providerTrustScore: 89,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-13',
        size: '890 GB',
        coverage: '4.2M meters',
        completeness: 91,
        freshness: 88,
        consistency: 90,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'meter_id', type: 'string' },
            { field: 'timestamp_utc', type: 'datetime' },
            { field: 'consumption_kwh', type: 'float' },
            { field: 'voltage', type: 'float' },
            { field: 'frequency', type: 'float' }
        ],
        confidenceSummary: 'Real-time grid monitoring with anomaly detection; some residential data anonymized.',
        contributorTrust: 'Verified Participant',
        contributionHistory: '10 verified submissions'
    }
]

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
const discoveryPageShellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const discoverySectionClass = dashboardSpacingTokens['section-gap']
const discoveryPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] before:content-['']`
const discoveryCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const discoveryHeroClass = `${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`
const discoveryActionButtonClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding']}`
const discoverySecondaryButtonClass = `inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`
const discoveryText = {
    eyebrow: dashboardTypographyTokens['text-eyebrow'],
    heroEyebrow: dashboardTypographyTokens['text-hero-eyebrow'],
    heroTitle: dashboardTypographyTokens['text-hero-title'],
    sectionTitle: dashboardTypographyTokens['text-section-title'],
    panelTitle: dashboardTypographyTokens['text-panel-title'],
    itemTitle: dashboardTypographyTokens['text-item-title'],
    body: dashboardTypographyTokens['text-body'],
    bodyStrong: dashboardTypographyTokens['text-body-strong'],
    meta: dashboardTypographyTokens['text-muted'],
    metaStrong: dashboardTypographyTokens['text-muted-strong'],
    value: dashboardTypographyTokens['text-value']
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
                        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-teal-400/12 blur-3xl" />
                        <div className="pointer-events-none absolute right-6 top-4 h-44 w-44 rounded-full bg-cyan-300/12 blur-3xl" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-[36%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />

                        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
                            <div>
                                <div className={discoveryText.heroEyebrow}>Buyer discovery workspace</div>
                                <h1 id="dataset-discovery-hero" className={`mt-2 ${discoveryText.heroTitle}`}>
                                    Dataset Discovery
                                </h1>
                                <p className={`mt-3 max-w-3xl ${discoveryText.bodyStrong}`}>
                                    Move from browsing into buyer-ready decision making. Shortlist governed datasets, compare trust and access signals, and figure out whether
                                    you should keep researching or move toward request preparation.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    {heroMetrics.map(metric => (
                                        <HeroMetricChip key={metric.label} label={metric.label} value={metric.value} />
                                    ))}
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
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
                                className="border-cyan-400/20 bg-[#0E1729]/88"
                            >
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <DecisionStat label="Shortlisted" value={`${shortlistDatasets.length}`} />
                                    <DecisionStat label="In compare" value={`${compareDatasets.length}`} />
                                    <DecisionStat label="Visible results" value={`${filteredDatasets.length}`} />
                                </div>

                                <div className={`mt-4 rounded-[24px] border px-4 py-4 ${getSignalToneMeta(decisionAction.tone).surfaceClassName}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getSignalToneMeta(decisionAction.tone).dotClassName}`} aria-hidden="true" />
                                        <div>
                                            <div className={discoveryText.itemTitle}>{decisionAction.label}</div>
                                            <p className={`mt-2 ${discoveryText.body}`}>{decisionAction.detail}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3">
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
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_280px]">
                            <label className="block">
                                <span className={discoveryText.eyebrow}>Search datasets</span>
                                <input
                                    id="dataset-search"
                                    type="text"
                                    value={filters.searchTerm}
                                    onChange={event => updateFilter('searchTerm', event.target.value)}
                                    placeholder="Search by title, use case, domain, or confidence summary"
                                    className={`mt-2 w-full ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/55 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20`}
                                />
                            </label>

                            <label className="block">
                                <span className={discoveryText.eyebrow}>Sort datasets</span>
                                <select
                                    aria-label="Sort datasets"
                                    value={sortOption}
                                    onChange={event => setSortOption(event.target.value as SortOption)}
                                    className={`mt-2 w-full ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/55 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20`}
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="mt-5">
                            <div className={discoveryText.eyebrow}>Priority domains</div>
                            <div className="mt-3 flex flex-wrap gap-2.5">
                                {domains.map(domain => (
                                    <button
                                        key={domain}
                                        type="button"
                                        aria-label={`Filter domain ${domain}`}
                                        aria-pressed={filters.domain === domain}
                                        onClick={() => updateFilter('domain', domain)}
                                        className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                                            filters.domain === domain
                                                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                                                : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-cyan-400/30 hover:text-slate-100'
                                        }`}
                                    >
                                        {domain}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                {activeFilters.length > 0 ? (
                                    activeFilters.map(filter => (
                                        <button
                                            key={filter.label}
                                            type="button"
                                            onClick={() => clearFilter(filter.key)}
                                            aria-label={`Clear filter ${filter.label}`}
                                            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition-colors hover:border-cyan-300"
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
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.82fr)]">
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
                                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading datasets">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <DatasetCardSkeleton key={index} />
                                    ))}
                                </div>
                            ) : filteredDatasets.length > 0 ? (
                                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
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

                        <div className="space-y-6 xl:sticky xl:top-[92px] self-start">
                            <DiscoveryPanel
                                eyebrow="Shortlist"
                                title="Review shortlist"
                                description="Build a lightweight candidate list before you move into detail review, quote building, or access preparation."
                                id="shortlist-panel"
                            >
                                {shortlistDatasets.length > 0 ? (
                                    <div className="space-y-3">
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

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <InlineBadge label={`${dataset.confidenceScore}% confidence`} tone={dataset.confidenceScore >= 90 ? 'healthy' : 'monitoring'} />
                                                    <InlineBadge label={dataset.accessType} tone={dataset.accessType === 'Restricted' ? 'monitoring' : 'healthy'} />
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-3">
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
                                    <div className={`rounded-[24px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-4`}>
                                        <div className={discoveryText.itemTitle}>No shortlisted datasets yet</div>
                                        <p className={`mt-2 ${discoveryText.body}`}>
                                            Start with verified, high-confidence candidates and use shortlist to keep the strongest options together.
                                        </p>
                                        <Link to="/guided-tour" className={`mt-4 inline-flex ${discoverySecondaryButtonClass}`}>
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
                                <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3">
                                    <div className={discoveryText.itemTitle}>Compare queue</div>
                                    <p className={`mt-2 ${discoveryText.body}`}>Add up to three datasets. Once the queue is full, compare buttons stay disabled until you remove one.</p>
                                </div>

                                {compareDatasets.length > 0 ? (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className={discoveryText.metaStrong}>{compareDatasets.length} of 3 selected</span>
                                            <button
                                                type="button"
                                                onClick={() => setCompareIds([])}
                                                className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-cyan-100"
                                            >
                                                Clear compare
                                            </button>
                                        </div>

                                        {compareDatasets.map(dataset => (
                                            <div key={dataset.id} className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className={discoveryText.itemTitle}>{dataset.title}</div>
                                                        <div className={`mt-2 ${discoveryText.meta}`}>{dataset.domain} · {bucketFreshness(dataset.freshness)} · {dataset.accessType}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCompare(dataset.id)}
                                                        aria-label={`Remove ${dataset.title} from compare`}
                                                        className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-cyan-100"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {compareDatasets.length >= 2 ? (
                                            <CompareTable datasets={compareDatasets} />
                                        ) : (
                                            <div className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-4`}>
                                                <div className={discoveryText.itemTitle}>Add one more dataset to compare</div>
                                                <p className={`mt-2 ${discoveryText.body}`}>Comparison becomes useful once at least two candidates are in the queue.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`mt-4 rounded-[24px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-4`}>
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
                                <div className={`rounded-[24px] border px-4 py-4 ${getSignalToneMeta(requestReadiness.tone).surfaceClassName}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getSignalToneMeta(requestReadiness.tone).dotClassName}`} aria-hidden="true" />
                                        <div>
                                            <div className={discoveryText.itemTitle}>{requestReadiness.title}</div>
                                            <p className={`mt-2 ${discoveryText.body}`}>{requestReadiness.detail}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <DecisionStat label="Shortlist" value={`${shortlistDatasets.length}`} />
                                        <DecisionStat label="Verified" value={`${shortlistDatasets.filter(dataset => dataset.verificationStatus === 'Verified').length}`} />
                                        <DecisionStat
                                            label="Average confidence"
                                            value={shortlistDatasets.length > 0 ? `${Math.round(shortlistDatasets.reduce((sum, dataset) => sum + dataset.confidenceScore, 0) / shortlistDatasets.length)}%` : '0%'}
                                        />
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3">
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

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <Link to="/guided-tour" className={`block ${discoveryCardClass} transition-colors duration-200 hover:border-cyan-400/30`}>
                                        <div className={discoveryText.itemTitle}>Guided Tour</div>
                                        <p className={`mt-2 ${discoveryText.body}`}>Use the buyer workflow if you want help moving from shortlist into access preparation.</p>
                                    </Link>
                                    <Link to={firstShortlistedDataset ? `/datasets/${firstShortlistedDataset.id}` : '/trust-profile'} className={`block ${discoveryCardClass} transition-colors duration-200 hover:border-cyan-400/30`}>
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
            <h2 id={id} className={`mt-2 ${discoveryText.panelTitle}`}>{title}</h2>
            <p className={`mt-2 ${discoveryText.body}`}>{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function HeroMetricChip({ label, value }: HeroMetric) {
    return (
        <span className={`inline-flex items-center gap-2 ${dashboardRadiusTokens['radius-pill']} ${dashboardComponentTokens['metric-chip']} px-3 py-2 text-xs font-medium text-slate-200`}>
            <span className="uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className="text-slate-100">{value}</span>
        </span>
    )
}

function DecisionStat({ label, value }: { label: string; value: string }) {
    return (
        <div className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
            <div className={discoveryText.eyebrow}>{label}</div>
            <div className={`mt-2 ${discoveryText.itemTitle}`}>{value}</div>
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
        <label className="block">
            <span className={discoveryText.eyebrow}>{label}</span>
            <select
                aria-label={label}
                value={value}
                onChange={event => onChange(event.target.value)}
                className={`mt-2 w-full ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/55 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20`}
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
        <article aria-label={`Dataset card for ${dataset.title}`} className={discoveryCardClass}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className={discoveryText.eyebrow}>Best for</div>
                    <h3 className={`mt-2 ${discoveryText.itemTitle}`}>{dataset.title}</h3>
                    <p className={`mt-2 ${discoveryText.bodyStrong} ${dashboardColorTokens['text-accent-soft']}`}>{dataset.bestFor}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                    <InlineBadge label={dataset.verificationStatus} tone={dataset.verificationStatus === 'Verified' ? 'healthy' : 'monitoring'} />
                    <InlineBadge label={dataset.accessType} tone={dataset.accessType === 'Restricted' ? 'monitoring' : 'healthy'} />
                </div>
            </div>

            <p className={`mt-3 ${discoveryText.body}`}>{dataset.description}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SignalCard label="Confidence score" value={`${dataset.confidenceScore}%`} detail={dataset.coverage} tone={confidenceTone} />
                <SignalCard label="Provider trust" value={`${dataset.providerTrustScore}%`} detail={dataset.contributionHistory} tone={providerTone} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <InlineNeutralChip label={dataset.domain} />
                <InlineNeutralChip label={dataset.dataType} />
                <InlineNeutralChip label={dataset.geography} />
                <InlineNeutralChip label={bucketFreshness(dataset.freshness)} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricPill label="Completeness" value={`${dataset.completeness}%`} tone="healthy" />
                <MetricPill label="Freshness" value={`${dataset.freshness}%`} tone="scheduled" />
                <MetricPill label="Consistency" value={`${dataset.consistency}%`} tone="healthy" />
            </div>

            <div className={`mt-4 rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                <div className={discoveryText.eyebrow}>Why consider it</div>
                <div className={`mt-2 ${discoveryText.bodyStrong}`}>{dataset.confidenceSummary}</div>
                <div className={`mt-3 ${discoveryText.meta}`}>Updated {formatDatasetDate(dataset.lastUpdated)} · Range {dataset.timeRange} · {dataset.size}</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={onToggleShortlist}
                    aria-label={shortlisted ? `Remove ${dataset.title} from shortlist` : `Add ${dataset.title} to shortlist`}
                    className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                        shortlisted
                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400'
                            : 'border-slate-700 bg-slate-950/70 text-slate-200 hover:border-cyan-400/30 hover:text-cyan-100'
                    }`}
                >
                    {shortlisted ? 'Shortlisted' : 'Add to shortlist'}
                </button>
                <button
                    type="button"
                    onClick={onToggleCompare}
                    aria-label={compared ? `Remove ${dataset.title} from compare` : `Add ${dataset.title} to compare`}
                    disabled={compareDisabled}
                    className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                        compared
                            ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300'
                            : 'border-slate-700 bg-slate-950/70 text-slate-200 hover:border-cyan-400/30 hover:text-cyan-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500'
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

            {compareDisabled ? (
                <p className={`mt-3 ${discoveryText.meta}`}>Compare queue is full. Remove one candidate from compare to add another.</p>
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
        <div className={`rounded-[20px] border px-4 py-3 ${getSignalToneMeta(tone).surfaceClassName}`}>
            <div className={discoveryText.eyebrow}>{label}</div>
            <div className={`mt-2 ${discoveryText.itemTitle}`}>{value}</div>
            <div className={`mt-2 ${discoveryText.meta}`}>{detail}</div>
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
        <div className={`rounded-[18px] border px-3 py-3 ${getSignalToneMeta(tone).surfaceClassName}`}>
            <div className={discoveryText.eyebrow}>{label}</div>
            <div className={`mt-2 ${discoveryText.bodyStrong}`}>{value}</div>
        </div>
    )
}

function InlineBadge({ label, tone }: { label: string; tone: SignalTone }) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getSignalToneMeta(tone).badgeClassName}`}>
            <span className={`h-2 w-2 rounded-full ${getSignalToneMeta(tone).dotClassName}`} />
            {label}
        </span>
    )
}

function InlineNeutralChip({ label }: { label: string }) {
    return (
        <span className={`rounded-full border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-slate-300`}>
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
                className="grid min-w-[620px] gap-px rounded-[24px] border border-[#22304D] bg-[#22304D]"
                style={{ gridTemplateColumns: `160px repeat(${datasets.length}, minmax(160px, 1fr))` }}
            >
                <div className="bg-[#0B1221] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Attribute</div>
                {datasets.map(dataset => (
                    <div key={dataset.id} className="bg-[#0B1221] px-4 py-3 text-sm font-semibold text-slate-100">
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
            <div className="bg-[#10192E] px-4 py-3 text-xs font-semibold text-slate-400">{label}</div>
            {datasets.map(dataset => (
                <div key={`${label}-${dataset.id}`} className="bg-[#10192E] px-4 py-3 text-sm text-slate-100">
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
        <div className={`mt-5 ${discoveryCardClass}`}>
            <div className={discoveryText.itemTitle}>No datasets match these filters</div>
            <p className={`mt-2 ${discoveryText.body}`}>
                Clear the current filters and try a broader buyer workflow. Metadata stays visible here, but access still requires governed approval in the next step.
            </p>

            {activeFilters.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {activeFilters.map(filter => (
                        <span key={filter.label} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                            {filter.label}
                        </span>
                    ))}
                </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
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
