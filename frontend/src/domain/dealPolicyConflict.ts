import { getSeededDealRouteRecordByDatasetId } from '../data/dealDossierData'
import { buildDealDossierProofBundle, type DealArtifactPreviewTone } from './dealArtifactPreview'
import { getDealRouteContextById, type DealRouteContext } from './dealDossier'
import {
    geographyOptions,
    usageRightOptions,
    deliveryModeOptions,
    type RightsQuote,
    type RightsQuoteForm
} from './rightsQuoteBuilder'
import { buildProviderRightsPacket, loadProviderPacketDraft } from './providerRightsPacket'

export type DealPolicyConflictType =
    | 'denied_usage_rights'
    | 'residency_conflict'
    | 'cross_border_review'
    | 'provider_restriction_mismatch'
    | 'narrowed_scope'
    | 'reroute_escalation'

export type DealPolicyConflictSurface = 'quote' | 'dossier' | 'approval'

export type DealPolicyConflictAction = {
    label: string
    to: string
}

export type DealPolicyConflict = {
    id: string
    type: DealPolicyConflictType
    stateLabel: string
    severityLabel: 'High priority' | 'Needs review' | 'Scope updated'
    tone: DealArtifactPreviewTone
    title: string
    summary: string
    triggers: string[]
    recommendedPath: string
    actions: DealPolicyConflictAction[]
}

export type DealPolicyConflictModel = {
    label: string
    title: string
    summary: string
    tone: DealArtifactPreviewTone
    blockingCount: number
    conflicts: DealPolicyConflict[]
}

type BuildDealPolicyConflictOptions = {
    context: DealRouteContext
    surface: DealPolicyConflictSurface
    form?: RightsQuoteForm | null
    quote?: RightsQuote | null
    demo?: boolean
    adminView?: boolean
    reviewId?: string | null
}

type ConflictActionDescriptor = {
    label: string
    to: string | null
}

const getOptionLabel = (value: string, options: Array<{ value: string; label: string }>) =>
    options.find(option => option.value === value)?.label ?? value

const labelDeliveryMode = (value: RightsQuoteForm['deliveryMode']) =>
    getOptionLabel(value, deliveryModeOptions)

const labelUsageRight = (value: RightsQuoteForm['usageRight']) =>
    getOptionLabel(value, usageRightOptions)

const labelGeography = (value: RightsQuoteForm['geography']) =>
    getOptionLabel(value, geographyOptions)

const resolveQuoteShape = (
    context: DealRouteContext,
    form?: RightsQuoteForm | null,
    quote?: RightsQuote | null
) => form ?? quote?.input ?? context.quote?.input ?? null

const buildDatasetPath = (context: DealRouteContext, demo: boolean, segment: 'rights-quote' | 'escrow-checkout') =>
    demo
        ? `/demo/datasets/${context.seed.datasetId}/${segment}`
        : `/datasets/${context.seed.datasetId}/${segment}`

const buildConflictActions = (
    context: DealRouteContext,
    demo: boolean,
    adminView: boolean,
    reviewId: string | null,
    descriptors: ConflictActionDescriptor[]
) =>
    descriptors
        .map(descriptor => {
            if (!descriptor.to) return null
            return {
                label: descriptor.label,
                to: descriptor.to
            }
        })
        .filter((descriptor): descriptor is DealPolicyConflictAction => Boolean(descriptor))

const resolveWorkspaceOrDemoDealRoute = (
    context: DealRouteContext,
    demo: boolean,
    key: 'dossier' | 'provider-packet' | 'output-review'
) => (demo ? context.demoTargets[key] : context.routeTargets[key])

const resolveApprovalAction = (
    context: DealRouteContext,
    demo: boolean,
    adminView: boolean,
    reviewId: string | null
) => {
    if (demo) return null
    if (adminView && reviewId) return `/admin/application-review/${reviewId}/approval`
    return context.routeTargets.approval
}

const resolveNegotiationAction = (
    context: DealRouteContext,
    demo: boolean
) => (demo ? null : context.routeTargets.negotiation)

function buildClimateConflicts({
    context,
    demo,
    adminView,
    reviewId,
    quoteShape,
    surface
}: BuildDealPolicyConflictOptions & { quoteShape: RightsQuoteForm | null }) {
    const isDemo = demo ?? false
    const isAdminView = adminView ?? false
    const currentReviewId = reviewId ?? null
    const packet = buildProviderRightsPacket(context, loadProviderPacketDraft(context.seed.dealId))
    const proofBundle = buildDealDossierProofBundle(context)
    const requestedGlobalMovement =
        quoteShape?.geography === 'global' ||
        quoteShape?.deliveryMode === 'aggregated_export' ||
        quoteShape?.deliveryMode === 'encrypted_download'
    const broaderUseRequested =
        quoteShape?.usageRight === 'commercial_analytics' ||
        quoteShape?.usageRight === 'customer_facing'

    const conflicts: DealPolicyConflict[] = []

    if (requestedGlobalMovement || !loadProviderPacketDraft(context.seed.dealId).residencyRestrictionsConfirmed) {
        conflicts.push({
            id: `${context.seed.dealId}-cross-border-review`,
            type: 'cross_border_review',
            stateLabel: 'Cross-border review required',
            severityLabel: 'Needs review' as const,
            tone: requestedGlobalMovement ? 'amber' : 'cyan',
            title: 'Wider transfer lanes are still conditional',
            summary:
                'This climate packet can move through governed evaluation, but wider transfer, dual-region expansion, or aggregate export still require provider residency confirmation and governance review.',
            triggers: [
                `Current geography: ${labelGeography(quoteShape?.geography ?? 'single_region')}`,
                `Current delivery path: ${labelDeliveryMode(quoteShape?.deliveryMode ?? 'clean_room')}`,
                packet.geography.transferReview,
                proofBundle.approvalBlockers[0]?.blocker ?? 'Residency steward has not finished the export-matrix confirmation yet.'
            ],
            recommendedPath:
                'Keep the package inside a single-region governed lane or escalate to provider clarification and approval before widening geography.',
            actions: buildConflictActions(context, isDemo, isAdminView, currentReviewId, [
                { label: 'Open provider packet', to: resolveWorkspaceOrDemoDealRoute(context, isDemo, 'provider-packet') },
                { label: 'Open approval artifact', to: resolveApprovalAction(context, isDemo, isAdminView, currentReviewId) },
                { label: 'Open negotiation history', to: resolveNegotiationAction(context, isDemo) }
            ])
        })
    }

    if (surface !== 'quote' && broaderUseRequested) {
        conflicts.push({
            id: `${context.seed.dealId}-climate-scope`,
            type: 'narrowed_scope',
            stateLabel: 'Narrowed scope recommended',
            severityLabel: 'Scope updated' as const,
            tone: 'amber',
            title: 'Commercial output scope should stay narrower',
            summary:
                'The provider packet and active review copy still support internal resilience analysis better than broader commercial or customer-facing output rights.',
            triggers: [
                `Current use right: ${labelUsageRight(quoteShape?.usageRight ?? 'research')}`,
                context.request?.reviewerFeedback ?? 'Provider wants downstream model outputs described more narrowly before approval advances.',
                packet.allowedUse.prohibited[0] ?? 'Redistribution remains prohibited until amended.'
            ],
            recommendedPath:
                'Keep this deal on internal resilience outputs for now, then reopen negotiation only if a broader amendment is genuinely required.',
            actions: buildConflictActions(context, isDemo, isAdminView, currentReviewId, [
                { label: 'Refine rights package', to: buildDatasetPath(context, isDemo, 'rights-quote') },
                { label: 'Open negotiation history', to: resolveNegotiationAction(context, isDemo) }
            ])
        })
    }

    return conflicts
}

function buildReplayConflicts({
    context,
    demo,
    adminView,
    reviewId,
    quoteShape
}: BuildDealPolicyConflictOptions & { quoteShape: RightsQuoteForm | null }) {
    const isDemo = demo ?? false
    const isAdminView = adminView ?? false
    const currentReviewId = reviewId ?? null
    const packet = buildProviderRightsPacket(context, loadProviderPacketDraft(context.seed.dealId))
    const proofBundle = buildDealDossierProofBundle(context)
    const broadenedReplayRights =
        quoteShape?.usageRight === 'customer_facing' ||
        quoteShape?.redistributionRights === 'allowed' ||
        quoteShape?.deliveryMode === 'encrypted_download'

    if (broadenedReplayRights) {
        return [
            {
                id: `${context.seed.dealId}-denied-rights`,
                type: 'denied_usage_rights' as const,
                stateLabel: 'Denied usage rights',
                severityLabel: 'High priority' as const,
                tone: 'rose' as const,
                title: 'Replay entitlements do not permit this wider package',
                summary:
                    'The current venue replay entitlement schedule blocks redistribution, customer-facing outputs, and raw packet export until a separate amendment is negotiated.',
                triggers: [
                    `Current delivery path: ${labelDeliveryMode(quoteShape?.deliveryMode ?? 'clean_room')}`,
                    `Current use right: ${labelUsageRight(quoteShape?.usageRight ?? 'research')}`,
                    `Redistribution: ${quoteShape?.redistributionRights === 'allowed' ? 'Allowed' : 'Not allowed'}`,
                    packet.allowedUse.prohibited[0] ?? 'Venue schedule still blocks redistribution outside replay-only research.'
                ],
                recommendedPath:
                    'Reroute back to replay-only governed evaluation or reviewed aggregate export, then use negotiation and approval if you want to request a commercial amendment.',
                actions: buildConflictActions(context, isDemo, isAdminView, currentReviewId, [
                    { label: 'Refine rights package', to: buildDatasetPath(context, isDemo, 'rights-quote') },
                    { label: 'Open negotiation history', to: resolveNegotiationAction(context, isDemo) },
                    { label: 'Open provider packet', to: resolveWorkspaceOrDemoDealRoute(context, isDemo, 'provider-packet') }
                ])
            }
        ]
    }

    return [
        {
            id: `${context.seed.dealId}-replay-scope-narrowed`,
            type: 'narrowed_scope' as const,
            stateLabel: 'Narrowed scope applied',
            severityLabel: 'Scope updated' as const,
            tone: 'amber' as const,
            title: 'This deal stays inside replay-only research rights',
            summary:
                'The package is intentionally kept inside replay research and aggregate model diagnostics so it does not trigger a denied redistribution or customer-facing lane.',
            triggers: [
                context.request?.rightsFit ?? 'Reviewer confirmed the request fits research-only replay rights.',
                packet.allowedUse.prohibited[1] ?? 'No raw packet export remains permitted.',
                proofBundle.approvalBlockers[0]?.blocker ?? 'Commercial widening still needs explicit venue and governance review.'
            ],
            recommendedPath:
                'Treat the current scope as the safe operating lane. If buyers want broader product output later, send it through negotiation and a separate approval amendment.',
            actions: buildConflictActions(context, isDemo, isAdminView, currentReviewId, [
                { label: 'Open negotiation history', to: resolveNegotiationAction(context, isDemo) },
                { label: 'Open provider packet', to: resolveWorkspaceOrDemoDealRoute(context, isDemo, 'provider-packet') },
                { label: 'Open approval artifact', to: resolveApprovalAction(context, isDemo, isAdminView, currentReviewId) }
            ])
        }
    ]
}

function buildMobilityConflicts({
    context,
    demo,
    adminView,
    reviewId,
    quoteShape
}: BuildDealPolicyConflictOptions & { quoteShape: RightsQuoteForm | null }) {
    const isDemo = demo ?? false
    const isAdminView = adminView ?? false
    const currentReviewId = reviewId ?? null
    const packet = buildProviderRightsPacket(context, loadProviderPacketDraft(context.seed.dealId))
    const globalOrDownloadRequested =
        quoteShape?.geography === 'global' ||
        quoteShape?.deliveryMode === 'encrypted_download' ||
        quoteShape?.usageRight === 'customer_facing'

    if (globalOrDownloadRequested) {
        return [
            {
                id: `${context.seed.dealId}-residency-conflict`,
                type: 'residency_conflict' as const,
                stateLabel: 'Residency conflict',
                severityLabel: 'High priority' as const,
                tone: 'rose' as const,
                title: 'This package exceeds the approved regional mobility lane',
                summary:
                    'Mobility telemetry cannot move through unrestricted global or raw download lanes. The seeded deal is approved only for region-scoped planning outputs inside a governed workspace.',
                triggers: [
                    `Current geography: ${labelGeography(quoteShape?.geography ?? 'single_region')}`,
                    `Current delivery path: ${labelDeliveryMode(quoteShape?.deliveryMode ?? 'clean_room')}`,
                    `Current use right: ${labelUsageRight(quoteShape?.usageRight ?? 'research')}`,
                    packet.geography.restrictedProcessing[0] ?? 'Cross-region delivery remains subject to consortium and governance review.'
                ],
                recommendedPath:
                    'Reroute back to a single-region governed workspace or an aggregate planning-only package before expecting approval to continue.',
                actions: buildConflictActions(context, isDemo, isAdminView, currentReviewId, [
                    { label: 'Refine rights package', to: buildDatasetPath(context, isDemo, 'rights-quote') },
                    { label: 'Open negotiation history', to: resolveNegotiationAction(context, isDemo) },
                    { label: 'Open approval artifact', to: resolveApprovalAction(context, isDemo, isAdminView, currentReviewId) }
                ])
            }
        ]
    }

    return [
        {
            id: `${context.seed.dealId}-regional-reroute`,
            type: 'reroute_escalation' as const,
            stateLabel: 'Rerouted to approved regional lane',
            severityLabel: 'Needs review' as const,
            tone: 'amber' as const,
            title: 'The deal was narrowed into a planning-only regional posture',
            summary:
                'This mobility evaluation stays inside aggregate planning outputs with region-scoped logging so the provider and governance teams can keep location controls intact.',
            triggers: [
                context.request?.rightsFit ?? 'Reviewer aligned the deal to planning and forecasting scope.',
                packet.geography.transferReview,
                packet.allowedUse.prohibited[0] ?? 'Direct location joins and unrestricted copy-out remain prohibited.'
            ],
            recommendedPath:
                'Keep the current regional lane if it satisfies the buyer. If not, escalate through negotiation and approval before changing deployment or geography.',
            actions: buildConflictActions(context, isDemo, isAdminView, currentReviewId, [
                { label: 'Open negotiation history', to: resolveNegotiationAction(context, isDemo) },
                { label: 'Open provider packet', to: resolveWorkspaceOrDemoDealRoute(context, isDemo, 'provider-packet') },
                { label: 'Open approval artifact', to: resolveApprovalAction(context, isDemo, isAdminView, currentReviewId) }
            ])
        }
    ]
}

export function buildDealPolicyConflictModel({
    context,
    surface,
    form,
    quote,
    demo = false,
    adminView = false,
    reviewId = null
}: BuildDealPolicyConflictOptions): DealPolicyConflictModel | null {
    const quoteShape = resolveQuoteShape(context, form, quote)

    let conflicts: DealPolicyConflict[] = []

    if (context.seed.dealId === 'DL-1001') {
        conflicts = buildClimateConflicts({ context, surface, form, quote, demo, adminView, reviewId, quoteShape })
    } else if (context.seed.dealId === 'DL-1002') {
        conflicts = buildReplayConflicts({ context, surface, form, quote, demo, adminView, reviewId, quoteShape })
    } else if (context.seed.dealId === 'DL-1003') {
        conflicts = buildMobilityConflicts({ context, surface, form, quote, demo, adminView, reviewId, quoteShape })
    }

    if (conflicts.length === 0) return null

    const blockingCount = conflicts.filter(conflict => conflict.tone === 'rose').length
    const tone =
        blockingCount > 0
            ? 'rose'
            : conflicts.some(conflict => conflict.tone === 'amber')
                ? 'amber'
                : 'cyan'

    return {
        label: 'Rights and residency conflict states',
        title: 'Policy conflicts and conditional lanes',
        summary:
            blockingCount > 0
                ? 'This deal currently includes one or more blocked lanes. Use the linked reroute or escalation paths before treating the package as approvable.'
                : 'This deal already carries scoped policy conditions. The UI below makes the hard parts explicit instead of hiding them behind generic warning copy.',
        tone,
        blockingCount,
        conflicts
    }
}

export function getDealPolicyConflictModelByDatasetId({
    datasetId,
    surface,
    form,
    quote,
    demo = false
}: {
    datasetId?: string | null
    surface: DealPolicyConflictSurface
    form?: RightsQuoteForm | null
    quote?: RightsQuote | null
    demo?: boolean
}) {
    const seed = getSeededDealRouteRecordByDatasetId(datasetId)
    if (!seed) return null

    const context = getDealRouteContextById(seed.dealId)
    if (!context) return null

    return buildDealPolicyConflictModel({
        context,
        surface,
        form,
        quote,
        demo
    })
}
