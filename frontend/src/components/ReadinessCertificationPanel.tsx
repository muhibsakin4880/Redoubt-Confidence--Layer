import { useMemo } from 'react'
import {
    buildPortfolioReadinessCertificate,
    type ReadinessStatus
} from '../domain/readinessCertification'
import type { ResilienceDigest } from '../domain/resilienceInsights'

type ReadinessCertificationPanelProps = {
    digests: ResilienceDigest[]
    title?: string
    compact?: boolean
    className?: string
}

const statusClasses: Record<ReadinessStatus, string> = {
    certified: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    conditional: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    blocked: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

export default function ReadinessCertificationPanel({
    digests,
    title = 'Launch Readiness Certification',
    compact = false,
    className = ''
}: ReadinessCertificationPanelProps) {
    const certificate = useMemo(() => buildPortfolioReadinessCertificate(digests), [digests])
    const focusItems = compact ? certificate.priorityFocus.slice(0, 2) : certificate.priorityFocus
    const topContracts = compact ? certificate.contracts.slice(0, 3) : certificate.contracts.slice(0, 5)

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        Certification score {certificate.score}/100
                    </p>
                </div>
                <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusClasses[certificate.status]}`}
                >
                    {certificate.status}
                </span>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'}`}>
                <Metric label="Contracts" value={`${certificate.contractsMonitored}`} />
                <Metric label="Certified" value={`${certificate.certifiedCount}`} />
                <Metric label="Conditional" value={`${certificate.conditionalCount}`} />
                <Metric label="Blocked" value={`${certificate.blockedCount}`} />
                <Metric label="Score" value={`${certificate.score}/100`} />
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Certification Verdict</p>
                <p className={`mt-1 text-xs ${certificate.status === 'blocked' ? 'text-rose-200' : 'text-slate-200'}`}>
                    {certificate.summary}
                </p>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Priority Focus</p>
                    <div className="mt-2 space-y-1.5">
                        {focusItems.map(item => (
                            <p key={item} className="text-xs text-slate-200">
                                • {item}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Contract Readiness Snapshot</p>
                    <div className="mt-2 space-y-2">
                        {topContracts.map(contract => (
                            <div key={contract.contractId} className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-slate-100">{contract.contractId}</p>
                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusClasses[contract.status]}`}>
                                        {contract.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400">{contract.stateLabel}</p>
                                <p className="mt-1 text-[11px] text-slate-200">{contract.score}/100</p>
                            </div>
                        ))}
                    </div>
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

