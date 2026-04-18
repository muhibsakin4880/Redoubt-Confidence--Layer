export type ParticipantType = 'individual' | 'organization'

export type Step1FormState = {
    participantType: ParticipantType | null
    organizationName: string
    organizationWebsite: string
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

export type AuthenticationMethod = 'sso' | 'hardware_key'

export type VerificationSnapshot = {
    linkedInConnected: boolean
    domainVerified: boolean
    affiliationFileName: string | null
    authorizationFileName: string | null
    authenticationMethod: AuthenticationMethod | null
    ssoDomain: string
    hardwareKeyType: string
    hardwareKeyReference: string
    corporateDomain: string
    dnsVerificationToken: string
    nodeId: string
    nodeIdSaved: boolean
}

export type ComplianceCommitment = {
    responsibleDataUsage: boolean
    noUnauthorizedSharing: boolean
    platformCompliancePolicies: boolean
}

export type OnboardingSnapshot = {
    step1: Step1FormState
    intendedUsage: string[]
    useCaseSummary: string
    participationIntent: string[]
    legalAcknowledgment: LegalAcknowledgment
    verification: VerificationSnapshot
    compliance: ComplianceCommitment
}

export type SubmissionMeta = {
    referenceId: string
    submittedDate: string
}
