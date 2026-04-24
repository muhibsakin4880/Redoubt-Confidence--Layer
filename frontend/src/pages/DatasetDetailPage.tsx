import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import DealProgressTracker from '../components/DealProgressTracker'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import DatasetAccessPackagePanel from '../components/dataset-detail/DatasetAccessPackagePanel'
import DatasetConfidencePanel from '../components/dataset-detail/DatasetConfidencePanel'
import DatasetDecisionPanel from '../components/dataset-detail/DatasetDecisionPanel'
import DatasetHeroPanel from '../components/dataset-detail/DatasetHeroPanel'
import DatasetNotesGuidancePanel from '../components/dataset-detail/DatasetNotesGuidancePanel'
import DatasetQualityPreviewPanel from '../components/dataset-detail/DatasetQualityPreviewPanel'
import DatasetRequestStatusPanel from '../components/dataset-detail/DatasetRequestStatusPanel'
import DatasetSchemaPreviewPanel from '../components/dataset-detail/DatasetSchemaPreviewPanel'
import DatasetSecureAccessPanel from '../components/dataset-detail/DatasetSecureAccessPanel'
import DatasetSecurityGovernancePanel from '../components/dataset-detail/DatasetSecurityGovernancePanel'
import DatasetStickyHeader from '../components/dataset-detail/DatasetStickyHeader'
import DatasetTrustCompliancePanel from '../components/dataset-detail/DatasetTrustCompliancePanel'
import DatasetUaeOperatingPosturePanel from '../components/dataset-detail/DatasetUaeOperatingPosturePanel'
import LifecycleGuidancePanel from '../components/LifecycleGuidancePanel'
import SecurityAuditTimeline from '../components/SecurityAuditTimeline'
import ContractHealthPanel from '../components/ContractHealthPanel'
import TransitionImpactPanel from '../components/TransitionImpactPanel'
import ExecutionRunbookPanel from '../components/ExecutionRunbookPanel'
import ControlTowerPanel from '../components/ControlTowerPanel'
import ResilienceInsightsPanel from '../components/ResilienceInsightsPanel'
import PolicyAttestationPanel from '../components/PolicyAttestationPanel'
import DecisionGatePanel from '../components/DecisionGatePanel'
import AlertCenterPanel from '../components/AlertCenterPanel'
import PortfolioAlertBoard from '../components/PortfolioAlertBoard'
import RemediationQueuePanel from '../components/RemediationQueuePanel'
import ReadinessCertificationPanel from '../components/ReadinessCertificationPanel'
import { DATASET_DETAILS, type RequestStatus, getDatasetDetailById } from '../data/datasetDetailData'
import { getAccessPackageForDataset } from '../data/datasetAccessPackageData'
import { type ContractLifecycleState } from '../domain/accessContract'
import { canPerformBuyerEscrowAction, canStartEscrowForRequest } from '../domain/actionGuardrails'
import {
    buildDealPath,
    buildDemoDealPath,
    getDealRouteRecordByDatasetId
} from '../data/dealDossierData'
import { getDealRouteContextById } from '../domain/dealDossier'
import {
    buildCompliancePassport,
    buildRequestPrefillFromPassport,
    passportStatusMeta
} from '../domain/compliancePassport'
import { buildDealProgressModel } from '../domain/dealProgress'
import { getOutcomeEvaluationFee, loadEscrowCheckouts } from '../domain/escrowCheckout'
import {
    getDatasetTrustRiskLabels,
    getDatasetTrustSummaryRows,
    getMinimumTrustClarificationState,
    trustSignalStateLabel
} from '../domain/datasetTrustProfile'
import {
    buildRightsQuote,
    buildRequestPrefillFromQuote,
    formatUsd,
    getDefaultRightsQuoteForm,
    loadRightsQuotes
} from '../domain/rightsQuoteBuilder'

const STATUS_STEPS = [
    {
        id: 'REVIEW_IN_PROGRESS',
        title: 'Pending review',
        description: 'Team reviews purpose, controls, and delivery options.'
    },
    {
        id: 'REQUEST_APPROVED',
        title: 'Approved',
        description: 'Access configured with scoped keys and workspace policies.'
    },
    {
        id: 'REQUEST_REJECTED',
        title: 'Rejected',
        description: 'Request declined with rationale and alternatives.'
    }
] as const

type AccessRequestPrefill = ReturnType<typeof buildRequestPrefillFromPassport> & {
    quoteId?: string
    quoteSummary?: string
}

type DatasetDetailLocationState = {
    openAccessRequest?: boolean
    prefillAccessRequest?: AccessRequestPrefill
} | null

type UaeDatasetPosture = 'UAE local only' | 'GCC limited' | 'Cross-border review required'

type UaeJurisdictionResidencyPanel = {
    accessRegion: string
    operatingRegion: string
    residencyPosture: string
    datasetPosture: UaeDatasetPosture
    postureSummary: string
    badgeClassName: string
}

const UAE_COMPATIBILITY_BADGES = ['Federal', 'DIFC', 'ADGM'] as const

const UAE_POSTURE_SUMMARY_BY_GEOGRAPHY: Record<string, UaeJurisdictionResidencyPanel> = {
    'Residency constrained': {
        accessRegion: 'UAE local boundary',
        operatingRegion: 'UAE-governed review workspace',
        residencyPosture: 'Local review and export-constrained',
        datasetPosture: 'UAE local only',
        postureSummary: 'Best aligned to UAE-local evaluation routing with tightly held movement boundaries.',
        badgeClassName: 'border-emerald-400/35 bg-emerald-500/12 text-emerald-100'
    },
    'Residency reviewed': {
        accessRegion: 'UAE local boundary',
        operatingRegion: 'UAE-governed review workspace',
        residencyPosture: 'Local review with explicit handling checks',
        datasetPosture: 'UAE local only',
        postureSummary: 'Best aligned to UAE-local evaluation routing when residency review remains central to approval.',
        badgeClassName: 'border-emerald-400/35 bg-emerald-500/12 text-emerald-100'
    },
    'Dual region': {
        accessRegion: 'UAE and approved GCC surfaces',
        operatingRegion: 'GCC-limited governed workspace',
        residencyPosture: 'Regional review boundary',
        datasetPosture: 'GCC limited',
        postureSummary: 'Suitable for regional evaluation programs that stay inside an approved GCC operating path.',
        badgeClassName: 'border-cyan-400/35 bg-cyan-500/12 text-cyan-100'
    },
    'Region-scoped': {
        accessRegion: 'UAE and approved GCC surfaces',
        operatingRegion: 'GCC-limited governed workspace',
        residencyPosture: 'Regional review boundary',
        datasetPosture: 'GCC limited',
        postureSummary: 'Suitable for regional evaluation programs that keep reviewer access and delivery inside GCC scope.',
        badgeClassName: 'border-cyan-400/35 bg-cyan-500/12 text-cyan-100'
    },
    Global: {
        accessRegion: 'Cross-region access path',
        operatingRegion: 'Transfer-reviewed workspace',
        residencyPosture: 'Cross-border review gate',
        datasetPosture: 'Cross-border review required',
        postureSummary: 'Global scope is available, but UAE-oriented review programs should expect explicit transfer review before release.',
        badgeClassName: 'border-amber-400/35 bg-amber-500/12 text-amber-100'
    },
    'North America': {
        accessRegion: 'Non-GCC regional scope',
        operatingRegion: 'Transfer-reviewed workspace',
        residencyPosture: 'Cross-border review gate',
        datasetPosture: 'Cross-border review required',
        postureSummary: 'The current package sits outside GCC-local operating scope and should route through cross-border review first.',
        badgeClassName: 'border-amber-400/35 bg-amber-500/12 text-amber-100'
    },
    'US / EU venue scope': {
        accessRegion: 'US / EU venue boundary',
        operatingRegion: 'Transfer-reviewed workspace',
        residencyPosture: 'Cross-border review gate',
        datasetPosture: 'Cross-border review required',
        postureSummary: 'Venue-bound delivery is operationally strong, but UAE-directed evaluation should treat it as a cross-border review case.',
        badgeClassName: 'border-amber-400/35 bg-amber-500/12 text-amber-100'
    },
    'US / EU utility scope': {
        accessRegion: 'US / EU utility boundary',
        operatingRegion: 'Transfer-reviewed workspace',
        residencyPosture: 'Cross-border review gate',
        datasetPosture: 'Cross-border review required',
        postureSummary: 'Utility delivery remains outside GCC-local scope and should be evaluated through a cross-border review path.',
        badgeClassName: 'border-amber-400/35 bg-amber-500/12 text-amber-100'
    }
}

function getUaeJurisdictionResidencyPanel(geographyLabel: string): UaeJurisdictionResidencyPanel {
    return (
        UAE_POSTURE_SUMMARY_BY_GEOGRAPHY[geographyLabel] ?? {
            accessRegion: geographyLabel || 'Cross-region access path',
            operatingRegion: 'Transfer-reviewed workspace',
            residencyPosture: 'Cross-border review gate',
            datasetPosture: 'Cross-border review required',
            postureSummary: 'This package should be treated as a cross-border review case until a narrower regional operating path is confirmed.',
            badgeClassName: 'border-amber-400/35 bg-amber-500/12 text-amber-100'
        }
    )
}

type DatasetDetailTab = 'overview' | 'schema' | 'governance' | 'access'

const DATASET_DETAIL_TABS: ReadonlyArray<{
    key: DatasetDetailTab
    label: string
}> = [
    { key: 'overview', label: 'Overview & Quality' },
    { key: 'schema', label: 'Schema Preview' },
    { key: 'governance', label: 'Governance & Compliance' },
    { key: 'access', label: 'Access & Delivery' }
]

export default function DatasetDetailPage() {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const isDemoRoute = location.pathname.startsWith('/demo/')
    const routeDataset = getDatasetDetailById(id)
    const dataset = routeDataset ?? Object.values(DATASET_DETAILS)[0]

    const dealRoute = useMemo(
        () => getDealRouteRecordByDatasetId(dataset.id),
        [dataset.id]
    )
    const dossierPath = useMemo(() => {
        if (!dealRoute) return null
        return isDemoRoute
            ? buildDemoDealPath(dealRoute.dealId, 'dossier')
            : buildDealPath(dealRoute.dealId, 'dossier')
    }, [dealRoute, isDemoRoute])
    const providerPacketPath = useMemo(() => {
        if (!dealRoute) return null
        return isDemoRoute
            ? buildDemoDealPath(dealRoute.dealId, 'provider-packet')
            : buildDealPath(dealRoute.dealId, 'provider-packet')
    }, [dealRoute, isDemoRoute])
    const dealContext = useMemo(
        () => (dealRoute ? getDealRouteContextById(dealRoute.dealId) : null),
        [dealRoute]
    )
    const dealSurfaceReadiness = useMemo(() => {
        if (!dealContext) return { available: 0, placeholder: 0 }

        const states = Object.values(dealContext.surfaceAvailability)
        return {
            available: states.filter(state => state === 'available').length,
            placeholder: states.filter(state => state === 'placeholder').length
        }
    }, [dealContext])

    const accessPackage = getAccessPackageForDataset(dataset.id)
    const compliancePassport = useMemo(() => buildCompliancePassport(), [location.key])
    const passportStatus = useMemo(
        () => passportStatusMeta(compliancePassport.status),
        [compliancePassport.status]
    )
    const latestSavedQuote = useMemo(
        () => loadRightsQuotes(dataset.id)[0] ?? null,
        [dataset.id, location.key]
    )
    const fallbackQuote = useMemo(
        () => buildRightsQuote(dataset, getDefaultRightsQuoteForm(compliancePassport), compliancePassport),
        [compliancePassport, dataset]
    )
    const recentEscrowCheckouts = useMemo(
        () => loadEscrowCheckouts(dataset.id),
        [dataset.id, location.key]
    )
    const latestCheckout = useMemo(() => {
        if (latestSavedQuote) {
            return recentEscrowCheckouts.find(record => record.quoteId === latestSavedQuote.id) ?? recentEscrowCheckouts[0] ?? null
        }
        return recentEscrowCheckouts[0] ?? null
    }, [latestSavedQuote, recentEscrowCheckouts])
    const recommendedQuote = latestSavedQuote ?? fallbackQuote
    const evaluationFeeUsd = useMemo(
        () => getOutcomeEvaluationFee(recommendedQuote),
        [recommendedQuote]
    )
    const dealProgress = useMemo(
        () =>
            buildDealProgressModel({
                passport: compliancePassport,
                quote: latestSavedQuote ?? (latestCheckout ? recommendedQuote : null),
                checkoutRecord: latestCheckout
            }),
        [compliancePassport, latestCheckout, latestSavedQuote, recommendedQuote]
    )

    const [requestStatus, setRequestStatus] = useState<RequestStatus>(dataset.access.status)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [showRiskAssessment, setShowRiskAssessment] = useState(false)
    const [intendedUsage, setIntendedUsage] = useState('')
    const [duration, setDuration] = useState('90 days')
    const [orgType, setOrgType] = useState('research')
    const [usageScale, setUsageScale] = useState('medium')
    const [affiliation, setAffiliation] = useState('')
    const [complianceChecked, setComplianceChecked] = useState(false)
    const [escrowWindow, setEscrowWindow] = useState('24 hours')
    const [escrowActive, setEscrowActive] = useState(false)
    const [requestPrefillNote, setRequestPrefillNote] = useState<string | null>(null)
    const [requestQuoteSummary, setRequestQuoteSummary] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<DatasetDetailTab>('overview')

    const openRequestModal = () => setShowRequestModal(true)

    function applyRequestPrefill(prefill: AccessRequestPrefill) {
        setOrgType(prefill.orgType)
        setAffiliation(prefill.affiliation)
        setIntendedUsage(prefill.intendedUsage)
        setDuration(prefill.duration)
        setUsageScale(prefill.usageScale)
        setComplianceChecked(prefill.complianceChecked)
        setRequestPrefillNote(prefill.note)
        setRequestQuoteSummary(prefill.quoteSummary ?? null)
    }

    useEffect(() => {
        setRequestStatus(dataset.access.status)
        setIntendedUsage('')
        setDuration('90 days')
        setOrgType('research')
        setUsageScale('medium')
        setAffiliation('')
        setComplianceChecked(false)
        setEscrowWindow('24 hours')
        setEscrowActive(false)
        setShowRiskAssessment(false)
        setRequestPrefillNote(null)
        setRequestQuoteSummary(null)
        setActiveTab('overview')
    }, [dataset])

    useEffect(() => {
        const state = location.state as DatasetDetailLocationState
        const shouldAutoOpen = Boolean(state?.openAccessRequest)

        if (state?.prefillAccessRequest) {
            applyRequestPrefill(state.prefillAccessRequest)
        }

        if (!shouldAutoOpen && !state?.prefillAccessRequest) return

        openRequestModal()
        navigate(location.pathname, { replace: true, state: null })
    }, [location.pathname, location.state, navigate])

    const escrowLifecycleState: ContractLifecycleState =
        requestStatus === 'REQUEST_APPROVED'
            ? escrowActive
                ? 'RELEASE_PENDING'
                : 'FUNDS_HELD'
            : requestStatus
    const startEscrowGuardrail = canStartEscrowForRequest(requestStatus, escrowActive)
    const releasePaymentGuardrail = canPerformBuyerEscrowAction('release_payment', escrowLifecycleState)
    const disputeRefundGuardrail = canPerformBuyerEscrowAction('open_dispute', escrowLifecycleState)
    const singleContractDigest = useMemo(
        () => [
            {
                contractId: `REQ-${dataset.id}`,
                state: escrowLifecycleState,
                role: 'buyer' as const
            }
        ],
        [dataset.id, escrowLifecycleState]
    )

    const accessDeliverySummaryItems = [
        { label: 'Access method', value: accessPackage.accessMethod.label },
        { label: 'Delivery detail', value: accessPackage.deliveryDetail.label },
        { label: 'Field access', value: accessPackage.fieldAccess.label },
        { label: 'Usage rights', value: accessPackage.usageRights.label },
        { label: 'Term', value: accessPackage.term.label },
        { label: 'Geography', value: accessPackage.geography.label },
        { label: 'Exclusivity', value: accessPackage.exclusivity.label }
    ]
    const securityGovernanceSummaryItems = [
        { label: 'Encryption', value: accessPackage.security.encryption },
        { label: 'Masking', value: accessPackage.security.masking },
        { label: 'Watermarking', value: accessPackage.security.watermarking },
        { label: 'Revocation rights', value: accessPackage.security.revocation },
        { label: 'Audit logging', value: accessPackage.advancedRights.auditLogging },
        { label: 'Attribution', value: accessPackage.advancedRights.attribution },
        { label: 'Redistribution', value: accessPackage.advancedRights.redistribution },
        { label: 'Volume pricing', value: accessPackage.advancedRights.volumePricing }
    ]
    const accessPackageBuyerOverview = [
        accessPackage.accessMethod.buyerSummary,
        accessPackage.deliveryDetail.buyerSummary
    ].filter(Boolean).join(' ')
    const uaeJurisdictionResidencyPanel = getUaeJurisdictionResidencyPanel(accessPackage.geography.label)
    const validationWindowHours = latestCheckout?.configuration.reviewWindowHours ?? recommendedQuote.input.validationWindowHours
    const accessPostureItems = [
        {
            title: 'Preview only',
            badge: 'Available',
            tone: 'available' as const,
            detail: 'Inspect metadata, schema shape, and AI summaries before any live dataset handling begins.'
        },
        {
            title: 'Governed evaluation',
            badge: 'Protected path',
            tone: 'protected' as const,
            detail: 'Run review inside a governed workspace with scoped access, audit controls, and escrow-backed validation.'
        },
        {
            title: 'Production access after approval',
            badge: requestStatus === 'REQUEST_APPROVED' ? 'Approved' : 'Approval gated',
            tone: 'approval' as const,
            detail:
                requestStatus === 'REQUEST_APPROVED'
                    ? 'Broader access can move into configured delivery and instruction handling for this approved request.'
                    : 'Broader access follows provider and reviewer approval before production-grade delivery is discussed.'
        }
    ]
    const protectionSummaryItems = [
        {
            label: 'Provider identity shielding',
            detail: 'Provider identity stays protected until managed approval and routing conditions allow disclosure.'
        },
        {
            label: 'Controlled export',
            detail: `${accessPackage.deliveryDetail.label} keeps movement governed and ${accessPackage.advancedRights.redistribution.toLowerCase()} redistribution rights in force.`
        },
        {
            label: 'Audit logging',
            detail: `${accessPackage.advancedRights.auditLogging} logging remains attached to approved sessions and governed actions.`
        },
        {
            label: 'Release only after validation',
            detail: `Escrow settles after buyer validation inside the ${validationWindowHours}-hour window or the configured expiry path.`
        }
    ]
    const buyerObligationItems = [
        { label: 'Accepted use', value: accessPackage.usageRights.label },
        { label: 'No redistribution', value: accessPackage.advancedRights.redistribution },
        { label: 'Validation window', value: `${validationWindowHours} hours` },
        { label: 'Review / dispute conditions', value: 'Confirm release or open dispute before settlement.' }
    ]
    const minimumTrustState = getMinimumTrustClarificationState(dataset.trustProfile)
    const minimumTrustNeedsReview = minimumTrustState !== 'documented'
    const trustRiskLabels = getDatasetTrustRiskLabels(dataset.trustProfile)
    const trustSummaryRows = getDatasetTrustSummaryRows(dataset.trustProfile)
    const requestEntryLabel = minimumTrustNeedsReview ? 'Request Review' : 'Request Evaluation'
    const requestSubmitLabel = minimumTrustNeedsReview ? 'Submit review request' : 'Submit evaluation request'
    const requestSectionDescription = minimumTrustNeedsReview
        ? 'Request review with intended use. One or more minimum trust fields still need provider or reviewer confirmation before live access.'
        : 'Request protected evaluation with context on intended use. We scope delivery, controls, and data handling together - no open marketplace listing.'
    const requestModalDescription = minimumTrustNeedsReview
        ? `${trustSignalStateLabel(minimumTrustState)} on minimum trust fields. Share intended use so the provider and review team can confirm the packet.`
        : 'Share intended use to route approval. Provider identity remains private.'
    const trustSummaryBadgeClass = minimumTrustNeedsReview
        ? minimumTrustState === 'reviewer_confirmation'
            ? 'border-rose-400/30 bg-rose-500/12 text-rose-100'
            : 'border-amber-400/30 bg-amber-500/12 text-amber-100'
        : 'border-cyan-400/25 bg-cyan-500/10 text-cyan-100'

    const latestCheckoutLabel = latestCheckout
        ? `Deal ${latestCheckout.escrowId} in progress`
        : 'No payout until validation'
    const protectedSummary = latestSavedQuote
        ? `Terms ${latestSavedQuote.id} is ready for protected evaluation.`
        : 'Evaluation setup will generate passport-based starter terms if you have not saved any yet.'
    const activeTabPanelId = `dataset-detail-tabpanel-${activeTab}`

    const handleSubmitRequest = () => {
        setRequestStatus('REVIEW_IN_PROGRESS')
        setShowRequestModal(false)
    }

    const handleApplyPassportAndOpenRequest = () => {
        applyRequestPrefill(buildRequestPrefillFromPassport(compliancePassport))
        openRequestModal()
    }

    const handleApplyQuoteAndOpenRequest = () => {
        if (!latestSavedQuote) return
        applyRequestPrefill(buildRequestPrefillFromQuote(latestSavedQuote, compliancePassport))
        openRequestModal()
    }

    if (!routeDataset) {
        return (
            <DatasetUnavailableState
                contextLabel="Dataset Detail"
                detail="Redoubt could not find the dataset tied to this detail route. Return to Dataset Discovery and reopen the dataset from the matched results panel."
            />
        )
    }

    if (showRiskAssessment) {
        return (
            <div className="min-h-screen bg-slate-900 text-white">
                <div className="container mx-auto space-y-6 px-4 py-10">
                    <section className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-xl">
                        <button
                            onClick={() => setShowRiskAssessment(false)}
                            className="mb-4 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                        >
                            Back to Dataset Detail
                        </button>
                        <h1 className="text-2xl font-semibold">Risk Assessment</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Dedicated risk review workspace for: {dataset.title}
                        </p>
                    </section>

                    <section className="space-y-4">
                        <LifecycleGuidancePanel role="buyer" state={requestStatus} compact title="Request Workflow Guidance" />
                        <ContractHealthPanel
                            contractId={`REQ-${dataset.id}`}
                            state={escrowLifecycleState}
                            compact
                            title="Request Integrity Monitor"
                        />
                        <TransitionImpactPanel
                            contractId={`REQ-${dataset.id}`}
                            state={escrowLifecycleState}
                            role="buyer"
                            compact
                            title="Access Impact Simulator"
                        />
                        <ControlTowerPanel
                            contractId={`REQ-${dataset.id}`}
                            state={escrowLifecycleState}
                            role="buyer"
                            compact
                            title="Access Control Tower"
                        />
                        <PolicyAttestationPanel
                            contractId={`REQ-${dataset.id}`}
                            state={escrowLifecycleState}
                            role="buyer"
                            compact
                            title="Access Policy Attestation"
                        />
                        <DecisionGatePanel
                            contractId={`REQ-${dataset.id}`}
                            state={escrowLifecycleState}
                            role="buyer"
                            compact
                            title="Access Decision Gate"
                        />
                        <ResilienceInsightsPanel
                            digests={singleContractDigest}
                            compact
                            title="Single Contract Resilience"
                        />
                        <PortfolioAlertBoard
                            digests={singleContractDigest}
                            compact
                            title="Single Contract Alerts"
                        />
                        <RemediationQueuePanel
                            digests={singleContractDigest}
                            compact
                            title="Single Contract Remediation Queue"
                        />
                        <ReadinessCertificationPanel
                            digests={singleContractDigest}
                            compact
                            title="Single Contract Launch Certification"
                        />
                        <ExecutionRunbookPanel
                            contractId={`REQ-${dataset.id}`}
                            state={escrowLifecycleState}
                            role="buyer"
                            compact
                            title="Access Runbook"
                        />
                        <AlertCenterPanel
                            contractId={`REQ-${dataset.id}`}
                            state={escrowLifecycleState}
                            role="buyer"
                            compact
                            title="Access Alert Center"
                        />
                        <SecurityAuditTimeline
                            contractId={`REQ-${dataset.id}`}
                            state={escrowLifecycleState}
                            compact
                            title="Secure Access Audit Trail"
                        />
                    </section>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="border-b border-slate-800 bg-slate-950/70">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                        <Link to="/datasets" className="transition-colors hover:text-white">
                            Datasets
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-white">{dataset.title}</span>
                    </div>
                </div>
            </div>

            <DatasetStickyHeader dataset={dataset} />

            <div className="container mx-auto px-4 pb-14 pt-4">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)] xl:items-start">
                    <div className="min-w-0 space-y-4">
                        <div className="overflow-x-auto rounded-md border border-slate-800 bg-slate-900/50">
                            <div
                                role="tablist"
                                aria-label="Dataset detail sections"
                                className="flex min-w-max items-center gap-2 px-2 py-2"
                            >
                                {DATASET_DETAIL_TABS.map(tab => {
                                    const isActive = tab.key === activeTab

                                    return (
                                        <button
                                            key={tab.key}
                                            id={`dataset-detail-tab-${tab.key}`}
                                            type="button"
                                            role="tab"
                                            aria-selected={isActive}
                                            aria-controls={`dataset-detail-tabpanel-${tab.key}`}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`rounded-sm border px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                                                isActive
                                                    ? 'border-cyan-400/40 bg-cyan-500/12 text-cyan-100'
                                                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div
                            id={activeTabPanelId}
                            role="tabpanel"
                            aria-labelledby={`dataset-detail-tab-${activeTab}`}
                            className="min-w-0"
                        >
                            {activeTab === 'overview' ? (
                                <div className="space-y-4">
                                    <DatasetHeroPanel
                                        dataset={dataset}
                                        dealId={dealRoute?.dealId ?? 'Pending'}
                                        dealType={
                                            dealContext?.routeKind === 'derived'
                                                ? 'Generated dataset deal'
                                                : 'Configured deal'
                                        }
                                        dossierPath={dossierPath}
                                        providerPacketPath={providerPacketPath}
                                        availableSurfaceCount={dealSurfaceReadiness.available}
                                        placeholderSurfaceCount={dealSurfaceReadiness.placeholder}
                                    />
                                    <DatasetQualityPreviewPanel dataset={dataset} showSchemaPreview={false} />
                                </div>
                            ) : null}

                            {activeTab === 'schema' ? (
                                <DatasetSchemaPreviewPanel dataset={dataset} />
                            ) : null}

                            {activeTab === 'governance' ? (
                                <div className="space-y-4">
                                    <DatasetTrustCompliancePanel
                                        trustRiskLabels={trustRiskLabels}
                                        trustSummaryRows={trustSummaryRows}
                                        minimumTrustNeedsReview={minimumTrustNeedsReview}
                                        minimumTrustLabel={trustSignalStateLabel(minimumTrustState)}
                                        trustSummaryBadgeClass={trustSummaryBadgeClass}
                                    />
                                    <DatasetSecurityGovernancePanel
                                        securityGovernanceSummaryItems={securityGovernanceSummaryItems}
                                        protectionSummaryItems={protectionSummaryItems}
                                        buyerObligationItems={buyerObligationItems}
                                    />
                                    <DatasetUaeOperatingPosturePanel
                                        uaeJurisdictionResidencyPanel={uaeJurisdictionResidencyPanel}
                                        compatibilityBadges={UAE_COMPATIBILITY_BADGES}
                                    />
                                </div>
                            ) : null}

                            {activeTab === 'access' ? (
                                <div className="space-y-4">
                                    <DatasetAccessPackagePanel
                                        accessPackageBuyerOverview={accessPackageBuyerOverview}
                                        accessDeliverySummaryItems={accessDeliverySummaryItems}
                                        accessPostureItems={accessPostureItems}
                                    />
                                    <DatasetNotesGuidancePanel
                                        dataset={dataset}
                                        requestStatus={requestStatus}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                        <DatasetConfidencePanel dataset={dataset} />
                        <DatasetRequestStatusPanel
                            datasetId={dataset.id}
                            requestStatus={requestStatus}
                            statusSteps={STATUS_STEPS}
                            requestSectionDescription={requestSectionDescription}
                            minimumTrustNeedsReview={minimumTrustNeedsReview}
                            minimumTrustLabel={trustSignalStateLabel(minimumTrustState)}
                            requestEntryLabel={requestEntryLabel}
                            onOpenRequestModal={openRequestModal}
                            onOpenRiskAssessment={() => setShowRiskAssessment(true)}
                            onApplyPassportAndRequest={handleApplyPassportAndOpenRequest}
                            onApplyQuoteAndRequest={handleApplyQuoteAndOpenRequest}
                            compliancePassportId={compliancePassport.passportId}
                            compliancePassportCompletionPercent={compliancePassport.completionPercent}
                            passportStatus={{
                                label: passportStatus.label,
                                detail: passportStatus.detail,
                                classes: passportStatus.classes
                            }}
                            latestSavedQuote={latestSavedQuote}
                        />
                        <DealProgressTracker model={dealProgress} compact variant="terminal" />
                        <DatasetDecisionPanel
                            dataset={dataset}
                            latestCheckoutLabel={latestCheckoutLabel}
                            evaluationFeeLabel={formatUsd(evaluationFeeUsd)}
                            escrowHoldLabel={formatUsd(recommendedQuote.escrowHoldUsd)}
                            reviewWindowHours={validationWindowHours}
                            protectedSummary={protectedSummary}
                            compact
                        />
                        <DatasetSecureAccessPanel
                            escrowWindow={escrowWindow}
                            onEscrowWindowChange={setEscrowWindow}
                            escrowActive={escrowActive}
                            onActivateEscrow={() => setEscrowActive(true)}
                            startEscrowGuardrail={startEscrowGuardrail}
                            releasePaymentGuardrail={releasePaymentGuardrail}
                            disputeRefundGuardrail={disputeRefundGuardrail}
                        />
                    </aside>
                </div>
            </div>

            {showRequestModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-transform duration-100 active:scale-95"
                        onClick={() => setShowRequestModal(false)}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-white">{requestEntryLabel}</h3>
                                <p className="text-sm text-slate-400">{requestModalDescription}</p>
                            </div>
                            <button
                                className="text-slate-500 hover:text-white"
                                onClick={() => setShowRequestModal(false)}
                                aria-label="Close request modal"
                            >
                                X
                            </button>
                        </div>

                        {minimumTrustNeedsReview ? (
                            <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-100">
                                <div className="font-semibold">{trustSignalStateLabel(minimumTrustState)}</div>
                                <div className="mt-1 text-amber-50/85">
                                    This request will route provider and reviewer checks before any live dataset access can be approved.
                                </div>
                            </div>
                        ) : null}

                        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold text-white">Reusable Compliance Passport</div>
                                    <div className="mt-1 text-xs text-slate-300">
                                        Reuse organization, verification, and legal declarations instead of re-entering them here.
                                    </div>
                                </div>
                                <button
                                    onClick={() => applyRequestPrefill(buildRequestPrefillFromPassport(compliancePassport))}
                                    className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                                >
                                    Apply Passport
                                </button>
                            </div>
                        </div>

                        {requestPrefillNote ? (
                            <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                                <div className="font-semibold">Reusable context applied</div>
                                <div className="mt-1 text-cyan-50/85">{requestPrefillNote}</div>
                                {requestQuoteSummary ? (
                                    <div className="mt-2 text-xs text-cyan-50/75">{requestQuoteSummary}</div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm text-slate-300">Organization / affiliation (optional)</label>
                                <select
                                    value={orgType}
                                    onChange={(event) => setOrgType(event.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="research">Research / academic</option>
                                    <option value="enterprise">Enterprise / corporate</option>
                                    <option value="startup">Startup / product team</option>
                                    <option value="public">Public sector / NGO</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-slate-300">Intended usage</label>
                                <textarea
                                    value={intendedUsage}
                                    onChange={(event) => setIntendedUsage(event.target.value)}
                                    rows={4}
                                    placeholder="Summarize the workflows, models, or analysis you plan to run (no identities)."
                                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-slate-300">Estimated usage scale</label>
                                <select
                                    value={usageScale}
                                    onChange={(event) => setUsageScale(event.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="low">Low (evaluation / POC)</option>
                                    <option value="medium">Medium (team workflows)</option>
                                    <option value="high">High (production workloads)</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-slate-300">Duration needed</label>
                                <select
                                    value={duration}
                                    onChange={(event) => setDuration(event.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="30 days">30 days</option>
                                    <option value="90 days">90 days</option>
                                    <option value="6 months">6 months</option>
                                    <option value="12 months">12 months</option>
                                    <option value="ongoing">Ongoing</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-slate-300">Affiliation (optional but encouraged)</label>
                                <input
                                    value={affiliation}
                                    onChange={(event) => setAffiliation(event.target.value)}
                                    placeholder="Team, company, or lab name"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <label className="flex items-start gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={complianceChecked}
                                    onChange={() => setComplianceChecked(prev => !prev)}
                                />
                                <span>Access is granted based on trust, compliance, and intended usage. I acknowledge platform policies.</span>
                            </label>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:border-slate-500"
                                onClick={() => setShowRequestModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                onClick={handleSubmitRequest}
                                disabled={!complianceChecked || !intendedUsage}
                            >
                                {requestSubmitLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
