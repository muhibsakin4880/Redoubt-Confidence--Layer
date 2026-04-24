import type { DatasetTrustRiskLabel, DatasetTrustSummaryRow } from '../../domain/datasetTrustProfile'
import { ResponsibilityNotice, RiskLabelStrip, TrustComplianceSummary } from '../trust/TrustLayer'
import DatasetDetailPanel from './DatasetDetailPanel'

type DatasetTrustCompliancePanelProps = {
    trustRiskLabels: DatasetTrustRiskLabel[]
    trustSummaryRows: DatasetTrustSummaryRow[]
    minimumTrustNeedsReview: boolean
    minimumTrustLabel: string
    trustSummaryBadgeClass: string
}

export default function DatasetTrustCompliancePanel({
    trustRiskLabels,
    trustSummaryRows,
    minimumTrustNeedsReview,
    minimumTrustLabel,
    trustSummaryBadgeClass
}: DatasetTrustCompliancePanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Minimum trust layer"
            title="Trust & Compliance Summary"
            description="Review the minimum trust context before asking the provider to evaluate access. This keeps rights, basis, re-identification, and audit expectations visible at the point of request."
            badge={
                <span className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${trustSummaryBadgeClass}`}>
                    {minimumTrustNeedsReview ? minimumTrustLabel : 'Documented in demo'}
                </span>
            }
        >
            <div className="space-y-5">
                <div
                    className={`rounded-md border px-4 py-4 ${
                        minimumTrustNeedsReview
                            ? 'border-amber-400/25 bg-amber-500/8 text-amber-100'
                            : 'border-cyan-400/20 bg-cyan-500/8 text-cyan-100'
                    }`}
                >
                    <div className="text-sm font-semibold">
                        {minimumTrustNeedsReview ? minimumTrustLabel : 'Minimum trust fields documented'}
                    </div>
                    <p className="mt-2 text-sm leading-6">
                        {minimumTrustNeedsReview
                            ? 'One or more minimum trust fields still need provider or reviewer confirmation before live access can be approved. Requests remain available, but they route through review-first handling.'
                            : 'Minimum trust fields are documented in the current demo packet, but access still follows provider review and configured controls.'}
                    </p>
                </div>

                <RiskLabelStrip items={trustRiskLabels} />
                <TrustComplianceSummary rows={trustSummaryRows} />
                <ResponsibilityNotice message="This is a demo review signal, not legal approval." />
            </div>
        </DatasetDetailPanel>
    )
}
