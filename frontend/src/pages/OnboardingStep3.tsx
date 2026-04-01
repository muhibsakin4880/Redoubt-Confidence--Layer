import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { participantOnboardingPaths } from '../onboarding/constants'
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

const participationOptions = ['Access datasets', 'Contribute datasets', 'Collaborate', 'Research participation']

export default function OnboardingStep3() {
    const navigate = useNavigate()
    const [participationIntent, setParticipationIntent] = useState<string[]>(() =>
        readOnboardingValue(onboardingStorageKeys.participationIntent, [])
    )
    const [legalAcknowledgment, setLegalAcknowledgment] = useState<LegalAcknowledgment>(() =>
        readOnboardingValue(onboardingStorageKeys.legalAcknowledgment, emptyLegalAcknowledgment)
    )

    const toggleValue = (value: string) => {
        setParticipationIntent(prev => {
            const exists = prev.includes(value)
            const next = exists ? prev.filter(item => item !== value) : [...prev, value]
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

    const selectAllParticipation = () => {
        setParticipationIntent(participationOptions)
        writeOnboardingValue(onboardingStorageKeys.participationIntent, participationOptions)
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

    const handleNext = () => {
        if (stepReady) {
            navigate(participantOnboardingPaths.step4)
        }
    }

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step3}>
            <OnboardingPageLayout activeStep={3}>
                <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4 mb-6">
                    <h2 className="text-xl font-semibold">Participation Intent</h2>
                    <p className="text-sm text-slate-400">Choose how your team plans to participate.</p>
                    <div className="flex flex-wrap gap-2">
                        {participationOptions.map(option => {
                            const active = participationIntent.includes(option)
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

                <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4 mb-6">
                    <h2 className="text-xl font-semibold">Legal &amp; Governance Acknowledgment</h2>

                    <label className="flex items-start gap-3 text-[13px] text-slate-400">
                        <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={legalAcknowledgment.authorizedRepresentative}
                            onChange={(e) => handleLegalChange('authorizedRepresentative', e.target.checked)}
                        />
                        <span>I confirm that I am authorised to represent [Organisation Name] on this platform.</span>
                    </label>

                    <label className="flex items-start gap-3 text-[13px] text-slate-400">
                        <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={legalAcknowledgment.governancePolicyAccepted}
                            onChange={(e) => handleLegalChange('governancePolicyAccepted', e.target.checked)}
                        />
                        <span>
                            I agree to the{' '}
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="text-blue-400 underline underline-offset-2"
                            >
                                Redoubt Data Governance Policy
                            </a>{' '}
                            and accept that all data access is logged, governed, and subject to contributor permissions.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 text-[13px] text-slate-400">
                        <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={legalAcknowledgment.nonRedistributionAcknowledged}
                            onChange={(e) => handleLegalChange('nonRedistributionAcknowledged', e.target.checked)}
                        />
                        <span>
                            I acknowledge that data obtained through this platform may not be redistributed, resold, or
                            used beyond the stated purpose without explicit written consent.
                        </span>
                    </label>
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
                        onClick={selectAllParticipation}
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
