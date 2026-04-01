import React from 'react'
import { Link } from 'react-router-dom'
import TrustBadges from '../components/TrustBadges'
import CloudProviderLogo, { getCloudProviderVisuals, type CloudProvider } from '../components/CloudProviderLogo'

const certs = [
    {
        title: 'SOC 2 Type II',
        description: 'Inherited via enterprise cloud infrastructure',
        validity: 'Valid: Continuously maintained by cloud providers',
        badge: 'Inherited',
        badgeType: 'inherited'
    },
    {
        title: 'ISO 27001',
        description: 'Inherited via enterprise cloud infrastructure',
        validity: 'Valid: Continuously maintained by cloud providers',
        badge: 'Inherited',
        badgeType: 'inherited'
    },
    {
        title: 'HIPAA Eligible',
        description: 'Enterprise cloud infrastructure is HIPAA eligible. Redoubt applies HIPAA controls at application layer.',
        badge: 'Inherited',
        badgeType: 'inherited'
    }
]

const templates = [
    { title: 'BAA Template (Business Associate Agreement)', action: 'Download Template' },
    { title: 'Data Processing Agreement (DPA)', action: 'Download Template' },
    { title: 'Participant Terms of Use', action: 'Download Template' }
]

const cloudResponsibilities = [
    {
        title: 'Cloud Platform',
        description: 'Infrastructure security, platform resilience, storage and networking controls, and cloud-service baselines remain with the selected provider under its shared-responsibility model.',
        items: [
            'Physical infrastructure security',
            'Network protection',
            'Hardware failure prevention',
            'SOC 2 Type II certified regions',
            'ISO 27001 certified services',
            'HIPAA eligible infrastructure'
        ]
    },
    {
        title: 'Redoubt Governance',
        description: 'Access flow, policy enforcement, protected evaluation orchestration, audit visibility, approval checkpoints, and review-state logic are handled at the application layer.',
        items: [
            'Buyer-seller trust matching',
            'Dataset scanning & validation',
            'Access control & audit trail',
            'Consent & legal basis tracking',
            'Escrow transaction management',
            'Zero raw data storage policy'
        ]
    }
]

const cloudModels = [
    {
        title: 'AWS' as CloudProvider,
        description: 'Shared-responsibility baseline for infrastructure security, resilience, cloud controls, and reference compliance artifacts.',
    },
    {
        title: 'Azure' as CloudProvider,
        description: 'Shared-responsibility model for regional deployment governance, identity controls, and enterprise cloud operations.',
    },
    {
        title: 'Google Cloud' as CloudProvider,
        description: 'Shared-responsibility approach for controlled analytics environments, platform operations, and underlying security posture.',
    },
    {
        title: 'OCI' as CloudProvider,
        description: 'Shared security model suited to residency-sensitive deployment patterns, enterprise isolation, and regional control requirements.',
    }
]

const certColors = [
    { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', icon: 'text-orange-400', glow: 'shadow-orange-500/20' },
    { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', icon: 'text-blue-400', glow: 'shadow-blue-500/20' },
    { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', icon: 'text-purple-400', glow: 'shadow-purple-500/20' },
]

export default function ComplianceLockerPage() {
    return (
        <div className="relative min-h-screen bg-[#010915] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-8 py-16 lg:px-12">
                
                <header className="mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Compliance Evidence Locker
                    </div>
                    <h1 className="mt-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
                        Compliance Evidence Locker
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-400">
                        Certified artifacts, signed policies, and audit-ready documentation for regulated industry access
                    </p>
                </header>

                <TrustBadges />

                <section className="mt-16">
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-400/10 px-8 py-8 shadow-[0_0_60px_rgba(16,185,129,0.15)] backdrop-blur-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.2),transparent_40%)]" />
                        <div className="relative flex items-center justify-between gap-6 flex-wrap">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xl font-semibold text-white">Compliance via Shared Responsibility</p>
                                    <p className="mt-1 text-sm text-slate-300">Redoubt's infrastructure is built on enterprise cloud providers — inheriting SOC 2 Type II, ISO 27001, HIPAA, and GDPR compliance by design.</p>
                                </div>
                            </div>
                            <div className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-5 py-2.5 text-sm font-semibold text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                Inherited Compliance Active
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-20">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white">Cloud Models in Scope</h2>
                        <p className="mt-3 text-base text-slate-400 max-w-2xl">
                            Redoubt supports deployment across major cloud platforms under shared-responsibility models.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {cloudModels.map((model) => {
                            const visuals = getCloudProviderVisuals(model.title)

                            return (
                                <article
                                    key={model.title}
                                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                                >
                                    <div
                                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                        style={{
                                            background: `radial-gradient(circle at 50% 0%, ${visuals.glow} 0%, transparent 52%)`,
                                        }}
                                    />
                                    <div
                                        className="pointer-events-none absolute -right-8 top-0 h-20 w-20 rounded-full blur-3xl"
                                        style={{
                                            background: `radial-gradient(circle, ${visuals.glow} 0%, transparent 72%)`,
                                        }}
                                    />
                                    <div className="relative">
                                        <div
                                            className="mb-4 flex h-12 w-14 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(2,8,23,0.16)]"
                                            style={{
                                                background: visuals.badgeBackground,
                                                borderColor: visuals.badgeBorder,
                                            }}
                                        >
                                            <CloudProviderLogo provider={model.title} />
                                        </div>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Shared model
                                        </div>
                                        <h3 className="mt-2 text-xl font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                            {model.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-400">{model.description}</p>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                    <p className="mt-6 text-sm leading-6 text-slate-500 italic">
                        Infrastructure reports and cloud-control references should be read through the selected provider's shared-responsibility model, not as standalone Redoubt certifications.
                    </p>
                </section>

                <section className="mt-20">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white">Shared Responsibility Model</h2>
                        <p className="mt-3 text-base text-slate-400 max-w-2xl">
                            Clear boundaries between cloud provider infrastructure security and Redoubt's application-layer governance.
                        </p>
                    </div>
                    <div className="grid gap-8 lg:grid-cols-2">
                        {cloudResponsibilities.map((layer, idx) => (
                        <article key={layer.title} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 transition-all duration-300 hover:border-white/20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
                                        <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">{layer.title}</h3>
                                </div>
                                <ul className="space-y-4">
                                    {layer.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-4 text-base text-slate-300">
                                            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 rounded-xl border border-white/5 bg-white/5 p-4">
                                    <p className="text-sm text-slate-400 leading-relaxed">{layer.description}</p>
                                </div>
                            </div>
                        </article>
                        ))}
                    </div>
                </section>

                <section className="mt-20">
                    <article className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 to-amber-400/5 px-8 py-8 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(245,158,11,0.15),transparent_40%)]" />
                        <div className="relative flex items-start gap-6">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-amber-200">Think of it like a bank vault</h3>
                                <p className="mt-3 text-base text-slate-300 leading-relaxed max-w-3xl">
                                    Cloud providers build and secure the vault. Redoubt manages who gets access and what they can do inside. We never hold the contents.
                                </p>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-20">
                    <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Inherited Certifications</h2>
                            <p className="mt-2 text-base text-slate-400">Evidence-backed, exportable documentation available upon request</p>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {certs.map((cert, idx) => (
                            <article
                                key={cert.title}
                                className={`group relative overflow-hidden rounded-3xl border ${certColors[idx].border} bg-gradient-to-br ${certColors[idx].bg} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]`}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.08),transparent_40%)]" />
                                <div className="relative">
                                    <div className="flex items-start justify-between gap-4 mb-5">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Certification</p>
                                            <h3 className="mt-3 text-2xl font-bold text-white">{cert.title}</h3>
                                        </div>
                                        <span className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${
                                            cert.badgeType === 'active' 
                                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                                                : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                        }`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${cert.badgeType === 'active' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                                            {cert.badge}
                                        </span>
                                    </div>
                                    <p className="text-base text-slate-300 leading-relaxed">{cert.description}</p>
                                    {cert.validity && (
                                        <p className="mt-3 text-sm text-slate-500">{cert.validity}</p>
                                    )}
                                    <div className="mt-6 flex justify-end">
                                        <button className="group/btn rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/10 flex items-center gap-2">
                                            View Details
                                            <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-20">
                    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 md:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_50%)]" />
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5">
                                    <svg className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Our Legal Position</h3>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#030810] p-6 md:p-8">
                                <p className="text-base leading-relaxed text-slate-300">
                                    Redoubt does not store raw dataset content on proprietary infrastructure. All data is encrypted at rest (AES-256) and in transit (TLS 1.3) within cloud provider storage. In the event of infrastructure-level security incidents, liability rests with the infrastructure provider per the Cloud Shared Responsibility Model. Redoubt's architectural responsibility is limited to access control, audit integrity, and trust validation.
                                </p>
                            </div>
                            <p className="mt-5 text-sm text-slate-500">
                                Reference: Cloud Provider Shared Responsibility Model
                            </p>
                        </div>
                    </article>
                </section>

                <section className="mt-20 grid gap-8 lg:grid-cols-[2fr_1fr]">
                    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.05),transparent_50%)]" />
                        <div className="relative">
                            <div className="flex items-center justify-between gap-3 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Legal Templates</h2>
                                    <p className="mt-1 text-sm text-slate-500">Pre-reviewed, regulator-friendly</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {templates.map(template => (
                                    <div key={template.title} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition-all hover:border-white/20 hover:bg-white/10">
                                        <div>
                                            <p className="text-base font-semibold text-white">{template.title}</p>
                                            <p className="mt-1 text-xs text-slate-500">Version-controlled, tracked distribution</p>
                                        </div>
                                        <button className="rounded-xl border border-cyan-400/50 text-cyan-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-cyan-500/20">
                                            {template.action}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>

                    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.05),transparent_50%)]" />
                        <div className="relative">
                            <div className="flex items-center justify-between gap-3 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Audit Calendar</h2>
                                    <p className="mt-1 text-sm text-slate-500">Scheduled compliance checkpoints</p>
                                </div>
                                <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-sm text-slate-400">Next scheduled audit</p>
                                    <p className="text-base font-semibold text-white">June 2026</p>
                                </div>
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-sm text-slate-400">Last penetration test</p>
                                    <p className="text-base font-semibold text-white">March 2026</p>
                                </div>
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-sm text-slate-400">Next pentest</p>
                                    <p className="text-base font-semibold text-white">September 2026</p>
                                </div>
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-sm text-slate-400">Compliance cadence</p>
                                    <p className="text-base font-semibold text-white">Quarterly</p>
                                </div>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-20">
                    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-cyan-400/5 p-8 md:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.1),transparent_50%)]" />
                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-white">Want a deeper dive?</h3>
                                <p className="mt-2 text-base text-slate-300">
                                    Explore our Trust Center for complete details on controls, evidence, and review models.
                                </p>
                            </div>
                            <Link
                                to="/trust-center"
                                className="shrink-0 rounded-2xl bg-cyan-400 px-8 py-4 text-base font-semibold text-slate-950 transition-all hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                            >
                                Visit Trust Center
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
