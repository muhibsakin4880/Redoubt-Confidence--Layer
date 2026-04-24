import { confidenceLevel, decisionLabel, type DatasetDetail } from '../../data/datasetDetailData'
import DatasetDetailPanel, { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetQualityPreviewPanelProps = {
    dataset: DatasetDetail
    showSchemaPreview?: boolean
}

export default function DatasetQualityPreviewPanel({
    dataset,
    showSchemaPreview = true
}: DatasetQualityPreviewPanelProps) {
    const confidenceTone = confidenceLevel(dataset.confidenceScore)
    const decisionTone = decisionLabel(dataset.preview.decision)
    const qualityBandLabel =
        dataset.preview.confidenceBand === 'high'
            ? 'High quality'
            : dataset.preview.confidenceBand === 'medium'
              ? 'Medium quality'
              : 'Experimental'
    const qualityBandClasses =
        dataset.preview.confidenceBand === 'high'
            ? 'bg-emerald-500/10 border-emerald-400 text-emerald-200'
            : dataset.preview.confidenceBand === 'medium'
              ? 'bg-amber-500/10 border-amber-400 text-amber-200'
              : 'bg-orange-500/10 border-orange-400 text-orange-200'

    return (
        <DatasetDetailPanel
            eyebrow="Quality & Preview"
            title="Decision-ready quality review"
            description="Confidence, freshness, structure, and representative schema are visible before buyers move into governed evaluation."
            badge={
                <span className={`rounded-full border px-3 py-1 text-xs ${confidenceTone.classes}`}>
                    {confidenceTone.label}
                </span>
            }
        >
            <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
                    <div className="rounded-md border border-slate-800 bg-slate-950/55 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Confidence summary</div>
                                <div className="mt-3 text-3xl font-semibold text-white">{dataset.confidenceScore}%</div>
                            </div>
                            <span className={`rounded-full border px-2.5 py-1 text-xs ${qualityBandClasses}`}>
                                {qualityBandLabel}
                            </span>
                        </div>
                        <div className="mt-4 h-3 rounded-full bg-slate-800">
                            <div
                                className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-green-300"
                                style={{ width: `${dataset.confidenceScore}%` }}
                            />
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-300">{dataset.confidenceSummary}</p>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            <DatasetDetailMetric label="Completeness" value={`${dataset.quality.completeness}%`} />
                            <DatasetDetailMetric label="Freshness score" value={`${dataset.quality.freshnessScore}%`} />
                            <DatasetDetailMetric label="Consistency" value={`${dataset.quality.consistency}%`} />
                            <DatasetDetailMetric label="Validation status" value={dataset.quality.validationStatus} valueClassName="leading-6" />
                        </div>
                    </div>

                    <div className="rounded-md border border-slate-800 bg-slate-950/55 p-4">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">AI summary</div>
                        <p className="mt-3 text-sm leading-6 text-slate-200">{dataset.preview.aiSummary}</p>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            <DatasetDetailMetric label="Freshness label" value={dataset.preview.freshnessLabel} />
                            <DatasetDetailMetric label="Completeness label" value={dataset.preview.completenessLabel} />
                            <DatasetDetailMetric label="Record range" value={dataset.preview.recordCountRange} />
                            <div className={`rounded-sm border px-3 py-2.5 ${decisionTone.classes}`}>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Decision signal</div>
                                <div className="mt-2 text-sm font-semibold">{decisionTone.text}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {showSchemaPreview ? (
                    <div className="rounded-md border border-slate-800 bg-slate-950/55 p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Schema preview</div>
                                <h3 className="mt-2 text-lg font-semibold text-white">Representative fields</h3>
                            </div>
                            <div className="text-xs text-slate-500">
                                {dataset.preview.sampleSchema.length} preview field{dataset.preview.sampleSchema.length === 1 ? '' : 's'}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                            {dataset.preview.sampleSchema.slice(0, 8).map(field => (
                                <div
                                    key={`${dataset.id}-${field.field}`}
                                    className="rounded-sm border border-slate-800 bg-slate-900/70 px-3 py-2.5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-white">{field.field}</div>
                                            {field.note ? (
                                                <div className="mt-1 text-xs text-slate-400">{field.note}</div>
                                            ) : null}
                                        </div>
                                        <span className="shrink-0 rounded-sm border border-slate-700 bg-slate-950/70 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-300">
                                            {field.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-3">
                    <PreviewListCard
                        title="Strengths"
                        items={dataset.preview.strengths}
                        emptyLabel="No strengths documented"
                    />
                    <PreviewListCard
                        title="Limitations"
                        items={dataset.preview.limitations}
                        emptyLabel="No limitations documented"
                    />
                    <PreviewListCard
                        title="Suggested use cases"
                        items={dataset.preview.suggestedUseCases}
                        emptyLabel="No suggested use cases documented"
                    />
                </div>
            </div>
        </DatasetDetailPanel>
    )
}

function PreviewListCard({
    title,
    items,
    emptyLabel
}: {
    title: string
    items: string[]
    emptyLabel: string
}) {
    return (
        <div className="rounded-md border border-slate-800 bg-slate-950/55 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</div>
            <div className="mt-3 space-y-2">
                {items.length > 0 ? items.map(item => (
                    <div
                        key={item}
                        className="rounded-sm border border-slate-800 bg-slate-900/70 px-3 py-2.5 text-sm leading-6 text-slate-200"
                    >
                        {item}
                    </div>
                )) : (
                    <div className="rounded-sm border border-slate-800 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-400">
                        {emptyLabel}
                    </div>
                )}
            </div>
        </div>
    )
}
