import { Navigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { participantOnboardingPaths } from '../onboarding/constants'
import { getOnboardingResumePath } from '../onboarding/flow'

export default function OnboardingEntryPage() {
    const { accessStatus } = useAuth()

    if (accessStatus === 'pending') {
        return <Navigate to={participantOnboardingPaths.applicationStatus} replace />
    }

    return <Navigate to={getOnboardingResumePath()} replace />
}
