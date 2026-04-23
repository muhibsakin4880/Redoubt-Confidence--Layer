import { Link } from 'react-router-dom'
import type { DealPolicyConflictModel } from '../../domain/dealPolicyConflict'

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

export default function DealConflictBanner({
    model
}: {
    model: DealPolicyConflictModel | null
}) {
    if (!model || model.conflicts.length === 0) return null

    return (
        <section className={`${panelClass} ${getToneOutlineClasses(model.tone)}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{model.label}</div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{model.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{model.summary}</p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 ${getToneBadgeClasses(model.tone)}`}>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Visible states</div>
                    <div className="mt-2 text-lg font-semibold">
                        {model.conflicts.length} visible · {model.blockingCount} blocked
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {model.conflicts.map(conflict => (
                    <article
                        key={conflict.id}
                        className={`rounded-2xl border px-4 py-4 ${getToneContainerClasses(conflict.tone)}`}
                    >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                        {conflict.stateLabel}
                                    </span>
                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getToneBadgeClasses(conflict.tone)}`}>
                                        {conflict.severityLabel}
                                    </span>
                                </div>
                                <h3 className="mt-3 text-lg font-semibold text-white">{conflict.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-200">{conflict.summary}</p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <ListBlock title="Why this is visible" items={conflict.triggers} danger={conflict.tone === 'rose'} />
                            <ListBlock title="Recommended path" items={[conflict.recommendedPath]} />
                        </div>

                        {conflict.actions.length > 0 ? (
                            <div className="mt-5 flex flex-wrap gap-3">
                                {conflict.actions.map(action => (
                                    <Link
                                        key={`${conflict.id}-${action.to}`}
                                        to={action.to}
                                        className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                    >
                                        {action.label}
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </article>
                ))}
            </div>
        </section>
    )
}

function ListBlock({
    title,
    items,
    danger = false
}: {
    title: string
    items: string[]
    danger?: boolean
}) {
    return (
        <div className={`rounded-2xl border px-4 py-4 ${danger ? 'border-rose-500/20 bg-rose-500/8' : 'border-white/8 bg-slate-950/45'}`}>
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</div>
            <div className="mt-3 space-y-2">
                {items.map(item => (
                    <div key={`${title}-${item}`} className="flex gap-2 text-sm leading-6 text-slate-200">
                        <span className={`mt-2 h-1.5 w-1.5 rounded-full ${danger ? 'bg-rose-300' : 'bg-cyan-300'}`} />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function getToneOutlineClasses(tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose') {
    if (tone === 'rose') return 'border-rose-500/30'
    if (tone === 'amber') return 'border-amber-500/25'
    if (tone === 'emerald') return 'border-emerald-500/25'
    if (tone === 'cyan') return 'border-cyan-500/25'
    return ''
}

function getToneContainerClasses(tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose') {
    if (tone === 'rose') return 'border-rose-500/20 bg-rose-500/8'
    if (tone === 'amber') return 'border-amber-500/20 bg-amber-500/8'
    if (tone === 'emerald') return 'border-emerald-500/20 bg-emerald-500/8'
    if (tone === 'cyan') return 'border-cyan-500/20 bg-cyan-500/8'
    return 'border-white/8 bg-slate-950/45'
}

function getToneBadgeClasses(tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose') {
    if (tone === 'rose') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    return 'border-white/10 bg-white/5 text-slate-200'
}
