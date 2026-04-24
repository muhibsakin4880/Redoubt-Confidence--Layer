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
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-col gap-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Dataset Identity
                            </div>
                            <h1 className="max-w-5xl text-2xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-3xl lg:text-[2.2rem]">
                                {dataset.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <IdentityPill label="Dataset ID" value={dataset.id} />
                                <IdentityPill
                                    label="Provider"
                                    value="Attested"
                                    accentDotClassName="bg-green-300"
                                />
                                <IdentityPill
                                    label="Contributor Trust"
                                    value={dataset.contributorTrust}
                                />
                                <IdentityPill
                                    label="Confidence Lane"
                                    value={`${dataset.confidenceScore}%`}
                                />
                            </div>
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
        <div className="rounded-sm border border-slate-800 bg-slate-900/55 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
        </div>
    )
}

function IdentityPill({
    label,
    value,
    accentDotClassName
}: {
    label: string
    value: string
    accentDotClassName?: string
}) {
    return (
        <div className="inline-flex min-w-0 items-center gap-2 rounded-sm border border-slate-800 bg-slate-900/55 px-2.5 py-1.5">
            {accentDotClassName ? (
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accentDotClassName}`} />
            ) : null}
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </span>
            <span className="min-w-0 text-xs font-medium text-slate-100">{value}</span>
        </div>
    )
}
