import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
    participantOnboardingEstimatedReviewTime,
    participantOnboardingNextSteps,
    participantOnboardingPolicyPath,
    participantOnboardingReviewStatus
} from '../onboarding/constants'
import { isStep4Complete, readOnboardingSnapshot } from '../onboarding/flow'
import { emptySubmissionMeta, readSubmissionMeta } from '../onboarding/storage'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

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
        title: 'Verification and compliance review',
        description: 'We are reviewing your organization identity, stated use case, and supporting authorization evidence.',
        status: 'active'
    },
    {
        title: 'Access decision',
        description: 'You will receive the application decision and next access steps by email.',
        status: 'upcoming'
    }
]

export default function ApplicationStatusPage() {
    const [submissionMeta] = useState(() => readSubmissionMeta(emptySubmissionMeta))
    const [snapshot] = useState(() => readOnboardingSnapshot())
    const verificationReady = isStep4Complete(snapshot.verification, snapshot.step1.officialWorkEmail)

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8 space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                            Application submitted
                        </span>
                    </div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Application Portal</p>
                    <h1 className="text-3xl font-bold">Application Status</h1>
                    <p className="text-slate-400">
                        Track your onboarding request as it moves through verification and compliance review.
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
                                    {participantOnboardingReviewStatus}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Estimated review time</span>
                                <span className="text-slate-100 font-semibold">{participantOnboardingEstimatedReviewTime}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Next update</span>
                                <span className="text-slate-100 font-semibold">Email notification</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Verification package</span>
                                <span className={`font-semibold ${verificationReady ? 'text-emerald-300' : 'text-amber-300'}`}>
                                    {verificationReady ? 'Ready for review' : 'Still incomplete'}
                                </span>
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
                                                             className="w-6 h-6"
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

                    <div className="bg-slate-900/55 border border-slate-700/80 rounded-xl p-4 md:p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-white">What happens next</h3>
                        <ol className="space-y-2 text-sm text-slate-300">
                            {participantOnboardingNextSteps.map((step, index) => (
                                <li key={step}>
                                    <span className="text-cyan-400 font-mono text-xs">[{index + 1}]</span> {step}
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="bg-slate-900/55 border border-slate-700/80 rounded-xl p-4 md:p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-white">Verification snapshot</h3>
                        <div className="grid gap-3 md:grid-cols-2 text-sm">
                            <div className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3">
                                <div className="text-slate-400">LinkedIn verification</div>
                                <div className={`mt-1 font-semibold ${snapshot.verification.linkedInConnected ? 'text-emerald-300' : 'text-amber-300'}`}>
                                    {snapshot.verification.linkedInConnected ? 'Complete' : 'Pending'}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3">
                                <div className="text-slate-400">Domain verification</div>
                                <div className={`mt-1 font-semibold ${snapshot.verification.domainVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
                                    {snapshot.verification.domainVerified ? 'Complete' : 'Pending'}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3">
                                <div className="text-slate-400">Affiliation evidence</div>
                                <div className={`mt-1 font-semibold ${snapshot.verification.affiliationFileName ? 'text-emerald-300' : 'text-amber-300'}`}>
                                    {snapshot.verification.affiliationFileName || 'Pending upload'}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3">
                                <div className="text-slate-400">Authorization evidence</div>
                                <div className={`mt-1 font-semibold ${snapshot.verification.authorizationFileName ? 'text-emerald-300' : 'text-amber-300'}`}>
                                    {snapshot.verification.authorizationFileName || 'Pending upload'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 flex flex-wrap gap-3">
                        {MOCK_AUTH && (
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                            >
                                Open Participant Console
                            </Link>
                        )}
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                        >
                            Return to Home
                        </Link>
                        <Link
                            to={participantOnboardingPolicyPath}
                            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-200 hover:text-white font-semibold transition-colors"
                        >
                            Review Trust Center
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

