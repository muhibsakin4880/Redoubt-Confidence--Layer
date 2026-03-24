import { useMemo } from 'react'
import type { ContractLifecycleState } from '../domain/accessContract'
import { buildDecisionGateReport, type DecisionGateStatus } from '../domain/decisionGate'
import type { TransitionRole } from '../domain/transitionSimulator'

type DecisionGatePanelProps = {
    contractId: string
    state: ContractLifecycleState
    role: TransitionRole
    title?: string
    compact?: boolean
    pendingReleaseCount?: number
    className?: string
}

const gateClasses: Record<DecisionGateStatus, string> = {
    ready: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    conditional: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    hold: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

export default function DecisionGatePanel({
    contractId,
    state,
    role,
    title = 'Decision Gate',
    compact = false,
    pendingReleaseCount = 0,
    className = ''
}: DecisionGatePanelProps) {
    const report = useMemo(
        () => buildDecisionGateReport(contractId, role, state, pendingReleaseCount),
        [contractId, role, state, pendingReleaseCount]
    )
    const blockers = compact ? report.blockers.slice(0, 2) : report.blockers
    const conditions = compact ? report.conditions.slice(0, 2) : report.conditions
    const signers = compact ? report.signers.slice(0, 3) : report.signers

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        Gate score {report.score}/100 · Action: {report.actionLabel}
                    </p>
                </div>
                <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${gateClasses[report.status]}`}
                >
                    {report.status}
                </span>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                <Metric label="Role" value={report.role} />
                <Metric label="State" value={report.state} />
                <Metric label="Blockers" value={`${report.blockers[0] === 'No blocking conditions.' ? 0 : report.blockers.length}`} />
                <Metric label="Conditions" value={`${report.conditions[0] === 'No conditional requirements.' ? 0 : report.conditions.length}`} />
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Decision Statement</p>
                <p className={`mt-1 text-xs ${report.status === 'hold' ? 'text-rose-200' : 'text-slate-200'}`}>
                    {report.decisionStatement}
                </p>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <PanelList title="Blockers" items={blockers} tone={report.status === 'hold' ? 'alert' : 'neutral'} />
                <PanelList title="Conditional Checks" items={conditions} tone="warn" />
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Signer Matrix</p>
                <div className="mt-2 space-y-2">
                    {signers.map(signer => (
                        <div key={signer.id} className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-100">{signer.label}</p>
                                <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                        signer.status === 'approved'
                                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                            : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                                    }`}
                                >
                                    {signer.status}
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-300">{signer.rationale}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

type MetricProps = {
    label: string
    value: string
}

function Metric({ label, value }: MetricProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/5 p-2">
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{label}</p>
            <p className="mt-1 text-xs text-slate-200">{value}</p>
        </div>
    )
}

type PanelListProps = {
    title: string
    items: string[]
    tone: 'neutral' | 'warn' | 'alert'
}

function PanelList({ title, items, tone }: PanelListProps) {
    const textClass =
        tone === 'alert' ? 'text-rose-200' : tone === 'warn' ? 'text-amber-200' : 'text-slate-200'

    return (
        <div className="rounded-lg border border-white/5 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
            <div className="mt-2 space-y-1.5">
                {items.map(item => (
                    <p key={item} className={`text-xs ${textClass}`}>
                        • {item}
                    </p>
                ))}
            </div>
        </div>
    )
}

