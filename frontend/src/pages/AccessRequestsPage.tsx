import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
    activityDot,
    confidenceColor,
    datasetRequests,
    recentActivity,
    requestStatusLabel,
    statusStyles,
    type DatasetRequest
} from '../data/workspaceData'
import LifecycleGuidancePanel from '../components/LifecycleGuidancePanel'
import { canPerformReviewerAction } from '../domain/actionGuardrails'
import SecurityAuditTimeline from '../components/SecurityAuditTimeline'

type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk'

type RiskPanelProps = {
    selectedRequest: DatasetRequest | null
    riskScore: number
    riskLevel: RiskLevel
}

type RequestTableRowProps = {
    request: DatasetRequest
    onSelect: () => void
    riskScore: number
    isSelected: boolean
}

const riskBadgeStyles: Record<RiskLevel, string> = {
    'Low Risk': 'text-emerald-200 bg-emerald-500/10 border border-emerald-500/30',
    'Medium Risk': 'text-amber-200 bg-amber-500/10 border border-amber-500/30',
    'High Risk': 'text-rose-200 bg-rose-500/10 border border-rose-500/30'
}

const fixedRiskScores: Record<string, number> = {
    'Financial Market Tick Data': 32,
    'Global Climate Observations 2020-2024': 30,
    'Sentiment Analysis Corpus - Social Media': 65,
    'Medical Imaging Dataset - Chest X-Rays': 78,
    'Urban Traffic Flow Patterns': 40
}

function computeRiskScore(request: DatasetRequest) {
    if (fixedRiskScores[request.name] !== undefined) return fixedRiskScores[request.name]
    // fallback heuristic for any new rows
    const score = Math.min(95, Math.max(25, 100 - request.confidence + 20))
    return score
}

function computeRiskLevel(score: number): RiskLevel {
    if (score < 45) return 'Low Risk'
    if (score < 75) return 'Medium Risk'
    return 'High Risk'
}

export default function AccessRequestsPage() {
    const [selectedRequest, setSelectedRequest] = useState<DatasetRequest | null>(null)

    const requestedCount = datasetRequests.length
    const approvedCount = datasetRequests.filter(item => item.status === 'REQUEST_APPROVED').length
    const pendingCount = datasetRequests.filter(item => item.status === 'REVIEW_IN_PROGRESS').length

    const riskScore = useMemo(() => (selectedRequest ? computeRiskScore(selectedRequest) : 72), [selectedRequest])
    const riskLevel = useMemo(() => computeRiskLevel(riskScore), [riskScore])

    return (
        <div className="container mx-auto px-4 py-10 space-y-6 text-white">
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div>
                        <h1 className="text-2xl font-semibold">Access Requests</h1>
                        <p className="text-slate-400 text-sm">
                            Full request pipeline management with confidence scores and status tracking.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                            {requestedCount} requested
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                            {pendingCount} pending
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                            {approvedCount} approved
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-xs uppercase tracking-[0.08em] text-slate-400 border-b border-slate-700">
                                <tr>
                                    <th className="py-3 pr-4 text-left font-medium">Dataset</th>
                                    <th className="py-3 px-4 text-left font-medium">Confidence</th>
                                    <th className="py-3 px-4 text-left font-medium">Risk</th>
                                    <th className="py-3 px-4 text-left font-medium">Status</th>
                                    <th className="py-3 px-4 text-left font-medium">Last updated</th>
                                    <th className="py-3 pl-4 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {datasetRequests.map(request => (
                                    <RequestTableRow
                                        key={request.id}
                                        request={request}
                                        onSelect={() => setSelectedRequest(request)}
                                        riskScore={computeRiskScore(request)}
                                        isSelected={selectedRequest?.id === request.id}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <RiskPanel selectedRequest={selectedRequest} riskScore={riskScore} riskLevel={riskLevel} />
                </div>
            </section>

            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Recent request activity</h2>
                        <p className="text-slate-400 text-sm">Approvals, pending reviews, and declines.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                        {recentActivity.length} items
                    </span>
                </div>
                <div className="space-y-4">
                    {recentActivity.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="pt-1">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${activityDot[item.type]}`} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">{item.label}</div>
                                <div className="text-xs text-slate-400">{item.timestamp}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

function RequestTableRow({ request, onSelect, riskScore, isSelected }: RequestTableRowProps) {
    const riskLevel = computeRiskLevel(riskScore)

    return (
        <tr
            className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                isSelected ? 'bg-slate-800/60 border-l-2 border-cyan-400' : ''
            }`}
            onClick={onSelect}
        >
            <td className="py-4 pr-4">
                <div className="font-semibold">{request.name}</div>
                <div className="text-slate-400 text-xs">
                    {request.category} - {request.delivery}
                </div>
            </td>
            <td className="py-4 px-4">
                <div className={`text-base font-semibold ${confidenceColor(request.confidence)}`}>{request.confidence}%</div>
                <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500"
                        style={{ width: `${request.confidence}%` }}
                    />
                </div>
            </td>
            <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${riskBadgeStyles[riskLevel]}`}>
                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                    {riskLevel}
                </span>
            </td>
            <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-medium ${statusStyles[request.status]}`}>
                    {requestStatusLabel(request.status)}
                </span>
            </td>
            <td className="py-4 px-4 text-slate-300">{request.lastUpdated}</td>
            <td className="py-4 pl-4 text-right">
<Link
                     to={`/access-requests/${request.id}`}
                     className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white transition-colors transition-transform duration-100 active:scale-95"
                     onClick={e => e.stopPropagation()}
                 >
                    Request Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </td>
        </tr>
    )
}

function RiskPanel({ selectedRequest, riskScore, riskLevel }: RiskPanelProps) {
    const toneClass =
        riskLevel === 'High Risk'
            ? 'text-rose-200 bg-rose-500/10 border-rose-500/30'
            : riskLevel === 'Medium Risk'
              ? 'text-amber-200 bg-amber-500/10 border-amber-500/30'
              : 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30'

    const highlightEscalate = selectedRequest?.id === 'med-441'
    const currentReviewState = selectedRequest?.status ?? 'REVIEW_IN_PROGRESS'
    const approveGuardrail = canPerformReviewerAction('approve_with_conditions', currentReviewState)
    const escalateGuardrail = canPerformReviewerAction('escalate_dual_approval', currentReviewState)
    const rejectGuardrail = canPerformReviewerAction('reject_request', currentReviewState)

    return (
        <aside className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-xl min-h-[420px]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Risk Assessment</p>
                    <h3 className="text-xl font-semibold text-white">Access Request Risk Assessment</h3>
                </div>
                <span className="text-xs text-slate-500">Live</span>
            </div>

            {!selectedRequest ? (
                <div className="mt-6 text-sm text-slate-400">Select a request to view detailed risk scoring.</div>
            ) : (
                <>
                    <div className="mt-6 flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
                            <span className="h-2.5 w-2.5 rounded-full bg-current" />
                            {riskLevel}
                        </span>
                        <span className="text-lg font-bold text-white">{riskScore}/100</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        {selectedRequest.name} • {selectedRequest.category}
                    </p>

                    <div className="mt-4">
                        <LifecycleGuidancePanel role="admin" state={selectedRequest.status} compact title="Reviewer Workflow" />
                    </div>
                    <div className="mt-4">
                        <SecurityAuditTimeline
                            contractId={`REQ-${selectedRequest.id}`}
                            state={currentReviewState}
                            compact
                            title="Review Audit Trail"
                        />
                    </div>

                    <div className="mt-6 space-y-3">
                        {[
                            { title: 'Data Sensitivity', detail: 'High — PHI involved', impact: '+25', tone: 'alert' },
                            { title: 'Requester Trust Score', detail: '84/100', impact: '-15', tone: 'ok' },
                            { title: 'Purpose Clarity', detail: 'Research — well defined', impact: '-10', tone: 'ok' },
                            { title: 'Geographic Residency', detail: 'EU → US transfer', impact: '+20', tone: 'warn' }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-white">{item.title}</p>
                                    <p
                                        className={`text-xs ${
                                            item.tone === 'alert'
                                                ? 'text-rose-200'
                                                : item.tone === 'warn'
                                                  ? 'text-amber-200'
                                                  : 'text-emerald-200'
                                        }`}
                                    >
                                        {item.detail}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-slate-200">{item.impact}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 mb-2">Suggested conditions</p>
                        <ul className="space-y-2 text-sm text-slate-200">
                            {[
                                'Limit access to 90 days',
                                'Aggregated data only — no raw export',
                                'Require monthly usage report'
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            disabled={!approveGuardrail.allowed}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                approveGuardrail.allowed
                                    ? 'bg-blue-600 text-white shadow-[0_10px_25px_rgba(59,130,246,0.25)] hover:bg-blue-500'
                                    : 'cursor-not-allowed border border-slate-700 bg-slate-900/70 text-slate-500'
                            }`}
                        >
                            Approve with Conditions
                        </button>
                        <button
                            disabled={!escalateGuardrail.allowed}
                            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                                !escalateGuardrail.allowed
                                    ? 'cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500'
                                    : highlightEscalate
                                    ? 'border-amber-400 text-amber-100 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                                    : 'border-amber-400 text-amber-200 hover:bg-amber-500/10'
                            }`}
                        >
                            Escalate for Dual Approval
                        </button>
                        <button
                            disabled={!rejectGuardrail.allowed}
                            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                                rejectGuardrail.allowed
                                    ? 'border-rose-500 text-rose-200 hover:bg-rose-500/10'
                                    : 'cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500'
                            }`}
                        >
                            Reject
                        </button>
                    </div>
                    {!approveGuardrail.allowed && (
                        <p className="mt-2 text-[11px] text-amber-300">Approve: {approveGuardrail.reason}</p>
                    )}
                    {!escalateGuardrail.allowed && (
                        <p className="mt-1 text-[11px] text-amber-300">Escalate: {escalateGuardrail.reason}</p>
                    )}
                    {!rejectGuardrail.allowed && (
                        <p className="mt-1 text-[11px] text-amber-300">Reject: {rejectGuardrail.reason}</p>
                    )}

                    <p className="mt-3 text-xs text-slate-500">
                        High risk requests require dual approval from 2 platform admins
                    </p>
                </>
            )}
        </aside>
    )
}
