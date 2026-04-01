type OnboardingProgressProps = {
    activeStep: number
    steps: readonly string[]
    variant?: 'grid' | 'connector'
}

export default function OnboardingProgress({
    activeStep,
    steps,
    variant = 'grid'
}: OnboardingProgressProps) {
    if (variant === 'connector') {
        return (
            <div className="mb-8 overflow-x-auto pb-1">
                <div className="min-w-[760px] flex items-start">
                    {steps.map((title, idx) => {
                        const currentStep = idx + 1
                        const active = currentStep === activeStep
                        const done = currentStep < activeStep

                        return (
                            <div key={title} className="flex items-center flex-1 last:flex-none">
                                <div className="w-32">
                                    <div
                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                                            done
                                                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                                                : active
                                                ? 'border-blue-400 bg-blue-500/10 text-blue-200 shadow-[0_0_0_3px_rgba(59,130,246,0.25),0_0_18px_rgba(59,130,246,0.35)]'
                                                : 'border-slate-700 bg-slate-900 text-slate-500'
                                        }`}
                                    >
                                        {done ? (
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.75"
                                            >
                                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            currentStep
                                        )}
                                    </div>
                                    <div className="mt-2 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                                        Step {currentStep}
                                    </div>
                                    <div
                                        className={`mt-1 text-xs font-semibold leading-4 ${
                                            done ? 'text-emerald-200' : active ? 'text-blue-100' : 'text-slate-500'
                                        }`}
                                    >
                                        {title}
                                    </div>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`h-[2px] flex-1 mx-2 rounded-full ${
                                            done ? 'bg-emerald-400/70' : 'bg-slate-700'
                                        }`}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-2">
            {steps.map((title, idx) => {
                const currentStep = idx + 1
                const active = currentStep === activeStep
                const done = currentStep < activeStep

                return (
                    <div
                        key={title}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                            active
                                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                : done
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                : 'border-slate-700 bg-slate-800/70 text-slate-400'
                        }`}
                    >
                        <div className="uppercase tracking-[0.1em] mb-1">Step {currentStep}</div>
                        <div>{title}</div>
                    </div>
                )
            })}
        </div>
    )
}
