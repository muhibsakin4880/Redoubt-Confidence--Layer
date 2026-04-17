import { Link } from 'react-router-dom'

const controlSurfaces = [
    {
        title: 'Isolated compute session',
        description: 'Protected evaluation runs in a scoped environment so the dataset is reviewed under clear technical boundaries.'
    },
    {
        title: 'Temporary credentials',
        description: 'Short-lived credentials reduce persistent exposure and keep the review scope tied to a specific evaluation window.'
    },
    {
        title: 'Egress controls',
        description: 'Policies can restrict copy, export, external calls, and unrestricted extraction while still allowing approved aggregate outputs.'
    },
    {
        title: 'Watermarking and traceability',
        description: 'Evaluation outputs can carry watermarking and traceability signals that support stronger oversight.'
    },
    {
        title: 'Audit visibility',
        description: 'Session activity, policy actions, and evaluation events remain visible as part of the broader governance story.'
    },
    {
        title: 'Residency-sensitive execution',
        description: 'The evaluation environment can be aligned to stricter deployment and locality requirements when the operating context demands it.'
    }
]

const protectedEvaluationModel = [
    {
        step: '01',
        title: 'Review metadata',
        description: 'Inspect schema shape, coverage, freshness, and trust context before any protected dataset use begins.'
    },
    {
        step: '02',
        title: 'Run governed evaluation',
        description: 'Evaluate the dataset inside a bounded workspace with scoped credentials, visible controls, and audit-aware review.'
    },
    {
        step: '03',
        title: 'Release only after validation',
        description: 'Broader access, delivery, or payout follows only after validation confirms the governed evaluation outcome.'
    }
]

const responsibilityLayers = [
    {
        title: 'Cloud layer responsibility',
        points: [
            'Infrastructure security and platform resilience',
            'Regional cloud controls and service baselines',
            'Underlying compute, storage, and networking controls'
        ]
    },
    {
        title: 'Redoubt application responsibility',
        points: [
            'Access flow, policy enforcement, and trust workflow',
            'Audit visibility, session governance, and output constraints',
            'Protected evaluation orchestration and review-state logic'
        ]
    }
]

const publicReviewSignals = [
    'Protected evaluation is a decision surface, not just a technical environment.',
    'The strongest value comes from making control assumptions visible before broader access expands.',
    'Shared-responsibility cloud models support the infrastructure baseline; Redoubt governs the access workflow on top.'
]

export default function ProtectedEvaluationPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-6xl px-4 pb-14 pt-6">
                <section className="rounded-[2rem] border border-amber-500/15 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,8,20,0.98)_100%)] px-8 py-12 shadow-[0_0_80px_rgba(69,39,6,0.16)]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                        Public Controls Overview
                    </div>
                    <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                        Protected Evaluation Surfaces
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        This page describes the control surfaces around protected evaluation without exposing the deeper
                        operator-facing environment. It is intended for early review discussions where stakeholders need to
                        understand how evaluation is constrained before broader access is considered.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Environment</div>
                            <div className="mt-3 text-lg font-semibold text-white">Scoped and isolated</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Controls</div>
                            <div className="mt-3 text-lg font-semibold text-white">Egress, masking, credentials, and audit</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Outcome</div>
                            <div className="mt-3 text-lg font-semibold text-white">Protected evaluation before broader expansion</div>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold text-white">Control surfaces in view</h2>
                        <p className="mt-3 max-w-3xl text-slate-400">
                            These are the main surfaces that shape how a protected evaluation behaves before the dataset moves beyond a tightly controlled review state.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {controlSurfaces.map(surface => (
                            <article key={surface.title} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-7 shadow-[0_20px_50px_rgba(2,8,20,0.2)]">
                                <h3 className="text-xl font-semibold text-white">{surface.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{surface.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <div className="max-w-3xl">
                            <h2 className="text-2xl font-semibold text-white">3-step protected evaluation model</h2>
                            <p className="mt-3 text-slate-300">
                                Suitable for regulated data evaluation where controlled review, visible policy boundaries, and validated release matter before broader access expands.
                            </p>
                        </div>
                        <div className="mt-6 grid gap-4 lg:grid-cols-3">
                            {protectedEvaluationModel.map(step => (
                                <article key={step.step} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                                        {step.step}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {responsibilityLayers.map(layer => (
                            <article key={layer.title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                                <h2 className="text-2xl font-semibold text-white">{layer.title}</h2>
                                <div className="mt-6 space-y-3">
                                    {layer.points.map(point => (
                                        <div key={point} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200">
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-cyan-500/15 bg-cyan-500/8 p-8">
                    <h2 className="text-2xl font-semibold text-white">What this public page should communicate</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {publicReviewSignals.map(signal => (
                            <div key={signal} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-sm leading-7 text-slate-200">
                                {signal}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-emerald-500/15 bg-emerald-500/8 p-8">
                    <h2 className="text-2xl font-semibold text-white">Continue the public review path</h2>
                    <p className="mt-3 max-w-3xl text-slate-300">
                        Keep the walkthrough as the narrative overview, and use the Trust Center for the broader controls, audit, deployment, and approval model.
                    </p>
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Link
                            to="/trust-center"
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
                        >
                            Open Trust Center
                        </Link>
                        <Link
                            to="/pilot-walkthrough"
                            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400/50 hover:bg-white/5"
                        >
                            Open Pilot Walkthrough
                        </Link>
                        <Link
                            to="/solutions"
                            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400/50 hover:bg-white/5"
                        >
                            Return to Solutions
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}
