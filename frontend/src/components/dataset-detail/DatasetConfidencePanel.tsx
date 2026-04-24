import { confidenceLevel, type DatasetDetail } from '../../data/datasetDetailData'
import DatasetDetailPanel, { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetConfidencePanelProps = {
    dataset: DatasetDetail
}

export default function DatasetConfidencePanel({
    dataset
}: DatasetConfidencePanelProps) {
    const confidenceTone = confidenceLevel(dataset.confidenceScore)

    return (
        <DatasetDetailPanel
            title="Overall Confidence Score"
            className="bg-slate-900/55"
        >
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="text-4xl font-semibold tracking-[-0.05em] text-white">{dataset.confidenceScore}%</div>
                    <span className={`rounded-sm border px-2.5 py-1 text-xs ${confidenceTone.classes}`}>
                        {confidenceTone.label}
                    </span>
                </div>

                <div className="h-2 rounded-sm bg-slate-800">
                    <div
                        className="h-2 rounded-sm bg-gradient-to-r from-blue-400 via-cyan-300 to-green-300"
                        style={{ width: `${dataset.confidenceScore}%` }}
                    />
                </div>

                <p className="text-sm leading-6 text-slate-300">{dataset.confidenceSummary}</p>

                <div className="grid gap-2">
                    <DatasetDetailMetric label="Completeness" value={`${dataset.quality.completeness}%`} />
                    <DatasetDetailMetric label="Freshness" value={`${dataset.quality.freshnessScore}%`} />
                    <DatasetDetailMetric label="Consistency" value={`${dataset.quality.consistency}%`} />
                    <DatasetDetailMetric label="Validation" value={dataset.quality.validationStatus} valueClassName="leading-6" />
                </div>

                <div className="rounded-sm border border-slate-800 bg-slate-950/65 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-300">Quality review signal</span>
                        <span className="rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-100">
                            {dataset.preview.freshnessLabel}
                        </span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-400">
                        Preview-only access remains active until a governed request is approved. Provider identity stays shielded throughout preview review.
                    </p>
                </div>
            </div>
        </DatasetDetailPanel>
    )
}
