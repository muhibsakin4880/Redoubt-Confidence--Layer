import { getDatasetDetailById } from '../data/datasetDetailData'
import type { CompliancePassport } from './compliancePassport'
import {
    buildEscrowCheckoutRecord,
    confirmOutcomeValidation,
    issueEscrowScopedCredentials,
    provisionEscrowWorkspace,
    releaseEscrowToProvider,
    type EscrowCheckoutConfig,
    type EscrowCheckoutRecord
} from './escrowCheckout'
import {
    buildRightsQuote,
    type RightsQuote,
    type RightsQuoteForm
} from './rightsQuoteBuilder'

export type DemoEscrowStage =
    | 'quote_ready'
    | 'escrow_funded'
    | 'workspace_ready'
    | 'token_issued'
    | 'release_pending'
    | 'released'

export type DemoEscrowScenario = {
    stage: DemoEscrowStage
    stageLabel: string
    dealId: string
    datasetId: string
    quote: RightsQuote
    checkoutRecord: EscrowCheckoutRecord | null
    buyerLabel: string
    providerLabel: string
    workspaceId: string
    workspaceName: string
    tokenReference: string | null
    scenarioInstanceId: string
}

export const DEMO_ESCROW_STAGE_ORDER: DemoEscrowStage[] = [
    'quote_ready',
    'escrow_funded',
    'workspace_ready',
    'token_issued',
    'release_pending',
    'released'
]

export const DEMO_ESCROW_STAGE_LABELS: Record<DemoEscrowStage, string> = {
    quote_ready: 'Quote Ready',
    escrow_funded: 'Escrow Funded',
    workspace_ready: 'Workspace Ready',
    token_issued: 'Token Issued',
    release_pending: 'Release Pending',
    released: 'Released'
}

export const DEMO_ESCROW_STAGE_EXPLANATIONS: Record<DemoEscrowStage, string> = {
    quote_ready: 'Buyer has selected dataset and rights terms, but escrow is not funded yet.',
    escrow_funded: 'Funds are held by Redoubt, but workspace/token are not active yet.',
    workspace_ready: 'Secure evaluation workspace is provisioned and ready.',
    token_issued: 'Buyer has an active Ephemeral Token for governed evaluation.',
    release_pending: 'Buyer validation is complete and escrow release is pending.',
    released: 'Escrow has been released to provider and token access is closed.'
}

export const getDemoEscrowNextAction = (stage: DemoEscrowStage) => {
    if (stage === 'quote_ready') return 'Fund escrow to open the governed evaluation transaction.'
    if (stage === 'escrow_funded') return 'Provision the secure workspace before issuing evaluation access.'
    if (stage === 'workspace_ready') return 'Issue the Ephemeral Token to activate governed evaluation.'
    if (stage === 'token_issued') return 'Run the evaluation and complete buyer validation.'
    if (stage === 'release_pending') return 'Release escrow after buyer validation has been accepted.'
    return 'Escrow is closed. Start a new evaluation window if follow-on access is needed.'
}

export const DEMO_ESCROW_CANONICAL_IDS = {
    dealId: 'DL-1001',
    datasetId: '1',
    quoteId: 'QT-DEMO-1001',
    checkoutId: 'CHK-DEMO-1001',
    escrowId: 'ESC-DEMO-1001',
    contractId: 'CTR-DEMO-1001',
    workspaceId: 'WS-DEMO-1001',
    tokenReference: 'TOK-DEMO-1001',
    passportId: 'CP-DEMO-1001'
} as const

export const PRIMARY_BUYER_ROUTE_TARGETS = {
    datasets: '/datasets',
    checkout: `/datasets/${DEMO_ESCROW_CANONICAL_IDS.datasetId}/escrow-checkout`,
    escrowCenter: '/escrow-center',
    ephemeralToken: '/ephemeral-token',
    secureWorkspace: '/secure-enclave',
    outputReview: `/deals/${DEMO_ESCROW_CANONICAL_IDS.dealId}/output-review`,
    dealDossier: `/deals/${DEMO_ESCROW_CANONICAL_IDS.dealId}`,
    auditTrail: '/audit-trail'
} as const

export const DEMO_BUYER_ROUTE_TARGETS = {
    datasets: '/demo/datasets',
    checkout: `/demo/datasets/${DEMO_ESCROW_CANONICAL_IDS.datasetId}/escrow-checkout`,
    escrowCenter: '/demo/escrow-center',
    ephemeralToken: '/demo/ephemeral-token',
    secureWorkspace: '/demo/secure-enclave',
    outputReview: `/demo/deals/${DEMO_ESCROW_CANONICAL_IDS.dealId}/output-review`,
    dealDossier: `/demo/deals/${DEMO_ESCROW_CANONICAL_IDS.dealId}`,
    auditTrail: '/demo/audit-trail'
} as const

export function getBuyerRouteTargets(useDemoRoutes = false) {
    return useDemoRoutes ? DEMO_BUYER_ROUTE_TARGETS : PRIMARY_BUYER_ROUTE_TARGETS
}

const BUYER_DEMO_ACTIVE_STORAGE_KEY = 'Redoubt:buyerDemoActive'
const DEMO_ESCROW_STAGE_STORAGE_KEY = 'Redoubt:demoEscrowScenarioStage'
const ESCROW_CHECKOUT_STORAGE_KEY = 'Redoubt:escrowCheckouts'
const RIGHTS_QUOTE_STORAGE_KEY = 'Redoubt:rightsQuotes'
const DEMO_DEFAULT_STAGE: DemoEscrowStage = 'quote_ready'
const BUYER_DEMO_DEFAULT_STAGE: DemoEscrowStage = 'escrow_funded'
const DEMO_SCENARIO_INSTANCE_ID = 'demo-canonical-buyer-flow'

const CANONICAL_BUYER_LABEL = 'Northbridge Research Labs · Evaluation'
const CANONICAL_PROVIDER_LABEL = 'Provider withheld · ANON-1001'
const CANONICAL_WORKSPACE_LAUNCH_PATH = PRIMARY_BUYER_ROUTE_TARGETS.secureWorkspace
const CANONICAL_QUOTE_INPUT: RightsQuoteForm = {
    deliveryMode: 'clean_room',
    fieldPack: 'analytics',
    usageRight: 'commercial_analytics',
    duration: '90_days',
    geography: 'single_region',
    exclusivity: 'none',
    support: 'priority',
    seatBand: 'department',
    validationWindowHours: 48,
    redistributionRights: 'not_allowed',
    auditLoggingRequirement: 'mandatory',
    attributionRequirement: 'required',
    volumeBasedPricing: false,
    volumePricingAdjustment: 0,
    volumePricingUnit: 'tb'
}

type DemoEscrowTimestamps = {
    quoteCreatedAt: string
    quoteExpiresAt: string
    fundedAt: string
    workspaceReadyAt: string
    tokenIssuedAt: string
    tokenExpiresAt: string
    validationAt: string
    releaseAt: string
}

function isBrowser() {
    return typeof window !== 'undefined'
}

function isDemoEscrowStage(value: unknown): value is DemoEscrowStage {
    return typeof value === 'string' && DEMO_ESCROW_STAGE_ORDER.includes(value as DemoEscrowStage)
}

function readStorageArray<T>(storageKey: string) {
    if (!isBrowser()) return [] as T[]
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return [] as T[]

    try {
        const parsed = JSON.parse(raw) as T[]
        return Array.isArray(parsed) ? parsed : ([] as T[])
    } catch {
        return [] as T[]
    }
}

function writeStorageArray<T>(storageKey: string, next: T[]) {
    if (!isBrowser()) return
    window.localStorage.setItem(storageKey, JSON.stringify(next))
}

function getCanonicalDataset() {
    const dataset = getDatasetDetailById(DEMO_ESCROW_CANONICAL_IDS.datasetId)
    if (!dataset) {
        throw new Error(`Missing canonical demo dataset ${DEMO_ESCROW_CANONICAL_IDS.datasetId}.`)
    }
    return dataset
}

function buildCanonicalPassport(): CompliancePassport {
    return {
        passportId: DEMO_ESCROW_CANONICAL_IDS.passportId,
        status: 'active',
        completionPercent: 100,
        issuedAt: 'April 10, 2026',
        validUntil: 'December 31, 2026',
        organization: {
            participantType: 'organization',
            fullName: '',
            primaryContactName: 'Avery Underwood',
            organizationName: 'Northbridge Research Labs',
            organizationWebsite: 'https://northbridge.ai',
            officialWorkEmail: 'avery.underwood@northbridge.ai',
            inviteCode: 'REDO-2026',
            roleInOrganization: 'Principal Evaluation Lead',
            industryDomain: 'Climate risk analytics',
            primaryOperatingRegion: 'North America',
            country: 'United States'
        },
        intendedUsage: ['Commercial analytics', 'Scenario modeling'],
        useCaseSummary:
            'Evaluate governed climate observations inside a secure clean room before requesting a production rights package.',
        participationIntent: ['Access datasets', 'Collaborate'],
        legalAcknowledgment: {
            authorizedRepresentative: true,
            governancePolicyAccepted: true,
            nonRedistributionAcknowledged: true
        },
        verification: {
            linkedInConnected: true,
            domainVerified: true,
            affiliationFileName: 'northbridge-affiliation.pdf',
            authorizationFileName: 'northbridge-board-approval.pdf',
            authenticationMethod: 'hardware_key',
            ssoDomain: 'northbridge.ai',
            hardwareKeyType: 'YubiKey 5 Series',
            hardwareKeyReference: 'NB-YK-4431',
            corporateDomain: 'northbridge.ai',
            dnsVerificationToken: 'redoubt-verify=RDT-DEMO-1001',
            nodeId: 'RDT-demo-1001',
            nodeIdSaved: true
        },
        commitments: {
            responsibleDataUsage: true,
            noUnauthorizedSharing: true,
            platformCompliancePolicies: true
        },
        sections: [
            {
                key: 'identity',
                label: 'Organization identity',
                complete: true,
                detail: 'Northbridge Research Labs · avery.underwood@northbridge.ai'
            },
            {
                key: 'usage',
                label: 'Usage declaration',
                complete: true,
                detail: 'Commercial analytics, scenario modeling · governed evaluation before production licensing'
            },
            {
                key: 'legal',
                label: 'Legal acknowledgment',
                complete: true,
                detail: 'Representative authority, governance, and non-redistribution recorded'
            },
            {
                key: 'verification',
                label: 'Verification evidence',
                complete: true,
                detail: 'northbridge-affiliation.pdf · northbridge-board-approval.pdf'
            },
            {
                key: 'commitments',
                label: 'Compliance commitments',
                complete: true,
                detail: 'Responsible usage, no unauthorized sharing, and policy compliance committed'
            }
        ],
        benefits: [
            {
                label: 'One-click request autofill',
                active: true,
                detail: 'Organization, usage, and review context can be reused in buyer workflow demos.'
            },
            {
                label: 'Quote friction reduction',
                active: true,
                detail: 'Rights quotes can reuse identity, legal, and verification context for demo review.'
            },
            {
                label: 'Accelerated reviewer triage',
                active: true,
                detail: 'The canonical passport provides a complete reviewer packet for the demo case.'
            }
        ],
        fastTrackEligible: true,
        preferredOrgType: 'enterprise',
        defaultDuration: '90 days',
        preferredAccessMode: 'clean_room',
        usageSummary: 'Commercial analytics, scenario modeling'
    }
}

function buildCanonicalQuote(now = new Date()) {
    const dataset = getCanonicalDataset()
    const passport = buildCanonicalPassport()
    const quote = buildRightsQuote(dataset, CANONICAL_QUOTE_INPUT, passport)

    return {
        ...quote,
        id: DEMO_ESCROW_CANONICAL_IDS.quoteId,
        datasetId: DEMO_ESCROW_CANONICAL_IDS.datasetId,
        datasetTitle: dataset.title,
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    } satisfies RightsQuote
}

function buildCanonicalConfig(): EscrowCheckoutConfig {
    return {
        accessMode: 'clean_room',
        reviewWindowHours: 48,
        paymentMethod: 'wire'
    }
}

function buildStageTimestamps(stage: DemoEscrowStage, now = new Date()): DemoEscrowTimestamps {
    const quoteCreatedAt = new Date(now.getTime() - 8 * 60 * 60 * 1000)
    const fundedAt = new Date(now.getTime() - 6 * 60 * 60 * 1000)
    const workspaceReadyAt = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    const tokenIssuedAt =
        stage === 'release_pending'
            ? new Date(now.getTime() - 165 * 60 * 1000)
            : stage === 'released'
                ? new Date(now.getTime() - 220 * 60 * 1000)
                : new Date(now.getTime() - 45 * 60 * 1000)
    const tokenExpiresAt =
        stage === 'released'
            ? new Date(now.getTime() - 40 * 60 * 1000)
            : new Date(tokenIssuedAt.getTime() + 180 * 60 * 1000)
    const validationAt =
        stage === 'released'
            ? new Date(now.getTime() - 75 * 60 * 1000)
            : new Date(now.getTime() - 10 * 60 * 1000)
    const releaseAt = new Date(now.getTime() - 20 * 60 * 1000)

    return {
        quoteCreatedAt: quoteCreatedAt.toISOString(),
        quoteExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fundedAt: fundedAt.toISOString(),
        workspaceReadyAt: workspaceReadyAt.toISOString(),
        tokenIssuedAt: tokenIssuedAt.toISOString(),
        tokenExpiresAt: tokenExpiresAt.toISOString(),
        validationAt: validationAt.toISOString(),
        releaseAt: releaseAt.toISOString()
    }
}

export function isCanonicalDemoQuote(quote: RightsQuote) {
    return quote.id === DEMO_ESCROW_CANONICAL_IDS.quoteId
}

export function isCanonicalDemoEscrowRecord(record: EscrowCheckoutRecord) {
    return (
        record.id === DEMO_ESCROW_CANONICAL_IDS.checkoutId ||
        record.escrowId === DEMO_ESCROW_CANONICAL_IDS.escrowId ||
        record.quoteId === DEMO_ESCROW_CANONICAL_IDS.quoteId
    )
}

export function filterOutCanonicalDemoQuotes<T extends RightsQuote>(quotes: T[]) {
    return quotes.filter(quote => !isCanonicalDemoQuote(quote))
}

export function filterOutCanonicalDemoEscrowRecords<T extends EscrowCheckoutRecord>(records: T[]) {
    return records.filter(record => !isCanonicalDemoEscrowRecord(record))
}

function persistCanonicalDemoQuote(quote: RightsQuote | null) {
    const preservedQuotes = readStorageArray<RightsQuote>(RIGHTS_QUOTE_STORAGE_KEY)
        .filter(existing => !isCanonicalDemoQuote(existing))
        .slice(0, 19)

    writeStorageArray(RIGHTS_QUOTE_STORAGE_KEY, quote ? [quote, ...preservedQuotes] : preservedQuotes)
}

function persistCanonicalDemoCheckoutRecord(record: EscrowCheckoutRecord | null) {
    const preservedRecords = readStorageArray<EscrowCheckoutRecord>(ESCROW_CHECKOUT_STORAGE_KEY)
        .filter(existing => !isCanonicalDemoEscrowRecord(existing))
        .slice(0, 29)

    if (!record) {
        writeStorageArray(ESCROW_CHECKOUT_STORAGE_KEY, preservedRecords)
        return
    }

    writeStorageArray(ESCROW_CHECKOUT_STORAGE_KEY, [record, ...preservedRecords])
}

function getStoredCanonicalDemoQuote() {
    return readStorageArray<RightsQuote>(RIGHTS_QUOTE_STORAGE_KEY).find(isCanonicalDemoQuote) ?? null
}

function getStoredCanonicalDemoCheckoutRecord() {
    return readStorageArray<EscrowCheckoutRecord>(ESCROW_CHECKOUT_STORAGE_KEY).find(isCanonicalDemoEscrowRecord) ?? null
}

function buildBaseCheckoutRecord(
    quote: RightsQuote,
    passport: CompliancePassport,
    timestamps: DemoEscrowTimestamps
) {
    const dataset = getCanonicalDataset()
    const config = buildCanonicalConfig()
    const baseRecord = buildEscrowCheckoutRecord(dataset, quote, passport, config)

    return {
        ...baseRecord,
        id: DEMO_ESCROW_CANONICAL_IDS.checkoutId,
        escrowId: DEMO_ESCROW_CANONICAL_IDS.escrowId,
        contractId: DEMO_ESCROW_CANONICAL_IDS.contractId,
        quoteId: quote.id,
        passportId: passport.passportId,
        createdAt: timestamps.fundedAt,
        updatedAt: timestamps.fundedAt,
        buyerLabel: CANONICAL_BUYER_LABEL,
        providerLabel: CANONICAL_PROVIDER_LABEL,
        funding: {
            ...baseRecord.funding,
            fundedAt: timestamps.fundedAt
        },
        dua: {
            ...baseRecord.dua,
            generatedAt: timestamps.fundedAt,
            accepted: true,
            acceptedAt: timestamps.fundedAt
        },
        workspace: {
            ...baseRecord.workspace,
            status: 'planned',
            workspaceId: DEMO_ESCROW_CANONICAL_IDS.workspaceId,
            launchPath: CANONICAL_WORKSPACE_LAUNCH_PATH
        },
        credentials: {
            ...baseRecord.credentials,
            status: 'planned',
            credentialId: undefined,
            issuedAt: undefined,
            expiresAt: undefined
        },
        outcomeProtection: {
            ...baseRecord.outcomeProtection,
            stage: 'evaluation_pending',
            engine: {
                status: 'not_started',
                summary: 'Outcome engine is standing by until the governed evaluation token is issued.',
                findings: []
            },
            validation: {
                status: 'pending',
                issueTypes: []
            },
            credits: {
                status: 'none',
                amountUsd: 0
            },
            release: undefined
        }
    } satisfies EscrowCheckoutRecord
}

function buildWorkspaceReadyRecord(baseRecord: EscrowCheckoutRecord, timestamps: DemoEscrowTimestamps) {
    const provisionedRecord = provisionEscrowWorkspace(baseRecord)

    return {
        ...provisionedRecord,
        updatedAt: timestamps.workspaceReadyAt,
        workspace: {
            ...provisionedRecord.workspace,
            status: 'ready',
            workspaceId: DEMO_ESCROW_CANONICAL_IDS.workspaceId,
            launchPath: CANONICAL_WORKSPACE_LAUNCH_PATH,
            provisionedAt: timestamps.workspaceReadyAt
        }
    } satisfies EscrowCheckoutRecord
}

function buildTokenIssuedRecord(workspaceReadyRecord: EscrowCheckoutRecord, timestamps: DemoEscrowTimestamps) {
    const issuedRecord = issueEscrowScopedCredentials(workspaceReadyRecord)

    return {
        ...issuedRecord,
        updatedAt: timestamps.tokenIssuedAt,
        credentials: {
            ...issuedRecord.credentials,
            status: 'issued',
            credentialId: DEMO_ESCROW_CANONICAL_IDS.tokenReference,
            issuedAt: timestamps.tokenIssuedAt,
            expiresAt: timestamps.tokenExpiresAt
        },
        outcomeProtection: {
            ...issuedRecord.outcomeProtection,
            stage: 'evaluation_active',
            engine: {
                ...issuedRecord.outcomeProtection.engine,
                status: 'not_started',
                summary: 'Protected evaluation is live. Outcome review will verify schema and freshness before payout.'
            },
            validation: {
                ...issuedRecord.outcomeProtection.validation,
                status: 'pending',
                issueTypes: [],
                updatedAt: timestamps.tokenIssuedAt
            }
        }
    } satisfies EscrowCheckoutRecord
}

function buildReleasePendingRecord(tokenIssuedRecord: EscrowCheckoutRecord, timestamps: DemoEscrowTimestamps) {
    const validatedRecord = confirmOutcomeValidation(
        tokenIssuedRecord,
        'Buyer validation completed. Escrow is pending provider release.'
    )

    return {
        ...validatedRecord,
        updatedAt: timestamps.validationAt,
        outcomeProtection: {
            ...validatedRecord.outcomeProtection,
            stage: 'validated',
            engine: {
                status: 'passed',
                summary: `Outcome engine verified ${validatedRecord.outcomeProtection.commitments.expectedFieldCount}/${validatedRecord.outcomeProtection.commitments.expectedFieldCount} contracted field(s) and freshness 96% against the current floor.`,
                findings: ['Committed schema and freshness checks passed.'],
                actualFieldCount: validatedRecord.outcomeProtection.commitments.expectedFieldCount,
                actualFreshnessScore: 96,
                lastRunAt: timestamps.validationAt
            },
            validation: {
                status: 'confirmed',
                issueTypes: [],
                note: 'Buyer validation completed. Escrow is pending provider release.',
                updatedAt: timestamps.validationAt
            }
        }
    } satisfies EscrowCheckoutRecord
}

function buildReleasedRecord(releasePendingRecord: EscrowCheckoutRecord, timestamps: DemoEscrowTimestamps) {
    const releasedRecord = releaseEscrowToProvider(releasePendingRecord)

    return {
        ...releasedRecord,
        updatedAt: timestamps.releaseAt,
        credentials: {
            ...releasedRecord.credentials,
            status: 'issued',
            credentialId: DEMO_ESCROW_CANONICAL_IDS.tokenReference,
            issuedAt: releasePendingRecord.credentials.issuedAt ?? timestamps.tokenIssuedAt,
            expiresAt: timestamps.tokenExpiresAt
        },
        outcomeProtection: {
            ...releasedRecord.outcomeProtection,
            stage: 'released',
            validation: {
                ...releasedRecord.outcomeProtection.validation,
                status: 'confirmed',
                issueTypes: [],
                note: 'Buyer validation cleared the outcome and escrow released to the provider.',
                updatedAt: timestamps.validationAt
            },
            release: {
                releasedAt: timestamps.releaseAt
            }
        }
    } satisfies EscrowCheckoutRecord
}

export function materializeCanonicalDemoCheckoutRecord(
    stage: DemoEscrowStage,
    now = new Date()
): EscrowCheckoutRecord | null {
    const quote = buildCanonicalQuote(now)
    const passport = buildCanonicalPassport()
    const timestamps = buildStageTimestamps(stage, now)

    if (stage === 'quote_ready') {
        // The real checkout storage model starts when funds are held, so quote-ready is tracked as a demo stage
        // with quote context only and no checkout record written yet.
        return null
    }

    const fundedRecord = buildBaseCheckoutRecord(
        {
            ...quote,
            createdAt: timestamps.quoteCreatedAt,
            expiresAt: timestamps.quoteExpiresAt
        },
        passport,
        timestamps
    )

    if (stage === 'escrow_funded') return fundedRecord

    const workspaceReadyRecord = buildWorkspaceReadyRecord(fundedRecord, timestamps)
    if (stage === 'workspace_ready') return workspaceReadyRecord

    const tokenIssuedRecord = buildTokenIssuedRecord(workspaceReadyRecord, timestamps)
    if (stage === 'token_issued') return tokenIssuedRecord

    const releasePendingRecord = buildReleasePendingRecord(tokenIssuedRecord, timestamps)
    if (stage === 'release_pending') return releasePendingRecord

    return buildReleasedRecord(releasePendingRecord, timestamps)
}

export function getCurrentDemoStage(): DemoEscrowStage {
    if (!isBrowser()) return DEMO_DEFAULT_STAGE
    const stored = window.localStorage.getItem(DEMO_ESCROW_STAGE_STORAGE_KEY)
    return isDemoEscrowStage(stored) ? stored : DEMO_DEFAULT_STAGE
}

export function isBuyerDemoActive() {
    if (!isBrowser()) return false
    return window.localStorage.getItem(BUYER_DEMO_ACTIVE_STORAGE_KEY) === 'true'
}

export function getCanonicalDemoQuote(now = new Date()) {
    const storedQuote = getStoredCanonicalDemoQuote()
    if (storedQuote) return storedQuote

    const timestamps = buildStageTimestamps(getCurrentDemoStage(), now)
    return {
        ...buildCanonicalQuote(now),
        createdAt: timestamps.quoteCreatedAt,
        expiresAt: timestamps.quoteExpiresAt
    } satisfies RightsQuote
}

export function getCanonicalDemoEscrowRecord(now = new Date()) {
    return getStoredCanonicalDemoCheckoutRecord() ?? materializeCanonicalDemoCheckoutRecord(getCurrentDemoStage(), now)
}

export function getCanonicalDemoEscrowScenario(now = new Date()): DemoEscrowScenario {
    const stage = getCurrentDemoStage()
    const quote = getCanonicalDemoQuote(now)
    const checkoutRecord = getCanonicalDemoEscrowRecord(now)

    return {
        stage,
        stageLabel: DEMO_ESCROW_STAGE_LABELS[stage],
        dealId: DEMO_ESCROW_CANONICAL_IDS.dealId,
        datasetId: DEMO_ESCROW_CANONICAL_IDS.datasetId,
        quote,
        checkoutRecord,
        buyerLabel: CANONICAL_BUYER_LABEL,
        providerLabel: CANONICAL_PROVIDER_LABEL,
        workspaceId: DEMO_ESCROW_CANONICAL_IDS.workspaceId,
        workspaceName:
            checkoutRecord?.workspace.workspaceName ??
            `${getCanonicalDataset().category} clean room`,
        tokenReference: checkoutRecord?.credentials.credentialId ?? null,
        scenarioInstanceId: DEMO_SCENARIO_INSTANCE_ID
    }
}

export function saveCanonicalDemoEscrowState(stage = getCurrentDemoStage(), now = new Date()) {
    const normalizedStage = isDemoEscrowStage(stage) ? stage : DEMO_DEFAULT_STAGE
    const timestamps = buildStageTimestamps(normalizedStage, now)
    const quote = {
        ...buildCanonicalQuote(now),
        createdAt: timestamps.quoteCreatedAt,
        expiresAt: timestamps.quoteExpiresAt
    } satisfies RightsQuote
    const checkoutRecord = materializeCanonicalDemoCheckoutRecord(normalizedStage, now)

    persistCanonicalDemoQuote(quote)
    persistCanonicalDemoCheckoutRecord(checkoutRecord)

    return checkoutRecord
}

export function setDemoStage(stage: DemoEscrowStage, now = new Date()) {
    if (isBrowser()) {
        window.localStorage.setItem(DEMO_ESCROW_STAGE_STORAGE_KEY, stage)
    }

    saveCanonicalDemoEscrowState(stage, now)
    return getCanonicalDemoEscrowScenario(now)
}

export function resetDemo(now = new Date()) {
    if (isBrowser()) {
        window.localStorage.removeItem(DEMO_ESCROW_STAGE_STORAGE_KEY)
    }

    saveCanonicalDemoEscrowState(DEMO_DEFAULT_STAGE, now)
    return getCanonicalDemoEscrowScenario(now)
}

export function loadHappyPath(now = new Date(), stage: DemoEscrowStage = 'token_issued') {
    return setDemoStage(stage, now)
}

export function activateBuyerDemo(
    now = new Date(),
    stage: DemoEscrowStage = BUYER_DEMO_DEFAULT_STAGE
) {
    if (isBrowser()) {
        window.localStorage.setItem(BUYER_DEMO_ACTIVE_STORAGE_KEY, 'true')
        window.localStorage.setItem(DEMO_ESCROW_STAGE_STORAGE_KEY, stage)
    }

    saveCanonicalDemoEscrowState(stage, now)
    return getCanonicalDemoEscrowScenario(now)
}

export function loadBuyerDemoHappyPath(
    now = new Date(),
    stage: DemoEscrowStage = 'token_issued'
) {
    return activateBuyerDemo(now, stage)
}

export function deactivateBuyerDemo() {
    if (!isBrowser()) return

    window.localStorage.removeItem(BUYER_DEMO_ACTIVE_STORAGE_KEY)
    window.localStorage.removeItem(DEMO_ESCROW_STAGE_STORAGE_KEY)
    persistCanonicalDemoQuote(null)
    persistCanonicalDemoCheckoutRecord(null)
}
