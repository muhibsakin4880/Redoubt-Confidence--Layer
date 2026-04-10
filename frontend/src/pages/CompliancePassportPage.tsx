import { Link } from 'react-router-dom'
import {
    buildCompliancePassport,
    describeAccessMode,
    humanizePassportSectionKey,
    passportStatusMeta
} from '../domain/compliancePassport'

export default function CompliancePassportPage() {
    const passport = buildCompliancePassport()
    const statusMeta = passportStatusMeta(passport.status)

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.15),transparent_35%),radial-gradient(circle_at_82%_0%,rgba(59,130,246,0.1),transparent_32%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Reusable Compliance Passport
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Compliance Passport</h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            Reuse identity, legal, verification, and usage declarations as demo review context across access requests, rights quotes,
                            and governed checkout instead of re-entering the same diligence each time.
                        </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusMeta.classes}`}>
                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                        {statusMeta.label}
                    </div>
                </header>

                <section className="mt-8 rounded-3xl border border-white/10 bg-[#0a1526]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                                    Passport {passport.passportId}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                                    Issued {passport.issuedAt}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                                    Valid until {passport.validUntil}
                                </span>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <MetricCard label="Completion" value={`${passport.completionPercent}%`} detail={statusMeta.detail} tone="emerald" />
                                <MetricCard
                                    label="Reusable review context"
                                    value={passport.fastTrackEligible ? 'Ready' : 'Needs work'}
                                    detail={passport.fastTrackEligible ? 'Requests and quotes can reuse declared diligence context.' : 'Complete remaining sections to improve reviewer reuse.'}
                                    tone={passport.fastTrackEligible ? 'cyan' : 'amber'}
                                />
                                <MetricCard
                                    label="Preferred access mode"
                                    value={describeAccessMode(passport.preferredAccessMode)}
                                    detail={`${passport.defaultDuration} default term`}
                                    tone="blue"
                                />
                            </div>

                            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-100/90">
                                This passport organizes declarations and evidence references for demo review flows. It is not a compliance certification, legal opinion, or approval guarantee.
                            </div>

                            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Reusable Identity Snapshot</h2>
                                        <p className="mt-1 text-sm text-slate-400">
                                            The normalized profile that downstream requests and quotes can inherit.
                                        </p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-white"
                                    >
                                        Open profile
                                    </Link>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    <PassportField label="Organization" value={passport.organization.organizationName} />
                                    <PassportField label="Work email" value={passport.organization.officialWorkEmail} />
                                    <PassportField label="Role" value={passport.organization.roleInOrganization} />
                                    <PassportField label="Industry" value={passport.organization.industryDomain} />
                                    <PassportField label="Country" value={passport.organization.country} />
                                    <PassportField label="Invite code" value={passport.organization.inviteCode || 'Not provided'} />
                                </div>
                            </div>
                        </div>

                        <aside className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Reuse Privileges</h2>
                                    <p className="mt-1 text-sm text-emerald-100/75">What this passport unlocks right now.</p>
                                </div>
                                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
                                    Demo
                                </span>
                            </div>

                            <div className="mt-4 space-y-3">
                                {passport.benefits.map(benefit => (
                                    <div key={benefit.label} className="rounded-xl border border-white/10 bg-black/20 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-white">{benefit.label}</div>
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                                    benefit.active
                                                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                                                        : 'border-amber-400/40 bg-amber-500/15 text-amber-100'
                                                }`}
                                            >
                                                {benefit.active ? 'Enabled' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-200/80">{benefit.detail}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 grid gap-3">
                                <Link
                                    to="/datasets/1/rights-quote"
                                    className="rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.25)] hover:bg-cyan-400"
                                >
                                    Use In Rights Quote
                                </Link>
                                <Link
                                    to="/consent-tracker"
                                    className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white hover:border-emerald-400/50 hover:bg-white/5"
                                >
                                    Review Consent Evidence
                                </Link>
                            </div>
                        </aside>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-white/10 bg-[#0a1526]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Passport Coverage</h2>
                                <p className="mt-1 text-sm text-slate-400">Each section becomes reusable once it is fully satisfied.</p>
                            </div>
                            <Link
                                to="/onboarding"
                                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-white"
                            >
                                Revisit onboarding
                            </Link>
                        </div>

                        <div className="mt-5 space-y-4">
                            {passport.sections.map(section => (
                                <div key={section.key} className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                                {humanizePassportSectionKey(section.key)}
                                            </div>
                                            <div className="mt-1 text-base font-semibold text-white">{section.label}</div>
                                        </div>
                                        <span
                                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                                section.complete
                                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                                    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                                            }`}
                                        >
                                            {section.complete ? 'Reusable' : 'Missing detail'}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-300">{section.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                            <h2 className="text-xl font-semibold text-white">Declared Scope Defaults</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                These defaults are what the passport can feed into quote builder and request workflows.
                            </p>
                            <div className="mt-5 space-y-3">
                                <PassportField label="Usage summary" value={passport.usageSummary} />
                                <PassportField label="Use case summary" value={passport.useCaseSummary} />
                                <PassportField label="Participation intent" value={passport.participationIntent.join(', ')} />
                                <PassportField label="Preferred org type" value={passport.preferredOrgType} />
                                <PassportField label="Default term" value={passport.defaultDuration} />
                                <PassportField label="Preferred access" value={describeAccessMode(passport.preferredAccessMode)} />
                            </div>
                        </section>

                        <section className="rounded-3xl border border-cyan-500/25 bg-cyan-500/8 p-6 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                            <h2 className="text-xl font-semibold text-white">Why This Matters</h2>
                            <div className="mt-4 space-y-3 text-sm text-slate-200">
                                <p>Without a passport, each deal re-collects identity, governance, and verification data.</p>
                                <p>With a passport, review context becomes a reusable asset that lowers friction in requests, quotes, and checkout.</p>
                                <p>The quote builder now reads this passport directly, so pricing and reviewer readiness reflect declared diligence state rather than a legal guarantee.</p>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </div>
    )
}

function MetricCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: 'emerald' | 'cyan' | 'amber' | 'blue'
}) {
    const toneClasses = {
        emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
        cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
        amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
        blue: 'border-blue-500/30 bg-blue-500/10 text-blue-200'
    } as const

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${toneClasses[tone]}`}>{value}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{detail}</p>
        </div>
    )
}

function PassportField({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm text-slate-100">{value}</div>
        </div>
    )
}
