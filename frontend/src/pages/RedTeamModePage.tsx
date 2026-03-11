import React, { useState } from 'react'

type Scenario = {
    id: string
    title: string
    description: string
    resultTitle: string
}

const scenarios: Scenario[] = [
    {
        id: 'exfiltration',
        title: 'Unauthorized Data Exfiltration',
        description: 'Simulate bulk download attempt by unverified participant',
        resultTitle: 'Unauthorized Data Exfiltration'
    },
    {
        id: 'privilege',
        title: 'Privilege Escalation Attempt',
        description: 'Simulate access to restricted dataset without approval',
        resultTitle: 'Privilege Escalation Attempt'
    },
    {
        id: 'api-abuse',
        title: 'API Key Abuse',
        description: 'Simulate rapid API calls exceeding rate limits',
        resultTitle: 'API Key Abuse'
    }
]

const timeline = [
    { time: '09:14:01', text: 'Attack initiated: Bulk download request from part_anon_099', tone: 'neutral' as const },
    { time: '09:14:02', text: 'DLP policy triggered: Export volume exceeds threshold', tone: 'warn' as const },
    { time: '09:14:02', text: 'Access blocked: Request denied by policy engine', tone: 'alert' as const },
    { time: '09:14:03', text: 'Alert fired: Security team notified via SIEM', tone: 'warn' as const },
    { time: '09:14:03', text: 'Audit log entry created: Event hash a3f8...d291 recorded', tone: 'ok' as const }
]

const toneClasses = {
    neutral: 'text-slate-200',
    warn: 'text-amber-300',
    alert: 'text-rose-300',
    ok: 'text-emerald-300'
}

export default function RedTeamModePage() {
    const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)

    return (
        <div className="relative min-h-screen bg-[#010915] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(245,158,11,0.15),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(239,68,68,0.12),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                            Simulation Mode
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Red Team Simulation</h1>
                        <p className="mt-2 text-slate-300">
                            Live demonstration of Redoubt security controls under simulated attack
                        </p>
                    </div>
                    <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        All actions are logged and sandboxed
                    </div>
                </header>

                <section className="mt-8">
                    <div className="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-rose-500/10 px-6 py-4 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(245,158,11,0.25),transparent_35%)]" />
                        <div className="relative flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
                                <div>
                                    <p className="text-base font-semibold text-amber-100">Simulation Mode Active — No real data at risk</p>
                                    <p className="text-xs text-amber-100/80">Controls, alerts, and audit logging are live</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-10 grid gap-6 md:grid-cols-3">
                    {scenarios.map(s => (
                        <article
                            key={s.id}
                            className={`relative rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all hover:border-rose-400/60 hover:shadow-[0_10px_40px_rgba(244,63,94,0.25)] ${activeScenario?.id === s.id ? 'border-rose-400/80' : ''}`}
                        >
                            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_18%_18%,rgba(244,63,94,0.12),transparent_40%)]" />
                            <div className="relative flex flex-col gap-4">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.14em] text-slate-500">Scenario</p>
                                    <h3 className="mt-2 text-xl font-semibold text-white">{s.title}</h3>
                                    <p className="mt-2 text-sm text-slate-300">{s.description}</p>
                                </div>
                                <button
                                    onClick={() => setActiveScenario(s)}
                                    className="w-full rounded-xl border border-rose-400 text-rose-200 px-4 py-2 text-sm font-semibold hover:bg-rose-500/10 transition-colors"
                                >
                                    Run Simulation
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                {activeScenario && (
                    <section className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
                        <article className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.14em] text-slate-500">Simulation Results</p>
                                    <h3 className="text-2xl font-semibold text-white">Simulation Results — {activeScenario.resultTitle}</h3>
                                </div>
                                <span className="rounded-full border border-rose-400 bg-rose-500/10 px-4 py-1.5 text-xs font-bold text-rose-200">ATTACK BLOCKED</span>
                            </div>

                            <div className="mt-6 space-y-4">
                                {timeline.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                        <span className="text-xs font-mono text-slate-400 w-20">{item.time}</span>
                                        <p className={`text-sm ${toneClasses[item.tone]}`}>{item.text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                                <p className="text-sm text-slate-300">0 bytes exfiltrated — Audit trail preserved</p>
                                <span className="rounded-full border border-rose-400/50 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">Hash chain intact</span>
                            </div>
                        </article>

                        <aside className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                            <div className="flex items-center justify-between gap-3">
                                <h4 className="text-xl font-semibold text-white">Security Alerts</h4>
                                <span className="text-xs text-slate-500">Live feed</span>
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                                    <span className="text-lg">🔴</span>
                                    <div>
                                        <p className="text-white">DLP violation blocked</p>
                                        <p className="text-xs text-slate-400">09:14:02</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                                    <span className="text-lg">🟡</span>
                                    <div>
                                        <p className="text-white">Rate limit exceeded</p>
                                        <p className="text-xs text-slate-400">08:47:15</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                                    <span className="text-lg">🟡</span>
                                    <div>
                                        <p className="text-white">Failed auth attempt</p>
                                        <p className="text-xs text-slate-400">07:23:44</p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </section>
                )}
            </div>
        </div>
    )
}

