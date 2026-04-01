import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { participantOnboardingPaths } from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { isStep2Complete } from '../onboarding/flow'
import { onboardingStorageKeys, readOnboardingValue, writeOnboardingValue } from '../onboarding/storage'

const usageOptions = ['Research', 'AI/ML training', 'Analytics', 'Product development', 'Other']

export default function OnboardingStep2() {
    const navigate = useNavigate()
    const [intendedUsage, setIntendedUsage] = useState<string[]>(() =>
        readOnboardingValue(onboardingStorageKeys.intendedUsage, [])
    )

    const toggleValue = (value: string) => {
        setIntendedUsage(prev => {
            const exists = prev.includes(value)
            const next = exists ? prev.filter(item => item !== value) : [...prev, value]
            writeOnboardingValue(onboardingStorageKeys.intendedUsage, next)
            return next
        })
    }

    const handleNext = () => {
        if (stepReady) {
            navigate(participantOnboardingPaths.step3)
        }
    }

    const handleBack = () => {
        navigate(participantOnboardingPaths.step1)
    }

    const selectAllUsages = () => {
        setIntendedUsage(usageOptions)
        writeOnboardingValue(onboardingStorageKeys.intendedUsage, usageOptions)
    }

    const fillMockData = () => {
        const mockUsage = ['Research', 'AI/ML training']
        setIntendedUsage(mockUsage)
        writeOnboardingValue(onboardingStorageKeys.intendedUsage, mockUsage)
    }

    const stepReady = isStep2Complete(intendedUsage)

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step2}>
            <OnboardingPageLayout activeStep={2}>
                <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4 mb-6">
                    <h2 className="text-xl font-semibold">Intended Platform Usage</h2>
                    <p className="text-sm text-slate-400">Select all that apply.</p>
                    <div className="flex flex-wrap gap-2">
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
                        onClick={selectAllUsages}
                        className="px-4 py-2 rounded-lg border border-slate-600 hover:border-purple-500 text-slate-300 hover:text-purple-300 transition-colors text-sm"
                    >
                        Select All
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
