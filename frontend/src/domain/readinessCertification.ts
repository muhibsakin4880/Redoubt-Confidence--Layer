import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from './accessContract'
import { buildContractAlertFeed } from './alertCenter'
import { evaluateDemoContractHealth } from './contractHealth'
import { buildDecisionGateReport } from './decisionGate'
import { buildPolicyAttestation } from './policyAttestation'
import { buildResilienceInsights, type ResilienceDigest } from './resilienceInsights'

export type ReadinessStatus = 'certified' | 'conditional' | 'blocked'

export type ReadinessControl = {
    id: string
    label: string
    status: 'pass' | 'warn' | 'fail'
    detail: string
}

export type ContractReadinessCertificate = {
    contractId: string
    role: ResilienceDigest['role']
    state: ContractLifecycleState
    stateLabel: string
    status: ReadinessStatus
    score: number
    summary: string
    blockers: string[]
    conditions: string[]
    controls: ReadinessControl[]
}

export type PortfolioReadinessCertificate = {
    status: ReadinessStatus
    score: number
    contractsMonitored: number
    certifiedCount: number
    conditionalCount: number
    blockedCount: number
    summary: string
    priorityFocus: string[]
    contracts: ContractReadinessCertificate[]
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

const statusRank: Record<ReadinessStatus, number> = {
    blocked: 3,
    conditional: 2,
    certified: 1
}

const readinessFromControls = (controls: ReadinessControl[]): ReadinessStatus => {
    if (controls.some(control => control.status === 'fail')) return 'blocked'
    if (controls.some(control => control.status === 'warn')) return 'conditional'
    return 'certified'
}

const summaryForStatus = (status: ReadinessStatus): string => {
    if (status === 'certified') return 'Ready to proceed under current frontend governance rules.'
    if (status === 'conditional') return 'Proceed only after warning-level checks are explicitly confirmed.'
    return 'Execution should remain blocked until failure-level gaps are resolved.'
}

export const buildContractReadinessCertificate = (digest: ResilienceDigest): ContractReadinessCertificate => {
    const health = evaluateDemoContractHealth(digest.contractId, digest.state)
    const gate = buildDecisionGateReport(
        digest.contractId,
        digest.role,
        digest.state,
        digest.pendingReleaseCount ?? 0
    )
    const attestation = buildPolicyAttestation(
        digest.contractId,
        digest.role,
        digest.state,
        digest.pendingReleaseCount ?? 0
    )
    const alerts = buildContractAlertFeed(
        digest.contractId,
        digest.role,
        digest.state,
        digest.pendingReleaseCount ?? 0
    )

    const controls: ReadinessControl[] = [
        {
            id: 'decision-gate',
            label: 'Decision Gate',
            status: gate.status === 'hold' ? 'fail' : gate.status === 'conditional' ? 'warn' : 'pass',
            detail: gate.decisionStatement
        },
        {
            id: 'policy-attestation',
            label: 'Policy Attestation',
            status:
                attestation.overallStatus === 'fail'
                    ? 'fail'
                    : attestation.overallStatus === 'warn'
                      ? 'warn'
                      : 'pass',
            detail: `Control coverage ${attestation.completionPercent}% at ${attestation.nextGate}.`
        },
        {
            id: 'contract-health',
            label: 'Contract Health',
            status: health.severity === 'critical' ? 'fail' : health.severity === 'watch' ? 'warn' : 'pass',
            detail: `Health score ${health.score}/100 with ${health.findings.length} finding(s).`
        },
        {
            id: 'alert-posture',
            label: 'Alert Posture',
            status: alerts.criticalCount > 0 ? 'fail' : alerts.warningCount > 0 ? 'warn' : 'pass',
            detail: `${alerts.criticalCount} critical / ${alerts.warningCount} warning active alerts.`
        }
    ]

    const status = readinessFromControls(controls)
    const blockers: string[] = []
    const conditions: string[] = []

    controls.forEach(control => {
        if (control.status === 'fail') blockers.push(`${control.label}: ${control.detail}`)
        else if (control.status === 'warn') conditions.push(`${control.label}: ${control.detail}`)
    })

    if (blockers.length === 0) blockers.push('No blocking readiness controls.')
    if (conditions.length === 0) conditions.push('No conditional readiness controls.')

    const baseScore = Math.round((gate.score + health.score + attestation.completionPercent) / 3)
    const alertPenalty = alerts.criticalCount * 14 + alerts.warningCount * 6
    const score = clamp(baseScore - alertPenalty)

    return {
        contractId: digest.contractId,
        role: digest.role,
        state: digest.state,
        stateLabel: CONTRACT_STATE_LABELS[digest.state],
        status,
        score,
        summary: summaryForStatus(status),
        blockers,
        conditions,
        controls
    }
}

export const buildPortfolioReadinessCertificate = (
    digests: ResilienceDigest[]
): PortfolioReadinessCertificate => {
    const contracts = digests.map(buildContractReadinessCertificate)
    const resilience = buildResilienceInsights(digests)
    const certifiedCount = contracts.filter(contract => contract.status === 'certified').length
    const conditionalCount = contracts.filter(contract => contract.status === 'conditional').length
    const blockedCount = contracts.filter(contract => contract.status === 'blocked').length

    const status: ReadinessStatus =
        blockedCount > 0 ? 'blocked' : conditionalCount > 0 ? 'conditional' : 'certified'

    const averageContractScore =
        contracts.length > 0
            ? Math.round(contracts.reduce((sum, contract) => sum + contract.score, 0) / contracts.length)
            : 0

    const score = clamp(
        Math.round(averageContractScore * 0.7 + resilience.trustIndex * 0.3) -
            blockedCount * 8 -
            conditionalCount * 3
    )

    const prioritizedContracts = [...contracts].sort((a, b) => {
        const statusDelta = statusRank[b.status] - statusRank[a.status]
        if (statusDelta !== 0) return statusDelta
        return b.score - a.score
    })

    const priorityFocus = prioritizedContracts.slice(0, 3).map(contract => {
        if (contract.status === 'blocked') {
            return `${contract.contractId}: resolve blockers before any execution.`
        }
        if (contract.status === 'conditional') {
            return `${contract.contractId}: close warning controls before launch decision.`
        }
        return `${contract.contractId}: keep monitoring and proceed per runbook.`
    })

    if (priorityFocus.length === 0) {
        priorityFocus.push('No contracts provided for readiness assessment.')
    }

    return {
        status,
        score,
        contractsMonitored: digests.length,
        certifiedCount,
        conditionalCount,
        blockedCount,
        summary: summaryForStatus(status),
        priorityFocus,
        contracts
    }
}

