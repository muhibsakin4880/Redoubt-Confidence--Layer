import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AppLayout from './layouts/AppLayout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ParticipantConsolePage from './pages/ParticipantConsolePage'
import DatasetsPage from './pages/DatasetsPage'
import DatasetDetailPage from './pages/DatasetDetailPage'
import DatasetQualityBreakdownPage from './pages/DatasetQualityBreakdownPage'
import SolutionsPage from './pages/SolutionsPage'
import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import NotFoundPage from './pages/NotFoundPage'
import OnboardingEntryPage from './pages/OnboardingEntryPage'
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
import ProviderDashboardPage from './pages/ProviderDashboardPage'
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
import PilotWalkthroughPage from './pages/PilotWalkthroughPage'
import ProtectedEvaluationPage from './pages/ProtectedEvaluationPage'
import TrustCenterPage from './pages/TrustCenterPage'
import ResearcherAccessPage from './pages/ResearcherAccessPage'
import DealRoutePlaceholderPage from './pages/DealRoutePlaceholderPage'
import DealDossierPage from './pages/DealDossierPage'
import ProviderRightsPacketPage from './pages/ProviderRightsPacketPage'

import { useAuth } from './contexts/AuthContext'
import { participantOnboardingPaths } from './onboarding/constants'
import { DEFAULT_DEAL_ID } from './data/dealDossierData'

const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AIInterrogationLogsPage = lazy(() => import('./pages/admin/AIInterrogationLogsPage'))
const AIReportPage = lazy(() => import('./pages/admin/AIReportPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const EscrowVaultPage = lazy(() => import('./pages/admin/EscrowVaultPage'))
const ActiveEphemeralTokensPage = lazy(() => import('./pages/admin/ActiveEphemeralTokensPage'))
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'))
const ProviderDatasetManagementPage = lazy(() => import('./pages/admin/ProviderDatasetManagementPage'))
const SecurityCompliancePage = lazy(() => import('./pages/admin/SecurityCompliancePage'))
const OperationsPage = lazy(() => import('./pages/admin/OperationsPage'))
const OperationsHubPage = lazy(() => import('./pages/admin/OperationsHubPage'))
const NotificationsPage = lazy(() => import('./pages/admin/NotificationsPage'))
const AdminAuditTrailPage = lazy(() => import('./pages/admin/AdminAuditTrailPage'))
const OnboardingQueuePage = lazy(() => import('./pages/OnboardingQueuePage'))
const ApplicationReviewPage = lazy(() => import('./pages/admin/ApplicationReviewPage'))
const IncidentResponsePage = lazy(() => import('./pages/IncidentResponsePage'))

type AccessIntentAuth = ReturnType<typeof useAuth> & {
    accessIntentPromptPending?: boolean
    submitAccessIntent?: () => void
    skipAccessIntent?: () => void
}

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

function RouteLoader() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-300">
                Loading page...
            </div>
        </div>
    )
}

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

function LegacyContributionRedirect({
    destination
}: {
    destination: 'detail' | 'status'
}) {
    const { id, datasetId } = useParams<{ id?: string; datasetId?: string }>()
    const contributionId = id ?? datasetId

    if (!contributionId) {
        return <Navigate to="/provider/dashboard" replace />
    }

    return (
        <Navigate
            to={
                destination === 'status'
                    ? `/provider/datasets/${contributionId}/status`
                    : `/provider/datasets/${contributionId}`
            }
            replace
        />
    )
}

function App() {
    const auth = useAuth() as AccessIntentAuth
    const {
        isAuthenticated,
        isAdmin,
        accessStatus,
        workspaceRole,
        accessIntentPromptPending = false,
        submitAccessIntent,
        skipAccessIntent
    } = auth

    const getDashboardPath = () => {
        return workspaceRole === 'provider' || workspaceRole === 'hybrid'
            ? '/provider/dashboard'
            : '/dashboard'
    }

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
        // Admins cannot access participant routes
        if (isAdmin) return <Navigate to="/admin/dashboard" replace />
        
        const canAccessWorkspace =
            accessStatus === 'approved' ||
            (MOCK_AUTH && (accessStatus === 'pending' || accessStatus === 'not_started'))

        if (!canAccessWorkspace) {
            if (accessStatus === 'pending') return <Navigate to={participantOnboardingPaths.applicationStatus} replace />
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

    const RequireAdminAccess = (element: JSX.Element) => {
        if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" replace />
        return element
    }

    const RequireNotAdmin = (element: JSX.Element) => {
        // Redirect admins away from participant-only pages
        if (isAdmin) return <Navigate to="/admin/dashboard" replace />
        return element
    }

    const withLazyRoute = (element: JSX.Element) => (
        <Suspense fallback={<RouteLoader />}>
            {element}
        </Suspense>
    )

    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="solutions" element={<SolutionsPage />} />
                    <Route path="trust-center" element={<TrustCenterPage />} />
                    <Route path="pilot-walkthrough" element={<PilotWalkthroughPage />} />
                    <Route path="protected-evaluation" element={<ProtectedEvaluationPage />} />
                    <Route path="demo" element={<GuidedTourPage />} />
                    <Route path="demo/guided-tour" element={<GuidedTourPage />} />
                    <Route path="demo/datasets" element={<DatasetsPage />} />
                    <Route path="demo/datasets/:id" element={<DatasetDetailPage />} />
                    <Route path="demo/datasets/:id/rights-quote" element={<RightsQuoteBuilderPage />} />
                    <Route path="demo/datasets/:id/escrow-checkout" element={<EscrowCheckoutPage />} />
                    <Route path="demo/datasets/:id/quality-breakdown" element={<DatasetQualityBreakdownPage />} />
                    <Route path="demo/access-requests" element={<AccessRequestsPage />} />
                    <Route path="demo/access-requests/:requestId" element={<AccessRequestDetailPage />} />
                    <Route path="demo/requests" element={<Navigate to="/demo/access-requests" replace />} />
                    <Route path="demo/escrow-center" element={<EscrowCenterPage />} />
                    <Route path="demo/trust-profile" element={<TrustProfilePage />} />
                    <Route path="demo/compliance-passport" element={<CompliancePassportPage />} />
                    <Route path="demo/audit-trail" element={<AuditTrailPage />} />
                    <Route path="demo/consent-tracker" element={<ConsentTrackerPage />} />
                    <Route path="demo/trust-glossary" element={<TrustGlossaryPage />} />
                    <Route path="demo/secure-enclave" element={<SecureEnclavePage />} />
                    <Route path="demo/deployment-model" element={<DeploymentModelPage />} />
                    <Route path="demo/security-ops" element={<SecurityOperationsPage />} />
                    <Route path="demo/compliance-locker" element={<ComplianceLockerPage />} />
                    <Route path="demo/data-classification" element={<DataClassificationPage />} />
                    <Route path="demo/deals" element={<Navigate to={`/demo/deals/${DEFAULT_DEAL_ID}`} replace />} />
                    <Route path="demo/deals/:dealId" element={<DealDossierPage demo />} />
                    <Route path="demo/deals/:dealId/provider-packet" element={<ProviderRightsPacketPage demo />} />
                    <Route path="demo/deals/:dealId/output-review" element={<DealRoutePlaceholderPage surface="output-review" demo />} />
                    <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={getDashboardPath()} replace />} />
                    <Route path="application-status" element={<ApplicationStatusPage />} />
                    <Route path={participantOnboardingPaths.entry.slice(1)} element={RequireOnboardingAccess(<OnboardingEntryPage />)} />
                    <Route path={participantOnboardingPaths.step1.slice(1)} element={RequireOnboardingAccess(<OnboardingStep1 />)} />
                    <Route path={participantOnboardingPaths.step2.slice(1)} element={RequireOnboardingAccess(<OnboardingStep2 />)} />
                    <Route path={participantOnboardingPaths.step3.slice(1)} element={RequireOnboardingAccess(<OnboardingStep3 />)} />
                    <Route path={participantOnboardingPaths.step4.slice(1)} element={RequireOnboardingAccess(<OnboardingStep4 />)} />
                    <Route path={participantOnboardingPaths.step5.slice(1)} element={RequireOnboardingAccess(<OnboardingStep5 />)} />
                    <Route path={participantOnboardingPaths.confirmation.slice(1)} element={RequireOnboardingAccess(<OnboardingConfirmation />)} />
                </Route>

                <Route path="admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="admin/login" element={<AdminLoginPage />} />
                <Route path="admin/dashboard" element={RequireAdminAccess(withLazyRoute(<AdminDashboardPage />))} />
                <Route path="admin/ai-interrogation-logs" element={RequireAdminAccess(withLazyRoute(<AIInterrogationLogsPage />))} />
                <Route path="admin/ai-report/:reportId" element={RequireAdminAccess(withLazyRoute(<AIReportPage />))} />
                <Route path="admin/settings" element={RequireAdminAccess(withLazyRoute(<AdminSettingsPage />))} />
                <Route path="admin/escrow-vault" element={RequireAdminAccess(withLazyRoute(<EscrowVaultPage />))} />
                <Route path="admin/ephemeral-tokens" element={RequireAdminAccess(withLazyRoute(<ActiveEphemeralTokensPage />))} />
                <Route path="admin/user-management" element={RequireAdminAccess(withLazyRoute(<UserManagementPage />))} />
                <Route path="admin/provider-dataset" element={RequireAdminAccess(withLazyRoute(<ProviderDatasetManagementPage />))} />
                <Route path="admin/security-compliance" element={RequireAdminAccess(withLazyRoute(<SecurityCompliancePage />))} />
                <Route path="admin/operations" element={RequireAdminAccess(withLazyRoute(<OperationsPage />))} />
                <Route path="admin/operations-hub" element={RequireAdminAccess(withLazyRoute(<OperationsHubPage />))} />
                <Route path="admin/notifications" element={RequireAdminAccess(withLazyRoute(<NotificationsPage />))} />
                <Route path="admin/onboarding-queue" element={RequireAdminAccess(withLazyRoute(<OnboardingQueuePage />))} />
                <Route path="admin/application-review/:appId" element={RequireAdminAccess(withLazyRoute(<ApplicationReviewPage />))} />
                <Route path="admin/incident-response" element={RequireAdminAccess(withLazyRoute(<IncidentResponsePage />))} />
                <Route path="admin/audit-trail" element={RequireAdminAccess(withLazyRoute(<AdminAuditTrailPage />))} />

                <Route element={RequireWorkspaceAccess(<AppLayout />)}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="participant-console" element={<ParticipantConsolePage />} />
                    <Route path="provider/dashboard" element={<ProviderDashboardPage />} />
                    <Route path="provider/datasets/new" element={<ContributionsPage />} />
                    <Route path="provider/datasets/:id/status" element={<ContributionStatusDetailsPage />} />
                    <Route path="provider/datasets/:id" element={<ContributionDetailPage />} />
                    <Route path="researcher-access" element={<ResearcherAccessPage />} />
                    <Route path="deals" element={<Navigate to={`/deals/${DEFAULT_DEAL_ID}`} replace />} />
                    <Route path="deals/:dealId" element={<DealDossierPage />} />
                    <Route path="deals/:dealId/provider-packet" element={<ProviderRightsPacketPage />} />
                    <Route path="deals/:dealId/output-review" element={<DealRoutePlaceholderPage surface="output-review" />} />
                    <Route path="deals/:dealId/approval" element={<DealRoutePlaceholderPage surface="approval" />} />
                    <Route path="deals/:dealId/negotiation" element={<DealRoutePlaceholderPage surface="negotiation" />} />
                    <Route path="deals/:dealId/residency-memo" element={<DealRoutePlaceholderPage surface="residency-memo" />} />
                    <Route path="deals/:dealId/go-live" element={<DealRoutePlaceholderPage surface="go-live" />} />
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
                    <Route path="contributions" element={<Navigate to="/provider/dashboard" replace />} />
                    <Route path="contributions/:datasetId/status-details" element={<LegacyContributionRedirect destination="status" />} />
                    <Route path="contributions/:id" element={<LegacyContributionRedirect destination="detail" />} />
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
