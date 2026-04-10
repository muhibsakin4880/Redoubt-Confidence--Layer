const lineageSummary = [
    { label: 'Tracked Sources', value: '18' },
    { label: 'Active Pipelines', value: '7' },
    { label: 'Tracked Lineage', value: '93%' },
    { label: 'Last Sync', value: 'Today, 08:42 UTC' }
]

const lineageNodes = [
    {
        title: 'Source: Climate Sensor Mesh',
        subtitle: 'Ingested via secure edge gateway',
        meta: ['Provider: anon_provider_003', 'Region: US-East-1'],
        tone: 'emerald'
    },
    {
        title: 'Transformation: Quality Normalization',
        subtitle: 'Standardized time-series resolution',
        meta: ['Pipeline: TS-NORM-24', 'Owner: redoubt_ops'],
        tone: 'blue'
    },
    {
        title: 'Enrichment: Trust Scoring',
        subtitle: 'AI confidence scoring applied',
        meta: ['Confidence Score: 87', 'Model: trust-v4'],
        tone: 'cyan'
    },
    {
        title: 'Delivery: Secure Enclave',
        subtitle: 'Restricted access workspace',
        meta: ['Access Mode: RBAC', 'Escrow: Active'],
        tone: 'amber'
    }
]

const accessEvents = [
    { timestamp: '2026-03-11 08:12', action: 'Access request created', actor: 'part_anon_042', status: 'Logged' },
    { timestamp: '2026-03-11 08:18', action: 'Escrow initiated', actor: 'redoubt_escrow', status: 'Tracked' },
    { timestamp: '2026-03-11 08:41', action: 'Secure enclave granted', actor: 'rbac_console', status: 'Tracked' },
    { timestamp: '2026-03-11 08:42', action: 'Usage telemetry synced', actor: 'audit_trail', status: 'Logged' }
]

const toneStyles: Record<string, { card: string; badge: string }> = {
    emerald: {
        card: 'border-emerald-500/30 bg-emerald-500/10',
        badge: 'text-emerald-200'
    },
    blue: {
        card: 'border-blue-500/30 bg-blue-500/10',
        badge: 'text-blue-200'
    },
    cyan: {
        card: 'border-cyan-500/30 bg-cyan-500/10',
        badge: 'text-cyan-200'
    },
    amber: {
        card: 'border-amber-500/30 bg-amber-500/10',
        badge: 'text-amber-200'
    }
}

export default function DataLineagePage() {
    return (
        <div className="relative min-h-screen bg-slate-900 text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_88%_0%,rgba(59,130,246,0.1),transparent_38%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Data Lineage
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Data Lineage
                        </h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Trace every dataset from source to delivery with tracked lineage checkpoints.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                        Provenance tracking active
                    </div>
                </header>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {lineageSummary.map(stat => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                        >
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                            <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="text-xl font-semibold text-white">Lineage Flow</h2>
                            <span className="text-xs text-slate-500">Current dataset: Global Climate 2020-2024</span>
                        </div>
                        <div className="mt-6 space-y-4">
                            {lineageNodes.map((node, index) => (
                                <div key={node.title} className="space-y-3">
                                    <div className={`rounded-2xl border p-5 ${toneStyles[node.tone].card}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{node.title}</p>
                                                <p className="text-xs text-slate-200/70 mt-1">{node.subtitle}</p>
                                            </div>
                                            <span className={`text-xs font-semibold ${toneStyles[node.tone].badge}`}>Tracked</span>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                                            {node.meta.map(item => (
                                                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {index < lineageNodes.length - 1 && (
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <span className="h-6 w-px bg-gradient-to-b from-slate-500/60 to-transparent" />
                                            <span>Tracked handoff</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="text-xl font-semibold text-white">Access Events</h2>
                            <span className="text-xs text-slate-500">Last 24 hours</span>
                        </div>
                        <div className="mt-5 space-y-3">
                            {accessEvents.map(event => (
                                <div
                                    key={event.timestamp}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                >
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{event.timestamp}</span>
                                        <span className="text-emerald-300">{event.status}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-white">{event.action}</p>
                                    <p className="text-xs text-slate-400 mt-1">Actor: {event.actor}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-xs text-blue-200">
                            Lineage checkpoints are shown as demo provenance references and export cues.
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
