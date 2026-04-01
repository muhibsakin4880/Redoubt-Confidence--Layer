import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { participantOnboardingPaths } from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { buildSubmissionMeta } from '../onboarding/submission'
import {
    getFirstIncompleteOnboardingPath,
    isStep5Complete,
    readOnboardingSnapshot
} from '../onboarding/flow'
import {
    emptyComplianceCommitment,
    onboardingStorageKeys,
    readOnboardingValue,
    writeOnboardingValue,
    writeSubmissionMeta
} from '../onboarding/storage'
import type { ComplianceCommitment } from '../onboarding/types'

const reviewSectionClassName = 'rounded-xl border border-slate-700 bg-slate-900/70 p-4 space-y-3'
const detailLabelClassName = 'text-xs uppercase tracking-[0.18em] text-slate-500'
const detailValueClassName = 'text-sm text-slate-200'

export default function OnboardingStep5() {
    const navigate = useNavigate()
    const { submitApplication } = useAuth()
    const [state, setState] = useState<ComplianceCommitment>(() =>
        readOnboardingValue(onboardingStorageKeys.compliance, emptyComplianceCommitment)
    )
    const reviewSnapshot = useMemo(() => readOnboardingSnapshot(), [])

    const handleChange = (field: keyof ComplianceCommitment, value: boolean) => {
        const next = { ...state, [field]: value }
        setState(next)
        writeOnboardingValue(onboardingStorageKeys.compliance, next)
    }

    const stepReady = isStep5Complete(state)

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        const latestSnapshot = {
            ...readOnboardingSnapshot(),
            compliance: state
        }
        const firstIncompletePath = getFirstIncompleteOnboardingPath(latestSnapshot)

        if (firstIncompletePath) {
            navigate(firstIncompletePath)
            return
        }

        const submissionMeta = buildSubmissionMeta()

        writeSubmissionMeta(submissionMeta)
        submitApplication(latestSnapshot.step1.officialWorkEmail.trim())
        navigate(participantOnboardingPaths.confirmation)
    }

    const handleBack = () => {
        navigate(participantOnboardingPaths.step4)
    }

    const usageSummary = reviewSnapshot.intendedUsage.length > 0 ? reviewSnapshot.intendedUsage : ['No usage selected yet']
    const participationSummary =
        reviewSnapshot.participationIntent.length > 0
            ? reviewSnapshot.participationIntent
            : ['No participation path selected yet']

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step5}>
            <OnboardingPageLayout activeStep={5}>
                <form onSubmit={handleSubmit}>
                    <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-5 mb-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold">Final Review</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Confirm your onboarding details before submitting the application.
                                </p>
                            </div>
                            <span className="text-xs uppercase tracking-[0.14em] text-blue-200">Review Required</span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <article className={reviewSectionClassName}>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-base font-semibold text-white">Organization &amp; Identity</h3>
                                    <button
                                        type="button"
                                        onClick={() => navigate(participantOnboardingPaths.step1)}
                                        className="text-xs font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                                    >
                                        Edit Step 1
                                    </button>
                                </div>
                                <div>
                                    <div className={detailLabelClassName}>Organization</div>
                                    <div className={detailValueClassName}>{reviewSnapshot.step1.organizationName}</div>
                                </div>
                                <div>
                                    <div className={detailLabelClassName}>Work Email</div>
                                    <div className={detailValueClassName}>{reviewSnapshot.step1.officialWorkEmail}</div>
                                </div>
                                <div>
                                    <div className={detailLabelClassName}>Role</div>
                                    <div className={detailValueClassName}>{reviewSnapshot.step1.roleInOrganization}</div>
                                </div>
                                <div>
                                    <div className={detailLabelClassName}>Industry</div>
                                    <div className={detailValueClassName}>{reviewSnapshot.step1.industryDomain}</div>
                                </div>
                                <div>
                                    <div className={detailLabelClassName}>Country</div>
                                    <div className={detailValueClassName}>{reviewSnapshot.step1.country}</div>
                                </div>
                                <div>
                                    <div className={detailLabelClassName}>Invite Code</div>
                                    <div className={detailValueClassName}>
                                        {reviewSnapshot.step1.inviteCode.trim() || 'No invite code provided'}
                                    </div>
                                </div>
                            </article>

                            <article className={reviewSectionClassName}>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-base font-semibold text-white">Intended Usage</h3>
                                    <button
                                        type="button"
                                        onClick={() => navigate(participantOnboardingPaths.step2)}
                                        className="text-xs font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                                    >
                                        Edit Step 2
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {usageSummary.map(option => (
                                        <span
                                            key={option}
                                            className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200"
                                        >
                                            {option}
                                        </span>
                                    ))}
                                </div>
                            </article>

                            <article className={reviewSectionClassName}>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-base font-semibold text-white">Participation &amp; Legal</h3>
                                    <button
                                        type="button"
                                        onClick={() => navigate(participantOnboardingPaths.step3)}
                                        className="text-xs font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                                    >
                                        Edit Step 3
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {participationSummary.map(option => (
                                        <span
                                            key={option}
                                            className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200"
                                        >
                                            {option}
                                        </span>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <div className={detailValueClassName}>
                                        {reviewSnapshot.legalAcknowledgment.authorizedRepresentative
                                            ? 'Representative authority confirmed'
                                            : 'Representative authority still pending'}
                                    </div>
                                    <div className={detailValueClassName}>
                                        {reviewSnapshot.legalAcknowledgment.governancePolicyAccepted
                                            ? 'Governance policy accepted'
                                            : 'Governance policy still pending'}
                                    </div>
                                    <div className={detailValueClassName}>
                                        {reviewSnapshot.legalAcknowledgment.nonRedistributionAcknowledged
                                            ? 'Non-redistribution acknowledged'
                                            : 'Non-redistribution acknowledgment still pending'}
                                    </div>
                                </div>
                            </article>

                            <article className={reviewSectionClassName}>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-base font-semibold text-white">Verification &amp; Files</h3>
                                    <button
                                        type="button"
                                        onClick={() => navigate(participantOnboardingPaths.step4)}
                                        className="text-xs font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                                    >
                                        Edit Step 4
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className={detailValueClassName}>
                                        {reviewSnapshot.verification.linkedInConnected
                                            ? 'LinkedIn verification complete'
                                            : 'LinkedIn verification still pending'}
                                    </div>
                                    <div className={detailValueClassName}>
                                        {reviewSnapshot.verification.domainVerified
                                            ? 'DNS verification complete'
                                            : 'DNS verification still pending'}
                                    </div>
                                    <div>
                                        <div className={detailLabelClassName}>Affiliation File</div>
                                        <div className={detailValueClassName}>
                                            {reviewSnapshot.verification.affiliationFileName || 'No file uploaded'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={detailLabelClassName}>Authorization File</div>
                                        <div className={detailValueClassName}>
                                            {reviewSnapshot.verification.authorizationFileName || 'No file uploaded'}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4 mb-6">
                        <h2 className="text-xl font-semibold">Compliance Commitment</h2>
                        <p className="text-sm text-slate-400">
                            All commitments are required before application submission.
                        </p>

                        <label className="flex items-start gap-3 text-sm text-slate-200">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={state.responsibleDataUsage}
                                onChange={(e) => handleChange('responsibleDataUsage', e.target.checked)}
                            />
                            <span>I agree to responsible data usage.</span>
                        </label>

                        <label className="flex items-start gap-3 text-sm text-slate-200">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={state.noUnauthorizedSharing}
                                onChange={(e) => handleChange('noUnauthorizedSharing', e.target.checked)}
                            />
                            <span>I agree to no unauthorized sharing.</span>
                        </label>

                        <label className="flex items-start gap-3 text-sm text-slate-200">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={state.platformCompliancePolicies}
                                onChange={(e) => handleChange('platformCompliancePolicies', e.target.checked)}
                            />
                            <span>I agree to platform compliance policies.</span>
                        </label>
                    </section>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={!stepReady}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
