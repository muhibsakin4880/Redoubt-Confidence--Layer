import { participantTrust, participantActivity, participantActivityStyles, trustLevel } from '../data/workspaceData'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const factorTooltips: Record<string, string> = {
    'Approved dataset participation': 'Based on number of successfully approved dataset access requests',
    'Positive feedback history': 'Ratings received from providers after dataset access',
    'Compliance adherence': 'Based on DUA acknowledgments and zero policy violations',
    'Responsible data usage': 'No misuse flags or policy violations detected',
    'Dataset contribution quality': 'Average confidence score of your contributed datasets',
    'Dispute / misuse penalties': 'Deductions from disputes raised against your account'
}

export default function TrustProfilePage() {
    const isNewUser = false
    const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null)
    const misusePenalty = participantTrust.misuseWarning ? participantTrust.misusePenalty : 0
    const netTrustScore = Math.max(participantTrust.score - misusePenalty, 0)

    if (isNewUser) {
        return (
            <div className="container mx-auto px-4 py-10 space-y-6 text-white">
                <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Trust Profile</h1>
                            <p className="text-slate-400 text-sm">Detailed trust score breakdown and participant activity history.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-500/10 border-blue-500/40 text-blue-200">
                            New Participant
                        </span>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-slate-300 text-sm">Trust score</div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-3xl font-semibold text-blue-300">40</div>
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-slate-600 rounded-full" style={{ width: '40%' }} />
                            </div>
                            <div className="text-xs text-slate-400">
                                Complete activities to build your trust score
                            </div>
                        </div>

                        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                                    <span>Approved dataset participation</span>
                                    <span className="text-xs text-slate-400">0%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">No activity yet</div>
                            </div>
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                                    <span>Positive feedback history</span>
                                    <span className="text-xs text-slate-400">0%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">No activity yet</div>
                            </div>
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                                    <span>Compliance adherence</span>
                                    <span className="text-xs text-slate-400">0%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Complete onboarding first</div>
                            </div>
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                                    <span>Responsible data usage</span>
                                    <span className="text-xs text-slate-400">0%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">No activity yet</div>
                            </div>
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                                    <span>Dataset contribution quality</span>
                                    <span className="text-xs text-slate-400">0%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">No contributions yet</div>
                            </div>
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                                    <span>Dispute / misuse penalties</span>
                                    <span className="text-xs text-slate-400">100%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Clean record ✓</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                        <div className="text-sm font-semibold text-slate-200 mb-3">Complete these to earn more points</div>
                        <div className="grid sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-slate-600 bg-slate-800" disabled />
                                <span className="text-slate-300">Verify corporate domain <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-200 text-[10px]">+15 points</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-slate-600 bg-slate-800" disabled />
                                <span className="text-slate-300">Upload first dataset <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-200 text-[10px]">+10 points</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-slate-600 bg-slate-800" disabled />
                                <span className="text-slate-300">Complete first access request <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-200 text-[10px]">+10 points</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-slate-600 bg-slate-800" disabled />
                                <span className="text-slate-300">Receive positive buyer feedback <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-200 text-[10px]">+5 points</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-slate-600 bg-slate-800" disabled />
                                <span className="text-slate-300">Maintain clean access history <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-200 text-[10px]">+10 points</span></span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm uppercase tracking-[0.12em] text-slate-400">Participant activity history</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-sm font-semibold text-slate-300 mb-1">No activity yet</div>
                        <div className="text-xs text-slate-500 max-w-xs">Your platform activity will appear here once you start using Redoubt</div>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-6 text-white">
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Trust Profile</h1>
                        <p className="text-slate-400 text-sm">Detailed trust score breakdown and participant activity history.</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${trustLevel(netTrustScore).classes}`}>
                        {trustLevel(netTrustScore).label}
                    </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-300 text-sm">Trust score</div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-semibold text-emerald-300">{netTrustScore}</div>
                                {misusePenalty > 0 && (
                                    <div className="text-xs text-rose-200 bg-rose-500/10 border border-rose-500/40 px-2 py-1 rounded-full">
                                        -{misusePenalty} penalty
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400" style={{ width: `${netTrustScore}%` }} />
                        </div>
                        <div className="text-xs text-slate-400">
                            {participantTrust.misuseWarning
                                ? (
                                    <div className="space-y-1">
                                        <span className="text-amber-200 bg-amber-500/10 border border-amber-500/40 rounded px-2 py-1 inline-block">
                                            {participantTrust.misuseWarning}
                                        </span>
                                        <div className="text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded px-2 py-1 inline-flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                                            Access privileges restricted until review.
                                        </div>
                                        <div className="text-xs text-slate-400">Warning shown on participant profile.</div>
                                    </div>
                                )
                                : 'No misuse penalties applied.'}
                        </div>
                        <Link
                            to="/trust-score-history"
                            className="mt-3 inline-flex items-center justify-center w-full py-2 rounded-lg border border-blue-400/50 text-blue-300 text-sm font-medium hover:bg-blue-500/10 transition-colors"
                        >
                            View Score History →
                        </Link>
                    </div>

                    <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
                        {participantTrust.factors.map(factor => (
                            <div key={factor.label} className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                                    <span className="flex items-center gap-1">
                                        {factor.label}
                                        <span 
                                            className="relative cursor-help"
                                            onMouseEnter={() => setHoveredTooltip(factor.label)}
                                            onMouseLeave={() => setHoveredTooltip(null)}
                                        >
                                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {hoveredTooltip === factor.label && (
                                                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-600 rounded-lg p-2 shadow-xl text-xs text-slate-300">
                                                    {factorTooltips[factor.label]}
                                                </div>
                                            )}
                                        </span>
                                    </span>
                                    <span className="text-xs text-slate-400">{factor.value}%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400" style={{ width: `${factor.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm uppercase tracking-[0.12em] text-slate-400">Participant activity history</h2>
                    <div className="text-xs text-slate-400">Access requests - Approvals - Contributions - Compliance</div>
                </div>

                <div className="relative border-l border-slate-800 pl-4 space-y-4">
                    {participantActivity.map((item, idx) => (
                        <div key={item.label} className="relative pl-4">
                            <span className={`absolute -left-2 top-2 inline-block w-3 h-3 rounded-full ${participantActivityStyles[item.type].dot}`} />
                            {idx !== participantActivity.length - 1 && (
                                <div className="absolute -left-[7px] top-5 h-full w-px bg-slate-800" aria-hidden />
                            )}
                            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                    <span className="uppercase tracking-[0.12em]">{participantActivityStyles[item.type].label}</span>
                                    <span>{item.ts}</span>
                                </div>
                                <div className="text-sm font-semibold text-white">{item.label}</div>
                                {item.detail && <div className="text-xs text-slate-400 mt-1">{item.detail}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
