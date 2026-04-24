import { Link } from 'react-router-dom'
import type { DealProgressModel, DealProgressStage } from '../../domain/dealProgress'
import DatasetDetailPanel from './DatasetDetailPanel'

type DatasetDealProgressSummaryPanelProps = {
    model: DealProgressModel
    dossierPath?: string | null
}

const stageStateLabel: Record<DealProgressStage['state'], string> = {
    complete: 'Complete',
    current: 'Current',
    upcoming: 'Upcoming',
    issue: 'Attention'
}

const stageStateClasses: Record<DealProgressStage['state'], string> = {
    complete: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
    current: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-100',
    upcoming: 'border-slate-700 bg-slate-900/60 text-slate-300',
    issue: 'border-rose-500/35 bg-rose-500/10 text-rose-100'
}

export default function DatasetDealProgressSummaryPanel({
    model,
    dossierPath
}: DatasetDealProgressSummaryPanelProps) {
    const activeStageIndex = model.stages.findIndex(stage => stage.state === 'current' || stage.state === 'issue')
    const upcomingStageIndex = model.stages.findIndex(stage => stage.state === 'upcoming')
    const stageIndex =
        activeStageIndex >= 0
            ? activeStageIndex
            : upcomingStageIndex >= 0
              ? upcomingStageIndex
              : model.stages.length - 1

    const activeStage = model.stages[stageIndex]

    return (
        <DatasetDetailPanel
            eyebrow="Deal Progress"
            title="Resume deal"
            badge={
                <span className={`rounded-sm border px-2.5 py-1 text-[10px] font-semibold ${stageStateClasses[activeStage.state]}`}>
                    {stageStateLabel[activeStage.state]}
                </span>
            }
            compact
        >
            <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                    <div className="text-2xl font-semibold text-white">{model.completionPercent}%</div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        Step {stageIndex + 1}: {activeStage.label}
                    </div>
                </div>

                <div className="h-2 rounded-sm bg-slate-800">
                    <div
                        className="h-2 rounded-sm bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400"
                        style={{ width: `${model.completionPercent}%` }}
                    />
                </div>

                <p className="text-xs leading-5 text-slate-300">{model.nextAction}</p>

                {dossierPath ? (
                    <Link
                        to={dossierPath}
                        className="inline-flex items-center rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                    >
                        Resume Deal
                    </Link>
                ) : (
                    <span className="inline-flex cursor-not-allowed items-center rounded-sm border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-500">
                        Resume Deal
                    </span>
                )}
            </div>
        </DatasetDetailPanel>
    )
}
