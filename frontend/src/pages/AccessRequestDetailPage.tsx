import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    buildRequestBasisFields,
    buildRequestComplianceFields,
    buildRequestReviewerFields,
    datasetRequests,
    getProviderReviewStatus,
    providerReviewStatusStyles,
    requestStatusLabel,
    statusStyles
} from '../data/workspaceData'
import {
    getDatasetTrustRiskLabels,
    trustSignalStateLabel
} from '../domain/datasetTrustProfile'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'

const pageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const shellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const sectionGapClass = dashboardSpacingTokens['section-gap']
const panelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const quietPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-soft']} bg-[#10182B]/86 ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] before:content-['']`
const cardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding-compact']} shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]`
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

export default function AccessRequestDetailPage() {
    const { requestId } = useParams()
    const request = datasetRequests.find(item => item.id === requestId)

    if (!request) {
        return (
            <div className={pageClass}>
                <div className={dashboardComponentTokens['page-background']} />
                <div className={shellClass}>
                    <section className={sectionGapClass}>
                        <div className={panelClass}>
                            <div className="relative max-w-3xl">
                                <div className={text.heroEyebrow}>Access request review</div>
                                <h1 className={`mt-2 text-[1.9rem] font-semibold tracking-[-0.045em] text-slate-50 sm:text-[2.2rem]`}>
                                    Request record not found
                                </h1>
                                <p className={`mt-3 ${text.bodyStrong}`}>
                                    The requested access record could not be found in the current participant workspace.
                                </p>
                                <Link to="/access-requests" className={`mt-6 ${secondaryButtonClass}`}>
                                    Back to access requests
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )
    }

    const providerReviewStatus = getProviderReviewStatus(request)
    const requestBasisFields = buildRequestBasisFields(request)
    const complianceFields = buildRequestComplianceFields(request)
    const reviewerFields = buildRequestReviewerFields(request)
    const trustSignals = getDatasetTrustRiskLabels(request.trustProfile)
    const summaryCards = [
        { label: 'Review state', value: providerReviewStatus, detail: 'Provider + reviewer queue posture' },
        {
            label: 'Expected resolution',
            value: request.status === 'REVIEW_IN_PROGRESS' ? request.expectedResolution ?? 'Pending assignment' : 'No pending review window',
            detail: 'Current timing signal'
        },
        { label: 'Delivery route', value: request.delivery, detail: 'Approved or requested delivery path' },
        { label: 'Next step', value: request.reviewerNextStep, detail: 'What should happen next' }
    ]

    return (
        <div className={pageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={shellClass}>
                <section className={sectionGapClass} aria-labelledby="access-request-detail-header">
                    <div className={panelClass}>
                        <div className="relative">
                            <Link to="/access-requests" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to access requests
                            </Link>

                            <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                                <div className="max-w-3xl">
                                    <div className={text.heroEyebrow}>Access request review</div>
                                    <h1 id="access-request-detail-header" className={`mt-2 text-[1.9rem] font-semibold tracking-[-0.045em] text-slate-50 sm:text-[2.2rem]`}>
                                        {request.name}
                                    </h1>
                                    <p className={`mt-3 max-w-2xl ${text.bodyStrong}`}>
                                        Detailed review status, compliance posture, and reviewer rationale for the active access request.
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <HeaderMetaChip label="Request number" value={request.requestNumber} />
                                        <HeaderMetaChip label="Category" value={request.category} />
                                        <HeaderMetaChip label="Submitted" value={request.submittedDate} />
                                        <HeaderMetaChip label="Confidence" value={`${request.confidence}%`} />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 xl:justify-end">
                                    <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${providerReviewStatusStyles[providerReviewStatus]}`}>
                                        {providerReviewStatus}
                                    </span>
                                    <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyles[request.status]}`}>
                                        {requestStatusLabel(request.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={sectionGapClass} aria-labelledby="request-summary">
                    <div className="mb-4">
                        <h2 id="request-summary" className={text.sectionTitle}>Request summary</h2>
                        <p className={`mt-2 ${text.body}`}>Compact review signals for timing, delivery, and the next expected move.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map(card => (
                            <article key={card.label} className={cardClass}>
                                <div className="relative">
                                    <div className={text.eyebrow}>{card.label}</div>
                                    <div className={`mt-3 text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-100`}>{card.value}</div>
                                    <div className={`mt-2 ${text.meta}`}>{card.detail}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={sectionGapClass} aria-labelledby="request-review-console">
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_360px]">
                        <div className="space-y-5">
                            <DetailPanel
                                eyebrow="Request basis"
                                title="Request basis"
                                description="What the organization wants to do, how long it needs access, and what outputs it expects to create."
                            >
                                <FieldGrid fields={requestBasisFields} />
                            </DetailPanel>

                            <DetailPanel
                                eyebrow="Compliance posture"
                                title="Compliance posture"
                                description="The current trust, rights, and audit signals attached to this request before or after approval."
                            >
                                <FieldGrid fields={complianceFields} />
                            </DetailPanel>

                            <DetailPanel
                                eyebrow="Reviewer rationale"
                                title="Reviewer rationale"
                                description="Why the request is approved, pending, or blocked, plus what should happen next."
                            >
                                <FieldGrid fields={reviewerFields} />
                            </DetailPanel>
                        </div>

                        <aside className="space-y-5">
                            <DetailPanel
                                eyebrow="Trust review"
                                title="Trust review signals"
                                description="Compact signal labels summarizing sensitivity, rights, audit visibility, and review pressure."
                                quiet
                            >
                                <div className="space-y-3">
                                    {trustSignals.map(signal => (
                                        <div key={signal.key} className={`${cardClass} ${getTrustSignalSurfaceClass(signal.severity)}`}>
                                            <div className="relative">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-sm font-semibold text-white">{signal.label}</div>
                                                        <div className={`mt-2 ${text.bodyStrong}`}>{signal.value}</div>
                                                    </div>
                                                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getTrustSignalBadgeClass(signal.severity)}`}>
                                                        {signal.severity}
                                                    </span>
                                                </div>
                                                <div className={`mt-3 ${text.meta}`}>{trustSignalStateLabel(signal.state)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DetailPanel>

                            <DetailPanel
                                eyebrow="Review posture"
                                title="Review posture"
                                description="The key contextual signals an operator or reviewer would want on the same screen."
                                quiet
                            >
                                <div className="space-y-3">
                                    <PostureItem label="Organization type" value={request.organizationType} />
                                    <PostureItem label="Requested duration" value={request.duration} />
                                    <PostureItem label="Audit requirement" value={request.auditRequirement} />
                                    <PostureItem label="Responsibility boundary" value={request.trustProfile.responsibilityBoundary.value} />
                                    <PostureItem
                                        label="Ethical flags"
                                        value={
                                            request.trustProfile.ethicalFlags.length > 0
                                                ? request.trustProfile.ethicalFlags.join(' ')
                                                : 'No additional ethical flags surfaced in the current demo packet.'
                                        }
                                    />
                                </div>
                            </DetailPanel>
                        </aside>
                    </div>
                </section>
            </div>
        </div>
    )
}

function HeaderMetaChip({ label, value }: { label: string; value: string }) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-3 py-2 text-xs font-medium text-slate-200`}>
            <span className="uppercase tracking-[0.14em] text-slate-500">{label}</span>
            <span className="text-slate-100">{value}</span>
        </span>
    )
}

function DetailPanel({
    eyebrow,
    title,
    description,
    children,
    quiet = false
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    quiet?: boolean
}) {
    return (
        <section className={quiet ? quietPanelClass : panelClass}>
            <div className={text.eyebrow}>{eyebrow}</div>
            <h2 className={`mt-2 ${text.panelTitle}`}>{title}</h2>
            <p className={`mt-2 ${quiet ? text.meta : text.body}`}>{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function FieldGrid({ fields }: { fields: Array<{ label: string; value: string }> }) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {fields.map(field => (
                <article key={field.label} className={cardClass}>
                    <div className="relative">
                        <div className={text.eyebrow}>{field.label}</div>
                        <div className={`mt-3 text-sm leading-6 text-slate-100`}>{field.value}</div>
                    </div>
                </article>
            ))}
        </div>
    )
}

function PostureItem({ label, value }: { label: string; value: string }) {
    return (
        <article className={cardClass}>
            <div className="relative">
                <div className={text.eyebrow}>{label}</div>
                <div className={`mt-3 text-sm leading-6 text-slate-100`}>{value}</div>
            </div>
        </article>
    )
}

function getTrustSignalBadgeClass(severity: 'low' | 'medium' | 'high') {
    if (severity === 'high') return 'border-rose-400/30 bg-rose-500/10 text-rose-200'
    if (severity === 'medium') return 'border-amber-400/30 bg-amber-500/10 text-amber-200'
    return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
}

function getTrustSignalSurfaceClass(severity: 'low' | 'medium' | 'high') {
    if (severity === 'high') return 'border-rose-500/20 bg-rose-500/[0.05]'
    if (severity === 'medium') return 'border-amber-500/20 bg-amber-500/[0.05]'
    return 'border-emerald-500/20 bg-emerald-500/[0.05]'
}
