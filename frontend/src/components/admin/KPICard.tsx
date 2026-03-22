type KPICardProps = {
    label: string
    value: string | number
    icon: React.ReactNode
    accentColor: 'amber' | 'cyan' | 'red' | 'emerald'
    progress?: number
    progressLabel?: string
}

const colorMap = {
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: 'text-amber-400/80',
        gradient: 'from-amber-500/60 to-amber-500/30',
    },
    cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        icon: 'text-cyan-400/80',
        gradient: 'from-cyan-500/60 to-cyan-500/30',
    },
    red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: 'text-red-400/80',
        gradient: 'from-red-500/60 to-red-500/30',
    },
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: 'text-emerald-400/80',
        gradient: 'from-emerald-500/60 to-emerald-500/30',
    },
}

export default function KPICard({ label, value, icon, accentColor, progress, progressLabel }: KPICardProps) {
    const colors = colorMap[accentColor]

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 shadow-2xl shadow-black/30">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                        <div className={colors.icon}>{icon}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">{label}</span>
                </div>
            </div>
            <span className="text-4xl font-semibold text-slate-100 tracking-tight">{value}</span>
            {progress !== undefined && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] text-slate-600 font-medium tracking-wider">{progressLabel}</span>
                        <span className="text-[9px] text-slate-500 font-medium">{progress}%</span>
                    </div>
                    <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`} style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}
        </div>
    )
}
