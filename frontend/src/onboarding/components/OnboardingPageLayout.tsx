import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import {
    participantOnboardingActiveStepTitles,
    participantOnboardingPolicyLabel,
    participantOnboardingPolicyPath,
    participantOnboardingStepTitles,
    participantOnboardingSubtitle,
    participantOnboardingTitle
} from '../constants'
import OnboardingProgress, { type OnboardingProgressStepMeta } from './OnboardingProgress'

type OnboardingPageLayoutProps = {
    activeStep?: number
    children: ReactNode
    helperPanel?: ReactNode
    showDefaultHelperPanel?: boolean
    canvasWidth?: 'compact' | 'standard' | 'wide' | 'full'
    headerWidth?: 'canvas' | 'full'
    headerActions?: ReactNode
    headerSubtitle?: string
    headerTitle?: string
    pageEyebrow?: string
    progressVariant?: 'grid' | 'connector'
}

type OnboardingShellStepMeta = OnboardingProgressStepMeta & {
    description: string
    helperBody: string
    helperPoints: readonly string[]
}

const onboardingStepMeta: readonly OnboardingShellStepMeta[] = [
    {
        subtitle: 'Identity',
        emphasis: 'lightweight',
        description: 'Confirm your organization, role, and verified business identity before deeper review begins.',
        helperBody: 'This step anchors the request to a real person or organization before later verification and governance review.',
        helperPoints: [
            'Use the contact details that should receive any reviewer follow-up.',
            'Invite codes are optional, but can help route the request faster.',
            'Later steps inherit the identity record captured here.'
        ]
    },
    {
        subtitle: 'Use Case',
        emphasis: 'standard',
        description: 'Capture operational context so reviewers understand how the platform will be used in practice.',
        helperBody: 'Reviewers use this step to understand why access is being requested and who will use it.',
        helperPoints: [
            'Lead with the real operational goal, not a generic interest statement.',
            'Structured selections make triage faster than narrative alone.',
            'Keep the summary concise but specific enough for manual review.'
        ]
    },
    {
        subtitle: 'Governance',
        emphasis: 'standard',
        description: 'Establish governance posture, participation intent, and the boundaries that apply to this request.',
        helperBody: 'This step confirms the relationship to the platform and the governance obligations behind the request.',
        helperPoints: [
            'Participation mode should match the use case captured earlier.',
            'Governance confirmations should be completed by the accountable party.',
            'Purpose limitation matters before verification can move forward.'
        ]
    },
    {
        subtitle: 'Verification',
        emphasis: 'trust-critical',
        description: 'Provide trust evidence, organizational proof points, and authentication controls used before access approval.',
        helperBody: 'Verification is where the request becomes an evidence-backed packet for protected-access review.',
        helperPoints: [
            'Identity proof, evidence files, and authentication setup should reinforce each other.',
            'Incomplete packets usually delay reviewer handoff.',
            'Only upload documents directly relevant to this request.'
        ]
    },
    {
        subtitle: 'Review',
        emphasis: 'trust-critical',
        description: 'Validate the full submission package and confirm final commitments before it moves to manual review.',
        helperBody: 'The final step should read like a clean review packet rather than another long-form onboarding screen.',
        helperPoints: [
            'Confirm the summary still reflects the intended request.',
            'Use the edit actions to fix gaps before submitting.',
            'Final commitments lock the package that reviewers receive.'
        ]
    },
    {
        subtitle: 'Submitted',
        emphasis: 'standard',
        description: 'Your onboarding package has been staged for review and the next actions are now operational rather than form-driven.',
        helperBody: 'After submission, the flow should focus on status, timing, and next steps rather than more form scaffolding.',
        helperPoints: [
            'The review team now works from the preserved submission package.',
            'Status and timing should stay easy to scan.',
            'Trust Center access remains available for policy reference.'
        ]
    }
] as const

const canvasWidthClassName: Record<NonNullable<OnboardingPageLayoutProps['canvasWidth']>, string> = {
    compact: 'max-w-[840px]',
    standard: 'max-w-[960px]',
    wide: 'max-w-[1120px]',
    full: 'max-w-none'
}

const emphasisLabelMap: Record<NonNullable<OnboardingProgressStepMeta['emphasis']>, string> = {
    lightweight: 'Lightweight',
    standard: 'In review',
    'trust-critical': 'Trust-critical'
}

const emphasisPillClassName: Record<NonNullable<OnboardingProgressStepMeta['emphasis']>, string> = {
    lightweight: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100',
    standard: 'border-slate-600/60 bg-slate-800/90 text-slate-200',
    'trust-critical': 'border-amber-400/30 bg-amber-500/10 text-amber-100'
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

export default function OnboardingPageLayout({
    activeStep,
    children,
    helperPanel,
    showDefaultHelperPanel = true,
    canvasWidth = 'wide',
    headerWidth = 'full',
    headerActions,
    headerSubtitle,
    headerTitle,
    pageEyebrow,
    progressVariant = 'grid'
}: OnboardingPageLayoutProps) {
    const showingSubmissionStage =
        typeof activeStep === 'number' && activeStep > participantOnboardingActiveStepTitles.length
    const visibleSteps = showingSubmissionStage ? participantOnboardingStepTitles : participantOnboardingActiveStepTitles
    const visibleStepMeta = onboardingStepMeta.slice(0, visibleSteps.length)
    const normalizedStep =
        typeof activeStep === 'number'
            ? Math.min(Math.max(activeStep, 1), visibleSteps.length)
            : undefined
    const currentStepMeta = normalizedStep ? visibleStepMeta[normalizedStep - 1] : undefined
    const remainingSteps = normalizedStep ? Math.max(visibleSteps.length - normalizedStep, 0) : 0
    const currentEmphasis = currentStepMeta?.emphasis ?? 'standard'

    const resolvedHeaderTitle = headerTitle ?? (normalizedStep ? visibleSteps[normalizedStep - 1] : participantOnboardingTitle)
    const resolvedHeaderSubtitle = headerSubtitle ?? currentStepMeta?.description ?? participantOnboardingSubtitle
    const resolvedEyebrow =
        pageEyebrow ??
        (normalizedStep
            ? `Participant onboarding · ${currentStepMeta?.subtitle ?? `Step ${normalizedStep}`}`
            : participantOnboardingTitle)
    const resolvedHeaderWidthClassName =
        headerWidth === 'canvas' ? `${canvasWidthClassName[canvasWidth]} mx-auto` : 'max-w-none'

    const defaultHelperPanelEnabled =
        showDefaultHelperPanel &&
        typeof activeStep === 'number' &&
        activeStep >= 1 &&
        activeStep <= participantOnboardingActiveStepTitles.length &&
        Boolean(currentStepMeta)

    const defaultHelperPanel =
        defaultHelperPanelEnabled && currentStepMeta ? (
            <div className="space-y-4">
                <section className="rounded-[24px] border border-white/10 bg-slate-950/78 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Current lane
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">{currentStepMeta.subtitle}</div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{currentStepMeta.helperBody}</p>
                        </div>
                        <span
                            className={cx(
                                'inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                                emphasisPillClassName[currentEmphasis]
                            )}
                        >
                            {emphasisLabelMap[currentEmphasis]}
                        </span>
                    </div>

                    <ul className="mt-4 space-y-3 text-sm text-slate-300">
                        {currentStepMeta.helperPoints.map((point) => (
                            <li key={point} className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-[24px] border border-white/10 bg-slate-950/72 p-5 shadow-[0_16px_36px_rgba(2,6,23,0.18)]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Progress snapshot
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Position</div>
                            <div className="mt-2 text-sm font-semibold text-white">
                                Step {normalizedStep} of {visibleSteps.length}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Remaining</div>
                            <div className="mt-2 text-sm font-semibold text-white">
                                {remainingSteps === 0 ? 'Final stage' : `${remainingSteps} step${remainingSteps === 1 ? '' : 's'}`}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        ) : null

    const resolvedHelperPanel = helperPanel ?? defaultHelperPanel
    const hasHelperPanel = Boolean(resolvedHelperPanel)

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_right,rgba(34,211,238,0.08),transparent_30%)]" />
            <div className="absolute inset-x-0 top-0 h-[360px] bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(2,6,23,0)_100%)]" />

            <div className="relative mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-slate-950/78 px-4 py-3 shadow-[0_20px_45px_rgba(2,6,23,0.28)] backdrop-blur-md sm:px-5">
                    <div className="flex min-w-0 items-center gap-4">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-400/25 bg-cyan-400/10 text-base font-bold text-cyan-100">
                                R
                            </div>
                            <div className="min-w-0">
                                <div
                                    className="bg-gradient-to-b from-white via-cyan-100 to-[#67E8F9] bg-clip-text text-sm font-extrabold uppercase tracking-[0.18em] text-transparent"
                                    style={{ fontFamily: "'Syne', 'Inter', system-ui, -apple-system, sans-serif" }}
                                >
                                    Redoubt
                                </div>
                                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    {participantOnboardingTitle}
                                </div>
                            </div>
                        </Link>

                        {normalizedStep && currentStepMeta && (
                            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 md:inline-flex">
                                <span>Step {normalizedStep} of {visibleSteps.length}</span>
                                <span className="text-slate-600">•</span>
                                <span>{currentStepMeta.subtitle}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            to={participantOnboardingPolicyPath}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
                            aria-label={participantOnboardingPolicyLabel}
                        >
                            Trust Center
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 transition-colors hover:border-white/20 hover:text-white"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

                <div className={cx('grid gap-6', hasHelperPanel && 'xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start')}>
                    <main
                        className={cx(
                            'min-w-0 w-full',
                            hasHelperPanel ? 'max-w-none' : `${canvasWidthClassName[canvasWidth]} mx-auto`
                        )}
                    >
                        <header
                            className={cx(
                                'rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94)_0%,rgba(2,6,23,0.88)_100%)] p-5 shadow-[0_28px_70px_rgba(2,6,23,0.34)] backdrop-blur-sm sm:p-6 lg:p-7',
                                resolvedHeaderWidthClassName
                            )}
                        >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 max-w-4xl">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200/80">
                                        {resolvedEyebrow}
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        {normalizedStep && (
                                            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                                                Step {normalizedStep} of {visibleSteps.length}
                                            </span>
                                        )}
                                        {normalizedStep && (
                                            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                {remainingSteps === 0 ? 'Final stage' : `${remainingSteps} step${remainingSteps === 1 ? '' : 's'} remaining`}
                                            </span>
                                        )}
                                        {currentStepMeta && (
                                            <span
                                                className={cx(
                                                    'inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                                                    emphasisPillClassName[currentEmphasis]
                                                )}
                                            >
                                                {emphasisLabelMap[currentEmphasis]}
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.35rem] lg:text-[2.7rem] lg:leading-[1.05]">
                                        {resolvedHeaderTitle}
                                    </h1>
                                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                                        {resolvedHeaderSubtitle}
                                    </p>
                                </div>

                                {headerActions && <div className="shrink-0">{headerActions}</div>}
                            </div>

                            {typeof activeStep === 'number' && activeStep >= 1 && activeStep <= onboardingStepMeta.length && (
                                <div className="mt-6">
                                    <OnboardingProgress
                                        activeStep={activeStep}
                                        steps={visibleSteps}
                                        stepMeta={visibleStepMeta}
                                        variant={progressVariant}
                                    />
                                </div>
                            )}
                        </header>

                        <div className="mt-6">{children}</div>
                    </main>

                    {hasHelperPanel && (
                        <aside className="min-w-0 self-start xl:sticky xl:top-6">
                            {resolvedHelperPanel}
                        </aside>
                    )}
                </div>
            </div>
        </div>
    )
}
