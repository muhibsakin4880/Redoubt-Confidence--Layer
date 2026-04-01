import { participantOnboardingPaths } from './constants'
import {
    emptyComplianceCommitment,
    emptyLegalAcknowledgment,
    emptyStep1FormState,
    emptyVerificationSnapshot,
    hasStoredOnboardingValue,
    onboardingStorageKeys,
    readOnboardingValue
} from './storage'
import type {
    ComplianceCommitment,
    LegalAcknowledgment,
    OnboardingSnapshot,
    Step1FormState,
    VerificationSnapshot
} from './types'
import { isCorporateEmail, isInviteCodeValid } from './validators'

export const readOnboardingSnapshot = (): OnboardingSnapshot => ({
    step1: readOnboardingValue(onboardingStorageKeys.step1, emptyStep1FormState),
    intendedUsage: readOnboardingValue(onboardingStorageKeys.intendedUsage, []),
    participationIntent: readOnboardingValue(onboardingStorageKeys.participationIntent, []),
    legalAcknowledgment: readOnboardingValue(onboardingStorageKeys.legalAcknowledgment, emptyLegalAcknowledgment),
    verification: readOnboardingValue(onboardingStorageKeys.verification, emptyVerificationSnapshot),
    compliance: readOnboardingValue(onboardingStorageKeys.compliance, emptyComplianceCommitment)
})

export const isStep1Complete = (step1: Step1FormState) =>
    step1.organizationName.trim().length > 0 &&
    isCorporateEmail(step1.officialWorkEmail.trim()) &&
    isInviteCodeValid(step1.inviteCode) &&
    step1.roleInOrganization.trim().length > 0 &&
    step1.industryDomain.trim().length > 0 &&
    step1.country.trim().length > 0

export const isStep2Complete = (intendedUsage: string[]) => intendedUsage.length > 0

export const isStep3Complete = (participationIntent: string[], legalAcknowledgment: LegalAcknowledgment) =>
    participationIntent.length > 0 &&
    legalAcknowledgment.authorizedRepresentative &&
    legalAcknowledgment.governancePolicyAccepted &&
    legalAcknowledgment.nonRedistributionAcknowledged

export const isStep4Complete = (verification: VerificationSnapshot) =>
    verification.linkedInConnected &&
    verification.domainVerified &&
    Boolean(verification.affiliationFileName) &&
    Boolean(verification.authorizationFileName)

export const isStep5Complete = (compliance: ComplianceCommitment) =>
    compliance.responsibleDataUsage &&
    compliance.noUnauthorizedSharing &&
    compliance.platformCompliancePolicies

export const getFirstIncompleteOnboardingPath = (snapshot = readOnboardingSnapshot()) => {
    if (!isStep1Complete(snapshot.step1)) return participantOnboardingPaths.step1
    if (!isStep2Complete(snapshot.intendedUsage)) return participantOnboardingPaths.step2
    if (!isStep3Complete(snapshot.participationIntent, snapshot.legalAcknowledgment)) {
        return participantOnboardingPaths.step3
    }
    if (!isStep4Complete(snapshot.verification)) return participantOnboardingPaths.step4
    if (!isStep5Complete(snapshot.compliance)) return participantOnboardingPaths.step5
    return null
}

export const hasSubmittedOnboarding = () => hasStoredOnboardingValue(onboardingStorageKeys.submissionMeta)

export const getOnboardingResumePath = (snapshot = readOnboardingSnapshot()) => {
    const firstIncompletePath = getFirstIncompleteOnboardingPath(snapshot)
    if (firstIncompletePath) return firstIncompletePath

    if (hasSubmittedOnboarding()) {
        return participantOnboardingPaths.confirmation
    }

    return participantOnboardingPaths.step5
}

export const getOnboardingGuardRedirect = (currentPath: string, snapshot = readOnboardingSnapshot()) => {
    switch (currentPath) {
        case participantOnboardingPaths.step1:
            return null
        case participantOnboardingPaths.step2:
            return isStep1Complete(snapshot.step1) ? null : participantOnboardingPaths.step1
        case participantOnboardingPaths.step3:
            if (!isStep1Complete(snapshot.step1)) return participantOnboardingPaths.step1
            return isStep2Complete(snapshot.intendedUsage) ? null : participantOnboardingPaths.step2
        case participantOnboardingPaths.step4:
            if (!isStep1Complete(snapshot.step1)) return participantOnboardingPaths.step1
            if (!isStep2Complete(snapshot.intendedUsage)) return participantOnboardingPaths.step2
            return isStep3Complete(snapshot.participationIntent, snapshot.legalAcknowledgment)
                ? null
                : participantOnboardingPaths.step3
        case participantOnboardingPaths.step5:
            if (!isStep1Complete(snapshot.step1)) return participantOnboardingPaths.step1
            if (!isStep2Complete(snapshot.intendedUsage)) return participantOnboardingPaths.step2
            if (!isStep3Complete(snapshot.participationIntent, snapshot.legalAcknowledgment)) {
                return participantOnboardingPaths.step3
            }
            return isStep4Complete(snapshot.verification) ? null : participantOnboardingPaths.step4
        case participantOnboardingPaths.confirmation: {
            const firstIncompletePath = getFirstIncompleteOnboardingPath(snapshot)
            if (firstIncompletePath) return firstIncompletePath
            return hasSubmittedOnboarding() ? null : participantOnboardingPaths.step5
        }
        default:
            return null
    }
}
