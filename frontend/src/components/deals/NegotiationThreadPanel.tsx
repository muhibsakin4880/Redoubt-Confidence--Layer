import { Link } from 'react-router-dom'
import type {
    NegotiationEntryStatus,
    NegotiationEntryType,
    NegotiationParty,
    NegotiationThreadEntry
} from '../../domain/negotiationThread'

type NegotiationThreadPanelProps = {
    entries: NegotiationThreadEntry[]
}

const typeClasses: Record<NegotiationEntryType, string> = {
    question: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
    answer: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    clarification: 'border-violet-400/30 bg-violet-500/10 text-violet-100',
    redline: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    scope_change: 'border-blue-400/30 bg-blue-500/10 text-blue-100',
    resolution: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
}

const statusClasses: Record<NegotiationEntryStatus, string> = {
    Open: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
    'Needs review': 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    Resolved: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
}

const partyClasses: Record<NegotiationParty, string> = {
    Buyer: 'border-white/10 bg-white/5 text-slate-200',
    Provider: 'border-violet-400/30 bg-violet-500/10 text-violet-100',
    Governance: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    Commercial: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
}

export default function NegotiationThreadPanel({
    entries
}: NegotiationThreadPanelProps) {
    return (
        <div className="space-y-4">
            {entries.map(entry => (
                <article
                    key={entry.id}
                    className="rounded-3xl border border-white/8 bg-slate-950/45 px-5 py-5"
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${partyClasses[entry.party]}`}>
                                    {entry.party}
                                </span>
                                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${typeClasses[entry.type]}`}>
                                    {entry.type.replace('_', ' ')}
                                </span>
                                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusClasses[entry.status]}`}>
                                    {entry.status}
                                </span>
                            </div>

                            <h3 className="mt-3 text-lg font-semibold text-white">{entry.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{entry.detail}</p>
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-3 text-xs leading-5 text-slate-300">
                            <div className="font-semibold text-slate-100">{entry.owner}</div>
                            <div className="mt-1">{entry.at}</div>
                        </div>
                    </div>

                    {entry.linkedSurfaceLabel && entry.linkedSurfaceTo ? (
                        <div className="mt-4">
                            <Link
                                to={entry.linkedSurfaceTo}
                                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                            >
                                Open {entry.linkedSurfaceLabel}
                            </Link>
                        </div>
                    ) : null}
                </article>
            ))}
        </div>
    )
}
