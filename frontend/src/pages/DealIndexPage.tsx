import { Link } from 'react-router-dom'
import {
    DEAL_SURFACE_META,
    type DealSurfaceKey
} from '../data/dealDossierData'
import { loadDealRouteContexts, type DealRouteContext } from '../domain/dealDossier'
import {
    buildProviderRightsPacket,
    loadProviderPacketDraft
} from '../domain/providerRightsPacket'

type DealIndexPageProps = {
    demo?: boolean
}

type DealIndexRecord = {
    context: DealRouteContext
    providerInstitution: string
    providerType: string
    placeholderCount: number
    availableCount: number
}

const panelClass =
    'rounded-2xl border border-white/10 bg-[#08111f]/92 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.2)] backdrop-blur-xl'

const surfaceOrder: DealSurfaceKey[] = [
    'dossier',
    'provider-packet',
    'output-review',
    'approval',
    'negotiation',
    'residency-memo',
    'go-live'
]

export default function DealIndexPage({
    demo = false
}: DealIndexPageProps) {
    const records = loadDealRouteContexts().map(context => {
        const providerPacket = buildProviderRightsPacket(
            context,
            loadProviderPacketDraft(context.seed.dealId)
        )
        const surfaceStates = Object.values(context.surfaceAvailability)

        return {
            context,
            providerInstitution: providerPacket.providerInstitution,
            providerType: providerPacket.providerType,
            placeholderCount: surfaceStates.filter(state => state === 'placeholder').length,
            availableCount: surfaceStates.filter(state => state === 'available').length
        }
    })
    const generatedCount = records.filter(record => record.context.routeKind === 'derived').length
    const configuredCount = records.length - generatedCount

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link
                        to={demo ? '/demo/datasets' : '/datasets'}
                        className="transition-colors hover:text-white"
                    >
                        Datasets
                    </Link>
                    <span>/</span>
                    <span className="text-slate-200">Evaluation Dossiers</span>
                </div>

                <section className={`${panelClass} mt-5`}>
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
                        <div>
                            <div className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Deal Operating Index
                            </div>
                            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-[2.75rem]">
                                Evaluation Dossiers
                            </h1>
                            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                                Browse every dataset-backed deal object, including curated seeded deals and generated dataset dossiers. Open a dossier to review readiness, provider evidence, governed evaluation state, and connected operating surfaces.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <SummaryTile label="Total deals" value={String(records.length)} />
                            <SummaryTile label="Configured" value={String(configuredCount)} />
                            <SummaryTile label="Generated" value={String(generatedCount)} />
                        </div>
                    </div>
                </section>

                <section className="mt-5 grid gap-4">
                    {records.map(record => (
                        <DealIndexCard
                            key={record.context.seed.dealId}
                            record={record}
                            demo={demo}
                        />
                    ))}
                </section>
            </div>
        </div>
    )
}

function DealIndexCard({
    record,
    demo
}: {
    record: DealIndexRecord
    demo: boolean
}) {
    const { context } = record
    const dossierPath = demo ? context.demoTargets.dossier : context.routeTargets.dossier
    const providerPacketPath = demo
        ? context.demoTargets['provider-packet']
        : context.routeTargets['provider-packet']
    const outputReviewPath = demo
        ? context.demoTargets['output-review']
        : context.routeTargets['output-review']
    const placeholderLabel =
        record.placeholderCount > 0
            ? `${record.placeholderCount} placeholder surface${record.placeholderCount === 1 ? '' : 's'}`
            : 'All surfaces configured'

    return (
        <article className="rounded-2xl border border-white/10 bg-[#07111f]/90 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                            {context.seed.dealId}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                            context.routeKind === 'seeded'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                                : 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                        }`}>
                            {context.routeKind === 'seeded' ? 'Configured deal' : 'Generated dataset deal'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300">
                            {placeholderLabel}
                        </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                        {context.dataset?.title ?? context.seed.label}
                    </h2>
                    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
                        {context.seed.summary}
                    </p>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <DenseField label="Buyer / request" value={context.request?.requestNumber ?? 'Not linked'} detail={context.request?.name ?? context.passport.organization.organizationName} />
                        <DenseField label="Provider / institution" value={record.providerInstitution} detail={record.providerType} />
                        <DenseField label="Current stage" value={context.currentStageLabel} detail={context.currentStageDetail} />
                        <DenseField label="Readiness" value={`${context.dealProgress.completionPercent}% complete`} detail={context.dealProgress.headline} />
                    </div>
                </div>

                <aside className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Available surfaces
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {surfaceOrder.map(surface => (
                            <span
                                key={`${context.seed.dealId}-${surface}`}
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                                    context.surfaceAvailability[surface] === 'available'
                                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100'
                                        : 'border-amber-500/25 bg-amber-500/10 text-amber-100'
                                }`}
                            >
                                {DEAL_SURFACE_META[surface].label}
                            </span>
                        ))}
                    </div>

                    <div className="mt-4 grid gap-2">
                        <Link
                            to={dossierPath}
                            className="rounded-xl bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
                        >
                            Open dossier
                        </Link>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                            <Link
                                to={providerPacketPath}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white"
                            >
                                Provider packet
                            </Link>
                            <Link
                                to={outputReviewPath}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white"
                            >
                                Output review
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </article>
    )
}

function SummaryTile({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
        </div>
    )
}

function DenseField({
    label,
    value,
    detail
}: {
    label: string
    value: string
    detail: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </div>
            <div className="mt-2 text-sm font-semibold leading-6 text-white">{value}</div>
            <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
        </div>
    )
}
