import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { getOnboardingGuardRedirect } from '../flow'

type OnboardingStepGuardProps = {
    currentPath: string
    children: ReactNode
}

export default function OnboardingStepGuard({ currentPath, children }: OnboardingStepGuardProps) {
    const redirectPath = getOnboardingGuardRedirect(currentPath)

    if (redirectPath && redirectPath !== currentPath) {
        return <Navigate to={redirectPath} replace />
    }

    return <>{children}</>
}
