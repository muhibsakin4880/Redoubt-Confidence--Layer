import { Outlet, useLocation } from 'react-router-dom'
import Header, { publicHeaderOffsetClassName, type PublicHeaderVariant } from '../components/Header'
import Footer from '../components/Footer'
import { participantOnboardingPaths } from '../onboarding/constants'

export default function MainLayout() {
    const location = useLocation()
    const isLandingPage = location.pathname === '/'
    const isProtectedEvaluationRoute = location.pathname === '/protected-evaluation'
    const isDedicatedOnboardingRoute = location.pathname.startsWith(participantOnboardingPaths.entry)
    const isParticipantOnboardingRoute =
        isDedicatedOnboardingRoute ||
        location.pathname === participantOnboardingPaths.applicationStatus
    const headerVariant: PublicHeaderVariant = isParticipantOnboardingRoute
        ? 'onboarding'
        : isProtectedEvaluationRoute
            ? 'protectedEvaluation'
            : 'default'
    const mainOffsetClassName = isLandingPage || isDedicatedOnboardingRoute
        ? ''
        : publicHeaderOffsetClassName[headerVariant]

    return (
        <div className="flex flex-col min-h-screen">
            {!isLandingPage && !isDedicatedOnboardingRoute && <Header variant={headerVariant} />}
            <main className={`flex-1 ${mainOffsetClassName}`}>
                <Outlet />
            </main>
            {!isDedicatedOnboardingRoute && <Footer />}
        </div>
    )
}
