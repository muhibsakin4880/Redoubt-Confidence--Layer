import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'

type StatusTone = 'healthy' | 'monitoring' | 'scheduled'

type SummaryMetric = {
    label: string
    value: string
    detail: string
    tone: StatusTone
}

type WorkflowHealthItem = {
    title: string
    status: string
    tone: StatusTone
    impact: string
    metricLabel: string
    metricValue: string
}

type AdvisoryItem = {
    title: string
    tone: StatusTone
    workflow: string
    window: string
    nextUpdate: string
    detail: string
}

type GuidanceItem = {
    title: string
    detail: string
    tone: StatusTone
}

type TimelineItem = {
    title: string
    tone: 'resolved' | 'monitoring' | 'scheduled'
    timing: string
    detail: string
}

type TrustItem = {
    label: string
    value: string
    detail: string
}

type RoadmapItem = {
    label: string
    tone: StatusTone
}

type AlertPreference = {
    label: string
    detail: string
    defaultChecked?: boolean
}

type QuickLinkItem = {
    label: string
    detail: string
    to: string
}

const summaryMetrics: SummaryMetric[] = [
    {
        label: 'Workspace availability',
        value: '99.99%',
        detail: 'Participant console routes, navigation, and profile access are fully available.',
        tone: 'healthy'
    },
    {
        label: 'Upload and validation health',
        value: 'Stable',
        detail: 'Schema validation is completing within the normal window for queued submissions.',
        tone: 'healthy'
    },
    {
        label: 'Access review queue',
        value: '12 min',
        detail: 'Median acknowledgement time for new access-review submissions this morning.',
        tone: 'healthy'
    },
    {
        label: 'Governed session readiness',
        value: '4 rooms live',
        detail: 'Clean-room capacity is available for scheduled governed analysis sessions.',
        tone: 'healthy'
    },
    {
        label: 'Incidents in the last 7 days',
        value: '1',
        detail: 'One maintenance event required monitoring but did not block participant workflows.',
        tone: 'monitoring'
    }
]

const workflowHealth: WorkflowHealthItem[] = [
    {
        title: 'Identity and sign-in',
        status: 'Healthy',
        tone: 'healthy',
        impact: 'SSO, session refresh, and participant profile access are operating normally.',
        metricLabel: 'Median login time',
        metricValue: '4.8 sec'
    },
    {
        title: 'Dataset upload and validation',
        status: 'Healthy',
        tone: 'healthy',
        impact: 'Ingestion and schema checks are processing without a participant-facing delay.',
        metricLabel: 'Validation success',
        metricValue: '98.7%'
    },
    {
        title: 'Access review and approvals',
        status: 'Monitoring',
        tone: 'monitoring',
        impact: 'Approvals are moving, but handoff summaries are arriving slightly slower than usual.',
        metricLabel: 'Queue backlog',
        metricValue: '6 reviews'
    },
    {
        title: 'Governed analysis sessions',
        status: 'Healthy',
        tone: 'healthy',
        impact: 'Reserved clean-room sessions and governed notebooks are ready for scheduled work.',
        metricLabel: 'Ready capacity',
        metricValue: '4 of 5'
    },
    {
        title: 'Escrow and settlement processing',
        status: 'Healthy',
        tone: 'healthy',
        impact: 'Escrow holds, release triggers, and settlement routing are clearing on schedule.',
        metricLabel: 'Pending settlements',
        metricValue: '1 window'
    },
    {
        title: 'Audit logging and evidence export',
        status: 'Scheduled check',
        tone: 'scheduled',
        impact: 'Evidence export latency may briefly rise during tonight’s ledger compaction window.',
        metricLabel: 'Next maintenance',
        metricValue: '22:30 BDT'
    }
]

const advisories: AdvisoryItem[] = [
    {
        title: 'Evidence ledger compaction',
        tone: 'scheduled',
        workflow: 'Audit logging and evidence export',
        window: 'Apr 08, 2026 · 22:30 to 23:00 BDT',
        nextUpdate: 'Next update at 22:15 BDT',
        detail: 'Exports remain available, but bulk audit bundles may take longer to finalize while storage is compacted.'
    },
    {
        title: 'Access-review handoff latency',
        tone: 'monitoring',
        workflow: 'Access review and approvals',
        window: 'Started Apr 08, 2026 · 08:10 BDT',
        nextUpdate: 'Monitoring update at 10:30 BDT',
        detail: 'Participant-facing approvals still complete, though reviewer notes are syncing a few minutes later than target.'
    }
]

const participantGuidance: GuidanceItem[] = [
    {
        title: 'Uploads are safe to continue',
        detail: 'Dataset submission, validation, and packaging remain healthy, so new uploads do not need to be paused.',
        tone: 'healthy'
    },
    {
        title: 'Approvals may feel slightly slower',
        detail: 'Access requests are still moving, but you may see reviewer handoff summaries arrive after the initial decision.',
        tone: 'monitoring'
    },
    {
        title: 'Settlement timelines are unchanged',
        detail: 'Escrow release windows and settlement routing are not affected by the current advisory set.',
        tone: 'healthy'
    },
    {
        title: 'Plan evidence exports around tonight’s window',
        detail: 'If you need a large audit bundle, generate it before 22:30 BDT or wait until the maintenance window ends.',
        tone: 'scheduled'
    }
]

const incidentTimeline: TimelineItem[] = [
    {
        title: 'Access-review sync delay under observation',
        tone: 'monitoring',
        timing: 'Apr 08, 2026 · monitoring',
        detail: 'Reviewer-note replication is trailing the target SLA, but participant decisions and route access are unaffected.'
    },
    {
        title: 'Evidence ledger compaction scheduled',
        tone: 'scheduled',
        timing: 'Apr 08, 2026 · scheduled for 22:30 BDT',
        detail: 'A short maintenance window will reduce throughput for bulk evidence exports while governed ledgers are compacted.'
    },
    {
        title: 'Auth latency spike resolved',
        tone: 'resolved',
        timing: 'Apr 04, 2026 · resolved in 18 min',
        detail: 'Sign-in latency briefly rose during an identity-provider token refresh and recovered after failover routing was applied.'
    }
]

const trustItems: TrustItem[] = [
    {
        label: 'Control monitoring posture',
        value: 'Continuous monitoring active',
        detail: 'Alerting, audit trail verification, and workflow health thresholds are active across participant-facing surfaces.'
    },
    {
        label: 'Audit evidence freshness',
        value: 'Last refreshed 14 minutes ago',
        detail: 'Exportable evidence bundles and activity ledgers are current for routine participant and reviewer checks.'
    },
    {
        label: 'Governed environment note',
        value: 'Redistribution locked by default',
        detail: 'Governed workspaces continue to enforce attribution, workspace-only analysis, and controlled export paths.'
    }
]

const roadmapItems: RoadmapItem[] = [
    { label: 'SOC 2 Type II certified · Jan 2026', tone: 'healthy' },
    { label: 'HIPAA program review complete · Feb 2026', tone: 'healthy' },
    { label: 'ISO 27001 surveillance prep · Q3 2026', tone: 'scheduled' },
    { label: 'FedRAMP readiness workstream · Q4 2026', tone: 'scheduled' }
]

const alertPreferences: AlertPreference[] = [
    {
        label: 'Incidents and degradation',
        detail: 'Send an update when a participant-facing workflow enters monitoring or recovers.',
        defaultChecked: true
    },
    {
        label: 'Scheduled maintenance',
        detail: 'Send a reminder before planned windows that could affect uploads, evidence, or governed sessions.',
        defaultChecked: true
    },
    {
        label: 'Governance and trust updates',
        detail: 'Send updates when compliance milestones, monitoring posture, or workspace controls materially change.'
    }
]

const quickLinks: QuickLinkItem[] = [
    {
        label: 'Open datasets',
        detail: 'Check whether upload and validation health changes what you should submit next.',
        to: '/datasets'
    },
    {
        label: 'Review access requests',
        detail: 'See the current approval queue if the advisory mentions review latency.',
        to: '/access-requests'
    },
    {
        label: 'Visit escrow center',
        detail: 'Confirm release windows and settlement posture while the platform remains healthy.',
        to: '/escrow-center'
    }
]

const supportContact = {
    name: 'Maya Chen',
    role: 'Participant reliability lead',
    availability: 'Weekdays 08:00 to 18:00 BDT',
    responseTime: 'Typical response in under 30 minutes',
    email: 'support@redoubt.io'
}

const statusPageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const statusPageShellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const statusSectionClass = dashboardSpacingTokens['section-gap']
const statusSectionIntroClass = dashboardSpacingTokens['section-intro']
const statusPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] before:content-['']`
const statusCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const statusSoftCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['card-soft']} ${dashboardShadowTokens['shadow-card']}`
const statusHeroClass = `${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`
const statusActionButtonClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding']}`
const statusText = {
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

export default function StatusPage() {
    const handleAlertSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
    }

    return (
        <div className={statusPageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={statusPageShellClass}>
                <section className={statusSectionClass} aria-labelledby="platform-status-hero">
                    <div className={statusHeroClass}>
                        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-teal-400/12 blur-3xl" />
                        <div className="pointer-events-none absolute right-6 top-4 h-44 w-44 rounded-full bg-cyan-300/12 blur-3xl" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-[36%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />

                        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
                            <div>
                                <div className={statusText.heroEyebrow}>Platform Status</div>
                                <h1 id="platform-status-hero" className={`mt-2 ${statusText.heroTitle}`}>
                                    Workspace and platform health
                                </h1>
                                <p className={`mt-3 max-w-3xl ${statusText.bodyStrong}`}>
                                    See whether the participant platform is healthy, which workflows need extra attention, and what today’s advisories mean for uploads,
                                    approvals, governed sessions, and settlement work.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <HeroStatusChip tone="healthy" label="All participant-facing systems operational" />
                                    <HeroMetricChip label="90-day uptime" value="99.98%" />
                                    <HeroMetricChip label="Last update" value="09:42 BDT" />
                                    <HeroMetricChip label="Next maintenance" value="22:30 BDT" />
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <a href="#status-alerts" className={statusActionButtonClass}>
                                        Manage alert subscriptions
                                    </a>
                                    <a
                                        href={`mailto:${supportContact.email}?subject=Participant%20platform%20status`}
                                        className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`}
                                    >
                                        Contact support
                                    </a>
                                </div>
                            </div>

                            <div className={`${statusPanelClass} border-cyan-400/20 bg-[#0E1729]/88`}>
                                <div className={statusText.eyebrow}>Participant impact</div>
                                <h2 className={`mt-2 ${statusText.panelTitle}`}>What changes for your work today?</h2>
                                <p className={`mt-2 ${statusText.body}`}>
                                    No participant-facing outage is active. Uploads, governed sessions, and escrow workflows remain available while the team monitors a minor
                                    approval-sync delay and prepares a short evidence maintenance window.
                                </p>

                                <div className="mt-5 space-y-3">
                                    <ImpactCallout
                                        title="Continue uploads and governed analysis as planned"
                                        detail="The active advisory set does not require pausing dataset submissions or scheduled secure-room sessions."
                                        tone="healthy"
                                    />
                                    <ImpactCallout
                                        title="Review handoff notes may appear a bit later"
                                        detail="Access decisions are still being delivered on time, but reviewer commentary may land a few minutes after the initial decision."
                                        tone="monitoring"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={statusSectionClass} aria-labelledby="status-glance">
                    <div className={statusSectionIntroClass}>
                        <h2 id="status-glance" className={statusText.sectionTitle}>Today at a glance</h2>
                        <p className={`mt-2 ${statusText.body}`}>Fast-read health signals for the workflows participants rely on most.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {summaryMetrics.map(metric => (
                            <article key={metric.label} className={`min-h-[148px] ${statusSoftCardClass} transition-transform duration-200 hover:-translate-y-0.5`}>
                                <div className={statusText.eyebrow}>{metric.label}</div>
                                <div className={`mt-3 ${statusText.value}`}>{metric.value}</div>
                                <div className={`mt-3 ${statusText.metaStrong} ${getStatusToneMeta(metric.tone).textClassName}`}>{getToneLabel(metric.tone)}</div>
                                <p className={`mt-3 ${statusText.body}`}>{metric.detail}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={statusSectionClass} aria-labelledby="workflow-health">
                    <div className={statusSectionIntroClass}>
                        <h2 id="workflow-health" className={statusText.sectionTitle}>Workflow health</h2>
                        <p className={`mt-2 ${statusText.body}`}>Status cards are organized around participant tasks rather than backend-only infrastructure components.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        {workflowHealth.map(item => (
                            <article key={item.title} className={statusCardClass}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className={statusText.itemTitle}>{item.title}</div>
                                        <p className={`mt-2 ${statusText.body}`}>{item.impact}</p>
                                    </div>
                                    <StatusBadge tone={item.tone} label={item.status} />
                                </div>

                                <div className={`mt-5 ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                                    <div className={statusText.eyebrow}>{item.metricLabel}</div>
                                    <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-50">{item.metricValue}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={statusSectionClass} aria-labelledby="active-advisories">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
                        <StatusPanel
                            eyebrow="Operational context"
                            title="Active advisories"
                            description="Current monitoring items and scheduled windows that may change how you time participant work."
                            id="active-advisories"
                        >
                            <div className="space-y-4">
                                {advisories.map(item => (
                                    <article key={item.title} className={statusCardClass}>
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className={statusText.itemTitle}>{item.title}</div>
                                                <div className={`mt-2 ${statusText.meta}`}>{item.workflow}</div>
                                            </div>
                                            <StatusBadge tone={item.tone} label={getToneLabel(item.tone)} />
                                        </div>

                                        <p className={`mt-4 ${statusText.body}`}>{item.detail}</p>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className={`rounded-2xl border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                                                <div className={statusText.eyebrow}>Time window</div>
                                                <div className={`mt-2 ${statusText.bodyStrong}`}>{item.window}</div>
                                            </div>
                                            <div className={`rounded-2xl border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                                                <div className={statusText.eyebrow}>Next update</div>
                                                <div className={`mt-2 ${statusText.bodyStrong}`}>{item.nextUpdate}</div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </StatusPanel>

                        <StatusPanel
                            eyebrow="Participant guidance"
                            title="What this means for you"
                            description="Short guidance so you can decide whether to continue, wait, or route work differently."
                        >
                            <div className="space-y-3">
                                {participantGuidance.map(item => (
                                    <div key={item.title} className={`flex gap-3 ${statusCardClass} py-4`}>
                                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getStatusToneMeta(item.tone).dotClassName}`} aria-hidden="true" />
                                        <div>
                                            <div className={statusText.itemTitle}>{item.title}</div>
                                            <p className={`mt-2 ${statusText.body}`}>{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </StatusPanel>
                    </div>
                </section>

                <section className={statusSectionClass} aria-labelledby="incident-maintenance">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)]">
                        <StatusPanel
                            eyebrow="Incident history"
                            title="Recent incidents and maintenance"
                            description="A compact timeline of the most recent resolved, monitored, and scheduled reliability events."
                            id="incident-maintenance"
                        >
                            <div className="space-y-5">
                                {incidentTimeline.map((item, index) => (
                                    <TimelineEvent key={item.title} item={item} isLast={index === incidentTimeline.length - 1} />
                                ))}
                            </div>
                        </StatusPanel>

                        <StatusPanel
                            eyebrow="Trust and governance"
                            title="Trust and governance status"
                            description="Controls, evidence freshness, and roadmap milestones that reinforce participant confidence."
                        >
                            <div className="space-y-4">
                                {trustItems.map(item => (
                                    <article key={item.label} className={statusCardClass}>
                                        <div className={statusText.eyebrow}>{item.label}</div>
                                        <div className={`mt-2 ${statusText.itemTitle}`}>{item.value}</div>
                                        <p className={`mt-3 ${statusText.body}`}>{item.detail}</p>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-5">
                                <div className={statusText.eyebrow}>Compliance roadmap</div>
                                <div className="mt-3 flex flex-wrap gap-2.5">
                                    {roadmapItems.map(item => (
                                        <span
                                            key={item.label}
                                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${getStatusToneMeta(item.tone).badgeClassName}`}
                                        >
                                            <span className={`h-2 w-2 rounded-full ${getStatusToneMeta(item.tone).dotClassName}`} />
                                            {item.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </StatusPanel>
                    </div>
                </section>

                <section id="status-alerts" className={statusSectionClass} aria-labelledby="alerts-support">
                    <div className={statusSectionIntroClass}>
                        <h2 id="alerts-support" className={statusText.sectionTitle}>Alerts and support</h2>
                        <p className={`mt-2 ${statusText.body}`}>Subscribe to the signals you care about, or jump straight into the workflows most likely to be affected.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <StatusPanel
                            eyebrow="Notification preferences"
                            title="Get notified when participant workflows change"
                            description="This demo form stays local, but it shows the alert types participants typically subscribe to."
                        >
                            <form className="space-y-4" onSubmit={handleAlertSubmit}>
                                <label className="block">
                                    <span className={statusText.eyebrow}>Notification email</span>
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        className={`mt-2 w-full ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/55 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20`}
                                    />
                                </label>

                                <div className="grid gap-3">
                                    {alertPreferences.map(preference => (
                                        <label
                                            key={preference.label}
                                            className={`flex items-start gap-3 ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-4`}
                                        >
                                            <input
                                                type="checkbox"
                                                defaultChecked={preference.defaultChecked}
                                                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400/30"
                                            />
                                            <span>
                                                <span className={`block ${statusText.itemTitle}`}>{preference.label}</span>
                                                <span className={`mt-2 block ${statusText.body}`}>{preference.detail}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button type="submit" className={statusActionButtonClass}>
                                        Save notification preferences
                                    </button>
                                    <a
                                        href={`mailto:${supportContact.email}?subject=Status%20digest%20request`}
                                        className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`}
                                    >
                                        Request status digest
                                    </a>
                                </div>
                            </form>
                        </StatusPanel>

                        <div className="space-y-6">
                            <StatusPanel
                                eyebrow="Support contact"
                                title="Need help interpreting an advisory?"
                                description="Reach the participant reliability lead if a status update affects a live submission, approval, or governed session."
                            >
                                <div className={`rounded-[24px] border ${dashboardColorTokens['border-accent']} bg-cyan-400/[0.07] px-5 py-5`}>
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-[#0A1324]/90 text-sm font-semibold tracking-[0.12em] text-cyan-100">
                                            MC
                                        </span>
                                        <div className="min-w-0">
                                            <div className={statusText.panelTitle}>{supportContact.name}</div>
                                            <div className={`mt-2 ${statusText.bodyStrong} ${dashboardColorTokens['text-accent-soft']}`}>{supportContact.role}</div>
                                            <div className={`mt-4 ${statusText.meta}`}>{supportContact.availability}</div>
                                            <div className={statusText.meta}>{supportContact.responseTime}</div>
                                        </div>
                                    </div>

                                    <a href={`mailto:${supportContact.email}`} className={`mt-5 inline-flex ${statusActionButtonClass}`}>
                                        Email support
                                    </a>
                                </div>
                            </StatusPanel>

                            <StatusPanel
                                eyebrow="Quick links"
                                title="Open the workflows most likely to be affected"
                                description="Jump from status context into the participant tools you may need next."
                            >
                                <div className="space-y-3">
                                    {quickLinks.map(item => (
                                        <Link
                                            key={item.label}
                                            to={item.to}
                                            className={`block ${statusCardClass} transition-colors duration-200 hover:border-cyan-400/30`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className={statusText.itemTitle}>{item.label}</div>
                                                    <p className={`mt-2 ${statusText.body}`}>{item.detail}</p>
                                                </div>
                                                <span className="text-cyan-300" aria-hidden="true">
                                                    ↗
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </StatusPanel>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

function StatusPanel({
    eyebrow,
    title,
    description,
    children,
    id
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    id?: string
}) {
    return (
        <section className={statusPanelClass} aria-labelledby={id}>
            <div className={statusText.eyebrow}>{eyebrow}</div>
            <h2 id={id} className={`mt-2 ${statusText.panelTitle}`}>
                {title}
            </h2>
            <p className={`mt-2 ${statusText.body}`}>{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function HeroStatusChip({ label, tone }: { label: string; tone: StatusTone }) {
    const toneMeta = getStatusToneMeta(tone)

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${toneMeta.badgeClassName}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${toneMeta.dotClassName} ${tone === 'healthy' ? 'animate-pulse' : ''}`} />
            {label}
        </span>
    )
}

function HeroMetricChip({ label, value }: { label: string; value: string }) {
    return (
        <span className={`inline-flex items-center gap-2 ${dashboardRadiusTokens['radius-pill']} ${dashboardComponentTokens['metric-chip']} px-3 py-2 text-xs font-medium text-slate-200`}>
            <span className="uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className="text-slate-100">{value}</span>
        </span>
    )
}

function ImpactCallout({ title, detail, tone }: { title: string; detail: string; tone: StatusTone }) {
    const toneMeta = getStatusToneMeta(tone)

    return (
        <div className={`rounded-[24px] border px-4 py-4 ${toneMeta.surfaceClassName}`}>
            <div className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneMeta.dotClassName}`} aria-hidden="true" />
                <div>
                    <div className={statusText.itemTitle}>{title}</div>
                    <p className={`mt-2 ${statusText.body}`}>{detail}</p>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
    const toneMeta = getStatusToneMeta(tone)

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${toneMeta.badgeClassName}`}>
            <span className={`h-2 w-2 rounded-full ${toneMeta.dotClassName}`} />
            {label}
        </span>
    )
}

function TimelineEvent({ item, isLast }: { item: TimelineItem; isLast: boolean }) {
    const toneMeta = getTimelineToneMeta(item.tone)

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <span className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full border ${toneMeta.markerClassName}`} aria-hidden="true">
                    <TimelineMarker tone={item.tone} />
                </span>
                {!isLast && <span className={`mt-2 h-full w-px ${toneMeta.connectorClassName}`} />}
            </div>

            <article className={`flex-1 ${statusCardClass}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className={statusText.itemTitle}>{item.title}</div>
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-medium ${toneMeta.badgeClassName}`}>{toneMeta.label}</span>
                </div>
                <div className={`mt-2 ${statusText.meta}`}>{item.timing}</div>
                <p className={`mt-3 ${statusText.body}`}>{item.detail}</p>
            </article>
        </div>
    )
}

function TimelineMarker({ tone }: { tone: TimelineItem['tone'] }) {
    if (tone === 'resolved') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3.5 8.25 6.5 11l6-6.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (tone === 'monitoring') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.8" />
                <path d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        )
    }

    return <span className="h-2.5 w-2.5 rounded-full bg-current" />
}

function getToneLabel(tone: StatusTone) {
    switch (tone) {
        case 'monitoring':
            return 'Monitoring'
        case 'scheduled':
            return 'Scheduled'
        default:
            return 'Healthy'
    }
}

function getStatusToneMeta(tone: StatusTone) {
    switch (tone) {
        case 'monitoring':
            return {
                badgeClassName: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
                dotClassName: 'bg-amber-300',
                textClassName: 'text-amber-200',
                surfaceClassName: 'border-amber-500/25 bg-amber-500/8'
            }
        case 'scheduled':
            return {
                badgeClassName: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
                dotClassName: 'bg-cyan-300',
                textClassName: 'text-cyan-200',
                surfaceClassName: 'border-cyan-500/25 bg-cyan-500/8'
            }
        default:
            return {
                badgeClassName: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
                dotClassName: 'bg-emerald-300',
                textClassName: 'text-emerald-200',
                surfaceClassName: 'border-emerald-500/25 bg-emerald-500/8'
            }
    }
}

function getTimelineToneMeta(tone: TimelineItem['tone']) {
    switch (tone) {
        case 'monitoring':
            return {
                label: 'Monitoring',
                badgeClassName: 'border border-amber-500/30 bg-amber-500/10 text-amber-200',
                markerClassName: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
                connectorClassName: 'bg-gradient-to-b from-amber-400/60 to-slate-800'
            }
        case 'scheduled':
            return {
                label: 'Scheduled',
                badgeClassName: 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
                markerClassName: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-200',
                connectorClassName: 'bg-gradient-to-b from-cyan-400/60 to-slate-800'
            }
        default:
            return {
                label: 'Resolved',
                badgeClassName: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
                markerClassName: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
                connectorClassName: 'bg-gradient-to-b from-emerald-400/60 to-slate-800'
            }
    }
}
