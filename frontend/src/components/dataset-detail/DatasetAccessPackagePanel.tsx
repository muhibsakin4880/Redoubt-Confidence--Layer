import DatasetDetailPanel, { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetAccessPackagePanelProps = {
    accessPackageBuyerOverview: string
    accessDeliverySummaryItems: ReadonlyArray<{
        label: string
        value: string
    }>
    accessPostureItems: ReadonlyArray<{
        title: string
        badge: string
        tone: 'available' | 'protected' | 'approval'
        detail: string
    }>
}

const getAccessPostureBadgeClass = (state: 'available' | 'protected' | 'approval') => {
    if (state === 'available') return 'border-white/10 bg-white/5 text-slate-100'
    if (state === 'protected') return 'border-cyan-400/25 bg-cyan-500/10 text-cyan-100'
    return 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
}

export default function DatasetAccessPackagePanel({
    accessPackageBuyerOverview,
    accessDeliverySummaryItems,
    accessPostureItems
}: DatasetAccessPackagePanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Access Package"
            title="Access & Delivery Profile"
            description={accessPackageBuyerOverview}
        >
            <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {accessDeliverySummaryItems.map(item => (
                        <DatasetDetailMetric key={item.label} label={item.label} value={item.value} />
                    ))}
                </div>

                <div className="grid gap-3 xl:grid-cols-3">
                    {accessPostureItems.map(item => (
                        <article key={item.title} className="rounded-md border border-slate-800 bg-slate-950/55 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="text-sm font-semibold text-white">{item.title}</div>
                                <span className={`rounded-sm border px-2.5 py-1 text-[10px] font-semibold ${getAccessPostureBadgeClass(item.tone)}`}>
                                    {item.badge}
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
                        </article>
                    ))}
                </div>
            </div>
        </DatasetDetailPanel>
    )
}
