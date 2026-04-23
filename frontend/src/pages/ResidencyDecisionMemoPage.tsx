import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import DealArtifactPreviewGrid from '../components/deals/DealArtifactPreviewGrid'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import DealRouteSuggestionLinks from '../components/deals/DealRouteSuggestionLinks'
import { getDealRouteContextById } from '../domain/dealDossier'
import {
    buildResidencyDecisionMemo,
    type ResidencyMemoApprover,
    type ResidencyMemoException
} from '../domain/deploymentDecisionMemo'
import type { DealArtifactPreviewTone } from '../domain/dealArtifactPreview'
import DealRoutePlaceholderPage from './DealRoutePlaceholderPage'

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl'

export default function ResidencyDecisionMemoPage() {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)
    const isPlaceholder = context?.surfaceAvailability['residency-memo'] === 'placeholder'
    const model = context && !isPlaceholder ? buildResidencyDecisionMemo(context) : null

    if (context && isPlaceholder) {
        return <DealRoutePlaceholderPage surface="residency-memo" />
    }

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
                            The residency-memo route is wired, but this deal id does not exist in the current workspace.
                        </p>

                        <DealRouteSuggestionLinks surface="residency-memo" />
                    </section>
                </div>
            </div>
        )
    }

    const exceptionTone = getExceptionTone(model.exceptions)
    const decisionOwner =
        model.exceptions[0]?.owner ??
        model.approvers.find(approver => approver.status !== 'Signed')?.owner ??
        'Residency operations'
    const datasetTitle = context.dataset?.title ?? context.seed.label
    const datasetDetailPath = `/datasets/${context.seed.datasetId}`
    const dealTypeLabel = context.routeKind === 'derived' ? 'Generated dataset deal' : 'Configured deal'

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <Link to="/deals" className="transition-colors hover:text-white">
                        Deals
                    </Link>
                    <span>/</span>
                    <span className="text-slate-200">{context.seed.dealId}</span>
                    <span>/</span>
                    <span className="max-w-full truncate text-slate-200">{datasetTitle}</span>
                    <span>/</span>
                    <span className="text-slate-200">Residency memo</span>
                </div>

                <section className={`${panelClass} mt-5 overflow-hidden border-cyan-400/18 bg-[#07101d]/94 p-0`}>
                    <div className="grid xl:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="p-6 lg:p-7">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                                    Executive decision memo
                                </span>
                                <TonePill tone={model.decisionTone} label={model.decisionLabel} />
                                <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                                    {model.memoId}
                                </span>
                            </div>

                            <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/70">
                                Residency &amp; Deployment Decision Memo
                            </div>
                            <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                {datasetTitle}
                            </h1>
                            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                                {model.summary}
                            </p>

                            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_repeat(4,minmax(0,1fr))]">
                                <IdentityField label="Dataset title" value={datasetTitle} emphasis />
                                <IdentityField label="Dataset id" value={context.seed.datasetId} />
                                <IdentityField label="Deal id" value={context.seed.dealId} />
                                <IdentityField label="Deal type" value={dealTypeLabel} />
                                <IdentityField label="Memo id" value={model.memoId} />
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                                <MetricTile
                                    label="Approved lanes"
                                    value={`${model.approvedProcessingLanes.length}`}
                                    detail={model.allowedDeploymentPath}
                                    tone="emerald"
                                />
                                <MetricTile
                                    label="Blocked paths"
                                    value={`${model.blockedProcessingLanes.length}`}
                                    detail={model.blockedDeploymentPath}
                                    tone={model.blockedProcessingLanes.length > 0 ? 'rose' : 'slate'}
                                />
                                <MetricTile
                                    label="Open exceptions"
                                    value={`${model.exceptions.length}`}
                                    detail={model.exceptions[0]?.owner ?? 'No open exception owner'}
                                    tone={exceptionTone}
                                />
                            </div>
                        </div>

                        <aside className="border-t border-white/10 bg-slate-950/45 p-6 xl:border-l xl:border-t-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Next required action
                            </div>
                            <div className="mt-3 text-xl font-semibold leading-8 text-white">
                                {model.nextAction}
                            </div>
                            <div className="mt-5 grid gap-3">
                                <FieldRow label="Owner" value={decisionOwner} />
                                <FieldRow label="Review id" value={model.reviewId ?? 'Not linked'} />
                                <FieldRow label="Deal id" value={model.dealId} />
                                <Link
                                    to={datasetDetailPath}
                                    className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                >
                                    Open dataset detail
                                </Link>
                            </div>
                        </aside>
                    </div>
                </section>

                <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <main className="space-y-5">
                        <section className={panelClass}>
                            <SectionHeader
                                eyebrow="Blocking conditions"
                                title="Open exceptions and release blockers"
                                action={<TonePill tone={exceptionTone} label={model.exceptions.length > 0 ? `${model.exceptions.length} open` : 'Clear'} />}
                            />
                            <div className="mt-5">
                                {model.exceptions.length > 0 ? (
                                    <div className="grid gap-3 lg:grid-cols-2">
                                        {model.exceptions.map(exception => (
                                            <ExceptionCard
                                                key={`${exception.title}-${exception.owner}`}
                                                exception={exception}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyStateCopy text="No seeded residency exception remains open on this deal." />
                                )}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <SectionHeader
                                eyebrow="Operating path"
                                title="Approved lanes vs blocked movement"
                                action={<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">Decision comparison</span>}
                            />
                            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                <PathDecisionPanel
                                    title="Approved operating lanes"
                                    status="Allowed"
                                    tone="emerald"
                                    pathLabel="Allowed deployment path"
                                    pathValue={model.allowedDeploymentPath}
                                    items={model.approvedProcessingLanes}
                                />
                                <PathDecisionPanel
                                    title="Blocked or constrained paths"
                                    status="Blocked"
                                    tone="rose"
                                    pathLabel="Blocked deployment path"
                                    pathValue={model.blockedDeploymentPath}
                                    items={model.blockedProcessingLanes}
                                />
                            </div>
                        </section>

                        <section className={panelClass}>
                            <SectionHeader
                                eyebrow="Formal signoff"
                                title="Residency approval matrix"
                                action={<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">{model.approvers.length} lanes</span>}
                            />
                            <div className="mt-5 overflow-hidden rounded-2xl border border-white/8">
                                <div className="grid grid-cols-[1fr_1fr_120px_1.35fr] gap-0 border-b border-white/8 bg-slate-950/55 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 max-lg:hidden">
                                    <div>Lane</div>
                                    <div>Owner</div>
                                    <div>Status</div>
                                    <div>Note</div>
                                </div>
                                <div className="divide-y divide-white/8">
                                    {model.approvers.map(approver => (
                                        <ApproverMatrixRow
                                            key={`${approver.lane}-${approver.owner}`}
                                            approver={approver}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </main>

                    <aside className="space-y-5">
                        <section className={panelClass}>
                            <SectionHeader eyebrow="Linked objects" title="Decision anchors" />
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

                        <section className={panelClass}>
                            <SectionHeader eyebrow="Related routes" title="Open connected surfaces" />
                            <div className="mt-5 grid gap-2">
                                <RouteLink to={context.routeTargets.dossier} label="Evaluation dossier" />
                                <RouteLink to={context.routeTargets.approval} label="Approval artifact" />
                                <RouteLink to={context.routeTargets['provider-packet']} label="Provider packet" />
                                <RouteLink to={context.routeTargets['go-live']} label="Go-live handoff" prominent />
                            </div>
                        </section>
                    </aside>
                </section>

                <section className={`${panelClass} mt-5`}>
                    <SectionHeader
                        eyebrow="Supporting artifacts"
                        title="Memo evidence and proof previews"
                        action={<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">{model.artifacts.length} controlled records</span>}
                    />
                    <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                        The memo is backed by controlled records rather than abstract claims: the residency memo, approval memo, and linked evidence surface stay wide enough to scan and review.
                    </p>
                    <div className="mt-5">
                        <DealArtifactPreviewGrid artifacts={model.artifacts} />
                    </div>
                </section>

                <details className="mt-5 rounded-3xl border border-white/10 bg-[#0a1526]/72 p-5 shadow-[0_16px_46px_rgba(0,0,0,0.22)]">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-200">
                        Show canonical deal spine and route references
                    </summary>
                    <div className="mt-5">
                        <DealRelationshipRail context={context} />
                    </div>
                </details>
            </div>
        </div>
    )
}

function SectionHeader({
    eyebrow,
    title,
    action
}: {
    eyebrow: string
    title: string
    action?: ReactNode
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{eyebrow}</div>
                <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
            </div>
            {action}
        </div>
    )
}

function MetricTile({
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
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-2 text-3xl font-semibold ${getToneClass(tone)}`}>{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </div>
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
            className={`min-w-0 rounded-2xl border px-4 py-3 ${
                emphasis
                    ? 'border-cyan-400/25 bg-cyan-500/10'
                    : 'border-white/8 bg-slate-950/35'
            }`}
        >
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 break-words text-sm font-semibold leading-6 text-slate-100">{value}</div>
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

function PathDecisionPanel({
    title,
    status,
    tone,
    pathLabel,
    pathValue,
    items
}: {
    title: string
    status: string
    tone: DealArtifactPreviewTone
    pathLabel: string
    pathValue: string
    items: string[]
}) {
    return (
        <article className={`rounded-2xl border p-5 ${getToneNoteClasses(tone)}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{pathLabel}</div>
                    <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                </div>
                <TonePill tone={tone} label={status} />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm font-semibold leading-6 text-white">
                {pathValue}
            </div>
            <DecisionList title="Operating conditions" items={items} tone={tone} />
        </article>
    )
}

function DecisionList({
    title,
    items,
    tone
}: {
    title: string
    items: string[]
    tone: DealArtifactPreviewTone
}) {
    return (
        <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</div>
            <div className="mt-3 space-y-2">
                {items.map(item => (
                    <div key={`${title}-${item}`} className="flex gap-2 text-sm leading-6 text-slate-200">
                        <span className={`mt-2 h-1.5 w-1.5 rounded-full ${getToneDotClass(tone)}`} />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ApproverMatrixRow({
    approver
}: {
    approver: ResidencyMemoApprover
}) {
    return (
        <div className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1fr_1fr_120px_1.35fr] lg:items-start">
            <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 lg:hidden">Lane</div>
                <div className="font-semibold text-white">{approver.lane}</div>
            </div>
            <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 lg:hidden">Owner</div>
                <div className="text-slate-200">{approver.owner}</div>
            </div>
            <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-500 lg:hidden">Status</div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getStatusBadgeClasses(approver.status)}`}>
                    {approver.status}
                </span>
            </div>
            <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 lg:hidden">Note</div>
                <div className="text-sm leading-6 text-slate-300">{approver.note}</div>
            </div>
        </div>
    )
}

function ExceptionCard({
    exception
}: {
    exception: ResidencyMemoException
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

function RouteLink({
    to,
    label,
    prominent = false
}: {
    to: string
    label: string
    prominent?: boolean
}) {
    return (
        <Link
            to={to}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                prominent
                    ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20'
                    : 'border-white/10 bg-slate-950/45 text-slate-100 hover:border-cyan-400/40 hover:text-cyan-100'
            }`}
        >
            {label}
        </Link>
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

function getToneDotClass(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'bg-rose-300'
    if (tone === 'amber') return 'bg-amber-300'
    if (tone === 'emerald') return 'bg-emerald-300'
    if (tone === 'cyan') return 'bg-cyan-300'
    return 'bg-slate-300'
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

function getExceptionTone(exceptions: ResidencyMemoException[]): DealArtifactPreviewTone {
    if (exceptions.some(exception => exception.severity === 'High')) return 'rose'
    if (exceptions.length > 0) return 'amber'
    return 'emerald'
}
