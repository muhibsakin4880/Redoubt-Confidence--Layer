import {
    DEFAULT_DISCOVERY_REVIEW_STATE,
    DISCOVERY_REVIEW_STATE_META,
    type DiscoveryReviewState
} from '../data/discoveryReviewData'
import { buildDealPath, getDealRouteRecordByDatasetId } from '../data/dealDossierData'

export const STORAGE_DISCOVERY_REVIEW_STATE = 'Redoubt:datasets:internalReview'

export type DiscoveryReviewStateMap = Record<string, DiscoveryReviewState>

export type DiscoveryReviewAction = {
    label: string
    to: string
}

export const loadDiscoveryReviewStateMap = (): DiscoveryReviewStateMap => {
    if (typeof window === 'undefined') return {}

    const stored = window.localStorage.getItem(STORAGE_DISCOVERY_REVIEW_STATE)
    if (!stored) return {}

    try {
        const parsed = JSON.parse(stored) as Record<string, unknown>

        if (!parsed || typeof parsed !== 'object') return {}

        return Object.fromEntries(
            Object.entries(parsed).filter(([, value]) =>
                typeof value === 'string' && value in DISCOVERY_REVIEW_STATE_META
            )
        ) as DiscoveryReviewStateMap
    } catch {
        return {}
    }
}

export const saveDiscoveryReviewStateMap = (reviewStateMap: DiscoveryReviewStateMap) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_DISCOVERY_REVIEW_STATE, JSON.stringify(reviewStateMap))
}

export const syncDiscoveryReviewStateMap = (
    shortlistIds: number[],
    reviewStateMap: DiscoveryReviewStateMap
) => {
    const shortlistSet = new Set(shortlistIds.map(id => String(id)))
    let changed = false
    const nextMap: DiscoveryReviewStateMap = {}

    shortlistSet.forEach(datasetId => {
        const nextValue = reviewStateMap[datasetId] ?? DEFAULT_DISCOVERY_REVIEW_STATE
        nextMap[datasetId] = nextValue

        if (reviewStateMap[datasetId] !== nextValue) {
            changed = true
        }
    })

    Object.keys(reviewStateMap).forEach(datasetId => {
        if (!shortlistSet.has(datasetId)) {
            changed = true
        }
    })

    if (!changed && Object.keys(reviewStateMap).length === Object.keys(nextMap).length) {
        return reviewStateMap
    }

    return nextMap
}

export const getDiscoveryReviewState = (
    datasetId: number | string,
    shortlisted: boolean,
    reviewStateMap: DiscoveryReviewStateMap
) => {
    if (!shortlisted) return null

    return reviewStateMap[String(datasetId)] ?? DEFAULT_DISCOVERY_REVIEW_STATE
}

export const buildDiscoveryReviewAction = (
    datasetId: number | string,
    reviewState: DiscoveryReviewState
): DiscoveryReviewAction => {
    const normalizedDatasetId = String(datasetId)
    const dealRoute = getDealRouteRecordByDatasetId(normalizedDatasetId)

    if (!dealRoute) {
        return {
            label: 'Open dataset detail',
            to: `/datasets/${normalizedDatasetId}`
        }
    }

    if (reviewState === 'rejected_for_now') {
        return {
            label: 'Open dataset detail',
            to: `/datasets/${normalizedDatasetId}`
        }
    }

    if (reviewState === 'awaiting_provider_clarification') {
        return {
            label: 'Open clarification history',
            to: buildDealPath(dealRoute.dealId, 'negotiation')
        }
    }

    if (reviewState === 'needs_governance_input') {
        return {
            label: 'Open approval artifact',
            to: buildDealPath(dealRoute.dealId, 'approval')
        }
    }

    return {
        label: 'Open evaluation dossier',
        to: buildDealPath(dealRoute.dealId, 'dossier')
    }
}

export const buildDiscoveryReviewCounts = (
    shortlistIds: number[],
    reviewStateMap: DiscoveryReviewStateMap
) => {
    const syncedMap = syncDiscoveryReviewStateMap(shortlistIds, reviewStateMap)
    const values = Object.values(syncedMap)

    return {
        shortlisted: values.filter(value => value === 'shortlisted').length,
        committeeReview: values.filter(value => value === 'committee_review').length,
        needsGovernanceInput: values.filter(value => value === 'needs_governance_input').length,
        awaitingProviderClarification: values.filter(value => value === 'awaiting_provider_clarification').length,
        rejectedForNow: values.filter(value => value === 'rejected_for_now').length
    }
}
