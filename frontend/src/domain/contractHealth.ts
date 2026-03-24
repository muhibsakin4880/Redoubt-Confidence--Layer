import {
    CONTRACT_STATE_LABELS,
    deriveContractLifecycleState,
    validateAccessContract,
    type AccessContract,
    type ContractLifecycleState
} from './accessContract'

export type ContractHealthSeverity = 'healthy' | 'watch' | 'critical'

export type ContractHealthAssessment = {
    contractId: string
    lifecycleState: ContractLifecycleState
    lifecycleLabel: string
    derivedState: ContractLifecycleState
    derivedStateLabel: string
    severity: ContractHealthSeverity
    score: number
    findings: string[]
    remediations: string[]
    monitoredSignals: string[]
}

const clampScore = (score: number) => Math.max(0, Math.min(100, score))

const toRemediation = (finding: string): string => {
    if (finding.includes('Active session exists before approval')) {
        return 'Revoke active session and return request to review.'
    }
    if (finding.includes('Active session exists without funds held')) {
        return 'Pause session and move payment to escrow hold before reactivation.'
    }
    if (finding.includes('Escrow released while dispute is still open')) {
        return 'Freeze settlement and trigger admin dispute rollback workflow.'
    }
    if (finding.includes('maxDownloads is less than 1')) {
        return 'Set maxDownloads to at least 1 or disable download access.'
    }
    if (finding.includes('token TTL must be greater than zero')) {
        return 'Set ephemeral token TTL to a positive value.'
    }
    if (finding.includes('Lifecycle state mismatch')) {
        return 'Synchronize lifecycle state from derived contract status model.'
    }
    if (finding.includes('Compliance policy checks are not marked as passed')) {
        return 'Run compliance checks before moving contract forward.'
    }
    if (finding.includes('High-risk requests should require dual approval')) {
        return 'Set approversRequired to 2+ for high-risk contracts.'
    }
    if (finding.includes('Dispute is open')) {
        return 'Route case to dispute resolution queue and block settlement actions.'
    }
    if (finding.includes('Request rejected')) {
        return 'Collect missing controls and submit a corrected request.'
    }
    if (finding.includes('Anomaly flags detected')) {
        return 'Review anomaly evidence and revoke session if needed.'
    }
    return 'Review contract timeline and resolve outstanding policy checks.'
}

const withStateProfile = (state: ContractLifecycleState, contract: AccessContract): AccessContract => {
    const nextContract = { ...contract }

    nextContract.lifecycle = { state, updatedAt: contract.updatedAt }
    nextContract.approval = { ...contract.approval, decidedAt: undefined }
    nextContract.escrow = { ...contract.escrow, heldAt: undefined }
    nextContract.session = { ...contract.session, revokedAt: undefined, anomalyFlags: [] }
    nextContract.dispute = { ...contract.dispute, reason: undefined, openedAt: undefined, resolvedAt: undefined }

    if (state === 'REQUEST_SUBMITTED') {
        nextContract.approval.status = 'submitted'
    } else if (state === 'REVIEW_IN_PROGRESS') {
        nextContract.approval.status = 'in_review'
    } else if (state === 'REQUEST_APPROVED') {
        nextContract.approval.status = 'approved'
        nextContract.approval.decidedAt = contract.updatedAt
    } else if (state === 'FUNDS_HELD') {
        nextContract.approval.status = 'approved'
        nextContract.approval.decidedAt = contract.updatedAt
        nextContract.escrow.status = 'funds_held'
        nextContract.escrow.heldAt = contract.updatedAt
    } else if (state === 'ACCESS_ACTIVE') {
        nextContract.approval.status = 'approved'
        nextContract.approval.decidedAt = contract.updatedAt
        nextContract.escrow.status = 'funds_held'
        nextContract.escrow.heldAt = contract.updatedAt
        nextContract.session.status = 'active'
    } else if (state === 'RELEASE_PENDING') {
        nextContract.approval.status = 'approved'
        nextContract.approval.decidedAt = contract.updatedAt
        nextContract.escrow.status = 'release_pending'
        nextContract.escrow.heldAt = contract.updatedAt
        nextContract.session.status = 'ended'
    } else if (state === 'RELEASED_TO_PROVIDER') {
        nextContract.approval.status = 'approved'
        nextContract.approval.decidedAt = contract.updatedAt
        nextContract.escrow.status = 'released'
        nextContract.escrow.heldAt = contract.updatedAt
        nextContract.session.status = 'ended'
    } else if (state === 'DISPUTE_OPEN') {
        nextContract.approval.status = 'approved'
        nextContract.approval.decidedAt = contract.updatedAt
        nextContract.escrow.status = 'release_pending'
        nextContract.escrow.heldAt = contract.updatedAt
        nextContract.session.status = 'revoked'
        nextContract.session.revokedAt = contract.updatedAt
        nextContract.session.anomalyFlags = ['schema_mismatch_reported']
        nextContract.dispute.status = 'open'
        nextContract.dispute.openedAt = contract.updatedAt
        nextContract.dispute.reason = 'Buyer raised data quality mismatch evidence.'
    } else if (state === 'RESOLVED_REFUND') {
        nextContract.approval.status = 'approved'
        nextContract.approval.decidedAt = contract.updatedAt
        nextContract.escrow.status = 'refunded'
        nextContract.escrow.heldAt = contract.updatedAt
        nextContract.session.status = 'revoked'
        nextContract.session.revokedAt = contract.updatedAt
        nextContract.dispute.status = 'resolved_refund'
        nextContract.dispute.resolvedAt = contract.updatedAt
    } else if (state === 'RESOLVED_RELEASE') {
        nextContract.approval.status = 'approved'
        nextContract.approval.decidedAt = contract.updatedAt
        nextContract.escrow.status = 'released'
        nextContract.escrow.heldAt = contract.updatedAt
        nextContract.session.status = 'ended'
        nextContract.dispute.status = 'resolved_release'
        nextContract.dispute.resolvedAt = contract.updatedAt
    } else if (state === 'REQUEST_REJECTED') {
        nextContract.approval.status = 'rejected'
        nextContract.approval.decidedAt = contract.updatedAt
    } else if (state === 'CANCELLED') {
        nextContract.approval.status = 'submitted'
    }

    return nextContract
}

export const buildDemoAccessContract = (
    contractId: string,
    state: ContractLifecycleState
): AccessContract => {
    const baseContract: AccessContract = {
        contractId,
        datasetId: `dataset-${contractId.toLowerCase()}`,
        buyerId: 'buyer_demo',
        providerId: 'provider_demo',
        createdAt: '2026-03-08 09:00:00 UTC',
        updatedAt: '2026-03-08 12:00:00 UTC',
        lifecycle: {
            state: 'REQUEST_SUBMITTED',
            updatedAt: '2026-03-08 12:00:00 UTC'
        },
        request: {
            purpose: 'Evaluation and model benchmarking',
            orgType: 'research',
            requestedDuration: '90 days',
            requestedAccess: 'ENCLAVE_ONLY'
        },
        approval: {
            status: 'submitted',
            approversRequired: 1,
            approversCompleted: 1
        },
        compliance: {
            consentValid: true,
            legalBasis: 'Contractual need',
            residencyPolicy: 'US_EU_CONSTRAINED',
            policyChecksPassed: true
        },
        risk: {
            score: state === 'DISPUTE_OPEN' ? 81 : 44,
            level: state === 'DISPUTE_OPEN' ? 'high' : 'medium',
            factors: ['Cross-border access', 'Sensitive category'],
            controlsRequired: ['No raw export', 'Egress monitoring']
        },
        escrow: {
            status: 'not_funded',
            amountUsd: 499,
            holdWindowHours: 24,
            autoReleaseEnabled: true
        },
        accessPolicy: {
            egressMode: 'ENCLAVE_ONLY',
            downloadAllowed: false,
            maxDownloads: 0,
            watermarkRequired: true,
            reconfirmBeforeDownload: true
        },
        session: {
            status: 'not_started',
            tokenTtlMinutes: 45,
            scopes: ['dataset.read', 'analysis.run'],
            anomalyFlags: []
        },
        dispute: {
            status: 'none'
        },
        audit: {
            events: []
        }
    }

    const contract = withStateProfile(state, baseContract)

    if (contract.risk.level === 'high') {
        contract.approval.approversRequired = 2
    }

    return contract
}

export const evaluateContractHealth = (contract: AccessContract): ContractHealthAssessment => {
    const baseFindings = validateAccessContract(contract)
    const derivedState = deriveContractLifecycleState(contract)
    const findings = [...baseFindings]

    if (derivedState !== contract.lifecycle.state) {
        findings.push(
            `Lifecycle state mismatch: stored state ${CONTRACT_STATE_LABELS[contract.lifecycle.state]} differs from derived state ${CONTRACT_STATE_LABELS[derivedState]}.`
        )
    }

    if (!contract.compliance.policyChecksPassed) {
        findings.push('Compliance policy checks are not marked as passed.')
    }

    if (contract.risk.level === 'high' && contract.approval.approversRequired < 2) {
        findings.push('High-risk requests should require dual approval.')
    }

    if (contract.dispute.status === 'open') {
        findings.push('Dispute is open; settlement remains frozen until resolution.')
    }

    if (contract.lifecycle.state === 'REQUEST_REJECTED') {
        findings.push('Request rejected; controls must be updated before re-submission.')
    }

    if (contract.session.anomalyFlags.length > 0) {
        findings.push(`Anomaly flags detected: ${contract.session.anomalyFlags.join(', ')}.`)
    }

    const hasCriticalViolation =
        findings.some(finding => finding.includes('Escrow released while dispute is still open')) ||
        findings.some(finding => finding.includes('Active session exists before approval'))

    const severity: ContractHealthSeverity = hasCriticalViolation
        ? 'critical'
        : findings.length > 0
          ? 'watch'
          : 'healthy'

    const scorePenalty = findings.length * 14 + contract.session.anomalyFlags.length * 8
    const score = clampScore(100 - scorePenalty)

    const monitoredSignals = [
        `Lifecycle: ${CONTRACT_STATE_LABELS[contract.lifecycle.state]}`,
        `Approval: ${contract.approval.status}`,
        `Escrow: ${contract.escrow.status}`,
        `Session: ${contract.session.status}`,
        `Dispute: ${contract.dispute.status}`
    ]

    const remediations = findings.length > 0 ? Array.from(new Set(findings.map(toRemediation))) : ['No remediation required. Contract is policy-aligned.']

    return {
        contractId: contract.contractId,
        lifecycleState: contract.lifecycle.state,
        lifecycleLabel: CONTRACT_STATE_LABELS[contract.lifecycle.state],
        derivedState,
        derivedStateLabel: CONTRACT_STATE_LABELS[derivedState],
        severity,
        score,
        findings,
        remediations,
        monitoredSignals
    }
}

export const evaluateDemoContractHealth = (
    contractId: string,
    state: ContractLifecycleState
): ContractHealthAssessment => {
    const contract = buildDemoAccessContract(contractId, state)
    return evaluateContractHealth(contract)
}
