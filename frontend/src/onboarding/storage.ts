import type {
    ComplianceCommitment,
    LegalAcknowledgment,
    Step1FormState,
    SubmissionMeta,
    VerificationSnapshot
} from './types'

export const onboardingStorageKeys = {
    step1: 'Redoubt:onboarding:step1',
    intendedUsage: 'Redoubt:onboarding:intendedUsage',
    useCaseSummary: 'Redoubt:onboarding:useCaseSummary',
    participationIntent: 'Redoubt:onboarding:participationIntent',
    legalAcknowledgment: 'Redoubt:onboarding:legalAcknowledgment',
    verification: 'Redoubt:onboarding:verification',
    compliance: 'Redoubt:onboarding:compliance',
    submissionMeta: 'Redoubt:onboarding:submissionMeta'
} as const

export const emptyStep1FormState: Step1FormState = {
    participantType: null,
    organizationName: '',
    organizationWebsite: '',
    officialWorkEmail: '',
    inviteCode: '',
    roleInOrganization: '',
    industryDomain: '',
    country: ''
}

export const emptyLegalAcknowledgment: LegalAcknowledgment = {
    authorizedRepresentative: false,
    governancePolicyAccepted: false,
    nonRedistributionAcknowledged: false
}

export const emptyUseCaseSummary = ''

export const emptyVerificationSnapshot: VerificationSnapshot = {
    linkedInConnected: false,
    domainVerified: false,
    affiliationFileName: null,
    authorizationFileName: null,
    authenticationMethod: null,
    ssoDomain: '',
    hardwareKeyType: '',
    hardwareKeyReference: '',
    corporateDomain: '',
    dnsVerificationToken: '',
    nodeId: '',
    nodeIdSaved: false
}

export const emptyComplianceCommitment: ComplianceCommitment = {
    responsibleDataUsage: false,
    noUnauthorizedSharing: false,
    platformCompliancePolicies: false
}

export const emptySubmissionMeta: SubmissionMeta = {
    referenceId: 'Pending assignment',
    submittedDate: 'Not available'
}

const hasWindow = () => typeof window !== 'undefined'

export const hasStoredOnboardingValue = (key: string) => {
    if (!hasWindow()) return false
    return window.localStorage.getItem(key) !== null
}

export const readOnboardingValue = <T,>(key: string, fallback: T): T => {
    if (!hasWindow()) return fallback

    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback

    try {
        return JSON.parse(raw) as T
    } catch {
        return fallback
    }
}

export const writeOnboardingValue = <T,>(key: string, value: T) => {
    if (!hasWindow()) return
    window.localStorage.setItem(key, JSON.stringify(value))
}

type StoredVerificationSnapshot = Partial<VerificationSnapshot> & {
    verificationKey?: string
}

export const readStep1Snapshot = (): Step1FormState => ({
    ...emptyStep1FormState,
    ...readOnboardingValue<Partial<Step1FormState>>(onboardingStorageKeys.step1, {})
})

export const readVerificationSnapshot = (): VerificationSnapshot => {
    const stored = readOnboardingValue<StoredVerificationSnapshot>(onboardingStorageKeys.verification, {})

    return {
        ...emptyVerificationSnapshot,
        ...stored,
        dnsVerificationToken: stored.dnsVerificationToken ?? stored.verificationKey ?? ''
    }
}

export const clearOnboardingState = () => {
    if (!hasWindow()) return

    Object.values(onboardingStorageKeys).forEach((key) => {
        window.localStorage.removeItem(key)
    })
}

export const readSubmissionMeta = (fallback: SubmissionMeta = emptySubmissionMeta) =>
    readOnboardingValue<SubmissionMeta>(onboardingStorageKeys.submissionMeta, fallback)

export const writeSubmissionMeta = (value: SubmissionMeta) =>
    writeOnboardingValue(onboardingStorageKeys.submissionMeta, value)
