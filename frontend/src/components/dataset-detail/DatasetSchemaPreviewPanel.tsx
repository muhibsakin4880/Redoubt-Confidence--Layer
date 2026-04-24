import type { DatasetDetail } from '../../data/datasetDetailData'
import DatasetDetailPanel from './DatasetDetailPanel'

type DatasetSchemaPreviewPanelProps = {
    dataset: DatasetDetail
}

export default function DatasetSchemaPreviewPanel({
    dataset
}: DatasetSchemaPreviewPanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Schema preview"
            title="Representative fields"
            badge={
                <div className="text-xs text-slate-500">
                    {dataset.preview.sampleSchema.length} preview field{dataset.preview.sampleSchema.length === 1 ? '' : 's'}
                </div>
            }
        >
            <div className="overflow-x-auto rounded-md border border-slate-800 bg-slate-950/70">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                    <thead className="bg-slate-900/95 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold">Field</th>
                            <th className="px-3 py-2 text-left font-semibold">Type</th>
                            <th className="px-3 py-2 text-left font-semibold">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {dataset.preview.sampleSchema.slice(0, 8).map(field => (
                            <tr key={`${dataset.id}-${field.field}`} className="bg-slate-950/40">
                                <td className="px-3 py-2.5 font-semibold text-slate-100">{field.field}</td>
                                <td className="px-3 py-2.5 text-slate-300">{field.type}</td>
                                <td className="px-3 py-2.5 text-slate-400">{field.note ?? ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DatasetDetailPanel>
    )
}
