import type { ProviderAccountState } from '../contexts/AuthContext'
import { buildDealPath, getSeededDealRouteRecordById } from '../data/dealDossierData'
import {
    PROVIDER_INSTITUTION_REVIEW_SEED,
    type ProviderInstitutionReviewTone,
    type ProviderInstitutionSubmissionSeed,
    type ProviderInstitutionTimelineSeed
} from '../data/providerInstitutionData'
import {
    getContributionStatusPath,
    loadContributionRecords,
    type ContributionRecord
} from '../data/contributionStatusData'

export type ProviderPublishingReviewState =
    | 'Remediation required'
    | 'In review'
    | 'Approved with conditions'
    | 'Ready for signoff'

export type ProviderPublishingChecklistState = 'Confirmed' | 'In review' | 'Needs remediation'

export type ProviderPublishingChecklistItem = {
    id: string
    label: string
    detail: string
    owner: string
    state: ProviderPublishingChecklistState
    tone: ProviderInstitutionReviewTone
}

export type ProviderPublishingBlocker = {
    id: string
    title: string
    datasetTitle: string
    detail: string
    owner: string
    severity: 'High' | 'Medium' | 'Low'
    state: 'Open' | 'Monitoring'
    nextAction: string
    statusPath: string
}

export type ProviderPublishingSubmissionItem = {
    id: string
    title: string
    submissionId: string
    status: ContributionRecord['status']
    reviewState: ProviderInstitutionSubmissionSeed['reviewState']
    statusPath: string
    detailPath: string
    note: string
    nextAction: string
    feedbackSummary: string
}

export type ProviderPublishingReview = {
    reviewId: string
    institutionName: string
    institutionType: string
    summary: string
    publishingState: ProviderPublishingReviewState
    publishingTone: ProviderInstitutionReviewTone
    publishingStateDetail: string
    profile: {
        legalEntity: string
        headquarters: string
        operatingRegions: string[]
        publishingDesk: string
        tierLabel: string
        foundingProgramLabel: string
        publishingLead: string
        governanceLead: string
        escalationContact: string
    }
    readiness: {
        score: number
        approvedPackages: number
        conditionalPackages: number
        inReviewPackages: number
        remediationPackages: number
        closedPackages: number
        headline: string
        detail: string
    }
    checklist: ProviderPublishingChecklistItem[]
    blockers: ProviderPublishingBlocker[]
    submissions: ProviderPublishingSubmissionItem[]
    reviewers: typeof PROVIDER_INSTITUTION_REVIEW_SEED.reviewers
    packetLinks: Array<{
        dealId: string
        label: string
        summary: string
        to: string
    }>
    timeline: Array<ProviderInstitutionTimelineSeed & { toneClasses: string }>
}

const formatTierLabel = (tier: ProviderAccountState['tier']) => {
    switch (tier) {
        case 'starter':
            return 'Starter provider workspace'
        case 'professional':
            return 'Professional provider workspace'
        case 'enterprise':
            return 'Enterprise provider workspace'
        default:
            return 'Provider workspace'
    }
}

const getPublishingToneClasses = (tone: ProviderInstitutionReviewTone) => {
    switch (tone) {
        case 'emerald':
            return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
        case 'amber':
            return 'border-amber-500/30 bg-amber-500/10 text-amber-100'
        case 'rose':
            return 'border-rose-500/30 bg-rose-500/10 text-rose-100'
        case 'cyan':
            return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100'
        default:
            return 'border-white/10 bg-white/5 text-slate-200'
    }
}

const buildSubmissionFeedbackSummary = (dataset: ContributionRecord) => {
    if (dataset.feedback.length === 0) {
        return 'No active validation findings are attached to this submission.'
    }

    return dataset.feedback.map(item => item.detail).join(' ')
}

const getPublishingState = (
    remediationCount: number,
    inReviewCount: number,
    conditionalCount: number
): {
    state: ProviderPublishingReviewState
    tone: ProviderInstitutionReviewTone
    detail: string
} => {
    if (remediationCount > 0) {
        return {
            state: 'Remediation required',
            tone: 'rose',
            detail:
                remediationCount === 1
                    ? 'One submission is blocking full institution signoff. Clear the open remediation item before more buyer-facing packet work expands.'
                    : `${remediationCount} submissions are blocking full institution signoff. Clear the open remediation items before more buyer-facing packet work expands.`
        }
    }

    if (inReviewCount > 0) {
        return {
            state: 'In review',
            tone: 'cyan',
            detail:
                inReviewCount === 1
                    ? 'Institution review is still open while one submission completes validation and packaging.'
                    : `Institution review is still open while ${inReviewCount} submissions complete validation and packaging.`
        }
    }

    if (conditionalCount > 0) {
        return {
            state: 'Approved with conditions',
            tone: 'amber',
            detail:
                conditionalCount === 1
                    ? 'Institution publishing readiness is approved, but one governed package still carries conditional release restrictions.'
                    : `Institution publishing readiness is approved, but ${conditionalCount} governed packages still carry conditional release restrictions.`
        }
    }

    return {
        state: 'Ready for signoff',
        tone: 'emerald',
        detail: 'No open blockers remain. Institution review can move into a signed publishing-ready posture.'
    }
}

const getChecklistState = (
    checklistId: string,
    remediationCount: number,
    inReviewCount: number,
    conditionalCount: number
): {
    state: ProviderPublishingChecklistState
    tone: ProviderInstitutionReviewTone
} => {
    switch (checklistId) {
        case 'authority-roster':
        case 'escalation-routing':
            return { state: 'Confirmed', tone: 'emerald' }
        case 'source-rights':
            return remediationCount > 0
                ? { state: 'Needs remediation', tone: 'rose' }
                : { state: 'Confirmed', tone: 'emerald' }
        case 'package-alignment':
            return remediationCount > 0
                ? { state: 'Needs remediation', tone: 'rose' }
                : inReviewCount > 0
                    ? { state: 'In review', tone: 'cyan' }
                    : { state: 'Confirmed', tone: 'emerald' }
        case 'residency-matrix':
            return conditionalCount > 0 || inReviewCount > 0
                ? { state: 'In review', tone: 'amber' }
                : { state: 'Confirmed', tone: 'emerald' }
        default:
            return { state: 'In review', tone: 'cyan' }
    }
}

export function buildProviderPublishingReview(
    providerAccount: ProviderAccountState
): ProviderPublishingReview {
    const submissions = loadContributionRecords().map(dataset => {
        const seed = PROVIDER_INSTITUTION_REVIEW_SEED.submissionSeeds[dataset.id]

        return {
            id: dataset.id,
            title: dataset.title,
            submissionId: dataset.submissionId,
            status: dataset.status,
            reviewState: seed?.reviewState ?? 'Publishing review',
            statusPath: getContributionStatusPath(dataset.id),
            detailPath: `/provider/datasets/${dataset.id}`,
            note: seed?.note ?? 'Institution review is still gathering the current publishing posture for this submission.',
            nextAction: seed?.nextAction ?? 'Return to the provider dashboard for the next review cue.',
            feedbackSummary: buildSubmissionFeedbackSummary(dataset)
        }
    })

    const approvedPackages = submissions.filter(item => item.reviewState === 'Approved package').length
    const conditionalPackages = submissions.filter(item => item.reviewState === 'Conditional release').length
    const inReviewPackages = submissions.filter(item => item.reviewState === 'Publishing review').length
    const remediationPackages = submissions.filter(item => item.reviewState === 'Needs remediation').length
    const closedPackages = submissions.filter(item => item.reviewState === 'Closed').length
    const readinessScore = Math.max(
        42,
        Math.min(
            96,
            70 + approvedPackages * 8 + conditionalPackages * 4 - remediationPackages * 12 - inReviewPackages * 4
        )
    )
    const publishingState = getPublishingState(remediationPackages, inReviewPackages, conditionalPackages)

    const checklist = PROVIDER_INSTITUTION_REVIEW_SEED.verificationItems.map(item => {
        const state = getChecklistState(item.id, remediationPackages, inReviewPackages, conditionalPackages)
        return {
            ...item,
            state: state.state,
            tone: state.tone
        }
    })

    const blockers = submissions.flatMap(item => {
        const seed = PROVIDER_INSTITUTION_REVIEW_SEED.submissionSeeds[item.id]
        if (!seed?.blockerTitle) return []
        if (seed.reviewState === 'Approved package' || seed.reviewState === 'Closed') return []

        const blockerState: ProviderPublishingBlocker['state'] =
            seed.reviewState === 'Conditional release' ? 'Monitoring' : 'Open'

        return [
            {
                id: `${item.id}-blocker`,
                title: seed.blockerTitle,
                datasetTitle: item.title,
                detail: item.note,
                owner:
                    seed.reviewState === 'Conditional release'
                        ? 'Governance and residency review'
                        : seed.reviewState === 'Publishing review'
                            ? 'Publishing operations'
                            : 'Rights operations',
                severity: seed.severity ?? 'Medium',
                state: blockerState,
                nextAction: item.nextAction,
                statusPath: item.statusPath
            }
        ]
    })

    const packetLinks = PROVIDER_INSTITUTION_REVIEW_SEED.packetDealIds.flatMap(dealId => {
        const record = getSeededDealRouteRecordById(dealId)
        if (!record) return []

        return [
            {
                dealId,
                label: record.label,
                summary: record.summary,
                to: buildDealPath(dealId, 'provider-packet')
            }
        ]
    })

    const foundingProgramLabel = providerAccount.isFoundingProvider
        ? `Founding provider lane active${providerAccount.foundingProgramEndsAt ? ` until ${providerAccount.foundingProgramEndsAt}` : ''}`
        : 'Standard provider lane'

    return {
        reviewId: PROVIDER_INSTITUTION_REVIEW_SEED.reviewId,
        institutionName: PROVIDER_INSTITUTION_REVIEW_SEED.institutionName,
        institutionType: PROVIDER_INSTITUTION_REVIEW_SEED.institutionType,
        summary: PROVIDER_INSTITUTION_REVIEW_SEED.summary,
        publishingState: publishingState.state,
        publishingTone: publishingState.tone,
        publishingStateDetail: publishingState.detail,
        profile: {
            legalEntity: PROVIDER_INSTITUTION_REVIEW_SEED.legalEntity,
            headquarters: PROVIDER_INSTITUTION_REVIEW_SEED.headquarters,
            operatingRegions: PROVIDER_INSTITUTION_REVIEW_SEED.operatingRegions,
            publishingDesk: PROVIDER_INSTITUTION_REVIEW_SEED.publishingDesk,
            tierLabel: formatTierLabel(providerAccount.tier),
            foundingProgramLabel,
            publishingLead: `${PROVIDER_INSTITUTION_REVIEW_SEED.publishingLead.name} - ${PROVIDER_INSTITUTION_REVIEW_SEED.publishingLead.role}`,
            governanceLead: `${PROVIDER_INSTITUTION_REVIEW_SEED.governanceLead.name} - ${PROVIDER_INSTITUTION_REVIEW_SEED.governanceLead.role}`,
            escalationContact: `${PROVIDER_INSTITUTION_REVIEW_SEED.escalationContact.name} - ${PROVIDER_INSTITUTION_REVIEW_SEED.escalationContact.role}`
        },
        readiness: {
            score: readinessScore,
            approvedPackages,
            conditionalPackages,
            inReviewPackages,
            remediationPackages,
            closedPackages,
            headline: PROVIDER_INSTITUTION_REVIEW_SEED.reviewStatusNote,
            detail:
                remediationPackages > 0
                    ? 'Institution review stays open because at least one submission still fails rights or quality checks.'
                    : inReviewPackages > 0
                        ? 'Institution review stays active until the remaining in-flight submissions clear validation and packaging.'
                        : 'Institution review is primarily monitoring conditional release and live package hygiene.'
        },
        checklist,
        blockers,
        submissions,
        reviewers: PROVIDER_INSTITUTION_REVIEW_SEED.reviewers,
        packetLinks,
        timeline: PROVIDER_INSTITUTION_REVIEW_SEED.timeline.map(item => ({
            ...item,
            toneClasses: getPublishingToneClasses(item.tone)
        }))
    }
}
