import { Link } from 'react-router-dom'

type Persona = {
    id: string
    title: string
    description: string
    selected?: boolean
}

type GuidedStep = {
    id: number
    title: string
    destination: string
    description: string
    buttonLabel: string
    to: string
    highlight?: string
}

const personas: Persona[] = [
    {
        id: 'governance',
        title: 'Data Governance Lead',
        description: 'Access approvals, consent, audit readiness, risk controls',
        selected: true
    },
    {
        id: 'ciso',
        title: 'CISO / Security Lead',
        description: 'Security posture, incident response, threat monitoring'
    },
    {
        id: 'developer',
        title: 'Data Engineer / Developer',
        description: 'API integration, pipelines, SDK setup, usage analytics'
    }
]

const guidedSteps: GuidedStep[] = [
    {
        id: 1,
        title: 'Review Dataset Trust',
        destination: 'Datasets',
        description: 'Browse verified datasets and check confidence scores before requesting access',
        buttonLabel: 'Go to Datasets →',
        to: '/datasets',
        highlight: 'Recommended first step'
    },
    {
        id: 2,
        title: 'Submit Access Request',
        destination: 'Access Requests',
        description: 'Submit a purpose-driven request. Risk score will be auto-calculated.',
        buttonLabel: 'Go to Access Requests →',
        to: '/access-requests'
    },
    {
        id: 3,
        title: 'Set Consent Terms',
        destination: 'Trust & Consent',
        description: 'Define legal basis, purpose, and expiration for each access',
        buttonLabel: 'Go to Consent →',
        to: '/consent-tracker'
    },
    {
        id: 4,
        title: 'Monitor via Escrow',
        destination: 'Escrow Center',
        description: 'Track payment, access window, and release or dispute',
        buttonLabel: 'Go to Escrow Center →',
        to: '/escrow-center'
    },
    {
        id: 5,
        title: 'Review Audit Trail',
        destination: 'Compliance Ops → Audit Trail',
        description: 'Verify all access events are logged and hash-verified',
        buttonLabel: 'Go to Audit Trail →',
        to: '/audit-trail'
    },
    {
        id: 6,
        title: 'Check Trust Score Impact',
        destination: 'Trust Profile',
        description: 'See how your activity affects your platform trust score',
        buttonLabel: 'Go to Trust Profile →',
        to: '/trust-profile'
    }
]

export default function GuidedTourPage() {
    return (
        <div className="relative min-h-screen bg-[#050b15] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_88%_0%,rgba(59,130,246,0.1),transparent_38%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Guided Tour
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Your Guided Tour</h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            A personalized walkthrough based on your role and responsibilities
                        </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                        Personalized path for trust-focused operators
                    </div>
                </header>

                <section className="mt-8">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-xl font-semibold text-white">Who are you?</h2>
                        <span className="text-xs text-slate-500">Select a persona to tailor the workflow</span>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {personas.map(persona => (
                            <article
                                key={persona.id}
                                className={`rounded-2xl border p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${
                                    persona.selected
                                        ? 'border-blue-500/50 bg-blue-500/10'
                                        : 'border-white/10 bg-[#0a1628]'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-lg font-semibold text-white">{persona.title}</h3>
                                    {persona.selected && (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-blue-200">
                                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.5L10 14.9 5.05 16.7l.95-5.5-4-3.9 5.53-.8L10 1.5z" />
                                            </svg>
                                            Selected
                                        </span>
                                    )}
                                </div>
                                <p className="mt-3 text-sm text-slate-300">{persona.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-semibold text-white">Your recommended workflow</h2>
                            <p className="text-sm text-slate-400">Follow these steps to get the most out of Redoubt</p>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {guidedSteps.map(step => (
                                <article
                                    key={step.id}
                                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_10px_25px_rgba(0,0,0,0.2)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                                Step {step.id}
                                            </div>
                                            <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                                        </div>
                                        {step.highlight && (
                                            <span className="rounded-full border border-blue-400/40 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-blue-200">
                                                {step.highlight}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-3 text-sm text-slate-400">Go to: {step.destination}</div>
                                    <p className="mt-3 text-sm text-slate-300">{step.description}</p>
                                    <Link
                                        to={step.to}
                                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                                    >
                                        {step.buttonLabel}
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>

                    <aside className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <h2 className="text-xl font-semibold text-white">Your Progress</h2>
                        <div className="mt-5 space-y-3 text-sm text-slate-300">
                            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-2.5">
                                <span>Steps completed</span>
                                <span className="text-slate-100 font-semibold">2/6</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-2.5">
                                <span>Trust Score</span>
                                <span className="text-slate-100 font-semibold">80</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-2.5">
                                <span>Active Escrows</span>
                                <span className="text-slate-100 font-semibold">2</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-2.5">
                                <span>Pending Consents</span>
                                <span className="text-slate-100 font-semibold">1</span>
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-slate-300">
                            Need help? Visit the Trust Glossary for plain-language explanations
                        </div>
                        <Link
                            to="/trust-glossary"
                            className="inline-flex items-center justify-center rounded-lg border border-blue-500/50 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/10"
                        >
                            Open Glossary
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}

