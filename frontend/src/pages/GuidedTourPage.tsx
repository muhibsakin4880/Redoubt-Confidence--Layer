import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, type WorkspaceRole } from '../contexts/AuthContext'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'

type TourMode = WorkspaceRole
type SignalTone = 'healthy' | 'monitoring' | 'scheduled'
type StepPriority = 'core' | 'attention' | 'optional'
type StepGroup = 'Shared readiness' | 'Buyer workflow' | 'Provider workflow'
type StepState = 'completed' | 'recommended' | 'attention' | 'optional' | 'upcoming'

type GuidedStep = {
    id: string
    title: string
    description: string
    whyNow: string
    to: string
    ctaLabel: string
    group: StepGroup
    priority: StepPriority
    metricLabel: string
    metricValue: string
}

type ContextSignal = {
    label: string
    value: string
    detail: string
    tone: SignalTone
}

type BlockerItem = {
    title: string
    detail: string
    tone: SignalTone
}

type QuickLinkItem = {
    label: string
    detail: string
    to: string
}

type HelpItem = {
    label: string
    detail: string
    to: string
}

const STORAGE_GUIDED_TOUR_COMPLETED = 'Redoubt:guidedTour:completedSteps'
const STORAGE_GUIDED_TOUR_PERSONA_OVERRIDE = 'Redoubt:guidedTour:personaOverride'

const groupDescriptions: Record<StepGroup, string> = {
    'Shared readiness': 'Foundation work that keeps your profile, trust posture, and workspace context ready for live operations.',
    'Buyer workflow': 'Operational steps for requesting protected evaluation, setting usage boundaries, and moving governed analysis forward.',
    'Provider workflow': 'Operational steps for publishing data, handling incoming requests, and protecting governed delivery.'
}

const tourPageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const tourPageShellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const tourSectionClass = dashboardSpacingTokens['section-gap']
const tourSectionIntroClass = dashboardSpacingTokens['section-intro']
const tourPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] before:content-['']`
const tourCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const tourSoftCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['card-soft']} ${dashboardShadowTokens['shadow-card']}`
const tourHeroClass = `${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`
const tourActionButtonClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding']}`
const tourSecondaryButtonClass = `inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`
const tourText = {
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

export default function GuidedTourPage() {
    const { applicantEmail, workspaceRole } = useAuth()
    const location = useLocation()
    const routePrefix = location.pathname.startsWith('/demo') ? '/demo' : ''
    const [personaOverride, setPersonaOverride] = useState<TourMode | null>(() => {
        const stored = localStorage.getItem(STORAGE_GUIDED_TOUR_PERSONA_OVERRIDE)
        return isTourMode(stored) ? stored : null
    })
    const [completedStepIds, setCompletedStepIds] = useState<string[]>(() => {
        const stored = localStorage.getItem(STORAGE_GUIDED_TOUR_COMPLETED)
        if (!stored) return []

        try {
            const parsed = JSON.parse(stored)
            if (!Array.isArray(parsed)) return []
            return parsed.filter((value): value is string => typeof value === 'string')
        } catch {
            return []
        }
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_GUIDED_TOUR_COMPLETED, JSON.stringify(completedStepIds))
    }, [completedStepIds])

    useEffect(() => {
        if (personaOverride) {
            localStorage.setItem(STORAGE_GUIDED_TOUR_PERSONA_OVERRIDE, personaOverride)
            return
        }

        localStorage.removeItem(STORAGE_GUIDED_TOUR_PERSONA_OVERRIDE)
    }, [personaOverride])

    const stepLibrary = buildTourSteps(routePrefix)
    const selectedPersona = personaOverride ?? workspaceRole
    const currentSteps = stepLibrary[selectedPersona]
    const completedStepSet = new Set(completedStepIds)
    const groupedSteps = groupSteps(currentSteps)
    const recommendedStep = getRecommendedStep(currentSteps, completedStepSet)
    const completedCount = currentSteps.filter(step => completedStepSet.has(step.id)).length
    const totalSteps = currentSteps.length
    const remainingSteps = totalSteps - completedCount
    const completionPercent = totalSteps === 0 ? 0 : Math.round((completedCount / totalSteps) * 100)
    const contextSignals = buildContextSignals(selectedPersona, completedStepSet)
    const blockers = buildBlockers(currentSteps, completedStepSet)
    const quickLinks = buildQuickLinks(routePrefix, selectedPersona)
    const helpItems = buildHelpItems(routePrefix)
    const participantName = formatParticipantName(applicantEmail)
    const detectedRoleLabel = getTourModeLabel(workspaceRole)
    const selectedRoleLabel = getTourModeLabel(selectedPersona)
    const selectedRoleSummary = getTourModeSummary(selectedPersona)
    const nextStepTone = recommendedStep ? getSignalToneForPriority(recommendedStep.priority) : 'healthy'

    const toggleStepCompletion = (stepId: string) => {
        setCompletedStepIds(current => (
            current.includes(stepId)
                ? current.filter(item => item !== stepId)
                : [...current, stepId]
        ))
    }

    const handleSelectPersona = (mode: TourMode | 'auto') => {
        setPersonaOverride(mode === 'auto' ? null : mode)
    }

    const handleResetProgress = () => {
        setCompletedStepIds([])
    }

    return (
        <div className={tourPageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={tourPageShellClass}>
                <section className={tourSectionClass} aria-labelledby="guided-tour-hero">
                    <div className={tourHeroClass}>
                        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-teal-400/12 blur-3xl" />
                        <div className="pointer-events-none absolute right-6 top-4 h-44 w-44 rounded-full bg-cyan-300/12 blur-3xl" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-[36%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />

                        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.92fr)]">
                            <div>
                                <div className={tourText.heroEyebrow}>Guided Tour</div>
                                <h1 id="guided-tour-hero" className={`mt-2 ${tourText.heroTitle}`}>
                                    Guided workspace workflow
                                </h1>
                                <p className={`mt-3 max-w-3xl ${tourText.bodyStrong}`}>
                                    Use this page as a next-step hub for the participant console. It adapts to your workspace role, keeps progress across sessions, and points you
                                    to the operational tasks that matter most right now.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <HeroPill label={`${selectedRoleLabel} active`} tone="healthy" />
                                    <HeroMetricChip label="Detected workspace" value={detectedRoleLabel} />
                                    <HeroMetricChip label="Completed" value={`${completedCount}/${totalSteps}`} />
                                    <HeroMetricChip label="Remaining" value={`${remainingSteps}`} />
                                    <HeroMetricChip label="Next step" value={recommendedStep?.title ?? 'Review complete'} />
                                </div>

                                <div className={`mt-6 ${tourText.metaStrong}`}>Role view</div>
                                <div className="mt-3 flex flex-wrap gap-2.5">
                                    <PersonaToggle
                                        label={`Use workspace default (${detectedRoleLabel})`}
                                        active={personaOverride === null}
                                        onClick={() => handleSelectPersona('auto')}
                                    />
                                    <PersonaToggle
                                        label="Buyer view"
                                        active={selectedPersona === 'buyer' && personaOverride === 'buyer'}
                                        onClick={() => handleSelectPersona('buyer')}
                                    />
                                    <PersonaToggle
                                        label="Provider view"
                                        active={selectedPersona === 'provider' && personaOverride === 'provider'}
                                        onClick={() => handleSelectPersona('provider')}
                                    />
                                    <PersonaToggle
                                        label="Hybrid view"
                                        active={selectedPersona === 'hybrid' && personaOverride === 'hybrid'}
                                        onClick={() => handleSelectPersona('hybrid')}
                                    />
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {recommendedStep ? (
                                        <Link to={recommendedStep.to} className={tourActionButtonClass}>
                                            Resume where you left off
                                        </Link>
                                    ) : (
                                        <button type="button" onClick={handleResetProgress} className={tourActionButtonClass}>
                                            Review completed workflow
                                        </button>
                                    )}
                                    <a href="#guided-workflow" className={tourSecondaryButtonClass}>
                                        View guided workflow
                                    </a>
                                </div>
                            </div>

                            <TourPanel
                                eyebrow="Progress"
                                title="Your progress"
                                description={`${participantName} is currently in ${selectedRoleSummary}. Progress stays local so you can pick up where you left off.`}
                                className="border-cyan-400/20 bg-[#0E1729]/88"
                            >
                                <div className="space-y-4">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <ProgressStat label="Progress" value={`${completionPercent}%`} />
                                        <ProgressStat label="Completed steps" value={`${completedCount}`} />
                                        <ProgressStat label="Remaining steps" value={`${remainingSteps}`} />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className={tourText.metaStrong}>Completion bar</span>
                                            <span className={tourText.metaStrong}>{completedCount}/{totalSteps}</span>
                                        </div>
                                        <div className="mt-2 h-2.5 rounded-full bg-slate-950/70">
                                            <div className="h-2.5 rounded-full bg-cyan-400 transition-all duration-300" style={{ width: `${completionPercent}%` }} />
                                        </div>
                                    </div>

                                    <div className={`rounded-[24px] border px-4 py-4 ${getSignalToneMeta(nextStepTone).surfaceClassName}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className={tourText.eyebrow}>Recommended next</div>
                                                <div className={`mt-2 ${tourText.itemTitle}`}>{recommendedStep?.title ?? 'Core workflow complete'}</div>
                                                <p className={`mt-2 ${tourText.body}`}>
                                                    {recommendedStep?.whyNow ?? 'All required steps for this role are complete. Use the quick jumps to revisit any page as needed.'}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getSignalToneMeta(nextStepTone).badgeClassName}`}>
                                                <span className={`h-2 w-2 rounded-full ${getSignalToneMeta(nextStepTone).dotClassName}`} />
                                                {recommendedStep ? getPriorityLabel(recommendedStep.priority) : 'Complete'}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {recommendedStep ? (
                                                <Link to={recommendedStep.to} className={tourActionButtonClass}>
                                                    Open next step
                                                </Link>
                                            ) : null}
                                            <button type="button" onClick={handleResetProgress} className={tourSecondaryButtonClass}>
                                                Reset progress
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </TourPanel>
                        </div>
                    </div>
                </section>

                <section className={tourSectionClass} aria-labelledby="guided-tour-summary">
                    <div className={tourSectionIntroClass}>
                        <h2 id="guided-tour-summary" className={tourText.sectionTitle}>Operational summary</h2>
                        <p className={`mt-2 ${tourText.body}`}>
                            Compact signals show whether your profile, trust posture, access steps, and escrow readiness are in shape before you move deeper into the console.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {contextSignals.map(signal => (
                            <article key={signal.label} className={`${tourSoftCardClass} min-h-[154px]`}>
                                <div className={tourText.eyebrow}>{signal.label}</div>
                                <div className={`mt-3 ${tourText.value}`}>{signal.value}</div>
                                <div className={`mt-3 ${tourText.metaStrong} ${getSignalToneMeta(signal.tone).textClassName}`}>{getToneLabel(signal.tone)}</div>
                                <p className={`mt-3 ${tourText.body}`}>{signal.detail}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={tourSectionClass} aria-labelledby="guided-workflow">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
                        <TourPanel
                            eyebrow="Guided workflow"
                            title="Your next-step workflow"
                            description="Each card maps to a participant-console action. Completion is local to this workspace and persists until you reset it."
                            id="guided-workflow"
                        >
                            <div className="space-y-6">
                                {groupedSteps.map(group => (
                                    <section key={group.group}>
                                        <div className="flex flex-wrap items-end justify-between gap-3">
                                            <div>
                                                <h3 className={tourText.itemTitle}>{group.group}</h3>
                                                <p className={`mt-2 ${tourText.body}`}>{groupDescriptions[group.group]}</p>
                                            </div>
                                            <span className={`rounded-full border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-slate-300`}>
                                                {group.steps.filter(step => completedStepSet.has(step.id)).length}/{group.steps.length} complete
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                            {group.steps.map(step => (
                                                <StepCard
                                                    key={step.id}
                                                    step={step}
                                                    state={getStepState(step, completedStepSet, recommendedStep?.id)}
                                                    completed={completedStepSet.has(step.id)}
                                                    onToggle={() => toggleStepCompletion(step.id)}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </TourPanel>

                        <div className="space-y-6">
                            <TourPanel
                                eyebrow="Blockers"
                                title="Open blockers and follow-through"
                                description="The tour calls out the most important unfinished steps so you can clear the next bottleneck without scanning every page."
                            >
                                <div className="space-y-3">
                                    {blockers.map(item => (
                                        <article key={item.title} className={`rounded-[24px] border px-4 py-4 ${getSignalToneMeta(item.tone).surfaceClassName}`}>
                                            <div className="flex items-start gap-3">
                                                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getSignalToneMeta(item.tone).dotClassName}`} aria-hidden="true" />
                                                <div>
                                                    <div className={tourText.itemTitle}>{item.title}</div>
                                                    <p className={`mt-2 ${tourText.body}`}>{item.detail}</p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </TourPanel>

                            <TourPanel
                                eyebrow="Glossary and help"
                                title="Stay oriented while you move"
                                description="Use these links when you need definitions, trust context, or a fast status check without leaving the participant workflow entirely."
                            >
                                <div className="space-y-3">
                                    {helpItems.map(item => (
                                        <Link key={item.label} to={item.to} className={`block ${tourCardClass} transition-colors duration-200 hover:border-cyan-400/30`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className={tourText.itemTitle}>{item.label}</div>
                                                    <p className={`mt-2 ${tourText.body}`}>{item.detail}</p>
                                                </div>
                                                <span className="text-cyan-300" aria-hidden="true">↗</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </TourPanel>

                            <TourPanel
                                eyebrow="Quick jumps"
                                title="Open the pages you may need next"
                                description="These shortcuts stay role-aware so the tour still feels like an operational hub instead of a static feature list."
                            >
                                <div className="space-y-3">
                                    {quickLinks.map(item => (
                                        <Link key={item.label} to={item.to} className={`block ${tourCardClass} transition-colors duration-200 hover:border-cyan-400/30`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className={tourText.itemTitle}>{item.label}</div>
                                                    <p className={`mt-2 ${tourText.body}`}>{item.detail}</p>
                                                </div>
                                                <span className="text-cyan-300" aria-hidden="true">↗</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </TourPanel>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

type TourPanelProps = {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    id?: string
    className?: string
}

function TourPanel({ eyebrow, title, description, children, id, className = '' }: TourPanelProps) {
    return (
        <section className={`${tourPanelClass} ${className}`.trim()} aria-labelledby={id}>
            <div className={tourText.eyebrow}>{eyebrow}</div>
            <h2 id={id} className={`mt-2 ${tourText.panelTitle}`}>{title}</h2>
            <p className={`mt-2 ${tourText.body}`}>{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function HeroPill({ label, tone }: { label: string; tone: SignalTone }) {
    const toneMeta = getSignalToneMeta(tone)

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

function PersonaToggle({
    label,
    active,
    onClick
}: {
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                active
                    ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                    : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-cyan-400/30 hover:text-slate-100'
            }`}
        >
            {label}
        </button>
    )
}

function ProgressStat({ label, value }: { label: string; value: string }) {
    return (
        <div className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
            <div className={tourText.eyebrow}>{label}</div>
            <div className={`mt-2 ${tourText.itemTitle}`}>{value}</div>
        </div>
    )
}

function StepCard({
    step,
    state,
    completed,
    onToggle
}: {
    step: GuidedStep
    state: StepState
    completed: boolean
    onToggle: () => void
}) {
    const stateMeta = getStepStateMeta(state)

    return (
        <article className={`${tourCardClass} ${stateMeta.cardClassName}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className={tourText.eyebrow}>{step.group}</div>
                    <h4 className={`mt-2 ${tourText.itemTitle}`}>{step.title}</h4>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${stateMeta.badgeClassName}`}>
                    <span className={`h-2 w-2 rounded-full ${stateMeta.dotClassName}`} />
                    {stateMeta.label}
                </span>
            </div>

            <p className={`mt-3 ${tourText.body}`}>{step.description}</p>

            <div className={`mt-4 rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                <div className={tourText.eyebrow}>Why this matters now</div>
                <div className={`mt-2 ${tourText.bodyStrong}`}>{step.whyNow}</div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                    <div className={tourText.eyebrow}>{step.metricLabel}</div>
                    <div className={`mt-2 ${tourText.bodyStrong}`}>{step.metricValue}</div>
                </div>
                <div className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                    <div className={tourText.eyebrow}>Priority</div>
                    <div className={`mt-2 ${tourText.bodyStrong}`}>{getPriorityLabel(step.priority)}</div>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <Link to={step.to} className={state === 'recommended' ? tourActionButtonClass : tourSecondaryButtonClass}>
                    {completed ? 'Review step' : step.ctaLabel}
                </Link>
                <button
                    type="button"
                    onClick={onToggle}
                    aria-pressed={completed}
                    aria-label={completed ? `Mark ${step.title} incomplete` : `Mark ${step.title} complete`}
                    className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                        completed
                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400'
                            : 'border-slate-700 bg-slate-950/70 text-slate-200 hover:border-cyan-400/30 hover:text-cyan-100'
                    }`}
                >
                    {completed ? 'Completed' : 'Mark complete'}
                </button>
            </div>
        </article>
    )
}

function buildTourSteps(prefix: string): Record<TourMode, GuidedStep[]> {
    const sharedSteps: GuidedStep[] = [
        {
            id: 'shared-profile',
            title: 'Confirm participant profile and alert routing',
            description: 'Review verified identity, notification delivery, and default console preferences before live work starts to move through the workspace.',
            whyNow: 'Profile and alert settings determine who sees governance, status, and approval updates during active operations.',
            to: joinPath(prefix, '/profile'),
            ctaLabel: 'Open profile settings',
            group: 'Shared readiness',
            priority: 'core',
            metricLabel: 'Current posture',
            metricValue: 'Identity and preference hub'
        },
        {
            id: 'shared-status',
            title: 'Check platform readiness and advisories',
            description: 'Scan active incidents, maintenance windows, and workflow health so you know whether today’s work needs to be timed differently.',
            whyNow: 'A fast status review helps you avoid starting time-sensitive submissions or governed sessions during monitoring windows.',
            to: joinPath(prefix, '/status'),
            ctaLabel: 'Open platform status',
            group: 'Shared readiness',
            priority: 'optional',
            metricLabel: 'Focus area',
            metricValue: 'Incidents, maintenance, and workflow health'
        },
        {
            id: 'shared-trust',
            title: 'Review trust posture and passport readiness',
            description: 'Confirm your trust profile, verification band, and compliance passport before you depend on approvals or partner-facing workflows.',
            whyNow: 'A current trust posture reduces friction when access reviews, audits, or collaboration decisions depend on verified standing.',
            to: joinPath(prefix, '/trust-profile'),
            ctaLabel: 'Open trust profile',
            group: 'Shared readiness',
            priority: 'core',
            metricLabel: 'Verification band',
            metricValue: 'Trust profile and passport ready'
        }
    ]

    const buyerSteps: GuidedStep[] = [
        {
            id: 'buyer-datasets',
            title: 'Shortlist governed datasets and rights packages',
            description: 'Review dataset quality, coverage, and rights posture before you begin requesting protected evaluation for anything sensitive.',
            whyNow: 'Choosing the right governed dataset first reduces rework across requests, consent setup, and escrow timing.',
            to: joinPath(prefix, '/datasets'),
            ctaLabel: 'Open datasets',
            group: 'Buyer workflow',
            priority: 'core',
            metricLabel: 'Output',
            metricValue: 'Shortlist candidate datasets'
        },
        {
            id: 'buyer-dossier',
            title: 'Review the Evaluation Dossier',
            description: 'Open the deal workspace that binds dataset identity, provider packet, rights posture, approval state, evidence, and settlement readiness.',
            whyNow: 'The dossier is now the native operating surface between discovery and access request work, so buyers should inspect it before committing to deeper review.',
            to: joinPath(prefix, '/deals'),
            ctaLabel: 'Request Evaluation',
            group: 'Buyer workflow',
            priority: 'core',
            metricLabel: 'Deal spine',
            metricValue: 'Dataset, packet, rights, evidence, and readiness'
        },
        {
            id: 'buyer-access',
            title: 'Prepare an access request with clear purpose',
            description: 'Open the request queue and submit the rationale, intended usage, and reviewer context needed for fast approval.',
            whyNow: 'This is usually the next gating step for buyers, so the tour treats it as the highest-priority task once a dataset is shortlisted.',
            to: joinPath(prefix, '/access-requests'),
            ctaLabel: 'Open access requests',
            group: 'Buyer workflow',
            priority: 'attention',
            metricLabel: 'Review signal',
            metricValue: 'Purpose, reviewer notes, and org context'
        },
        {
            id: 'buyer-consent',
            title: 'Set consent and usage boundaries',
            description: 'Use the consent tracker to document purpose, expiration, redistribution limits, and governance conditions before analysis begins.',
            whyNow: 'Documenting usage boundaries early keeps approvals, audits, and renewals aligned to the same rules.',
            to: joinPath(prefix, '/consent-tracker'),
            ctaLabel: 'Open consent tracker',
            group: 'Buyer workflow',
            priority: 'core',
            metricLabel: 'Controls',
            metricValue: 'Usage scope and expiration guardrails'
        },
        {
            id: 'buyer-escrow',
            title: 'Monitor escrow and release milestones',
            description: 'Check held funds, release windows, and dispute timing before expecting delivery or governed-room access.',
            whyNow: 'Escrow readiness keeps the commercial path aligned with access timing so datasets or sessions are not released too early.',
            to: joinPath(prefix, '/escrow-center'),
            ctaLabel: 'Open escrow center',
            group: 'Buyer workflow',
            priority: 'core',
            metricLabel: 'Commercial posture',
            metricValue: 'Release window and settlement timing'
        },
        {
            id: 'buyer-audit',
            title: 'Capture audit evidence for your workspace',
            description: 'Verify that the audit trail reflects approved access, governed analysis, and evidence export activity for this workflow.',
            whyNow: 'Audit evidence is often optional during setup, but it becomes important when a reviewer or partner needs proof of compliant use.',
            to: joinPath(prefix, '/audit-trail'),
            ctaLabel: 'Open audit trail',
            group: 'Buyer workflow',
            priority: 'optional',
            metricLabel: 'Evidence type',
            metricValue: 'Access events and governance logs'
        }
    ]

    const providerSteps: GuidedStep[] = [
        {
            id: 'provider-datasets',
            title: 'Publish or update your governed dataset package',
            description: 'Use the dataset surface to upload changes, refresh metadata, and confirm the package still matches its governed delivery posture.',
            whyNow: 'Publishing a clean package first makes downstream request review, escrow release, and audit evidence much simpler.',
            to: joinPath(prefix, '/datasets'),
            ctaLabel: 'Open datasets',
            group: 'Provider workflow',
            priority: 'core',
            metricLabel: 'Package focus',
            metricValue: 'Schema, metadata, and governed delivery'
        },
        {
            id: 'provider-policy',
            title: 'Review incoming requests and policy gates',
            description: 'Open request activity to approve, reject, or clarify access based on purpose, organization posture, and governance fit.',
            whyNow: 'Incoming review is the most common provider bottleneck, so unresolved policy gates surface as attention-needed work.',
            to: joinPath(prefix, '/access-requests'),
            ctaLabel: 'Review request queue',
            group: 'Provider workflow',
            priority: 'attention',
            metricLabel: 'Decision focus',
            metricValue: 'Approvals, rejections, and review notes'
        },
        {
            id: 'provider-escrow',
            title: 'Confirm escrow release conditions',
            description: 'Verify payment posture, dispute state, and release controls before a delivery window opens for a buyer.',
            whyNow: 'This keeps dataset access and settlement in lockstep, especially when approvals complete near the release deadline.',
            to: joinPath(prefix, '/escrow-center'),
            ctaLabel: 'Open escrow center',
            group: 'Provider workflow',
            priority: 'core',
            metricLabel: 'Release guardrail',
            metricValue: 'Escrow-backed delivery timing'
        },
        {
            id: 'provider-audit',
            title: 'Verify audit evidence and export posture',
            description: 'Confirm access events, exports, and governed-room activity are logged before you respond to compliance or partner questions.',
            whyNow: 'Provider workflows often depend on proving delivery conditions and usage constraints after access has been granted.',
            to: joinPath(prefix, '/audit-trail'),
            ctaLabel: 'Open audit trail',
            group: 'Provider workflow',
            priority: 'core',
            metricLabel: 'Evidence scope',
            metricValue: 'Delivery, export, and access logs'
        }
    ]

    return {
        buyer: [...sharedSteps, ...buyerSteps],
        provider: [...sharedSteps, ...providerSteps],
        hybrid: [...sharedSteps, ...buyerSteps, ...providerSteps]
    }
}

function buildContextSignals(mode: TourMode, completedStepSet: Set<string>): ContextSignal[] {
    const profileReady = completedStepSet.has('shared-profile')
    const statusChecked = completedStepSet.has('shared-status')
    const trustReady = completedStepSet.has('shared-trust')
    const buyerAccessReady = completedStepSet.has('buyer-access')
    const buyerEscrowReady = completedStepSet.has('buyer-escrow')
    const providerReviewReady = completedStepSet.has('provider-policy')
    const providerEscrowReady = completedStepSet.has('provider-escrow')

    const sharedSignals: ContextSignal[] = [
        {
            label: 'Profile readiness',
            value: profileReady ? 'Ready' : 'Needs review',
            detail: profileReady
                ? 'Identity, alerts, and workspace defaults have been reviewed for this operating cycle.'
                : 'Review profile settings before relying on status, review, or governance alerts.',
            tone: profileReady ? 'healthy' : 'scheduled'
        },
        {
            label: 'Trust posture',
            value: trustReady ? 'Verified' : 'Open item',
            detail: trustReady
                ? 'Trust profile and compliance passport were already checked in this guided flow.'
                : 'Open the trust profile before you depend on approvals or external collaboration decisions.',
            tone: trustReady ? 'healthy' : 'monitoring'
        }
    ]

    if (mode === 'buyer') {
        return [
            ...sharedSignals,
            {
                label: 'Request readiness',
                value: buyerAccessReady ? 'Prepared' : 'Action needed',
                detail: buyerAccessReady
                    ? 'The access-request workflow has already been reviewed for this tour.'
                    : 'Open the request queue next if you are ready to move from shortlist to approval.',
                tone: buyerAccessReady ? 'healthy' : 'monitoring'
            },
            {
                label: 'Escrow posture',
                value: buyerEscrowReady ? 'Reviewed' : 'Pending',
                detail: buyerEscrowReady
                    ? 'Escrow timing and release conditions have been checked for the buyer workflow.'
                    : 'Review escrow timing before expecting governed-room access or release.',
                tone: buyerEscrowReady ? 'healthy' : 'scheduled'
            }
        ]
    }

    if (mode === 'provider') {
        return [
            ...sharedSignals,
            {
                label: 'Request review queue',
                value: providerReviewReady ? 'Triaged' : 'Needs attention',
                detail: providerReviewReady
                    ? 'Incoming request and policy review has been covered for this session.'
                    : 'Provider request review is the most likely next bottleneck if you have pending demand.',
                tone: providerReviewReady ? 'healthy' : 'monitoring'
            },
            {
                label: 'Escrow release',
                value: providerEscrowReady ? 'Ready' : 'Pending',
                detail: providerEscrowReady
                    ? 'Release and settlement timing have been checked against the current workflow.'
                    : 'Confirm escrow conditions before a buyer reaches the delivery window.',
                tone: providerEscrowReady ? 'healthy' : 'scheduled'
            }
        ]
    }

    return [
        ...sharedSignals,
        {
            label: 'Buyer path coverage',
            value: buyerAccessReady ? 'In motion' : 'Needs action',
            detail: buyerAccessReady
                ? 'The buyer-side request flow has already been reviewed inside the hybrid tour.'
                : 'Hybrid work still needs the buyer-side request step before governance review can stay aligned.',
            tone: buyerAccessReady ? 'healthy' : 'monitoring'
        },
        {
            label: 'Provider path coverage',
            value: providerReviewReady ? 'In motion' : 'Needs action',
            detail: providerReviewReady
                ? 'The provider-side review path has already been checked for this hybrid workflow.'
                : 'Review incoming requests and release posture so both sides of the hybrid workflow stay synchronized.',
            tone: providerReviewReady ? 'healthy' : 'monitoring'
        },
        {
            label: 'Platform awareness',
            value: statusChecked ? 'Current' : 'Check advisories',
            detail: statusChecked
                ? 'You already reviewed platform advisories and maintenance posture during this hybrid tour.'
                : 'Hybrid operators benefit from checking status early because one advisory can affect both buyer and provider tasks.',
            tone: statusChecked ? 'healthy' : 'scheduled'
        }
    ]
}

function buildBlockers(steps: GuidedStep[], completedStepSet: Set<string>): BlockerItem[] {
    const incompleteRequiredSteps = steps.filter(step => !completedStepSet.has(step.id) && step.priority !== 'optional')

    if (incompleteRequiredSteps.length === 0) {
        return [
            {
                title: 'No blockers currently open',
                detail: 'All required guided-tour steps for this role are complete. Use quick jumps to revisit any page without losing your progress.',
                tone: 'healthy'
            }
        ]
    }

    return incompleteRequiredSteps.slice(0, 3).map(step => ({
        title: step.priority === 'attention' ? `${step.title} needs attention` : `${step.title} is still open`,
        detail: step.whyNow,
        tone: step.priority === 'attention' ? 'monitoring' : 'scheduled'
    }))
}

function buildQuickLinks(prefix: string, mode: TourMode): QuickLinkItem[] {
    const commonLinks: QuickLinkItem[] = [
        {
            label: 'Profile & Settings',
            detail: 'Update identity, security, notifications, and console defaults from the account hub.',
            to: joinPath(prefix, '/profile')
        },
        {
            label: 'Platform Status',
            detail: 'Check advisories and maintenance before you begin time-sensitive participant work.',
            to: joinPath(prefix, '/status')
        }
    ]

    if (mode === 'buyer') {
        return [
            ...commonLinks,
            {
                label: 'Datasets',
                detail: 'Move from shortlist to governed dataset review and quality comparison.',
                to: joinPath(prefix, '/datasets')
            },
            {
                label: 'Access Requests',
                detail: 'Submit or track the request that usually becomes the next gating decision for buyers.',
                to: joinPath(prefix, '/access-requests')
            }
        ]
    }

    if (mode === 'provider') {
        return [
            ...commonLinks,
            {
                label: 'Datasets',
                detail: 'Update metadata, governed packaging, and publish state for your live dataset portfolio.',
                to: joinPath(prefix, '/datasets')
            },
            {
                label: 'Escrow Center',
                detail: 'Review settlement windows, release controls, and commercial readiness before delivery.',
                to: joinPath(prefix, '/escrow-center')
            }
        ]
    }

    return [
        ...commonLinks,
        {
            label: 'Access Requests',
            detail: 'Switch between buyer and provider review activity without leaving the hybrid operating flow.',
            to: joinPath(prefix, '/access-requests')
        },
        {
            label: 'Escrow Center',
            detail: 'Keep buyer release timing and provider delivery conditions aligned in one place.',
            to: joinPath(prefix, '/escrow-center')
        }
    ]
}

function buildHelpItems(prefix: string): HelpItem[] {
    return [
        {
            label: 'Open trust glossary',
            detail: 'Translate governance, consent, and compliance language into plain terms while you work through the guided flow.',
            to: joinPath(prefix, '/trust-glossary')
        },
        {
            label: 'Open compliance passport',
            detail: 'Review passport reuse and compliance readiness without turning the tour into a duplicate trust page.',
            to: joinPath(prefix, '/compliance-passport')
        },
        {
            label: 'Open trust profile',
            detail: 'Check your verification posture and trust band when the guided flow calls for a confidence check.',
            to: joinPath(prefix, '/trust-profile')
        }
    ]
}

function groupSteps(steps: GuidedStep[]) {
    return (['Shared readiness', 'Buyer workflow', 'Provider workflow'] as StepGroup[])
        .map(group => ({
            group,
            steps: steps.filter(step => step.group === group)
        }))
        .filter(group => group.steps.length > 0)
}

function getRecommendedStep(steps: GuidedStep[], completedStepSet: Set<string>) {
    return (
        steps.find(step => !completedStepSet.has(step.id) && step.priority === 'attention') ??
        steps.find(step => !completedStepSet.has(step.id) && step.priority === 'core') ??
        steps.find(step => !completedStepSet.has(step.id)) ??
        null
    )
}

function getStepState(step: GuidedStep, completedStepSet: Set<string>, recommendedStepId?: string): StepState {
    if (completedStepSet.has(step.id)) return 'completed'
    if (step.id === recommendedStepId) return 'recommended'
    if (step.priority === 'attention') return 'attention'
    if (step.priority === 'optional') return 'optional'
    return 'upcoming'
}

function getStepStateMeta(state: StepState) {
    switch (state) {
        case 'completed':
            return {
                label: 'Completed',
                badgeClassName: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
                dotClassName: 'bg-emerald-300',
                cardClassName: 'border-emerald-500/25 bg-emerald-500/[0.04]'
            }
        case 'recommended':
            return {
                label: 'Recommended next',
                badgeClassName: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
                dotClassName: 'bg-cyan-300',
                cardClassName: 'border-cyan-400/35 bg-cyan-500/[0.045]'
            }
        case 'attention':
            return {
                label: 'Attention needed',
                badgeClassName: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
                dotClassName: 'bg-amber-300',
                cardClassName: 'border-amber-500/25 bg-amber-500/[0.04]'
            }
        case 'optional':
            return {
                label: 'Optional',
                badgeClassName: 'border-slate-600 bg-slate-900/80 text-slate-200',
                dotClassName: 'bg-slate-400',
                cardClassName: ''
            }
        default:
            return {
                label: 'Upcoming',
                badgeClassName: 'border-slate-600 bg-slate-900/80 text-slate-200',
                dotClassName: 'bg-slate-400',
                cardClassName: ''
            }
    }
}

function getSignalToneMeta(tone: SignalTone) {
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

function getPriorityLabel(priority: StepPriority) {
    if (priority === 'attention') return 'Attention needed'
    if (priority === 'optional') return 'Optional'
    return 'Core step'
}

function getSignalToneForPriority(priority: StepPriority): SignalTone {
    if (priority === 'attention') return 'monitoring'
    if (priority === 'optional') return 'scheduled'
    return 'healthy'
}

function getToneLabel(tone: SignalTone) {
    if (tone === 'monitoring') return 'Monitoring'
    if (tone === 'scheduled') return 'Scheduled'
    return 'Healthy'
}

function getTourModeLabel(mode: TourMode) {
    if (mode === 'provider') return 'Provider workspace'
    if (mode === 'hybrid') return 'Hybrid workspace'
    return 'Buyer workspace'
}

function getTourModeSummary(mode: TourMode) {
    if (mode === 'provider') return 'a provider-led request, delivery, and audit workflow'
    if (mode === 'hybrid') return 'a combined buyer and provider operating workflow'
    return 'a buyer-led request, consent, and governed analysis workflow'
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

function isTourMode(value: string | null): value is TourMode {
    return value === 'buyer' || value === 'provider' || value === 'hybrid'
}

function joinPath(prefix: string, path: string) {
    return `${prefix}${path}`
}
