import {
    buildCompliancePassport,
    type CompliancePassport,
    type CompliancePassportStatus
} from './compliancePassport'
import {
    loadEscrowCheckouts,
    type EscrowCheckoutRecord,
    type OutcomeEngineStatus
} from './escrowCheckout'
import { loadRightsQuotes, type RightsQuote } from './rightsQuoteBuilder'

export type DealLifecycleStage =
    | 'passport_incomplete'
    | 'passport_ready'
    | 'quote_prepared'
    | 'checkout_funded'
    | 'workspace_provisioning'
    | 'evaluation_live'
    | 'awaiting_validation'
    | 'release_ready'
    | 'credited'
    | 'disputed'
    | 'released'

export type DealRiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type DealUrgencyLevel = 'normal' | 'elevated' | 'high' | 'critical'
export type DealApprovalDisposition = 'auto_advance' | 'human_review' | 'blocked'
export type DealOpsQueue =
    | 'passport_ops'
    | 'quote_governance'
    | 'checkout_ops'
    | 'evaluation_watch'
    | 'release_ops'
    | 'dispute_ops'
    | 'closed'
export type DealTriageLane =
    | 'blocked'
    | 'human_approval'
    | 'review_now'
    | 'watch'
    | 'auto_advance'

export type SharedDealLifecycleRecord = {
    id: string
    datasetId: string | null
    datasetTitle: string
    passportId: string
    quoteId: string | null
    checkoutId: string | null
    createdAt: string
    updatedAt: string
    stage: DealLifecycleStage
    risk: DealRiskLevel
    riskScore: number
    urgency: DealUrgencyLevel
    urgencyScore: number
    approvalDisposition: DealApprovalDisposition
    requiresHumanApproval: boolean
    queue: DealOpsQueue
    recommendedOwner: string
    blockerCount: number
    blockers: string[]
    signals: string[]
    nextAction: string
    passportStatus: CompliancePassportStatus
    passportCompletionPercent: number
    quoteRiskBand: RightsQuote['riskBand'] | null
    checkoutLifecycleState: EscrowCheckoutRecord['lifecycleState'] | null
    engineStatus: OutcomeEngineStatus | null
    reviewWindowHours: number | null
    outcomeCreditUsd: number
    triageLane: DealTriageLane
    triageScore: number
    triageReason: string
    triageSla: string
    source: {
        passport: CompliancePassport
        quote?: RightsQuote | null
        checkoutRecord?: EscrowCheckoutRecord | null
    }
}

export type DealLifecycleSummary = {
    activePassportCount: number
    quotePreparedCount: number
    fundedCheckoutCount: number
    workspacesProvisioningCount: number
    evaluationLiveCount: number
    releaseBacklogCount: number
    enginePassCount: number
    engineFailureCount: number
    autoCreditCount: number
    blockedCount: number
    humanReviewCount: number
    stageCounts: Record<DealLifecycleStage, number>
    queueCounts: Record<DealOpsQueue, number>
    priorityQueue: SharedDealLifecycleRecord[]
}

export type DealTriageSummary = {
    laneCounts: Record<DealTriageLane, number>
    lanes: Record<DealTriageLane, SharedDealLifecycleRecord[]>
    actionableQueue: SharedDealLifecycleRecord[]
    automatedCount: number
    manualCount: number
    blockedCount: number
}

type BuildSharedDealLifecycleInput = {
    passport: CompliancePassport
    quote?: RightsQuote | null
    checkoutRecord?: EscrowCheckoutRecord | null
}

const emptyStageCounts = (): Record<DealLifecycleStage, number> => ({
    passport_incomplete: 0,
    passport_ready: 0,
    quote_prepared: 0,
    checkout_funded: 0,
    workspace_provisioning: 0,
    evaluation_live: 0,
    awaiting_validation: 0,
    release_ready: 0,
    credited: 0,
    disputed: 0,
    released: 0
})

const emptyQueueCounts = (): Record<DealOpsQueue, number> => ({
    passport_ops: 0,
    quote_governance: 0,
    checkout_ops: 0,
    evaluation_watch: 0,
    release_ops: 0,
    dispute_ops: 0,
    closed: 0
})

const emptyTriageLaneCounts = (): Record<DealTriageLane, number> => ({
    blocked: 0,
    human_approval: 0,
    review_now: 0,
    watch: 0,
    auto_advance: 0
})

const stagePriority: Record<DealLifecycleStage, number> = {
    passport_incomplete: 1,
    passport_ready: 2,
    quote_prepared: 3,
    checkout_funded: 4,
    workspace_provisioning: 5,
    evaluation_live: 6,
    awaiting_validation: 7,
    release_ready: 8,
    credited: 9,
    disputed: 10,
    released: 11
}

export const dealLifecycleStageMeta: Record<
    DealLifecycleStage,
    { label: string; detail: string; tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'red' }
> = {
    passport_incomplete: {
        label: 'Passport Incomplete',
        detail: 'Identity, legal, or verification coverage is still incomplete.',
        tone: 'amber'
    },
    passport_ready: {
        label: 'Passport Ready',
        detail: 'Reusable compliance context is ready, but no rights package has been created yet.',
        tone: 'slate'
    },
    quote_prepared: {
        label: 'Quote Prepared',
        detail: 'Rights package exists and is waiting to move into checkout.',
        tone: 'cyan'
    },
    checkout_funded: {
        label: 'Checkout Funded',
        detail: 'Escrow is funded and the governed transaction has started.',
        tone: 'cyan'
    },
    workspace_provisioning: {
        label: 'Workspace Provisioning',
        detail: 'Workspace or credentials still need to be provisioned before evaluation can begin.',
        tone: 'amber'
    },
    evaluation_live: {
        label: 'Evaluation Live',
        detail: 'Protected evaluation is active and the outcome engine is monitoring commitments.',
        tone: 'cyan'
    },
    awaiting_validation: {
        label: 'Awaiting Validation',
        detail: 'Engine passed and buyer validation is the next release gate.',
        tone: 'amber'
    },
    release_ready: {
        label: 'Release Ready',
        detail: 'Buyer validation is complete and the deal can move into release.',
        tone: 'emerald'
    },
    credited: {
        label: 'Credited',
        detail: 'Outcome protection issued automatic credits and payout remains frozen.',
        tone: 'red'
    },
    disputed: {
        label: 'Disputed',
        detail: 'Deal is blocked for manual review or dispute resolution.',
        tone: 'red'
    },
    released: {
        label: 'Released',
        detail: 'Provider payout completed successfully.',
        tone: 'emerald'
    }
}

export const dealRiskMeta: Record<
    DealRiskLevel,
    { label: string; tone: 'slate' | 'amber' | 'red' }
> = {
    low: { label: 'Low Risk', tone: 'slate' },
    medium: { label: 'Medium Risk', tone: 'amber' },
    high: { label: 'High Risk', tone: 'red' },
    critical: { label: 'Critical Risk', tone: 'red' }
}

export const dealUrgencyMeta: Record<
    DealUrgencyLevel,
    { label: string; tone: 'slate' | 'amber' | 'red' }
> = {
    normal: { label: 'Normal', tone: 'slate' },
    elevated: { label: 'Elevated', tone: 'amber' },
    high: { label: 'High', tone: 'red' },
    critical: { label: 'Critical', tone: 'red' }
}

export const dealTriageMeta: Record<
    DealTriageLane,
    { label: string; detail: string; tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'red' }
> = {
    blocked: {
        label: 'Blocked',
        detail: 'Deal cannot progress without manual intervention or remediation.',
        tone: 'red'
    },
    human_approval: {
        label: 'Human Approval',
        detail: 'High-sensitivity terms require manual approval before the deal can continue.',
        tone: 'amber'
    },
    review_now: {
        label: 'Review Now',
        detail: 'Urgent deal state needs same-day operator attention.',
        tone: 'cyan'
    },
    watch: {
        label: 'Watch',
        detail: 'Deal is healthy enough to continue, but it should stay visible in monitoring lanes.',
        tone: 'slate'
    },
    auto_advance: {
        label: 'Auto-Advance',
        detail: 'Signals are within policy thresholds and no manual action is currently required.',
        tone: 'emerald'
    }
}

const parseDateSafe = (value?: string | null) => {
    if (!value) return Number.NaN
    return Date.parse(value)
}

const hoursUntil = (value?: string | null) => {
    const timestamp = parseDateSafe(value)
    if (Number.isNaN(timestamp)) return Number.POSITIVE_INFINITY
    return (timestamp - Date.now()) / (1000 * 60 * 60)
}

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)))

const hasStrictRightsPattern = (quote: RightsQuote) =>
    quote.input.deliveryMode === 'encrypted_download' ||
    quote.input.fieldPack === 'sensitive_review' ||
    quote.input.exclusivity !== 'none' ||
    quote.input.geography === 'global' ||
    quote.input.usageRight === 'customer_facing'

const deriveDealLifecycleStage = (
    passport: CompliancePassport,
    quote?: RightsQuote | null,
    checkoutRecord?: EscrowCheckoutRecord | null
): DealLifecycleStage => {
    if (!quote && !checkoutRecord) {
        return passport.status === 'incomplete' ? 'passport_incomplete' : 'passport_ready'
    }

    if (!checkoutRecord) return 'quote_prepared'
    if (checkoutRecord.lifecycleState === 'RELEASED_TO_PROVIDER') return 'released'
    if (checkoutRecord.outcomeProtection.credits.status === 'issued') return 'credited'
    if (checkoutRecord.lifecycleState === 'DISPUTE_OPEN') return 'disputed'
    if (
        checkoutRecord.outcomeProtection.validation.status === 'confirmed' ||
        checkoutRecord.lifecycleState === 'RELEASE_PENDING'
    ) {
        return 'release_ready'
    }
    if (checkoutRecord.outcomeProtection.engine.status === 'passed') return 'awaiting_validation'
    if (checkoutRecord.credentials.status === 'issued') return 'evaluation_live'
    if (checkoutRecord.workspace.status === 'ready') return 'workspace_provisioning'
    return 'checkout_funded'
}

const buildSignals = (
    passport: CompliancePassport,
    quote?: RightsQuote | null,
    checkoutRecord?: EscrowCheckoutRecord | null
) => {
    const signals: string[] = []

    if (passport.status !== 'active') {
        signals.push(
            passport.status === 'review'
                ? 'Passport still has review follow-up.'
                : 'Passport is incomplete and weakens reuse.'
        )
    }

    if (quote) {
        signals.push(`Quote ${quote.id} is ${quote.riskBand}.`)
        if (quote.passportApplied) {
            signals.push(`Passport discount applied to ${quote.id}.`)
        }
        if (hasStrictRightsPattern(quote)) {
            signals.push('Rights package contains higher-sensitivity commercial terms.')
        }
        if (hoursUntil(quote.expiresAt) <= 24) {
            signals.push('Quote expiry is within 24 hours.')
        }
    }

    if (checkoutRecord) {
        signals.push(`Escrow ${checkoutRecord.escrowId} is ${checkoutRecord.lifecycleState}.`)

        if (checkoutRecord.workspace.status !== 'ready') {
            signals.push('Workspace provisioning is still pending.')
        }
        if (checkoutRecord.credentials.status !== 'issued') {
            signals.push('Scoped credentials are not yet active.')
        }
        if (checkoutRecord.outcomeProtection.engine.status === 'passed') {
            signals.push('Outcome engine passed its current checks.')
        }
        if (checkoutRecord.outcomeProtection.engine.status === 'failed') {
            signals.push('Outcome engine failed and payout is frozen.')
        }
        if (hoursUntil(checkoutRecord.credentials.expiresAt) <= 12) {
            signals.push('Current scoped credentials expire within 12 hours.')
        }
        if (checkoutRecord.outcomeProtection.credits.status === 'issued') {
            signals.push(
                `Automatic credit of ${checkoutRecord.outcomeProtection.credits.amountUsd.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                })} issued.`
            )
        }
    }

    return unique(signals)
}

const buildBlockers = (
    stage: DealLifecycleStage,
    passport: CompliancePassport,
    quote?: RightsQuote | null,
    checkoutRecord?: EscrowCheckoutRecord | null
) => {
    const blockers: string[] = []

    if (passport.status === 'incomplete') {
        blockers.push('Passport completion is below the reusable threshold.')
    }

    if (!quote) {
        blockers.push('No rights quote has been saved yet.')
    }

    if (!checkoutRecord && quote) {
        blockers.push('Escrow-native checkout has not started.')
    }

    if (checkoutRecord) {
        if (checkoutRecord.workspace.status !== 'ready') {
            blockers.push('Workspace still needs provisioning.')
        }
        if (checkoutRecord.credentials.status !== 'issued') {
            blockers.push('Scoped credentials still need to be issued.')
        }
        if (checkoutRecord.outcomeProtection.engine.status === 'failed') {
            blockers.push('Outcome engine detected a commitment miss.')
        }
        if (checkoutRecord.outcomeProtection.validation.status === 'pending' && stage === 'awaiting_validation') {
            blockers.push('Buyer validation is still pending.')
        }
        if (checkoutRecord.lifecycleState === 'RELEASE_PENDING') {
            blockers.push('Escrow is waiting for final payout release.')
        }
        if (checkoutRecord.lifecycleState === 'DISPUTE_OPEN') {
            blockers.push('Dispute resolution is required before release.')
        }
    }

    if (stage === 'released') return []

    return unique(blockers)
}

const deriveRiskScore = (
    passport: CompliancePassport,
    quote?: RightsQuote | null,
    checkoutRecord?: EscrowCheckoutRecord | null
) => {
    let score = 12

    if (passport.status === 'review') score += 10
    if (passport.status === 'incomplete') score += 22

    if (quote) {
        if (quote.riskBand === 'heightened') score += 16
        if (quote.riskBand === 'strict') score += 28
        if (quote.input.deliveryMode === 'encrypted_download') score += 14
        if (quote.input.fieldPack === 'sensitive_review') score += 12
        if (quote.input.usageRight === 'customer_facing') score += 12
        if (quote.input.geography === 'global') score += 8
        if (quote.input.exclusivity === 'regional') score += 8
        if (quote.input.exclusivity === 'full') score += 14
    }

    if (checkoutRecord) {
        if (checkoutRecord.configuration.accessMode === 'encrypted_download') score += 10
        if (checkoutRecord.outcomeProtection.engine.status === 'failed') score += 28
        if (checkoutRecord.lifecycleState === 'DISPUTE_OPEN') score += 22
        if (checkoutRecord.outcomeProtection.credits.status === 'issued') score += 20
    }

    return Math.min(score, 100)
}

const deriveRiskLevel = (score: number): DealRiskLevel => {
    if (score >= 75) return 'critical'
    if (score >= 55) return 'high'
    if (score >= 30) return 'medium'
    return 'low'
}

const deriveUrgencyScore = (
    stage: DealLifecycleStage,
    quote?: RightsQuote | null,
    checkoutRecord?: EscrowCheckoutRecord | null
) => {
    let score = 10

    if (stage === 'checkout_funded') score += 18
    if (stage === 'workspace_provisioning') score += 24
    if (stage === 'evaluation_live') score += 22
    if (stage === 'awaiting_validation') score += 28
    if (stage === 'release_ready') score += 36
    if (stage === 'credited' || stage === 'disputed') score += 45

    if (quote && hoursUntil(quote.expiresAt) <= 24) score += 18
    if (checkoutRecord && checkoutRecord.configuration.reviewWindowHours <= 24) score += 10
    if (checkoutRecord && hoursUntil(checkoutRecord.credentials.expiresAt) <= 12) score += 20

    return Math.min(score, 100)
}

const deriveUrgencyLevel = (score: number): DealUrgencyLevel => {
    if (score >= 75) return 'critical'
    if (score >= 55) return 'high'
    if (score >= 30) return 'elevated'
    return 'normal'
}

const deriveApprovalDisposition = (
    stage: DealLifecycleStage,
    passport: CompliancePassport,
    quote?: RightsQuote | null,
    checkoutRecord?: EscrowCheckoutRecord | null
): DealApprovalDisposition => {
    if (
        passport.status === 'incomplete' ||
        stage === 'credited' ||
        stage === 'disputed' ||
        checkoutRecord?.outcomeProtection.engine.status === 'failed'
    ) {
        return 'blocked'
    }

    if (
        passport.status === 'review' ||
        quote?.riskBand === 'strict' ||
        quote?.input.exclusivity !== 'none' ||
        quote?.input.usageRight === 'customer_facing' ||
        quote?.input.geography === 'global'
    ) {
        return 'human_review'
    }

    return 'auto_advance'
}

const deriveQueue = (
    stage: DealLifecycleStage,
    approvalDisposition: DealApprovalDisposition
): DealOpsQueue => {
    if (stage === 'released') return 'closed'
    if (stage === 'credited' || stage === 'disputed') return 'dispute_ops'
    if (stage === 'release_ready' || stage === 'awaiting_validation') return 'release_ops'
    if (stage === 'evaluation_live') return 'evaluation_watch'
    if (stage === 'checkout_funded' || stage === 'workspace_provisioning') return 'checkout_ops'
    if (stage === 'passport_incomplete' || stage === 'passport_ready') return 'passport_ops'
    if (approvalDisposition === 'human_review' || stage === 'quote_prepared') return 'quote_governance'
    return 'quote_governance'
}

const recommendedOwnerForQueue = (queue: DealOpsQueue) => {
    switch (queue) {
        case 'passport_ops':
            return 'Trust operations'
        case 'quote_governance':
            return 'Rights governance'
        case 'checkout_ops':
            return 'Deal operations'
        case 'evaluation_watch':
            return 'Outcome monitoring'
        case 'release_ops':
            return 'Settlement operations'
        case 'dispute_ops':
            return 'Escalations desk'
        default:
            return 'Archive'
    }
}

const buildNextAction = (
    stage: DealLifecycleStage,
    approvalDisposition: DealApprovalDisposition,
    blockers: string[]
) => {
    if (approvalDisposition === 'blocked' && blockers.length > 0) {
        return blockers[0]
    }

    switch (stage) {
        case 'passport_incomplete':
            return 'Complete identity, legal, and verification sections before reusing the passport.'
        case 'passport_ready':
            return 'Create a rights package so the deal can enter pricing and governance.'
        case 'quote_prepared':
            return 'Move the quoted rights package into escrow-native checkout.'
        case 'checkout_funded':
            return 'Provision the governed workspace and prepare scoped credentials.'
        case 'workspace_provisioning':
            return 'Finish workspace setup and issue credentials so paid evaluation can start.'
        case 'evaluation_live':
            return 'Let the outcome engine finish monitoring the protected evaluation.'
        case 'awaiting_validation':
            return 'Collect buyer validation so payout can move into release readiness.'
        case 'release_ready':
            return 'Release escrow or hold for a final manual settlement review.'
        case 'credited':
            return 'Review the outcome miss, confirm credits, and decide whether to reopen or close.'
        case 'disputed':
            return 'Investigate the dispute packet and decide on remediation or release freeze.'
        case 'released':
            return 'No action required. Deal is closed and archived.'
        default:
            return 'Review the current deal state.'
    }
}

const deriveTriageScore = (
    stage: DealLifecycleStage,
    riskScore: number,
    urgencyScore: number,
    approvalDisposition: DealApprovalDisposition,
    blockers: string[]
) => {
    let score = urgencyScore + Math.round(riskScore * 0.6) + blockers.length * 8

    if (approvalDisposition === 'human_review') score += 14
    if (approvalDisposition === 'blocked') score += 24
    if (stage === 'release_ready') score += 12
    if (stage === 'awaiting_validation') score += 8

    return Math.min(score, 100)
}

const deriveTriageLane = (
    stage: DealLifecycleStage,
    risk: DealRiskLevel,
    urgency: DealUrgencyLevel,
    approvalDisposition: DealApprovalDisposition
): DealTriageLane => {
    if (approvalDisposition === 'blocked' || stage === 'credited' || stage === 'disputed') {
        return 'blocked'
    }

    if (approvalDisposition === 'human_review') return 'human_approval'

    if (
        stage === 'release_ready' ||
        stage === 'awaiting_validation' ||
        urgency === 'critical' ||
        (urgency === 'high' && risk !== 'low')
    ) {
        return 'review_now'
    }

    if (
        stage === 'quote_prepared' ||
        stage === 'checkout_funded' ||
        stage === 'workspace_provisioning' ||
        stage === 'evaluation_live' ||
        urgency === 'elevated' ||
        risk === 'medium' ||
        risk === 'high'
    ) {
        return 'watch'
    }

    return 'auto_advance'
}

const buildTriageReason = (
    lane: DealTriageLane,
    stage: DealLifecycleStage,
    blockers: string[],
    quote?: RightsQuote | null,
    checkoutRecord?: EscrowCheckoutRecord | null
) => {
    if (lane === 'blocked') {
        return blockers[0] ?? 'Deal is policy-blocked until a human resolves the active issue.'
    }

    if (lane === 'human_approval') {
        if (quote?.input.exclusivity !== 'none') return 'Exclusivity terms require manual approval.'
        if (quote?.input.usageRight === 'customer_facing') return 'Customer-facing usage rights require manual approval.'
        if (quote?.input.geography === 'global') return 'Global rights package requires manual approval.'
        return 'Risky commercial terms require manual approval before the next step.'
    }

    if (lane === 'review_now') {
        if (stage === 'release_ready') return 'Buyer validation is complete and release is now in the payout window.'
        if (stage === 'awaiting_validation') return 'Engine passed and buyer validation should be chased now.'
        if (checkoutRecord?.configuration.reviewWindowHours === 24) {
            return 'Short review window keeps this deal in the same-day review lane.'
        }
        return 'High urgency signals pushed this deal into immediate operator review.'
    }

    if (lane === 'watch') {
        if (stage === 'evaluation_live') return 'Protected evaluation is active and should remain visible while the engine runs.'
        if (stage === 'workspace_provisioning') return 'Provisioning is still in flight and should stay in the watch lane.'
        if (stage === 'quote_prepared') return 'Quoted deal is ready for the next step but does not need immediate intervention.'
        return 'Signals are stable, but the deal should remain in active monitoring.'
    }

    return 'Deal can continue automatically because the current signals are within policy thresholds.'
}

const buildTriageSla = (lane: DealTriageLane, urgency: DealUrgencyLevel) => {
    if (lane === 'blocked') return 'Immediate'
    if (lane === 'human_approval') return urgency === 'high' || urgency === 'critical' ? '4 hours' : 'Today'
    if (lane === 'review_now') return urgency === 'critical' ? '2 hours' : '4 hours'
    if (lane === 'watch') return 'Monitor today'
    return 'No manual SLA'
}

const buildRecordId = (
    passport: CompliancePassport,
    quote?: RightsQuote | null,
    checkoutRecord?: EscrowCheckoutRecord | null
) => checkoutRecord?.id ?? quote?.id ?? passport.passportId

export const buildSharedDealLifecycleRecord = ({
    passport,
    quote,
    checkoutRecord
}: BuildSharedDealLifecycleInput): SharedDealLifecycleRecord => {
    const stage = deriveDealLifecycleStage(passport, quote, checkoutRecord)
    const riskScore = deriveRiskScore(passport, quote, checkoutRecord)
    const risk = deriveRiskLevel(riskScore)
    const urgencyScore = deriveUrgencyScore(stage, quote, checkoutRecord)
    const urgency = deriveUrgencyLevel(urgencyScore)
    const approvalDisposition = deriveApprovalDisposition(stage, passport, quote, checkoutRecord)
    const blockers = buildBlockers(stage, passport, quote, checkoutRecord)
    const queue = deriveQueue(stage, approvalDisposition)
    const triageScore = deriveTriageScore(stage, riskScore, urgencyScore, approvalDisposition, blockers)
    const triageLane = deriveTriageLane(stage, risk, urgency, approvalDisposition)

    return {
        id: buildRecordId(passport, quote, checkoutRecord),
        datasetId: checkoutRecord?.datasetId ?? quote?.datasetId ?? null,
        datasetTitle: checkoutRecord?.datasetTitle ?? quote?.datasetTitle ?? 'Passport Intake',
        passportId: passport.passportId,
        quoteId: quote?.id ?? checkoutRecord?.quoteId ?? null,
        checkoutId: checkoutRecord?.id ?? null,
        createdAt: checkoutRecord?.createdAt ?? quote?.createdAt ?? passport.issuedAt,
        updatedAt: checkoutRecord?.updatedAt ?? quote?.createdAt ?? passport.issuedAt,
        stage,
        risk,
        riskScore,
        urgency,
        urgencyScore,
        approvalDisposition,
        requiresHumanApproval: approvalDisposition !== 'auto_advance',
        queue,
        recommendedOwner: recommendedOwnerForQueue(queue),
        blockerCount: blockers.length,
        blockers,
        signals: buildSignals(passport, quote, checkoutRecord),
        nextAction: buildNextAction(stage, approvalDisposition, blockers),
        passportStatus: passport.status,
        passportCompletionPercent: passport.completionPercent,
        quoteRiskBand: quote?.riskBand ?? null,
        checkoutLifecycleState: checkoutRecord?.lifecycleState ?? null,
        engineStatus: checkoutRecord?.outcomeProtection.engine.status ?? null,
        reviewWindowHours: checkoutRecord?.configuration.reviewWindowHours ?? quote?.input.validationWindowHours ?? null,
        outcomeCreditUsd: checkoutRecord?.outcomeProtection.credits.amountUsd ?? 0,
        triageLane,
        triageScore,
        triageReason: buildTriageReason(triageLane, stage, blockers, quote, checkoutRecord),
        triageSla: buildTriageSla(triageLane, urgency),
        source: {
            passport,
            quote,
            checkoutRecord
        }
    }
}

export const loadSharedDealLifecycleRecords = () => {
    const passport = buildCompliancePassport()
    const quotes = loadRightsQuotes()
    const checkoutRecords = loadEscrowCheckouts()
    const checkoutByQuoteId = new Map(checkoutRecords.map(record => [record.quoteId, record]))

    const records = quotes.map(quote =>
        buildSharedDealLifecycleRecord({
            passport,
            quote,
            checkoutRecord: checkoutByQuoteId.get(quote.id) ?? null
        })
    )

    const orphanCheckouts = checkoutRecords
        .filter(record => !quotes.some(quote => quote.id === record.quoteId))
        .map(record =>
            buildSharedDealLifecycleRecord({
                passport,
                quote: null,
                checkoutRecord: record
            })
        )

    if (records.length === 0 && orphanCheckouts.length === 0) {
        return [buildSharedDealLifecycleRecord({ passport })]
    }

    return [...records, ...orphanCheckouts].sort((left, right) => {
        if (right.urgencyScore !== left.urgencyScore) return right.urgencyScore - left.urgencyScore
        if (right.riskScore !== left.riskScore) return right.riskScore - left.riskScore
        if (stagePriority[right.stage] !== stagePriority[left.stage]) {
            return stagePriority[right.stage] - stagePriority[left.stage]
        }
        return parseDateSafe(right.updatedAt) - parseDateSafe(left.updatedAt)
    })
}

export const buildDealLifecycleSummary = (
    records: SharedDealLifecycleRecord[]
): DealLifecycleSummary => {
    const stageCounts = emptyStageCounts()
    const queueCounts = emptyQueueCounts()

    records.forEach(record => {
        stageCounts[record.stage] += 1
        queueCounts[record.queue] += 1
    })

    return {
        activePassportCount: records.some(record => record.passportStatus !== 'incomplete') ? 1 : 0,
        quotePreparedCount: stageCounts.quote_prepared,
        fundedCheckoutCount: records.filter(record => record.checkoutId !== null).length,
        workspacesProvisioningCount: stageCounts.workspace_provisioning + stageCounts.checkout_funded,
        evaluationLiveCount: stageCounts.evaluation_live,
        releaseBacklogCount: stageCounts.awaiting_validation + stageCounts.release_ready,
        enginePassCount: records.filter(record => record.engineStatus === 'passed').length,
        engineFailureCount: records.filter(record => record.engineStatus === 'failed').length,
        autoCreditCount: records.filter(record => record.outcomeCreditUsd > 0).length,
        blockedCount: records.filter(record => record.approvalDisposition === 'blocked').length,
        humanReviewCount: records.filter(record => record.approvalDisposition === 'human_review').length,
        stageCounts,
        queueCounts,
        priorityQueue: [...records].sort((left, right) => {
            if (right.urgencyScore !== left.urgencyScore) return right.urgencyScore - left.urgencyScore
            if (right.riskScore !== left.riskScore) return right.riskScore - left.riskScore
            return parseDateSafe(right.updatedAt) - parseDateSafe(left.updatedAt)
        })
    }
}

export const buildDealTriageSummary = (
    records: SharedDealLifecycleRecord[]
): DealTriageSummary => {
    const laneCounts = emptyTriageLaneCounts()
    const lanes: Record<DealTriageLane, SharedDealLifecycleRecord[]> = {
        blocked: [],
        human_approval: [],
        review_now: [],
        watch: [],
        auto_advance: []
    }

    records.forEach(record => {
        laneCounts[record.triageLane] += 1
        lanes[record.triageLane].push(record)
    })

    const sortLane = (items: SharedDealLifecycleRecord[]) =>
        [...items].sort((left, right) => {
            if (right.triageScore !== left.triageScore) return right.triageScore - left.triageScore
            if (right.urgencyScore !== left.urgencyScore) return right.urgencyScore - left.urgencyScore
            return parseDateSafe(right.updatedAt) - parseDateSafe(left.updatedAt)
        })

    return {
        laneCounts,
        lanes: {
            blocked: sortLane(lanes.blocked),
            human_approval: sortLane(lanes.human_approval),
            review_now: sortLane(lanes.review_now),
            watch: sortLane(lanes.watch),
            auto_advance: sortLane(lanes.auto_advance)
        },
        actionableQueue: sortLane(
            records.filter(record => record.triageLane !== 'auto_advance' && record.triageLane !== 'watch')
        ),
        automatedCount: laneCounts.auto_advance,
        manualCount: laneCounts.human_approval + laneCounts.review_now,
        blockedCount: laneCounts.blocked
    }
}

export const getDealLifecycleSummary = () =>
    buildDealLifecycleSummary(loadSharedDealLifecycleRecords())

export const getDealTriageSummary = () =>
    buildDealTriageSummary(loadSharedDealLifecycleRecords())
