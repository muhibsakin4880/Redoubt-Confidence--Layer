import { useEffect, useMemo, useState } from 'react'
import type { ContractLifecycleState } from '../domain/accessContract'
import {
    listTransitionActions,
    simulateTransition,
    type TransitionActionId,
    type TransitionRole
} from '../domain/transitionSimulator'

type TransitionImpactPanelProps = {
    contractId: string
    state: ContractLifecycleState
    role: TransitionRole
    title?: string
    compact?: boolean
    pendingReleaseCount?: number
    className?: string
}

export default function TransitionImpactPanel({
    contractId,
    state,
    role,
    title = 'Transition Simulator',
    compact = false,
    pendingReleaseCount = 0,
    className = ''
}: TransitionImpactPanelProps) {
    const actions = useMemo(
        () => listTransitionActions(role, state, pendingReleaseCount),
        [role, state, pendingReleaseCount]
    )
    const [selectedAction, setSelectedAction] = useState<TransitionActionId>(actions[0]?.id ?? 'release_payment')

    useEffect(() => {
        if (!actions.find(action => action.id === selectedAction) && actions[0]) {
            setSelectedAction(actions[0].id)
        }
    }, [actions, selectedAction])

    const simulation = useMemo(
        () => simulateTransition(contractId, role, state, selectedAction, pendingReleaseCount),
        [contractId, role, state, selectedAction, pendingReleaseCount]
    )

    const scoreDeltaClass =
        simulation.scoreDelta > 0 ? 'text-emerald-300' : simulation.scoreDelta < 0 ? 'text-rose-300' : 'text-slate-300'

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        Preview next state before execution
                    </p>
                </div>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-200">
                    {role}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {actions.map(action => (
                    <button
                        key={action.id}
                        onClick={() => setSelectedAction(action.id)}
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                            selectedAction === action.id
                                ? 'border-cyan-500/50 bg-cyan-500/12 text-cyan-200'
                                : action.allowed
                                  ? 'border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white'
                                  : 'border-slate-700 text-slate-500'
                        }`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">State Impact</p>
                    <p className="text-xs text-slate-300">
                        {simulation.currentStateLabel} → {simulation.nextStateLabel}
                    </p>
                    <p className={`text-xs ${simulation.action.allowed ? 'text-emerald-200' : 'text-amber-300'}`}>
                        {simulation.action.reason}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                        <span>Audit events: {simulation.auditEventsBefore} → {simulation.auditEventsAfter}</span>
                    </div>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Health Impact</p>
                    <p className="text-xs text-slate-300">
                        Score {simulation.healthBefore} → {simulation.healthAfter}{' '}
                        <span className={scoreDeltaClass}>
                            ({simulation.scoreDelta >= 0 ? '+' : ''}
                            {simulation.scoreDelta})
                        </span>
                    </p>
                    <p className="text-xs text-slate-400">Trend: {simulation.riskTrend}</p>
                </div>
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Expected Outcomes</p>
                <div className="mt-2 space-y-1.5">
                    {simulation.impacts.map(impact => (
                        <p key={impact} className="text-xs text-slate-200">
                            • {impact}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    )
}
