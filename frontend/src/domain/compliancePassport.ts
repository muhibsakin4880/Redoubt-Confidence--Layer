import { onboardingStorageKeys, readOnboardingValue } from '../onboarding/storage'
import { isIndividualParticipant, isStep4Complete } from '../onboarding/flow'
import type {
    ComplianceCommitment,
    LegalAcknowledgment,
    Step1FormState,
    VerificationSnapshot
} from '../onboarding/types'
import { isUseCaseSummaryValid } from '../onboarding/validators'

export type CompliancePassportStatus = 'active' | 'review' | 'incomplete'

export type CompliancePassportSection = {
    key: 'identity' | 'usage' | 'legal' | 'verification' | 'commitments'
    label: string
    complete: boolean
    detail: string
}

export type CompliancePassportBenefit = {
    label: string
    active: boolean
    detail: string
}

export type CompliancePassport = {
    passportId: string
    status: CompliancePassportStatus
    completionPercent: number
    issuedAt: string
    validUntil: string
    organization: Step1FormState
    intendedUsage: string[]
    useCaseSummary: string
    participationIntent: string[]
    legalAcknowledgment: LegalAcknowledgment
    verification: VerificationSnapshot
    commitments: ComplianceCommitment
    sections: CompliancePassportSection[]
    benefits: CompliancePassportBenefit[]
    fastTrackEligible: boolean
    preferredOrgType: 'research' | 'enterprise' | 'startup' | 'public' | 'other'
    defaultDuration: '30 days' | '90 days' | '6 months' | '12 months' | 'ongoing'
    preferredAccessMode: 'metadata' | 'clean_room' | 'clean_room_plus_aggregated' | 'encrypted_download'
    usageSummary: string
}

export type CompliancePassportRequestPrefill = {
    orgType: CompliancePassport['preferredOrgType']
    affiliation: string
    intendedUsage: string
    duration: CompliancePassport['defaultDuration']
    usageScale: 'low' | 'medium' | 'high'
    complianceChecked: boolean
    note: string
}

const defaultStep1: Step1FormState = {
    participantType: 'organization',
    organizationName: 'Northbridge Research Labs',
    organizationWebsite: 'https://northbridge.ai',
    officialWorkEmail: 'avery.underwood@northbridge.ai',
    inviteCode: 'REDO-2026',
    roleInOrganization: 'Senior Data Scientist',
    industryDomain: 'Healthcare & AI',
    country: 'United States'
}

const defaultUsage = ['Research', 'AI/ML training']
const defaultUseCaseSummary =
    'Evaluate healthcare datasets for benchmarking and mock reviewer triage before requesting governed access.'
const defaultParticipationIntent = ['Access datasets', 'Collaborate']
const defaultLegal: LegalAcknowledgment = {
    authorizedRepresentative: true,
    governancePolicyAccepted: true,
    nonRedistributionAcknowledged: true
}
const defaultVerification: VerificationSnapshot = {
    linkedInConnected: true,
    domainVerified: true,
    affiliationFileName: 'northbridge-affiliation.pdf',
    authorizationFileName: 'northbridge-compliance-letter.pdf',
    authenticationMethod: 'hardware_key',
    ssoDomain: '',
    hardwareKeyType: 'YubiKey 5 Series',
    hardwareKeyReference: '',
    corporateDomain: 'northbridgehealth.org',
    dnsVerificationToken: 'redoubt-verify=RDT-NB7K4P2Q',
    nodeId: 'RDT-a3f8b2c1',
    nodeIdSaved: true
}
const defaultCommitments: ComplianceCommitment = {
    responsibleDataUsage: true,
    noUnauthorizedSharing: true,
    platformCompliancePolicies: true
}

const toTitleCase = (value: string) =>
    value
        .split(/[\s/_-]+/)
        .filter(Boolean)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
        .join(' ')

const buildPassportId = (organizationName: string, officialWorkEmail: string) => {
    const seed = `${organizationName}:${officialWorkEmail}`.trim()
    let hash = 0
    for (let index = 0; index < seed.length; index += 1) {
        hash = (hash * 31 + seed.charCodeAt(index)) % 1000000
    }

    return `CP-${String(hash).padStart(6, '0')}`
}

const inferOrgType = (step1: Step1FormState): CompliancePassport['preferredOrgType'] => {
    const haystack = `${step1.organizationName} ${step1.roleInOrganization} ${step1.industryDomain}`.toLowerCase()
    if (haystack.includes('university') || haystack.includes('lab') || haystack.includes('research')) return 'research'
    if (haystack.includes('public') || haystack.includes('government') || haystack.includes('ngo')) return 'public'
    if (haystack.includes('startup') || haystack.includes('founder')) return 'startup'
    if (haystack.includes('enterprise') || haystack.includes('bank') || haystack.includes('hospital')) return 'enterprise'
    return 'enterprise'
}

const inferDefaultDuration = (usage: string[]): CompliancePassport['defaultDuration'] => {
    if (usage.some((item) => item.toLowerCase().includes('product'))) return '12 months'
    if (usage.some((item) => item.toLowerCase().includes('ai/ml'))) return '6 months'
    if (usage.some((item) => item.toLowerCase().includes('research'))) return '90 days'
    return '90 days'
}

const inferPreferredAccessMode = (
    usage: string[],
    participationIntent: string[]
): CompliancePassport['preferredAccessMode'] => {
    const normalizedUsage = usage.map(item => item.toLowerCase())
    const normalizedIntent = participationIntent.map(item => item.toLowerCase())

    if (normalizedUsage.some(item => item.includes('product')) || normalizedIntent.some(item => item.includes('contribute'))) {
        return 'clean_room_plus_aggregated'
    }
    if (normalizedUsage.some(item => item.includes('ai/ml'))) return 'clean_room'
    if (normalizedUsage.some(item => item.includes('analytics'))) return 'clean_room_plus_aggregated'
    return 'metadata'
}

const inferUsageScale = (usage: string[], participationIntent: string[]): CompliancePassportRequestPrefill['usageScale'] => {
    const normalizedUsage = usage.map(item => item.toLowerCase())
    const normalizedIntent = participationIntent.map(item => item.toLowerCase())
    if (normalizedUsage.some(item => item.includes('product')) || normalizedIntent.some(item => item.includes('contribute'))) return 'high'
    if (normalizedUsage.some(item => item.includes('ai/ml')) || normalizedUsage.some(item => item.includes('analytics'))) return 'medium'
    return 'low'
}

const getIssuedAt = () => {
    const submissionMeta = readOnboardingValue<{ submittedDate?: string } | null>(onboardingStorageKeys.submissionMeta, null)
    return submissionMeta?.submittedDate ?? 'March 27, 2026'
}

const getValidUntil = (status: CompliancePassportStatus) => {
    if (status === 'incomplete') return 'Pending completion'
    return status === 'active' ? 'June 30, 2026' : 'May 31, 2026'
}

export const buildCompliancePassport = (): CompliancePassport => {
    const organization = {
        ...defaultStep1,
        ...readOnboardingValue<Partial<Step1FormState>>(onboardingStorageKeys.step1, {})
    }
    const intendedUsage = readOnboardingValue<string[]>(onboardingStorageKeys.intendedUsage, defaultUsage)
    const useCaseSummary = readOnboardingValue<string>(onboardingStorageKeys.useCaseSummary, defaultUseCaseSummary)
    const participationIntent = readOnboardingValue<string[]>(onboardingStorageKeys.participationIntent, defaultParticipationIntent)
    const legalAcknowledgment = {
        ...defaultLegal,
        ...readOnboardingValue<Partial<LegalAcknowledgment>>(onboardingStorageKeys.legalAcknowledgment, {})
    }
    const verification = {
        ...defaultVerification,
        ...readOnboardingValue<Partial<VerificationSnapshot>>(onboardingStorageKeys.verification, {})
    }
    const commitments = {
        ...defaultCommitments,
        ...readOnboardingValue<Partial<ComplianceCommitment>>(onboardingStorageKeys.compliance, {})
    }

    const sections: CompliancePassportSection[] = [
        {
            key: 'identity',
            label: isIndividualParticipant(organization) ? 'Participant identity' : 'Organization identity',
            complete: Boolean(organization.organizationName && organization.officialWorkEmail && organization.country),
            detail: `${organization.organizationName} · ${organization.officialWorkEmail}`
        },
        {
            key: 'usage',
            label: 'Usage declaration',
            complete:
                intendedUsage.length > 0 &&
                participationIntent.length > 0 &&
                isUseCaseSummaryValid(useCaseSummary),
            detail: useCaseSummary.trim()
                ? `${intendedUsage.join(', ')} · ${useCaseSummary.trim()}`
                : `${intendedUsage.length} usage scope(s) · ${participationIntent.length} participation path(s)`
        },
        {
            key: 'legal',
            label: 'Legal acknowledgment',
            complete:
                legalAcknowledgment.authorizedRepresentative &&
                legalAcknowledgment.governancePolicyAccepted &&
                legalAcknowledgment.nonRedistributionAcknowledged,
            detail: isIndividualParticipant(organization)
                ? 'Participant accountability, governance, and non-redistribution recorded'
                : 'Representative authority, governance, and non-redistribution recorded'
        },
        {
            key: 'verification',
            label: 'Verification evidence',
            complete: isStep4Complete(organization, verification),
            detail: verification.linkedInConnected && verification.domainVerified
                ? `${verification.affiliationFileName ?? 'Affiliation file'} · ${verification.authorizationFileName ?? 'Authorization file'}`
                : isIndividualParticipant(organization)
                    ? 'LinkedIn, identity verification, document verification, and hardware-key setup still required'
                    : 'LinkedIn, DNS, document verification, and auth setup still required'
        },
        {
            key: 'commitments',
            label: 'Compliance commitments',
            complete:
                commitments.responsibleDataUsage &&
                commitments.noUnauthorizedSharing &&
                commitments.platformCompliancePolicies,
            detail: 'Responsible usage, no unauthorized sharing, and policy compliance committed'
        }
    ]

    const completedSections = sections.filter(section => section.complete).length
    const completionPercent = Math.round((completedSections / sections.length) * 100)
    const status: CompliancePassportStatus =
        completionPercent === 100 ? 'active' : completionPercent >= 60 ? 'review' : 'incomplete'
    const fastTrackEligible = completedSections >= 4
    const preferredOrgType = inferOrgType(organization)
    const defaultDuration = inferDefaultDuration(intendedUsage)
    const preferredAccessMode = inferPreferredAccessMode(intendedUsage, participationIntent)
    const usageSummary = intendedUsage.length > 0 ? intendedUsage.join(', ') : 'No declared usage scopes yet'

    const benefits: CompliancePassportBenefit[] = [
        {
            label: 'One-click request autofill',
            active: completionPercent >= 60,
            detail: 'Apply organization, usage, and compliance context to access requests automatically.'
        },
        {
            label: 'Quote friction reduction',
            active: fastTrackEligible,
            detail: 'Rights-based quotes can reuse your identity, legal, and verification state instead of re-collecting them.'
        },
        {
            label: 'Accelerated reviewer triage',
            active: completedSections === sections.length,
            detail: 'Completed passports give reviewers a fuller starting packet, but manual checks can still apply.'
        }
    ]

    return {
        passportId: buildPassportId(organization.organizationName, organization.officialWorkEmail),
        status,
        completionPercent,
        issuedAt: getIssuedAt(),
        validUntil: getValidUntil(status),
        organization,
        intendedUsage,
        useCaseSummary,
        participationIntent,
        legalAcknowledgment,
        verification,
        commitments,
        sections,
        benefits,
        fastTrackEligible,
        preferredOrgType,
        defaultDuration,
        preferredAccessMode,
        usageSummary
    }
}

export const buildRequestPrefillFromPassport = (
    passport: CompliancePassport
): CompliancePassportRequestPrefill => ({
    orgType: passport.preferredOrgType,
    affiliation: passport.organization.organizationName,
    intendedUsage: `${passport.usageSummary}. ${passport.useCaseSummary.trim()} Requested by ${passport.organization.roleInOrganization.toLowerCase()} from ${passport.organization.organizationName}.`,
    duration: passport.defaultDuration,
    usageScale: inferUsageScale(passport.intendedUsage, passport.participationIntent),
    complianceChecked: passport.status === 'active' || passport.status === 'review',
    note:
        passport.status === 'active'
            ? `Reusable Compliance Passport ${passport.passportId} applied. Identity, legal, and verification context were reused for review preparation.`
            : `Compliance Passport ${passport.passportId} provided partial reuse. Finish missing sections to improve reviewer context reuse.`
})

export const passportStatusMeta = (status: CompliancePassportStatus) => {
    if (status === 'active') {
        return {
            label: 'Active',
            classes: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
            detail: 'Reusable across requests, quotes, and governed checkout as demo review context.'
        }
    }

    if (status === 'review') {
        return {
            label: 'Review Needed',
            classes: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
            detail: 'Most fields are reusable, but one or more validation sections still need work.'
        }
    }

    return {
        label: 'Incomplete',
        classes: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
        detail: 'Complete the remaining onboarding and compliance sections to unlock reuse.'
    }
}

export const describeAccessMode = (mode: CompliancePassport['preferredAccessMode']) => {
    if (mode === 'metadata') return 'Metadata-first evaluation'
    if (mode === 'clean_room') return 'Secure clean room'
    if (mode === 'clean_room_plus_aggregated') return 'Clean room + aggregated export'
    return 'Encrypted delivery package'
}

export const humanizePassportSectionKey = (value: CompliancePassportSection['key']) =>
    toTitleCase(value)
