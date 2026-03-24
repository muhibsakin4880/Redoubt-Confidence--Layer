import { requestReviewStateLabel, type RequestReviewState } from '../domain/accessContract'

export type RequestStatus = RequestReviewState

export type DatasetRequest = {
    id: string
    requestNumber: string
    name: string
    confidence: number
    status: RequestStatus
    submittedDate: string
    lastUpdated: string
    category: string
    delivery: string
    reviewerFeedback?: string
    expectedResolution?: string
    notes?: string
}

export type ApprovedDataset = {
    id: string
    name: string
    confidence: number
    lastUpdated: string
    expiry: string
    limits: string
    instructions: string
    usageScope: string[]
    accessRoute: string
    detailLink?: string
}

export type RecentActivityItem = {
    label: string
    timestamp: string
    type: 'success' | 'info' | 'pending' | 'error'
}

export type ParticipantActivityEvent = {
    label: string
    ts: string
    type: 'request' | 'approval' | 'contribution' | 'compliance'
    detail?: string
}

export const datasetRequests: DatasetRequest[] = [
    {
        id: 'fx-320',
        requestNumber: 'AR-2026-320',
        name: 'Financial Market Tick Data',
        confidence: 95,
        status: 'REQUEST_APPROVED',
        submittedDate: '2026-02-02',
        lastUpdated: '2026-02-12',
        category: 'Finance',
        delivery: 'S3 presigned + VPN',
        notes: 'Approved for quantitative research workspace. Revalidation every 90 days.'
    },
    {
        id: 'cl-204',
        requestNumber: 'AR-2026-204',
        name: 'Global Climate Observations 2020-2024',
        confidence: 96,
        status: 'REVIEW_IN_PROGRESS',
        submittedDate: '2026-02-06',
        lastUpdated: '2026-02-10',
        category: 'Climate Science',
        delivery: 'Workspace + API key',
        reviewerFeedback: 'Reviewer requested clarification on intended downstream model outputs.',
        expectedResolution: 'Estimated by Feb 20, 2026',
        notes: 'Awaiting policy review for regional export controls.'
    },
    {
        id: 'nlp-118',
        requestNumber: 'AR-2026-118',
        name: 'Sentiment Analysis Corpus - Social Media',
        confidence: 89,
        status: 'REVIEW_IN_PROGRESS',
        submittedDate: '2026-02-04',
        lastUpdated: '2026-02-08',
        category: 'NLP & Text',
        delivery: 'API (awaiting approval)',
        reviewerFeedback: 'Pending additional data retention and moderation compliance confirmation.',
        expectedResolution: 'Estimated by Feb 22, 2026',
        notes: 'External reviewer assigned for policy check.'
    },
    {
        id: 'med-441',
        requestNumber: 'AR-2026-441',
        name: 'Medical Imaging Dataset - Chest X-Rays',
        confidence: 92,
        status: 'REQUEST_REJECTED',
        submittedDate: '2026-01-29',
        lastUpdated: '2026-02-05',
        category: 'Healthcare',
        delivery: 'Secure enclave (declined)',
        reviewerFeedback: 'Rejected due to incomplete ethics approval and missing institutional review documentation.',
        notes: 'Resubmission allowed after full IRB package is attached.'
    },
    {
        id: 'urb-147',
        requestNumber: 'AR-2026-147',
        name: 'Urban Traffic Flow Patterns',
        confidence: 91,
        status: 'REQUEST_APPROVED',
        submittedDate: '2026-01-31',
        lastUpdated: '2026-02-09',
        category: 'Smart Cities',
        delivery: 'Streaming websocket + workspace',
        notes: 'Approved with streaming quota and audit logging enabled.'
    }
]

export const approvedDatasets: ApprovedDataset[] = [
    {
        id: 'fx-320',
        name: 'Financial Market Tick Data',
        confidence: 95,
        lastUpdated: '2026-02-12',
        expiry: 'Review on 2026-05-01',
        limits: 'API 75k calls/day; 100 GB export/month',
        instructions: 'Private S3 bucket with rotating presigned URLs. VPN required; keys scoped per workspace.',
        usageScope: ['Backtesting and factor research', 'Paper-trading simulations', 'Model performance dashboards'],
        accessRoute: 'S3 + VPN',
        detailLink: '/datasets/1'
    },
    {
        id: 'urb-147',
        name: 'Urban Traffic Flow Patterns',
        confidence: 91,
        lastUpdated: '2026-02-09',
        expiry: 'Expires 2026-04-18',
        limits: 'Streaming: 30 live connections; 4 TB monthly egress',
        instructions: 'Workspace notebooks pre-wired to streaming channel. Alerts enabled for anomaly spikes.',
        usageScope: ['Routing optimisation', 'Demand forecasting', 'Simulation of congestion scenarios'],
        accessRoute: 'Workspace + streaming channel',
        detailLink: '/datasets/1'
    }
]

export const recentActivity: RecentActivityItem[] = [
    {
        label: 'Access approved: Financial Market Tick Data',
        timestamp: 'Feb 16, 2026 - 09:20',
        type: 'success'
    },
    {
        label: 'Usage cap increased to 120 GPU hours for tick data workspace',
        timestamp: 'Feb 15, 2026 - 18:05',
        type: 'info'
    },
    {
        label: 'Pending review: Global Climate Observations 2020-2024',
        timestamp: 'Feb 14, 2026 - 12:40',
        type: 'pending'
    },
    {
        label: 'Request declined: E-Commerce Transaction Data 2023 (requires DUA)',
        timestamp: 'Feb 13, 2026 - 16:10',
        type: 'error'
    }
]

export const participantTrust = {
    score: 92,
    misusePenalty: 12,
    level: 'Verified Participant',
    misuseWarning: 'Misuse flagged: export attempt outside approved scope',
    factors: [
        { label: 'Approved dataset participation', value: 90 },
        { label: 'Responsible data usage', value: 94 },
        { label: 'Positive feedback history', value: 88 },
        { label: 'Dataset contribution quality', value: 86 },
        { label: 'Compliance adherence', value: 95 },
        { label: 'Dispute / misuse penalties', value: 98 }
    ],
    timeline: [
        { label: 'Access approved: Financial Market Tick Data', ts: 'Feb 16, 2026' },
        { label: 'Compliance confirmation submitted', ts: 'Feb 15, 2026' },
        { label: 'Access request: Global Climate Observations', ts: 'Feb 14, 2026' },
        { label: 'Contribution uploaded: Mobility Sensor QA sample', ts: 'Feb 12, 2026' }
    ]
}

export const participantActivity: ParticipantActivityEvent[] = [
    {
        type: 'request',
        label: 'Access request submitted: Urban Mobility Sensor Streams',
        ts: 'Feb 17, 2026 - 09:40',
        detail: 'Awaiting provider review'
    },
    {
        type: 'approval',
        label: 'Access approved: Financial Market Tick Data',
        ts: 'Feb 16, 2026 - 09:20',
        detail: 'Privileges active in workspace'
    },
    {
        type: 'compliance',
        label: 'Compliance confirmation submitted',
        ts: 'Feb 15, 2026 - 15:05',
        detail: 'Acknowledged latest DUA version'
    },
    {
        type: 'contribution',
        label: 'Contribution uploaded: Mobility Sensor QA sample',
        ts: 'Feb 12, 2026 - 10:15',
        detail: 'Passed automated integrity checks'
    }
]

export const statusStyles: Record<RequestStatus, string> = {
    REQUEST_APPROVED: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200',
    REVIEW_IN_PROGRESS: 'border-amber-400/60 bg-amber-500/10 text-amber-200',
    REQUEST_REJECTED: 'border-rose-500/60 bg-rose-500/10 text-rose-200'
}

export const requestStatusLabel = (status: RequestStatus) => requestReviewStateLabel(status)

export const activityDot: Record<RecentActivityItem['type'], string> = {
    success: 'bg-emerald-400',
    info: 'bg-cyan-400',
    pending: 'bg-amber-400',
    error: 'bg-rose-400'
}

export const participantActivityStyles: Record<ParticipantActivityEvent['type'], { dot: string; label: string }> = {
    request: { dot: 'bg-blue-400', label: 'Access request' },
    approval: { dot: 'bg-emerald-400', label: 'Access approved' },
    contribution: { dot: 'bg-violet-400', label: 'Contribution uploaded' },
    compliance: { dot: 'bg-amber-300', label: 'Compliance confirmation' }
}

export const confidenceColor = (score: number) => {
    if (score >= 95) return 'text-emerald-300'
    if (score >= 90) return 'text-cyan-300'
    if (score >= 85) return 'text-amber-300'
    return 'text-rose-300'
}

export const trustLevel = (score: number) => {
    if (score >= 95) return { label: 'High Confidence Participant', classes: 'bg-emerald-500/15 border-emerald-400 text-emerald-200' }
    if (score >= 90) return { label: 'Verified Participant', classes: 'bg-green-500/15 border-green-400 text-green-200' }
    if (score >= 80) return { label: 'Trusted Participant', classes: 'bg-cyan-500/15 border-cyan-400 text-cyan-200' }
    return { label: 'New Participant', classes: 'bg-slate-700 border-slate-500 text-slate-200' }
}
