import { useState } from 'react'
import { Link } from 'react-router-dom'

import { participantOnboardingPaths, participantOnboardingStepTitles } from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { emptySubmissionMeta, readSubmissionMeta } from '../onboarding/storage'

export default function OnboardingConfirmation() {
    const [submissionMeta] = useState(() => readSubmissionMeta(emptySubmissionMeta))

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.confirmation}>
            <OnboardingPageLayout
                activeStep={participantOnboardingStepTitles.length}
                progressVariant="connector"
            >
                <div className="rounded-xl border border-slate-700/80 bg-[#0a1628]/85 backdrop-blur-md p-5 space-y-4 shadow-[0_16px_48px_rgba(2,8,23,0.45)]">
                    <div className="relative mx-auto w-36 h-36">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" />
                        <div className="absolute inset-1 rounded-full border-2 border-emerald-300/35 animate-ping" />
                        <div className="absolute inset-4 rounded-full border border-emerald-300/50" />
                        <div className="relative w-full h-full rounded-full bg-emerald-500/15 border-2 border-emerald-400/70 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-24 h-24 text-emerald-400/20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                                </svg>
                            </div>
                            <svg viewBox="0 0 24 24" className="w-16 h-16 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-white">Zero-Trust Vetting Initiated</h2>
                        <p className="text-sm text-slate-300">
                            Your cryptographic footprint and legal mandate have been securely logged. The Redoubt Compliance Ops team is auditing your submission.
                        </p>
                    </div>

                    <div className="bg-[#020817] border border-slate-700/80 rounded-xl p-4 md:p-5 space-y-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">Reference ID</span>
                            <span className="font-semibold text-slate-100 font-mono">{submissionMeta.referenceId}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">Submitted</span>
                            <span className="font-semibold text-slate-100">{submissionMeta.submittedDate}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">Encryption State</span>
                            <span className="font-semibold text-emerald-400 font-mono text-xs">SHA-256 Secured</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">Status</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-400/40 text-amber-200">
                                Awaiting DPO Clearance
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
                            <li><span className="text-cyan-400 font-mono text-xs">[1]</span> Automated DNS & Corporate Entity Verification (KYB).</li>
                            <li><span className="text-cyan-400 font-mono text-xs">[2]</span> Human-in-the-loop DPO & Legal Mandate Audit.</li>
                            <li><span className="text-cyan-400 font-mono text-xs">[3]</span> Upon clearance, you will receive a Secure Enclave setup link via email to configure your cryptographic keys and vault access.</li>
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
                            to={participantOnboardingPaths.applicationStatus}
                            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-200 hover:text-white font-semibold transition-colors"
                        >
                            Check Application Status
                        </Link>
                    </div>
                </div>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}

