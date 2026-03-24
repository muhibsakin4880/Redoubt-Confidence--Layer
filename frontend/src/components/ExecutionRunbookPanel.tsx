import { useEffect, useMemo, useState } from 'react'
import type { ContractLifecycleState } from '../domain/accessContract'
import {
    buildActionExecutionRunbook,
    listRunbookActionOptions
} from '../domain/executionRunbook'
import type { TransitionActionId, TransitionRole } from '../domain/transitionSimulator'

type ExecutionRunbookPanelProps = {
    contractId: string
    state: ContractLifecycleState
    role: TransitionRole
    title?: string
    compact?: boolean
    pendingReleaseCount?: number
    className?: string
}

export default function ExecutionRunbookPanel({
    contractId,
    state,
    role,
    title = 'Execution Runbook',
    compact = false,
    pendingReleaseCount = 0,
    className = ''
}: ExecutionRunbookPanelProps) {
    const actions = useMemo(
        () => listRunbookActionOptions(role, state, pendingReleaseCount),
        [role, state, pendingReleaseCount]
    )
    const [selectedAction, setSelectedAction] = useState<TransitionActionId>(actions[0]?.id ?? 'release_payment')

    useEffect(() => {
        if (!actions.find(action => action.id === selectedAction) && actions[0]) {
            setSelectedAction(actions[0].id)
        }
    }, [actions, selectedAction])

    const runbook = useMemo(
        () => buildActionExecutionRunbook(contractId, role, state, selectedAction, pendingReleaseCount),
        [contractId, role, state, selectedAction, pendingReleaseCount]
    )

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        Preflight checks, approvals, and rollback coverage
                    </p>
                </div>
                <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        runbook.allowed
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                    }`}
                >
                    {runbook.allowed ? 'Ready if Checks Pass' : 'Blocked by Policy'}
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

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                <SummaryTile label="Transition" value={`${runbook.currentState} → ${runbook.nextState}`} />
                <SummaryTile label="Approvals" value={`${runbook.requiredApprovals} required`} />
                <SummaryTile label="ETA" value={`${runbook.estimatedDurationMinutes} min`} />
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Runbook Alert</p>
                <p className={`mt-1 text-xs ${runbook.allowed ? 'text-slate-300' : 'text-amber-300'}`}>{runbook.riskNotice}</p>
                {!runbook.allowed && <p className="mt-1 text-[11px] text-amber-300">{runbook.reason}</p>}
            </div>

            <div className="mt-3 space-y-2">
                {runbook.steps.map(step => (
                    <article
                        key={step.id}
                        className="rounded-lg border border-white/5 bg-white/5 p-3"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-100">{step.title}</p>
                            <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                    step.status === 'ready'
                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                        : step.status === 'warning'
                                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                                          : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                                }`}
                            >
                                {step.status}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">{step.detail}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                            <span>Owner: {step.owner}</span>
                            <span className="text-slate-700">|</span>
                            <span>{step.evidencePointer}</span>
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Rollback Plan</p>
                <p className="mt-1 text-xs text-slate-300">{runbook.rollbackPlan}</p>
            </div>
        </section>
    )
}

type SummaryTileProps = {
    label: string
    value: string
}

function SummaryTile({ label, value }: SummaryTileProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 text-xs text-slate-200">{value}</p>
        </div>
    )
}

