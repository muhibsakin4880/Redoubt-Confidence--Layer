import type {
    DatasetTrustRiskLabel,
    DatasetTrustSeverity,
    DatasetTrustSummaryRow,
    TrustSignalState
} from '../../domain/datasetTrustProfile'

const getStateBadgeLabel = (state: TrustSignalState, severity: DatasetTrustSeverity) => {
    if (state === 'provider_confirmation') return 'Provider check'
    if (state === 'reviewer_confirmation') return 'Reviewer check'
    if (severity === 'high') return 'Flagged'
    if (severity === 'medium') return 'Elevated'
    return 'Documented'
}

const getSurfaceClasses = (severity: DatasetTrustSeverity, state: TrustSignalState) => {
    if (severity === 'high') {
        return 'border-rose-500/25 bg-rose-500/10 text-rose-50'
    }

    if (state !== 'documented' || severity === 'medium') {
        return 'border-amber-500/25 bg-amber-500/10 text-amber-50'
    }

    return 'border-cyan-500/20 bg-cyan-500/8 text-cyan-50'
}

const getBadgeClasses = (severity: DatasetTrustSeverity, state: TrustSignalState) => {
    if (severity === 'high') {
        return 'border-rose-400/30 bg-rose-500/12 text-rose-100'
    }

    if (state !== 'documented' || severity === 'medium') {
        return 'border-amber-400/30 bg-amber-500/12 text-amber-100'
    }

    return 'border-cyan-400/25 bg-cyan-500/10 text-cyan-100'
}

export function RiskLabelStrip({
    items,
    compact = false,
    className = ''
}: {
    items: DatasetTrustRiskLabel[]
    compact?: boolean
    className?: string
}) {
    return (
        <div className={`flex flex-wrap gap-2.5 ${className}`.trim()}>
            {items.map(item => (
                <div
                    key={item.key}
                    className={`min-w-[108px] rounded-[18px] border ${getSurfaceClasses(item.severity, item.state)} ${
                        compact ? 'px-3 py-2.5' : 'px-3.5 py-3'
                    }`}
                >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                    <div className={`${compact ? 'mt-1.5 text-xs' : 'mt-2 text-sm'} font-semibold`}>{item.value}</div>
                </div>
            ))}
        </div>
    )
}

export function TrustComplianceSummary({
    rows,
    className = ''
}: {
    rows: DatasetTrustSummaryRow[]
    className?: string
}) {
    return (
        <div className={`grid gap-3 lg:grid-cols-2 ${className}`.trim()}>
            {rows.map(row => (
                <article
                    key={row.key}
                    className={`rounded-2xl border px-4 py-4 ${getSurfaceClasses(row.severity, row.state)}`}
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{row.label}</div>
                        <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getBadgeClasses(row.severity, row.state)}`}
                        >
                            {getStateBadgeLabel(row.state, row.severity)}
                        </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-100">{row.value}</p>
                </article>
            ))}
        </div>
    )
}

export function ResponsibilityNotice({
    title = 'Demo review signal',
    message,
    className = ''
}: {
    title?: string
    message: string
    className?: string
}) {
    return (
        <div className={`rounded-2xl border border-amber-400/20 bg-amber-500/8 px-4 py-4 ${className}`.trim()}>
            <div className="text-sm font-semibold text-amber-50">{title}</div>
            <p className="mt-2 text-xs leading-6 text-amber-100/90">{message}</p>
        </div>
    )
}
