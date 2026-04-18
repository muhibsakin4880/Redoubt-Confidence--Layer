import { participantOnboardingPaths, participantOnboardingPostSubmitPath } from './constants'
import {
    emptyComplianceCommitment,
    emptyLegalAcknowledgment,
    emptyStep1FormState,
    emptyUseCaseSummary,
    hasStoredOnboardingValue,
    onboardingStorageKeys,
    readOnboardingValue,
    readVerificationSnapshot
} from './storage'
import type {
    ComplianceCommitment,
    LegalAcknowledgment,
    OnboardingSnapshot,
    Step1FormState,
    VerificationSnapshot
} from './types'
import {
    doesCorporateDomainMatchEmail,
    isCorporateEmail,
    isInviteCodeValid,
    isUseCaseSummaryValid
} from './validators'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

export const readOnboardingSnapshot = (): OnboardingSnapshot => ({
    step1: readOnboardingValue(onboardingStorageKeys.step1, emptyStep1FormState),
    intendedUsage: readOnboardingValue(onboardingStorageKeys.intendedUsage, []),
    useCaseSummary: readOnboardingValue(onboardingStorageKeys.useCaseSummary, emptyUseCaseSummary),
    participationIntent: readOnboardingValue(onboardingStorageKeys.participationIntent, []),
    legalAcknowledgment: readOnboardingValue(onboardingStorageKeys.legalAcknowledgment, emptyLegalAcknowledgment),
    verification: readVerificationSnapshot(),
    compliance: readOnboardingValue(onboardingStorageKeys.compliance, emptyComplianceCommitment)
})

export const isStep1Complete = (step1: Step1FormState) =>
    step1.organizationName.trim().length > 0 &&
    isCorporateEmail(step1.officialWorkEmail.trim()) &&
    isInviteCodeValid(step1.inviteCode) &&
    step1.roleInOrganization.trim().length > 0 &&
    step1.industryDomain.trim().length > 0 &&
    step1.country.trim().length > 0

export const isStep2Complete = (intendedUsage: string[], useCaseSummary: string) =>
    intendedUsage.length > 0 && isUseCaseSummaryValid(useCaseSummary)

export const isStep3Complete = (participationIntent: string[], legalAcknowledgment: LegalAcknowledgment) =>
    participationIntent.length > 0 &&
    legalAcknowledgment.authorizedRepresentative &&
    legalAcknowledgment.governancePolicyAccepted &&
    legalAcknowledgment.nonRedistributionAcknowledged

const hasAuthenticationSetup = (verification: VerificationSnapshot) =>
    verification.authenticationMethod !== null &&
    (verification.authenticationMethod !== 'sso' || verification.ssoDomain.trim().length > 0)

export const hasAcceptedCorporateDomain = (officialWorkEmail: string, corporateDomain: string) =>
    MOCK_AUTH
        ? corporateDomain.trim().length > 0
        : doesCorporateDomainMatchEmail(officialWorkEmail, corporateDomain)

export const isStep4Complete = (verification: VerificationSnapshot, officialWorkEmail: string) =>
    verification.linkedInConnected &&
    verification.domainVerified &&
    Boolean(verification.affiliationFileName) &&
    Boolean(verification.authorizationFileName) &&
    hasAcceptedCorporateDomain(officialWorkEmail, verification.corporateDomain) &&
    hasAuthenticationSetup(verification)

export const isStep5Complete = (compliance: ComplianceCommitment) =>
    compliance.responsibleDataUsage &&
    compliance.noUnauthorizedSharing &&
    compliance.platformCompliancePolicies

export const getFirstIncompleteOnboardingPath = (snapshot = readOnboardingSnapshot()) => {
    if (!isStep1Complete(snapshot.step1)) return participantOnboardingPaths.step1
    if (!isStep2Complete(snapshot.intendedUsage, snapshot.useCaseSummary)) return participantOnboardingPaths.step2
    if (!isStep3Complete(snapshot.participationIntent, snapshot.legalAcknowledgment)) {
        return participantOnboardingPaths.step3
    }
    if (!isStep4Complete(snapshot.verification, snapshot.step1.officialWorkEmail)) return participantOnboardingPaths.step4
    if (!isStep5Complete(snapshot.compliance)) return participantOnboardingPaths.step5
    return null
}

export const hasSubmittedOnboarding = () => hasStoredOnboardingValue(onboardingStorageKeys.submissionMeta)

export const getOnboardingResumePath = (snapshot = readOnboardingSnapshot()) => {
    const firstIncompletePath = getFirstIncompleteOnboardingPath(snapshot)
    if (firstIncompletePath) return firstIncompletePath

    if (hasSubmittedOnboarding()) {
        return participantOnboardingPostSubmitPath
    }

    return participantOnboardingPaths.step5
}

export const getOnboardingGuardRedirect = (currentPath: string, snapshot = readOnboardingSnapshot()) => {
    if (hasSubmittedOnboarding()) {
        switch (currentPath) {
            case participantOnboardingPaths.step1:
            case participantOnboardingPaths.step2:
            case participantOnboardingPaths.step3:
            case participantOnboardingPaths.step4:
            case participantOnboardingPaths.step5:
            case participantOnboardingPaths.confirmation:
                return participantOnboardingPostSubmitPath
            default:
                break
        }
    }

    switch (currentPath) {
        case participantOnboardingPaths.step1:
            return null
        case participantOnboardingPaths.step2:
            return isStep1Complete(snapshot.step1) ? null : participantOnboardingPaths.step1
        case participantOnboardingPaths.step3:
            if (!isStep1Complete(snapshot.step1)) return participantOnboardingPaths.step1
            return isStep2Complete(snapshot.intendedUsage, snapshot.useCaseSummary) ? null : participantOnboardingPaths.step2
        case participantOnboardingPaths.step4:
            if (!isStep1Complete(snapshot.step1)) return participantOnboardingPaths.step1
            if (!isStep2Complete(snapshot.intendedUsage, snapshot.useCaseSummary)) return participantOnboardingPaths.step2
            return isStep3Complete(snapshot.participationIntent, snapshot.legalAcknowledgment)
                ? null
                : participantOnboardingPaths.step3
        case participantOnboardingPaths.step5:
            if (!isStep1Complete(snapshot.step1)) return participantOnboardingPaths.step1
            if (!isStep2Complete(snapshot.intendedUsage, snapshot.useCaseSummary)) return participantOnboardingPaths.step2
            if (!isStep3Complete(snapshot.participationIntent, snapshot.legalAcknowledgment)) {
                return participantOnboardingPaths.step3
            }
            return isStep4Complete(snapshot.verification, snapshot.step1.officialWorkEmail) ? null : participantOnboardingPaths.step4
        case participantOnboardingPaths.confirmation:
            return participantOnboardingPaths.step5
        default:
            return null
    }
}
