import type { DatasetDetail } from '../data/datasetDetailData'
import type { CompliancePassport, CompliancePassportRequestPrefill } from './compliancePassport'

export type QuoteDeliveryMode = 'metadata_only' | 'clean_room' | 'aggregated_export' | 'encrypted_download'
export type QuoteFieldPack = 'core' | 'analytics' | 'full_schema' | 'sensitive_review'
export type QuoteUsageRight = 'research' | 'internal_ai' | 'commercial_analytics' | 'customer_facing'
export type QuoteDuration = '30_days' | '90_days' | '12_months' | '24_months'
export type QuoteGeography = 'single_region' | 'dual_region' | 'global'
export type QuoteExclusivity = 'none' | 'sector_vertical' | 'regional' | 'full'
export type QuoteSupport = 'standard' | 'priority' | 'mission_critical'

export type RightsQuoteForm = {
    deliveryMode: QuoteDeliveryMode
    fieldPack: QuoteFieldPack
    usageRight: QuoteUsageRight
    duration: QuoteDuration
    geography: QuoteGeography
    exclusivity: QuoteExclusivity
    support: QuoteSupport
    seatBand: 'team' | 'department' | 'enterprise'
    validationWindowHours: 24 | 48 | 72
    redistributionRights: 'allowed' | 'not_allowed'
    auditLoggingRequirement: 'mandatory' | 'optional'
    attributionRequirement: 'required' | 'not_required'
    volumeBasedPricing: boolean
    volumePricingAdjustment: number
    volumePricingUnit: 'tb' | 'million_records'
}

export type QuoteBreakdownLine = {
    label: string
    amountUsd: number
    detail: string
}

export type RightsQuote = {
    id: string
    datasetId: string
    datasetTitle: string
    createdAt: string
    expiresAt: string
    input: RightsQuoteForm
    totalUsd: number
    escrowHoldUsd: number
    discountUsd: number
    breakdown: QuoteBreakdownLine[]
    riskBand: 'controlled' | 'heightened' | 'strict'
    rightsSummary: string[]
    checkoutNotes: string[]
    passportApplied: boolean
}

export type RightsQuoteRequestPrefill = CompliancePassportRequestPrefill & {
    quoteId: string
    quoteSummary: string
}

export type RightsUsageGuidance = {
    usageRightsSummary: string[]
    prohibitedUses: string[]
}

const RIGHTS_QUOTE_STORAGE_KEY = 'Redoubt:rightsQuotes'

const deliveryMeta: Record<QuoteDeliveryMode, { label: string; multiplier: number; detail: string }> = {
    metadata_only: { label: 'Metadata only', multiplier: 0.4, detail: 'Discovery rights only with no protected rows exposed.' },
    clean_room: { label: 'Secure clean room', multiplier: 1, detail: 'Analysis in governed environment without export rights.' },
    aggregated_export: { label: 'Aggregated export', multiplier: 1.22, detail: 'Aggregated outputs permitted after enclave review.' },
    encrypted_download: { label: 'Encrypted download', multiplier: 1.48, detail: 'Scoped encrypted package with reconfirmation and watermarking.' }
}

const fieldPackMeta: Record<QuoteFieldPack, { label: string; multiplier: number; detail: string }> = {
    core: { label: 'Core fields', multiplier: 0.82, detail: 'Essential business and schema columns only.' },
    analytics: { label: 'Analytics pack', multiplier: 1, detail: 'Most analytical dimensions without highest-risk fields.' },
    full_schema: { label: 'Full schema', multiplier: 1.16, detail: 'Full approved schema with greater review surface.' },
    sensitive_review: { label: 'Sensitive review pack', multiplier: 1.34, detail: 'High-sensitivity fields under enhanced policy review.' }
}

const usageMeta: Record<QuoteUsageRight, { label: string; multiplier: number; detail: string }> = {
    research: { label: 'Research use', multiplier: 1, detail: 'Internal research and evaluation only.' },
    internal_ai: { label: 'Internal AI training', multiplier: 1.18, detail: 'Internal training and model validation rights.' },
    commercial_analytics: { label: 'Commercial analytics', multiplier: 1.32, detail: 'Commercial internal decisions and monetized insights.' },
    customer_facing: { label: 'Customer-facing output', multiplier: 1.55, detail: 'Rights cover downstream client-facing product output.' }
}

const durationMeta: Record<QuoteDuration, { label: string; multiplier: number }> = {
    '30_days': { label: '30 days', multiplier: 0.58 },
    '90_days': { label: '90 days', multiplier: 1 },
    '12_months': { label: '12 months', multiplier: 2.45 },
    '24_months': { label: '24 months', multiplier: 4.15 }
}

const geographyMeta: Record<QuoteGeography, { label: string; multiplier: number }> = {
    single_region: { label: 'Single region', multiplier: 1 },
    dual_region: { label: 'Dual region', multiplier: 1.14 },
    global: { label: 'Global', multiplier: 1.28 }
}

const exclusivityMeta: Record<QuoteExclusivity, { label: string; multiplier: number }> = {
    none: { label: 'Non-exclusive', multiplier: 1 },
    sector_vertical: { label: 'Vertical exclusive', multiplier: 1.22 },
    regional: { label: 'Regional exclusive', multiplier: 1.46 },
    full: { label: 'Full exclusive', multiplier: 1.9 }
}

const supportMeta: Record<QuoteSupport, { label: string; multiplier: number; detail: string }> = {
    standard: { label: 'Standard support', multiplier: 1, detail: 'Included by default for quotes and governed evaluations.' },
    priority: { label: 'Priority support', multiplier: 1.03, detail: 'Usually attached to annual buyer accounts that need faster operational response.' },
    mission_critical: { label: 'Mission critical', multiplier: 1.08, detail: 'Reserved for enterprise agreements with heightened delivery and response expectations.' }
}

const seatBandMeta = {
    team: { label: 'Team', multiplier: 1 },
    department: { label: 'Department', multiplier: 1.16 },
    enterprise: { label: 'Enterprise', multiplier: 1.32 }
} as const

const parseSizeFactor = (size: string) => {
    const normalized = size.toLowerCase()
    const numericValue = Number.parseFloat(normalized)
    if (Number.isNaN(numericValue)) return 1
    if (normalized.includes('tb')) return 1 + numericValue * 0.18
    if (normalized.includes('gb')) return 1 + numericValue / 1000
    return 1
}

const categoryPremium = (category: string) => {
    const normalized = category.toLowerCase()
    if (normalized.includes('health')) return 1.22
    if (normalized.includes('finance')) return 1.18
    if (normalized.includes('climate')) return 1.06
    return 1.1
}

const roundToNearest25 = (value: number) => Math.round(value / 25) * 25

const buildQuoteId = () => `QT-${Math.floor(100000 + Math.random() * 900000)}`

const buildExpiryDate = () => {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7)
    return expiry.toISOString()
}

const buildCheckoutNotes = (quote: RightsQuote) => [
    `Escrow hold of ${formatUsd(quote.escrowHoldUsd)} is recommended for checkout.`,
    `Validation window: ${quote.input.validationWindowHours} hours before release.`,
    quote.passportApplied
        ? 'Reusable compliance passport can be attached at checkout to reduce manual review.'
        : 'No active compliance passport discount applied; expect standard manual review.'
]

export const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)

export const getDefaultRightsQuoteForm = (passport: CompliancePassport): RightsQuoteForm => {
    const deliveryMode: QuoteDeliveryMode =
        passport.preferredAccessMode === 'metadata'
            ? 'metadata_only'
            : passport.preferredAccessMode === 'clean_room'
                ? 'clean_room'
                : passport.preferredAccessMode === 'clean_room_plus_aggregated'
                    ? 'aggregated_export'
                    : 'encrypted_download'

    const usageRight: QuoteUsageRight =
        passport.intendedUsage.some(item => item.toLowerCase().includes('ai/ml'))
            ? 'internal_ai'
            : passport.intendedUsage.some(item => item.toLowerCase().includes('research'))
                ? 'research'
                : 'commercial_analytics'

    const duration: QuoteDuration =
        passport.defaultDuration === '30 days'
            ? '30_days'
            : passport.defaultDuration === '90 days'
                ? '90_days'
                : passport.defaultDuration === '6 months'
                    ? '12_months'
                    : passport.defaultDuration === '12 months'
                        ? '12_months'
                        : '24_months'

    return {
        deliveryMode,
        fieldPack: deliveryMode === 'metadata_only' ? 'core' : 'analytics',
        usageRight,
        duration,
        geography: 'single_region',
        exclusivity: 'none',
        support: passport.fastTrackEligible ? 'priority' : 'standard',
        seatBand: 'team',
        validationWindowHours: passport.status === 'active' ? 24 : 48,
        redistributionRights: 'not_allowed',
        auditLoggingRequirement: 'mandatory',
        attributionRequirement: 'required',
        volumeBasedPricing: false,
        volumePricingAdjustment: 0,
        volumePricingUnit: 'tb'
    }
}

export const buildRightsQuote = (
    dataset: DatasetDetail,
    input: RightsQuoteForm,
    passport: CompliancePassport
): RightsQuote => {
    const datasetBase =
        (800 + dataset.confidenceScore * 7 + dataset.preview.structureQuality * 3) *
        parseSizeFactor(dataset.size) *
        categoryPremium(dataset.category)

    const beforeDiscount =
        datasetBase *
        deliveryMeta[input.deliveryMode].multiplier *
        fieldPackMeta[input.fieldPack].multiplier *
        usageMeta[input.usageRight].multiplier *
        durationMeta[input.duration].multiplier *
        geographyMeta[input.geography].multiplier *
        exclusivityMeta[input.exclusivity].multiplier *
        supportMeta[input.support].multiplier *
        seatBandMeta[input.seatBand].multiplier

    const passportDiscountRate = passport.status === 'active' ? 0.08 : passport.status === 'review' ? 0.03 : 0
    const discountUsd = roundToNearest25(beforeDiscount * passportDiscountRate)
    const totalUsd = roundToNearest25(beforeDiscount - discountUsd)
    const escrowHoldUsd = roundToNearest25(totalUsd * (input.validationWindowHours === 72 ? 0.24 : input.validationWindowHours === 48 ? 0.2 : 0.16))

    const riskBand: RightsQuote['riskBand'] =
        input.deliveryMode === 'encrypted_download' ||
        input.fieldPack === 'sensitive_review' ||
        input.exclusivity === 'full'
            ? 'strict'
            : input.deliveryMode === 'aggregated_export' || input.usageRight === 'commercial_analytics'
                ? 'heightened'
                : 'controlled'

    const breakdown: QuoteBreakdownLine[] = [
        {
            label: 'Base dataset access',
            amountUsd: roundToNearest25(datasetBase),
            detail: `Confidence ${dataset.confidenceScore}% · ${dataset.category} premium applied`
        },
        {
            label: deliveryMeta[input.deliveryMode].label,
            amountUsd: roundToNearest25(datasetBase * (deliveryMeta[input.deliveryMode].multiplier - 1)),
            detail: deliveryMeta[input.deliveryMode].detail
        },
        {
            label: fieldPackMeta[input.fieldPack].label,
            amountUsd: roundToNearest25(datasetBase * deliveryMeta[input.deliveryMode].multiplier * (fieldPackMeta[input.fieldPack].multiplier - 1)),
            detail: fieldPackMeta[input.fieldPack].detail
        },
        {
            label: usageMeta[input.usageRight].label,
            amountUsd: roundToNearest25(beforeDiscount * (usageMeta[input.usageRight].multiplier - 1) / usageMeta[input.usageRight].multiplier),
            detail: usageMeta[input.usageRight].detail
        },
        {
            label: 'Term, geography, and exclusivity',
            amountUsd: roundToNearest25(
                beforeDiscount *
                (durationMeta[input.duration].multiplier * geographyMeta[input.geography].multiplier * exclusivityMeta[input.exclusivity].multiplier - 1) /
                (durationMeta[input.duration].multiplier * geographyMeta[input.geography].multiplier * exclusivityMeta[input.exclusivity].multiplier)
            ),
            detail: `${durationMeta[input.duration].label} · ${geographyMeta[input.geography].label} · ${exclusivityMeta[input.exclusivity].label}`
        },
        {
            label: supportMeta[input.support].label,
            amountUsd: roundToNearest25(beforeDiscount * (supportMeta[input.support].multiplier - 1) / supportMeta[input.support].multiplier),
            detail: supportMeta[input.support].detail
        }
    ]

    if (discountUsd > 0) {
        breakdown.push({
            label: 'Reusable compliance passport discount',
            amountUsd: -discountUsd,
            detail: `Applied because passport ${passport.passportId} is ${passport.status}.`
        })
    }

    const quote: RightsQuote = {
        id: buildQuoteId(),
        datasetId: dataset.id,
        datasetTitle: dataset.title,
        createdAt: new Date().toISOString(),
        expiresAt: buildExpiryDate(),
        input,
        totalUsd,
        escrowHoldUsd,
        discountUsd,
        breakdown,
        riskBand,
        rightsSummary: [
            `${deliveryMeta[input.deliveryMode].label} delivery`,
            `${fieldPackMeta[input.fieldPack].label} access`,
            `${usageMeta[input.usageRight].label}`,
            `${durationMeta[input.duration].label} license`,
            `${geographyMeta[input.geography].label} rights`,
            `${exclusivityMeta[input.exclusivity].label}`
        ],
        checkoutNotes: [],
        passportApplied: discountUsd > 0
    }

    quote.checkoutNotes = buildCheckoutNotes(quote)

    return quote
}

export const buildRightsUsageGuidance = (dataset: DatasetDetail, quote: RightsQuote): RightsUsageGuidance => {
    const usageRightsSummary = [
        `${usageMeta[quote.input.usageRight].label}: ${usageMeta[quote.input.usageRight].detail}`,
        `${deliveryMeta[quote.input.deliveryMode].label}: ${deliveryMeta[quote.input.deliveryMode].detail}`,
        `${fieldPackMeta[quote.input.fieldPack].label}: ${fieldPackMeta[quote.input.fieldPack].detail}`,
        `Purpose limitation: ${dataset.trustProfile.purposeLimitation.value}`,
        `Ownership and license cue: ${dataset.trustProfile.ownershipAndLicense.value}`
    ]

    const prohibitedUses = [
        `Use outside the stated purpose limitation: ${dataset.trustProfile.purposeLimitation.value}`,
        quote.input.redistributionRights === 'not_allowed'
            ? 'Redistribution, resale, or third-party sharing is not included in these terms.'
            : null,
        quote.input.attributionRequirement === 'required'
            ? 'Removing required attribution from permitted downstream outputs.'
            : null,
        quote.input.geography !== 'global'
            ? `Use outside the licensed ${geographyMeta[quote.input.geography].label.toLowerCase()} scope.`
            : null,
        dataset.trustProfile.reidentificationRisk.value.toLowerCase().includes('low re-identification risk')
            ? null
            : 'Attempts to re-identify people, households, cohorts, or sensitive units from outputs.',
        'Treating quote terms as proof of ownership, lawful basis, or chain-of-title.'
    ].filter((item): item is string => Boolean(item))

    return {
        usageRightsSummary,
        prohibitedUses
    }
}

export const saveRightsQuote = (quote: RightsQuote) => {
    const quotes = loadRightsQuotes()
    const next = [quote, ...quotes].slice(0, 20)
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(RIGHTS_QUOTE_STORAGE_KEY, JSON.stringify(next))
    }
    return next
}

export const loadRightsQuotes = (datasetId?: string) => {
    if (typeof window === 'undefined') return [] as RightsQuote[]
    const raw = window.localStorage.getItem(RIGHTS_QUOTE_STORAGE_KEY)
    if (!raw) return [] as RightsQuote[]

    try {
        const parsed = JSON.parse(raw) as RightsQuote[]
        if (!Array.isArray(parsed)) return [] as RightsQuote[]
        const sorted = parsed.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        return datasetId ? sorted.filter(quote => quote.datasetId === datasetId) : sorted
    } catch {
        return [] as RightsQuote[]
    }
}

export const buildRequestPrefillFromQuote = (
    quote: RightsQuote,
    passport: CompliancePassport
): RightsQuoteRequestPrefill => {
    const passportPrefill = {
        orgType: passport.preferredOrgType,
        affiliation: passport.organization.organizationName,
        intendedUsage: `${usageMeta[quote.input.usageRight].label}. ${fieldPackMeta[quote.input.fieldPack].label}. ${deliveryMeta[quote.input.deliveryMode].label}.`,
        duration:
            quote.input.duration === '30_days'
                ? '30 days'
                : quote.input.duration === '90_days'
                    ? '90 days'
                    : quote.input.duration === '12_months'
                        ? '12 months'
                        : 'ongoing',
        usageScale:
            quote.input.seatBand === 'enterprise'
                ? 'high'
                : quote.input.seatBand === 'department'
                    ? 'medium'
                    : 'low',
        complianceChecked: passport.status !== 'incomplete',
        note: `Rights quote ${quote.id} applied. ${quote.rightsSummary.join(' · ')}`
    } satisfies CompliancePassportRequestPrefill

    return {
        ...passportPrefill,
        quoteId: quote.id,
        quoteSummary: `${quote.id} · ${formatUsd(quote.totalUsd)} · ${quote.rightsSummary[0]} · ${quote.rightsSummary[2]}`
    }
}

export const deliveryModeOptions = Object.entries(deliveryMeta).map(([value, meta]) => ({
    value: value as QuoteDeliveryMode,
    ...meta
}))

export const fieldPackOptions = Object.entries(fieldPackMeta).map(([value, meta]) => ({
    value: value as QuoteFieldPack,
    ...meta
}))

export const usageRightOptions = Object.entries(usageMeta).map(([value, meta]) => ({
    value: value as QuoteUsageRight,
    ...meta
}))

export const durationOptions = Object.entries(durationMeta).map(([value, meta]) => ({
    value: value as QuoteDuration,
    ...meta
}))

export const geographyOptions = Object.entries(geographyMeta).map(([value, meta]) => ({
    value: value as QuoteGeography,
    ...meta
}))

export const exclusivityOptions = Object.entries(exclusivityMeta).map(([value, meta]) => ({
    value: value as QuoteExclusivity,
    ...meta
}))

export const supportOptions = Object.entries(supportMeta).map(([value, meta]) => ({
    value: value as QuoteSupport,
    ...meta
}))

export const seatBandOptions = Object.entries(seatBandMeta).map(([value, meta]) => ({
    value: value as RightsQuoteForm['seatBand'],
    ...meta
}))
