export type Step1FormState = {
    organizationName: string
    officialWorkEmail: string
    inviteCode: string
    roleInOrganization: string
    industryDomain: string
    country: string
}

export type LegalAcknowledgment = {
    authorizedRepresentative: boolean
    governancePolicyAccepted: boolean
    nonRedistributionAcknowledged: boolean
}

export type VerificationSnapshot = {
    linkedInConnected: boolean
    domainVerified: boolean
    affiliationFileName: string | null
    authorizationFileName: string | null
}

export type ComplianceCommitment = {
    responsibleDataUsage: boolean
    noUnauthorizedSharing: boolean
    platformCompliancePolicies: boolean
}

export type OnboardingSnapshot = {
    step1: Step1FormState
    intendedUsage: string[]
    participationIntent: string[]
    legalAcknowledgment: LegalAcknowledgment
    verification: VerificationSnapshot
    compliance: ComplianceCommitment
}

export type SubmissionMeta = {
    referenceId: string
    submittedDate: string
}
