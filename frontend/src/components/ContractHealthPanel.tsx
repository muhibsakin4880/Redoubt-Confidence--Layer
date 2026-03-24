import { useMemo } from 'react'
import type { ContractLifecycleState } from '../domain/accessContract'
import { evaluateDemoContractHealth, type ContractHealthSeverity } from '../domain/contractHealth'

type ContractHealthPanelProps = {
    contractId: string
    state: ContractLifecycleState
    title?: string
    compact?: boolean
    className?: string
}

const severityBadgeClasses: Record<ContractHealthSeverity, string> = {
    healthy: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    watch: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    critical: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

const severityLabel: Record<ContractHealthSeverity, string> = {
    healthy: 'Policy Healthy',
    watch: 'Needs Attention',
    critical: 'Critical Risk'
}

export default function ContractHealthPanel({
    contractId,
    state,
    title = 'Contract Integrity Monitor',
    compact = false,
    className = ''
}: ContractHealthPanelProps) {
    const health = useMemo(() => evaluateDemoContractHealth(contractId, state), [contractId, state])
    const visibleFindings = compact ? health.findings.slice(0, 2) : health.findings
    const visibleRemediations = compact ? health.remediations.slice(0, 2) : health.remediations
    const visibleSignals = compact ? health.monitoredSignals.slice(0, 3) : health.monitoredSignals

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        Score {health.score}/100 · Derived state: {health.derivedStateLabel}
                    </p>
                </div>
                <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${severityBadgeClasses[health.severity]}`}
                >
                    {severityLabel[health.severity]}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {visibleSignals.map(signal => (
                    <span
                        key={signal}
                        className="rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-[10px] text-slate-300"
                    >
                        {signal}
                    </span>
                ))}
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Findings</p>
                    {visibleFindings.length === 0 ? (
                        <p className="mt-2 text-xs text-emerald-200">No policy violations detected.</p>
                    ) : (
                        <div className="mt-2 space-y-1.5">
                            {visibleFindings.map(finding => (
                                <p key={finding} className="text-xs text-amber-200">
                                    • {finding}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Recommended Actions</p>
                    <div className="mt-2 space-y-1.5">
                        {visibleRemediations.map(item => (
                            <p key={item} className="text-xs text-slate-200">
                                • {item}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
