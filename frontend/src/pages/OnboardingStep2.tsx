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

const usageOptions = ['Research', 'AI/ML training', 'Analytics', 'Product development', 'Other']

export default function OnboardingStep2() {
    const navigate = useNavigate()
    const [intendedUsage, setIntendedUsage] = useState<string[]>(() =>
        readOnboardingValue(onboardingStorageKeys.intendedUsage, [])
    )
    const [useCaseSummary, setUseCaseSummary] = useState(() =>
        readOnboardingValue(onboardingStorageKeys.useCaseSummary, emptyUseCaseSummary)
    )

    const trimmedUseCaseSummary = useCaseSummary.trim()
    const meaningfulLength = trimmedUseCaseSummary.length
    const stepReady = isStep2Complete(intendedUsage, useCaseSummary)
    const summaryNeedsMoreDetail =
        meaningfulLength > 0 && meaningfulLength < MIN_USE_CASE_SUMMARY_LENGTH

    const toggleValue = (value: string) => {
        setIntendedUsage(prev => {
            const exists = prev.includes(value)
            const next = exists ? prev.filter(item => item !== value) : [...prev, value]
            writeOnboardingValue(onboardingStorageKeys.intendedUsage, next)
            return next
        })
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
        const mockSummary =
            'We want to evaluate regulated healthcare datasets for research benchmarking and model validation inside the Redoubt workflow.'

        setIntendedUsage(mockUsage)
        setUseCaseSummary(mockSummary)
        writeOnboardingValue(onboardingStorageKeys.intendedUsage, mockUsage)
        writeOnboardingValue(onboardingStorageKeys.useCaseSummary, mockSummary)
    }

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step2}>
            <OnboardingPageLayout activeStep={2}>
                <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-5 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">Intended Platform Usage</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Choose the tags that best fit your request, then describe the real outcome your team is trying to achieve.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                        <div className="text-sm font-semibold text-white">Usage tags</div>
                        <p className="mt-1 text-sm text-slate-400">
                            These tags help reviewers triage the application. They are not dataset access controls or commercial terms.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {usageOptions.map(option => {
                                const active = intendedUsage.includes(option)
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => toggleValue(option)}
                                        className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                            active
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <label htmlFor="use-case-summary" className="text-sm font-semibold text-white">
                                What are you trying to do on Redoubt?
                            </label>
                            <span className="text-xs font-semibold text-slate-400">
                                {meaningfulLength}/{MAX_USE_CASE_SUMMARY_LENGTH}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                            Give a short reviewer-facing explanation of the intended workflow, decision, or evaluation you want to run.
                        </p>
                        <textarea
                            id="use-case-summary"
                            value={useCaseSummary}
                            onChange={(event) => handleUseCaseSummaryChange(event.target.value)}
                            placeholder="Example: We want to evaluate privacy-reviewed healthcare datasets for model benchmarking before requesting protected evaluation in a governed workspace."
                            rows={5}
                            maxLength={MAX_USE_CASE_SUMMARY_LENGTH}
                            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                            <span className="text-slate-500">
                                Required. Keep it between {MIN_USE_CASE_SUMMARY_LENGTH} and {MAX_USE_CASE_SUMMARY_LENGTH} meaningful characters.
                            </span>
                            {summaryNeedsMoreDetail && (
                                <span className="text-amber-300">
                                    Add a bit more detail so reviewers understand the request.
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={fillMockData}
                        className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white transition-colors text-sm"
                    >
                        Use mock data
                    </button>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!stepReady}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
