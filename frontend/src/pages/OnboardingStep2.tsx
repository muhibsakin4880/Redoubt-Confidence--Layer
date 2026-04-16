import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { participantOnboardingPaths } from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { isStep2Complete } from '../onboarding/flow'
import {
    emptyUseCaseSummary,
    onboardingStorageKeys,
    readOnboardingValue,
    writeOnboardingValue
} from '../onboarding/storage'
import {
    MAX_USE_CASE_SUMMARY_LENGTH,
    MIN_USE_CASE_SUMMARY_LENGTH
} from '../onboarding/validators'

type Step2StructuredState = {
    accessAudience: string
    evaluationContext: string
    primaryGoal: string
    sensitivityLevel: string
}

type Option = {
    description: string
    title: string
    value: string
}

const step2StructuredStorageKey = 'Redoubt:onboarding:step2:structured'

const emptyStructuredState: Step2StructuredState = {
    accessAudience: '',
    evaluationContext: '',
    primaryGoal: '',
    sensitivityLevel: ''
}

const usageOptions: readonly Option[] = [
    {
        title: 'Research',
        value: 'Research',
        description: 'Explore datasets, evaluate fit, or design governed research workflows.'
    },
    {
        title: 'AI/ML training',
        value: 'AI/ML training',
        description: 'Assess training readiness, validation design, or protected model development plans.'
    },
    {
        title: 'Analytics',
        value: 'Analytics',
        description: 'Run structured analysis, operational reporting, or investigative review.'
    },
    {
        title: 'Product development',
        value: 'Product development',
        description: 'Prototype or validate workflows that may later support product or internal platform use.'
    },
    {
        title: 'Other',
        value: 'Other',
        description: 'Capture a use pattern that does not fit the standard request lanes.'
    }
]

const primaryGoalOptions: readonly Option[] = [
    {
        title: 'Assess data suitability',
        value: 'Assess data suitability',
        description: 'Determine whether the requested environment or data supports the intended program.'
    },
    {
        title: 'Benchmark or validate models',
        value: 'Benchmark or validate models',
        description: 'Use Redoubt to evaluate model behavior, performance, or fitness under controlled review.'
    },
    {
        title: 'Prototype a governed workflow',
        value: 'Prototype a governed workflow',
        description: 'Stand up an access pattern or operating process before requesting broader rollout.'
    },
    {
        title: 'Support an internal decision',
        value: 'Support an internal decision',
        description: 'Generate evidence for a policy, operational, or program-level decision.'
    }
]

const sensitivityOptions: readonly Option[] = [
    {
        title: 'Standard internal',
        value: 'Standard internal',
        description: 'Internal workflow with moderate review requirements and standard business sensitivity.'
    },
    {
        title: 'Sensitive or confidential',
        value: 'Sensitive or confidential',
        description: 'Higher-trust evaluation with internal sensitivity, confidentiality, or customer impact.'
    },
    {
        title: 'Regulated or trust-critical',
        value: 'Regulated or trust-critical',
        description: 'Use case may involve regulatory exposure, governance scrutiny, or elevated verification expectations.'
    }
]

const accessAudienceOptions: readonly Option[] = [
    {
        title: 'Individual specialist',
        value: 'Individual specialist',
        description: 'A single accountable operator such as a researcher, analyst, or reviewer.'
    },
    {
        title: 'Small project team',
        value: 'Small project team',
        description: 'A defined working group using access within one contained initiative.'
    },
    {
        title: 'Cross-functional program',
        value: 'Cross-functional program',
        description: 'A broader initiative spanning multiple teams, stakeholders, or review functions.'
    }
]

const evaluationContextOptions: readonly Option[] = [
    {
        title: 'Dataset evaluation',
        value: 'Dataset evaluation',
        description: 'Review the shape, utility, and constraints of candidate datasets before deeper access.'
    },
    {
        title: 'Model validation',
        value: 'Model validation',
        description: 'Test model behavior, benchmark outcomes, or compare approaches in a governed environment.'
    },
    {
        title: 'Workflow rehearsal',
        value: 'Workflow rehearsal',
        description: 'Trial a secure operating process, review path, or governance pattern.'
    },
    {
        title: 'Partner or customer context',
        value: 'Partner or customer context',
        description: 'Evaluate a third-party, partner, or client-driven request in a controlled setting.'
    }
]

const strongSummaryExamples = [
    'Our research team wants to benchmark privacy-reviewed healthcare datasets for model validation before requesting a controlled evaluation workspace for a limited pilot.',
    'We are assessing whether Redoubt can support a governed analytics workflow for a two-person compliance team reviewing sensitive operational records.',
    'Our program needs a protected model-validation workflow so security and research leads can evaluate candidate datasets before approving internal rollout.'
] as const

const weakSummaryExample =
    'We want access to look around and see if this might be useful for our team.'

const reviewerSignals = [
    'A clear operational goal, not just a generic interest statement.',
    'The intended workflow or evaluation type reviewers should expect.',
    'Who will use the access and under what sensitivity expectations.',
    'Enough context to understand why Redoubt is needed for this request.'
] as const

const summaryChecklist = [
    'What the team is trying to accomplish.',
    'What kind of workflow or evaluation will be run.',
    'Who will use the access and at what scale.',
    'Why the request belongs in a governed environment.'
] as const

const fieldSectionClassName =
    'rounded-[24px] border border-slate-800 bg-slate-950/70 p-5 shadow-[0_18px_36px_rgba(2,6,23,0.18)]'

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

function SelectCardGroup({
    multi = false,
    onSelect,
    options,
    selectedValues
}: {
    multi?: boolean
    onSelect: (value: string) => void
    options: readonly Option[]
    selectedValues: string[]
}) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {options.map((option) => {
                const active = selectedValues.includes(option.value)

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onSelect(option.value)}
                        className={cx(
                            'rounded-2xl border p-4 text-left transition-all duration-200',
                            active
                                ? 'border-blue-500/70 bg-blue-500/10 shadow-[0_14px_30px_rgba(37,99,235,0.12)]'
                                : 'border-slate-800 bg-slate-950/85 hover:border-blue-500/40 hover:bg-slate-900'
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-white">{option.title}</div>
                                <p className="mt-2 text-sm leading-6 text-slate-400">{option.description}</p>
                            </div>
                            <span
                                className={cx(
                                    'mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                                    active
                                        ? 'border-blue-400 bg-blue-400 text-slate-950'
                                        : 'border-slate-700 bg-slate-900 text-slate-500'
                                )}
                            >
                                {multi ? (active ? '✓' : '+') : active ? '✓' : ''}
                            </span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

export default function OnboardingStep2() {
    const navigate = useNavigate()
    const [intendedUsage, setIntendedUsage] = useState<string[]>(() =>
        readOnboardingValue(onboardingStorageKeys.intendedUsage, [])
    )
    const [useCaseSummary, setUseCaseSummary] = useState(() =>
        readOnboardingValue(onboardingStorageKeys.useCaseSummary, emptyUseCaseSummary)
    )
    const [structuredState, setStructuredState] = useState<Step2StructuredState>(() =>
        readOnboardingValue(step2StructuredStorageKey, emptyStructuredState)
    )

    const trimmedUseCaseSummary = useCaseSummary.trim()
    const meaningfulLength = trimmedUseCaseSummary.length
    const stepReady = isStep2Complete(intendedUsage, useCaseSummary)
    const summaryNeedsMoreDetail =
        meaningfulLength > 0 && meaningfulLength < MIN_USE_CASE_SUMMARY_LENGTH
    const structuredCoverageCount = [
        structuredState.primaryGoal,
        intendedUsage.length > 0 ? 'workflow' : '',
        structuredState.sensitivityLevel,
        structuredState.accessAudience,
        structuredState.evaluationContext
    ].filter(Boolean).length

    const toggleUsage = (value: string) => {
        setIntendedUsage((prev) => {
            const exists = prev.includes(value)
            const next = exists ? prev.filter((item) => item !== value) : [...prev, value]
            writeOnboardingValue(onboardingStorageKeys.intendedUsage, next)
            return next
        })
    }

    const handleStructuredChange = (field: keyof Step2StructuredState, value: string) => {
        const next = {
            ...structuredState,
            [field]: structuredState[field] === value ? '' : value
        }

        setStructuredState(next)
        writeOnboardingValue(step2StructuredStorageKey, next)
    }

    const handleUseCaseSummaryChange = (value: string) => {
        setUseCaseSummary(value)
        writeOnboardingValue(onboardingStorageKeys.useCaseSummary, value)
    }

    const handleNext = () => {
        if (stepReady) {
            navigate(participantOnboardingPaths.step3)
        }
    }

    const handleBack = () => {
        navigate(participantOnboardingPaths.step1)
    }

    const fillMockData = () => {
        const mockUsage = ['Research', 'AI/ML training']
        const mockStructuredState: Step2StructuredState = {
            primaryGoal: 'Benchmark or validate models',
            sensitivityLevel: 'Regulated or trust-critical',
            accessAudience: 'Small project team',
            evaluationContext: 'Dataset evaluation'
        }
        const mockSummary =
            'Our research and security leads want to benchmark privacy-reviewed healthcare datasets for controlled model validation before approving a limited governed pilot.'

        setIntendedUsage(mockUsage)
        setStructuredState(mockStructuredState)
        setUseCaseSummary(mockSummary)
        writeOnboardingValue(onboardingStorageKeys.intendedUsage, mockUsage)
        writeOnboardingValue(onboardingStorageKeys.useCaseSummary, mockSummary)
        writeOnboardingValue(step2StructuredStorageKey, mockStructuredState)
    }

    const helperPanel = (
        <div className="space-y-4">
            <section className="rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.92)_0%,rgba(15,23,42,0.95)_100%)] p-5 shadow-[0_22px_50px_rgba(8,47,73,0.24)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                    Reviewer Snapshot
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">How this request currently reads</h2>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                    Reviewers use the structured fields first to understand scope, then the summary to confirm intent
                    and operating context.
                </p>

                <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                Structured coverage
                            </span>
                            <span className="text-sm font-semibold text-white">{structuredCoverageCount}/5</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">
                            {structuredCoverageCount >= 4
                                ? 'This request already has strong review scaffolding.'
                                : 'Add a few more structured selections to make the request easier to triage.'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                        <div className="grid gap-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Primary goal</div>
                                <div className="mt-1 text-slate-100">{structuredState.primaryGoal || 'Not specified'}</div>
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workflow type</div>
                                <div className="mt-1 text-slate-100">
                                    {intendedUsage.length > 0 ? intendedUsage.join(', ') : 'Not specified'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Sensitivity</div>
                                <div className="mt-1 text-slate-100">
                                    {structuredState.sensitivityLevel || 'Not specified'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Access audience</div>
                                <div className="mt-1 text-slate-100">
                                    {structuredState.accessAudience || 'Not specified'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Data or evaluation context</div>
                                <div className="mt-1 text-slate-100">
                                    {structuredState.evaluationContext || 'Not specified'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                Narrative summary
                            </span>
                            <span className="text-xs font-semibold text-slate-300">
                                {meaningfulLength}/{MAX_USE_CASE_SUMMARY_LENGTH}
                            </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                            {trimmedUseCaseSummary || 'No reviewer-facing summary captured yet.'}
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-slate-900/75 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    What Good Summaries Include
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                    {summaryChecklist.map((item) => (
                        <div key={item} className="flex gap-3">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-slate-900/72 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.18)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Example Summaries
                </div>
                <div className="mt-4 space-y-3">
                    {strongSummaryExamples.map((example) => (
                        <div
                            key={example}
                            className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4 text-sm leading-6 text-slate-300"
                        >
                            {example}
                        </div>
                    ))}
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200/80">
                            Weak example
                        </div>
                        <p className="mt-2">{weakSummaryExample}</p>
                    </div>
                </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.16)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    What Reviewers Look For
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                    {reviewerSignals.map((signal) => (
                        <div key={signal} className="rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-3">
                            {signal}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step2}>
            <OnboardingPageLayout
                activeStep={2}
                showDefaultHelperPanel={false}
                helperPanel={helperPanel}
                headerTitle="Intended Platform Usage"
                headerSubtitle="Describe the request in a way reviewers can quickly understand: what the team wants to do, who will use the access, and what evaluation context Redoubt needs to support."
                pageEyebrow="Participant onboarding · Use case review"
            >
                <div className="space-y-6">
                    <section className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_48px_rgba(2,6,23,0.24)]">
                        <div className="max-w-3xl">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Step framing
                            </div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">Frame the request before governance review</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                This step should make the participation intent legible to a reviewer. Capture the
                                core goal, requested workflow, expected sensitivity, and the operating context that
                                explains why access is being requested.
                            </p>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    Reviewer priority
                                </div>
                                <p className="mt-2 text-sm text-slate-300">
                                    Understand the operational goal and whether the request fits a governed access lane.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    What helps most
                                </div>
                                <p className="mt-2 text-sm text-slate-300">
                                    Clear structure plus a concise narrative summary that explains the real workflow.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    This is not yet
                                </div>
                                <p className="mt-2 text-sm text-slate-300">
                                    A full legal or compliance review. This step is about access intent and reviewer clarity.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <article className={fieldSectionClassName}>
                            <div className="mb-5">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Structured selections
                                </div>
                                <h3 className="mt-2 text-lg font-semibold text-white">Primary goal</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Choose the main outcome this request is meant to support.
                                </p>
                            </div>

                            <SelectCardGroup
                                options={primaryGoalOptions}
                                selectedValues={structuredState.primaryGoal ? [structuredState.primaryGoal] : []}
                                onSelect={(value) => handleStructuredChange('primaryGoal', value)}
                            />
                        </article>

                        <article className={fieldSectionClassName}>
                            <div className="mb-5">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Structured selections
                                </div>
                                <h3 className="mt-2 text-lg font-semibold text-white">Requested workflow / usage type</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Select one or more workflow lanes that best describe how access will be used.
                                </p>
                            </div>

                            <SelectCardGroup
                                multi
                                options={usageOptions}
                                selectedValues={intendedUsage}
                                onSelect={toggleUsage}
                            />
                        </article>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <article className={fieldSectionClassName}>
                                <div className="mb-5">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Reviewer context
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-white">Sensitivity level</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Indicate how cautious reviewers should be when interpreting this request.
                                    </p>
                                </div>

                                <SelectCardGroup
                                    options={sensitivityOptions}
                                    selectedValues={structuredState.sensitivityLevel ? [structuredState.sensitivityLevel] : []}
                                    onSelect={(value) => handleStructuredChange('sensitivityLevel', value)}
                                />
                            </article>

                            <article className={fieldSectionClassName}>
                                <div className="mb-5">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Reviewer context
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-white">Who will use the access</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Clarify whether the request is for an individual, a small team, or a larger program.
                                    </p>
                                </div>

                                <SelectCardGroup
                                    options={accessAudienceOptions}
                                    selectedValues={structuredState.accessAudience ? [structuredState.accessAudience] : []}
                                    onSelect={(value) => handleStructuredChange('accessAudience', value)}
                                />
                            </article>
                        </div>

                        <article className={fieldSectionClassName}>
                            <div className="mb-5">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Reviewer context
                                </div>
                                <h3 className="mt-2 text-lg font-semibold text-white">Requested data type or evaluation context</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Help reviewers understand the environment or evaluation frame you are asking Redoubt to support.
                                </p>
                            </div>

                            <SelectCardGroup
                                options={evaluationContextOptions}
                                selectedValues={structuredState.evaluationContext ? [structuredState.evaluationContext] : []}
                                onSelect={(value) => handleStructuredChange('evaluationContext', value)}
                            />
                        </article>

                        <article className={fieldSectionClassName}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Reviewer-facing narrative
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-white">Use case summary</h3>
                                </div>
                                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                                    {meaningfulLength}/{MAX_USE_CASE_SUMMARY_LENGTH}
                                </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                Summarize the real workflow, evaluation, or decision your team wants to run on Redoubt.
                                Keep it concise but specific enough for a human reviewer to triage quickly.
                            </p>

                            <textarea
                                id="use-case-summary"
                                value={useCaseSummary}
                                onChange={(event) => handleUseCaseSummaryChange(event.target.value)}
                                placeholder="Example: Our security and research leads want to evaluate privacy-reviewed healthcare datasets for a controlled model-validation workflow before approving a small pilot."
                                rows={6}
                                maxLength={MAX_USE_CASE_SUMMARY_LENGTH}
                                className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                            />

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <span className="text-slate-500">
                                    Required. Keep it between {MIN_USE_CASE_SUMMARY_LENGTH} and {MAX_USE_CASE_SUMMARY_LENGTH} meaningful characters.
                                </span>
                                {summaryNeedsMoreDetail && (
                                    <span className="text-amber-300">
                                        Add a bit more detail so reviewers can understand the exact request.
                                    </span>
                                )}
                            </div>
                        </article>
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
                            Continue to Step 3
                        </button>
                    </section>
                </div>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
