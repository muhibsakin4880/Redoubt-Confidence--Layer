import React, { useMemo, useState } from 'react'

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

const summaryStats = [
    { label: 'Total Events', value: '14,847' },
    { label: 'Datasets Accessed', value: '312' },
    { label: 'Unique Participants', value: '89' },
    { label: 'Flagged Events', value: '3' }
]

const eventTypes = ['All Event Types', 'Access', 'Request', 'Contribution', 'Security', 'Compliance']
const timeRanges = ['All Time', 'Today', 'Last 7 days', 'Last 30 days']

const auditRows: AuditRow[] = [
    { timestamp: '2026-03-10 09:14', event: 'Dataset Access', participant: 'part_anon_042', dataset: 'Global Climate 2020-2024', purpose: 'ML Training', status: '200 OK', hash: 'a3f8...d291', verified: true },
    { timestamp: '2026-03-10 08:47', event: 'Access Request', participant: 'part_anon_017', dataset: 'Financial Tick Data', purpose: 'Risk Modeling', status: 'Approved', hash: 'b7c2...e445', verified: true },
    { timestamp: '2026-03-10 07:23', event: 'Dataset Access', participant: 'part_anon_089', dataset: 'Consumer Behavior Analytics', purpose: 'Research', status: '200 OK', hash: 'c9d1...f332', verified: true },
    { timestamp: '2026-03-09 22:11', event: 'Security Alert', participant: 'part_anon_031', dataset: 'Genomics Research Dataset', purpose: '—', status: 'Flagged', hash: 'd2e4...a118', verified: false },
    { timestamp: '2026-03-09 18:34', event: 'Contribution', participant: 'part_anon_056', dataset: 'Smart Grid Energy Data', purpose: '—', status: 'Submitted', hash: 'e5f7...b229', verified: true },
    { timestamp: '2026-03-09 15:02', event: 'Access Request', participant: 'part_anon_008', dataset: 'Clinical Outcomes Delta', purpose: 'Healthcare Analytics', status: 'Pending', hash: 'f8a3...c440', verified: true },
    { timestamp: '2026-03-09 11:47', event: 'Dataset Access', participant: 'part_anon_073', dataset: 'Satellite Land Use 2024', purpose: 'Urban Planning', status: '200 OK', hash: 'g1b6...d551', verified: true },
    { timestamp: '2026-03-09 09:15', event: 'Compliance Event', participant: 'part_anon_019', dataset: 'Financial Tick Data', purpose: '—', status: 'Policy Updated', hash: 'h4c9...e662', verified: true }
]

const badgeTone: Record<EventTone, string> = {
    ok: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
    warn: 'text-amber-200 bg-amber-500/10 border-amber-500/30'
}

export default function AuditTrailPage() {
    const [selectedType, setSelectedType] = useState('All Event Types')
    const [selectedRange, setSelectedRange] = useState('All Time')
    const [search, setSearch] = useState('')

    const filteredRows = useMemo(() => {
        return auditRows.filter(row => {
            const matchesType = selectedType === 'All Event Types' || row.event.toLowerCase().includes(selectedType.toLowerCase())
            const matchesSearch = search.trim().length === 0 || `${row.participant} ${row.dataset}`.toLowerCase().includes(search.toLowerCase())
            return matchesType && matchesSearch
        })
    }, [selectedType, search])

    return (
        <div className="relative min-h-screen bg-[#010915] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Immutable Audit Trail
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Immutable Audit Trail</h1>
                        <p className="mt-2 text-slate-400">
                            Append-only access logs with integrity verification and SIEM export
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.18)]">
                        Hash-chained, tamper-evident ledger
                    </div>
                </header>

                <section className="mt-10">
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.25),transparent_35%)]" />
                        <div className="relative flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                                <div>
                                    <p className="text-base font-semibold text-emerald-200">Audit log integrity verified — Hash chain intact</p>
                                    <p className="text-xs text-emerald-100/70">Continuous hashing & proof of append-only writes</p>
                                </div>
                            </div>
                            <div className="text-xs font-medium text-emerald-100/70">14,847 events logged to date</div>
                        </div>
                    </div>
                </section>

                <section className="mt-10 grid gap-6 md:grid-cols-4">
                    {summaryStats.map(stat => (
                        <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                            <p className="mt-3 text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-10 grid gap-4 md:grid-cols-[1fr_1fr_1.2fr]">
                    <div className="rounded-xl border border-white/10 bg-[#0a1628] px-4 py-3">
                        <label className="text-xs uppercase tracking-[0.12em] text-slate-500">Event Type</label>
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                            className="mt-2 w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                        >
                            {eventTypes.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#0a1628] px-4 py-3">
                        <label className="text-xs uppercase tracking-[0.12em] text-slate-500">Time Range</label>
                        <select
                            value={selectedRange}
                            onChange={e => setSelectedRange(e.target.value)}
                            className="mt-2 w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                        >
                            {timeRanges.map(range => (
                                <option key={range} value={range}>
                                    {range}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#0a1628] px-4 py-3">
                        <label className="text-xs uppercase tracking-[0.12em] text-slate-500">Search</label>
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-900 border border-white/10 px-3 py-2">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5c1.93 0 3.68-.71 5.15-1.85z" />
                            </svg>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by participant or dataset..."
                                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-10 rounded-2xl border border-white/10 bg-[#0a1628] shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-slate-500">
                                <tr>
                                    {['Timestamp', 'Event', 'Participant', 'Dataset', 'Purpose', 'Status', 'Hash'].map(head => (
                                        <th key={head} className="px-4 py-3 whitespace-nowrap">{head}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-white/3">
                                        <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{row.timestamp}</td>
                                        <td className="px-4 py-3 text-white whitespace-nowrap">{row.event}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.participant}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.dataset}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.purpose}</td>
                                        <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{row.status}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-emerald-200 whitespace-nowrap flex items-center gap-2">
                                            <span className="truncate max-w-[140px] inline-block">{row.hash}</span>
                                            {row.verified ? (
                                                <span className="flex items-center gap-1 text-emerald-300">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                                    ✓
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-300">
                                                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                                                    ✗
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(59,130,246,0.25)]">Export to SIEM</button>
                        <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Download CSV</button>
                    </div>
                    <p className="text-xs text-slate-500">Logs are append-only and tamper-evident</p>
                </section>
            </div>
        </div>
    )
}
