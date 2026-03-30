import React from 'react'

type StatusTone = 'active' | 'restricted' | 'warn'

const roleTemplates = [
    {
        title: 'Healthcare Workspace',
        items: [
            'PHI access: Restricted',
            'Dataset scope: Healthcare only',
            'Export policy: Aggregated only',
            'Audit level: Full'
        ],
        badge: { label: 'Healthcare control profile', tone: 'active' as StatusTone },
        cta: 'Apply Template'
    },
    {
        title: 'Financial Services',
        items: [
            'Market data access: Approved',
            'Dataset scope: Finance + Economics',
            'Export policy: Encrypted export only',
            'Audit level: Full'
        ],
        badge: { label: 'Finance control profile', tone: 'active' as StatusTone },
        cta: 'Apply Template'
    },
    {
        title: 'Government / Public Sector',
        items: [
            'Classified data: Restricted',
            'Dataset scope: Public + Licensed',
            'Export policy: No raw export',
            'Audit level: Enhanced'
        ],
        badge: { label: 'Public-sector control profile', tone: 'warn' as StatusTone },
        cta: 'Apply Template'
    }
]

const activeRoles = [
    { role: 'Data Analyst', participants: 34, scope: 'All approved', permissions: 'Read only', status: 'Active', tone: 'active' as StatusTone },
    { role: 'Research Lead', participants: 12, scope: 'Healthcare + Climate', permissions: 'Read + Export', status: 'Active', tone: 'active' as StatusTone },
    { role: 'Pipeline Engineer', participants: 8, scope: 'All', permissions: 'Read + API', status: 'Active', tone: 'active' as StatusTone },
    { role: 'Compliance Officer', participants: 3, scope: 'All', permissions: 'Read + Audit', status: 'Active', tone: 'active' as StatusTone },
    { role: 'Guest Reviewer', participants: 5, scope: 'Public only', permissions: 'Read only', status: 'Restricted', tone: 'warn' as StatusTone }
]

const jitRequests = [
    {
        participant: 'part_anon_089',
        dataset: 'Clinical Outcomes Delta',
        requested: '2h ago',
        duration: '4 hours'
    },
    {
        participant: 'part_anon_031',
        dataset: 'Financial Tick Data',
        requested: '45min ago',
        duration: '2 hours'
    }
]

const toneClasses: Record<StatusTone, string> = {
    active: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    restricted: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
    warn: 'text-amber-300 bg-amber-500/10 border-amber-500/30'
}

const toneDot: Record<StatusTone, string> = {
    active: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    restricted: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    warn: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
}

export default function RBACConsolePage() {
    return (
        <div className="relative min-h-screen bg-slate-900 text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(251,191,36,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Security & Compliance
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Access Control Console</h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Fine-grained role and attribute-based access control for regulated industry workloads.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                        Live policy enforcement · Updated <span className="font-semibold">March 2026</span>
                    </div>
                </header>

                <section className="mt-8">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-5 py-4 shadow-[0_12px_40px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                            <div>
                                <p className="text-sm font-semibold text-white">RBAC/ABAC policies active — All roles enforced</p>
                                <p className="text-xs text-emerald-100/80">Last policy update: March 2026</p>
                            </div>
                        </div>
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                            Healthy
                        </span>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="text-xl font-semibold text-white">Role Templates</h2>
                        <span className="text-xs text-slate-500">Pre-approved guardrails for regulated workloads</span>
                    </div>
                    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {roleTemplates.map(template => (
                            <article
                                key={template.title}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.28)]"
                            >
                                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%)]" />
                                <div className="relative flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Template</p>
                                        <h3 className="mt-2 text-xl font-semibold text-white">{template.title}</h3>
                                    </div>
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClasses[template.badge.tone]}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full ${toneDot[template.badge.tone]}`} />
                                        {template.badge.label}
                                    </span>
                                </div>
                                <ul className="relative mt-4 space-y-2 text-sm text-slate-200">
                                    {template.items.map(item => (
                                        <li key={item} className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className="relative mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.22)] transition hover:bg-cyan-500/20">
                                    {template.cta}
                                </button>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Active Roles</h2>
                                <p className="text-sm text-slate-400">Participants mapped to enforced scopes</p>
                            </div>
                            <span className="text-xs text-slate-500">Realtime sync</span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-xl border border-white/5">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Role</th>
                                        <th className="px-4 py-3 text-right">Participants</th>
                                        <th className="px-4 py-3 text-left">Dataset Scope</th>
                                        <th className="px-4 py-3 text-left">Permissions</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {activeRoles.map(role => (
                                        <tr key={role.role} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-left font-medium text-white">{role.role}</td>
                                            <td className="px-4 py-3 text-right text-slate-200">{role.participants}</td>
                                            <td className="px-4 py-3 text-left text-slate-200">{role.scope}</td>
                                            <td className="px-4 py-3 text-left text-slate-200">{role.permissions}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClasses[role.tone]}`}>
                                                    <span className={`h-2 w-2 rounded-full ${toneDot[role.tone]}`} />
                                                    {role.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-[#050b16] p-6 shadow-[0_15px_50px_rgba(30,64,175,0.25)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Effective Permissions Preview</h2>
                                <p className="text-sm text-slate-400">Participant-level entitlements</p>
                            </div>
                            <div className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Zero trust lens
                            </div>
                        </div>
                        <div className="mt-5 space-y-3">
                            <label className="block text-xs uppercase tracking-[0.12em] text-slate-500">Select participant to preview</label>
                            <select className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none">
                                <option>part_anon_042</option>
                                <option>part_anon_089</option>
                                <option>part_anon_031</option>
                            </select>
                            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                                <div className="flex items-center justify-between"><span>Role</span><span className="font-semibold text-white">Research Lead</span></div>
                                <div className="flex items-center justify-between"><span>Datasets accessible</span><span className="font-semibold text-white">18</span></div>
                                <div className="flex items-center justify-between"><span>Can export</span><span className="font-semibold text-emerald-200">Yes (aggregated)</span></div>
                                <div className="flex items-center justify-between"><span>Can use API</span><span className="font-semibold text-rose-200">No</span></div>
                                <div className="flex items-center justify-between"><span>Audit logged</span><span className="font-semibold text-emerald-200">Yes</span></div>
                                <div className="flex items-center justify-between"><span>PHI access</span><span className="font-semibold text-rose-200">Denied</span></div>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="text-xl font-semibold text-white">Just-in-time Access</h2>
                        <span className="text-xs text-slate-500">Pending time-bound elevation</span>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {jitRequests.map(request => (
                            <article
                                key={request.participant}
                                className="rounded-2xl border border-white/10 bg-[#0a1424] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Participant</p>
                                        <h3 className="mt-1 text-lg font-semibold text-white">{request.participant}</h3>
                                        <p className="mt-2 text-sm text-slate-300">Dataset: {request.dataset}</p>
                                        <p className="text-xs text-slate-500">Requested: {request.requested} · Duration: {request.duration}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 shadow-[0_8px_24px_rgba(16,185,129,0.24)] hover:bg-emerald-500/20">
                                            Approve
                                        </button>
                                        <button className="rounded-lg border border-rose-400/60 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 shadow-[0_8px_24px_rgba(244,63,94,0.24)] hover:bg-rose-500/20">
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

