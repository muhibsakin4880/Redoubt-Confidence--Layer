import { Link, useParams } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import DealArtifactPreviewGrid from '../components/deals/DealArtifactPreviewGrid'
import DealConflictBanner from '../components/deals/DealConflictBanner'
import SignoffTimeline from '../components/deals/SignoffTimeline'
import {
    getApprovalArtifactByDealId,
    getApprovalArtifactByReviewId,
    type ApprovalArtifactModel
} from '../domain/approvalArtifact'
import { buildDealPolicyConflictModel } from '../domain/dealPolicyConflict'
import DealRoutePlaceholderPage from './DealRoutePlaceholderPage'

type DealApprovalPageProps = {
    adminView?: boolean
}

const pageClass = 'min-h-screen bg-[#030814] text-white'
const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

const toneClasses = {
    slate: 'border-white/10 bg-white/5 text-slate-200',
    cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    rose: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
} as const

export default function DealApprovalPage({
    adminView = false
}: DealApprovalPageProps) {
    const { dealId, appId } = useParams<{
        dealId?: string
        appId?: string
    }>()

    const model = adminView
        ? getApprovalArtifactByReviewId(appId)
        : getApprovalArtifactByDealId(dealId)

    if (!model) {
        if (adminView) {
            return (
                <AdminLayout
                    title="UNIFIED APPROVAL"
                    subtitle="SHARED SIGNOFF OBJECT"
                >
                    <EmptyState
                        title="Shared approval artifact not available"
                        body="This review is not yet linked to a seeded deal object, so there is no unified approval artifact to render in the admin console."
                        links={[
                            { label: 'Back to application review', to: appId ? `/admin/application-review/${appId}` : '/admin/onboarding-queue' },
                            { label: 'Back to review queue', to: '/admin/onboarding-queue' }
                        ]}
                    />
                </AdminLayout>
            )
        }

        return (
            <div className={pageClass}>
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <EmptyState
                        title="Approval artifact not found"
                        body="The shared deal spine is active, but this approval route could not resolve a seeded deal id."
                        links={[
                            { label: 'Back to evaluation dossier', to: '/deals' }
                        ]}
                    />
                </div>
            </div>
        )
    }

    if (!adminView && model.context.surfaceAvailability.approval === 'placeholder') {
        return <DealRoutePlaceholderPage surface="approval" />
    }

    if (adminView) {
        return (
            <AdminLayout
                title="UNIFIED APPROVAL"
                subtitle="SHARED SIGNOFF OBJECT"
            >
                <ApprovalContent model={model} adminView />
            </AdminLayout>
        )
    }

    return (
        <div className={pageClass}>
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <ApprovalContent model={model} />
            </div>
        </div>
    )
}

function ApprovalContent({
    model,
    adminView = false
}: {
    model: ApprovalArtifactModel
    adminView?: boolean
}) {
    const datasetTitle = model.context.dataset?.title ?? model.context.seed.label
    const datasetDetailPath = `/datasets/${model.context.seed.datasetId}`
    const dealTypeLabel = model.context.routeKind === 'derived' ? 'Generated dataset deal' : 'Configured deal'
    const reviewIdLabel = model.reviewId ?? 'Not linked'
    const connectedLinks = adminView
        ? [
            { label: 'Back to application review', to: `/admin/application-review/${model.reviewId}` },
            { label: 'Open dataset detail', to: datasetDetailPath },
            { label: 'Open provider packet', to: model.context.routeTargets['provider-packet'] },
            { label: 'Open admin audit trail', to: '/admin/audit-trail' }
        ]
        : [
            { label: 'Back to evaluation dossier', to: model.context.routeTargets.dossier },
            { label: 'Open dataset detail', to: datasetDetailPath },
            { label: 'Open provider packet', to: model.context.routeTargets['provider-packet'] },
            { label: 'Open negotiation history', to: model.context.routeTargets.negotiation },
            { label: 'Open output review', to: model.context.routeTargets['output-review'] },
            { label: 'Open residency memo', to: model.context.routeTargets['residency-memo'] },
            { label: 'Open go-live handoff', to: model.context.routeTargets['go-live'] }
        ]
    const conflictModel = buildDealPolicyConflictModel({
        context: model.context,
        surface: 'approval',
        quote: model.context.quote,
        adminView,
        reviewId: model.reviewId
    })

    return (
        <>
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link
                    to={connectedLinks[0].to}
                    className="transition-colors hover:text-white"
                >
                    {connectedLinks[0].label}
                </Link>
                <span>/</span>
                <span className="max-w-full truncate text-slate-200">{datasetTitle}</span>
                <span>/</span>
                <span className="text-slate-200">{model.artifactId}</span>
            </div>

            <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-300/45 bg-cyan-400/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-50 shadow-[0_0_22px_rgba(34,211,238,0.16)]">
                            Unified Approval &amp; Signoff
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {adminView ? 'Admin review-linked artifact' : 'Deal-linked signoff object'}
                        </span>
                    </div>
                    <h1 className="mt-4 max-w-5xl text-3xl font-semibold tracking-tight text-slate-100 sm:text-[2.35rem]">
                        {datasetTitle}
                    </h1>
                    <p className="mt-2 max-w-3xl text-slate-400">
                        One shared artifact binding privacy, legal, governance, provider, and commercial signoff to the same deal, review id, and governed evaluation posture.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                        Dataset id {model.context.seed.datasetId}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                        {model.dealId}
                    </span>
                    {model.reviewId ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {model.reviewId}
                        </span>
                    ) : null}
                    <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${toneClasses[model.overallTone]}`}>
                        {model.overallStatus}
                    </span>
                </div>
            </header>

            <section className="mt-4 grid gap-2 lg:grid-cols-[minmax(0,1.35fr)_repeat(5,minmax(0,1fr))]">
                <IdentityField label="Dataset title" value={datasetTitle} />
                <IdentityField label="Dataset id" value={model.context.seed.datasetId} />
                <IdentityField label="Deal id" value={model.context.seed.dealId} />
                <IdentityField label="Deal type" value={dealTypeLabel} />
                <IdentityField label="Artifact id" value={model.artifactId} />
                <IdentityField label="Review id" value={reviewIdLabel} />
            </section>

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Organization" value={model.organizationName} detail="Primary organization bound to the current approval object" />
                <MetricCard label="Review state" value={model.reviewStatus} detail="Current governance decision posture" />
                <MetricCard label="Packet status" value={model.packetStatus} detail="Review packet and evidence readiness" />
                <MetricCard label="Signed lanes" value={`${model.signedCount}/5`} detail={`${model.blockerCount} blocker${model.blockerCount === 1 ? '' : 's'} still visible`} />
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <article className={panelClass}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Approval summary</div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">{model.title}</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{model.summary}</p>
                        </div>
                        <div className={`rounded-2xl border px-4 py-3 ${toneClasses[model.overallTone]}`}>
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Next action</div>
                            <div className="mt-2 max-w-xs text-sm font-semibold">{model.nextAction}</div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        {connectedLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </article>

                <article className={panelClass}>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Reference ledger</div>
                    <h2 className="mt-2 text-xl font-semibold text-white">Linked ids and artifacts</h2>

                    <div className="mt-5 grid gap-3">
                        {model.references.map(reference => (
                            <div
                                key={`${model.artifactId}-${reference.label}`}
                                className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3"
                            >
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{reference.label}</div>
                                <div className="mt-2 text-sm font-semibold text-slate-100">{reference.value}</div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="mt-8">
                <DealConflictBanner model={conflictModel} />
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <article className={panelClass}>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Shared signoff chain</div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Named signoff lanes</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        Each lane stays tied to a named owner, current status, timestamp, rationale, and visible blockers so buyers, providers, and reviewers can all talk about the same approval object.
                    </p>

                    <div className="mt-5">
                        <SignoffTimeline signoffs={model.signoffs} />
                    </div>
                </article>

                <div className="space-y-6">
                    <article className={panelClass}>
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Rationale summary</div>
                        <h2 className="mt-2 text-xl font-semibold text-white">Why the approval is in this state</h2>

                        <div className="mt-5 space-y-3">
                            {model.rationaleSummary.map(item => (
                                <div
                                    key={`${model.artifactId}-${item}`}
                                    className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4 text-sm leading-6 text-slate-200"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className={panelClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Outstanding blockers</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">What still needs attention</h2>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClasses[model.overallTone]}`}>
                                {model.blockerCount} open
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            {model.outstandingBlockers.length > 0 ? (
                                model.outstandingBlockers.map(item => (
                                    <div
                                        key={`${model.artifactId}-${item}`}
                                        className="rounded-2xl border border-amber-400/20 bg-amber-500/8 px-4 py-4 text-sm leading-6 text-amber-100"
                                    >
                                        {item}
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-emerald-400/18 bg-emerald-500/8 px-4 py-4 text-sm leading-6 text-emerald-100">
                                    No blocker is currently preventing the approval artifact from moving forward.
                                </div>
                            )}
                        </div>
                    </article>
                </div>
            </section>

            {model.approvalMemoPreview ? (
                <section className="mt-8">
                    <article className={panelClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Approval memo preview</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Shared memo artifact</h2>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClasses[model.approvalMemoPreview.tone]}`}>
                                {model.approvalMemoPreview.status}
                            </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-300">
                            The approval memo preview stays attached to the signoff object so the reasoning, blockers, and evidence references remain consistent across workflows.
                        </p>

                        <div className="mt-5">
                            <DealArtifactPreviewGrid artifacts={[model.approvalMemoPreview]} />
                        </div>
                    </article>
                </section>
            ) : null}
        </>
    )
}

function MetricCard({
    label,
    value,
    detail
}: {
    label: string
    value: string
    detail: string
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-3 text-xl font-semibold text-cyan-100">{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </article>
    )
}

function IdentityField({
    label,
    value,
    emphasis = false
}: {
    label: string
    value: string
    emphasis?: boolean
}) {
    return (
        <div
            className={`min-w-0 rounded-2xl border px-3 py-2.5 ${
                emphasis
                    ? 'border-cyan-400/20 bg-cyan-500/8'
                    : 'border-white/8 bg-slate-950/35'
            }`}
        >
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1.5 break-words text-sm font-semibold leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function EmptyState({
    title,
    body,
    links
}: {
    title: string
    body: string
    links: Array<{ label: string; to: string }>
}) {
    return (
        <section className={panelClass}>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                Approval artifact unavailable
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{body}</p>

            <div className="mt-6 flex flex-wrap gap-3">
                {links.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </section>
    )
}
