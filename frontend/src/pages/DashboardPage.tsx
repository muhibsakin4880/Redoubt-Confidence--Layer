import { Link } from 'react-router-dom'
import { participantTrust } from '../data/workspaceData'

export default function DashboardPage() {
    const netTrustScore = 72
    const trustInterpretation = netTrustScore >= 80 ? 'Trusted Participant' : netTrustScore >= 60 ? 'Building Trust' : 'New Participant'
    const trustColor = netTrustScore >= 80 ? 'text-emerald-400' : netTrustScore >= 60 ? 'text-amber-400' : 'text-slate-400'
    
    const activeEscrows = 2
    
    const recentActivity = [
        { id: 1, action: 'Dataset access approved', time: '2 hours ago', status: 'success' },
        { id: 2, action: 'Escrow transaction completed', time: '5 hours ago', status: 'success' },
        { id: 3, action: 'Trust score updated', time: '1 day ago', status: 'success' }
    ]

    return (
        <div className="relative min-h-screen bg-slate-900 text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(59,130,246,0.08),transparent_45%)]" />

            <div className="relative mx-auto max-w-[1680px] px-8 py-10 lg:px-12">
                <header className="mb-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Participant Workspace
                            </div>
                            <h1 className="mt-5 text-5xl font-bold tracking-tight text-white lg:text-6xl">Dashboard</h1>
                            <p className="mt-3 text-lg text-slate-500">Enterprise-grade trust and access intelligence.</p>
                        </div>
                    </div>
                </header>

                <section className="mb-10">
                    <h2 className="text-xl font-bold text-white mb-5">What needs your attention</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {netTrustScore < 50 && (
                            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20">
                                        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-white">Complete Your Profile</span>
                                </div>
                                <p className="text-xs text-slate-400 mb-4">Add your organization details to improve your Trust Score</p>
                                <Link
                                    to="/profile"
                                    className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
                                >
                                    Go to Profile →
                                </Link>
                            </div>
                        )}

                        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20">
                                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-white">Browse Available Datasets</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">Explore verified datasets available for your use case</p>
                            <Link
                                to="/datasets"
                                className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                            >
                                Browse Datasets →
                            </Link>
                        </div>

                        {activeEscrows > 0 && (
                            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                                        <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-white">Check Active Escrows</span>
                                </div>
                                <p className="text-xs text-slate-400 mb-4">You have active escrow transactions awaiting confirmation</p>
                                <Link
                                    to="/escrow-center"
                                    className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300"
                                >
                                    Go to Escrow →
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="mb-10">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-shrink-0">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Trust Score</h3>
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${netTrustScore * 2.64} 264`}
                                        className={netTrustScore >= 80 ? 'text-emerald-500' : netTrustScore >= 60 ? 'text-amber-500' : 'text-slate-500'}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-4xl font-bold text-white">{netTrustScore}</span>
                                    <span className="text-xs text-slate-500">/ 100</span>
                                </div>
                            </div>
                            <p className={`text-center text-sm font-medium mt-3 ${trustColor}`}>{trustInterpretation}</p>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-4">How Redoubt Works</h3>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 text-sm font-bold mb-2">1</div>
                                    <p className="text-sm font-semibold text-white">Browse & Request</p>
                                    <p className="text-xs text-slate-500 mt-1">Explore verified datasets and submit access requests</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold mb-2">2</div>
                                    <p className="text-sm font-semibold text-white">Secure Escrow</p>
                                    <p className="text-xs text-slate-500 mt-1">Funds held securely until data transfer confirmed</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold mb-2">3</div>
                                    <p className="text-sm font-semibold text-white">Access Granted</p>
                                    <p className="text-xs text-slate-500 mt-1">Trust score unlocks more datasets and better rates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-8 lg:grid-cols-2">
                    <section className="rounded-2xl border border-white/10 bg-slate-800/30 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Active Escrows</h3>
                            <Link to="/escrow-center" className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5">
                                <div>
                                    <p className="text-sm font-medium text-white">Financial Records Q4</p>
                                    <p className="text-xs text-slate-500">$2,500 • Processing</p>
                                </div>
                                <span className="text-xs font-medium text-amber-400">In Progress</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5">
                                <div>
                                    <p className="text-sm font-medium text-white">Global Climate 2020-2024</p>
                                    <p className="text-xs text-slate-500">$1,200 • Awaiting Release</p>
                                </div>
                                <span className="text-xs font-medium text-cyan-400">Pending</span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-slate-800/30 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                            <Link to="/audit-trail" className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentActivity.map(activity => (
                                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-white/5">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                    <div className="flex-1">
                                        <p className="text-sm text-white">{activity.action}</p>
                                        <p className="text-xs text-slate-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}