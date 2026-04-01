export const participantOnboardingTitle = 'Participant Onboarding'
export const participantOnboardingSubtitle =
    'Identity, domain, and governance verification for controlled participation.'

export const participantOnboardingPaths = {
    entry: '/onboarding',
    step1: '/onboarding/step1',
    step2: '/onboarding/step2',
    step3: '/onboarding/step3',
    step4: '/onboarding/step4',
    step5: '/onboarding/step5',
    confirmation: '/onboarding/confirmation',
    applicationStatus: '/application-status'
} as const

export const participantOnboardingPostSubmitPath = participantOnboardingPaths.confirmation

export const participantOnboardingStepTitles = [
    'Organization & Identity',
    'Intended Platform Usage',
    'Participation Intent',
    'Verification & Credentials',
    'Final Review & Commitments',
    'Application Submitted'
] as const

export const participantOnboardingActiveStepTitles = participantOnboardingStepTitles.slice(0, 5)

export const participantOnboardingPolicyPath = '/trust-center'
export const participantOnboardingPolicyLabel = 'Redoubt Trust Center and Governance Overview'

export const participantOnboardingVerificationSummary =
    'We review LinkedIn, corporate domain, and supporting authorization documents together before access is approved.'

export const participantOnboardingVerificationModel = 'LinkedIn, DNS, and document review'
export const participantOnboardingReviewStatus = 'In review'
export const participantOnboardingEstimatedReviewTime = '2-3 business days'

export const participantOnboardingNextSteps = [
    'Automated checks confirm your LinkedIn profile, corporate domain, and uploaded authorization documents.',
    'The Redoubt trust and compliance team reviews your stated use case, governance acknowledgments, and supporting evidence.',
    'You will receive your application decision and next access steps by email.'
] as const
