import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'

type SettingsTabKey = 'autoApproval' | 'aiEngine' | 'escrowRules' | 'platformLimits' | 'notifications' | 'accessControl'

type RuleTone = 'green' | 'amber' | 'red'

type AutoApprovalRule = {
    score: string
    action: string
    description: string
    tone: RuleTone
}

const settingsTabs: Array<{ key: SettingsTabKey; label: string; icon: string }> = [
    {
        key: 'autoApproval',
        label: 'Auto-Approval Rules',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
    {
        key: 'aiEngine',
        label: 'AI Engine',
        icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
        key: 'escrowRules',
        label: 'Escrow Rules',
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    },
    {
        key: 'platformLimits',
        label: 'Platform Limits',
        icon: 'M3 6h18M7 12h10M10 18h4'
    },
    {
        key: 'notifications',
        label: 'Notifications',
        icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    },
    {
        key: 'accessControl',
        label: 'Admin Access Control',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
    }
]

const autoApprovalRules: AutoApprovalRule[] = [
    {
        score: '90-100',
        action: 'Auto Approve',
        description: 'Dataset approved and published automatically',
        tone: 'green'
    },
    {
        score: '70-89',
        action: 'Auto Approve with Log',
        description: 'Approved but flagged in audit trail for review',
        tone: 'green'
    },
    {
        score: '50-69',
        action: 'Flag for Manual Review',
        description: 'Admin notification sent, hold for review',
        tone: 'amber'
    },
    {
        score: '30-49',
        action: 'Auto Quarantine',
        description: 'Dataset quarantined, provider notified automatically',
        tone: 'red'
    },
    {
        score: '0-29',
        action: 'Auto Block & Notify',
        description: 'Dataset blocked, provider and compliance team notified immediately',
        tone: 'red'
    }
]

const ruleBadgeClasses: Record<RuleTone, string> = {
    green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    red: 'border-red-500/40 bg-red-500/10 text-red-200'
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
                {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {children}
        </section>
    )
}

export default function AdminSettingsPage() {
    const { isAuthenticated } = useAuth()
    const [activeTab, setActiveTab] = useState<SettingsTabKey>('autoApproval')

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    const renderTabContent = () => {
        if (activeTab === 'autoApproval') {
            return (
                <SectionCard
                    title="AI Decision Automation"
                    subtitle="Set confidence thresholds for automatic decisions"
                >
                    <div className="space-y-3">
                        {autoApprovalRules.map(rule => (
                            <div key={`${rule.score}-${rule.action}`} className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <span className="inline-flex items-center rounded-md border border-slate-700/70 bg-slate-900/70 px-2.5 py-1 text-[11px] font-mono text-slate-200">
                                            {rule.score}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-100">{rule.action}</p>
                                            <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-2xl">{rule.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wider ${ruleBadgeClasses[rule.tone]}`}>
                                            ACTIVE
                                        </span>
                                        <button className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                        <p className="text-sm font-medium text-slate-200">Daily automation summary:</p>
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-200/80">Auto approved today</p>
                                <p className="mt-1 text-lg font-semibold text-emerald-200">782</p>
                            </div>
                            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200/80">Flagged for review</p>
                                <p className="mt-1 text-lg font-semibold text-amber-200">42</p>
                            </div>
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-red-200/80">Auto quarantined</p>
                                <p className="mt-1 text-lg font-semibold text-red-200">16</p>
                            </div>
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-red-200/80">Auto blocked</p>
                                <p className="mt-1 text-lg font-semibold text-red-200">7</p>
                            </div>
                        </div>
                        <button className="mt-4 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                            Save Rules
                        </button>
                    </div>
                </SectionCard>
            )
        }

        if (activeTab === 'aiEngine') {
            return (
                <SectionCard title="AI Engine Configuration">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-100">Model Version</h3>
                            <p className="text-xs text-slate-500">Current: RDT-AI-v2.4.1</p>
                            <select defaultValue="v2.4.1" className="w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70">
                                <option value="v2.4.1">v2.4.1</option>
                                <option value="v2.3.0">v2.3.0</option>
                                <option value="v2.2.0">v2.2.0</option>
                            </select>
                            <button className="rounded-md border border-cyan-500/50 bg-cyan-500/15 px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                                Update Model
                            </button>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-100">Scan Sensitivity</h3>
                            <div className="space-y-2 text-sm text-slate-300">
                                <label className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    <span>Standard (default)</span>
                                </label>
                                <label className="flex items-center gap-2 rounded-md border border-slate-700/70 bg-slate-900/60 px-2.5 py-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                                    <span>High Sensitivity</span>
                                </label>
                                <label className="flex items-center gap-2 rounded-md border border-slate-700/70 bg-slate-900/60 px-2.5 py-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                                    <span>Maximum (slower)</span>
                                </label>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Higher sensitivity catches more edge cases but increases scan time
                            </p>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-100">PHI/PII Detection</h3>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Enabled
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Sensitivity: High</p>
                                <input type="range" min={1} max={3} defaultValue={3} className="w-full accent-cyan-500" />
                                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                                    <span>Low</span>
                                    <span>Medium</span>
                                    <span>High</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-100">Auto Scan on Upload</h3>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Enabled
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                All datasets scanned immediately upon provider upload
                            </p>
                        </div>
                    </div>

                    <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                        Save AI Settings
                    </button>
                </SectionCard>
            )
        }
        if (activeTab === 'escrowRules') {
            return (
                <SectionCard title="Escrow Configuration">
                    <div className="space-y-3">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Default Escrow Window</p>
                            <select defaultValue="24" className="mt-2 w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70">
                                <option value="24">24 hours (default)</option>
                                <option value="48">48 hours</option>
                                <option value="72">72 hours</option>
                            </select>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Auto-release Condition</p>
                            <select defaultValue="expiry" className="mt-2 w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70">
                                <option value="expiry">Window expiry (default)</option>
                                <option value="buyer">Buyer confirmation only</option>
                                <option value="manual">Manual admin release only</option>
                            </select>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Dispute Escalation</p>
                            <select defaultValue="auto24" className="mt-2 w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70">
                                <option value="auto24">Auto escalate after 24h</option>
                                <option value="manual">Manual escalation only</option>
                            </select>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Escrow Fee</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="10%" className="w-32 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Applied to all transactions</span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                        Save Escrow Rules
                    </button>
                </SectionCard>
            )
        }

        if (activeTab === 'platformLimits') {
            return (
                <SectionCard title="Platform Configuration">
                    <div className="space-y-3">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Max Dataset Size</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="10 GB" className="w-48 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Per upload limit</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">API Rate Limit</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="100 requests/minute" className="w-64 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Per participant</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Max Access Window</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="72 hours" className="w-48 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Maximum escrow window allowed</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Max Active Escrows</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="5" className="w-24 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Per participant simultaneously</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Session Timeout</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="30 minutes" className="w-40 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Inactive session auto-logout</span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                        Save Platform Limits
                    </button>
                </SectionCard>
            )
        }

        if (activeTab === 'notifications') {
            return (
                <SectionCard title="Alert & Notification Settings">
                    <div className="space-y-5">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <h3 className="text-sm font-semibold text-slate-100">Alert Thresholds</h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Critical alert trigger</span>
                                    <input defaultValue="Score below 30" className="w-56 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Bulk access alert</span>
                                    <input defaultValue="500+ records/minute" className="w-56 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Failed auth alert</span>
                                    <input defaultValue="5 attempts" className="w-56 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <h3 className="text-sm font-semibold text-slate-100">Notification Recipients</h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Security Lead</span>
                                    <input defaultValue="sec_lead@redoubt.io" className="w-72 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Compliance Officer</span>
                                    <input defaultValue="compliance@redoubt.io" className="w-72 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Platform Admin</span>
                                    <input defaultValue="admin@redoubt.io" className="w-72 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                            </div>
                            <button className="mt-3 rounded-md border border-cyan-500/50 bg-transparent px-3 py-1.5 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/10 transition-colors">
                                Add Recipient
                            </button>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <h3 className="text-sm font-semibold text-slate-100">Webhook Endpoints</h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">SIEM Webhook</span>
                                    <input defaultValue="https://siem.redoubt.io/webhook" className="w-80 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Slack Alert</span>
                                    <input defaultValue="https://hooks.slack.com/..." className="w-80 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                            </div>
                            <button className="mt-3 rounded-md border border-slate-600/80 bg-transparent px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800/70 transition-colors">
                                Test Webhook
                            </button>
                        </div>
                    </div>
                    <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                        Save Notification Settings
                    </button>
                </SectionCard>
            )
        }

        return (
            <SectionCard title="Admin Roles & Permissions">
                <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-950/60">
                            <tr className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                <th className="px-3 py-2 text-left">Role</th>
                                <th className="px-3 py-2 text-left">Permissions</th>
                                <th className="px-3 py-2 text-left">Assigned To</th>
                                <th className="px-3 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70 text-[11px] text-slate-200">
                            <tr><td className="px-3 py-2 font-medium">Super Admin</td><td className="px-3 py-2">Full access</td><td className="px-3 py-2 font-mono">admin_001</td><td className="px-3 py-2"><span className="inline-flex rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">Active</span></td></tr>
                            <tr><td className="px-3 py-2 font-medium">Security Admin</td><td className="px-3 py-2">Security + Incidents only</td><td className="px-3 py-2 font-mono">admin_002</td><td className="px-3 py-2"><span className="inline-flex rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">Active</span></td></tr>
                            <tr><td className="px-3 py-2 font-medium">Compliance Admin</td><td className="px-3 py-2">Compliance + Audit only</td><td className="px-3 py-2 font-mono">admin_003</td><td className="px-3 py-2"><span className="inline-flex rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">Active</span></td></tr>
                        </tbody>
                    </table>
                </div>

                <button className="mt-4 rounded-md border border-cyan-500/50 bg-transparent px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/10 transition-colors">
                    Add Admin Role
                </button>

                <div className="mt-5 space-y-3 rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-slate-200">Admin session timeout</span>
                        <input defaultValue="15 minutes" className="w-40 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-slate-200">MFA required</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />ON</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-slate-200">IP whitelist</span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />ON</span>
                        </div>
                        <input defaultValue="10.15.22.4, 10.15.22.8" className="w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                    </div>
                </div>

                <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                    Save Access Settings
                </button>
            </SectionCard>
        )
    }

    return (
        <AdminLayout title="ADMIN SETTINGS" subtitle="SYSTEM CONFIGURATION">
            <div className="space-y-6">
                <section>
                    <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">Admin Settings</h1>
                    <p className="mt-2 text-sm text-slate-400 max-w-3xl">
                        Platform configuration, automation rules, and system preferences
                    </p>
                </section>

                <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    <aside className="lg:col-span-3 rounded-xl border border-slate-800/60 bg-slate-900/60 p-3 backdrop-blur-xl shadow-2xl shadow-black/30">
                        <div className="space-y-2">
                            {settingsTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                                        activeTab === tab.key
                                            ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                            : 'border-slate-800/70 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-700/80 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                                    </svg>
                                    <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <div className="lg:col-span-9">
                        {renderTabContent()}
                    </div>
                </section>
            </div>
        </AdminLayout>
    )
}
