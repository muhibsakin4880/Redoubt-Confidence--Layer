import { Link } from 'react-router-dom'
import type { DatasetDetail } from '../../data/datasetDetailData'
import DatasetDetailPanel, { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetDecisionPanelProps = {
    dataset: DatasetDetail
    latestCheckoutLabel: string
    evaluationFeeLabel: string
    escrowHoldLabel: string
    reviewWindowHours: number
    protectedSummary: string
    compact?: boolean
}

export default function DatasetDecisionPanel({
    dataset,
    latestCheckoutLabel,
    evaluationFeeLabel,
    escrowHoldLabel,
    reviewWindowHours,
    protectedSummary,
    compact = false
}: DatasetDecisionPanelProps) {
    const metricGridClass = compact ? 'grid-cols-1' : 'sm:grid-cols-2'

    return (
        <DatasetDetailPanel
            eyebrow="Decision Block"
            title="Choose free preview or protected evaluation"
            description="Organizations can stay in zero-cost metadata review, or move into a governed clean-room evaluation with escrow protection, evaluation org validation, and automatic credits when commitments miss."
            badge={
                <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                    {latestCheckoutLabel}
                </div>
            }
        >
            <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'xl:grid-cols-2'}`.trim()}>
                <article className={`rounded-md border border-cyan-500/25 bg-cyan-500/8 ${compact ? 'p-4' : 'p-5'}`.trim()}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="rounded-sm border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
                                Free
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-white">Metadata Preview</h3>
                            <p className="mt-2 text-sm text-slate-200/85">
                                Inspect quality, schema shape, and AI summaries before touching paid workflows.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-semibold text-white">$0</div>
                            <div className="mt-1 text-xs text-slate-400">Always available</div>
                        </div>
                    </div>

                    <div className={`mt-4 grid gap-3 ${metricGridClass}`}>
                        <DatasetDetailMetric label="Confidence score" value={`${dataset.confidenceScore}%`} />
                        <DatasetDetailMetric label="Freshness" value={dataset.preview.freshnessLabel} />
                        <DatasetDetailMetric label="Schema fields" value={`${dataset.preview.sampleSchema.length} fields`} />
                        <DatasetDetailMetric label="Access" value="Metadata only" />
                    </div>

                    <div className="mt-4 rounded-sm border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300">
                        {dataset.preview.aiSummary}
                    </div>

                    <Link
                        to={`/datasets/${dataset.id}/quality-breakdown`}
                        className="mt-4 inline-flex items-center rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        Open Free Metadata Preview
                    </Link>
                </article>

                <article className={`rounded-md border border-emerald-500/25 bg-emerald-500/8 shadow-[0_0_24px_rgba(16,185,129,0.06)] ${compact ? 'p-4' : 'p-5'}`.trim()}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="rounded-sm border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                                Protected
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-white">Protected Evaluation</h3>
                            <p className="mt-2 text-sm text-slate-200/85">
                                Enter protected evaluation setup, provision a governed workspace, and let the protection engine verify the contracted outcome before payout. This is the standard buyer-paid step before production or API access is discussed.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-semibold text-white">{evaluationFeeLabel}</div>
                            <div className="mt-1 text-xs text-slate-400">Evaluation fee</div>
                        </div>
                    </div>

                    <div className={`mt-4 grid gap-3 ${metricGridClass}`}>
                        <DatasetDetailMetric label="Escrow hold" value={escrowHoldLabel} />
                        <DatasetDetailMetric label="Review window" value={`${reviewWindowHours} hours`} />
                        <DatasetDetailMetric label="Access mode" value="Governed workspace" />
                        <DatasetDetailMetric label="Protection" value="Auto credits enabled" />
                    </div>

                    <div className="mt-4 rounded-sm border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300">
                        {protectedSummary}
                    </div>

                    <div className="mt-4 rounded-sm border border-amber-400/25 bg-amber-500/10 px-3 py-2.5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">Pilot Cohort</div>
                        <p className="mt-2 text-sm text-slate-200/90">
                            Fee-waived evaluation is reserved for selected design partners in Redoubt&apos;s early-access evaluation program. Admission is LOI-backed and tied to feedback, design-partner participation, and a credible production pathway.
                        </p>
                    </div>

                    <div className="mt-4 rounded-sm border border-emerald-400/20 bg-emerald-500/8 px-3 py-2.5 text-sm text-emerald-100/90">
                        Start checkout from the main <span className="font-semibold text-white">Escrow-Native Checkout</span> action in the Request &amp; Status panel. Any saved quote context will carry into the governed evaluation flow automatically.
                    </div>
                </article>
            </div>
        </DatasetDetailPanel>
    )
}
