import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
    participantOnboardingPaths,
    participantOnboardingPolicyLabel,
    participantOnboardingPolicyPath
} from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { isStep3Complete } from '../onboarding/flow'
import {
    emptyLegalAcknowledgment,
    onboardingStorageKeys,
    readOnboardingValue,
    writeOnboardingValue
} from '../onboarding/storage'
import type { LegalAcknowledgment } from '../onboarding/types'

type ParticipationOption = {
    description: string
    detail: string
    title: string
}

const participationOptions: readonly ParticipationOption[] = [
    {
        title: 'Access datasets',
        description: 'Request governed access to evaluate or work with protected datasets.',
        detail: 'Best for teams that need controlled data access within a defined operational purpose.'
    },
    {
        title: 'Contribute datasets',
        description: 'Participate as a contributor or data-sharing organization.',
        detail: 'Used when your organization intends to provide governed data assets under later contributor review.'
    },
    {
        title: 'Collaborate',
        description: 'Work jointly with another team, program, or approved research partner.',
        detail: 'Useful when the request supports a coordinated multi-party workflow or joint evaluation.'
    },
    {
        title: 'Research participation',
        description: 'Use Redoubt as part of a structured research or validation program.',
        detail: 'Appropriate for research leads, analysts, and validation teams operating in a governed setting.'
    }
] as const

const governanceExplainers = [
    {
        title: 'Who should complete this step',
        content:
            'This step should be completed by a person who can accurately represent the requesting organization and accept governance obligations for the intended access request.'
    },
    {
        title: 'What non-redistribution means',
        content:
            'Approved access is limited to the specific use case and review scope described in this application. It does not allow onward sharing, resale, or repurposing without explicit written approval.'
    },
    {
        title: 'If you are not authorized',
        content:
            'Stop here and route the request to the right approver, legal contact, program owner, or authorized representative inside your organization before continuing.'
    }
] as const

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

export default function OnboardingStep3() {
    const navigate = useNavigate()
    const [participationIntent, setParticipationIntent] = useState<string[]>(() =>
        readOnboardingValue(onboardingStorageKeys.participationIntent, [])
    )
    const [legalAcknowledgment, setLegalAcknowledgment] = useState<LegalAcknowledgment>(() =>
        readOnboardingValue(onboardingStorageKeys.legalAcknowledgment, emptyLegalAcknowledgment)
    )

    const toggleValue = (value: string) => {
        setParticipationIntent((prev) => {
            const exists = prev.includes(value)
            const next = exists ? prev.filter((item) => item !== value) : [...prev, value]
            writeOnboardingValue(onboardingStorageKeys.participationIntent, next)
            return next
        })
    }

    const handleLegalChange = (field: keyof LegalAcknowledgment, checked: boolean) => {
        const next = { ...legalAcknowledgment, [field]: checked }
        setLegalAcknowledgment(next)
        writeOnboardingValue(onboardingStorageKeys.legalAcknowledgment, next)
    }

    const handleBack = () => {
        navigate(participantOnboardingPaths.step2)
    }

    const fillMockData = () => {
        const mockParticipation = ['Access datasets', 'Collaborate']
        const mockLegal: LegalAcknowledgment = {
            authorizedRepresentative: true,
            governancePolicyAccepted: true,
            nonRedistributionAcknowledged: true
        }

        setParticipationIntent(mockParticipation)
        setLegalAcknowledgment(mockLegal)
        writeOnboardingValue(onboardingStorageKeys.participationIntent, mockParticipation)
        writeOnboardingValue(onboardingStorageKeys.legalAcknowledgment, mockLegal)
    }

    const stepReady = isStep3Complete(participationIntent, legalAcknowledgment)
    const completedAcknowledgments = Object.values(legalAcknowledgment).filter(Boolean).length

    const helperPanel = (
        <div className="space-y-4">
            <section className="rounded-[28px] border border-amber-400/25 bg-[linear-gradient(180deg,rgba(120,53,15,0.28)_0%,rgba(15,23,42,0.96)_100%)] p-5 shadow-[0_24px_52px_rgba(120,53,15,0.18)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100/80">
                    Governance Review
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">Required before protected access review</h2>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                    Redoubt requires explicit organizational acknowledgments before reviewers can assess requests for
                    controlled access, collaboration, or protected evaluation workflows.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Acknowledgment status
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">
                            {completedAcknowledgments}/3 complete
                        </div>
                        <p className="mt-2 text-sm text-slate-300">
                            All governance confirmations are required before the request can move to verification review.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Who should agree
                        </div>
                        <p className="mt-2 text-sm text-slate-300">
                            A representative who can speak for the organization, accept policy scope, and confirm the request purpose.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-[26px] border border-amber-400/20 bg-slate-900/78 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
                <div className="mb-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Legal and governance acknowledgments
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        These are concise review gates, not a full legal document. They confirm authority, policy understanding, and purpose limitation.
                    </p>
                </div>

                <div className="space-y-3">
                    <label
                        className={cx(
                            'block cursor-pointer rounded-2xl border p-4 transition-all duration-200',
                            legalAcknowledgment.authorizedRepresentative
                                ? 'border-amber-400/45 bg-amber-500/10'
                                : 'border-slate-800 bg-slate-950/75 hover:border-amber-400/35'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={legalAcknowledgment.authorizedRepresentative}
                                onChange={(event) => handleLegalChange('authorizedRepresentative', event.target.checked)}
                            />
                            <div>
                                <div className="text-sm font-semibold text-white">Authorized representative</div>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    I confirm that I am authorised to represent my organisation for controlled access requests on Redoubt.
                                </p>
                            </div>
                        </div>
                    </label>

                    <label
                        className={cx(
                            'block cursor-pointer rounded-2xl border p-4 transition-all duration-200',
                            legalAcknowledgment.governancePolicyAccepted
                                ? 'border-amber-400/45 bg-amber-500/10'
                                : 'border-slate-800 bg-slate-950/75 hover:border-amber-400/35'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={legalAcknowledgment.governancePolicyAccepted}
                                onChange={(event) => handleLegalChange('governancePolicyAccepted', event.target.checked)}
                            />
                            <div>
                                <div className="text-sm font-semibold text-white">Governance policy scope</div>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    I have reviewed the{' '}
                                    <Link
                                        to={participantOnboardingPolicyPath}
                                        className="text-blue-400 underline underline-offset-2"
                                    >
                                        {participantOnboardingPolicyLabel}
                                    </Link>{' '}
                                    and understand that requests are logged, policy-scoped, and reviewed against contributor permissions and governance controls.
                                </p>
                            </div>
                        </div>
                    </label>

                    <label
                        className={cx(
                            'block cursor-pointer rounded-2xl border p-4 transition-all duration-200',
                            legalAcknowledgment.nonRedistributionAcknowledged
                                ? 'border-amber-400/45 bg-amber-500/10'
                                : 'border-slate-800 bg-slate-950/75 hover:border-amber-400/35'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={legalAcknowledgment.nonRedistributionAcknowledged}
                                onChange={(event) => handleLegalChange('nonRedistributionAcknowledged', event.target.checked)}
                            />
                            <div>
                                <div className="text-sm font-semibold text-white">Purpose limitation and non-redistribution</div>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    I acknowledge that approved data access is limited to the stated purpose in this application and may not be redistributed, resold, or repurposed without explicit written consent.
                                </p>
                            </div>
                        </div>
                    </label>
                </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-slate-900/74 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.16)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Compact Explainers
                </div>

                <div className="mt-4 space-y-3">
                    {governanceExplainers.map((item) => (
                        <details
                            key={item.title}
                            className="rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-3 text-sm text-slate-300"
                        >
                            <summary className="cursor-pointer list-none font-semibold text-white">
                                {item.title}
                            </summary>
                            <p className="mt-3 leading-6 text-slate-400">{item.content}</p>
                        </details>
                    ))}
                </div>

                <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                    Governance acknowledgments are required because later verification and protected-access review rely on a confirmed organizational authority and purpose-bounded request.
                </div>
            </section>
        </div>
    )

    const handleNext = () => {
        if (stepReady) {
            navigate(participantOnboardingPaths.step4)
        }
    }

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step3}>
            <OnboardingPageLayout
                activeStep={3}
                showDefaultHelperPanel={false}
                helperPanel={helperPanel}
                headerTitle="Participation Intent & Governance"
                headerSubtitle="Clarify how your organization intends to participate, then confirm the governance obligations required before protected access review can proceed."
                pageEyebrow="Participant onboarding · Governance review"
            >
                <div className="space-y-6">
                    <section className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_48px_rgba(2,6,23,0.24)]">
                        <div className="max-w-3xl">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Step framing
                            </div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">Define the participation mode behind the request</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                This step does two things: it tells reviewers how your team plans to participate, and it confirms the governance obligations required before Redoubt can evaluate protected access.
                            </p>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    Participation focus
                                </div>
                                <p className="mt-2 text-sm text-slate-300">
                                    Explain whether your organization is accessing, contributing, collaborating, or participating in research.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    Governance focus
                                </div>
                                <p className="mt-2 text-sm text-slate-300">
                                    Confirm authority and policy scope before the request can move into verification review.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    Why it matters
                                </div>
                                <p className="mt-2 text-sm text-slate-300">
                                    Protected-access review depends on a purpose-bounded request backed by organizational authority.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-slate-800 bg-slate-900/65 p-6 shadow-[0_20px_48px_rgba(2,6,23,0.22)]">
                        <div className="mb-5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Left zone · participation mode
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-white">How your team plans to participate</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Select the participation modes that best reflect the request. These selections help reviewers understand the expected relationship between your team and the platform.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {participationOptions.map((option) => {
                                const active = participationIntent.includes(option.title)

                                return (
                                    <button
                                        key={option.title}
                                        type="button"
                                        onClick={() => toggleValue(option.title)}
                                        className={cx(
                                            'rounded-[24px] border p-5 text-left transition-all duration-200',
                                            active
                                                ? 'border-blue-500/65 bg-blue-500/10 shadow-[0_16px_34px_rgba(37,99,235,0.14)]'
                                                : 'border-slate-800 bg-slate-950/80 hover:border-blue-500/40 hover:bg-slate-900'
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-base font-semibold text-white">{option.title}</div>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">{option.description}</p>
                                                <p className="mt-3 text-sm leading-6 text-slate-500">{option.detail}</p>
                                            </div>
                                            <span
                                                className={cx(
                                                    'mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                                                    active
                                                        ? 'border-blue-400 bg-blue-400 text-slate-950'
                                                        : 'border-slate-700 bg-slate-900 text-slate-500'
                                                )}
                                            >
                                                {active ? '✓' : '+'}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {participationIntent.includes('Contribute datasets') && (
                            <div className="mt-5 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                                Dataset privacy, access controls, and commercial terms are configured later in dataset onboarding. This participant application only verifies who your team is and what kind of platform participation you are requesting.
                            </div>
                        )}

                        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Current participation intent
                            </div>
                            <p className="mt-2 text-sm text-slate-300">
                                {participationIntent.length > 0
                                    ? participationIntent.join(', ')
                                    : 'No participation mode selected yet.'}
                            </p>
                        </div>
                    </section>

                    <section className="flex flex-wrap gap-3 rounded-[24px] border border-slate-800 bg-slate-900/60 px-5 py-4">
                        <button
                            type="button"
                            onClick={fillMockData}
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-blue-500 hover:text-white"
                        >
                            Use mock data
                        </button>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!stepReady}
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Continue to Step 4
                        </button>
                    </section>
                </div>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
