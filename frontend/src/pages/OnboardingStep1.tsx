import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { participantOnboardingPaths } from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import { isStep1Complete } from '../onboarding/flow'
import { emptyStep1FormState, onboardingStorageKeys, readOnboardingValue, writeOnboardingValue } from '../onboarding/storage'
import type { Step1FormState } from '../onboarding/types'

export default function OnboardingStep1() {
    const navigate = useNavigate()
    const [state, setState] = useState<Step1FormState>(() =>
        readOnboardingValue(onboardingStorageKeys.step1, emptyStep1FormState)
    )
    const [showError, setShowError] = useState(false)

    const handleChange = (field: keyof Step1FormState, value: string) => {
        const next = { ...state, [field]: value }
        setState(next)
        writeOnboardingValue(onboardingStorageKeys.step1, next)
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
        writeOnboardingValue(onboardingStorageKeys.step1, mockState)
        setShowError(false)
    }

    const stepReady = useMemo(
        () => isStep1Complete(state),
        [state]
    )

    const handleNext = () => {
        if (!stepReady) {
            setShowError(true)
            return
        }

        navigate(participantOnboardingPaths.step2)
    }

    return (
        <OnboardingPageLayout activeStep={1}>
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
                        Please complete all required fields with a valid corporate email. If you have an invite code,
                        make sure it is valid before continuing.
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
        </OnboardingPageLayout>
    )
}
