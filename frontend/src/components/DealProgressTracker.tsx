import type { DealProgressModel, DealProgressStage } from '../domain/dealProgress'

type DealProgressTrackerProps = {
    model: DealProgressModel
    compact?: boolean
    variant?: 'default' | 'terminal'
}

const stageToneClasses: Record<DealProgressStage['state'], string> = {
    complete: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
    current: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-100',
    upcoming: 'border-slate-700 bg-slate-900/60 text-slate-300',
    issue: 'border-rose-500/35 bg-rose-500/10 text-rose-100'
}

export default function DealProgressTracker({
    model,
    compact = false,
    variant = 'default'
}: DealProgressTrackerProps) {
    const isTerminal = variant === 'terminal'
    const stageGridClass = isTerminal
        ? 'grid-cols-1'
        : compact
          ? 'grid-cols-[repeat(auto-fit,minmax(180px,1fr))]'
          : 'grid-cols-[repeat(auto-fit,minmax(170px,1fr))]'
    const shellClassName = isTerminal
        ? 'rounded-md border border-slate-800 bg-slate-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]'
        : 'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6'
    const headerGridClass = isTerminal
        ? 'grid-cols-1'
        : '[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]'
    const labelClassName = isTerminal
        ? 'inline-flex items-center gap-2 rounded-sm border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100'
        : 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400'
    const completionCardClassName = isTerminal
        ? 'min-w-0 rounded-md border border-cyan-500/20 bg-cyan-500/8 px-4 py-3'
        : 'min-w-0 rounded-2xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-3'
    const stageCardClassName = isTerminal
        ? 'min-w-0 rounded-sm border border-slate-800 bg-slate-950/60 p-3'
        : 'min-w-0 rounded-2xl border border-white/8 bg-slate-950/45 p-4'
    const stageBadgeClassName = isTerminal
        ? 'inline-flex max-w-full rounded-sm border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
        : 'inline-flex max-w-full rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
    const headlineClassName = isTerminal
        ? 'mt-4 text-xl font-semibold leading-tight text-white'
        : 'mt-4 max-w-3xl text-2xl font-semibold leading-tight text-white'
    const detailClassName = isTerminal
        ? 'mt-2 text-sm leading-6 text-slate-400'
        : 'mt-2 max-w-3xl text-sm leading-6 text-slate-400'
    const completionValueClassName = isTerminal
        ? 'mt-2 text-2xl font-semibold text-white'
        : 'mt-2 text-3xl font-semibold text-white'

    return (
        <section className={shellClassName}>
            <div className={`grid gap-4 ${headerGridClass}`}>
                <div className="min-w-0">
                    <div className={labelClassName}>
                        Deal Progress
                    </div>
                    <h2 className={headlineClassName}>
                        {model.headline}
                    </h2>
                    <p className={detailClassName}>
                        {model.detail}
                    </p>
                </div>

                <div className={completionCardClassName}>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Completion</div>
                    <div className={completionValueClassName}>{model.completionPercent}%</div>
                    <div className="mt-2 h-2 rounded-full bg-slate-900/80">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400"
                            style={{ width: `${model.completionPercent}%` }}
                        />
                    </div>
                    <div className="mt-3 text-xs leading-5 text-cyan-100/90">{model.nextAction}</div>
                </div>
            </div>

            <div className={`mt-6 grid gap-3 ${stageGridClass}`}>
                {model.stages.map((stage, index) => (
                    <article key={stage.key} className={stageCardClassName}>
                        <div className="flex flex-wrap items-start gap-2">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Step {index + 1}
                            </div>
                            <span
                                className={`${stageBadgeClassName} ${stageToneClasses[stage.state]}`}
                            >
                                {stage.state === 'complete'
                                    ? 'Complete'
                                    : stage.state === 'current'
                                        ? 'Current'
                                        : stage.state === 'issue'
                                            ? 'Attention'
                                            : 'Upcoming'}
                            </span>
                        </div>
                        <div className="mt-3 text-base font-semibold leading-7 text-white">
                            {stage.label}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{stage.detail}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}
