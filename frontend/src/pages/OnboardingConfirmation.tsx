import { useState } from 'react'
import { Link } from 'react-router-dom'

const SUBMISSION_META_STORAGE_KEY = 'Redoubt:onboarding:submissionMeta'
const generateReferenceId = () => `#BRE-2026-${Math.floor(1000 + Math.random() * 9000)}`

const formatSubmissionDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

export default function OnboardingConfirmation() {
    const stepTitles = [
        'Organization & Identity',
        'Intended Platform Usage',
        'Participation Intent',
        'Compliance Commitment',
        'Submission Confirmation'
    ]
    const [submissionMeta] = useState(() => {
        const stored = localStorage.getItem(SUBMISSION_META_STORAGE_KEY)
        if (!stored) {
            return {
                referenceId: generateReferenceId(),
                submittedDate: formatSubmissionDate(new Date())
            }
        }
        try {
            const parsed = JSON.parse(stored) as { referenceId?: string; submittedDate?: string }
            return {
                referenceId: parsed.referenceId || generateReferenceId(),
                submittedDate: parsed.submittedDate || formatSubmissionDate(new Date())
            }
        } catch {
            return {
                referenceId: generateReferenceId(),
                submittedDate: formatSubmissionDate(new Date())
            }
        }
    })

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Participant Onboarding</h1>
                    <p className="text-slate-400">Security and confidence infrastructure intake for controlled participation.</p>
                </div>

                <div className="mb-8 overflow-x-auto pb-1">
                    <div className="min-w-[760px] flex items-start">
                        {stepTitles.map((title, idx) => {
                            const currentStep = idx + 1
                            const active = currentStep === 5
                            const done = currentStep < 5
                            const connectorDone = currentStep < 5
                            return (
                                <div key={title} className="flex items-center flex-1 last:flex-none">
                                    <div className="w-32">
                                        <div
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                                                done
                                                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                                                    : active
                                                        ? 'border-blue-400 bg-blue-500/10 text-blue-200 shadow-[0_0_0_3px_rgba(59,130,246,0.25),0_0_18px_rgba(59,130,246,0.35)]'
                                                        : 'border-slate-700 bg-slate-900 text-slate-500'
                                            }`}
                                        >
                                            {done ? (
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
                                                currentStep
                                            )}
                                        </div>
                                        <div className="mt-2 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                                            Step {currentStep}
                                        </div>
                                        <div
                                            className={`mt-1 text-xs font-semibold leading-4 ${
                                                done ? 'text-emerald-200' : active ? 'text-blue-100' : 'text-slate-500'
                                            }`}
                                        >
                                            {title}
                                        </div>
                                    </div>
                                    {idx < stepTitles.length - 1 && (
                                        <div
                                            className={`h-[2px] flex-1 mx-2 rounded-full ${
                                                connectorDone ? 'bg-emerald-400/70' : 'bg-slate-700'
                                            }`}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-700/80 bg-[#0a1628]/85 backdrop-blur-md p-5 space-y-4 shadow-[0_16px_48px_rgba(2,8,23,0.45)]">
                    <div className="relative mx-auto w-36 h-36">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" />
                        <div className="absolute inset-1 rounded-full border-2 border-emerald-300/35 animate-ping" />
                        <div className="absolute inset-4 rounded-full border border-emerald-300/50" />
                        <div className="relative w-full h-full rounded-full bg-emerald-500/15 border-2 border-emerald-400/70 flex items-center justify-center text-emerald-300">
                            <svg viewBox="0 0 24 24" className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="2.75">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-white">Application Submitted Successfully</h2>
                        <p className="text-sm text-slate-300">
                            Your application is under review by the Redoubt trust committee.
                        </p>
                    </div>

                    <div className="bg-[#020817] border border-slate-700/80 rounded-xl p-4 md:p-5 space-y-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">Reference ID</span>
                            <span className="font-semibold text-slate-100">{submissionMeta.referenceId}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">Submitted</span>
                            <span className="font-semibold text-slate-100">{submissionMeta.submittedDate}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">Status</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-400/40 text-amber-200">
                                Pending Review
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">Estimated review time</span>
                            <span className="font-semibold text-slate-100">2-3 business days</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/55 border border-slate-700/80 rounded-xl p-4 md:p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-white">What happens next</h3>
                        <ol className="space-y-2 text-sm text-slate-300">
                            <li>1. Identity &amp; organization verification</li>
                            <li>2. Trust committee review</li>
                            <li>3. Access credentials issued via email</li>
                        </ol>
                    </div>

                    <div className="pt-1 flex flex-wrap gap-3">
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                        >
                            Return to Home
                        </Link>
                        <Link
                            to="/application-status"
                            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-200 hover:text-white font-semibold transition-colors"
                        >
                            Check Application Status
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

