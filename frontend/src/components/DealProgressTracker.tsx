import type { DealProgressModel, DealProgressStage } from '../domain/dealProgress'

type DealProgressTrackerProps = {
    model: DealProgressModel
    compact?: boolean
}

const stageToneClasses: Record<DealProgressStage['state'], string> = {
    complete: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
    current: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-100',
    upcoming: 'border-slate-700 bg-slate-900/60 text-slate-300',
    issue: 'border-rose-500/35 bg-rose-500/10 text-rose-100'
}

export default function DealProgressTracker({
    model,
    compact = false
}: DealProgressTrackerProps) {
    return (
        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Deal Progress
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-white">{model.headline}</h2>
                    <p className="mt-2 max-w-3xl text-sm text-slate-400">{model.detail}</p>
                </div>
                <div className="min-w-[220px] rounded-2xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Completion</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{model.completionPercent}%</div>
                    <div className="mt-2 h-2 rounded-full bg-slate-900/80">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400"
                            style={{ width: `${model.completionPercent}%` }}
                        />
                    </div>
                    <div className="mt-3 text-xs text-cyan-100/90">{model.nextAction}</div>
                </div>
            </div>

            <div className={`mt-6 grid gap-3 ${compact ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6'}`}>
                {model.stages.map((stage, index) => (
                    <article key={stage.key} className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Step {index + 1}
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${stageToneClasses[stage.state]}`}>
                                {stage.state === 'complete'
                                    ? 'Complete'
                                    : stage.state === 'current'
                                        ? 'Current'
                                        : stage.state === 'issue'
                                            ? 'Attention'
                                            : 'Upcoming'}
                            </span>
                        </div>
                        <div className="mt-3 text-base font-semibold text-white">{stage.label}</div>
                        <p className="mt-2 text-sm text-slate-400">{stage.detail}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}
