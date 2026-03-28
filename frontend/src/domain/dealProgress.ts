import type { CompliancePassport } from './compliancePassport'
import type { EscrowCheckoutRecord } from './escrowCheckout'
import type { RightsQuote } from './rightsQuoteBuilder'

export type DealProgressStageState = 'complete' | 'current' | 'upcoming' | 'issue'

export type DealProgressStage = {
    key: 'passport' | 'quote' | 'checkout' | 'evaluation' | 'validation' | 'release'
    label: string
    state: DealProgressStageState
    detail: string
}

export type DealProgressModel = {
    headline: string
    detail: string
    nextAction: string
    completionPercent: number
    stages: DealProgressStage[]
}

type BuildDealProgressInput = {
    passport: CompliancePassport
    quote?: RightsQuote | null
    checkoutRecord?: EscrowCheckoutRecord | null
}

const completedCount = (stages: DealProgressStage[]) =>
    stages.filter(stage => stage.state === 'complete').length

const stageStateClasses = {
    complete: 'complete',
    current: 'current',
    upcoming: 'upcoming',
    issue: 'issue'
} as const

export const buildDealProgressModel = ({
    passport,
    quote,
    checkoutRecord
}: BuildDealProgressInput): DealProgressModel => {
    const passportStage: DealProgressStage =
        passport.status === 'incomplete'
            ? {
                key: 'passport',
                label: 'Compliance Passport',
                state: stageStateClasses.current,
                detail: `${passport.completionPercent}% complete. Finish missing identity or verification sections to unlock full deal reuse.`
            }
            : {
                key: 'passport',
                label: 'Compliance Passport',
                state: stageStateClasses.complete,
                detail:
                    passport.status === 'active'
                        ? `Passport ${passport.passportId} is active and reusable across deal stages.`
                        : `Passport ${passport.passportId} is reusable, with minor review follow-up still available.`
            }

    const quoteStage: DealProgressStage = quote
        ? {
            key: 'quote',
            label: 'Rights Package',
            state: stageStateClasses.complete,
            detail: `${quote.id} prices the configured rights package at ${quote.totalUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}.`
        }
        : {
            key: 'quote',
            label: 'Rights Package',
            state: passport.status === 'incomplete' ? stageStateClasses.upcoming : stageStateClasses.current,
            detail: 'Configure delivery, field access, term, and exclusivity to price the deal.'
        }

    const checkoutStage: DealProgressStage = checkoutRecord
        ? {
            key: 'checkout',
            label: 'Escrow Checkout',
            state: stageStateClasses.complete,
            detail: `${checkoutRecord.escrowId} funded escrow and generated DUA ${checkoutRecord.dua.version}.`
        }
        : {
            key: 'checkout',
            label: 'Escrow Checkout',
            state: quote ? stageStateClasses.current : stageStateClasses.upcoming,
            detail: 'Fund escrow, lock the DUA, and provision the governed workspace.'
        }

    const engineStatus = checkoutRecord?.outcomeProtection.engine.status ?? 'not_started'
    const validationStatus = checkoutRecord?.outcomeProtection.validation.status ?? 'pending'
    const creditIssued = checkoutRecord?.outcomeProtection.credits.status === 'issued'
    const released = checkoutRecord?.lifecycleState === 'RELEASED_TO_PROVIDER'

    const evaluationStage: DealProgressStage =
        creditIssued
            ? {
                key: 'evaluation',
                label: 'Protected Evaluation',
                state: stageStateClasses.issue,
                detail: checkoutRecord?.outcomeProtection.engine.summary ?? 'Evaluation found a commitment miss and automatic credits were issued.'
            }
            : engineStatus === 'passed'
                ? {
                    key: 'evaluation',
                    label: 'Protected Evaluation',
                    state: stageStateClasses.complete,
                    detail: checkoutRecord?.outcomeProtection.engine.summary ?? 'Engine verified schema and freshness commitments.'
                }
                : checkoutRecord?.credentials.status === 'issued'
                    ? {
                        key: 'evaluation',
                        label: 'Protected Evaluation',
                        state: stageStateClasses.current,
                        detail: 'Engine scan is running against schema and freshness commitments inside the governed workspace.'
                    }
                    : {
                        key: 'evaluation',
                        label: 'Protected Evaluation',
                        state: checkoutRecord ? stageStateClasses.upcoming : stageStateClasses.upcoming,
                        detail: 'Paid clean-room evaluation starts after scoped credentials are issued.'
                    }

    const validationStage: DealProgressStage =
        creditIssued
            ? {
                key: 'validation',
                label: 'Buyer Validation',
                state: stageStateClasses.issue,
                detail: 'Buyer validation failed because the outcome engine detected a protected commitment miss.'
            }
            : validationStatus === 'confirmed' || released
                ? {
                    key: 'validation',
                    label: 'Buyer Validation',
                    state: stageStateClasses.complete,
                    detail: checkoutRecord?.outcomeProtection.validation.note ?? 'Buyer confirmed that the delivered deal outcome matches the contracted commitments.'
                }
                : engineStatus === 'passed' || checkoutRecord?.lifecycleState === 'RELEASE_PENDING'
                    ? {
                        key: 'validation',
                        label: 'Buyer Validation',
                        state: stageStateClasses.current,
                        detail: 'Outcome engine passed. Buyer confirmation is still required before payout.'
                    }
                    : {
                        key: 'validation',
                        label: 'Buyer Validation',
                        state: stageStateClasses.upcoming,
                        detail: 'Buyer validation unlocks after the protected evaluation engine completes.'
                    }

    const releaseStage: DealProgressStage =
        released
            ? {
                key: 'release',
                label: 'Release / Credit',
                state: stageStateClasses.complete,
                detail: 'Escrow was released to the provider after buyer validation.'
            }
            : creditIssued
                ? {
                    key: 'release',
                    label: 'Release / Credit',
                    state: stageStateClasses.issue,
                    detail: checkoutRecord?.outcomeProtection.credits.reason ?? 'Automatic credits were issued and provider payout remains frozen.'
                }
                : checkoutRecord?.lifecycleState === 'RELEASE_PENDING'
                    ? {
                        key: 'release',
                        label: 'Release / Credit',
                        state: stageStateClasses.current,
                        detail: 'Escrow is ready for payout once the buyer confirms release.'
                    }
                    : {
                        key: 'release',
                        label: 'Release / Credit',
                        state: stageStateClasses.upcoming,
                        detail: 'The deal resolves into either provider payout or buyer credits after validation.'
                    }

    const stages = [
        passportStage,
        quoteStage,
        checkoutStage,
        evaluationStage,
        validationStage,
        releaseStage
    ]

    const completeStages = completedCount(stages)
    const completionPercent = Math.round((completeStages / stages.length) * 100)

    if (creditIssued) {
        return {
            headline: 'Protected miss detected',
            detail: checkoutRecord?.outcomeProtection.engine.summary ?? 'The protection engine found a commitment miss and issued automatic credits.',
            nextAction: 'Review the credited deal in Escrow Center or adjust the rights package before retrying.',
            completionPercent,
            stages
        }
    }

    if (released) {
        return {
            headline: 'Deal released',
            detail: 'The governed transaction completed successfully and escrow was released to the provider.',
            nextAction: 'Open Escrow Center to review the closed record and audit trail.',
            completionPercent,
            stages
        }
    }

    if (validationStatus === 'confirmed' || checkoutRecord?.lifecycleState === 'RELEASE_PENDING') {
        return {
            headline: 'Awaiting payout release',
            detail: 'Buyer validation is complete and the transaction is ready for escrow release.',
            nextAction: 'Release escrow to finalize the protected deal.',
            completionPercent,
            stages
        }
    }

    if (engineStatus === 'passed') {
        return {
            headline: 'Awaiting buyer validation',
            detail: checkoutRecord?.outcomeProtection.engine.summary ?? 'The engine passed and buyer confirmation is now required.',
            nextAction: 'Buyer should confirm the outcome before payout is released.',
            completionPercent,
            stages
        }
    }

    if (checkoutRecord?.credentials.status === 'issued') {
        return {
            headline: 'Protected evaluation is live',
            detail: 'The governed workspace is active and the protection engine is checking committed schema and freshness outcomes.',
            nextAction: 'Wait for the engine result, then validate or resolve the protected deal.',
            completionPercent,
            stages
        }
    }

    if (checkoutRecord) {
        return {
            headline: 'Checkout is in progress',
            detail: 'Escrow has been funded and the governed deal is being provisioned for evaluation.',
            nextAction: 'Provision the workspace and issue scoped credentials to begin paid evaluation.',
            completionPercent,
            stages
        }
    }

    if (quote) {
        return {
            headline: 'Rights package is ready',
            detail: 'The deal has a priced rights package and is ready to move into governed checkout.',
            nextAction: 'Start escrow-native checkout to generate the DUA and fund escrow.',
            completionPercent,
            stages
        }
    }

    return {
        headline: passport.status === 'incomplete' ? 'Complete compliance passport' : 'Start your first deal',
        detail:
            passport.status === 'incomplete'
                ? 'Reusable identity, legal, and verification context should be completed before the strongest deal path begins.'
                : 'Begin by configuring a rights package for this dataset.',
        nextAction:
            passport.status === 'incomplete'
                ? 'Finish passport setup to unlock the strongest trust and pricing path.'
                : 'Build a rights-based quote to price the deal.',
        completionPercent,
        stages
    }
}
