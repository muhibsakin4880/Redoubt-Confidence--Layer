import { getAccessPackageForDataset } from '../data/datasetAccessPackageData'
import {
    getApprovalArtifactByDealId,
    type ApprovalArtifactModel,
    type ApprovalSignoff
} from './approvalArtifact'
import {
    buildDealDossierProofBundle,
    type DealArtifactPreview,
    type DealArtifactPreviewTone
} from './dealArtifactPreview'
import type { DealRouteContext } from './dealDossier'
import {
    buildProviderRightsPacket,
    loadProviderPacketDraft,
    type ProviderPacketException
} from './providerRightsPacket'

export type ResidencyMemoApprover = {
    lane: string
    owner: string
    status: string
    note: string
}

export type ResidencyMemoException = {
    title: string
    severity: string
    owner: string
    resolution: string
}

export type ResidencyDecisionMemoModel = {
    memoId: string
    dealId: string
    reviewId: string | null
    title: string
    decisionLabel: string
    decisionTone: DealArtifactPreviewTone
    summary: string
    approvedProcessingLanes: string[]
    blockedProcessingLanes: string[]
    allowedDeploymentPath: string
    blockedDeploymentPath: string
    nextAction: string
    approvers: ResidencyMemoApprover[]
    exceptions: ResidencyMemoException[]
    references: Array<{
        label: string
        value: string
    }>
    artifacts: DealArtifactPreview[]
}

export type GoLiveWorkstreamStatus = 'Ready' | 'In progress' | 'Blocked'

export type GoLiveWorkstream = {
    title: string
    owner: string
    status: GoLiveWorkstreamStatus
    detail: string
}

export type GoLiveHandoffModel = {
    handoffId: string
    dealId: string
    reviewId: string | null
    title: string
    readinessLabel: string
    readinessTone: DealArtifactPreviewTone
    summary: string
    nextAction: string
    rightsAmendment: {
        status: string
        tone: DealArtifactPreviewTone
        summary: string
        highlights: string[]
    }
    deploymentModel: {
        label: string
        detail: string
        controls: string[]
    }
    apiControls: string[]
    pricingTier: {
        label: string
        detail: string
        referenceValue: string
    }
    workstreams: GoLiveWorkstream[]
    blockers: string[]
    references: Array<{
        label: string
        value: string
    }>
    artifacts: DealArtifactPreview[]
}

type GoLiveSeed = {
    productionLane: string
    apiProfile: string
    pricingLabel: string
    pricingDetail: string
    operationsOwner: string
}

const GO_LIVE_SEEDS: Record<string, GoLiveSeed> = {
    'DL-1001': {
        productionLane: 'Regional scenario delivery with audited climate-model outputs',
        apiProfile: 'Batch climate scenario API with watermark-preserving export review',
        pricingLabel: 'Annual governed analytics license',
        pricingDetail: 'Expands the paid evaluation into a renewable climate analytics agreement with controlled model-output access.',
        operationsOwner: 'Layla Haddad'
    },
    'DL-1002': {
        productionLane: 'Replay-only production vault with venue entitlement enforcement',
        apiProfile: 'Replay query API and entitlement-gated execution research endpoints',
        pricingLabel: 'Tiered venue replay agreement',
        pricingDetail: 'Converts evaluation rights into a venue-specific replay and benchmarking subscription with entitlement controls.',
        operationsOwner: 'Jonas Ilyas'
    },
    'DL-1003': {
        productionLane: 'Regional planning stream with no raw coordinate release',
        apiProfile: 'Metro-scoped planning API with governed streaming controls',
        pricingLabel: 'Regional planning program tier',
        pricingDetail: 'Keeps the deal in a planning-only operating model with regional tenancy and governed stream controls.',
        operationsOwner: 'Faris Nadeem'
    }
}

const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)

const unique = (values: Array<string | null | undefined>) =>
    Array.from(new Set(values.filter((value): value is string => Boolean(value))))

const uniqueExceptions = (exceptions: ResidencyMemoException[]) => {
    const seen = new Set<string>()
    return exceptions.filter(exception => {
        const key = `${exception.title}::${exception.owner}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

const exceptionToMemoException = (exception: ProviderPacketException): ResidencyMemoException => ({
    title: exception.title,
    severity: exception.severity,
    owner: exception.owner,
    resolution: exception.resolution
})

const toApprover = (signoff: ApprovalSignoff): ResidencyMemoApprover => ({
    lane: signoff.label,
    owner: signoff.owner,
    status: signoff.status,
    note: signoff.blockers[0] ?? signoff.rationale
})

const toneFromDecision = (
    approval: ApprovalArtifactModel,
    residencyExceptions: ResidencyMemoException[],
    proofBlockers: string[]
) => {
    const hasResidencyBlocker = residencyExceptions.some(exception => exception.severity === 'High')
    const hasOpenPolicyBlocker = proofBlockers.length > 0

    if (hasResidencyBlocker || (approval.overallTone === 'rose' && hasOpenPolicyBlocker)) {
        return {
            label: 'Blocked pending residency evidence',
            tone: 'rose' as const,
            summary:
                'The deployment path is defined, but the deal still lacks enough residency evidence to approve cross-boundary processing or production release.'
        }
    }

    if (approval.overallTone === 'emerald') {
        return {
            label: 'Approved for controlled production path',
            tone: 'emerald' as const,
            summary:
                'The deal has enough signoff coverage to permit a controlled production path inside the approved deployment boundary.'
        }
    }

    return {
        label: 'Conditional approval with transfer review',
        tone: 'amber' as const,
        summary:
            'The residency path is credible, but any movement beyond the named boundary still requires explicit transfer review and signoff.'
    }
}

const buildResidencyArtifact = (
    context: DealRouteContext,
    decisionLabel: string,
    decisionTone: DealArtifactPreviewTone,
    summary: string,
    allowedDeploymentPath: string,
    nextAction: string
): DealArtifactPreview => ({
    id: `RDM-${context.seed.dealId}`,
    artifactLabel: 'Residency memo preview',
    title: 'Residency and deployment decision memo',
    status: decisionLabel,
    tone: decisionTone,
    summary,
    highlights: [
        allowedDeploymentPath,
        context.checkoutRecord
            ? `Current access path: ${context.checkoutRecord.configuration.accessMode.replace('_', ' ')}`
            : 'Production path still needs to inherit evaluation controls.',
        context.lifecycleRecord?.releaseReadiness.summary ?? 'Release posture still needs a final review.'
    ],
    note: nextAction
})

const buildGoLiveArtifact = (
    context: DealRouteContext,
    readinessLabel: string,
    readinessTone: DealArtifactPreviewTone,
    summary: string,
    nextAction: string,
    productionLane: string
): DealArtifactPreview => ({
    id: `GLH-${context.seed.dealId}`,
    artifactLabel: 'Go-live handoff preview',
    title: 'Production expansion handoff',
    status: readinessLabel,
    tone: readinessTone,
    summary,
    highlights: [
        productionLane,
        context.lifecycleRecord?.nextAction ?? 'Rights and production controls are still converging.',
        context.checkoutRecord
            ? `Checkout ${context.checkoutRecord.id} anchors the operating model transition.`
            : 'No funded governed checkout is linked yet.'
    ],
    note: nextAction
})

export const buildResidencyDecisionMemo = (
    context: DealRouteContext
): ResidencyDecisionMemoModel => {
    const proofBundle = buildDealDossierProofBundle(context)
    const approval = getApprovalArtifactByDealId(context.seed.dealId)
    const packet = buildProviderRightsPacket(context, loadProviderPacketDraft(context.seed.dealId))
    const accessPackage = context.dataset
        ? getAccessPackageForDataset(context.dataset.id)
        : null

    if (!approval) {
        throw new Error(`Approval artifact missing for ${context.seed.dealId}`)
    }

    const residencyExceptions = uniqueExceptions([
        ...packet.unresolvedExceptions
            .filter(exception => /residency|region|export|cross-border|transfer/i.test(`${exception.title} ${exception.detail}`))
            .map(exception => exceptionToMemoException(exception)),
        ...proofBundle.approvalBlockers
            .filter(blocker => /residency|region|export|cross-border|transfer/i.test(blocker.blocker))
            .map(blocker => ({
                title: blocker.blocker,
                severity: blocker.severity,
                owner: blocker.owner,
                resolution: `Resolve before ${blocker.deadline} and refresh the deployment evidence packet.`
            }))
    ])

    const proofBlockers = proofBundle.approvalBlockers
        .filter(blocker => /residency|export|policy|rights/i.test(blocker.blocker))
        .map(blocker => blocker.blocker)

    const decision = toneFromDecision(approval, residencyExceptions, proofBlockers)
    const allowedDeploymentPath =
        proofBundle.deploymentSurface?.deploymentMode ??
        accessPackage?.deliveryDetail.label ??
        'Governed review boundary'
    const blockedDeploymentPath =
        packet.geography.restrictedProcessing[0] ??
        'No unmanaged cross-region release outside the approved Redoubt boundary.'
    const approvedProcessingLanes = unique([
        ...packet.geography.allowedProcessing,
        accessPackage?.deliveryDetail.buyerSummary,
        accessPackage?.security.masking,
        proofBundle.deploymentSurface?.residencyPosture
    ]).slice(0, 5)
    const blockedProcessingLanes = unique([
        ...packet.geography.restrictedProcessing,
        accessPackage?.advancedRights.redistribution === 'Not Allowed'
            ? 'No unrestricted redistribution into buyer-managed production surfaces.'
            : null,
        accessPackage?.security.revocation
    ]).slice(0, 5)
    const approvers = approval.signoffs
        .filter(signoff =>
            signoff.key === 'privacy' ||
            signoff.key === 'legal' ||
            signoff.key === 'governance' ||
            signoff.key === 'provider'
        )
        .map(toApprover)

    const nextAction =
        residencyExceptions[0]?.resolution ??
        approval.nextAction ??
        proofBundle.deploymentSurface?.blocker ??
        'Publish the final residency memo to the deal record.'

    const residencyArtifact = buildResidencyArtifact(
        context,
        decision.label,
        decision.tone,
        decision.summary,
        allowedDeploymentPath,
        nextAction
    )

    return {
        memoId: `RDM-${context.seed.dealId}`,
        dealId: context.seed.dealId,
        reviewId: proofBundle.reviewId,
        title: 'Residency & Deployment Decision Memo',
        decisionLabel: decision.label,
        decisionTone: decision.tone,
        summary: decision.summary,
        approvedProcessingLanes,
        blockedProcessingLanes,
        allowedDeploymentPath,
        blockedDeploymentPath,
        nextAction,
        approvers,
        exceptions: residencyExceptions,
        references: [
            { label: 'Deal id', value: context.seed.dealId },
            { label: 'Review id', value: proofBundle.reviewId ?? 'Not linked' },
            { label: 'Deployment surface', value: proofBundle.deploymentSurface?.id ?? 'Pending' },
            { label: 'Evidence pack', value: proofBundle.evidencePack?.id ?? 'Pending' },
            { label: 'Provider packet', value: `PKT-${context.seed.dealId}` },
            { label: 'Checkout id', value: context.checkoutId ?? 'Pending' }
        ],
        artifacts: [
            residencyArtifact,
            approval.approvalMemoPreview,
            proofBundle.artifactPreviews.find(artifact => artifact.artifactLabel === 'Evidence pack preview')
        ].filter((artifact): artifact is DealArtifactPreview => Boolean(artifact))
    }
}

export const buildGoLiveHandoff = (
    context: DealRouteContext
): GoLiveHandoffModel => {
    const proofBundle = buildDealDossierProofBundle(context)
    const approval = getApprovalArtifactByDealId(context.seed.dealId)
    const residencyMemo = buildResidencyDecisionMemo(context)
    const packet = buildProviderRightsPacket(context, loadProviderPacketDraft(context.seed.dealId))
    const accessPackage = context.dataset
        ? getAccessPackageForDataset(context.dataset.id)
        : null
    const seed = GO_LIVE_SEEDS[context.seed.dealId] ?? {
        productionLane: 'Governed production expansion path',
        apiProfile: 'Scoped production API with audit visibility',
        pricingLabel: 'Production expansion tier',
        pricingDetail: 'Converts the current evaluation into a governed production agreement.',
        operationsOwner: 'Redoubt operations'
    }

    if (!approval) {
        throw new Error(`Approval artifact missing for ${context.seed.dealId}`)
    }

    const blockers = unique([
        ...approval.outstandingBlockers.slice(0, 4),
        ...(residencyMemo.decisionTone === 'rose' ? [residencyMemo.nextAction] : [])
    ])

    let readinessLabel = 'Go-live path drafted'
    let readinessTone: DealArtifactPreviewTone = 'amber'
    let summary =
        'The evaluation has a proposed production landing path, but rights amendment, deployment, and operational owners still need to converge before launch.'

    if (blockers.length > 0) {
        readinessLabel = 'Not ready for production transition'
        readinessTone = 'rose'
        summary =
            'The production handoff exists, but at least one blocker still prevents the deal from widening beyond the current evaluation boundary.'
    } else if (
        approval.overallTone === 'emerald' ||
        context.lifecycleRecord?.releaseReadiness.canAutoRelease ||
        context.checkoutRecord?.lifecycleState === 'RELEASED_TO_PROVIDER'
    ) {
        readinessLabel = 'Ready for controlled go-live'
        readinessTone = 'emerald'
        summary =
            'The production transition is specific enough to feel real: rights amendment, deployment path, API controls, and handoff owners are named and aligned.'
    }

    const rightsAmendmentTone =
        readinessTone === 'rose'
            ? 'rose'
            : approval.signoffs.find(signoff => signoff.key === 'commercial')?.status === 'Signed'
                ? 'emerald'
                : 'amber'
    const nextAction =
        blockers[0] ??
        approval.nextAction ??
        context.lifecycleRecord?.nextAction ??
        'Publish the signed production handoff pack.'
    const priceReference = context.quote
        ? `${formatUsd(context.quote.totalUsd)} evaluation quote`
        : context.checkoutRecord
            ? `${formatUsd(context.checkoutRecord.funding.escrowHoldUsd)} escrow hold`
            : 'Pricing pending'

    const workstreams: GoLiveWorkstream[] = [
        {
            title: 'Rights amendment package',
            owner: approval.signoffs.find(signoff => signoff.key === 'commercial')?.owner ?? 'Commercial review',
            status: readinessTone === 'emerald' ? 'Ready' : rightsAmendmentTone === 'rose' ? 'Blocked' : 'In progress',
            detail:
                context.quote
                    ? `Convert the ${context.quote.input.deliveryMode.replace('_', ' ')} evaluation package into ${seed.productionLane.toLowerCase()} without widening prohibited redistribution rights.`
                    : 'Define the commercial amendment before any production release is promised.'
        },
        {
            title: 'Deployment and tenancy setup',
            owner: seed.operationsOwner,
            status: residencyMemo.decisionTone === 'rose' ? 'Blocked' : readinessTone === 'emerald' ? 'Ready' : 'In progress',
            detail: `${residencyMemo.allowedDeploymentPath} stays approved; ${residencyMemo.blockedDeploymentPath.toLowerCase()} remains disallowed.`
        },
        {
            title: 'API and audit controls',
            owner: 'Platform governance',
            status: blockers.length > 0 ? 'In progress' : 'Ready',
            detail: seed.apiProfile
        },
        {
            title: 'Operational handoff',
            owner: seed.operationsOwner,
            status: readinessTone === 'emerald' ? 'Ready' : 'In progress',
            detail:
                context.checkoutRecord
                    ? `Carry forward DUA ${context.checkoutRecord.dua.version}, output review policy, and reviewer-visible audit export into the production runbook.`
                    : 'Define the operating runbook once the governed checkout is active.'
        }
    ]

    const goLiveArtifact = buildGoLiveArtifact(
        context,
        readinessLabel,
        readinessTone,
        summary,
        nextAction,
        seed.productionLane
    )

    return {
        handoffId: `GLH-${context.seed.dealId}`,
        dealId: context.seed.dealId,
        reviewId: proofBundle.reviewId,
        title: 'Production Expansion & Go-Live',
        readinessLabel,
        readinessTone,
        summary,
        nextAction,
        rightsAmendment: {
            status:
                rightsAmendmentTone === 'emerald'
                    ? 'Amendment lane ready'
                    : rightsAmendmentTone === 'rose'
                        ? 'Amendment blocked'
                        : 'Amendment in review',
            tone: rightsAmendmentTone,
            summary:
                'Production rights should be shown as an amendment to the evaluated package, not as an implied default. This handoff makes that delta visible.',
            highlights: unique([
                context.quote?.rightsSummary[0],
                accessPackage?.deliveryDetail.providerSummary,
                accessPackage?.advancedRights.redistribution === 'Not Allowed'
                    ? 'Redistribution stays prohibited unless separately amended.'
                    : `Redistribution posture: ${accessPackage?.advancedRights.redistribution}`,
                accessPackage?.advancedRights.auditLogging
                    ? `${accessPackage.advancedRights.auditLogging} audit logging remains active.`
                    : null
            ]).slice(0, 4)
        },
        deploymentModel: {
            label: seed.productionLane,
            detail:
                proofBundle.deploymentSurface?.residencyPosture ??
                residencyMemo.summary,
            controls: unique([
                accessPackage?.security.encryption,
                accessPackage?.security.masking,
                accessPackage?.security.watermarking,
                accessPackage?.security.revocation
            ]).slice(0, 4)
        },
        apiControls: unique([
            seed.apiProfile,
            accessPackage?.deliveryDetail.buyerSummary,
            accessPackage?.advancedRights.auditLogging
                ? `${accessPackage.advancedRights.auditLogging} audit export and request logging`
                : null,
            packet.allowedUse.controls[0],
            'Named analysts, governed tokens, and output review stay bound to the production lane.'
        ]).slice(0, 5),
        pricingTier: {
            label: seed.pricingLabel,
            detail: seed.pricingDetail,
            referenceValue: priceReference
        },
        workstreams,
        blockers,
        references: [
            { label: 'Deal id', value: context.seed.dealId },
            { label: 'Review id', value: proofBundle.reviewId ?? 'Not linked' },
            { label: 'Residency memo', value: residencyMemo.memoId },
            { label: 'Approval artifact', value: approval.artifactId },
            { label: 'Quote id', value: context.quoteId ?? 'Pending' },
            { label: 'Checkout id', value: context.checkoutId ?? 'Pending' }
        ],
        artifacts: [
            goLiveArtifact,
            approval.approvalMemoPreview,
            proofBundle.artifactPreviews.find(artifact => artifact.artifactLabel === 'DUA preview')
        ].filter((artifact): artifact is DealArtifactPreview => Boolean(artifact))
    }
}
