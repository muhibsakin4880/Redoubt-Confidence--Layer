import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import { SEEDED_DEAL_ROUTES } from '../data/dealDossierData'
import { getDealRouteContextById } from '../domain/dealDossier'
import {
    buildProviderRightsPacket,
    loadProviderPacketDraft,
    saveProviderPacketDraft,
    type ProviderPacketApprover,
    type ProviderPacketApproverStatus,
    type ProviderPacketDraft,
    type ProviderPacketException,
    type ProviderPacketExceptionSeverity
} from '../domain/providerRightsPacket'
import type { DealArtifactPreviewTone } from '../domain/dealArtifactPreview'

type ProviderRightsPacketPageProps = {
    demo?: boolean
}

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function ProviderRightsPacketPage({
    demo = false
}: ProviderRightsPacketPageProps) {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)
    const [draft, setDraft] = useState<ProviderPacketDraft>(() => loadProviderPacketDraft(dealId))
    const [saveState, setSaveState] = useState<string | null>(null)

    useEffect(() => {
        setDraft(loadProviderPacketDraft(dealId))
        setSaveState(null)
    }, [dealId])

    const packet = useMemo(
        () => (context ? buildProviderRightsPacket(context, draft) : null),
        [context, draft]
    )

    if (!context || !packet) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Provider packet not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Unknown deal id</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The provider-packet route is wired, but this seed id does not exist in the current demo workspace.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {SEEDED_DEAL_ROUTES.map(record => (
                                <Link
                                    key={record.dealId}
                                    to={demo ? `/demo/deals/${record.dealId}/provider-packet` : `/deals/${record.dealId}/provider-packet`}
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

    const providerDraftChecks = [
        {
            key: 'publishingAuthorityConfirmed',
            label: 'Publishing authority attested',
            detail: 'Confirms the named authority and publication instrument are ready for buyer view.'
        },
        {
            key: 'useBoundariesConfirmed',
            label: 'Allowed-use boundaries confirmed',
            detail: 'Confirms the packet still matches the current use-rights and delivery restrictions.'
        },
        {
            key: 'residencyRestrictionsConfirmed',
            label: 'Residency restrictions confirmed',
            detail: 'Confirms processing and transfer boundaries are current for this packet.'
        }
    ] as const

    const pendingApprovals = packet.namedApprovers.filter(approver => approver.status !== 'Signed').length
    const datasetDetailPath = buildDatasetAwarePath(`/datasets/${context.seed.datasetId}`, demo)
    const dossierPath = demo ? context.demoTargets.dossier : context.routeTargets.dossier
    const handleSaveDraft = () => {
        if (demo) return
        const nextDraft = saveProviderPacketDraft(context.seed.dealId, {
            ...draft,
            updatedBy: 'Provider operations'
        })
        setDraft(nextDraft)
        setSaveState(`Saved locally ${formatSavedAt(nextDraft.updatedAt)} UTC`)
    }

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
                    <span className="text-slate-200">Provider packet</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {demo ? 'Buyer-view demo snapshot' : 'Buyer-viewable · Provider-editable'}
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Provider Rights & Provenance Packet
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            This shared packet answers the hard buyer question directly: why the provider can publish this dataset, what boundaries still apply, and which caveats remain open before protected evaluation broadens.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <TonePill tone={packet.overallTone} label={packet.overallStatus} />
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {packet.id}
                        </span>
                        {packet.reviewId ? (
                            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                                {packet.reviewId}
                            </span>
                        ) : null}
                    </div>
                </header>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Publishing authority"
                        value={packet.publishingAuthority.status}
                        detail={packet.publishingAuthority.owner}
                        tone={packet.publishingAuthority.tone}
                    />
                    <SummaryCard
                        label="Provenance confidence"
                        value={`${packet.provenance.confidenceScore}%`}
                        detail={packet.provenance.confidenceLabel}
                        tone={packet.provenance.tone}
                    />
                    <SummaryCard
                        label="Geography posture"
                        value={packet.geography.posture}
                        detail={packet.geography.transferReview}
                        tone={packet.geography.tone}
                    />
                    <SummaryCard
                        label="Exceptions"
                        value={`${packet.unresolvedExceptions.length}`}
                        detail={`${pendingApprovals} approver${pendingApprovals === 1 ? '' : 's'} not fully signed`}
                        tone={packet.unresolvedExceptions.length > 0 ? 'amber' : 'emerald'}
                    />
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.26fr_0.74fr]">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Buyer-facing summary</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">{packet.providerInstitution}</h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">{packet.buyerViewSummary}</p>
                                </div>
                                <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Institution type</div>
                                    <div className="mt-2 text-lg font-semibold text-white">{packet.providerType}</div>
                                    <div className="mt-2 text-xs leading-5 text-cyan-100/85">
                                        Provider identity can stay shielded until later approval gates, but publication authority and restrictions are surfaced now.
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link
                                    to={dossierPath}
                                    className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                >
                                    Open evaluation dossier
                                </Link>
                                <Link
                                    to={datasetDetailPath}
                                    className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                >
                                    Return to dataset detail
                                </Link>
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Publishing authority</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Named publication owner</h2>
                                    </div>
                                    <TonePill tone={packet.publishingAuthority.tone} label={packet.publishingAuthority.status} />
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-300">{packet.publishingAuthority.summary}</p>

                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Authority owner" value={packet.publishingAuthority.owner} />
                                    <FieldRow label="Authority role" value={packet.publishingAuthority.role} />
                                    <FieldRow label="Publishing instrument" value={packet.publishingAuthority.instrument} />
                                </div>

                                <div className="mt-5">
                                    <SectionList title="Scope confirmed in this packet" items={packet.publishingAuthority.scope} />
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Source legitimacy</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Provenance and control notes</h2>
                                    </div>
                                    <TonePill tone={packet.provenance.tone} label={packet.provenance.confidenceLabel} />
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-300">{packet.provenance.summary}</p>

                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <SectionList title="Source classes" items={packet.provenance.sourceClasses} />
                                    <SectionList title="Control notes" items={packet.provenance.controlNotes} />
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Allowed-use boundaries</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What the provider is actually offering</h2>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <SectionList title="Allowed use" items={packet.allowedUse.allowed} />
                                    <SectionList title="Prohibited or restricted" items={packet.allowedUse.prohibited} danger />
                                    <SectionList title="Enforced controls" items={packet.allowedUse.controls} />
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Geography and residency</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Where this can and cannot move</h2>
                                    </div>
                                    <TonePill tone={packet.geography.tone} label={packet.geography.posture} />
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <SectionList title="Allowed processing lanes" items={packet.geography.allowedProcessing} />
                                    <SectionList title="Restricted movement" items={packet.geography.restrictedProcessing} danger />
                                </div>

                                <div className={`mt-5 rounded-2xl border px-4 py-3 text-xs leading-5 ${getToneNoteClasses(packet.geography.tone)}`}>
                                    {packet.geography.transferReview}
                                </div>
                            </article>
                        </section>

                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Named approvers</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Who is standing behind the packet</h2>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                    {packet.namedApprovers.length} approvers
                                </span>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {packet.namedApprovers.map(approver => (
                                    <ApproverCard key={`${packet.id}-${approver.role}-${approver.name}`} approver={approver} />
                                ))}
                            </div>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Unresolved exceptions</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">What still needs closure</h2>
                                    </div>
                                    <TonePill
                                        tone={packet.unresolvedExceptions.some(item => item.severity === 'High') ? 'rose' : packet.unresolvedExceptions.length > 0 ? 'amber' : 'emerald'}
                                        label={
                                            packet.unresolvedExceptions.length > 0
                                                ? `${packet.unresolvedExceptions.length} open`
                                                : 'No open exception'
                                        }
                                    />
                                </div>

                                <div className="mt-5 space-y-3">
                                    {packet.unresolvedExceptions.length > 0 ? (
                                        packet.unresolvedExceptions.map(exception => (
                                            <ExceptionCard key={exception.id} exception={exception} />
                                        ))
                                    ) : (
                                        <EmptyStateCopy text="No unresolved provider-side exception is currently attached to this seeded packet." />
                                    )}
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Packet caveats</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What buyers should still read carefully</h2>
                                </div>

                                <div className="mt-5">
                                    <SectionList title="Caveats" items={packet.caveats} danger={packet.overallTone === 'rose'} />
                                </div>
                            </article>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <DealRelationshipRail context={context} demo={demo} />

                        <section className={panelClass}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Packet references</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Evidence anchors</h2>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                    {packet.references.length} refs
                                </span>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {packet.references.map(reference => (
                                    <FieldRow key={`${packet.id}-${reference.label}`} label={reference.label} value={reference.value} />
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                        {demo ? 'Provider snapshot' : 'Provider edit workspace'}
                                    </div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">
                                        {demo ? 'Read-only attestation view' : 'Buyer-visible packet controls'}
                                    </h2>
                                </div>
                                <TonePill tone={packet.overallTone} label={packet.overallStatus} />
                            </div>

                            <div className="mt-5 space-y-3">
                                {providerDraftChecks.map(item => (
                                    <label
                                        key={item.key}
                                        className={`flex gap-3 rounded-2xl border px-4 py-4 ${
                                            draft[item.key]
                                                ? 'border-emerald-400/18 bg-emerald-500/8'
                                                : 'border-white/8 bg-slate-950/45'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            disabled={demo}
                                            checked={draft[item.key]}
                                            onChange={event =>
                                                setDraft(current => ({
                                                    ...current,
                                                    [item.key]: event.target.checked
                                                }))
                                            }
                                            className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-400"
                                        />
                                        <div>
                                            <div className="text-sm font-semibold text-white">{item.label}</div>
                                            <div className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="mt-5">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Working note</div>
                                <textarea
                                    disabled={demo}
                                    value={draft.workingNote}
                                    onChange={event =>
                                        setDraft(current => ({
                                            ...current,
                                            workingNote: event.target.value
                                        }))
                                    }
                                    rows={5}
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400/40 focus:outline-none"
                                    placeholder="Add the latest provider clarification buyers and reviewers should see in this packet."
                                />
                            </div>

                            {demo ? (
                                <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/8 px-4 py-3 text-xs leading-5 text-cyan-100/90">
                                    Demo mode shows the packet as a buyer-view snapshot only. Provider edits remain available on the authenticated workspace route.
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    <button
                                        onClick={handleSaveDraft}
                                        className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
                                    >
                                        Save local packet draft
                                    </button>
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-xs leading-5 text-slate-300">
                                        {saveState ?? `Last draft ${formatSavedAt(draft.updatedAt)} UTC · local-only provider note storage`}
                                    </div>
                                </div>
                            )}
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
    approver: ProviderPacketApprover
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-white">{approver.role}</div>
                    <div className="mt-1 text-xs text-slate-400">
                        {approver.name} · {approver.organization}
                    </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getApproverStatusClasses(approver.status)}`}>
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
    exception: ProviderPacketException
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                    <div className="text-sm font-semibold text-white">{exception.title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">{exception.detail}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getExceptionSeverityClasses(exception.severity)}`}>
                    {exception.severity}
                </span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <FieldRow label="Owner" value={exception.owner} />
                <FieldRow label="Resolution path" value={exception.resolution} />
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

function getApproverStatusClasses(status: ProviderPacketApproverStatus) {
    if (status === 'Signed') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (status === 'In review') return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
}

function getExceptionSeverityClasses(severity: ProviderPacketExceptionSeverity) {
    if (severity === 'High') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (severity === 'Medium') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    return 'border-white/12 bg-white/5 text-slate-200'
}

function buildDatasetAwarePath(to: string, demo: boolean) {
    if (!demo) return to
    if (to.startsWith('/datasets/')) return `/demo${to}`
    return to
}

function formatSavedAt(value?: string) {
    if (!value) return 'Not saved yet'

    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) return value

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    }).format(new Date(parsed)).replace(',', ' ·')
}
