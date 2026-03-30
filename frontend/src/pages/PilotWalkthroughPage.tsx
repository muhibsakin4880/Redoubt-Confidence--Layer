import { Link } from 'react-router-dom'

const walkthroughSteps = [
    {
        step: '01',
        title: 'Review the dataset with confidence context',
        description: 'Start with provenance, handling notes, quality signals, and policy context before any wider pilot activity is considered.'
    },
    {
        step: '02',
        title: 'Define the evaluation boundaries',
        description: 'Set geography, duration, allowed use, delivery conditions, and control expectations before a dataset moves further.'
    },
    {
        step: '03',
        title: 'Bring review stakeholders into one path',
        description: 'Keep analytics, privacy, legal, governance, and program teams aligned inside one visible review flow instead of scattered threads.'
    },
    {
        step: '04',
        title: 'Enter protected evaluation',
        description: 'Use a controlled evaluation step with explicit restrictions, temporary credentials, and audit visibility before broader use is discussed.'
    },
    {
        step: '05',
        title: 'Close with a clear pilot decision',
        description: 'End the process with a yes, no, or revise outcome, supported by evidence instead of intuition and fragmented approvals.'
    }
]

const walkthroughSignals = [
    'One dataset, one use case, one decision path',
    'Explicit policy and approval checkpoints',
    'Protected evaluation before broader expansion',
    'Audit visibility throughout the review cycle'
]

const pageOutcomes = [
    'Show how confidence and controls appear before the pilot expands.',
    'Demonstrate that policy and review requirements are part of the workflow, not a late-stage add-on.',
    'Give stakeholders a clearer path from first review to a documented decision.'
]

export default function PilotWalkthroughPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-14">
                <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,8,20,0.98)_100%)] px-8 py-12 shadow-[0_0_80px_rgba(8,47,73,0.16)]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        Public Walkthrough
                    </div>
                    <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                        A Guided Walkthrough for the First Pilot
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        This page is the public-facing version of the Redoubt pilot path. It focuses on how a sensitive
                        external dataset moves from first review to protected evaluation and then to a clear pilot decision.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Starting Point</div>
                            <div className="mt-3 text-lg font-semibold text-white">Confidence before expansion</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Decision Gate</div>
                            <div className="mt-3 text-lg font-semibold text-white">Protected evaluation under clear constraints</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Ending Point</div>
                            <div className="mt-3 text-lg font-semibold text-white">A documented pilot decision</div>
                        </div>
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <h2 className="text-2xl font-semibold text-white">Walkthrough sequence</h2>
                        <div className="mt-6 space-y-4">
                            {walkthroughSteps.map(item => (
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

                    <div className="space-y-6">
                        <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                            <h2 className="text-2xl font-semibold text-white">What this walkthrough emphasizes</h2>
                            <div className="mt-6 space-y-3">
                                {walkthroughSignals.map(signal => (
                                    <div key={signal} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200">
                                        {signal}
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-3xl border border-cyan-500/15 bg-cyan-500/8 p-8">
                            <h2 className="text-2xl font-semibold text-white">What an early review should prove</h2>
                            <div className="mt-6 space-y-3">
                                {pageOutcomes.map(outcome => (
                                    <div key={outcome} className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm leading-7 text-slate-200">
                                        {outcome}
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-emerald-500/15 bg-emerald-500/8 p-8">
                    <h2 className="text-2xl font-semibold text-white">Next page in the public review path</h2>
                    <p className="mt-3 max-w-3xl text-slate-300">
                        After the walkthrough, move into the protected evaluation model to see how the review environment stays constrained before broader expansion is discussed.
                    </p>
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Link
                            to="/protected-evaluation"
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
                        >
                            Review Protected Evaluation Model
                        </Link>
                        <Link
                            to="/trust-center"
                            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400/50 hover:bg-white/5"
                        >
                            Open Trust Center
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
