import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'

type TabKey = 'all' | 'dataset' | 'access' | 'anomaly' | 'quarantine'
type DecisionTone = 'red' | 'amber' | 'green'
type ActionTone = 'red' | 'amber' | 'blue'
type IssueTone = 'red' | 'amber'

type ConfidenceItem = {
    label: string
    value: string
    tone?: DecisionTone
}

type IssueItem = {
    text: string
    tone: IssueTone
}

type ActionTakenItem = {
    label: string
    value: string
    tone: DecisionTone | 'neutral'
}

type DecisionReport = {
    subjectTitle: string
    datasetId: string
    vendorId: string
    scanStarted: string
    scanCompleted: string
    aiModel: string
    confidenceBreakdown: ConfidenceItem[]
    issues: IssueItem[]
    actionsTaken: ActionTakenItem[]
}

type LogRow = {
    id: string
    timestamp: string
    logType: 'Dataset Scan' | 'Access Decision' | 'Anomaly Detection' | 'Quarantine Event'
    subject: string
    decision: string
    decisionTone: DecisionTone
    confidence: string
    reason: string
    action: string
    actionTone: ActionTone
    report: DecisionReport
}

type CriticalAlert = {
    tone: 'critical' | 'warning' | 'info'
    message: string
}

const summaryStats = [
    { label: 'Datasets Scanned Today', value: '847' },
    { label: 'Access Decisions Made', value: '312' },
    { label: 'Anomalies Detected', value: '7' },
    { label: 'Quarantined', value: '3' }
]

const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'all', label: 'All Logs' },
    { key: 'dataset', label: 'Dataset Scanning' },
    { key: 'access', label: 'Access Decisions' },
    { key: 'anomaly', label: 'Anomaly Detection' },
    { key: 'quarantine', label: 'Quarantine Events' }
]

const logRows: LogRow[] = [
    {
        id: 'log-1',
        timestamp: '2026-03-22 14:32:07',
        logType: 'Dataset Scan',
        subject: 'Financial_Records_Q4_2025',
        decision: 'QUARANTINED',
        decisionTone: 'red',
        confidence: '23/100',
        reason: 'PHI detected in 4 fields, schema mismatch',
        action: 'BLOCK',
        actionTone: 'red',
        report: {
            subjectTitle: 'Financial_Records_Q4_2025',
            datasetId: 'ds_fin_2026_b7c2',
            vendorId: 'VND-7821',
            scanStarted: '14:32:05',
            scanCompleted: '14:32:07',
            aiModel: 'RDT-AI-v2.4.1',
            confidenceBreakdown: [
                { label: 'Schema validity', value: '45/100' },
                { label: 'PHI/PII risk', value: '12/100' },
                { label: 'Data completeness', value: '67/100' },
                { label: 'Format consistency', value: '78/100' },
                { label: 'Overall', value: '23/100', tone: 'red' }
            ],
            issues: [
                { text: 'PHI field: patient_id detected in column 4', tone: 'red' },
                { text: 'PHI field: date_of_birth detected in column 7', tone: 'red' },
                { text: 'Schema mismatch: declared 12 fields, found 15', tone: 'amber' }
            ],
            actionsTaken: [
                { label: 'Dataset', value: 'QUARANTINED', tone: 'red' },
                { label: 'Provider notified', value: 'Yes', tone: 'neutral' },
                { label: 'Escrow', value: 'Held pending review', tone: 'neutral' }
            ]
        }
    },
    {
        id: 'log-2',
        timestamp: '2026-03-22 14:31:54',
        logType: 'Dataset Scan',
        subject: 'Customer_PII_Index',
        decision: 'SCANNING',
        decisionTone: 'amber',
        confidence: '--',
        reason: 'Deep scan in progress',
        action: 'REVIEW',
        actionTone: 'amber',
        report: {
            subjectTitle: 'Customer_PII_Index',
            datasetId: 'ds_customer_2026_91af',
            vendorId: 'VND-3390',
            scanStarted: '14:31:49',
            scanCompleted: 'In progress',
            aiModel: 'RDT-AI-v2.4.1',
            confidenceBreakdown: [
                { label: 'Schema validity', value: '--' },
                { label: 'PHI/PII risk', value: '--' },
                { label: 'Data completeness', value: '--' },
                { label: 'Format consistency', value: '--' },
                { label: 'Overall', value: '--', tone: 'amber' }
            ],
            issues: [
                { text: 'Awaiting deep-content PII signature pass', tone: 'amber' }
            ],
            actionsTaken: [
                { label: 'Dataset', value: 'SCANNING', tone: 'amber' },
                { label: 'Provider notified', value: 'No', tone: 'neutral' },
                { label: 'Escrow', value: 'Monitoring only', tone: 'neutral' }
            ]
        }
    },
    {
        id: 'log-3',
        timestamp: '2026-03-22 14:31:42',
        logType: 'Dataset Scan',
        subject: 'Healthcare_Compliance_Set',
        decision: 'CLEAN',
        decisionTone: 'green',
        confidence: '91/100',
        reason: 'No sensitive fields detected, schema valid',
        action: 'REVIEW',
        actionTone: 'blue',
        report: {
            subjectTitle: 'Healthcare_Compliance_Set',
            datasetId: 'ds_health_2026_11c4',
            vendorId: 'VND-1156',
            scanStarted: '14:31:39',
            scanCompleted: '14:31:42',
            aiModel: 'RDT-AI-v2.4.1',
            confidenceBreakdown: [
                { label: 'Schema validity', value: '96/100' },
                { label: 'PHI/PII risk', value: '94/100' },
                { label: 'Data completeness', value: '88/100' },
                { label: 'Format consistency', value: '90/100' },
                { label: 'Overall', value: '91/100', tone: 'green' }
            ],
            issues: [
                { text: 'No material issues detected', tone: 'amber' }
            ],
            actionsTaken: [
                { label: 'Dataset', value: 'CLEAN', tone: 'green' },
                { label: 'Provider notified', value: 'No', tone: 'neutral' },
                { label: 'Escrow', value: 'Released', tone: 'neutral' }
            ]
        }
    },
    {
        id: 'log-4',
        timestamp: '2026-03-22 14:31:29',
        logType: 'Access Decision',
        subject: 'part_anon_042 -> Financial Tick Data',
        decision: 'APPROVED',
        decisionTone: 'green',
        confidence: '88/100',
        reason: 'Risk score within threshold, purpose declared',
        action: 'VIEW',
        actionTone: 'blue',
        report: {
            subjectTitle: 'part_anon_042 -> Financial Tick Data',
            datasetId: 'acc_fin_tick_0042',
            vendorId: 'Participant Access Engine',
            scanStarted: '14:31:27',
            scanCompleted: '14:31:29',
            aiModel: 'RDT-AI-v2.4.1',
            confidenceBreakdown: [
                { label: 'Schema validity', value: 'N/A' },
                { label: 'PHI/PII risk', value: '87/100' },
                { label: 'Data completeness', value: 'N/A' },
                { label: 'Format consistency', value: 'N/A' },
                { label: 'Overall', value: '88/100', tone: 'green' }
            ],
            issues: [
                { text: 'No access risk anomalies detected', tone: 'amber' }
            ],
            actionsTaken: [
                { label: 'Dataset', value: 'APPROVED', tone: 'green' },
                { label: 'Provider notified', value: 'Not required', tone: 'neutral' },
                { label: 'Escrow', value: 'Normal release path', tone: 'neutral' }
            ]
        }
    },
    {
        id: 'log-5',
        timestamp: '2026-03-22 14:31:15',
        logType: 'Anomaly Detection',
        subject: 'part_anon_089',
        decision: 'FLAGGED',
        decisionTone: 'red',
        confidence: '--',
        reason: 'Bulk access attempt: 847 records in 2 minutes',
        action: 'BLOCK',
        actionTone: 'red',
        report: {
            subjectTitle: 'part_anon_089',
            datasetId: 'anomaly_access_089',
            vendorId: 'Behavioral Risk Engine',
            scanStarted: '14:31:13',
            scanCompleted: '14:31:15',
            aiModel: 'RDT-AI-v2.4.1',
            confidenceBreakdown: [
                { label: 'Schema validity', value: 'N/A' },
                { label: 'PHI/PII risk', value: '--' },
                { label: 'Data completeness', value: 'N/A' },
                { label: 'Format consistency', value: 'N/A' },
                { label: 'Overall', value: '--', tone: 'red' }
            ],
            issues: [
                { text: 'Burst pattern exceeded anomaly threshold', tone: 'red' }
            ],
            actionsTaken: [
                { label: 'Dataset', value: 'FLAGGED', tone: 'red' },
                { label: 'Provider notified', value: 'Yes', tone: 'neutral' },
                { label: 'Escrow', value: 'Access frozen', tone: 'neutral' }
            ]
        }
    },
    {
        id: 'log-6',
        timestamp: '2026-03-22 14:30:58',
        logType: 'Dataset Scan',
        subject: 'IoT_Sensor_Raw_Data',
        decision: 'SCANNING',
        decisionTone: 'amber',
        confidence: '--',
        reason: 'Initial scan queued',
        action: 'REVIEW',
        actionTone: 'amber',
        report: {
            subjectTitle: 'IoT_Sensor_Raw_Data',
            datasetId: 'ds_iot_2026_2d10',
            vendorId: 'VND-5501',
            scanStarted: '14:30:57',
            scanCompleted: 'Queued',
            aiModel: 'RDT-AI-v2.4.1',
            confidenceBreakdown: [
                { label: 'Schema validity', value: '--' },
                { label: 'PHI/PII risk', value: '--' },
                { label: 'Data completeness', value: '--' },
                { label: 'Format consistency', value: '--' },
                { label: 'Overall', value: '--', tone: 'amber' }
            ],
            issues: [
                { text: 'Awaiting queue execution slot', tone: 'amber' }
            ],
            actionsTaken: [
                { label: 'Dataset', value: 'SCANNING', tone: 'amber' },
                { label: 'Provider notified', value: 'No', tone: 'neutral' },
                { label: 'Escrow', value: 'Pending scan result', tone: 'neutral' }
            ]
        }
    },
    {
        id: 'log-7',
        timestamp: '2026-03-22 14:30:44',
        logType: 'Access Decision',
        subject: 'part_anon_031 -> Clinical Outcomes Delta',
        decision: 'BLOCKED',
        decisionTone: 'red',
        confidence: '34/100',
        reason: 'High risk score, PHI access without clearance',
        action: 'VIEW',
        actionTone: 'blue',
        report: {
            subjectTitle: 'part_anon_031 -> Clinical Outcomes Delta',
            datasetId: 'acc_clinical_031',
            vendorId: 'Participant Access Engine',
            scanStarted: '14:30:42',
            scanCompleted: '14:30:44',
            aiModel: 'RDT-AI-v2.4.1',
            confidenceBreakdown: [
                { label: 'Schema validity', value: 'N/A' },
                { label: 'PHI/PII risk', value: '34/100' },
                { label: 'Data completeness', value: 'N/A' },
                { label: 'Format consistency', value: 'N/A' },
                { label: 'Overall', value: '34/100', tone: 'red' }
            ],
            issues: [
                { text: 'Participant lacks PHI clearance for requested dataset', tone: 'red' }
            ],
            actionsTaken: [
                { label: 'Dataset', value: 'BLOCKED', tone: 'red' },
                { label: 'Provider notified', value: 'No', tone: 'neutral' },
                { label: 'Escrow', value: 'No release', tone: 'neutral' }
            ]
        }
    },
    {
        id: 'log-8',
        timestamp: '2026-03-22 14:30:21',
        logType: 'Quarantine Event',
        subject: 'Social_Media_Metrics_DB',
        decision: 'QUARANTINED',
        decisionTone: 'red',
        confidence: '18/100',
        reason: 'PII density exceeds threshold, provider notified',
        action: 'BLOCK',
        actionTone: 'red',
        report: {
            subjectTitle: 'Social_Media_Metrics_DB',
            datasetId: 'ds_social_2026_77ef',
            vendorId: 'VND-2293',
            scanStarted: '14:30:17',
            scanCompleted: '14:30:21',
            aiModel: 'RDT-AI-v2.4.1',
            confidenceBreakdown: [
                { label: 'Schema validity', value: '52/100' },
                { label: 'PHI/PII risk', value: '18/100' },
                { label: 'Data completeness', value: '63/100' },
                { label: 'Format consistency', value: '70/100' },
                { label: 'Overall', value: '18/100', tone: 'red' }
            ],
            issues: [
                { text: 'PII density exceeded acceptable threshold', tone: 'red' }
            ],
            actionsTaken: [
                { label: 'Dataset', value: 'QUARANTINED', tone: 'red' },
                { label: 'Provider notified', value: 'Yes', tone: 'neutral' },
                { label: 'Escrow', value: 'Held pending review', tone: 'neutral' }
            ]
        }
    }
]

const criticalAlerts: CriticalAlert[] = [
    { tone: 'critical', message: 'PHI detected in Dataset #492' },
    { tone: 'critical', message: 'Failed API token attempt from 192.168.1.44' },
    { tone: 'warning', message: 'Unusual bulk access pattern detected' },
    { tone: 'warning', message: 'Token expiration surge: 847 tokens/hour' },
    { tone: 'info', message: 'Scheduled audit backup completed' }
]

const toneBadgeClasses: Record<DecisionTone, string> = {
    red: 'bg-red-500/10 text-red-300 border-red-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
}

const actionButtonClasses: Record<ActionTone, string> = {
    red: 'border-red-500/40 text-red-300 hover:bg-red-500/15',
    amber: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/15',
    blue: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15'
}

const issueClasses: Record<IssueTone, string> = {
    red: 'border-red-500/30 bg-red-500/10 text-red-200',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200'
}

const actionTakenToneClasses: Record<ActionTakenItem['tone'], string> = {
    red: 'text-red-300',
    amber: 'text-amber-300',
    green: 'text-emerald-300',
    neutral: 'text-slate-300'
}

const alertClasses: Record<CriticalAlert['tone'], string> = {
    critical: 'border-red-500/40 bg-red-500/10 text-red-200',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
}

function getConfidenceTone(value: string): DecisionTone | null {
    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed)) return null
    if (parsed >= 80) return 'green'
    if (parsed >= 50) return 'amber'
    return 'red'
}

function filterLogs(rows: LogRow[], tab: TabKey) {
    if (tab === 'all') return rows
    if (tab === 'dataset') return rows.filter(row => row.logType === 'Dataset Scan')
    if (tab === 'access') return rows.filter(row => row.logType === 'Access Decision')
    if (tab === 'anomaly') return rows.filter(row => row.logType === 'Anomaly Detection')
    return rows.filter(row => row.logType === 'Quarantine Event')
}

export default function AIInterrogationLogsPage() {
    const { isAuthenticated } = useAuth()
    const [activeTab, setActiveTab] = useState<TabKey>('all')
    const [selectedLogId, setSelectedLogId] = useState(logRows[0].id)

    const visibleRows = useMemo(() => filterLogs(logRows, activeTab), [activeTab])
    const selectedLog = useMemo(() => logRows.find(row => row.id === selectedLogId) ?? logRows[0], [selectedLogId])

    const onTabClick = (tab: TabKey) => {
        const nextRows = filterLogs(logRows, tab)
        setActiveTab(tab)
        if (nextRows.length > 0) {
            setSelectedLogId(nextRows[0].id)
        }
    }

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    return (
        <AdminLayout title="AI INTERROGATION LOGS" subtitle="REAL-TIME DECISION INTELLIGENCE">
            <div className="space-y-6">
                <section className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">AI Interrogation Logs</h1>
                    <p className="text-sm text-slate-400 max-w-4xl">
                        Real-time AI decision trail - dataset scanning, access decisions, anomaly detection, and quarantine events
                    </p>
                </section>

                <section className="rounded-xl border border-emerald-500/35 bg-gradient-to-r from-emerald-500/12 via-emerald-500/10 to-emerald-500/5 p-4 shadow-[0_12px_30px_rgba(16,185,129,0.12)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-100">AI Engine Online - Continuous scanning active</p>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-emerald-100/80">
                                    <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 font-medium uppercase tracking-wider text-emerald-100">
                                        Green
                                    </span>
                                    <span>Model version: RDT-AI-v2.4.1</span>
                                    <span>Last scan: 47 seconds ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryStats.map(stat => (
                        <article key={stat.label} className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl shadow-black/25">
                            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-100">{stat.value}</p>
                        </article>
                    ))}
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/55 p-2 backdrop-blur-xl">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => onTabClick(tab.key)}
                                className={`px-3.5 py-2 text-[11px] font-medium uppercase tracking-wider rounded-lg border transition-all ${
                                    activeTab === tab.key
                                        ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                        : 'border-slate-700/70 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                    <article className="xl:col-span-8 rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/30">
                        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between gap-3">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-200">Live Interrogation Feed</h2>
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px]">
                                <thead className="bg-slate-950/45">
                                    <tr className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                        <th className="px-4 py-3 text-left">Timestamp</th>
                                        <th className="px-4 py-3 text-left">Log Type</th>
                                        <th className="px-4 py-3 text-left">Dataset/Participant</th>
                                        <th className="px-4 py-3 text-left">AI Decision</th>
                                        <th className="px-4 py-3 text-left">Confidence</th>
                                        <th className="px-4 py-3 text-left">Reason</th>
                                        <th className="px-4 py-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 font-mono text-[11px] text-slate-300">
                                    {visibleRows.map(row => {
                                        const confidenceTone = getConfidenceTone(row.confidence)
                                        return (
                                            <tr
                                                key={row.id}
                                                onClick={() => setSelectedLogId(row.id)}
                                                className={`cursor-pointer transition-colors ${
                                                    selectedLogId === row.id ? 'bg-slate-800/45' : 'hover:bg-slate-800/25'
                                                }`}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-400">{row.timestamp}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.logType}</td>
                                                <td className="px-4 py-3">{row.subject}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold tracking-wider ${toneBadgeClasses[row.decisionTone]}`}>
                                                        {row.decision}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-3 whitespace-nowrap ${confidenceTone ? (confidenceTone === 'green' ? 'text-emerald-300' : confidenceTone === 'amber' ? 'text-amber-300' : 'text-red-300') : 'text-slate-500'}`}>
                                                    {row.confidence}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300/90 leading-relaxed">{row.reason}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <button className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wider transition-colors ${actionButtonClasses[row.actionTone]}`}>
                                                        {row.action}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <aside className="xl:col-span-4 rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
                        <div className="space-y-1">
                            <h3 className="text-[12px] uppercase tracking-[0.12em] text-slate-300 font-semibold">AI Decision Report</h3>
                            <p className="text-sm text-slate-100 font-medium">{selectedLog.report.subjectTitle}</p>
                        </div>

                        <div className="mt-4 space-y-2 text-[11px] font-mono text-slate-300">
                            <div className="flex justify-between gap-3"><span className="text-slate-500">Dataset ID:</span><span>{selectedLog.report.datasetId}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-slate-500">Vendor ID:</span><span>{selectedLog.report.vendorId}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-slate-500">Scan started:</span><span>{selectedLog.report.scanStarted}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-slate-500">Scan completed:</span><span>{selectedLog.report.scanCompleted}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-slate-500">AI model:</span><span>{selectedLog.report.aiModel}</span></div>
                        </div>

                        <div className="mt-5">
                            <h4 className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Confidence breakdown</h4>
                            <div className="mt-2 space-y-1.5 text-[11px] font-mono">
                                {selectedLog.report.confidenceBreakdown.map(item => (
                                    <div key={item.label} className="flex justify-between gap-3 rounded-md border border-slate-800/80 bg-slate-950/40 px-2.5 py-1.5">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className={item.tone ? (item.tone === 'green' ? 'text-emerald-300' : item.tone === 'amber' ? 'text-amber-300' : 'text-red-300') : 'text-slate-200'}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5">
                            <h4 className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Issues detected ({selectedLog.report.issues.length} items)</h4>
                            <div className="mt-2 space-y-2 text-[11px] font-mono">
                                {selectedLog.report.issues.map((issue, index) => (
                                    <div key={`${issue.text}-${index}`} className={`rounded-md border px-2.5 py-2 leading-relaxed ${issueClasses[issue.tone]}`}>
                                        {issue.text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5">
                            <h4 className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Action taken</h4>
                            <div className="mt-2 space-y-1.5 text-[11px] font-mono">
                                {selectedLog.report.actionsTaken.map(item => (
                                    <div key={item.label} className="flex justify-between gap-3 rounded-md border border-slate-800/80 bg-slate-950/40 px-2.5 py-1.5">
                                        <span className="text-slate-400">{item.label}:</span>
                                        <span className={actionTakenToneClasses[item.tone]}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-2">
                            <button className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/15 transition-colors">
                                Override & Approve
                            </button>
                            <button className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-200 hover:bg-red-500/15 transition-colors">
                                Confirm Quarantine
                            </button>
                            <button className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/15 transition-colors">
                                Request Manual Review
                            </button>
                        </div>
                    </aside>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-200">Critical Alerts</h3>
                    <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                        {criticalAlerts.map((alert, index) => (
                            <div key={`${alert.message}-${index}`} className={`rounded-md border px-3 py-2 text-[11px] font-medium ${alertClasses[alert.tone]}`}>
                                <span className="font-mono">{alert.message}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AdminLayout>
    )
}
