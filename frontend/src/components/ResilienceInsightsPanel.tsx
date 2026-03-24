import { useMemo } from 'react'
import {
    buildResilienceInsights,
    type ResilienceDigest,
    type ResilienceTopPriority
} from '../domain/resilienceInsights'

type ResilienceInsightsPanelProps = {
    digests: ResilienceDigest[]
    title?: string
    compact?: boolean
    className?: string
}

export default function ResilienceInsightsPanel({
    digests,
    title = 'Portfolio Resilience',
    compact = false,
    className = ''
}: ResilienceInsightsPanelProps) {
    const insights = useMemo(() => buildResilienceInsights(digests), [digests])
    const visiblePriorities = compact ? insights.topPriorities.slice(0, 2) : insights.topPriorities
    const visibleActions = compact ? insights.keyActions.slice(0, 2) : insights.keyActions

    const trustTone =
        insights.trustIndex >= 80
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
            : insights.trustIndex >= 60
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
              : insights.trustIndex >= 40
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200'

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {insights.portfolioSize} contract(s) monitored · {insights.totalAuditEvents} audit events
                    </p>
                </div>
                <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${trustTone}`}
                >
                    Trust Index {insights.trustIndex}
                </span>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                <MetricCard label="Avg Health" value={`${insights.averageHealthScore}/100`} />
                <MetricCard label="Critical" value={`${insights.criticalCount}`} />
                <MetricCard label="SLA Risk" value={`${insights.slaRiskCount}`} />
                <MetricCard label="Blocked Actions" value={`${insights.blockedRecommendationCount}`} />
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Top Priorities</p>
                    <div className="mt-2 space-y-2">
                        {visiblePriorities.length === 0 ? (
                            <p className="text-xs text-slate-400">No priority records available.</p>
                        ) : (
                            visiblePriorities.map(priority => <PriorityRow key={priority.contractId} priority={priority} />)
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Recommended Portfolio Actions</p>
                    <div className="mt-2 space-y-1.5">
                        {visibleActions.map(action => (
                            <p key={action} className="text-xs text-slate-200">
                                • {action}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

type MetricCardProps = {
    label: string
    value: string
}

function MetricCard({ label, value }: MetricCardProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 text-xs text-slate-200">{value}</p>
        </div>
    )
}

type PriorityRowProps = {
    priority: ResilienceTopPriority
}

function PriorityRow({ priority }: PriorityRowProps) {
    return (
        <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-100">{priority.contractId}</p>
                <span className="text-[10px] text-slate-400">{priority.priorityScore}/100</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{priority.stateLabel}</p>
            <p className={`mt-1 text-[11px] ${priority.recommendedActionAllowed ? 'text-slate-300' : 'text-amber-300'}`}>
                Next: {priority.recommendedActionLabel}
            </p>
        </div>
    )
}

