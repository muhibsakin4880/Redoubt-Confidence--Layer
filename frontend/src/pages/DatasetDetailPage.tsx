import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import { ResponsibilityNotice, RiskLabelStrip, TrustComplianceSummary } from '../components/trust/TrustLayer'
import { DATASET_DETAILS, RequestStatus, confidenceLevel, decisionLabel, getDatasetDetailById } from '../data/datasetDetailData'
import { getAccessPackageForDataset } from '../data/datasetAccessPackageData'
import { requestReviewStateLabel, type ContractLifecycleState } from '../domain/accessContract'
import DealProgressTracker from '../components/DealProgressTracker'
import LifecycleGuidancePanel from '../components/LifecycleGuidancePanel'
import { canPerformBuyerEscrowAction, canStartEscrowForRequest } from '../domain/actionGuardrails'
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

function getAccessPostureBadgeClass(state: 'available' | 'protected' | 'approval'): string {
    if (state === 'available') return 'border-white/10 bg-white/5 text-slate-100'
    if (state === 'protected') return 'border-cyan-400/25 bg-cyan-500/10 text-cyan-100'
    return 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
}

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
    const passportStatus = useMemo(() => passportStatusMeta(compliancePassport.status), [compliancePassport.status])
    const latestSavedQuote = useMemo(() => loadRightsQuotes(dataset.id)[0] ?? null, [dataset.id, location.key])
    const fallbackQuote = useMemo(
        () => buildRightsQuote(dataset, getDefaultRightsQuoteForm(compliancePassport), compliancePassport),
        [compliancePassport, dataset]
    )
    const recentEscrowCheckouts = useMemo(() => loadEscrowCheckouts(dataset.id), [dataset.id, location.key])
    const latestCheckout = useMemo(() => {
        if (latestSavedQuote) {
            return recentEscrowCheckouts.find(record => record.quoteId === latestSavedQuote.id) ?? recentEscrowCheckouts[0] ?? null
        }
        return recentEscrowCheckouts[0] ?? null
    }, [latestSavedQuote, recentEscrowCheckouts])
    const recommendedQuote = latestSavedQuote ?? fallbackQuote
    const evaluationFeeUsd = useMemo(() => getOutcomeEvaluationFee(recommendedQuote), [recommendedQuote])
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
            <div className="bg-slate-900 text-white min-h-screen">
                <div className="container mx-auto px-4 py-10 space-y-6">
                    <section className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-xl">
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

    const handleSubmitRequest = () => {
        setRequestStatus('REVIEW_IN_PROGRESS')
        setShowRequestModal(false)
    }

    return (
        <div className="bg-slate-900 text-white">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-800">
                <div className="container mx-auto px-4 py-10 md:py-14">
                    <div className="mb-6 flex items-center gap-3 text-sm text-slate-400">
                        <Link to="/datasets" className="hover:text-white transition-colors">
                            Datasets
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-white">{dataset.title}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-200">
                                    {dataset.category}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-400 text-green-300 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-300" />
                                    Provider attested
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{dataset.title}</h1>
                            <p className="text-slate-300 text-lg mb-6 max-w-3xl">
                                {dataset.description}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                                    <div className="text-xs uppercase text-slate-500 mb-1">Size</div>
                                    <div className="text-lg font-semibold text-white">{dataset.size}</div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                                    <div className="text-xs uppercase text-slate-500 mb-1">Records</div>
                                    <div className="text-lg font-semibold text-white">{dataset.recordCount}</div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                                    <div className="text-xs uppercase text-slate-500 mb-1">Last Updated</div>
                                    <div className="text-lg font-semibold text-white">{dataset.lastUpdated}</div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                                    <div className="text-xs uppercase text-slate-500 mb-1">Domain</div>
                                    <div className="text-lg font-semibold text-white">{dataset.category}</div>
                                </div>
                            </div>

                            <DealDossierHeroStrip
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

                            <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            Decision Block
                                        </div>
                                        <h2 className="mt-3 text-xl font-semibold text-white">Choose free preview or protected evaluation</h2>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                            Organizations can stay in zero-cost metadata review, or move into a governed clean-room evaluation with escrow protection,
                                            evaluation org validation, and automatic credits when commitments miss.
                                        </p>
                                    </div>
                                    <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                                        {latestCheckout ? `Deal ${latestCheckout.escrowId} in progress` : 'No payout until validation'}
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                    <article className="rounded-2xl border border-cyan-500/25 bg-cyan-500/8 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
                                                    Free
                                                </div>
                                                <h3 className="mt-3 text-lg font-semibold text-white">Metadata Preview</h3>
                                                <p className="mt-2 text-sm text-slate-200/85">
                                                    Inspect quality, schema shape, and AI summaries before touching paid workflows.
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-semibold text-white">$0</div>
                                                <div className="mt-1 text-xs text-slate-400">Always available</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <DecisionValue label="Confidence score" value={`${dataset.confidenceScore}%`} />
                                            <DecisionValue label="Freshness" value={dataset.preview.freshnessLabel} />
                                            <DecisionValue label="Schema fields" value={`${dataset.preview.sampleSchema.length} fields`} />
                                            <DecisionValue label="Access" value="Metadata only" />
                                        </div>

                                        <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                                            {dataset.preview.aiSummary}
                                        </div>

                                        <Link
                                            to={`/datasets/${dataset.id}/quality-breakdown`}
                                            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                        >
                                            Open Free Metadata Preview
                                        </Link>
                                    </article>

                                    <article className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                                                    Protected
                                                </div>
                                                <h3 className="mt-3 text-lg font-semibold text-white">Protected Evaluation</h3>
                                                <p className="mt-2 text-sm text-slate-200/85">
                                                    Enter protected evaluation setup, provision a governed workspace, and let the protection engine verify the contracted outcome before payout. This is the standard buyer-paid step before production or API access is discussed.
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-semibold text-white">{formatUsd(evaluationFeeUsd)}</div>
                                                <div className="mt-1 text-xs text-slate-400">Evaluation fee</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <DecisionValue label="Escrow hold" value={formatUsd(recommendedQuote.escrowHoldUsd)} />
                                            <DecisionValue label="Review window" value={`${latestCheckout?.configuration.reviewWindowHours ?? recommendedQuote.input.validationWindowHours} hours`} />
                                            <DecisionValue label="Access mode" value="Governed workspace" />
                                            <DecisionValue label="Protection" value="Auto credits enabled" />
                                        </div>

                                        <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                                            {latestSavedQuote
                                                ? `Terms ${latestSavedQuote.id} is ready for protected evaluation.`
                                                : 'Evaluation setup will generate passport-based starter terms if you have not saved any yet.'}
                                        </div>

                                        <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">Pilot Cohort</div>
                                            <p className="mt-2 text-sm text-slate-200/90">
                                                Fee-waived evaluation is reserved for selected design partners in Redoubt&apos;s early-access evaluation program. Admission is LOI-backed and tied to feedback, design-partner participation, and a credible production pathway.
                                            </p>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-100/90">
                                            Start checkout from the main <span className="font-semibold text-white">Escrow-Native Checkout</span> action in the Access section. Any saved quote context will carry into the governed evaluation flow automatically.
                                        </div>
                                    </article>
                                </div>
                            </section>
                        </div>

                        {/* Confidence Panel */}
                        <div className="w-full lg:max-w-sm bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-slate-400">Overall Confidence Score</div>
                                    <div className="text-3xl font-bold text-white">{dataset.confidenceScore}%</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full border text-xs ${confidenceLevel(dataset.confidenceScore).classes}`}>
                                    {confidenceLevel(dataset.confidenceScore).label}
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3">
                                <div
                                    className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-green-300"
                                    style={{ width: `${dataset.confidenceScore}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                                    <div className="text-slate-400">Completeness</div>
                                    <div className="text-white font-semibold">{dataset.quality.completeness}%</div>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                                    <div className="text-slate-400">Freshness</div>
                                    <div className="text-white font-semibold">{dataset.quality.freshnessScore}%</div>
                                </div>
                            </div>
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Freshness</span>
                                    <span className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-400/40 rounded-full px-2 py-1">
                                        {dataset.preview.freshnessLabel}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Completeness</span>
                                    <span className="text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-400/40 rounded-full px-2 py-1">
                                        {dataset.preview.completenessLabel}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Quality badge</span>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${dataset.preview.confidenceBand === 'high'
                                            ? 'bg-emerald-500/10 border-emerald-400 text-emerald-200'
                                            : dataset.preview.confidenceBand === 'medium'
                                                ? 'bg-amber-500/10 border-amber-400 text-amber-200'
                                                : 'bg-orange-500/10 border-orange-400 text-orange-200'
                                        }`}>
                                        {dataset.preview.confidenceBand === 'high' ? 'High quality' : dataset.preview.confidenceBand === 'medium' ? 'Medium quality' : 'Experimental'}
                                    </span>
                                </div>
                                <div className={`text-xs text-center px-3 py-2 rounded-lg border ${decisionLabel(dataset.preview.decision).classes}`}>
                                    {decisionLabel(dataset.preview.decision).text}
                                </div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 text-center">Quality review signal</div>
                            </div>
                            {requestStatus !== 'REQUEST_APPROVED' && (
                                <div className="text-xs text-slate-400 border border-slate-700 rounded-lg px-3 py-2 bg-slate-900/80">
                                    Preview only until access is approved. No raw data is exposed; provider identity stays private.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <DealProgressTracker model={dealProgress} compact />
                    </div>
                </div>
            </div>

            {/* Access Section */}
            <div className="container mx-auto px-4 pb-14">
                <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.22)] md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="h-4 w-4 text-cyan-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <div className="font-semibold text-white">Audit visibility active</div>
                            <div className="text-xs text-slate-400">Shown as review context in this demo and may still require reviewer confirmation.</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowRiskAssessment(true)}
                        className="self-start rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 md:self-auto"
                    >
                        Risk Assessment
                    </button>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-9">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Left Column - Access Info, Request Status, Provider Transparency */}
                        <div className="lg:w-2/3 space-y-8">
                            <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Minimum trust layer</div>
                                        <h3 className="mt-2 text-xl font-semibold text-white">Trust & Compliance Summary</h3>
                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                                            Review the minimum trust context before asking the provider to evaluate access. This keeps rights, basis, re-identification,
                                            and audit expectations visible at the point of request.
                                        </p>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${trustSummaryBadgeClass}`}>
                                        {minimumTrustNeedsReview ? trustSignalStateLabel(minimumTrustState) : 'Documented in demo'}
                                    </span>
                                </div>

                                <RiskLabelStrip items={trustRiskLabels} className="mt-5" />
                                <TrustComplianceSummary rows={trustSummaryRows} className="mt-5" />
                                <ResponsibilityNotice
                                    className="mt-5"
                                    message="This is a demo review signal, not legal approval."
                                />
                            </section>

                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-xl font-semibold">Access</h3>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400 text-blue-200 text-xs">
                                        Guided process
                                    </span>
                                </div>
                                <p className="text-slate-300 max-w-2xl mb-4">
                                    {requestSectionDescription}
                                </p>
                                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                                    {dataset.accessNotes.map(note => (
                                        <li key={note}>{note}</li>
                                    ))}
                                </ul>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <button
                                        onClick={openRequestModal}
                                        className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                                            minimumTrustNeedsReview
                                                ? 'border border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/20'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {requestEntryLabel}
                                    </button>
                                    <Link
                                        to={`/datasets/${dataset.id}/rights-quote`}
                                        className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                    >
                                        Build Rights Quote
                                    </Link>
                                    <Link
                                        to={`/datasets/${dataset.id}/escrow-checkout`}
                                        state={latestSavedQuote ? { quoteId: latestSavedQuote.id } : undefined}
                                        className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
                                    >
                                        Escrow-Native Checkout
                                    </Link>
                                </div>

                                <div
                                    className={`mt-4 rounded-xl border px-4 py-3 text-xs ${
                                        minimumTrustNeedsReview
                                            ? 'border-amber-400/25 bg-amber-500/8 text-amber-100'
                                            : 'border-cyan-400/20 bg-cyan-500/8 text-cyan-100'
                                    }`}
                                >
                                    {minimumTrustNeedsReview
                                        ? `${trustSignalStateLabel(minimumTrustState)} before live access can be approved. The request stays open, but it routes to review-first handling.`
                                        : 'Minimum trust fields are documented in the current demo packet, but access still follows provider review and configured controls.'}
                                </div>

                                <section className="mt-7 rounded-2xl border border-cyan-500/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.94)_0%,rgba(15,23,42,0.9)_100%)] p-5 shadow-[0_14px_34px_rgba(8,47,73,0.16)]">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="max-w-2xl">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                                                Jurisdiction & Residency
                                            </div>
                                            <h3 className="mt-3 text-xl font-semibold text-white">UAE operating posture</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                Product posture summary for regulated evaluation routing across UAE-relevant operating boundaries.
                                            </p>
                                        </div>
                                        <div className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${uaeJurisdictionResidencyPanel.badgeClassName}`}>
                                            {uaeJurisdictionResidencyPanel.datasetPosture}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                                        <DecisionValue label="Access region" value={uaeJurisdictionResidencyPanel.accessRegion} />
                                        <DecisionValue label="Operating region" value={uaeJurisdictionResidencyPanel.operatingRegion} />
                                        <DecisionValue label="Residency posture" value={uaeJurisdictionResidencyPanel.residencyPosture} />
                                    </div>

                                    <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/45 px-4 py-4">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Dataset classification</div>
                                        <div className="mt-2 text-base font-semibold text-white">{uaeJurisdictionResidencyPanel.datasetPosture}</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">{uaeJurisdictionResidencyPanel.postureSummary}</p>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2.5">
                                        {UAE_COMPATIBILITY_BADGES.map(badge => (
                                            <span
                                                key={badge}
                                                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200"
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="mt-4 text-xs leading-6 text-slate-400">
                                        This summarizes Redoubt&apos;s operating posture for regulated evaluation workflows and does not constitute legal advice.
                                    </p>
                                </section>

                                <div className="mt-7 grid gap-4 xl:grid-cols-2">
                                    <article className="rounded-2xl border border-slate-700/80 bg-slate-950/45 p-5">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Access posture</div>
                                        <h4 className="mt-2 text-lg font-semibold text-white">How access expands</h4>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                            Buyers move from preview into governed evaluation before any broader delivery path is considered.
                                        </p>
                                        <div className="mt-5 space-y-3">
                                            {accessPostureItems.map(item => (
                                                <div key={item.title} className="rounded-xl border border-white/8 bg-slate-900/70 px-4 py-4">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div className="text-sm font-semibold text-white">{item.title}</div>
                                                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getAccessPostureBadgeClass(item.tone)}`}>
                                                            {item.badge}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </article>

                                    <article className="rounded-2xl border border-slate-700/80 bg-slate-950/45 p-5">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Protection summary</div>
                                        <h4 className="mt-2 text-lg font-semibold text-white">What is protected during evaluation</h4>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                            The evaluation path keeps identity, movement, logging, and settlement controls visible before production access expands.
                                        </p>
                                        <div className="mt-5 space-y-3">
                                            {protectionSummaryItems.map(item => (
                                                <div key={item.label} className="rounded-xl border border-white/8 bg-slate-900/70 px-4 py-4">
                                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                                                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </article>
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-950/35 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Buyer obligations</div>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {buyerObligationItems.map(item => (
                                            <div key={item.label} className="rounded-xl border border-white/8 bg-slate-900/65 px-4 py-3">
                                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                                                <div className="mt-2 text-sm font-medium leading-6 text-slate-100">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-7 grid gap-4 xl:grid-cols-2">
                                    <DetailSummaryCard
                                        eyebrow="Offer Summary"
                                        title="Access & Delivery Profile"
                                        description={accessPackageBuyerOverview}
                                        items={accessDeliverySummaryItems}
                                    />
                                    <DetailSummaryCard
                                        eyebrow="Governance"
                                        title="Security & Governance"
                                        description="Encryption, masking, watermarking, and commercial controls applied to approved buyer sessions."
                                        items={securityGovernanceSummaryItems}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <h4 className="text-lg font-semibold text-white">Request status</h4>
                                    <span className="text-slate-500 text-sm">Transparent milestones, no provider exposure.</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {STATUS_STEPS.map(step => {
                                        const isActive = step.id === requestStatus
                                        return (
                                            <div
                                                key={step.id}
                                                className={`rounded-xl border p-5 ${isActive
                                                        ? 'border-blue-400 bg-blue-500/10 shadow-lg'
                                                        : 'border-slate-700 bg-slate-900/60'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-white">{step.title}</span>
                                                    <span
                                                        className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`}
                                                    />
                                                </div>
                                                <p className="text-sm text-slate-400">{step.description}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-400 text-green-200 text-xs">
                                        Provider attested
                                    </span>
                                    <span className="text-slate-400 text-sm">Identity protected; attestation and delivery handling are shown by the platform.</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Provider Transparency</h3>
                                <p className="text-slate-300 mb-5">
                                    Essential information to evaluate the provider packet without exposing the provider's identity.
                                </p>
                                <p className="mb-5 text-xs text-slate-500">
                                    These notes are demo review cues and do not replace provider, legal, or policy confirmation.
                                </p>
                                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {dataset.providerNotes.map(note => (
                                        <div key={note} className="bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-200">
                                            {note}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Current Status & Secure Access Options */}
                        <div className="lg:w-1/3 space-y-6">
                            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm text-slate-400">Current status</div>
                                    <span
                                        className={`px-3 py-1 rounded-full border text-xs ${requestStatus === 'REQUEST_APPROVED'
                                                ? 'bg-green-500/15 border-green-400 text-green-200'
                                                : requestStatus === 'REVIEW_IN_PROGRESS'
                                                    ? 'bg-yellow-500/15 border-yellow-400 text-yellow-200'
                                                    : 'bg-red-500/15 border-red-400 text-red-200'
                                            }`}
                                    >
                                        {requestReviewStateLabel(requestStatus)}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-sm">
                                    {requestStatus === 'REQUEST_APPROVED' && 'Access configured. Review scope and instructions below.'}
                                    {requestStatus === 'REVIEW_IN_PROGRESS' && 'We received your request. A reviewer will follow up with controls and delivery steps.'}
                                    {requestStatus === 'REQUEST_REJECTED' && 'Request declined. We can suggest alternate sources or share summary stats.'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                                <div className="text-sm font-semibold text-white">Risk Assessment Workspace</div>
                                <p className="mt-1 text-xs text-slate-300">
                                    Detailed risk controls and review components now open in a dedicated page.
                                </p>
                                <button
                                    onClick={() => setShowRiskAssessment(true)}
                                    className="mt-3 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                                >
                                    Risk Assessment
                                </button>
                            </div>

                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-semibold text-white">Reusable Compliance Passport</div>
                                        <div className="mt-1 text-xs text-slate-300">
                                            {compliancePassport.passportId} · {compliancePassport.completionPercent}% complete
                                        </div>
                                    </div>
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${passportStatus.classes}`}>
                                        {passportStatus.label}
                                    </span>
                                </div>
                                <p className="mt-3 text-xs text-slate-300">{passportStatus.detail}</p>
                                <p className="mt-3 text-[11px] leading-5 text-slate-400">
                                    Passport reuse organizes declared review context. It does not grant access or legal approval.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            applyRequestPrefill(buildRequestPrefillFromPassport(compliancePassport))
                                            openRequestModal()
                                        }}
                                        className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                                    >
                                        Use In Request
                                    </button>
                                    <Link
                                        to="/compliance-passport"
                                        className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-emerald-400/50 hover:bg-white/5"
                                    >
                                        Open Passport
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-xl border border-cyan-500/30 bg-slate-950/55 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-semibold text-white">Latest Rights Quote</div>
                                        <div className="mt-1 text-xs text-slate-400">Commercial terms built from configurable usage rights.</div>
                                    </div>
                                    {latestSavedQuote && (
                                        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-100">
                                            {formatUsd(latestSavedQuote.totalUsd)}
                                        </span>
                                    )}
                                </div>

                                {latestSavedQuote ? (
                                    <>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {latestSavedQuote.rightsSummary.slice(0, 3).map(item => (
                                                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-3 text-xs text-slate-400">
                                            Quote {latestSavedQuote.id} · Valid until{' '}
                                            {new Date(latestSavedQuote.expiresAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    applyRequestPrefill(buildRequestPrefillFromQuote(latestSavedQuote, compliancePassport))
                                                    openRequestModal()
                                                }}
                                                className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                                            >
                                                Use Quote In Request
                                            </button>
                                            <Link
                                                to={`/datasets/${dataset.id}/rights-quote`}
                                                className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-cyan-400/50 hover:bg-white/5"
                                            >
                                                Refine Terms
                                            </Link>
                                        </div>
                                        <div className="mt-4 text-[11px] leading-5 text-slate-500">
                                            Quote terms describe licensed use in this demo. They do not prove ownership, lawful basis, or chain-of-title.
                                        </div>
                                        <div className="text-[11px] leading-5 text-slate-500">
                                            When you are ready to proceed, use the main <span className="font-semibold text-slate-300">Escrow-Native Checkout</span> action above so this quote is applied through the single checkout path.
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-3">
                                        <p className="text-xs text-slate-400">
                                            No terms saved yet. Build evaluation terms to turn delivery, usage, term, and exclusivity into a reusable package.
                                        </p>
                                        <Link
                                            to={`/datasets/${dataset.id}/rights-quote`}
                                            className="mt-4 inline-flex rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                        >
                                            Build Evaluation Terms
                                        </Link>
                                        <p className="mt-3 text-[11px] leading-5 text-slate-500">
                                            After terms are ready, continue from the main <span className="font-semibold text-slate-300">Escrow-Native Checkout</span> action in the Access section.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-base font-semibold text-white">Secure Access Options</h4>
                                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Access Options</span>
                                </div>

                                {/* Side-by-side access option cards */}
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Escrow Access */}
                                    <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-5">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-start gap-3">
                                                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
                                                    <svg className="h-4 w-4 text-emerald-200/90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                                <div>
                                                    <p className="text-base font-semibold text-white">Escrow Access</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Payment held until you verify data quality
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 mb-3">
                                            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.5L10 14.9 5.05 16.7l.95-5.5-4-3.9 5.53-.8L10 1.5z" />
                                            </svg>
                                            Recommended
                                        </span>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                                                    Escrow window
                                                </label>
                                                <select
                                                    value={escrowWindow}
                                                    onChange={(event) => setEscrowWindow(event.target.value)}
                                                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                                                >
                                                    <option value="24 hours">24 hours</option>
                                                    <option value="48 hours">48 hours (higher escrow hold)</option>
                                                    <option value="72 hours">72 hours (largest escrow hold)</option>
                                                </select>
                                            </div>
                                            <p className="text-xs text-slate-400">Full refund if unsatisfied</p>
<button
                                                disabled={!startEscrowGuardrail.allowed}
                                                className={`w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors transition-transform duration-100 active:scale-95 ${
                                                    startEscrowGuardrail.allowed
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                                }`}
                                                onClick={() => setEscrowActive(true)}
                                            >
                                                Put on Escrow
                                            </button>
                                            <p className={`text-[11px] ${startEscrowGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                                {startEscrowGuardrail.allowed
                                                    ? 'Escrow can be activated for this approved request.'
                                                    : startEscrowGuardrail.reason}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Direct Secure Access */}
                                    <div className="rounded-2xl border border-slate-600/50 bg-slate-950/40 p-5">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-800/60">
                                                <svg className="h-4 w-4 text-slate-200/90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-base font-semibold text-white">Direct Secure Access</p>
                                                <p className="text-xs text-slate-400 mt-1">Immediate access, no refund</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-amber-200/70 mb-3">
                                            Higher risk - known providers only
                                        </p>
                                        <button className="w-full px-3 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-200 hover:border-slate-400 hover:text-white transition-colors">
                                            Direct Secure Access
                                        </button>
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Redoubt holds payment in escrow and releases to provider only after evaluation org confirmation or window expiry.
                                </p>

                                {escrowActive && (
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                                        <div className="flex items-center justify-between text-sm text-amber-200 mb-3">
                                            <span className="font-semibold">Escrow Active - 23:47:12 remaining</span>
                                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                        </div>
                                        <div className="grid gap-2">
                                            <button
                                                disabled={!releasePaymentGuardrail.allowed}
                                                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                                    releasePaymentGuardrail.allowed
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                                        : 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                                }`}
                                            >
                                                Confirm & Release Payment
                                            </button>
                                            <p className={`text-[11px] ${releasePaymentGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                                {releasePaymentGuardrail.allowed
                                                    ? 'Payment release is currently permitted by lifecycle policy.'
                                                    : releasePaymentGuardrail.reason}
                                            </p>
                                            <button
                                                disabled={!disputeRefundGuardrail.allowed}
                                                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                                    disputeRefundGuardrail.allowed
                                                        ? 'border border-rose-500/60 text-rose-200 hover:bg-rose-500/10'
                                                        : 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                                }`}
                                            >
                                                Dispute & Refund
                                            </button>
                                            <p className={`text-[11px] ${disputeRefundGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                                {disputeRefundGuardrail.allowed
                                                    ? 'Dispute remains available until escrow is settled.'
                                                    : disputeRefundGuardrail.reason}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-slate-500">
                                Provider identity remains shielded; communication is routed through the platform.
                            </div>
                        </div>
                    </div>

                    {requestStatus === 'REQUEST_APPROVED' && (
                                <div className="bg-slate-900/60 border border-green-500/30 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-green-200 mb-3">
                                <span className="w-2 h-2 rounded-full bg-green-300" />
                                <span className="font-semibold">Access granted view</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="text-white font-semibold">Access modes</h4>
                                    <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                                        <li>Preview-only access</li>
                                        <li>Limited records access</li>
                                        <li>API-limited access</li>
                                        <li>Full secure access (upon approval)</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-white font-semibold">Allowed usage scope</h4>
                                    <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                                        {dataset.access.allowedUsage.map(item => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                    <div className="text-sm text-slate-300 mt-2">
                                        <div><span className="text-slate-500">Expiration:</span> {dataset.access.expiration}</div>
                                        <div><span className="text-slate-500">Usage limits:</span> {dataset.access.usageLimits}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-slate-400">
                                Identity is disclosed only with your consent. Access is granted based on trust, compliance, and intended usage.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
<div
                         className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-transform duration-100 active:scale-95"
                         onClick={() => setShowRequestModal(false)}
                     />
                    <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-white">{requestEntryLabel}</h3>
                                <p className="text-slate-400 text-sm">
                                    {requestModalDescription}
                                </p>
                            </div>
                            <button
                                className="text-slate-500 hover:text-white"
                                onClick={() => setShowRequestModal(false)}
                                aria-label="Close request modal"
                            >
                                X
                            </button>
                        </div>

                        {minimumTrustNeedsReview && (
                            <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-100">
                                <div className="font-semibold">{trustSignalStateLabel(minimumTrustState)}</div>
                                <div className="mt-1 text-amber-50/85">
                                    This request will route provider and reviewer checks before any live dataset access can be approved.
                                </div>
                            </div>
                        )}

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

                        {requestPrefillNote && (
                            <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                                <div className="font-semibold">Reusable context applied</div>
                                <div className="mt-1 text-cyan-50/85">{requestPrefillNote}</div>
                                {requestQuoteSummary && <div className="mt-2 text-xs text-cyan-50/75">{requestQuoteSummary}</div>}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Organization / affiliation (optional)</label>
                                <select
                                    value={orgType}
                                    onChange={(e) => setOrgType(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="research">Research / academic</option>
                                    <option value="enterprise">Enterprise / corporate</option>
                                    <option value="startup">Startup / product team</option>
                                    <option value="public">Public sector / NGO</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Intended usage</label>
                                <textarea
                                    value={intendedUsage}
                                    onChange={(e) => setIntendedUsage(e.target.value)}
                                    rows={4}
                                    placeholder="Summarize the workflows, models, or analysis you plan to run (no identities)."
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Estimated usage scale</label>
                                <select
                                    value={usageScale}
                                    onChange={(e) => setUsageScale(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="low">Low (evaluation / POC)</option>
                                    <option value="medium">Medium (team workflows)</option>
                                    <option value="high">High (production workloads)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Duration needed</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="30 days">30 days</option>
                                    <option value="90 days">90 days</option>
                                    <option value="6 months">6 months</option>
                                    <option value="12 months">12 months</option>
                                    <option value="ongoing">Ongoing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Affiliation (optional but encouraged)</label>
                                <input
                                    value={affiliation}
                                    onChange={(e) => setAffiliation(e.target.value)}
                                    placeholder="Team, company, or lab name"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500"
                                onClick={() => setShowRequestModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                                onClick={handleSubmitRequest}
                                disabled={!complianceChecked || !intendedUsage}
                            >
                                {requestSubmitLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function DecisionValue({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm font-semibold text-white">{value}</div>
        </div>
    )
}

function DealDossierHeroStrip({
    dealId,
    dealType,
    dossierPath,
    providerPacketPath,
    availableSurfaceCount,
    placeholderSurfaceCount
}: {
    dealId: string
    dealType: string
    dossierPath: string | null
    providerPacketPath: string | null
    availableSurfaceCount: number
    placeholderSurfaceCount: number
}) {
    if (!dossierPath) return null

    return (
        <section className="mt-4 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),linear-gradient(135deg,rgba(8,17,31,0.96)_0%,rgba(15,23,42,0.88)_100%)] p-4 shadow-[0_18px_54px_rgba(2,8,20,0.26)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                            Evaluation Dossier
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                            {dealId}
                        </span>
                        <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                            {dealType}
                        </span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-white">
                        This dataset has a dedicated deal operating surface
                    </h2>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <DealDossierHeroMetric label="Dossier route" value={dossierPath} />
                        <DealDossierHeroMetric label="Available surfaces" value={`${availableSurfaceCount} configured`} />
                        <DealDossierHeroMetric
                            label="Pending surfaces"
                            value={placeholderSurfaceCount > 0 ? `${placeholderSurfaceCount} placeholders` : 'None'}
                        />
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 xl:flex-col">
                    <Link
                        to={dossierPath}
                        className="inline-flex justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
                    >
                        Open evaluation dossier
                    </Link>
                    {providerPacketPath ? (
                        <Link
                            to={providerPacketPath}
                            className="inline-flex justify-center rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-white"
                        >
                            Open provider rights packet
                        </Link>
                    ) : null}
                </div>
            </div>
        </section>
    )
}

function DealDossierHeroMetric({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="min-w-0 rounded-xl border border-white/8 bg-slate-950/45 px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </div>
            <div className="mt-1 truncate text-xs font-semibold text-slate-100">{value}</div>
        </div>
    )
}

type DetailSummaryItem = {
    label: string
    value: string
}

function DetailSummaryCard({
    eyebrow,
    title,
    description,
    items
}: {
    eyebrow: string
    title: string
    description: string
    items: DetailSummaryItem[]
}) {
    return (
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/45 p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">{eyebrow}</div>
            <h4 className="mt-2 text-lg font-semibold text-white">{title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {items.map(item => (
                    <div key={item.label} className="rounded-xl border border-white/8 bg-slate-900/70 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                        <div className="mt-2 text-sm font-medium text-slate-100">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

