import DatasetDetailPanel, { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetUaeOperatingPosturePanelProps = {
    uaeJurisdictionResidencyPanel: {
        accessRegion: string
        operatingRegion: string
        residencyPosture: string
        datasetPosture: string
        postureSummary: string
        badgeClassName: string
    }
    compatibilityBadges: ReadonlyArray<string>
}

export default function DatasetUaeOperatingPosturePanel({
    uaeJurisdictionResidencyPanel,
    compatibilityBadges
}: DatasetUaeOperatingPosturePanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Jurisdiction & Residency"
            title="UAE operating posture"
            description="Product posture summary for regulated evaluation routing across UAE-relevant operating boundaries."
            badge={
                <div className={`inline-flex w-fit items-center rounded-sm border px-3 py-1.5 text-xs font-semibold ${uaeJurisdictionResidencyPanel.badgeClassName}`}>
                    {uaeJurisdictionResidencyPanel.datasetPosture}
                </div>
            }
            className="bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.94)_0%,rgba(15,23,42,0.9)_100%)]"
        >
            <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                    <DatasetDetailMetric label="Access region" value={uaeJurisdictionResidencyPanel.accessRegion} />
                    <DatasetDetailMetric label="Operating region" value={uaeJurisdictionResidencyPanel.operatingRegion} />
                    <DatasetDetailMetric label="Residency posture" value={uaeJurisdictionResidencyPanel.residencyPosture} />
                </div>

                <div className="rounded-sm border border-slate-800 bg-slate-950/60 px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Dataset classification</div>
                    <div className="mt-2 text-base font-semibold text-white">{uaeJurisdictionResidencyPanel.datasetPosture}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{uaeJurisdictionResidencyPanel.postureSummary}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {compatibilityBadges.map(badge => (
                        <span
                            key={badge}
                            className="inline-flex items-center rounded-sm border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200"
                        >
                            {badge}
                        </span>
                    ))}
                </div>

                <p className="text-xs leading-6 text-slate-400">
                    This summarizes Redoubt&apos;s operating posture for regulated evaluation workflows and does not constitute legal advice.
                </p>
            </div>
        </DatasetDetailPanel>
    )
}
