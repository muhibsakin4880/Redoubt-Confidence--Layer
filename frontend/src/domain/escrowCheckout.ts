import type { DatasetDetail } from '../data/datasetDetailData'
import type { ContractLifecycleState } from './accessContract'
import type { CompliancePassport } from './compliancePassport'
import { formatUsd, type RightsQuote } from './rightsQuoteBuilder'

export type EscrowCheckoutAccessMode = 'clean_room' | 'aggregated_export' | 'encrypted_download'
export type EscrowPaymentMethod = 'wallet' | 'wire' | 'card'
export type EscrowReviewWindowHours = 24 | 48 | 72

export type OutcomeIssueType = 'schema_mismatch' | 'freshness_miss'
export type OutcomeEngineStatus = 'not_started' | 'passed' | 'failed'

type EscrowCheckoutLifecycle = Extract<
    ContractLifecycleState,
    'FUNDS_HELD' | 'ACCESS_ACTIVE' | 'RELEASE_PENDING' | 'RELEASED_TO_PROVIDER' | 'DISPUTE_OPEN'
>
type WorkspaceStatus = 'planned' | 'ready'
type CredentialStatus = 'planned' | 'issued'
type OutcomeStage = 'evaluation_pending' | 'evaluation_active' | 'validated' | 'credit_issued' | 'released'
type OutcomeValidationStatus = 'pending' | 'confirmed' | 'issue_reported'

export type EscrowCheckoutConfig = {
    accessMode: EscrowCheckoutAccessMode
    reviewWindowHours: EscrowReviewWindowHours
    paymentMethod: EscrowPaymentMethod
}

export type EscrowDueUseAgreement = {
    version: string
    checksum: string
    generatedAt: string
    summary: string
    clauses: string[]
    accepted: boolean
    acceptedAt?: string
}

export type EscrowCheckoutRecord = {
    id: string
    escrowId: string
    contractId: string
    datasetId: string
    datasetTitle: string
    quoteId: string
    passportId: string
    createdAt: string
    updatedAt: string
    lifecycleState: EscrowCheckoutLifecycle
    buyerLabel: string
    providerLabel: string
    funding: {
        amountUsd: number
        escrowHoldUsd: number
        fundedAt: string
        paymentMethod: EscrowPaymentMethod
    }
    configuration: EscrowCheckoutConfig
    dua: EscrowDueUseAgreement
    workspace: {
        status: WorkspaceStatus
        workspaceId: string
        workspaceName: string
        launchPath: string
        provisionedAt?: string
    }
    credentials: {
        status: CredentialStatus
        credentialId?: string
        issuedAt?: string
        expiresAt?: string
        scopes: string[]
        tokenTtlMinutes: number
    }
    outcomeProtection: {
        metadataPreviewIncluded: boolean
        evaluationFeeUsd: number
        stage: OutcomeStage
        commitments: {
            schemaVersion: string
            expectedFieldCount: number
            freshnessCommitment: string
            confidenceFloor: number
        }
        engine: {
            status: OutcomeEngineStatus
            summary: string
            findings: string[]
            actualFieldCount?: number
            actualFreshnessScore?: number
            lastRunAt?: string
        }
        validation: {
            status: OutcomeValidationStatus
            issueTypes: OutcomeIssueType[]
            note?: string
            updatedAt?: string
        }
        credits: {
            status: 'none' | 'issued'
            amountUsd: number
            reason?: string
            issuedAt?: string
        }
        release?: {
            releasedAt?: string
        }
    }
}

export type EscrowCenterTransaction = {
    id: string
    dataset: string
    buyer: string
    provider: string
    amount: string
    accessMethod: 'platform' | 'download'
    status: Extract<ContractLifecycleState, 'FUNDS_HELD' | 'ACCESS_ACTIVE' | 'RELEASE_PENDING' | 'RELEASED_TO_PROVIDER' | 'DISPUTE_OPEN'>
}

const ESCROW_CHECKOUT_STORAGE_KEY = 'Redoubt:escrowCheckouts'

const nowIso = () => new Date().toISOString()
const roundToNearest25 = (value: number) => Math.round(value / 25) * 25

const buildStableHash = (input: string) => {
    let hash = 0
    for (let index = 0; index < input.length; index += 1) {
        hash = (hash * 31 + input.charCodeAt(index)) >>> 0
    }
    return hash.toString(16).toUpperCase().padStart(8, '0').slice(0, 8)
}

const buildId = (prefix: string, seed: string) => `${prefix}-${buildStableHash(`${seed}:${Date.now()}`)}`

const quoteDurationLabel = (quote: RightsQuote) => {
    if (quote.input.duration === '30_days') return '30 days'
    if (quote.input.duration === '90_days') return '90 days'
    if (quote.input.duration === '12_months') return '12 months'
    return '24 months'
}

const accessModeFromQuote = (quote: RightsQuote): EscrowCheckoutAccessMode => {
    if (quote.input.deliveryMode === 'encrypted_download') return 'encrypted_download'
    if (quote.input.deliveryMode === 'aggregated_export') return 'aggregated_export'
    return 'clean_room'
}

const launchPathFromAccessMode = (accessMode: EscrowCheckoutAccessMode) =>
    accessMode === 'clean_room' ? '/secure-enclave' : '/pipelines'

const workspaceNameFromAccessMode = (dataset: DatasetDetail, accessMode: EscrowCheckoutAccessMode) => {
    if (accessMode === 'encrypted_download') return `${dataset.category} delivery workspace`
    if (accessMode === 'aggregated_export') return `${dataset.category} governed analytics workspace`
    return `${dataset.category} clean room`
}

const buildSchemaVersion = (dataset: DatasetDetail) =>
    buildStableHash(dataset.preview.sampleSchema.map(field => `${field.field}:${field.type}`).join('|'))

const buildEvaluationFee = (quote: RightsQuote) => roundToNearest25(Math.max(quote.totalUsd * 0.18, 250))

const expectedFieldCountFromQuote = (quote: RightsQuote, dataset: DatasetDetail) => {
    const totalFields = dataset.preview.sampleSchema.length
    if (quote.input.fieldPack === 'core') return Math.max(3, totalFields - 2)
    if (quote.input.fieldPack === 'analytics') return Math.max(4, totalFields - 1)
    return totalFields
}

const creditRateForIssues = (issueTypes: OutcomeIssueType[]) => {
    const normalized = Array.from(new Set(issueTypes))
    if (normalized.includes('schema_mismatch') && normalized.includes('freshness_miss')) return 0.35
    if (normalized.includes('schema_mismatch')) return 0.2
    return 0.15
}

const issueSummary = (issueTypes: OutcomeIssueType[]) => {
    if (issueTypes.includes('schema_mismatch') && issueTypes.includes('freshness_miss')) {
        return 'schema and freshness commitments missed'
    }
    if (issueTypes.includes('schema_mismatch')) return 'schema commitment missed'
    return 'freshness commitment missed'
}

const scopesFromQuote = (quote: RightsQuote, accessMode: EscrowCheckoutAccessMode) => {
    const commonScopes = [`dataset:${quote.datasetId}:read`, 'audit:write', 'policy:enforced']
    if (accessMode === 'encrypted_download') {
        return [...commonScopes, 'download:encrypted', 'watermark:required', 'keys:ephemeral']
    }
    if (accessMode === 'aggregated_export') {
        return [...commonScopes, 'query:aggregated', 'export:aggregated', 'egress:reviewed']
    }
    return [...commonScopes, 'query:clean-room', 'export:none', 'egress:blocked']
}

export const checkoutAccessModeMeta: Record<
    EscrowCheckoutAccessMode,
    { label: string; detail: string }
> = {
    clean_room: {
        label: 'Secure clean room',
        detail: 'Analysis happens in an isolated workspace with no raw export path.'
    },
    aggregated_export: {
        label: 'Aggregated export',
        detail: 'Analysis stays governed, but approved aggregate outputs can leave after review.'
    },
    encrypted_download: {
        label: 'Encrypted download',
        detail: 'An audited workspace provisions time-boxed, watermarked, encrypted package access.'
    }
}

export const paymentMethodMeta: Record<
    EscrowPaymentMethod,
    { label: string; detail: string }
> = {
    wallet: {
        label: 'Treasury wallet',
        detail: 'Fastest settlement path for repeat buyers and smaller governed purchases.'
    },
    wire: {
        label: 'Wire transfer',
        detail: 'Recommended for larger enterprise transactions requiring accounting controls.'
    },
    card: {
        label: 'Card on file',
        detail: 'Convenient for evaluation and one-off access packages.'
    }
}

export const reviewWindowOptions: EscrowReviewWindowHours[] = [24, 48, 72]

export const outcomeIssueMeta: Record<OutcomeIssueType, { label: string; detail: string }> = {
    schema_mismatch: {
        label: 'Schema mismatch',
        detail: 'Delivered fields or required schema shape diverged from the contracted rights package.'
    },
    freshness_miss: {
        label: 'Freshness miss',
        detail: 'The delivered data did not meet the freshness commitment captured at checkout.'
    }
}

export const outcomeStageMeta: Record<OutcomeStage, { label: string; detail: string }> = {
    evaluation_pending: {
        label: 'Evaluation pending',
        detail: 'Metadata preview is live, and the paid clean-room evaluation starts after workspace activation.'
    },
    evaluation_active: {
        label: 'Evaluation active',
        detail: 'Buyer is validating schema, freshness, and access commitments inside the governed workspace.'
    },
    validated: {
        label: 'Validated',
        detail: 'Buyer confirmed the committed outcome and escrow can move into release.'
    },
    credit_issued: {
        label: 'Credit issued',
        detail: 'A protected commitment missed and an automatic credit was applied before payout.'
    },
    released: {
        label: 'Released',
        detail: 'Buyer validated the deal outcome and escrow was released to the provider.'
    }
}

export const getRecommendedCheckoutConfig = (quote: RightsQuote): EscrowCheckoutConfig => ({
    accessMode: accessModeFromQuote(quote),
    reviewWindowHours: quote.input.validationWindowHours,
    paymentMethod: quote.totalUsd >= 5000 ? 'wire' : quote.totalUsd >= 2500 ? 'wallet' : 'card'
})

export const describeCheckoutAccessMode = (accessMode: EscrowCheckoutAccessMode) =>
    checkoutAccessModeMeta[accessMode].label

export const describeCheckoutPaymentMethod = (paymentMethod: EscrowPaymentMethod) =>
    paymentMethodMeta[paymentMethod].label

export const getPlannedWorkspaceName = (dataset: DatasetDetail, accessMode: EscrowCheckoutAccessMode) =>
    workspaceNameFromAccessMode(dataset, accessMode)

export const getPlannedWorkspaceLaunchPath = (accessMode: EscrowCheckoutAccessMode) =>
    launchPathFromAccessMode(accessMode)

export const getPlannedCredentialScopes = (quote: RightsQuote, accessMode: EscrowCheckoutAccessMode) =>
    scopesFromQuote(quote, accessMode)

export const getOutcomeEvaluationFee = (quote: RightsQuote) => buildEvaluationFee(quote)

export const buildEscrowDueUseAgreement = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    passport: CompliancePassport,
    config: EscrowCheckoutConfig
): EscrowDueUseAgreement => {
    const generatedAt = nowIso()
    const clauses = [
        `Permitted use is limited to ${quote.rightsSummary[2].toLowerCase()} for ${quoteDurationLabel(quote)} under ${quote.rightsSummary[4].toLowerCase()}.`,
        `Access will be delivered via ${checkoutAccessModeMeta[config.accessMode].label.toLowerCase()} with reviewer-controlled egress and provider anonymity preserved.`,
        `Redoubt will hold ${formatUsd(quote.escrowHoldUsd)} in escrow for a ${config.reviewWindowHours}-hour buyer validation window before provider release.`,
        `Workspace credentials are scoped to ${workspaceNameFromAccessMode(dataset, config.accessMode)} and expire automatically after the configured TTL.`,
        `Redistribution, identity re-identification, and policy-breaching exports remain prohibited under passport ${passport.passportId}.`,
        `If schema, freshness, or access commitments materially diverge from the agreed rights package, the buyer may open dispute before escrow release.`
    ]
    const checksum = buildStableHash(
        `${dataset.id}:${quote.id}:${passport.passportId}:${config.accessMode}:${config.reviewWindowHours}:${clauses.join('|')}`
    )

    return {
        version: `DUA-2026.${String((config.reviewWindowHours / 24) + 2).padStart(2, '0')}`,
        checksum,
        generatedAt,
        summary: `${dataset.title} · ${quote.id} · ${checkoutAccessModeMeta[config.accessMode].label} · ${config.reviewWindowHours}-hour review window`,
        clauses,
        accepted: false
    }
}

export const buildEscrowCheckoutRecord = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    passport: CompliancePassport,
    config: EscrowCheckoutConfig
): EscrowCheckoutRecord => {
    const createdAt = nowIso()
    const duaPreview = buildEscrowDueUseAgreement(dataset, quote, passport, config)
    const workspaceId = `ws_${dataset.id}_${buildStableHash(`${quote.id}:${config.accessMode}`).toLowerCase()}`

    return {
        id: buildId('CHK', quote.id),
        escrowId: buildId('ESC', `${dataset.id}:${quote.id}`),
        contractId: buildId('CTR', `${dataset.id}:${passport.passportId}`),
        datasetId: dataset.id,
        datasetTitle: dataset.title,
        quoteId: quote.id,
        passportId: passport.passportId,
        createdAt,
        updatedAt: createdAt,
        lifecycleState: 'FUNDS_HELD',
        buyerLabel: `part_${passport.passportId.toLowerCase()}`,
        providerLabel: `anon_provider_${buildStableHash(dataset.title).slice(0, 4).toLowerCase()}`,
        funding: {
            amountUsd: quote.totalUsd,
            escrowHoldUsd: quote.escrowHoldUsd,
            fundedAt: createdAt,
            paymentMethod: config.paymentMethod
        },
        configuration: config,
        dua: {
            ...duaPreview,
            accepted: true,
            acceptedAt: createdAt
        },
        workspace: {
            status: 'planned',
            workspaceId,
            workspaceName: workspaceNameFromAccessMode(dataset, config.accessMode),
            launchPath: launchPathFromAccessMode(config.accessMode)
        },
        credentials: {
            status: 'planned',
            scopes: scopesFromQuote(quote, config.accessMode),
            tokenTtlMinutes: config.accessMode === 'encrypted_download' ? 90 : 180
        },
        outcomeProtection: {
            metadataPreviewIncluded: true,
            evaluationFeeUsd: buildEvaluationFee(quote),
            stage: 'evaluation_pending',
            commitments: {
                schemaVersion: buildSchemaVersion(dataset),
                expectedFieldCount: expectedFieldCountFromQuote(quote, dataset),
                freshnessCommitment: dataset.preview.freshnessLabel,
                confidenceFloor: Math.max(75, dataset.quality.freshnessScore - 3)
            },
            engine: {
                status: 'not_started',
                summary: 'Outcome engine will run automatically once the governed evaluation workspace is live.',
                findings: []
            },
            validation: {
                status: 'pending',
                issueTypes: []
            },
            credits: {
                status: 'none',
                amountUsd: 0
            }
        }
    }
}

export const provisionEscrowWorkspace = (record: EscrowCheckoutRecord): EscrowCheckoutRecord => ({
    ...record,
    updatedAt: nowIso(),
    workspace: {
        ...record.workspace,
        status: 'ready',
        provisionedAt: nowIso()
    }
})

export const issueEscrowScopedCredentials = (record: EscrowCheckoutRecord): EscrowCheckoutRecord => {
    const issuedAt = new Date()
    const expiresAt = new Date(issuedAt.getTime() + record.credentials.tokenTtlMinutes * 60 * 1000).toISOString()

    return {
        ...record,
        updatedAt: nowIso(),
        lifecycleState: 'ACCESS_ACTIVE',
        credentials: {
            ...record.credentials,
            status: 'issued',
            credentialId: buildId('TOK', `${record.quoteId}:${record.workspace.workspaceId}`),
            issuedAt: issuedAt.toISOString(),
            expiresAt
        },
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'evaluation_active',
            engine: {
                ...record.outcomeProtection.engine,
                status: 'not_started',
                summary: 'Protected evaluation is live. Engine scan will compare committed schema and freshness before buyer validation.'
            },
            validation: {
                ...record.outcomeProtection.validation,
                updatedAt: issuedAt.toISOString()
            }
        }
    }
}

export const confirmOutcomeValidation = (record: EscrowCheckoutRecord, note?: string): EscrowCheckoutRecord => {
    const updatedAt = nowIso()

    return {
        ...record,
        updatedAt,
        lifecycleState: 'RELEASE_PENDING',
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'validated',
            validation: {
                status: 'confirmed',
                issueTypes: [],
                note,
                updatedAt
            }
        }
    }
}

const buildActualFieldCount = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    record: EscrowCheckoutRecord
) => {
    let drift = 0
    if ((quote.input.fieldPack === 'full_schema' || quote.input.fieldPack === 'sensitive_review') && dataset.preview.structureQuality < 95) {
        drift += 1
    }
    if (record.configuration.accessMode === 'encrypted_download' && dataset.preview.structureQuality < 94) {
        drift += 1
    }

    return Math.max(0, record.outcomeProtection.commitments.expectedFieldCount - drift)
}

const buildActualFreshnessScore = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    record: EscrowCheckoutRecord
) => {
    let penalty = 0
    if (record.configuration.accessMode === 'aggregated_export') penalty += 1
    if (record.configuration.accessMode === 'encrypted_download') penalty += 4
    if (quote.input.geography === 'global') penalty += 2
    if (quote.riskBand === 'heightened') penalty += 1
    if (quote.riskBand === 'strict') penalty += 2
    return Math.max(0, dataset.quality.freshnessScore - penalty)
}

export const runOutcomeProtectionEngine = (
    record: EscrowCheckoutRecord,
    dataset: DatasetDetail,
    quote: RightsQuote
): EscrowCheckoutRecord => {
    const updatedAt = nowIso()
    const actualFieldCount = buildActualFieldCount(dataset, quote, record)
    const actualFreshnessScore = buildActualFreshnessScore(dataset, quote, record)
    const issueTypes: OutcomeIssueType[] = []
    const findings: string[] = []

    if (actualFieldCount < record.outcomeProtection.commitments.expectedFieldCount) {
        issueTypes.push('schema_mismatch')
        findings.push(
            `Expected ${record.outcomeProtection.commitments.expectedFieldCount} contracted field(s), but evaluation surfaced ${actualFieldCount}.`
        )
    }

    if (actualFreshnessScore < record.outcomeProtection.commitments.confidenceFloor) {
        issueTypes.push('freshness_miss')
        findings.push(
            `Freshness signal scored ${actualFreshnessScore}% against a contracted floor of ${record.outcomeProtection.commitments.confidenceFloor}%.`
        )
    }

    if (issueTypes.length === 0) {
        return {
            ...record,
            updatedAt,
            outcomeProtection: {
                ...record.outcomeProtection,
                engine: {
                    status: 'passed',
                    summary: `Outcome engine verified ${actualFieldCount}/${record.outcomeProtection.commitments.expectedFieldCount} field(s) and freshness ${actualFreshnessScore}% against a floor of ${record.outcomeProtection.commitments.confidenceFloor}%.`,
                    findings: ['Committed schema and freshness checks passed.'],
                    actualFieldCount,
                    actualFreshnessScore,
                    lastRunAt: updatedAt
                }
            }
        }
    }

    const amountUsd = roundToNearest25(record.funding.amountUsd * creditRateForIssues(issueTypes))

    return {
        ...record,
        updatedAt,
        lifecycleState: 'DISPUTE_OPEN',
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'credit_issued',
            engine: {
                status: 'failed',
                summary: `Outcome engine detected ${issueSummary(issueTypes)} during protected evaluation.`,
                findings,
                actualFieldCount,
                actualFreshnessScore,
                lastRunAt: updatedAt
            },
            validation: {
                status: 'issue_reported',
                issueTypes,
                note: `Protection engine automatically opened review because ${issueSummary(issueTypes)}.`,
                updatedAt
            },
            credits: {
                status: 'issued',
                amountUsd,
                reason: `Automatic credit issued because ${issueSummary(issueTypes)}.`,
                issuedAt: updatedAt
            }
        }
    }
}

export const issueAutomaticOutcomeCredit = (
    record: EscrowCheckoutRecord,
    issueTypes: OutcomeIssueType[],
    note?: string
): EscrowCheckoutRecord => {
    const updatedAt = nowIso()
    const amountUsd = roundToNearest25(record.funding.amountUsd * creditRateForIssues(issueTypes))

    return {
        ...record,
        updatedAt,
        lifecycleState: 'DISPUTE_OPEN',
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'credit_issued',
            validation: {
                status: 'issue_reported',
                issueTypes,
                note,
                updatedAt
            },
            credits: {
                status: 'issued',
                amountUsd,
                reason: `Automatic credit issued because ${issueSummary(issueTypes)}.`,
                issuedAt: updatedAt
            }
        }
    }
}

export const releaseEscrowToProvider = (record: EscrowCheckoutRecord): EscrowCheckoutRecord => {
    const updatedAt = nowIso()

    return {
        ...record,
        updatedAt,
        lifecycleState: 'RELEASED_TO_PROVIDER',
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'released',
            release: {
                releasedAt: updatedAt
            }
        }
    }
}

export const loadEscrowCheckouts = (datasetId?: string) => {
    if (typeof window === 'undefined') return [] as EscrowCheckoutRecord[]
    const raw = window.localStorage.getItem(ESCROW_CHECKOUT_STORAGE_KEY)
    if (!raw) return [] as EscrowCheckoutRecord[]

    try {
        const parsed = JSON.parse(raw) as EscrowCheckoutRecord[]
        if (!Array.isArray(parsed)) return [] as EscrowCheckoutRecord[]
        const sorted = parsed.sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
        return datasetId ? sorted.filter(record => record.datasetId === datasetId) : sorted
    } catch {
        return [] as EscrowCheckoutRecord[]
    }
}

export const loadEscrowCheckoutByQuoteId = (quoteId: string) =>
    loadEscrowCheckouts().find(record => record.quoteId === quoteId) ?? null

export const saveEscrowCheckout = (record: EscrowCheckoutRecord) => {
    const records = loadEscrowCheckouts()
    const next = [record, ...records.filter(existing => existing.id !== record.id)].slice(0, 30)
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(ESCROW_CHECKOUT_STORAGE_KEY, JSON.stringify(next))
    }
    return next
}

export const loadEscrowCheckoutTransactions = (): EscrowCenterTransaction[] =>
    loadEscrowCheckouts().map(record => ({
        id: record.escrowId,
        dataset: record.datasetTitle,
        buyer: record.buyerLabel,
        provider: record.providerLabel,
        amount: formatUsd(record.funding.amountUsd),
        accessMethod: record.configuration.accessMode === 'encrypted_download' ? 'download' : 'platform',
        status: record.lifecycleState
    }))
