import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import {
    chargebackSummary,
    usageAnomalies as anomalies,
    usageDatasetRows as datasetRows,
    usageSummaryStats as summaryStats,
    usageTrendData as trendData
} from '../data/pipelineOpsData'
import { useToast } from '../components/Toast'

type AnomalyTone = 'alert' | 'warn' | 'resolved'

const chartAxisStyle = {
    fill: '#94a3b8',
    fontSize: 12
} as const

const chartTooltipContentStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(59, 130, 246, 0.35)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px -20px rgba(15, 23, 42, 0.9)'
} as const

const chartTooltipLabelStyle = {
    color: '#e2e8f0',
    fontWeight: 600
} as const

const chartTooltipItemStyle = {
    color: '#bfdbfe'
} as const

const chartLabelStyle = {
    fill: '#e2e8f0',
    fontSize: 11,
    fontWeight: 600
} as const

const toneStyles: Record<AnomalyTone, string> = {
    alert: 'border-rose-500/40 bg-rose-500/10 shadow-[0_10px_40px_rgba(244,63,94,0.25)]',
    warn: 'border-amber-400/50 bg-amber-400/10 shadow-[0_10px_40px_rgba(245,158,11,0.18)]',
    resolved: 'border-emerald-400/40 bg-emerald-400/10 shadow-[0_10px_40px_rgba(16,185,129,0.18)]'
}

const statusDot: Record<AnomalyTone, string> = {
    alert: 'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.8)]',
    warn: 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]',
    resolved: 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
}

const formatQueryValue = (value: unknown) => {
    if (typeof value === 'number') return value.toLocaleString()
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value.join(', ')
    return ''
}

const formatYAxisTick = (value: number) => `${Math.round(value / 100) / 10}k`

export default function UsageAnalyticsPage() {
    const { showToast } = useToast()

    return (
        <div className="relative min-h-screen bg-[#040812] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(45,212,191,0.08),transparent_30%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Developer
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Usage Analytics</h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Dataset query patterns, participant activity, and chargeback-ready usage meters for the recurring API product.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100 shadow-[0_0_24px_rgba(59,130,246,0.25)]">
                        Live metering is active · Updated 5 minutes ago
                    </div>
                </header>

                <section className="mt-10">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {summaryStats.map(stat => (
                            <article
                                key={stat.label}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                            >
                                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%)]" />
                                <div className="relative flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                                        <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                                        <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
                                    </div>
                                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[3fr_2fr]">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.32)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Top Queried Datasets</h2>
                                <p className="text-sm text-slate-400">Last 30 days · query volume and revenue attribution</p>
                            </div>
                            <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Ranked by API calls
                            </span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-xl border border-white/5">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Dataset</th>
                                        <th className="px-4 py-3 text-right">Queries</th>
                                        <th className="px-4 py-3 text-right">Participants</th>
                                        <th className="px-4 py-3 text-right">Avg Confidence</th>
                                        <th className="px-4 py-3 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {datasetRows.map(row => (
                                        <tr key={row.dataset} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-left font-medium text-white">{row.dataset}</td>
                                            <td className="px-4 py-3 text-right text-slate-200">{row.queries}</td>
                                            <td className="px-4 py-3 text-right text-slate-200">{row.participants}</td>
                                            <td className="px-4 py-3 text-right text-slate-200">{row.confidence}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-emerald-200">{row.revenue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-[#050b16] p-6 shadow-[0_15px_50px_rgba(30,64,175,0.25)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Query Trend</h2>
                                <p className="text-sm text-slate-400">Last 7 days · API calls</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-100">
                                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
                                Live sampling
                            </div>
                        </div>
                        <div className="mt-6 h-64 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData} margin={{ top: 24, right: 8, left: -18, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="usageTrendFill" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#67e8f9" />
                                            <stop offset="45%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#1d4ed8" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                                    <XAxis axisLine={false} dataKey="label" tick={chartAxisStyle} tickLine={false} />
                                    <YAxis
                                        axisLine={false}
                                        domain={[0, 9000]}
                                        tick={chartAxisStyle}
                                        tickFormatter={formatYAxisTick}
                                        tickLine={false}
                                        width={42}
                                    />
                                    <Tooltip
                                        contentStyle={chartTooltipContentStyle}
                                        cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                                        formatter={(value) => [formatQueryValue(value), 'API calls']}
                                        itemStyle={chartTooltipItemStyle}
                                        labelStyle={chartTooltipLabelStyle}
                                    />
                                    <Bar
                                        animationDuration={700}
                                        barSize={28}
                                        dataKey="value"
                                        fill="url(#usageTrendFill)"
                                        radius={[12, 12, 0, 0]}
                                    >
                                        <LabelList dataKey="value" formatter={formatQueryValue} position="top" style={chartLabelStyle} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </article>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="text-xl font-semibold text-white">Anomaly Highlights</h2>
                        <span className="text-xs text-slate-500">Automated detections with human-in-the-loop review</span>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {anomalies.map(anomaly => (
                            <article
                                key={anomaly.id}
                                className={`rounded-2xl border px-5 py-4 ${toneStyles[anomaly.tone]} backdrop-blur`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-200/70">Participant</p>
                                        <h3 className="mt-1 text-lg font-semibold text-white">{anomaly.id}</h3>
                                    </div>
                                    <span className={`h-2.5 w-2.5 rounded-full ${statusDot[anomaly.tone]}`} />
                                </div>
                                <p className="mt-3 text-sm text-slate-100">{anomaly.detail}</p>
                                <p className="mt-1 text-xs text-slate-200/70">{anomaly.action}</p>
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                                    {anomaly.status}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-[#0b1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.12),transparent_32%)]" />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Chargeback Summary</p>
                                <h3 className="mt-2 text-2xl font-semibold text-white">Billing ready for payout</h3>
                                <p className="mt-1 text-sm text-slate-400">Mapped to provider share-out with launch-tier settlement fees and separate recurring API billing.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => showToast('Chargeback report queued from Usage Analytics.', 'success')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500"
                            >
                                Export Chargeback Report
                            </button>
                        </div>
                        <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total billable usage</p>
                                <p className="mt-2 text-xl font-semibold text-white">{chargebackSummary.totalBillableUsage}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Launch settlement fee (15%)</p>
                                <p className="mt-2 text-xl font-semibold text-white">{chargebackSummary.settlementFee}</p>
                            </div>
                            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">Provider payouts</p>
                                <p className="mt-2 text-xl font-semibold text-emerald-100">{chargebackSummary.providerPayouts}</p>
                            </div>
                        </div>
                    </article>
                </section>
            </div>
        </div>
    )
}
