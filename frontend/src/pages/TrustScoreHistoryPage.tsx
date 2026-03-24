import { Link } from 'react-router-dom'
import { useState } from 'react'

const scoreHistory = [
    { month: 'Oct 2025', score: 40, change: 0, event: 'Starting score' },
    { month: 'Nov 2025', score: 48, change: +8, event: 'first dataset uploaded' },
    { month: 'Dec 2025', score: 55, change: +7, event: 'first access completed' },
    { month: 'Jan 2026', score: 62, change: +7, event: 'positive feedback' },
    { month: 'Feb 2026', score: 74, change: +12, event: 'compliance confirmed' },
    { month: 'Mar 2026', score: 80, change: +6, event: 'contribution approved' }
]

const scoreChangeLog = [
    { date: '2026-03-08', event: 'Contribution approved', change: 6, newScore: 80, category: 'Contribution', categoryColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { date: '2026-02-15', event: 'Compliance confirmation submitted', change: 8, newScore: 74, category: 'Compliance', categoryColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { date: '2026-02-10', event: 'Misuse flag: export attempt', change: -12, newScore: 66, category: 'Penalty', categoryColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { date: '2026-01-22', event: 'Positive feedback received', change: 7, newScore: 78, category: 'Feedback', categoryColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { date: '2026-01-10', event: 'Access request approved', change: 5, newScore: 71, category: 'Access', categoryColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { date: '2025-12-18', event: 'First access completed', change: 7, newScore: 66, category: 'Access', categoryColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { date: '2025-11-30', event: 'First dataset uploaded', change: 8, newScore: 59, category: 'Contribution', categoryColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { date: '2025-10-01', event: 'Identity verified — account created', change: 40, newScore: 40, category: 'Onboarding', categoryColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30' }
]

const milestones = [
    { title: 'First Access', description: 'Completed dataset access request', earned: 'Jan 2026', unlocked: true },
    { title: 'Contributor', description: 'Uploaded first dataset', earned: 'Nov 2025', unlocked: true },
    { title: 'Compliance Champion', description: 'Zero violations for 90 days', earned: 'Feb 2026', unlocked: true },
    { title: 'Elite Participant', description: 'Reach trust score of 90+', earned: null, unlocked: false, lockedReason: '10 points away' }
]

const penalties = [
    { date: '2026-02-10', reason: 'Export attempt outside approved scope', deduction: -12, status: 'Under review', statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30', resolution: 'Pending' }
]

export default function TrustScoreHistoryPage() {
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

    return (
        <div className="container mx-auto px-4 py-10 space-y-6 text-white">
            <Link
                to="/trust-profile"
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Trust Profile
            </Link>

            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold text-white">Trust Score History</h1>
                    <p className="text-slate-400 text-sm">Your trust score timeline, changes, and milestone achievements</p>
                </div>

                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4">Score Over Time</h2>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-end justify-between gap-2">
                            {scoreHistory.map((item, idx) => (
                                <div
                                    key={item.month}
                                    className="flex-1 flex flex-col items-center"
                                >
                                    <button
                                        onClick={() => setSelectedMonth(selectedMonth === item.month ? null : item.month)}
                                        className={`relative group ${selectedMonth === item.month ? 'z-10' : ''}`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-full transition-all ${
                                                selectedMonth === item.month
                                                    ? 'bg-blue-400 ring-4 ring-blue-400/30 scale-125'
                                                    : 'bg-emerald-400 hover:bg-emerald-300 hover:scale-110'
                                            }`}
                                            style={{ marginBottom: `${item.score / 4}px` }}
                                        />
                                        {selectedMonth === item.month && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-xl text-xs text-center z-20">
                                                <div className="font-semibold text-emerald-300">{item.score}</div>
                                                <div className="text-slate-400">{item.event}</div>
                                                {item.change !== 0 && (
                                                    <div className={item.change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                        {item.change > 0 ? '+' : ''}{item.change}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                    <div className="text-[10px] text-slate-400 mt-2 text-center">{item.month}</div>
                                    <div className="text-xs font-semibold text-emerald-300">{item.score}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Oct 2025</span>
                                <span>Current: 80/100</span>
                                <span>Mar 2026</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4">What Changed Your Score</h2>
                    <div className="border border-slate-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-900/90 text-xs uppercase text-slate-400">
                                    <tr>
                                        <th className="py-3 px-3 text-left font-medium">Date</th>
                                        <th className="py-3 px-3 text-left font-medium">Event</th>
                                        <th className="py-3 px-3 text-left font-medium">Change</th>
                                        <th className="py-3 px-3 text-left font-medium">New Score</th>
                                        <th className="py-3 px-3 text-left font-medium">Category</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                                    {scoreChangeLog.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-3 text-slate-400 font-mono text-xs">{item.date}</td>
                                            <td className="py-3 px-3 text-slate-200">{item.event}</td>
                                            <td className={`py-3 px-3 font-mono font-medium ${item.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {item.change > 0 ? '+' : ''}{item.change}
                                            </td>
                                            <td className="py-3 px-3 text-slate-300 font-mono">{item.newScore}</td>
                                            <td className="py-3 px-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs border ${item.categoryColor}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4">Achievements Unlocked</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {milestones.map((milestone, idx) => (
                            <div
                                key={idx}
                                className={`rounded-lg border p-4 ${
                                    milestone.unlocked
                                        ? 'bg-slate-900/70 border-emerald-500/30'
                                        : 'bg-slate-900/40 border-slate-700'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className={`text-lg ${milestone.unlocked ? '' : 'opacity-40'}`}>
                                        {milestone.unlocked ? '✅' : '🔒'}
                                    </span>
                                    <div className="flex-1">
                                        <div className={`font-semibold ${milestone.unlocked ? 'text-slate-200' : 'text-slate-400'}`}>
                                            {milestone.title}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">{milestone.description}</div>
                                        {milestone.earned && (
                                            <div className="text-xs text-emerald-400 mt-2">Earned: {milestone.earned}</div>
                                        )}
                                        {!milestone.unlocked && (
                                            <div className="text-xs text-amber-400 mt-2">{milestone.lockedReason}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-slate-200 mb-4">Penalties & Deductions</h2>
                    {penalties.length > 0 ? (
                        <div className="space-y-3">
                            {penalties.map((penalty, idx) => (
                                <div key={idx} className="bg-slate-900/70 border border-rose-500/30 rounded-lg p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="text-xs text-slate-400 mb-1">Date: {penalty.date}</div>
                                            <div className="text-sm text-slate-200">{penalty.reason}</div>
                                        </div>
                                        <div className="text-lg font-semibold text-rose-400">{penalty.deduction} points</div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${penalty.statusColor}`}>
                                            {penalty.status}
                                        </span>
                                        <span className="text-xs text-slate-500">Resolution: {penalty.resolution}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
                            <div className="text-emerald-400 text-sm">No penalties on record ✓</div>
                        </div>
                    )}
                </section>
            </section>
        </div>
    )
}
