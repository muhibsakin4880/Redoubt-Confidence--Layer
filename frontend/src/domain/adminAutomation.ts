import {
    loadSharedDealLifecycleRecords,
    type SharedDealLifecycleRecord
} from './dealLifecycle'

export type OutcomeAlertSeverity = 'critical' | 'high' | 'medium'
export type TokenDealStage = 'evaluation' | 'validated' | 'frozen' | 'released'
export type TokenControlState = 'planned' | 'active' | 'expiring' | 'frozen' | 'revoked'
export type AuditDigestTone = 'ok' | 'warn'
export type DisputePrepSeverity = 'high' | 'medium'
export type DisputeEvidenceStatus = 'ready' | 'warning' | 'missing'

export type OutcomeEngineAlertGroup = {
    id: string
    provider: string
    dataset: string
    severity: OutcomeAlertSeverity
    failureCount: number
    frozenDeals: number
    repeatOffender: boolean
    falsePositiveCandidate: boolean
    summary: string
    findings: string[]
    recommendedAction: string
}

export type OutcomeEngineAlertSummary = {
    totalFailureGroups: number
    frozenDealCount: number
    repeatOffenderCount: number
    falsePositiveCandidateCount: number
    groups: OutcomeEngineAlertGroup[]
}

export type TokenControlRow = {
    tokenId: string
    participant: string
    dataset: string
    issued: string
    expires: string
    scope: string
    dealStage: TokenDealStage
    stageLabel: string
    controlState: TokenControlState
    stateLabel: string
    autoAction: string
    controlReason: string
    anomalyFlag: boolean
}

export type TokenRevocationRow = {
    tokenId: string
    participant: string
    reason: string
    revokedBy: string
    timestamp: string
}

export type TokenControlSummary = {
    rows: TokenControlRow[]
    anomalyRows: TokenControlRow[]
    revocations: TokenRevocationRow[]
    dealStageCounts: Record<TokenDealStage, number>
    controlStateCounts: Record<TokenControlState, number>
}

export type AuditDigestCard = {
    label: string
    value: string
    detail: string
}

export type AuditDigestHighlight = {
    title: string
    detail: string
}

export type AuditDigestEvent = {
    timestamp: string
    event: string
    participant: string
    dataset: string
    purpose: string
    status: string
    hash: string
    verified: boolean
    tone: AuditDigestTone
}

export type AuditDigestSummary = {
    cards: AuditDigestCard[]
    highlights: AuditDigestHighlight[]
    events: AuditDigestEvent[]
    flaggedCount: number
}

export type DisputePrepEvidenceItem = {
    label: string
    status: DisputeEvidenceStatus
    detail: string
}

export type DisputePrepPacket = {
    id: string
    escrowId: string
    dataset: string
    buyer: string
    provider: string
    amountUsd: number
    severity: DisputePrepSeverity
    summary: string
    evidence: DisputePrepEvidenceItem[]
    recommendedActions: string[]
    nextAction: string
}

export type DisputePrepSummary = {
    packets: DisputePrepPacket[]
    highSeverityCount: number
    pendingEvidenceCount: number
    refundRecommendedCount: number
}

const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
})

const toUtcLabel = (value?: string) => {
    if (!value || Number.isNaN(Date.parse(value))) return 'Pending'
    return `${new Date(value).toISOString().replace('T', ' ').substring(0, 16)} UTC`
}

const buildHash = (input: string) => {
    let hash = 0
    for (let index = 0; index < input.length; index += 1) {
        hash = (hash * 33 + input.charCodeAt(index)) >>> 0
    }
    return hash.toString(16).toUpperCase().padStart(8, '0')
}

const severityRank: Record<OutcomeAlertSeverity, number> = {
    critical: 3,
    high: 2,
    medium: 1
}

const stageOrder: Record<TokenDealStage, number> = {
    frozen: 4,
    validated: 3,
    evaluation: 2,
    released: 1
}

const hoursUntil = (value?: string) => {
    if (!value || Number.isNaN(Date.parse(value))) return Number.POSITIVE_INFINITY
    return (Date.parse(value) - Date.now()) / (1000 * 60 * 60)
}

const getRecordProvider = (record: SharedDealLifecycleRecord) =>
    record.source.checkoutRecord?.providerLabel ?? 'unknown_provider'

const getIssueTypes = (record: SharedDealLifecycleRecord) =>
    record.source.checkoutRecord?.outcomeProtection.validation.issueTypes ?? []

const isFalsePositiveCandidate = (record: SharedDealLifecycleRecord) => {
    const checkout = record.source.checkoutRecord
    if (!checkout || record.engineStatus !== 'failed') return false
    const issueTypes = checkout.outcomeProtection.validation.issueTypes
    if (issueTypes.length !== 1 || issueTypes[0] !== 'freshness_miss') return false

    const actualScore = checkout.outcomeProtection.engine.actualFreshnessScore
    const floor = checkout.outcomeProtection.commitments.confidenceFloor
    if (actualScore == null) return false
    return actualScore + 2 >= floor
}

const getOutcomeSeverity = (
    failureCount: number,
    repeatOffender: boolean,
    falsePositiveCandidate: boolean
): OutcomeAlertSeverity => {
    if (repeatOffender && failureCount > 1) return 'critical'
    if (!falsePositiveCandidate && failureCount >= 1) return 'high'
    return 'medium'
}

export const buildOutcomeEngineAlertSummary = (
    records: SharedDealLifecycleRecord[]
): OutcomeEngineAlertSummary => {
    const failingRecords = records.filter(record =>
        record.engineStatus === 'failed' || record.stage === 'credited' || record.stage === 'disputed'
    )

    const providerFailureCounts = new Map<string, number>()
    failingRecords.forEach(record => {
        const provider = getRecordProvider(record)
        providerFailureCounts.set(provider, (providerFailureCounts.get(provider) ?? 0) + 1)
    })

    const grouped = new Map<string, OutcomeEngineAlertGroup>()

    failingRecords.forEach(record => {
        const checkout = record.source.checkoutRecord
        if (!checkout) return

        const provider = checkout.providerLabel
        const key = `${provider}::${record.datasetTitle}`
        const existing = grouped.get(key)
        const repeatOffender = (providerFailureCounts.get(provider) ?? 0) > 1
        const falsePositiveCandidate = isFalsePositiveCandidate(record)
        const findings = checkout.outcomeProtection.engine.findings.length
            ? checkout.outcomeProtection.engine.findings
            : [checkout.outcomeProtection.engine.summary]

        if (existing) {
            existing.failureCount += 1
            existing.frozenDeals += record.triageLane === 'blocked' ? 1 : 0
            existing.repeatOffender = existing.repeatOffender || repeatOffender
            existing.falsePositiveCandidate = existing.falsePositiveCandidate && falsePositiveCandidate
            existing.findings = Array.from(new Set([...existing.findings, ...findings])).slice(0, 4)
            existing.severity = getOutcomeSeverity(
                existing.failureCount,
                existing.repeatOffender,
                existing.falsePositiveCandidate
            )
            existing.summary = existing.repeatOffender
                ? 'Multiple protected deals failed for the same provider and should stay grouped for response.'
                : existing.falsePositiveCandidate
                    ? 'Failure pattern looks close to tolerance and may be a false positive candidate.'
                    : 'Outcome engine froze this grouped provider/dataset pair after protected deal failure.'
            existing.recommendedAction = existing.falsePositiveCandidate
                ? 'Review tolerance drift and provider freshness evidence before escalating.'
                : existing.repeatOffender
                    ? 'Escalate provider review and keep current deals frozen until remediation is verified.'
                    : 'Review the evidence chain and decide whether to credit, remediate, or freeze.'
            return
        }

        grouped.set(key, {
            id: buildHash(key),
            provider,
            dataset: record.datasetTitle,
            severity: getOutcomeSeverity(1, repeatOffender, falsePositiveCandidate),
            failureCount: 1,
            frozenDeals: record.triageLane === 'blocked' ? 1 : 0,
            repeatOffender,
            falsePositiveCandidate,
            summary: repeatOffender
                ? 'Multiple protected deals failed for the same provider and should stay grouped for response.'
                : falsePositiveCandidate
                    ? 'Failure pattern looks close to tolerance and may be a false positive candidate.'
                    : 'Outcome engine froze this grouped provider/dataset pair after protected deal failure.',
            findings: findings.slice(0, 4),
            recommendedAction: falsePositiveCandidate
                ? 'Review tolerance drift and provider freshness evidence before escalating.'
                : repeatOffender
                    ? 'Escalate provider review and keep current deals frozen until remediation is verified.'
                    : 'Review the evidence chain and decide whether to credit, remediate, or freeze.'
        })
    })

    const groups = [...grouped.values()].sort((left, right) => {
        if (severityRank[right.severity] !== severityRank[left.severity]) {
            return severityRank[right.severity] - severityRank[left.severity]
        }
        return right.failureCount - left.failureCount
    })

    return {
        totalFailureGroups: groups.length,
        frozenDealCount: groups.reduce((sum, group) => sum + group.frozenDeals, 0),
        repeatOffenderCount: groups.filter(group => group.repeatOffender).length,
        falsePositiveCandidateCount: groups.filter(group => group.falsePositiveCandidate).length,
        groups
    }
}

const getTokenDealStage = (record: SharedDealLifecycleRecord): TokenDealStage => {
    if (record.stage === 'credited' || record.stage === 'disputed') return 'frozen'
    if (record.stage === 'released') return 'released'
    if (record.stage === 'awaiting_validation' || record.stage === 'release_ready') return 'validated'
    return 'evaluation'
}

const getTokenStageLabel = (stage: TokenDealStage) => {
    if (stage === 'evaluation') return 'EVALUATION'
    if (stage === 'validated') return 'VALIDATED'
    if (stage === 'frozen') return 'FROZEN'
    return 'RELEASED'
}

const getTokenState = (record: SharedDealLifecycleRecord): TokenControlState => {
    const checkout = record.source.checkoutRecord
    if (!checkout) return 'planned'

    if (record.stage === 'released') return 'revoked'
    if (record.stage === 'credited' || record.stage === 'disputed') return 'frozen'
    if (checkout.credentials.status !== 'issued') return 'planned'
    if (hoursUntil(checkout.credentials.expiresAt) <= 1) return 'expiring'
    return 'active'
}

const getTokenStateLabel = (state: TokenControlState) => {
    if (state === 'planned') return 'PLANNED'
    if (state === 'active') return 'ACTIVE'
    if (state === 'expiring') return 'EXPIRING'
    if (state === 'frozen') return 'FROZEN'
    return 'REVOKED'
}

export const buildTokenControlSummary = (
    records: SharedDealLifecycleRecord[]
): TokenControlSummary => {
    const dealStageCounts: Record<TokenDealStage, number> = {
        evaluation: 0,
        validated: 0,
        frozen: 0,
        released: 0
    }
    const controlStateCounts: Record<TokenControlState, number> = {
        planned: 0,
        active: 0,
        expiring: 0,
        frozen: 0,
        revoked: 0
    }

    const rows = records
        .filter(record => record.source.checkoutRecord)
        .map(record => {
            const checkout = record.source.checkoutRecord!
            const dealStage = getTokenDealStage(record)
            const controlState = getTokenState(record)
            dealStageCounts[dealStage] += 1
            controlStateCounts[controlState] += 1

            const autoAction =
                dealStage === 'frozen'
                    ? 'Freeze token and revoke egress immediately.'
                    : dealStage === 'released'
                        ? 'Revoke token and archive credential after settlement.'
                        : dealStage === 'validated'
                            ? 'Keep token read-only until payout release completes.'
                            : 'Monitor evaluation access and expire on schedule.'

            const controlReason =
                dealStage === 'frozen'
                    ? 'Deal entered a blocked or dispute state, so token controls tighten automatically.'
                    : dealStage === 'released'
                        ? 'Deal is closed and credentials should no longer stay active.'
                        : dealStage === 'validated'
                            ? 'Buyer validation passed, but payout has not fully closed yet.'
                            : 'Protected evaluation is still active and the token remains in monitored use.'

            const anomalyFlag =
                controlState === 'frozen' ||
                controlState === 'expiring' ||
                checkout.configuration.accessMode === 'encrypted_download'

            return {
                tokenId: checkout.credentials.credentialId ?? `PLANNED-${checkout.escrowId}`,
                participant: checkout.buyerLabel,
                dataset: record.datasetTitle,
                issued: toUtcLabel(checkout.credentials.issuedAt ?? checkout.createdAt),
                expires: toUtcLabel(checkout.credentials.expiresAt),
                scope: checkout.credentials.scopes.slice(0, 2).join(' · ') || 'Provisioning',
                dealStage,
                stageLabel: getTokenStageLabel(dealStage),
                controlState,
                stateLabel: getTokenStateLabel(controlState),
                autoAction,
                controlReason,
                anomalyFlag
            } satisfies TokenControlRow
        })
        .sort((left, right) => {
            if (stageOrder[right.dealStage] !== stageOrder[left.dealStage]) {
                return stageOrder[right.dealStage] - stageOrder[left.dealStage]
            }
            return left.tokenId.localeCompare(right.tokenId)
        })

    return {
        rows,
        anomalyRows: rows.filter(row => row.anomalyFlag).slice(0, 3),
        revocations: rows
            .filter(row => row.controlState === 'frozen' || row.controlState === 'revoked')
            .map(row => ({
                tokenId: row.tokenId,
                participant: row.participant,
                reason: row.dealStage === 'frozen' ? 'Deal freeze applied from outcome or dispute state' : 'Deal settled and token archived',
                revokedBy: row.dealStage === 'frozen' ? 'Auto-freeze' : 'Auto-revoke',
                timestamp: row.dealStage === 'frozen' ? row.issued : row.expires
            })),
        dealStageCounts,
        controlStateCounts
    }
}

const makeAuditEvent = (
    record: SharedDealLifecycleRecord,
    event: string,
    status: string,
    verified: boolean,
    purpose: string,
    tone: AuditDigestTone
): AuditDigestEvent => ({
    timestamp: toUtcLabel(record.updatedAt),
    event,
    participant: record.source.checkoutRecord?.buyerLabel ?? record.passportId,
    dataset: record.datasetTitle,
    purpose,
    status,
    hash: `${buildHash(`${record.id}:${event}`)}...${buildHash(`${event}:${record.datasetTitle}`).slice(0, 4)}`,
    verified,
    tone
})

export const buildAuditDigestSummary = (
    records: SharedDealLifecycleRecord[]
): AuditDigestSummary => {
    const outcomeSummary = buildOutcomeEngineAlertSummary(records)
    const tokenSummary = buildTokenControlSummary(records)
    const disputeSummary = buildDisputePrepSummary(records)

    const cards: AuditDigestCard[] = [
        {
            label: 'Tracked Deals',
            value: `${records.length}`,
            detail: 'Shared deal records included in the admin digest.'
        },
        {
            label: 'Release-Ready',
            value: `${records.filter(record => record.releaseReadiness.status === 'safe_to_release').length}`,
            detail: 'Deals that can safely move into provider payout.'
        },
        {
            label: 'Blocked / Frozen',
            value: `${records.filter(record => record.triageLane === 'blocked').length}`,
            detail: 'Deals held by outcome, dispute, or compliance blockers.'
        },
        {
            label: 'Auto Controls',
            value: `${tokenSummary.revocations.length + records.filter(record => record.outcomeCreditUsd > 0).length}`,
            detail: 'Automatic freezes, revokes, and credits applied from admin policy.'
        }
    ]

    const highlights: AuditDigestHighlight[] = [
        {
            title: 'Outcome engine digest',
            detail:
                outcomeSummary.totalFailureGroups > 0
                    ? `${outcomeSummary.totalFailureGroups} grouped provider/dataset failure alert(s) are active across ${outcomeSummary.frozenDealCount} frozen deal(s).`
                    : 'No grouped outcome-engine failure alerts are active right now.'
        },
        {
            title: 'Token controls digest',
            detail:
                tokenSummary.revocations.length > 0
                    ? `${tokenSummary.revocations.length} token control action(s) were auto-frozen or auto-revoked by deal stage.`
                    : 'No token freezes or revokes were required in the current digest window.'
        },
        {
            title: 'Dispute prep digest',
            detail:
                disputeSummary.packets.length > 0
                    ? `${disputeSummary.packets.length} dispute prep packet(s) are ready, with ${disputeSummary.pendingEvidenceCount} evidence gap(s) still open.`
                    : 'No dispute prep packets were required in the current digest window.'
        }
    ]

    const events = [
        ...records
            .filter(record => record.releaseReadiness.status === 'safe_to_release')
            .map(record =>
                makeAuditEvent(
                    record,
                    'RELEASE_READY',
                    'CLEARED',
                    true,
                    'Settlement release',
                    'ok'
                )
            ),
        ...records
            .filter(record => record.outcomeCreditUsd > 0)
            .map(record =>
                makeAuditEvent(
                    record,
                    'CREDIT_ISSUED',
                    'FLAGGED',
                    true,
                    'Outcome protection',
                    'warn'
                )
            ),
        ...records
            .filter(record => record.rightsRisk.requiresReview)
            .map(record =>
                makeAuditEvent(
                    record,
                    'RIGHTS_FLAGGED',
                    'REVIEW',
                    true,
                    'Rights governance',
                    'warn'
                )
            ),
        ...tokenSummary.revocations.map(revocation => ({
            timestamp: revocation.timestamp,
            event: revocation.revokedBy === 'Auto-freeze' ? 'TOKEN_FROZEN' : 'TOKEN_REVOKED',
            participant: revocation.participant,
            dataset: 'Scoped credential',
            purpose: 'Token control',
            status: 'CONTROLLED',
            hash: `${buildHash(`${revocation.tokenId}:${revocation.reason}`)}...${buildHash(revocation.participant).slice(0, 4)}`,
            verified: true,
            tone: 'warn' as const
        })),
        ...disputeSummary.packets.map(packet => ({
            timestamp: toUtcLabel(records.find(record => record.source.checkoutRecord?.escrowId === packet.escrowId)?.updatedAt),
            event: 'DISPUTE_PACKET_READY',
            participant: packet.buyer,
            dataset: packet.dataset,
            purpose: 'Dispute prep',
            status: packet.severity === 'high' ? 'ESCALATE' : 'REVIEW',
            hash: `${buildHash(packet.escrowId)}...${buildHash(packet.dataset).slice(0, 4)}`,
            verified: true,
            tone: (packet.severity === 'high' ? 'warn' : 'ok') as AuditDigestTone
        }))
    ]
        .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
        .slice(0, 12)

    return {
        cards,
        highlights,
        events,
        flaggedCount: events.filter(event => event.tone === 'warn').length
    }
}

const getEvidenceStatus = (
    condition: boolean,
    detailWhenReady: string,
    detailWhenMissing: string,
    warning?: boolean
): DisputePrepEvidenceItem => ({
    label: '',
    status: condition ? (warning ? 'warning' : 'ready') : 'missing',
    detail: condition ? detailWhenReady : detailWhenMissing
})

export const buildDisputePrepSummary = (
    records: SharedDealLifecycleRecord[]
): DisputePrepSummary => {
    const packets = records
        .filter(record => record.stage === 'credited' || record.stage === 'disputed')
        .map(record => {
            const checkout = record.source.checkoutRecord
            if (!checkout) return null

            const issueTypes = checkout.outcomeProtection.validation.issueTypes
            const evidence: DisputePrepEvidenceItem[] = [
                {
                    label: 'Rights quote',
                    status: record.quoteId ? 'ready' : 'missing',
                    detail: record.quoteId
                        ? `Quote ${record.quoteId} is attached to the dispute packet.`
                        : 'Quote context is missing from the packet.'
                },
                {
                    label: 'DUA',
                    status: checkout.dua.accepted ? 'ready' : 'missing',
                    detail: checkout.dua.accepted
                        ? `DUA ${checkout.dua.version} accepted and ready for review.`
                        : 'DUA acceptance record is missing.'
                },
                {
                    label: 'Passport',
                    status:
                        record.passportStatus === 'active'
                            ? 'ready'
                            : record.passportStatus === 'review'
                                ? 'warning'
                                : 'missing',
                    detail:
                        record.passportStatus === 'active'
                            ? `Passport ${record.passportId} is fully reusable.`
                            : record.passportStatus === 'review'
                                ? `Passport ${record.passportId} has reviewer follow-up pending.`
                                : `Passport ${record.passportId} is incomplete for dispute review.`
                },
                {
                    label: 'Engine findings',
                    status: checkout.outcomeProtection.engine.findings.length > 0 ? 'ready' : 'missing',
                    detail: checkout.outcomeProtection.engine.findings.length > 0
                        ? checkout.outcomeProtection.engine.findings[0]
                        : 'Outcome engine findings are missing from the packet.'
                },
                {
                    label: 'Token trace',
                    status: checkout.credentials.credentialId ? 'ready' : 'warning',
                    detail: checkout.credentials.credentialId
                        ? `Credential ${checkout.credentials.credentialId} and scope trace captured.`
                        : 'Token trace is partial because scoped credentials were not fully issued.'
                },
                {
                    label: 'Buyer validation note',
                    status: checkout.outcomeProtection.validation.note ? 'ready' : 'warning',
                    detail: checkout.outcomeProtection.validation.note ?? 'Buyer did not add a structured validation note.'
                }
            ]

            const missingEvidence = evidence.filter(item => item.status === 'missing').length
            const severity: DisputePrepSeverity =
                issueTypes.includes('schema_mismatch') || issueTypes.length > 1 ? 'high' : 'medium'

            const recommendedActions =
                issueTypes.includes('schema_mismatch')
                    ? [
                        'Maintain payout freeze and request a provider correction package.',
                        'Prepare a buyer refund path if the provider cannot reconcile the contracted schema.',
                        'Escalate to legal if the provider disputes the signed delivery terms.'
                    ]
                    : [
                        'Review freshness evidence and decide whether the miss is material or tolerance-based.',
                        'Consider partial credit before a full refund if the commercial outcome is still usable.',
                        'Re-run provider validation if the evidence points to a threshold edge case.'
                    ]

            return {
                id: record.id,
                escrowId: checkout.escrowId,
                dataset: record.datasetTitle,
                buyer: checkout.buyerLabel,
                provider: checkout.providerLabel,
                amountUsd: checkout.funding.amountUsd,
                severity,
                summary: checkout.outcomeProtection.engine.summary,
                evidence,
                recommendedActions,
                nextAction:
                    missingEvidence > 0
                        ? 'Collect the missing evidence items before closing the dispute.'
                        : recommendedActions[0]
            } satisfies DisputePrepPacket
        })
        .filter((packet): packet is DisputePrepPacket => packet !== null)
        .sort((left, right) => right.amountUsd - left.amountUsd)

    return {
        packets,
        highSeverityCount: packets.filter(packet => packet.severity === 'high').length,
        pendingEvidenceCount: packets.reduce(
            (sum, packet) => sum + packet.evidence.filter(item => item.status === 'missing').length,
            0
        ),
        refundRecommendedCount: packets.filter(packet =>
            packet.recommendedActions[0]?.toLowerCase().includes('refund')
        ).length
    }
}

export const getOutcomeEngineAlertSummary = () =>
    buildOutcomeEngineAlertSummary(loadSharedDealLifecycleRecords())

export const getTokenControlSummary = () =>
    buildTokenControlSummary(loadSharedDealLifecycleRecords())

export const getAuditDigestSummary = () =>
    buildAuditDigestSummary(loadSharedDealLifecycleRecords())

export const getDisputePrepSummary = () =>
    buildDisputePrepSummary(loadSharedDealLifecycleRecords())
