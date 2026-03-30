import { Link } from 'react-router-dom'

const trustPillars = [
    {
        title: 'Controls before expansion',
        description: 'Confidence, classification, policy scope, and review checkpoints are surfaced before a pilot expands into broader access.'
    },
    {
        title: 'Protected evaluation',
        description: 'Sensitive datasets can be reviewed inside bounded evaluation conditions with temporary credentials, output controls, and explicit session constraints.'
    },
    {
        title: 'Audit visibility',
        description: 'Activity, policy events, approval states, and evaluation records remain visible as part of one evidence trail.'
    }
]

const responsibilityLayers = [
    {
        title: 'Cloud platform layer',
        detail: 'Infrastructure security, platform resilience, storage and networking controls, and cloud-service baselines remain with the selected provider under its shared-responsibility model.'
    },
    {
        title: 'Redoubt governance layer',
        detail: 'Access flow, policy enforcement, protected evaluation orchestration, audit visibility, approval checkpoints, and review-state logic are handled at the application layer.'
    },
    {
        title: 'Organization control layer',
        detail: 'Purpose definition, internal approvals, legal review, deployment choices, and pilot decisions stay with the organization running the review.'
    }
]

const sharedCloudModels = [
    {
        title: 'AWS',
        description: 'Shared-responsibility baseline for infrastructure security, resilience, cloud controls, and reference compliance artifacts.'
    },
    {
        title: 'Azure',
        description: 'Shared-responsibility model for regional deployment governance, identity controls, and enterprise cloud operations.'
    },
    {
        title: 'Google Cloud',
        description: 'Shared-responsibility approach for controlled analytics environments, platform operations, and underlying security posture.'
    },
    {
        title: 'OCI',
        description: 'Shared security model suited to residency-sensitive deployment patterns, enterprise isolation, and regional control requirements.'
    }
]

const evidenceSurfaces = [
    'Dataset classification and sensitivity tagging',
    'Policy scope for geography, duration, and delivery conditions',
    'Protected evaluation events, session history, and output constraints',
    'Approval checkpoints across privacy, legal, governance, and program review',
    'Append-only audit history with visible decision states',
    'Deployment and residency posture tied to the chosen cloud model'
]

const approvalSequence = [
    {
        step: '01',
        title: 'Define the review objective',
        description: 'Start with one dataset, one purpose, and one narrow evaluation objective so the control path stays clear.'
    },
    {
        step: '02',
        title: 'Set policy boundaries',
        description: 'Confirm geography, allowed use, handling requirements, session expectations, and output limits before protected evaluation begins.'
    },
    {
        step: '03',
        title: 'Align review stakeholders',
        description: 'Keep analytics, privacy, legal, governance, and contributing-institution contacts in one visible approval path.'
    },
    {
        step: '04',
        title: 'Document the pilot decision',
        description: 'End with a clear decision record, not an open-ended review thread or undocumented handoff.'
    }
]

const deploymentPatterns = [
    {
        title: 'Managed cloud deployment',
        detail: 'Best when the goal is a faster start with inherited cloud controls and clear operating boundaries.'
    },
    {
        title: 'Private cloud deployment',
        detail: 'Best when organizations want the review flow inside their own account and control boundary.'
    },
    {
        title: 'Residency-sensitive execution',
        detail: 'Best when location, locality, or isolation requirements shape where protected evaluation can run.'
    }
]

const riskReductionOutcomes = [
    'Reduce late-stage surprises around classification, residency, or approval requirements.',
    'Make protected evaluation a visible decision gate instead of an opaque technical handoff.',
    'Give stakeholders a more credible control and evidence story before a pilot expands.',
    'Create a cleaner path from first dataset review to a documented go, no-go, or revise outcome.'
]

export default function TrustCenterPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-14">
                <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,8,20,0.98)_100%)] px-8 py-12 shadow-[0_0_80px_rgba(8,47,73,0.16)]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        Trust Center
                    </div>
                    <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                        Controls, Evidence, and Review Model
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        This public page brings Redoubt’s control story into one place. It focuses on how confidence,
                        policy, audit visibility, deployment posture, and approval steps are made visible before a
                        pilot expands into broader access.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Control Scope</div>
                            <div className="mt-3 text-lg font-semibold text-white">Access, policy, audit, and review state</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Decision Point</div>
                            <div className="mt-3 text-lg font-semibold text-white">Protected evaluation before broader expansion</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Infrastructure Baseline</div>
                            <div className="mt-3 text-lg font-semibold text-white">Shared-responsibility cloud models across major platforms</div>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold text-white">What this page is meant to clarify</h2>
                        <p className="mt-3 max-w-3xl text-slate-400">
                            The goal is not to claim blanket certification. It is to show where infrastructure controls
                            are inherited, where Redoubt governs the workflow, and how organizations keep decision authority.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {trustPillars.map(pillar => (
                            <article key={pillar.title} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-7 shadow-[0_20px_50px_rgba(2,8,20,0.2)]">
                                <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <h2 className="text-2xl font-semibold text-white">Shared-responsibility model in practice</h2>
                        <div className="mt-6 space-y-4">
                            {responsibilityLayers.map(layer => (
                                <article key={layer.title} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                                    <h3 className="text-lg font-semibold text-white">{layer.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-300">{layer.detail}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <h2 className="text-2xl font-semibold text-white">Cloud models in scope</h2>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            {sharedCloudModels.map(model => (
                                <article key={model.title} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                                    <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">{model.title}</div>
                                    <p className="mt-3 text-sm leading-7 text-slate-300">{model.description}</p>
                                </article>
                            ))}
                        </div>
                        <p className="mt-6 text-xs leading-6 text-slate-500">
                            Infrastructure reports, eligible-service baselines, and cloud-control references should be read through the selected provider’s shared-responsibility model, not as standalone Redoubt application certifications.
                        </p>
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <h2 className="text-2xl font-semibold text-white">Evidence surfaces kept in view</h2>
                        <div className="mt-6 space-y-3">
                            {evidenceSurfaces.map(surface => (
                                <div key={surface} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200">
                                    {surface}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <h2 className="text-2xl font-semibold text-white">Approval and evaluation flow</h2>
                        <div className="mt-6 space-y-4">
                            {approvalSequence.map(item => (
                                <article key={item.step} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                        {item.step}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-amber-500/15 bg-amber-500/8 p-8">
                    <h2 className="text-2xl font-semibold text-white">Deployment and residency posture</h2>
                    <p className="mt-3 max-w-3xl text-slate-300">
                        Deployment choices change where controls live and how review environments are operated. The trust story should stay legible across managed cloud, private cloud, and stricter locality patterns.
                    </p>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {deploymentPatterns.map(pattern => (
                            <article key={pattern.title} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
                                <h3 className="text-lg font-semibold text-white">{pattern.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{pattern.detail}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-emerald-500/15 bg-emerald-500/8 p-8">
                    <h2 className="text-2xl font-semibold text-white">What this trust model should reduce</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {riskReductionOutcomes.map(outcome => (
                            <div key={outcome} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-sm leading-7 text-slate-200">
                                {outcome}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Link
                            to="/pilot-walkthrough"
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
                        >
                            Open Pilot Walkthrough
                        </Link>
                        <Link
                            to="/protected-evaluation"
                            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400/50 hover:bg-white/5"
                        >
                            Review Protected Evaluation Model
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
