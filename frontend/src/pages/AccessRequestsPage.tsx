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
const shellClass = `relative mx-auto max-w-[1680px] space-y-4 ${dashboardSpacingTokens['page-padding']}`
const sectionIntroClass = dashboardSpacingTokens['section-intro']
const panelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} p-5 sm:p-6 ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-14 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const quietPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-soft']} bg-[#10182B]/86 p-5 sm:p-6 ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] before:content-['']`
const headerStripCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`
const supportCardClass = `rounded-[1.15rem] border ${dashboardColorTokens['border-soft']} bg-slate-950/35 p-4`
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
    metaStrong: dashboardTypographyTokens['text-muted-strong']
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
                <section aria-labelledby="access-requests-header">
                    <div className={panelClass}>
                        <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(420px,0.82fr)] xl:items-end">
                            <div className="max-w-3xl">
                                <div className={text.heroEyebrow}>Participant workflow</div>
                                <h1 id="access-requests-header" className="mt-2 text-[1.9rem] font-semibold tracking-[-0.045em] text-slate-50 sm:text-[2.2rem]">
                                    Access requests
                                </h1>
                                <p className={`mt-3 max-w-2xl ${text.bodyStrong}`}>
                                    Operate the request queue, answer reviewer notes, and keep approved routes inside the current control boundary.
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                <HeaderSignal
                                    label="Needs action"
                                    value={`${needsActionRequests.length} request${needsActionRequests.length === 1 ? '' : 's'}`}
                                    dotClassName="bg-amber-300"
                                />
                                <HeaderSignal label="Next review target" value={nextReviewTarget} />
                                <a
                                    href="#request-queue"
                                    className={`w-full justify-center sm:w-auto ${dashboardComponentTokens['action-button']} ${dashboardRadiusTokens['radius-md']} px-4 py-3 text-sm`}
                                >
                                    Review queue
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section aria-labelledby="request-queue-heading" className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(420px,0.95fr)]">
                    <section id="request-queue" className={panelClass} aria-labelledby="request-queue-heading">
                        <div className={`relative ${sectionIntroClass} flex flex-col gap-3 border-b ${dashboardColorTokens['border-soft']} pb-4 lg:flex-row lg:items-end lg:justify-between`}>
                            <div>
                                <div className={text.eyebrow}>Primary workspace</div>
                                <h2 id="request-queue-heading" className={`mt-2 ${text.sectionTitle}`}>Request queue</h2>
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

                        <div className="-mx-2 overflow-x-auto px-2">
                            <table className="min-w-[900px] w-full table-fixed text-sm">
                                <colgroup>
                                    <col className="w-[27%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[13%]" />
                                    <col className="w-[24%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[12%]" />
                                </colgroup>
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

                    <div className="grid content-start gap-4">
                        <section className={quietPanelClass} aria-labelledby="needs-action-now">
                            <div className={`relative ${sectionIntroClass} border-b ${dashboardColorTokens['border-soft']} pb-4`}>
                                <div className={text.eyebrow}>Secondary support</div>
                                <h2 id="needs-action-now" className={`mt-2 ${text.sectionTitle}`}>Needs your action now</h2>
                                <p className={`mt-2 ${text.body}`}>
                                    The requests most likely to move if you respond, clarify, or prepare a resubmission today.
                                </p>
                            </div>

                            <div className="divide-y divide-slate-900/80">
                                {needsActionRequests.map(request => {
                                    const workflow = getRequestWorkflowMeta(request)
                                    return (
                                        <ActionListItem
                                            key={request.id}
                                            title={request.name}
                                            meta={request.requestNumber}
                                            detail={workflow.detail}
                                            chipLabel={workflow.label}
                                            chipClassName={workflow.chipClassName}
                                            action={<Link to={`/access-requests/${request.id}`} className={secondaryButtonClass}>{workflow.actionLabel}</Link>}
                                        />
                                    )
                                })}
                            </div>
                        </section>

                        <section className={quietPanelClass} aria-labelledby="recent-request-activity">
                            <div className={`relative ${sectionIntroClass} border-b ${dashboardColorTokens['border-soft']} pb-4`}>
                                <div className={text.eyebrow}>Operational log</div>
                                <h2 id="recent-request-activity" className={`mt-2 ${text.sectionTitle}`}>Recent request activity</h2>
                                <p className={`mt-2 ${text.body}`}>
                                    A compact timeline of approvals, pending review events, and decline outcomes across the current access pipeline.
                                </p>
                            </div>

                            <div className="divide-y divide-slate-900/80">
                                {recentActivity.map(item => (
                                    <TimelineListItem
                                        key={`${item.label}-${item.timestamp}`}
                                        title={item.label}
                                        detail={item.timestamp}
                                        dotClassName={activityDot[item.type]}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(320px,0.86fr)_minmax(0,1.14fr)]">
                    <section className={quietPanelClass} aria-labelledby="workflow-lanes">
                        <div className={`relative ${sectionIntroClass} border-b ${dashboardColorTokens['border-soft']} pb-4`}>
                            <div className={text.eyebrow}>Review posture</div>
                            <h2 id="workflow-lanes" className={`mt-2 ${text.sectionTitle}`}>Workflow lanes</h2>
                            <p className={`mt-2 ${text.body}`}>
                                A compact read on where the request portfolio is sitting right now.
                            </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                            {lanes.map(lane => (
                                <LaneTile key={lane.label} lane={lane} />
                            ))}
                        </div>
                    </section>

                    <section className={quietPanelClass} aria-labelledby="active-access-routes">
                        <div className={`relative ${sectionIntroClass} border-b ${dashboardColorTokens['border-soft']} pb-4`}>
                            <div className={text.eyebrow}>Live access</div>
                            <h2 id="active-access-routes" className={`mt-2 ${text.sectionTitle}`}>Active access routes</h2>
                            <p className={`mt-2 ${text.body}`}>
                                Approved routes already in operation so the queue reads like a live portfolio, not just a review inbox.
                            </p>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-2">
                            {approvedDatasets.map(dataset => (
                                <RouteTile key={dataset.id} dataset={dataset} />
                            ))}
                        </div>
                    </section>
                </section>
            </div>
        </div>
    )
}

function HeaderSignal({
    label,
    value,
    dotClassName
}: {
    label: string
    value: string
    dotClassName?: string
}) {
    return (
        <div className={headerStripCardClass}>
            <div className={text.eyebrow}>{label}</div>
            <div className="mt-2 flex items-start gap-2">
                {dotClassName ? <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} /> : null}
                <span className="text-sm font-semibold text-slate-100">{value}</span>
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

function RequestTableRow({ request }: { request: DatasetRequest }) {
    const workflow = getRequestWorkflowMeta(request)

    return (
        <tr className={`align-top transition-colors ${getRowClassName(workflow.tone)}`}>
            <td className="py-3.5 pr-4">
                <div className="pr-2">
                    <div className="font-semibold text-white">{request.name}</div>
                    <div className={`mt-1 ${text.meta}`}>{request.requestNumber}</div>
                    <div className={`mt-2 ${text.metaStrong}`}>
                        {request.category} · {request.delivery}
                    </div>
                </div>
            </td>
            <td className="py-3.5 px-4">
                <div className={`text-base font-semibold ${confidenceColor(request.confidence)}`}>{request.confidence}%</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0A1324]">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-500"
                        style={{ width: `${request.confidence}%` }}
                    />
                </div>
                <div className={`mt-2 ${text.meta}`}>Request signal</div>
            </td>
            <td className="py-3.5 px-4">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[request.status]}`}>
                    {requestStatusLabel(request.status)}
                </span>
            </td>
            <td className="py-3.5 px-4">
                <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${workflow.chipClassName}`}>
                    {workflow.label}
                </div>
                <p className="mt-2 text-[13px] leading-5 text-slate-400">{workflow.detail}</p>
            </td>
            <td className="py-3.5 px-4">
                <div className="text-sm text-slate-200">{request.lastUpdated}</div>
                <div className={`mt-2 ${text.meta}`}>{request.submittedDate}</div>
            </td>
            <td className="py-3.5 pl-4 text-right">
                <Link to={`/access-requests/${request.id}`} className={secondaryButtonClass}>
                    {workflow.actionLabel}
                </Link>
            </td>
        </tr>
    )
}

function ActionListItem({
    title,
    meta,
    detail,
    chipLabel,
    chipClassName,
    action
}: {
    title: string
    meta: string
    detail: string
    chipLabel: string
    chipClassName: string
    action: ReactNode
}) {
    return (
        <article className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{title}</div>
                    <div className={`mt-1 ${text.meta}`}>{meta}</div>
                </div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${chipClassName}`}>
                    {chipLabel}
                </span>
            </div>
            <p className={`mt-3 ${text.body}`}>{detail}</p>
            <div className="mt-3">{action}</div>
        </article>
    )
}

function TimelineListItem({
    title,
    detail,
    dotClassName
}: {
    title: string
    detail: string
    dotClassName: string
}) {
    return (
        <article className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
            <div className="flex min-w-0 gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{title}</div>
                </div>
            </div>
            <div className={`pl-5 sm:pl-0 ${text.meta}`}>{detail}</div>
        </article>
    )
}

function LaneTile({ lane }: { lane: WorkflowLane }) {
    return (
        <article className={supportCardClass}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{lane.label}</div>
                    <div className={`mt-2 ${text.body}`}>{lane.detail}</div>
                </div>
                <span className={`inline-flex min-w-[2.75rem] items-center justify-center rounded-full border px-3 py-1 text-sm font-semibold ${lane.badgeClassName}`}>
                    {lane.count}
                </span>
            </div>
        </article>
    )
}

function RouteTile({
    dataset
}: {
    dataset: typeof approvedDatasets[number]
}) {
    return (
        <article className={`${supportCardClass} flex h-full flex-col`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{dataset.name}</div>
                    <div className={`mt-1 ${text.meta}`}>{dataset.accessRoute}</div>
                </div>
                <span className={`text-sm font-semibold ${confidenceColor(dataset.confidence)}`}>{dataset.confidence}%</span>
            </div>
            <div className={`mt-3 ${text.body}`}>{dataset.limits}</div>
            <div className={`mt-2 ${text.meta}`}>{dataset.expiry}</div>
            {dataset.detailLink ? (
                <Link to={dataset.detailLink} className={`mt-4 self-start ${secondaryButtonClass}`}>
                    Open route
                </Link>
            ) : null}
        </article>
    )
}

function getRowClassName(tone: RequestWorkflowMeta['tone']) {
    switch (tone) {
        case 'approved':
            return 'hover:bg-emerald-500/[0.03]'
        case 'attention':
            return 'bg-amber-500/[0.025] hover:bg-amber-500/[0.05]'
        case 'rejected':
            return 'bg-rose-500/[0.025] hover:bg-rose-500/[0.05]'
        default:
            return 'hover:bg-cyan-500/[0.03]'
    }
}
