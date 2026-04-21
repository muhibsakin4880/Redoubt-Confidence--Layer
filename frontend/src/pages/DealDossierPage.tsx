import { Link, useParams } from 'react-router-dom'
import DealProgressTracker from '../components/DealProgressTracker'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import { SEEDED_DEAL_ROUTES } from '../data/dealDossierData'
import { buildRequestBasisFields, getProviderReviewStatus, providerReviewStatusStyles, requestStatusLabel, statusStyles } from '../data/workspaceData'
import { describeAccessMode, passportStatusMeta } from '../domain/compliancePassport'
import { getDealRouteContextById } from '../domain/dealDossier'

type DealDossierPageProps = {
    demo?: boolean
}

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function DealDossierPage({
    demo = false
}: DealDossierPageProps) {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)

    if (!context) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Deal dossier not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Unknown deal id</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The dossier shell is wired, but this seed id does not exist in the current demo workspace.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {SEEDED_DEAL_ROUTES.map(record => (
                                <Link
                                    key={record.dealId}
                                    to={demo ? `/demo/deals/${record.dealId}` : `/deals/${record.dealId}`}
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

    const passportMeta = passportStatusMeta(context.passport.status)
    const requestBasisFields = context.request ? buildRequestBasisFields(context.request) : []
    const quote = context.quote
    const quoteValue = quote ? formatUsd(quote.totalUsd) : 'Not priced yet'
    const quoteDetail = quote
        ? `${quote.id} · ${quote.riskBand} rights band`
        : 'Create a rights package to price the deal and move into escrow-native checkout.'
    const blockers = context.lifecycleRecord?.blockers ?? []
    const signals = context.lifecycleRecord?.signals ?? []
    const datasetLinks = [
        context.dataset ? { label: 'Open dataset detail', to: buildBuyerAwareRoute(`/datasets/${context.dataset.id}`, demo) } : null,
        context.request ? { label: 'Open request detail', to: buildBuyerAwareRoute(`/access-requests/${context.request.id}`, demo) } : null,
        { label: quote ? 'Refine rights package' : 'Build rights package', to: buildBuyerAwareRoute(`/datasets/${context.seed.datasetId}/rights-quote`, demo) },
        { label: 'Open governed checkout', to: buildBuyerAwareRoute(`/datasets/${context.seed.datasetId}/escrow-checkout`, demo) }
    ].filter((item): item is { label: string; to: string } => Boolean(item))

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link to={demo ? '/demo/deals' : '/deals'} className="hover:text-white transition-colors">
                        Deals
                    </Link>
                    <span>/</span>
                    <span className="text-slate-200">{context.seed.dealId}</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {demo ? 'Public demo dossier shell' : 'Evaluation dossier shell'}
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Evaluation Dossier
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            The canonical deal object that binds the dataset, request basis, reusable compliance context, rights package, and current governed evaluation stage into one shared view.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                            {context.seed.dealId}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {context.currentStageLabel}
                        </span>
                    </div>
                </header>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Dataset"
                        value={context.dataset?.title ?? 'Pending dataset link'}
                        detail={`datasetId ${context.seed.datasetId}`}
                        tone="cyan"
                    />
                    <SummaryCard
                        label="Request"
                        value={context.request ? requestStatusLabel(context.request.status) : 'Pending request mapping'}
                        detail={context.request?.requestNumber ?? context.seed.requestId}
                        tone="amber"
                    />
                    <SummaryCard
                        label="Passport"
                        value={passportMeta.label}
                        detail={`${context.passport.completionPercent}% complete · ${context.passportId}`}
                        tone="emerald"
                    />
                    <SummaryCard
                        label="Rights package"
                        value={quoteValue}
                        detail={quoteDetail}
                        tone={quote ? 'cyan' : 'amber'}
                    />
                </section>

                <div className="mt-8">
                    <DealProgressTracker model={context.dealProgress} compact />
                </div>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Deal overview</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">{context.seed.label}</h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">{context.seed.summary}</p>
                                </div>
                                <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Current lifecycle</div>
                                    <div className="mt-2 text-lg font-semibold text-white">{context.currentStageLabel}</div>
                                    <div className="mt-2 text-xs leading-5 text-cyan-100/85">{context.currentStageDetail}</div>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                {datasetLinks.map(link => (
                                    <Link
                                        key={`${context.seed.dealId}-${link.to}`}
                                        to={link.to}
                                        className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Dataset summary</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">{context.dataset?.title ?? 'Dataset summary pending'}</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        {context.dataset?.description ?? 'The seeded deal can already resolve a dataset id, but the detailed dataset summary will expand in later steps.'}
                                    </p>
                                </div>
                                {context.dataset ? (
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[context.dataset.access.status]}`}>
                                        {requestStatusLabel(context.dataset.access.status)}
                                    </span>
                                ) : null}
                            </div>

                            {context.dataset ? (
                                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <MetricTile label="Category" value={context.dataset.category} />
                                    <MetricTile label="Coverage" value={context.dataset.recordCount} />
                                    <MetricTile label="Payload size" value={context.dataset.size} />
                                    <MetricTile label="Confidence" value={`${context.dataset.confidenceScore}%`} />
                                </div>
                            ) : null}

                            {context.dataset ? (
                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <ShellList
                                        title="Allowed usage cues"
                                        items={context.dataset.access.allowedUsage.slice(0, 3)}
                                    />
                                    <ShellList
                                        title="Access instructions"
                                        items={context.dataset.access.instructions.slice(0, 3)}
                                    />
                                </div>
                            ) : null}
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Request basis</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Why the buyer is asking</h2>
                                    </div>
                                    {context.request ? (
                                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${providerReviewStatusStyles[getProviderReviewStatus(context.request)]}`}>
                                            {getProviderReviewStatus(context.request)}
                                        </span>
                                    ) : null}
                                </div>

                                {context.request ? (
                                    <div className="mt-5 grid gap-3">
                                        {requestBasisFields.map(field => (
                                            <FieldRow key={`${context.request?.id}-${field.label}`} label={field.label} value={field.value} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyStateCopy text="The dossier shell is ready even when the request mapping is still thin. Later steps will deepen the cross-object proof." />
                                )}
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Compliance passport</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Reusable buyer context</h2>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${passportMeta.classes}`}>
                                        {passportMeta.label}
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Organization" value={context.passport.organization.organizationName} />
                                    <FieldRow label="Role" value={context.passport.organization.roleInOrganization} />
                                    <FieldRow label="Default term" value={context.passport.defaultDuration} />
                                    <FieldRow label="Preferred access" value={describeAccessMode(context.passport.preferredAccessMode)} />
                                </div>

                                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-100/90">
                                    {passportMeta.detail}
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Rights package</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Commercial and scope shell</h2>

                                {quote ? (
                                    <div className="mt-5 space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <MetricTile label="Quote id" value={quote.id} />
                                            <MetricTile label="Total" value={formatUsd(quote.totalUsd)} />
                                            <MetricTile label="Escrow hold" value={formatUsd(quote.escrowHoldUsd)} />
                                        </div>

                                        <ShellList title="Rights summary" items={quote.rightsSummary.slice(0, 4)} />
                                    </div>
                                ) : (
                                    <EmptyStateCopy text="No rights quote has been saved yet. This shell is ready to become the canonical deal object as soon as the first priced rights package exists." />
                                )}
                            </article>

                            <article className={panelClass}>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Current lifecycle posture</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">What the deal is waiting on</h2>

                                <div className="mt-5 space-y-4">
                                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/8 px-4 py-4">
                                        <div className="text-sm font-semibold text-white">{context.dealProgress.headline}</div>
                                        <p className="mt-2 text-sm leading-6 text-cyan-100/85">{context.dealProgress.nextAction}</p>
                                    </div>

                                    <ShellList
                                        title="Active blockers"
                                        items={blockers.length > 0 ? blockers.slice(0, 3) : ['No blocking issue is preventing the shell from resolving the current deal state.']}
                                        danger={blockers.length > 0}
                                    />
                                    <ShellList
                                        title="Current signals"
                                        items={signals.length > 0 ? signals.slice(0, 3) : ['Signals will deepen once more quote, approval, and evaluation artifacts are attached.']}
                                    />
                                </div>
                            </article>
                        </section>
                    </div>

                    <aside>
                        <DealRelationshipRail context={context} demo={demo} />
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
    tone: 'cyan' | 'amber' | 'emerald'
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-3 text-xl font-semibold ${getToneClass(tone)}`}>{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </article>
    )
}

function MetricTile({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-base font-semibold text-white">{value}</div>
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
                    <div key={item} className="flex gap-2 text-sm leading-6 text-slate-200">
                        <span className={`mt-2 h-1.5 w-1.5 rounded-full ${danger ? 'bg-rose-300' : 'bg-cyan-300'}`} />
                        <span>{item}</span>
                    </div>
                ))}
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
        <div className="mt-5 rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-4 py-5 text-sm leading-6 text-slate-400">
            {text}
        </div>
    )
}

function formatUsd(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)
}

function getToneClass(tone: 'cyan' | 'amber' | 'emerald') {
    if (tone === 'cyan') return 'text-cyan-200'
    if (tone === 'amber') return 'text-amber-200'
    return 'text-emerald-200'
}

function buildBuyerAwareRoute(to: string, demo: boolean) {
    if (!demo) return to
    if (to.startsWith('/datasets/')) return `/demo${to}`
    if (to.startsWith('/access-requests/')) return `/demo${to}`
    if (to === '/compliance-passport') return '/demo/compliance-passport'
    return to
}
