import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { dashboardAtAGlanceCards } from '../data/dashboardAtAGlanceData'
import {
    dashboardActivityTimeline,
    dashboardAnnouncements,
    dashboardChecklistItems,
    dashboardProgressHighlights,
    dashboardPriorityActions,
    dashboardQuickLinks,
    dashboardSupportContact,
    dashboardUpcomingSessions
} from '../data/dashboardPanelsData'

const dashboardText = {
    eyebrow: 'text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500',
    sectionTitle: 'text-xl font-bold text-white',
    panelTitle: 'text-lg font-semibold text-white',
    body: 'text-sm leading-6 text-slate-400',
    meta: 'text-xs text-slate-500'
}

const dashboardPanelClass =
    'rounded-2xl border border-white/10 bg-slate-800/30 p-5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.95)]'

export default function DashboardPage() {
    const { accessStatus, applicantEmail } = useAuth()
    const participantName = formatParticipantName(applicantEmail)
    const programStatusLabel = accessStatus === 'approved' ? 'Approved participant' : accessStatus === 'pending' ? 'Application pending' : 'Getting started'
    const nextMilestoneDate = accessStatus === 'approved' ? 'Apr 18, 2026' : accessStatus === 'pending' ? 'Apr 12, 2026' : 'Apr 09, 2026'
    const completedChecklistItems = dashboardChecklistItems.filter(item => item.done).length
    const checklistProgress = Math.round((completedChecklistItems / dashboardChecklistItems.length) * 100)

    return (
        <div className="relative min-h-screen bg-slate-900 text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(59,130,246,0.08),transparent_45%)]" />

            <div className="relative mx-auto max-w-[1680px] px-8 py-10 lg:px-12">
                <section className="mb-8" aria-labelledby="dashboard-intro-banner">
                    <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(17,24,39,0.86))] px-6 py-5 shadow-[0_22px_60px_-34px_rgba(6,182,212,0.5)]">
                        <div className="flex min-h-[88px] items-center justify-between gap-6">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Participant Workspace</p>
                                <h1 id="dashboard-intro-banner" className="mt-2 text-4xl font-bold tracking-tight text-white">
                                    Welcome back, {participantName}
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Continue managing trust, access, and escrow milestones from the same governed workspace.
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-100">
                                    {programStatusLabel}
                                </span>
                                <div className="rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Next milestone date</div>
                                    <div className="mt-1 text-sm font-semibold text-slate-100">{nextMilestoneDate}</div>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                                    aria-label="Continue where you left off in the participant dashboard"
                                >
                                    Continue where you left off
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-8" aria-labelledby="today-at-a-glance">
                    <div className="mb-4">
                        <h2 id="today-at-a-glance" className={dashboardText.sectionTitle}>Today at a Glance</h2>
                        <p className={`mt-1 ${dashboardText.body}`}>Fast-read operating signals for the current participant session.</p>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {dashboardAtAGlanceCards.map(card => (
                            <article
                                key={card.label}
                                className="flex min-h-[96px] flex-col justify-between rounded-xl border border-white/10 bg-slate-800/35 px-4 py-3 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.95)]"
                            >
                                <div className={dashboardText.eyebrow}>{card.label}</div>
                                <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{card.value}</div>
                                <div className={`mt-2 text-xs font-medium ${card.toneClassName}`}>{card.trend}</div>
                            </article>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="dashboard-main-workspace">
                    <div className="mb-4">
                        <h2 id="dashboard-main-workspace" className={dashboardText.sectionTitle}>Your working surface</h2>
                        <p className={`mt-1 ${dashboardText.body}`}>The highest-signal actions, sessions, tasks, and support options for this participant workspace.</p>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-8 space-y-5">
                            <DashboardPanel
                                eyebrow="Priority"
                                title="What should I do next?"
                                description="Focus on the next three actions most likely to unblock approvals, releases, and trust refresh."
                            >
                                <div className="space-y-4">
                                    {dashboardPriorityActions.map((action, index) => (
                                        <div key={action.title} className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4">
                                            <div>
                                                <div className={`${dashboardText.meta} mb-2`}>Priority {index + 1}</div>
                                                <div className="text-sm font-semibold text-white">{action.title}</div>
                                                <div className={`mt-2 text-sm ${action.toneClassName}`}>{action.detail}</div>
                                            </div>
                                            <Link
                                                to={action.ctaTo}
                                                className="shrink-0 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                                            >
                                                {action.ctaLabel}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Sessions"
                                title="Upcoming Sessions"
                                description="The next scheduled participant touchpoints across review, escrow, and compliance."
                            >
                                <div className="space-y-4">
                                    {dashboardUpcomingSessions.map(session => (
                                        <article key={session.title} className="rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{session.title}</div>
                                                    <div className={`mt-1 ${dashboardText.meta}`}>{session.time}</div>
                                                </div>
                                                <span className={`text-xs font-medium ${session.statusClassName}`}>{session.status}</span>
                                            </div>
                                            <p className={`mt-3 ${dashboardText.body}`}>{session.detail}</p>
                                        </article>
                                    ))}
                                </div>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Checklist"
                                title="Task Checklist"
                                description="Progress across the tasks that keep the participant workspace moving toward release readiness."
                            >
                                <div className="rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-white">Completion progress</span>
                                        <span className="text-xs font-medium text-cyan-300">{completedChecklistItems} of {dashboardChecklistItems.length} done</span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-slate-800">
                                        <div className="h-2.5 rounded-full bg-cyan-400" style={{ width: `${checklistProgress}%` }} />
                                    </div>
                                    <div className={`mt-2 ${dashboardText.meta}`}>{checklistProgress}% complete</div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {dashboardChecklistItems.map(item => (
                                        <div key={item.label} className="flex items-start gap-3 rounded-xl border border-white/8 bg-slate-900/65 px-4 py-3.5">
                                            <span
                                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                    item.done
                                                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                                                        : 'border-slate-600 bg-slate-800 text-slate-500'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                {item.done ? '✓' : ''}
                                            </span>
                                            <div>
                                                <div className="text-sm font-medium text-white">{item.label}</div>
                                                <div className={`mt-1 ${dashboardText.meta}`}>{item.detail}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DashboardPanel>
                        </div>

                        <div className="col-span-4 space-y-5">
                            <DashboardPanel
                                eyebrow="Updates"
                                title="Announcements"
                                description="Short operational updates that affect review timing and governance expectations."
                            >
                                <div className="space-y-4">
                                    {dashboardAnnouncements.map(announcement => (
                                        <article key={announcement.title} className="rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4">
                                            <div className="text-sm font-semibold text-white">{announcement.title}</div>
                                            <div className={`mt-2 ${dashboardText.body}`}>{announcement.detail}</div>
                                            <div className={`mt-2 ${dashboardText.meta}`}>{announcement.timing}</div>
                                        </article>
                                    ))}
                                </div>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Links"
                                title="Resources / Quick Links"
                                description="Jump directly into the pages participants use most while managing trust and access."
                            >
                                <div className="space-y-3">
                                    {dashboardQuickLinks.map(link => (
                                        <Link
                                            key={link.label}
                                            to={link.to}
                                            className="block rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4 transition-colors hover:border-cyan-400/30 hover:bg-slate-900"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-sm font-semibold text-white">{link.label}</div>
                                                <span className="text-cyan-300">→</span>
                                            </div>
                                            <div className={`mt-2 ${dashboardText.meta}`}>{link.detail}</div>
                                        </Link>
                                    ))}
                                </div>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Support"
                                title="Support Contact"
                                description="Reach the participant support lead for blockers around approvals, sessions, and evidence packages."
                            >
                                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 px-4 py-4">
                                    <div className="text-base font-semibold text-white">{dashboardSupportContact.name}</div>
                                    <div className="mt-1 text-sm text-cyan-200">{dashboardSupportContact.role}</div>
                                    <div className={`mt-4 ${dashboardText.meta}`}>{dashboardSupportContact.availability}</div>
                                    <div className={`mt-1 ${dashboardText.meta}`}>{dashboardSupportContact.responseTime}</div>
                                    <a
                                        href={`mailto:${dashboardSupportContact.email}`}
                                        className="mt-4 inline-flex rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                                    >
                                        Contact support
                                    </a>
                                </div>
                            </DashboardPanel>
                        </div>
                    </div>
                </section>

                <section className="mt-8" aria-labelledby="dashboard-progress-row">
                    <div className="mb-4">
                        <h2 id="dashboard-progress-row" className={dashboardText.sectionTitle}>Progress and activity</h2>
                        <p className={`mt-1 ${dashboardText.body}`}>A compact view of operational momentum across readiness, evidence flow, and the next milestone states.</p>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        <DashboardPanel
                            eyebrow="Progress"
                            title="Release momentum"
                            description="Placeholder visualizations for readiness, recent movement, and the pace of participant-side completion."
                            className="col-span-7"
                        >
                            <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5">
                                <div className="rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-white">Readiness score</span>
                                        <span className="text-xs font-medium text-cyan-300">78%</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-center">
                                        <div className="relative h-36 w-36">
                                            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                                                <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="44"
                                                    fill="none"
                                                    stroke="rgb(34 211 238)"
                                                    strokeWidth="12"
                                                    strokeLinecap="round"
                                                    strokeDasharray="216 276"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-semibold text-white">78%</span>
                                                <span className={dashboardText.meta}>On track</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-2">
                                        {dashboardProgressHighlights.map(highlight => (
                                            <div key={highlight.label} className="flex items-center justify-between rounded-lg border border-white/6 bg-slate-950/45 px-3 py-2">
                                                <span className={dashboardText.meta}>{highlight.label}</span>
                                                <span className={`text-xs font-medium ${highlight.toneClassName}`}>{highlight.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-white">Readiness bars</span>
                                            <span className={dashboardText.meta}>Placeholder</span>
                                        </div>
                                        <div className="mt-4 space-y-4">
                                            <ProgressBarPlaceholder label="Compliance evidence" widthClassName="w-[82%]" toneClassName="bg-emerald-400" />
                                            <ProgressBarPlaceholder label="Reviewer feedback loop" widthClassName="w-[64%]" toneClassName="bg-cyan-400" />
                                            <ProgressBarPlaceholder label="Settlement preparation" widthClassName="w-[71%]" toneClassName="bg-amber-400" />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-white">Activity sparkline</span>
                                            <span className={dashboardText.meta}>Last 7 checkpoints</span>
                                        </div>
                                        <div className="mt-4 rounded-lg border border-white/6 bg-slate-950/45 px-3 py-3">
                                            <svg className="h-24 w-full" viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden="true">
                                                <path d="M0 76H320" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
                                                <path d="M0 60L46 54L92 58L138 42L184 46L230 26L276 32L320 18" fill="none" stroke="rgb(34 211 238)" strokeWidth="3" strokeLinecap="round" />
                                                <path d="M0 60L46 54L92 58L138 42L184 46L230 26L276 32L320 18L320 96L0 96Z" fill="url(#sparkFill)" opacity="0.22" />
                                                <defs>
                                                    <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                                                        <stop offset="0%" stopColor="rgb(34 211 238)" />
                                                        <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className={`mt-2 ${dashboardText.meta}`}>Steady improvement in review throughput with a stronger close over the last two checkpoints.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DashboardPanel>

                        <DashboardPanel
                            eyebrow="Timeline"
                            title="Activity timeline"
                            description="Completed, in-progress, and upcoming milestones with clear state markers for quick scanning."
                            className="col-span-5"
                        >
                            <div className="space-y-4">
                                {dashboardActivityTimeline.map((item, index) => {
                                    const timelineState = getTimelineStateMeta(item.state)
                                    return (
                                        <div key={item.title} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    className={`flex h-9 w-9 items-center justify-center rounded-full border ${timelineState.markerClassName}`}
                                                    aria-hidden="true"
                                                >
                                                    {timelineState.icon}
                                                </span>
                                                {index < dashboardActivityTimeline.length - 1 && <span className="mt-2 h-full w-px bg-slate-800" />}
                                            </div>
                                            <article className="flex-1 rounded-xl border border-white/8 bg-slate-900/65 px-4 py-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="text-sm font-semibold text-white">{item.title}</div>
                                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${timelineState.badgeClassName}`}>
                                                        {timelineState.label}
                                                    </span>
                                                </div>
                                                <div className={`mt-2 ${dashboardText.meta}`}>{item.timing}</div>
                                                <p className={`mt-3 ${dashboardText.body}`}>{item.detail}</p>
                                            </article>
                                        </div>
                                    )
                                })}
                            </div>
                        </DashboardPanel>
                    </div>
                </section>
            </div>
        </div>
    )
}

function DashboardPanel({
    eyebrow,
    title,
    description,
    children,
    className = ''
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    className?: string
}) {
    return (
        <section className={`${dashboardPanelClass} ${className}`}>
            <div className={dashboardText.eyebrow}>{eyebrow}</div>
            <h3 className={`mt-2 ${dashboardText.panelTitle}`}>{title}</h3>
            <p className={`mt-2 ${dashboardText.body}`}>{description}</p>
            <div className="mt-5">{children}</div>
        </section>
    )
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

function ProgressBarPlaceholder({
    label,
    widthClassName,
    toneClassName
}: {
    label: string
    widthClassName: string
    toneClassName: string
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-white">{label}</span>
                <span className={dashboardText.meta}>Placeholder</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800">
                <div className={`h-2.5 rounded-full ${widthClassName} ${toneClassName}`} />
            </div>
        </div>
    )
}

function getTimelineStateMeta(state: 'completed' | 'in_progress' | 'upcoming') {
    switch (state) {
        case 'completed':
            return {
                label: 'Completed',
                badgeClassName: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
                markerClassName: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
                icon: '✓'
            }
        case 'in_progress':
            return {
                label: 'In progress',
                badgeClassName: 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
                markerClassName: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
                icon: '↻'
            }
        default:
            return {
                label: 'Upcoming',
                badgeClassName: 'border border-amber-500/30 bg-amber-500/10 text-amber-200',
                markerClassName: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
                icon: '•'
            }
    }
}
