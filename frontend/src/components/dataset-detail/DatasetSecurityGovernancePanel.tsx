import DatasetDetailPanel, { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetSecurityGovernancePanelProps = {
    securityGovernanceSummaryItems: ReadonlyArray<{
        label: string
        value: string
    }>
    protectionSummaryItems: ReadonlyArray<{
        label: string
        detail: string
    }>
    buyerObligationItems: ReadonlyArray<{
        label: string
        value: string
    }>
}

export default function DatasetSecurityGovernancePanel({
    securityGovernanceSummaryItems,
    protectionSummaryItems,
    buyerObligationItems
}: DatasetSecurityGovernancePanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Governance"
            title="Security & Governance"
            description="Encryption, masking, watermarking, audit logging, and commercial controls applied to approved buyer sessions."
        >
            <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {securityGovernanceSummaryItems.map(item => (
                        <DatasetDetailMetric key={item.label} label={item.label} value={item.value} valueClassName="leading-6" />
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-md border border-slate-800 bg-slate-950/45 p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Protection summary</div>
                        <h3 className="mt-2 text-lg font-semibold text-white">What is protected during evaluation</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            The evaluation path keeps identity, movement, logging, and settlement controls visible before production access expands.
                        </p>
                        <div className="mt-5 space-y-3">
                            {protectionSummaryItems.map(item => (
                                <div key={item.label} className="rounded-sm border border-slate-800 bg-slate-900/70 px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-md border border-slate-800 bg-slate-950/45 p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Buyer obligations</div>
                        <h3 className="mt-2 text-lg font-semibold text-white">What buyers accept in the governed path</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            These controls stay attached to licensed usage, settlement review, and session monitoring before broader delivery is considered.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {buyerObligationItems.map(item => (
                                <DatasetDetailMetric key={item.label} label={item.label} value={item.value} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DatasetDetailPanel>
    )
}
