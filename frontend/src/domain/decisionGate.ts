import type { ContractLifecycleState } from './accessContract'
import { evaluateDemoContractHealth } from './contractHealth'
import { buildContractControlTowerSnapshot } from './controlTower'
import { buildActionExecutionRunbook, listRunbookActionOptions } from './executionRunbook'
import { buildPolicyAttestation } from './policyAttestation'
import type { TransitionActionId, TransitionRole } from './transitionSimulator'

export type DecisionGateStatus = 'ready' | 'conditional' | 'hold'

export type DecisionSigner = {
    id: string
    label: string
    required: boolean
    status: 'approved' | 'pending'
    rationale: string
}

export type DecisionGateReport = {
    contractId: string
    role: TransitionRole
    state: ContractLifecycleState
    status: DecisionGateStatus
    score: number
    actionLabel: string
    actionAllowed: boolean
    decisionStatement: string
    blockers: string[]
    conditions: string[]
    signers: DecisionSigner[]
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

const fallbackActionForRole: Record<TransitionRole, TransitionActionId> = {
    buyer: 'extend_window',
    reviewer: 'approve_with_conditions',
    admin: 'release_now'
}

const statusFromSignals = (blockers: string[], conditions: string[]): DecisionGateStatus => {
    if (blockers.length > 0) return 'hold'
    if (conditions.length > 0) return 'conditional'
    return 'ready'
}

const scoreFromSignals = (actionAllowed: boolean, blockers: number, conditions: number) => {
    const score = 100 + (actionAllowed ? 0 : -18) - blockers * 22 - conditions * 8
    return clamp(score)
}

const statementForStatus = (status: DecisionGateStatus): string => {
    if (status === 'ready') return 'Execution can proceed after standard preflight checks.'
    if (status === 'conditional') return 'Execution can proceed only after conditional controls are confirmed.'
    return 'Execution is blocked until hard blockers are resolved.'
}

export const buildDecisionGateReport = (
    contractId: string,
    role: TransitionRole,
    state: ContractLifecycleState,
    pendingReleaseCount = 0
): DecisionGateReport => {
    const tower = buildContractControlTowerSnapshot(contractId, role, state, pendingReleaseCount)
    const health = evaluateDemoContractHealth(contractId, state)
    const attestation = buildPolicyAttestation(contractId, role, state, pendingReleaseCount)
    const availableActions = listRunbookActionOptions(role, state, pendingReleaseCount)
    const actionId = tower.recommendedAction?.id ?? availableActions[0]?.id ?? fallbackActionForRole[role]
    const runbook = buildActionExecutionRunbook(contractId, role, state, actionId, pendingReleaseCount)

    const blockers: string[] = []
    const conditions: string[] = []

    if (!runbook.allowed) {
        blockers.push(runbook.reason)
    }

    if (health.severity === 'critical') {
        blockers.push('Contract health is critical and requires incident-level triage.')
    } else if (health.severity === 'watch') {
        conditions.push('Health monitor reports warning-level findings that should be remediated.')
    }

    if (attestation.overallStatus === 'fail') {
        blockers.push(...attestation.criticalGaps.slice(0, 2))
    } else if (attestation.overallStatus === 'warn') {
        conditions.push('Policy attestation contains warning controls pending closure.')
    }

    if (tower.slaStatus === 'breached') {
        blockers.push('SLA is breached; escalate before executing non-emergency actions.')
    } else if (tower.slaStatus === 'at_risk') {
        conditions.push('SLA is at risk; expedite approvals and evidence capture.')
    }

    if (runbook.requiredApprovals > 1) {
        conditions.push(`Runbook requires ${runbook.requiredApprovals} approvals before execution.`)
    }

    const status = statusFromSignals(blockers, conditions)
    const score = scoreFromSignals(runbook.allowed, blockers.length, conditions.length)

    const signers: DecisionSigner[] = [
        {
            id: 'policy-engine',
            label: 'Policy Engine',
            required: true,
            status: attestation.overallStatus === 'pass' ? 'approved' : 'pending',
            rationale: 'Validates lifecycle, control coverage, and gate readiness.'
        },
        {
            id: `${role}-owner`,
            label: `${role[0].toUpperCase()}${role.slice(1)} Owner`,
            required: true,
            status: runbook.allowed ? 'approved' : 'pending',
            rationale: 'Confirms action intent and operational accountability.'
        }
    ]

    if (runbook.requiredApprovals > 1) {
        signers.push({
            id: 'secondary-approver',
            label: 'Secondary Approver',
            required: true,
            status: 'pending',
            rationale: 'Dual-approval required by runbook policy.'
        })
    }

    if (tower.slaStatus !== 'healthy') {
        signers.push({
            id: 'operations-lead',
            label: 'Operations Lead',
            required: true,
            status: tower.slaStatus === 'at_risk' ? 'pending' : 'pending',
            rationale: 'SLA risk requires explicit operations oversight.'
        })
    }

    return {
        contractId,
        role,
        state,
        status,
        score,
        actionLabel: runbook.actionLabel,
        actionAllowed: runbook.allowed,
        decisionStatement: statementForStatus(status),
        blockers: blockers.length > 0 ? blockers : ['No blocking conditions.'],
        conditions: conditions.length > 0 ? conditions : ['No conditional requirements.'],
        signers
    }
}

