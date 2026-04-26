import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CredentialStatusBadge from '../components/credentials/CredentialStatusBadge'
import CredentialSummaryCard from '../components/credentials/CredentialSummaryCard'
import DealProgressTracker from '../components/DealProgressTracker'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import { getDealRouteContextById } from '../domain/dealDossier'
import {
    issueEphemeralCredential,
    getCredentialStatus,
    type EphemeralCredential
} from '../domain/ephemeralCredentialStore'
import { loadRightsQuotes, formatUsd, type RightsQuote } from '../domain/rightsQuoteBuilder'
import { loadEscrowCheckouts, type EscrowCheckoutRecord } from '../domain/escrowCheckout'
import { getDatasetDetailById, DATASET_DETAILS, confidenceLevel } from '../data/datasetDetailData'
import { isBuyerDemoActive, getCanonicalDemoEscrowScenario } from '../domain/demoEscrowScenario'

// ─── Label maps ──────────────────────────────────────────────────────────────

const DELIVERY_MODE_LABELS: Record<string, string> = {
    metadata_only: 'Metadata Only',
    clean_room: 'Clean Room',
    aggregated_export: 'Aggregated Export',
    encrypted_download: 'Encrypted Delivery Package'
}
const FIELD_PACK_LABELS: Record<string, string> = {
    core: 'Core Fields',
    analytics: 'Analytics Pack',
    sensitive_review: 'Sensitive Review Pack',
    full: 'Full Field Access'
}
const USAGE_RIGHT_LABELS: Record<string, string> = {
    research: 'Research Only',
    internal_ai: 'Internal AI / ML',
    commercial_analytics: 'Commercial Analytics',
    redistribution: 'Redistribution Rights'
}
const DURATION_LABELS: Record<string, string> = {
    '30_days': '30 Days',
    '90_days': '90 Days',
    '180_days': '180 Days',
    '365_days': '1 Year'
}
const GEOGRAPHY_LABELS: Record<string, string> = {
    single_region: 'Single Region',
    dual_region: 'Dual Region',
    global: 'Global'
}
const EXCLUSIVITY_LABELS: Record<string, string> = {
    none: 'Non-Exclusive',
    soft: 'Soft Exclusivity',
    hard: 'Hard Exclusivity'
}
const SEAT_BAND_LABELS: Record<string, string> = {
    individual: 'Individual',
    team: 'Team (2–10)',
    department: 'Department (11–50)',
    enterprise: 'Enterprise (50+)'
}
const SUPPORT_LABELS: Record<string, string> = {
    standard: 'Standard',
    priority: 'Priority',
    mission_critical: 'Mission Critical'
}
const PAYMENT_METHOD_LABELS: Record<string, string> = {
    wallet: 'Platform Wallet',
    wire: 'Wire Transfer',
    card: 'Card'
}
const OUTCOME_STAGE_LABELS: Record<string, string> = {
    evaluation_pending: 'Pending',
    evaluation_active: 'Active',
    validated: 'Validated',
    credit_issued: 'Credit Issued',
    released: 'Released'
}
const RISK_BAND_CLASSES: Record<string, string> = {
    controlled: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
    heightened: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
    strict: 'border-rose-500/35 bg-rose-500/10 text-rose-200'
}
const LIFECYCLE_BADGE_CLASSES: Record<string, string> = {
    FUNDS_HELD: 'border-blue-500/35 bg-blue-500/10 text-blue-200',
    ACCESS_ACTIVE: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
    RELEASE_PENDING: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
    RELEASED_TO_PROVIDER: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100',
    DISPUTE_OPEN: 'border-rose-500/35 bg-rose-500/10 text-rose-200'
}
const LIFECYCLE_LABELS: Record<string, string> = {
    FUNDS_HELD: 'Funds Held',
    ACCESS_ACTIVE: 'Access Active',
    RELEASE_PENDING: 'Release Pending',
    RELEASED_TO_PROVIDER: 'Released',
    DISPUTE_OPEN: 'Dispute Open'
}
const CRED_LIVE_STATUS_CLASSES: Record<string, string> = {
    planned: 'border-slate-600/50 bg-slate-800/50 text-slate-300',
    active: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
    expiring: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
    expired: 'border-slate-600/50 bg-slate-800/50 text-slate-400',
    frozen: 'border-rose-500/35 bg-rose-500/10 text-rose-200',
    revoked: 'border-rose-500/35 bg-rose-500/10 text-rose-200'
}

// ─── Eval state ───────────────────────────────────────────────────────────────

type EvalState = 'draft' | 'terms_configured' | 'escrow_funded' | 'workspace_active' | 'validation_open' | 'released' | 'dispute'

const EVAL_STATE_META: Record<EvalState, { label: string; classes: string }> = {
    draft: { label: 'Draft', classes: 'border-slate-600/50 bg-slate-800/50 text-slate-300' },
    terms_configured: { label: 'Terms Configured', classes: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100' },
    escrow_funded: { label: 'Escrow Funded', classes: 'border-blue-500/40 bg-blue-500/10 text-blue-100' },
    workspace_active: { label: 'Workspace Active', classes: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' },
    validation_open: { label: 'Validation Open', classes: 'border-amber-500/40 bg-amber-500/10 text-amber-100' },
    released: { label: 'Release Complete', classes: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-50' },
    dispute: { label: 'Dispute Open', classes: 'border-rose-500/40 bg-rose-500/10 text-rose-100' }
}

function deriveEvalState(quote: RightsQuote | null, checkout: EscrowCheckoutRecord | null): EvalState {
    if (!quote) return 'draft'
    if (!checkout) return 'terms_configured'
    switch (checkout.lifecycleState) {
        case 'FUNDS_HELD': return 'escrow_funded'
        case 'ACCESS_ACTIVE': return 'workspace_active'
        case 'RELEASE_PENDING': return 'validation_open'
        case 'RELEASED_TO_PROVIDER': return 'released'
        case 'DISPUTE_OPEN': return 'dispute'
        default: return 'escrow_funded'
    }
}

// ─── Governance controls ──────────────────────────────────────────────────────

type GovTone = 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate'
type GovControl = { label: string; tone: GovTone; badge: string; detail: string }

const GOV_TONE_CLASSES: Record<GovTone, string> = {
    emerald: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-200',
    cyan: 'border-cyan-500/30 bg-cyan-500/8 text-cyan-200',
    amber: 'border-amber-500/30 bg-amber-500/8 text-amber-200',
    rose: 'border-rose-500/30 bg-rose-500/8 text-rose-200',
    slate: 'border-slate-700/60 bg-slate-900/40 text-slate-300'
}

function deriveGovernanceControls(quote: RightsQuote | null, checkout: EscrowCheckoutRecord | null): GovControl[] {
    const accessMode = checkout?.configuration.accessMode ?? quote?.input?.deliveryMode
    const isCleanRoom = accessMode === 'clean_room' || accessMode === 'aggregated_export'
    const audit = quote?.input?.auditLoggingRequirement
    const attribution = quote?.input?.attributionRequirement
    const redistribution = quote?.input?.redistributionRights
    const geography = quote?.input?.geography

    return [
        {
            label: 'Governed Workspace',
            tone: isCleanRoom ? 'emerald' : accessMode ? 'amber' : 'slate',
            badge: isCleanRoom ? 'Clean Room' : accessMode === 'encrypted_download' ? 'Encrypted Delivery' : accessMode === 'metadata_only' ? 'Metadata Only' : 'Pending',
            detail: isCleanRoom
                ? 'Access is scoped to a governed clean-room environment with no raw export lane.'
                : 'Workspace mode is not yet configured. Configure evaluation terms to set access route.'
        },
        {
            label: 'Raw Export',
            tone: 'emerald',
            badge: 'Blocked',
            detail: 'No raw dataset download is permitted at any point during protected evaluation.'
        },
        {
            label: 'Audit Logging',
            tone: audit === 'mandatory' ? 'emerald' : audit === 'optional' ? 'amber' : 'slate',
            badge: audit === 'mandatory' ? 'Mandatory' : audit === 'optional' ? 'Optional' : 'Pending',
            detail: audit === 'mandatory'
                ? 'Every session action is captured in the evaluation audit trail.'
                : 'Audit logging requirement is not yet set to mandatory.'
        },
        {
            label: 'Watermarking',
            tone: 'cyan',
            badge: 'Required',
            detail: 'All governed workspace outputs are watermark-linked to this evaluation session.'
        },
        {
            label: 'Re-identification',
            tone: 'cyan',
            badge: 'Safeguards Active',
            detail: 'Automated re-identification safeguards apply within the clean-room boundary.'
        },
        {
            label: 'Redistribution',
            tone: redistribution === 'not_allowed' ? 'emerald' : redistribution === 'allowed' ? 'amber' : 'slate',
            badge: redistribution === 'not_allowed' ? 'Not Allowed' : redistribution === 'allowed' ? 'Allowed' : 'Pending',
            detail: redistribution === 'not_allowed'
                ? 'Derived data may not be redistributed under the current terms.'
                : redistribution === 'allowed'
                    ? 'Redistribution is permitted — ensure downstream compliance.'
                    : 'Redistribution rights are not yet specified.'
        },
        {
            label: 'Attribution',
            tone: attribution === 'required' ? 'cyan' : 'slate',
            badge: attribution === 'required' ? 'Required' : attribution === 'not_required' ? 'Not Required' : 'Pending',
            detail: attribution === 'required'
                ? 'Data source attribution is required in all derived outputs and publications.'
                : 'Attribution requirement is not yet set.'
        },
        {
            label: 'Jurisdiction',
            tone: geography === 'global' ? 'amber' : geography ? 'cyan' : 'slate',
            badge: geography === 'single_region' ? 'Single Region' : geography === 'dual_region' ? 'Dual Region' : geography === 'global' ? 'Global — Review Required' : 'Pending',
            detail: geography === 'global'
                ? 'Cross-border residency review applies. Confirm jurisdiction controls before release.'
                : geography
                    ? `Use is bounded to ${GEOGRAPHY_LABELS[geography] ?? geography} scope.`
                    : 'Jurisdiction scope is not yet determined.'
        }
    ]
}

// ─── Activity timeline ────────────────────────────────────────────────────────

type ActivityTone = 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate'
type ActivityEvent = { title: string; detail: string; timestamp: string | null; tone: ActivityTone }

const ACTIVITY_TONE_DOT: Record<ActivityTone, string> = {
    emerald: 'bg-emerald-400',
    cyan: 'bg-cyan-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    slate: 'bg-slate-600'
}

function deriveActivityEvents(
    datasetTitle: string | null,
    quote: RightsQuote | null,
    checkout: EscrowCheckoutRecord | null,
    issuedCred: EphemeralCredential | null
): ActivityEvent[] {
    const events: ActivityEvent[] = []

    if (datasetTitle) {
        events.push({ title: 'Dataset selected', detail: `${datasetTitle} added to evaluation scope`, timestamp: null, tone: 'slate' })
    }
    if (quote) {
        events.push({ title: 'Evaluation terms saved', detail: `Quote ${quote.id} · ${formatUsd(quote.totalUsd)} · ${quote.riskBand} risk`, timestamp: quote.createdAt, tone: 'emerald' })
    }
    if (checkout) {
        events.push({ title: 'Escrow funded', detail: `${formatUsd(checkout.funding.escrowHoldUsd)} held · ${checkout.escrowId}`, timestamp: checkout.funding.fundedAt, tone: 'emerald' })
    }
    if (checkout?.workspace.status === 'ready') {
        events.push({ title: 'Workspace provisioned', detail: checkout.workspace.workspaceName, timestamp: checkout.workspace.provisionedAt ?? null, tone: 'cyan' })
    }
    if (checkout?.credentials.status === 'issued' && !issuedCred) {
        events.push({ title: 'Evaluation credential issued', detail: `${checkout.credentials.credentialId ?? 'TKN-...'} · ${checkout.credentials.tokenTtlMinutes}min window`, timestamp: checkout.credentials.issuedAt ?? null, tone: 'cyan' })
    }
    if (issuedCred) {
        events.push({ title: 'Evaluation credential issued', detail: `${issuedCred.id} · ${issuedCred.scopes.length} active scopes`, timestamp: issuedCred.issuedAt, tone: 'cyan' })
    }
    if (checkout?.outcomeProtection.validation.status === 'confirmed') {
        events.push({ title: 'Buyer validation confirmed', detail: checkout.outcomeProtection.validation.note ?? 'Evaluation commitments verified', timestamp: checkout.outcomeProtection.validation.updatedAt ?? null, tone: 'emerald' })
    }
    if (checkout?.lifecycleState === 'DISPUTE_OPEN') {
        events.push({ title: 'Dispute opened', detail: 'Evaluation dispute is under active review', timestamp: null, tone: 'rose' })
    }
    if (checkout?.lifecycleState === 'RELEASED_TO_PROVIDER') {
        events.push({ title: 'Provider payout released', detail: 'Escrow disbursed following successful buyer validation', timestamp: checkout.outcomeProtection.release?.releasedAt ?? null, tone: 'emerald' })
    }

    return events.reverse()
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatDate(isoString: string): string {
    try { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoString)) }
    catch { return isoString }
}

function formatTimestamp(isoString: string | null | undefined): string {
    if (!isoString) return ''
    try { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString)) }
    catch { return isoString }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const panel = 'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'
const eyebrowCls = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500'

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-1.5 text-sm ${mono ? 'font-mono' : 'font-medium'} text-slate-100 break-all`}>{value}</div>
        </div>
    )
}

function SummaryCard({ eyebrow, value, badge, badgeClass, detail }: { eyebrow: string; value: string; badge: string; badgeClass: string; detail: string }) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{eyebrow}</div>
            <div className="mt-3 truncate text-lg font-semibold text-white">{value}</div>
            <div className="mt-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${badgeClass}`}>
                    {badge}
                </span>
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </article>
    )
}

function QuickLinkRow({ to, label }: { to: string; label: string }) {
    return (
        <Link
            to={to}
            className="flex items-center justify-between rounded-xl border border-white/8 bg-slate-950/45 px-3 py-2.5 text-sm text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-cyan-100"
        >
            <span>{label}</span>
            <svg className="h-3.5 w-3.5 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    )
}

const CREDENTIAL_SCOPE_LABELS: Record<string, string> = {
    'dataset:read': 'dataset:read',
    'query:clean-room': 'query:clean-room',
    'audit:write': 'audit:write',
    'export:none': 'export:none',
    'egress:blocked': 'egress:blocked',
    'watermark:required': 'watermark:required',
    'policy:enforced': 'policy:enforced'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuyerDossierPage({ demo = false }: { demo?: boolean }) {
    const { dealId } = useParams()
    const isDemoRoute = demo || window.location.pathname.startsWith('/demo/')
    const buyerDemoActive = !demo && isBuyerDemoActive()
    const useDemo = isDemoRoute || buyerDemoActive

    const [issuedCredential, setIssuedCredential] = useState<EphemeralCredential | null>(null)
    const nowMs = useMemo(() => Date.now(), [])

    const dealContext = useMemo(() => getDealRouteContextById(dealId), [dealId])

    const dataset = useMemo(() => {
        if (dealContext?.dataset) return dealContext.dataset
        if (dealContext?.seed?.datasetId) return getDatasetDetailById(dealContext.seed.datasetId) ?? null
        const canonicalScenario = getCanonicalDemoEscrowScenario()
        if (canonicalScenario?.checkoutRecord) return getDatasetDetailById(canonicalScenario.checkoutRecord.datasetId) ?? null
        return Object.values(DATASET_DETAILS)[0] ?? null
    }, [dealContext])

    const datasetId = dataset?.id

    const quote = useMemo<RightsQuote | null>(() => {
        if (dealContext?.quote) return dealContext.quote as RightsQuote
        const quotes = loadRightsQuotes(datasetId)
        return quotes.length > 0 ? quotes[0] : null
    }, [dealContext, datasetId])

    const checkoutRecord = useMemo<EscrowCheckoutRecord | null>(() => {
        if (dealContext?.checkoutRecord) return dealContext.checkoutRecord as EscrowCheckoutRecord
        const checkouts = loadEscrowCheckouts(datasetId)
        return checkouts.length > 0 ? checkouts[0] : null
    }, [dealContext, datasetId])

    const dealProgress = dealContext?.dealProgress ?? null
    const evalState = useMemo(() => deriveEvalState(quote, checkoutRecord), [quote, checkoutRecord])
    const evalStateMeta = EVAL_STATE_META[evalState]
    const govControls = useMemo(() => deriveGovernanceControls(quote, checkoutRecord), [quote, checkoutRecord])

    const credentialStatus = issuedCredential ? getCredentialStatus(issuedCredential, nowMs) : null
    const isCredentialActive = credentialStatus === 'active' || credentialStatus === 'expiring'

    const dealRef = dealId ?? '—'
    const datasetTitle = dataset?.title ?? 'Dataset'

    const workspacePath = checkoutRecord?.workspace.launchPath ?? (useDemo ? '/demo/workspace' : '/workspace')
    const outputReviewPath = useDemo ? `/demo/deals/${dealRef}/output-review` : `/deals/${dealRef}/output-review`
    const termsPath = datasetId ? (useDemo ? `/demo/datasets/${datasetId}/rights-quote` : `/datasets/${datasetId}/rights-quote`) : '#'
    const checkoutPath = datasetId ? (useDemo ? `/demo/datasets/${datasetId}/escrow-checkout` : `/datasets/${datasetId}/escrow-checkout`) : '#'
    const datasetPath = datasetId ? (useDemo ? `/demo/datasets/${datasetId}` : `/datasets/${datasetId}`) : (useDemo ? '/demo/datasets' : '/datasets')

    const hasOutputReview = Boolean(checkoutRecord && checkoutRecord.outcomeProtection.stage !== 'evaluation_pending')
    const primaryAction = hasOutputReview ? 'review_outputs' : isCredentialActive ? 'open_workspace' : 'issue_credential'

    const activityEvents = useMemo(
        () => deriveActivityEvents(dataset?.title ?? null, quote, checkoutRecord, issuedCredential),
        [dataset, quote, checkoutRecord, issuedCredential]
    )

    const handleIssueCredential = () => {
        const newCred = issueEphemeralCredential({
            participantId: 'part_anon_current',
            datasetId: datasetId ?? '1',
            dealId,
            ttlMinutes: checkoutRecord?.credentials.tokenTtlMinutes ?? 60
        })
        setIssuedCredential(newCred)
    }

    if (!dataset) {
        return (
            <DatasetUnavailableState
                contextLabel="Evaluation Dossier"
                detail="The evaluation dossier could not be found. Return to Datasets and select a dataset to begin evaluation."
            />
        )
    }

    const confLevel = confidenceLevel(dataset.confidenceScore)

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.07),transparent_32%),radial-gradient(circle_at_50%_92%,rgba(59,130,246,0.06),transparent_38%)]" />

            <div className="relative mx-auto max-w-[1680px] px-6 py-10 sm:px-10 lg:px-14">

                {/* ── Hero ─────────────────────────────────────────────────── */}
                <header className={`${panel}`}>
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 max-w-3xl">
                            <nav className="flex items-center gap-2 text-sm text-slate-400">
                                <Link to={useDemo ? '/demo/datasets' : '/datasets'} className="hover:text-white">Datasets</Link>
                                <span className="text-slate-600">/</span>
                                <span className="text-slate-200">Evaluation Dossier</span>
                            </nav>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className={eyebrowCls}>Evaluation Dossier · Deal {dealRef}</div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${evalStateMeta.classes}`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    {evalStateMeta.label}
                                </span>
                            </div>

                            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                {datasetTitle}
                            </h1>

                            <p className="mt-3 text-base leading-7 text-slate-400">
                                Protected evaluation workspace for reviewing dataset fit, rights terms, escrow status, and output controls. Provider identity remains protected until evaluation advances to release.
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col xl:items-stretch xl:min-w-[180px]">
                            {primaryAction === 'issue_credential' && (
                                <button
                                    onClick={handleIssueCredential}
                                    className="rounded-xl bg-cyan-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.22)] hover:bg-cyan-400"
                                >
                                    Issue Evaluation Credential
                                </button>
                            )}
                            {primaryAction === 'open_workspace' && (
                                <Link to={workspacePath} className="rounded-xl bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-400">
                                    Open Secure Workspace
                                </Link>
                            )}
                            {primaryAction === 'review_outputs' && (
                                <Link to={outputReviewPath} className="rounded-xl bg-cyan-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.22)] hover:bg-cyan-400">
                                    Review Outputs
                                </Link>
                            )}
                            <Link to={datasetPath} className="rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-semibold text-slate-200 hover:border-white/30 hover:text-white">
                                Back to Dataset
                            </Link>
                            <Link to={checkoutPath} className="rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-semibold text-slate-200 hover:border-white/30 hover:text-white">
                                Open Escrow Checkout
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ── Main layout ───────────────────────────────────────────── */}
                <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">

                    {/* Left — main content */}
                    <div className="min-w-0 space-y-6">

                        {/* Summary cards */}
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <SummaryCard
                                eyebrow="Dataset"
                                value={datasetTitle}
                                badge={dataset.category}
                                badgeClass="border-slate-600/50 bg-slate-800/50 text-slate-300"
                                detail={`Confidence ${dataset.confidenceScore}% · ${confLevel.label} · ${dataset.size}`}
                            />
                            <SummaryCard
                                eyebrow="Evaluation Terms"
                                value={quote ? formatUsd(quote.totalUsd) : '—'}
                                badge={quote ? quote.riskBand : 'No quote'}
                                badgeClass={quote ? (RISK_BAND_CLASSES[quote.riskBand] ?? 'border-slate-600/50 bg-slate-800/50 text-slate-300') : 'border-slate-600/50 bg-slate-800/50 text-slate-300'}
                                detail={quote ? `${quote.id} · expires ${formatDate(quote.expiresAt)}` : 'Configure evaluation terms to proceed'}
                            />
                            <SummaryCard
                                eyebrow="Escrow"
                                value={checkoutRecord ? formatUsd(checkoutRecord.funding.escrowHoldUsd) : '—'}
                                badge={checkoutRecord ? (LIFECYCLE_LABELS[checkoutRecord.lifecycleState] ?? checkoutRecord.lifecycleState) : 'Not funded'}
                                badgeClass={checkoutRecord ? (LIFECYCLE_BADGE_CLASSES[checkoutRecord.lifecycleState] ?? 'border-slate-600/50 bg-slate-800/50 text-slate-300') : 'border-slate-600/50 bg-slate-800/50 text-slate-300'}
                                detail={checkoutRecord ? `${checkoutRecord.escrowId} · ${checkoutRecord.buyerLabel}` : 'Escrow not yet funded for this evaluation'}
                            />
                            <SummaryCard
                                eyebrow="Access"
                                value={issuedCredential ? issuedCredential.id : checkoutRecord?.credentials.credentialId ?? 'Not issued'}
                                badge={credentialStatus ?? (checkoutRecord?.credentials.status === 'issued' ? 'issued' : 'planned')}
                                badgeClass={credentialStatus ? (CRED_LIVE_STATUS_CLASSES[credentialStatus] ?? 'border-slate-600/50 bg-slate-800/50 text-slate-300') : 'border-slate-600/50 bg-slate-800/50 text-slate-300'}
                                detail={checkoutRecord?.workspace.status === 'ready' ? `Workspace: ${checkoutRecord.workspace.workspaceName}` : 'Workspace pending provisioning'}
                            />
                        </div>

                        {/* Deal progress tracker */}
                        {dealProgress && <DealProgressTracker model={dealProgress} />}

                        {/* Rights & Terms */}
                        <section className={panel}>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className={eyebrowCls}>Rights & Terms</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Evaluation Terms Package</h2>
                                    {quote
                                        ? <p className="mt-1 text-sm text-slate-400">Quote {quote.id} · {quote.riskBand} risk · expires {formatDate(quote.expiresAt)}</p>
                                        : <p className="mt-1 text-sm text-slate-400">No terms configured. Build a rights quote to define access, usage, and pricing.</p>
                                    }
                                </div>
                                <Link to={termsPath} className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20">
                                    {quote ? 'View / Adjust Terms' : 'Configure Terms'}
                                </Link>
                            </div>

                            {quote ? (
                                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    <InfoRow label="Delivery Mode" value={DELIVERY_MODE_LABELS[quote.input.deliveryMode] ?? quote.input.deliveryMode} />
                                    <InfoRow label="Field Access" value={FIELD_PACK_LABELS[quote.input.fieldPack] ?? quote.input.fieldPack} />
                                    <InfoRow label="Usage Rights" value={USAGE_RIGHT_LABELS[quote.input.usageRight] ?? quote.input.usageRight} />
                                    <InfoRow label="Term Duration" value={DURATION_LABELS[quote.input.duration] ?? quote.input.duration} />
                                    <InfoRow label="Geography" value={GEOGRAPHY_LABELS[quote.input.geography] ?? quote.input.geography} />
                                    <InfoRow label="Exclusivity" value={EXCLUSIVITY_LABELS[quote.input.exclusivity] ?? quote.input.exclusivity} />
                                    <InfoRow label="Redistribution" value={quote.input.redistributionRights === 'not_allowed' ? 'Not Allowed' : 'Allowed'} />
                                    <InfoRow label="Audit Logging" value={quote.input.auditLoggingRequirement === 'mandatory' ? 'Mandatory' : 'Optional'} />
                                    <InfoRow label="Attribution" value={quote.input.attributionRequirement === 'required' ? 'Required' : 'Not Required'} />
                                    <InfoRow label="Validation Window" value={`${quote.input.validationWindowHours} hours`} />
                                    <InfoRow label="Seat Band" value={SEAT_BAND_LABELS[quote.input.seatBand] ?? quote.input.seatBand} />
                                    <InfoRow label="Support Tier" value={SUPPORT_LABELS[quote.input.support] ?? quote.input.support} />
                                </div>
                            ) : (
                                <div className="mt-5 rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-5 py-10 text-center">
                                    <div className="text-sm text-slate-400">No evaluation terms configured yet.</div>
                                    <div className="mt-1 text-xs text-slate-500">Rights quote defines delivery mode, usage scope, geography, and escrow pricing.</div>
                                    <Link to={termsPath} className="mt-4 inline-flex rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20">
                                        Build Evaluation Terms
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Escrow & Payment Protection */}
                        <section className={panel}>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className={eyebrowCls}>Escrow & Payment Protection</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Escrow-Backed Evaluation</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Provider payout remains locked until buyer validation clears. If dataset commitments fail, dispute and refund paths activate automatically.
                                    </p>
                                </div>
                                <Link to={checkoutPath} className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20">
                                    {checkoutRecord ? 'View Escrow' : 'Open Escrow Checkout'}
                                </Link>
                            </div>

                            {checkoutRecord ? (
                                <div className="mt-5 space-y-4">
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        <InfoRow label="Escrow ID" value={checkoutRecord.escrowId} mono />
                                        <InfoRow label="Contract ID" value={checkoutRecord.contractId} mono />
                                        <InfoRow label="Escrow Hold" value={formatUsd(checkoutRecord.funding.escrowHoldUsd)} />
                                        <InfoRow label="Evaluation Fee" value={formatUsd(checkoutRecord.outcomeProtection.evaluationFeeUsd)} />
                                        <InfoRow label="Payment Method" value={PAYMENT_METHOD_LABELS[checkoutRecord.funding.paymentMethod] ?? checkoutRecord.funding.paymentMethod} />
                                        <InfoRow label="Outcome Stage" value={OUTCOME_STAGE_LABELS[checkoutRecord.outcomeProtection.stage] ?? checkoutRecord.outcomeProtection.stage} />
                                    </div>

                                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/8 px-4 py-4 text-sm leading-6 text-cyan-100/90">
                                        <span className="font-semibold text-cyan-100">Validation window: </span>
                                        {checkoutRecord.configuration.reviewWindowHours} hours from workspace handoff. Provider release is blocked until the buyer confirms evaluation commitments or the dispute window lapses without escalation.
                                    </div>

                                    {checkoutRecord.outcomeProtection.credits.status === 'issued' && (
                                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                                            <span className="font-semibold">Outcome credit issued: </span>
                                            {formatUsd(checkoutRecord.outcomeProtection.credits.amountUsd)} · {checkoutRecord.outcomeProtection.credits.reason ?? 'Policy protection triggered'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-5 rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-5 py-10 text-center">
                                    <div className="text-sm text-slate-400">Escrow not yet funded.</div>
                                    <div className="mt-1 text-xs text-slate-500">Fund the escrow hold to unlock protected evaluation access and workspace provisioning.</div>
                                    <Link to={checkoutPath} className="mt-4 inline-flex rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20">
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Credential & Workspace */}
                        <section className={panel}>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className={eyebrowCls}>Credential & Secure Workspace</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Temporary Evaluation Credential</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Short-lived credential scoped to this evaluation only. No standing access persists after expiry. Workspace access requires an active credential.
                                    </p>
                                </div>
                                {issuedCredential
                                    ? <CredentialStatusBadge status={credentialStatus ?? 'active'} />
                                    : (
                                        <span className="inline-flex rounded-full border border-slate-600/50 bg-slate-800/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Not Issued
                                        </span>
                                    )
                                }
                            </div>

                            {issuedCredential ? (
                                <div className="mt-5 space-y-4">
                                    <CredentialSummaryCard credential={issuedCredential} />
                                    {isCredentialActive && (
                                        <Link to={workspacePath} className="block w-full rounded-xl bg-emerald-500 py-3 text-center text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-400">
                                            Open Secure Workspace
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Scopes Applied on Issuance</div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {Object.keys(CREDENTIAL_SCOPE_LABELS).map(scope => (
                                                <span key={scope} className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-cyan-100">
                                                    {scope}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <button
                                            onClick={handleIssueCredential}
                                            className="rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.2)] hover:bg-cyan-400"
                                        >
                                            Issue Evaluation Credential
                                        </button>
                                        <button
                                            disabled
                                            className="cursor-not-allowed rounded-xl border border-slate-700/60 bg-slate-800/40 py-3 text-sm font-semibold text-slate-500"
                                        >
                                            Open Workspace
                                        </button>
                                    </div>
                                </div>
                            )}

                            {checkoutRecord && (
                                <div className="mt-5 grid gap-3 sm:grid-cols-2 border-t border-white/8 pt-5">
                                    <InfoRow
                                        label="Workspace Status"
                                        value={checkoutRecord.workspace.status === 'ready' ? 'Ready' : 'Planned'}
                                    />
                                    <InfoRow label="Workspace Name" value={checkoutRecord.workspace.workspaceName} />
                                    {checkoutRecord.workspace.provisionedAt && (
                                        <InfoRow label="Provisioned" value={formatTimestamp(checkoutRecord.workspace.provisionedAt)} />
                                    )}
                                    <InfoRow
                                        label="Token Window"
                                        value={`${checkoutRecord.credentials.tokenTtlMinutes} minutes`}
                                    />
                                </div>
                            )}
                        </section>

                        {/* Output Review */}
                        <section className={panel}>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className={eyebrowCls}>Output Review</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Governed Output Inspection</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        All workspace outputs pass through a governed review gate. Aggregate outputs require reviewer approval before any export can proceed.
                                    </p>
                                </div>
                                <Link to={outputReviewPath} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400/35 hover:text-cyan-100">
                                    Open Output Review
                                </Link>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <InfoRow
                                    label="Review Status"
                                    value={checkoutRecord ? (OUTCOME_STAGE_LABELS[checkoutRecord.outcomeProtection.stage] ?? checkoutRecord.outcomeProtection.stage) : 'Pending'}
                                />
                                <InfoRow
                                    label="Buyer Validation"
                                    value={
                                        checkoutRecord?.outcomeProtection.validation.status === 'confirmed' ? 'Confirmed'
                                        : checkoutRecord?.outcomeProtection.validation.status === 'issue_reported' ? 'Issue Reported'
                                        : 'Not Started'
                                    }
                                />
                                <InfoRow label="Export Gate" value="Aggregate Only" />
                                <InfoRow label="Watermarking" value="Required" />
                            </div>

                            {checkoutRecord?.outcomeProtection.engine.status !== 'not_started' && checkoutRecord && (
                                <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Outcome Protection Engine</div>
                                    <div className="mt-2 text-sm text-slate-200">{checkoutRecord.outcomeProtection.engine.summary}</div>
                                    {checkoutRecord.outcomeProtection.engine.findings.length > 0 && (
                                        <ul className="mt-3 space-y-1.5">
                                            {checkoutRecord.outcomeProtection.engine.findings.map((finding, i) => (
                                                <li key={i} className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-xs leading-5 text-amber-100">
                                                    {finding}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4 text-sm leading-6 text-slate-400">
                                No raw row-level data leaves the governed workspace. Only reviewer-approved aggregate outputs can proceed through the export gate after release validation.
                            </div>
                        </section>

                        {/* Risk, Governance & Controls */}
                        <section className={panel}>
                            <div className={eyebrowCls}>Risk, Governance & Controls</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">Evaluation Control Environment</h2>
                            <p className="mt-2 text-sm text-slate-400">
                                Governance signals applied to this protected evaluation. Amber items require action before release can proceed.
                            </p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {govControls.map(ctrl => (
                                    <div key={ctrl.label} className={`rounded-2xl border px-4 py-4 ${GOV_TONE_CLASSES[ctrl.tone]}`}>
                                        <div className="text-[11px] uppercase tracking-[0.14em] opacity-60">{ctrl.label}</div>
                                        <div className="mt-2 text-sm font-semibold">{ctrl.badge}</div>
                                        <div className="mt-2 text-xs leading-5 opacity-75">{ctrl.detail}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Activity Timeline */}
                        <section className={panel}>
                            <div className={eyebrowCls}>Evaluation Activity</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">Event History</h2>

                            <div className="mt-5">
                                {activityEvents.length > 0 ? (
                                    <div>
                                        {activityEvents.map((event, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${ACTIVITY_TONE_DOT[event.tone]}`} />
                                                    {i < activityEvents.length - 1 && (
                                                        <span className="mt-1 w-px flex-1 bg-slate-800" style={{ minHeight: '1.5rem' }} />
                                                    )}
                                                </div>
                                                <div className="pb-5 min-w-0">
                                                    <div className="text-sm font-semibold text-white">{event.title}</div>
                                                    <div className="mt-0.5 text-xs leading-5 text-slate-400">{event.detail}</div>
                                                    {event.timestamp && (
                                                        <div className="mt-0.5 text-[11px] text-slate-600">{formatTimestamp(event.timestamp)}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-500">
                                        No events recorded yet. Activity appears here as the evaluation progresses through each stage.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── Right action rail ─────────────────────────────────── */}
                    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">

                        {/* State + progress */}
                        <div className={panel}>
                            <div className={eyebrowCls}>Evaluation Status</div>
                            <div className="mt-3">
                                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${evalStateMeta.classes}`}>
                                    <span className="h-2 w-2 rounded-full bg-current" />
                                    {evalStateMeta.label}
                                </span>
                            </div>

                            {dealProgress && (
                                <>
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-xs text-slate-500">Deal Progress</div>
                                            <div className="text-sm font-semibold text-white">{dealProgress.completionPercent}%</div>
                                        </div>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 transition-all"
                                                style={{ width: `${dealProgress.completionPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/8 px-3 py-3">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-cyan-500/70">Next Action</div>
                                        <div className="mt-1.5 text-sm font-medium leading-5 text-cyan-100">{dealProgress.nextAction}</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Primary actions */}
                        <div className={panel}>
                            <div className={eyebrowCls}>Actions</div>
                            <div className="mt-3 grid gap-2">
                                {primaryAction === 'issue_credential' && (
                                    <button
                                        onClick={handleIssueCredential}
                                        className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_6px_20px_rgba(34,211,238,0.2)] hover:bg-cyan-400"
                                    >
                                        Issue Evaluation Credential
                                    </button>
                                )}
                                {primaryAction === 'open_workspace' && (
                                    <Link to={workspacePath} className="block w-full rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 shadow-[0_6px_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400">
                                        Open Secure Workspace
                                    </Link>
                                )}
                                {primaryAction === 'review_outputs' && (
                                    <Link to={outputReviewPath} className="block w-full rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 shadow-[0_6px_20px_rgba(34,211,238,0.2)] hover:bg-cyan-400">
                                        Review Outputs
                                    </Link>
                                )}
                                <Link to={datasetPath} className="block w-full rounded-xl border border-white/12 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 hover:border-white/25 hover:text-white">
                                    Back to Dataset
                                </Link>
                                <Link to={checkoutPath} className="block w-full rounded-xl border border-white/12 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 hover:border-white/25 hover:text-white">
                                    Open Escrow Checkout
                                </Link>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className={panel}>
                            <div className={eyebrowCls}>Quick Links</div>
                            <div className="mt-3 grid gap-1.5">
                                <QuickLinkRow to={datasetPath} label="Dataset Detail" />
                                <QuickLinkRow to={termsPath} label="Evaluation Terms" />
                                <QuickLinkRow to={checkoutPath} label="Escrow Checkout" />
                                <QuickLinkRow to={workspacePath} label="Secure Workspace" />
                                <QuickLinkRow to={outputReviewPath} label="Output Review" />
                                {datasetId && (
                                    <QuickLinkRow
                                        to={useDemo ? `/demo/datasets/${datasetId}/provider-packet` : `/datasets/${datasetId}/provider-packet`}
                                        label="Provider Rights Packet"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Deal identity */}
                        <div className={panel}>
                            <div className={eyebrowCls}>Deal Reference</div>
                            <div className="mt-3 grid gap-2">
                                <InfoRow label="Deal ID" value={dealRef} mono />
                                <InfoRow label="Dataset" value={datasetTitle} />
                                {quote && <InfoRow label="Quote" value={quote.id} mono />}
                                {checkoutRecord && <InfoRow label="Escrow" value={checkoutRecord.escrowId} mono />}
                                {checkoutRecord && <InfoRow label="Contract" value={checkoutRecord.contractId} mono />}
                            </div>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    )
}
