import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { participantOnboardingEstimatedReviewTime, participantOnboardingPaths } from '../onboarding/constants'
import { sanitizeParticipationIntent } from '../onboarding/content'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { isStep1Complete } from '../onboarding/flow'
import {
    emptyComplianceCommitment,
    emptyLegalAcknowledgment,
    emptyVerificationSnapshot,
    onboardingStorageKeys,
    readOnboardingValue,
    readStep1Snapshot,
    writeOnboardingValue
} from '../onboarding/storage'
import type { ParticipantType, Step1FormState } from '../onboarding/types'

const BLOCKED_EMAIL_DOMAINS = new Set([
    'gmail.com',
    'googlemail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'yahoo.co.uk',
    'icloud.com',
    'me.com',
    'protonmail.com',
    'tutanota.com',
    'aol.com',
    'live.com'
])

const COUNTRY_OPTIONS = [
    'United Arab Emirates',
    'Saudi Arabia',
    'Qatar',
    'Kuwait',
    'Bahrain',
    'Oman',
    'United Kingdom',
    'Germany',
    'France',
    'Netherlands',
    'United States',
    'Canada',
    'Singapore',
    'India',
    'Other'
] as const

const fieldLabelClassName = 'mb-2 block text-sm font-medium text-slate-200'
const fieldInputClassName =
    'w-full rounded-[16px] border border-slate-700 bg-slate-950/85 px-4 py-3.5 text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-blue-500 focus:outline-none'
const fieldSelectClassName =
    'w-full rounded-[16px] border border-slate-700 bg-slate-950/85 px-4 py-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-blue-500 focus:outline-none'

function isPersonalEmail(email: string): boolean {
    const domain = email.toLowerCase().split('@')[1]
    return domain ? BLOCKED_EMAIL_DOMAINS.has(domain) : false
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

export default function OnboardingStep1() {
    const navigate = useNavigate()
    const [state, setState] = useState<Step1FormState>(() => readStep1Snapshot())
    const [showError, setShowError] = useState(false)
    const [emailWarning, setEmailWarning] = useState<string | null>(null)
    const isOrganizationPath = state.participantType === 'organization'
    const isIndividualPath = state.participantType === 'individual'
    const hasCustomCountryOption =
        state.country.trim().length > 0 && !COUNTRY_OPTIONS.some((option) => option === state.country)

    const reviewChecks = isIndividualPath
        ? [
            {
                title: 'Individual identity consistency',
                description: 'Your affiliation, public profile, expertise area, and region are reviewed together to confirm the request maps to a real accountable person.'
            },
            {
                title: 'Reachable participant contact',
                description: 'Your preferred email becomes the contact point for mock review, sign-in lookup, and any follow-up requests.'
            },
            {
                title: 'Professional context',
                description: 'Your role, discipline, and public-facing context help reviewers understand why this individual account should be trusted.'
            }
        ]
        : [
            {
                title: 'Corporate identity consistency',
                description: 'Organization name, website, industry, and operating region are reviewed together to confirm the request maps to a real entity.'
            },
            {
                title: 'Verified business contact',
                description: 'Your work email is used as the starting point for confirming organizational affiliation before later verification steps begin.'
            },
            {
                title: 'Submitting representative context',
                description: 'Role and team function help reviewers understand why this person is the right representative for the onboarding request.'
            }
        ] as const

    const copy = isIndividualPath
        ? {
            headerTitle: 'Join Path & Identity',
            headerSubtitle: 'Choose how you are joining Redoubt, then capture the individual identity and professional context behind this request.',
            pageEyebrow: 'Participant onboarding · Individual identity review',
            introTitle: 'Start with the credential holder behind this request',
            introBody:
                'Individual onboarding anchors the request to a real accountable person, their professional context, and the identity that will later hold the Node ID and hardware-key sign-in path.',
            profileSectionEyebrow: 'Individual profile',
            profileSectionTitle: 'Professional context',
            profileSectionBody:
                'These fields help reviewers understand who you are, how you present yourself professionally, and what context this individual application belongs to.',
            identitySectionEyebrow: 'Credential holder',
            identitySectionTitle: 'Participant identity',
            identitySectionBody:
                'Use the email and role details Redoubt should associate with this individual account and any later mock review follow-up.',
            nameLabel: 'Full name',
            namePlaceholder: 'Your legal full name',
            organizationNameLabel: 'Primary affiliation or public identity',
            organizationNamePlaceholder: 'Independent researcher, studio, lab, or public professional identity',
            organizationWebsiteLabel: 'Professional website or public profile',
            organizationWebsitePlaceholder: 'https://portfolio.example.com',
            organizationWebsiteHelp: 'Optional, but useful when reviewers need a public anchor for an individual application.',
            industryLabel: 'Expertise / domain',
            industryPlaceholder: 'Security research, healthcare AI, policy analysis...',
            regionLabel: 'Primary operating region',
            regionPlaceholder: 'Country or region',
            countryLabel: 'Country',
            countryPlaceholder: 'Select your country',
            emailLabel: 'Preferred login email',
            emailPlaceholder: 'name@example.com',
            emailHelp: 'Use the email Redoubt should use for sign-in lookup and mock review communication.',
            roleLabel: 'Role / discipline',
            rolePlaceholder: 'Independent researcher, analyst, advisor, builder...',
            inviteLabel: 'Invite code',
            inviteHelp: 'Optional. Use it if you received one directly from Redoubt or a program partner.'
        }
        : {
            headerTitle: 'Join Path & Identity',
            headerSubtitle: 'Choose how you are joining Redoubt, then establish the verified organization and representative behind this request.',
            pageEyebrow: 'Participant onboarding · Organization identity review',
            introTitle: 'Start with trusted organization details',
            introBody:
                'This opening step anchors the onboarding request to a legitimate organization and an accountable representative. Complete the required fields now so the rest of the workflow can build on a clean trust record.',
            profileSectionEyebrow: 'Organization profile',
            profileSectionTitle: 'Corporate details',
            profileSectionBody:
                'These fields help reviewers identify the organization behind the request and resolve the correct operating context early.',
            identitySectionEyebrow: 'Submitting representative',
            identitySectionTitle: 'Participant identity',
            identitySectionBody:
                'Use the business contact information reviewers should associate with this application package.',
            nameLabel: 'Primary contact name',
            namePlaceholder: 'Full name of person submitting this request',
            organizationNameLabel: 'Organization name',
            organizationNamePlaceholder: 'Your legal or operating organization name',
            organizationWebsiteLabel: 'Organization website',
            organizationWebsitePlaceholder: 'https://www.organization.com',
            organizationWebsiteHelp:
                'Optional, but useful when reviewers need to confirm the public corporate footprint tied to this request.',
            industryLabel: 'Industry / domain',
            industryPlaceholder: 'Healthcare, public sector, mobility...',
            regionLabel: 'Country',
            regionPlaceholder: 'Select your country',
            countryLabel: 'Country',
            countryPlaceholder: 'Select your country',
            emailLabel: 'Official work email',
            emailPlaceholder: 'name@organization.com',
            emailHelp: 'Use the same corporate email that later verification and reviewer contact should reference.',
            roleLabel: 'Role / team function',
            rolePlaceholder: 'Research lead, security engineering, compliance operations...',
            inviteLabel: 'Invite code',
            inviteHelp:
                'Optional. You can continue without an invite code. If you have one, enter it exactly as issued to help route the request faster.'
        } as const

    const resetBranchDependentState = (participantType: ParticipantType | null) => {
        const storedParticipationIntent = readOnboardingValue<string[]>(onboardingStorageKeys.participationIntent, [])
        const sanitizedParticipationIntent = sanitizeParticipationIntent(participantType, storedParticipationIntent)

        if (sanitizedParticipationIntent.length !== storedParticipationIntent.length) {
            writeOnboardingValue(onboardingStorageKeys.participationIntent, sanitizedParticipationIntent)
        }

        writeOnboardingValue(onboardingStorageKeys.legalAcknowledgment, emptyLegalAcknowledgment)
        writeOnboardingValue(onboardingStorageKeys.verification, {
            ...emptyVerificationSnapshot,
            authenticationMethod: participantType === 'individual' ? 'hardware_key' : null
        })
        writeOnboardingValue(onboardingStorageKeys.compliance, emptyComplianceCommitment)
    }

    const handleChange = (field: keyof Step1FormState, value: string | ParticipantType | null) => {
        const next = { ...state, [field]: value }
        setState(next)
        writeOnboardingValue(onboardingStorageKeys.step1, next)

        if (field === 'participantType') {
            resetBranchDependentState(value as ParticipantType | null)
            setShowError(false)
            if (next.officialWorkEmail.includes('@') && value === 'organization' && isPersonalEmail(next.officialWorkEmail)) {
                setEmailWarning('Personal email providers are not accepted. Use a verified corporate email.')
            } else {
                setEmailWarning(null)
            }
            return
        }

        if (field === 'officialWorkEmail' && typeof value === 'string' && value.includes('@')) {
            if (next.participantType === 'organization' && isPersonalEmail(value)) {
                setEmailWarning('Personal email providers are not accepted. Use a verified corporate email.')
            } else {
                setEmailWarning(null)
            }
        } else if (field === 'officialWorkEmail') {
            setEmailWarning(null)
        }
    }

    const fillMockData = () => {
        const mockState: Step1FormState = state.participantType === 'individual'
            ? {
                participantType: 'individual',
                fullName: 'Ava Rahman',
                primaryContactName: '',
                organizationName: 'Independent Researcher',
                organizationWebsite: 'https://portfolio.redoubt.local',
                officialWorkEmail: 'ava.researcher@gmail.com',
                inviteCode: 'RDT-IND-2026',
                roleInOrganization: 'Independent Researcher',
                industryDomain: 'Security Research & AI Evaluation',
                primaryOperatingRegion: 'North America',
                country: 'United States'
            }
            : {
                participantType: 'organization',
                fullName: '',
                primaryContactName: 'Avery Underwood',
                organizationName: 'Demo Corporation',
                organizationWebsite: 'https://www.redoubt.local',
                officialWorkEmail: 'demo@redoubt.local',
                inviteCode: 'REDO-2026',
                roleInOrganization: 'Senior Data Engineer',
                industryDomain: 'Technology & AI',
                primaryOperatingRegion: '',
                country: 'United States'
            }

        setState(mockState)
        writeOnboardingValue(onboardingStorageKeys.step1, mockState)
        resetBranchDependentState(mockState.participantType)
        setShowError(false)
        setEmailWarning(null)
    }

    const stepReady = useMemo(() => isStep1Complete(state), [state])

    const helperPanel = (
        <div className="space-y-4">
            <section className="rounded-[24px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.92)_0%,rgba(15,23,42,0.96)_100%)] p-5 shadow-[0_24px_58px_rgba(8,47,73,0.2)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                    Intake summary
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">
                    {isIndividualPath ? 'Individual credential holder' : isOrganizationPath ? 'Organization-backed request' : 'Choose a join path'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                    {isIndividualPath
                        ? 'This path anchors the request to a real accountable participant and the identity that will later hold the Node ID and hardware-key sign-in route.'
                        : isOrganizationPath
                            ? 'This path anchors the request to a verified organization and the representative behind the application package.'
                            : 'Start by choosing how the request should be represented, then complete the identity record used by later governance and verification steps.'}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Invite code</div>
                        <div className="mt-2 text-sm font-semibold text-white">Optional</div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Keep it blank if you do not have one. The request can still continue.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Typical review</div>
                        <div className="mt-2 text-sm font-semibold text-white">{participantOnboardingEstimatedReviewTime}</div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Clean identity details help later review move faster.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-[24px] border border-white/10 bg-slate-950/78 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.2)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    What reviewers check first
                </div>
                <div className="mt-4 space-y-3">
                    {reviewChecks.map((check) => (
                        <div key={check.title} className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                            <div className="text-sm font-semibold text-white">{check.title}</div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{check.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )

    const handleNext = () => {
        if (!stepReady) {
            setShowError(true)
            return
        }

        navigate(participantOnboardingPaths.step2)
    }

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step1}>
            <OnboardingPageLayout
                activeStep={1}
                showDefaultHelperPanel={false}
                helperPanel={helperPanel}
                canvasWidth="full"
                headerTitle={copy.headerTitle}
                headerSubtitle={copy.headerSubtitle}
                pageEyebrow={copy.pageEyebrow}
                progressVariant="connector"
                headerActions={
                    <button
                        type="button"
                        onClick={fillMockData}
                        className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                    >
                        Use mock data
                    </button>
                }
            >
                <div className="space-y-6">
                    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84)_0%,rgba(2,6,23,0.76)_100%)] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.22)] backdrop-blur-sm sm:p-7 lg:p-8">
                        <div className="max-w-3xl">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Join path
                            </div>
                            <h2 className="mt-3 text-[1.6rem] font-semibold leading-tight text-white sm:text-[1.85rem]">
                                {copy.introTitle}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                {copy.introBody}
                            </p>
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => handleChange('participantType', 'individual')}
                                className={cx(
                                    'rounded-[24px] border p-5 text-left transition-all duration-300',
                                    isIndividualPath
                                        ? 'border-blue-400/60 bg-[linear-gradient(180deg,rgba(37,99,235,0.18)_0%,rgba(15,23,42,0.92)_100%)] shadow-[0_22px_48px_rgba(37,99,235,0.16)]'
                                        : 'border-white/10 bg-white/[0.03] shadow-[0_18px_40px_rgba(2,6,23,0.18)] hover:border-blue-500/35 hover:bg-white/[0.05]'
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            How are you joining?
                                        </div>
                                        <div className="mt-2 text-lg font-semibold text-white">As an Individual</div>
                                        <p className="mt-3 text-sm leading-7 text-slate-400">
                                            Use an individual account backed by your own professional identity, evidence, Node ID, and hardware key.
                                        </p>
                                    </div>
                                    <span className={cx(
                                        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                                        isIndividualPath
                                            ? 'border-blue-400 bg-blue-400 text-slate-950'
                                            : 'border-slate-700 bg-slate-900 text-slate-500'
                                    )}>
                                        {isIndividualPath ? '✓' : ''}
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleChange('participantType', 'organization')}
                                className={cx(
                                    'rounded-[24px] border p-5 text-left transition-all duration-300',
                                    isOrganizationPath
                                        ? 'border-blue-400/60 bg-[linear-gradient(180deg,rgba(37,99,235,0.18)_0%,rgba(15,23,42,0.92)_100%)] shadow-[0_22px_48px_rgba(37,99,235,0.16)]'
                                        : 'border-white/10 bg-white/[0.03] shadow-[0_18px_40px_rgba(2,6,23,0.18)] hover:border-blue-500/35 hover:bg-white/[0.05]'
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            How are you joining?
                                        </div>
                                        <div className="mt-2 text-lg font-semibold text-white">As an Organization</div>
                                        <p className="mt-3 text-sm leading-7 text-slate-400">
                                            Use an organization-backed request with a corporate representative, verification packet, and organization-level credential path.
                                        </p>
                                    </div>
                                    <span className={cx(
                                        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                                        isOrganizationPath
                                            ? 'border-blue-400 bg-blue-400 text-slate-950'
                                            : 'border-slate-700 bg-slate-900 text-slate-500'
                                    )}>
                                        {isOrganizationPath ? '✓' : ''}
                                    </span>
                                </div>
                            </button>
                        </div>

                        {!state.participantType && (
                            <div className="mt-6 rounded-[24px] border border-amber-400/35 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
                                Choose how you are joining Redoubt before continuing with identity intake.
                            </div>
                        )}

                        {state.participantType && (
                            <div className="mt-6 rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                                {isIndividualPath
                                    ? 'This stage captures your path choice, identity, and professional context first. Verification depth increases later in the flow.'
                                    : 'This stage captures the organization, representative, and contact record first. Verification depth increases later in the flow.'}
                            </div>
                        )}
                    </section>

                    {state.participantType && (
                        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.8)_0%,rgba(2,6,23,0.72)_100%)] p-6 shadow-[0_24px_64px_rgba(2,6,23,0.22)] backdrop-blur-sm sm:p-7 lg:p-8">
                        <div className="mb-6 max-w-3xl">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Identity intake
                            </div>
                            <h3 className="mt-3 text-[1.45rem] font-semibold text-white">
                                Complete the record reviewers will see
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-slate-400">
                                Capture the organization or professional identity, then add the primary contact details Redoubt should use for later review and verification.
                            </p>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <article className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_46px_rgba(2,6,23,0.18)] backdrop-blur-sm">
                                <div className="mb-5">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        {copy.profileSectionEyebrow}
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-white">{copy.profileSectionTitle}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                        {copy.profileSectionBody}
                                    </p>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    {isIndividualPath && (
                                        <div className="md:col-span-2">
                                            <label className={fieldLabelClassName}>{copy.nameLabel}</label>
                                            <input
                                                className={fieldInputClassName}
                                                value={state.fullName}
                                                onChange={(event) => handleChange('fullName', event.target.value)}
                                                placeholder={copy.namePlaceholder}
                                            />
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>{copy.organizationNameLabel}</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.organizationName}
                                            onChange={(event) => handleChange('organizationName', event.target.value)}
                                            placeholder={copy.organizationNamePlaceholder}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>{copy.organizationWebsiteLabel}</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.organizationWebsite}
                                            onChange={(event) => handleChange('organizationWebsite', event.target.value)}
                                            placeholder={copy.organizationWebsitePlaceholder}
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            {copy.organizationWebsiteHelp}
                                        </p>
                                    </div>

                                    <div>
                                        <label className={fieldLabelClassName}>{copy.industryLabel}</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.industryDomain}
                                            onChange={(event) => handleChange('industryDomain', event.target.value)}
                                            placeholder={copy.industryPlaceholder}
                                        />
                                    </div>

                                    {isIndividualPath ? (
                                        <div className="grid gap-5">
                                            <div>
                                                <label className={fieldLabelClassName}>{copy.regionLabel}</label>
                                                <input
                                                    className={fieldInputClassName}
                                                    value={state.primaryOperatingRegion}
                                                    onChange={(event) =>
                                                        handleChange('primaryOperatingRegion', event.target.value)
                                                    }
                                                    placeholder={copy.regionPlaceholder}
                                                />
                                            </div>

                                            <div>
                                                <label className={fieldLabelClassName}>{copy.countryLabel}</label>
                                                <select
                                                    className={fieldSelectClassName}
                                                    value={state.country}
                                                    onChange={(event) => handleChange('country', event.target.value)}
                                                >
                                                    <option value="" disabled>
                                                        {copy.countryPlaceholder}
                                                    </option>
                                                    {hasCustomCountryOption && (
                                                        <option value={state.country}>{state.country}</option>
                                                    )}
                                                    {COUNTRY_OPTIONS.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className={fieldLabelClassName}>{copy.countryLabel}</label>
                                            <select
                                                className={fieldSelectClassName}
                                                value={state.country}
                                                onChange={(event) => handleChange('country', event.target.value)}
                                            >
                                                <option value="" disabled>
                                                    {copy.countryPlaceholder}
                                                </option>
                                                {hasCustomCountryOption && (
                                                    <option value={state.country}>{state.country}</option>
                                                )}
                                                {COUNTRY_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </article>

                            <article className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_46px_rgba(2,6,23,0.18)] backdrop-blur-sm">
                                <div className="mb-5">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        {copy.identitySectionEyebrow}
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-white">{copy.identitySectionTitle}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                        {copy.identitySectionBody}
                                    </p>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    {isOrganizationPath && (
                                        <div className="md:col-span-2">
                                            <label className={fieldLabelClassName}>{copy.nameLabel}</label>
                                            <input
                                                className={fieldInputClassName}
                                                value={state.primaryContactName}
                                                onChange={(event) =>
                                                    handleChange('primaryContactName', event.target.value)
                                                }
                                                placeholder={copy.namePlaceholder}
                                            />
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>{copy.emailLabel}</label>
                                        <input
                                            type="email"
                                            className={fieldInputClassName}
                                            value={state.officialWorkEmail}
                                            onChange={(event) => handleChange('officialWorkEmail', event.target.value)}
                                            placeholder={copy.emailPlaceholder}
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            {copy.emailHelp}
                                        </p>
                                        {emailWarning && (
                                            <div className="mt-3 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                                                {emailWarning}
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>{copy.roleLabel}</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.roleInOrganization}
                                            onChange={(event) => handleChange('roleInOrganization', event.target.value)}
                                            placeholder={copy.rolePlaceholder}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>{copy.inviteLabel}</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.inviteCode}
                                            onChange={(event) => handleChange('inviteCode', event.target.value)}
                                            placeholder="Enter if provided"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            {copy.inviteHelp}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </div>

                        {showError && !stepReady && (
                            <div className="mt-8 rounded-[24px] border border-amber-400/40 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                                {isIndividualPath
                                    ? 'To continue, choose the individual path, complete the professional identity fields, and provide a valid email. Invite codes remain optional, but if you enter one it should match the issued code format.'
                                    : 'To continue, choose the organization path, complete the organization identity fields, and provide a valid corporate email. Invite codes remain optional, but if you enter one it should match the issued code format.'}
                            </div>
                                )}
                    </section>
                    )}

                    <section className="rounded-[24px] border border-white/10 bg-slate-950/72 px-5 py-4 shadow-[0_18px_44px_rgba(2,6,23,0.18)] backdrop-blur-sm sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                            <div>
                                <div className="text-sm font-semibold text-white">Next step</div>
                                <p className="mt-1 text-sm text-slate-400">
                                    After identity intake, onboarding moves into intended platform usage and request scope.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                            >
                                Continue to Step 2
                            </button>
                        </div>
                    </section>
                </div>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
