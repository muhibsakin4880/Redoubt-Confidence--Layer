import { Link, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import SmartAlertsPanel from '../components/admin/SmartAlertsPanel'
import QuickActionsBar from '../components/admin/QuickActionsBar'
import AutomatedWorkflows from '../components/admin/AutomatedWorkflows'
import AuditActivityPanel from '../components/admin/AuditActivityPanel'
import AICopilot from '../components/admin/AICopilot'
import RecentActivityFeed from '../components/admin/RecentActivityFeed'
import ActiveTokensPanel from '../components/admin/ActiveTokensPanel'
import { MetricCardSkeleton, AlertItemSkeleton, WorkflowRowSkeleton, ActivityRowSkeleton, CardSkeleton, StatSkeleton } from '../components/admin/SkeletonLoader'
import { useAuth } from '../contexts/AuthContext'
import { smartAlerts, recentAuditEvents } from '../components/admin/mockData'
import {
    adminVisibilityBoundaries,
    approvalBlockers,
    deploymentSurfaces,
    evidenceEvents,
    evidencePacks,
    incidentEvidenceRecords
} from '../data/adminEvidenceData'
import {
    buildDealLifecycleSummary,
    buildRightsRiskSummary,
    loadSharedDealLifecycleRecords
} from '../domain/dealLifecycle'

type SummaryTone = 'cyan' | 'amber' | 'emerald' | 'red'

type SectionHeaderProps = {
    title: string
    detail: string
    actionLabel?: string
    actionTo?: string
}

const severityOrder = {
    High: 0,
    Medium: 1,
    Low: 2
} as const

const toneClasses: Record<SummaryTone, string> = {
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    red: 'border-red-500/20 bg-red-500/10 text-red-300'
}

const badgeClasses = {
    Critical: 'border-red-500/25 bg-red-500/10 text-red-300',
    High: 'border-red-500/25 bg-red-500/10 text-red-300',
    Medium: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    Low: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    Ready: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    'In Review': 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300',
    Blocked: 'border-red-500/25 bg-red-500/10 text-red-300',
    Reviewed: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    Review: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300',
    Exception: 'border-red-500/25 bg-red-500/10 text-red-300',
    Contained: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    Investigating: 'border-amber-500/25 bg-amber-500/10 text-amber-300'
} as const

const summaryIcons = {
    protectedEvaluations:
        'M12 11c0-1.657 1.343-3 3-3h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2h2c1.657 0 3 1.343 3 3zm0 0V7a4 4 0 118 0v4',
    approvalsPending:
        'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    policyExceptions:
        'M12 9v2m0 4h.01m-7.938 4h15.876c1.313 0 2.233-1.267 1.843-2.521L13.843 4.52c-.39-1.254-2.296-1.254-2.686 0L2.219 16.479C1.829 17.733 2.749 19 4.062 19z',
    evidenceReady:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
}

const panelClass = 'overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/65 shadow-2xl shadow-black/20'
const subpanelClass = 'rounded-lg border border-slate-800/70 bg-slate-950/45'
const actionLinkClass =
    'rounded-md border border-slate-700/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-300 transition-all duration-200 hover:bg-slate-800/60'

const sortBlockers = [...approvalBlockers].sort((left, right) => {
    const severityDelta = severityOrder[left.severity] - severityOrder[right.severity]
    if (severityDelta !== 0) return severityDelta
    return new Date(left.deadline).getTime() - new Date(right.deadline).getTime()
})

const prioritizedEvidencePacks = [...evidencePacks].sort((left, right) => {
    const priority = { Blocked: 0, 'In Review': 1, Ready: 2 } as const
    return priority[left.status] - priority[right.status]
})

const prioritizedIncidents = [...incidentEvidenceRecords].sort((left, right) => {
    const priority = { Critical: 0, High: 1, Medium: 2 } as const
    return priority[left.severity] - priority[right.severity]
})

function SectionHeader({ title, detail, actionLabel, actionTo }: SectionHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/60 px-5 py-4">
            <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">{title}</h2>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{detail}</p>
            </div>
            {actionLabel && actionTo ? (
                <Link to={actionTo} className={actionLinkClass}>
                    {actionLabel}
                </Link>
            ) : null}
        </div>
    )
}

export default function AdminDashboardPage() {
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdated(new Date())
        }, 60000)
        return () => clearInterval(interval)
    }, [])

    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const dealRecords = loadSharedDealLifecycleRecords()
    const lifecycleSummary = buildDealLifecycleSummary(dealRecords)
    const rightsRiskSummary = buildRightsRiskSummary(dealRecords)
    const protectedEvaluationCount =
        lifecycleSummary.evaluationLiveCount + lifecycleSummary.workspacesProvisioningCount
    const approvalsPendingCount = approvalBlockers.length
    const investigatingIncidentCount = incidentEvidenceRecords.filter((record) => record.status === 'Investigating').length
    const policyExceptionCount =
        rightsRiskSummary.highRiskCount + rightsRiskSummary.restrictedCount + investigatingIncidentCount
    const evidenceReadyCount = evidencePacks.filter((pack) => pack.status === 'Ready').length

    const highPriorityCount = sortBlockers.filter((blocker) => blocker.severity === 'High').length
    const mediumPriorityCount = sortBlockers.filter((blocker) => blocker.severity === 'Medium').length
    const lowPriorityCount = sortBlockers.filter((blocker) => blocker.severity === 'Low').length

    const readyPackCount = evidencePacks.filter((pack) => pack.status === 'Ready').length
    const inReviewPackCount = evidencePacks.filter((pack) => pack.status === 'In Review').length
    const blockedPackCount = evidencePacks.filter((pack) => pack.status === 'Blocked').length

    const reviewedEventCount = evidenceEvents.filter((event) => event.status === 'Reviewed').length
    const reviewEventCount = evidenceEvents.filter((event) => event.status === 'Review').length
    const exceptionEventCount = evidenceEvents.filter((event) => event.status === 'Exception').length

    const nearSignoffSurfaceCount = deploymentSurfaces.filter((surface) =>
        surface.evaluationStatus.toLowerCase().includes('ready')
    ).length
    const blockedSurfaceCount = deploymentSurfaces.filter((surface) =>
        surface.evidenceStatus.toLowerCase().includes('blocked')
    ).length

    const summaryCards = [
        {
            label: 'Protected evaluations',
            value: protectedEvaluationCount,
            detail: `${lifecycleSummary.evaluationLiveCount} active · ${lifecycleSummary.workspacesProvisioningCount} provisioning`,
            tone: 'cyan' as SummaryTone,
            icon: summaryIcons.protectedEvaluations
        },
        {
            label: 'Approvals pending',
            value: approvalsPendingCount,
            detail: `${highPriorityCount} high-priority decisions`,
            tone: 'amber' as SummaryTone,
            icon: summaryIcons.approvalsPending
        },
        {
            label: 'Policy exceptions',
            value: policyExceptionCount,
            detail: `${rightsRiskSummary.highRiskCount + rightsRiskSummary.restrictedCount} rights signals · ${investigatingIncidentCount} active`,
            tone: 'red' as SummaryTone,
            icon: summaryIcons.policyExceptions
        },
        {
            label: 'Evidence packs ready',
            value: evidenceReadyCount,
            detail: `${inReviewPackCount} in review · ${blockedPackCount} blocked`,
            tone: 'emerald' as SummaryTone,
            icon: summaryIcons.evidenceReady
        }
    ]

    const postureCards = [
        {
            title: 'Review Posture',
            value: `${approvalsPendingCount} open`,
            detail: `${highPriorityCount} high · ${mediumPriorityCount} medium · ${lowPriorityCount} low`
        },
        {
            title: 'Visibility Posture',
            value: `${adminVisibilityBoundaries.length} boundaries`,
            detail: 'Metadata-first admin visibility with protected evaluation surfaces kept outside default view.'
        },
        {
            title: 'Deployment Posture',
            value: `${nearSignoffSurfaceCount} near approval`,
            detail: `${blockedSurfaceCount} environments remain held by evidence or residency conditions`
        }
    ]

    return (
        <AdminLayout title="CONTROL DASHBOARD" subtitle="GOVERNANCE, EVIDENCE & EXCEPTIONS" lastUpdated={formatTime(lastUpdated)}>
            <div className={`space-y-10 transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                <section>
                    <div className="mb-6 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-800/60" />
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">KEY METRICS</span>
                        <div className="h-px flex-1 bg-slate-800/60" />
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-6">
                            {summaryCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="relative overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/65 p-6 shadow-2xl shadow-black/20 transition-all duration-300 hover:border-slate-700/60 hover:scale-[1.01]"
                                >
                                <div className="absolute right-0 top-0 w-24 h-24 opacity-5" style={{ background: `radial-gradient(circle at top right, ${card.tone === 'cyan' ? '#06b6d4' : card.tone === 'amber' ? '#f59e0b' : card.tone === 'emerald' ? '#10b981' : '#ef4444'}, transparent 70%)` }} />
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                            {card.label}
                                        </p>
                                        <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">
                                            {card.value}
                                        </p>
                                    </div>
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${toneClasses[card.tone]}`}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-4 text-[10px] leading-relaxed text-slate-400">{card.detail}</p>
                            </div>
                        ))}
                    </div>
                    )}
                </section>

                {loading ? <CardSkeleton /> : <SmartAlertsPanel />}

                <QuickActionsBar />

                <AutomatedWorkflows />

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8">
                        <RecentActivityFeed />
                    </div>
                    <div className="col-span-4">
                        <ActiveTokensPanel />
                    </div>
                </div>

                <AuditActivityPanel />

                <section>
                    <div className="mb-6 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-800/60" />
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">SYSTEM POSTURE</span>
                        <div className="h-px flex-1 bg-slate-800/60" />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        {postureCards.map((card) => (
                            <div key={card.title} className={`${subpanelClass} px-5 py-5`}>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">{card.title}</p>
                                <p className="mt-2 text-xl font-semibold text-slate-100">{card.value}</p>
                                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{card.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="mb-6 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-800/60" />
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">GOVERNANCE & REVIEW</span>
                        <div className="h-px flex-1 bg-slate-800/60" />
                    </div>
                    <div className="grid grid-cols-12 gap-6">
                        <div className={`col-span-7 ${panelClass}`}>
                            <SectionHeader
                                title="Approval Blockers"
                                detail="The main queue stays focused on approval blockers, ownership, and the next control decision."
                                actionLabel="Open review queue"
                                actionTo="/admin/onboarding-queue"
                            />
                            <div className="grid grid-cols-3 gap-4 border-b border-slate-800/50 px-6 py-5">
                                <div className={`${subpanelClass} px-4 py-4`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">High priority</p>
                                    </div>
                                    <p className="mt-2 text-2xl font-semibold text-slate-100">{highPriorityCount}</p>
                                    <p className="mt-1 text-[10px] text-slate-500">Immediate decisions</p>
                                </div>
                                <div className={`${subpanelClass} px-4 py-3`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Blocked packs</p>
                                    </div>
                                    <p className="mt-2 text-2xl font-semibold text-slate-100">{blockedPackCount}</p>
                                    <p className="mt-1 text-[10px] text-slate-500">Evidence gaps</p>
                                </div>
                                <div className={`${subpanelClass} px-4 py-3`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Active incidents</p>
                                    </div>
                                    <p className="mt-2 text-2xl font-semibold text-slate-100">{investigatingIncidentCount}</p>
                                    <p className="mt-1 text-[10px] text-slate-500">In investigation</p>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800/35">
                                {sortBlockers.map((blocker) => (
                                    <div key={blocker.id} className="group px-6 py-5 transition-colors hover:bg-slate-900/30">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-[11px] font-semibold text-slate-200">{blocker.organization}</p>
                                                    <span className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
                                                        {blocker.reviewId}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{blocker.blocker}</p>
                                                <div className="mt-2 flex flex-wrap gap-4 text-[9px] uppercase tracking-[0.12em] text-slate-600">
                                                    <span>Owner {blocker.owner}</span>
                                                    <span>Due {blocker.deadline}</span>
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${badgeClasses[blocker.severity]}`}
                                            >
                                                {blocker.severity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`col-span-5 ${panelClass}`}>
                            <SectionHeader
                                title="Review Priorities"
                                detail="What should move next in the review pipeline."
                                actionLabel="Security matrix"
                                actionTo="/admin/security-compliance"
                            />
                            <div className="space-y-4 px-6 py-5">
                                {prioritizedEvidencePacks.slice(0, 3).map((pack) => (
                                    <article key={pack.id} className={`${subpanelClass} p-5 transition-all duration-200 hover:border-slate-700/60`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">{pack.reviewId}</p>
                                                <h3 className="mt-1 text-[12px] font-semibold text-slate-100">{pack.organization}</h3>
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${badgeClasses[pack.status]}`}
                                            >
                                                {pack.status}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{pack.blocker ?? pack.scope}</p>
                                        <p className="mt-2 text-[9px] text-slate-600">{pack.owner}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-6 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-800/60" />
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">OPERATIONS & EVIDENCE</span>
                        <div className="h-px flex-1 bg-slate-800/60" />
                    </div>
                    <div className="grid grid-cols-12 gap-6">
                        <div className={`col-span-7 ${panelClass}`}>
                            <SectionHeader
                                title="Environment & Residency"
                                detail="Region posture and evaluation boundaries without exposing raw content."
                                actionLabel="Operations"
                                actionTo="/admin/operations"
                            />
                            <div className="space-y-4 px-6 py-5">
                                {deploymentSurfaces.map((surface) => (
                                    <article key={surface.id} className={`${subpanelClass} p-4 transition-all duration-200 hover:border-slate-700/60`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-[11px] font-semibold text-slate-200">{surface.organization}</p>
                                                    <span className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
                                                        {surface.cloud}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-[10px] text-slate-300">{surface.deploymentMode}</p>
                                                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                                                    {surface.residencyPosture}
                                                </p>
                                                <div className="mt-3 grid grid-cols-2 gap-3 text-[10px]">
                                                    <div>
                                                        <p className="uppercase tracking-[0.12em] text-slate-600">Evaluation</p>
                                                        <p className="mt-1 text-slate-300">{surface.evaluationStatus}</p>
                                                    </div>
                                                    <div>
                                                        <p className="uppercase tracking-[0.12em] text-slate-600">Evidence</p>
                                                        <p className="mt-1 text-slate-300">{surface.evidenceStatus}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-44 rounded-lg border border-slate-800/60 bg-slate-900/60 p-3">
                                                <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Current blocker</p>
                                                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{surface.blocker}</p>
                                                <p className="mt-3 text-[9px] text-slate-600">{surface.owner}</p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className={`col-span-5 ${panelClass}`}>
                            <SectionHeader
                                title="Audit Activity"
                                detail="Verification, review, and exception activity summary."
                                actionLabel="Audit trail"
                                actionTo="/admin/audit-trail"
                            />
                            <div className="grid grid-cols-3 gap-4 border-b border-slate-800/50 px-6 py-5">
                                <div className={`${subpanelClass} px-4 py-4`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Reviewed</p>
                                    </div>
                                    <p className="mt-2 text-xl font-semibold text-slate-100">{reviewedEventCount}</p>
                                </div>
                                <div className={`${subpanelClass} px-4 py-4`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Review</p>
                                    </div>
                                    <p className="mt-2 text-xl font-semibold text-slate-100">{reviewEventCount}</p>
                                </div>
                                <div className={`${subpanelClass} px-4 py-4`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Exception</p>
                                    </div>
                                    <p className="mt-2 text-xl font-semibold text-slate-100">{exceptionEventCount}</p>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800/35">
                                {evidenceEvents.slice(0, 4).map((event) => (
                                    <div key={event.id} className="group px-6 py-5 transition-colors hover:bg-slate-900/30">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-[11px] font-semibold text-slate-200">{event.organization}</p>
                                                    <span className="text-[9px] uppercase tracking-[0.12em] text-slate-600">{event.reviewId}</span>
                                                </div>
                                                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{event.event}</p>
                                                <p className="mt-2 text-[9px] text-slate-600">
                                                    {event.surface} · {event.visibility}
                                                </p>
                                            </div>
                                            <div className="flex min-w-[7rem] flex-col items-end gap-2">
                                                <span className="text-[9px] font-mono text-slate-600">{event.evidencePackId}</span>
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${badgeClasses[event.status]}`}
                                                >
                                                    {event.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-6 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-800/60" />
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">PACK READINESS & INCIDENTS</span>
                        <div className="h-px flex-1 bg-slate-800/60" />
                    </div>
                    <div className="grid grid-cols-12 gap-6">
                        <div className={`col-span-7 ${panelClass}`}>
                            <SectionHeader
                                title="Evidence Pack Readiness"
                                detail="Review-ready packets before teams move into audit and compliance surfaces."
                                actionLabel="Open controls"
                                actionTo="/admin/security-compliance"
                            />
                            <div className="grid grid-cols-3 gap-4 border-b border-slate-800/50 px-6 py-5">
                                <div className={`${subpanelClass} px-4 py-4`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Ready</p>
                                    </div>
                                    <p className="mt-2 text-xl font-semibold text-slate-100">{readyPackCount}</p>
                                </div>
                                <div className={`${subpanelClass} px-3 py-3`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">In review</p>
                                    </div>
                                    <p className="mt-2 text-xl font-semibold text-slate-100">{inReviewPackCount}</p>
                                </div>
                                <div className={`${subpanelClass} px-3 py-3`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Blocked</p>
                                    </div>
                                    <p className="mt-2 text-xl font-semibold text-slate-100">{blockedPackCount}</p>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800/35">
                                {prioritizedEvidencePacks.map((pack) => (
                                    <div key={pack.id} className="group px-6 py-5 transition-colors hover:bg-slate-900/30">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-[11px] font-semibold text-slate-200">{pack.name}</p>
                                                    <span className="text-[9px] uppercase tracking-[0.12em] text-slate-600">{pack.reviewId}</span>
                                                </div>
                                                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{pack.scope}</p>
                                                <p className="mt-2 text-[9px] text-slate-600">
                                                    {pack.organization} · {pack.owner} · {pack.updatedAt}
                                                </p>
                                                {pack.blocker ? (
                                                    <p className="mt-2 text-[9px] leading-relaxed text-amber-300/90">Blocker: {pack.blocker}</p>
                                                ) : null}
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${badgeClasses[pack.status]}`}
                                            >
                                                {pack.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`col-span-5 ${panelClass}`}>
                            <SectionHeader
                                title="Incident Readiness"
                                detail="Review-safe operational summaries rather than raw investigations."
                                actionLabel="Incident response"
                                actionTo="/admin/incident-response"
                            />
                            <div className="space-y-4 px-6 py-5">
                                {prioritizedIncidents.map((incident) => (
                                    <article key={incident.id} className={`${subpanelClass} p-5 transition-all duration-200 hover:border-slate-700/60`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-semibold text-slate-200">{incident.title}</p>
                                                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{incident.environment}</p>
                                                <p className="mt-2 text-[9px] leading-relaxed text-slate-500">
                                                    {incident.residencyImpact}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-4 text-[9px] uppercase tracking-[0.12em] text-slate-600">
                                                    <span>{incident.reviewId}</span>
                                                    <span>{incident.evidencePackId}</span>
                                                    <span>SLA {incident.slaWindow}</span>
                                                </div>
                                                <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                                                    Next: {incident.nextAction}
                                                </p>
                                            </div>
                                            <div className="flex min-w-[7rem] flex-col items-end gap-2">
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${badgeClasses[incident.status]}`}
                                                >
                                                    {incident.status}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${badgeClasses[incident.severity]}`}
                                                >
                                                    {incident.severity}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <AICopilot />
        </AdminLayout>
    )
}
