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

const tabs: { id: TabId; label: string }[] = [
    { id: 'security', label: 'Security' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'operations', label: 'Operations' }
]

const complianceSummaryCards = [
    { label: 'Active Controls', value: '24', detail: 'Security & privacy controls active' },
    { label: 'Pending Audits', value: '3', detail: 'Audits scheduled for next quarter' },
    { label: 'Resolved Violations', value: '18', detail: 'Violations resolved this month' },
    { label: 'Policy Adherence', value: '96%', detail: 'Overall compliance score' }
]

const documentsExpiringSoon = [
    { id: 'doc-1', name: 'SOC 2 Type II Report', expiry: '2026-04-15', status: 'Expiring' },
    { id: 'doc-2', name: 'Data Processing Agreement - CloudProvider', expiry: '2026-04-22', status: 'Expiring' },
    { id: 'doc-3', name: 'HIPAA BAA - Healthcare Corp', expiry: '2026-04-30', status: 'Expiring' }
]

const recentViolations = [
    { id: 'viol-1', description: 'Unencrypted data transfer detected', resolvedDate: '2026-03-20', status: 'Resolved' },
    { id: 'viol-2', description: 'Unauthorized access attempt - internal system', resolvedDate: '2026-03-18', status: 'Resolved' }
]

const auditSchedule = {
    nextAudit: '2026-05-15',
    lastAudit: '2026-02-10',
    auditor: 'CyberSec Global'
}

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
                    <div className="grid grid-cols-12 gap-5">
                        {complianceSummaryCards.map((card) => (
                            <article key={card.label} className="col-span-3 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                                <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">{card.value}</p>
                                <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{card.detail}</p>
                            </article>
                        ))}
                    </div>

                    <div className="grid grid-cols-12 gap-5">
                        <section className="col-span-7 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">Documents Expiring Soon</h2>
                            <div className="overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/35">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-950/70 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Document</th>
                                            <th className="px-4 py-3 text-left">Expiry Date</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {documentsExpiringSoon.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-800/30">
                                                <td className="px-4 py-3 text-[11px] text-slate-200">{doc.name}</td>
                                                <td className="px-4 py-3 text-[10px] text-slate-400">{doc.expiry}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-200">
                                                        {doc.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="col-span-5 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">Recent Violations</h2>
                            <div className="space-y-3">
                                {recentViolations.map((violation) => (
                                    <div key={violation.id} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] text-slate-200">{violation.description}</p>
                                                <p className="mt-2 text-[9px] text-slate-500">Resolved: {violation.resolvedDate}</p>
                                            </div>
                                            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-200">
                                                {violation.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="grid grid-cols-12 gap-5">
                        <section className="col-span-4 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">Audit Schedule</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                                    <p className="text-[10px] text-slate-500">Next Audit</p>
                                    <p className="text-[11px] font-semibold text-slate-200">{auditSchedule.nextAudit}</p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                                    <p className="text-[10px] text-slate-500">Last Audit</p>
                                    <p className="text-[11px] font-semibold text-slate-200">{auditSchedule.lastAudit}</p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                                    <p className="text-[10px] text-slate-500">Auditor</p>
                                    <p className="text-[11px] font-semibold text-slate-200">{auditSchedule.auditor}</p>
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
