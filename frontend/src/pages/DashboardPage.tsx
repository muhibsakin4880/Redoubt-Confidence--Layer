import { Link } from 'react-router-dom'
import { datasetRequests, participantTrust, trustLevel } from '../data/workspaceData'

export default function DashboardPage() {
    const misusePenalty = participantTrust.misuseWarning ? participantTrust.misusePenalty : 0
    const netTrustScore = Math.max(participantTrust.score - misusePenalty, 0)
    const pendingRequests = datasetRequests.filter(item => item.status === 'Pending').length
    const approvedAccess = datasetRequests.filter(item => item.status === 'Approved').length
    const trustSummary = trustLevel(netTrustScore)

    const executiveStats = [
        {
            id: 'trust-score',
            label: 'Trust Score',
            value: `${netTrustScore}%`,
            hint: trustSummary.label,
            tone: 'emerald'
        },
        {
            id: 'pending-requests',
            label: 'Pending Requests',
            value: `${pendingRequests}`,
            hint: 'Awaiting review',
            tone: 'amber'
        },
        {
            id: 'approved-access',
            label: 'Approved Access',
            value: `${approvedAccess}`,
            hint: 'Active approvals',
            tone: 'blue'
        },
        {
            id: 'active-escrows',
            label: 'Active Escrows',
            value: '2',
            hint: 'Payments protected',
            tone: 'cyan'
        }
    ]

    const executiveSignals = [
        {
            label: 'Trust posture',
            value: `${trustSummary.label} (${netTrustScore}%)`,
            tone: 'emerald'
        },
        {
            label: 'Access demand',
            value: `${pendingRequests} pending · ${approvedAccess} active`,
            tone: 'blue'
        },
        {
            label: 'Compliance health',
            value: 'No critical alerts',
            tone: 'emerald'
        },
        {
            label: 'Residency coverage',
            value: 'US-East + EU-West active',
            tone: 'cyan'
        }
    ]

    const coreLoopSteps = [
        {
            id: 1,
            title: 'Evaluate',
            icon: 'search',
            descriptionLines: ['Assess dataset trust', 'and confidence score']
        },
        {
            id: 2,
            title: 'Request',
            icon: 'file',
            descriptionLines: ['Submit access request', 'with purpose and risk scoring']
        },
        {
            id: 3,
            title: 'Consent',
            icon: 'shield',
            descriptionLines: ['Confirm legal basis', 'and escrow terms']
        },
        {
            id: 4,
            title: 'Access',
            icon: 'lock',
            descriptionLines: ['Controlled access via', 'RBAC and secure enclave']
        },
        {
            id: 5,
            title: 'Monitor',
            icon: 'eye',
            descriptionLines: ['Track usage, audit logs,', 'and policy compliance']
        },
        {
            id: 6,
            title: 'Resolve',
            icon: 'refresh',
            descriptionLines: ['Renew, revoke, or', 'dispute via escrow']
        }
    ]

    const statToneStyles: Record<string, string> = {
        emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
        amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
        blue: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
        cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
    }

    return (
        <div className="relative min-h-screen bg-[#010915] text-white overflow-x-hidden">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(59,130,246,0.08),transparent_45%)]" />
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(1,9,21,0.3)_100%)]" />

            <div className="relative mx-auto max-w-[1680px] px-8 py-10 lg:px-12">
                <header className="mb-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Participant Workspace
                            </div>
                            <h1 className="mt-5 text-5xl font-bold tracking-tight text-white lg:text-6xl">Dashboard</h1>
                            <p className="mt-3 text-lg text-slate-500">Enterprise-grade trust and access intelligence.</p>
                        </div>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-base font-semibold ${trustSummary.classes}`}>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            {trustSummary.label}
                        </span>
                    </div>
                </header>

                <div className="mb-10 flex items-center gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-6 py-4 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                        <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-emerald-300">All Systems Secure</p>
                        <p className="text-xs text-emerald-400/70">SOC2 Compliant • No breaches detected</p>
                    </div>
                </div>

                <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {executiveStats.map(stat => (
                        <div
                            key={stat.id}
                            className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statToneStyles[stat.tone]}`}>
                                    {stat.hint}
                                </span>
                            </div>
                            <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
                        </div>
                    ))}
                </section>

                <section className="mb-10 rounded-3xl border border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-2xl">
                    <div className="flex flex-col gap-2 mb-6">
                        <h2 className="text-2xl font-bold text-white">How Redoubt Works</h2>
                        <p className="text-sm text-slate-500">
                            Every data transaction follows this trust-enforced lifecycle
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-[960px] flex items-stretch gap-3">
                            {coreLoopSteps.map((step, index) => {
                                const isActive = step.id === 4
                                return (
                                    <div key={step.id} className="flex items-center gap-3">
                                        <div
                                            className={`w-[170px] rounded-2xl border p-4 transition-colors ${
                                                isActive
                                                    ? 'border-blue-500/50 bg-blue-500/12 shadow-[0_0_25px_rgba(59,130,246,0.2)]'
                                                    : 'border-white/[0.08] bg-slate-900/70'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span
                                                    className={`flex h-8 w-8 items-center justify-center rounded-xl border text-sm ${
                                                        isActive
                                                            ? 'border-blue-400/40 bg-blue-500/15 text-blue-200'
                                                            : 'border-white/10 bg-white/5 text-slate-300'
                                                    }`}
                                                >
                                                    {step.icon === 'search' && (
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5c1.93 0 3.68-.71 5.15-1.85z" />
                                                        </svg>
                                                    )}
                                                    {step.icon === 'file' && (
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h6l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 3v6h6" />
                                                        </svg>
                                                    )}
                                                    {step.icon === 'shield' && (
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
                                                        </svg>
                                                    )}
                                                    {step.icon === 'lock' && (
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.1 0 2 .9 2 2v2a2 2 0 11-4 0v-2c0-1.1.9-2 2-2z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V8a5 5 0 0110 0v3" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
                                                        </svg>
                                                    )}
                                                    {step.icon === 'eye' && (
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
                                                        </svg>
                                                    )}
                                                    {step.icon === 'refresh' && (
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 0115-6l2-2v6h-6l2-2a7 7 0 10-1 9" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className={`text-xs font-semibold ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                                                    Step {step.id}
                                                </span>
                                            </div>
                                            <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                                {step.title}
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                                <span className="block">{step.descriptionLines[0]}</span>
                                                <span className="block">{step.descriptionLines[1]}</span>
                                            </p>
                                        </div>
                                        {index < coreLoopSteps.length - 1 && (
                                            <span className="text-slate-600 text-xl">→</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-3xl border border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-2xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Executive Brief</h3>
                                <p className="mt-1 text-sm text-slate-500">High-level signals across trust, access, and risk.</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-400">
                                Updated today
                            </span>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {executiveSignals.map(signal => (
                                <div
                                    key={signal.label}
                                    className="rounded-2xl border border-white/10 bg-[#0a1628] p-5"
                                >
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{signal.label}</p>
                                    <p className="mt-3 text-lg font-semibold text-white">{signal.value}</p>
                                    <div className={`mt-3 h-1.5 rounded-full ${statToneStyles[signal.tone]}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-3xl border border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-2xl">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                                <p className="mt-1 text-sm text-slate-500">Jump to the most critical workflows.</p>
                            </div>
                            <div className="grid gap-3">
                                <Link
                                    to="/escrow-center"
                                    className="inline-flex items-center justify-between rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
                                >
                                    Escrow Center
                                    <span>→</span>
                                </Link>
                                <Link
                                    to="/audit-trail"
                                    className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
                                >
                                    Audit Trail
                                    <span>→</span>
                                </Link>
                                <Link
                                    to="/data-lineage"
                                    className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
                                >
                                    Data Lineage
                                    <span>→</span>
                                </Link>
                                <Link
                                    to="/guided-tour"
                                    className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
                                >
                                    Guided Tour
                                    <span>→</span>
                                </Link>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/[0.06] bg-slate-900/50 p-6 backdrop-blur-2xl">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">Compliance Snapshot</p>
                                    <p className="text-xs text-slate-500">Audit & escrow coverage</p>
                                </div>
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                    Healthy
                                </span>
                            </div>
                            <div className="mt-4 space-y-3 text-sm text-slate-300">
                                <div className="flex items-center justify-between">
                                    <span>Audit trail coverage</span>
                                    <span className="text-slate-100 font-semibold">100%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Escrow compliance</span>
                                    <span className="text-slate-100 font-semibold">Active</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Incident status</span>
                                    <span className="text-slate-100 font-semibold">No open incidents</span>
                                </div>
                            </div>
                        </section>
                    </aside>
                </section>
            </div>
        </div>
    )
}

