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

export type AuthenticationMethod = 'sso' | 'hardware_key'

export type RightsPackage = {
    accessType: string
    duration: string
    customDuration?: string
    usagePurposes: string[]
    otherUsagePurpose: string
    geographicRestriction: 'global' | 'specific'
    selectedRegions: string[]
    fieldRestrictions: { fieldName: string; restriction: 'restricted' | 'masked' }[]
    additionalConditions: {
        attributionRequired: boolean
        auditLoggingMandatory: boolean
        noRedistribution: boolean
    }
    advancedConditions: {
        redistributionRights: 'allowed' | 'not_allowed'
        auditLoggingRequirement: 'mandatory' | 'optional'
        attributionRequirement: 'required' | 'not_required'
        volumeBasedPricing: boolean
        volumePricingAdjustment: number
        volumePricingUnit: 'tb' | 'million_records'
    }
}

export type VerificationSnapshot = {
    linkedInConnected: boolean
    domainVerified: boolean
    affiliationFileName: string | null
    authorizationFileName: string | null
    authenticationMethod: AuthenticationMethod | null
    ssoDomain: string
    rightsPackage: RightsPackage
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
