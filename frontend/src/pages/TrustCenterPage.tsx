import { Link } from 'react-router-dom'

const trustPillars = [
    {
        title: 'Controls before expansion',
        description: 'Confidence, classification, policy scope, and review checkpoints are surfaced before protected evaluation expands into broader access.'
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

const uaeRegulatoryCoverage = [
    {
        jurisdiction: 'UAE Federal PDPL',
        summary: 'Redoubt supports a jurisdiction-aware review posture for federal privacy-sensitive data evaluation.',
        policyScope: 'Set purpose, geography, handling conditions, and dataset boundaries before protected review begins.',
        reviewControls: 'Apply bounded sessions, approval routing, and output controls before access expands beyond evaluation.',
        evidenceVisibility: 'Keep policy state, reviewer approvals, and evaluation activity visible in one decision trail.'
    },
    {
        jurisdiction: 'DIFC',
        summary: 'Redoubt supports review programs that need a clear DIFC operating posture for regulated data evaluation.',
        policyScope: 'Define review scope around DIFC-governed data handling, approved users, and evaluation-specific conditions.',
        reviewControls: 'Route stakeholders through explicit checkpoints with session limits and controlled evaluation boundaries.',
        evidenceVisibility: 'Surface control decisions, review events, and posture changes as part of a shared evidence view.'
    },
    {
        jurisdiction: 'ADGM',
        summary: 'Redoubt supports regulated data evaluation with an ADGM-aware control posture and visible governance steps.',
        policyScope: 'Align evaluation scope to approved use, locality expectations, and the data categories under review.',
        reviewControls: 'Enforce protected review conditions, reviewer sequencing, and constrained outputs within the evaluation flow.',
        evidenceVisibility: 'Preserve an auditable record of approvals, evaluation history, and operating-boundary decisions.'
    }
]

const uaeResidencyTransferPostures = [
    {
        title: 'Local-only',
        decision: 'Allowed posture',
        summary: 'Review remains inside a UAE-local workspace when the operating boundary does not permit routine external transfer.',
        workspaceBoundary: 'Execution, reviewer access, and visible outputs stay inside the approved local environment.',
        transferPath: 'Exports remain tightly restricted and evaluation artifacts stay within the governed local boundary.'
    },
    {
        title: 'GCC-limited',
        decision: 'Conditional posture',
        summary: 'Review can operate within an approved GCC footprint when regional infrastructure or reviewers are in scope.',
        workspaceBoundary: 'Access is limited to approved GCC locations and governed review surfaces.',
        transferPath: 'Movement is restricted to the permitted regional path and remains subject to policy routing.'
    },
    {
        title: 'Cross-border review required',
        decision: 'Conditional or blocked',
        summary: 'Review depends on movement beyond UAE or GCC boundaries and requires explicit transfer review before release.',
        workspaceBoundary: 'Cross-border reviewer location, processing, or export cannot be assumed from the initial request.',
        transferPath: 'The request proceeds only when the transfer path, approvals, and review controls support that operating model.'
    }
]

const uaeTransferSafeguards = [
    'Governed workspace',
    'Restricted export',
    'Watermarking',
    'Audit trail',
    'Scoped credentials'
]

const residencyDecisionStates = [
    {
        state: 'Allowed',
        detail: 'The requested workspace, reviewer path, and output handling already fit the approved residency posture.'
    },
    {
        state: 'Conditional',
        detail: 'The request can proceed only with tighter routing, added safeguards, or a narrower transfer path.'
    },
    {
        state: 'Blocked',
        detail: 'The requested reviewer location, export path, or movement boundary falls outside the approved posture.'
    }
]

const riskReductionOutcomes = [
    'Reduce late-stage surprises around classification, residency, or approval requirements.',
    'Make protected evaluation a visible decision gate instead of an opaque technical handoff.',
    'Give stakeholders a more credible control and evidence story before production access expands.',
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
                        protected evaluation moves into broader access or production rollout.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Control Scope</div>
                            <div className="mt-3 text-lg font-semibold text-white">Access, policy, audit, and review state</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Decision Point</div>
                            <div className="mt-3 text-lg font-semibold text-white">Protected evaluation before production rollout</div>
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

                <section className="mt-10 rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.94)_0%,rgba(2,8,20,0.98)_100%)] p-8 shadow-[0_0_70px_rgba(13,148,136,0.08)]">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                            UAE Regulatory Coverage
                        </div>
                        <h2 className="mt-5 text-3xl font-semibold text-white">Operating jurisdictions for regulated data evaluation</h2>
                        <p className="mt-3 text-slate-300">
                            Redoubt supports a jurisdiction-aware review posture for regulated data evaluation across UAE federal and financial-centre operating contexts.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 lg:grid-cols-3">
                        {uaeRegulatoryCoverage.map(item => (
                            <article key={item.jurisdiction} className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_45px_rgba(2,8,20,0.22)]">
                                <div className="inline-flex w-fit items-center rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                    {item.jurisdiction}
                                </div>
                                <p className="mt-4 text-base font-semibold leading-7 text-white">{item.summary}</p>

                                <div className="mt-6 space-y-3">
                                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Policy scope</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.policyScope}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Review controls</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.reviewControls}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Evidence visibility</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.evidenceVisibility}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-[2rem] border border-sky-500/15 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.94)_0%,rgba(2,8,20,0.98)_100%)] p-8 shadow-[0_0_70px_rgba(14,116,144,0.08)]">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">
                            Residency and Transfer Posture
                        </div>
                        <h2 className="mt-5 text-3xl font-semibold text-white">How review requests move across local, regional, and cross-border boundaries</h2>
                        <p className="mt-3 text-slate-300">
                            Redoubt helps teams express whether a request stays local, remains GCC-limited, or needs explicit cross-border review before regulated evaluation begins.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 lg:grid-cols-3">
                        {uaeResidencyTransferPostures.map(posture => (
                            <article key={posture.title} className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_45px_rgba(2,8,20,0.2)]">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-lg font-semibold text-white">{posture.title}</h3>
                                    <div className="rounded-full border border-sky-400/15 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
                                        {posture.decision}
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-7 text-slate-300">{posture.summary}</p>

                                <div className="mt-6 space-y-3">
                                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">Workspace boundary</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">{posture.workspaceBoundary}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">Transfer path</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">{posture.transferPath}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-6">
                            <h3 className="text-lg font-semibold text-white">Safeguards typically kept in force</h3>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {uaeTransferSafeguards.map(safeguard => (
                                    <div
                                        key={safeguard}
                                        className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200"
                                    >
                                        {safeguard}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-6">
                            <h3 className="text-lg font-semibold text-white">Why a request may be allowed, conditional, or blocked</h3>
                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                {residencyDecisionStates.map(item => (
                                    <article key={item.state} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">{item.state}</div>
                                        <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
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
