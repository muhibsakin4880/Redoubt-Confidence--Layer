import type { DatasetDetail } from '../../data/datasetDetailData'

type DatasetStickyHeaderProps = {
    dataset: DatasetDetail
}

export default function DatasetStickyHeader({
    dataset
}: DatasetStickyHeaderProps) {
    return (
        <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="truncate text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                                {dataset.title}
                            </h1>
                            <span className="inline-flex items-center gap-2 rounded-sm border border-green-400/40 bg-green-500/12 px-2.5 py-1 text-xs font-semibold text-green-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                                Provider attested
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <StickyMetric label="Size" value={dataset.size} />
                        <StickyMetric label="Records" value={dataset.recordCount} />
                        <StickyMetric label="Last Updated" value={dataset.lastUpdated} />
                        <StickyMetric label="Domain" value={dataset.category} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function StickyMetric({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-sm border border-slate-800 bg-slate-900/70 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
        </div>
    )
}
