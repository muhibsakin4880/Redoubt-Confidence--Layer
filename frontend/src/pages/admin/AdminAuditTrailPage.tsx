import { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { buildAuditDigestSummary } from '../../domain/adminAutomation'
import { loadSharedDealLifecycleRecords } from '../../domain/dealLifecycle'

type EventTone = 'ok' | 'warn'

type AuditRow = {
    timestamp: string
    event: string
    participant: string
    dataset: string
    purpose: string
    status: string
    hash: string
    verified: boolean
}

const auditRows: AuditRow[] = [
    { timestamp: '2026-03-10 09:14', event: 'Dataset Access', participant: 'part_anon_042', dataset: 'Global Climate 2020-2024', purpose: 'ML Training', status: 'CLEARED', hash: 'a3f8...d291', verified: true },
    { timestamp: '2026-03-10 08:47', event: 'Access Request', participant: 'part_anon_017', dataset: 'Financial Tick Data', purpose: 'Risk Modeling', status: 'CLEARED', hash: 'b7c2...e445', verified: true },
    { timestamp: '2026-03-10 07:23', event: 'Dataset Access', participant: 'part_anon_089', dataset: 'Consumer Behavior Analytics', purpose: 'Research', status: 'CLEARED', hash: 'c9d1...f332', verified: true },
    { timestamp: '2026-03-09 22:11', event: 'Security Alert', participant: 'part_anon_031', dataset: 'Genomics Research Dataset', purpose: '—', status: 'PII ANOMALY', hash: 'd2e4...a118', verified: false },
    { timestamp: '2026-03-09 18:34', event: 'Contribution', participant: 'part_anon_056', dataset: 'Smart Grid Energy Data', purpose: '—', status: 'CLEARED', hash: 'e5f7...b229', verified: true },
    { timestamp: '2026-03-09 15:02', event: 'Access Request', participant: 'part_anon_008', dataset: 'Clinical Outcomes Delta', purpose: 'Healthcare Analytics', status: 'PENDING', hash: 'f8a3...c440', verified: true },
    { timestamp: '2026-03-09 11:47', event: 'Dataset Access', participant: 'part_anon_073', dataset: 'Satellite Land Use 2024', purpose: 'Urban Planning', status: 'CLEARED', hash: 'g1b6...d551', verified: true },
    { timestamp: '2026-03-09 09:15', event: 'Compliance Event', participant: 'part_anon_019', dataset: 'Financial Tick Data', purpose: '—', status: 'CLEARED', hash: 'h4c9...e662', verified: true }
]

const badgeTone: Record<EventTone, string> = {
    ok: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
    warn: 'text-amber-200 bg-amber-500/10 border-amber-500/30'
}

export default function AdminAuditTrailPage() {
    const [selectedType, setSelectedType] = useState('All Event Types')
    const auditDigest = useMemo(
        () => buildAuditDigestSummary(loadSharedDealLifecycleRecords()),
        []
    )
    const eventTypes = ['All Event Types', 'Release', 'Credit', 'Rights', 'Token', 'Dispute']

    const displayedEvents = useMemo(() => {
        if (selectedType === 'All Event Types') return auditDigest.events
        return auditDigest.events.filter(row => row.event.startsWith(selectedType.toUpperCase()))
    }, [auditDigest.events, selectedType])

    return (
        <AdminLayout title="AUDIT TRAIL" subtitle="PLATFORM EVENT MONITORING">
            <div className="space-y-6">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
                <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-10">
                    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Audit Trail</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Platform-wide event logging and compliance tracking
                            </p>
                        </div>
                    </header>

                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {auditDigest.cards.map(card => (
                            <div key={card.label} className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500">{card.label}</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-200">{card.value}</p>
                                <p className="mt-2 text-xs text-slate-500">{card.detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/35 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-cyan-400">Daily Admin Digest</p>
                                <h2 className="mt-2 text-xl font-semibold text-slate-100">Summarized platform exceptions and automated controls</h2>
                            </div>
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                                {auditDigest.flaggedCount} flagged highlight(s)
                            </span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {auditDigest.highlights.map(highlight => (
                                <article key={highlight.title} className="rounded-lg border border-slate-800/70 bg-slate-950/45 p-4">
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{highlight.title}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{highlight.detail}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {eventTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                        selectedType === type
                                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                                            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <select className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
                                <option>All Time</option>
                                <option>Today</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-slate-900/30">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-4 py-3 text-left">Timestamp</th>
                                    <th className="px-4 py-3 text-left">Event</th>
                                    <th className="px-4 py-3 text-left">Participant</th>
                                    <th className="px-4 py-3 text-left">Dataset</th>
                                    <th className="px-4 py-3 text-left">Purpose</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Hash</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {displayedEvents.map((row, idx) => (
                                    <tr key={`${row.hash}-${idx}`} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.timestamp}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.event}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.participant}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.dataset}</td>
                                        <td className="px-4 py-3 text-slate-400">{row.purpose}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${row.tone === 'ok' ? badgeTone.ok : badgeTone.warn}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.hash}</td>
                                    </tr>
                                ))}
                                {displayedEvents.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">
                                            No digest events match this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
