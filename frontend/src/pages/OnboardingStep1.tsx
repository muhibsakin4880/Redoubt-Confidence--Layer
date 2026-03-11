import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Step1FormState = {
    organizationName: string
    officialWorkEmail: string
    inviteCode: string
    roleInOrganization: string
    industryDomain: string
    country: string
}

const STORAGE_KEY = 'Redoubt:onboarding:step1'
const freeEmailProviders = new Set([
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'protonmail.com'
])

const steps = [
    'Organization & Identity',
    'Intended Platform Usage',
    'Participation Intent',
    'Verification & Credentials',
    'Compliance Commitment',
    'Submission Confirmation'
]

const isWorkEmail = (value: string) => /^[^\s@]+@[^\s@]+$/.test(value)
const isCorporateEmail = (value: string) => {
    if (!isWorkEmail(value)) return false
    const domain = value.split('@')[1]?.toLowerCase()
    return Boolean(domain) && !freeEmailProviders.has(domain)
}

export default function OnboardingStep1() {
    const navigate = useNavigate()
    const [state, setState] = useState<Step1FormState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) {
            return {
                organizationName: '',
                officialWorkEmail: '',
                inviteCode: '',
                roleInOrganization: '',
                industryDomain: '',
                country: ''
            }
        }
        try {
            return JSON.parse(saved) as Step1FormState
        } catch {
            return {
                organizationName: '',
                officialWorkEmail: '',
                inviteCode: '',
                roleInOrganization: '',
                industryDomain: '',
                country: ''
            }
        }
    })
    const [showError, setShowError] = useState(false)

    const handleChange = (field: keyof Step1FormState, value: string) => {
        const next = { ...state, [field]: value }
        setState(next)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }

    const fillMockData = () => {
        const mockState: Step1FormState = {
            organizationName: 'Demo Corporation',
            officialWorkEmail: 'demo@redoubt.local',
            inviteCode: 'REDO-2026',
            roleInOrganization: 'Senior Data Engineer',
            industryDomain: 'Technology & AI',
            country: 'United States'
        }
        setState(mockState)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState))
        setShowError(false)
    }

    const stepReady = useMemo(
        () =>
            state.organizationName.trim().length > 0 &&
            isCorporateEmail(state.officialWorkEmail.trim()) &&
            state.inviteCode.trim().length >= 6 &&
            state.roleInOrganization.trim().length > 0 &&
            state.industryDomain.trim().length > 0 &&
            state.country.trim().length > 0,
        [state]
    )

    const handleNext = () => {
        if (!stepReady) {
            setShowError(true)
            return
        }
        navigate('/onboarding/step2')
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Participant Onboarding</h1>
                    <p className="text-slate-400">Security and confidence infrastructure intake for controlled participation.</p>
                </div>

                <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-2">
                    {steps.map((title, idx) => {
                        const currentStep = idx + 1
                        const active = currentStep === 1
                        const done = currentStep < 1
                        return (
                            <div
                                key={title}
                                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                                    active
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
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">Organization & Identity</h2>
                        <button
                            type="button"
                            onClick={fillMockData}
                            className="text-xs px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:border-blue-500 hover:text-white transition-colors"
                        >
                            Use mock data
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Organization name</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                value={state.organizationName}
                                onChange={(e) => handleChange('organizationName', e.target.value)}
                                placeholder="Your organization"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Official work email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                value={state.officialWorkEmail}
                                onChange={(e) => handleChange('officialWorkEmail', e.target.value)}
                                placeholder="name@organization.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Invite code</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                value={state.inviteCode}
                                onChange={(e) => handleChange('inviteCode', e.target.value)}
                                placeholder="INV-XXXXXX"
                            />
                            <p className="mt-1 text-xs text-slate-500">Optional — we'll verify either way, but this helps us move faster.</p>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Role in organization</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                value={state.roleInOrganization}
                                onChange={(e) => handleChange('roleInOrganization', e.target.value)}
                                placeholder="Research lead, ML engineer, analyst..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Industry/domain</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                value={state.industryDomain}
                                onChange={(e) => handleChange('industryDomain', e.target.value)}
                                placeholder="Healthcare, mobility, climate..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Country</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                value={state.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                placeholder="Country"
                            />
                        </div>
                    </div>
                    {showError && !stepReady && (
                        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                            Please complete all fields with a valid corporate email and invite code before continuing.
                        </div>
                    )}
                </section>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleNext}
                        className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                    >
                        Continue to Step 2
                    </button>
                </div>
            </div>
        </div>
    )
}

