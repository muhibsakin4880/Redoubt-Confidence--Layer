import React from 'react'

type StatusTone = 'ok' | 'warn' | 'alert'

const postureCards = [
    { title: 'Authentication', detail: 'Active — SAML/OIDC enabled', tone: 'ok' as StatusTone },
    { title: 'Encryption', detail: 'AES-256 at rest, TLS 1.3 in transit', tone: 'ok' as StatusTone },
    { title: 'DLP Monitoring', detail: 'Active — 0 violations today', tone: 'ok' as StatusTone },
    { title: 'Anomaly Detection', detail: 'Active — 2 alerts reviewed', tone: 'ok' as StatusTone },
    { title: 'Last Pentest', detail: 'March 2026 — No critical findings', tone: 'ok' as StatusTone },
    { title: 'Open Incidents', detail: '0 open — Last closed 14 days ago', tone: 'ok' as StatusTone }
]

const sessionSecurity = [
    { label: 'MFA enforcement', value: 'Enabled for all participants', tone: 'ok' as StatusTone },
    { label: 'Session timeout', value: '30 minutes idle', tone: 'ok' as StatusTone },
    { label: 'Active sessions today', value: '47', tone: 'ok' as StatusTone },
    { label: 'Failed login attempts', value: '3 (flagged)', tone: 'warn' as StatusTone }
]

const complianceCerts = [
    { label: 'SOC 2 Type II', value: 'AWS infrastructure reports available', tone: 'ok' as StatusTone },
    { label: 'HIPAA', value: 'AWS HIPAA-eligible service baseline', tone: 'ok' as StatusTone },
    { label: 'GDPR', value: 'Regional hosting and shared cloud controls', tone: 'ok' as StatusTone },
    { label: 'ISO 27001', value: 'AWS certified infrastructure baseline', tone: 'ok' as StatusTone }
]

const toneClasses: Record<StatusTone, string> = {
    ok: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    warn: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    alert: 'text-rose-300 bg-rose-500/10 border-rose-500/30'
}

const dotClasses: Record<StatusTone, string> = {
    ok: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    warn: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    alert: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
}

export default function SecurityOperationsPage() {
    return (
        <div className="relative min-h-screen bg-[#010915] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Security & Compliance
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Security Operations</h1>
                        <p className="mt-2 text-slate-400">
                            Illustrative security posture and shared cloud-control references for the Redoubt demo
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.18)]">
                        Continuous controls monitoring active
                    </div>
                </header>

                <section className="mt-10">
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.25),transparent_35%)]" />
                        <div className="relative flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                                <div>
                                    <p className="text-base font-semibold text-emerald-200">All Systems Secure</p>
                                    <p className="text-xs text-emerald-100/70">Continuous detection · Defense in depth</p>
                                </div>
                            </div>
                            <div className="text-xs font-medium text-emerald-100/70">Last updated: 2 minutes ago</div>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-2xl font-semibold text-white">Security Posture</h2>
                        <span className="text-xs text-slate-500">Real-time signals across core controls</span>
                    </div>
                    <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {postureCards.map(card => (
                            <article
                                key={card.title}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                            >
                                <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_40%)]" />
                                <div className="relative flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.14em] text-slate-500">Control</p>
                                        <h3 className="mt-2 text-xl font-semibold text-white">{card.title}</h3>
                                        <p className="mt-2 text-sm text-slate-300">{card.detail}</p>
                                    </div>
                                    <span
                                        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[card.tone]}`}
                                    >
                                        <span className={`h-2.5 w-2.5 rounded-full ${dotClasses[card.tone]}`} />
                                        {card.tone === 'ok' ? 'Active' : card.tone === 'warn' ? 'Attention' : 'Issue'}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="text-xl font-semibold text-white">Session Security</h2>
                            <span className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live policy enforcement
                            </span>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {sessionSecurity.map(item => (
                                <div key={item.label} className="rounded-xl border border-white/5 bg-white/5 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                                            <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                                        </div>
                                        <span className={`h-2.5 w-2.5 rounded-full ${dotClasses[item.tone]}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">RTO / RPO Targets</h2>
                                <p className="text-sm text-slate-400">Resilience posture</p>
                            </div>
                            <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses.ok}`}>
                                <span className={`h-2.5 w-2.5 rounded-full ${dotClasses.ok}`} />
                                Healthy
                            </span>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                <p className="text-sm text-slate-400">RTO</p>
                                <p className="text-base font-semibold text-white">4 hours</p>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                <p className="text-sm text-slate-400">RPO</p>
                                <p className="text-base font-semibold text-white">1 hour</p>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-200">Last DR test</p>
                                    <p className="text-xs text-emerald-100/70">February 2026 — Passed</p>
                                </div>
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="text-2xl font-semibold text-white">Shared Cloud Control References</h2>
                        <span className="text-xs text-slate-500">Infrastructure references under AWS shared responsibility</span>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {complianceCerts.map(cert => (
                            <div
                                key={cert.label}
                                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0a1628] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-white">{cert.label}</p>
                                    <p
                                        className={`text-xs font-medium ${
                                            cert.tone === 'warn' ? 'text-amber-300' : cert.tone === 'alert' ? 'text-rose-300' : 'text-emerald-300'
                                        }`}
                                    >
                                        {cert.value}
                                    </p>
                                </div>
                                <span
                                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClasses[cert.tone]}`}
                                >
                                    <span className={`h-2.5 w-2.5 rounded-full ${dotClasses[cert.tone]}`} />
                                    {cert.tone === 'warn' ? 'Review' : cert.tone === 'alert' ? 'Attention' : 'Reference'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                        These items are infrastructure-level references and should not be read as standalone Redoubt application certifications in this prototype.
                    </p>
                </section>
            </div>
        </div>
    )
}

