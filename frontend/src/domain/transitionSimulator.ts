import { CONTRACT_STATE_LABELS, type ContractLifecycleState, type RequestReviewState } from './accessContract'
import {
    canPerformAdminEscrowAction,
    canPerformBuyerEscrowAction,
    canPerformReviewerAction
} from './actionGuardrails'
import { evaluateDemoContractHealth } from './contractHealth'
import { buildDemoAuditTimeline } from './auditTimeline'

export type TransitionRole = 'buyer' | 'reviewer' | 'admin'

export type TransitionActionId =
    | 'release_payment'
    | 'open_dispute'
    | 'extend_window'
    | 'approve_with_conditions'
    | 'escalate_dual_approval'
    | 'reject_request'
    | 'resolve_refund'
    | 'resolve_release'
    | 'escalate_legal'
    | 'release_now'
    | 'release_all_pending'

export type TransitionActionOption = {
    id: TransitionActionId
    label: string
    allowed: boolean
    reason: string
}

export type TransitionSimulation = {
    role: TransitionRole
    action: TransitionActionOption
    currentState: ContractLifecycleState
    currentStateLabel: string
    nextState: ContractLifecycleState
    nextStateLabel: string
    healthBefore: number
    healthAfter: number
    scoreDelta: number
    riskTrend: 'improved' | 'degraded' | 'stable'
    auditEventsBefore: number
    auditEventsAfter: number
    impacts: string[]
}

type ActionDefinition = {
    id: TransitionActionId
    label: string
    nextState: ContractLifecycleState
    impacts: string[]
}

const BUYER_ACTIONS: ActionDefinition[] = [
    {
        id: 'release_payment',
        label: 'Release Payment',
        nextState: 'RELEASED_TO_PROVIDER',
        impacts: ['Provider payout settles', 'Contract moves to closed settlement state']
    },
    {
        id: 'open_dispute',
        label: 'Open Dispute',
        nextState: 'DISPUTE_OPEN',
        impacts: ['Escrow settlement is frozen', 'Evidence workflow becomes mandatory']
    },
    {
        id: 'extend_window',
        label: 'Extend Window',
        nextState: 'RELEASE_PENDING',
        impacts: ['Settlement deadline is extended', 'Release remains policy-gated']
    }
]

const REVIEWER_ACTIONS: ActionDefinition[] = [
    {
        id: 'approve_with_conditions',
        label: 'Approve with Conditions',
        nextState: 'REQUEST_APPROVED',
        impacts: ['Request exits review queue', 'Escrow activation becomes available']
    },
    {
        id: 'escalate_dual_approval',
        label: 'Escalate for Dual Approval',
        nextState: 'REVIEW_IN_PROGRESS',
        impacts: ['Additional approver is required', 'Request remains under review']
    },
    {
        id: 'reject_request',
        label: 'Reject Request',
        nextState: 'REQUEST_REJECTED',
        impacts: ['Request is closed pending corrections', 'Escrow path remains disabled']
    }
]

const ADMIN_ACTIONS: ActionDefinition[] = [
    {
        id: 'resolve_refund',
        label: 'Resolve as Refund',
        nextState: 'RESOLVED_REFUND',
        impacts: ['Buyer funds are returned', 'Dispute case closes with refund outcome']
    },
    {
        id: 'resolve_release',
        label: 'Resolve as Release',
        nextState: 'RESOLVED_RELEASE',
        impacts: ['Provider payout executes', 'Dispute case closes with release outcome']
    },
    {
        id: 'escalate_legal',
        label: 'Escalate to Legal',
        nextState: 'DISPUTE_OPEN',
        impacts: ['Dispute stays frozen', 'Legal review workflow is initiated']
    },
    {
        id: 'release_now',
        label: 'Release Now',
        nextState: 'RELEASED_TO_PROVIDER',
        impacts: ['Immediate payout is triggered', 'Contract exits release queue']
    },
    {
        id: 'release_all_pending',
        label: 'Release All Pending',
        nextState: 'RELEASED_TO_PROVIDER',
        impacts: ['Bulk settlements are triggered', 'Pending release queue is reduced']
    }
]

const actionsForRole = (role: TransitionRole): ActionDefinition[] => {
    if (role === 'buyer') return BUYER_ACTIONS
    if (role === 'reviewer') return REVIEWER_ACTIONS
    return ADMIN_ACTIONS
}

const guardForAction = (
    role: TransitionRole,
    action: TransitionActionId,
    state: ContractLifecycleState,
    pendingReleaseCount: number
): { allowed: boolean; reason: string } => {
    if (role === 'buyer') {
        if (action === 'release_payment' || action === 'open_dispute' || action === 'extend_window') {
            return canPerformBuyerEscrowAction(action, state)
        }
        return { allowed: false, reason: 'Action is not available for buyer role.' }
    }

    if (role === 'reviewer') {
        if (
            action === 'approve_with_conditions' ||
            action === 'escalate_dual_approval' ||
            action === 'reject_request'
        ) {
            const reviewState: RequestReviewState =
                state === 'REQUEST_APPROVED' || state === 'REQUEST_REJECTED' ? state : 'REVIEW_IN_PROGRESS'
            return canPerformReviewerAction(action, reviewState)
        }
        return { allowed: false, reason: 'Action is not available for reviewer role.' }
    }

    if (
        action === 'resolve_refund' ||
        action === 'resolve_release' ||
        action === 'escalate_legal' ||
        action === 'release_now' ||
        action === 'release_all_pending'
    ) {
        return canPerformAdminEscrowAction(action, state, pendingReleaseCount)
    }

    return { allowed: false, reason: 'Action is not available for admin role.' }
}

export const listTransitionActions = (
    role: TransitionRole,
    state: ContractLifecycleState,
    pendingReleaseCount = 0
): TransitionActionOption[] => {
    return actionsForRole(role).map(action => {
        const guard = guardForAction(role, action.id, state, pendingReleaseCount)
        return {
            id: action.id,
            label: action.label,
            allowed: guard.allowed,
            reason: guard.reason
        }
    })
}

export const simulateTransition = (
    contractId: string,
    role: TransitionRole,
    state: ContractLifecycleState,
    actionId: TransitionActionId,
    pendingReleaseCount = 0
): TransitionSimulation => {
    const actionDef =
        actionsForRole(role).find(action => action.id === actionId) ?? actionsForRole(role)[0]

    const guard = guardForAction(role, actionDef.id, state, pendingReleaseCount)
    const nextState = guard.allowed ? actionDef.nextState : state
    const beforeHealth = evaluateDemoContractHealth(contractId, state)
    const afterHealth = evaluateDemoContractHealth(contractId, nextState)
    const eventsBefore = buildDemoAuditTimeline(contractId, state)
    const eventsAfter = buildDemoAuditTimeline(contractId, nextState)
    const scoreDelta = afterHealth.score - beforeHealth.score

    return {
        role,
        action: {
            id: actionDef.id,
            label: actionDef.label,
            allowed: guard.allowed,
            reason: guard.reason
        },
        currentState: state,
        currentStateLabel: CONTRACT_STATE_LABELS[state],
        nextState,
        nextStateLabel: CONTRACT_STATE_LABELS[nextState],
        healthBefore: beforeHealth.score,
        healthAfter: afterHealth.score,
        scoreDelta,
        riskTrend: scoreDelta > 0 ? 'improved' : scoreDelta < 0 ? 'degraded' : 'stable',
        auditEventsBefore: eventsBefore.length,
        auditEventsAfter: eventsAfter.length,
        impacts: guard.allowed ? actionDef.impacts : ['Action remains blocked until lifecycle policy allows it.']
    }
}
