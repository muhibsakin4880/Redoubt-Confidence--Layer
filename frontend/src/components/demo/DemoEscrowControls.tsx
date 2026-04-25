import {
    DEMO_ESCROW_STAGE_EXPLANATIONS,
    DEMO_ESCROW_STAGE_LABELS,
    DEMO_ESCROW_STAGE_ORDER,
    getCurrentDemoStage,
    loadHappyPath,
    resetDemo,
    setDemoStage,
    type DemoEscrowScenario
} from '../../domain/demoEscrowScenario'

type DemoEscrowControlsProps = {
    onScenarioChange?: (scenario: DemoEscrowScenario) => void
}

const surfaceClass =
    'rounded-[1.75rem] border border-cyan-500/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.34),rgba(3,8,20,0.88))] p-5 shadow-[0_28px_80px_rgba(8,47,73,0.22)] backdrop-blur-sm'
const quietButtonClass =
    'rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/35 hover:bg-cyan-500/10 hover:text-cyan-100'

export default function DemoEscrowControls({ onScenarioChange }: DemoEscrowControlsProps) {
    const currentStage = getCurrentDemoStage()

    const applyScenario = (scenario: DemoEscrowScenario) => {
        onScenarioChange?.(scenario)
    }

    const currentExplanation = DEMO_ESCROW_STAGE_EXPLANATIONS[currentStage]

    return (
        <section className={surfaceClass} aria-label="Demo controls">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                        Presenter-Only Control Surface
                    </div>
                    <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
                        Demo controls
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                        Drive the escrow story without a backend. Stage jumps save into local demo storage so the same buyer case stays visible after navigation and reload.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 lg:min-w-[18rem]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                        Current demo stage
                    </div>
                    <div className="mt-2 inline-flex rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {DEMO_ESCROW_STAGE_LABELS[currentStage]}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        {currentExplanation}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => applyScenario(resetDemo())}
                    className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-rose-400/35 hover:bg-rose-500/10 hover:text-rose-100"
                >
                    Reset demo
                </button>
                <button
                    type="button"
                    onClick={() => applyScenario(loadHappyPath())}
                    className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                >
                    Load happy path
                </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {DEMO_ESCROW_STAGE_ORDER.map(stage => (
                    <button
                        key={stage}
                        type="button"
                        onClick={() => applyScenario(setDemoStage(stage))}
                        className={`${quietButtonClass} text-left ${
                            stage === currentStage ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100' : ''
                        }`}
                    >
                        <div className="text-sm font-semibold">
                            Jump to {DEMO_ESCROW_STAGE_LABELS[stage]}
                        </div>
                        <div className="mt-2 text-xs leading-5 text-slate-400">
                            {DEMO_ESCROW_STAGE_EXPLANATIONS[stage]}
                        </div>
                    </button>
                ))}
            </div>
        </section>
    )
}
