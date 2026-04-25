import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import DatasetAssistantPanel from '../components/dataset-detail/DatasetAssistantPanel'
import ProtectedEvaluationGate from '../components/credentials/ProtectedEvaluationGate'
import {
    DATASET_DETAILS,
    getDatasetDetailById
} from '../data/datasetDetailData'
import {
    DATASET_QUALITY_PREVIEW_BY_ID,
    getDatasetQualityPreviewById
} from '../data/datasetCatalogData'

type SchemaRisk = 'safe' | 'gray' | 'high'
type SchemaAccess = 'metadata' | 'aggregated' | 'restricted'
type SchemaResidency = 'global' | 'local'
type SchemaSort = 'risk-desc' | 'field-asc' | 'null-desc' | 'access-asc'

type SchemaPreviewRow = {
    field: string
    type: string
    sampleValue: string
    risk: SchemaRisk
    access: SchemaAccess
    residency: SchemaResidency
    nullPercent: number
}

const schemaRiskMeta: Record<
    SchemaRisk,
    {
        label: string
        dotClass: string
        badgeClass: string
        description: string
        sortRank: number
    }
> = {
    safe: {
        label: 'Tier 1: Safe',
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200',
        description:
            'Preview-safe structural metadata that clears policy checks and does not expose sensitive values.',
        sortRank: 0
    },
    gray: {
        label: 'Gray Zone: DPO Review Pending',
        dotClass: 'bg-amber-400',
        badgeClass: 'bg-amber-500/15 border border-amber-500/30 text-amber-200',
        description:
            'Potentially sensitive when combined with other fields, so free preview stays aggregated until governance review is complete.',
        sortRank: 1
    },
    high: {
        label: 'High Risk: PDPL Flagged',
        dotClass: 'bg-red-400',
        badgeClass: 'bg-red-500/15 border border-red-500/30 text-red-200',
        description:
            'Direct or highly identifying field that is blocked from free preview and only handled in governed workflows.',
        sortRank: 2
    }
}

const schemaAccessMeta: Record<
    SchemaAccess,
    { label: string; badgeClass: string; description: string; sortRank: number }
> = {
    metadata: {
        label: 'Metadata Only',
        badgeClass: 'bg-slate-700/50 border border-slate-600 text-slate-300',
        description:
            'Only field metadata and high-level summaries are visible in the free preview.',
        sortRank: 0
    },
    aggregated: {
        label: 'Aggregated Only',
        badgeClass: 'bg-amber-500/15 border border-amber-500/30 text-amber-200',
        description:
            'Only rolled-up or bucketed outputs are available; row-level detail stays hidden.',
        sortRank: 1
    },
    restricted: {
        label: 'Restricted',
        badgeClass: 'bg-red-500/15 border border-red-500/30 text-red-200',
        description:
            'Requires paid clean-room access, policy approval, and audit logging before inspection.',
        sortRank: 2
    }
}

const schemaResidencyMeta: Record<SchemaResidency, string> = {
    global: 'Global Transfer Cleared',
    local: 'Local Hosting Required'
}

const schemaRowsByDataset: Record<string, SchemaPreviewRow[]> = Object.fromEntries(
    Object.entries(DATASET_QUALITY_PREVIEW_BY_ID).map(([datasetId, preview]) => [
        datasetId,
        preview.schemaRows
    ])
)

const pagePanelClass =
    "relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/55 shadow-[0_26px_80px_rgba(2,6,23,0.42)] ring-1 ring-inset ring-white/8 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))]"
const surfaceCardClass =
    'relative overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/45 shadow-[0_18px_40px_rgba(2,6,23,0.2),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/5 backdrop-blur-xl'
const sectionEyebrowClass =
    'text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/75'

export default function DatasetQualityBreakdownPage() {
    const { id } = useParams()
    const location = useLocation()
    const isDemoRoute = location.pathname.startsWith('/demo/')
    const routeDataset = getDatasetDetailById(id)
    const routeQualityPreview = getDatasetQualityPreviewById(id)
    const dataset = routeDataset ?? Object.values(DATASET_DETAILS)[0]
    const qualityPreview =
        routeQualityPreview ?? Object.values(DATASET_QUALITY_PREVIEW_BY_ID)[0]
    const schemaRows = schemaRowsByDataset[dataset.id] ?? qualityPreview.schemaRows
    const datasetIndexPath = `${isDemoRoute ? '/demo' : ''}/datasets`
    const datasetDetailPath = `${datasetIndexPath}/${dataset.id}`

    const [schemaSearch, setSchemaSearch] = useState('')
    const [schemaRiskFilter, setSchemaRiskFilter] = useState<'all' | SchemaRisk>('all')
    const [schemaAccessFilter, setSchemaAccessFilter] = useState<'all' | SchemaAccess>('all')
    const [schemaResidencyFilter, setSchemaResidencyFilter] = useState<'all' | SchemaResidency>('all')
    const [schemaSort, setSchemaSort] = useState<SchemaSort>('risk-desc')

    const explainThisItems = useMemo(
        () => [
            {
                eyebrow: 'Confidence',
                label: `${dataset.confidenceScore}% confidence`,
                toneClass: 'text-cyan-100',
                description:
                    'Weighted from completeness, freshness, structural consistency, contributor trust, and access reliability. Use it as a routing signal, not as a replacement for schema review.'
            },
            {
                eyebrow: 'Schema Risk',
                label: 'Tier 1 Safe',
                toneClass: 'text-emerald-200',
                description: schemaRiskMeta.safe.description
            },
            {
                eyebrow: 'Schema Risk',
                label: 'Gray Zone',
                toneClass: 'text-amber-200',
                description: schemaRiskMeta.gray.description
            },
            {
                eyebrow: 'Access Control',
                label: 'Restricted',
                toneClass: 'text-red-200',
                description: schemaAccessMeta.restricted.description
            }
        ],
        [dataset.confidenceScore]
    )

    const filteredSchemaRows = useMemo(() => {
        const normalizedSearch = schemaSearch.trim().toLowerCase()
        const filtered = schemaRows.filter(row => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                [
                    row.field,
                    row.type,
                    row.sampleValue,
                    schemaRiskMeta[row.risk].label,
                    schemaAccessMeta[row.access].label,
                    schemaResidencyMeta[row.residency]
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedSearch)

            const matchesRisk = schemaRiskFilter === 'all' || row.risk === schemaRiskFilter
            const matchesAccess = schemaAccessFilter === 'all' || row.access === schemaAccessFilter
            const matchesResidency =
                schemaResidencyFilter === 'all' || row.residency === schemaResidencyFilter

            return matchesSearch && matchesRisk && matchesAccess && matchesResidency
        })

        const sorted = [...filtered]
        sorted.sort((left, right) => {
            if (schemaSort === 'field-asc') return left.field.localeCompare(right.field)
            if (schemaSort === 'null-desc') return right.nullPercent - left.nullPercent
            if (schemaSort === 'access-asc') {
                return schemaAccessMeta[left.access].sortRank - schemaAccessMeta[right.access].sortRank
            }
            return schemaRiskMeta[right.risk].sortRank - schemaRiskMeta[left.risk].sortRank
        })

        return sorted
    }, [
        schemaAccessFilter,
        schemaResidencyFilter,
        schemaRiskFilter,
        schemaRows,
        schemaSearch,
        schemaSort
    ])

    const schemaSummary = useMemo(
        () => ({
            total: schemaRows.length,
            highRisk: schemaRows.filter(row => row.risk === 'high').length,
            grayZone: schemaRows.filter(row => row.risk === 'gray').length,
            localOnly: schemaRows.filter(row => row.residency === 'local').length,
            restricted: schemaRows.filter(row => row.access === 'restricted').length
        }),
        [schemaRows]
    )

    const governanceCards = useMemo(
        () => [
            {
                label: 'Source network',
                value: qualityPreview.sourceNetwork,
                detail: 'Use this to judge how much cross-provider normalization or vendor curation is behind the preview.'
            },
            {
                label: 'Coverage window',
                value: qualityPreview.coverageWindow,
                detail: qualityPreview.completenessNarrative
            },
            {
                label: 'Validation status',
                value: dataset.quality.validationStatus,
                detail: qualityPreview.validationNarrative
            },
            {
                label: 'Escalation status',
                value: qualityPreview.escalationStatus,
                detail: qualityPreview.consistencyNarrative
            }
        ],
        [dataset.quality.validationStatus, qualityPreview]
    )

    useEffect(() => {
        setSchemaSearch('')
        setSchemaRiskFilter('all')
        setSchemaAccessFilter('all')
        setSchemaResidencyFilter('all')
        setSchemaSort('risk-desc')
    }, [dataset.id])

    if (!routeDataset || !routeQualityPreview) {
        return (
            <DatasetUnavailableState
                contextLabel="Quality Breakdown"
                detail="Redoubt could not find the dataset tied to this quality preview route. Return to Dataset Discovery and reopen the dataset before reviewing schema and governance signals."
            />
        )
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute right-[-10%] top-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-[1680px] px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16 xl:px-16">
                <div className="space-y-8">
                    <section className={`${pagePanelClass} px-8 py-8 sm:px-10 sm:py-9 lg:px-12 lg:py-10`}>
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="max-w-4xl space-y-4">
                                <div className="text-sm text-slate-400">
                                    <Link to={datasetIndexPath} className="transition-colors hover:text-white">
                                        Datasets
                                    </Link>
                                    <span className="mx-2 text-slate-600">/</span>
                                    <Link to={datasetDetailPath} className="transition-colors hover:text-white">
                                        {dataset.title}
                                    </Link>
                                    <span className="mx-2 text-slate-600">/</span>
                                    <span className="text-slate-200">Advanced Quality Workspace</span>
                                </div>

                                <div className={sectionEyebrowClass}>Advanced Quality Workspace</div>

                                <div className="space-y-3">
                                    <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04]">
                                        Schema, risk, and governance inspection for {dataset.title}
                                    </h1>
                                    <p className="max-w-3xl text-base leading-8 text-slate-300">
                                        Dataset Detail already carries the primary briefing. This workspace is reserved for deeper field-level filtering, label interpretation, and governance review before a governed evaluation begins.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <HeaderPill label="Confidence" value={`${dataset.confidenceScore}%`} />
                                    <HeaderPill label="Coverage window" value={qualityPreview.coverageWindow} />
                                    <HeaderPill label="Geography" value={qualityPreview.geographyLabel} />
                                    <HeaderPill label="Escalation" value={qualityPreview.escalationStatus} />
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-3 xl:max-w-[320px] xl:justify-end">
                                <Link
                                    to={datasetDetailPath}
                                    className="inline-flex items-center justify-center rounded-md border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/35 hover:text-white"
                                >
                                    Back to Dataset Detail
                                </Link>
                                <Link
                                    to={`/datasets/${dataset.id}/escrow-checkout`}
                                    className="inline-flex items-center justify-center rounded-md border border-emerald-400/35 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                                >
                                    Start Clean-Room Evaluation
                                </Link>
                            </div>
                        </div>
                    </section>

                    <ProtectedEvaluationGate datasetId={dataset.id} fallbackRoute={`/datasets/${dataset.id}/quality-breakdown`}>
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
                        <section className="space-y-8">
                            <section className={`${pagePanelClass} overflow-hidden`}>
                                <div className="border-b border-white/10 px-8 py-8 sm:px-10 sm:py-9 lg:px-12 lg:py-10">
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                                        <div className="max-w-2xl">
                                            <p className={sectionEyebrowClass}>Schema Workbench</p>
                                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                                Field-level policy inspection
                                            </h2>
                                            <p className="mt-3 text-sm leading-7 text-slate-400">
                                                Search, filter, and sort preview-safe schema signals. This is the primary expert surface on this route.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <SummaryBadge label="Fields scanned" value={String(schemaSummary.total)} />
                                            <SummaryBadge label="High risk" value={String(schemaSummary.highRisk)} />
                                            <SummaryBadge label="Gray zone" value={String(schemaSummary.grayZone)} />
                                            <SummaryBadge label="Restricted access" value={String(schemaSummary.restricted)} />
                                            <SummaryBadge label="Local hosting" value={String(schemaSummary.localOnly)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 bg-slate-900/35 px-8 py-8 sm:px-10 sm:py-9 lg:px-12 lg:py-10">
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.82fr))]">
                                        <label className="block">
                                            <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                Search
                                            </span>
                                            <input
                                                type="search"
                                                value={schemaSearch}
                                                onChange={event => setSchemaSearch(event.target.value)}
                                                placeholder="Field, type, risk, access, residency..."
                                                className="w-full rounded-md border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                Risk
                                            </span>
                                            <select
                                                value={schemaRiskFilter}
                                                onChange={event => setSchemaRiskFilter(event.target.value as 'all' | SchemaRisk)}
                                                className="w-full rounded-md border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                                            >
                                                <option value="all">All risk levels</option>
                                                <option value="high">High risk only</option>
                                                <option value="gray">Gray zone only</option>
                                                <option value="safe">Tier 1 safe only</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                Access
                                            </span>
                                            <select
                                                value={schemaAccessFilter}
                                                onChange={event => setSchemaAccessFilter(event.target.value as 'all' | SchemaAccess)}
                                                className="w-full rounded-md border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                                            >
                                                <option value="all">All access tiers</option>
                                                <option value="restricted">Restricted</option>
                                                <option value="aggregated">Aggregated only</option>
                                                <option value="metadata">Metadata only</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                Residency
                                            </span>
                                            <select
                                                value={schemaResidencyFilter}
                                                onChange={event => setSchemaResidencyFilter(event.target.value as 'all' | SchemaResidency)}
                                                className="w-full rounded-md border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                                            >
                                                <option value="all">All residency rules</option>
                                                <option value="local">Local hosting required</option>
                                                <option value="global">Global transfer cleared</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                Sort
                                            </span>
                                            <select
                                                value={schemaSort}
                                                onChange={event => setSchemaSort(event.target.value as SchemaSort)}
                                                className="w-full rounded-md border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                                            >
                                                <option value="risk-desc">Risk severity</option>
                                                <option value="field-asc">Field name</option>
                                                <option value="null-desc">Highest null %</option>
                                                <option value="access-asc">Access tier</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-50">
                                        <span className="font-semibold">
                                            Sensitive values are intentionally masked in this workspace.
                                        </span>{' '}
                                        <span className="text-slate-300">
                                            Inspect structure, risk, access, and residency here. Raw rows and direct exports still require paid clean-room controls.
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="flex flex-wrap items-center gap-4 text-xs">
                                            <span className="font-medium text-slate-400">Risk legend:</span>
                                            {(['safe', 'gray', 'high'] as const).map(risk => (
                                                <span
                                                    key={risk}
                                                    title={schemaRiskMeta[risk].description}
                                                    className="inline-flex items-center gap-1.5"
                                                >
                                                    <span className={`h-2 w-2 rounded-full ${schemaRiskMeta[risk].dotClass}`} />
                                                    <span
                                                        className={
                                                            risk === 'safe'
                                                                ? 'text-emerald-200'
                                                                : risk === 'gray'
                                                                    ? 'text-amber-200'
                                                                    : 'text-red-200'
                                                        }
                                                    >
                                                        {schemaRiskMeta[risk].label}
                                                    </span>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="text-xs text-slate-300">
                                            <span className="text-slate-400">{filteredSchemaRows.length} visible</span>
                                            <span className="mx-2 text-slate-600">•</span>
                                            <span className="text-slate-400">{schemaSummary.total} fields scanned</span>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-[20px] border border-white/10 bg-slate-900/60">
                                        <div className="max-h-[44rem] overflow-auto">
                                            <table className="min-w-full text-xs">
                                                <thead className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 text-[10px] uppercase tracking-[0.1em] text-slate-400 backdrop-blur">
                                                    <tr>
                                                        <th className="py-4 pl-5 pr-3 text-left font-medium">Field</th>
                                                        <th className="px-3 py-4 text-left font-medium">Type</th>
                                                        <th className="px-3 py-4 text-left font-medium">Sample Value</th>
                                                        <th className="px-3 py-4 text-left font-medium">Compliance &amp; PII</th>
                                                        <th className="px-3 py-4 text-left font-medium">Access Level Required</th>
                                                        <th className="px-3 py-4 text-left font-medium">Residency</th>
                                                        <th className="px-3 py-4 pr-5 text-left font-medium">Null %</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {filteredSchemaRows.map(row => (
                                                        <tr
                                                            key={row.field}
                                                            className="transition-colors hover:bg-slate-800/30"
                                                        >
                                                            <td className="py-4 pl-5 pr-3 font-mono text-white">
                                                                {row.field}
                                                            </td>
                                                            <td className="px-3 py-4 text-slate-300">{row.type}</td>
                                                            <td className="px-3 py-4 font-mono text-slate-300">{row.sampleValue}</td>
                                                            <td className="px-3 py-4">
                                                                <span
                                                                    title={schemaRiskMeta[row.risk].description}
                                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${schemaRiskMeta[row.risk].badgeClass}`}
                                                                >
                                                                    {schemaRiskMeta[row.risk].label}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-4">
                                                                <span
                                                                    title={schemaAccessMeta[row.access].description}
                                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${schemaAccessMeta[row.access].badgeClass}`}
                                                                >
                                                                    {schemaAccessMeta[row.access].label}
                                                                </span>
                                                            </td>
                                                            <td className={`px-3 py-4 ${row.residency === 'local' ? 'text-amber-300' : 'text-slate-300'}`}>
                                                                {schemaResidencyMeta[row.residency]}
                                                            </td>
                                                            <td className="px-3 py-4 pr-5 text-slate-300">
                                                                {row.nullPercent.toFixed(1)}%
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {filteredSchemaRows.length === 0 ? (
                                        <div className="rounded-[20px] border border-dashed border-white/10 bg-slate-900/40 px-4 py-8 text-center">
                                            <p className="text-sm font-semibold text-white">
                                                No schema fields match the current filters.
                                            </p>
                                            <p className="mt-2 text-xs text-slate-400">
                                                Try clearing one or more filters to inspect the full preview-safe schema again.
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </section>
                        </section>

                        <aside className="space-y-8">
                            <DatasetAssistantPanel dataset={dataset} variant="breakdown" />

                            <section className={`${pagePanelClass} p-8`}>
                                <p className={sectionEyebrowClass}>Label Guide</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                                    Explain these labels
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-slate-400">
                                    Confidence, risk, and access labels should help you interpret the workbench, not duplicate the main dataset briefing.
                                </p>

                                <div className="mt-6 grid gap-3">
                                    {explainThisItems.map(item => (
                                        <article
                                            key={item.label}
                                            className={`${surfaceCardClass} p-5`}
                                        >
                                            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                {item.eyebrow}
                                            </p>
                                            <p className={`mt-2 text-sm font-semibold ${item.toneClass}`}>
                                                {item.label}
                                            </p>
                                            <p className="mt-2 text-xs leading-6 text-slate-400">
                                                {item.description}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section className={`${pagePanelClass} p-8`}>
                                <p className={sectionEyebrowClass}>Governance Interpretation</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                                    Review posture and preview boundaries
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-slate-400">
                                    Use these signals to decide whether the dataset is still in a straightforward preview lane or needs deeper governance attention before evaluation.
                                </p>

                                <div className="mt-6 space-y-3">
                                    {governanceCards.map(card => (
                                        <article key={card.label} className={`${surfaceCardClass} p-5`}>
                                            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                {card.label}
                                            </p>
                                            <p className="mt-3 text-base font-semibold leading-7 text-white">
                                                {card.value}
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {card.detail}
                                            </p>
                                        </article>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-md border border-cyan-500/20 bg-cyan-500/8 px-4 py-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/85">
                                        Preview boundary
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-200">
                                        Free preview stays limited to schema shape, labels, and masked counts. Record-count range: {dataset.preview.recordCountRange}.
                                    </p>
                                    <p className="mt-2 text-xs leading-6 text-slate-400">
                                        {dataset.access.instructions[0] ?? 'Governed workspace access is required before protected inspection begins.'}
                                    </p>
                                </div>
                            </section>
                        </aside>
                    </div>
                    </ProtectedEvaluationGate>
                </div>
            </div>
        </div>
    )
}

function HeaderPill({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500">{label}:</span> {value}
        </div>
    )
}

function SummaryBadge({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-full border border-white/10 bg-slate-900/65 px-3 py-1.5">
            <span className="text-slate-500">{label}</span>{' '}
            <span className="font-semibold text-slate-100">{value}</span>
        </div>
    )
}
