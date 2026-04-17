import type { ReactNode } from 'react'

import {
    participantOnboardingActiveStepTitles,
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
        helperBody: 'This is usually a lightweight intake step, but identity details should line up cleanly with your corporate footprint.',
        helperPoints: [
            'Use a verified corporate email tied to the submitting organization.',
            'Invite codes can accelerate routing, but the shell should still stand on its own.',
            'Downstream review inherits the identity record created here.'
        ]
    },
    {
        subtitle: 'Use Case',
        emphasis: 'standard',
        description: 'Capture operational context so reviewers understand how the platform will be used in practice.',
        helperBody: 'This step frames scope, intent, and expected usage patterns for the rest of the evaluation.',
        helperPoints: [
            'Describe the real operating environment, not a generic placeholder use case.',
            'The trust review will compare intended usage with the controls you select later.',
            'Clear scoping tends to shorten follow-up questions.'
        ]
    },
    {
        subtitle: 'Governance',
        emphasis: 'standard',
        description: 'Establish governance posture, participation intent, and the boundaries that apply to this request.',
        helperBody: 'Reviewers use this stage to understand whether the application fits the stated oversight model.',
        helperPoints: [
            'Policy acknowledgements and operating intent should stay internally consistent.',
            'This stage often clarifies who owns the request inside the organization.',
            'Well-scoped governance inputs reduce friction in final review.'
        ]
    },
    {
        subtitle: 'Verification',
        emphasis: 'trust-critical',
        description: 'Provide trust evidence, organizational proof points, and authentication controls used before access approval.',
        helperBody: 'This is a trust-critical checkpoint. Evidence quality and verification state matter more here than form completeness alone.',
        helperPoints: [
            'Identity signals, domain control, and uploaded evidence should reinforce each other.',
            'Verification steps can require coordination with IT, security, or compliance partners.',
            'Incomplete proof packages usually block final reviewer handoff.'
        ]
    },
    {
        subtitle: 'Review',
        emphasis: 'trust-critical',
        description: 'Validate the full submission package and confirm final commitments before it moves to manual review.',
        helperBody: 'This final stage is still trust-critical because it locks the review package that reviewers will evaluate.',
        helperPoints: [
            'Check that earlier inputs remain accurate before submission.',
            'Final attestations should match the evidence already provided.',
            'Once submitted, review generally proceeds from the preserved package.'
        ]
    },
    {
        subtitle: 'Submitted',
        emphasis: 'standard',
        description: 'Your onboarding package has been staged for review and the next actions are now operational rather than form-driven.',
        helperBody: 'At this point the shell shifts from input collection to transparency around review status and next steps.',
        helperPoints: [
            'The review queue now works from the package captured during onboarding.',
            'Verification completeness determines whether the package is ready for reviewer handoff.',
            'Status and next-step messaging should stay visible without backend coupling.'
        ]
    }
] as const

const canvasWidthClassName: Record<NonNullable<OnboardingPageLayoutProps['canvasWidth']>, string> = {
    compact: 'max-w-[860px]',
    standard: 'max-w-[980px]',
    wide: 'max-w-[1120px]',
    full: 'max-w-none'
}

const emphasisLabelMap: Record<NonNullable<OnboardingProgressStepMeta['emphasis']>, string> = {
    lightweight: 'Lightweight',
    standard: 'In-depth',
    'trust-critical': 'Trust-critical'
}

const emphasisDetailMap: Record<NonNullable<OnboardingProgressStepMeta['emphasis']>, string> = {
    lightweight: 'Foundational identity and intake signals',
    standard: 'Context reviewed alongside governance inputs',
    'trust-critical': 'Evidence and controls are reviewed before access is approved'
}

const emphasisPillClassName: Record<NonNullable<OnboardingProgressStepMeta['emphasis']>, string> = {
    lightweight: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
    standard: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
    'trust-critical': 'border-amber-400/35 bg-amber-500/10 text-amber-100'
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

    const defaultHelperPanelEnabled =
        showDefaultHelperPanel &&
        typeof activeStep === 'number' &&
        activeStep >= 1 &&
        activeStep <= participantOnboardingActiveStepTitles.length &&
        Boolean(currentStepMeta)

    const defaultHelperPanel =
        defaultHelperPanelEnabled && currentStepMeta ? (
            <div className="space-y-4">
                <section className="rounded-[26px] border border-white/10 bg-slate-900/75 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Current Lane
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                        <div>
                            <div className="text-lg font-semibold text-white">{currentStepMeta.subtitle}</div>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{currentStepMeta.helperBody}</p>
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
                </section>

                <section className="rounded-[26px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Review Signals
                    </div>
                    <ul className="mt-4 space-y-3 text-sm text-slate-300">
                        {currentStepMeta.helperPoints.map(point => (
                            <li key={point} className="flex gap-3">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-[26px] border border-white/10 bg-slate-900/65 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.18)]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Progress Snapshot
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Position</div>
                            <div className="mt-2 text-base font-semibold text-white">
                                Step {normalizedStep} of {visibleSteps.length}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Remaining</div>
                            <div className="mt-2 text-base font-semibold text-white">
                                {remainingSteps === 0 ? 'Final stage' : `${remainingSteps} step${remainingSteps === 1 ? '' : 's'}`}
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">
                        {emphasisDetailMap[currentEmphasis]}
                    </p>
                </section>
            </div>
        ) : null

    const resolvedHelperPanel = helperPanel ?? defaultHelperPanel
    const hasHelperPanel = Boolean(resolvedHelperPanel)
    const resolvedHeaderTitle = headerTitle ?? (normalizedStep ? visibleSteps[normalizedStep - 1] : participantOnboardingTitle)
    const resolvedHeaderSubtitle = headerSubtitle ?? currentStepMeta?.description ?? participantOnboardingSubtitle
    const resolvedHeaderWidthClassName =
        headerWidth === 'canvas' ? canvasWidthClassName[canvasWidth] : 'max-w-none'
    const resolvedEyebrow =
        pageEyebrow ??
        (normalizedStep
            ? `Participant onboarding · ${currentStepMeta?.subtitle ?? `Step ${normalizedStep}`}`
            : participantOnboardingTitle)

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_right,rgba(34,211,238,0.12),transparent_28%)]" />
            <div className="absolute inset-x-0 top-0 h-[520px] bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(2,6,23,0)_100%)]" />

            <div className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                <header
                    className={cx(
                        'rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94)_0%,rgba(2,6,23,0.88)_100%)] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-sm sm:p-8 lg:p-10',
                        resolvedHeaderWidthClassName,
                        headerWidth === 'canvas' && 'mx-auto'
                    )}
                >
                    <div className="min-w-0 max-w-5xl">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200/80">
                            {resolvedEyebrow}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            {normalizedStep && (
                                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                                    Step {normalizedStep} of {visibleSteps.length}
                                </span>
                            )}
                            {normalizedStep && (
                                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                    {remainingSteps === 0 ? 'Final stage' : `${remainingSteps} step${remainingSteps === 1 ? '' : 's'} remaining`}
                                </span>
                            )}
                            {currentStepMeta && (
                                <span
                                    className={cx(
                                        'inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                                        emphasisPillClassName[currentEmphasis]
                                    )}
                                >
                                    {emphasisLabelMap[currentEmphasis]}
                                </span>
                            )}
                        </div>

                        <div className="mt-5 max-w-4xl">
                            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.8rem] lg:leading-[1.05]">
                                {resolvedHeaderTitle}
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                                {resolvedHeaderSubtitle}
                            </p>
                        </div>
                    </div>

                    {headerActions && <div className="mt-6">{headerActions}</div>}

                    {typeof activeStep === 'number' && activeStep >= 1 && activeStep <= onboardingStepMeta.length && (
                        <div className="mt-8">
                            <OnboardingProgress
                                activeStep={activeStep}
                                steps={visibleSteps}
                                stepMeta={visibleStepMeta}
                                variant={progressVariant}
                            />
                        </div>
                    )}
                </header>

                <div className={cx('mt-8 grid gap-8', hasHelperPanel && 'xl:grid-cols-[minmax(0,1fr)_340px]')}>
                    <main
                        className={cx(
                            'min-w-0 w-full',
                            hasHelperPanel ? 'max-w-none' : `${canvasWidthClassName[canvasWidth]} mx-auto`
                        )}
                    >
                        {children}
                    </main>

                    {hasHelperPanel && <aside className="min-w-0 space-y-4">{resolvedHelperPanel}</aside>}
                </div>
            </div>
        </div>
    )
}
