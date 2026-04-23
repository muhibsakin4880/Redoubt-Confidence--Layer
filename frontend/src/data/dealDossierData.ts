import { getDatasetDetailById } from './datasetDetailData'

export type DealSurfaceKey =
    | 'dossier'
    | 'provider-packet'
    | 'output-review'
    | 'approval'
    | 'negotiation'
    | 'residency-memo'
    | 'go-live'

export type DemoDealSurfaceKey = Extract<DealSurfaceKey, 'dossier' | 'provider-packet' | 'output-review'>
export type DealSurfaceAvailability = 'available' | 'placeholder'
export type DealSurfaceAvailabilityMap = Record<DealSurfaceKey, DealSurfaceAvailability>

export type DealSurfaceMeta = {
    label: string
    routeSegment: string | null
    summary: string
    reservedFor: string
}

export type SeededDealRouteRecord = {
    dealId: string
    label: string
    summary: string
    datasetId: string
    requestId: string | null
}

export const DEAL_SURFACE_META: Record<DealSurfaceKey, DealSurfaceMeta> = {
    dossier: {
        label: 'Evaluation Dossier',
        routeSegment: null,
        summary: 'Main shared deal object tying dataset, request, quote, approval, and evaluation state together.',
        reservedFor: 'Step 1'
    },
    'provider-packet': {
        label: 'Provider Rights & Provenance Packet',
        routeSegment: 'provider-packet',
        summary: 'Buyer-viewable and provider-editable legitimacy packet for publishing authority, provenance, and restrictions.',
        reservedFor: 'Phase 1'
    },
    'output-review': {
        label: 'Clean Room Output Review',
        routeSegment: 'output-review',
        summary: 'Operational decision surface for blocked exports, reviewer actions, watermark traces, and session controls.',
        reservedFor: 'Phase 1'
    },
    approval: {
        label: 'Unified Approval & Signoff',
        routeSegment: 'approval',
        summary: 'Shared signoff object for privacy, legal, governance, provider, and commercial approval.',
        reservedFor: 'Phase 2'
    },
    negotiation: {
        label: 'Clarification & Negotiation History',
        routeSegment: 'negotiation',
        summary: 'Structured buyer-provider questions, redlines, scope changes, and open clarifications.',
        reservedFor: 'Phase 2'
    },
    'residency-memo': {
        label: 'Residency & Deployment Decision Memo',
        routeSegment: 'residency-memo',
        summary: 'Per-deal memo covering allowed processing boundaries, blocked paths, approvers, and exceptions.',
        reservedFor: 'Phase 3'
    },
    'go-live': {
        label: 'Production Expansion & Go-Live',
        routeSegment: 'go-live',
        summary: 'Post-evaluation handoff covering rights amendment, deployment model, API controls, and operational readiness.',
        reservedFor: 'Phase 3'
    }
}

export const SEEDED_DEAL_ROUTES: SeededDealRouteRecord[] = [
    {
        dealId: 'DL-1001',
        label: 'Climate resilience evaluation',
        summary: 'Seeded deal route for the climate dataset, buyer request review, and future governed evaluation surfaces.',
        datasetId: '1',
        requestId: 'cl-204'
    },
    {
        dealId: 'DL-1002',
        label: 'Quant replay evaluation',
        summary: 'Seeded deal route for the financial tick package and future commercial release surfaces.',
        datasetId: '3',
        requestId: 'fx-320'
    },
    {
        dealId: 'DL-1003',
        label: 'Mobility planning evaluation',
        summary: 'Seeded deal route for municipal mobility review, regional controls, and future provider clarifications.',
        datasetId: '2',
        requestId: 'urb-147'
    }
]

export const DEFAULT_DEAL_ID = SEEDED_DEAL_ROUTES[0].dealId

export const SEEDED_SURFACE_AVAILABILITY: DealSurfaceAvailabilityMap = {
    dossier: 'available',
    'provider-packet': 'available',
    'output-review': 'available',
    approval: 'available',
    negotiation: 'available',
    'residency-memo': 'available',
    'go-live': 'available'
}

export const DERIVED_SURFACE_AVAILABILITY: DealSurfaceAvailabilityMap = {
    dossier: 'available',
    'provider-packet': 'available',
    'output-review': 'available',
    approval: 'placeholder',
    negotiation: 'placeholder',
    'residency-memo': 'placeholder',
    'go-live': 'placeholder'
}

const DERIVED_DEAL_ID_PREFIX = 'DL-DS-'

export const buildDerivedDealId = (datasetId: string) => `${DERIVED_DEAL_ID_PREFIX}${datasetId}`

export const getDatasetIdFromDerivedDealId = (dealId?: string | null) => {
    if (!dealId?.startsWith(DERIVED_DEAL_ID_PREFIX)) return null
    return dealId.slice(DERIVED_DEAL_ID_PREFIX.length) || null
}

export const getSeededDealRouteRecordById = (dealId?: string | null) =>
    SEEDED_DEAL_ROUTES.find(record => record.dealId === dealId) ?? null

export const getSeededDealRouteRecordByDatasetId = (datasetId?: string | null) =>
    SEEDED_DEAL_ROUTES.find(record => record.datasetId === datasetId) ?? null

export const getSeededDealRouteRecordByRequestId = (requestId?: string | null) =>
    requestId
        ? SEEDED_DEAL_ROUTES.find(record => record.requestId === requestId) ?? null
        : null

export const getDealRouteRecordByDatasetId = (datasetId?: string | null) => {
    if (!datasetId) return null
    const seeded = getSeededDealRouteRecordByDatasetId(datasetId)
    if (seeded) return seeded

    const dataset = getDatasetDetailById(datasetId)
    if (!dataset) return null

    return {
        dealId: buildDerivedDealId(datasetId),
        label: `${dataset.title} evaluation`,
        summary: dataset.description,
        datasetId,
        requestId: null
    }
}

export const getDealRouteRecordByRequestId = (requestId?: string | null) =>
    requestId
        ? SEEDED_DEAL_ROUTES.find(record => record.requestId === requestId) ?? null
        : null

export const buildDealPath = (dealId: string, surface: DealSurfaceKey = 'dossier') => {
    const routeSegment = DEAL_SURFACE_META[surface].routeSegment
    return routeSegment ? `/deals/${dealId}/${routeSegment}` : `/deals/${dealId}`
}

export const buildDemoDealPath = (
    dealId: string,
    surface: DemoDealSurfaceKey = 'dossier'
) => {
    const routeSegment = DEAL_SURFACE_META[surface].routeSegment
    return routeSegment ? `/demo/deals/${dealId}/${routeSegment}` : `/demo/deals/${dealId}`
}
