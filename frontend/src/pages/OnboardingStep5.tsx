import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import {
    participantOnboardingEstimatedReviewTime,
    participantOnboardingNextSteps,
    participantOnboardingPaths,
    participantOnboardingPostSubmitPath,
    participantOnboardingReviewStatus,
    participantOnboardingVerificationSummary
} from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import {
    getFirstIncompleteOnboardingPath,
    hasAcceptedCorporateDomain,
    isIndividualParticipant,
    isStep1Complete,
    isStep2Complete,
    isStep3Complete,
    isStep4Complete,
    isStep5Complete,
    readOnboardingSnapshot
} from '../onboarding/flow'
import { buildSubmissionMeta } from '../onboarding/submission'
import {
    emptyComplianceCommitment,
    onboardingStorageKeys,
    readOnboardingValue,
    writeOnboardingValue,
    writeSubmissionMeta
} from '../onboarding/storage'
import type { AuthenticationMethod, ComplianceCommitment, Step1FormState } from '../onboarding/types'
import { doesCorporateDomainMatchEmail, getEmailDomain } from '../onboarding/validators'

type StatusTone = 'info' | 'neutral' | 'success' | 'warning'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

type Step2StructuredReviewState = {
    accessAudience: string
    evaluationContext: string
    primaryGoal: string
    sensitivityLevel: string
}

const step2StructuredStorageKey = 'Redoubt:onboarding:step2:structured'

const emptyStructuredState: Step2StructuredReviewState = {
    accessAudience: '',
    evaluationContext: '',
    primaryGoal: '',
    sensitivityLevel: ''
}

const submissionFormId = 'participant-onboarding-step5-submit'
const reviewSectionClassName =
    'rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(15,23,42,0.88)_100%)] p-6 shadow-[0_26px_60px_rgba(2,6,23,0.2)] backdrop-blur-sm sm:p-7 lg:p-8'
const reviewSubPanelClassName =
    'rounded-[28px] border border-white/10 bg-slate-950/76 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.16)] sm:p-6'
const detailLabelClassName = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500'
const detailValueClassName = 'mt-2 text-sm leading-6 text-slate-200'

const statusChipClassName: Record<StatusTone, string> = {
    info: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
    neutral: 'border-slate-600 bg-slate-800/90 text-slate-300',
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    warning: 'border-amber-400/35 bg-amber-500/10 text-amber-100'
}

const authenticationMethodLabels: Record<AuthenticationMethod, string> = {
    sso: 'Okta / Microsoft Entra (SSO)',
    hardware_key: 'Hardware key (YubiKey / WebAuthn)'
}

const getAuthenticationRouteSummary = (authenticationMethod: AuthenticationMethod | null) => {
    if (authenticationMethod === 'sso') {
        return 'Login route: Okta / Microsoft Entra (SSO)'
    }

    if (authenticationMethod === 'hardware_key') {
        return 'Login route: Hardware key'
    }

    return 'Login route: Not configured'
}

const getAuthenticationKeySummary = (nodeId: string) =>
    nodeId.trim().length > 0 ? `Primary credential: ${nodeId}` : 'Primary credential: Node ID not issued'

const possibleOutcomes = [
    {
        title: 'Approved',
        description: 'The request meets identity, governance, and verification requirements and can move into access provisioning.'
    },
    {
        title: 'Clarification required',
        description: 'Reviewers need an updated summary, replacement evidence, or a small governance clarification before approval.'
    },
    {
        title: 'Declined for now',
        description: 'The request does not yet meet trust, authorization, or scope requirements for protected access.'
    }
] as const

const commitmentItems = [
    {
        field: 'responsibleDataUsage',
        title: 'Responsible data usage',
        description: 'I will use approved data and environments only for the reviewed use case and within authorized scope.'
    },
    {
        field: 'noUnauthorizedSharing',
        title: 'No unauthorized sharing',
        description: 'I will not redistribute data, credentials, or outputs outside the approved reviewers, systems, or organization boundaries.'
    },
    {
        field: 'platformCompliancePolicies',
        title: 'Platform and compliance policy alignment',
        description: 'I will follow Redoubt platform controls, reviewer conditions, and my organization’s applicable compliance obligations.'
    }
] as const

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

function StatusChip({ label, tone }: { label: string; tone: StatusTone }) {
    return (
        <span
            className={cx(
                'inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                statusChipClassName[tone]
            )}
        >
            {label}
        </span>
    )
}

function ReviewDetail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className={detailLabelClassName}>{label}</div>
            <div className={detailValueClassName}>{value}</div>
        </div>
    )
}

function ReviewSection({
    children,
    description,
    onEdit,
    statusLabel,
    statusTone,
    stepLabel,
    title
}: {
    children: ReactNode
    description: string
    onEdit: () => void
    statusLabel: string
    statusTone: StatusTone
    stepLabel: string
    title: string
}) {
    return (
        <section className={reviewSectionClassName}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {stepLabel}
                    </div>
                    <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
                </div>

                <div className="flex items-center gap-2">
                    <StatusChip label={statusLabel} tone={statusTone} />
                    <button
                        type="button"
                        onClick={onEdit}
                        className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                    >
                        Edit
                    </button>
                </div>
            </div>

            <div className="mt-5">{children}</div>
        </section>
    )
}

export default function OnboardingStep5() {
    const navigate = useNavigate()
    const { submitApplication } = useAuth()
    const reviewSnapshot = useMemo(() => readOnboardingSnapshot(), [])
    const step1Data = reviewSnapshot.step1 as Step1FormState
    const structuredUseCase = useMemo(
        () => readOnboardingValue<Step2StructuredReviewState>(step2StructuredStorageKey, emptyStructuredState),
        []
    )
    const [state, setState] = useState<ComplianceCommitment>(() =>
        readOnboardingValue(onboardingStorageKeys.compliance, emptyComplianceCommitment)
    )

    const handleChange = (field: keyof ComplianceCommitment, value: boolean) => {
        const next = { ...state, [field]: value }
        setState(next)
        writeOnboardingValue(onboardingStorageKeys.compliance, next)
    }

    const step1Ready = isStep1Complete(reviewSnapshot.step1)
    const step2Ready = isStep2Complete(reviewSnapshot.intendedUsage, reviewSnapshot.useCaseSummary)
    const step3Ready = isStep3Complete(reviewSnapshot.participationIntent, reviewSnapshot.legalAcknowledgment)
    const step4Ready = isStep4Complete(reviewSnapshot.step1, reviewSnapshot.verification)
    const step5Ready = isStep5Complete(state)
    const allClear = step1Ready && step2Ready && step3Ready && step4Ready && step5Ready
    const commitmentCount = Object.values(state).filter(Boolean).length
    const isIndividualPath = isIndividualParticipant(step1Data)
    const contactEmail = step1Data.officialWorkEmail.trim() || 'your contact email'
    const expectedDomain = getEmailDomain(step1Data.officialWorkEmail)
    const domainMatchesWorkEmail = doesCorporateDomainMatchEmail(
        step1Data.officialWorkEmail,
        reviewSnapshot.verification.corporateDomain
    )
    const domainAccepted = hasAcceptedCorporateDomain(
        step1Data.officialWorkEmail,
        reviewSnapshot.verification.corporateDomain
    )
    const usageSummary =
        reviewSnapshot.intendedUsage.length > 0
            ? reviewSnapshot.intendedUsage.join(', ')
            : 'No intended workflow selections recorded.'
    const participationSummary =
        reviewSnapshot.participationIntent.length > 0
            ? reviewSnapshot.participationIntent.join(', ')
            : 'No participation mode selected.'
    const identitySectionTitle = isIndividualPath ? 'Participant identity' : 'Organization and participant identity'
    const identitySectionDescription = isIndividualPath
        ? 'Reviewers use this information to anchor the application to a clearly accountable individual participant.'
        : 'Reviewers use this information to anchor the application to a legitimate organization and a clearly accountable representative.'

    const readinessItems = [
        {
            label: isIndividualPath ? 'Participant identity record' : 'Organization and identity record',
            description: isIndividualPath
                ? 'Participant details, contact email, and identity context are ready for reviewer use.'
                : 'Representative details, corporate email, and organization context are ready for reviewer use.',
            complete: step1Ready,
            path: participantOnboardingPaths.step1
        },
        {
            label: 'Use case and access intent',
            description: 'Operational purpose and reviewer summary are defined.',
            complete: step2Ready,
            path: participantOnboardingPaths.step2
        },
        {
            label: 'Governance acknowledgments',
            description: 'Participation intent and governance confirmations are complete.',
            complete: step3Ready,
            path: participantOnboardingPaths.step3
        },
        {
            label: 'Verification packet',
            description: isIndividualPath
                ? 'Identity proof, evidence files, Node ID issuance, and the hardware-key authentication route are in place.'
                : 'Identity proof, domain alignment, evidence files, and the declared post-approval authentication method are in place.',
            complete: step4Ready,
            path: participantOnboardingPaths.step4
        },
        {
            label: 'Final commitments',
            description: 'Submission commitments are acknowledged immediately before submit.',
            complete: step5Ready,
            path: participantOnboardingPaths.step5
        }
    ] as const

    const missingItems = readinessItems.filter((item) => !item.complete)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const latestSnapshot = { ...readOnboardingSnapshot(), compliance: state }
        const firstIncompletePath = getFirstIncompleteOnboardingPath(latestSnapshot)

        if (firstIncompletePath) {
            navigate(firstIncompletePath)
            return
        }

        const submissionMeta = buildSubmissionMeta()
        writeSubmissionMeta(submissionMeta)
        submitApplication(latestSnapshot.step1.officialWorkEmail.trim())
        navigate(participantOnboardingPostSubmitPath)
    }

    const helperPanel = (
        <div className="sticky top-8 flex flex-col gap-5 lg:pl-3 xl:h-full xl:min-h-full xl:gap-0">
            <section className="overflow-hidden rounded-[34px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.94)_0%,rgba(15,23,42,0.96)_100%)] shadow-[0_28px_68px_rgba(8,47,73,0.22)] backdrop-blur-sm">
                <div className="px-6 py-6 sm:px-7 sm:py-7">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                        Submission readiness
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                {allClear ? 'All clear for final submit' : 'Final checks still pending'}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-slate-200">
                                {allClear
                                    ? 'The packet is complete and the request can move into manual trust and compliance review as soon as you confirm the final commitments.'
                                    : 'Use the checklist below to close the remaining items before submitting the application package.'}
                            </p>
                        </div>
                        <StatusChip
                            label={allClear ? 'Ready' : `${missingItems.length} remaining`}
                            tone={allClear ? 'success' : 'warning'}
                        />
                    </div>

                    <div className="mt-6 overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="border-b border-white/10 px-5 py-5">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                Checklist status
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">
                                {readinessItems.filter((item) => item.complete).length}/{readinessItems.length} items ready
                            </div>
                            <p className="mt-2 text-sm text-slate-300">
                                Status becomes {participantOnboardingReviewStatus.toLowerCase()} immediately after submission.
                            </p>
                        </div>

                        <div className="px-5 py-5">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                Decision contact
                            </div>
                            <div className="mt-2 break-all text-base font-semibold text-white">{contactEmail}</div>
                            <p className="mt-2 text-sm text-slate-300">
                                Review decisions and clarification requests are sent to the submitting contact address.
                            </p>
                        </div>
                    </div>

                    <div
                        className={cx(
                            'mt-4 rounded-2xl border px-4 py-3 text-sm',
                            allClear
                                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
                                : 'border-amber-400/30 bg-amber-500/10 text-amber-100'
                        )}
                    >
                        {allClear
                            ? 'All required sections are present. Confirm the commitments below to submit with confidence.'
                            : missingItems.length === 1
                                ? `One item still needs attention before submit: ${missingItems[0]?.label}.`
                                : `${missingItems.length} items still need attention before the packet can be submitted.`}
                    </div>
                </div>

                <div className="border-t border-white/10 px-6 py-6 sm:px-7 sm:py-7">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Readiness checklist
                    </div>
                    <div className="mt-4 space-y-4">
                        {readinessItems.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-[24px] border border-slate-800/90 bg-slate-950/78 p-5 shadow-[0_16px_36px_rgba(2,6,23,0.18)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-white">{item.label}</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                                    </div>
                                    <StatusChip
                                        label={item.complete ? 'Ready' : 'Missing'}
                                        tone={item.complete ? 'success' : 'warning'}
                                    />
                                </div>

                                {!item.complete && item.path !== participantOnboardingPaths.step5 && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(item.path)}
                                        className="mt-4 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                                    >
                                        Review section
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-slate-900/82 p-6 shadow-[0_24px_56px_rgba(2,6,23,0.24)] backdrop-blur-sm sm:p-7 xl:mt-auto">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Final commitments
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-white">
                            Confirm the last trust and usage commitments
                        </h3>
                    </div>
                    <StatusChip
                        label={`${commitmentCount}/${commitmentItems.length} confirmed`}
                        tone={step5Ready ? 'success' : 'warning'}
                    />
                </div>

                <div className="mt-5 space-y-4">
                    {commitmentItems.map((item) => {
                        const checked = state[item.field]

                        return (
                            <label
                                key={item.field}
                                className={cx(
                                    'flex cursor-pointer gap-4 rounded-[24px] border p-5 transition-colors',
                                    checked
                                        ? 'border-emerald-400/30 bg-emerald-500/10'
                                        : 'border-slate-800 bg-slate-950/75 hover:border-slate-700'
                                )}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => handleChange(item.field, event.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-blue-500 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-white">{item.title}</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                                </div>
                            </label>
                        )
                    })}
                </div>

                <div className="mt-5 space-y-3">
                    <button
                        type="submit"
                        form={submissionFormId}
                        disabled={!allClear}
                        className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Submit application for review
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(participantOnboardingPaths.step4)}
                        className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                    >
                        Back to verification packet
                    </button>
                </div>
            </section>
        </div>
    )

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step5}>
            <OnboardingPageLayout
                activeStep={5}
                showDefaultHelperPanel={false}
                helperPanel={helperPanel}
                headerTitle="Final Review & Submission"
                headerSubtitle="Review the complete onboarding packet, confirm the final commitments, and submit the application with a clear view of what reviewers will assess next."
                pageEyebrow="Participant onboarding · Final review"
                progressVariant="connector"
            >
                <form id={submissionFormId} onSubmit={handleSubmit} className="space-y-10 lg:space-y-12">
                    <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86)_0%,rgba(2,6,23,0.74)_100%)] p-7 shadow-[0_26px_68px_rgba(2,6,23,0.22)] backdrop-blur-sm sm:p-8 lg:p-10">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-3xl">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Submission packet
                                </div>
                                <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight text-white sm:text-[2.15rem]">
                                    Final reviewer snapshot before manual review
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-slate-300">
                                    This is the final confidence check before your onboarding package enters manual trust
                                    and compliance review. Use the editable sections below to verify that identity,
                                    use-case context, governance inputs, and verification evidence still reflect the
                                    request you want reviewed.
                                </p>
                            </div>

                            <StatusChip
                                label={allClear ? 'Submission ready' : 'Review required'}
                                tone={allClear ? 'success' : 'warning'}
                            />
                        </div>

                        <div className="mt-8 grid gap-4 lg:grid-cols-3">
                            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(2,6,23,0.16)]">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    Review lane
                                </div>
                                <div className="mt-2 text-lg font-semibold text-white">Trust and compliance</div>
                                <p className="mt-3 text-sm leading-7 text-slate-400">
                                    This final step packages the request for the reviewer team that approves protected access.
                                </p>
                            </div>

                            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(2,6,23,0.16)]">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    Review timing
                                </div>
                                <div className="mt-2 text-lg font-semibold text-white">
                                    {participantOnboardingEstimatedReviewTime}
                                </div>
                                <p className="mt-3 text-sm leading-7 text-slate-400">
                                    Typical turnaround once the packet is submitted without missing reviewer signals.
                                </p>
                            </div>

                            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(2,6,23,0.16)]">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    Decision contact
                                </div>
                                <div className="mt-2 break-all text-lg font-semibold text-white">{contactEmail}</div>
                                <p className="mt-3 text-sm leading-7 text-slate-400">
                                    Clarifications, approvals, and next-step instructions are sent here.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={reviewSectionClassName}>
                        <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                            <div className={reviewSubPanelClassName}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                            Step 1 · Identity
                                        </div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">{identitySectionTitle}</h2>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                                            {identitySectionDescription}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusChip
                                            label={step1Ready ? 'Ready' : 'Needs review'}
                                            tone={step1Ready ? 'success' : 'warning'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => navigate(participantOnboardingPaths.step1)}
                                            className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                                    <ReviewDetail
                                        label={isIndividualPath ? 'Joining as' : 'Organization'}
                                        value={step1Data.organizationName || 'Not provided'}
                                    />
                                    <ReviewDetail
                                        label={isIndividualPath ? 'Portfolio or website' : 'Organization website'}
                                        value={step1Data.organizationWebsite?.trim() || 'Not provided'}
                                    />
                                    <ReviewDetail
                                        label={isIndividualPath ? 'Participant role' : 'Representative role / team'}
                                        value={step1Data.roleInOrganization || 'Not provided'}
                                    />
                                    <ReviewDetail
                                        label={isIndividualPath ? 'Contact email' : 'Official work email'}
                                        value={step1Data.officialWorkEmail || 'Not provided'}
                                    />
                                    <ReviewDetail
                                        label="Industry or domain"
                                        value={step1Data.industryDomain || 'Not provided'}
                                    />
                                    <ReviewDetail
                                        label="Primary operating region"
                                        value={step1Data.country || 'Not provided'}
                                    />
                                </div>

                                <div className="mt-6 rounded-[22px] border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                                    Join path: {isIndividualPath ? 'Individual' : 'Organization'}
                                    <span className="mx-2 text-slate-500">•</span>
                                    Invite code: {step1Data.inviteCode.trim() || 'None supplied. The current flow still allows submission without one.'}
                                </div>
                            </div>

                            <div className={reviewSubPanelClassName}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                            Step 2 · Use case
                                        </div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">
                                            Requested use case and participation context
                                        </h2>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                                            This section gives reviewers the operational purpose behind the request and the context needed to judge whether the requested access is appropriate.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusChip
                                            label={step2Ready ? 'Ready' : 'Needs review'}
                                            tone={step2Ready ? 'success' : 'warning'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => navigate(participantOnboardingPaths.step2)}
                                            className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                                    <div className="rounded-[22px] border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Reviewer summary
                                        </div>
                                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-200">
                                            {reviewSnapshot.useCaseSummary.trim() || 'No reviewer summary provided.'}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-[22px] border border-slate-800 bg-slate-900/70 p-4">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                Requested workflow
                                            </div>
                                            <p className="mt-3 text-sm leading-6 text-slate-200">{usageSummary}</p>
                                        </div>

                                        <div className="rounded-[22px] border border-slate-800 bg-slate-900/70 p-4">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                Structured review context
                                            </div>
                                            <div className="mt-3 space-y-3">
                                                <ReviewDetail
                                                    label="Primary goal"
                                                    value={structuredUseCase.primaryGoal || 'Not specified'}
                                                />
                                                <ReviewDetail
                                                    label="Sensitivity level"
                                                    value={structuredUseCase.sensitivityLevel || 'Not specified'}
                                                />
                                                <ReviewDetail
                                                    label="Who will use access"
                                                    value={structuredUseCase.accessAudience || 'Not specified'}
                                                />
                                                <ReviewDetail
                                                    label="Evaluation context"
                                                    value={structuredUseCase.evaluationContext || 'Not specified'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <ReviewSection
                        stepLabel="Step 3 · Governance"
                        title="Participation intent and governance acknowledgments"
                        description={
                            isIndividualPath
                                ? 'These signals tell reviewers how the participant intends to participate and whether the submitter has already accepted the required governance boundaries.'
                                : 'These signals tell reviewers how the organization intends to participate and whether the submitter has already accepted the required governance boundaries.'
                        }
                        statusLabel={step3Ready ? 'Ready' : 'Needs review'}
                        statusTone={step3Ready ? 'success' : 'warning'}
                        onEdit={() => navigate(participantOnboardingPaths.step3)}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Participation mode
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-200">{participationSummary}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Acknowledgment status
                                </div>
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-slate-200">
                                            {isIndividualPath ? 'Accountable participant confirmation' : 'Authorized representative confirmation'}
                                        </span>
                                        <StatusChip
                                            label={
                                                reviewSnapshot.legalAcknowledgment.authorizedRepresentative
                                                    ? 'Confirmed'
                                                    : 'Missing'
                                            }
                                            tone={
                                                reviewSnapshot.legalAcknowledgment.authorizedRepresentative
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-slate-200">Governance policy acceptance</span>
                                        <StatusChip
                                            label={
                                                reviewSnapshot.legalAcknowledgment.governancePolicyAccepted
                                                    ? 'Confirmed'
                                                    : 'Missing'
                                            }
                                            tone={
                                                reviewSnapshot.legalAcknowledgment.governancePolicyAccepted
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-slate-200">Non-redistribution acknowledgment</span>
                                        <StatusChip
                                            label={
                                                reviewSnapshot.legalAcknowledgment.nonRedistributionAcknowledged
                                                    ? 'Confirmed'
                                                    : 'Missing'
                                            }
                                            tone={
                                                reviewSnapshot.legalAcknowledgment.nonRedistributionAcknowledged
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ReviewSection>

                    <ReviewSection
                        stepLabel="Step 4 · Verification"
                        title="Verification packet and configured authentication method"
                        description={
                            isIndividualPath
                                ? 'Reviewers use this packet to confirm identity alignment, individual accountability, Node ID issuance, and the sign-in route that will be used after approval.'
                                : 'Reviewers use this packet to confirm identity alignment, corporate-domain control, and the sign-in route that will be used after approval.'
                        }
                        statusLabel={step4Ready ? 'Ready' : 'Needs review'}
                        statusTone={step4Ready ? 'success' : 'warning'}
                        onEdit={() => navigate(participantOnboardingPaths.step4)}
                    >
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-white">LinkedIn verification</div>
                                    <StatusChip
                                        label={reviewSnapshot.verification.linkedInConnected ? 'Verified' : 'Missing'}
                                        tone={reviewSnapshot.verification.linkedInConnected ? 'success' : 'warning'}
                                    />
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    Confirms the professional identity tied to the submitting representative.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-white">
                                        {isIndividualPath ? 'Identity verification' : 'Domain / DNS verification'}
                                    </div>
                                    <StatusChip
                                        label={reviewSnapshot.verification.domainVerified ? 'Verified' : 'Missing'}
                                        tone={reviewSnapshot.verification.domainVerified ? 'success' : 'warning'}
                                    />
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    {isIndividualPath
                                        ? 'Confirms the individual identity used for this request and issues the Node ID shown in the packet.'
                                        : 'Confirms control of the corporate domain connected to this request.'}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Configured authentication method
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-200">
                                    {reviewSnapshot.verification.authenticationMethod
                                        ? authenticationMethodLabels[reviewSnapshot.verification.authenticationMethod]
                                        : 'Not configured'}
                                </p>
                                <p className="mt-2 text-sm text-slate-400">
                                    {getAuthenticationRouteSummary(reviewSnapshot.verification.authenticationMethod)}
                                </p>
                                <p className="mt-2 text-sm text-slate-400">
                                    {getAuthenticationKeySummary(reviewSnapshot.verification.nodeId)}
                                </p>
                                {reviewSnapshot.verification.authenticationMethod === 'sso' &&
                                    reviewSnapshot.verification.ssoDomain.trim() && (
                                    <p className="mt-2 text-sm text-slate-400">
                                        SSO reference: {reviewSnapshot.verification.ssoDomain}
                                    </p>
                                    )}
                            </div>
                        </div>

                        <div className={cx('mt-4 grid gap-4 md:grid-cols-2', isIndividualPath ? 'xl:grid-cols-3' : 'xl:grid-cols-4')}>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    {isIndividualPath ? 'Submitted email' : 'Submitted work email'}
                                </div>
                                <p className="mt-3 break-all text-sm text-slate-200">
                                    {step1Data.officialWorkEmail || 'Not provided'}
                                </p>
                            </div>

                            {!isIndividualPath && (
                                <>
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Expected domain
                                        </div>
                                        <p className="mt-3 text-sm text-slate-200">
                                            {expectedDomain || 'Not derived'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Entered corporate domain
                                        </div>
                                        <p className="mt-3 text-sm text-slate-200">
                                            {reviewSnapshot.verification.corporateDomain || 'Not provided'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                Domain alignment
                                            </div>
                                            <StatusChip
                                                label={domainMatchesWorkEmail ? 'Matches' : domainAccepted ? 'Mock accepted' : 'Mismatch'}
                                                tone={domainAccepted ? 'success' : 'warning'}
                                            />
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-slate-400">
                                            {domainMatchesWorkEmail
                                                ? 'The submitted work email domain matches the corporate domain used for DNS verification.'
                                                : domainAccepted && MOCK_AUTH
                                                    ? 'Mock mode accepted the provided corporate domain even though it differs from the work email on file.'
                                                    : 'The Step 4 corporate domain must exactly match the submitted work email domain.'}
                                        </p>
                                    </div>
                                </>
                            )}

                            {isIndividualPath && (
                                <>
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Node ID
                                        </div>
                                        <p className="mt-3 font-mono text-sm text-slate-200">
                                            {reviewSnapshot.verification.nodeId || 'Not issued'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                Node ID status
                                            </div>
                                            <StatusChip
                                                label={reviewSnapshot.verification.nodeIdSaved ? 'Saved' : reviewSnapshot.verification.nodeId ? 'Issued' : 'Missing'}
                                                tone={reviewSnapshot.verification.nodeId ? 'success' : 'warning'}
                                            />
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-slate-400">
                                            {reviewSnapshot.verification.nodeIdSaved
                                                ? 'The Node ID was issued and marked as saved during the mock verification flow.'
                                                : 'Issue and save the Node ID during Step 4 before final submission.'}
                                        </p>
                                    </div>
                                </>
                            )}

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Affiliation evidence
                                </div>
                                <p className="mt-3 text-sm text-slate-200">
                                    {reviewSnapshot.verification.affiliationFileName || 'No file recorded'}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Authorization evidence
                                </div>
                                <p className="mt-3 text-sm text-slate-200">
                                    {reviewSnapshot.verification.authorizationFileName || 'No file recorded'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                            {isIndividualPath
                                ? 'Reviewers see identity proof, accountability evidence, Node ID issuance, and the hardware-key route together as a single protected-access packet.'
                                : participantOnboardingVerificationSummary}
                        </div>
                    </ReviewSection>

                    <section className={reviewSectionClassName}>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            What happens after submit
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.85fr)_minmax(0,1.1fr)]">
                            <div className="space-y-4">
                                {participantOnboardingNextSteps.map((step) => (
                                    <div
                                        key={step}
                                        className="rounded-[24px] border border-slate-800/90 bg-slate-950/78 px-5 py-4 text-sm text-slate-300 shadow-[0_16px_36px_rgba(2,6,23,0.18)]"
                                    >
                                        {step}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-[24px] border border-slate-800/90 bg-slate-950/78 p-5 shadow-[0_16px_36px_rgba(2,6,23,0.18)]">
                                    <div className="text-sm font-semibold text-white">Review team and timing</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        The Redoubt trust and compliance team reviews the application package. Typical turnaround is{' '}
                                        {participantOnboardingEstimatedReviewTime}.
                                    </p>
                                </div>

                                <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm text-cyan-100">
                                    A reference ID is issued immediately after submit and shown on the confirmation screen and follow-up communication.
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {possibleOutcomes.map((outcome) => (
                                    <div
                                        key={outcome.title}
                                        className="rounded-[24px] border border-slate-800/90 bg-slate-950/78 p-5 shadow-[0_16px_36px_rgba(2,6,23,0.18)]"
                                    >
                                        <div className="text-sm font-semibold text-white">{outcome.title}</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">{outcome.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </form>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
