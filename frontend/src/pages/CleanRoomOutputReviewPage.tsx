import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DealArtifactPreviewGrid from '../components/deals/DealArtifactPreviewGrid'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import OutputReviewEventFeed from '../components/deals/OutputReviewEventFeed'
import DealRouteSuggestionLinks from '../components/deals/DealRouteSuggestionLinks'
import { getDealRouteContextById } from '../domain/dealDossier'
import {
    buildOutputReviewModel,
    type OutputReviewCoreState
} from '../domain/outputReview'

type CleanRoomOutputReviewPageProps = {
    demo?: boolean
}

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function CleanRoomOutputReviewPage({
    demo = false
}: CleanRoomOutputReviewPageProps) {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)

    const model = useMemo(
        () => (context ? buildOutputReviewModel(context) : null),
        [context]
    )

    const [selectedState, setSelectedState] = useState<OutputReviewCoreState>('active_session')

    useEffect(() => {
        if (model) {
            setSelectedState(model.currentState)
        }
    }, [model])

    if (!context || !model) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Output review not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Unknown deal id</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The output-review route is wired, but this deal id does not exist in the current workspace.
                        </p>

                        <DealRouteSuggestionLinks surface="output-review" demo={demo} />
                    </section>
                </div>
            </div>
        )
    }

    const selectedEvent =
        model.events.find(event => event.state === selectedState) ?? model.events[0]
    const relatedDossierPath = demo ? context.demoTargets.dossier : context.routeTargets.dossier
    const environmentPath = demo ? '/demo/secure-enclave' : model.session.launchPath
    const escrowPath = buildBuyerAwareRoute(`/datasets/${context.seed.datasetId}/escrow-checkout`, demo)

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link to={demo ? '/demo/deals' : '/deals'} className="transition-colors hover:text-white">
                        Deals
                    </Link>
                    <span>/</span>
                    <span className="text-slate-200">{context.seed.dealId}</span>
                    <span>/</span>
                    <span className="text-slate-200">Output review</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {demo ? 'Public demo output lane' : 'Governed reviewer lane'}
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Clean Room Output Review
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            This is the operational surface between protected evaluation and any output movement: active sessions, blocked export, reviewer queue, extension requests, revocation, dispute freeze, and approved aggregate release all become visible against the same deal object.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <TonePill tone={model.currentStateTone} label={model.currentStateLabel} />
                        {model.reviewId ? (
                            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                                {model.reviewId}
                            </span>
                        ) : null}
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {context.seed.dealId}
                        </span>
                    </div>
                </header>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Session"
                        value={model.session.status}
                        detail={model.session.workspaceName}
                        tone={model.session.tone}
                    />
                    <SummaryCard
                        label="Raw export"
                        value={model.events.find(event => event.state === 'blocked_export')?.status ?? 'Blocked'}
                        detail={model.request.releaseBoundary}
                        tone={model.currentState === 'blocked_export' ? 'cyan' : 'rose'}
                    />
                    <SummaryCard
                        label="Reviewer queue"
                        value={model.request.queueStatus}
                        detail={model.request.reviewerOwner}
                        tone={model.request.queueTone}
                    />
                    <SummaryCard
                        label="Aggregate outcome"
                        value={model.events.find(event => event.state === 'aggregate_approved')?.status ?? 'Pending'}
                        detail={model.request.destination}
                        tone={model.events.find(event => event.state === 'aggregate_approved')?.tone ?? 'slate'}
                    />
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Core state feed</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Operational review sequence</h2>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                                        The feed below makes the hard part legible: the session can be active while raw export stays blocked, the reviewer queue can open for aggregate output, and the same lane can also capture extension requests, revocation, or a dispute-triggered freeze.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        to={relatedDossierPath}
                                        className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                    >
                                        Open evaluation dossier
                                    </Link>
                                    <Link
                                        to={environmentPath}
                                        className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                    >
                                        Open secure environment
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-5">
                                <OutputReviewEventFeed
                                    events={model.events}
                                    selectedState={selectedState}
                                    onSelect={setSelectedState}
                                />
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Selected state</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">{selectedEvent.label}</h2>
                                </div>
                                <TonePill tone={selectedEvent.tone} label={selectedEvent.status} />
                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-300">{selectedEvent.detail}</p>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <FieldRow label="Actor" value={selectedEvent.actor} />
                                <FieldRow label="Recorded at" value={selectedEvent.at} />
                            </div>

                            <div className="mt-5">
                                <ShellList title="Controls attached to this state" items={selectedEvent.controls} />
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Current output request</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Reviewer queue packet</h2>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Artifact" value={model.request.artifactName} />
                                    <FieldRow label="Destination" value={model.request.destination} />
                                    <FieldRow label="Reviewer owner" value={model.request.reviewerOwner} />
                                    <FieldRow label="Queue status" value={model.request.queueStatus} />
                                </div>

                                <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${getToneNoteClasses(model.request.queueTone)}`}>
                                    {model.request.rationale}
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Approved release boundary</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What can leave, if anything</h2>
                                </div>

                                <div className="mt-5">
                                    <ShellList
                                        title="Current release posture"
                                        items={model.approvedHighlights}
                                        danger={model.currentState !== 'aggregate_approved'}
                                    />
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <Link
                                        to={escrowPath}
                                        className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-cyan-400/40 hover:bg-white/5"
                                    >
                                        Open governed checkout
                                    </Link>
                                    <Link
                                        to={buildBuyerAwareRoute('/escrow-center', demo)}
                                        className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-cyan-400/40 hover:bg-white/5"
                                    >
                                        Open escrow center
                                    </Link>
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Latest reviewer decision</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Reviewer action summary</h2>
                                    </div>
                                    <TonePill tone={model.reviewerActionSummary.tone} label={model.reviewerActionSummary.decisionLabel} />
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Reviewer owner" value={model.reviewerActionSummary.reviewerOwner} />
                                    <FieldRow label="Recorded at" value={model.reviewerActionSummary.recordedAt} />
                                    <FieldRow label="Next action" value={model.reviewerActionSummary.nextAction} />
                                </div>

                                <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${getToneNoteClasses(model.reviewerActionSummary.tone)}`}>
                                    {model.reviewerActionSummary.rationale}
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Intervention lane</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Session intervention</h2>
                                    </div>
                                    <TonePill tone={model.sessionControl.tone} label={model.sessionControl.posture} />
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Control owner" value={model.sessionControl.owner} />
                                    {model.extensionRequest ? (
                                        <>
                                            <FieldRow label="Requester" value={model.extensionRequest.requester} />
                                            <FieldRow label="Requested window" value={model.extensionRequest.requestedWindow} />
                                            <FieldRow label="Extension status" value={model.extensionRequest.status} />
                                        </>
                                    ) : null}
                                    {model.sessionControl.revocationReason ? (
                                        <FieldRow label="Revocation reason" value={model.sessionControl.revocationReason} />
                                    ) : null}
                                    {model.sessionControl.freezeReason ? (
                                        <FieldRow label="Freeze reason" value={model.sessionControl.freezeReason} />
                                    ) : null}
                                </div>

                                {model.extensionRequest ? (
                                    <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${getToneNoteClasses(model.extensionRequest.tone)}`}>
                                        {model.extensionRequest.reason} {model.extensionRequest.reviewerDisposition}
                                    </div>
                                ) : (
                                    <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${getToneNoteClasses(model.sessionControl.tone)}`}>
                                        {model.sessionControl.note}
                                    </div>
                                )}
                            </article>
                        </section>

                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Output artifacts</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Reviewer-linked note previews</h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                                        These previews make the operational documents visible without pretending to be full document viewers: export review note, extension handling, and freeze or revocation summaries.
                                    </p>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                    {model.artifactPreviews.length} artifact{model.artifactPreviews.length === 1 ? '' : 's'}
                                </span>
                            </div>

                            <div className="mt-5">
                                <DealArtifactPreviewGrid artifacts={model.artifactPreviews} />
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <DealRelationshipRail context={context} demo={demo} />

                        <section className={panelClass}>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Session control snapshot</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Effective session envelope</h2>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <FieldRow label="Session id" value={model.session.sessionId} />
                                <FieldRow label="Named analyst" value={model.session.analyst} />
                                <FieldRow label="Participant" value={model.session.participant} />
                                <FieldRow label="Session posture" value={model.sessionControl.posture} />
                                <FieldRow label="Credential" value={model.session.credentialLabel} />
                                <FieldRow label="Issued" value={model.session.issuedAt} />
                                <FieldRow label="Expires" value={model.session.expiresAt} />
                            </div>

                            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${getToneNoteClasses(model.sessionControl.tone)}`}>
                                Review window {model.session.reviewWindowLabel} · the output lane stays tied to the same named-analyst session instead of becoming a separate uncontrolled path. {model.sessionControl.note}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Watermark and audit trace</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Output provenance</h2>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <FieldRow label="Watermark id" value={model.watermark.watermarkId} />
                                <FieldRow label="Trace status" value={model.watermark.traceStatus} />
                                <FieldRow label="Reviewer linkage" value={model.watermark.reviewLinkage} />
                                <FieldRow label="Audit pointer" value={model.watermark.auditPointer} />
                            </div>

                            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${getToneNoteClasses(model.currentStateTone)}`}>
                                {model.watermark.traceSummary}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Control rows</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Reviewer-visible policy context</h2>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {model.controlRows.map(row => (
                                    <FieldRow key={`${row.label}-${row.value}`} label={row.label} value={row.value} />
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
    tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose'
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

function ShellList({
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

function TonePill({
    tone,
    label
}: {
    tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose'
    label: string
}) {
    return (
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getToneBadgeClasses(tone)}`}>
            {label}
        </span>
    )
}

function getToneClass(tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose') {
    if (tone === 'rose') return 'text-rose-200'
    if (tone === 'amber') return 'text-amber-200'
    if (tone === 'emerald') return 'text-emerald-200'
    if (tone === 'cyan') return 'text-cyan-200'
    return 'text-slate-200'
}

function getToneBadgeClasses(tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose') {
    if (tone === 'rose') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    return 'border-white/12 bg-white/5 text-slate-200'
}

function getToneNoteClasses(tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose') {
    if (tone === 'rose') return 'border-rose-400/22 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/22 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/22 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/22 bg-cyan-500/10 text-cyan-100'
    return 'border-white/10 bg-white/5 text-slate-300'
}

function buildBuyerAwareRoute(to: string, demo: boolean) {
    if (!demo) return to
    if (to.startsWith('/datasets/')) return `/demo${to}`
    if (to === '/escrow-center') return '/demo/escrow-center'
    return to
}
