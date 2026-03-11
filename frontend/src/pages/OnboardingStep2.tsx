import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const usageOptions = ['Research', 'AI/ML training', 'Analytics', 'Product development', 'Other']

export default function OnboardingStep2() {
    const navigate = useNavigate()
    const [intendedUsage, setIntendedUsage] = useState<string[]>(() => {
        const saved = localStorage.getItem('Redoubt:onboarding:intendedUsage')
        if (!saved) return []
        try {
            const parsed = JSON.parse(saved)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    })

    const toggleValue = (value: string) => {
        setIntendedUsage(prev => {
            const exists = prev.includes(value)
            const newValue = exists ? prev.filter(item => item !== value) : [...prev, value]
            localStorage.setItem('Redoubt:onboarding:intendedUsage', JSON.stringify(newValue))
            return newValue
        })
    }

    const handleNext = () => {
        if (intendedUsage.length > 0) {
            navigate('/onboarding/step3')
        }
    }

    const handleBack = () => {
        navigate('/onboarding/step1')
    }

    const selectAllUsages = () => {
        setIntendedUsage(usageOptions)
        localStorage.setItem('Redoubt:onboarding:intendedUsage', JSON.stringify(usageOptions))
    }

    const fillMockData = () => {
        const mockUsage = ['Research', 'AI/ML training']
        setIntendedUsage(mockUsage)
        localStorage.setItem('Redoubt:onboarding:intendedUsage', JSON.stringify(mockUsage))
    }

    const stepReady = intendedUsage.length > 0

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
                        const active = currentStep === 2
                        const done = currentStep < 2
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
            </div>
        </div>
    )
}

