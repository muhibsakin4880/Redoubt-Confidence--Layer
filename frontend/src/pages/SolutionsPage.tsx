const workflowPillars = [
    {
        title: 'Review Fit Before Procurement',
        description: 'Give regulated analytics teams a way to inspect dataset relevance, provenance, and controls before they open a heavyweight pilot track.'
    },
    {
        title: 'Price Rights Before Access',
        description: 'Scope geography, duration, delivery mode, and evaluation boundaries before a requesting team is pushed into a final commercial commitment.'
    },
    {
        title: 'Coordinate Governance Review',
        description: 'Bring analytics, privacy, legal, and data governance stakeholders into one request flow instead of scattering review across email and spreadsheets.'
    },
    {
        title: 'Enter Protected Evaluation',
        description: 'Move from metadata preview into a governed evaluation step before broader access is approved or operationalized.'
    }
]

const stakeholderProfiles = [
    'Quant, research, and analytics leads evaluating external datasets before pilot approval',
    'Data partnerships teams shaping pilot terms with contributing institutions',
    'Privacy, governance, and procurement reviewers who need clear approval checkpoints',
    'Contributing institutions and data stewards preparing governed access documentation and controls'
]

const supportedWedges = [
    {
        title: 'Quant / Market-Data Research',
        description: 'Fit the existing governed request and approved-access flow to teams evaluating external tick, pricing, and research datasets.'
    },
    {
        title: 'Climate / Geospatial Analytics',
        description: 'Use provenance, rights scoping, and evaluation workflow to review climate, satellite, and geospatial datasets before production use.'
    },
    {
        title: 'Healthcare AI / Research',
        description: 'Support teams assessing de-identified clinical, imaging, or genomics datasets before a pilot triggers deeper compliance work.'
    },
    {
        title: 'Mobility / Smart City Analytics',
        description: 'Adapt the same review path to streaming traffic, mobility, and sensor datasets with stronger control requirements.'
    },
    {
        title: 'Utilities / Smart-Grid Analytics',
        description: 'Apply the same governed review flow to smart-meter, grid-sensor, and energy-pattern datasets that need stronger control context before broader operational use.'
    },
    {
        title: 'Consumer / Retail / Commerce Analytics',
        description: 'Support teams reviewing consumer-behavior, commerce, and transaction-derived datasets with clearer purpose, DUA, and audit checkpoints.'
    },
    {
        title: 'NLP / Text-Corpus / Social-Media Intelligence',
        description: 'Extend the request and review workflow to text-heavy corpora where moderation, retention, and legal-basis questions matter before evaluation starts.'
    },
    {
        title: 'Industrial / IoT Sensor Analytics',
        description: 'Use the same intake, screening, and policy review path for industrial telemetry and IoT sensor datasets before a team operationalizes access.'
    }
]

const trustAngles = [
    {
        title: 'Secure Clean-Room Evaluation',
        description: 'For teams that need egress controls, temporary credentials, and protected analysis before broader access is approved.'
    },
    {
        title: 'Residency-Sensitive Enterprise Review',
        description: 'For organizations that need private cloud, on-prem, or stricter residency alignment as part of the evaluation conversation.'
    },
    {
        title: 'Privacy / Sensitive-Data Review',
        description: 'For teams that need classification, masking, PHI/PII screening, and policy review before a dataset can move into protected evaluation.'
    },
    {
        title: 'Consent-Heavy Research Collaboration',
        description: 'For programs that need reusable consent, legal-basis, and documentation flows across repeated requests and governed research access.'
    },
    {
        title: 'DUA-First External Data Intake',
        description: 'For organizations that want diligence, DUA generation, and access conditions defined before a broader pilot or operational track begins.'
    }
]

const secondaryContexts = [
    {
        title: 'Public-Sector / Civic Data Programs',
        description: 'A secondary fit today, supported mainly through the repo’s residency, control-profile, and approval-language surfaces rather than a dedicated sector walkthrough.'
    }
]

const pilotOutcomes = [
    'Validate whether an external dataset is fit for a specific regulated analytics use case',
    'Align requesting teams, contributing institutions, governance, and commercial stakeholders around one controlled workflow',
    'Reduce the friction between first interest, evaluation, and pilot decision'
]

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-14">
                <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,8,20,0.98)_100%)] px-8 py-12 shadow-[0_0_80px_rgba(8,47,73,0.16)]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        Positioning
                    </div>
                    <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                        A Data Confidence Layer for Governed Access
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        Redoubt is currently shaped around one frontend demo motion: give teams and contributing institutions
                        a safer way to review sensitive external datasets before a pilot begins.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Core Motion</div>
                            <div className="mt-3 text-lg font-semibold text-white">Governed dataset review before pilot commitment</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Common Contexts</div>
                            <div className="mt-3 text-lg font-semibold text-white">Multi-sector regulated analytics and control-heavy review flows</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Cloud Control Baseline</div>
                            <div className="mt-3 text-lg font-semibold text-white">AWS shared responsibility model for infrastructure references</div>
                        </div>
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                        <h2 className="text-2xl font-semibold text-white">Who this is for</h2>
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
                        <h2 className="text-2xl font-semibold text-white">What the workflow does</h2>
                        <p className="mt-4 text-slate-300 leading-7">
                            Instead of forcing teams straight into a generic data catalog or a full procurement cycle,
                            Redoubt shows a governed first step: review the dataset, scope the rights, route the request through
                            approval gates, and enter protected evaluation before broader access is discussed.
                        </p>
                        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 text-sm leading-7 text-cyan-50">
                            This repo is intentionally frontend-first. The current goal is a credible workflow walkthrough for early design-partner and pilot conversations, not a full production backend.
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold text-white">Common operating contexts</h2>
                        <p className="mt-3 max-w-3xl text-slate-400">
                            These are the strongest sector stories already supported by the current frontend demo and underlying workspace mock data.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {supportedWedges.map(wedge => (
                            <article key={wedge.title} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-7 shadow-[0_20px_50px_rgba(2,8,20,0.2)]">
                                <h3 className="text-xl font-semibold text-white">{wedge.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{wedge.description}</p>
                            </article>
                        ))}
                    </div>
                    <div className="mt-6 grid gap-6 md:grid-cols-1">
                        {secondaryContexts.map(context => (
                            <article key={context.title} className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-7 shadow-[0_20px_50px_rgba(2,8,20,0.16)]">
                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                                    Secondary fit
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-white">{context.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{context.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold text-white">Core workflow pillars</h2>
                        <p className="mt-3 max-w-3xl text-slate-400">
                            The first version of Redoubt is not a generic data directory. It is a controlled cross-organization workflow for regulated analytics use cases.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {workflowPillars.map((pillar, index) => (
                            <article key={pillar.title} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-7 shadow-[0_20px_50px_rgba(2,8,20,0.2)]">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                    0{index + 1}
                                </div>
                                <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-3xl border border-cyan-500/15 bg-cyan-500/8 p-8">
                    <h2 className="text-2xl font-semibold text-white">Cross-cutting trust angles</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {trustAngles.map(angle => (
                            <div key={angle.title} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
                                <h3 className="text-lg font-semibold text-white">{angle.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">{angle.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-sm leading-7 text-slate-300">
                        Infrastructure-level references such as SOC 2 Type II, HIPAA-eligible services, GDPR regional hosting, and ISO 27001 certified cloud controls should be understood through AWS under the shared responsibility model, not as standalone Redoubt application certifications in this demo.
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
                </section>
            </div>
        </div>
    )
}



