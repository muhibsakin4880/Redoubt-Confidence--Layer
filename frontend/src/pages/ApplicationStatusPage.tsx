import { useState } from 'react'
import { Link } from 'react-router-dom'

const SUBMISSION_META_STORAGE_KEY = 'breach:onboarding:submissionMeta'

const fallbackSubmissionMeta = {
    referenceId: 'Pending assignment',
    submittedDate: 'Not available'
}

type SubmissionMeta = {
    referenceId: string
    submittedDate: string
}

type TimelineStatus = 'complete' | 'active' | 'upcoming'

type TimelineStep = {
    title: string
    description: string
    status: TimelineStatus
}

const timelineSteps: TimelineStep[] = [
    {
        title: 'Application received',
        description: 'We have logged your submission and assigned a reference ID.',
        status: 'complete'
    },
    {
        title: 'Trust committee review',
        description: 'Security, compliance, and governance review is underway.',
        status: 'active'
    },
    {
        title: 'Access decision',
        description: 'Credentials are issued via email once the review is complete.',
        status: 'upcoming'
    }
]

const getSubmissionMeta = (): SubmissionMeta => {
    const stored = localStorage.getItem(SUBMISSION_META_STORAGE_KEY)
    if (!stored) return fallbackSubmissionMeta

    try {
        const parsed = JSON.parse(stored) as { referenceId?: string; submittedDate?: string }
        return {
            referenceId: parsed.referenceId || fallbackSubmissionMeta.referenceId,
            submittedDate: parsed.submittedDate || fallbackSubmissionMeta.submittedDate
        }
    } catch {
        return fallbackSubmissionMeta
    }
}

export default function ApplicationStatusPage() {
    const [submissionMeta] = useState(() => getSubmissionMeta())

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8 space-y-2">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Application Portal</p>
                    <h1 className="text-3xl font-bold">Application Status</h1>
                    <p className="text-slate-400">
                        Track your onboarding request and review progress with the Breach trust committee.
                    </p>
                </div>

                <div className="bg-[#020817] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-[0_24px_60px_rgba(2,8,23,0.55)]">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Reference ID</div>
                            <div className="text-2xl font-semibold text-white">{submissionMeta.referenceId}</div>
                            <div className="text-sm text-slate-400">Submitted {submissionMeta.submittedDate}</div>
                        </div>
                        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Status</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-400/40 text-blue-200">
                                    In review
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Estimated review time</span>
                                <span className="text-slate-100 font-semibold">2-3 business days</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Next update</span>
                                <span className="text-slate-100 font-semibold">Email notification</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Status timeline</h2>
                        <ul className="space-y-6">
                            {timelineSteps.map((step, index) => {
                                const isComplete = step.status === 'complete'
                                const isActive = step.status === 'active'
                                const indicatorClasses = isComplete
                                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                                    : isActive
                                        ? 'border-blue-400 bg-blue-500/10 text-blue-200 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]'
                                        : 'border-slate-700 bg-slate-900 text-slate-500'
                                const lineClasses = isComplete
                                    ? 'bg-emerald-400/70'
                                    : isActive
                                        ? 'bg-blue-500/70'
                                        : 'bg-slate-700'

                                return (
                                    <li key={step.title} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="relative">
                                                {isActive && (
                                                    <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                                                )}
                                                <div
                                                    className={`relative w-11 h-11 rounded-full border flex items-center justify-center text-sm font-semibold ${indicatorClasses}`}
                                                >
                                                    {isComplete ? (
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.75"
                                                        >
                                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                            </div>
                                            {index < timelineSteps.length - 1 && (
                                                <div className={`w-px flex-1 mt-2 ${lineClasses}`} />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                                                {isActive && (
                                                    <span className="text-[11px] uppercase tracking-[0.2em] text-blue-300">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400">{step.description}</p>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 flex flex-wrap gap-3">
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                        >
                            Return to Home
                        </Link>
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-200 hover:text-white font-semibold transition-colors"
                        >
                            Log in to view updates
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
