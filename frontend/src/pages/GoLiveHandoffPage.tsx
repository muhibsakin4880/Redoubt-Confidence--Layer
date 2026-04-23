import { Link, useParams } from 'react-router-dom'
import DealArtifactPreviewGrid from '../components/deals/DealArtifactPreviewGrid'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import DealRouteSuggestionLinks from '../components/deals/DealRouteSuggestionLinks'
import { getDealRouteContextById } from '../domain/dealDossier'
import { buildGoLiveHandoff } from '../domain/deploymentDecisionMemo'
import type { DealArtifactPreviewTone } from '../domain/dealArtifactPreview'
import DealRoutePlaceholderPage from './DealRoutePlaceholderPage'

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function GoLiveHandoffPage() {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)
    const isPlaceholder = context?.surfaceAvailability['go-live'] === 'placeholder'
    const model = context && !isPlaceholder ? buildGoLiveHandoff(context) : null

    if (context && isPlaceholder) {
        return <DealRoutePlaceholderPage surface="go-live" />
    }

    if (!context || !model) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Go-live handoff not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Unknown deal id</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The go-live route is wired, but this deal id does not exist in the current workspace.
                        </p>

                        <DealRouteSuggestionLinks surface="go-live" />
                    </section>
                </div>
            </div>
        )
    }

    const datasetTitle = context.dataset?.title ?? context.seed.label
    const datasetDetailPath = `/datasets/${context.seed.datasetId}`
    const dealTypeLabel = context.routeKind === 'derived' ? 'Generated dataset deal' : 'Configured deal'

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <Link to="/deals" className="transition-colors hover:text-white">
                        Deals
                    </Link>
                    <span>/</span>
                    <span className="text-slate-200">{context.seed.dealId}</span>
                    <span>/</span>
                    <span className="max-w-full truncate text-slate-200">{datasetTitle}</span>
                    <span>/</span>
                    <span className="text-slate-200">Go-live</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-cyan-300/45 bg-cyan-400/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-50 shadow-[0_0_22px_rgba(34,211,238,0.16)]">
                                Production Expansion &amp; Go-Live
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                Production transition handoff
                            </span>
                        </div>
                        <h1 className="mt-4 max-w-5xl text-3xl font-semibold tracking-tight text-slate-100 sm:text-[2.35rem]">
                            {datasetTitle}
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            This is the page enterprise buyers expect after a successful evaluation: it shows the rights amendment, the production deployment path, the API control model, pricing posture, and the named operational handoff instead of hand-waving at a future backend.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <TonePill tone={model.readinessTone} label={model.readinessLabel} />
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            Dataset id {context.seed.datasetId}
                        </span>
                        {model.reviewId ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                                {model.reviewId}
                            </span>
                        ) : null}
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {model.handoffId}
                        </span>
                    </div>
                </header>

                <section className="mt-4 grid gap-2 lg:grid-cols-[minmax(0,1.35fr)_repeat(5,minmax(0,1fr))]">
                    <IdentityField label="Dataset title" value={datasetTitle} />
                    <IdentityField label="Dataset id" value={context.seed.datasetId} />
                    <IdentityField label="Deal id" value={context.seed.dealId} />
                    <IdentityField label="Deal type" value={dealTypeLabel} />
                    <IdentityField label="Handoff id" value={model.handoffId} />
                    <IdentityField label="Review id" value={model.reviewId ?? 'Not linked'} />
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Readiness"
                        value={model.readinessLabel}
                        detail={model.summary}
                        tone={model.readinessTone}
                    />
                    <SummaryCard
                        label="Rights amendment"
                        value={model.rightsAmendment.status}
                        detail={model.rightsAmendment.summary}
                        tone={model.rightsAmendment.tone}
                    />
                    <SummaryCard
                        label="Pricing tier"
                        value={model.pricingTier.label}
                        detail={model.pricingTier.referenceValue}
                        tone="cyan"
                    />
                    <SummaryCard
                        label="Workstreams"
                        value={`${model.workstreams.length}`}
                        detail={model.nextAction}
                        tone={model.blockers.length > 0 ? 'amber' : 'emerald'}
                    />
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Go-live summary</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">{model.title}</h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">{model.summary}</p>
                                </div>
                                <div className={`rounded-2xl border px-4 py-3 ${getToneNoteClasses(model.readinessTone)}`}>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Next action</div>
                                    <div className="mt-2 max-w-xs text-sm font-semibold text-white">{model.nextAction}</div>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link
                                    to={datasetDetailPath}
                                    className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                >
                                    Open dataset detail
                                </Link>
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
                                    to={context.routeTargets['residency-memo']}
                                    className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                >
                                    Open residency memo
                                </Link>
                                <Link
                                    to={context.routeTargets['provider-packet']}
                                    className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                >
                                    Open provider packet
                                </Link>
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Rights amendment</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">How evaluation becomes production</h2>
                                    </div>
                                    <TonePill tone={model.rightsAmendment.tone} label={model.rightsAmendment.status} />
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-300">{model.rightsAmendment.summary}</p>
                                <div className="mt-5">
                                    <SectionList title="Amendment details" items={model.rightsAmendment.highlights} />
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Pricing and commercial tier</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Commercial transition</h2>
                                </div>
                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Pricing tier" value={model.pricingTier.label} />
                                    <FieldRow label="Current price reference" value={model.pricingTier.referenceValue} />
                                </div>
                                <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/8 px-4 py-3 text-sm leading-6 text-cyan-100">
                                    {model.pricingTier.detail}
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Deployment model</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Production tenancy and controls</h2>
                                </div>
                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Production lane" value={model.deploymentModel.label} />
                                    <FieldRow label="Deployment note" value={model.deploymentModel.detail} />
                                </div>
                                <div className="mt-5">
                                    <SectionList title="Carry-forward controls" items={model.deploymentModel.controls} />
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">API and production controls</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Operational control surface</h2>
                                </div>
                                <div className="mt-5">
                                    <SectionList title="API and run-control expectations" items={model.apiControls} />
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Operational handoff</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Named go-live workstreams</h2>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                        {model.workstreams.length} workstreams
                                    </span>
                                </div>
                                <div className="mt-5 space-y-3">
                                    {model.workstreams.map(workstream => (
                                        <WorkstreamCard key={`${workstream.title}-${workstream.owner}`} workstream={workstream} />
                                    ))}
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Handoff artifacts</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Proof carried into production</h2>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                        {model.artifacts.length} previews
                                    </span>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-300">
                                    The go-live handoff stays believable because it inherits real proof surfaces: a handoff memo preview, the approval memo, and the DUA snapshot that anchored the governed evaluation.
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
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Current blockers</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Why this is or is not ready</h2>
                                </div>
                                <TonePill
                                    tone={model.blockers.length > 0 ? 'amber' : 'emerald'}
                                    label={model.blockers.length > 0 ? `${model.blockers.length} blocker${model.blockers.length === 1 ? '' : 's'}` : 'No open blocker'}
                                />
                            </div>
                            <div className="mt-5 space-y-3">
                                {model.blockers.length > 0 ? (
                                    model.blockers.map(blocker => (
                                        <div
                                            key={blocker}
                                            className="rounded-2xl border border-amber-400/20 bg-amber-500/8 px-4 py-4 text-sm leading-6 text-amber-100"
                                        >
                                            {blocker}
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-emerald-400/18 bg-emerald-500/8 px-4 py-4 text-sm leading-6 text-emerald-100">
                                        No blocker currently prevents this deal from moving into a controlled production handoff.
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Handoff references</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Shared ids and anchors</h2>
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

function IdentityField({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="min-w-0 rounded-2xl border border-white/8 bg-slate-950/35 px-3 py-2.5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1.5 break-words text-sm font-semibold leading-6 text-slate-100">{value}</div>
        </div>
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
    items
}: {
    title: string
    items: string[]
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</div>
            <div className="mt-3 space-y-2">
                {items.map(item => (
                    <div key={`${title}-${item}`} className="flex gap-2 text-sm leading-6 text-slate-200">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function WorkstreamCard({
    workstream
}: {
    workstream: {
        title: string
        owner: string
        status: 'Ready' | 'In progress' | 'Blocked'
        detail: string
    }
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-white">{workstream.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{workstream.owner}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getWorkstreamClasses(workstream.status)}`}>
                    {workstream.status}
                </span>
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-300">{workstream.detail}</div>
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

function getWorkstreamClasses(status: 'Ready' | 'In progress' | 'Blocked') {
    if (status === 'Ready') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (status === 'Blocked') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
}
