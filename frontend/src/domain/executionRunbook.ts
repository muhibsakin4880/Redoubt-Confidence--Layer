import type { ContractLifecycleState } from './accessContract'
import { evaluateDemoContractHealth } from './contractHealth'
import {
    listTransitionActions,
    simulateTransition,
    type TransitionActionId,
    type TransitionRole
} from './transitionSimulator'

export type RunbookStepStatus = 'ready' | 'warning' | 'blocked'

export type ActionRunbookStep = {
    id: string
    title: string
    owner: string
    detail: string
    status: RunbookStepStatus
    evidencePointer: string
}

export type ActionExecutionRunbook = {
    contractId: string
    role: TransitionRole
    actionId: TransitionActionId
    actionLabel: string
    allowed: boolean
    reason: string
    currentState: ContractLifecycleState
    nextState: ContractLifecycleState
    requiredApprovals: number
    estimatedDurationMinutes: number
    rollbackPlan: string
    riskNotice: string
    steps: ActionRunbookStep[]
}

type ActionTemplate = {
    requiredApprovals: number
    estimatedDurationMinutes: number
    rollbackPlan: string
    steps: Array<{ title: string; owner: string; detail: string }>
}

const ACTION_TEMPLATES: Record<TransitionActionId, ActionTemplate> = {
    release_payment: {
        requiredApprovals: 1,
        estimatedDurationMinutes: 5,
        rollbackPlan: 'Freeze settlement and open dispute review if post-release anomaly is detected.',
        steps: [
            { title: 'Verify final usage evidence', owner: 'buyer', detail: 'Confirm no unresolved quality or compliance issues.' },
            { title: 'Confirm settlement policy', owner: 'system', detail: 'Validate escrow release guardrails and expiry conditions.' },
            { title: 'Write immutable settlement receipt', owner: 'escrow engine', detail: 'Commit payout proof and close contract.' }
        ]
    },
    open_dispute: {
        requiredApprovals: 1,
        estimatedDurationMinutes: 10,
        rollbackPlan: 'Withdraw dispute only after admin review and evidence consistency checks.',
        steps: [
            { title: 'Capture evidence package', owner: 'buyer', detail: 'Attach mismatch details and reproducible findings.' },
            { title: 'Freeze payout channel', owner: 'escrow engine', detail: 'Suspend release while dispute is open.' },
            { title: 'Assign dispute reviewer', owner: 'admin', detail: 'Route case into resolution workflow.' }
        ]
    },
    extend_window: {
        requiredApprovals: 1,
        estimatedDurationMinutes: 3,
        rollbackPlan: 'Revert window extension by restoring original expiry and notifying participants.',
        steps: [
            { title: 'Confirm extension rationale', owner: 'buyer', detail: 'Document why additional validation time is needed.' },
            { title: 'Update escrow deadline', owner: 'system', detail: 'Apply extension and keep release controls active.' },
            { title: 'Notify counterparty', owner: 'system', detail: 'Emit timeline update to provider and audit trail.' }
        ]
    },
    approve_with_conditions: {
        requiredApprovals: 1,
        estimatedDurationMinutes: 8,
        rollbackPlan: 'Revoke approval and re-open review if controls cannot be enforced.',
        steps: [
            { title: 'Validate policy fit', owner: 'reviewer', detail: 'Ensure requested use matches approved control profile.' },
            { title: 'Attach enforceable conditions', owner: 'reviewer', detail: 'Define egress limits and monitoring obligations.' },
            { title: 'Issue conditional approval', owner: 'system', detail: 'Record decision and unlock escrow setup.' }
        ]
    },
    escalate_dual_approval: {
        requiredApprovals: 2,
        estimatedDurationMinutes: 20,
        rollbackPlan: 'Return to single-review path only if risk profile is downgraded.',
        steps: [
            { title: 'Flag high-risk rationale', owner: 'reviewer', detail: 'Document risk dimensions requiring additional review.' },
            { title: 'Assign second approver', owner: 'admin', detail: 'Route request to dual-control queue.' },
            { title: 'Hold contract progression', owner: 'system', detail: 'Block approval until second decision is captured.' }
        ]
    },
    reject_request: {
        requiredApprovals: 1,
        estimatedDurationMinutes: 6,
        rollbackPlan: 'Open corrected resubmission pathway with preserved evidence history.',
        steps: [
            { title: 'Document rejection grounds', owner: 'reviewer', detail: 'Capture concrete policy/control deficiencies.' },
            { title: 'Send remediation guidance', owner: 'system', detail: 'Provide path for corrected re-submission.' },
            { title: 'Seal request state', owner: 'system', detail: 'Disable escrow and credential pathways.' }
        ]
    },
    resolve_refund: {
        requiredApprovals: 2,
        estimatedDurationMinutes: 18,
        rollbackPlan: 'Escalate to legal if refund decision is contested after execution.',
        steps: [
            { title: 'Review dispute evidence', owner: 'admin', detail: 'Validate buyer claim and provider response package.' },
            { title: 'Approve refund resolution', owner: 'admin', detail: 'Capture dual-admin decision for refund outcome.' },
            { title: 'Execute refund settlement', owner: 'escrow engine', detail: 'Return funds and close dispute case.' }
        ]
    },
    resolve_release: {
        requiredApprovals: 2,
        estimatedDurationMinutes: 18,
        rollbackPlan: 'Open legal escalation if payout resolution is challenged post-settlement.',
        steps: [
            { title: 'Review dispute evidence', owner: 'admin', detail: 'Validate that delivery obligations were met.' },
            { title: 'Approve release resolution', owner: 'admin', detail: 'Capture dual-admin decision for payout outcome.' },
            { title: 'Execute provider payout', owner: 'escrow engine', detail: 'Release funds and close dispute case.' }
        ]
    },
    escalate_legal: {
        requiredApprovals: 1,
        estimatedDurationMinutes: 15,
        rollbackPlan: 'Return to dispute queue only after legal team final direction.',
        steps: [
            { title: 'Freeze operational changes', owner: 'system', detail: 'Lock payout/refund actions during legal review.' },
            { title: 'Publish legal case packet', owner: 'admin', detail: 'Send evidence chain and decision history.' },
            { title: 'Set legal SLA timer', owner: 'system', detail: 'Track escalation deadline and accountability.' }
        ]
    },
    release_now: {
        requiredApprovals: 1,
        estimatedDurationMinutes: 4,
        rollbackPlan: 'Trigger emergency freeze and manual incident review if release is disputed.',
        steps: [
            { title: 'Validate release eligibility', owner: 'admin', detail: 'Confirm contract is in release-pending stage.' },
            { title: 'Execute payout command', owner: 'escrow engine', detail: 'Perform immediate provider settlement.' },
            { title: 'Write release receipt', owner: 'system', detail: 'Store immutable payout proof.' }
        ]
    },
    release_all_pending: {
        requiredApprovals: 2,
        estimatedDurationMinutes: 12,
        rollbackPlan: 'Batch-freeze unsettled records and trigger manual reconciliation.',
        steps: [
            { title: 'Load batch candidate list', owner: 'admin', detail: 'Collect release-pending contracts eligible for payout.' },
            { title: 'Run policy sweep', owner: 'system', detail: 'Exclude contracts with active disputes or anomalies.' },
            { title: 'Execute bulk settlement', owner: 'escrow engine', detail: 'Release eligible payouts and attach receipts.' }
        ]
    }
}

const stepStatusFor = (
    stepIndex: number,
    allowed: boolean,
    severity: 'healthy' | 'watch' | 'critical'
): RunbookStepStatus => {
    if (!allowed) return 'blocked'
    if (severity === 'critical' && stepIndex === 0) return 'warning'
    if (severity === 'watch' && stepIndex === 1) return 'warning'
    return 'ready'
}

const riskNoticeFor = (
    allowed: boolean,
    severity: 'healthy' | 'watch' | 'critical',
    scoreDelta: number
): string => {
    if (!allowed) return 'Action is blocked by lifecycle guardrails; keep contract in current state.'
    if (severity === 'critical') return 'Contract health is critical; require incident-grade review before execution.'
    if (severity === 'watch') return 'Contract health needs attention; complete remediation checkpoints before finalizing action.'
    if (scoreDelta < 0) return 'Simulated transition decreases health score; verify tradeoffs before proceeding.'
    return 'No elevated runbook risk detected for this simulated action.'
}

export const buildActionExecutionRunbook = (
    contractId: string,
    role: TransitionRole,
    state: ContractLifecycleState,
    actionId: TransitionActionId,
    pendingReleaseCount = 0
): ActionExecutionRunbook => {
    const simulation = simulateTransition(contractId, role, state, actionId, pendingReleaseCount)
    const health = evaluateDemoContractHealth(contractId, state)
    const template = ACTION_TEMPLATES[actionId]

    const steps = template.steps.map((step, index) => ({
        id: `${actionId}-${index + 1}`,
        title: step.title,
        owner: step.owner,
        detail: step.detail,
        status: stepStatusFor(index, simulation.action.allowed, health.severity),
        evidencePointer: `runbook://${contractId.toLowerCase()}/${actionId}/step-${index + 1}`
    }))

    return {
        contractId,
        role,
        actionId,
        actionLabel: simulation.action.label,
        allowed: simulation.action.allowed,
        reason: simulation.action.reason,
        currentState: simulation.currentState,
        nextState: simulation.nextState,
        requiredApprovals: template.requiredApprovals,
        estimatedDurationMinutes: template.estimatedDurationMinutes,
        rollbackPlan: template.rollbackPlan,
        riskNotice: riskNoticeFor(simulation.action.allowed, health.severity, simulation.scoreDelta),
        steps
    }
}

export const listRunbookActionOptions = (
    role: TransitionRole,
    state: ContractLifecycleState,
    pendingReleaseCount = 0
) => {
    return listTransitionActions(role, state, pendingReleaseCount)
}

