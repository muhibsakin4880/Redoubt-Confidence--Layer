import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AppLayout from './layouts/AppLayout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import DatasetsPage from './pages/DatasetsPage'
import DatasetDetailPage from './pages/DatasetDetailPage'
import DatasetQualityBreakdownPage from './pages/DatasetQualityBreakdownPage'
import SolutionsPage from './pages/SolutionsPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import OnboardingPage from './pages/OnboardingPage'
import OnboardingStep1 from './pages/OnboardingStep1'
import OnboardingStep2 from './pages/OnboardingStep2'
import OnboardingStep3 from './pages/OnboardingStep3'
import OnboardingStep4 from './pages/OnboardingStep4'
import OnboardingConfirmation from './pages/OnboardingConfirmation'
import AboutPage from './pages/AboutPage'
import ApplicationStatusPage from './pages/ApplicationStatusPage'
import ProfilePage from './pages/ProfilePage'
import ContributionsPage from './pages/ContributionsPage'
import ContributionDetailPage from './pages/ContributionDetailPage'
import ContributionStatusDetailsPage from './pages/ContributionStatusDetailsPage'
import AccessRequestsPage from './pages/AccessRequestsPage'
import AccessRequestDetailPage from './pages/AccessRequestDetailPage'
import TrustProfilePage from './pages/TrustProfilePage'
import PipelinesPage from './pages/PipelinesPage'
import SecurityOperationsPage from './pages/SecurityOperationsPage'
import ComplianceLockerPage from './pages/ComplianceLockerPage'
import AuditTrailPage from './pages/AuditTrailPage'
import ConsentTrackerPage from './pages/ConsentTrackerPage'
import { useAuth } from './contexts/AuthContext'

type AccessIntentAuth = ReturnType<typeof useAuth> & {
    accessIntentPromptPending?: boolean
    submitAccessIntent?: () => void
    skipAccessIntent?: () => void
}

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

function AccessIntentModal({
    onContinue,
    onSkip
}: {
    onContinue: () => void
    onSkip: () => void
}) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-800 p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-white">Access Intent</h2>
                <p className="text-slate-300">
                    Before entering your workspace, please complete your access intent prompt.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onSkip}
                        className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:text-white"
                    >
                        Skip for now
                    </button>
                    <button
                        onClick={onContinue}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    )
}

function App() {
    const auth = useAuth() as AccessIntentAuth
    const {
        isAuthenticated,
        accessStatus,
        accessIntentPromptPending = false,
        submitAccessIntent,
        skipAccessIntent
    } = auth

    const RequireOnboardingAccess = (element: JSX.Element) => {
        if (accessStatus === 'pending') return element
        if (accessStatus === 'not_started') return element
        if (accessStatus === 'approved') {
            if (MOCK_AUTH) return element
            return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
        return <Navigate to="/" replace />
    }

    const RequireWorkspaceAccess = (element: JSX.Element) => {
        if (accessStatus !== 'approved') {
            if (accessStatus === 'pending') return <Navigate to="/onboarding" replace />
            return <Navigate to="/" replace />
        }
        if (!isAuthenticated) return <Navigate to="/login" replace />

        if (accessIntentPromptPending) {
            return (
                <AccessIntentModal
                    onContinue={() => {
                        submitAccessIntent?.()
                    }}
                    onSkip={() => {
                        skipAccessIntent?.()
                    }}
                />
            )
        }

        return element
    }

    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="solutions" element={<SolutionsPage />} />
                    <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
                    <Route path="application-status" element={<ApplicationStatusPage />} />
                    <Route path="onboarding" element={RequireOnboardingAccess(<OnboardingPage />)} />
                    <Route path="onboarding/step1" element={RequireOnboardingAccess(<OnboardingStep1 />)} />
                    <Route path="onboarding/step2" element={RequireOnboardingAccess(<OnboardingStep2 />)} />
                    <Route path="onboarding/step3" element={RequireOnboardingAccess(<OnboardingStep3 />)} />
                    <Route path="onboarding/step4" element={RequireOnboardingAccess(<OnboardingStep4 />)} />
                    <Route path="onboarding/confirmation" element={RequireOnboardingAccess(<OnboardingConfirmation />)} />
                </Route>

                <Route element={RequireWorkspaceAccess(<AppLayout />)}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="datasets" element={<DatasetsPage />} />
                    <Route path="datasets/:id" element={<DatasetDetailPage />} />
                    <Route path="datasets/:id/quality-breakdown" element={<DatasetQualityBreakdownPage />} />
                    <Route path="access-requests" element={<AccessRequestsPage />} />
                    <Route path="access-requests/:requestId" element={<AccessRequestDetailPage />} />
                    <Route path="requests" element={<Navigate to="/access-requests" replace />} />
                    <Route path="trust-profile" element={<TrustProfilePage />} />
                    <Route path="contributions" element={<ContributionsPage />} />
                    <Route path="contributions/ds-1003" element={<ContributionDetailPage />} />
                    <Route path="contributions/:datasetId/status-details" element={<ContributionStatusDetailsPage />} />
                    <Route path="pipelines" element={<PipelinesPage />} />
                    <Route path="security-ops" element={<SecurityOperationsPage />} />
                    <Route path="compliance-locker" element={<ComplianceLockerPage />} />
                    <Route path="audit-trail" element={<AuditTrailPage />} />
                    <Route path="consent-tracker" element={<ConsentTrackerPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    )
}

export default App
