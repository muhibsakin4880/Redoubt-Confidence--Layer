import { Link } from 'react-router-dom'

const frictionPoints = [
    {
        title: 'Dataset confidence is unclear',
        description: 'Teams often receive a summary deck or sample schema without enough provenance, handling context, or review-ready controls.'
    },
    {
        title: 'Approvals are fragmented',
        description: 'Privacy, legal, governance, and program stakeholders are usually asked to review the same dataset through disconnected documents and email threads.'
    },
    {
        title: 'Control questions show up too late',
        description: 'Residency, masking, allowed use, and evaluation boundaries often surface only after a pilot is already in motion.'
    }
]

const stakeholderProfiles = [
    'Analytics, research, and AI leads reviewing external datasets before a pilot starts',
    'Data partnerships and program teams coordinating terms with contributing institutions',
    'Privacy, legal, governance, and review stakeholders who need explicit checkpoints',
    'Contributing institutions and data stewards preparing controlled access documentation'
]

const workflowPillars = [
    {
        title: 'Review provenance before expansion',
        description: 'Start with confidence, source, and handling context before any broader dataset access is considered.'
    },
    {
        title: 'Scope policy before execution',
        description: 'Define geography, duration, delivery mode, and evaluation boundaries before access terms move forward.'
    },
    {
        title: 'Keep review stakeholders aligned',
        description: 'Bring requesting teams, contributing institutions, privacy, legal, and governance into one visible workflow.'
    },
    {
        title: 'Use protected evaluation as the decision point',
        description: 'Move into a controlled evaluation step with audit visibility before a pilot expands into broader operational use.'
    }
]

const operatingContexts = [
    'Quant / market-data research',
    'Climate / geospatial analytics',
    'Healthcare AI / research',
    'Mobility / smart city analytics',
    'Utilities / smart-grid analytics',
    'Consumer / retail / commerce analytics',
    'NLP / text-corpus / social-media intelligence',
    'Industrial / IoT sensor analytics'
]

const crossCuttingPrograms = [
    'Secure clean-room evaluation',
    'Residency-sensitive enterprise deployment',
    'Privacy and sensitive-data review',
    'Consent-heavy research collaboration',
    'Third-party data intake and DUA-first diligence'
]

const pilotPlan = [
    {
        step: '01',
        title: 'Pick one dataset and one use case',
        description: 'Keep the first pilot narrow: one evaluation path, one requesting organization, and one review objective.'
    },
    {
        step: '02',
        title: 'Run the governed review flow',
        description: 'Review provenance, rights, policy requirements, and approval checkpoints before protected evaluation begins.'
    },
    {
        step: '03',
        title: 'Validate under controlled conditions',
        description: 'Use protected evaluation, audit visibility, and documented constraints to test whether the dataset is fit for purpose.'
    },
    {
        step: '04',
        title: 'End with a clear decision',
        description: 'Close the pilot with a yes, no, or revise outcome instead of leaving the process in an indefinite review state.'
    }
]

const sharedResponsibilityModels = [
    {
        title: 'AWS',
        description: 'Infrastructure security, resilience, and cloud-control inheritance under the AWS shared responsibility model.'
    },
    {
        title: 'Azure',
        description: 'Regional deployment governance, identity controls, and infrastructure responsibilities under Microsoft Azure’s shared model.'
    },
    {
        title: 'Google Cloud',
        description: 'Cloud operations, platform security, and controlled analytics environments under Google Cloud’s shared-responsibility approach.'
    },
    {
        title: 'OCI',
        description: 'Residency-sensitive deployment, enterprise isolation, and infrastructure controls under OCI’s shared security model.'
    }
]

const pilotOutcomes = [
    'Confirm whether a sensitive external dataset is fit for a defined analytics or research use case.',
    'Shorten the path between first review, protected evaluation, and a clear pilot decision.',
    'Give governance stakeholders a more credible control, audit, and policy narrative before access expands.'
]

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-14">
                <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,8,20,0.98)_100%)] px-8 py-12 shadow-[0_0_80px_rgba(8,47,73,0.16)]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        Pilot Program
                    </div>
                    <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                        Governed Access Before the Pilot Begins
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        Redoubt is a data confidence layer for organizations that need a safer way to review sensitive
                        external datasets before a pilot moves forward. The goal is not to accelerate access blindly.
                        It is to make confidence, policy, and review requirements visible early enough to support a better decision.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Core Motion</div>
                            <div className="mt-3 text-lg font-semibold text-white">Governed dataset review before pilot expansion</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Primary Value</div>
                            <div className="mt-3 text-lg font-semibold text-white">Clearer confidence, policy, and approval context</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Control Baseline</div>
                            <div className="mt-3 text-lg font-semibold text-white">Shared-responsibility cloud models across major platforms</div>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <Link
                            to="/pilot-walkthrough"
                            className="rounded-2xl bg-cyan-400 px-5 py-4 text-slate-950 transition-colors hover:bg-cyan-300"
                        >
                            <div className="text-sm font-semibold">Open Pilot Walkthrough</div>
                            <div className="mt-1 text-xs font-medium text-slate-900/80">
                                Start with the public path from first dataset review to pilot decision
                            </div>
                        </Link>
                        <Link
                            to="/protected-evaluation"
                            className="rounded-2xl border border-white/15 px-5 py-4 text-white transition-colors hover:border-cyan-400/50 hover:bg-white/5"
                        >
                            <div className="text-sm font-semibold">Review Protected Evaluation Model</div>
                            <div className="mt-1 text-xs font-medium text-slate-400">
                                See the public-facing control surfaces around protected evaluation
                            </div>
                        </Link>
                    </div>
                    <div className="mt-5 flex justify-center">
                        <Link
                            to="/trust-center"
                            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                        >
                            Open Trust Center
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold text-white">Why external dataset review slows down</h2>
                        <p className="mt-3 max-w-3xl text-slate-400">
                            Most teams are not blocked by interest. They are blocked by low-confidence inputs, scattered reviews,
                            and control questions that arrive too late.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {frictionPoints.map(point => (
                            <article key={point.title} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-7 shadow-[0_20px_50px_rgba(2,8,20,0.2)]">
                                <h3 className="text-xl font-semibold text-white">{point.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{point.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <h2 className="text-2xl font-semibold text-white">Who this page is written for</h2>
                        <div className="mt-6 space-y-3">
                            {stakeholderProfiles.map(profile => (
                                <div key={profile} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-slate-200">
                                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                                    <span>{profile}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <h2 className="text-2xl font-semibold text-white">What changes with Redoubt</h2>
                        <div className="mt-6 space-y-4">
                            {workflowPillars.map((pillar, index) => (
                                <article key={pillar.title} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                        0{index + 1}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-white">{pillar.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold text-white">Where the workflow fits best today</h2>
                        <p className="mt-3 max-w-3xl text-slate-400">
                            These are the strongest operating contexts already reflected in the current product surfaces and demo data.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {operatingContexts.map(context => (
                            <div key={context} className="rounded-2xl border border-slate-800 bg-slate-900/75 px-5 py-4 text-sm font-medium text-slate-200 shadow-[0_20px_40px_rgba(2,8,20,0.16)]">
                                {context}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-7 shadow-[0_20px_50px_rgba(2,8,20,0.16)]">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                            Secondary fit
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-white">Public-sector / civic data programs</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                            The current control language also supports public-sector and civic data review, especially where residency,
                            explicit approval paths, and control profiles matter. It is a secondary fit today rather than the lead walkthrough.
                        </p>
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-cyan-500/15 bg-cyan-500/8 p-8">
                    <h2 className="text-2xl font-semibold text-white">Cross-cutting programs</h2>
                    <p className="mt-3 max-w-3xl text-slate-300">
                        Some of the strongest Redoubt motions are not sector-specific. They show up wherever control, consent,
                        diligence, and protected evaluation need to happen before broader access is discussed.
                    </p>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {crossCuttingPrograms.map(program => (
                            <div key={program} className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4 text-sm leading-6 text-slate-200">
                                {program}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold text-white">How an early pilot should run</h2>
                        <p className="mt-3 max-w-3xl text-slate-400">
                            The first pilot should feel narrow, controlled, and decision-oriented rather than broad, indefinite, or infrastructure-heavy.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {pilotPlan.map(item => (
                            <article key={item.step} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-7 shadow-[0_20px_50px_rgba(2,8,20,0.2)]">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                    <h2 className="text-2xl font-semibold text-white">Shared-responsibility cloud models in scope</h2>
                    <p className="mt-3 max-w-3xl text-slate-300">
                        Redoubt’s control story is designed around shared-responsibility cloud models. The cloud layer carries
                        infrastructure security and platform controls, while Redoubt governs access flow, policy enforcement,
                        audit visibility, and trust workflow at the application layer.
                    </p>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {sharedResponsibilityModels.map(model => (
                            <div key={model.title} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
                                <h3 className="text-lg font-semibold text-white">{model.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{model.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <Link
                            to="/trust-center"
                            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                        >
                            Review the full Trust Center
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-emerald-500/15 bg-emerald-500/8 p-8">
                    <h2 className="text-2xl font-semibold text-white">What an early pilot should prove</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {pilotOutcomes.map(outcome => (
                            <div key={outcome} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-slate-200 leading-7">
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
                    </div>
                </section>
            </div>
        </div>
    )
}
