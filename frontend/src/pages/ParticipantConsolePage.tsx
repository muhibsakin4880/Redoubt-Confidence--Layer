import type { ReactNode } from 'react'
import { Card } from '../components/Card'

type MetricItem = {
    label: string
    value: string
    detail: string
    accentClassName: string
}

type QueueItem = {
    title: string
    status: string
    statusClassName: string
    detail: string
    owner: string
}

type SummaryItem = {
    label: string
    value: string
    detail: string
}

type ProgressItem = {
    label: string
    progress: string
    widthClassName: string
    toneClassName: string
}

type TimelineItem = {
    title: string
    timestamp: string
    detail: string
    complete: boolean
}

type QuickAction = {
    title: string
    detail: string
    className: string
}

const kpiItems: MetricItem[] = [
    {
        label: 'Trust Score',
        value: '72',
        detail: '+6 since the last attestation cycle',
        accentClassName: 'text-emerald-200'
    },
    {
        label: 'Active Datasets',
        value: '03',
        detail: 'Two governed workspaces live today',
        accentClassName: 'text-cyan-200'
    },
    {
        label: 'Escrow Balance',
        value: '$4,200',
        detail: 'One release window opens in 18 hours',
        accentClassName: 'text-amber-200'
    },
    {
        label: 'Open Contributions',
        value: '12',
        detail: 'Four need action before reviewer handoff',
        accentClassName: 'text-violet-200'
    }
]

const submissionQueue: QueueItem[] = [
    {
        title: 'Financial Tick Delta Batch',
        status: 'Reviewer handoff',
        statusClassName: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
        detail: 'Access package approved and ready for governed clean-room provisioning.',
        owner: 'Controls · Research markets'
    },
    {
        title: 'Climate Station Metadata Patch',
        status: 'Needs source fix',
        statusClassName: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
        detail: 'Schema drift detected across the altitude and region columns in the latest upload.',
        owner: 'Data prep · Platform ingestion'
    },
    {
        title: 'Clinical Outcomes Delta',
        status: 'Restricted review',
        statusClassName: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
        detail: 'Healthcare workspace scope is active while legal redistribution controls are being confirmed.',
        owner: 'Compliance · Healthcare governance'
    }
]

const trustSummary: SummaryItem[] = [
    {
        label: 'Verification posture',
        value: 'Verified session',
        detail: 'Identity, payment rail, and participant passport are all current.'
    },
    {
        label: 'Current access mode',
        value: 'Platform-only governed workspace',
        detail: 'Approved buyers are routed into clean rooms with analytics-pack scope.'
    },
    {
        label: 'Payout readiness',
        value: '1 settlement pending',
        detail: 'Revenue starts on successful settlement and lands in the reserve account.'
    },
    {
        label: 'Governance status',
        value: 'Audit logging mandatory',
        detail: 'Attribution is required and redistribution remains disabled by default.'
    }
]

const progressItems: ProgressItem[] = [
    {
        label: 'Dataset upload readiness',
        progress: '3 of 5 payloads complete',
        widthClassName: 'w-[60%]',
        toneClassName: 'bg-cyan-400'
    },
    {
        label: 'Compliance documentation',
        progress: '2 of 4 attestations filed',
        widthClassName: 'w-[50%]',
        toneClassName: 'bg-amber-400'
    },
    {
        label: 'Rights package coverage',
        progress: '4 of 5 packages standardized',
        widthClassName: 'w-[80%]',
        toneClassName: 'bg-emerald-400'
    }
]

const timelineItems: TimelineItem[] = [
    {
        title: 'Profile completed',
        timestamp: 'Mar 15, 2026',
        detail: 'Primary organization profile and payout details were verified.',
        complete: true
    },
    {
        title: 'First dataset submitted',
        timestamp: 'Mar 10, 2026',
        detail: 'Initial upload passed schema review and entered compliance screening.',
        complete: true
    },
    {
        title: 'Trust verification refresh',
        timestamp: 'Pending this week',
        detail: 'One final attestation is still needed before the score can move into the next band.',
        complete: false
    }
]

const quickActions: QuickAction[] = [
    {
        title: 'New Contribution',
        detail: 'Start a new dataset submission with the current privacy package.',
        className: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
    },
    {
        title: 'Upload Dataset',
        detail: 'Push the next payload into the secure ingestion flow.',
        className: 'border border-white/10 bg-slate-800/80 text-white hover:border-cyan-400/50 hover:bg-slate-800'
    },
    {
        title: 'Open Passport',
        detail: 'Review the reusable compliance passport before the next request.',
        className: 'border border-white/10 bg-slate-800/80 text-white hover:border-emerald-400/50 hover:bg-slate-800'
    },
    {
        title: 'Review Escrow',
        detail: 'Check held funds, settlement windows, and outstanding releases.',
        className: 'border border-white/10 bg-slate-800/80 text-white hover:border-amber-400/50 hover:bg-slate-800'
    }
]

export default function ParticipantConsolePage() {
    return (
        <div className="min-h-screen bg-slate-950 px-6 py-6">
            <div className="overflow-x-auto">
                <div className="mx-auto min-w-[1024px] max-w-[1280px] space-y-6">
                    <section>
                        <DashboardGrid>
                            <header className="col-span-12 flex items-end justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                                            Participant Console
                                        </span>
                                    </div>
                                    <h1 className="mt-4 text-3xl font-bold text-white">Operational overview for your contribution pipeline</h1>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                                        Track submission readiness, governance posture, payout timing, and the next actions that unblock participant-side
                                        delivery.
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    <div className="rounded-[12px] border border-white/10 bg-slate-900/80 px-4 py-3 text-right">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Review window</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-100">Next compliance check · 18h</div>
                                    </div>
                                    <div className="rounded-[12px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-right">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">Session</div>
                                        <div className="mt-1 text-sm font-semibold text-emerald-100">Verified and settlement-ready</div>
                                    </div>
                                </div>
                            </header>
                        </DashboardGrid>
                    </section>

                    <section>
                        <DashboardGrid>
                            <div className="col-span-12">
                                <Card className="overflow-hidden border-cyan-500/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(17,24,39,0.86))] shadow-[0_22px_60px_-34px_rgba(6,182,212,0.5)]">
                                    <div className="grid grid-cols-12 gap-6">
                                        <div className="col-span-8">
                                            <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Intro Banner</div>
                                            <h2 className="mt-3 text-2xl font-semibold text-white">Today&apos;s focus is reviewer-ready access packages and settlement prep</h2>
                                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                                Two submissions are close to release. Keep governance controls synchronized, close the remaining compliance
                                                gaps, and move clean-room approvals toward settlement without reopening the upload flow.
                                            </p>
                                            <div className="mt-5 flex gap-3">
                                                <button className="rounded-[12px] bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400">
                                                    Review Submission Queue
                                                </button>
                                                <button className="rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400/50 hover:bg-slate-900">
                                                    Open Governance Summary
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-span-4 space-y-3">
                                            <BannerSignal
                                                label="Current priority"
                                                value="Finalize one restricted review package"
                                                detail="Clinical outcomes needs legal redistribution confirmation before buyer release."
                                            />
                                            <BannerSignal
                                                label="Best next unlock"
                                                value="Complete one missing attestation"
                                                detail="That moves the trust score toward the next approval band."
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </DashboardGrid>
                    </section>

                    <section>
                        <DashboardGrid>
                            {kpiItems.map(item => (
                                <div key={item.label} className="col-span-3">
                                    <Card className="h-full border-white/8 bg-slate-900/75 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.95)]">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                                        <div className={`mt-4 text-3xl font-semibold ${item.accentClassName}`}>{item.value}</div>
                                        <div className="mt-2 text-sm text-slate-200">{item.detail}</div>
                                    </Card>
                                </div>
                            ))}
                        </DashboardGrid>
                    </section>

                    <section>
                        <DashboardGrid>
                            <div className="col-span-8">
                                <Card className="h-full border-white/8 bg-slate-900/75 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.95)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Main Two-Column Row</div>
                                            <h2 className="mt-2 text-xl font-semibold text-white">Submission workspace</h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                The console keeps reviewer-facing work visible without turning the participant surface into a raw-data browser.
                                            </p>
                                        </div>
                                        <div className="rounded-[12px] border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-100">
                                            3 submissions need active monitoring
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        {submissionQueue.map(item => (
                                            <div key={item.title} className="rounded-[12px] border border-white/8 bg-slate-950/50 px-4 py-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="text-sm font-semibold text-white">{item.title}</div>
                                                        <div className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</div>
                                                    </div>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.statusClassName}`}>{item.status}</span>
                                                </div>
                                                <div className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-500">{item.owner}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            <div className="col-span-4">
                                <Card className="h-full border-white/8 bg-slate-900/75 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.95)]">
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Status Rail</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Trust and escrow posture</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        High-signal governance and payout details that help you decide what to clear next.
                                    </p>

                                    <div className="mt-6 space-y-4">
                                        {trustSummary.map(item => (
                                            <div key={item.label} className="rounded-[12px] border border-white/8 bg-slate-950/50 px-4 py-4">
                                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                                                <div className="mt-2 text-sm font-semibold text-slate-100">{item.value}</div>
                                                <div className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </DashboardGrid>
                    </section>

                    <section>
                        <DashboardGrid>
                            <div className="col-span-7">
                                <Card className="h-full border-white/8 bg-slate-900/75 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.95)]">
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Progress</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Contribution and compliance progress</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Keep the next reviewer handoff predictable by finishing the remaining submission and attestation steps.
                                    </p>

                                    <div className="mt-6 space-y-5">
                                        {progressItems.map(item => (
                                            <div key={item.label}>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-100">{item.label}</span>
                                                    <span className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.progress}</span>
                                                </div>
                                                <div className="h-2.5 rounded-full bg-slate-800">
                                                    <div className={`h-2.5 rounded-full ${item.widthClassName} ${item.toneClassName}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            <div className="col-span-5">
                                <Card className="h-full border-white/8 bg-slate-900/75 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.95)]">
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Timeline</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Recent milestones</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        A compact timeline of the moments that moved this participant workspace forward.
                                    </p>

                                    <div className="mt-6 space-y-4">
                                        {timelineItems.map((item, index) => (
                                            <div key={item.title} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.complete ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                                                    {index < timelineItems.length - 1 && <span className="mt-2 h-full w-px bg-slate-800" />}
                                                </div>
                                                <div className="pb-2">
                                                    <div className="text-sm font-semibold text-white">{item.title}</div>
                                                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.timestamp}</div>
                                                    <div className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </DashboardGrid>
                    </section>

                    <section className="sticky bottom-6 z-20">
                        <DashboardGrid>
                            <div className="col-span-12">
                                <Card className="border-cyan-500/20 bg-slate-900/90 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.85)] backdrop-blur-xl">
                                    <div className="grid grid-cols-12 items-center gap-6">
                                        <div className="col-span-3">
                                            <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Sticky Quick Actions</div>
                                            <h2 className="mt-2 text-lg font-semibold text-white">Keep the next approval moving</h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                Fast access to the actions participants use most when preparing governed delivery.
                                            </p>
                                        </div>

                                        <div className="col-span-9 grid grid-cols-4 gap-3">
                                            {quickActions.map(action => (
                                                <button
                                                    key={action.title}
                                                    className={`rounded-[12px] px-4 py-4 text-left transition-colors ${action.className}`}
                                                >
                                                    <div className="text-sm font-semibold">{action.title}</div>
                                                    <div className="mt-2 text-xs leading-5 opacity-80">{action.detail}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </DashboardGrid>
                    </section>
                </div>
            </div>
        </div>
    )
}

function DashboardGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`grid grid-cols-12 gap-6 ${className}`}>{children}</div>
}

function BannerSignal({ label, value, detail }: SummaryItem) {
    return (
        <div className="rounded-[12px] border border-white/10 bg-slate-950/45 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm font-semibold text-white">{value}</div>
            <div className="mt-2 text-sm leading-6 text-slate-400">{detail}</div>
        </div>
    )
}
