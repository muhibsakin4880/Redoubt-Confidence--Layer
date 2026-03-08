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
    'File upload',
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
                        <div className="text-slate-500 text-xs mt-1">Breach retains 20% platform fee. You receive 80% of each transaction.</div>
                    </div>
                </div>
            )
        },
        {
            title: 'File upload',
            description: 'Attach files and check package size before validation starts.',
            body: (
                <div className="space-y-3 text-sm">
                    <div className="border border-dashed border-slate-600 rounded-lg p-6 text-center bg-slate-900/60">
                        <div className="text-slate-200 font-semibold">Drop files here or browse (mock)</div>
                        <div className="text-slate-400 text-xs mt-1">Accepted: CSV, Parquet, JSONL - max 15 GB per upload</div>
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
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-xs uppercase text-slate-400 border-b border-slate-700">
                                <tr>
                                    <th className="py-2 pr-4 text-left">Field</th>
                                    <th className="py-2 px-4 text-left">Type</th>
                                    <th className="py-2 pl-4 text-left">Null %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-200">
                                <tr>
                                    <td className="py-2 pr-4">sensor_id</td>
                                    <td className="py-2 px-4">string</td>
                                    <td className="py-2 pl-4">0.0%</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">timestamp_utc</td>
                                    <td className="py-2 px-4">datetime</td>
                                    <td className="py-2 pl-4">0.0%</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">flow_count</td>
                                    <td className="py-2 px-4">integer</td>
                                    <td className="py-2 pl-4">1.8%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">3 fields detected</span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">0.0% avg null rate</span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200">Schema valid ✓</span>
                    </div>
                </>
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
                                <button className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-cyan-500 ring-1 ring-cyan-300/40">
                                    <span className="inline-block h-5 w-5 translate-x-5 rounded-full bg-white shadow" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                <div className="text-slate-100 font-medium">Apply Pseudonymization</div>
                                <button className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-slate-700 ring-1 ring-slate-500/60">
                                    <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-3">
                                <div className="text-slate-100 font-medium">Full De-identification</div>
                                <button className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-slate-700 ring-1 ring-slate-500/60">
                                    <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow" />
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
                    <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
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
                                        className="px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 transition-colors"
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
                                    return (
                                        <div key={stage} className="relative">
                                            <div className={`h-full min-h-[120px] rounded-lg border border-slate-700 bg-slate-900/60 p-3 ${style.text}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`inline-block w-3 h-3 rounded-full border ${style.dot}`} />
                                                    <span className="text-[11px] uppercase tracking-[0.12em]">{state}</span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-100">{stage}</div>
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
                </>
            )}
        </div>
    )
}
