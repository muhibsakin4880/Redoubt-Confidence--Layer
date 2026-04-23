import {
    getProviderDatasetSubmissionByContributionId,
    loadProviderDatasetSubmissions,
    type ProviderDatasetSubmissionRecord
} from '../domain/providerDatasetSubmission'

export type ContributionStatus = 'Processing' | 'Needs fixes' | 'Approved' | 'Restricted' | 'Rejected'
export type PipelineState = 'complete' | 'current' | 'pending' | 'blocked'
export type FeedbackType = 'Missing values' | 'Schema inconsistency' | 'Data freshness warning' | 'Format issue'
export type ContributionTone = 'neutral' | 'healthy' | 'progress' | 'attention' | 'restricted' | 'critical'

export type FeedbackItem = {
    type: FeedbackType
    detail: string
    severity: 'warning' | 'error'
}

export type ContributionActionConsoleItem = {
    label: string
    value: string
    detail: string
    tone: ContributionTone
}

export type ContributionChecklistItem = {
    title: string
    detail: string
    tone: ContributionTone
}

export type ContributionOperationalModule = {
    eyebrow: string
    title: string
    description: string
    tone: ContributionTone
    items: Array<{
        label: string
        value: string
    }>
}

export type ContributionStatusPageContent = {
    heroSummary: string
    operationalPosture: string
    ownerLabel: string
    lastUpdated: string
    nextAction: string
    actionConsole: ContributionActionConsoleItem[]
    checklistTitle: string
    checklist: ContributionChecklistItem[]
    modules: ContributionOperationalModule[]
    emptyFindingsLabel: string
    secondaryAction?: {
        label: string
        to: string
    }
}

export type ContributionRecord = {
    id: string
    title: string
    submissionId: string
    datasetId: string
    uploadedAt: string
    records: string
    size: string
    status: ContributionStatus
    accessActivity: string
    performance: {
        totalRequests: number
        approvedRequests: number
        accessEvents: number
        avgReliability: number
    }
    validationPipeline: PipelineState[]
    feedback: FeedbackItem[]
    statusPage: ContributionStatusPageContent
}

export const validationStages = [
    'Upload received',
    'Schema analysis',
    'Quality evaluation',
    'Compliance review',
    'Approved for access'
] as const

export const statusStyles: Record<ContributionStatus, string> = {
    Processing: 'border-blue-500/60 bg-blue-500/10 text-blue-200',
    'Needs fixes': 'border-amber-500/60 bg-amber-500/10 text-amber-200',
    Approved: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200',
    Restricted: 'border-violet-500/60 bg-violet-500/10 text-violet-200',
    Rejected: 'border-rose-500/60 bg-rose-500/10 text-rose-200'
}

export const pipelineStateStyles: Record<PipelineState, { dot: string; line: string; text: string }> = {
    complete: { dot: 'bg-emerald-400 border-emerald-300', line: 'bg-emerald-400/80', text: 'text-emerald-200' },
    current: { dot: 'bg-blue-400 border-blue-300', line: 'bg-slate-700', text: 'text-blue-200' },
    pending: { dot: 'bg-slate-700 border-slate-500', line: 'bg-slate-700', text: 'text-slate-400' },
    blocked: { dot: 'bg-rose-400 border-rose-300', line: 'bg-slate-700', text: 'text-rose-200' }
}

export const feedbackStyles: Record<FeedbackItem['severity'], string> = {
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
    error: 'border-rose-500/40 bg-rose-500/10 text-rose-100'
}

export const CONTRIBUTION_STATUS_PAGE_CONTENT: Record<ContributionStatus, ContributionStatusPageContent> = {
    Processing: {
        heroSummary: 'Automated validation is active. Upload integrity checks are complete and schema analysis is now in progress.',
        operationalPosture: 'This submission is moving through the standard review pipeline with no contributor intervention required right now.',
        ownerLabel: 'Validation orchestration desk',
        lastUpdated: 'Updated 18 minutes ago',
        nextAction: 'Wait for the quality evaluation checkpoint before access packaging can begin.',
        actionConsole: [
            {
                label: 'Current state',
                value: 'Schema analysis running',
                detail: 'Encrypted upload receipt, checksum verification, and file staging are complete.',
                tone: 'progress'
            },
            {
                label: 'Needs attention',
                value: 'No action required',
                detail: 'The submission is still within the normal validation window and has no active blockers.',
                tone: 'healthy'
            },
            {
                label: 'What happens next',
                value: 'Quality evaluation',
                detail: 'Completeness scoring and anomaly checks will begin after schema normalization finishes.',
                tone: 'neutral'
            }
        ],
        checklistTitle: 'Processing checkpoints',
        checklist: [
            {
                title: 'Encrypted upload confirmed',
                detail: 'Storage handoff and payload integrity checks completed successfully.',
                tone: 'healthy'
            },
            {
                title: 'Schema inference underway',
                detail: 'Column typing, partition consistency, and field normalization are being resolved now.',
                tone: 'progress'
            },
            {
                title: 'Compliance screening queued',
                detail: 'Residency and exposure review will begin automatically after quality scoring completes.',
                tone: 'neutral'
            }
        ],
        modules: [
            {
                eyebrow: 'Completed checks',
                title: 'What has already cleared',
                description: 'The first-stage controls already accepted for this run.',
                tone: 'healthy',
                items: [
                    { label: 'Ingress gate', value: 'Accepted into encrypted storage' },
                    { label: 'Checksum status', value: 'Verified against manifest' },
                    { label: 'Queue position', value: 'Inside the active validation lane' }
                ]
            },
            {
                eyebrow: 'Next milestones',
                title: 'Expected handoffs',
                description: 'The next checkpoints most likely to affect timing.',
                tone: 'progress',
                items: [
                    { label: 'Quality gate', value: 'Automated completeness scoring pending' },
                    { label: 'Compliance gate', value: 'DPO screening begins after quality clears' },
                    { label: 'Target review window', value: 'Within the next 24 hours' }
                ]
            },
            {
                eyebrow: 'Contributor guidance',
                title: 'Keep the source package stable',
                description: 'Best practice while the active run is still moving.',
                tone: 'neutral',
                items: [
                    { label: 'Do not replace files', value: 'Avoid swapping payloads during active review' },
                    { label: 'Monitor queue only', value: 'Use the provider dashboard dataset list for the next update' },
                    { label: 'Escalation path', value: 'Contact validation ops only if the status stalls' }
                ]
            }
        ],
        emptyFindingsLabel: 'No active issues in the current validation window.'
    },
    'Needs fixes': {
        heroSummary: 'Validation is paused. The current package must be corrected before the rerun can proceed.',
        operationalPosture: 'The submission halted at the quality gate after material completeness and schema consistency issues crossed the acceptance threshold.',
        ownerLabel: 'Quality review operations',
        lastUpdated: 'Updated 2 hours ago',
        nextAction: 'Correct the flagged source columns, then return to the provider dashboard to begin a clean rerun.',
        actionConsole: [
            {
                label: 'Current state',
                value: 'Blocked at quality evaluation',
                detail: 'Upload and schema intake completed, but the quality gate could not be cleared.',
                tone: 'attention'
            },
            {
                label: 'Needs attention',
                value: 'Contributor action required',
                detail: 'Null-rate remediation and field-type alignment must be addressed before revalidation.',
                tone: 'critical'
            },
            {
                label: 'What happens next',
                value: 'Rerun after corrections',
                detail: 'Once the payload is corrected, the validation pipeline should reopen from the quality checkpoint.',
                tone: 'neutral'
            }
        ],
        checklistTitle: 'Correction checklist',
        checklist: [
            {
                title: 'Repair null-heavy fields',
                detail: 'Resolve the altitude and region gaps before re-uploading the patched file.',
                tone: 'attention'
            },
            {
                title: 'Normalize schema typing',
                detail: 'Ensure stationCode uses one canonical type across every submitted partition.',
                tone: 'critical'
            },
            {
                title: 'Prepare a clean rerun package',
                detail: 'Use one corrected payload set so the rerun reflects a single source of truth.',
                tone: 'neutral'
            }
        ],
        modules: [
            {
                eyebrow: 'Blocking reasons',
                title: 'Why the run stopped',
                description: 'The material conditions preventing the submission from advancing.',
                tone: 'critical',
                items: [
                    { label: 'Pipeline gate', value: 'Quality evaluation failed' },
                    { label: 'Primary blocker', value: 'Schema inconsistency across files' },
                    { label: 'Secondary blocker', value: 'Null-rate threshold exceeded' }
                ]
            },
            {
                eyebrow: 'Rerun readiness',
                title: 'What must be true before restart',
                description: 'The acceptance posture expected for the next validation attempt.',
                tone: 'attention',
                items: [
                    { label: 'Source package', value: 'One corrected payload set only' },
                    { label: 'Field standards', value: 'Stable typing across all partitions' },
                    { label: 'Quality threshold', value: 'Null rates back inside tolerance' }
                ]
            },
            {
                eyebrow: 'Reviewer guidance',
                title: 'What the desk expects next',
                description: 'The most efficient path back into review.',
                tone: 'neutral',
                items: [
                    { label: 'Best next move', value: 'Patch the source and relaunch validation' },
                    { label: 'Avoid', value: 'Submitting multiple partial replacements' },
                    { label: 'Where to return', value: 'Back to the provider dashboard' }
                ]
            }
        ],
        emptyFindingsLabel: 'Open issues should appear here when the validation engine flags them.'
    },
    Approved: {
        heroSummary: 'Approved for participant access. The current package is live inside a governed replay workspace.',
        operationalPosture: 'Validation and compliance review are complete, and approved buyer activity is already moving under the active commercial package.',
        ownerLabel: 'Marketplace approval desk',
        lastUpdated: 'Updated 6 hours ago',
        nextAction: 'Monitor active usage, preserve the approved package posture, and open the package detail page for deeper buyer activity.',
        actionConsole: [
            {
                label: 'Current state',
                value: 'Approved for access',
                detail: 'The submission cleared validation, compliance review, and access packaging.',
                tone: 'healthy'
            },
            {
                label: 'Needs attention',
                value: 'Monitor live usage',
                detail: 'Keep an eye on access activity, reliability drift, and package renewals as buyer traffic continues.',
                tone: 'neutral'
            },
            {
                label: 'What happens next',
                value: 'Operate the approved route',
                detail: 'Use the package detail page when you need buyer activity, commercial context, or term-specific review.',
                tone: 'progress'
            }
        ],
        checklistTitle: 'Operational focus',
        checklist: [
            {
                title: 'Watch buyer activity',
                detail: 'Approved access events are live, so usage and entitlement posture matter more than validation tasks.',
                tone: 'healthy'
            },
            {
                title: 'Maintain package discipline',
                detail: 'Keep usage rights, geography, and redistribution rules aligned with the approved package.',
                tone: 'neutral'
            },
            {
                title: 'Escalate only on drift',
                detail: 'The next operational trigger is unusual reliability or access-pattern movement, not review blockage.',
                tone: 'progress'
            }
        ],
        modules: [
            {
                eyebrow: 'Approval scope',
                title: 'What is active now',
                description: 'The operating posture currently exposed to approved buyers.',
                tone: 'healthy',
                items: [
                    { label: 'Access state', value: 'Participant route is active' },
                    { label: 'Delivery posture', value: 'Governed replay workspace only' },
                    { label: 'Monitoring posture', value: 'Reliability and audit traces live' }
                ]
            },
            {
                eyebrow: 'Performance',
                title: 'Current operational signal',
                description: 'Fast-read metrics from the live approved route.',
                tone: 'progress',
                items: [
                    { label: 'Access activity', value: '42 approved events this week' },
                    { label: 'Reliability', value: '97% rolling signal' },
                    { label: 'Buyer traction', value: '22 approved requests cleared' }
                ]
            },
            {
                eyebrow: 'Commercial detail',
                title: 'Deep-dive remains available',
                description: 'Use the older detail view only when you need buyer-by-buyer or package-term inspection.',
                tone: 'neutral',
                items: [
                    { label: 'Secondary drill-down', value: 'Approved package detail page' },
                    { label: 'Primary purpose', value: 'Commercial and buyer activity review' },
                    { label: 'Main status surface', value: 'This operational approval page' }
                ]
            }
        ],
        emptyFindingsLabel: 'No active issues in the current validation window.',
        secondaryAction: {
            label: 'Open approval package detail',
            to: '/provider/datasets/cn-1003'
        }
    },
    Restricted: {
        heroSummary: 'Approved with guardrails. Access is limited to approved healthcare workspaces and reviewed output paths.',
        operationalPosture: 'The submission cleared validation, but governance controls narrowed the eligible audience and delivery scope before activation.',
        ownerLabel: 'Clinical governance review desk',
        lastUpdated: 'Updated 1 day ago',
        nextAction: 'Confirm workspace eligibility before enabling additional buyers, and keep the restriction controls intact.',
        actionConsole: [
            {
                label: 'Current state',
                value: 'Approved with restrictions',
                detail: 'The route is available only inside a reviewed clinical safe-haven posture.',
                tone: 'restricted'
            },
            {
                label: 'Needs attention',
                value: 'Eligibility controls stay active',
                detail: 'Only approved healthcare workspaces and reviewed analysts should be admitted.',
                tone: 'attention'
            },
            {
                label: 'What happens next',
                value: 'Operate inside the guardrails',
                detail: 'Monitor scope, freshness, and approved audience fit before extending any new access.',
                tone: 'neutral'
            }
        ],
        checklistTitle: 'Restriction checklist',
        checklist: [
            {
                title: 'Confirm buyer eligibility',
                detail: 'Keep the route limited to approved healthcare workspaces and vetted analyst groups.',
                tone: 'restricted'
            },
            {
                title: 'Preserve enclave-only delivery',
                detail: 'Outputs should remain reviewed before release and never bypass the safe-haven path.',
                tone: 'attention'
            },
            {
                title: 'Track monitored freshness drift',
                detail: 'One warning remains visible, so make sure refresh cadence stays inside the accepted envelope.',
                tone: 'neutral'
            }
        ],
        modules: [
            {
                eyebrow: 'Restriction controls',
                title: 'Why this route is constrained',
                description: 'The operational controls defining the approved-but-limited posture.',
                tone: 'restricted',
                items: [
                    { label: 'Audience', value: 'Approved healthcare workspaces only' },
                    { label: 'Delivery path', value: 'Privacy-reviewed enclave output flow' },
                    { label: 'Policy trigger', value: 'Clinical governance and residency controls' }
                ]
            },
            {
                eyebrow: 'Allowed scope',
                title: 'What is still permitted',
                description: 'The working surface buyers can use without breaching the restriction profile.',
                tone: 'healthy',
                items: [
                    { label: 'Research posture', value: 'Regulated clinical analysis permitted' },
                    { label: 'Output mode', value: 'Reviewed outputs only' },
                    { label: 'Commercial state', value: 'Route active under restricted policy' }
                ]
            },
            {
                eyebrow: 'Monitoring',
                title: 'What operators should watch',
                description: 'The narrow signals most likely to cause further governance review.',
                tone: 'attention',
                items: [
                    { label: 'Freshness note', value: '48-hour lag still being monitored' },
                    { label: 'Access control drift', value: 'Review every new workspace admission' },
                    { label: 'Escalation path', value: 'Send guardrail questions to governance review' }
                ]
            }
        ],
        emptyFindingsLabel: 'No blocking issues remain for this restricted route.'
    },
    Rejected: {
        heroSummary: 'Rejected after compliance review. This submission will not move into access packaging until the blocking issues are resolved.',
        operationalPosture: 'The upload cleared intake, but compliance review closed the run after structural and policy-significant issues prevented approval.',
        ownerLabel: 'Compliance review board',
        lastUpdated: 'Updated 3 days ago',
        nextAction: 'Rework the submission package and return with a fresh dataset submission once the blocking issues have been materially corrected.',
        actionConsole: [
            {
                label: 'Current state',
                value: 'Submission closed',
                detail: 'The run is no longer active and cannot progress into access packaging.',
                tone: 'critical'
            },
            {
                label: 'Needs attention',
                value: 'Material issues remain',
                detail: 'The compliance desk expects structural fixes before any new submission attempt.',
                tone: 'attention'
            },
            {
                label: 'What happens next',
                value: 'Prepare a fresh submission',
                detail: 'Use the upload flow for a new package only after the root causes are resolved.',
                tone: 'neutral'
            }
        ],
        checklistTitle: 'Resubmission guidance',
        checklist: [
            {
                title: 'Fix the structural defects',
                detail: 'Timestamp normalization and primary-key integrity must be corrected in the source data.',
                tone: 'critical'
            },
            {
                title: 'Treat this run as closed',
                detail: 'Do not expect the current submission to reopen after piecemeal edits.',
                tone: 'attention'
            },
            {
                title: 'Return with one coherent package',
                detail: 'The next review should arrive as a fresh, internally consistent dataset submission.',
                tone: 'neutral'
            }
        ],
        modules: [
            {
                eyebrow: 'Blocking reasons',
                title: 'Why the submission was rejected',
                description: 'The decisive issues that caused the compliance desk to close the run.',
                tone: 'critical',
                items: [
                    { label: 'Decision gate', value: 'Compliance review rejection' },
                    { label: 'Primary issue', value: 'Timestamp format inconsistency' },
                    { label: 'Secondary issue', value: 'Primary key duplication in merged partitions' }
                ]
            },
            {
                eyebrow: 'What must change',
                title: 'Minimum bar for a new attempt',
                description: 'The standard expected before another submission should be made.',
                tone: 'attention',
                items: [
                    { label: 'Source integrity', value: 'Consistent timestamps across all files' },
                    { label: 'Row uniqueness', value: 'No duplicate keys in merged output' },
                    { label: 'Submission posture', value: 'Fresh package, not partial patchwork' }
                ]
            },
            {
                eyebrow: 'Operator guidance',
                title: 'What to do now',
                description: 'Practical direction after a closed compliance outcome.',
                tone: 'neutral',
                items: [
                    { label: 'Immediate move', value: 'Return to the provider dashboard' },
                    { label: 'Avoid', value: 'Treating the current run as recoverable' },
                    { label: 'Next review path', value: 'Submit a corrected package from scratch' }
                ]
            }
        ],
        emptyFindingsLabel: 'Rejected submissions should always show the blocking issues that caused the closure.'
    }
}

export const uploadedDatasets: ContributionRecord[] = [
    {
        id: 'cn-1001',
        title: 'Mobility Sensor QA Sample',
        submissionId: 'BRE-DS-2026-1001',
        datasetId: 'ds_mobility_2026_q1',
        uploadedAt: '2026-02-17',
        records: '280K rows',
        size: '4.1 GB',
        status: 'Processing',
        accessActivity: '5 access checks in last 24h',
        performance: { totalRequests: 9, approvedRequests: 3, accessEvents: 12, avgReliability: 94 },
        validationPipeline: ['complete', 'current', 'pending', 'pending', 'pending'],
        feedback: [],
        statusPage: CONTRIBUTION_STATUS_PAGE_CONTENT.Processing
    },
    {
        id: 'cn-1002',
        title: 'Climate Station Metadata Patch',
        submissionId: 'BRE-DS-2026-1002',
        datasetId: 'ds_climate_patch_2026_r2',
        uploadedAt: '2026-02-16',
        records: '80K rows',
        size: '1.2 GB',
        status: 'Needs fixes',
        accessActivity: 'Validation rerun requested',
        performance: { totalRequests: 4, approvedRequests: 0, accessEvents: 2, avgReliability: 81 },
        validationPipeline: ['complete', 'complete', 'blocked', 'pending', 'pending'],
        feedback: [
            { type: 'Missing values', detail: '18% nulls in station altitude and region columns.', severity: 'warning' },
            { type: 'Schema inconsistency', detail: 'Column `stationCode` appears as string and integer across files.', severity: 'error' }
        ],
        statusPage: CONTRIBUTION_STATUS_PAGE_CONTENT['Needs fixes']
    },
    {
        id: 'cn-1003',
        title: 'Financial Tick Delta Batch',
        submissionId: 'BRE-DS-2026-1003',
        datasetId: 'ds_finance_2026_a8f3k2',
        uploadedAt: '2026-02-14',
        records: '1.8M rows',
        size: '9.7 GB',
        status: 'Approved',
        accessActivity: '42 approved access events this week',
        performance: { totalRequests: 27, approvedRequests: 22, accessEvents: 64, avgReliability: 97 },
        validationPipeline: ['complete', 'complete', 'complete', 'complete', 'complete'],
        feedback: [],
        statusPage: CONTRIBUTION_STATUS_PAGE_CONTENT.Approved
    },
    {
        id: 'cn-1004',
        title: 'Clinical Outcomes Delta',
        submissionId: 'BRE-DS-2026-1004',
        datasetId: 'ds_clinical_outcomes_2026_b4m9',
        uploadedAt: '2026-02-13',
        records: '420K rows',
        size: '5.0 GB',
        status: 'Restricted',
        accessActivity: 'Restricted to approved healthcare workspaces',
        performance: { totalRequests: 14, approvedRequests: 5, accessEvents: 11, avgReliability: 90 },
        validationPipeline: ['complete', 'complete', 'complete', 'complete', 'complete'],
        feedback: [{ type: 'Data freshness warning', detail: 'Latest records lag expected refresh cadence by 48 hours.', severity: 'warning' }],
        statusPage: CONTRIBUTION_STATUS_PAGE_CONTENT.Restricted
    },
    {
        id: 'cn-1005',
        title: 'Retail Event Enrichment Feed',
        submissionId: 'BRE-DS-2026-1005',
        datasetId: 'ds_retail_events_2026_r7n1',
        uploadedAt: '2026-02-11',
        records: '610K rows',
        size: '6.4 GB',
        status: 'Rejected',
        accessActivity: 'Submission closed after compliance rejection',
        performance: { totalRequests: 6, approvedRequests: 0, accessEvents: 0, avgReliability: 72 },
        validationPipeline: ['complete', 'complete', 'complete', 'blocked', 'pending'],
        feedback: [
            { type: 'Format issue', detail: 'Timestamp format mixed between ISO-8601 and locale-specific strings.', severity: 'error' },
            { type: 'Schema inconsistency', detail: 'Primary key duplicates detected in merged partitions.', severity: 'error' }
        ],
        statusPage: CONTRIBUTION_STATUS_PAGE_CONTENT.Rejected
    }
]

export function getContributionStatusPath(contributionId: string) {
    return `/provider/datasets/${contributionId}/status`
}

const formatSubmissionUpdatedAt = (value: string) => {
    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) return 'Updated just now'

    return `Updated ${new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    }).format(new Date(parsed)).replace(',', ' ·')} UTC`
}

const buildContributionFromProviderSubmission = (
    submission: ProviderDatasetSubmissionRecord
): ContributionRecord => ({
    id: submission.id,
    title: submission.metadata.title,
    submissionId: submission.submissionId,
    datasetId: submission.datasetId,
    uploadedAt: new Date(submission.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
    }),
    records: 'Provider-submitted package',
    size: submission.fileIntegrity.sizeLabel,
    status: submission.status,
    accessActivity: `${submission.dealId} dossier created · ${submission.providerPacketId} packet draft`,
    performance: {
        totalRequests: 0,
        approvedRequests: 0,
        accessEvents: 0,
        avgReliability: submission.schemaReview.confidenceScore
    },
    validationPipeline: ['complete', 'complete', 'current', 'pending', 'pending'],
    feedback: submission.schemaReview.restrictedFields.length > 0
        ? [
            {
                type: 'Schema inconsistency',
                detail: `${submission.schemaReview.restrictedFields.length} restricted field(s) require controlled packaging before buyer release.`,
                severity: 'warning'
            }
        ]
        : [],
    statusPage: {
        heroSummary:
            'Provider submission captured. Redoubt created the generated deal object, provider packet draft, review id, and evidence binding for dossier review.',
        operationalPosture:
            `${submission.metadata.title} is ready for validation and buyer-facing dossier inspection without exposing raw data.`,
        ownerLabel: 'Provider publishing operations',
        lastUpdated: formatSubmissionUpdatedAt(submission.updatedAt),
        nextAction: 'Review the generated Evaluation Dossier and confirm the provider packet before widening buyer access.',
        actionConsole: [
            {
                label: 'Current state',
                value: submission.dossierBinding.readinessStatus,
                detail: submission.dossierBinding.readinessDetail,
                tone: 'progress'
            },
            {
                label: 'Dossier binding',
                value: submission.dealId,
                detail: `Review ${submission.reviewId} and evidence pack ${submission.evidencePackId} are attached.`,
                tone: 'healthy'
            },
            {
                label: 'Access package',
                value: submission.accessPackageSnapshot.deliveryDetail.label,
                detail: `${submission.accessPackageSnapshot.usageRights.label} · ${submission.accessPackageSnapshot.geography.label}`,
                tone: 'neutral'
            }
        ],
        checklistTitle: 'Generated dossier handoff',
        checklist: [
            {
                title: 'Dataset metadata captured',
                detail: 'Title, domain, description, provider publishing metadata, and buyer summary are now attached to the generated dataset record.',
                tone: 'healthy'
            },
            {
                title: 'Schema signals carried forward',
                detail: `${submission.schemaReview.totalFields} fields reviewed with ${submission.schemaReview.restrictedFields.length} restricted and ${submission.schemaReview.localOnlyFields.length} local-only signal(s).`,
                tone: submission.schemaReview.restrictedFields.length > 0 ? 'attention' : 'healthy'
            },
            {
                title: 'Rights package mapped',
                detail: `${submission.accessPackageSnapshot.accessMethod.label}, ${submission.accessPackageSnapshot.deliveryDetail.label}, and ${submission.accessPackageSnapshot.advancedRights.auditLogging} audit logging are saved into the provider packet path.`,
                tone: 'progress'
            }
        ],
        modules: [
            {
                eyebrow: 'Generated objects',
                title: 'Deal, review, and evidence ids',
                description: 'The upload finalization step now binds the provider submission to the existing deal spine.',
                tone: 'progress',
                items: [
                    { label: 'Deal id', value: submission.dealId },
                    { label: 'Provider packet', value: submission.providerPacketId },
                    { label: 'Evidence pack', value: submission.evidencePackId }
                ]
            },
            {
                eyebrow: 'Schema posture',
                title: submission.schemaReview.packagingPosture,
                description: 'The schema-review signals from Step 3 remain attached after upload finalization.',
                tone: submission.schemaReview.restrictedFields.length > 0 ? 'attention' : 'healthy',
                items: [
                    { label: 'Restricted fields', value: `${submission.schemaReview.restrictedFields.length}` },
                    { label: 'Local-only fields', value: `${submission.schemaReview.localOnlyFields.length}` },
                    { label: 'Transfer-sensitive fields', value: `${submission.schemaReview.transferSensitiveFields.length}` }
                ]
            }
        ],
        emptyFindingsLabel: 'No blocking findings are attached beyond the generated schema-review posture.',
        secondaryAction: {
            label: 'Open evaluation dossier',
            to: `/deals/${submission.dealId}`
        }
    }
})

export function loadContributionRecords() {
    const submitted = loadProviderDatasetSubmissions().map(buildContributionFromProviderSubmission)
    const submittedIds = new Set(submitted.map(record => record.id))

    return [
        ...submitted,
        ...uploadedDatasets.filter(record => !submittedIds.has(record.id))
    ]
}

export function getContributionRecordById(contributionId?: string) {
    if (!contributionId) return undefined
    return loadContributionRecords().find(dataset => dataset.id === contributionId)
}

export function isProviderSubmittedContribution(contributionId?: string | null) {
    return Boolean(getProviderDatasetSubmissionByContributionId(contributionId))
}
