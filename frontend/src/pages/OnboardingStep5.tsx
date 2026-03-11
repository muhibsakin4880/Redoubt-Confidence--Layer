import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const SUBMISSION_META_STORAGE_KEY = 'Redoubt:onboarding:submissionMeta'

const formatSubmissionDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

export default function OnboardingStep5() {
    const navigate = useNavigate()
    const { submitApplication } = useAuth()
    const [state, setState] = useState(() => {
        const saved = localStorage.getItem('Redoubt:onboarding:compliance')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch {
                return {
                    responsibleDataUsage: false,
                    noUnauthorizedSharing: false,
                    platformCompliancePolicies: false
                }
            }
        }
        return {
            responsibleDataUsage: false,
            noUnauthorizedSharing: false,
            platformCompliancePolicies: false
        }
    })

    const handleChange = (field: string, value: boolean) => {
        const newState = { ...state, [field]: value }
        setState(newState)
        localStorage.setItem('Redoubt:onboarding:compliance', JSON.stringify(newState))
    }

    const stepReady = state.responsibleDataUsage && state.noUnauthorizedSharing && state.platformCompliancePolicies

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!stepReady) return

        // Get email from step 1
        const step1Data = localStorage.getItem('Redoubt:onboarding:step1')
        let email = ''
        if (step1Data) {
            try {
                const parsed = JSON.parse(step1Data)
                email = parsed.officialWorkEmail || ''
            } catch {
                // Handle error
            }
        }

        const referenceId = `#BRE-2026-${Math.floor(1000 + Math.random() * 9000)}`
        const submissionDate = formatSubmissionDate(new Date())
        localStorage.setItem(
            SUBMISSION_META_STORAGE_KEY,
            JSON.stringify({
                referenceId,
                submittedDate: submissionDate
            })
        )

        submitApplication(email)
        navigate('/onboarding/confirmation')
    }

    const handleBack = () => {
        navigate('/onboarding/step4')
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Participant Onboarding</h1>
                    <p className="text-slate-400">Security and confidence infrastructure intake for controlled participation.</p>
                </div>

                <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-2">
                    {['Organization & Identity', 'Intended Platform Usage', 'Participation Intent', 'Verification & Credentials', 'Compliance Commitment', 'Submission Confirmation'].map((title, idx) => {
                        const currentStep = idx + 1
                        const active = currentStep === 5
                        const done = currentStep < 5
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

                <form onSubmit={handleSubmit}>
                    <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4 mb-6">
                        <h2 className="text-xl font-semibold">Compliance Commitment</h2>
                        <p className="text-sm text-slate-400">All commitments are required before application submission.</p>

                        <label className="flex items-start gap-3 text-sm text-slate-200">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={state.responsibleDataUsage}
                                onChange={(e) => handleChange('responsibleDataUsage', e.target.checked)}
                            />
                            <span>I agree to responsible data usage.</span>
                        </label>

                        <label className="flex items-start gap-3 text-sm text-slate-200">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={state.noUnauthorizedSharing}
                                onChange={(e) => handleChange('noUnauthorizedSharing', e.target.checked)}
                            />
                            <span>I agree to no unauthorized sharing.</span>
                        </label>

                        <label className="flex items-start gap-3 text-sm text-slate-200">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={state.platformCompliancePolicies}
                                onChange={(e) => handleChange('platformCompliancePolicies', e.target.checked)}
                            />
                            <span>I agree to platform compliance policies.</span>
                        </label>
                    </section>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={!stepReady}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

