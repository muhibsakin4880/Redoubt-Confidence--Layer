import {
    CONTRACT_STATE_LABELS,
    type AccessContractAuditEvent,
    type ContractLifecycleState
} from './accessContract'

export type AuditEventTone = 'info' | 'success' | 'warning' | 'critical'

export type ContractAuditTimelineEvent = AccessContractAuditEvent & {
    lifecycleState: ContractLifecycleState
    lifecycleLabel: string
    controls: string[]
    tone: AuditEventTone
}

type Template = {
    actorId: string
    actorKind: AccessContractAuditEvent['actorKind']
    action: string
    reason: string
    controls: string[]
    tone: AuditEventTone
}

const EVENT_TEMPLATES: Record<ContractLifecycleState, Template> = {
    REQUEST_SUBMITTED: {
        actorId: 'buyer_session',
        actorKind: 'buyer',
        action: 'Access request submitted',
        reason: 'Purpose, duration, and compliance acknowledgement captured.',
        controls: ['Request hash recorded', 'Provider identity shielded'],
        tone: 'info'
    },
    REVIEW_IN_PROGRESS: {
        actorId: 'compliance_queue',
        actorKind: 'admin',
        action: 'Trust review started',
        reason: 'Risk scoring and policy checks were initiated.',
        controls: ['Dual approval policy gate', 'Residency rule validation'],
        tone: 'info'
    },
    REQUEST_APPROVED: {
        actorId: 'compliance_admin',
        actorKind: 'admin',
        action: 'Request approved with controls',
        reason: 'Scope and safeguards meet policy requirements.',
        controls: ['Scoped access policy', 'Consent checkpoint'],
        tone: 'success'
    },
    FUNDS_HELD: {
        actorId: 'escrow_engine',
        actorKind: 'system',
        action: 'Funds moved to escrow hold',
        reason: 'Payment is locked until settlement conditions are met.',
        controls: ['Escrow lock active', 'Auto-release timer armed'],
        tone: 'success'
    },
    ACCESS_ACTIVE: {
        actorId: 'session_controller',
        actorKind: 'system',
        action: 'Controlled access session issued',
        reason: 'Ephemeral credentials were granted under policy.',
        controls: ['TTL credentials', 'Egress monitoring enabled'],
        tone: 'success'
    },
    RELEASE_PENDING: {
        actorId: 'buyer_session',
        actorKind: 'buyer',
        action: 'Settlement decision window open',
        reason: 'Buyer can release funds, dispute, or extend the window.',
        controls: ['Release guardrails active', 'Final audit checkpoint'],
        tone: 'warning'
    },
    RELEASED_TO_PROVIDER: {
        actorId: 'escrow_engine',
        actorKind: 'system',
        action: 'Funds released to provider',
        reason: 'All release conditions were satisfied.',
        controls: ['Settlement receipt generated', 'Trust profile updated'],
        tone: 'success'
    },
    DISPUTE_OPEN: {
        actorId: 'buyer_session',
        actorKind: 'buyer',
        action: 'Dispute opened',
        reason: 'Settlement paused pending dispute resolution.',
        controls: ['Escrow frozen', 'Evidence chain logging'],
        tone: 'critical'
    },
    RESOLVED_REFUND: {
        actorId: 'dispute_admin',
        actorKind: 'admin',
        action: 'Dispute resolved with refund',
        reason: 'Case decision approved refund to buyer.',
        controls: ['Refund proof logged', 'Case locked for integrity'],
        tone: 'success'
    },
    RESOLVED_RELEASE: {
        actorId: 'dispute_admin',
        actorKind: 'admin',
        action: 'Dispute resolved with release',
        reason: 'Case decision approved provider payout.',
        controls: ['Resolution proof logged', 'Case locked for integrity'],
        tone: 'success'
    },
    REQUEST_REJECTED: {
        actorId: 'compliance_admin',
        actorKind: 'admin',
        action: 'Request rejected',
        reason: 'Mandatory controls were missing or non-compliant.',
        controls: ['Rejection reason stored', 'Token path remains closed'],
        tone: 'warning'
    },
    CANCELLED: {
        actorId: 'buyer_session',
        actorKind: 'buyer',
        action: 'Request cancelled by owner',
        reason: 'Request owner closed the workflow before settlement.',
        controls: ['Cancellation receipt generated', 'Session path revoked'],
        tone: 'warning'
    }
}

const PRIMARY_FLOW: ContractLifecycleState[] = [
    'REQUEST_SUBMITTED',
    'REVIEW_IN_PROGRESS',
    'REQUEST_APPROVED',
    'FUNDS_HELD',
    'ACCESS_ACTIVE',
    'RELEASE_PENDING',
    'RELEASED_TO_PROVIDER'
]

const REJECTED_FLOW: ContractLifecycleState[] = [
    'REQUEST_SUBMITTED',
    'REVIEW_IN_PROGRESS',
    'REQUEST_REJECTED'
]

const CANCELLED_FLOW: ContractLifecycleState[] = ['REQUEST_SUBMITTED', 'CANCELLED']

const DISPUTE_FLOW_BASE: ContractLifecycleState[] = [
    'REQUEST_SUBMITTED',
    'REVIEW_IN_PROGRESS',
    'REQUEST_APPROVED',
    'FUNDS_HELD',
    'ACCESS_ACTIVE',
    'DISPUTE_OPEN'
]

const flowForState = (state: ContractLifecycleState): ContractLifecycleState[] => {
    if (state === 'REQUEST_REJECTED') return REJECTED_FLOW
    if (state === 'CANCELLED') return CANCELLED_FLOW
    if (state === 'DISPUTE_OPEN') return DISPUTE_FLOW_BASE
    if (state === 'RESOLVED_REFUND') return [...DISPUTE_FLOW_BASE, 'RESOLVED_REFUND']
    if (state === 'RESOLVED_RELEASE') return [...DISPUTE_FLOW_BASE, 'RESOLVED_RELEASE']

    const targetIndex = PRIMARY_FLOW.indexOf(state)
    if (targetIndex === -1) return PRIMARY_FLOW
    return PRIMARY_FLOW.slice(0, targetIndex + 1)
}

const formatTimelineTimestamp = (offsetMinutes: number): string => {
    const base = Date.UTC(2026, 2, 8, 9, 0, 0)
    const timestamp = new Date(base + offsetMinutes * 60 * 1000)
    return `${timestamp.toISOString().replace('T', ' ').substring(0, 19)} UTC`
}

const buildHashPointer = (contractId: string, stepNumber: number): string =>
    `audit://${contractId.toLowerCase()}/event-${String(stepNumber).padStart(2, '0')}`

export const buildDemoAuditTimeline = (
    contractId: string,
    state: ContractLifecycleState
): ContractAuditTimelineEvent[] => {
    const flow = flowForState(state)

    return flow.map((lifecycleState, index) => {
        const template = EVENT_TEMPLATES[lifecycleState]
        const step = index + 1

        return {
            id: `${contractId}-${step}`,
            at: formatTimelineTimestamp(index * 19),
            actorId: template.actorId,
            actorKind: template.actorKind,
            action: template.action,
            reason: template.reason,
            hashPointer: buildHashPointer(contractId, step),
            lifecycleState,
            lifecycleLabel: CONTRACT_STATE_LABELS[lifecycleState],
            controls: template.controls,
            tone: template.tone
        }
    })
}
