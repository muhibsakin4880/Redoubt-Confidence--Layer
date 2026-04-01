export const participantOnboardingTitle = 'Participant Onboarding'
export const participantOnboardingSubtitle =
    'Security and confidence infrastructure intake for controlled participation.'

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

export const participantOnboardingStepTitles = [
    'Organization & Identity',
    'Intended Platform Usage',
    'Participation Intent',
    'Verification & Credentials',
    'Compliance Commitment',
    'Submission Confirmation'
] as const

export const participantOnboardingActiveStepTitles = participantOnboardingStepTitles.slice(0, 5)
