import {
    adminVisibilityBoundaries,
    approvalBlockers,
    deploymentSurfaces,
    evidenceEvents,
    evidencePacks,
    incidentEvidenceRecords,
    type ApprovalBlocker,
    type DeploymentSurface,
    type EvidenceEvent,
    type EvidencePack,
    type IncidentEvidenceRecord
} from '../data/adminEvidenceData'
import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from './accessContract'
import { buildDemoAuditTimeline, type ContractAuditTimelineEvent } from './auditTimeline'
import type { DealRouteContext } from './dealDossier'
import { releaseReadinessMeta, rightsRiskMeta } from './dealLifecycle'
import {
    checkoutAccessModeMeta,
    outcomeIssueMeta,
    outcomeStageMeta,
    paymentMethodMeta
} from './escrowCheckout'
import {
    getProviderDatasetSubmissionByDatasetId,
    getProviderDossierBindingByDealId,
    type ProviderDatasetSubmissionRecord
} from './providerDatasetSubmission'

export type DealArtifactPreviewTone = 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose'

export type DealArtifactPreview = {
    id: string
    artifactLabel: string
    title: string
    status: string
    tone: DealArtifactPreviewTone
    summary: string
    highlights: string[]
    note?: string
}

export type DealDossierStatusPanel = {
    label: string
    title: string
    status: string
    tone: DealArtifactPreviewTone
    summary: string
    highlights: string[]
    note?: string
}

export type DealDossierProofBundle = {
    reviewId: string | null
    evidencePack: EvidencePack | null
    approvalBlockers: ApprovalBlocker[]
    evidenceEvents: EvidenceEvent[]
    incidentRecord: IncidentEvidenceRecord | null
    deploymentSurface: DeploymentSurface | null
    auditTimeline: ContractAuditTimelineEvent[]
    evaluationState: DealDossierStatusPanel
    settlementState: DealDossierStatusPanel
    artifactPreviews: DealArtifactPreview[]
}

const REVIEW_ID_BY_DEAL_ID: Record<string, string> = {
    'DL-1001': 'APP-2293',
    'DL-1002': 'APP-3390',
    'DL-1003': 'APP-4471'
}

const FALLBACK_INCIDENT_TIMESTAMPS: Record<string, string> = {
    'APP-2293': '2026-03-31 09:42 UTC',
    'APP-3390': '2026-03-31 08:48 UTC',
    'APP-4471': '2026-03-31 09:09 UTC'
}

const parseTimelineTimestamp = (value: string) => {
    const normalized = value.endsWith(' UTC')
        ? `${value.replace(' UTC', '').replace(' ', 'T')}Z`
        : value

    const parsed = Date.parse(normalized)
    return Number.isNaN(parsed) ? 0 : parsed
}

const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)

const formatIsoTimestamp = (value?: string) => {
    if (!value) return 'Pending'

    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) return value

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    }).format(new Date(parsed)).replace(',', ' ·')
}

const titleCase = (value: string) =>
    value
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')

const toneFromPackStatus = (status: EvidencePack['status']): DealArtifactPreviewTone => {
    if (status === 'Ready') return 'emerald'
    if (status === 'Blocked') return 'rose'
    return 'amber'
}

const toneFromSeverity = (severity: ApprovalBlocker['severity']): DealArtifactPreviewTone => {
    if (severity === 'High') return 'rose'
    if (severity === 'Medium') return 'amber'
    return 'slate'
}

const toneFromReleaseState = (context: DealRouteContext): DealArtifactPreviewTone => {
    if (context.checkoutRecord?.lifecycleState === 'DISPUTE_OPEN') return 'rose'
    if (context.checkoutRecord?.outcomeProtection.credits.status === 'issued') return 'rose'
    if (context.checkoutRecord?.lifecycleState === 'RELEASED_TO_PROVIDER') return 'emerald'
    if (context.checkoutRecord?.lifecycleState === 'RELEASE_PENDING') return 'amber'

    const releaseTone = context.lifecycleRecord
        ? releaseReadinessMeta[context.lifecycleRecord.releaseReadiness.status].tone
        : 'slate'

    if (releaseTone === 'red') return 'rose'
    return releaseTone
}

const toneFromEvaluationState = (context: DealRouteContext): DealArtifactPreviewTone => {
    if (!context.checkoutRecord) return context.quote ? 'amber' : 'slate'
    if (context.checkoutRecord.outcomeProtection.credits.status === 'issued') return 'rose'
    if (context.checkoutRecord.lifecycleState === 'RELEASED_TO_PROVIDER') return 'emerald'
    if (context.checkoutRecord.credentials.status === 'issued') return 'cyan'
    return 'amber'
}

const inferContractState = (context: DealRouteContext): ContractLifecycleState =>
    context.checkoutRecord?.lifecycleState ?? context.request?.status ?? 'REQUEST_SUBMITTED'

const resolveReviewId = (context: DealRouteContext) =>
    REVIEW_ID_BY_DEAL_ID[context.seed.dealId] ??
    getProviderDossierBindingByDealId(context.seed.dealId)?.reviewId ??
    null

const buildEvidenceAuditEvent = (
    reviewId: string,
    event: EvidenceEvent,
    lifecycleState: ContractLifecycleState
): ContractAuditTimelineEvent => ({
    id: `${reviewId}-${event.id}`,
    at: event.timestamp,
    actorId: `review_${reviewId.toLowerCase()}`,
    actorKind: 'admin',
    action: event.event,
    reason: `${event.surface} · ${event.visibility}`,
    hashPointer: `audit://${reviewId.toLowerCase()}/${event.evidencePackId.toLowerCase()}`,
    lifecycleState,
    lifecycleLabel: CONTRACT_STATE_LABELS[lifecycleState],
    controls: [
        `Evidence pack ${event.evidencePackId}`,
        event.status === 'Exception' ? 'Exception handling active' : 'Summary-only evidence visibility'
    ],
    tone: event.status === 'Reviewed' ? 'success' : event.status === 'Review' ? 'warning' : 'critical'
})

const buildIncidentAuditEvent = (
    reviewId: string,
    incidentRecord: IncidentEvidenceRecord,
    lifecycleState: ContractLifecycleState
): ContractAuditTimelineEvent => ({
    id: `${reviewId}-${incidentRecord.id}`,
    at: FALLBACK_INCIDENT_TIMESTAMPS[reviewId] ?? '2026-03-31 09:50 UTC',
    actorId: 'incident_response',
    actorKind: 'admin',
    action: incidentRecord.title,
    reason: incidentRecord.residencyImpact,
    hashPointer: `audit://${reviewId.toLowerCase()}/${incidentRecord.evidencePackId.toLowerCase()}/${incidentRecord.id.toLowerCase()}`,
    lifecycleState,
    lifecycleLabel: CONTRACT_STATE_LABELS[lifecycleState],
    controls: [
        `${incidentRecord.status} incident state`,
        `Evidence pack ${incidentRecord.evidencePackId}`,
        `Next action: ${incidentRecord.nextAction}`
    ],
    tone: incidentRecord.severity === 'Critical' ? 'critical' : incidentRecord.severity === 'High' ? 'warning' : 'info'
})

const buildEvaluationState = (context: DealRouteContext): DealDossierStatusPanel => {
    if (!context.checkoutRecord) {
        return {
            label: 'Governed evaluation state',
            title: 'Escrow and protected evaluation',
            status: context.quote ? 'Ready for checkout' : 'Awaiting rights package',
            tone: context.quote ? 'amber' : 'slate',
            summary: context.quote
                ? 'Commercial scope is priced, but no governed checkout has been funded yet.'
                : 'Protected evaluation state will appear here once the rights package and checkout record exist.',
            highlights: context.quote
                ? [
                    `Prepared quote ${context.quote.id} at ${formatUsd(context.quote.totalUsd)}`,
                    `Proposed access path: ${context.quote.rightsSummary[0]}`,
                    `Validation window: ${context.quote.input.validationWindowHours} hours`
                ]
                : [
                    'Generate a rights package to lock delivery, geography, and usage terms.',
                    'Fund escrow to activate the due use agreement and protected workspace.',
                    'Issue scoped credentials before buyer validation starts.'
                ],
            note: context.lifecycleRecord?.nextAction
        }
    }

    const checkoutRecord = context.checkoutRecord
    const stageMeta = outcomeStageMeta[checkoutRecord.outcomeProtection.stage]

    return {
        label: 'Governed evaluation state',
        title: 'Escrow and protected evaluation',
        status: stageMeta.label,
        tone: toneFromEvaluationState(context),
        summary: `${stageMeta.detail} ${checkoutRecord.outcomeProtection.engine.summary}`,
        highlights: [
            `Access path: ${checkoutAccessModeMeta[checkoutRecord.configuration.accessMode].label}`,
            `Workspace: ${checkoutRecord.workspace.workspaceName} (${titleCase(checkoutRecord.workspace.status)})`,
            `Credentials: ${
                checkoutRecord.credentials.status === 'issued'
                    ? `Issued · ${checkoutRecord.credentials.tokenTtlMinutes}-minute TTL`
                    : 'Planned'
            }`,
            `Funding method: ${paymentMethodMeta[checkoutRecord.configuration.paymentMethod].label}`,
            `Review window: ${checkoutRecord.configuration.reviewWindowHours} hours`
        ],
        note: checkoutRecord.outcomeProtection.engine.lastRunAt
            ? `Last engine scan ${formatIsoTimestamp(checkoutRecord.outcomeProtection.engine.lastRunAt)} UTC`
            : checkoutRecord.updatedAt
                ? `Last updated ${formatIsoTimestamp(checkoutRecord.updatedAt)} UTC`
                : undefined
    }
}

const buildSettlementState = (context: DealRouteContext): DealDossierStatusPanel => {
    if (!context.lifecycleRecord) {
        return {
            label: 'Release / refund / dispute',
            title: 'Settlement posture',
            status: 'Seeded route only',
            tone: 'slate',
            summary: 'Settlement gates will attach once a lifecycle record exists for the seeded deal.',
            highlights: ['No release posture is available yet.']
        }
    }

    const releaseMeta = releaseReadinessMeta[context.lifecycleRecord.releaseReadiness.status]
    const checkoutRecord = context.checkoutRecord
    const failedChecks = context.lifecycleRecord.releaseReadiness.checklist
        .filter(item => !item.passed)
        .map(item => item.label)

    let summary = context.lifecycleRecord.releaseReadiness.summary

    if (checkoutRecord?.lifecycleState === 'RELEASED_TO_PROVIDER') {
        summary = `Escrow released to the provider on ${formatIsoTimestamp(
            checkoutRecord.outcomeProtection.release?.releasedAt
        )} UTC after buyer validation completed.`
    } else if (checkoutRecord?.outcomeProtection.credits.status === 'issued') {
        summary =
            checkoutRecord.outcomeProtection.credits.reason ??
            'Automatic credits were issued and the provider payout remains frozen.'
    } else if (checkoutRecord?.lifecycleState === 'DISPUTE_OPEN') {
        summary =
            checkoutRecord.outcomeProtection.validation.note ??
            'A protected evaluation dispute is open and settlement is frozen pending review.'
    }

    const highlights = checkoutRecord
        ? [
            `Escrow hold: ${formatUsd(checkoutRecord.funding.escrowHoldUsd)}`,
            `Contract state: ${CONTRACT_STATE_LABELS[checkoutRecord.lifecycleState]}`,
            `Validation: ${titleCase(checkoutRecord.outcomeProtection.validation.status)}`,
            checkoutRecord.outcomeProtection.credits.status === 'issued'
                ? `Automatic credit: ${formatUsd(checkoutRecord.outcomeProtection.credits.amountUsd)}`
                : 'No automatic credits issued',
            failedChecks.length > 0
                ? `Failed release checks: ${failedChecks.join(', ')}`
                : 'All named release checks currently pass'
        ]
        : failedChecks.length > 0
            ? failedChecks.map(item => `Outstanding check: ${item}`)
            : ['Release posture will strengthen after checkout and validation begin.']

    return {
        label: 'Release / refund / dispute',
        title: 'Settlement posture',
        status: releaseMeta.label,
        tone: toneFromReleaseState(context),
        summary,
        highlights,
        note: context.lifecycleRecord.releaseReadiness.recommendedAction
    }
}

const buildDuaArtifact = (context: DealRouteContext): DealArtifactPreview => {
    if (!context.checkoutRecord) {
        return {
            id: `${context.seed.dealId}-dua-preview`,
            artifactLabel: 'DUA preview',
            title: 'Due use agreement',
            status: 'Pending generation',
            tone: context.quote ? 'amber' : 'slate',
            summary: 'The DUA becomes the buyer-visible contract snapshot once governed checkout is funded.',
            highlights: [
                'Captures delivery mode, review window, and prohibited downstream actions.',
                'Binds release guardrails to the priced rights package.',
                'Hashes the agreement before workspace access begins.'
            ],
            note: context.quote ? `Ready to generate from quote ${context.quote.id}.` : undefined
        }
    }

    const { dua } = context.checkoutRecord

    return {
        id: dua.version,
        artifactLabel: 'DUA preview',
        title: 'Due use agreement',
        status: dua.accepted ? `Accepted · ${dua.version}` : `Preview · ${dua.version}`,
        tone: dua.accepted ? 'emerald' : 'amber',
        summary: dua.summary,
        highlights: [`Checksum ${dua.checksum}`, ...dua.clauses.slice(0, 2)],
        note: dua.acceptedAt ? `Accepted ${formatIsoTimestamp(dua.acceptedAt)} UTC` : 'Awaiting buyer acceptance'
    }
}

const buildEvidencePackArtifact = (
    reviewId: string | null,
    evidencePack: EvidencePack | null,
    providerSubmission: ProviderDatasetSubmissionRecord | null
): DealArtifactPreview => {
    if (!evidencePack && providerSubmission) {
        return {
            id: providerSubmission.evidencePackId,
            artifactLabel: 'Evidence pack preview',
            title: 'Provider submission evidence pack',
            status: providerSubmission.dossierBinding.readinessStatus,
            tone: 'cyan',
            summary: providerSubmission.dossierBinding.readinessDetail,
            highlights: [
                `${providerSubmission.fileIntegrity.fileName} · ${providerSubmission.fileIntegrity.checksumStatus}`,
                `${providerSubmission.schemaReview.restrictedFields.length} restricted field(s) and ${providerSubmission.schemaReview.localOnlyFields.length} local-only field(s) from schema review`,
                `${providerSubmission.accessPackageSnapshot.deliveryDetail.label} · ${providerSubmission.accessPackageSnapshot.usageRights.label}`
            ],
            note: `Bound to review ${providerSubmission.reviewId}`
        }
    }

    if (!evidencePack) {
        return {
            id: `${reviewId ?? 'seed'}-evidence-pack`,
            artifactLabel: 'Evidence pack preview',
            title: 'Governance evidence pack',
            status: reviewId ? 'Seeded but not attached' : 'No review linked',
            tone: reviewId ? 'amber' : 'slate',
            summary: 'Approval-ready evidence packs surface rights, deployment, and evaluation controls without exposing raw data.',
            highlights: adminVisibilityBoundaries[0]
                ? [
                    adminVisibilityBoundaries[0].visibleToAdmins,
                    adminVisibilityBoundaries[0].hiddenFromAdmins
                ]
                : ['Metadata-first visibility remains active until the relevant review stage unlocks.']
        }
    }

    return {
        id: evidencePack.id,
        artifactLabel: 'Evidence pack preview',
        title: evidencePack.name,
        status: evidencePack.status,
        tone: toneFromPackStatus(evidencePack.status),
        summary: evidencePack.scope,
        highlights: [`Owner ${evidencePack.owner}`, ...evidencePack.contents.slice(0, 2)],
        note: evidencePack.blocker ?? `Updated ${evidencePack.updatedAt}`
    }
}

const buildApprovalMemoArtifact = (
    context: DealRouteContext,
    reviewId: string | null,
    blockers: ApprovalBlocker[]
): DealArtifactPreview => {
    if (!context.lifecycleRecord) {
        return {
            id: `${context.seed.dealId}-approval`,
            artifactLabel: 'Approval memo preview',
            title: 'Unified approval memo',
            status: 'Awaiting lifecycle record',
            tone: 'slate',
            summary: 'Approval rationale will attach here once a live deal lifecycle record is available.',
            highlights: ['Privacy, legal, governance, provider, and commercial signoff will converge in later steps.']
        }
    }

    const rightsMeta = rightsRiskMeta[context.lifecycleRecord.rightsRisk.level]
    const releaseMeta = releaseReadinessMeta[context.lifecycleRecord.releaseReadiness.status]
    const tone =
        context.lifecycleRecord.approvalDisposition === 'blocked'
            ? 'rose'
            : context.lifecycleRecord.approvalDisposition === 'human_review'
                ? 'amber'
                : releaseMeta.tone === 'emerald'
                    ? 'emerald'
                    : 'cyan'

    return {
        id: `${context.lifecycleRecord.id}-approval`,
        artifactLabel: 'Approval memo preview',
        title: 'Unified approval memo',
        status: `${rightsMeta.label} · ${releaseMeta.label}`,
        tone,
        summary: context.lifecycleRecord.nextAction,
        highlights:
            blockers.length > 0
                ? blockers.slice(0, 2).map(blocker => `${blocker.severity} · ${blocker.blocker}`)
                : context.lifecycleRecord.signals.slice(0, 3),
        note: reviewId ? `Bound to review ${reviewId}` : 'No review id linked yet'
    }
}

const buildDisputeArtifact = (
    context: DealRouteContext,
    incidentRecord: IncidentEvidenceRecord | null
): DealArtifactPreview => {
    if (incidentRecord) {
        return {
            id: incidentRecord.id,
            artifactLabel: 'Dispute summary preview',
            title: 'Incident and dispute summary',
            status: `${incidentRecord.severity} · ${incidentRecord.status}`,
            tone: incidentRecord.status === 'Contained' ? 'amber' : 'rose',
            summary: incidentRecord.title,
            highlights: [
                incidentRecord.residencyImpact,
                `Evidence pack ${incidentRecord.evidencePackId}`,
                `Next action: ${incidentRecord.nextAction}`
            ],
            note: `SLA window ${incidentRecord.slaWindow}`
        }
    }

    if (context.checkoutRecord?.outcomeProtection.credits.status === 'issued') {
        const issueLabels =
            context.checkoutRecord.outcomeProtection.validation.issueTypes.length > 0
                ? context.checkoutRecord.outcomeProtection.validation.issueTypes.map(
                    issue => outcomeIssueMeta[issue].label
                )
                : ['Protected commitment miss']

        return {
            id: `${context.checkoutRecord.id}-credit`,
            artifactLabel: 'Dispute summary preview',
            title: 'Automatic credit summary',
            status: 'Credit issued',
            tone: 'rose',
            summary:
                context.checkoutRecord.outcomeProtection.credits.reason ??
                'Automatic credits were issued because a protected commitment missed.',
            highlights: [
                `Credit amount ${formatUsd(context.checkoutRecord.outcomeProtection.credits.amountUsd)}`,
                `Issue types: ${issueLabels.join(', ')}`,
                context.checkoutRecord.outcomeProtection.validation.note ?? 'Escrow remains frozen pending review.'
            ]
        }
    }

    if (context.checkoutRecord?.lifecycleState === 'RELEASED_TO_PROVIDER') {
        return {
            id: `${context.checkoutRecord.id}-release`,
            artifactLabel: 'Dispute summary preview',
            title: 'Settlement result',
            status: 'Released to provider',
            tone: 'emerald',
            summary: 'No dispute is open. Buyer validation completed and escrow was released.',
            highlights: [
                `Released ${formatIsoTimestamp(context.checkoutRecord.outcomeProtection.release?.releasedAt)} UTC`,
                'Protected evaluation completed without active incident carryover.',
                'Audit trail remains exportable for review.'
            ]
        }
    }

    return {
        id: `${context.seed.dealId}-dispute`,
        artifactLabel: 'Dispute summary preview',
        title: 'Dispute and exception summary',
        status: 'No open dispute',
        tone: 'slate',
        summary: 'No dispute or incident is currently attached to this deal route.',
        highlights: [
            'Escrow stays under release guardrails until buyer validation completes.',
            'Exception handling remains audit-linked if a commitment miss appears.'
        ]
    }
}

export const buildDealDossierProofBundle = (
    context: DealRouteContext
): DealDossierProofBundle => {
    const reviewId = resolveReviewId(context)
    const providerSubmission = context.dataset
        ? getProviderDatasetSubmissionByDatasetId(context.dataset.id)
        : null
    const evidencePack = reviewId ? evidencePacks.find(item => item.reviewId === reviewId) ?? null : null
    const blockers = reviewId ? approvalBlockers.filter(item => item.reviewId === reviewId) : []
    const matchedEvidenceEvents = reviewId
        ? evidenceEvents.filter(item => item.reviewId === reviewId)
        : []
    const incidentRecord = reviewId
        ? incidentEvidenceRecords.find(item => item.reviewId === reviewId) ?? null
        : null
    const deploymentSurface = reviewId
        ? deploymentSurfaces.find(item => item.reviewId === reviewId) ?? null
        : null
    const lifecycleState = inferContractState(context)
    const contractId = context.checkoutRecord?.contractId ?? `CTR-${context.seed.dealId}`
    const contractTimeline = buildDemoAuditTimeline(contractId, lifecycleState)
    const reviewTimeline = matchedEvidenceEvents.map(event =>
        buildEvidenceAuditEvent(reviewId ?? 'seed', event, lifecycleState)
    )
    const incidentTimeline = incidentRecord
        ? [buildIncidentAuditEvent(reviewId ?? 'seed', incidentRecord, lifecycleState)]
        : []

    const auditTimeline = [...contractTimeline, ...reviewTimeline, ...incidentTimeline].sort(
        (left, right) => parseTimelineTimestamp(left.at) - parseTimelineTimestamp(right.at)
    )

    return {
        reviewId,
        evidencePack,
        approvalBlockers: blockers,
        evidenceEvents: matchedEvidenceEvents,
        incidentRecord,
        deploymentSurface,
        auditTimeline,
        evaluationState: buildEvaluationState(context),
        settlementState: buildSettlementState(context),
        artifactPreviews: [
            buildDuaArtifact(context),
            buildEvidencePackArtifact(reviewId, evidencePack, providerSubmission),
            buildApprovalMemoArtifact(context, reviewId, blockers),
            buildDisputeArtifact(context, incidentRecord)
        ]
    }
}
