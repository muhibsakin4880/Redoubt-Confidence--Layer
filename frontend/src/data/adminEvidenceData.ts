export type SharedResponsibilityPlatform = {
    platform: 'AWS' | 'Azure' | 'Google Cloud' | 'OCI'
    inheritedControls: string[]
    redoubtFocus: string
    residencyNote: string
}

export type ResponsibilityLane = {
    owner: 'Cloud Layer' | 'Redoubt Application' | 'Organization Review Team'
    title: string
    detail: string
    controls: string[]
}

export type EvidencePackStatus = 'Ready' | 'In Review' | 'Blocked'

export type EvidencePack = {
    id: string
    reviewId: string
    organization: string
    name: string
    scope: string
    owner: string
    status: EvidencePackStatus
    updatedAt: string
    contents: string[]
    blocker?: string
}

export type VisibilityBoundary = {
    title: string
    detail: string
    visibleToAdmins: string
    hiddenFromAdmins: string
}

export type EvidenceEventStatus = 'Reviewed' | 'Review' | 'Exception'

export type EvidenceEvent = {
    id: string
    timestamp: string
    reviewId: string
    organization: string
    surface: string
    event: string
    evidencePackId: string
    status: EvidenceEventStatus
    visibility: string
}

export type IncidentSeverity = 'Critical' | 'High' | 'Medium'

export type IncidentEvidenceRecord = {
    id: string
    title: string
    severity: IncidentSeverity
    status: 'Contained' | 'Investigating'
    reviewId: string
    environment: string
    residencyImpact: string
    evidencePackId: string
    nextAction: string
    slaWindow: string
}

export type IncidentRunbookStep = {
    step: string
    title: string
    detail: string
    status: 'done' | 'current' | 'pending'
}

export type DeploymentSurface = {
    id: string
    reviewId: string
    organization: string
    cloud: string
    deploymentMode: string
    residencyPosture: string
    evaluationStatus: string
    evidenceStatus: string
    owner: string
    blocker: string
}

export type ApprovalBlocker = {
    id: string
    reviewId: string
    organization: string
    blocker: string
    owner: string
    deadline: string
    severity: 'Low' | 'Medium' | 'High'
}

export const sharedResponsibilityPlatforms: SharedResponsibilityPlatform[] = [
    {
        platform: 'AWS',
        inheritedControls: ['Physical infrastructure security', 'Core networking availability', 'Managed storage durability'],
        redoubtFocus: 'Protected evaluation policy, audit visibility, evidence capture, and approval sequencing.',
        residencyNote: 'Use region-pinned evaluation boundaries when residency language requires local review.'
    },
    {
        platform: 'Azure',
        inheritedControls: ['Region and platform security baseline', 'Identity-service hardening', 'Managed key-service resilience'],
        redoubtFocus: 'Approval gates, audit export, evaluation isolation, and review-specific workspace controls.',
        residencyNote: 'Useful when regional evaluation posture and enterprise identity alignment matter early.'
    },
    {
        platform: 'Google Cloud',
        inheritedControls: ['Base compute and project security', 'Regional platform operations', 'Managed analytics infrastructure'],
        redoubtFocus: 'Evidence pack generation, handling policy, workflow audit, and restricted evaluation surfaces.',
        residencyNote: 'Best framed as controlled analytics infrastructure with explicit export boundaries.'
    },
    {
        platform: 'OCI',
        inheritedControls: ['Infrastructure and region hardening', 'Core availability envelope', 'Managed network and storage baseline'],
        redoubtFocus: 'Residency-sensitive approval workflow, private evaluation posture, and review-team visibility limits.',
        residencyNote: 'Useful for stricter regional hosting narratives and private-environment review conversations.'
    }
]

export const responsibilityLanes: ResponsibilityLane[] = [
    {
        owner: 'Cloud Layer',
        title: 'Inherited platform controls',
        detail: 'The cloud layer owns the underlying infrastructure boundary Redoubt is designed to operate within.',
        controls: ['Physical datacenter security', 'Foundational network and hypervisor controls', 'Managed service availability and resilience']
    },
    {
        owner: 'Redoubt Application',
        title: 'Application and workflow controls',
        detail: 'Redoubt governs who can evaluate, what is logged, how evidence is prepared, and where policy exceptions are held.',
        controls: ['Protected evaluation workflow', 'Policy gates and approval chain', 'Evidence pack generation and audit visibility']
    },
    {
        owner: 'Organization Review Team',
        title: 'Organization-side decisions',
        detail: 'Every organization remains responsible for its own reviewer assignments, legal posture, and final approval decisions.',
        controls: ['Jurisdiction and residency approval', 'Named reviewer ownership', 'Evaluation-scope acceptance and internal legal approval']
    }
]

export const evidencePacks: EvidencePack[] = [
    {
        id: 'EVP-3390',
        reviewId: 'APP-3390',
        organization: 'Meridian Systems',
        name: 'Quant evaluation evidence pack',
        scope: 'Rights schedule, registry packet, protected evaluation controls, audit export.',
        owner: 'Layla Haddad',
        status: 'In Review',
        updatedAt: 'Mar 30, 2026 · 16:40',
        contents: ['Rights schedule', 'Registry packet hash', 'Protected evaluation boundary note', 'Approval-chain snapshot'],
        blocker: 'Registry authenticity validation still open.'
    },
    {
        id: 'EVP-1156',
        reviewId: 'APP-1156',
        organization: 'Cascade Data Corp',
        name: 'Clinical evaluation evidence pack',
        scope: 'Ethics packet, residency worksheet, model-validation scope, reviewer chain.',
        owner: 'Maha Al Tamimi',
        status: 'Blocked',
        updatedAt: 'Mar 30, 2026 · 15:05',
        contents: ['IRB summary', 'Deployment region note', 'Evaluation workspace controls', 'Audit export template'],
        blocker: 'Final ethics committee stamp is still missing.'
    },
    {
        id: 'EVP-4471',
        reviewId: 'APP-4471',
        organization: 'Pinnacle Systems',
        name: 'Utilities approval evidence pack',
        scope: 'Shared-responsibility controls, telemetry handling plan, export rules, evaluation scope.',
        owner: 'Layla Haddad',
        status: 'Ready',
        updatedAt: 'Mar 31, 2026 · 08:20',
        contents: ['Control split note', 'Evidence handling matrix', 'Evaluation scope memo', 'Approval-chain summary']
    },
    {
        id: 'EVP-2293',
        reviewId: 'APP-2293',
        organization: 'Horizon Tech LLC',
        name: 'Residency review evidence pack',
        scope: 'Regional hosting memo, export boundaries, legal signoff sequence, incident posture.',
        owner: 'Faris Noor',
        status: 'Blocked',
        updatedAt: 'Mar 31, 2026 · 09:05',
        contents: ['Regional legal mandate', 'Residency addendum', 'Deployment decision memo', 'Incident evidence chain'],
        blocker: 'Evidence-handling matrix requires local export restrictions.'
    }
]

export const adminVisibilityBoundaries: VisibilityBoundary[] = [
    {
        title: 'Metadata-first visibility',
        detail: 'Admins see review state, evidence references, and approval status before any sensitive material view is unlocked.',
        visibleToAdmins: 'Review IDs, packet status, owner, deadlines, and evidence-pack references.',
        hiddenFromAdmins: 'Raw datasets, full sample exports, and unrestricted evaluation outputs.'
    },
    {
        title: 'Protected evaluation isolation',
        detail: 'Evaluation environments remain isolated from the general admin surface even when a packet is in review.',
        visibleToAdmins: 'Workspace health, environment region, audit summaries, and exception flags.',
        hiddenFromAdmins: 'Unredacted workspace content and uncontrolled downstream outputs.'
    },
    {
        title: 'Need-to-know evidence access',
        detail: 'Evidence packs summarize what matters for approval without turning the admin console into a raw-data browser.',
        visibleToAdmins: 'Evidence bundle contents, hashes, approval notes, and exception summaries.',
        hiddenFromAdmins: 'Underlying confidential artifacts until the relevant review stage explicitly permits them.'
    }
]

export const evidenceEvents: EvidenceEvent[] = [
    {
        id: 'evt-01',
        timestamp: '2026-03-31 09:18 UTC',
        reviewId: 'APP-4471',
        organization: 'Pinnacle Systems',
        surface: 'Approval readiness pack',
        event: 'Evidence pack marked ready for final approval',
        evidencePackId: 'EVP-4471',
        status: 'Reviewed',
        visibility: 'Metadata and summary only'
    },
    {
        id: 'evt-02',
        timestamp: '2026-03-31 08:52 UTC',
        reviewId: 'APP-2293',
        organization: 'Horizon Tech LLC',
        surface: 'Residency review pack',
        event: 'Export restriction matrix still missing from legal evidence bundle',
        evidencePackId: 'EVP-2293',
        status: 'Exception',
        visibility: 'Summary plus blocker note'
    },
    {
        id: 'evt-03',
        timestamp: '2026-03-31 08:31 UTC',
        reviewId: 'APP-3390',
        organization: 'Meridian Systems',
        surface: 'Rights review pack',
        event: 'Registry authenticity challenge moved the packet into secondary review',
        evidencePackId: 'EVP-3390',
        status: 'Review',
        visibility: 'Summary, hash, and reviewer note'
    },
    {
        id: 'evt-04',
        timestamp: '2026-03-31 07:58 UTC',
        reviewId: 'APP-1156',
        organization: 'Cascade Data Corp',
        surface: 'Clinical evaluation pack',
        event: 'Ethics packet remains blocked pending committee stamp',
        evidencePackId: 'EVP-1156',
        status: 'Exception',
        visibility: 'Summary and blocker note'
    }
]

export const incidentEvidenceRecords: IncidentEvidenceRecord[] = [
    {
        id: 'INC-2026-0042',
        title: 'Protected evaluation export attempt outside approved region',
        severity: 'High',
        status: 'Contained',
        reviewId: 'APP-2293',
        environment: 'OCI residency-bound review workspace',
        residencyImpact: 'No export completed; request was contained before evidence left the approved environment.',
        evidencePackId: 'EVP-2293',
        nextAction: 'Attach local export restriction note and circulate the incident evidence summary to legal reviewers.',
        slaWindow: '03:42:10 remaining'
    },
    {
        id: 'INC-2026-0041',
        title: 'Unexpected evaluator token burst on utilities review workspace',
        severity: 'Medium',
        status: 'Investigating',
        reviewId: 'APP-4471',
        environment: 'AWS protected evaluation workspace',
        residencyImpact: 'No residency breach; throttling held the session inside the approved review boundary.',
        evidencePackId: 'EVP-4471',
        nextAction: 'Complete token-chain review and attach the audit digest to the pack before closure.',
        slaWindow: '01:18:55 remaining'
    }
]

export const incidentRunbook: IncidentRunbookStep[] = [
    {
        step: 'Step 1',
        title: 'Detect and log',
        detail: 'Create an audit-linked incident record and bind it to the relevant review ID and evidence pack.',
        status: 'done'
    },
    {
        step: 'Step 2',
        title: 'Contain the evaluation surface',
        detail: 'Freeze the affected evaluation action, preserve audit context, and hold outbound evidence movement.',
        status: 'done'
    },
    {
        step: 'Step 3',
        title: 'Review with limited visibility',
        detail: 'Investigate through hashes, audit summaries, and reviewer notes instead of raw content exposure.',
        status: 'current'
    },
    {
        step: 'Step 4',
        title: 'Update the evidence pack',
        detail: 'Add the incident summary, disposition, and remediation notes to the active pack before approval resumes.',
        status: 'pending'
    },
    {
        step: 'Step 5',
        title: 'Resume or close',
        detail: 'Return the packet to the approval chain only after containment and evidence updates are complete.',
        status: 'pending'
    }
]

export const deploymentSurfaces: DeploymentSurface[] = [
    {
        id: 'dep-3390',
        reviewId: 'APP-3390',
        organization: 'Meridian Systems',
        cloud: 'AWS / OCI',
        deploymentMode: 'Private virtual network review boundary',
        residencyPosture: 'UAE review region with controlled outbound approval path.',
        evaluationStatus: 'Awaiting secondary review close before workspace release.',
        evidenceStatus: 'Evidence pack in review.',
        owner: 'Layla Haddad',
        blocker: 'Registry authenticity review.'
    },
    {
        id: 'dep-1156',
        reviewId: 'APP-1156',
        organization: 'Cascade Data Corp',
        cloud: 'Azure',
        deploymentMode: 'Protected evaluation workspace with clinical reviewer isolation',
        residencyPosture: 'Saudi-hosted preference with UAE documentation fallback.',
        evaluationStatus: 'Environment reserved; final enablement held.',
        evidenceStatus: 'Evidence pack blocked.',
        owner: 'Maha Al Tamimi',
        blocker: 'Ethics committee stamp missing.'
    },
    {
        id: 'dep-4471',
        reviewId: 'APP-4471',
        organization: 'Pinnacle Systems',
        cloud: 'AWS / OCI',
        deploymentMode: 'Telemetry-focused protected evaluation workspace',
        residencyPosture: 'Local telemetry review with approved evidence export path.',
        evaluationStatus: 'Workspace ready for approval.',
        evidenceStatus: 'Evidence pack ready.',
        owner: 'Layla Haddad',
        blocker: 'Final policy comment.'
    },
    {
        id: 'dep-2293',
        reviewId: 'APP-2293',
        organization: 'Horizon Tech LLC',
        cloud: 'OCI / Azure',
        deploymentMode: 'Residency-sensitive private review posture',
        residencyPosture: 'Strict local hosting with no shared cross-region release.',
        evaluationStatus: 'Environment design under legal review.',
        evidenceStatus: 'Evidence pack blocked.',
        owner: 'Faris Noor',
        blocker: 'Local export restriction matrix missing.'
    }
]

export const approvalBlockers: ApprovalBlocker[] = [
    {
        id: 'blk-2293',
        reviewId: 'APP-2293',
        organization: 'Horizon Tech LLC',
        blocker: 'Local export restriction matrix missing from residency review pack.',
        owner: 'Faris Noor',
        deadline: 'Apr 02, 2026',
        severity: 'High'
    },
    {
        id: 'blk-1156',
        reviewId: 'APP-1156',
        organization: 'Cascade Data Corp',
        blocker: 'Final ethics committee stamp still absent from the clinical packet.',
        owner: 'Maha Al Tamimi',
        deadline: 'Apr 06, 2026',
        severity: 'High'
    },
    {
        id: 'blk-3390',
        reviewId: 'APP-3390',
        organization: 'Meridian Systems',
        blocker: 'Registry authenticity review remains open.',
        owner: 'Layla Haddad',
        deadline: 'Apr 03, 2026',
        severity: 'Medium'
    },
    {
        id: 'blk-4471',
        reviewId: 'APP-4471',
        organization: 'Pinnacle Systems',
        blocker: 'One policy comment still needs closure before approval.',
        owner: 'Layla Haddad',
        deadline: 'Apr 01, 2026',
        severity: 'Low'
    }
]
