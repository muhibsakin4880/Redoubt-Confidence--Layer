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
import ContributionStatusDetailsPage from './pages/ContributionStatusDetailsPage'
import AccessRequestsPage from './pages/AccessRequestsPage'
import AccessRequestDetailPage from './pages/AccessRequestDetailPage'
import TrustProfilePage from './pages/TrustProfilePage'
import PipelinesPage from './pages/PipelinesPage'
import { useAuth } from './contexts/AuthContext'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

function App() {
    const { isAuthenticated, accessStatus } = useAuth()

    const RequireOnboardingAccess = (element: JSX.Element) => {
        // Allow access while onboarding is in progress or awaiting review
        if (accessStatus === 'pending') return element
        if (accessStatus === 'not_started') return element
        // If already approved, redirect to dashboard/login
        if (accessStatus === 'approved') {
            if (MOCK_AUTH) return element
            return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
        // Only redirect to home if user hasn't started onboarding at all
        return <Navigate to="/" replace />
    }

    const RequireWorkspaceAccess = (element: JSX.Element) => {
        if (accessStatus !== 'approved') {
            if (accessStatus === 'pending') return <Navigate to="/onboarding" replace />
            return <Navigate to="/" replace />
        }
        if (!isAuthenticated) return <Navigate to="/login" replace />
        return element
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="solutions" element={<SolutionsPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="application-status" element={<ApplicationStatusPage />} />
                    <Route path="onboarding" element={RequireOnboardingAccess(<OnboardingPage />)} />
                    <Route path="onboarding/step1" element={RequireOnboardingAccess(<OnboardingStep1 />)} />
                    <Route path="onboarding/step2" element={RequireOnboardingAccess(<OnboardingStep2 />)} />
                    <Route path="onboarding/step3" element={RequireOnboardingAccess(<OnboardingStep3 />)} />
                    <Route path="onboarding/step4" element={RequireOnboardingAccess(<OnboardingStep4 />)} />
                    <Route path="onboarding/confirmation" element={RequireOnboardingAccess(<OnboardingConfirmation />)} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route path="/" element={RequireWorkspaceAccess(<AppLayout />)}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="datasets" element={<DatasetsPage />} />
                    <Route path="datasets/:id" element={<DatasetDetailPage />} />
                    <Route path="datasets/:id/quality-breakdown" element={<DatasetQualityBreakdownPage />} />
                    <Route path="access-requests" element={<AccessRequestsPage />} />
                    <Route path="access-requests/:requestId" element={<AccessRequestDetailPage />} />
                    <Route path="requests" element={<Navigate to="/access-requests" replace />} />
                    <Route path="trust-profile" element={<TrustProfilePage />} />
                    <Route path="contributions" element={<ContributionsPage />} />
                    <Route path="contributions/:datasetId/status-details" element={<ContributionStatusDetailsPage />} />
                    <Route path="pipelines" element={<PipelinesPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
