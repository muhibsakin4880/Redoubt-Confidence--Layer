import { Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import {
    getDocumentChecklistCounts,
    getDecisionStatusLabel,
    getPacketStatusLabel,
    normalizeReviewCopy,
    organizationReviewActivity,
    organizationReviewRecords,
    type GovernanceDecisionStatus,
    type OrganizationReviewStatus
} from '../data/adminPilotOpsData'
import { useAuth } from '../contexts/AuthContext'

const cardToneClasses = {
    amber: {
        surface: 'bg-amber-500/10 border-amber-500/20',
        text: 'text-amber-400/80',
        bar: 'from-amber-500/60 to-amber-500/30'
    },
    cyan: {
        surface: 'bg-cyan-500/10 border-cyan-500/20',
        text: 'text-cyan-400/80',
        bar: 'from-cyan-500/60 to-cyan-500/30'
    },
    red: {
        surface: 'bg-red-500/10 border-red-500/20',
        text: 'text-red-400/80',
        bar: 'from-red-500/60 to-red-500/30'
    },
    emerald: {
        surface: 'bg-emerald-500/10 border-emerald-500/20',
        text: 'text-emerald-400/80',
        bar: 'from-emerald-500/60 to-emerald-500/30'
    }
} as const

const statusClasses: Record<OrganizationReviewStatus, string> = {
    Pending: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    Reviewing: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    Escalated: 'border-red-500/20 bg-red-500/10 text-red-300'
}

const decisionClasses: Record<GovernanceDecisionStatus, string> = {
    'Awaiting first pass': 'border-slate-700/80 bg-slate-800/60 text-slate-300',
    'Secondary review': 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    'Ready for approval': 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    'Approved for evaluation': 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
}

const packetStatusClasses: Record<string, string> = {
    'Packet in preparation': 'text-slate-400',
    'Packet submitted': 'text-cyan-300',
    'Packet under review': 'text-amber-300',
    'Evaluation scope aligned': 'text-emerald-300',
    'Approved for evaluation': 'text-cyan-300'
}

export default function OnboardingQueuePage() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    const allRecords = organizationReviewRecords
    
    const filteredRecords = searchQuery.trim()
        ? allRecords.filter(record => {
            const query = searchQuery.toLowerCase()
            return (
                record.organizationName.toLowerCase().includes(query) ||
                record.id.toLowerCase().includes(query) ||
                record.industry.toLowerCase().includes(query) ||
                record.jurisdiction.toLowerCase().includes(query) ||
                record.useCase.toLowerCase().includes(query) ||
                record.deploymentPreference.toLowerCase().includes(query)
            )
        })
        : allRecords
    
    const records = filteredRecords
    const pendingCount = records.filter((record) => record.reviewStatus === 'Pending').length
    const reviewingCount = records.filter((record) => record.reviewStatus === 'Reviewing').length
    const escalatedCount = records.filter((record) => record.reviewStatus === 'Escalated').length
    const readyPacketCount = records.filter((record) => getDocumentChecklistCounts(record).missing === 0).length
    const activeReviewPacketCount = records.filter((record) =>
        ['Packet submitted', 'Packet under review', 'Evaluation scope aligned'].includes(getPacketStatusLabel(record.loiStatus))
    ).length
    const submittedPacketCount = records.filter((record) => getPacketStatusLabel(record.loiStatus) === 'Packet submitted').length
    const alignedScopeCount = records.filter((record) => getPacketStatusLabel(record.loiStatus) === 'Evaluation scope aligned').length

    const summaryCards = [
        {
            label: 'Organizations Awaiting Review',
            value: records.length.toString(),
            detailLabel: 'QUEUE MIX',
            detailValue: `${pendingCount} pending · ${reviewingCount} in review`,
            progress: Math.round((records.length / 10) * 100),
            tone: 'amber' as const,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            label: 'Active Review Packets',
            value: activeReviewPacketCount.toString(),
            detailLabel: 'PACKET STATUS',
            detailValue: `${submittedPacketCount} submitted · ${alignedScopeCount} scope aligned`,
            progress: Math.round((activeReviewPacketCount / records.length) * 100),
            tone: 'cyan' as const,
            icon: 'M4 7h16M4 12h10m-10 5h16'
        },
        {
            label: 'Secondary Review Required',
            value: escalatedCount.toString(),
            detailLabel: 'ESCALATION',
            detailValue: `${escalatedCount} packet(s) require policy or legal approval`,
            progress: Math.round((escalatedCount / records.length) * 100),
            tone: 'red' as const,
            icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        },
        {
            label: 'Review Packets Ready',
            value: readyPacketCount.toString(),
            detailLabel: 'DOCUMENT STATE',
            detailValue: `${readyPacketCount} packets have no missing checklist items`,
            progress: Math.round((readyPacketCount / records.length) * 100),
            tone: 'emerald' as const,
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        }
    ]

    const getActivityStyle = (type: string) => {
        switch (type) {
            case 'approved':
                return 'border-l-[3px] border-emerald-500/50 bg-slate-950/40'
            case 'rejected':
                return 'border-l-[3px] border-red-500/50 bg-slate-950/40'
            case 'review':
                return 'border-l-[3px] border-amber-500/50 bg-slate-950/40'
            default:
                return 'border-l-[3px] border-cyan-500/40 bg-slate-950/40'
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'approved':
                return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400/80', path: 'M5 13l4 4L19 7' }
            case 'rejected':
                return { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400/80', path: 'M6 18L18 6M6 6l12 12' }
            case 'review':
                return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400/80', path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' }
            default:
                return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400/80', path: 'M12 4v16m8-8H4' }
        }
    }

    return (
        <AdminLayout title="ORGANIZATION REVIEW QUEUE" subtitle="INTAKE, CONTROL READINESS & APPROVAL STAGING">
            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-5">
                    {summaryCards.map((card) => {
                        const tone = cardToneClasses[card.tone]
                        return (
                            <div key={card.label} className="col-span-3 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${tone.surface}`}>
                                            <svg className={`h-4 w-4 ${tone.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</span>
                                    </div>
                                </div>
                                <span className="text-4xl font-semibold tracking-tight text-slate-100">{card.value}</span>
                                <div className="mt-4">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-[9px] font-medium tracking-wider text-slate-600">{card.detailLabel}</span>
                                        <span className="text-[9px] font-medium text-slate-500">{card.progress}%</span>
                                    </div>
                                    <div className="h-1 overflow-hidden rounded-full bg-slate-800/60">
                                        <div className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`} style={{ width: `${card.progress}%` }} />
                                    </div>
                                    <p className="mt-2 text-[9px] tracking-wide text-slate-500">{card.detailValue}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-8 overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Organization Review Queue</h2>
                                <div className="flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2 py-0.5">
                                    <span className="text-[9px] font-semibold tracking-wider text-slate-500">{records.length} ACTIVE</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-medium tracking-wider text-slate-600">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                GOVERNANCE REVIEW WORKSPACE
                            </div>
                        </div>
                        
                        <div className="border-b border-slate-800/40 px-5 py-3">
                            <div className="relative max-w-md">
                                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search organization, ID, industry, jurisdiction..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-slate-700/60 bg-slate-950/50 py-2 pl-10 pr-10 text-[11px] text-slate-300 placeholder-slate-600 outline-none transition-all duration-200 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-950/40">
                                    <tr className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                        <th className="px-5 py-3 text-left font-medium">Submitted</th>
                                        <th className="px-5 py-3 text-left font-medium">Review ID</th>
                                        <th className="px-5 py-3 text-left font-medium">Organization Profile</th>
                                        <th className="px-5 py-3 text-left font-medium">Operating Context</th>
                                        <th className="px-5 py-3 text-left font-medium">Deployment & Residency</th>
                                        <th className="px-5 py-3 text-left font-medium">Review Readiness</th>
                                        <th className="px-5 py-3 text-left font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <p className="text-[11px] text-slate-500">No organizations match your search</p>
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="text-[10px] text-cyan-400 hover:text-cyan-300"
                                                    >
                                                        Clear search
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record) => {
                                            const checklistCounts = getDocumentChecklistCounts(record)
                                            return (
                                                <tr key={record.id} className="align-top transition-colors duration-150 hover:bg-slate-800/20">
                                                    <td className="px-5 py-4 font-mono text-[10px] text-slate-500">{record.submittedAt}</td>
                                                    <td className="px-5 py-4 font-mono text-[10px] text-cyan-400/80">{record.id}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-1.5">
                                                            <p className="text-[11px] font-medium text-slate-200">{record.organizationName}</p>
                                                            <p className="text-[10px] text-slate-500">{record.reviewScope}</p>
                                                            <p className="text-[10px] text-slate-600">{record.contactRole} · {record.owner}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] leading-relaxed text-slate-300">{normalizeReviewCopy(record.useCase)}</p>
                                                            <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">{record.industry} · {record.jurisdiction}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] leading-relaxed text-slate-300">{record.deploymentPreference}</p>
                                                            <p className="text-[10px] leading-relaxed text-slate-500">{record.residencyRequirement}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusClasses[record.reviewStatus]}`}>
                                                                    {record.reviewStatus}
                                                                </span>
                                                                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${decisionClasses[getDecisionStatusLabel(record.decisionStatus)]}`}>
                                                                    {getDecisionStatusLabel(record.decisionStatus)}
                                                                </span>
                                                            </div>
                                                            <p className={`text-[10px] font-medium ${packetStatusClasses[getPacketStatusLabel(record.loiStatus)]}`}>{getPacketStatusLabel(record.loiStatus)}</p>
                                                            <p className="text-[9px] text-slate-500">
                                                                {checklistCounts.ready} ready · {checklistCounts.review} in review · {checklistCounts.missing} missing
                                                            </p>
                                                            <p className="text-[9px] text-slate-600">Deadline: {record.reviewDeadlineLabel}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-2">
                                                            <button
                                                                onClick={() => navigate(`/admin/application-review/${record.id}`)}
                                                                className="rounded-md border border-cyan-500/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400/80 transition-all duration-200 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                                                            >
                                                                Open Review
                                                            </button>
                                                            <p className="max-w-[11rem] text-[9px] leading-relaxed text-slate-500">{normalizeReviewCopy(record.nextAction)}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="col-span-4 overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="border-b border-slate-800/60 px-5 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Review Activity</h2>
                                <span className="text-[9px] font-medium tracking-wider text-slate-600">LAST 30 MIN</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/30">
                            {organizationReviewActivity.map((activity, idx) => {
                                const iconStyle = getActivityIcon(activity.type)
                                return (
                                    <div key={`${activity.message}-${idx}`} className={`px-5 py-3.5 ${getActivityStyle(activity.type)}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${iconStyle.bg} ${iconStyle.border}`}>
                                                <svg className={`h-3 w-3 ${iconStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d={iconStyle.path} />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="block text-[11px] leading-relaxed text-slate-400">{normalizeReviewCopy(activity.message)}</span>
                                                <span className="mt-1 block text-[9px] text-slate-600">{activity.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
