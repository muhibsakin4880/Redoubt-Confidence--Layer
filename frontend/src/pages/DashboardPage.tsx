import { Link } from 'react-router-dom'
import { datasetRequests, recentActivity, participantTrust, trustLevel, activityDot } from '../data/workspaceData'

export default function DashboardPage() {
    const misusePenalty = participantTrust.misuseWarning ? participantTrust.misusePenalty : 0
    const netTrustScore = Math.max(participantTrust.score - misusePenalty, 0)
    const pendingRequests = datasetRequests.filter(item => item.status === 'Pending').length
    const approvedAccess = datasetRequests.filter(item => item.status === 'Approved').length
    const recentCount = recentActivity.length

    const trustProgress = Math.min(Math.max(netTrustScore, 0), 100)
    const trustCircumference = 2 * Math.PI * 42
    const trustOffset = trustCircumference - (trustProgress / 100) * trustCircumference

    const overviewCards = [
        {
            label: 'Trust Score',
            value: netTrustScore,
            helper: trustLevel(netTrustScore).label,
            gradient: 'from-emerald-500/20 via-emerald-400/10 to-slate-900',
            border: 'border-l-4 border-l-emerald-400',
            icon: '🛡️'
        },
        {
            label: 'Pending Requests',
            value: pendingRequests,
            helper: 'Action required',
            gradient: 'from-amber-500/20 via-amber-400/10 to-slate-900',
            border: 'border-l-4 border-l-amber-400',
            icon: '⏳'
        },
        {
            label: 'Approved Access',
            value: approvedAccess,
            helper: 'Active approvals',
            gradient: 'from-blue-500/20 via-blue-400/10 to-slate-900',
            border: 'border-l-4 border-l-blue-400',
            icon: '✅'
        },
        {
            label: 'Recent Activity',
            value: recentCount,
            helper: 'Last 7 days',
            gradient: 'from-purple-500/20 via-purple-400/10 to-slate-900',
            border: 'border-l-4 border-l-purple-400',
            icon: '📈'
        }
    ]

    const accessTrend = [40, 65, 35, 75, 85, 55, 70]
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-800">
                <div className="container mx-auto px-4 py-10 md:py-14 space-y-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs uppercase tracking-[0.12em] text-slate-300">
                            Participant Workspace
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold mb-2">Dashboard Overview</h1>
                            <p className="text-slate-300 max-w-2xl">
                                High-level workspace summary. Use sidebar modules for detailed access, trust, and approval management.
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {overviewCards.map(card => (
                            <div
                                key={card.label}
                                className={`rounded-xl border border-slate-800 ${card.border} bg-gradient-to-br ${card.gradient} p-4 shadow-lg`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{card.label}</div>
                                    <span className="text-lg" aria-hidden>
                                        {card.icon}
                                    </span>
                                </div>
                                {card.label === 'Trust Score' ? (
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="relative w-24 h-24">
                                            <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                                                <circle cx="50" cy="50" r="42" stroke="rgb(51 65 85)" strokeWidth="10" fill="none" />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="42"
                                                    stroke="rgb(52 211 153)"
                                                    strokeWidth="10"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={trustCircumference}
                                                    strokeDashoffset={trustOffset}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-emerald-300">
                                                {netTrustScore}/100
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-semibold text-emerald-300">{card.value}</div>
                                            <div className="text-xs text-slate-300">{card.helper}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline justify-between gap-3">
                                        <div className="text-3xl font-semibold">{card.value}</div>
                                        <div className="text-xs text-slate-400 text-right">{card.helper}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Recent Activity</h2>
                                <p className="text-slate-400 text-sm">Latest workflow events across requests and compliance.</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${trustLevel(netTrustScore).classes}`}>
                                Trust: {netTrustScore}
                            </span>
                        </div>

                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {recentActivity.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2.5">
                                    <div className="relative flex items-center justify-center">
                                        <span className={`inline-block w-3 h-3 rounded-full ${activityDot[item.type]}`} />
                                        <span className={`absolute inline-block w-5 h-5 rounded-full opacity-30 ${activityDot[item.type]}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{item.label}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{item.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <Link
                                to="/access-requests"
                                className="w-full inline-flex justify-center px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                            >
                                View All
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[#0a1628] border border-slate-700 rounded-2xl p-5 shadow-xl">
                        <h3 className="text-sm font-semibold text-slate-200 mb-4">Dataset Access Trend (last 7 days)</h3>
                        <div className="grid grid-cols-7 gap-3 items-end h-[22rem] p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                            {accessTrend.map((value, idx) => (
                                <div key={dayLabels[idx]} className="flex flex-col items-center justify-end gap-2 h-full">
                                    <div className="w-full rounded-md bg-slate-700/50 overflow-hidden">
                                        <div
                                            className="w-full rounded-md bg-gradient-to-t from-blue-600 to-cyan-400"
                                            style={{ height: `${Math.max(value, 12)}px` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400">{dayLabels[idx]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
