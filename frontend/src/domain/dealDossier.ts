import {
    getDatasetDetailById,
    type DatasetDetail
} from '../data/datasetDetailData'
import {
    SEEDED_DEAL_ROUTES,
    buildDealPath,
    buildDemoDealPath,
    getSeededDealRouteRecordById,
    type DealSurfaceKey,
    type DemoDealSurfaceKey,
    type SeededDealRouteRecord
} from '../data/dealDossierData'
import {
    datasetRequests,
    type DatasetRequest
} from '../data/workspaceData'
import { buildCompliancePassport } from './compliancePassport'
import {
    dealLifecycleStageMeta,
    loadSharedDealLifecycleRecords,
    type SharedDealLifecycleRecord
} from './dealLifecycle'

export type DealRouteContext = {
    seed: SeededDealRouteRecord
    dataset: DatasetDetail | null
    request: DatasetRequest | null
    lifecycleRecord: SharedDealLifecycleRecord | null
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

const toDealRouteContext = (
    seed: SeededDealRouteRecord,
    records: SharedDealLifecycleRecord[]
): DealRouteContext => {
    const lifecycleRecord = findLifecycleRecord(seed, records)
    const dataset = getDatasetDetailById(seed.datasetId)
    const request = datasetRequests.find(item => item.id === seed.requestId) ?? null
    const passport = lifecycleRecord?.source.passport ?? passportFallback()
    const stageMeta = lifecycleRecord ? dealLifecycleStageMeta[lifecycleRecord.stage] : null

    return {
        seed,
        dataset,
        request,
        lifecycleRecord,
        currentStageLabel: stageMeta?.label ?? 'Seeded route ready',
        currentStageDetail:
            stageMeta?.detail ??
            'This reserved deal route resolves from seeded dataset and request mappings even before the full dossier UI is implemented.',
        passportId: lifecycleRecord?.passportId ?? passport.passportId,
        quoteId: lifecycleRecord?.quoteId ?? null,
        checkoutId: lifecycleRecord?.checkoutId ?? null,
        routeTargets: buildRouteTargets(seed.dealId),
        demoTargets: buildDemoTargets(seed.dealId)
    }
}

export const loadDealRouteContexts = () => {
    const records = loadSharedDealLifecycleRecords()
    return SEEDED_DEAL_ROUTES.map(seed => toDealRouteContext(seed, records))
}

export const getDealRouteContextById = (dealId?: string | null) => {
    const seed = getSeededDealRouteRecordById(dealId)
    if (!seed) return null

    return toDealRouteContext(seed, loadSharedDealLifecycleRecords())
}
