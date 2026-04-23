import {
    getAllDatasetDetails,
    getDatasetDetailById,
    type DatasetDetail
} from '../data/datasetDetailData'
import {
    DERIVED_SURFACE_AVAILABILITY,
    SEEDED_SURFACE_AVAILABILITY,
    SEEDED_DEAL_ROUTES,
    buildDealPath,
    buildDemoDealPath,
    buildDerivedDealId,
    getDatasetIdFromDerivedDealId,
    getSeededDealRouteRecordById,
    type DealSurfaceKey,
    type DealSurfaceAvailabilityMap,
    type DemoDealSurfaceKey,
    type SeededDealRouteRecord
} from '../data/dealDossierData'
import {
    datasetRequests,
    type DatasetRequest
} from '../data/workspaceData'
import { buildCompliancePassport } from './compliancePassport'
import { buildDealProgressModel, type DealProgressModel } from './dealProgress'
import {
    dealLifecycleStageMeta,
    loadSharedDealLifecycleRecords,
    type SharedDealLifecycleRecord
} from './dealLifecycle'

export type DealRouteContext = {
    seed: SeededDealRouteRecord
    routeKind: 'seeded' | 'derived'
    surfaceAvailability: DealSurfaceAvailabilityMap
    dataset: DatasetDetail | null
    request: DatasetRequest | null
    lifecycleRecord: SharedDealLifecycleRecord | null
    passport: ReturnType<typeof buildCompliancePassport>
    quote: SharedDealLifecycleRecord['source']['quote'] | null
    checkoutRecord: SharedDealLifecycleRecord['source']['checkoutRecord'] | null
    dealProgress: DealProgressModel
    currentStageLabel: string
    currentStageDetail: string
    passportId: string
    quoteId: string | null
    checkoutId: string | null
    routeTargets: Record<DealSurfaceKey, string>
    demoTargets: Record<DemoDealSurfaceKey, string>
}

const passportFallback = () => buildCompliancePassport()

const findLifecycleRecord = (
    seed: SeededDealRouteRecord,
    records: SharedDealLifecycleRecord[]
) =>
    records.find(record => record.datasetId === seed.datasetId) ??
    records.find(record => record.datasetTitle.toLowerCase().includes(seed.label.split(' ')[0].toLowerCase())) ??
    null

const buildRouteTargets = (dealId: string): Record<DealSurfaceKey, string> => ({
    dossier: buildDealPath(dealId, 'dossier'),
    'provider-packet': buildDealPath(dealId, 'provider-packet'),
    'output-review': buildDealPath(dealId, 'output-review'),
    approval: buildDealPath(dealId, 'approval'),
    negotiation: buildDealPath(dealId, 'negotiation'),
    'residency-memo': buildDealPath(dealId, 'residency-memo'),
    'go-live': buildDealPath(dealId, 'go-live')
})

const buildDemoTargets = (dealId: string): Record<DemoDealSurfaceKey, string> => ({
    dossier: buildDemoDealPath(dealId, 'dossier'),
    'provider-packet': buildDemoDealPath(dealId, 'provider-packet'),
    'output-review': buildDemoDealPath(dealId, 'output-review')
})

const buildDerivedSeed = (dataset: DatasetDetail): SeededDealRouteRecord => ({
    dealId: buildDerivedDealId(dataset.id),
    label: `${dataset.title} evaluation`,
    summary: dataset.description,
    datasetId: dataset.id,
    requestId: null
})

const loadDerivedSeeds = () => {
    const seededDatasetIds = new Set(SEEDED_DEAL_ROUTES.map(record => record.datasetId))

    return getAllDatasetDetails()
        .filter(dataset => !seededDatasetIds.has(dataset.id))
        .map(buildDerivedSeed)
}

const resolveDealSeedById = (dealId?: string | null) => {
    const seeded = getSeededDealRouteRecordById(dealId)
    if (seeded) {
        return {
            seed: seeded,
            routeKind: 'seeded' as const,
            surfaceAvailability: SEEDED_SURFACE_AVAILABILITY
        }
    }

    const datasetId = getDatasetIdFromDerivedDealId(dealId)
    const dataset = datasetId ? getDatasetDetailById(datasetId) : null
    if (!dataset) return null

    return {
        seed: buildDerivedSeed(dataset),
        routeKind: 'derived' as const,
        surfaceAvailability: DERIVED_SURFACE_AVAILABILITY
    }
}

const toDealRouteContext = (
    seed: SeededDealRouteRecord,
    records: SharedDealLifecycleRecord[],
    routeKind: DealRouteContext['routeKind'],
    surfaceAvailability: DealSurfaceAvailabilityMap
): DealRouteContext => {
    const lifecycleRecord = findLifecycleRecord(seed, records)
    const dataset = getDatasetDetailById(seed.datasetId)
    const request = seed.requestId
        ? datasetRequests.find(item => item.id === seed.requestId) ?? null
        : datasetRequests.find(item => item.name === dataset?.title) ?? null
    const passport = lifecycleRecord?.source.passport ?? passportFallback()
    const quote = lifecycleRecord?.source.quote ?? null
    const checkoutRecord = lifecycleRecord?.source.checkoutRecord ?? null
    const stageMeta = lifecycleRecord ? dealLifecycleStageMeta[lifecycleRecord.stage] : null

    return {
        seed,
        routeKind,
        surfaceAvailability,
        dataset,
        request,
        lifecycleRecord,
        passport,
        quote,
        checkoutRecord,
        dealProgress: buildDealProgressModel({
            passport,
            quote,
            checkoutRecord
        }),
        currentStageLabel: stageMeta?.label ?? (routeKind === 'seeded' ? 'Seeded route ready' : 'Dossier ready'),
        currentStageDetail:
            stageMeta?.detail ??
            (routeKind === 'seeded'
                ? 'This reserved deal route resolves from seeded dataset and request mappings even before the full dossier UI is implemented.'
                : 'This dossier is generated from the dataset record and will attach request, rights, approval, and checkout artifacts as they become available.'),
        passportId: lifecycleRecord?.passportId ?? passport.passportId,
        quoteId: lifecycleRecord?.quoteId ?? quote?.id ?? null,
        checkoutId: lifecycleRecord?.checkoutId ?? checkoutRecord?.id ?? null,
        routeTargets: buildRouteTargets(seed.dealId),
        demoTargets: buildDemoTargets(seed.dealId)
    }
}

export const loadDealRouteContexts = () => {
    const records = loadSharedDealLifecycleRecords()
    return [
        ...SEEDED_DEAL_ROUTES.map(seed =>
            toDealRouteContext(seed, records, 'seeded', SEEDED_SURFACE_AVAILABILITY)
        ),
        ...loadDerivedSeeds().map(seed =>
            toDealRouteContext(seed, records, 'derived', DERIVED_SURFACE_AVAILABILITY)
        )
    ]
}

export const getDealRouteContextById = (dealId?: string | null) => {
    const resolved = resolveDealSeedById(dealId)
    if (!resolved) return null

    return toDealRouteContext(
        resolved.seed,
        loadSharedDealLifecycleRecords(),
        resolved.routeKind,
        resolved.surfaceAvailability
    )
}
