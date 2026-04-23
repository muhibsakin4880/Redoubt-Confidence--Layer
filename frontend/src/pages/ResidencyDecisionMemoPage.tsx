import { Link, useParams } from 'react-router-dom'
import DealArtifactPreviewGrid from '../components/deals/DealArtifactPreviewGrid'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import { SEEDED_DEAL_ROUTES } from '../data/dealDossierData'
import { getDealRouteContextById } from '../domain/dealDossier'
import { buildResidencyDecisionMemo } from '../domain/deploymentDecisionMemo'
import type { DealArtifactPreviewTone } from '../domain/dealArtifactPreview'

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function ResidencyDecisionMemoPage() {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)
    const model = context ? buildResidencyDecisionMemo(context) : null

    if (!context || !model) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Residency memo not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Unknown deal id</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The residency-memo route is wired, but this seed id does not exist in the current workspace.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {SEEDED_DEAL_ROUTES.map(record => (
                                <Link
                                    key={record.dealId}
                                    to={`/deals/${record.dealId}/residency-memo`}
                                    className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    {record.dealId} · {record.label}
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link to="/deals" className="transition-colors hover:text-white">
                        Deals
                    </Link>
                    <span>/</span>
                    <span className="text-slate-200">{context.seed.dealId}</span>
                    <span>/</span>
                    <span className="text-slate-200">Residency memo</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Per-deal deployment decision
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Residency &amp; Deployment Decision Memo
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            This memo turns generic residency language into a specific per-deal operating decision: where the data can be processed, what remains blocked, who approved the path, and which exceptions still keep the deployment story constrained.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <TonePill tone={model.decisionTone} label={model.decisionLabel} />
                        {model.reviewId ? (
                            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                                {model.reviewId}
                            </span>
                        ) : null}
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {model.memoId}
                        </span>
                    </div>
                </header>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Decision"
                        value={model.decisionLabel}
                        detail={model.summary}
                        tone={model.decisionTone}
                    />
                    <SummaryCard
                        label="Approved lanes"
                        value={`${model.approvedProcessingLanes.length}`}
                        detail={model.allowedDeploymentPath}
                        tone={model.decisionTone === 'rose' ? 'amber' : 'emerald'}
                    />
                    <SummaryCard
                        label="Blocked paths"
                        value={`${model.blockedProcessingLanes.length}`}
                        detail={model.blockedDeploymentPath}
                        tone={model.blockedProcessingLanes.length > 0 ? 'rose' : 'slate'}
                    />
                    <SummaryCard
                        label="Exceptions"
                        value={`${model.exceptions.length}`}
                        detail={model.nextAction}
                        tone={model.exceptions.length > 0 ? 'amber' : 'emerald'}
                    />
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Decision summary</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">{model.title}</h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">{model.summary}</p>
                                </div>
                                <div className={`rounded-2xl border px-4 py-3 ${getToneNoteClasses(model.decisionTone)}`}>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Next action</div>
                                    <div className="mt-2 max-w-xs text-sm font-semibold text-white">{model.nextAction}</div>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link
                                    to={context.routeTargets.dossier}
                                    className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                >
                                    Open evaluation dossier
                                </Link>
                                <Link
                                    to={context.routeTargets.approval}
                                    className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                >
                                    Open approval artifact
                                </Link>
                                <Link
                                    to={context.routeTargets['provider-packet']}
                                    className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                >
                                    Open provider packet
                                </Link>
                                <Link
                                    to={context.routeTargets['go-live']}
                                    className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                >
                                    Open go-live handoff
                                </Link>
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Approved processing lanes</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What the platform can support</h2>
                                </div>
                                <div className="mt-5">
                                    <SectionList title="Approved path" items={model.approvedProcessingLanes} />
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Blocked movement</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What still cannot happen</h2>
                                </div>
                                <div className="mt-5">
                                    <SectionList title="Blocked or constrained path" items={model.blockedProcessingLanes} danger />
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Deployment decision</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Named operating path</h2>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Allowed deployment path" value={model.allowedDeploymentPath} />
                                    <FieldRow label="Blocked deployment path" value={model.blockedDeploymentPath} />
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Named approvers</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Who approved the path</h2>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                        {model.approvers.length} lanes
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3">
                                    {model.approvers.map(approver => (
                                        <ApproverCard
                                            key={`${approver.lane}-${approver.owner}`}
                                            approver={approver}
                                        />
                                    ))}
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Exceptions</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Open residency issues</h2>
                                    </div>
                                    <TonePill
                                        tone={model.exceptions.some(exception => exception.severity === 'High') ? 'rose' : model.exceptions.length > 0 ? 'amber' : 'emerald'}
                                        label={model.exceptions.length > 0 ? `${model.exceptions.length} open` : 'No open exception'}
                                    />
                                </div>

                                <div className="mt-5 space-y-3">
                                    {model.exceptions.length > 0 ? (
                                        model.exceptions.map(exception => (
                                            <ExceptionCard
                                                key={`${exception.title}-${exception.owner}`}
                                                exception={exception}
                                            />
                                        ))
                                    ) : (
                                        <EmptyStateCopy text="No seeded residency exception remains open on this deal." />
                                    )}
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Memo artifacts</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Decision proof previews</h2>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                        {model.artifacts.length} previews
                                    </span>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-300">
                                    The memo is backed by artifact previews instead of abstract claims: the residency memo, the approval memo, and the linked evidence surface stay visible on the same page.
                                </p>
                                <div className="mt-5">
                                    <DealArtifactPreviewGrid artifacts={model.artifacts} />
                                </div>
                            </article>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <DealRelationshipRail context={context} />

                        <section className={panelClass}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Memo references</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Decision anchors</h2>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                    {model.references.length} refs
                                </span>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {model.references.map(reference => (
                                    <FieldRow
                                        key={`${reference.label}-${reference.value}`}
                                        label={reference.label}
                                        value={reference.value}
                                    />
                                ))}
                            </div>
                        </section>
                    </aside>
                </section>
            </div>
        </div>
    )
}

function SummaryCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: DealArtifactPreviewTone
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-3 text-xl font-semibold ${getToneClass(tone)}`}>{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </article>
    )
}

function FieldRow({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function SectionList({
    title,
    items,
    danger = false
}: {
    title: string
    items: string[]
    danger?: boolean
}) {
    return (
        <div className={`rounded-2xl border px-4 py-4 ${danger ? 'border-rose-500/20 bg-rose-500/8' : 'border-white/8 bg-slate-950/45'}`}>
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</div>
            <div className="mt-3 space-y-2">
                {items.map(item => (
                    <div key={`${title}-${item}`} className="flex gap-2 text-sm leading-6 text-slate-200">
                        <span className={`mt-2 h-1.5 w-1.5 rounded-full ${danger ? 'bg-rose-300' : 'bg-cyan-300'}`} />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ApproverCard({
    approver
}: {
    approver: {
        lane: string
        owner: string
        status: string
        note: string
    }
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-white">{approver.lane}</div>
                    <div className="mt-1 text-xs text-slate-400">{approver.owner}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getStatusBadgeClasses(approver.status)}`}>
                    {approver.status}
                </span>
            </div>
            <div className="mt-3 text-xs leading-5 text-slate-300">{approver.note}</div>
        </div>
    )
}

function ExceptionCard({
    exception
}: {
    exception: {
        title: string
        severity: string
        owner: string
        resolution: string
    }
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                    <div className="text-sm font-semibold text-white">{exception.title}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-400">Owner {exception.owner}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getSeverityClasses(exception.severity)}`}>
                    {exception.severity}
                </span>
            </div>
            <div className="mt-3 rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-3 text-sm leading-6 text-slate-200">
                {exception.resolution}
            </div>
        </div>
    )
}

function EmptyStateCopy({
    text
}: {
    text: string
}) {
    return (
        <div className="rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-4 py-5 text-sm leading-6 text-slate-400">
            {text}
        </div>
    )
}

function TonePill({
    tone,
    label
}: {
    tone: DealArtifactPreviewTone
    label: string
}) {
    return (
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getToneBadgeClasses(tone)}`}>
            {label}
        </span>
    )
}

function getToneClass(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'text-rose-200'
    if (tone === 'amber') return 'text-amber-200'
    if (tone === 'emerald') return 'text-emerald-200'
    if (tone === 'cyan') return 'text-cyan-200'
    return 'text-slate-200'
}

function getToneBadgeClasses(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    return 'border-white/12 bg-white/5 text-slate-200'
}

function getToneNoteClasses(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'border-rose-400/22 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/22 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/22 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/22 bg-cyan-500/10 text-cyan-100'
    return 'border-white/10 bg-white/5 text-slate-300'
}

function getSeverityClasses(severity: string) {
    if (severity === 'High') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (severity === 'Medium') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    return 'border-white/12 bg-white/5 text-slate-200'
}

function getStatusBadgeClasses(status: string) {
    if (status === 'Signed') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (status === 'Blocked') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (status === 'In review') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    return 'border-white/12 bg-white/5 text-slate-200'
}
