import { Link, Navigate } from 'react-router-dom'

import {
    participantOnboardingEstimatedReviewTime,
    participantOnboardingNextSteps,
    participantOnboardingPaths,
    participantOnboardingPolicyPath,
    participantOnboardingReviewStatus,
    participantOnboardingVerificationModel
} from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import { getFirstIncompleteOnboardingPath, readOnboardingSnapshot } from '../onboarding/flow'
import { emptySubmissionMeta, hasStoredOnboardingValue, onboardingStorageKeys, readSubmissionMeta } from '../onboarding/storage'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

export default function OnboardingConfirmation() {
    const hasSubmission = hasStoredOnboardingValue(onboardingStorageKeys.submissionMeta)

    if (!hasSubmission) {
        return <Navigate to={getFirstIncompleteOnboardingPath() ?? participantOnboardingPaths.step5} replace />
    }

    const submissionMeta = readSubmissionMeta(emptySubmissionMeta)
    const snapshot = readOnboardingSnapshot()

    return (
        <OnboardingPageLayout activeStep={6} progressVariant="connector">
            <section className="rounded-2xl border border-emerald-500/30 bg-[linear-gradient(180deg,rgba(6,78,59,0.28)_0%,rgba(15,23,42,0.88)_100%)] p-6 md:p-8 shadow-[0_24px_60px_rgba(6,78,59,0.24)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                        <span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                            Submission Complete
                        </span>
                        <div>
                            <h2 className="text-2xl font-semibold text-white md:text-3xl">Application Submitted</h2>
                            <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">
                                Your onboarding package is now in review. We have captured your identity, verification evidence, and compliance commitments without taking you out of the onboarding flow.
                            </p>
                        </div>
                    </div>

                    <div className="min-w-[15rem] rounded-xl border border-slate-700/80 bg-slate-950/45 p-4 text-sm text-slate-200">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Reference ID</div>
                        <div className="mt-2 text-xl font-semibold text-white">{submissionMeta.referenceId}</div>
                        <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Submitted</div>
                        <div className="mt-1">{submissionMeta.submittedDate}</div>
                    </div>
                </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
                <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Review Status</div>
                    <div className="mt-3 inline-flex rounded-full border border-blue-400/35 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                        {participantOnboardingReviewStatus}
                    </div>
                    <p className="mt-4 text-sm text-slate-300">
                        Estimated review time: <span className="font-semibold text-white">{participantOnboardingEstimatedReviewTime}</span>
                    </p>
                </article>

                <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Verification Model</div>
                    <div className="mt-3 text-lg font-semibold text-white">{participantOnboardingVerificationModel}</div>
                    <p className="mt-4 text-sm text-slate-300">
                        Review package received for <span className="font-semibold text-white">{snapshot.step1.organizationName}</span>.
                    </p>
                </article>

                <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Primary Contact</div>
                    <div className="mt-3 text-lg font-semibold text-white">{snapshot.step1.officialWorkEmail}</div>
                    <p className="mt-4 text-sm text-slate-300">
                        We will send decision updates and next steps to this address.
                    </p>
                </article>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-800/70 p-6 md:p-7">
                <h3 className="text-xl font-semibold text-white">What happens next</h3>
                <ol className="mt-5 space-y-3 text-sm text-slate-300">
                    {participantOnboardingNextSteps.map((step, index) => (
                        <li key={step} className="flex gap-3">
                            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 text-xs font-semibold text-cyan-200">
                                {index + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="mt-6 flex flex-wrap gap-3">
                <Link
                    to={participantOnboardingPaths.applicationStatus}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    View Application Status
                </Link>
                {MOCK_AUTH && (
                    <Link
                        to="/login"
                        className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                        Open Participant Console
                    </Link>
                )}
                <Link
                    to={participantOnboardingPolicyPath}
                    className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                >
                    Review Trust Center
                </Link>
            </section>
        </OnboardingPageLayout>
    )
}
