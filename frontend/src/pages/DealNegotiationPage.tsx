import { Link, useParams } from 'react-router-dom'
import NegotiationThreadPanel from '../components/deals/NegotiationThreadPanel'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import DealRouteSuggestionLinks from '../components/deals/DealRouteSuggestionLinks'
import { getDealRouteContextById } from '../domain/dealDossier'
import DealRoutePlaceholderPage from './DealRoutePlaceholderPage'
import {
    buildNegotiationThread,
    type NegotiationOpenItem,
    type NegotiationRedline,
    type NegotiationScopeChange
} from '../domain/negotiationThread'
import type { DealArtifactPreviewTone } from '../domain/dealArtifactPreview'

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function DealNegotiationPage() {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)

    if (!context) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Negotiation thread not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Unknown deal id</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The clarification and negotiation route is wired, but this deal id does not exist in the current workspace.
                        </p>

                        <DealRouteSuggestionLinks surface="negotiation" />
                    </section>
                </div>
            </div>
        )
    }

    if (context.surfaceAvailability.negotiation === 'placeholder') {
        return <DealRoutePlaceholderPage surface="negotiation" />
    }

    const thread = buildNegotiationThread(context)
    const connectedLinks = [
        { label: 'Back to evaluation dossier', to: context.routeTargets.dossier },
        context.request ? { label: 'Open access request detail', to: `/access-requests/${context.request.id}` } : null,
        { label: 'Open provider packet', to: context.routeTargets['provider-packet'] },
        { label: 'Open approval artifact', to: context.routeTargets.approval }
    ].filter((item): item is { label: string; to: string } => Boolean(item))

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
                    <span className="text-slate-200">Negotiation</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Deal-linked clarification history
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Clarification &amp; Negotiation History
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            One structured log for buyer questions, provider clarifications, scope deltas, and redlines so the deal reads like a negotiated evaluation object instead of a set of disconnected comments.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                            {thread.threadId}
                        </span>
                        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getToneClasses(thread.overallTone)}`}>
                            {thread.overallStatus}
                        </span>
                    </div>
                </header>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {thread.metrics.map(metric => (
                        <SummaryCard
                            key={`${thread.threadId}-${metric.label}`}
                            label={metric.label}
                            value={metric.value}
                            detail={metric.detail}
                            tone={metric.tone}
                        />
                    ))}
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Negotiation summary</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">{context.seed.label}</h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">{thread.summary}</p>
                                </div>
                                <div className={`rounded-2xl border px-4 py-3 ${getToneClasses(thread.overallTone)}`}>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Next action</div>
                                    <div className="mt-2 max-w-xs text-sm font-semibold">{thread.nextAction}</div>
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

                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                {thread.participantSummary.map(item => (
                                    <div
                                        key={`${thread.threadId}-${item}`}
                                        className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4 text-sm leading-6 text-slate-200"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Negotiation log</div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">Structured Q/A and clarification thread</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Questions, provider clarifications, redlines, scope changes, and resolutions all stay in one visible sequence so each hard discussion is attached to the deal.
                            </p>

                            <div className="mt-5">
                                <NegotiationThreadPanel entries={thread.entries} />
                            </div>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-2">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Scope changes</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">First-class scope history</h2>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                        {thread.scopeChanges.length} tracked
                                    </span>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {thread.scopeChanges.map(item => (
                                        <ScopeChangeCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Redline ledger</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Commercial and policy edits</h2>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                        {thread.redlines.length} active
                                    </span>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {thread.redlines.map(item => (
                                        <RedlineCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </article>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Open clarifications</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What still needs closure</h2>
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getToneClasses(thread.overallTone)}`}>
                                    {thread.openItems.length} visible
                                </span>
                            </div>

                            <div className="mt-5 space-y-3">
                                {thread.openItems.map(item => (
                                    <OpenItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Resolved items</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">What has already been settled</h2>

                            <div className="mt-5 space-y-3">
                                {thread.resolvedItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-emerald-400/18 bg-emerald-500/8 px-4 py-4"
                                    >
                                        <div className="text-sm font-semibold text-white">{item.title}</div>
                                        <div className="mt-2 text-xs leading-5 text-slate-400">
                                            {item.resolvedBy} · {item.resolvedAt}
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-emerald-100">{item.resolution}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <DealRelationshipRail context={context} />
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
            <div className={`mt-3 text-xl font-semibold ${getToneTextClass(tone)}`}>{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </article>
    )
}

function ScopeChangeCard({
    item
}: {
    item: NegotiationScopeChange
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-400">
                        {item.owner} · {item.at}
                    </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getScopeStatusClasses(item.status)}`}>
                    {item.status}
                </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{item.summary}</p>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <DeltaPanel label="From" value={item.from} />
                <DeltaPanel label="To" value={item.to} />
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-500/18 bg-cyan-500/8 px-4 py-3 text-sm leading-6 text-cyan-100">
                {item.impact}
            </div>
        </div>
    )
}

function RedlineCard({
    item
}: {
    item: NegotiationRedline
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                    <div className="text-sm font-semibold text-white">{item.clause}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-400">
                        {item.owner} · {item.at}
                    </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getRedlineStatusClasses(item.status)}`}>
                    {item.status}
                </span>
            </div>

            <div className="mt-4 grid gap-3">
                <DeltaPanel label="Requested change" value={item.requestedChange} />
                <DeltaPanel label="Provider response" value={item.providerResponse} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-3 text-xs leading-5 text-slate-300">
                Linked control: {item.linkedControl}
            </div>
        </div>
    )
}

function OpenItemCard({
    item
}: {
    item: NegotiationOpenItem
}) {
    return (
        <div className={`rounded-2xl border px-4 py-4 ${getToneClasses(item.tone)}`}>
            <div className="text-sm font-semibold text-white">{item.title}</div>
            <div className="mt-2 text-xs leading-5 text-slate-200">
                {item.owner}
            </div>
            <p className="mt-3 text-sm leading-6">{item.detail}</p>
        </div>
    )
}

function DeltaPanel({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function getToneClasses(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    return 'border-white/10 bg-white/5 text-slate-200'
}

function getToneTextClass(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'text-rose-100'
    if (tone === 'amber') return 'text-amber-100'
    if (tone === 'emerald') return 'text-emerald-100'
    if (tone === 'cyan') return 'text-cyan-100'
    return 'text-slate-100'
}

function getScopeStatusClasses(status: NegotiationScopeChange['status']) {
    if (status === 'Accepted') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (status === 'Needs review') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
}

function getRedlineStatusClasses(status: NegotiationRedline['status']) {
    if (status === 'Provider accepted') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (status === 'Countered') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
}
