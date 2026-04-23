import { getAccessPackageForDataset } from '../data/datasetAccessPackageData'
import {
    getProviderDatasetSubmissionByDatasetId,
    getProviderDossierBindingByDealId
} from './providerDatasetSubmission'
import {
    getMinimumTrustClarificationState,
    getDatasetTrustSummaryRows,
    trustSignalStateLabel,
    type DatasetTrustSeverity
} from './datasetTrustProfile'
import { buildDealDossierProofBundle, type DealArtifactPreviewTone } from './dealArtifactPreview'
import type { DealRouteContext } from './dealDossier'

export type ProviderPacketApproverStatus = 'Signed' | 'Pending' | 'In review'
export type ProviderPacketExceptionSeverity = 'Low' | 'Medium' | 'High'

export type ProviderPacketDraft = {
    publishingAuthorityConfirmed: boolean
    useBoundariesConfirmed: boolean
    residencyRestrictionsConfirmed: boolean
    workingNote: string
    updatedBy: string
    updatedAt?: string
}

export type ProviderPacketApprover = {
    role: string
    name: string
    organization: string
    status: ProviderPacketApproverStatus
    note: string
}

export type ProviderPacketException = {
    id: string
    title: string
    detail: string
    severity: ProviderPacketExceptionSeverity
    owner: string
    resolution: string
}

export type ProviderRightsPacket = {
    id: string
    dealId: string
    reviewId: string | null
    providerInstitution: string
    providerType: string
    buyerViewSummary: string
    overallStatus: string
    overallTone: DealArtifactPreviewTone
    publishingAuthority: {
        status: string
        tone: DealArtifactPreviewTone
        owner: string
        role: string
        instrument: string
        scope: string[]
        summary: string
    }
    provenance: {
        confidenceScore: number
        confidenceLabel: string
        tone: DealArtifactPreviewTone
        summary: string
        sourceClasses: string[]
        controlNotes: string[]
        caveats: string[]
    }
    allowedUse: {
        allowed: string[]
        prohibited: string[]
        controls: string[]
    }
    geography: {
        allowedProcessing: string[]
        restrictedProcessing: string[]
        transferReview: string
        posture: string
        tone: DealArtifactPreviewTone
    }
    namedApprovers: ProviderPacketApprover[]
    unresolvedExceptions: ProviderPacketException[]
    caveats: string[]
    references: Array<{
        label: string
        value: string
    }>
}

type ProviderRightsSeed = {
    institutionName: string
    institutionType: string
    buyerViewSummary: string
    authorityOwner: string
    authorityRole: string
    publishingInstrument: string
    sourceClasses: string[]
    sourceBasis: string[]
    blockedMovement: string[]
    extraCaveats: string[]
    approvers: Array<{
        role: string
        name: string
        organization: string
    }>
}

const PROVIDER_PACKET_STORAGE_KEY = 'Redoubt:providerRightsPacketDrafts'

const PROVIDER_RIGHTS_SEEDS: Record<string, ProviderRightsSeed> = {
    'DL-1001': {
        institutionName: 'Asteria Climate Exchange',
        institutionType: 'Climate data consortium',
        buyerViewSummary:
            'Asteria Climate Exchange is the publishing institution behind this climate evaluation packet. The packet summarizes delegated publishing authority, source composition, and the residency caveats a buyer should understand before protected evaluation begins.',
        authorityOwner: 'Mina Qadri',
        authorityRole: 'Chief data stewardship lead',
        publishingInstrument: 'Consortium publishing mandate v2026.2',
        sourceClasses: ['Ground-station telemetry', 'Satellite weather feeds', 'Regional climate exchange contributions'],
        sourceBasis: [
            'Contributor agreements delegate packaging and publication to the consortium steward.',
            'Monthly reconciliation reports are attached before new evaluation cohorts are opened.',
            'Provider identity remains shielded until approval and release conditions permit disclosure.'
        ],
        blockedMovement: [
            'No unrestricted export into non-governed buyer environments before transfer review.',
            'UAE-directed review lanes require explicit export-matrix confirmation before wider distribution.'
        ],
        extraCaveats: [
            'Coastal wind variance still requires post-processing in a small subset of grids.',
            'High-altitude microclimates remain sparse outside major station networks.'
        ],
        approvers: [
            { role: 'Publishing authority', name: 'Mina Qadri', organization: 'Asteria Climate Exchange' },
            { role: 'Legal and rights review', name: 'Rami Saeed', organization: 'Asteria Climate Exchange' },
            { role: 'Residency steward', name: 'Huda Karim', organization: 'Asteria Climate Exchange' }
        ]
    },
    'DL-1002': {
        institutionName: 'Northshore Market Data Trust',
        institutionType: 'Venue-governed market data publisher',
        buyerViewSummary:
            'Northshore Market Data Trust packages venue-sensitive replay data for governed evaluation only. The packet makes the publishing basis and replay restrictions legible before any buyer is admitted to the vault workspace.',
        authorityOwner: 'Jonas Ilyas',
        authorityRole: 'Head of market-data entitlements',
        publishingInstrument: 'Venue replay entitlement schedule v2026.1',
        sourceClasses: ['Consolidated trade feed deltas', 'Quote replay archives', 'Venue entitlement records'],
        sourceBasis: [
            'Replay rights are delegated through venue-specific entitlement schedules.',
            'Vault delivery stays inside replay-only environments with mandatory audit traces.',
            'Commercial rights remain narrower than customer-facing production use until amendment.'
        ],
        blockedMovement: [
            'No raw packet export outside the governed replay vault.',
            'Customer-facing redistribution remains blocked unless separately amended.'
        ],
        extraCaveats: [
            'Venue package boundaries still require buyer-side review before any production expansion discussion.',
            'Non-replay derivatives remain subject to benchmark and redistribution controls.'
        ],
        approvers: [
            { role: 'Publishing authority', name: 'Jonas Ilyas', organization: 'Northshore Market Data Trust' },
            { role: 'Entitlements counsel', name: 'Talia Menon', organization: 'Northshore Market Data Trust' },
            { role: 'Operational reviewer', name: 'Nadia Petrova', organization: 'Northshore Market Data Trust' }
        ]
    },
    'DL-1003': {
        institutionName: 'MetroSight Mobility Consortium',
        institutionType: 'Municipal mobility data consortium',
        buyerViewSummary:
            'MetroSight Mobility Consortium governs this operational telemetry package. The packet shows which planning uses are permitted, which regional lanes are approved, and what still needs clarification before buyer release.',
        authorityOwner: 'Faris Nadeem',
        authorityRole: 'Regional mobility data custodian',
        publishingInstrument: 'Municipal telemetry publication charter v2026.4',
        sourceClasses: ['Sensor network telemetry', 'Regional transport operations feeds', 'Aggregated congestion models'],
        sourceBasis: [
            'Municipal operating entities delegated publication to the regional consortium under planning-only rights.',
            'Coordinate suppression and low-density controls are enforced before governed evaluation access.',
            'Regional scopes remain bounded to approved planning and forecasting workflows.'
        ],
        blockedMovement: [
            'No direct location joins or unrestricted raw coordinate exports.',
            'Cross-region delivery remains subject to consortium and governance review.'
        ],
        extraCaveats: [
            'Some downstream model-output uses still require clarification before provider release.',
            'Regional streaming routes should stay inside approved GCC lanes where possible.'
        ],
        approvers: [
            { role: 'Publishing authority', name: 'Faris Nadeem', organization: 'MetroSight Mobility Consortium' },
            { role: 'Planning rights counsel', name: 'Sara Othman', organization: 'MetroSight Mobility Consortium' },
            { role: 'Regional residency steward', name: 'Imran Vohra', organization: 'MetroSight Mobility Consortium' }
        ]
    }
}

const DEFAULT_PACKET_DRAFTS: Record<string, ProviderPacketDraft> = {
    'DL-1001': {
        publishingAuthorityConfirmed: true,
        useBoundariesConfirmed: true,
        residencyRestrictionsConfirmed: false,
        workingNote: 'Local export restriction matrix is still being attached before buyer-facing release.',
        updatedBy: 'Provider operations'
    },
    'DL-1002': {
        publishingAuthorityConfirmed: true,
        useBoundariesConfirmed: true,
        residencyRestrictionsConfirmed: true,
        workingNote: 'Replay-only and redistribution limits are aligned to the current venue entitlement schedule.',
        updatedBy: 'Provider operations'
    },
    'DL-1003': {
        publishingAuthorityConfirmed: true,
        useBoundariesConfirmed: false,
        residencyRestrictionsConfirmed: true,
        workingNote: 'Clarifying whether downstream simulation outputs remain planning-only before final buyer release.',
        updatedBy: 'Provider operations'
    }
}

const severityWeight: Record<DatasetTrustSeverity, number> = {
    low: 0,
    medium: 1,
    high: 2
}

const formatSavedAt = (value?: string) => {
    if (!value) return 'Not saved yet'

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

const getDefaultDraft = (dealId?: string | null): ProviderPacketDraft => {
    const fallback: ProviderPacketDraft = {
        publishingAuthorityConfirmed: false,
        useBoundariesConfirmed: false,
        residencyRestrictionsConfirmed: false,
        workingNote: '',
        updatedBy: 'Provider operations'
    }

    if (!dealId) return fallback
    const seeded = DEFAULT_PACKET_DRAFTS[dealId]
    if (!seeded) return fallback
    return { ...seeded }
}

const loadDraftMap = () => {
    if (typeof window === 'undefined') return {} as Record<string, ProviderPacketDraft>
    const raw = window.localStorage.getItem(PROVIDER_PACKET_STORAGE_KEY)
    if (!raw) return {} as Record<string, ProviderPacketDraft>

    try {
        const parsed = JSON.parse(raw) as Record<string, ProviderPacketDraft>
        return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
        return {} as Record<string, ProviderPacketDraft>
    }
}

const saveDraftMap = (value: Record<string, ProviderPacketDraft>) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(PROVIDER_PACKET_STORAGE_KEY, JSON.stringify(value))
}

const toExceptionSeverity = (severity: DatasetTrustSeverity): ProviderPacketExceptionSeverity => {
    if (severity === 'high') return 'High'
    if (severity === 'medium') return 'Medium'
    return 'Low'
}

const toneFromExceptionSeverity = (
    exceptions: ProviderPacketException[],
    draft: ProviderPacketDraft
): { label: string; tone: DealArtifactPreviewTone } => {
    if (exceptions.some(item => item.severity === 'High')) {
        return { label: 'Exceptions open', tone: 'rose' }
    }

    if (
        !draft.publishingAuthorityConfirmed ||
        !draft.useBoundariesConfirmed ||
        !draft.residencyRestrictionsConfirmed ||
        exceptions.length > 0
    ) {
        return { label: 'Buyer-visible with caveats', tone: 'amber' }
    }

    return { label: 'Buyer view ready', tone: 'emerald' }
}

const buildTrustExceptions = (context: DealRouteContext) => {
    if (!context.dataset) return [] as ProviderPacketException[]

    return getDatasetTrustSummaryRows(context.dataset.trustProfile)
        .filter(row => row.state !== 'documented')
        .sort((left, right) => severityWeight[right.severity] - severityWeight[left.severity])
        .slice(0, 2)
        .map(row => ({
            id: `trust-${context.seed.dealId}-${row.key}`,
            title: row.label,
            detail: `${row.value} ${trustSignalStateLabel(row.state)}`,
            severity: toExceptionSeverity(row.severity),
            owner: 'Provider evidence desk',
            resolution: 'Attach provider or reviewer confirmation to the packet before widening buyer access.'
        }))
}

export const loadProviderPacketDraft = (dealId?: string | null) => {
    const drafts = loadDraftMap()
    if (!dealId) return getDefaultDraft(null)
    return drafts[dealId] ? { ...getDefaultDraft(dealId), ...drafts[dealId] } : getDefaultDraft(dealId)
}

export const saveProviderPacketDraft = (
    dealId: string,
    draft: ProviderPacketDraft
) => {
    const drafts = loadDraftMap()
    const nextDraft: ProviderPacketDraft = {
        ...draft,
        updatedAt: new Date().toISOString()
    }

    saveDraftMap({
        ...drafts,
        [dealId]: nextDraft
    })

    return nextDraft
}

export const buildProviderRightsPacket = (
    context: DealRouteContext,
    draft: ProviderPacketDraft
): ProviderRightsPacket => {
    const seed = PROVIDER_RIGHTS_SEEDS[context.seed.dealId] ?? {
        institutionName: 'Shielded provider institution',
        institutionType: 'Contributing institution',
        buyerViewSummary:
            'This packet summarizes why the provider can publish the dataset and which restrictions still apply before buyer release.',
        authorityOwner: 'Provider steward',
        authorityRole: 'Publishing authority owner',
        publishingInstrument: 'Provider publication schedule',
        sourceClasses: ['Governed source package'],
        sourceBasis: ['Provider authority statement is still being assembled.'],
        blockedMovement: ['No unrestricted movement outside governed evaluation until approval completes.'],
        extraCaveats: ['Provider legitimacy packet is still being expanded.'],
        approvers: [
            { role: 'Publishing authority', name: 'Provider steward', organization: 'Shielded institution' }
        ]
    }
    const proofBundle = buildDealDossierProofBundle(context)
    const providerSubmission = context.dataset ? getProviderDatasetSubmissionByDatasetId(context.dataset.id) : null
    const providerBinding = getProviderDossierBindingByDealId(context.seed.dealId)
    const submittedReviewId = providerBinding?.reviewId ?? providerSubmission?.reviewId ?? null
    const accessPackage = context.dataset ? getAccessPackageForDataset(context.dataset.id) : null
    const trustClarificationState = context.dataset
        ? getMinimumTrustClarificationState(context.dataset.trustProfile)
        : 'documented'
    const trustExceptions = buildTrustExceptions(context)
    const unresolvedExceptions: ProviderPacketException[] = [
        ...proofBundle.approvalBlockers.map(blocker => ({
            id: blocker.id,
            title: blocker.blocker,
            detail: `${blocker.organization} review blocker owned by ${blocker.owner}.`,
            severity: blocker.severity,
            owner: blocker.owner,
            resolution: `Resolve before ${blocker.deadline} and update the active review packet.`
        })),
        ...trustExceptions
    ].slice(0, 4)

    const publishingTone: DealArtifactPreviewTone = draft.publishingAuthorityConfirmed ? 'emerald' : 'amber'
    const provenancePenalty =
        (trustClarificationState === 'provider_confirmation' ? 6 : trustClarificationState === 'reviewer_confirmation' ? 11 : 0) +
        unresolvedExceptions.reduce((total, exception) => total + (exception.severity === 'High' ? 4 : exception.severity === 'Medium' ? 2 : 0), 0)
    const provenanceBase = context.dataset?.confidenceScore ?? 88
    const confidenceScore = Math.max(62, Math.min(99, provenanceBase - provenancePenalty))
    const confidenceLabel =
        confidenceScore >= 93 ? 'High confidence' : confidenceScore >= 84 ? 'Moderate confidence' : 'Guarded confidence'
    const provenanceTone: DealArtifactPreviewTone =
        confidenceScore >= 93 ? 'emerald' : confidenceScore >= 84 ? 'cyan' : 'amber'

    const packetDisposition = toneFromExceptionSeverity(unresolvedExceptions, draft)
    const publishingScope = [
        accessPackage
            ? `${accessPackage.fieldAccess.label} scoped to ${accessPackage.usageRights.label.toLowerCase()}`
            : 'Rights scope still pending packet assembly',
        accessPackage
            ? `${accessPackage.deliveryDetail.label} delivery for ${accessPackage.term.label.toLowerCase()}`
            : 'Delivery and term pending',
        accessPackage
            ? `${accessPackage.exclusivity.label} commercial posture`
            : 'Commercial exclusivity posture pending'
    ]

    const caveats = [
        ...(context.dataset?.preview.limitations.slice(0, 2) ?? []),
        ...seed.extraCaveats,
        draft.workingNote ? `Provider note: ${draft.workingNote}` : null
    ].filter((item): item is string => Boolean(item))

    const namedApprovers: ProviderPacketApprover[] = [
        ...seed.approvers.map(approver => {
            const status: ProviderPacketApproverStatus =
                approver.role === 'Publishing authority'
                    ? draft.publishingAuthorityConfirmed
                        ? 'Signed'
                        : 'Pending'
                    : approver.role.toLowerCase().includes('residency')
                        ? draft.residencyRestrictionsConfirmed
                            ? 'Signed'
                            : 'Pending'
                        : draft.useBoundariesConfirmed
                            ? 'Signed'
                            : 'In review'

            return {
                ...approver,
                status,
                note:
                    approver.role === 'Publishing authority'
                        ? `Bound to ${seed.publishingInstrument}.`
                        : approver.role.toLowerCase().includes('residency')
                            ? 'Confirms regional handling and transfer boundaries.'
                            : 'Confirms allowed-use and commercial packaging boundaries.'
            }
        }),
        ...(proofBundle.evidencePack
            ? [
                {
                    role: 'Redoubt packet reviewer',
                    name: proofBundle.evidencePack.owner,
                    organization: 'Redoubt review operations',
                    status: proofBundle.evidencePack.status === 'Ready' ? 'Signed' : 'In review',
                    note: `${proofBundle.evidencePack.status} evidence pack for review ${proofBundle.reviewId ?? 'pending'}.`
                } satisfies ProviderPacketApprover
            ]
            : [])
    ]

    const packetId = providerSubmission?.providerPacketId ?? `PKT-${context.seed.dealId}`
    const reviewId = proofBundle.reviewId ?? submittedReviewId
    const authorityOwner = providerSubmission?.providerPublishing.publishingAuthority ?? seed.authorityOwner
    const authorityRole = providerSubmission ? 'Provider publishing authority' : seed.authorityRole
    const publishingInstrument = providerSubmission ? `Submission ${providerSubmission.submissionId}` : seed.publishingInstrument

    return {
        id: packetId,
        dealId: context.seed.dealId,
        reviewId,
        providerInstitution: providerSubmission?.providerPublishing.publishingAuthority ?? seed.institutionName,
        providerType: providerSubmission?.providerPublishing.institutionType ?? seed.institutionType,
        buyerViewSummary: providerSubmission?.providerPublishing.buyerViewSummary ?? seed.buyerViewSummary,
        overallStatus: packetDisposition.label,
        overallTone: packetDisposition.tone,
        publishingAuthority: {
            status: draft.publishingAuthorityConfirmed ? 'Attested for buyer view' : 'Pending provider attestation',
            tone: publishingTone,
            owner: authorityOwner,
            role: authorityRole,
            instrument: publishingInstrument,
            scope: publishingScope,
            summary: `${authorityOwner}, ${authorityRole.toLowerCase()}, is the named authority for this packet and the current publication scope is limited to the rights schedule summarized below.`
        },
        provenance: {
            confidenceScore,
            confidenceLabel,
            tone: provenanceTone,
            summary:
                trustClarificationState === 'documented'
                    ? 'Provider authority, source composition, and audit cues are documented well enough for buyer evaluation.'
                    : `Packet remains credible but still carries ${trustSignalStateLabel(trustClarificationState).toLowerCase()} on part of the trust surface.`,
            sourceClasses: seed.sourceClasses,
            controlNotes: [
                ...(providerSubmission
                    ? [
                        providerSubmission.schemaReview.packagingPosture,
                        `${providerSubmission.schemaReview.restrictedFields.length} restricted field(s), ${providerSubmission.schemaReview.localOnlyFields.length} local-only field(s), and ${providerSubmission.schemaReview.transferSensitiveFields.length} transfer-sensitive field(s) carried from schema review.`,
                        `${providerSubmission.fileIntegrity.fileName} · ${providerSubmission.fileIntegrity.checksumStatus}`
                    ]
                    : []),
                ...seed.sourceBasis,
                ...(context.dataset?.providerNotes.slice(0, 2) ?? [])
            ],
            caveats
        },
        allowedUse: {
            allowed: context.dataset?.access.allowedUsage.slice(0, 3) ?? [],
            prohibited: [
                accessPackage
                    ? `${accessPackage.advancedRights.redistribution} redistribution`
                    : 'Redistribution remains prohibited until specifically amended.',
                accessPackage
                    ? `No copy-out path beyond ${accessPackage.accessMethod.label.toLowerCase()} delivery`
                    : 'No unrestricted copy-out path is enabled.',
                'Provider identity disclosure stays governed by approval and release controls.'
            ],
            controls: [
                accessPackage?.deliveryDetail.providerSummary ?? 'Governed delivery detail will attach here.',
                accessPackage?.security.watermarking ?? 'Watermarking posture pending.',
                accessPackage?.advancedRights.auditLogging
                    ? `${accessPackage.advancedRights.auditLogging} audit logging`
                    : 'Audit logging remains mandatory.'
            ]
        },
        geography: {
            allowedProcessing: [
                accessPackage?.geography.label ?? 'Regional scope pending',
                proofBundle.deploymentSurface?.residencyPosture ?? 'Governed review boundary'
            ],
            restrictedProcessing: seed.blockedMovement,
            transferReview:
                proofBundle.deploymentSurface?.blocker ??
                'Cross-border movement requires provider and governance review before release.',
            posture: accessPackage?.geography.label ?? 'Review pending',
            tone:
                accessPackage?.geography.label === 'Global' ||
                accessPackage?.geography.label === 'US / EU venue scope' ||
                accessPackage?.geography.label === 'US / EU utility scope'
                    ? 'amber'
                    : 'emerald'
        },
        namedApprovers,
        unresolvedExceptions,
        caveats,
        references: [
            { label: 'Review id', value: reviewId ?? 'Not linked' },
            { label: 'Evidence pack', value: proofBundle.evidencePack?.id ?? providerSubmission?.evidencePackId ?? 'Pending packet' },
            { label: 'Access package', value: accessPackage?.id ?? 'Pending access package' },
            { label: 'Deal object', value: context.seed.dealId },
            { label: 'Last provider draft', value: formatSavedAt(draft.updatedAt) }
        ]
    }
}
