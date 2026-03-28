import React from 'react'
import AdminLayout from '../components/admin/AdminLayout'

type StepStatus = 'done' | 'current' | 'pending'

const incidentStats = [
    { label: 'Active Incidents', value: '0', hint: 'Live issues' },
    { label: 'Resolved This Month', value: '3', hint: 'Closed cases' },
    { label: 'Avg Resolution Time', value: '2.4 hours', hint: 'Mean time to resolve' },
    { label: 'SLA Breaches', value: '0', hint: 'Escalations' }
]

const runbookSteps = [
    {
        step: 'Step 1',
        title: 'Detect & Log',
        detail: 'Anomaly detected, audit log created',
        status: 'done' as StepStatus,
        time: 'Completed: 09:14:03'
    },
    {
        step: 'Step 2',
        title: 'Contain',
        detail: 'Session terminated, API key revoked',
        status: 'done' as StepStatus,
        time: 'Completed: 09:14:45'
    },
    {
        step: 'Step 3',
        title: 'Investigate',
        detail: 'Reviewing access logs and participant history',
        status: 'current' as StepStatus,
        time: 'In progress...'
    },
    {
        step: 'Step 4',
        title: 'Notify',
        detail: 'Notify affected participants and regulators if required',
        status: 'pending' as StepStatus,
        time: 'Pending'
    },
    {
        step: 'Step 5',
        title: 'Resolve & Report',
        detail: 'Close incident, update audit trail, generate report',
        status: 'pending' as StepStatus,
        time: 'Pending'
    }
]

const resolvedIncidents = [
    { id: 'INC-2026-0041', summary: 'Rate limit abuse', time: '1.2 hours', status: 'Resolved' },
    { id: 'INC-2026-0040', summary: 'Failed auth spike', time: '3.4 hours', status: 'Resolved' },
    { id: 'INC-2026-0039', summary: 'DLP policy trigger', time: '0.8 hours', status: 'Resolved' }
]

const stepTone: Record<StepStatus, string> = {
    done: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    current: 'border-blue-500/40 bg-blue-500/10 text-blue-100',
    pending: 'border-slate-600/40 bg-slate-800/40 text-slate-300'
}

const stepDot: Record<StepStatus, string> = {
    done: 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]',
    current: 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]',
    pending: 'bg-slate-500'
}

export default function IncidentResponsePage() {
    return (
        <AdminLayout title="INCIDENT RESPONSE" subtitle="RUNBOOK EXECUTION & SLA MANAGEMENT">
            <div className="relative -m-6 overflow-hidden bg-[#040812] px-6 py-10 text-white lg:px-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(251,191,36,0.08),transparent_40%)]" />
                <div className="relative mx-auto max-w-7xl">
                    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Security & Compliance
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Incident Response Center</h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Runbook execution, SLA tracking, and Redoubt notification management.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                        SLA compliance 100% - Last incident closed 14 days ago
                    </div>
                    </header>

                    <section className="mt-8">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-5 py-4 shadow-[0_12px_40px_rgba(16,185,129,0.2)]">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                                <div>
                                    <p className="text-sm font-semibold text-white">No Active Incidents - All systems operational</p>
                                    <p className="text-xs text-emerald-100/80">Last incident closed: 14 days ago</p>
                                </div>
                            </div>
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                                SLA compliance: 100%
                            </span>
                        </div>
                    </section>

                    <section className="mt-8">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {incidentStats.map(stat => (
                                <article
                                    key={stat.label}
                                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                                >
                                    <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%)]" />
                                    <div className="relative flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                                            <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                                            <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
                                        </div>
                                        <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-10">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Active Incidents</h2>
                                <p className="text-sm text-slate-400">Live response status and drill activity</p>
                            </div>
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                                No active incidents
                            </span>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_2fr]">
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                <div className="flex items-center gap-2 text-emerald-200">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500/20">
                                        <svg className="h-3.5 w-3.5 text-emerald-200" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 011.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                    <span className="text-sm font-semibold">No active incidents</span>
                                </div>
                                <p className="mt-2 text-xs text-emerald-100/70">
                                    Monitoring feeds are healthy. Waiting for new alerts.
                                </p>
                            </div>

                            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 shadow-[0_10px_30px_rgba(245,158,11,0.18)]">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Drill Mode</p>
                                        <h3 className="mt-2 text-lg font-semibold text-white">DRILL - INC-2026-0042</h3>
                                        <p className="text-sm text-amber-100/90">Simulated unauthorized access attempt</p>
                                    </div>
                                    <div className="rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100">
                                        SLA Clock: 03:47:12 remaining
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-2 text-sm text-amber-100/90 sm:grid-cols-2">
                                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                        <span>Severity</span>
                                        <span className="font-semibold text-white">High</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                        <span>Detected</span>
                                        <span className="font-semibold text-white">09:14:02</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                        <span>SLA deadline</span>
                                        <span className="font-semibold text-white">4 hours remaining</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                        <span>Assigned to</span>
                                        <span className="font-semibold text-white">Security Team</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                    </section>

                    <section className="mt-10 grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Incident Runbook - Unauthorized Access</h2>
                                <p className="text-sm text-slate-400">INC-2026-0042 response checklist</p>
                            </div>
                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                                Step 3 active
                            </span>
                        </div>

                        <div className="mt-5 space-y-4">
                            {runbookSteps.map(step => (
                                <div key={step.step} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className={`flex h-3 w-3 rounded-full ${stepDot[step.status]}`} />
                                        <span className="mt-2 h-full w-px bg-slate-700/80" />
                                    </div>
                                    <div className={`flex-1 rounded-xl border p-4 ${stepTone[step.status]}`}>
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{step.step}</p>
                                                <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                                            </div>
                                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80">
                                                {step.time}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-200">{step.detail}</p>
                                        {step.status === 'current' && (
                                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                                                Investigating...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Contact Roster</h2>
                                <p className="text-sm text-slate-400">Incident response contacts</p>
                            </div>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        </div>
                        <div className="mt-5 space-y-3 text-sm text-slate-200">
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <span>Security Lead</span>
                                <span className="font-semibold text-white">sec_lead_001</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <span>Compliance Officer</span>
                                <span className="font-semibold text-white">comp_off_002</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <span>Platform Admin</span>
                                <span className="font-semibold text-white">admin_003</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <span>Legal Counsel</span>
                                <span className="font-semibold text-white">legal_004</span>
                            </div>
                        </div>
                        <button className="mt-6 w-full rounded-xl border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 shadow-[0_12px_30px_rgba(244,63,94,0.24)] transition hover:bg-rose-500/20">
                            Notify All
                        </button>
                    </article>
                    </section>

                    <section className="mt-10">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Recent Resolved Incidents</h2>
                                <p className="text-sm text-slate-400">Closed within SLA this month</p>
                            </div>
                            <span className="text-xs text-slate-500">3 recent cases</span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-xl border border-white/5">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Incident</th>
                                        <th className="px-4 py-3 text-left">Summary</th>
                                        <th className="px-4 py-3 text-right">Resolution Time</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {resolvedIncidents.map(incident => (
                                        <tr key={incident.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-left font-medium text-white">{incident.id}</td>
                                            <td className="px-4 py-3 text-left text-slate-200">{incident.summary}</td>
                                            <td className="px-4 py-3 text-right text-slate-200">{incident.time}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                    {incident.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                    </section>
                </div>
            </div>
        </AdminLayout>
    )
}

