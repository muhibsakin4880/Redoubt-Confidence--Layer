import { Link, Navigate } from 'react-router-dom'

import {
    participantOnboardingEstimatedReviewTime,
    participantOnboardingNextSteps,
    participantOnboardingPaths,
    participantOnboardingPolicyPath,
    participantOnboardingReviewStatus
} from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import { getFirstIncompleteOnboardingPath, isIndividualParticipant, isStep4Complete, readOnboardingSnapshot } from '../onboarding/flow'
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

const getConfiguredLoginRoute = (authenticationMethod: string | null) => {
    if (authenticationMethod === 'sso') {
        return 'Login route: Okta / Microsoft Entra (SSO)'
    }

    if (authenticationMethod === 'hardware_key') {
        return 'Login route: Hardware key'
    }

    return 'Login route: Not selected'
}

const getConfiguredLoginKey = (nodeId: string) =>
    nodeId.trim().length > 0 ? `Primary credential: ${nodeId}` : 'Primary credential: Node ID not issued'

export default function OnboardingConfirmation() {
    const hasSubmission = hasStoredOnboardingValue(onboardingStorageKeys.submissionMeta)

    if (!hasSubmission) {
        return <Navigate to={getFirstIncompleteOnboardingPath() ?? participantOnboardingPaths.step5} replace />
    }

    const submissionMeta = readSubmissionMeta(emptySubmissionMeta)
    const snapshot = readOnboardingSnapshot()
    const verificationReady = isStep4Complete(snapshot.step1, snapshot.verification)
    const isIndividualPath = isIndividualParticipant(snapshot.step1)
    const authMethod = snapshot.verification.authenticationMethod
        ? authenticationMethodLabels[snapshot.verification.authenticationMethod]
        : 'Not selected'
    const verificationPackageStatus = verificationReady ? 'Ready for reviewer handoff' : 'Still missing required evidence'
    const verificationPackageClassName = verificationReady ? 'text-emerald-300' : 'text-amber-300'

    return (
        <OnboardingPageLayout
            headerWidth="canvas"
            headerTitle="Application Submitted"
            headerSubtitle="Your onboarding package has been staged for review and the next actions are now operational rather than form-driven."
            pageEyebrow="Participant onboarding · Submitted"
        >
            <div className="space-y-6">
                <section className="rounded-[28px] border border-amber-500/30 bg-[linear-gradient(180deg,rgba(120,53,15,0.24)_0%,rgba(15,23,42,0.9)_100%)] p-5 shadow-[0_22px_54px_rgba(120,53,15,0.2)] md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                                {participantOnboardingReviewStatus}
                            </span>
                            <h2 className="mt-4 text-2xl font-semibold text-white md:text-[1.85rem]">Application Submitted</h2>
                            <p className="mt-2 text-sm leading-7 text-slate-200 md:text-base">
                                Your mock participant application is queued for manual review, and the current verification package has been preserved from the demo flow.
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-300">
                                {isIndividualPath
                                    ? 'This individual onboarding path is still fully mock-driven, including the identity check, Node ID issuance, and hardware-key route.'
                                    : 'This organization onboarding path is still fully mock-driven, including DNS verification, Node ID issuance, and the configured post-approval sign-in route.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                                Typical review: {participantOnboardingEstimatedReviewTime}
                            </span>
                            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                                Updates arrive by email
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Reference ID</div>
                            <div className="mt-2 font-mono text-sm text-white">{submissionMeta.referenceId}</div>
                        </div>
                        <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Submitted</div>
                            <div className="mt-2 text-sm text-white">{submissionMeta.submittedDate}</div>
                        </div>
                        <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Configured Authentication</div>
                            <div className="mt-2 text-sm text-white">{authMethod}</div>
                            <div className="mt-2 text-xs leading-5 text-slate-300">
                                {getConfiguredLoginRoute(snapshot.verification.authenticationMethod)}
                            </div>
                            <div className="mt-1 text-xs leading-5 text-slate-300">
                                {getConfiguredLoginKey(snapshot.verification.nodeId)}
                            </div>
                        </div>
                        <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Verification Package</div>
                            <div className={`mt-2 text-sm font-semibold ${verificationPackageClassName}`}>
                                {verificationPackageStatus}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-[24px] border border-slate-700 bg-slate-800/65 p-5 shadow-[0_18px_44px_rgba(2,8,23,0.24)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-white">What Happens Next</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Status: {participantOnboardingReviewStatus}. Typical turnaround: {participantOnboardingEstimatedReviewTime}.
                            </p>
                        </div>
                        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            verificationReady
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                        }`}>
                            {verificationPackageStatus}
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {participantOnboardingNextSteps.map((step, index) => (
                            <div
                                key={step}
                                className="rounded-[20px] border border-slate-700 bg-slate-900/60 px-4 py-4 text-sm text-slate-300"
                            >
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                                    [{index + 1}]
                                </div>
                                <p className="mt-3 leading-7">{step}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex flex-wrap gap-3">
                    <Link
                        to={participantOnboardingPaths.applicationStatus}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        View Application Status
                    </Link>
                    {MOCK_AUTH && (
                        <Link
                            to="/login"
                            className="rounded-lg border border-emerald-500/45 bg-emerald-500/10 px-4 py-2.5 font-semibold text-emerald-200 transition-colors hover:border-emerald-400 hover:bg-emerald-500/15"
                        >
                            Open Participant Console
                        </Link>
                    )}
                    <Link
                        to="/"
                        className="rounded-lg border border-slate-600 px-4 py-2.5 font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                    >
                        Return to Homepage
                    </Link>
                    <Link
                        to={participantOnboardingPolicyPath}
                        className="rounded-lg border border-slate-600 px-4 py-2.5 font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                    >
                        Review Trust Center
                    </Link>
                </section>

                <p className="border-t border-white/8 pt-4 font-mono text-[11px] text-slate-600">
                    This remains a mock, demo-friendly onboarding flow. All application state shown here is driven from local demo data rather than a live review backend.
                </p>
            </div>
        </OnboardingPageLayout>
    )
}
