import { Link } from 'react-router-dom'
import type { DatasetDetail } from '../../data/datasetDetailData'
import { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetHeroPanelProps = {
    dataset: DatasetDetail
    dealId: string
    dealType: string
    dossierPath: string | null
    providerPacketPath: string | null
    availableSurfaceCount: number
    placeholderSurfaceCount: number
}

export default function DatasetHeroPanel({
    dataset,
    dealId,
    dealType,
    dossierPath,
    providerPacketPath,
    availableSurfaceCount,
    placeholderSurfaceCount
}: DatasetHeroPanelProps) {
    return (
        <section className="rounded-md border border-slate-800 bg-slate-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-5">
            <p className="text-base leading-7 text-slate-300">{dataset.description}</p>

            {dossierPath ? (
                <DealDossierHeroStrip
                    dealId={dealId}
                    dealType={dealType}
                    dossierPath={dossierPath}
                    providerPacketPath={providerPacketPath}
                    availableSurfaceCount={availableSurfaceCount}
                    placeholderSurfaceCount={placeholderSurfaceCount}
                />
            ) : null}
        </section>
    )
}

function DealDossierHeroStrip({
    dealId,
    dealType,
    dossierPath,
    providerPacketPath,
    availableSurfaceCount,
    placeholderSurfaceCount
}: {
    dealId: string
    dealType: string
    dossierPath: string
    providerPacketPath: string | null
    availableSurfaceCount: number
    placeholderSurfaceCount: number
}) {
    return (
        <section className="mt-5 overflow-hidden rounded-md border border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),linear-gradient(135deg,rgba(8,17,31,0.98)_0%,rgba(15,23,42,0.9)_100%)] p-4 shadow-[0_14px_40px_rgba(2,8,20,0.22)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                            Evaluation Dossier
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                            {dealId}
                        </span>
                        <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                            {dealType}
                        </span>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-white">
                        This dataset has a dedicated deal operating surface
                    </h2>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <DatasetDetailMetric
                            label="Dossier route"
                            value={dossierPath}
                            className="min-w-0"
                            valueClassName="truncate text-xs"
                        />
                        <DatasetDetailMetric
                            label="Available surfaces"
                            value={`${availableSurfaceCount} configured`}
                            className="min-w-0"
                        />
                        <DatasetDetailMetric
                            label="Pending surfaces"
                            value={placeholderSurfaceCount > 0 ? `${placeholderSurfaceCount} placeholders` : 'None'}
                            className="min-w-0"
                        />
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 xl:flex-col">
                    <Link
                        to={dossierPath}
                        className="inline-flex justify-center rounded-sm bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
                    >
                        Open evaluation dossier
                    </Link>
                    {providerPacketPath ? (
                        <Link
                            to={providerPacketPath}
                            className="inline-flex justify-center rounded-sm border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-white"
                        >
                            Open provider rights packet
                        </Link>
                    ) : null}
                </div>
            </div>
        </section>
    )
}
