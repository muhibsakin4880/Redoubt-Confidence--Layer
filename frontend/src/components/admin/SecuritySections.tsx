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
    ok: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    warn: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    alert: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

const dotClasses: Record<StatusTone, string> = {
    ok: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    warn: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    alert: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
}

export function SystemStatusBanner() {
    return (
        <section>
            <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
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
    )
}

export function SecurityPostureGrid() {
    return (
        <section>
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-slate-100">Security Posture</h2>
                <span className="text-xs text-slate-500">Real-time signals across core controls</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {postureCards.map(card => (
                    <article
                        key={card.title}
                        className="relative overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                    >
                        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_40%)]" />
                        <div className="relative flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Control</p>
                                <h3 className="mt-2 text-sm font-semibold text-slate-100">{card.title}</h3>
                                <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
                            </div>
                            <span
                                className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${toneClasses[card.tone]}`}
                            >
                                <span className={`h-2 w-2.5 rounded-full ${dotClasses[card.tone]}`} />
                                {card.tone === 'ok' ? 'Active' : card.tone === 'warn' ? 'Attention' : 'Issue'}
                            </span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

export function SessionSecurityPanel() {
    return (
        <article className="rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Session Security</h2>
                <span className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live policy enforcement
                </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {sessionSecurity.map(item => (
                    <div key={item.label} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                                <p className="mt-1 text-xs font-semibold text-slate-200">{item.value}</p>
                            </div>
                            <span className={`h-2 w-2.5 rounded-full ${dotClasses[item.tone]}`} />
                        </div>
                    </div>
                ))}
            </div>
        </article>
    )
}

export function RTOPROPanel() {
    return (
        <article className="rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">RTO / RPO Targets</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">Resilience posture</p>
                </div>
                <span className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${toneClasses.ok}`}>
                    <span className={`h-2 w-2.5 rounded-full ${dotClasses.ok}`} />
                    Healthy
                </span>
            </div>
            <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                    <p className="text-[10px] text-slate-500">RTO</p>
                    <p className="text-xs font-semibold text-slate-200">4 hours</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                    <p className="text-[10px] text-slate-500">RPO</p>
                    <p className="text-xs font-semibold text-slate-200">1 hour</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                    <div>
                        <p className="text-[10px] font-semibold text-emerald-200">Last DR test</p>
                        <p className="text-[9px] text-emerald-100/70">February 2026 — Passed</p>
                    </div>
                    <span className="h-2 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
            </div>
        </article>
    )
}

export function ComplianceCertifications() {
    return (
        <section>
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-semibold text-slate-100">Compliance Certifications</h2>
                <span className="text-xs text-slate-500">Shared cloud-control references under AWS shared responsibility</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {complianceCerts.map(cert => (
                    <div
                        key={cert.label}
                        className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-900/60 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-200">{cert.label}</p>
                            <p
                                className={`text-xs font-medium ${
                                    cert.tone === 'warn' ? 'text-amber-300' : cert.tone === 'alert' ? 'text-rose-300' : 'text-emerald-300'
                                }`}
                            >
                                {cert.value}
                            </p>
                        </div>
                        <span
                            className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${toneClasses[cert.tone]}`}
                        >
                            <span className={`h-2 w-2.5 rounded-full ${dotClasses[cert.tone]}`} />
                            {cert.tone === 'warn' ? 'Review' : cert.tone === 'alert' ? 'Attention' : 'Reference'}
                        </span>
                    </div>
                ))}
            </div>
            <p className="mt-3 text-[10px] text-slate-500">
                These items are infrastructure-level references and should not be read as standalone Redoubt application certifications in this prototype.
            </p>
        </section>
    )
}
