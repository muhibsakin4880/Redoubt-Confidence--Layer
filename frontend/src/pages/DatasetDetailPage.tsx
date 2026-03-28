import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_DATASET, DATASET_DETAILS, RequestStatus, confidenceLevel, decisionLabel } from '../data/datasetDetailData'
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
    buildCompliancePassport,
    buildRequestPrefillFromPassport,
    passportStatusMeta
} from '../domain/compliancePassport'
import { buildDealProgressModel } from '../domain/dealProgress'
import { getOutcomeEvaluationFee, loadEscrowCheckouts } from '../domain/escrowCheckout'
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

export default function DatasetDetailPage() {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const dataset = (id && DATASET_DETAILS[id]) || DEFAULT_DATASET
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
                                    Provider verified
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

                            <div className="mt-4 bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Contributor trust</span>
                                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-200">
                                        {dataset.contributorTrust}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    {dataset.contributionHistory}
                                </div>
                            </div>

                            <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            Decision Block
                                        </div>
                                        <h2 className="mt-3 text-xl font-semibold text-white">Choose free preview or protected evaluation</h2>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                            Buyers can stay in zero-cost metadata review, or move into a governed clean-room evaluation with escrow protection,
                                            buyer validation, and automatic credits when commitments miss.
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
                                                <h3 className="mt-3 text-lg font-semibold text-white">Paid Clean-Room Evaluation</h3>
                                                <p className="mt-2 text-sm text-slate-200/85">
                                                    Enter escrow-native checkout, provision a governed workspace, and let the protection engine verify the contracted outcome before payout.
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
                                                ? `Quote ${latestSavedQuote.id} is ready for protected evaluation and escrow-native checkout.`
                                                : 'Checkout will generate a passport-based starter quote if you have not saved one yet.'}
                                        </div>

                                        <Link
                                            to={`/datasets/${dataset.id}/escrow-checkout`}
                                            state={latestSavedQuote ? { quoteId: latestSavedQuote.id } : undefined}
                                            className="mt-4 inline-flex items-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                                        >
                                            Enter Protected Evaluation
                                        </Link>
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
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 text-center">AI Confidence Verified Dataset</div>
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
                        <span className="font-semibold text-white">All Access Requests are Audited</span>
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
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-xl font-semibold">Access</h3>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400 text-blue-200 text-xs">
                                        Guided process
                                    </span>
                                </div>
                                <p className="text-slate-300 max-w-2xl mb-4">
                                    Request access with context on intended use. We scope delivery, controls, and data handling together - no open marketplace listing.
                                </p>
                                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                                    {dataset.accessNotes.map(note => (
                                        <li key={note}>{note}</li>
                                    ))}
                                </ul>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <button
                                        onClick={openRequestModal}
                                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Request Access
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
                                        Provider verified
                                    </span>
                                    <span className="text-slate-400 text-sm">Identity protected; delivery handled by platform.</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Provider Transparency</h3>
                                <p className="text-slate-300 mb-5">
                                    Essential information to evaluate trust without exposing the provider's identity.
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
                                            <Link
                                                to={`/datasets/${dataset.id}/escrow-checkout`}
                                                state={{ quoteId: latestSavedQuote.id }}
                                                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                                            >
                                                Checkout Quote
                                            </Link>
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
                                                Refine Quote
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-3">
                                        <p className="text-xs text-slate-400">
                                            No quote saved yet. Build one to turn delivery, usage, term, and exclusivity into a reusable commercial package.
                                        </p>
                                        <Link
                                            to={`/datasets/${dataset.id}/rights-quote`}
                                            className="mt-4 inline-flex rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                        >
                                            Build Rights Quote
                                        </Link>
                                        <Link
                                            to={`/datasets/${dataset.id}/escrow-checkout`}
                                            className="mt-2 inline-flex rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20"
                                        >
                                            Start Escrow Checkout
                                        </Link>
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
                                                    <option value="48 hours">48 hours (+10%)</option>
                                                    <option value="72 hours">72 hours (+20%)</option>
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
                                    Redoubt holds payment in escrow and releases to provider only after buyer confirmation or window expiry.
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
                                <h3 className="text-xl font-semibold text-white">Request Access</h3>
                                <p className="text-slate-400 text-sm">
                                    Share intended use to route approval. Provider identity remains private.
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
                                Submit secure request
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

