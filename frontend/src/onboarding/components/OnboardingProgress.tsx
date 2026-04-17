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
    standard: 'In Review',
    'trust-critical': 'Trust-Critical'
}

const emphasisClassMap: Record<OnboardingProgressStepEmphasis, string> = {
    lightweight: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
    standard: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
    'trust-critical': 'border-amber-400/35 bg-amber-500/10 text-amber-100'
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

export default function OnboardingProgress({
    activeStep,
    steps,
    stepMeta,
    variant = 'grid'
}: OnboardingProgressProps) {
    if (steps.length === 0) {
        return null
    }

    const currentStep = Math.min(Math.max(activeStep, 1), steps.length)
    const remainingSteps = Math.max(steps.length - currentStep, 0)
    const progressPercentage = Math.round((currentStep / steps.length) * 100)
    const completedSteps = Math.max(currentStep - 1, 0)

    const cards = steps.map((title, idx) => {
        const stepNumber = idx + 1
        const meta = stepMeta?.[idx]
        const subtitle = meta?.subtitle
        const emphasis = meta?.emphasis ?? 'standard'
        const done = stepNumber < activeStep
        const active = stepNumber === activeStep

        return (
            <div
                key={title}
                className={cx(
                    'relative flex min-h-[182px] flex-col rounded-2xl border px-4 py-4 transition-all duration-200',
                    done &&
                        'border-emerald-400/35 bg-[linear-gradient(180deg,rgba(16,185,129,0.18)_0%,rgba(2,6,23,0.84)_100%)] shadow-[0_16px_36px_rgba(16,185,129,0.08)]',
                    active &&
                        'border-blue-400/55 bg-[linear-gradient(180deg,rgba(37,99,235,0.20)_0%,rgba(15,23,42,0.92)_100%)] shadow-[0_22px_44px_rgba(37,99,235,0.16)]',
                    !done && !active && 'border-slate-800 bg-slate-950/75'
                )}
            >
                <div className="flex items-start justify-between gap-3">
                    <div
                        className={cx(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold',
                            done && 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
                            active &&
                                'border-blue-300/60 bg-blue-400/10 text-blue-100 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]',
                            !done && !active && 'border-slate-700 bg-slate-900 text-slate-400'
                        )}
                    >
                        {done ? (
                            <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.6"
                            >
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            stepNumber
                        )}
                    </div>

                    <span
                        className={cx(
                            'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                            emphasisClassMap[emphasis]
                        )}
                    >
                        {emphasisLabelMap[emphasis]}
                    </span>
                </div>

                <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Step {stepNumber}
                </div>

                {subtitle && (
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                        {subtitle}
                    </div>
                )}

                <div className="mt-2 text-sm font-semibold leading-5 text-white">{title}</div>
            </div>
        )
    })

    return (
        <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Workflow Progress
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="text-base font-semibold text-white">
                            Step {currentStep} of {steps.length}
                        </div>
                        <div className="text-sm text-slate-400">
                            {remainingSteps === 0 ? 'Final stage' : `${remainingSteps} step${remainingSteps === 1 ? '' : 's'} remaining`}
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[320px]">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{progressPercentage}% through flow</span>
                        <span>{completedSteps} completed stages</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800/90">
                        <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(96,165,250,1)_0%,rgba(103,232,249,0.95)_55%,rgba(110,231,183,0.95)_100%)] transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {variant === 'connector' ? (
                <div className="mt-5 overflow-x-auto pb-1">
                    <div className="flex min-w-[1040px] items-stretch gap-3">
                        {cards.map((card, idx) => (
                            <div key={steps[idx]} className="contents">
                                <div className="min-w-[196px] flex-1 basis-0">{card}</div>
                                {idx < cards.length - 1 && (
                                    <div className="hidden w-10 shrink-0 items-center xl:flex">
                                        <div className="h-px w-full rounded-full bg-slate-800/80" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                    {cards.map((card, idx) => (
                        <div key={steps[idx]} className="min-w-[196px] flex-1 basis-[210px]">
                            {card}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
