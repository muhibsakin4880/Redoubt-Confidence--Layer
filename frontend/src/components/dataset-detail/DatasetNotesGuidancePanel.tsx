import type { RequestStatus, DatasetDetail } from '../../data/datasetDetailData'
import DatasetDetailPanel from './DatasetDetailPanel'

type DatasetNotesGuidancePanelProps = {
    dataset: DatasetDetail
    requestStatus: RequestStatus
}

export default function DatasetNotesGuidancePanel({
    dataset,
    requestStatus
}: DatasetNotesGuidancePanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Notes & Guidance"
            title="Access notes, provider guidance, and usage instructions"
            description="Operational notes stay visible so buyers can evaluate request fit, approved usage, and provider guidance without leaving the dataset surface."
        >
            <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-2">
                    <NoteCard
                        title="Access notes"
                        subtitle="Guided process"
                        items={dataset.accessNotes}
                    />
                    <NoteCard
                        title="Provider guidance"
                        subtitle="Provider attested"
                        items={dataset.providerNotes}
                        subtitleClassName="border-green-400 bg-green-500/15 text-green-200"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                    <div className="rounded-md border border-slate-800 bg-slate-950/45 p-4">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Access instructions</div>
                        <div className="mt-4 space-y-3">
                            {dataset.access.instructions.map(item => (
                                <div key={item} className="rounded-sm border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-200">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-md border border-slate-800 bg-slate-950/45 p-4">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Usage scope</div>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-sm border border-slate-800 bg-slate-900/70 px-4 py-4">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Allowed usage</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {dataset.access.allowedUsage.map(item => (
                                        <span
                                            key={item}
                                            className="rounded-sm border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-100"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-sm border border-slate-800 bg-slate-900/70 px-4 py-4">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Expiration</div>
                                <div className="mt-2 text-sm font-semibold text-white">{dataset.access.expiration}</div>
                            </div>
                            <div className="rounded-sm border border-slate-800 bg-slate-900/70 px-4 py-4">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Usage limits</div>
                                <div className="mt-2 text-sm leading-6 text-slate-200">{dataset.access.usageLimits}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {requestStatus === 'REQUEST_APPROVED' ? (
                    <div className="rounded-md border border-green-500/30 bg-slate-900/60 p-4">
                        <div className="mb-3 flex items-center gap-2 text-green-200">
                            <span className="h-2 w-2 rounded-full bg-green-300" />
                            <span className="font-semibold">Access granted view</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-white">Access modes</h4>
                                <ul className="space-y-1 text-sm text-slate-300">
                                    <li>Preview-only access</li>
                                    <li>Limited records access</li>
                                    <li>API-limited access</li>
                                    <li>Full secure access (upon approval)</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-white">Allowed usage scope</h4>
                                <ul className="space-y-1 text-sm text-slate-300">
                                    {dataset.access.allowedUsage.map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                                <div className="mt-2 text-sm text-slate-300">
                                    <div><span className="text-slate-500">Expiration:</span> {dataset.access.expiration}</div>
                                    <div><span className="text-slate-500">Usage limits:</span> {dataset.access.usageLimits}</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-slate-400">
                            Identity is disclosed only with your consent. Access is granted based on trust, compliance, and intended usage.
                        </div>
                    </div>
                ) : null}
            </div>
        </DatasetDetailPanel>
    )
}

function NoteCard({
    title,
    subtitle,
    subtitleClassName = 'border-blue-400 bg-blue-500/15 text-blue-200',
    items
}: {
    title: string
    subtitle: string
    subtitleClassName?: string
    items: string[]
}) {
    return (
        <div className="rounded-md border border-slate-800 bg-slate-950/45 p-4">
            <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <span className={`rounded-sm border px-3 py-1 text-xs ${subtitleClassName}`}>{subtitle}</span>
            </div>
            <div className="mt-4 space-y-3">
                {items.map(item => (
                    <div
                        key={item}
                        className="rounded-sm border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-200"
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    )
}
