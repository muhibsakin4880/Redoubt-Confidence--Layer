export type ContractLifecycleState =
    | 'REQUEST_SUBMITTED'
    | 'REVIEW_IN_PROGRESS'
    | 'REQUEST_APPROVED'
    | 'FUNDS_HELD'
    | 'ACCESS_ACTIVE'
    | 'RELEASE_PENDING'
    | 'RELEASED_TO_PROVIDER'
    | 'DISPUTE_OPEN'
    | 'RESOLVED_REFUND'
    | 'RESOLVED_RELEASE'
    | 'REQUEST_REJECTED'
    | 'CANCELLED'

export type RequestReviewState = Extract<
    ContractLifecycleState,
    'REVIEW_IN_PROGRESS' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED'
>

export type LegacyRequestState = 'Approved' | 'Pending' | 'Rejected' | 'approved' | 'pending' | 'rejected'

export type LegacyEscrowCenterState =
    | 'REQUEST_SUBMITTED'
    | 'ESCROW_PENDING'
    | 'ESCROW_ACTIVE'
    | 'IN_PROGRESS'
    | 'ESCROW_RELEASED'
    | 'ESCROW_DISPUTE'

export type LegacyEscrowVaultState = 'active' | 'pendingRelease' | 'disputed' | 'released'

type ActorKind = 'buyer' | 'provider' | 'admin' | 'system'

type ApprovalStatus = 'submitted' | 'in_review' | 'approved' | 'rejected'

type EscrowStatus = 'not_funded' | 'funds_held' | 'release_pending' | 'released' | 'refunded'

type SessionStatus = 'not_started' | 'active' | 'ended' | 'revoked'

type DisputeStatus = 'none' | 'open' | 'resolved_refund' | 'resolved_release'

type EgressMode = 'ENCLAVE_ONLY' | 'ENCLAVE_PLUS_DOWNLOAD'

export type AccessContractAuditEvent = {
    id: string
    at: string
    actorId: string
    actorKind: ActorKind
    action: string
    reason?: string
    hashPointer: string
}

export type AccessContract = {
    contractId: string
    datasetId: string
    buyerId: string
    providerId: string
    createdAt: string
    updatedAt: string
    lifecycle: {
        state: ContractLifecycleState
        updatedAt: string
    }
    request: {
        purpose: string
        orgType: string
        requestedDuration: string
        requestedAccess: EgressMode
    }
    approval: {
        status: ApprovalStatus
        approversRequired: number
        approversCompleted: number
        decidedAt?: string
    }
    compliance: {
        consentValid: boolean
        legalBasis: string
        residencyPolicy: string
        policyChecksPassed: boolean
    }
    risk: {
        score: number
        level: 'low' | 'medium' | 'high'
        factors: string[]
        controlsRequired: string[]
    }
    escrow: {
        status: EscrowStatus
        amountUsd: number
        heldAt?: string
        holdWindowHours: number
        autoReleaseEnabled: boolean
    }
    accessPolicy: {
        egressMode: EgressMode
        downloadAllowed: boolean
        maxDownloads: number
        watermarkRequired: boolean
        reconfirmBeforeDownload: boolean
    }
    session: {
        status: SessionStatus
        tokenTtlMinutes: number
        scopes: string[]
        anomalyFlags: string[]
        revokedAt?: string
    }
    dispute: {
        status: DisputeStatus
        reason?: string
        openedAt?: string
        resolvedAt?: string
    }
    audit: {
        events: AccessContractAuditEvent[]
    }
}

export const CONTRACT_STATE_LABELS: Record<ContractLifecycleState, string> = {
    REQUEST_SUBMITTED: 'Request Submitted',
    REVIEW_IN_PROGRESS: 'Review In Progress',
    REQUEST_APPROVED: 'Request Approved',
    FUNDS_HELD: 'Funds Held',
    ACCESS_ACTIVE: 'Access Active',
    RELEASE_PENDING: 'Release Pending',
    RELEASED_TO_PROVIDER: 'Released to Provider',
    DISPUTE_OPEN: 'Dispute Open',
    RESOLVED_REFUND: 'Resolved - Refund',
    RESOLVED_RELEASE: 'Resolved - Release',
    REQUEST_REJECTED: 'Request Rejected',
    CANCELLED: 'Cancelled'
}

export const requestReviewStateLabel = (state: RequestReviewState): string => {
    if (state === 'REQUEST_APPROVED') return 'Approved'
    if (state === 'REQUEST_REJECTED') return 'Rejected'
    return 'Pending Review'
}

export const mapLegacyRequestState = (legacyState: LegacyRequestState): RequestReviewState => {
    if (legacyState === 'Approved' || legacyState === 'approved') return 'REQUEST_APPROVED'
    if (legacyState === 'Rejected' || legacyState === 'rejected') return 'REQUEST_REJECTED'
    return 'REVIEW_IN_PROGRESS'
}

export const mapLegacyEscrowCenterState = (legacyState: LegacyEscrowCenterState): ContractLifecycleState => {
    if (legacyState === 'REQUEST_SUBMITTED') return 'REQUEST_SUBMITTED'
    if (legacyState === 'ESCROW_PENDING') return 'FUNDS_HELD'
    if (legacyState === 'ESCROW_ACTIVE' || legacyState === 'IN_PROGRESS') return 'ACCESS_ACTIVE'
    if (legacyState === 'ESCROW_RELEASED') return 'RELEASED_TO_PROVIDER'
    return 'DISPUTE_OPEN'
}

export const mapLegacyEscrowVaultState = (legacyState: LegacyEscrowVaultState): ContractLifecycleState => {
    if (legacyState === 'active') return 'ACCESS_ACTIVE'
    if (legacyState === 'pendingRelease') return 'RELEASE_PENDING'
    if (legacyState === 'released') return 'RELEASED_TO_PROVIDER'
    return 'DISPUTE_OPEN'
}

export const deriveContractLifecycleState = (contract: AccessContract): ContractLifecycleState => {
    if (contract.dispute.status === 'open') return 'DISPUTE_OPEN'
    if (contract.dispute.status === 'resolved_refund') return 'RESOLVED_REFUND'
    if (contract.dispute.status === 'resolved_release') return 'RESOLVED_RELEASE'

    if (contract.approval.status === 'rejected') return 'REQUEST_REJECTED'
    if (contract.approval.status === 'submitted') return 'REQUEST_SUBMITTED'
    if (contract.approval.status === 'in_review') return 'REVIEW_IN_PROGRESS'
    if (contract.approval.status === 'approved' && contract.escrow.status === 'not_funded') return 'REQUEST_APPROVED'

    if (contract.escrow.status === 'funds_held' && contract.session.status !== 'active') return 'FUNDS_HELD'
    if (contract.session.status === 'active') return 'ACCESS_ACTIVE'
    if (contract.escrow.status === 'release_pending') return 'RELEASE_PENDING'
    if (contract.escrow.status === 'released') return 'RELEASED_TO_PROVIDER'
    if (contract.escrow.status === 'refunded') return 'RESOLVED_REFUND'

    return contract.lifecycle.state
}

export const validateAccessContract = (contract: AccessContract): string[] => {
    const violations: string[] = []

    if (contract.session.status === 'active' && contract.approval.status !== 'approved') {
        violations.push('Active session exists before approval.')
    }

    if (contract.session.status === 'active' && contract.escrow.status === 'not_funded') {
        violations.push('Active session exists without funds held in escrow.')
    }

    if (contract.escrow.status === 'released' && contract.dispute.status === 'open') {
        violations.push('Escrow released while dispute is still open.')
    }

    if (contract.accessPolicy.downloadAllowed && contract.accessPolicy.maxDownloads < 1) {
        violations.push('Download is allowed but maxDownloads is less than 1.')
    }

    if (contract.session.tokenTtlMinutes <= 0) {
        violations.push('Ephemeral token TTL must be greater than zero.')
    }

    return violations
}
