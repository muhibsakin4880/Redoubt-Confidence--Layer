import type { DatasetDetail } from '../data/datasetDetailData'
import type { ContractLifecycleState } from './accessContract'
import type { CompliancePassport } from './compliancePassport'
import { formatUsd, type RightsQuote } from './rightsQuoteBuilder'

export type EscrowCheckoutAccessMode = 'clean_room' | 'aggregated_export' | 'encrypted_download'
export type EscrowPaymentMethod = 'wallet' | 'wire' | 'card'
export type EscrowReviewWindowHours = 24 | 48 | 72

type EscrowCheckoutLifecycle = Extract<ContractLifecycleState, 'FUNDS_HELD' | 'ACCESS_ACTIVE'>
type WorkspaceStatus = 'planned' | 'ready'
type CredentialStatus = 'planned' | 'issued'

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
}

export type EscrowCenterTransaction = {
    id: string
    dataset: string
    buyer: string
    provider: string
    amount: string
    accessMethod: 'platform' | 'download'
    status: Extract<ContractLifecycleState, 'FUNDS_HELD' | 'ACCESS_ACTIVE'>
}

const ESCROW_CHECKOUT_STORAGE_KEY = 'Redoubt:escrowCheckouts'

const nowIso = () => new Date().toISOString()

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
