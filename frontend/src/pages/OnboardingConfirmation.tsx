import { Link, Navigate } from 'react-router-dom'

import {
    participantOnboardingEstimatedReviewTime,
    participantOnboardingNextSteps,
    participantOnboardingPaths,
    participantOnboardingPolicyPath,
    participantOnboardingReviewStatus
} from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import { getFirstIncompleteOnboardingPath, isStep4Complete, readOnboardingSnapshot } from '../onboarding/flow'
import {
    emptySubmissionMeta,
    hasStoredOnboardingValue,
    onboardingStorageKeys,
    readSubmissionMeta
} from '../onboarding/storage'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

const authenticationMethodLabels: Record<string, string> = {
    sso: 'Okta / Microsoft Entra (SSO)',
    hardware_key: 'Hardware Key (YubiKey / WebAuthn)'
}

export default function OnboardingConfirmation() {
    const hasSubmission = hasStoredOnboardingValue(onboardingStorageKeys.submissionMeta)

    if (!hasSubmission) {
        return <Navigate to={getFirstIncompleteOnboardingPath() ?? participantOnboardingPaths.step5} replace />
    }

    const submissionMeta = readSubmissionMeta(emptySubmissionMeta)
    const snapshot = readOnboardingSnapshot()
    const verificationReady = isStep4Complete(snapshot.verification)
    const authMethod = snapshot.verification.authenticationMethod
        ? authenticationMethodLabels[snapshot.verification.authenticationMethod]
        : 'Not selected'

    const verificationChecks = [
        {
            label: 'LinkedIn verification',
            complete: snapshot.verification.linkedInConnected
        },
        {
            label: 'Domain verification',
            complete: snapshot.verification.domainVerified
        },
        {
            label: 'Affiliation evidence uploaded',
            complete: Boolean(snapshot.verification.affiliationFileName)
        },
        {
            label: 'Authorization evidence uploaded',
            complete: Boolean(snapshot.verification.authorizationFileName)
        },
        {
            label: 'Authentication method selected',
            complete:
                Boolean(snapshot.verification.authenticationMethod) &&
                (snapshot.verification.authenticationMethod !== 'sso' ||
                    snapshot.verification.ssoDomain.trim().length > 0)
        }
    ]

    return (
        <OnboardingPageLayout
            headerWidth="canvas"
            headerTitle="Application Submitted"
            headerSubtitle="Your onboarding package has been staged for review and the next actions are now operational rather than form-driven."
            pageEyebrow="Participant onboarding · Submitted"
        >
            <section className="rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(120,53,15,0.28)_0%,rgba(15,23,42,0.88)_100%)] p-6 md:p-8 shadow-[0_24px_60px_rgba(120,53,15,0.24)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                        <span className="inline-flex items-center rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                            {participantOnboardingReviewStatus}
                        </span>
                        <div>
                            <h2 className="text-2xl font-semibold text-white md:text-3xl">Application Submitted</h2>
                            <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">
                                Your mock participant application is queued for manual review, and the current verification package has been preserved from the demo flow.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Reference ID</div>
                        <div className="mt-1 font-mono text-sm text-white">{submissionMeta.referenceId}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Submitted</div>
                        <div className="mt-1 font-mono text-sm text-white">{submissionMeta.submittedDate}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Authentication Method</div>
                        <div className="mt-1 text-sm text-white">{authMethod}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Verification Package</div>
                        <div className={`mt-1 text-sm font-semibold ${verificationReady ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {verificationReady ? 'Ready for reviewer handoff' : 'Still missing required evidence'}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold text-white">Verification Snapshot</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            This reflects the current mock onboarding state instead of a hardcoded placeholder.
                        </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        verificationReady
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                    }`}>
                        {verificationReady ? 'Verification complete' : 'Verification incomplete'}
                    </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {verificationChecks.map(check => (
                        <div key={check.label} className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-200">{check.label}</span>
                                <span className={check.complete ? 'text-emerald-300' : 'text-amber-300'}>
                                    {check.complete ? 'Complete' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold text-white">What Happens Next</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Status: {participantOnboardingReviewStatus}. Typical turnaround: {participantOnboardingEstimatedReviewTime}.
                        </p>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    {participantOnboardingNextSteps.map((step, index) => (
                        <div key={step} className="flex gap-3 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                            <span className="font-mono text-xs text-cyan-400">[{index + 1}]</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            </section>

            <p className="mt-6 font-mono text-xs text-slate-500">
                This remains a mock, demo-friendly onboarding flow. All application state shown here is driven from local demo data rather than a live review backend.
            </p>

            <section className="mt-6 flex flex-wrap gap-3">
                <Link
                    to={participantOnboardingPaths.applicationStatus}
                    className="rounded-lg border border-cyan-500 px-4 py-2 font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/10 hover:text-cyan-200"
                >
                    View Application Status
                </Link>
                {MOCK_AUTH && (
                    <Link
                        to="/login"
                        className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                    >
                        Open Participant Console
                    </Link>
                )}
                <Link
                    to="/"
                    className="rounded-lg border border-blue-500 px-4 py-2 font-semibold text-blue-400 transition-colors hover:bg-blue-500/10 hover:text-blue-300"
                >
                    Return to Homepage
                </Link>
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
