import { Link } from 'react-router-dom'
import {
    approvedDatasets,
    buildRequestBasisFields,
    buildRequestComplianceFields,
    datasetRequests,
    getProviderReviewStatus,
    providerReviewStatusStyles,
    requestStatusLabel,
    statusStyles as requestStatusStyles,
    type DatasetRequest
} from '../data/workspaceData'
import {
    getContributionStatusPath,
    loadContributionRecords,
    statusStyles as contributionStatusStyles,
} from '../data/contributionStatusData'
import {
    buildDealPath,
    getDealRouteRecordByDatasetId,
    getDealRouteRecordByRequestId
} from '../data/dealDossierData'
import { DATASET_DETAILS } from '../data/datasetDetailData'

type ScreeningTone = 'emerald' | 'amber' | 'cyan'

type BuyerScreeningItem = {
    label: string
    status: string
    detail: string
    tone: ScreeningTone
}

type RequestFlagTone = 'emerald' | 'cyan' | 'amber'

type RequestFlag = {
    label: 'UAE local-only' | 'GCC limited' | 'Cross-border review needed'
    detail: string
    tone: RequestFlagTone
}

type ProviderOperationalTone = 'emerald' | 'cyan' | 'amber'

type ProviderOperationalItem = {
    label: string
    status: string
    detail: string
    tone: ProviderOperationalTone
}

const performanceSummary = {
    uptime: '99.4%',
    freshness: 'Updated < 2h',
    anomalies: 1,
    avgConfidence: 93
}

const economicsSummary = {
    grossContractValue: '$184,000',
    platformFee: '$22,080',
    netPayout: '$161,920',
    currentFeeTier: '12% repeat-provider tier'
}

const confidenceColor = (score: number) => {
    if (score >= 95) return 'text-emerald-300'
    if (score >= 90) return 'text-cyan-300'
    if (score >= 85) return 'text-amber-300'
    return 'text-rose-300'
}

const primaryPanelClass =
    'rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_24px_80px_rgba(2,8,20,0.3)] backdrop-blur-sm'

const secondaryPanelClass =
    'rounded-[24px] border border-white/10 bg-slate-900/70 shadow-[0_18px_56px_rgba(2,8,20,0.24)] backdrop-blur-sm'

const requestFlagGuide: RequestFlag[] = [
    {
        label: 'UAE local-only',
        detail: 'Use when provider review should stay inside a UAE-controlled operating lane.',
        tone: 'emerald'
    },
    {
        label: 'GCC limited',
        detail: 'Use when the request can be evaluated inside an approved GCC review boundary.',
        tone: 'cyan'
    },
    {
        label: 'Cross-border review needed',
        detail: 'Use when destination, evaluator scope, or delivery posture extends beyond the default regional lane.',
        tone: 'amber'
    }
] as const

const getScreeningToneClasses = (tone: ScreeningTone) => {
    if (tone === 'emerald') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100'
    return 'border-amber-500/30 bg-amber-500/10 text-amber-100'
}

const getRequestFlagToneClasses = (tone: RequestFlagTone) => {
    if (tone === 'emerald') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100'
    return 'border-amber-500/30 bg-amber-500/10 text-amber-100'
}

const getOperationalToneClasses = (tone: ProviderOperationalTone) => {
    if (tone === 'emerald') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100'
    return 'border-amber-500/30 bg-amber-500/10 text-amber-100'
}

const buildBuyerScreeningItems = (request: DatasetRequest): BuyerScreeningItem[] => {
    const clarificationOpen = Boolean(request.reviewerFeedback)
    const verifiedByDefault = request.status === 'REQUEST_APPROVED' || request.status === 'REVIEW_IN_PROGRESS'
    const domainNeedsReview = ['nlp-118', 'med-441'].includes(request.id)
    const evaluatorNeedsReview = clarificationOpen || request.status === 'REQUEST_REJECTED'

    return [
        {
            label: 'Verified organization',
            status: verifiedByDefault ? 'Verified' : 'Review',
            detail: verifiedByDefault ? 'Organization profile is present in the request packet.' : 'Provider review should re-check organizational standing.',
            tone: verifiedByDefault ? 'emerald' : 'amber'
        },
        {
            label: 'Domain verified',
            status: domainNeedsReview ? 'Review' : 'Verified',
            detail: domainNeedsReview ? 'Domain or institutional routing still needs confirmation.' : 'Request is packaged with a verified organizational domain signal.',
            tone: domainNeedsReview ? 'amber' : 'emerald'
        },
        {
            label: 'Authorized evaluator',
            status: evaluatorNeedsReview ? 'Review' : 'Verified',
            detail: evaluatorNeedsReview ? 'Evaluator authority or scope still needs clarification before approval.' : 'Evaluator scope is aligned to the submitted operating purpose.',
            tone: evaluatorNeedsReview ? 'amber' : 'emerald'
        },
        {
            label: 'Clarification required',
            status: clarificationOpen ? 'Open' : 'Clear',
            detail: clarificationOpen ? request.reviewerFeedback ?? 'Clarification is still pending.' : 'No outstanding clarification is blocking provider action.',
            tone: clarificationOpen ? 'cyan' : 'emerald'
        }
    ]
}

const getRequestFlags = (request: DatasetRequest): RequestFlag[] => {
    if (request.id === 'cl-204') {
        return [
            {
                label: 'GCC limited',
                detail: 'Regional control checks are already called out in the request and should keep review inside an approved GCC lane first.',
                tone: 'cyan'
            },
            {
                label: 'Cross-border review needed',
                detail: 'Any broader delivery or output expansion should route through transfer review before provider approval.',
                tone: 'amber'
            }
        ]
    }

    if (request.id === 'nlp-118') {
        return [
            {
                label: 'UAE local-only',
                detail: 'Sensitive text review should stay inside a tighter local safe-haven posture until retention controls are clarified.',
                tone: 'emerald'
            }
        ]
    }

    if (request.id === 'med-441') {
        return [
            {
                label: 'UAE local-only',
                detail: 'Clinical evaluation should remain in a local-only reviewed lane before any broader transfer is considered.',
                tone: 'emerald'
            }
        ]
    }

    if (request.id === 'urb-147') {
        return [
            {
                label: 'GCC limited',
                detail: 'Region-scoped streaming controls support an approved GCC-bounded operating path.',
                tone: 'cyan'
            }
        ]
    }

    return [
        {
            label: 'Cross-border review needed',
            detail: 'Delivery route and evaluator scope should clear transfer review before provider release.',
            tone: 'amber'
        }
    ]
}

const getDealRouteForRequest = (request: DatasetRequest) => {
    const mappedDealRoute = getDealRouteRecordByRequestId(request.id)
    if (mappedDealRoute) return mappedDealRoute

    const dataset = Object.values(DATASET_DETAILS).find(item => item.title === request.name)
    return getDealRouteRecordByDatasetId(dataset?.id)
}

export default function ProviderDashboardPage() {
    const providerDatasets = loadContributionRecords()
    const totalDatasets = providerDatasets.length
    const processingDatasetCount = providerDatasets.filter(dataset => dataset.status === 'Processing').length
    const needsFixesDatasetCount = providerDatasets.filter(dataset => dataset.status === 'Needs fixes').length
    const approvedDatasetCount = providerDatasets.filter(dataset => dataset.status === 'Approved').length
    const providerReviewRequests = datasetRequests.filter(request => request.status === 'REVIEW_IN_PROGRESS')
    const actionedReviewCount = datasetRequests.length - providerReviewRequests.length
    const activeRequests = providerReviewRequests.length
    const approvedAccesses = approvedDatasets.length
    const protectionStatusItems: ProviderOperationalItem[] = [
        {
            label: 'Identity shielded',
            status: 'Active',
            detail: 'Buyer identity stays masked in the provider workflow while purpose, controls, and reviewer signals remain visible.',
            tone: 'emerald'
        },
        {
            label: 'Preview only',
            status: activeRequests > 0 ? 'Metadata first' : 'Standby',
            detail: 'Request triage stays in preview mode until governed evaluation or approved delivery is formally opened.',
            tone: 'cyan'
        },
        {
            label: 'Release pending validation',
            status: approvedAccesses > 0 ? 'Conditional' : 'Guarded',
            detail: 'Provider-side release remains held behind evaluation checks, validation, and final release conditions.',
            tone: 'amber'
        }
    ]
    const commercialReadinessItems: ProviderOperationalItem[] = [
        {
            label: 'Evaluation stage',
            status: activeRequests > 0 ? `${activeRequests} live review${activeRequests === 1 ? '' : 's'}` : 'Ready',
            detail: 'Protected-evaluation requests are already present in the queue and can move without restarting provider onboarding.',
            tone: 'cyan'
        },
        {
            label: 'Production expansion possible',
            status: approvedAccesses > 0 ? 'Yes' : 'Available',
            detail: 'Successful evaluations can expand into production or API access with the same provider posture and controls.',
            tone: 'emerald'
        },
        {
            label: 'Release conditions summary',
            status: 'Validation gated',
            detail: 'Commercial release waits for buyer validation, configured controls, and no blocking dispute in the transaction path.',
            tone: 'amber'
        }
    ]
    const leadProviderPacketPath = providerReviewRequests
        .map(getDealRouteForRequest)
        .find((record): record is NonNullable<ReturnType<typeof getDealRouteForRequest>> => Boolean(record))
    const providerPacketQuickLink = leadProviderPacketPath
        ? buildDealPath(leadProviderPacketPath.dealId, 'provider-packet')
        : null

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 xl:px-8">
                <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(2,8,20,0.96)_100%)] p-6 shadow-[0_30px_90px_rgba(2,8,20,0.34)] backdrop-blur-sm lg:p-8">
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_340px] xl:items-start">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">
                                        Data Provider Hub
                                    </div>
                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Provider Dashboard</h1>
                                        <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                                            Manage the datasets you publish, respond to access requests, and monitor delivery quality—all without revealing buyer identity.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-3">
                                    <Link
                                        to="/provider/datasets/new"
                                        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-400"
                                    >
                                        Upload New Dataset
                                    </Link>
                                    <Link
                                        to="/provider/institution-review"
                                        className="rounded-lg border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-500/20"
                                    >
                                        Institution review
                                    </Link>
                                    {providerPacketQuickLink ? (
                                        <Link
                                            to={providerPacketQuickLink}
                                            className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-500/20"
                                        >
                                            Open provider packet
                                        </Link>
                                    ) : null}
                                    <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white">
                                        Configure delivery
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <SummaryMetricCard label="Total datasets" value={totalDatasets} hint="Uploaded" toneClass="bg-[linear-gradient(180deg,rgba(59,130,246,0.16)_0%,rgba(2,8,20,0)_100%)]" />
                                <SummaryMetricCard label="Active requests" value={activeRequests} hint="Awaiting action" toneClass="bg-[linear-gradient(180deg,rgba(245,158,11,0.16)_0%,rgba(2,8,20,0)_100%)]" />
                                <SummaryMetricCard label="Approved accesses" value={approvedAccesses} hint="Provisioned" toneClass="bg-[linear-gradient(180deg,rgba(16,185,129,0.16)_0%,rgba(2,8,20,0)_100%)]" />
                                <SummaryMetricCard label="Avg confidence" value={`${performanceSummary.avgConfidence}%`} hint="Quality signal" valueClass="text-cyan-300" toneClass="bg-[linear-gradient(180deg,rgba(34,211,238,0.16)_0%,rgba(2,8,20,0)_100%)]" />
                            </div>
                        </div>

                        <aside className="rounded-[26px] border border-white/10 bg-slate-950/78 p-6 shadow-[0_20px_60px_rgba(2,8,20,0.32)]">
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <span className="text-sm text-slate-400">Dataset performance</span>
                                <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                                    Healthy
                                </span>
                            </div>
                            <div className="pt-5">
                                <div className="mb-2 text-4xl font-semibold tracking-tight text-emerald-300">{performanceSummary.uptime} uptime</div>
                                <p className="text-sm leading-6 text-slate-400">Freshness {performanceSummary.freshness}; {performanceSummary.anomalies} anomaly flagged this week.</p>
                            </div>
                        </aside>
                    </div>
                </section>

                <section className="grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.72fr)] xl:items-start">
                    <section className={`${primaryPanelClass} overflow-hidden`}>
                        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-6 lg:flex-row lg:items-start lg:justify-between lg:px-7">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Dataset management</h2>
                                <p className="mt-1 text-sm text-slate-400">Track active submissions, spot issues quickly, and jump into upload or status work from one place.</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-blue-500/35 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                                        {processingDatasetCount} in validation
                                    </span>
                                    <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
                                        {needsFixesDatasetCount} need fixes
                                    </span>
                                    <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                                        {approvedDatasetCount} approved
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500">
                                    Bulk actions
                                </button>
                                <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-500">
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="border-b border-white/10 bg-slate-900/50 text-xs uppercase tracking-[0.08em] text-slate-400">
                                    <tr>
                                        <th className="py-4 pr-4 pl-6 text-left font-medium lg:pl-7">Dataset</th>
                                        <th className="px-4 py-4 text-left font-medium">Status</th>
                                        <th className="px-4 py-4 text-left font-medium">Confidence</th>
                                        <th className="px-4 py-4 text-left font-medium">Requests</th>
                                        <th className="px-4 py-4 text-left font-medium">Uploaded</th>
                                        <th className="py-4 pl-4 pr-6 text-right font-medium lg:pr-7">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {providerDatasets.map(dataset => {
                                        const datasetDealRoute = getDealRouteRecordByDatasetId(dataset.datasetId)

                                        return (
                                        <tr key={dataset.id} className="transition-colors hover:bg-white/[0.03]">
                                            <td className="py-5 pr-4 pl-6 align-top lg:pl-7">
                                                <Link
                                                    to={`/provider/datasets/${dataset.id}`}
                                                    className="font-semibold text-white transition-colors hover:text-cyan-200"
                                                >
                                                    {dataset.title}
                                                </Link>
                                                <div className="mt-1 text-xs text-slate-400">
                                                    Submission {dataset.submissionId} · {dataset.records}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 align-top">
                                                <Link
                                                    to={getContributionStatusPath(dataset.id)}
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium transition-colors hover:brightness-110 ${contributionStatusStyles[dataset.status]}`}
                                                >
                                                    {dataset.status}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-5 align-top">
                                                <div className={`text-base font-semibold ${confidenceColor(dataset.performance.avgReliability)}`}>
                                                    {dataset.performance.avgReliability}%
                                                </div>
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500"
                                                        style={{ width: `${dataset.performance.avgReliability}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 align-top text-slate-200">{dataset.performance.totalRequests}</td>
                                            <td className="px-4 py-5 align-top text-slate-300">{dataset.uploadedAt}</td>
                                            <td className="py-5 pl-4 pr-6 text-right align-top lg:pr-7">
                                                <div className="flex flex-col items-end gap-2">
                                                    <Link
                                                        to={`/provider/datasets/${dataset.id}`}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                                                    >
                                                        Manage dataset
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                    {datasetDealRoute ? (
                                                        <Link
                                                            to={buildDealPath(datasetDealRoute.dealId, 'dossier')}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                                                        >
                                                            Open dossier
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <aside className={`${secondaryPanelClass} p-6 lg:p-7 xl:sticky xl:top-24`}>
                        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Performance summary</h2>
                                <p className="mt-1 text-sm text-slate-400">Monitor delivery signals.</p>
                            </div>
                        </div>
                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                                <div className="text-sm text-slate-300">Freshness</div>
                                <div className="text-sm text-emerald-200">{performanceSummary.freshness}</div>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                                <div className="text-sm text-slate-300">Uptime</div>
                                <div className="text-sm text-emerald-200">{performanceSummary.uptime}</div>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                                <div className="text-sm text-slate-300">Anomalies this week</div>
                                <div className="text-sm text-amber-200">{performanceSummary.anomalies}</div>
                            </div>
                            <div className="rounded-[20px] border border-cyan-500/20 bg-cyan-500/10 p-5">
                                <div className="mb-2 text-xs uppercase tracking-[0.12em] text-cyan-200/80">Confidence trend</div>
                                <div className="text-3xl font-semibold text-cyan-300">{performanceSummary.avgConfidence}%</div>
                                <p className="mt-1 text-sm text-cyan-100/75">Rolling average across active datasets.</p>
                            </div>
                        </div>
                    </aside>
                </section>

                <section className={`${primaryPanelClass} p-6 lg:p-7`}>
                    <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Provider posture
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-white">Protection and commercial readiness</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                                Operational trust surfaces for how provider exposure stays controlled while commercial readiness advances through governed evaluation.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-2">
                        <OperationalSummaryCard
                            title="Protection status"
                            description="Provider-facing controls that keep review posture safe before release."
                            items={protectionStatusItems}
                        />
                        <OperationalSummaryCard
                            title="Commercial readiness"
                            description="Signals that show when protected evaluation can expand into revenue-bearing delivery."
                            items={commercialReadinessItems}
                        />
                    </div>
                </section>

                <section className={`${primaryPanelClass} p-6 lg:p-7`}>
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Incoming access requests</h2>
                            <p className="mt-1 text-sm text-slate-400">Buyer identity stays hidden, but purpose, legal basis, rights fit, and risk posture stay visible before you act.</p>
                        </div>
                        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs text-blue-100">
                            {activeRequests} awaiting provider action
                        </span>
                    </div>

                    <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/55 px-4 py-3 text-sm text-slate-300">
                        {actionedReviewCount} request{actionedReviewCount === 1 ? '' : 's'} already have an action recorded in the shared review log. This queue stays focused on items that still need a provider decision or clarification.
                    </div>

                    <div className="mt-5 rounded-[22px] border border-white/10 bg-slate-900/60 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Jurisdiction-aware request flags</div>
                                <div className="mt-2 text-sm text-slate-300">Fast routing cues for regulated review handling inside the provider queue.</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {requestFlagGuide.map(flag => (
                                    <span
                                        key={flag.label}
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRequestFlagToneClasses(flag.tone)}`}
                                    >
                                        {flag.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={`mt-5 grid gap-5 ${providerReviewRequests.length > 1 ? '2xl:grid-cols-2' : ''}`}>
                        {providerReviewRequests.map(request => (
                            <ProviderRequestCard key={request.id} request={request} />
                        ))}
                    </div>
                </section>

                <section className={`${secondaryPanelClass} p-6 lg:p-7`}>
                    <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Commercial snapshot
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-white">Provider economics at a glance</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                                Mock commercial values for the current protected-evaluation pipeline. These numbers are demo-only, but they make the fee path and provider payout structure visible.
                            </p>
                        </div>
                        <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                            {economicsSummary.currentFeeTier}
                        </span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                        <div className="rounded-[20px] border border-white/10 bg-slate-950/70 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Gross contract value</div>
                            <div className="mt-3 text-2xl font-semibold text-white">{economicsSummary.grossContractValue}</div>
                            <div className="mt-1 text-xs text-slate-400">Current protected-evaluation book</div>
                        </div>
                        <div className="rounded-[20px] border border-white/10 bg-slate-950/70 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Redoubt platform fee</div>
                            <div className="mt-3 text-2xl font-semibold text-white">{economicsSummary.platformFee}</div>
                            <div className="mt-1 text-xs text-slate-400">Applied after successful engagement</div>
                        </div>
                        <div className="rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-emerald-200/80">Provider net payout</div>
                            <div className="mt-3 text-2xl font-semibold text-emerald-100">{economicsSummary.netPayout}</div>
                            <div className="mt-1 text-xs text-emerald-100/75">Net after current fee tier</div>
                        </div>
                        <div className="rounded-[20px] border border-cyan-500/20 bg-cyan-500/10 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-cyan-200/80">Current fee tier</div>
                            <div className="mt-3 text-lg font-semibold text-cyan-100">{economicsSummary.currentFeeTier}</div>
                            <div className="mt-1 text-xs text-cyan-100/75">Repeat-provider economics</div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-[18px] border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-slate-200">
                            <span className="font-semibold text-white">Pilot Cohort:</span> fee-waived buyer evaluations are reserved for selected design partners with LOI-backed intent, feedback participation, and a credible production pathway.
                        </div>
                        <div className="rounded-[18px] border border-cyan-500/20 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                            <span className="font-semibold text-white">Expansion path:</span> successful evaluations can expand into production or API access pricing without restarting provider onboarding.
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

function OperationalSummaryCard({
    title,
    description,
    items
}: {
    title: string
    description: string
    items: ProviderOperationalItem[]
}) {
    return (
        <div className="rounded-[24px] border border-white/10 bg-slate-900/60 p-5 shadow-[0_18px_48px_rgba(2,8,20,0.2)]">
            <div className="border-b border-white/10 pb-4">
                <div className="text-base font-semibold text-white">{title}</div>
                <div className="mt-1 text-sm text-slate-400">{description}</div>
            </div>
            <div className="mt-4 grid gap-3">
                {items.map(item => (
                    <div key={`${title}-${item.label}`} className="rounded-[18px] border border-white/10 bg-slate-950/70 px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="text-sm font-semibold text-white">{item.label}</div>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getOperationalToneClasses(item.tone)}`}>
                                {item.status}
                            </span>
                        </div>
                        <div className="mt-2 text-xs leading-5 text-slate-400">{item.detail}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProviderRequestCard({ request }: { request: DatasetRequest }) {
    const providerReviewStatus = getProviderReviewStatus(request)
    const basisFields = buildRequestBasisFields(request)
    const complianceFields = buildRequestComplianceFields(request)
    const screeningItems = buildBuyerScreeningItems(request)
    const requestFlags = getRequestFlags(request)
    const dealRoute = getDealRouteForRequest(request)
    const providerPacketPath = dealRoute
        ? buildDealPath(dealRoute.dealId, 'provider-packet')
        : null

    return (
        <article className="flex h-full flex-col rounded-[24px] border border-white/10 bg-slate-950/72 p-5 shadow-[0_18px_48px_rgba(2,8,20,0.24)]">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-400">Dataset</p>
                    <h3 className="text-lg font-semibold text-white">{request.name}</h3>
                    <p className="text-xs text-slate-400">Request ID: {request.requestNumber}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${providerReviewStatusStyles[providerReviewStatus]}`}>
                        {providerReviewStatus}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${requestStatusStyles[request.status]}`}>
                        {requestStatusLabel(request.status)}
                    </span>
                </div>
            </div>

            <div className="mt-5 space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                    {basisFields.map(field => (
                        <RequestFieldCard key={`${request.id}-${field.label}`} label={field.label} value={field.value} />
                    ))}
                </div>

                <div className="rounded-[20px] border border-white/10 bg-slate-900/60 p-4">
                    <div className="mb-3 text-xs uppercase tracking-[0.12em] text-slate-400">Compliance posture</div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {complianceFields.map(field => (
                            <RequestFieldCard key={`${request.id}-compliance-${field.label}`} label={field.label} value={field.value} />
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
                    <div className="rounded-[20px] border border-white/10 bg-slate-900/60 p-4">
                        <div className="mb-3 text-xs uppercase tracking-[0.12em] text-slate-400">Buyer screening status</div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {screeningItems.map(item => (
                                <BuyerScreeningCard key={`${request.id}-${item.label}`} item={item} />
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[20px] border border-cyan-500/15 bg-slate-900/60 p-4">
                        <div className="mb-3 text-xs uppercase tracking-[0.12em] text-slate-400">Request flags</div>
                        <div className="flex flex-wrap gap-2">
                            {requestFlags.map(flag => (
                                <span
                                    key={`${request.id}-${flag.label}`}
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRequestFlagToneClasses(flag.tone)}`}
                                >
                                    {flag.label}
                                </span>
                            ))}
                        </div>
                        <div className="mt-4 space-y-2">
                            {requestFlags.map(flag => (
                                <div key={`${request.id}-${flag.label}-detail`} className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5">
                                    <div className="text-xs font-semibold text-white">{flag.label}</div>
                                    <div className="mt-1 text-xs leading-5 text-slate-400">{flag.detail}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[20px] border border-amber-400/20 bg-amber-500/8 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Reviewer rationale</div>
                    <p className="mt-2 text-sm leading-6 text-amber-50/95">{request.reviewerRationale}</p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-sm">
                <Link
                    to={`/access-requests/${request.id}`}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400 hover:text-white"
                >
                    Open review detail
                </Link>
                {providerPacketPath ? (
                    <Link
                        to={providerPacketPath}
                        className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                    >
                        Open provider packet
                    </Link>
                ) : null}
                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700">
                    Approve access
                </button>
                <button className="rounded-lg border border-rose-500 px-3 py-2 text-xs font-semibold text-rose-100 transition-colors hover:bg-rose-500/10">
                    Reject request
                </button>
                <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white">
                    Ask clarification
                </button>
            </div>
        </article>
    )
}

function BuyerScreeningCard({ item }: { item: BuyerScreeningItem }) {
    return (
        <div className="rounded-xl border border-white/10 bg-slate-950/70 p-3.5">
            <div className="flex flex-col items-start gap-2">
                <div className="text-xs uppercase tracking-[0.12em] leading-5 text-slate-400">{item.label}</div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getScreeningToneClasses(item.tone)}`}>
                    {item.status}
                </span>
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-300">{item.detail}</div>
        </div>
    )
}

function RequestFieldCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="h-full rounded-xl border border-white/10 bg-slate-950/70 p-3.5">
            <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-400">{label}</div>
            <div className="text-sm leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function SummaryMetricCard({
    label,
    value,
    hint,
    valueClass = 'text-white',
    toneClass = ''
}: {
    label: string
    value: string | number
    hint: string
    valueClass?: string
    toneClass?: string
}) {
    return (
        <div className={`rounded-[22px] border border-white/10 bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${toneClass}`}>
            <div className="mb-3 text-xs uppercase tracking-[0.12em] text-slate-400">{label}</div>
            <div className={`text-3xl font-semibold tracking-tight ${valueClass}`}>{value}</div>
            <div className="mt-1 text-xs text-slate-400">{hint}</div>
        </div>
    )
}
