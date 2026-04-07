import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'
import { getDashboardAtAGlanceCards } from '../data/dashboardAtAGlanceData'
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
    eyebrow: dashboardTypographyTokens['text-eyebrow'],
    heroEyebrow: dashboardTypographyTokens['text-hero-eyebrow'],
    heroTitle: dashboardTypographyTokens['text-hero-title'],
    sectionTitle: dashboardTypographyTokens['text-section-title'],
    panelTitle: dashboardTypographyTokens['text-panel-title'],
    itemTitle: dashboardTypographyTokens['text-item-title'],
    body: dashboardTypographyTokens['text-body'],
    bodyStrong: dashboardTypographyTokens['text-body-strong'],
    meta: dashboardTypographyTokens['text-muted'],
    metaStrong: dashboardTypographyTokens['text-muted-strong'],
    value: dashboardTypographyTokens['text-value']
} as const

const dashboardPageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const dashboardPageShellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const dashboardPanelClass = `${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']}`
const dashboardItemCardClass = `${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding']}`
const dashboardAccentCardClass = `${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-accent']} ${dashboardColorTokens['surface-accent']} ${dashboardSpacingTokens['card-padding']}`
const dashboardSoftCardClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['card-soft']} ${dashboardShadowTokens['shadow-card']}`
const dashboardActionButtonClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding']}`
const dashboardActionButtonTallClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding-tall']}`
const dashboardStripEmptyClass = `${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-card-soft']} ${dashboardSpacingTokens['card-padding']} ${dashboardShadowTokens['shadow-card']}`
const dashboardEmptyStateBaseClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['empty-border']}`
const dashboardSectionIntroClass = dashboardSpacingTokens['section-intro']
const dashboardModuleStackClass = dashboardSpacingTokens['stack-4']
const dashboardCompactStackClass = dashboardSpacingTokens['stack-3']
const dashboardGridGapClass = dashboardSpacingTokens['space-6']
const dashboardDenseGapClass = dashboardSpacingTokens['space-4']
const dashboardCompactGapClass = dashboardSpacingTokens['space-3']

const dashboardModuleFlags = {
    atAGlance: { isLoading: false, isEmpty: false },
    priority: { isLoading: false, isEmpty: false },
    upcomingSessions: { isLoading: false, isEmpty: false },
    checklist: { isLoading: false, isEmpty: false },
    announcements: { isLoading: false, isEmpty: false },
    quickLinks: { isLoading: false, isEmpty: false },
    support: { isLoading: false, isEmpty: false },
    progress: { isLoading: false, isEmpty: false },
    timeline: { isLoading: false, isEmpty: false }
} as const

export default function DashboardPage() {
    const dashboardAtAGlanceCards = getDashboardAtAGlanceCards()
    const completedChecklistItems = dashboardChecklistItems.filter(item => item.done).length
    const checklistProgress = Math.round((completedChecklistItems / dashboardChecklistItems.length) * 100)

    return (
        <div className={dashboardPageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={dashboardPageShellClass}>
                <section className={dashboardSpacingTokens['section-gap']} aria-labelledby="dashboard-intro-banner">
                    <div className={`${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`}>
                        <div className={`flex min-h-[88px] items-center justify-between ${dashboardGridGapClass}`}>
                            <div>
                                <h1 id="dashboard-intro-banner" className={dashboardText.heroTitle}>Welcome back, Demo</h1>
                                <p className={`mt-2 ${dashboardText.bodyStrong}`}>
                                    Continue managing trust, access, and escrow milestones from the same governed workspace.
                                </p>
                            </div>

                            <div className={`flex shrink-0 items-center ${dashboardCompactGapClass}`}>
                                <span className={`${dashboardRadiusTokens['radius-pill']} ${dashboardComponentTokens['status-badge']} ${dashboardSpacingTokens['chip-padding']}`}>
                                    Approved participant
                                </span>
                                <div className={`${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-overlay-soft']} ${dashboardSpacingTokens['card-padding-compact']}`}>
                                    <div className={dashboardText.eyebrow}>NEXT MILESTONE DATE: Apr 10, 2026</div>
                                </div>
                                <button
                                    type="button"
                                    className={dashboardActionButtonTallClass}
                                    aria-label="Continue where you left off in the participant dashboard"
                                >
                                    Continue where you left off
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={dashboardSpacingTokens['section-gap']} aria-labelledby="today-at-a-glance">
                    <div className={dashboardSectionIntroClass}>
                        <h2 id="today-at-a-glance" className={dashboardText.sectionTitle}>Today at a Glance</h2>
                        <p className={`mt-2 ${dashboardText.body}`}>Fast-read operating signals for the current participant session.</p>
                    </div>
                    <DashboardStateRenderer
                        isLoading={dashboardModuleFlags.atAGlance.isLoading}
                        isEmpty={dashboardModuleFlags.atAGlance.isEmpty}
                        loading={<DashboardAtAGlanceSkeleton />}
                        empty={
                            <DashboardStripEmptyState
                                icon="spark"
                                text="No glance metrics available yet. Start a session to populate today’s snapshot."
                                action={{ label: 'Browse datasets', to: '/datasets' }}
                            />
                        }
                    >
                        <div className={`grid grid-cols-5 ${dashboardCompactGapClass}`}>
                            {dashboardAtAGlanceCards.map(card => (
                                <article
                                    key={card.label}
                                    className={`flex min-h-[96px] flex-col justify-between ${dashboardSoftCardClass}`}
                                >
                                    <div className={dashboardText.eyebrow}>{card.label}</div>
                                    <div className={`mt-2 ${dashboardText.value}`}>{card.value}</div>
                                    <div className={`mt-2 ${dashboardText.metaStrong} ${card.toneClassName}`}>{card.trend}</div>
                                </article>
                            ))}
                        </div>
                    </DashboardStateRenderer>
                </section>

                <section aria-labelledby="dashboard-main-workspace">
                    <div className={dashboardSectionIntroClass}>
                        <h2 id="dashboard-main-workspace" className={dashboardText.sectionTitle}>Your working surface</h2>
                        <p className={`mt-2 ${dashboardText.body}`}>The highest-signal actions, sessions, tasks, and support options for this participant workspace.</p>
                    </div>

                    <div className={`grid grid-cols-12 ${dashboardGridGapClass}`}>
                        <div className={`col-span-8 ${dashboardModuleStackClass}`}>
                            <DashboardPanel
                                eyebrow="Priority"
                                title="What should I do next?"
                                description="Focus on the next three actions most likely to unblock approvals, releases, and trust refresh."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.priority.isLoading}
                                    isEmpty={dashboardModuleFlags.priority.isEmpty}
                                    loading={<DashboardListSkeleton count={3} />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="priority"
                                            text="No priority actions right now. Open your contribution queue to create one."
                                            action={{ label: 'Open contributions', to: '/contributions' }}
                                        />
                                    }
                                >
                                    <div className={dashboardModuleStackClass}>
                                        {dashboardPriorityActions.map((action, index) => (
                                            <div key={action.title} className={`flex items-center justify-between ${dashboardDenseGapClass} ${dashboardItemCardClass}`}>
                                                <div>
                                                    <div className={`${dashboardText.meta} mb-2`}>Priority {index + 1}</div>
                                                    <div className={dashboardText.itemTitle}>{action.title}</div>
                                                    <div className={`mt-2 ${dashboardText.body} ${action.toneClassName}`}>{action.detail}</div>
                                                </div>
                                                <Link
                                                    to={action.ctaTo}
                                                    className={`shrink-0 ${dashboardActionButtonClass}`}
                                                >
                                                    {action.ctaLabel}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Sessions"
                                title="Upcoming Sessions"
                                description="The next scheduled participant touchpoints across review, escrow, and compliance."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.upcomingSessions.isLoading}
                                    isEmpty={dashboardModuleFlags.upcomingSessions.isEmpty}
                                    loading={<DashboardListSkeleton count={3} />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="calendar"
                                            text="No upcoming sessions. Book one now."
                                            action={{ label: 'Book session', href: 'mailto:support@redoubt.io?subject=Book%20participant%20review%20session' }}
                                        />
                                    }
                                >
                                    <div className={dashboardModuleStackClass}>
                                        {dashboardUpcomingSessions.map(session => (
                                            <article key={session.title} className={dashboardItemCardClass}>
                                                <div className={`flex items-start justify-between ${dashboardCompactGapClass}`}>
                                                    <div>
                                                        <div className={dashboardText.itemTitle}>{session.title}</div>
                                                        <div className={`mt-2 ${dashboardText.meta}`}>{session.time}</div>
                                                    </div>
                                                    <span className={`${dashboardText.metaStrong} ${session.statusClassName}`}>{session.status}</span>
                                                </div>
                                                <p className={`mt-3 ${dashboardText.body}`}>{session.detail}</p>
                                            </article>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Checklist"
                                title="Task Checklist"
                                description="Progress across the tasks that keep the participant workspace moving toward release readiness."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.checklist.isLoading}
                                    isEmpty={dashboardModuleFlags.checklist.isEmpty}
                                    loading={<DashboardChecklistSkeleton />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="tasks"
                                            text="No checklist items right now. Review your trust profile for the next step."
                                            action={{ label: 'Open trust profile', to: '/trust-profile' }}
                                        />
                                    }
                                >
                                    <div className={dashboardItemCardClass}>
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className={dashboardText.itemTitle}>Completion progress</span>
                                            <span className={`${dashboardText.metaStrong} ${dashboardColorTokens['text-accent']}`}>{completedChecklistItems} of {dashboardChecklistItems.length} done</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800">
                                            <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${checklistProgress}%` }} />
                                        </div>
                                        <div className={`mt-2 ${dashboardText.meta}`}>{checklistProgress}% complete</div>
                                    </div>

                                    <div className={`mt-4 ${dashboardCompactStackClass}`}>
                                        {dashboardChecklistItems.map(item => (
                                            <div key={item.label} className={`flex items-start ${dashboardCompactGapClass} ${dashboardItemCardClass} py-3`}>
                                                <span
                                                    className={`mt-0 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                        item.done
                                                            ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                                                            : 'border-slate-600 bg-slate-800 text-slate-500'
                                                    }`}
                                                    aria-hidden="true"
                                                >
                                                    {item.done ? '✓' : ''}
                                                </span>
                                                <div>
                                                    <div className={dashboardText.itemTitle}>{item.label}</div>
                                                    <div className={`mt-2 ${dashboardText.meta}`}>{item.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>
                        </div>

                        <div className={`col-span-4 ${dashboardModuleStackClass}`}>
                            <DashboardPanel
                                eyebrow="Updates"
                                title="Announcements"
                                description="Short operational updates that affect review timing and governance expectations."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.announcements.isLoading}
                                    isEmpty={dashboardModuleFlags.announcements.isEmpty}
                                    loading={<DashboardListSkeleton count={2} />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="megaphone"
                                            text="No announcements right now. Check the audit trail later."
                                            action={{ label: 'Open audit trail', to: '/audit-trail' }}
                                        />
                                    }
                                >
                                    <div className={dashboardModuleStackClass}>
                                        {dashboardAnnouncements.map(announcement => (
                                            <article key={announcement.title} className={dashboardItemCardClass}>
                                                <div className={dashboardText.itemTitle}>{announcement.title}</div>
                                                <div className={`mt-2 ${dashboardText.body}`}>{announcement.detail}</div>
                                                <div className={`mt-2 ${dashboardText.meta}`}>{announcement.timing}</div>
                                            </article>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Links"
                                title="Resources / Quick Links"
                                description="Jump directly into the pages participants use most while managing trust and access."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.quickLinks.isLoading}
                                    isEmpty={dashboardModuleFlags.quickLinks.isEmpty}
                                    loading={<DashboardListSkeleton count={3} compact />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="links"
                                            text="No quick links configured. Open your profile to set them up."
                                            action={{ label: 'Open profile', to: '/profile' }}
                                        />
                                    }
                                >
                                    <div className={dashboardCompactStackClass}>
                                        {dashboardQuickLinks.map(link => (
                                            <Link
                                                key={link.label}
                                                to={link.to}
                                                className={`block ${dashboardItemCardClass} transition-colors hover:border-cyan-400/30 hover:bg-slate-900`}
                                            >
                                                <div className={`flex items-center justify-between ${dashboardCompactGapClass}`}>
                                                    <div className={dashboardText.itemTitle}>{link.label}</div>
                                                    <span className={dashboardColorTokens['text-accent']}>→</span>
                                                </div>
                                                <div className={`mt-2 ${dashboardText.meta}`}>{link.detail}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Support"
                                title="Support Contact"
                                description="Reach the participant support lead for blockers around approvals, sessions, and evidence packages."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.support.isLoading}
                                    isEmpty={dashboardModuleFlags.support.isEmpty}
                                    loading={<DashboardListSkeleton count={1} compact />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="support"
                                            text="No support contact assigned. Message the coordinator now."
                                            action={{ label: 'Message coordinator', href: 'mailto:support@redoubt.io?subject=Participant%20coordinator%20question' }}
                                        />
                                    }
                                >
                                    <div className={dashboardAccentCardClass}>
                                        <div className={dashboardText.panelTitle}>{dashboardSupportContact.name}</div>
                                        <div className={`mt-2 ${dashboardText.bodyStrong} ${dashboardColorTokens['text-accent-soft']}`}>{dashboardSupportContact.role}</div>
                                        <div className={`mt-4 ${dashboardText.meta}`}>{`${dashboardSupportContact.availability} / ${dashboardSupportContact.responseTime}`}</div>
                                        <a
                                            href={`mailto:${dashboardSupportContact.email}`}
                                            className={`mt-4 inline-flex ${dashboardActionButtonClass}`}
                                        >
                                            Contact support
                                        </a>
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>
                        </div>
                    </div>
                </section>

                <section className="mt-6" aria-labelledby="dashboard-progress-row">
                    <div className={dashboardSectionIntroClass}>
                        <h2 id="dashboard-progress-row" className={dashboardText.sectionTitle}>Progress and activity</h2>
                        <p className={`mt-2 ${dashboardText.body}`}>A compact view of operational momentum across readiness, evidence flow, and the next milestone states.</p>
                    </div>

                    <div className={`grid grid-cols-12 ${dashboardGridGapClass}`}>
                        <DashboardPanel
                            eyebrow="Progress"
                            title="Release momentum"
                            description="Placeholder visualizations for readiness, recent movement, and the pace of participant-side completion."
                            className="col-span-7"
                        >
                            <DashboardStateRenderer
                                isLoading={dashboardModuleFlags.progress.isLoading}
                                isEmpty={dashboardModuleFlags.progress.isEmpty}
                                loading={<DashboardProgressSkeleton />}
                                empty={
                                    <DashboardEmptyState
                                        icon="spark"
                                        text="No progress data yet. Upload a contribution to start tracking."
                                        action={{ label: 'Upload now', to: '/contributions' }}
                                    />
                                }
                            >
                                <div className={`grid grid-cols-[220px_minmax(0,1fr)] ${dashboardDenseGapClass}`}>
                                    <div className={dashboardItemCardClass}>
                                        <div className="flex items-center justify-between">
                                            <span className={dashboardText.itemTitle}>Readiness score</span>
                                            <span className={`${dashboardText.metaStrong} ${dashboardColorTokens['text-accent']}`}>78%</span>
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
                                                    <span className={dashboardText.value}>78%</span>
                                                    <span className={dashboardText.meta}>On track</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid gap-2">
                                            {dashboardProgressHighlights.map(highlight => (
                                                <div key={highlight.label} className="flex items-center justify-between rounded-lg border border-white/6 bg-slate-950/45 px-3 py-2">
                                                    <span className={dashboardText.meta}>{highlight.label}</span>
                                                    <span className={`${dashboardText.metaStrong} ${highlight.toneClassName}`}>{highlight.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={dashboardModuleStackClass}>
                                        <div className={dashboardItemCardClass}>
                                            <div className="flex items-center justify-between">
                                                <span className={dashboardText.itemTitle}>Readiness bars</span>
                                                <span className={dashboardText.meta}>Placeholder</span>
                                            </div>
                                            <div className="mt-4 space-y-4">
                                                <ProgressBarPlaceholder label="Compliance evidence" widthClassName="w-[82%]" toneClassName="bg-emerald-400" />
                                                <ProgressBarPlaceholder label="Reviewer feedback loop" widthClassName="w-[64%]" toneClassName="bg-cyan-400" />
                                                <ProgressBarPlaceholder label="Settlement preparation" widthClassName="w-[71%]" toneClassName="bg-amber-400" />
                                            </div>
                                        </div>

                                        <div className={dashboardItemCardClass}>
                                            <div className="flex items-center justify-between">
                                                <span className={dashboardText.itemTitle}>Activity sparkline</span>
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
                            </DashboardStateRenderer>
                        </DashboardPanel>

                        <DashboardPanel
                            eyebrow="Timeline"
                            title="Activity timeline"
                            description="Completed, in-progress, and upcoming milestones with clear state markers for quick scanning."
                            className="col-span-5"
                        >
                            <DashboardStateRenderer
                                isLoading={dashboardModuleFlags.timeline.isLoading}
                                isEmpty={dashboardModuleFlags.timeline.isEmpty}
                                loading={<DashboardTimelineSkeleton />}
                                empty={
                                    <DashboardEmptyState
                                        icon="timeline"
                                        text="No timeline events yet. Book one now."
                                        action={{ label: 'Book session', href: 'mailto:support@redoubt.io?subject=Book%20participant%20review%20session' }}
                                    />
                                }
                            >
                                <div className={dashboardModuleStackClass}>
                                    {dashboardActivityTimeline.map((item, index) => {
                                        const timelineState = getTimelineStateMeta(item.state)
                                        return (
                                            <div key={item.title} className={`flex ${dashboardDenseGapClass}`}>
                                                <div className="flex flex-col items-center">
                                                    <span
                                                        className={`flex h-9 w-9 items-center justify-center rounded-full border ${timelineState.markerClassName}`}
                                                        aria-hidden="true"
                                                    >
                                                        {timelineState.icon}
                                                    </span>
                                                    {index < dashboardActivityTimeline.length - 1 && <span className="mt-2 h-full w-px bg-slate-800" />}
                                                </div>
                                                <article className={`flex-1 ${dashboardItemCardClass}`}>
                                                    <div className={`flex items-start justify-between ${dashboardCompactGapClass}`}>
                                                        <div className={dashboardText.itemTitle}>{item.title}</div>
                                                        <span className={`rounded-full px-3 py-2 text-[11px] font-medium leading-none ${timelineState.badgeClassName}`}>
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
                            </DashboardStateRenderer>
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
            <div className="mt-4">{children}</div>
        </section>
    )
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
                <span className={dashboardText.itemTitle}>{label}</span>
                <span className={dashboardText.meta}>Placeholder</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
                <div className={`h-2 rounded-full ${widthClassName} ${toneClassName}`} />
            </div>
        </div>
    )
}

function getTimelineStateMeta(state: 'completed' | 'in_progress' | 'upcoming') {
    switch (state) {
        case 'completed':
            return {
                label: 'Completed',
                badgeClassName: dashboardColorTokens['state-completed-badge'],
                markerClassName: dashboardColorTokens['state-completed-marker'],
                icon: '✓'
            }
        case 'in_progress':
            return {
                label: 'In progress',
                badgeClassName: dashboardColorTokens['state-progress-badge'],
                markerClassName: dashboardColorTokens['state-progress-marker'],
                icon: '↻'
            }
        default:
            return {
                label: 'Upcoming',
                badgeClassName: dashboardColorTokens['state-upcoming-badge'],
                markerClassName: dashboardColorTokens['state-upcoming-marker'],
                icon: '•'
            }
    }
}

function DashboardStateRenderer({
    isLoading,
    isEmpty,
    loading,
    empty,
    children
}: {
    isLoading: boolean
    isEmpty: boolean
    loading: ReactNode
    empty: ReactNode
    children: ReactNode
}) {
    if (isLoading) return <>{loading}</>
    if (isEmpty) return <>{empty}</>
    return <>{children}</>
}

function DashboardStripEmptyState({
    icon,
    text,
    action
}: {
    icon: DashboardEmptyIconName
    text: string
    action: DashboardStateAction
}) {
    return (
        <div className={dashboardStripEmptyClass}>
            <DashboardEmptyState icon={icon} text={text} action={action} />
        </div>
    )
}

type DashboardStateAction = {
    label: string
    to?: string
    href?: string
    downloadName?: string
}

type DashboardEmptyIconName = 'spark' | 'calendar' | 'priority' | 'tasks' | 'megaphone' | 'links' | 'support' | 'timeline'

function DashboardEmptyState({
    icon,
    text,
    action,
    compact = false
}: {
    icon: DashboardEmptyIconName
    text: string
    action: DashboardStateAction
    compact?: boolean
}) {
    return (
        <div className={`flex flex-col items-start ${dashboardEmptyStateBaseClass} ${compact ? dashboardSpacingTokens['empty-padding-compact'] : dashboardSpacingTokens['card-padding']}`}>
            <span className={dashboardComponentTokens['icon-well']} aria-hidden="true">
                <DashboardEmptyIcon icon={icon} />
            </span>
            <p className={`mt-4 ${dashboardText.body}`}>{text}</p>
            <DashboardStateActionLink action={action} className="mt-4" />
        </div>
    )
}

function DashboardStateActionLink({
    action,
    className = ''
}: {
    action: DashboardStateAction
    className?: string
}) {
    const actionClassName = `inline-flex ${dashboardActionButtonClass} ${className}`.trim()

    if (action.to) {
        return (
            <Link to={action.to} className={actionClassName}>
                {action.label}
            </Link>
        )
    }

    return (
        <a href={action.href} download={action.downloadName} className={actionClassName}>
            {action.label}
        </a>
    )
}

function DashboardEmptyIcon({ icon }: { icon: DashboardEmptyIconName }) {
    switch (icon) {
        case 'calendar':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75v3M17.25 3.75v3M4.5 8.25h15M5.25 5.25h13.5A.75.75 0 0119.5 6v12.75a.75.75 0 01-.75.75H5.25A.75.75 0 014.5 18.75V6a.75.75 0 01.75-.75z" />
                </svg>
            )
        case 'priority':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l7.5 4.5v7.5L12 20.25l-7.5-4.5v-7.5L12 3.75z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v4.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.01" />
                </svg>
            )
        case 'tasks':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h10.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h10.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 17.25h10.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h.008v.008H4.5V6.75zM4.5 12h.008v.008H4.5V12zm0 5.25h.008v.008H4.5v-.008z" />
                </svg>
            )
        case 'megaphone':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.5h3l8.25-4.5v12l-8.25-4.5h-3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 13.5l1.5 4.5" />
                </svg>
            )
        case 'links':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13.5l3-3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 16.5l-1.5 1.5a3.182 3.182 0 104.5 4.5l1.5-1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5l1.5-1.5a3.182 3.182 0 10-4.5-4.5L12 3" />
                </svg>
            )
        case 'support':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 115.82 1c0 2-3 3-3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        case 'timeline':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.008v.008H6.75V6.75zm0 5.25h.008v.008H6.75V12zm0 5.25h.008v.008H6.75v-.008z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6.75h6.75M10.5 12h6.75M10.5 17.25h6.75" />
                </svg>
            )
        default:
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 15.75l4.5-4.5 3 3 6-7.5 2.25 2.25" />
                </svg>
            )
    }
}

function DashboardAtAGlanceSkeleton() {
    return (
        <div className={`grid grid-cols-5 ${dashboardCompactGapClass}`}>
            {Array.from({ length: 5 }).map((_, index) => (
                <DashboardSkeletonCard key={index} minHeightClassName="min-h-[96px]" />
            ))}
        </div>
    )
}

function DashboardListSkeleton({
    count,
    compact = false
}: {
    count: number
    compact?: boolean
}) {
    return (
        <div className={dashboardModuleStackClass}>
            {Array.from({ length: count }).map((_, index) => (
                <DashboardSkeletonCard key={index} minHeightClassName={compact ? 'min-h-[96px]' : 'min-h-[112px]'} />
            ))}
        </div>
    )
}

function DashboardChecklistSkeleton() {
    return (
        <div className={dashboardModuleStackClass}>
            <DashboardSkeletonCard minHeightClassName="min-h-[88px]" />
            <DashboardListSkeleton count={3} compact />
        </div>
    )
}

function DashboardProgressSkeleton() {
    return (
        <div className={`grid grid-cols-[220px_minmax(0,1fr)] ${dashboardDenseGapClass}`}>
            <DashboardSkeletonCard minHeightClassName="min-h-[324px]" />
            <div className={dashboardModuleStackClass}>
                <DashboardSkeletonCard minHeightClassName="min-h-[144px]" />
                <DashboardSkeletonCard minHeightClassName="min-h-[144px]" />
            </div>
        </div>
    )
}

function DashboardTimelineSkeleton() {
    return <DashboardListSkeleton count={3} />
}

function DashboardSkeletonCard({ minHeightClassName }: { minHeightClassName: string }) {
    return (
        <div className={`animate-pulse ${dashboardItemCardClass} ${minHeightClassName}`}>
            <div className="h-3 w-20 rounded bg-slate-700/80" />
            <div className="mt-4 h-6 w-2/3 rounded bg-slate-700/80" />
            <div className="mt-3 h-3 w-full rounded bg-slate-800" />
            <div className="mt-2 h-3 w-4/5 rounded bg-slate-800" />
        </div>
    )
}
