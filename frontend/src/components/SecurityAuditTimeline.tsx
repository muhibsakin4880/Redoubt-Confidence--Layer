import { useMemo } from 'react'
import type { ContractLifecycleState } from '../domain/accessContract'
import { buildDemoAuditTimeline, type AuditEventTone } from '../domain/auditTimeline'

type SecurityAuditTimelineProps = {
    contractId: string
    state: ContractLifecycleState
    title?: string
    compact?: boolean
    className?: string
}

const toneRing: Record<AuditEventTone, string> = {
    info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    critical: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

const toneDot: Record<AuditEventTone, string> = {
    info: 'bg-cyan-300',
    success: 'bg-emerald-300',
    warning: 'bg-amber-300',
    critical: 'bg-rose-300'
}

export default function SecurityAuditTimeline({
    contractId,
    state,
    title = 'Security Audit Trail',
    compact = false,
    className = ''
}: SecurityAuditTimelineProps) {
    const events = useMemo(() => buildDemoAuditTimeline(contractId, state), [contractId, state])
    const latest = events[events.length - 1]

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {events.length} immutable events · Latest: {latest?.lifecycleLabel}
                    </p>
                </div>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-200">
                    Hash Linked
                </span>
            </div>

            <div className={`mt-4 space-y-3 ${compact ? 'max-h-[360px] overflow-y-auto pr-1' : ''}`}>
                {events.map((event, index) => {
                    const controls = compact ? event.controls.slice(0, 2) : event.controls
                    const isLast = index === events.length - 1

                    return (
                        <article key={event.id} className="relative rounded-lg border border-white/5 bg-white/5 p-3">
                            {!isLast && <span className="absolute left-[10px] top-8 h-[calc(100%-16px)] w-px bg-slate-700" />}

                            <div className="flex items-start gap-3">
                                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${toneDot[event.tone]}`} />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${toneRing[event.tone]}`}>
                                            {event.lifecycleLabel}
                                        </span>
                                        <span className="text-[10px] text-slate-500">{event.at}</span>
                                    </div>

                                    <p className="text-sm font-medium text-slate-100">{event.action}</p>
                                    <p className="text-xs text-slate-400">{event.reason}</p>

                                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                                        <span>Actor: {event.actorKind}</span>
                                        <span className="text-slate-700">|</span>
                                        <span>{event.actorId}</span>
                                        <span className="text-slate-700">|</span>
                                        <span className="truncate">Proof: {event.hashPointer}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {controls.map(control => (
                                            <span
                                                key={control}
                                                className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-1 text-[10px] text-slate-300"
                                            >
                                                {control}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}
