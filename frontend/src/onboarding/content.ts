import { participantOnboardingNextSteps } from './constants'
import type { ParticipantType } from './types'

export type OnboardingShellStepMeta = {
    subtitle: string
    emphasis: 'lightweight' | 'standard' | 'trust-critical'
    description: string
    helperBody: string
    helperPoints: readonly string[]
}

export type ParticipationOption = {
    description: string
    detail: string
    title: string
}

type GovernanceExplainer = {
    title: string
    content: string
}

const defaultOnboardingShellStepMeta: readonly OnboardingShellStepMeta[] = [
    {
        subtitle: 'Identity',
        emphasis: 'lightweight',
        description: 'Confirm the identity record, public footprint, and accountable contact behind this request before deeper review begins.',
        helperBody: 'This step anchors the request to a real person or organization before later verification and governance review.',
        helperPoints: [
            'Use the contact details that should receive any reviewer follow-up.',
            'Invite codes are optional, but can help route the request faster.',
            'Later steps inherit the identity record captured here.'
        ]
    },
    {
        subtitle: 'Use Case',
        emphasis: 'standard',
        description: 'Capture operational context so reviewers understand how the platform will be used in practice.',
        helperBody: 'Reviewers use this step to understand why access is being requested and who will use it.',
        helperPoints: [
            'Lead with the real operational goal, not a generic interest statement.',
            'Structured selections make triage faster than narrative alone.',
            'Keep the summary concise but specific enough for manual review.'
        ]
    },
    {
        subtitle: 'Governance',
        emphasis: 'standard',
        description: 'Establish governance posture, participation intent, and the boundaries that apply to this request.',
        helperBody: 'This step confirms the relationship to the platform and the governance obligations behind the request.',
        helperPoints: [
            'Participation mode should match the use case captured earlier.',
            'Governance confirmations should be completed by the accountable party.',
            'Purpose limitation matters before verification can move forward.'
        ]
    },
    {
        subtitle: 'Verification',
        emphasis: 'trust-critical',
        description: 'Provide trust evidence, verification proof points, and authentication controls used before access approval.',
        helperBody: 'Verification is where the request becomes an evidence-backed packet for protected-access review.',
        helperPoints: [
            'Identity proof, evidence files, and authentication setup should reinforce each other.',
            'Incomplete packets usually delay reviewer handoff.',
            'Only upload documents directly relevant to this request.'
        ]
    },
    {
        subtitle: 'Review',
        emphasis: 'trust-critical',
        description: 'Validate the full submission package and confirm final commitments before it moves to manual review.',
        helperBody: 'The final step should read like a clean review packet rather than another long-form onboarding screen.',
        helperPoints: [
            'Confirm the summary still reflects the intended request.',
            'Use the edit actions to fix gaps before submitting.',
            'Final commitments lock the package that reviewers receive.'
        ]
    },
    {
        subtitle: 'Submitted',
        emphasis: 'standard',
        description: 'Your onboarding package has been staged for review and the next actions are now operational rather than form-driven.',
        helperBody: 'After submission, the flow should focus on status, timing, and next steps rather than more form scaffolding.',
        helperPoints: [
            'The review team now works from the preserved submission package.',
            'Status and timing should stay easy to scan.',
            'Trust Center access remains available for policy reference.'
        ]
    }
] as const

const individualOnboardingShellStepMeta: readonly OnboardingShellStepMeta[] = [
    {
        subtitle: 'Identity',
        emphasis: 'lightweight',
        description: 'Confirm the individual identity, public footprint, and accountable contact behind this request before deeper review begins.',
        helperBody: 'This step anchors the request to a real accountable participant before later verification and governance review.',
        helperPoints: [
            'Use the contact details and profile links tied to the credential holder.',
            'Invite codes are optional, but can help route the request faster.',
            'Later steps inherit the identity record captured here.'
        ]
    },
    defaultOnboardingShellStepMeta[1],
    defaultOnboardingShellStepMeta[2],
    {
        subtitle: 'Verification',
        emphasis: 'trust-critical',
        description: 'Provide trust evidence, identity proof points, and authentication controls used before access approval.',
        helperBody: 'Verification is where the request becomes an evidence-backed packet centered on identity, accountability, and credential setup.',
        helperPoints: [
            'Identity proof, evidence files, and credential setup should reinforce each other.',
            'Incomplete packets usually delay reviewer handoff.',
            'Only upload documents directly relevant to this request.'
        ]
    },
    defaultOnboardingShellStepMeta[4],
    defaultOnboardingShellStepMeta[5]
] as const

const organizationOnboardingShellStepMeta: readonly OnboardingShellStepMeta[] = [
    {
        subtitle: 'Identity',
        emphasis: 'lightweight',
        description: 'Confirm your organization, representative, and verified organization identity before deeper review begins.',
        helperBody: 'This step anchors the request to a legitimate organization and accountable representative before later verification and governance review.',
        helperPoints: [
            'Use the contact details that should receive reviewer follow-up.',
            'Invite codes are optional, but can help route the request faster.',
            'Later steps inherit the identity record captured here.'
        ]
    },
    defaultOnboardingShellStepMeta[1],
    defaultOnboardingShellStepMeta[2],
    {
        subtitle: 'Verification',
        emphasis: 'trust-critical',
        description: 'Provide trust evidence, organizational proof points, and authentication controls used before access approval.',
        helperBody: 'Verification is where the request becomes an evidence-backed packet for protected-access review.',
        helperPoints: [
            'Identity proof, evidence files, and authentication setup should reinforce each other.',
            'Incomplete packets usually delay reviewer handoff.',
            'Only upload documents directly relevant to this request.'
        ]
    },
    defaultOnboardingShellStepMeta[4],
    defaultOnboardingShellStepMeta[5]
] as const

const individualParticipationOptions: readonly ParticipationOption[] = [
    {
        title: 'Access datasets',
        description: 'Request governed access to evaluate or work with protected datasets.',
        detail: 'Best for an accountable individual who needs controlled data access within a defined operational purpose.'
    },
    {
        title: 'Collaborate',
        description: 'Work jointly with another approved team, program, or research partner.',
        detail: 'Useful when your request supports a coordinated multi-party workflow or joint evaluation.'
    },
    {
        title: 'Research participation',
        description: 'Use Redoubt as part of a structured research or validation program.',
        detail: 'Appropriate for individual researchers, fellows, and validation specialists operating in a governed setting.'
    }
] as const

const organizationParticipationOptions: readonly ParticipationOption[] = [
    {
        title: 'Access datasets',
        description: 'Request governed access to evaluate or work with protected datasets.',
        detail: 'Best for teams that need controlled data access within a defined operational purpose.'
    },
    {
        title: 'Contribute datasets',
        description: 'Participate as a contributor or data-sharing organization.',
        detail: 'Used when your organization intends to provide governed data assets under later contributor review.'
    },
    {
        title: 'Collaborate',
        description: 'Work jointly with another team, program, or approved research partner.',
        detail: 'Useful when the request supports a coordinated multi-party workflow or joint evaluation.'
    },
    {
        title: 'Research participation',
        description: 'Use Redoubt as part of a structured research or validation program.',
        detail: 'Appropriate for research leads, analysts, and validation teams operating in a governed setting.'
    }
] as const

const individualGovernanceExplainers: readonly GovernanceExplainer[] = [
    {
        title: 'Who should complete this step',
        content:
            'Complete this step yourself if you will personally hold and use the credential created by this onboarding flow.'
    },
    {
        title: 'What non-redistribution means',
        content:
            'Approved access is limited to the specific use case and review scope described in this application. It does not allow onward sharing, resale, or repurposing without explicit written approval.'
    },
    {
        title: 'If you are not the accountable participant',
        content:
            'Stop here and have the actual credential holder or accountable project sponsor continue the request before moving forward.'
    }
] as const

const organizationGovernanceExplainers: readonly GovernanceExplainer[] = [
    {
        title: 'Who should complete this step',
        content:
            'This step should be completed by a person who can accurately represent the requesting organization and accept governance obligations for the intended access request.'
    },
    {
        title: 'What non-redistribution means',
        content:
            'Approved access is limited to the specific use case and review scope described in this application. It does not allow onward sharing, resale, or repurposing without explicit written approval.'
    },
    {
        title: 'If you are not authorized',
        content:
            'Stop here and route the request to the right approver, legal contact, program owner, or authorized representative inside your organization before continuing.'
    }
] as const

const individualSubmissionNextSteps = [
    'Automated checks confirm your submitted identity signals, Node ID issuance state, and uploaded authorization documents.',
    'The Redoubt trust and compliance team reviews your stated use case, governance acknowledgments, and supporting evidence.',
    'You will receive your application decision and next access steps by email.'
] as const

export const getOnboardingShellStepMeta = (participantType: ParticipantType | null) => {
    if (participantType === 'individual') {
        return individualOnboardingShellStepMeta
    }

    if (participantType === 'organization') {
        return organizationOnboardingShellStepMeta
    }

    return defaultOnboardingShellStepMeta
}

export const getParticipationOptions = (participantType: ParticipantType | null) => {
    if (participantType === 'individual') {
        return individualParticipationOptions
    }

    return organizationParticipationOptions
}

export const sanitizeParticipationIntent = (participantType: ParticipantType | null, values: string[]) => {
    if (!participantType) {
        return values
    }

    const allowedValues = new Set(getParticipationOptions(participantType).map((option) => option.title))
    return values.filter((value) => allowedValues.has(value))
}

export const getGovernanceExplainers = (participantType: ParticipantType | null) => {
    if (participantType === 'individual') {
        return individualGovernanceExplainers
    }

    return organizationGovernanceExplainers
}

export const getSubmissionNextSteps = (participantType: ParticipantType | null) => {
    if (participantType === 'individual') {
        return individualSubmissionNextSteps
    }

    return participantOnboardingNextSteps
}
