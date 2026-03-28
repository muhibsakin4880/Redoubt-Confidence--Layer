import React from 'react'

type Tone = 'ok' | 'warn'

const components = [
    { name: 'API Gateway', status: 'Operational', tone: 'ok' as Tone },
    { name: 'Authentication Service', status: 'Operational', tone: 'ok' as Tone },
    { name: 'Dataset Pipeline', status: 'Operational', tone: 'ok' as Tone },
    { name: 'AI Confidence Engine', status: 'Operational', tone: 'ok' as Tone },
    { name: 'Audit Trail Service', status: 'Operational', tone: 'ok' as Tone },
    { name: 'Compliance Engine', status: 'Operational', tone: 'ok' as Tone }
]

const uptimeHistory = [
    { day: 'Mar 10', value: 100, tone: 'ok' as Tone },
    { day: 'Mar 09', value: 100, tone: 'ok' as Tone },
    { day: 'Mar 08', value: 99.9, tone: 'ok' as Tone },
    { day: 'Mar 07', value: 100, tone: 'ok' as Tone },
    { day: 'Mar 06', value: 98.2, tone: 'warn' as Tone, note: 'Scheduled maintenance' },
    { day: 'Mar 05', value: 100, tone: 'ok' as Tone },
    { day: 'Mar 04', value: 100, tone: 'ok' as Tone }
]

const incidents = [
    { id: 'INC-2026-0041', date: 'Mar 06', detail: 'Scheduled maintenance', duration: '42 min', status: 'Resolved' },
    { id: 'INC-2026-0040', date: 'Feb 28', detail: 'Auth service latency', duration: '18 min', status: 'Resolved' },
    { id: 'INC-2026-0039', date: 'Feb 15', detail: 'Pipeline processing delay', duration: '31 min', status: 'Resolved' }
]

const milestones = [
    '✅ SOC 2 Type II — Certified Jan 2026',
    '✅ HIPAA Compliance — Feb 2026',
    '✅ GDPR Alignment — Dec 2025',
    '🔵 ISO 27001 — In Progress, Q3 2026',
    '⬜ FedRAMP Ready — Q4 2026',
    '⬜ HITRUST CSF — Q1 2027'
]

const badgeStyles: Record<Tone, string> = {
    ok: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
    warn: 'text-amber-200 bg-amber-500/10 border-amber-500/30'
}

export default function StatusPage() {
    return (
        <div className="relative min-h-screen bg-slate-900 text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Platform Status
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Platform Status</h1>
                        <p className="mt-2 text-slate-400">
                            Live system health, uptime metrics, and compliance milestone roadmap
                        </p>
                    </div>
                </header>

                <section className="mt-10">
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.25),transparent_35%)]" />
                        <div className="relative flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                                <div>
                                    <p className="text-base font-semibold text-emerald-200">All Systems Operational</p>
                                    <p className="text-xs text-emerald-100/70">Last checked: 1 minute ago</p>
                                </div>
                            </div>
                            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-200">
                                99.98% uptime — last 90 days
                            </span>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-white mb-4">System Components</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {components.map((item) => (
                            <div key={item.name} className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{item.name}</p>
                                        <p className="text-xs text-slate-400">Status</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyles[item.tone]}`}>
                                        <span className="h-2 w-2 rounded-full bg-current" />
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <h2 className="text-xl font-semibold text-white">Uptime Last 7 Days</h2>
                        </div>
                        <div className="space-y-3">
                            {uptimeHistory.map((row) => (
                                <div key={row.day} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                    <div className="flex items-center justify-between text-sm text-slate-200">
                                        <span>{row.day}</span>
                                        <span className={`${row.tone === 'warn' ? 'text-amber-200' : 'text-emerald-200'}`}>{row.value}%</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                                        <div
                                            className={`${row.tone === 'warn' ? 'bg-amber-400' : 'bg-emerald-400'} h-full rounded-full`}
                                            style={{ width: `${row.value}%` }}
                                        />
                                    </div>
                                    {row.note && <p className="mt-2 text-xs text-amber-200">{row.note}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <h2 className="text-xl font-semibold text-white">Incident History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="text-xs uppercase tracking-[0.08em] text-slate-500 border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 pr-4 text-left font-medium">Incident</th>
                                        <th className="py-3 px-4 text-left font-medium">Date</th>
                                        <th className="py-3 px-4 text-left font-medium">Detail</th>
                                        <th className="py-3 px-4 text-left font-medium">Duration</th>
                                        <th className="py-3 pl-4 text-right font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {incidents.map((incident) => (
                                        <tr key={incident.id} className="text-slate-200">
                                            <td className="py-3 pr-4 font-semibold">{incident.id}</td>
                                            <td className="py-3 px-4 text-slate-400">{incident.date}</td>
                                            <td className="py-3 px-4 text-slate-300">{incident.detail}</td>
                                            <td className="py-3 px-4 text-slate-300">{incident.duration}</td>
                                            <td className="py-3 pl-4 text-right">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                                    {incident.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                        <h2 className="text-xl font-semibold text-white mb-4">Compliance Roadmap</h2>
                        <div className="space-y-3 text-sm text-slate-200">
                            {milestones.map((item) => (
                                <div key={item} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                        <h2 className="text-xl font-semibold text-white mb-2">Get notified of incidents and maintenance</h2>
                        <p className="text-sm text-slate-400 mb-4">Stay ahead of uptime, incidents, and compliance milestones.</p>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="you@company.com"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                            />
                            <button className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(59,130,246,0.25)]">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
