import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from './accessContract'
import { buildDemoAuditTimeline } from './auditTimeline'
import { evaluateDemoContractHealth } from './contractHealth'
import { buildContractControlTowerSnapshot } from './controlTower'
import type { TransitionRole } from './transitionSimulator'

export type ResilienceDigest = {
    contractId: string
    state: ContractLifecycleState
    role: TransitionRole
    pendingReleaseCount?: number
}

export type ResilienceTopPriority = {
    contractId: string
    state: ContractLifecycleState
    stateLabel: string
    priorityScore: number
    recommendedActionLabel: string
    recommendedActionAllowed: boolean
}

export type ResilienceInsights = {
    portfolioSize: number
    trustIndex: number
    averageHealthScore: number
    criticalCount: number
    slaRiskCount: number
    blockedRecommendationCount: number
    highPriorityCount: number
    totalAuditEvents: number
    topPriorities: ResilienceTopPriority[]
    keyActions: string[]
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const buildResilienceInsights = (digests: ResilienceDigest[]): ResilienceInsights => {
    if (digests.length === 0) {
        return {
            portfolioSize: 0,
            trustIndex: 0,
            averageHealthScore: 0,
            criticalCount: 0,
            slaRiskCount: 0,
            blockedRecommendationCount: 0,
            highPriorityCount: 0,
            totalAuditEvents: 0,
            topPriorities: [],
            keyActions: ['No contracts loaded in this workspace context.']
        }
    }

    const snapshots = digests.map(digest => {
        const health = evaluateDemoContractHealth(digest.contractId, digest.state)
        const tower = buildContractControlTowerSnapshot(
            digest.contractId,
            digest.role,
            digest.state,
            digest.pendingReleaseCount ?? 0
        )
        const auditCount = buildDemoAuditTimeline(digest.contractId, digest.state).length

        return { digest, health, tower, auditCount }
    })

    const averageHealthScore = Math.round(
        snapshots.reduce((sum, item) => sum + item.health.score, 0) / snapshots.length
    )
    const criticalCount = snapshots.filter(item => item.health.severity === 'critical').length
    const slaRiskCount = snapshots.filter(
        item => item.tower.slaStatus === 'at_risk' || item.tower.slaStatus === 'breached'
    ).length
    const blockedRecommendationCount = snapshots.filter(
        item => item.tower.recommendedAction && !item.tower.recommendedAction.allowed
    ).length
    const highPriorityCount = snapshots.filter(
        item => item.tower.priorityBand === 'high' || item.tower.priorityBand === 'critical'
    ).length
    const totalAuditEvents = snapshots.reduce((sum, item) => sum + item.auditCount, 0)

    const healthContribution = averageHealthScore * 0.55
    const slaContribution = (1 - slaRiskCount / snapshots.length) * 100 * 0.25
    const criticalContribution = (1 - criticalCount / snapshots.length) * 100 * 0.2
    const trustIndex = clamp(Math.round(healthContribution + slaContribution + criticalContribution), 0, 100)

    const topPriorities: ResilienceTopPriority[] = snapshots
        .slice()
        .sort((a, b) => b.tower.priorityScore - a.tower.priorityScore)
        .slice(0, 3)
        .map(item => ({
            contractId: item.digest.contractId,
            state: item.digest.state,
            stateLabel: CONTRACT_STATE_LABELS[item.digest.state],
            priorityScore: item.tower.priorityScore,
            recommendedActionLabel: item.tower.recommendedAction?.label ?? 'No recommendation',
            recommendedActionAllowed: item.tower.recommendedAction?.allowed ?? true
        }))

    const keyActions: string[] = []
    if (criticalCount > 0) {
        keyActions.push(`${criticalCount} contract(s) are critical and require incident-priority handling.`)
    }
    if (slaRiskCount > 0) {
        keyActions.push(`${slaRiskCount} contract(s) are at SLA risk or already breached.`)
    }
    if (blockedRecommendationCount > 0) {
        keyActions.push(
            `${blockedRecommendationCount} recommended action(s) are currently blocked by policy guardrails.`
        )
    }
    if (highPriorityCount > 0) {
        keyActions.push(`${highPriorityCount} contract(s) are in high or critical priority bands.`)
    }
    if (keyActions.length === 0) {
        keyActions.push('Portfolio is healthy with no urgent intervention signals.')
    }

    return {
        portfolioSize: snapshots.length,
        trustIndex,
        averageHealthScore,
        criticalCount,
        slaRiskCount,
        blockedRecommendationCount,
        highPriorityCount,
        totalAuditEvents,
        topPriorities,
        keyActions
    }
}

