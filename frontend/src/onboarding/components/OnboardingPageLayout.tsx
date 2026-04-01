import type { ReactNode } from 'react'

import {
    participantOnboardingStepTitles,
    participantOnboardingSubtitle,
    participantOnboardingTitle
} from '../constants'
import OnboardingProgress from './OnboardingProgress'

type OnboardingPageLayoutProps = {
    activeStep?: number
    children: ReactNode
    progressVariant?: 'grid' | 'connector'
}

export default function OnboardingPageLayout({
    activeStep,
    children,
    progressVariant = 'grid'
}: OnboardingPageLayoutProps) {
    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{participantOnboardingTitle}</h1>
                    <p className="text-slate-400">{participantOnboardingSubtitle}</p>
                </div>

                {typeof activeStep === 'number' && (
                    <OnboardingProgress
                        activeStep={activeStep}
                        steps={participantOnboardingStepTitles}
                        variant={progressVariant}
                    />
                )}

                {children}
            </div>
        </div>
    )
}
