import { Link } from 'react-router-dom'
import type { DealRouteContext } from '../../domain/dealDossier'

type DealRelationshipRailProps = {
    context: DealRouteContext
    demo?: boolean
}

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function DealRelationshipRail({
    context,
    demo = false
}: DealRelationshipRailProps) {
    const openers = [
        context.dataset ? { label: 'Dataset detail', to: `/datasets/${context.dataset.id}` } : null,
        context.request ? { label: 'Access request detail', to: `/access-requests/${context.request.id}` } : null,
        { label: 'Compliance passport', to: '/compliance-passport' },
        { label: 'Rights quote builder', to: `/datasets/${context.seed.datasetId}/rights-quote` },
        { label: 'Escrow checkout', to: `/datasets/${context.seed.datasetId}/escrow-checkout` }
    ].filter((item): item is { label: string; to: string } => Boolean(item))

    const coreIds = [
        { label: 'Deal id', value: context.seed.dealId, tone: 'cyan' },
        { label: 'Dataset id', value: context.seed.datasetId, tone: 'slate' },
        { label: 'Request id', value: context.seed.requestId, tone: 'slate' },
        { label: 'Passport id', value: context.passportId, tone: 'emerald' },
        { label: 'Quote id', value: context.quoteId ?? 'Pending', tone: context.quoteId ? 'cyan' : 'amber' },
        { label: 'Checkout id', value: context.checkoutId ?? 'Pending', tone: context.checkoutId ? 'emerald' : 'amber' }
    ] as const

    const reservedSurfaces = [
        { label: 'Provider packet', to: context.routeTargets['provider-packet'] },
        { label: 'Output review', to: context.routeTargets['output-review'] },
        { label: 'Approval', to: context.routeTargets.approval }
    ]

    return (
        <div className="space-y-5">
            <section className={panelClass}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Relationship rail</div>
                        <h2 className="mt-2 text-lg font-semibold text-white">Core ids and connected objects</h2>
                    </div>
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
                        Canonical deal spine
                    </span>
                </div>

                <div className="mt-5 grid gap-3">
                    {coreIds.map(item => (
                        <div
                            key={`${context.seed.dealId}-${item.label}`}
                            className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3"
                        >
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                            <div className={`mt-2 text-sm font-semibold ${getToneClass(item.tone)}`}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={panelClass}>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Openers</div>
                <h2 className="mt-2 text-lg font-semibold text-white">Jump to connected routes</h2>

                <div className="mt-5 grid gap-3">
                    {openers.map(item => (
                        <Link
                            key={`${context.seed.dealId}-${item.to}`}
                            to={resolveDemoRoute(item.to, demo)}
                            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 transition-colors hover:border-slate-500/50"
                        >
                            <div className="text-sm font-semibold text-white">{item.label}</div>
                            <div className="mt-1 text-xs text-slate-400">{resolveDemoRoute(item.to, demo)}</div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className={panelClass}>
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Reserved next surfaces</div>
                <h2 className="mt-2 text-lg font-semibold text-white">Deal-specific routes</h2>
                <p className="mt-2 text-sm text-slate-400">
                    The deal id now resolves the dedicated proof and operating surfaces that follow this shell.
                </p>

                <div className="mt-5 space-y-3">
                    {reservedSurfaces.map(item => (
                        <Link
                            key={`${context.seed.dealId}-${item.to}`}
                            to={demo ? item.to.replace('/deals/', '/demo/deals/') : item.to}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 transition-colors hover:border-slate-500/50"
                        >
                            <div>
                                <div className="text-sm font-semibold text-white">{item.label}</div>
                                <div className="mt-1 text-xs text-slate-400">
                                    {demo ? item.to.replace('/deals/', '/demo/deals/') : item.to}
                                </div>
                            </div>
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-100">
                                Upcoming
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}

function getToneClass(tone: 'cyan' | 'emerald' | 'amber' | 'slate') {
    if (tone === 'cyan') return 'text-cyan-200'
    if (tone === 'emerald') return 'text-emerald-200'
    if (tone === 'amber') return 'text-amber-200'
    return 'text-slate-100'
}

function resolveDemoRoute(to: string, demo: boolean) {
    if (!demo) return to
    if (to.startsWith('/deals/')) return to.replace('/deals/', '/demo/deals/')
    if (to.startsWith('/datasets/')) return `/demo${to}`
    if (to.startsWith('/access-requests/')) return `/demo${to}`
    if (to === '/compliance-passport') return '/demo/compliance-passport'
    return to
}
