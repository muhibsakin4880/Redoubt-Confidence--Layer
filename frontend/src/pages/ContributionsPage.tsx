import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

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

const uploadSteps = [
    'Dataset info',
    'Secure Payload Ingestion',
    'Schema preview',
    'Privacy & access controls',
    'Submission confirmation'
]

const validationStages = [
    'Upload received',
    'Schema analysis',
    'Quality evaluation',
    'Compliance review',
    'Approved for access'
]

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
        return '/contributions/ds-1003'
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

export default function ContributionsPage() {
    const [activeStep, setActiveStep] = useState(0)
    const [selectedDatasetId, setSelectedDatasetId] = useState(uploadedDatasets[0]?.id ?? '')
    const [isUploadViewOpen, setIsUploadViewOpen] = useState(false)
    const [interrogationAcknowledged, setInterrogationAcknowledged] = useState(false)
    const [anonymitySettings, setAnonymitySettings] = useState({
        anonymousUpload: true,
        pseudonymization: false,
        fullDeIdentification: false
    })
    const [submissionConfirmed, setSubmissionConfirmed] = useState(false)
    const [schemaSearchQuery, setSchemaSearchQuery] = useState('')
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
    const [accessMethod, setAccessMethod] = useState<'platform' | 'download'>('platform')
    const [downloadConditions, setDownloadConditions] = useState({
        requireReconfirmation: true,
        notifyOnDownload: true,
        allowAfterEscrow: true,
        maxDownloads: 1
    })

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

    const toggleAnonymitySetting = (setting: keyof typeof anonymitySettings) => {
        setAnonymitySettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }))
    }

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

    const stepPreview = [
        {
            title: 'Dataset info',
            description: 'Define metadata and ownership for the contribution package.',
            body: (
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">Dataset title</div>
                        <div className="text-slate-100">City Sensor Aggregates 2026-Q1</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">Domain</div>
                        <div className="text-slate-100">Mobility & Infrastructure</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3 sm:col-span-2">
                        <div className="text-slate-400 text-xs mb-1">Description</div>
                        <div className="text-slate-100">Aggregated sensor flow, occupancy, and throughput metrics by 5-minute intervals.</div>
                    </div>
                    <div className="sm:col-span-2">
                        <div className="text-slate-400 text-xs mb-1">Dataset Access Price</div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="299"
                                className="flex-1 sm:flex-none sm:w-32 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                            />
                            <span className="text-slate-400 text-sm">USD per access</span>
                        </div>
                        <div className="text-slate-500 text-xs mt-1">Redoubt retains 20% platform fee. You receive 80% of each transaction.</div>
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
                            onChange={(e) => setInterrogationAcknowledged(e.target.checked)}
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
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-300">
                        `city_sensors_q1.parquet` - 6.3 GB - checksum verified
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
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs text-cyan-200">Classification: Tier 1 (Safe)</span>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5">
                            <div className="text-center mb-6">
                                <div className="text-xl font-semibold text-emerald-400 mb-1">Confidence Score: 88/100</div>
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
            title: 'Privacy & access controls',
            description: 'Define policy controls before submission.',
            body: (
                <div className="space-y-4 text-sm">
                    <div className="rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-slate-950 px-4 py-4 shadow-lg shadow-cyan-900/20">
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.16em] text-cyan-300/80">Anonymity Settings</div>
                                <div className="text-slate-200 text-xs mt-1">Configure identity protection and de-identification before dataset release.</div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[11px] font-medium text-cyan-200">Recommended</span>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                <div>
                                    <div className="text-slate-100 font-medium">Enable Anonymous Upload</div>
                                    <div className="text-slate-400 text-xs mt-1 max-w-xl">Your identity and organization name will remain completely hidden from other participants and accessors</div>
                                </div>
                                <button
type="button"
                                     aria-pressed={anonymitySettings.anonymousUpload}
                                     onClick={() => toggleAnonymitySetting('anonymousUpload')}
                                     className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors transition-transform duration-100 active:scale-95 ${
                                         anonymitySettings.anonymousUpload
                                             ? 'bg-cyan-500 ring-1 ring-cyan-300/40'
                                             : 'bg-slate-700 ring-1 ring-slate-500/60'
                                     }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                            anonymitySettings.anonymousUpload ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                <div className="text-slate-100 font-medium">Apply Pseudonymization</div>
                                <button
type="button"
                                     aria-pressed={anonymitySettings.pseudonymization}
                                     onClick={() => toggleAnonymitySetting('pseudonymization')}
                                     className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors transition-transform duration-100 active:scale-95 ${
                                         anonymitySettings.pseudonymization
                                             ? 'bg-cyan-500 ring-1 ring-cyan-300/40'
                                             : 'bg-slate-700 ring-1 ring-slate-500/60'
                                     }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                            anonymitySettings.pseudonymization ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                <div className="text-slate-100 font-medium">Full De-identification</div>
                                <button
                                    type="button"
                                    aria-pressed={anonymitySettings.fullDeIdentification}
                                    onClick={() => toggleAnonymitySetting('fullDeIdentification')}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                        anonymitySettings.fullDeIdentification
                                            ? 'bg-cyan-500 ring-1 ring-cyan-300/40'
                                            : 'bg-slate-700 ring-1 ring-slate-500/60'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                            anonymitySettings.fullDeIdentification ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 mb-3">Access Governance</div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="bg-slate-950/70 border border-slate-700 rounded-lg p-3">
                                <div className="text-slate-400 text-xs mb-1">Default access level</div>
                                <div className="text-slate-100">Restricted participant workspaces</div>
                            </div>
                            <div className="bg-slate-950/70 border border-slate-700 rounded-lg p-3">
                                <div className="text-slate-400 text-xs mb-1">Export policy</div>
                                <div className="text-slate-100">Aggregated export only</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 mb-3">Buyer Restrictions</div>
                        <div className="grid sm:grid-cols-3 gap-3">
                            <div className="bg-slate-950/70 border border-slate-700 rounded-lg p-3">
                                <div className="text-slate-400 text-xs mb-1">Allowed Industries</div>
                                <select className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500/50">
                                    <option>All Industries</option>
                                    <option>Healthcare Only</option>
                                    <option>Finance Only</option>
                                    <option>Government Only</option>
                                    <option>Research & Academia Only</option>
                                </select>
                            </div>
                            <div className="bg-slate-950/70 border border-slate-700 rounded-lg p-3">
                                <div className="text-slate-400 text-xs mb-1">Geographic Restriction</div>
                                <select className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500/50">
                                    <option>Global</option>
                                    <option>US Only</option>
                                    <option>EU Only</option>
                                    <option>Asia Pacific Only</option>
                                </select>
                            </div>
                            <div className="bg-slate-950/70 border border-slate-700 rounded-lg p-3">
                                <div className="text-slate-400 text-xs mb-1">Permitted Use</div>
                                <select className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500/50">
                                    <option>All Uses</option>
                                    <option>Research Only</option>
                                    <option>Commercial Use</option>
                                    <option>AI Training Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 mb-3">Dataset Access Method</div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setAccessMethod('platform')}
                                className={`rounded-lg border p-4 text-left transition-all ${
                                    accessMethod === 'platform'
                                        ? 'border-emerald-500/60 bg-emerald-500/10'
                                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="text-slate-100 font-medium">Platform Only</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-medium">Recommended</span>
                                </div>
                                <div className="text-xs text-slate-400 mb-3">Buyers can only view your dataset within Redoubt's Secure Enclave. No download allowed.</div>
                                <ul className="text-xs text-slate-300 space-y-1">
                                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Maximum data security</li>
                                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Full egress control</li>
                                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> +5 Trust Score bonus</li>
                                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> "Maximum Security Tier" badge</li>
                                </ul>
                            </button>

                            <button
                                onClick={() => setAccessMethod('download')}
                                className={`rounded-lg border p-4 text-left transition-all ${
                                    accessMethod === 'download'
                                        ? 'border-blue-500/60 bg-blue-500/10'
                                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span className="text-slate-100 font-medium">Platform + Download</span>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 mb-3">Buyers can view within Secure Enclave AND download an encrypted copy with your consent.</div>
                                <ul className="text-xs text-amber-300 space-y-1">
                                    <li className="flex items-center gap-2"><span className="text-amber-400">⚠</span> AES-256 encrypted only</li>
                                    <li className="flex items-center gap-2"><span className="text-amber-400">⚠</span> Watermark mandatory</li>
                                    <li className="flex items-center gap-2"><span className="text-amber-400">⚠</span> 1 download per license</li>
                                    <li className="flex items-center gap-2"><span className="text-amber-400">⚠</span> 24-hour download link expiry</li>
                                    <li className="flex items-center gap-2"><span className="text-amber-400">⚠</span> You are notified on each download</li>
                                </ul>
                            </button>
                        </div>

                        {accessMethod === 'download' && (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <div className="text-sm font-medium text-slate-200 mb-3">Download Conditions</div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                        <div className="text-slate-100 text-sm">Require buyer re-confirmation before download</div>
                                        <button
                                            type="button"
                                            aria-pressed={downloadConditions.requireReconfirmation}
                                            onClick={() => setDownloadConditions(prev => ({ ...prev, requireReconfirmation: !prev.requireReconfirmation }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                downloadConditions.requireReconfirmation
                                                    ? 'bg-cyan-500 ring-1 ring-cyan-300/40'
                                                    : 'bg-slate-700 ring-1 ring-slate-500/60'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                                    downloadConditions.requireReconfirmation ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                        <div className="text-slate-100 text-sm">Notify me on each download</div>
                                        <button
                                            type="button"
                                            aria-pressed={downloadConditions.notifyOnDownload}
                                            onClick={() => setDownloadConditions(prev => ({ ...prev, notifyOnDownload: !prev.notifyOnDownload }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                downloadConditions.notifyOnDownload
                                                    ? 'bg-cyan-500 ring-1 ring-cyan-300/40'
                                                    : 'bg-slate-700 ring-1 ring-slate-500/60'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                                    downloadConditions.notifyOnDownload ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                        <div className="text-slate-100 text-sm">Allow download only after escrow window expires</div>
                                        <button
                                            type="button"
                                            aria-pressed={downloadConditions.allowAfterEscrow}
                                            onClick={() => setDownloadConditions(prev => ({ ...prev, allowAfterEscrow: !prev.allowAfterEscrow }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                downloadConditions.allowAfterEscrow
                                                    ? 'bg-cyan-500 ring-1 ring-cyan-300/40'
                                                    : 'bg-slate-700 ring-1 ring-slate-500/60'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                                    downloadConditions.allowAfterEscrow ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                        <div className="text-slate-100 text-sm">Max downloads per license</div>
                                        <input
                                            type="number"
                                            min="1"
                                            value={downloadConditions.maxDownloads}
                                            onChange={(e) => setDownloadConditions(prev => ({ ...prev, maxDownloads: parseInt(e.target.value) || 1 }))}
                                            className="w-16 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 text-sm text-center focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-700">
                            <div className="text-xs text-slate-500 italic">Platform Only providers receive a +5 Trust Score bonus and a Maximum Security Tier badge visible to all buyers.</div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 mb-3">Compliance Controls</div>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-200">PII-checked</span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-200">Retention: 12 months</span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-200">Audit logging enabled</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Submission confirmation',
            description: 'Finalize contribution package into validation pipeline.',
            body: (
                <div className="space-y-4 text-sm">
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                            <div>
                                <div className="text-slate-400 text-xs">Dataset</div>
                                <div className="text-slate-100">City Sensor Aggregates 2026-Q1</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-xs">Domain</div>
                                <div className="text-slate-100">Mobility & Infrastructure</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-xs">Price</div>
                                <div className="text-slate-100">$299 USD per access</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-xs">File</div>
                                <div className="text-slate-100">city_sensors_q1.parquet - 6.3 GB</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                            <div className="text-slate-400 text-xs">Estimated confidence score</div>
                            <div className="text-slate-100">88-94%</div>
                        </div>
                        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                            <div className="text-slate-400 text-xs">Expected review timeline</div>
                            <div className="text-slate-100">3-5 business days</div>
                        </div>
                    </div>
                    <div className="text-slate-500 text-xs">
                        Submission ID: BRE-DS-2026-XXXX
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={submissionConfirmed}
                            onChange={(e) => setSubmissionConfirmed(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-xs text-slate-300">
                            I declare under penalty of perjury that this dataset contains no unauthorized PII and complies with Redoubt's Provider Agreement.
                        </span>
                    </label>
                    <button
                        disabled={!submissionConfirmed}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            submissionConfirmed
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Submit dataset
                    </button>
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
                    <p className="text-slate-400">Upload participant datasets, monitor validation pipeline status, and review quality/compliance feedback.</p>
                </div>
                {isUploadViewOpen ? (
                    <button
                        onClick={() => setIsUploadViewOpen(false)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/80 hover:border-blue-400 text-sm font-semibold text-slate-100 transition-colors self-start"
                    >
                        Back to Dashboard
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setActiveStep(0)
                            setIsUploadViewOpen(true)
                        }}
                        className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-blue-300/40 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition-all self-start"
                    >
                        Upload New Dataset
                    </button>
                )}
            </div>

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
                            {stepPreview[activeStep].body}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))}
                                    className="px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 transition-colors"
                                >
                                    Previous
                                </button>
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
                                <h3 className="text-sm font-semibold text-cyan-300">Compliance Protocol & Liability Shift</h3>
                                <div className="text-xs text-slate-400 space-y-2 font-mono">
                                    <p><span className="text-slate-500">What we are doing:</span> Our automated AI engine is actively inspecting your schema for structural integrity, PII (Personally Identifiable Information) exposure, and cross-border data residency flags.</p>
                                    <p><span className="text-slate-500">Why we do this:</span> Redoubt operates on a zero-trust architecture. This rigorous validation protects your organization from GDPR/PDPL violations and ensures that enterprise consumers receive a clean, audit-ready data pipeline without legal liabilities.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

