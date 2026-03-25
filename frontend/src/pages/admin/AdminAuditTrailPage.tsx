import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

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
    const eventTypes = ['All Event Types', 'Access', 'Request', 'Contribution', 'Security', 'Compliance']

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
                        <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Total Events</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-200">14,847</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Datasets Accessed</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-200">312</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Unique Participants</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-200">89</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Flagged Events</p>
                            <p className="mt-1 text-2xl font-semibold text-amber-200">3</p>
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
                                {auditRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.timestamp}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.event}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.participant}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.dataset}</td>
                                        <td className="px-4 py-3 text-slate-400">{row.purpose}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${row.status === 'CLEARED' ? badgeTone.ok : badgeTone.warn}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.hash}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
