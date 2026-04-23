import type {
    DatasetDetail,
    DatasetDiscoverySummary
} from '../data/datasetCatalogData'
import type { DatasetAccessPackage } from '../data/datasetAccessPackageData'
import {
    DATASET_TRUST_PROFILE_LIBRARY,
    type DatasetTrustProfile
} from './datasetTrustProfile'

export type ProviderDatasetSchemaFieldSnapshot = {
    field: string
    type: string
    piiStatus: 'safe' | 'flagged' | 'review'
    residency: 'global' | 'local'
    nullRate: number
    aiDescription: string
}

export type ProviderDatasetSchemaReviewSnapshot = {
    totalFields: number
    classification: string
    confidenceScore: number
    confidenceLabel: string
    reviewTimeline: string
    summary: string
    packagingPosture: string
    preferredOperatingRegion: string
    personalDataFields: string[]
    restrictedFields: string[]
    localOnlyFields: string[]
    transferSensitiveFields: string[]
    fieldSummaries: ProviderDatasetSchemaFieldSnapshot[]
    reviewFactors: Array<{
        label: string
        score: number
        detail: string
    }>
}

export type ProviderDossierBinding = {
    dealId: string
    providerPacketId: string
    reviewId: string
    evidencePackId: string
    readinessStatus: 'Provider package captured' | 'Dossier-ready draft'
    readinessDetail: string
    updatedAt: string
}

export type ProviderDatasetSubmissionRecord = {
    id: string
    datasetId: string
    dealId: string
    providerPacketId: string
    reviewId: string
    evidencePackId: string
    status: 'Processing'
    submissionId: string
    createdAt: string
    updatedAt: string
    metadata: {
        title: string
        domain: string
        description: string
        priceUsd: string
    }
    fileIntegrity: {
        fileName: string
        sizeLabel: string
        format: string
        checksumStatus: string
        uploadStatus: string
    }
    schemaReview: ProviderDatasetSchemaReviewSnapshot
    accessPackageSnapshot: DatasetAccessPackage
    providerPublishing: {
        publishingAuthority: string
        institutionType: string
        buyerViewSummary: string
        defaultPackageFraming: string
    }
    dossierBinding: ProviderDossierBinding
}

type ProviderSubmissionStore = {
    version: 1
    records: ProviderDatasetSubmissionRecord[]
}

const PROVIDER_DATASET_SUBMISSIONS_STORAGE_KEY = 'Redoubt:providerDatasetSubmissions'

const emptyStore = (): ProviderSubmissionStore => ({
    version: 1,
    records: []
})

const normalizeIdPart = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

export const buildProviderDatasetId = (submissionId: string) =>
    `provider-${normalizeIdPart(submissionId) || 'submission'}`

export const buildProviderContributionId = (submissionId: string) =>
    `cn-${normalizeIdPart(submissionId) || 'submission'}`

export const buildProviderDealId = (datasetId: string) => `DL-DS-${datasetId}`

const safeDateLabel = (value: string) => {
    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) return value

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(new Date(parsed))
}

const readStore = (): ProviderSubmissionStore => {
    if (typeof window === 'undefined') return emptyStore()
    const raw = window.localStorage.getItem(PROVIDER_DATASET_SUBMISSIONS_STORAGE_KEY)
    if (!raw) return emptyStore()

    try {
        const parsed = JSON.parse(raw) as ProviderSubmissionStore
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.records)) {
            return emptyStore()
        }
        return parsed
    } catch {
        return emptyStore()
    }
}

const writeStore = (store: ProviderSubmissionStore) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(PROVIDER_DATASET_SUBMISSIONS_STORAGE_KEY, JSON.stringify(store))
}

export const loadProviderDatasetSubmissions = () => readStore().records

export const saveProviderDatasetSubmission = (record: ProviderDatasetSubmissionRecord) => {
    const store = readStore()
    const existing = store.records.find(
        item => item.submissionId === record.submissionId || item.datasetId === record.datasetId
    )
    const createdAt = existing?.createdAt ?? record.createdAt
    const nextRecord = {
        ...existing,
        ...record,
        createdAt
    }
    const nextRecords = [
        nextRecord,
        ...store.records.filter(
            item => item.submissionId !== record.submissionId && item.datasetId !== record.datasetId
        )
    ]

    writeStore({
        version: 1,
        records: nextRecords
    })

    return nextRecord
}

export const getProviderDatasetSubmissionByDatasetId = (datasetId?: string | number | null) => {
    if (datasetId === undefined || datasetId === null) return null
    const normalizedDatasetId = String(datasetId)
    return loadProviderDatasetSubmissions().find(record => record.datasetId === normalizedDatasetId) ?? null
}

export const getProviderDatasetSubmissionByContributionId = (contributionId?: string | null) => {
    if (!contributionId) return null
    return loadProviderDatasetSubmissions().find(record => record.id === contributionId) ?? null
}

export const getProviderDossierBindingByDealId = (dealId?: string | null) => {
    if (!dealId) return null
    return loadProviderDatasetSubmissions().find(record => record.dealId === dealId)?.dossierBinding ?? null
}

const trustProfileForRecord = (record: ProviderDatasetSubmissionRecord): DatasetTrustProfile => {
    const domain = record.metadata.domain.toLowerCase()
    const restrictedCount = record.schemaReview.restrictedFields.length

    if (/health|clinical|medical|patient|bio/.test(domain)) {
        return DATASET_TRUST_PROFILE_LIBRARY.clinicalResearch
    }
    if (/finance|market|tick|trading/.test(domain)) {
        return DATASET_TRUST_PROFILE_LIBRARY.marketData
    }
    if (/climate|weather|environment/.test(domain)) {
        return DATASET_TRUST_PROFILE_LIBRARY.climateObservations
    }
    if (restrictedCount > 0 || /mobility|sensor|location|infrastructure/.test(domain)) {
        return DATASET_TRUST_PROFILE_LIBRARY.mobilityTelemetry
    }

    return DATASET_TRUST_PROFILE_LIBRARY.geospatialImagery
}

const buildRiskFlags = (record: ProviderDatasetSubmissionRecord) => {
    const flags = [
        record.schemaReview.classification,
        record.schemaReview.packagingPosture,
        record.schemaReview.restrictedFields.length > 0
            ? `${record.schemaReview.restrictedFields.length} restricted field(s) require controlled review`
            : null,
        record.schemaReview.localOnlyFields.length > 0
            ? `${record.schemaReview.localOnlyFields.length} local-only field(s) shape residency posture`
            : null,
        record.schemaReview.transferSensitiveFields.length > 0
            ? `${record.schemaReview.transferSensitiveFields.length} transfer-sensitive field(s) require governance confirmation`
            : null
    ]

    return flags.filter((item): item is string => Boolean(item))
}

const buildLimitations = (record: ProviderDatasetSubmissionRecord) => {
    const limitations = [
        record.schemaReview.restrictedFields.length > 0
            ? `Restricted fields: ${record.schemaReview.restrictedFields.slice(0, 4).join(', ')}`
            : null,
        record.schemaReview.localOnlyFields.length > 0
            ? `Local-only fields: ${record.schemaReview.localOnlyFields.slice(0, 4).join(', ')}`
            : null,
        record.schemaReview.transferSensitiveFields.length > 0
            ? 'Transfer-sensitive fields should remain attached to manual review before broader movement.'
            : null,
        record.providerPublishing.defaultPackageFraming
    ]

    return limitations.filter((item): item is string => Boolean(item))
}

const scoreByLabel = (
    record: ProviderDatasetSubmissionRecord,
    label: string,
    fallback: number
) =>
    record.schemaReview.reviewFactors.find(item => item.label.toLowerCase().includes(label))?.score ??
    fallback

export const buildDatasetDetailFromProviderSubmission = (
    record: ProviderDatasetSubmissionRecord
): DatasetDetail => {
    const sampleSchema = record.schemaReview.fieldSummaries.slice(0, 8).map(field => ({
        field: field.field,
        type: field.type,
        note: field.piiStatus === 'flagged'
            ? 'Restricted field'
            : field.residency === 'local'
              ? 'Local processing'
              : undefined
    }))
    const riskFlags = buildRiskFlags(record)
    const limitations = buildLimitations(record)
    const allowedUsage = [
        record.accessPackageSnapshot.usageRights.label,
        record.accessPackageSnapshot.deliveryDetail.label,
        record.providerPublishing.defaultPackageFraming
    ].filter(Boolean)

    return {
        id: record.datasetId,
        title: record.metadata.title,
        description: record.metadata.description,
        category: record.metadata.domain,
        size: record.fileIntegrity.sizeLabel,
        recordCount: 'Provider-submitted package',
        lastUpdated: safeDateLabel(record.updatedAt),
        confidenceScore: record.schemaReview.confidenceScore,
        confidenceSummary: `${record.schemaReview.confidenceLabel}: ${record.schemaReview.summary}`,
        contributorTrust: `${record.providerPublishing.institutionType} · ${record.providerPublishing.publishingAuthority}`,
        contributionHistory: `${record.submissionId} captured as ${record.dealId}`,
        trustProfile: trustProfileForRecord(record),
        quality: {
            completeness: scoreByLabel(record, 'completeness', record.schemaReview.confidenceScore),
            freshnessScore: 88,
            freshnessNote: record.fileIntegrity.uploadStatus,
            consistency: scoreByLabel(record, 'format', record.schemaReview.confidenceScore),
            validationStatus: `${record.schemaReview.classification} · ${record.dossierBinding.readinessStatus}`
        },
        accessNotes: [
            record.accessPackageSnapshot.accessMethod.buyerSummary ??
                `${record.accessPackageSnapshot.accessMethod.label} access`,
            record.accessPackageSnapshot.deliveryDetail.buyerSummary ??
                `${record.accessPackageSnapshot.deliveryDetail.label} delivery`,
            `Provider packet ${record.providerPacketId} is linked to review ${record.reviewId}.`
        ],
        providerNotes: [
            record.providerPublishing.buyerViewSummary,
            `Publishing authority: ${record.providerPublishing.publishingAuthority}`,
            `Evidence pack ${record.evidencePackId} carries upload integrity and schema-review signals.`
        ],
        access: {
            status: 'REVIEW_IN_PROGRESS',
            allowedUsage,
            instructions: [
                'Open the Evaluation Dossier before requesting protected evaluation.',
                'Keep restricted and local-only fields inside the governed package until signoff completes.',
                'Use the provider packet for authority, rights, and residency context.'
            ],
            expiration: record.accessPackageSnapshot.term.label,
            usageLimits: `${record.accessPackageSnapshot.advancedRights.redistribution} redistribution · ${record.accessPackageSnapshot.advancedRights.auditLogging} audit logging`
        },
        preview: {
            aiSummary: record.providerPublishing.buyerViewSummary,
            qualityNotes: [
                record.schemaReview.summary,
                `${record.schemaReview.totalFields} fields reviewed`,
                `${record.schemaReview.personalDataFields.length} personal-data signal(s)`
            ],
            riskFlags,
            confidenceBand:
                record.schemaReview.confidenceScore >= 90
                    ? 'high'
                    : record.schemaReview.confidenceScore >= 80
                      ? 'medium'
                      : 'low',
            sampleSchema,
            freshnessLabel: record.fileIntegrity.uploadStatus,
            completenessLabel: `${scoreByLabel(record, 'completeness', record.schemaReview.confidenceScore)}% completeness signal`,
            decision: riskFlags.length > 2 ? 'experimental' : 'production',
            strengths: [
                `${record.accessPackageSnapshot.accessMethod.label} operating posture`,
                `${record.accessPackageSnapshot.security.encryption}`,
                `${record.accessPackageSnapshot.advancedRights.auditLogging} audit logging`
            ],
            limitations,
            suggestedUseCases: allowedUsage,
            structureQuality: scoreByLabel(record, 'schema', record.schemaReview.confidenceScore),
            anomalyRisk: Math.max(2, 100 - record.schemaReview.confidenceScore),
            recordCountRange: 'Submitted provider package'
        }
    }
}

export const buildDatasetDiscoverySummaryFromProviderSubmission = (
    record: ProviderDatasetSubmissionRecord
): DatasetDiscoverySummary => {
    const detail = buildDatasetDetailFromProviderSubmission(record)

    return {
        id: Number.parseInt(record.datasetId.replace(/\D/g, '').slice(-6), 10) || Date.parse(record.createdAt),
        detailId: record.datasetId,
        title: detail.title,
        timeRange: 'Provider-submitted package',
        description: detail.description,
        bestFor: record.providerPublishing.defaultPackageFraming,
        domain: detail.category,
        dataType: record.fileIntegrity.format,
        geography: record.accessPackageSnapshot.geography.label,
        confidenceScore: detail.confidenceScore,
        providerTrustScore: Math.max(70, detail.confidenceScore - 4),
        verificationStatus: 'Under Review',
        lastUpdated: detail.lastUpdated,
        size: detail.size,
        coverage: record.accessPackageSnapshot.geography.label,
        completeness: detail.quality.completeness,
        freshness: detail.quality.freshnessScore,
        consistency: detail.quality.consistency,
        accessType: 'Approved access required',
        sampleSchema: detail.preview.sampleSchema.map(({ field, type }) => ({ field, type })),
        confidenceSummary: detail.confidenceSummary,
        contributorTrust: detail.contributorTrust,
        contributionHistory: detail.contributionHistory,
        trustProfile: detail.trustProfile
    }
}
