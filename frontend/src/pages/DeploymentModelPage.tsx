type DeploymentOption = {
    title: string
    badge?: string
    badgeTone?: string
    bullets: string[]
    bestFor: string
    actionLabel?: string
    actionTone?: string
}

type VisibilityRow = {
    label: string
    answer: 'YES' | 'NO'
    detail: string
}

type ResidencyRegion = {
    region: string
    location: string
    compliance: string
    status: string
    active?: boolean
}

const deploymentOptions: DeploymentOption[] = [
    {
        title: 'SaaS (Cloud-Hosted)',
        badge: 'Current Plan',
        badgeTone: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
        bullets: [
            'Hosted on AWS US-East + EU-West',
            'SOC 2 Type II certified',
            'Data encrypted at rest + in transit',
            'Breach manages infrastructure'
        ],
        bestFor: 'Best for: Fast onboarding, small-mid enterprises'
    },
    {
        title: 'Private Cloud (VPC)',
        bullets: [
            'Deploy within your own AWS/Azure/GCP account',
            'Breach has zero access to your data',
            'You manage infrastructure'
        ],
        bestFor: 'Best for: Large enterprises, strict residency requirements',
        actionLabel: 'Contact Sales',
        actionTone: 'bg-blue-600 hover:bg-blue-500 text-white'
    },
    {
        title: 'On-Premise',
        bullets: [
            'Fully self-hosted deployment',
            'Air-gapped environment supported',
            'Government and defense grade'
        ],
        bestFor: 'Best for: Government, classified workloads',
        actionLabel: 'Contact Sales',
        actionTone: 'bg-blue-600 hover:bg-blue-500 text-white'
    }
]

const visibilityRows: VisibilityRow[] = [
    {
        label: 'Dataset metadata (name, schema, confidence score)',
        answer: 'YES',
        detail: 'Required for trust scoring'
    },
    {
        label: 'Raw dataset content',
        answer: 'NO',
        detail: 'Never stored or accessed by Breach'
    },
    {
        label: 'Participant identity',
        answer: 'YES',
        detail: 'Required for verification, never shared with other participants'
    },
    {
        label: 'Access logs and audit trail',
        answer: 'YES',
        detail: 'Required for compliance, exportable by you'
    },
    {
        label: 'Payment information',
        answer: 'NO',
        detail: 'Handled by Stripe, Breach never sees card details'
    },
    {
        label: 'API keys',
        answer: 'NO',
        detail: 'Hashed and never stored in plain text'
    }
]

const residencyRegions: ResidencyRegion[] = [
    {
        region: 'United States (US-East-1)',
        location: 'AWS Virginia',
        compliance: 'HIPAA eligible',
        status: 'Current: Active',
        active: true
    },
    {
        region: 'European Union (EU-West-1)',
        location: 'AWS Ireland',
        compliance: 'GDPR compliant',
        status: 'Current: Active',
        active: true
    },
    {
        region: 'Asia Pacific (AP-Southeast-1)',
        location: 'AWS Singapore',
        compliance: 'Coming Q4 2026',
        status: 'Status: Planned',
        active: false
    }
]

export default function DeploymentModelPage() {
    return (
        <div className="relative min-h-screen bg-[#050b15] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_88%_0%,rgba(16,185,129,0.08),transparent_38%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Deployment & Data Residency
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Deployment & Data Residency
                        </h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Understand where your data lives, what Breach can see, and how your deployment is configured
                        </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                        Residency controls aligned with enterprise policies
                    </div>
                </header>

                <section className="mt-8">
                    <div className="grid gap-4 lg:grid-cols-3">
                        {deploymentOptions.map(option => (
                            <article
                                key={option.title}
                                className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] space-y-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-xl font-semibold text-white">{option.title}</h2>
                                    {option.badge && option.badgeTone && (
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${option.badgeTone}`}
                                        >
                                            <svg className="h-3 w-3 text-emerald-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.5L10 14.9 5.05 16.7l.95-5.5-4-3.9 5.53-.8L10 1.5z" />
                                            </svg>
                                            {option.badge}
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    {option.bullets.map(item => (
                                        <li key={item} className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-sm text-slate-400">{option.bestFor}</p>
                                {option.actionLabel && option.actionTone && (
                                    <button
                                        className={`w-full rounded-lg px-4 py-2 text-sm font-semibold ${option.actionTone}`}
                                    >
                                        {option.actionLabel}
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold text-white">Data Visibility Policy</h2>
                        <p className="text-sm text-slate-400">We believe in radical transparency about our access</p>
                    </div>
                    <div className="mt-6 space-y-3">
                        {visibilityRows.map(row => {
                            const isYes = row.answer === 'YES'
                            return (
                                <div
                                    key={row.label}
                                    className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-3 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="text-sm text-slate-200">{row.label}</div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                                isYes
                                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                                    : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                                            }`}
                                        >
                                            {isYes ? (
                                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path
                                                        d="M20 7L9 18l-5-5"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path
                                                        d="M6 6l12 12M18 6l-12 12"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                            {row.answer}
                                        </span>
                                        <span className="text-xs text-slate-400">{row.detail}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-2xl font-semibold text-white">Data Residency Options</h2>
                        <span className="text-xs text-slate-500">Regional hosting and policy alignment</span>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {residencyRegions.map(region => (
                            <div
                                key={region.region}
                                className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{region.region}</p>
                                        <p className="text-xs text-slate-500">{region.location}</p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                            region.active
                                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                                : 'border-slate-600/40 bg-slate-500/10 text-slate-300'
                                        }`}
                                    >
                                        {region.active ? (
                                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path
                                                    d="M20 7L9 18l-5-5"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ) : (
                                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                                        )}
                                        {region.status}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-1 text-sm text-slate-300">
                                    <div>{region.compliance}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Encryption Details</h2>
                            <p className="mt-1 text-sm text-slate-400">Built-in safeguards for every deployment model</p>
                        </div>
                        <button className="rounded-lg border border-blue-500/50 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/10">
                            View Security Documentation
                        </button>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">
                            At rest: <span className="text-slate-100 font-semibold">AES-256</span>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">
                            In transit: <span className="text-slate-100 font-semibold">TLS 1.3</span>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">
                            Key management: <span className="text-slate-100 font-semibold">AWS KMS</span>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">
                            Customer-managed keys: <span className="text-slate-100 font-semibold">Available on Private Cloud plan</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
