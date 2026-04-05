import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import {
    SystemStatusBanner,
    SecurityPostureGrid,
    SessionSecurityPanel,
    RTOPROPanel,
    ComplianceCertifications
} from '../../components/admin/SecuritySections'
import { OperationsContent } from '../../components/admin/OperationsContent'
import { useAuth } from '../../contexts/AuthContext'

type TabId = 'security' | 'compliance' | 'operations'

type ComplianceSummaryCard = {
    label: string
    value: string
    detail: string
}

type ExpiringDocument = {
    participant: string
    documentType: string
    expires: string
    status: string
}

type ComplianceViolation = {
    date: string
    participant: string
    violation: string
    actionTaken: string
    status: string
}

const tabs: { id: TabId; label: string }[] = [
    { id: 'security', label: 'Security' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'operations', label: 'Operations' }
]

const complianceSummaryCards: ComplianceSummaryCard[] = [
    {
        label: 'Compliant Participants',
        value: '89',
        detail: 'Participants with current compliance posture and no blocking control exceptions.'
    },
    {
        label: 'Expiring Documents (30 days)',
        value: '3',
        detail: 'Documents that need renewal outreach before their current compliance window closes.'
    },
    {
        label: 'Pending DPA Reviews',
        value: '5',
        detail: 'Open data-processing agreement reviews awaiting legal or privacy signoff.'
    },
    {
        label: 'Violations This Month',
        value: '1',
        detail: 'Detected policy incidents recorded in the current monthly reporting period.'
    }
]

const documentsExpiringSoon: ExpiringDocument[] = [
    {
        participant: 'part_anon_042',
        documentType: 'DPA',
        expires: 'Apr 30 2026',
        status: 'Expiring'
    },
    {
        participant: 'part_anon_017',
        documentType: 'BAA',
        expires: 'May 15 2026',
        status: 'Expiring'
    },
    {
        participant: 'part_anon_089',
        documentType: 'Terms of Use',
        expires: 'May 28 2026',
        status: 'Expiring'
    }
]

const recentViolations: ComplianceViolation[] = [
    {
        date: '2026-03-10',
        participant: 'part_anon_031',
        violation: 'Export attempt outside scope',
        actionTaken: 'Token revoked',
        status: 'Resolved'
    },
    {
        date: '2026-02-28',
        participant: 'part_anon_056',
        violation: 'PHI access without clearance',
        actionTaken: 'Access blocked',
        status: 'Resolved'
    }
]

export default function OperationsHubPage() {
    const { isAuthenticated } = useAuth()
    const [activeTab, setActiveTab] = useState<TabId>('security')

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const renderTabContent = () => {
        if (activeTab === 'security') {
            return (
                <div className="space-y-8">
                    <SystemStatusBanner />
                    <SecurityPostureGrid />
                    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                        <SessionSecurityPanel />
                        <RTOPROPanel />
                    </div>
                    <ComplianceCertifications />
                </div>
            )
        }

        if (activeTab === 'compliance') {
            return (
                <div className="space-y-6">
                    <section className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                        <h2 className="text-lg font-semibold text-slate-100">Platform Compliance Overview</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Compliance status across all participants and documents
                        </p>
                    </section>

                    <div className="grid grid-cols-12 gap-5">
                        {complianceSummaryCards.map((card) => (
                            <article key={card.label} className="col-span-3 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                                <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">{card.value}</p>
                                <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{card.detail}</p>
                            </article>
                        ))}
                    </div>

                    <section className="rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">Documents Expiring Soon</h2>
                        <div className="overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/35">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-950/70 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Participant</th>
                                        <th className="px-4 py-3 text-left">Document Type</th>
                                        <th className="px-4 py-3 text-left">Expires</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {documentsExpiringSoon.map((doc) => (
                                        <tr key={`${doc.participant}-${doc.documentType}`} className="hover:bg-slate-800/30">
                                            <td className="px-4 py-3 text-[11px] font-medium text-cyan-300">{doc.participant}</td>
                                            <td className="px-4 py-3 text-[11px] text-slate-200">{doc.documentType}</td>
                                            <td className="px-4 py-3 text-[10px] text-slate-400">{doc.expires}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-200">
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    className="rounded-md border border-amber-500/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/10"
                                                >
                                                    Send Reminder
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="grid grid-cols-12 gap-5">
                        <section className="col-span-8 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">Recent Violations</h2>
                            <div className="overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/35">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-950/70 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-left">Participant</th>
                                            <th className="px-4 py-3 text-left">Violation</th>
                                            <th className="px-4 py-3 text-left">Action Taken</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {recentViolations.map((violation) => (
                                            <tr key={`${violation.date}-${violation.participant}`} className="hover:bg-slate-800/30">
                                                <td className="px-4 py-3 text-[10px] text-slate-400">{violation.date}</td>
                                                <td className="px-4 py-3 text-[11px] font-medium text-cyan-300">{violation.participant}</td>
                                                <td className="px-4 py-3 text-[11px] text-slate-200">{violation.violation}</td>
                                                <td className="px-4 py-3 text-[10px] text-slate-300">{violation.actionTaken}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-200">
                                                        {violation.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="col-span-4 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">Audit Schedule</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                                    <p className="text-[10px] text-slate-500">Next scheduled audit</p>
                                    <p className="text-[11px] font-semibold text-slate-200">June 2026</p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                                    <p className="text-[10px] text-slate-500">Last penetration test</p>
                                    <p className="text-[11px] font-semibold text-slate-200">March 2026</p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                                    <p className="text-[10px] text-slate-500">Next pentest</p>
                                    <p className="text-[11px] font-semibold text-slate-200">September 2026</p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                                    <p className="text-[10px] text-slate-500">Compliance cadence</p>
                                    <p className="text-[11px] font-semibold text-slate-200">Quarterly</p>
                                </div>
                                <button className="w-full rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-200 hover:bg-blue-500/20 transition-colors">
                                    Schedule Audit
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            )
        }

        if (activeTab === 'operations') {
            return <OperationsContent />
        }

        return null
    }

    return (
        <AdminLayout title="Operations Hub" subtitle="Security posture, compliance oversight, and platform operations in one place">
            <div className="space-y-6">
                <div className="flex items-center gap-1 rounded-lg border border-slate-800/50 bg-slate-900/40 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 rounded-md px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-slate-800/80 text-slate-100 shadow-lg shadow-black/20'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {renderTabContent()}
            </div>
        </AdminLayout>
    )
}
