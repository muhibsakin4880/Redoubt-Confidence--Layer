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
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AIInterrogationLogsPage from './pages/admin/AIInterrogationLogsPage'
import AIReportPage from './pages/admin/AIReportPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import EscrowVaultPage from './pages/admin/EscrowVaultPage'
import ActiveEphemeralTokensPage from './pages/admin/ActiveEphemeralTokensPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import ProviderDatasetManagementPage from './pages/admin/ProviderDatasetManagementPage'
import SecurityCompliancePage from './pages/admin/SecurityCompliancePage'
import OperationsPage from './pages/admin/OperationsPage'
import NotificationsPage from './pages/admin/NotificationsPage'
import AdminAuditTrailPage from './pages/admin/AdminAuditTrailPage'
import OnboardingQueuePage from './pages/OnboardingQueuePage'
import ApplicationReviewPage from './pages/admin/ApplicationReviewPage'
import NotFoundPage from './pages/NotFoundPage'
import OnboardingPage from './pages/OnboardingPage'
import OnboardingStep1 from './pages/OnboardingStep1'
import OnboardingStep2 from './pages/OnboardingStep2'
import OnboardingStep3 from './pages/OnboardingStep3'
import OnboardingStep4 from './pages/OnboardingStep4'
import OnboardingStep5 from './pages/OnboardingStep5'
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
import TrustScoreHistoryPage from './pages/TrustScoreHistoryPage'
import PipelinesPage from './pages/PipelinesPage'
import SecurityOperationsPage from './pages/SecurityOperationsPage'
import ComplianceLockerPage from './pages/ComplianceLockerPage'
import AuditTrailPage from './pages/AuditTrailPage'
import ConsentTrackerPage from './pages/ConsentTrackerPage'
import RedTeamModePage from './pages/RedTeamModePage'
import RBACConsolePage from './pages/RBACConsolePage'
import UsageAnalyticsPage from './pages/UsageAnalyticsPage'
import IncidentResponsePage from './pages/IncidentResponsePage'
import DataClassificationPage from './pages/DataClassificationPage'
import SecureEnclavePage from './pages/SecureEnclavePage'
import StatusPage from './pages/StatusPage'
import EscrowCenterPage from './pages/EscrowCenterPage'
import TrustGlossaryPage from './pages/TrustGlossaryPage'
import DeploymentModelPage from './pages/DeploymentModelPage'
import GuidedTourPage from './pages/GuidedTourPage'
import DataLineagePage from './pages/DataLineagePage'
import CompliancePassportPage from './pages/CompliancePassportPage'
import RightsQuoteBuilderPage from './pages/RightsQuoteBuilderPage'
import EscrowCheckoutPage from './pages/EscrowCheckoutPage'

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
                         className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:text-white transition-transform duration-100 active:scale-95"
                     >
                         Skip for now
                     </button>
                     <button
                         onClick={onContinue}
                         className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-transform duration-100 active:scale-95"
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
                    <Route path="onboarding/step5" element={RequireOnboardingAccess(<OnboardingStep5 />)} />
                    <Route path="onboarding/confirmation" element={RequireOnboardingAccess(<OnboardingConfirmation />)} />
                </Route>

                <Route path="admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="admin/login" element={<AdminLoginPage />} />
                <Route path="admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="admin/ai-interrogation-logs" element={<AIInterrogationLogsPage />} />
                <Route path="admin/ai-report/:reportId" element={<AIReportPage />} />
                <Route path="admin/settings" element={<AdminSettingsPage />} />
                <Route path="admin/escrow-vault" element={<EscrowVaultPage />} />
<Route path="admin/ephemeral-tokens" element={<ActiveEphemeralTokensPage />} />
                <Route path="admin/user-management" element={<UserManagementPage />} />
                <Route path="admin/provider-dataset" element={<ProviderDatasetManagementPage />} />
                <Route path="admin/security-compliance" element={<SecurityCompliancePage />} />
                <Route path="admin/operations" element={<OperationsPage />} />
                <Route path="admin/notifications" element={<NotificationsPage />} />
                <Route path="admin/onboarding-queue" element={<OnboardingQueuePage />} />
                <Route path="admin/application-review/:appId" element={<ApplicationReviewPage />} />
                <Route path="admin/incident-response" element={<IncidentResponsePage />} />
                <Route path="admin/audit-trail" element={<AdminAuditTrailPage />} />

                <Route element={RequireWorkspaceAccess(<AppLayout />)}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="datasets" element={<DatasetsPage />} />
                    <Route path="datasets/:id" element={<DatasetDetailPage />} />
                    <Route path="datasets/:id/rights-quote" element={<RightsQuoteBuilderPage />} />
                    <Route path="datasets/:id/escrow-checkout" element={<EscrowCheckoutPage />} />
                    <Route path="datasets/:id/quality-breakdown" element={<DatasetQualityBreakdownPage />} />
                    <Route path="access-requests" element={<AccessRequestsPage />} />
                    <Route path="access-requests/:requestId" element={<AccessRequestDetailPage />} />
                    <Route path="requests" element={<Navigate to="/access-requests" replace />} />
                    <Route path="escrow-center" element={<EscrowCenterPage />} />
                    <Route path="trust-profile" element={<TrustProfilePage />} />
                    <Route path="compliance-passport" element={<CompliancePassportPage />} />
                    <Route path="trust-score-history" element={<TrustScoreHistoryPage />} />
                    <Route path="contributions" element={<ContributionsPage />} />
                    <Route path="contributions/ds-1003" element={<ContributionDetailPage />} />
                    <Route path="contributions/:datasetId/status-details" element={<ContributionStatusDetailsPage />} />
                    <Route path="pipelines" element={<PipelinesPage />} />
                    <Route path="usage-analytics" element={<UsageAnalyticsPage />} />
                    <Route path="rbac-console" element={<RBACConsolePage />} />
                    <Route path="data-classification" element={<DataClassificationPage />} />
                    <Route path="secure-enclave" element={<SecureEnclavePage />} />
                    <Route path="security-ops" element={<SecurityOperationsPage />} />
                    <Route path="compliance-locker" element={<ComplianceLockerPage />} />
                    <Route path="audit-trail" element={<AuditTrailPage />} />
                    <Route path="consent-tracker" element={<ConsentTrackerPage />} />
                    <Route path="red-team" element={<RedTeamModePage />} />
                    <Route path="status" element={<StatusPage />} />
                    <Route path="trust-glossary" element={<TrustGlossaryPage />} />
                    <Route path="deployment-model" element={<DeploymentModelPage />} />
                    <Route path="guided-tour" element={<GuidedTourPage />} />
                    <Route path="data-lineage" element={<DataLineagePage />} />

                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    )
}

export default App
