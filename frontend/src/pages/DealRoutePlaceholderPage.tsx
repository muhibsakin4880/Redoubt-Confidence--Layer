import { Link, useParams } from 'react-router-dom'
import {
    DEAL_SURFACE_META,
    SEEDED_DEAL_ROUTES,
    type DealSurfaceKey
} from '../data/dealDossierData'
import { getDealRouteContextById } from '../domain/dealDossier'

type DealRoutePlaceholderPageProps = {
    surface: DealSurfaceKey
    demo?: boolean
}

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function DealRoutePlaceholderPage({
    surface,
    demo = false
}: DealRoutePlaceholderPageProps) {
    const { dealId } = useParams<{ dealId: string }>()
    const surfaceMeta = DEAL_SURFACE_META[surface]
    const context = getDealRouteContextById(dealId)

    if (!context) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Deal route not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Unknown deal id</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The deal route family is wired, but this seed id does not exist in the current demo workspace.
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

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_50%_84%,rgba(59,130,246,0.10),transparent_35%)]" />
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
                            {demo ? 'Public demo deal spine' : 'Workspace deal spine'}
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            {surfaceMeta.label}
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            {surfaceMeta.summary}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
                        {context.seed.dealId} · Reserved for {surfaceMeta.reservedFor}
                    </div>
                </header>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <article className={panelClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Seeded deal route</div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">{context.seed.label}</h2>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                Step 0 ready
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-300">{context.seed.summary}</p>

                        <div className="mt-6 grid gap-3 md:grid-cols-2">
                            <ValueCard label="Dataset" value={context.dataset?.title ?? 'Seeded later'} detail={`datasetId ${context.seed.datasetId}`} />
                            <ValueCard label="Access request" value={context.request?.requestNumber ?? context.seed.requestId} detail={context.request?.name ?? 'Mapped request seed'} />
                            <ValueCard label="Current stage" value={context.currentStageLabel} detail={context.currentStageDetail} />
                            <ValueCard
                                label="Resolved object ids"
                                value={[
                                    `passport ${context.passportId}`,
                                    context.quoteId ? `quote ${context.quoteId}` : 'quote pending',
                                    context.checkoutId ? `checkout ${context.checkoutId}` : 'checkout pending'
                                ].join(' · ')}
                                detail="Pulled from existing passport, quote, and checkout loaders when available."
                            />
                        </div>
                    </article>

                    <aside className={`${panelClass} border-cyan-500/20 bg-cyan-500/8`}>
                        <div className="text-[11px] uppercase tracking-[0.14em] text-cyan-100/70">Why this exists now</div>
                        <h2 className="mt-2 text-xl font-semibold text-white">Deal-centric route family is reserved</h2>
                        <div className="mt-4 space-y-3 text-sm text-slate-200">
                            <p>This step seeds stable deal ids and wires the full route spine before the real dossier and proof surfaces land.</p>
                            <p>The page is intentionally lightweight so the next steps can focus on trust-heavy UI without revisiting routing or id composition.</p>
                        </div>
                    </aside>
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-2">
                    <article className={panelClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Workspace routes</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Reserved deal surfaces</h2>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                Route family
                            </span>
                        </div>

                        <div className="mt-5 grid gap-3">
                            {(Object.entries(context.routeTargets) as Array<[DealSurfaceKey, string]>).map(([key, href]) => (
                                <Link
                                    key={key}
                                    to={href}
                                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                                        key === surface
                                            ? 'border-cyan-400/50 bg-cyan-500/12'
                                            : 'border-white/10 bg-slate-950/40 hover:border-slate-500/50'
                                    }`}
                                >
                                    <div className="text-sm font-semibold text-white">{DEAL_SURFACE_META[key].label}</div>
                                    <div className="mt-1 text-xs text-slate-400">{href}</div>
                                </Link>
                            ))}
                        </div>
                    </article>

                    <article className={panelClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Connected objects</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Existing routes already in the repo</h2>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                Reused today
                            </span>
                        </div>

                        <div className="mt-5 grid gap-3">
                            {[
                                context.dataset ? { label: 'Dataset detail', to: `/datasets/${context.dataset.id}` } : null,
                                context.request ? { label: 'Access request detail', to: `/access-requests/${context.request.id}` } : null,
                                { label: 'Compliance passport', to: '/compliance-passport' },
                                { label: 'Escrow center', to: '/escrow-center' }
                            ]
                                .filter((item): item is { label: string; to: string } => Boolean(item))
                                .map(item => (
                                    <Link
                                        key={`${context.seed.dealId}-${item.to}`}
                                        to={item.to}
                                        className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 transition-colors hover:border-slate-500/50"
                                    >
                                        <div className="text-sm font-semibold text-white">{item.label}</div>
                                        <div className="mt-1 text-xs text-slate-400">{item.to}</div>
                                    </Link>
                                ))}
                        </div>

                        {demo ? (
                            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
                                <div className="text-sm font-semibold text-white">Demo mirrors enabled for phase 1 trust surfaces</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {Object.values(context.demoTargets).map(href => (
                                        <Link
                                            key={href}
                                            to={href}
                                            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20"
                                        >
                                            {href}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </article>
                </section>
            </div>
        </div>
    )
}

function ValueCard({
    label,
    value,
    detail
}: {
    label: string
    value: string
    detail: string
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-base font-semibold text-white">{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </div>
    )
}
