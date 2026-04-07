import type { ReactNode } from 'react'
import { Card } from '../components/Card'
import { useAuth } from '../contexts/AuthContext'

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
    const { accessStatus, applicantEmail, workspaceRole } = useAuth()
    const participantName = formatParticipantName(applicantEmail)
    const programStatusLabel = accessStatus === 'approved' ? 'Approved participant' : accessStatus === 'pending' ? 'Application pending' : 'Getting started'
    const nextMilestoneDate = accessStatus === 'approved' ? 'Apr 18, 2026' : accessStatus === 'pending' ? 'Apr 12, 2026' : 'Apr 09, 2026'
    const profileInitials = participantName
        .split(' ')
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('')

    return (
        <div className="min-h-screen bg-slate-950 px-6 py-6">
            <div className="overflow-x-auto">
                <div className="mx-auto min-w-[1024px] max-w-[1280px] space-y-6">
                    <section>
                        <DashboardGrid>
                            <header className="col-span-12 h-[72px]" aria-label="Participant console header">
                                <div className="flex h-full items-center justify-between gap-6 rounded-[12px] border border-white/8 bg-slate-900/75 px-5 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.95)]">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                                            aria-hidden="true"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15v10.5h-15V6.75z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.25h6" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25v3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Participant Console</div>
                                            <div className="mt-1 text-base font-semibold text-white">Redoubt Workspace</div>
                                        </div>
                                    </div>

                                    <nav className="flex items-center gap-3" aria-label="Console utilities">
                                        <button
                                            type="button"
                                            className="relative rounded-[12px] border border-white/10 bg-slate-900 px-3 py-2 text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white"
                                            aria-label="Open notifications"
                                        >
                                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.42L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-[12px] border border-white/10 bg-slate-900 px-3 py-2 text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white"
                                            aria-label="Open help and guidance"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 115.82 1c0 2-3 3-3 3" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-slate-900 px-3 py-2 text-left text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white"
                                            aria-label={`Open profile menu for ${participantName}`}
                                        >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-slate-950">
                                                {profileInitials}
                                            </span>
                                            <span>
                                                <span className="block text-sm font-medium text-slate-100">{participantName}</span>
                                                <span className="block text-xs capitalize text-slate-500">{workspaceRole} workspace</span>
                                            </span>
                                        </button>
                                    </nav>
                                </div>
                            </header>
                        </DashboardGrid>
                    </section>

                    <section>
                        <DashboardGrid>
                            <div className="col-span-12">
                                <section aria-labelledby="participant-intro-banner">
                                    <Card className="min-h-[96px] overflow-hidden border-cyan-500/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(17,24,39,0.86))] shadow-[0_22px_60px_-34px_rgba(6,182,212,0.5)]">
                                        <div className="grid min-h-[64px] grid-cols-12 items-center gap-6">
                                            <div className="col-span-7">
                                                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Intro Banner</p>
                                                <h2 id="participant-intro-banner" className="mt-2 text-2xl font-semibold text-white">
                                                    Welcome back, {participantName}
                                                </h2>
                                            </div>

                                            <div className="col-span-5 flex items-center justify-end gap-3">
                                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-100">
                                                    {programStatusLabel}
                                                </span>
                                                <div className="rounded-[12px] border border-white/10 bg-slate-950/45 px-4 py-3">
                                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Next milestone date</div>
                                                    <div className="mt-1 text-sm font-semibold text-slate-100">{nextMilestoneDate}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="rounded-[12px] bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                                                    aria-label="Continue where you left off in the participant console"
                                                >
                                                    Continue where you left off
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                </section>
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

function formatParticipantName(email: string) {
    if (!email) return 'Participant'

    const localPart = email.split('@')[0] ?? ''
    const segments = localPart
        .split(/[._-]+/)
        .map(segment => segment.trim())
        .filter(Boolean)

    if (segments.length === 0) return 'Participant'

    return segments
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
}
