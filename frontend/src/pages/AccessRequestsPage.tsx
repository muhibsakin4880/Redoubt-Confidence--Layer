import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
    activityDot,
    approvedDatasets,
    confidenceColor,
    datasetRequests,
    recentActivity,
    requestStatusLabel,
    statusStyles,
    type DatasetRequest
} from '../data/workspaceData'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'

type WorkflowLane = {
    label: string
    count: number
    detail: string
    badgeClassName: string
}

type RequestWorkflowMeta = {
    label: string
    detail: string
    actionLabel: string
    chipClassName: string
    tone: 'approved' | 'pending' | 'attention' | 'rejected'
}

const pageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const shellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const sectionGapClass = dashboardSpacingTokens['section-gap']
const sectionIntroClass = dashboardSpacingTokens['section-intro']
const panelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const quietPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-soft']} bg-[#10182B]/86 ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] before:content-['']`
const cardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding-compact']} shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]`
const headerStripCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`
const secondaryButtonClass = `inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`

const text = {
    eyebrow: dashboardTypographyTokens['text-eyebrow'],
    heroEyebrow: dashboardTypographyTokens['text-hero-eyebrow'],
    sectionTitle: dashboardTypographyTokens['text-section-title'],
    panelTitle: dashboardTypographyTokens['text-panel-title'],
    itemTitle: dashboardTypographyTokens['text-item-title'],
    body: dashboardTypographyTokens['text-body'],
    bodyStrong: dashboardTypographyTokens['text-body-strong'],
    meta: dashboardTypographyTokens['text-muted'],
    metaStrong: dashboardTypographyTokens['text-muted-strong'],
    value: dashboardTypographyTokens['text-value']
} as const

function requestNeedsAction(request: DatasetRequest) {
    return request.status === 'REQUEST_REJECTED' || (request.status === 'REVIEW_IN_PROGRESS' && Boolean(request.reviewerFeedback))
}

function getRequestWorkflowMeta(request: DatasetRequest): RequestWorkflowMeta {
    if (request.status === 'REQUEST_APPROVED') {
        return {
            label: 'Access live',
            detail: `Approved via ${request.delivery}. Monitor the next review window and keep usage inside the cleared scope.`,
            actionLabel: 'Open request',
            chipClassName: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
            tone: 'approved'
        }
    }

    if (request.status === 'REQUEST_REJECTED') {
        return {
            label: 'Resubmission required',
            detail: request.reviewerFeedback ?? request.notes ?? 'Review the decline reason and prepare a corrected submission package.',
            actionLabel: 'View reason',
            chipClassName: 'border-rose-400/30 bg-rose-500/10 text-rose-200',
            tone: 'rejected'
        }
    }

    if (request.reviewerFeedback) {
        return {
            label: 'Respond to reviewer note',
            detail: request.reviewerFeedback,
            actionLabel: 'Review note',
            chipClassName: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
            tone: 'attention'
        }
    }

    return {
        label: 'Awaiting reviewer decision',
        detail: request.expectedResolution ?? 'Reviewer checks are still in motion.',
        actionLabel: 'Track request',
        chipClassName: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200',
        tone: 'pending'
    }
}

function getWorkflowLanes(pendingCount: number, approvedCount: number, rejectedCount: number): WorkflowLane[] {
    return [
        {
            label: 'Pending review',
            count: pendingCount,
            detail: 'Requests moving through reviewer and policy checks.',
            badgeClassName: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
        },
        {
            label: 'Approved access',
            count: approvedCount,
            detail: 'Routes already cleared for live workspace or API use.',
            badgeClassName: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
        },
        {
            label: 'Resubmission required',
            count: rejectedCount,
            detail: 'Requests that need a fresh package or supporting evidence.',
            badgeClassName: 'border-rose-400/30 bg-rose-500/10 text-rose-200'
        }
    ]
}

export default function AccessRequestsPage() {
    const pendingRequests = datasetRequests.filter(request => request.status === 'REVIEW_IN_PROGRESS')
    const approvedCount = datasetRequests.filter(request => request.status === 'REQUEST_APPROVED').length
    const rejectedCount = datasetRequests.filter(request => request.status === 'REQUEST_REJECTED').length
    const needsActionRequests = datasetRequests.filter(requestNeedsAction)
    const nextReviewTarget = pendingRequests.find(request => request.expectedResolution)?.expectedResolution ?? 'No pending review milestones'
    const lanes = getWorkflowLanes(pendingRequests.length, approvedCount, rejectedCount)

    return (
        <div className={pageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={shellClass}>
                <section className={sectionGapClass} aria-labelledby="access-requests-header">
                    <div className={panelClass}>
                        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-3xl">
                                <div className={text.heroEyebrow}>Participant workflow</div>
                                <h1 id="access-requests-header" className={`mt-2 text-[1.9rem] font-semibold tracking-[-0.045em] text-slate-50 sm:text-[2.2rem]`}>
                                    Access requests
                                </h1>
                                <p className={`mt-3 max-w-2xl ${text.bodyStrong}`}>
                                    Operate the request queue, answer reviewer notes, and keep approved routes inside the current control boundary.
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:min-w-[38rem]">
                                <div className={headerStripCardClass}>
                                    <div className={text.eyebrow}>Needs action</div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                                        <span className="text-sm font-semibold text-slate-100">
                                            {needsActionRequests.length} request{needsActionRequests.length === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                </div>

                                <div className={headerStripCardClass}>
                                    <div className={text.eyebrow}>Next review target</div>
                                    <div className={`mt-2 text-sm font-semibold text-slate-100`}>{nextReviewTarget}</div>
                                </div>

                                <a href="#request-queue" className={`w-full justify-center sm:w-auto ${dashboardComponentTokens['action-button']} ${dashboardRadiusTokens['radius-md']} px-4 py-3 text-sm`}>
                                    Review queue
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={sectionGapClass} aria-labelledby="access-requests-main">
                    <div className={`grid grid-cols-1 ${dashboardSpacingTokens['space-4']} xl:grid-cols-[minmax(0,1.82fr)_360px]`}>
                        <section id="request-queue" className={panelClass} aria-labelledby="access-requests-main">
                            <div className={`relative ${sectionIntroClass} flex flex-col gap-3 border-b ${dashboardColorTokens['border-soft']} pb-4 sm:flex-row sm:items-end sm:justify-between`}>
                                <div>
                                    <div className={text.eyebrow}>Primary workspace</div>
                                    <h2 id="access-requests-main" className={`mt-2 ${text.sectionTitle}`}>Request queue</h2>
                                    <p className={`mt-2 ${text.body}`}>
                                        The operating surface for status, signal, and next-step review across the active access portfolio.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <QueueMetaChip label="Active requests" value={`${datasetRequests.length}`} />
                                    <QueueMetaChip label="Pending review" value={`${pendingRequests.length}`} />
                                    <QueueMetaChip label="Approved" value={`${approvedCount}`} />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-[1040px] w-full text-sm">
                                    <thead className={`border-b ${dashboardColorTokens['border-soft']} text-[11px] uppercase tracking-[0.18em] text-slate-500`}>
                                        <tr>
                                            <th className="py-3 pr-4 text-left font-medium">Request</th>
                                            <th className="py-3 px-4 text-left font-medium">Signal</th>
                                            <th className="py-3 px-4 text-left font-medium">Status</th>
                                            <th className="py-3 px-4 text-left font-medium">Your next step</th>
                                            <th className="py-3 px-4 text-left font-medium">Updated</th>
                                            <th className="py-3 pl-4 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900/80">
                                        {datasetRequests.map(request => (
                                            <RequestTableRow key={request.id} request={request} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <aside className="space-y-4">
                            <SidebarPanel
                                eyebrow="Action rail"
                                title="Needs your action now"
                                description="The requests most likely to move if you respond, clarify, or prepare a resubmission today."
                            >
                                <div className="space-y-3">
                                    {needsActionRequests.map(request => {
                                        const workflow = getRequestWorkflowMeta(request)
                                        return (
                                            <div key={request.id} className={`${cardClass} ${getWorkflowSurfaceClass(workflow.tone)}`}>
                                                <div className="relative">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-semibold text-white">{request.name}</div>
                                                            <div className={`mt-1 ${text.meta}`}>{request.requestNumber}</div>
                                                        </div>
                                                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${workflow.chipClassName}`}>
                                                            {workflow.label}
                                                        </span>
                                                    </div>
                                                    <p className={`mt-3 ${text.body}`}>{workflow.detail}</p>
                                                    <Link to={`/access-requests/${request.id}`} className={`mt-4 ${secondaryButtonClass}`}>
                                                        {workflow.actionLabel}
                                                    </Link>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </SidebarPanel>

                            <SidebarPanel
                                eyebrow="Review posture"
                                title="Workflow lanes"
                                description="A compact read on where the request portfolio is sitting right now."
                            >
                                <div className="space-y-3">
                                    {lanes.map(lane => (
                                        <div key={lane.label} className={cardClass}>
                                            <div className="relative flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{lane.label}</div>
                                                    <div className={`mt-2 ${text.body}`}>{lane.detail}</div>
                                                </div>
                                                <span className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-full border px-3 py-1 text-sm font-semibold ${lane.badgeClassName}`}>
                                                    {lane.count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SidebarPanel>

                            <SidebarPanel
                                eyebrow="Live access"
                                title="Active access routes"
                                description="Approved routes already in operation so the queue reads like a live portfolio, not just a review inbox."
                            >
                                <div className="space-y-3">
                                    {approvedDatasets.map(dataset => (
                                        <div key={dataset.id} className={cardClass}>
                                            <div className="relative">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-semibold text-white">{dataset.name}</div>
                                                        <div className={`mt-1 ${text.meta}`}>{dataset.accessRoute}</div>
                                                    </div>
                                                    <span className={`text-sm font-semibold ${confidenceColor(dataset.confidence)}`}>
                                                        {dataset.confidence}%
                                                    </span>
                                                </div>
                                                <div className={`mt-3 ${text.body}`}>{dataset.limits}</div>
                                                <div className={`mt-2 ${text.meta}`}>{dataset.expiry}</div>
                                                {dataset.detailLink ? (
                                                    <Link to={dataset.detailLink} className={`mt-4 ${secondaryButtonClass}`}>
                                                        Open route
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SidebarPanel>
                        </aside>
                    </div>
                </section>

                <section className={sectionGapClass} aria-labelledby="recent-request-activity">
                    <section className={quietPanelClass}>
                        <div className={`relative ${sectionIntroClass} flex flex-col gap-3 border-b ${dashboardColorTokens['border-soft']} pb-4 sm:flex-row sm:items-end sm:justify-between`}>
                            <div>
                                <div className={text.eyebrow}>Operational log</div>
                                <h2 id="recent-request-activity" className={`mt-2 ${text.sectionTitle}`}>Recent request activity</h2>
                                <p className={`mt-2 ${text.body}`}>
                                    A compact timeline of approvals, pending review events, and decline outcomes across the current access pipeline.
                                </p>
                            </div>
                            <span className={`inline-flex rounded-full border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300`}>
                                {recentActivity.length} events
                            </span>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-2">
                            {recentActivity.map(item => (
                                <article key={`${item.label}-${item.timestamp}`} className={cardClass}>
                                    <div className="relative flex items-start gap-3">
                                        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activityDot[item.type]}`} />
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-white">{item.label}</div>
                                            <div className={`mt-2 ${text.meta}`}>{item.timestamp}</div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </section>
            </div>
        </div>
    )
}

function QueueMetaChip({ label, value }: { label: string; value: string }) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-3 py-2 text-xs font-medium text-slate-200`}>
            <span className="uppercase tracking-[0.14em] text-slate-500">{label}</span>
            <span className="text-slate-100">{value}</span>
        </span>
    )
}

function SidebarPanel({
    eyebrow,
    title,
    description,
    children
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <section className={quietPanelClass}>
            <div className={text.eyebrow}>{eyebrow}</div>
            <h2 className={`mt-2 ${text.panelTitle}`}>{title}</h2>
            <p className={`mt-2 ${text.body}`}>{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function RequestTableRow({ request }: { request: DatasetRequest }) {
    const workflow = getRequestWorkflowMeta(request)

    return (
        <tr className={`align-top transition-colors ${getRowClassName(workflow.tone)}`}>
            <td className="py-4 pr-4">
                <div className="font-semibold text-white">{request.name}</div>
                <div className={`mt-1 ${text.meta}`}>{request.requestNumber}</div>
                <div className={`mt-2 ${text.metaStrong}`}>
                    {request.category} · {request.delivery}
                </div>
            </td>
            <td className="py-4 px-4">
                <div className={`text-lg font-semibold ${confidenceColor(request.confidence)}`}>{request.confidence}%</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0A1324]">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-500"
                        style={{ width: `${request.confidence}%` }}
                    />
                </div>
                <div className={`mt-2 ${text.meta}`}>Request signal</div>
            </td>
            <td className="py-4 px-4">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[request.status]}`}>
                    {requestStatusLabel(request.status)}
                </span>
            </td>
            <td className="py-4 px-4">
                <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${workflow.chipClassName}`}>
                    {workflow.label}
                </div>
                <p className={`mt-3 max-w-sm ${text.body}`}>{workflow.detail}</p>
            </td>
            <td className="py-4 px-4">
                <div className="text-sm text-slate-200">{request.lastUpdated}</div>
                <div className={`mt-2 ${text.meta}`}>{request.submittedDate}</div>
            </td>
            <td className="py-4 pl-4 text-right">
                <Link to={`/access-requests/${request.id}`} className={secondaryButtonClass}>
                    {workflow.actionLabel}
                </Link>
            </td>
        </tr>
    )
}

function getWorkflowSurfaceClass(tone: RequestWorkflowMeta['tone']) {
    switch (tone) {
        case 'approved':
            return 'border-emerald-500/20 bg-emerald-500/[0.05]'
        case 'attention':
            return 'border-amber-500/20 bg-amber-500/[0.05]'
        case 'rejected':
            return 'border-rose-500/20 bg-rose-500/[0.05]'
        default:
            return 'border-cyan-500/20 bg-cyan-500/[0.04]'
    }
}

function getRowClassName(tone: RequestWorkflowMeta['tone']) {
    switch (tone) {
        case 'approved':
            return 'hover:bg-emerald-500/[0.035]'
        case 'attention':
            return 'bg-amber-500/[0.03] hover:bg-amber-500/[0.05]'
        case 'rejected':
            return 'bg-rose-500/[0.03] hover:bg-rose-500/[0.05]'
        default:
            return 'hover:bg-cyan-500/[0.03]'
    }
}
