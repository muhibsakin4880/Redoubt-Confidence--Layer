import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const participationOptions = ['Access datasets', 'Contribute datasets', 'Collaborate', 'Research participation']
const LEGAL_STORAGE_KEY = 'Redoubt:onboarding:legalAcknowledgment'

export default function OnboardingStep3() {
    const navigate = useNavigate()
    const [participationIntent, setParticipationIntent] = useState<string[]>(() => {
        const saved = localStorage.getItem('Redoubt:onboarding:participationIntent')
        if (!saved) return []
        try {
            const parsed = JSON.parse(saved)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    })
    const [legalAcknowledgment, setLegalAcknowledgment] = useState(() => {
        const saved = localStorage.getItem(LEGAL_STORAGE_KEY)
        if (!saved) {
            return {
                authorizedRepresentative: false,
                governancePolicyAccepted: false,
                nonRedistributionAcknowledged: false
            }
        }

        try {
            return JSON.parse(saved)
        } catch {
            return {
                authorizedRepresentative: false,
                governancePolicyAccepted: false,
                nonRedistributionAcknowledged: false
            }
        }
    })

    const toggleValue = (value: string) => {
        setParticipationIntent(prev => {
            const exists = prev.includes(value)
            const newValue = exists ? prev.filter(item => item !== value) : [...prev, value]
            localStorage.setItem('Redoubt:onboarding:participationIntent', JSON.stringify(newValue))
            return newValue
        })
    }

    const handleLegalChange = (
        field: 'authorizedRepresentative' | 'governancePolicyAccepted' | 'nonRedistributionAcknowledged',
        checked: boolean
    ) => {
        const next = { ...legalAcknowledgment, [field]: checked }
        setLegalAcknowledgment(next)
        localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify(next))
    }

    const handleBack = () => {
        navigate('/onboarding/step2')
    }

    const selectAllParticipation = () => {
        setParticipationIntent(participationOptions)
        localStorage.setItem('Redoubt:onboarding:participationIntent', JSON.stringify(participationOptions))
    }

    const fillMockData = () => {
        const mockParticipation = ['Access datasets', 'Collaborate']
        const mockLegal = {
            authorizedRepresentative: true,
            governancePolicyAccepted: true,
            nonRedistributionAcknowledged: true
        }

        setParticipationIntent(mockParticipation)
        setLegalAcknowledgment(mockLegal)
        localStorage.setItem('Redoubt:onboarding:participationIntent', JSON.stringify(mockParticipation))
        localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify(mockLegal))
    }

    const allLegalChecked =
        legalAcknowledgment.authorizedRepresentative &&
        legalAcknowledgment.governancePolicyAccepted &&
        legalAcknowledgment.nonRedistributionAcknowledged

    const stepReady = participationIntent.length > 0 && allLegalChecked

    const handleNext = () => {
        if (stepReady) {
            navigate('/onboarding/step4')
        }
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Participant Onboarding</h1>
                    <p className="text-slate-400">Security and confidence infrastructure intake for controlled participation.</p>
                </div>

                <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2">
                    {['Organization & Identity', 'Intended Platform Usage', 'Participation Intent', 'Compliance Commitment', 'Submission Confirmation'].map((title, idx) => {
                        const currentStep = idx + 1
                        const active = currentStep === 3
                        const done = currentStep < 3
                        return (
                            <div
                                key={title}
                                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${active
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                    : done
                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                        : 'border-slate-700 bg-slate-800/70 text-slate-400'
                                    }`}
                            >
                                <div className="uppercase tracking-[0.1em] mb-1">Step {currentStep}</div>
                                <div>{title}</div>
                            </div>
                        )
                    })}
                </div>

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
                                    className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${active
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
                            I acknowledge that data obtained through this platform may not be redistributed, resold, or used
                            beyond the stated purpose without explicit written consent.
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
            </div>
        </div>
    )
}

