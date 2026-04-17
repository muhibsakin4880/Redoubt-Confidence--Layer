import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { participantOnboardingEstimatedReviewTime, participantOnboardingPaths } from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { isStep1Complete } from '../onboarding/flow'
import { emptyStep1FormState, onboardingStorageKeys, readOnboardingValue, writeOnboardingValue } from '../onboarding/storage'
import type { Step1FormState } from '../onboarding/types'

type Step1DraftState = Step1FormState & {
    organizationWebsite: string
}

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

const initialStep1DraftState: Step1DraftState = {
    ...emptyStep1FormState,
    organizationWebsite: ''
}

const fieldLabelClassName = 'mb-2 block text-sm font-medium text-slate-200'
const fieldInputClassName =
    'w-full rounded-[16px] border border-slate-700 bg-slate-950/85 px-4 py-3.5 text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-blue-500 focus:outline-none'

const reviewChecks = [
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

function isPersonalEmail(email: string): boolean {
    const domain = email.toLowerCase().split('@')[1]
    return domain ? BLOCKED_EMAIL_DOMAINS.has(domain) : false
}

export default function OnboardingStep1() {
    const navigate = useNavigate()
    const [state, setState] = useState<Step1DraftState>(() =>
        readOnboardingValue(onboardingStorageKeys.step1, initialStep1DraftState)
    )
    const [showError, setShowError] = useState(false)
    const [emailWarning, setEmailWarning] = useState<string | null>(null)

    const handleChange = (field: keyof Step1DraftState, value: string) => {
        const next = { ...state, [field]: value }
        setState(next)
        writeOnboardingValue(onboardingStorageKeys.step1, next)

        if (field === 'officialWorkEmail' && value.includes('@')) {
            if (isPersonalEmail(value)) {
                setEmailWarning('Personal email providers are not accepted. Use a verified corporate email.')
            } else {
                setEmailWarning(null)
            }
        } else if (field === 'officialWorkEmail') {
            setEmailWarning(null)
        }
    }

    const fillMockData = () => {
        const mockState: Step1DraftState = {
            organizationName: 'Demo Corporation',
            organizationWebsite: 'https://www.redoubt.local',
            officialWorkEmail: 'demo@redoubt.local',
            inviteCode: 'REDO-2026',
            roleInOrganization: 'Senior Data Engineer',
            industryDomain: 'Technology & AI',
            country: 'United States'
        }

        setState(mockState)
        writeOnboardingValue(onboardingStorageKeys.step1, mockState)
        setShowError(false)
        setEmailWarning(null)
    }

    const stepReady = useMemo(() => isStep1Complete(state), [state])

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
                canvasWidth="full"
                headerTitle="Organization & Identity"
                headerSubtitle="Establish the verified corporate identity behind this request before deeper governance and verification review begin."
                pageEyebrow="Participant onboarding · Identity review"
                progressVariant="connector"
            >
                <div className="space-y-8 lg:space-y-10">
                    <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86)_0%,rgba(2,6,23,0.74)_100%)] p-7 shadow-[0_26px_68px_rgba(2,6,23,0.22)] backdrop-blur-sm sm:p-8 lg:p-10">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-3xl">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Step 1 intake
                                </div>
                                <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight text-white sm:text-[2.15rem]">
                                    Start with trusted organization details
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-slate-300">
                                    This opening step anchors the onboarding request to a legitimate organization and
                                    an accountable representative. Complete the required fields now so the rest of the
                                    workflow can build on a clean trust record.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fillMockData}
                                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                            >
                                Use mock data
                            </button>
                        </div>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <div className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                                Corporate identity required
                            </div>
                            <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                                Invite code optional
                            </div>
                            <div className="rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                                Typical review: {participantOnboardingEstimatedReviewTime}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.8)_0%,rgba(2,6,23,0.72)_100%)] p-7 shadow-[0_28px_72px_rgba(2,6,23,0.24)] backdrop-blur-sm sm:p-8 lg:p-10">
                        <div className="grid gap-8 xl:grid-cols-2">
                            <article className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_22px_50px_rgba(2,6,23,0.18)] backdrop-blur-sm">
                                <div className="mb-5">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Organization profile
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-white">Corporate details</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                        These fields help reviewers identify the organization behind the request and
                                        resolve the correct operating context early.
                                    </p>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>Organization name</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.organizationName}
                                            onChange={(event) => handleChange('organizationName', event.target.value)}
                                            placeholder="Your legal or operating organization name"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>Organization website</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.organizationWebsite}
                                            onChange={(event) => handleChange('organizationWebsite', event.target.value)}
                                            placeholder="https://www.organization.com"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            Optional, but useful when reviewers need to confirm the public corporate
                                            footprint tied to this request.
                                        </p>
                                    </div>

                                    <div>
                                        <label className={fieldLabelClassName}>Industry / domain</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.industryDomain}
                                            onChange={(event) => handleChange('industryDomain', event.target.value)}
                                            placeholder="Healthcare, public sector, mobility..."
                                        />
                                    </div>

                                    <div>
                                        <label className={fieldLabelClassName}>Primary operating region</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.country}
                                            onChange={(event) => handleChange('country', event.target.value)}
                                            placeholder="Country or region"
                                        />
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_22px_50px_rgba(2,6,23,0.18)] backdrop-blur-sm">
                                <div className="mb-5">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Submitting representative
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-white">Participant identity</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                        Use the business contact information reviewers should associate with this
                                        application package.
                                    </p>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>Official work email</label>
                                        <input
                                            type="email"
                                            className={fieldInputClassName}
                                            value={state.officialWorkEmail}
                                            onChange={(event) => handleChange('officialWorkEmail', event.target.value)}
                                            placeholder="name@organization.com"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            Use the same corporate email that later verification and reviewer contact
                                            should reference.
                                        </p>
                                        {emailWarning && (
                                            <div className="mt-3 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                                                {emailWarning}
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>Role / team function</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.roleInOrganization}
                                            onChange={(event) => handleChange('roleInOrganization', event.target.value)}
                                            placeholder="Research lead, security engineering, compliance operations..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={fieldLabelClassName}>Invite code</label>
                                        <input
                                            className={fieldInputClassName}
                                            value={state.inviteCode}
                                            onChange={(event) => handleChange('inviteCode', event.target.value)}
                                            placeholder="Enter if provided"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            Optional. You can continue without an invite code. If you have one, enter
                                            it exactly as issued to help route the request faster.
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </div>

                        {showError && !stepReady && (
                            <div className="mt-8 rounded-[24px] border border-amber-400/40 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                                To continue, complete the organization identity fields and provide a valid corporate
                                email. Invite codes remain optional, but if you enter one it should match the issued
                                code format.
                            </div>
                        )}
                    </section>

                    <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.74)_0%,rgba(2,6,23,0.66)_100%)] p-7 shadow-[0_24px_64px_rgba(2,6,23,0.2)] backdrop-blur-sm sm:p-8 lg:p-10">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                                <section className="rounded-[30px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.9)_0%,rgba(15,23,42,0.92)_100%)] p-6 shadow-[0_24px_58px_rgba(8,47,73,0.18)] backdrop-blur-sm sm:p-7">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                                        Identity Review
                                    </div>
                                    <h3 className="mt-4 text-[1.2rem] font-semibold leading-8 text-white">
                                        Why this first step matters
                                    </h3>
                                    <p className="mt-4 text-sm leading-7 text-slate-200">
                                        Redoubt starts by establishing the corporate identity behind the request so later
                                        governance, verification, and reviewer routing all begin from a trusted
                                        organization record.
                                    </p>
                                </section>

                                <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                    <div className="border-b border-white/10 px-5 py-5">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                            Typical approval timing
                                        </div>
                                        <div className="mt-2 text-lg font-semibold text-white">
                                            {participantOnboardingEstimatedReviewTime}
                                        </div>
                                        <p className="mt-2 text-sm text-slate-300">
                                            Review may move faster when identity and organization details are consistent.
                                        </p>
                                    </div>
                                    <div className="px-5 py-5">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                            Invite code
                                        </div>
                                        <div className="mt-2 text-lg font-semibold text-white">Optional</div>
                                        <p className="mt-2 text-sm text-slate-300">
                                            You can continue without a code. If you have one, it helps route the request
                                            more quickly.
                                        </p>
                                    </div>
                                </section>
                            </div>

                            <section className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/78 shadow-[0_24px_60px_rgba(2,6,23,0.22)] backdrop-blur-sm">
                                <div className="border-b border-white/10 px-6 py-6">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                        What Gets Checked
                                    </div>
                                </div>

                                <div className="grid gap-4 px-6 py-6">
                                    {reviewChecks.map((check) => (
                                        <div
                                            key={check.title}
                                            className="rounded-[24px] border border-slate-800/90 bg-slate-950/78 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.18)]"
                                        >
                                            <div className="text-sm font-semibold text-white">{check.title}</div>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">{check.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.55fr)]">
                            <section className="rounded-[30px] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_48px_rgba(2,6,23,0.18)] backdrop-blur-sm sm:p-7">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Invite Code Guidance
                                </div>
                                <p className="mt-4 text-sm leading-7 text-slate-300">
                                    If your organization received an invite code, enter it exactly as issued. If not,
                                    leave the field blank and continue. The current review flow still accepts the
                                    request without one.
                                </p>
                            </section>

                            <div className="rounded-[30px] border border-cyan-400/20 bg-cyan-400/10 px-6 py-5 text-sm text-cyan-100 shadow-[0_18px_44px_rgba(8,47,73,0.14)] sm:px-7 sm:py-6">
                                This step records your identity and organization context first. Verification depth
                                increases in later stages, not here.
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[30px] border border-white/10 bg-slate-900/68 px-6 py-5 shadow-[0_20px_48px_rgba(2,6,23,0.18)] backdrop-blur-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                            <div>
                                <div className="text-sm font-semibold text-white">Next step</div>
                                <p className="mt-1 text-sm text-slate-400">
                                    After identity intake, onboarding moves into intended platform usage and request
                                    scope.
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
