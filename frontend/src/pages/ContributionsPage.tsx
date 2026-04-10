import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type ContributionStatus = 'Processing' | 'Needs fixes' | 'Approved' | 'Restricted' | 'Rejected'
type PipelineState = 'complete' | 'current' | 'pending' | 'blocked'
type FeedbackType = 'Missing values' | 'Schema inconsistency' | 'Data freshness warning' | 'Format issue'

type FeedbackItem = {
    type: FeedbackType
    detail: string
    severity: 'warning' | 'error'
}

type UploadedDataset = {
    id: string
    title: string
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
}

type AdvancedRightsConditions = {
    redistributionRights: string
    auditLoggingRequirement: string
    attributionRequirement: string
    volumeBasedPricing: boolean
    volumePricingAdjustment: string
    volumePricingUnit: 'tb' | 'million_records'
}

type DatasetSecurityOptions = {
    endToEndEncryption: boolean
    autoMaskPii: boolean
    dynamicRoleMasking: boolean
    watermarkingEnabled: boolean
    revocationRights: boolean
}

type PrivacyAccessTerms = {
    accessMethod: string
    deliveryMode: string
    fieldAccess: string
    usageRights: string
    term: string
    geography: string
    exclusivity: string
    security: DatasetSecurityOptions
    advanced: AdvancedRightsConditions
}

type UploadDraftMetadata = {
    name: string
    domain: string
    description: string
    price: string
}

type UploadDraftFile = {
    name: string
    sizeLabel: string
    format: string
    checksumStatus: string
    uploadStatus: string
}

type UploadDraftReviewFactor = {
    label: string
    score: number
    detail: string
}

type UploadDraftReview = {
    confidenceScore: number
    confidenceLabel: string
    classification: string
    reviewTimeline: string
    summary: string
    breakdown: UploadDraftReviewFactor[]
}

type UploadDraftSubmission = {
    id: string
    declarationAccepted: boolean
}

type UploadDraft = {
    metadata: UploadDraftMetadata
    file: UploadDraftFile
    review: UploadDraftReview
    submission: UploadDraftSubmission
}

type UploadDraftGovernanceSummary = {
    dataResidency: string
    regionalAccessRestriction: string
    restrictionReason: string
}

type AccessMethodOption = {
    value: string
    label: string
    detail: string
    summary: string
    icon: 'platform' | 'download' | 'hybrid'
}

const uploadSteps = [
    'Dataset info',
    'Secure Payload Ingestion',
    'Schema preview',
    'Privacy & Access Controls',
    'Submission confirmation'
]

const validationStages = [
    'Upload received',
    'Schema analysis',
    'Quality evaluation',
    'Compliance review',
    'Approved for access'
]

const accessMethodOptions: AccessMethodOption[] = [
    {
        value: 'platform_only',
        label: 'Platform Only',
        detail: 'Buyers can only access data inside a governed Redoubt workspace / clean room. No download or export allowed.',
        summary: 'Governed workspace access only. No download or export rights.',
        icon: 'platform'
    },
    {
        value: 'download_only',
        label: 'Download Only',
        detail: 'Buyers can download a scoped/encrypted package. No access inside Redoubt platform.',
        summary: 'Scoped encrypted download only. No platform workspace access.',
        icon: 'download'
    },
    {
        value: 'platform_and_download',
        label: 'Platform + Download',
        detail: 'Buyers get both governed workspace access + scoped download rights.',
        summary: 'Workspace access and scoped download rights are both enabled.',
        icon: 'hybrid'
    }
]

const deliveryModeOptions = [
    { value: 'metadata_only', label: 'Metadata only', detail: 'Surface title, schema, and high-level descriptors only.' },
    { value: 'secure_clean_room', label: 'Secure clean room', detail: 'Buyer works inside a governed workspace without direct export.' },
    { value: 'aggregated_export', label: 'Aggregated export', detail: 'Approved users receive pre-aggregated outputs only.' },
    { value: 'encrypted_download', label: 'Encrypted download', detail: 'Encrypted file delivery for tightly controlled access cases.' },
    { value: 'full_raw_access', label: 'Full Raw Access', detail: 'Full raw dataset release for tightly approved enterprise access.' }
]

const fieldAccessOptions = [
    { value: 'core_fields', label: 'Core fields', detail: 'Essential operational columns for lightweight review.' },
    { value: 'analytics_pack', label: 'Analytics pack', detail: 'Expanded feature set for analysis and benchmarking.' },
    { value: 'full_schema', label: 'Full schema', detail: 'Complete dataset structure made available to approved buyers.' },
    { value: 'sensitive_review_pack', label: 'Sensitive review pack', detail: 'Restricted review tier with heightened compliance checks.' }
]

const usageRightsOptions = [
    { value: 'research_use', label: 'Research use', detail: 'Non-production exploration and model evaluation.' },
    { value: 'internal_ai_training', label: 'Internal AI training', detail: 'Model development and tuning for internal systems.' },
    { value: 'commercial_analytics', label: 'Commercial analytics', detail: 'Revenue-linked analytics and decision support workflows.' },
    { value: 'customer_facing_output', label: 'Customer-facing output', detail: 'Insights may appear in downstream client experiences.' }
]

const termOptions = [
    { value: '30_days', label: '30 days' },
    { value: '90_days', label: '90 days' },
    { value: '12_months', label: '12 months' },
    { value: '24_months', label: '24 months' }
]

const geographyOptions = [
    { value: 'single_region', label: 'Single region' },
    { value: 'dual_region', label: 'Dual region' },
    { value: 'global', label: 'Global' }
]

const exclusivityOptions = [
    { value: 'non_exclusive', label: 'Non-exclusive' },
    { value: 'vertical_exclusive', label: 'Vertical exclusive' },
    { value: 'regional_exclusive', label: 'Regional exclusive' },
    { value: 'full_exclusive', label: 'Full exclusive' }
]

const advancedBinaryOptions = {
    redistributionRights: [
        { value: 'allowed', label: 'Allowed' },
        { value: 'not_allowed', label: 'Not Allowed' }
    ],
    auditLoggingRequirement: [
        { value: 'mandatory', label: 'Mandatory' },
        { value: 'optional', label: 'Optional' }
    ],
    attributionRequirement: [
        { value: 'required', label: 'Required' },
        { value: 'not_required', label: 'Not Required' }
    ]
} as const

const findOptionLabel = <T extends { value: string; label: string }>(options: T[], value: string) =>
    options.find(option => option.value === value)?.label ?? value

const privacyControlSections = [
    {
        field: 'fieldAccess',
        title: 'Field Access',
        description: 'Set the breadth of schema visibility available to buyers.',
        options: fieldAccessOptions
    },
    {
        field: 'usageRights',
        title: 'Usage Rights',
        description: 'Select the primary rights granted to approved buyers.',
        options: usageRightsOptions
    },
    {
        field: 'term',
        title: 'Term',
        description: 'Define how long buyer access remains active.',
        options: termOptions
    },
    {
        field: 'geography',
        title: 'Geography',
        description: 'Set the operating footprint for approved access.',
        options: geographyOptions
    },
    {
        field: 'exclusivity',
        title: 'Exclusivity',
        description: 'Choose whether this package remains open or reserved.',
        options: exclusivityOptions
    }
] as const

const advancedRightsSections = [
    {
        field: 'redistributionRights',
        title: 'Redistribution Rights',
        options: advancedBinaryOptions.redistributionRights
    },
    {
        field: 'auditLoggingRequirement',
        title: 'Audit Logging Requirement',
        options: advancedBinaryOptions.auditLoggingRequirement
    },
    {
        field: 'attributionRequirement',
        title: 'Attribution Requirement',
        options: advancedBinaryOptions.attributionRequirement
    }
] as const

const renderAccessMethodIcon = (icon: AccessMethodOption['icon']) => {
    switch (icon) {
        case 'platform':
            return (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5v10.5H3.75V5.25z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18.75h6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75v3" />
                </svg>
            )
        case 'download':
            return (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 10.5L12 14.25 15.75 10.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 18.75h15" />
                </svg>
            )
        default:
            return (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h10.5v7.5H3.75V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25h4.5v9h-9v-2.25" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75v-3.75" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 13.5l2.25 2.25 2.25-2.25" />
                </svg>
            )
    }
}

const uploadedDatasets: UploadedDataset[] = [
    {
        id: 'cn-1001',
        title: 'Mobility Sensor QA Sample',
        uploadedAt: '2026-02-17',
        records: '280K rows',
        size: '4.1 GB',
        status: 'Processing',
        accessActivity: '5 access checks in last 24h',
        performance: { totalRequests: 9, approvedRequests: 3, accessEvents: 12, avgReliability: 94 },
        validationPipeline: ['complete', 'current', 'pending', 'pending', 'pending'],
        feedback: []
    },
    {
        id: 'cn-1002',
        title: 'Climate Station Metadata Patch',
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
        ]
    },
    {
        id: 'cn-1003',
        title: 'Financial Tick Delta Batch',
        uploadedAt: '2026-02-14',
        records: '1.8M rows',
        size: '9.7 GB',
        status: 'Approved',
        accessActivity: '42 approved access events this week',
        performance: { totalRequests: 27, approvedRequests: 22, accessEvents: 64, avgReliability: 97 },
        validationPipeline: ['complete', 'complete', 'complete', 'complete', 'complete'],
        feedback: []
    },
    {
        id: 'cn-1004',
        title: 'Clinical Outcomes Delta',
        uploadedAt: '2026-02-13',
        records: '420K rows',
        size: '5.0 GB',
        status: 'Restricted',
        accessActivity: 'Restricted to approved healthcare workspaces',
        performance: { totalRequests: 14, approvedRequests: 5, accessEvents: 11, avgReliability: 90 },
        validationPipeline: ['complete', 'complete', 'complete', 'complete', 'complete'],
        feedback: [{ type: 'Data freshness warning', detail: 'Latest records lag expected refresh cadence by 48 hours.', severity: 'warning' }]
    },
    {
        id: 'cn-1005',
        title: 'Retail Event Enrichment Feed',
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
        ]
    }
]

const statusStyles: Record<ContributionStatus, string> = {
    Processing: 'border-blue-500/60 bg-blue-500/10 text-blue-200',
    'Needs fixes': 'border-amber-500/60 bg-amber-500/10 text-amber-200',
    Approved: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200',
    Restricted: 'border-violet-500/60 bg-violet-500/10 text-violet-200',
    Rejected: 'border-rose-500/60 bg-rose-500/10 text-rose-200'
}

const clickableStatusDetails: ContributionStatus[] = ['Needs fixes', 'Rejected', 'Restricted', 'Approved']

const isStatusDetailsClickable = (status: ContributionStatus) => clickableStatusDetails.includes(status)

const getStatusLink = (dataset: UploadedDataset) => {
    if (dataset.id === 'cn-1003') {
        return `/contributions/${dataset.id}`
    }
    return `/contributions/${dataset.id}/status-details`
}

const pipelineStateStyles: Record<PipelineState, { dot: string; line: string; text: string }> = {
    complete: { dot: 'bg-emerald-400 border-emerald-300', line: 'bg-emerald-400/80', text: 'text-emerald-200' },
    current: { dot: 'bg-blue-400 border-blue-300', line: 'bg-slate-700', text: 'text-blue-200' },
    pending: { dot: 'bg-slate-700 border-slate-500', line: 'bg-slate-700', text: 'text-slate-400' },
    blocked: { dot: 'bg-rose-400 border-rose-300', line: 'bg-slate-700', text: 'text-rose-200' }
}

const feedbackStyles: Record<FeedbackItem['severity'], string> = {
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
    error: 'border-rose-500/40 bg-rose-500/10 text-rose-100'
}

const createDefaultPrivacyAccessTerms = (): PrivacyAccessTerms => ({
    accessMethod: 'platform_only',
    deliveryMode: 'secure_clean_room',
    fieldAccess: 'analytics_pack',
    usageRights: 'research_use',
    term: '12_months',
    geography: 'dual_region',
    exclusivity: 'non_exclusive',
    security: {
        endToEndEncryption: false,
        autoMaskPii: true,
        dynamicRoleMasking: false,
        watermarkingEnabled: true,
        revocationRights: true
    },
    advanced: {
        redistributionRights: 'not_allowed',
        auditLoggingRequirement: 'mandatory',
        attributionRequirement: 'required',
        volumeBasedPricing: false,
        volumePricingAdjustment: '',
        volumePricingUnit: 'tb'
    }
})

const createUploadSubmissionId = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const suffix = String(Math.floor(Math.random() * 9000) + 1000)
    return `SUB-${year}-${month}${day}-${suffix}`
}

const createInitialUploadDraft = (): UploadDraft => ({
    metadata: {
        name: 'City Sensor Aggregates 2026-Q1',
        domain: 'Mobility & Infrastructure',
        description: 'Aggregated sensor flow, occupancy, and throughput metrics by 5-minute intervals.',
        price: '299'
    },
    file: {
        name: 'city_sensors_q1.parquet',
        sizeLabel: '6.3 GB',
        format: 'Parquet',
        checksumStatus: 'Checksum verified',
        uploadStatus: 'Encrypted upload ready'
    },
    review: {
        confidenceScore: 88,
        confidenceLabel: 'High Confidence',
        classification: 'Tier 2 - Regulated',
        reviewTimeline: '48 hours',
        summary: 'High-confidence quality and schema alignment.',
        breakdown: [
            { label: 'Schema Validity', score: 92, detail: 'All declared fields present and correctly typed.' },
            { label: 'Completeness', score: 85, detail: '1.8% average null rate across all fields, within threshold.' },
            { label: 'PHI/PII Risk', score: 90, detail: 'No high-risk sensitive fields detected in dataset.' },
            { label: 'Format Consistency', score: 84, detail: 'Data formats remain consistent across rows and columns.' }
        ]
    },
    submission: {
        id: createUploadSubmissionId(),
        declarationAccepted: false
    }
})

const createDefaultUploadGovernanceSummary = (): UploadDraftGovernanceSummary => ({
    dataResidency: 'UAE - Abu Dhabi / Dubai',
    regionalAccessRestriction: 'GCC Region only',
    restrictionReason:
        'Platform-enforced residency and sovereignty controls narrow buyer access to GCC-approved organizations even when the provider-selected package geography is broader.'
})

export default function ContributionsPage() {
    const { providerAccount } = useAuth()
    const [activeStep, setActiveStep] = useState(0)
    const [selectedDatasetId, setSelectedDatasetId] = useState(uploadedDatasets[0]?.id ?? '')
    const [isUploadViewOpen, setIsUploadViewOpen] = useState(false)
    const [uploadDraft, setUploadDraft] = useState<UploadDraft>(() => createInitialUploadDraft())
    const [interrogationAcknowledged, setInterrogationAcknowledged] = useState(false)
    const [privacyAccessTerms, setPrivacyAccessTerms] = useState<PrivacyAccessTerms>(() => createDefaultPrivacyAccessTerms())
    const [isAdvancedRightsOpen, setIsAdvancedRightsOpen] = useState(false)
    const [schemaSearchQuery, setSchemaSearchQuery] = useState('')
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
    const [showTierReviewModal, setShowTierReviewModal] = useState(false)
    const [tierReviewComment, setTierReviewComment] = useState('')
    const [showTierReviewSuccess, setShowTierReviewSuccess] = useState(false)
    const [showMockSubmissionNotice, setShowMockSubmissionNotice] = useState(false)
    const uploadGovernanceSummary = useMemo(() => createDefaultUploadGovernanceSummary(), [])

    const toggleFieldExpansion = (field: string) => {
        setExpandedFields(prev => {
            const next = new Set(prev)
            if (next.has(field)) {
                next.delete(field)
            } else {
                next.add(field)
            }
            return next
        })
    }

    const schemaFieldData = [
        { field: 'device_id', type: 'String', sample: '["DE-7829-XK", "AE-4512-QR"]', nullRate: 0.0, piiStatus: 'safe' as const, residency: 'global' as const, aiDescription: 'Unique device identifier assigned to tracking hardware. No PII correlation detected.', cryptoState: 'Plaintext' as const, cardinality: 'High (12k unique)' as const, provenance: 'IoT Sensor Stream' as const, anomalyFlags: '0.01% Outliers Detected' as const, updateVelocity: 'Real-time stream' as const },
        { field: 'timestamp_utc', type: 'Timestamp', sample: '["2026-01-15T08:23:41Z"]', nullRate: 0.0, piiStatus: 'safe' as const, residency: 'global' as const, aiDescription: 'UTC timestamp of data capture event. System-generated, no personal data.', cryptoState: 'Plaintext' as const, cardinality: 'High (890k unique)' as const, provenance: 'IoT Sensor Stream' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Real-time stream' as const },
        { field: 'flow_count', type: 'Integer', sample: '[1247, 3892, 562]', nullRate: 1.8, piiStatus: 'safe' as const, residency: 'global' as const, aiDescription: 'Aggregated flow measurement. No individual attribution possible.', cryptoState: 'Plaintext' as const, cardinality: 'High (67k unique)' as const, provenance: 'IoT Sensor Stream' as const, anomalyFlags: '0.12% Outliers Detected' as const, updateVelocity: 'Real-time stream' as const },
        { field: 'blood_type', type: 'String', sample: '["A+", "O-", "B+"]', nullRate: 0.0, piiStatus: 'flagged' as const, residency: 'local' as const, aiDescription: 'Medical classification data. HIGH RISK: PDPL Article 4 - Health data requires explicit consent and local processing.', cryptoState: 'Plaintext' as const, cardinality: 'Low (8 unique)' as const, provenance: 'Direct User Input' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Batch updated' as const },
        { field: 'national_id', type: 'String', sample: '["784-1972-1234567-1"]', nullRate: 0.0, piiStatus: 'flagged' as const, residency: 'local' as const, aiDescription: 'UAE National ID number. CRITICAL: Direct identifier under PDPL Article 2. Local storage mandatory.', cryptoState: 'AES-256 Encrypted' as const, cardinality: 'High (45k unique)' as const, provenance: 'Direct User Input' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Batch updated' as const },
        { field: 'location_lat', type: 'Float', sample: '["24.4539", "25.2697"]', nullRate: 2.1, piiStatus: 'review' as const, residency: 'local' as const, aiDescription: 'Geographic coordinates. GRAY ZONE: Can derive home location if combined with temporal patterns.', cryptoState: 'Plaintext' as const, cardinality: 'High (890k unique)' as const, provenance: 'IoT Sensor Stream' as const, anomalyFlags: '0.08% Outliers Detected' as const, updateVelocity: 'Real-time stream' as const },
        { field: 'location_lon', type: 'Float', sample: '["54.3773", "55.3092"]', nullRate: 2.1, piiStatus: 'review' as const, residency: 'local' as const, aiDescription: 'Geographic coordinates. GRAY ZONE: Can derive home location if combined with temporal patterns.', cryptoState: 'Plaintext' as const, cardinality: 'High (890k unique)' as const, provenance: 'IoT Sensor Stream' as const, anomalyFlags: '0.08% Outliers Detected' as const, updateVelocity: 'Real-time stream' as const },
        { field: 'salary_bracket', type: 'String', sample: '["150000-200000 AED"]', nullRate: 5.4, piiStatus: 'review' as const, residency: 'local' as const, aiDescription: 'Financial bracket. GRAY ZONE: Financial data under PDPL Article 3 - sensitive personal data.', cryptoState: 'Partially Masked' as const, cardinality: 'Low (12 unique)' as const, provenance: 'Direct User Input' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Batch updated' as const },
        { field: 'email_hash', type: 'String', sample: '["a7b3c9f2..."]', nullRate: 0.0, piiStatus: 'safe' as const, residency: 'global' as const, aiDescription: 'SHA-256 hashed email. Pseudonymized identifier. Reversible with original lookup table.', cryptoState: 'SHA-256 Hashed' as const, cardinality: 'High (42k unique)' as const, provenance: '3rd Party Enriched' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Batch updated' as const },
        { field: 'registration_date', type: 'Date', sample: '["2024-03-12", "2025-01-08"]', nullRate: 0.0, piiStatus: 'safe' as const, residency: 'global' as const, aiDescription: 'Account registration date. Insufficient alone for re-identification.', cryptoState: 'Plaintext' as const, cardinality: 'High (365 unique)' as const, provenance: 'Direct User Input' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Event-driven' as const },
        { field: 'ip_address', type: 'String', sample: '["185.58.142.12"]', nullRate: 0.0, piiStatus: 'flagged' as const, residency: 'local' as const, aiDescription: 'Network identifier. PDPL guidance: IP considered personal data if linkable to individual.', cryptoState: 'Partially Masked' as const, cardinality: 'High (8.2k unique)' as const, provenance: '3rd Party Enriched' as const, anomalyFlags: '0.15% Outliers Detected' as const, updateVelocity: 'Real-time stream' as const },
        { field: 'passport_number', type: 'String', sample: '["A12345678"]', nullRate: 0.0, piiStatus: 'flagged' as const, residency: 'local' as const, aiDescription: 'Travel document identifier. CRITICAL: Government ID equivalent. Local processing required.', cryptoState: 'AES-256 Encrypted' as const, cardinality: 'High (45k unique)' as const, provenance: 'Direct User Input' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Batch updated' as const },
        { field: 'phone_prefix', type: 'String', sample: '["+971-50", "+971-55"]', nullRate: 0.0, piiStatus: 'review' as const, residency: 'local' as const, aiDescription: 'Partial phone prefix. GRAY ZONE: Can narrow to region, not full number.', cryptoState: 'Plaintext' as const, cardinality: 'Low (15 unique)' as const, provenance: 'Direct User Input' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Batch updated' as const },
        { field: 'department_code', type: 'String', sample: '["HR-FIN-001", "OPS-TECH-042"]', nullRate: 0.0, piiStatus: 'safe' as const, residency: 'global' as const, aiDescription: 'Internal department classification. Corporate metadata only.', cryptoState: 'Plaintext' as const, cardinality: 'Low (24 unique)' as const, provenance: 'Internal System' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Event-driven' as const },
        { field: 'employee_id', type: 'String', sample: '["EMP-2024-8891"]', nullRate: 0.0, piiStatus: 'safe' as const, residency: 'global' as const, aiDescription: 'Internal employee identifier. Pseudonymized with HR system lookup.', cryptoState: 'SHA-256 Hashed' as const, cardinality: 'High (8.9k unique)' as const, provenance: 'Internal System' as const, anomalyFlags: '0.00% Outliers Detected' as const, updateVelocity: 'Event-driven' as const },
    ]

    const filteredSchemaFields = useMemo(() => {
        if (!schemaSearchQuery) return schemaFieldData
        const query = schemaSearchQuery.toLowerCase()
        return schemaFieldData.filter(f => f.field.toLowerCase().includes(query))
    }, [schemaSearchQuery])

    const selectedDataset = useMemo(
        () => uploadedDatasets.find(dataset => dataset.id === selectedDatasetId) ?? uploadedDatasets[0],
        [selectedDatasetId]
    )

    const summary = useMemo(() => {
        const approved = uploadedDatasets.filter(dataset => dataset.status === 'Approved').length
        const processing = uploadedDatasets.filter(dataset => dataset.status === 'Processing').length
        const needsFixes = uploadedDatasets.filter(dataset => dataset.status === 'Needs fixes').length
        const totalAccessEvents = uploadedDatasets.reduce((acc, dataset) => acc + dataset.performance.accessEvents, 0)

        return {
            uploaded: uploadedDatasets.length,
            approved,
            processing,
            needsFixes,
            totalAccessEvents
        }
    }, [])

    const updatePrivacyAccessTerm = (
        field: Exclude<keyof typeof privacyAccessTerms, 'advanced' | 'security'>,
        value: string
    ) => {
        setShowMockSubmissionNotice(false)
        setPrivacyAccessTerms(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const updateSecurityOption = (
        field: keyof DatasetSecurityOptions,
        value: boolean
    ) => {
        setShowMockSubmissionNotice(false)
        setPrivacyAccessTerms(prev => ({
            ...prev,
            security: {
                ...prev.security,
                [field]: value
            }
        }))
    }

    const updateAdvancedRight = (
        field: keyof typeof privacyAccessTerms.advanced,
        value: string | boolean
    ) => {
        setShowMockSubmissionNotice(false)
        setPrivacyAccessTerms(prev => ({
            ...prev,
            advanced: {
                ...prev.advanced,
                [field]: value
            }
        }))
    }

    const selectedAccessMethodOption = accessMethodOptions.find(option => option.value === privacyAccessTerms.accessMethod) ?? accessMethodOptions[0]
    const selectedAccessMethodLabel = selectedAccessMethodOption.label
    const selectedDeliveryModeLabel = findOptionLabel(deliveryModeOptions, privacyAccessTerms.deliveryMode)
    const selectedFieldAccessLabel = findOptionLabel(fieldAccessOptions, privacyAccessTerms.fieldAccess)
    const selectedUsageRightsLabel = findOptionLabel(usageRightsOptions, privacyAccessTerms.usageRights)
    const selectedTermLabel = findOptionLabel(termOptions, privacyAccessTerms.term)
    const selectedGeographyLabel = findOptionLabel(geographyOptions, privacyAccessTerms.geography)
    const selectedExclusivityLabel = findOptionLabel(exclusivityOptions, privacyAccessTerms.exclusivity)
    const selectedRedistributionLabel = findOptionLabel(
        [...advancedBinaryOptions.redistributionRights],
        privacyAccessTerms.advanced.redistributionRights
    )
    const selectedAuditLoggingLabel = findOptionLabel(
        [...advancedBinaryOptions.auditLoggingRequirement],
        privacyAccessTerms.advanced.auditLoggingRequirement
    )
    const selectedAttributionLabel = findOptionLabel(
        [...advancedBinaryOptions.attributionRequirement],
        privacyAccessTerms.advanced.attributionRequirement
    )
    const encryptionSummary = privacyAccessTerms.security.endToEndEncryption
        ? 'AES-256 at rest, TLS 1.3 in transit, and end-to-end encryption enabled.'
        : 'AES-256 at rest and TLS 1.3 in transit.'
    const maskingSummary = [
        privacyAccessTerms.security.autoMaskPii ? 'Automatic PII masking' : null,
        privacyAccessTerms.security.dynamicRoleMasking ? 'Role-based dynamic masking' : null
    ].filter(Boolean).join(' + ') || 'Manual masking only'
    const volumePricingSummary = privacyAccessTerms.advanced.volumeBasedPricing
        ? privacyAccessTerms.advanced.volumePricingAdjustment
            ? `${privacyAccessTerms.advanced.volumePricingAdjustment} / ${
                privacyAccessTerms.advanced.volumePricingUnit === 'tb' ? 'TB' : 'million records'
            }`
            : 'Enabled'
        : 'Disabled'
    const isMetadataComplete = Object.values(uploadDraft.metadata).every(value => value.trim().length > 0)
    const areRightsComplete = [
        privacyAccessTerms.accessMethod,
        privacyAccessTerms.deliveryMode,
        privacyAccessTerms.fieldAccess,
        privacyAccessTerms.usageRights,
        privacyAccessTerms.term,
        privacyAccessTerms.geography,
        privacyAccessTerms.exclusivity,
        privacyAccessTerms.advanced.redistributionRights,
        privacyAccessTerms.advanced.auditLoggingRequirement,
        privacyAccessTerms.advanced.attributionRequirement
    ].every(Boolean) && (
        !privacyAccessTerms.advanced.volumeBasedPricing ||
        privacyAccessTerms.advanced.volumePricingAdjustment.trim().length > 0
    )
    const submissionChecklist = [
        {
            label: 'Complete dataset metadata',
            complete: isMetadataComplete
        },
        {
            label: 'Acknowledge the payload interrogation protocol',
            complete: interrogationAcknowledged
        },
        {
            label: 'Confirm privacy and access rights',
            complete: areRightsComplete
        },
        {
            label: 'Accept the legal declaration',
            complete: uploadDraft.submission.declarationAccepted
        }
    ]
    const isSubmissionReady = submissionChecklist.every(item => item.complete)
    const incompleteSubmissionLabels = submissionChecklist
        .filter(item => !item.complete)
        .map(item => item.label.toLowerCase())
    const governanceGeoRestriction = uploadGovernanceSummary.regionalAccessRestriction.trim()
    const hasGovernanceGeoRestriction = governanceGeoRestriction.length > 0
    const buyerAccessSummary = [
        ['Access method', selectedAccessMethodLabel],
        ['Delivery detail', selectedDeliveryModeLabel],
        ['Field access', selectedFieldAccessLabel],
        ['Usage rights', selectedUsageRightsLabel],
        ['Term', selectedTermLabel],
        ['Geography', selectedGeographyLabel],
        ['Exclusivity', selectedExclusivityLabel]
    ]
    const advancedRightsSummary = [
        ['Redistribution rights', selectedRedistributionLabel],
        ['Audit logging requirement', selectedAuditLoggingLabel],
        ['Attribution requirement', selectedAttributionLabel],
        ['Data volume scaling', volumePricingSummary]
    ]
    const securitySummary = [
        ['Encryption', encryptionSummary],
        ['Masking', maskingSummary],
        ['Watermarking', privacyAccessTerms.security.watermarkingEnabled ? 'Invisible watermarking enabled' : 'Watermarking disabled'],
        ['Revocation rights', privacyAccessTerms.security.revocationRights ? 'Provider can revoke access at any time' : 'Revocation override disabled']
    ]

    const updateUploadMetadata = (field: keyof UploadDraftMetadata, value: string) => {
        setShowMockSubmissionNotice(false)
        setUploadDraft(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                [field]: value
            }
        }))
    }

    const updateSubmissionDeclaration = (declarationAccepted: boolean) => {
        setShowMockSubmissionNotice(false)
        setUploadDraft(prev => ({
            ...prev,
            submission: {
                ...prev.submission,
                declarationAccepted
            }
        }))
    }

    const startUploadFlow = () => {
        setActiveStep(0)
        setUploadDraft(createInitialUploadDraft())
        setInterrogationAcknowledged(false)
        setPrivacyAccessTerms(createDefaultPrivacyAccessTerms())
        setIsAdvancedRightsOpen(false)
        setSchemaSearchQuery('')
        setExpandedFields(new Set())
        setShowTierReviewModal(false)
        setShowTierReviewSuccess(false)
        setShowMockSubmissionNotice(false)
        setTierReviewComment('')
        setIsUploadViewOpen(true)
    }

    const closeUploadFlow = () => {
        setIsAdvancedRightsOpen(false)
        setIsUploadViewOpen(false)
    }

    const handleMockSubmission = () => {
        if (!isSubmissionReady) return
        setShowMockSubmissionNotice(true)
    }

    const stepPreview = [
        {
            title: 'Dataset info',
            description: 'Define the core metadata for the contribution package.',
            body: (
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">Dataset title</div>
                        <input
                            type="text"
                            value={uploadDraft.metadata.name}
                            onChange={(e) => updateUploadMetadata('name', e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">Domain</div>
                        <input
                            type="text"
                            value={uploadDraft.metadata.domain}
                            onChange={(e) => updateUploadMetadata('domain', e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3 sm:col-span-2">
                        <div className="text-slate-400 text-xs mb-1">Description</div>
                        <textarea
                            value={uploadDraft.metadata.description}
                            onChange={(e) => updateUploadMetadata('description', e.target.value)}
                            className="min-h-24 w-full resize-none bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <div className="text-slate-400 text-xs mb-1">Dataset Access Price</div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={uploadDraft.metadata.price}
                                onChange={(e) => updateUploadMetadata('price', e.target.value)}
                                placeholder="299"
                                className="flex-1 sm:flex-none sm:w-32 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                            />
                            <span className="text-slate-400 text-sm">USD per access</span>
                        </div>
                        <div className="text-slate-500 text-xs mt-1">Participant and dataset onboarding are free. Redoubt applies a provider settlement fee only after a successful engagement: 15% at launch, then 12% after volume ramps, then 10% for large repeat providers.</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Secure Payload Ingestion',
            description: 'Initialize encrypted transfer. All payloads are subjected to automated compliance interrogation.',
            body: (
                <div className="space-y-4 text-sm">
                    <div className="border-2 border-amber-600/70 bg-slate-950 rounded-lg p-4 font-mono text-xs">
                        <div className="text-amber-500 font-bold mb-3 flex items-center gap-2">
                            <span className="animate-pulse">⚠️</span> SYSTEM ALERT: 6-LAYER AI INTERROGATION ACTIVE
                        </div>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">1.</span>
                                <span>Semantic PII Hunter: Deep-scanning cell values for obfuscated PII.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">2.</span>
                                <span>Schema Poisoning Detection: Flagging synthetic padding and schema drift.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">3.</span>
                                <span>Canary Token Check: Cross-referencing against global honeypot signatures.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">4.</span>
                                <span>Payload Sanitization: Neutralizing hidden SQL injections and XSS payloads.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">5.</span>
                                <span>IP Scan: Verifying text against copyrighted archives.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">6.</span>
                                <span>Zero-Tolerance Quarantine: Toxic payloads trigger automatic IP blacklisting.</span>
                            </li>
                        </ul>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={interrogationAcknowledged}
                            onChange={(e) => {
                                setShowMockSubmissionNotice(false)
                                setInterrogationAcknowledged(e.target.checked)
                            }}
                            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-slate-300 text-xs">
                            I acknowledge the 6-Layer Interrogation Protocol and confirm this payload contains no unauthorized PII or malicious code.
                        </span>
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${interrogationAcknowledged ? 'border-cyan-500/50 bg-slate-900/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-600 bg-slate-900/30 opacity-40 blur-[0.5px] pointer-events-none'}`}>
                        <div className={`font-semibold ${interrogationAcknowledged ? 'text-cyan-200' : 'text-slate-400'}`}>Drop files here or browse (mock)</div>
                        <div className="text-slate-500 text-xs mt-1">Accepted: CSV, Parquet, JSONL - max 15 GB per upload</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                        <div className="flex flex-wrap items-center gap-2 text-slate-100">
                            <span className="font-medium">{uploadDraft.file.name}</span>
                            <span className="text-slate-500">-</span>
                            <span>{uploadDraft.file.sizeLabel}</span>
                            <span className="text-slate-500">-</span>
                            <span>{uploadDraft.file.checksumStatus}</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                            {uploadDraft.file.format} file • {uploadDraft.file.uploadStatus}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Schema preview',
            description: 'Review inferred schema before quality checks.',
            body: (
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search fields..."
                            value={schemaSearchQuery}
                            onChange={(e) => setSchemaSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                        />
                    </div>
                    <div className="border border-slate-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 sticky top-0 z-10">
                                    <tr>
                                        <th className="py-3 px-3 text-left font-medium">Field</th>
                                        <th className="py-3 px-3 text-left font-medium">Type</th>
                                        <th className="py-3 px-3 text-left font-medium">Sample</th>
                                        <th className="py-3 px-3 text-left font-medium">Compliance & PII</th>
                                        <th className="py-3 px-3 text-left font-medium">Residency</th>
                                        <th className="py-3 px-3 text-left font-medium">Null %</th>
                                        <th className="py-3 px-3 text-center font-medium w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-950/50 font-mono text-xs">
                                    {filteredSchemaFields.map((field) => (
                                        <>
                                            <tr key={field.field} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="py-3 px-3 text-cyan-300 font-semibold">{field.field}</td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-300 text-[10px]">{field.type}</span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-400 max-w-[150px] truncate">{field.sample}</td>
                                                <td className="py-3 px-3">
                                                    {field.piiStatus === 'safe' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium">Tier 1: Safe</span>
                                                    )}
                                                    {field.piiStatus === 'flagged' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-medium">High Risk: PDPL Flagged</span>
                                                    )}
                                                    {field.piiStatus === 'review' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">Gray Zone: DPO Review Pending</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3">
                                                    {field.residency === 'local' ? (
                                                        <span className="inline-flex items-center gap-1 text-amber-400 text-[10px]">
                                                            <span>🇦🇪</span> Local Hosting Required
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                                                            <span>🌐</span> Global Transfer Cleared
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className={field.nullRate > 5 ? 'text-amber-400' : field.nullRate > 0 ? 'text-slate-300' : 'text-emerald-400'}>
                                                        {field.nullRate.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <button
                                                        onClick={() => toggleFieldExpansion(field.field)}
                                                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                                                    >
                                                        <svg
                                                            className={`w-4 h-4 text-slate-400 transition-transform ${expandedFields.has(field.field) ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedFields.has(field.field) && (
                                                <tr key={`${field.field}-expanded`} className="bg-slate-900/30">
                                                    <td colSpan={7} className="py-4 px-4">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                                </svg>
                                                                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold">Advanced AI Analysis & Provenance</span>
                                                            </div>
                                                            <div className="grid grid-cols-5 gap-3">
                                                                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3">
                                                                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Cryptographic State</div>
                                                                    <div className={`text-xs font-mono font-medium ${
                                                                        field.cryptoState === 'Plaintext' ? 'text-amber-400' :
                                                                        field.cryptoState === 'SHA-256 Hashed' ? 'text-cyan-400' :
                                                                        field.cryptoState === 'AES-256 Encrypted' ? 'text-emerald-400' :
                                                                        'text-purple-400'
                                                                    }`}>{field.cryptoState}</div>
                                                                </div>
                                                                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3">
                                                                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Cardinality</div>
                                                                    <div className="text-xs font-mono text-slate-300">{field.cardinality}</div>
                                                                </div>
                                                                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3">
                                                                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Data Provenance</div>
                                                                    <div className="text-xs font-mono text-slate-300">{field.provenance}</div>
                                                                </div>
                                                                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3">
                                                                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Anomaly Flags</div>
                                                                    <div className={`text-xs font-mono font-medium ${
                                                                        field.anomalyFlags.includes('0.00%') ? 'text-emerald-400' :
                                                                        field.anomalyFlags.includes('0.15%') ? 'text-rose-400' :
                                                                        'text-amber-400'
                                                                    }`}>{field.anomalyFlags}</div>
                                                                </div>
                                                                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3">
                                                                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Update Velocity</div>
                                                                    <div className="text-xs font-mono text-slate-300">{field.updateVelocity}</div>
                                                                </div>
                                                            </div>
                                                            <div className="pt-2 border-t border-slate-800">
                                                                <div className="text-[10px] uppercase tracking-wider text-cyan-400 mb-1">AI Inferred Description</div>
                                                                <div className="text-slate-300 text-xs font-mono">{field.aiDescription}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">{schemaFieldData.length} fields detected</span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">{Number((schemaFieldData.filter(f => f.nullRate > 0).reduce((acc, f) => acc + f.nullRate, 0) / schemaFieldData.length)).toFixed(1)}% avg null rate</span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200">AI Integrity Check: Passed ✨</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5">
                        <div className="text-sm font-semibold text-slate-200 mb-4">Automated classification signal</div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col items-start">
                                <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-lg font-semibold">
                                    Tier 2 — Regulated
                                </span>
                                <p className="text-xs text-slate-500 mt-2">
                                    Suggested by automated schema and field analysis; reviewer confirmation may still be required
                                </p>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 mb-2">Classification Reasons</div>
                                <ul className="space-y-1.5 text-xs">
                                    <li className="flex items-center gap-2 text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                                        Financial data fields detected
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        PII fields found: email_hash, phone_prefix
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        No PHI detected
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        Geographic data present: location_lat, location_lon
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-700">
                            <div className="text-xs text-slate-400 mb-2">What this means for evaluating organizations:</div>
                            <div className="grid sm:grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">Sample preview:</span>
                                    <span>10 rows maximum</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">Download:</span>
                                    <span>Requires your explicit consent</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">Escrow window:</span>
                                    <span>24-48 hours</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">Audit level:</span>
                                    <span>Full audit trail required</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-700">
                            <div className="text-xs text-slate-500">Disagree with this classification?</div>
                            <button
                                onClick={() => setShowTierReviewModal(true)}
                                className="mt-1 text-xs text-blue-300 hover:text-blue-200 border border-blue-500/40 rounded px-2 py-1 inline-block"
                            >
                                Request Tier Review →
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border-l-4 border-cyan-500 rounded-xl p-5">
                        <div className="text-sm font-semibold text-slate-200 mb-1">Governance & Shared Responsibility</div>
                        <p className="text-xs text-slate-400 mb-4">
                            Initial governance signal generated from
                            your organization profile,
                            dataset sensitivity, and configured
                            demo policy examples.
                        </p>
                        
                        <div className="text-xs font-medium text-slate-300 mb-3">Governance Rules Applied</div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">📍</span>
                                    <div>
                                        <div className="text-xs text-slate-400">Data Residency</div>
                                        <div className="text-sm text-slate-200">{uploadGovernanceSummary.dataResidency}</div>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">Active</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">⚖️</span>
                                    <div>
                                        <div className="text-xs text-slate-400">Data Sovereignty</div>
                                        <div className="text-sm text-slate-200">UAE Personal Data <br/>Protection Law (PDPL) 2022</div>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs">Enforced</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🔒</span>
                                    <div>
                                        <div className="text-xs text-slate-400">Regional Access Control</div>
                                        <div className="text-sm text-slate-200">
                                            {hasGovernanceGeoRestriction ? (
                                                <>
                                                    {governanceGeoRestriction} -
                                                    <br />
                                                    UAE, Saudi Arabia, Qatar,
                                                    <br />
                                                    Kuwait, Bahrain, Oman
                                                </>
                                            ) : (
                                                'No additional regional restriction'
                                            )}
                                        </div>
                                        {hasGovernanceGeoRestriction && uploadGovernanceSummary.restrictionReason && (
                                            <div className="mt-1 text-xs text-slate-400">{uploadGovernanceSummary.restrictionReason}</div>
                                        )}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    hasGovernanceGeoRestriction
                                        ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                                        : 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                                }`}>
                                    {hasGovernanceGeoRestriction ? 'Restricted' : 'Open'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">☁️</span>
                                    <div>
                                        <div className="text-xs text-slate-400">Assigned Cloud Model</div>
                                        <div className="text-sm text-slate-200">Oracle Cloud Infrastructure (OCI) <br/>UAE North — Abu Dhabi</div>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs">Auto-assigned</span>
                            </div>
                        </div>
                        
                        <div className="mt-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700">
                            <p className="text-xs text-slate-400">
                                Cloud model is automatically assigned 
                                based on your data residency 
                                requirements and applicable 
                                sovereignty laws.
                            </p>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-700">
                            <div className="text-xs font-medium text-slate-300 mb-3">Responsibility Allocation</div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 rounded-lg border border-slate-700 border-l-4 border-l-blue-500 p-4">
                                    <div className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
                                        <span>🏢</span> OCI Responsibility
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Physical data center security <br/>(UAE North — Abu Dhabi)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>AES-256 encryption at rest</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>TLS 1.3 encryption in transit</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>UAE data sovereignty compliance</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Network isolation and access controls</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Infrastructure resilience and uptime</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>PDPL eligible infrastructure</span>
                                        </li>
                                    </ul>
                                </div>
                                
                                <div className="bg-slate-800/50 rounded-lg border border-slate-700 border-l-4 border-l-cyan-500 p-4">
                                    <div className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                                        <span>🛡️</span> Redoubt Responsibility
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Buyer identity verification</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Purpose-of-use declaration</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Regional access enforcement</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Dataset access window control</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Audit visibility timeline</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Escrow transaction management</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>PHI/PII detection and masking</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Consent and legal basis tracking</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400">✅</span>
                                            <span>Trust score impact on access</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showTierReviewModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 w-full max-w-md">
                                {showTierReviewSuccess ? (
                                    <div className="text-center py-4">
                                        <div className="text-emerald-400 text-2xl mb-2">✓</div>
                                        <div className="text-sm font-semibold text-white">Review request submitted</div>
                                        <div className="text-xs text-slate-400 mt-2">Redoubt team will respond within 48 hours.</div>
                                        <button
                                            onClick={() => { setShowTierReviewModal(false); setShowTierReviewSuccess(false); }}
                                            className="mt-4 px-4 py-2 rounded-lg bg-slate-700 text-sm text-white hover:bg-slate-600"
                                        >
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-semibold text-white">Request Classification Review</h3>
                                        <p className="text-xs text-slate-400 mt-1">Explain why you believe this dataset should be reclassified</p>
                                        <textarea
                                            value={tierReviewComment}
                                            onChange={(e) => setTierReviewComment(e.target.value)}
                                            placeholder="Provide your reasoning..."
                                            className="w-full h-24 mt-4 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                                        />
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => setShowTierReviewModal(false)}
                                                className="flex-1 rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => setShowTierReviewSuccess(true)}
                                                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-sm font-medium text-white"
                                            >
                                                Submit Review Request
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-slate-800 pt-6">
                        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5">
                            <div className="text-center mb-6">
                                <div className="text-xl font-semibold text-emerald-400 mb-1">
                                    Confidence Score: 88/100 <span className="ml-2 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-medium">Tier 2</span>
                                </div>
                                <div className="text-xs text-slate-400">AI-generated quality assessment based on 4 factors</div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-200 font-medium">Schema Validity</span>
                                            <span className="text-emerald-300 font-mono">92/100</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">All declared fields present and correctly typed</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-200 font-medium">Completeness</span>
                                            <span className="text-emerald-300 font-mono">85/100</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">1.8% average null rate across all fields — within threshold</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-200 font-medium">PHI/PII Risk</span>
                                            <span className="text-emerald-300 font-mono">90/100</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">No high-risk sensitive fields detected in dataset</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-200 font-medium">Format Consistency</span>
                                            <span className="text-emerald-300 font-mono">84/100</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84%' }} />
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">Data formats consistent across all rows and columns</div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-700 mt-5 pt-4">
                                <div className="text-center mb-4">
                                    <div className="text-lg font-bold text-emerald-400">Weighted Average: 88/100</div>
                                    <div className="text-xs text-slate-500 mt-1">Each factor weighted equally at 25%</div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-medium text-emerald-300">High Confidence</span>
                                </div>
                                <div className="text-xs text-slate-300 text-center">Your dataset meets Redoubt's quality threshold. Buyers will see this score before requesting access.</div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-800">
                                <div className="text-xs text-slate-400 mb-2">Score range legend:</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded bg-emerald-500" />
                                        <span className="text-slate-300">90-100: Exceptional</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded bg-emerald-500" />
                                        <span className="text-slate-300">75-89: High Confidence</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded bg-amber-500" />
                                        <span className="text-slate-300">50-74: Moderate — Review Suggested</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded bg-rose-500" />
                                        <span className="text-slate-300">0-49: Low — Revision Required</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800">
                                <div className="text-xs text-slate-500 italic">This score is recalculated automatically if you update your dataset. Final score may vary after full platform review.</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Step 4 - Privacy & access controls',
            description: 'Configure how buyers can access and use this dataset. Basic terms are shown below. Advanced legal and governance controls can be set separately.',
            body: (
                <div className="space-y-4 text-sm">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-slate-950/95 p-5 shadow-xl shadow-cyan-950/20">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/80">Basic Buyer Terms</div>
                                        <h4 className="mt-2 text-lg font-semibold text-slate-50">Core access setup</h4>
                                        <p className="mt-1 max-w-2xl text-sm text-slate-400">
                                            Keep the main package clean here, then open advanced rights only when you need legal and governance detail.
                                        </p>
                                    </div>
                                    <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                                        Step 4
                                    </span>
                                </div>
                            </div>

                            <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-5 backdrop-blur-sm shadow-lg shadow-cyan-950/10">
                                <div className="mb-4">
                                    <div className="text-sm font-semibold text-slate-100">Access &amp; Delivery Method</div>
                                    <div className="mt-1 text-xs text-slate-400">Choose how buyers will receive and interact with the approved dataset.</div>
                                </div>

                                <div className="grid gap-3 xl:grid-cols-3">
                                    {accessMethodOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updatePrivacyAccessTerm('accessMethod', option.value)}
                                            className={`rounded-2xl border p-4 text-left transition-all ${
                                                privacyAccessTerms.accessMethod === option.value
                                                    ? 'border-cyan-400/45 bg-cyan-500/10 text-cyan-100 shadow-lg shadow-cyan-950/10'
                                                    : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                                                    privacyAccessTerms.accessMethod === option.value
                                                        ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
                                                        : 'border-slate-700 bg-slate-900/70 text-slate-400'
                                                }`}>
                                                    {renderAccessMethodIcon(option.icon)}
                                                </div>
                                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                                    privacyAccessTerms.accessMethod === option.value
                                                        ? 'border border-cyan-400/35 bg-cyan-500/15 text-cyan-100'
                                                        : 'border border-slate-700 bg-slate-900/70 text-slate-500'
                                                }`}>
                                                    {privacyAccessTerms.accessMethod === option.value ? 'Selected' : 'Choose'}
                                                </span>
                                            </div>
                                            <div className="mt-4 text-base font-semibold">{option.label}</div>
                                            <div className="mt-2 text-sm leading-6 text-slate-400">{option.detail}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/40 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-100">Delivery detail</div>
                                            <div className="mt-1 text-xs text-slate-400">Refine the exact packaging or access mode buyers receive after approval.</div>
                                        </div>
                                        <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Granular options
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                        {deliveryModeOptions.map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => updatePrivacyAccessTerm('deliveryMode', option.value)}
                                                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                                                    privacyAccessTerms.deliveryMode === option.value
                                                        ? 'border-cyan-400/45 bg-cyan-500/10 text-cyan-100 shadow-lg shadow-cyan-950/10'
                                                        : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                                                }`}
                                            >
                                                <div className="text-sm font-medium">{option.label}</div>
                                                <div className="mt-1 text-xs leading-5 text-slate-400">{option.detail}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/8 via-slate-900/75 to-slate-950/95 p-5 backdrop-blur-sm shadow-lg shadow-emerald-950/10">
                                <div className="mb-5">
                                    <div className="text-sm font-semibold text-slate-100">Dataset Security Options</div>
                                    <div className="mt-1 text-xs text-slate-400">Configure additional security, privacy, and governance controls for this dataset.</div>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
                                        <div className="text-sm font-semibold text-slate-100">Encryption Level</div>
                                        <div className="mt-1 text-xs text-slate-400">Baseline transport and storage protections stay applied to every approved package.</div>

                                        <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-emerald-100">AES-256 at rest + TLS 1.3 in transit</div>
                                                    <div className="mt-1 text-xs leading-5 text-slate-300">Default Redoubt encryption baseline for stored payloads and governed delivery channels.</div>
                                                </div>
                                                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                                                    Default
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-100">End-to-End Encryption</div>
                                                    <div className="mt-1 text-xs text-slate-400">Add an extra protected path for highly sensitive buyer access scenarios.</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    aria-pressed={privacyAccessTerms.security.endToEndEncryption}
                                                    onClick={() => updateSecurityOption('endToEndEncryption', !privacyAccessTerms.security.endToEndEncryption)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                        privacyAccessTerms.security.endToEndEncryption ? 'bg-emerald-500 ring-1 ring-emerald-300/40' : 'bg-slate-700 ring-1 ring-slate-500/60'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacyAccessTerms.security.endToEndEncryption ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
                                        <div className="text-sm font-semibold text-slate-100">Data Masking &amp; Anonymization</div>
                                        <div className="mt-1 text-xs text-slate-400">Control how sensitive fields are protected before buyers interact with approved data.</div>

                                        <div className="mt-4 space-y-3">
                                            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-100">Automatically mask PII fields</div>
                                                        <div className="mt-1 text-xs text-slate-400">Apply masking rules to known sensitive identifiers by default.</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        aria-pressed={privacyAccessTerms.security.autoMaskPii}
                                                        onClick={() => updateSecurityOption('autoMaskPii', !privacyAccessTerms.security.autoMaskPii)}
                                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                            privacyAccessTerms.security.autoMaskPii ? 'bg-emerald-500 ring-1 ring-emerald-300/40' : 'bg-slate-700 ring-1 ring-slate-500/60'
                                                        }`}
                                                    >
                                                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacyAccessTerms.security.autoMaskPii ? 'translate-x-5' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-100">Dynamic masking based on buyer role</div>
                                                        <div className="mt-1 text-xs text-slate-400">Adjust visible field precision and masking according to approved buyer permissions.</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        aria-pressed={privacyAccessTerms.security.dynamicRoleMasking}
                                                        onClick={() => updateSecurityOption('dynamicRoleMasking', !privacyAccessTerms.security.dynamicRoleMasking)}
                                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                            privacyAccessTerms.security.dynamicRoleMasking ? 'bg-emerald-500 ring-1 ring-emerald-300/40' : 'bg-slate-700 ring-1 ring-slate-500/60'
                                                        }`}
                                                    >
                                                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacyAccessTerms.security.dynamicRoleMasking ? 'translate-x-5' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-100">Watermarking</div>
                                                <div className="mt-1 text-xs text-slate-400">Enable invisible digital watermarking on downloaded data.</div>
                                            </div>
                                            <button
                                                type="button"
                                                aria-pressed={privacyAccessTerms.security.watermarkingEnabled}
                                                onClick={() => updateSecurityOption('watermarkingEnabled', !privacyAccessTerms.security.watermarkingEnabled)}
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                    privacyAccessTerms.security.watermarkingEnabled ? 'bg-emerald-500 ring-1 ring-emerald-300/40' : 'bg-slate-700 ring-1 ring-slate-500/60'
                                                }`}
                                            >
                                                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacyAccessTerms.security.watermarkingEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-100">Revocation Rights</div>
                                                <div className="mt-1 text-xs text-slate-400">Provider can revoke access at any time when contractual or compliance issues arise.</div>
                                            </div>
                                            <button
                                                type="button"
                                                aria-pressed={privacyAccessTerms.security.revocationRights}
                                                onClick={() => updateSecurityOption('revocationRights', !privacyAccessTerms.security.revocationRights)}
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                    privacyAccessTerms.security.revocationRights ? 'bg-emerald-500 ring-1 ring-emerald-300/40' : 'bg-slate-700 ring-1 ring-slate-500/60'
                                                }`}
                                            >
                                                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacyAccessTerms.security.revocationRights ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
                                        <div className="text-sm font-semibold text-slate-100">Audit Logging Requirement</div>
                                        <div className="mt-1 text-xs text-slate-400">Define whether buyer access events require mandatory audit capture.</div>
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            {advancedBinaryOptions.auditLoggingRequirement.map(option => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => updateAdvancedRight('auditLoggingRequirement', option.value)}
                                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                                        privacyAccessTerms.advanced.auditLoggingRequirement === option.value
                                                            ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-100'
                                                            : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
                                        <div className="text-sm font-semibold text-slate-100">Attribution Requirement</div>
                                        <div className="mt-1 text-xs text-slate-400">Set whether approved buyers must preserve attribution when using the dataset.</div>
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            {advancedBinaryOptions.attributionRequirement.map(option => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => updateAdvancedRight('attributionRequirement', option.value)}
                                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                                        privacyAccessTerms.advanced.attributionRequirement === option.value
                                                            ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-100'
                                                            : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4 lg:col-span-2">
                                        <div className="text-sm font-semibold text-slate-100">Redistribution Rights</div>
                                        <div className="mt-1 text-xs text-slate-400">Control whether buyers may redistribute approved dataset outputs or packages.</div>
                                        <div className="mt-4 grid grid-cols-2 gap-3 md:max-w-md">
                                            {advancedBinaryOptions.redistributionRights.map(option => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => updateAdvancedRight('redistributionRights', option.value)}
                                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                                        privacyAccessTerms.advanced.redistributionRights === option.value
                                                            ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-100'
                                                            : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </section>

                            <div className="grid gap-4 md:grid-cols-2">
                                {privacyControlSections.map(section => (
                                    <section key={section.field} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 backdrop-blur-sm">
                                        <div className="mb-3">
                                            <div className="text-sm font-semibold text-slate-100">{section.title}</div>
                                            <div className="mt-1 text-xs text-slate-400">{section.description}</div>
                                        </div>
                                        <div className={`grid gap-2 ${section.options.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                                            {section.options.map(option => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => updatePrivacyAccessTerm(section.field, option.value)}
                                                    className={`rounded-xl border px-3 py-3 text-left transition-all ${
                                                        privacyAccessTerms[section.field] === option.value
                                                            ? 'border-cyan-400/45 bg-cyan-500/10 text-cyan-100 shadow-lg shadow-cyan-950/10'
                                                            : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500'
                                                    }`}
                                                >
                                                    <div className="text-sm font-medium">{option.label}</div>
                                                    {'detail' in option && option.detail && (
                                                        <div className="mt-1 text-xs text-slate-400">{option.detail}</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>

                            <button
                                type="button"
                                aria-expanded={isAdvancedRightsOpen}
                                onClick={() => setIsAdvancedRightsOpen(prev => !prev)}
                                className="w-full rounded-2xl border border-purple-500/35 bg-gradient-to-r from-purple-500/10 via-slate-900/80 to-slate-950/90 px-5 py-5 text-left shadow-lg shadow-purple-950/20 transition-all hover:border-purple-400/55 hover:from-purple-500/15"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold text-purple-100">Advanced Rights &amp; Conditions</div>
                                        <div className="mt-1 text-xs text-slate-400">Legal, audit, redistribution and governance controls</div>
                                    </div>
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-300 transition-transform duration-300 ${isAdvancedRightsOpen ? 'rotate-90' : ''}`}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            <div className={`grid transition-all duration-300 ease-out ${isAdvancedRightsOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-slate-900/80 to-slate-950/95 p-5 shadow-xl shadow-purple-950/10">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <div className="text-[11px] uppercase tracking-[0.16em] text-purple-300/80">Advanced Rights &amp; Conditions</div>
                                                <h4 className="mt-2 text-lg font-semibold text-slate-50">Legal and governance controls</h4>
                                                <p className="mt-1 max-w-2xl text-sm text-slate-400">Configure redistribution, audit posture, attribution, and optional volume-based pricing without leaving the main form.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsAdvancedRightsOpen(false)}
                                                className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                                            >
                                                Hide Advanced Controls
                                            </button>
                                        </div>

                                        <div className="mt-5 space-y-5">
                                            {advancedRightsSections.map(section => (
                                                <section key={section.field} className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                                                    <div className="text-sm font-semibold text-slate-100">{section.title}</div>
                                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                                        {section.options.map(option => (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                onClick={() => updateAdvancedRight(section.field, option.value)}
                                                                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                                                    privacyAccessTerms.advanced[section.field] === option.value
                                                                        ? 'border-purple-400/50 bg-purple-500/10 text-purple-100'
                                                                        : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500'
                                                                }`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </section>
                                            ))}

                                            <section className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-100">Data Volume Scaling</div>
                                                        <div className="mt-1 text-xs text-slate-400">Enable price adjustment per TB or per million records.</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        aria-pressed={privacyAccessTerms.advanced.volumeBasedPricing}
                                                        onClick={() => updateAdvancedRight('volumeBasedPricing', !privacyAccessTerms.advanced.volumeBasedPricing)}
                                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                            privacyAccessTerms.advanced.volumeBasedPricing ? 'bg-purple-500 ring-1 ring-purple-300/40' : 'bg-slate-700 ring-1 ring-slate-500/60'
                                                        }`}
                                                    >
                                                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacyAccessTerms.advanced.volumeBasedPricing ? 'translate-x-5' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>

                                                <div className={`grid transition-all duration-300 ease-out ${privacyAccessTerms.advanced.volumeBasedPricing ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                                                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Price adjustment</label>
                                                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                                                <input
                                                                    type="number"
                                                                    value={privacyAccessTerms.advanced.volumePricingAdjustment}
                                                                    onChange={(e) => updateAdvancedRight('volumePricingAdjustment', e.target.value)}
                                                                    placeholder="e.g. 1200"
                                                                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-purple-400/60 focus:outline-none"
                                                                />
                                                                <select
                                                                    value={privacyAccessTerms.advanced.volumePricingUnit}
                                                                    onChange={(e) => updateAdvancedRight('volumePricingUnit', e.target.value)}
                                                                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-400/60 focus:outline-none"
                                                                >
                                                                    <option value="tb">per TB</option>
                                                                    <option value="million_records">per million records</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="xl:sticky xl:top-4 h-fit">
                            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5 shadow-xl backdrop-blur-sm">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Live summary</div>
                                <h4 className="mt-2 text-lg font-semibold text-slate-50">Buyer-facing package preview</h4>
                                <p className="mt-1 text-sm text-slate-400">The main commercial terms stay visible here while advanced conditions expand inline below the main form.</p>

                                <div className="mt-5 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-cyan-300/80">Access &amp; delivery method</div>
                                    <div className="mt-3 flex items-start gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                                            {renderAccessMethodIcon(selectedAccessMethodOption.icon)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-100">{selectedAccessMethodLabel}</div>
                                            <div className="mt-1 text-xs leading-5 text-slate-300">{selectedAccessMethodOption.summary}</div>
                                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
                                                <span className="text-cyan-300/80">Delivery detail</span>
                                                <span>{selectedDeliveryModeLabel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3">
                                    {[
                                        ['Field access', selectedFieldAccessLabel],
                                        ['Usage rights', selectedUsageRightsLabel],
                                        ['Term', selectedTermLabel],
                                        ['Geography', selectedGeographyLabel],
                                        ['Exclusivity', selectedExclusivityLabel]
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
                                            <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-emerald-300/80">Security snapshot</div>
                                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                                        {securitySummary.map(([label, value]) => (
                                            <div key={label} className="flex items-start justify-between gap-3">
                                                <span>{label}</span>
                                                <span className="max-w-[62%] text-right text-slate-100">{value}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-start justify-between gap-3">
                                            <span>Audit logging</span>
                                            <span className="text-slate-100">{selectedAuditLoggingLabel}</span>
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <span>Attribution</span>
                                            <span className="text-slate-100">{selectedAttributionLabel}</span>
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <span>Redistribution</span>
                                            <span className="text-slate-100">{selectedRedistributionLabel}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-purple-300/80">Advanced conditions</div>
                                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                                        <div className="flex items-center justify-between gap-3"><span>Redistribution</span><span className="text-slate-100">{selectedRedistributionLabel}</span></div>
                                        <div className="flex items-center justify-between gap-3"><span>Audit logging</span><span className="text-slate-100">{selectedAuditLoggingLabel}</span></div>
                                        <div className="flex items-center justify-between gap-3"><span>Attribution</span><span className="text-slate-100">{selectedAttributionLabel}</span></div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span>Volume pricing</span>
                                            <span className="text-slate-100">{volumePricingSummary}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                </div>
            )
        },
        {
            title: 'Submission confirmation',
            description: 'Review the dataset package, access and security terms, and legal declaration before submission.',
            body: (
                <div className="space-y-4 text-sm">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                        <div className="space-y-4">
                            <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 backdrop-blur-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Dataset package</div>
                                        <h4 className="mt-2 text-lg font-semibold text-slate-50">Final metadata and payload review</h4>
                                        <p className="mt-1 text-sm text-slate-400">This mock submission screen now reflects the working values from the earlier upload steps.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep(0)}
                                            className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500"
                                        >
                                            Edit Step 1
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep(1)}
                                            className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500"
                                        >
                                            Edit Step 2
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Dataset name</div>
                                        <div className="mt-1 font-medium text-slate-100">{uploadDraft.metadata.name}</div>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Domain</div>
                                        <div className="mt-1 font-medium text-slate-100">{uploadDraft.metadata.domain}</div>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Price</div>
                                        <div className="mt-1 font-medium text-slate-100">${uploadDraft.metadata.price || '--'} / access</div>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">File</div>
                                        <div className="mt-1 font-medium text-slate-100">{uploadDraft.file.name}</div>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:col-span-2">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Description</div>
                                        <div className="mt-1 text-slate-200">{uploadDraft.metadata.description}</div>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">File size</div>
                                        <div className="mt-1 font-medium text-slate-100">{uploadDraft.file.sizeLabel}</div>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Integrity</div>
                                        <div className="mt-1 font-medium text-slate-100">{uploadDraft.file.checksumStatus}</div>
                                        <div className="mt-1 text-xs text-slate-400">{uploadDraft.file.format} • {uploadDraft.file.uploadStatus}</div>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-cyan-300/80">Pricing info</div>
                                    <p className="mt-2 text-slate-200">
                                        No onboarding fees apply to participants or datasets. Revenue starts only after a successful settlement.
                                    </p>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 backdrop-blur-sm">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Review signals</div>
                                <h4 className="mt-2 text-lg font-semibold text-slate-50">Quality and marketplace review summary</h4>

                                <div className="mt-5 grid gap-3 md:grid-cols-3">
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-emerald-300/80">Confidence score</div>
                                        <div className="mt-2 text-3xl font-semibold text-emerald-200">{uploadDraft.review.confidenceScore} / 100</div>
                                        <div className="mt-1 text-xs text-slate-300">{uploadDraft.review.summary}</div>
                                    </div>
                                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-blue-300/80">Classification</div>
                                        <div className="mt-2 text-lg font-semibold text-blue-100">{uploadDraft.review.classification}</div>
                                        <div className="mt-1 text-xs text-slate-300">{uploadDraft.review.confidenceLabel}</div>
                                    </div>
                                    <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-violet-300/80">Review timeline</div>
                                        <div className="mt-2 text-3xl font-semibold text-violet-100">{uploadDraft.review.reviewTimeline}</div>
                                        <div className="mt-1 text-xs text-slate-300">Compliance and marketplace review begins after submission.</div>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {uploadDraft.review.breakdown.map(item => (
                                        <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-100">{item.label}</span>
                                                <span className="text-sm font-semibold text-emerald-300">{item.score}/100</span>
                                            </div>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.score}%` }} />
                                            </div>
                                            <div className="mt-2 text-xs text-slate-400">{item.detail}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 backdrop-blur-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Buyer access terms</div>
                                        <h4 className="mt-2 text-lg font-semibold text-slate-50">Access and delivery package</h4>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Review the selected primary access method, delivery detail, provider-selected package geography, and buyer-facing commercial controls.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep(3)}
                                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500"
                                    >
                                        Edit Step 4
                                    </button>
                                </div>

                                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {buyerAccessSummary.map(([label, value]) => (
                                        <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
                                            <div className="mt-1 font-medium text-slate-100">{value}</div>
                                        </div>
                                    ))}
                                    {hasGovernanceGeoRestriction && (
                                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                                            <div className="text-[11px] uppercase tracking-[0.14em] text-amber-200">Governance geo restriction</div>
                                            <div className="mt-1 font-medium text-amber-100">{governanceGeoRestriction}</div>
                                        </div>
                                    )}
                                </div>

                                {hasGovernanceGeoRestriction && (
                                    <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-amber-200">Governance precedence</div>
                                        <p className="mt-2 text-sm text-amber-100">
                                            This governance geo restriction is platform-enforced and may narrow the broader commercial geography selected in Step 4.
                                            {' '}
                                            {uploadGovernanceSummary.restrictionReason}
                                        </p>
                                    </div>
                                )}
                            </section>

                            <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 backdrop-blur-sm">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Dataset security options</div>
                                <h4 className="mt-2 text-lg font-semibold text-slate-50">Security, privacy, and governance recap</h4>
                                <p className="mt-1 text-sm text-slate-400">Confirm the current encryption, masking, watermarking, and revocation settings before final submission.</p>

                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    {securitySummary.map(([label, value]) => (
                                        <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
                                            <div className="mt-1 font-medium text-slate-100">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 backdrop-blur-sm">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Advanced rights &amp; conditions</div>
                                <h4 className="mt-2 text-lg font-semibold text-slate-50">Legal, audit, redistribution, and governance recap</h4>

                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    {advancedRightsSummary.map(([label, value]) => (
                                        <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
                                            <div className="mt-1 font-medium text-slate-100">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="xl:sticky xl:top-4 h-fit">
                            <section className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 shadow-xl backdrop-blur-sm">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Submission</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-50">{uploadDraft.submission.id}</div>
                                <p className="mt-1 text-sm text-slate-400">Generated for this frontend-only upload session. It resets when you start a new dataset upload.</p>

                                <div className="mt-5 space-y-2">
                                    {submissionChecklist.map(item => (
                                        <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                                            <span className="text-slate-300">{item.label}</span>
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                                                item.complete
                                                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                                                    : 'border border-slate-700 bg-slate-800 text-slate-400'
                                            }`}>
                                                {item.complete ? 'Ready' : 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={uploadDraft.submission.declarationAccepted}
                                        onChange={(e) => updateSubmissionDeclaration(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                                    />
                                    <span className="text-slate-300">
                                        I declare that the dataset details, file package, pricing terms, and access conditions are accurate and ready for Redoubt review.
                                    </span>
                                </label>

                                <div className="mt-5 space-y-3">
                                    <div className={`text-xs ${isSubmissionReady ? 'text-emerald-300' : 'text-slate-400'}`}>
                                        {isSubmissionReady
                                            ? 'All frontend review requirements are complete. The button is enabled, but no backend submission is triggered.'
                                            : `Finish ${incompleteSubmissionLabels.join(', ')} to enable the mock submission button.`}
                                    </div>
                                    {showMockSubmissionNotice && (
                                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                                            Mock submission captured locally. No backend request was sent.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            )
        }
    ]

    if (!selectedDataset) return null

    return (
        <div className="container mx-auto px-4 py-10 text-white space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Dataset Contribution & Validation</h1>
                    <p className="text-slate-400">Onboard participants and datasets at no charge, monitor validation pipeline status, and review quality/compliance feedback before any evaluation begins.</p>
                </div>
                {isUploadViewOpen ? (
                    <button
                        onClick={closeUploadFlow}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/80 hover:border-blue-400 text-sm font-semibold text-slate-100 transition-colors self-start"
                    >
                        Back to Dashboard
                    </button>
                ) : (
                    providerAccount.canCreateDataset ? (
                        <button
                            onClick={startUploadFlow}
                            className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-blue-300/40 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition-all self-start"
                        >
                            Upload New Dataset
                        </button>
                    ) : (
                        <button
                            disabled
                            className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-slate-600 bg-slate-800 text-sm font-semibold text-slate-500 cursor-not-allowed self-start opacity-60"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Upload New Dataset
                        </button>
                    )
                )}
            </div>

            {!isUploadViewOpen && !providerAccount.canCreateDataset && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                    <div className="text-sm text-amber-200">
                        Dataset limit reached. Upgrade your plan to add more datasets.{' '}

                    </div>
                </div>
            )}



            {!isUploadViewOpen && (
                <>
                    <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Uploaded datasets</div>
                            <div className="text-3xl font-semibold">{summary.uploaded}</div>
                            <div className="text-xs text-slate-400">Total contributions</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Approved</div>
                            <div className="text-3xl font-semibold">{summary.approved}</div>
                            <div className="text-xs text-slate-400">Ready for participant access</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Processing</div>
                            <div className="text-3xl font-semibold">{summary.processing}</div>
                            <div className="text-xs text-slate-400">In active validation</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-rose-500/20 via-rose-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Needs fixes</div>
                            <div className="text-3xl font-semibold">{summary.needsFixes}</div>
                            <div className="text-xs text-slate-400">Contributor action required</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Access activity</div>
                            <div className="text-3xl font-semibold">{summary.totalAccessEvents}</div>
                            <div className="text-xs text-slate-400">Total access events</div>
                        </div>
                    </section>

                    <section className="grid xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-9 bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                                <div>
                                    <h2 className="text-xl font-semibold">Contribution dashboard</h2>
                                    <p className="text-slate-400 text-sm">Uploaded datasets, validation status, access activity, and performance summary.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-[920px] w-full text-sm">
                                    <thead className="text-xs uppercase tracking-[0.08em] text-slate-400 border-b border-slate-700">
                                        <tr>
                                            <th className="py-3 pr-4 text-left font-medium">Dataset</th>
                                            <th className="py-3 px-4 text-left font-medium min-w-[150px] whitespace-nowrap">Status</th>
                                            <th className="py-3 px-4 text-left font-medium">Uploaded</th>
                                            <th className="py-3 px-4 text-left font-medium">Access activity</th>
                                            <th className="py-3 pl-4 text-right font-medium">Records</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {uploadedDatasets.map(dataset => (
                                            <tr
                                                key={dataset.id}
                                                onClick={() => setSelectedDatasetId(dataset.id)}
                                                className={`cursor-pointer transition-colors ${
                                                    selectedDataset.id === dataset.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/60'
                                                }`}
                                            >
                                                <td className="py-4 pr-4">
                                                    <div className="font-semibold text-white">{dataset.title}</div>
                                                    <div className="text-xs text-slate-400">ID: {dataset.id} - {dataset.size}</div>
                                                </td>
                                                <td className="py-4 px-4 min-w-[150px]">
                                                    {isStatusDetailsClickable(dataset.status) ? (
                                                        <Link
                                                            to={getStatusLink(dataset)}
                                                            onClick={(event) => event.stopPropagation()}
                                                            className={`inline-flex whitespace-nowrap px-3 py-1 rounded-full border text-xs font-medium hover:brightness-110 transition ${statusStyles[dataset.status]}`}
                                                        >
                                                            {dataset.status}
                                                        </Link>
                                                    ) : (
                                                        <span className={`inline-flex whitespace-nowrap px-3 py-1 rounded-full border text-xs font-medium ${statusStyles[dataset.status]}`}>
                                                            {dataset.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-slate-300">{dataset.uploadedAt}</td>
                                                <td className="py-4 px-4 text-slate-300">{dataset.accessActivity}</td>
                                                <td className="py-4 pl-4 text-right text-slate-200">{dataset.records}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="xl:col-span-3 bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold">Dataset performance summary</h2>
                                <p className="text-slate-400 text-sm">Selected dataset: {selectedDataset.title}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                    <div className="text-slate-300 text-sm">Total requests</div>
                                    <div className="text-sm text-slate-100">{selectedDataset.performance.totalRequests}</div>
                                </div>
                                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                    <div className="text-slate-300 text-sm">Approved requests</div>
                                    <div className="text-sm text-emerald-200">{selectedDataset.performance.approvedRequests}</div>
                                </div>
                                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                    <div className="text-slate-300 text-sm">Access events</div>
                                    <div className="text-sm text-cyan-200">{selectedDataset.performance.accessEvents}</div>
                                </div>
                                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                                    <div className="text-slate-400 text-xs uppercase tracking-[0.12em] mb-2">Reliability score</div>
                                    <div className="text-3xl font-semibold text-cyan-300">{selectedDataset.performance.avgReliability}%</div>
                                    <p className="text-slate-400 text-sm mt-1">Rolling quality + access reliability metric.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {isUploadViewOpen && (
                <>
                    <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
                        <div>
                            <h2 className="text-xl font-semibold">Dataset upload flow</h2>
                            <p className="text-slate-400 text-sm">Step through the participant contribution flow before validation starts.</p>
                        </div>

                        <div className="grid sm:grid-cols-5 gap-2">
                            {uploadSteps.map((step, idx) => (
                                <button
                                    key={step}
                                    onClick={() => setActiveStep(idx)}
                                    className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                                        activeStep === idx
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-100'
                                            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-blue-500'
                                    }`}
                                >
                                    <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Step {idx + 1}</div>
                                    <div className="text-sm font-semibold">{step}</div>
                                </button>
                            ))}
                        </div>

                        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold">{stepPreview[activeStep].title}</h3>
                                <p className="text-sm text-slate-400">{stepPreview[activeStep].description}</p>
                            </div>
                            {activeStep === 0 && !providerAccount.canCreateDataset ? (
                                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-6 text-center space-y-4">
                                    <div className="text-lg font-semibold text-rose-200">
                                        You have reached your dataset limit for the {providerAccount.tier.charAt(0).toUpperCase() + providerAccount.tier.slice(1)} plan ({providerAccount.datasetLimit} dataset).
                                    </div>
                                    <div className="text-sm text-slate-300">
                                        Upgrade to Professional to list up to 5 datasets.
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <button
                                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors"
                                        >
                                            Upgrade Plan →
                                        </button>
                                        <button
                                            onClick={closeUploadFlow}
                                            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-500 text-sm font-semibold text-slate-300 transition-colors"
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                stepPreview[activeStep].body
                            )}
                            {!(activeStep === 0 && !providerAccount.canCreateDataset) && (
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))}
                                    className="px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 transition-colors"
                                >
                                    Previous
                                </button>
                                {activeStep === uploadSteps.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={handleMockSubmission}
                                        disabled={!isSubmissionReady}
                                        className="px-3 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                                    >
                                        Submit &amp; Finalize
                                    </button>
                                )}
                                {activeStep < uploadSteps.length - 1 && (
                                    <button
                                        onClick={() => setActiveStep(prev => Math.min(prev + 1, uploadSteps.length - 1))}
                                        disabled={activeStep === 1 && !interrogationAcknowledged}
                                        className="px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-700"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                            )}
                        </div>
                    </section>

                    <section className="grid xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
                            <div>
                                <h2 className="text-xl font-semibold">Validation pipeline</h2>
                                <p className="text-slate-400 text-sm">Progress tracker for selected dataset: {selectedDataset.title}</p>
                            </div>

                            <div className="grid md:grid-cols-5 gap-3">
                                {validationStages.map((stage, idx) => {
                                    const state = selectedDataset.validationPipeline[idx]
                                    const style = pipelineStateStyles[state]
                                    const statusText = stage === 'Compliance review' && state === 'pending' ? 'AWAITING DPO CLEARANCE' : state.toUpperCase()
                                    return (
                                        <div key={stage} className="relative">
                                            <div className={`h-full min-h-[120px] rounded-lg border border-slate-700 bg-slate-900/60 p-3 ${style.text}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`inline-block w-3 h-3 rounded-full border ${style.dot}`} />
                                                    <span className="text-[11px] uppercase tracking-[0.12em]">{statusText}</span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-100">{stage}</div>
                                                {stage === 'Compliance review' && state === 'pending' && (
                                                    <div className="text-[10px] text-slate-500 mt-1">Human DPO reviewing legal packet</div>
                                                )}
                                            </div>
                                            {idx < validationStages.length - 1 && (
                                                <span className={`hidden md:block absolute top-1/2 -right-2 w-4 h-[2px] ${style.line}`} />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold">Validation feedback</h2>
                                <p className="text-slate-400 text-sm">Issues detected during validation for the selected dataset.</p>
                            </div>
                            {selectedDataset.feedback.length === 0 ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-100">
                                    No current issues detected. Validation checks are passing for this dataset.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedDataset.feedback.map(issue => (
                                        <div key={`${issue.type}-${issue.detail}`} className={`rounded-lg border p-3 text-sm ${feedbackStyles[issue.severity]}`}>
                                            <div className="font-semibold mb-1">{issue.type}</div>
                                            <div className="text-xs opacity-90">{issue.detail}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="mt-6 bg-slate-900/80 border-l-4 border-cyan-500 rounded-r-lg p-4 shadow-lg shadow-cyan-900/10">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-cyan-300">Compliance Review Signal</h3>
                                <div className="text-xs text-slate-400 space-y-2 font-mono">
                                    <p><span className="text-slate-500">What we are doing:</span> Our automated AI engine is actively inspecting your schema for structural integrity, PII (Personally Identifiable Information) exposure, and cross-border data residency flags.</p>
                                    <p><span className="text-slate-500">Why we do this:</span> Redoubt uses this validation pass to surface schema, residency, and exposure issues early in the demo flow, but it does not replace provider legal review, reviewer judgment, or buyer diligence.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

