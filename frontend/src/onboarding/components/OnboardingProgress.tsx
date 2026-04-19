export type OnboardingProgressStepEmphasis = 'lightweight' | 'standard' | 'trust-critical'

export type OnboardingProgressStepMeta = {
    subtitle?: string
    emphasis?: OnboardingProgressStepEmphasis
}

type OnboardingProgressProps = {
    activeStep: number
    steps: readonly string[]
    stepMeta?: readonly OnboardingProgressStepMeta[]
    variant?: 'grid' | 'connector'
}

const emphasisLabelMap: Record<OnboardingProgressStepEmphasis, string> = {
    lightweight: 'Lightweight',
    standard: 'In review',
    'trust-critical': 'Trust-critical'
}

const emphasisClassMap: Record<OnboardingProgressStepEmphasis, string> = {
    lightweight: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100',
    standard: 'border-slate-600/60 bg-slate-800/80 text-slate-200',
    'trust-critical': 'border-amber-400/30 bg-amber-500/10 text-amber-100'
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

export default function OnboardingProgress({
    activeStep,
    steps,
    stepMeta
}: OnboardingProgressProps) {
    if (steps.length === 0) {
        return null
    }

    const currentStep = Math.min(Math.max(activeStep, 1), steps.length)
    const remainingSteps = Math.max(steps.length - currentStep, 0)
    const progressPercentage = Math.round((currentStep / steps.length) * 100)

    return (
        <section className="rounded-[24px] border border-white/10 bg-slate-950/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Workflow progress
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="text-sm font-semibold text-white">
                            Step {currentStep} of {steps.length}
                        </div>
                        <div className="text-sm text-slate-400">
                            {remainingSteps === 0 ? 'Final stage' : `${remainingSteps} step${remainingSteps === 1 ? '' : 's'} remaining`}
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[280px]">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{progressPercentage}% complete</span>
                        <span>{Math.max(currentStep - 1, 0)} completed</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800/90">
                        <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(59,130,246,1)_0%,rgba(45,212,191,0.95)_100%)] transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto pb-1">
                <div className="grid min-w-[760px] gap-3 md:min-w-0 md:grid-cols-5">
                    {steps.map((title, idx) => {
                        const stepNumber = idx + 1
                        const meta = stepMeta?.[idx]
                        const subtitle = meta?.subtitle
                        const emphasis = meta?.emphasis ?? 'standard'
                        const done = stepNumber < currentStep
                        const active = stepNumber === currentStep

                        return (
                            <div
                                key={title}
                                className={cx(
                                    'rounded-[20px] border px-4 py-3 transition-all duration-200',
                                    done &&
                                        'border-emerald-400/30 bg-emerald-500/10 shadow-[0_14px_30px_rgba(16,185,129,0.08)]',
                                    active &&
                                        'border-blue-400/45 bg-blue-500/10 shadow-[0_16px_36px_rgba(59,130,246,0.12)]',
                                    !done && !active && 'border-white/8 bg-white/[0.03]'
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span
                                        className={cx(
                                            'inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold',
                                            done && 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
                                            active && 'border-blue-400/50 bg-blue-500/10 text-blue-100',
                                            !done && !active && 'border-slate-700 bg-slate-900/80 text-slate-400'
                                        )}
                                    >
                                        {done ? '✓' : stepNumber}
                                    </span>

                                    <span
                                        className={cx(
                                            'inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]',
                                            emphasisClassMap[emphasis]
                                        )}
                                    >
                                        {emphasisLabelMap[emphasis]}
                                    </span>
                                </div>

                                <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Step {stepNumber}
                                </div>
                                {subtitle && (
                                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                                        {subtitle}
                                    </div>
                                )}
                                <div className="mt-2 text-sm font-semibold leading-5 text-white">{title}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
