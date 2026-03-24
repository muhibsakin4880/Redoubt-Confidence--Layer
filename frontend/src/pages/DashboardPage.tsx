import { Link } from 'react-router-dom'
import { datasetRequests, participantTrust, trustLevel } from '../data/workspaceData'

export default function DashboardPage() {
    const misusePenalty = participantTrust.misuseWarning ? participantTrust.misusePenalty : 0
    const netTrustScore = Math.max(participantTrust.score - misusePenalty, 0)
    const pendingRequests = datasetRequests.filter(item => item.status === 'REVIEW_IN_PROGRESS').length
    const approvedAccess = datasetRequests.filter(item => item.status === 'REQUEST_APPROVED').length
    const trustSummary = trustLevel(netTrustScore)

    const executiveStats = [
        {
            id: 'entity-clearance',
            label: 'Entity Clearance Level',
            value: 'Tier-1 (Verified)',
            hint: 'Full access',
            tone: 'emerald'
        },
        {
            id: 'inbound-pipeline',
            label: 'Inbound Pipeline Requests',
            value: `${pendingRequests}`,
            hint: 'Awaiting review',
            tone: 'amber'
        },
        {
            id: 'active-escrows',
            label: 'Active Escrows',
            value: '2',
            hint: '1.4M Rows Processed this week',
            tone: 'cyan'
        },
        {
            id: 'threats-blocked',
            label: 'Threats & Anomalies Blocked',
            value: '0',
            hint: 'All clear',
            tone: 'emerald'
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
                        <h2 className="text-2xl font-bold text-white">Live Escrow Telemetry & Pipeline Traffic</h2>
                        <p className="text-sm text-slate-500">
                            Real-time API ping activity, data throughput, and anomaly detection
                        </p>
                    </div>
                    <div className="relative h-[280px] w-full rounded-2xl border border-white/10 bg-[#0a1628] p-4 overflow-hidden">
                        <div className="absolute inset-0 opacity-40">
                            <svg className="h-full w-full" preserveAspectRatio="none">
                                <defs>
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                                    </pattern>
                                    <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5"/>
                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05"/>
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                    <filter id="redGlow">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        </div>
                        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                                </linearGradient>
                            </defs>
                            <path 
                                d="M0,200 C30,180 60,160 90,140 C120,120 150,100 180,90 C210,80 240,70 270,55 C300,40 330,35 360,30 C390,25 420,20 450,25 C480,30 510,40 540,50 C570,60 600,75 630,85 C660,95 690,100 720,95 C750,90 780,80 810,75 C840,70 870,65 900,60 C930,55 960,50 990,48 C1020,46 1050,44 1080,42"
                                fill="url(#areaGradient)" 
                                stroke="#3b82f6" 
                                strokeWidth="3"
                                filter="url(#glow)"
                            />
                            <path 
                                d="M0,140 C60,135 120,130 180,125 C240,120 300,115 360,105 C420,95 480,85 540,80 C600,75 660,70 720,65 C780,60 840,55 900,52 C960,49 1020,48 1080,45"
                                fill="none" 
                                stroke="#64748b" 
                                strokeWidth="1.5" 
                                strokeDasharray="6 4"
                                opacity="0.7"
                            />
                            <circle cx="360" cy="55" r="6" fill="#ef4444" filter="url(#redGlow)">
                                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="720" cy="65" r="5" fill="#ef4444" filter="url(#redGlow)">
                                <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="1080" cy="42" r="4" fill="#ef4444" filter="url(#redGlow)">
                                <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                        <div className="absolute top-4 left-4 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                <span className="text-xs text-slate-400">Data Throughput</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-0.5 w-4 bg-slate-500" style={{ borderStyle: 'dashed' }} />
                                <span className="text-xs text-slate-400">API Pings</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                                <span className="text-xs text-slate-400">Anomalies Blocked</span>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">Throughput:</span>
                                <span className="font-mono text-blue-400">847 KB/s</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">Anomalies:</span>
                                <span className="font-mono text-red-400">3</span>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Live
                        </div>
                    </div>
                </section>

                <section className="mb-10 rounded-3xl border border-white/[0.06] bg-slate-900/50 p-6 backdrop-blur-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Immutable Audit Logs (Live)</h3>
                                <p className="text-xs text-slate-500">Real-time event stream from distributed ledger</p>
                            </div>
                        </div>
                        <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Streaming
                        </span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#0a1628]/80 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-xs uppercase tracking-[0.14em] text-slate-500">
                                    <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                                    <th className="px-4 py-3 text-left font-medium">Action Triggered</th>
                                    <th className="px-4 py-3 text-left font-medium">Node/Entity ID</th>
                                    <th className="px-4 py-3 text-left font-medium">Cryptographic Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-mono text-slate-400">10:42:18 AM</td>
                                    <td className="px-4 py-3 text-blue-300">Deep-Scan Initiated</td>
                                    <td className="px-4 py-3 font-mono text-slate-300">Node: #UAE-Alpha</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Cleared
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-mono text-slate-400">10:38:47 AM</td>
                                    <td className="px-4 py-3 text-red-300">API Exfiltration Blocked</td>
                                    <td className="px-4 py-3 font-mono text-slate-300">IP: 192.168.x.x</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-red-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                                            Geo-Fence Violation
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-mono text-slate-400">10:35:22 AM</td>
                                    <td className="px-4 py-3 text-cyan-300">Escrow Settlement</td>
                                    <td className="px-4 py-3 font-mono text-slate-300">Tx: #8F2A9C</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Verified
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-mono text-slate-400">10:31:05 AM</td>
                                    <td className="px-4 py-3 text-amber-300">Policy Refresh</td>
                                    <td className="px-4 py-3 font-mono text-slate-300">Policy: PDPL-v3</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Hash Confirmed
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-3xl border border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-2xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Active Compliance Surface</h3>
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
                                    className={`rounded-2xl border p-5 ${
                                        signal.label === 'Residency coverage'
                                            ? 'border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden'
                                            : 'border-white/10 bg-[#0a1628]'
                                    }`}
                                >
                                    {signal.label === 'Residency coverage' && (
                                        <div className="absolute inset-0 opacity-15">
                                            <svg className="h-full w-full" preserveAspectRatio="none">
                                                <defs>
                                                    <pattern id="world-map" width="60" height="30" patternUnits="userSpaceOnUse">
                                                        <circle cx="8" cy="15" r="1.5" fill="currentColor" className="text-emerald-400"/>
                                                        <circle cx="18" cy="12" r="1" fill="currentColor" className="text-emerald-400"/>
                                                        <circle cx="25" cy="18" r="1.2" fill="currentColor" className="text-emerald-400"/>
                                                        <circle cx="35" cy="8" r="0.8" fill="currentColor" className="text-emerald-400"/>
                                                        <circle cx="42" cy="14" r="1" fill="currentColor" className="text-emerald-400"/>
                                                        <circle cx="50" cy="10" r="1.3" fill="currentColor" className="text-emerald-400"/>
                                                        <circle cx="55" cy="16" r="0.7" fill="currentColor" className="text-emerald-400"/>
                                                        <path d="M5 15 Q15 10 25 15 T45 12 T58 18" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-emerald-400"/>
                                                        <path d="M8 20 Q20 18 35 22 T55 20" stroke="currentColor" strokeWidth="0.4" fill="none" className="text-emerald-400" opacity="0.6"/>
                                                        <circle cx="30" cy="20" r="2" fill="currentColor" className="text-emerald-300"/>
                                                        <circle cx="45" cy="22" r="1.5" fill="currentColor" className="text-cyan-400"/>
                                                    </pattern>
                                                </defs>
                                                <rect width="100%" height="100%" fill="url(#world-map)" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between relative z-10">
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{signal.label}</p>
                                        {signal.label === 'Residency coverage' && (
                                            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                                                UAE Local Enclave - Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 text-lg font-semibold text-white relative z-10">{signal.value}</p>
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

