type Alert = {
    type: 'critical' | 'warning' | 'info'
    message: string
}

type SecurityAlertsProps = {
    alerts: Alert[]
    title?: string
    subtitle?: string
}

const alertStyles = {
    critical: {
        wrapper: 'border-l-[3px] border-rose-500/60 bg-slate-950/60 backdrop-blur-sm',
        icon: 'bg-red-500/10 border-red-500/20 text-red-400/80',
        iconPath: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
    },
    warning: {
        wrapper: 'border-l-[3px] border-amber-500/50 bg-slate-950/40 backdrop-blur-sm',
        icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400/80',
        iconPath: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
    },
    info: {
        wrapper: 'border-l-[3px] border-cyan-500/40 bg-slate-950/40 backdrop-blur-sm',
        icon: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400/80',
        iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
    },
}

export default function SecurityAlerts({ alerts, title = 'Security Alerts', subtitle = 'REAL-TIME' }: SecurityAlertsProps) {
    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
            <div className="px-5 py-4 border-b border-slate-800/60">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">{title}</h2>
                    <span className="text-[9px] font-medium text-slate-600 tracking-wider">{subtitle}</span>
                </div>
            </div>
            <div className="divide-y divide-slate-800/30">
                {alerts.map((alert, idx) => {
                    const style = alertStyles[alert.type]
                    return (
                        <div key={idx} className={`px-5 py-3.5 ${style.wrapper}`}>
                            <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${style.icon}`}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d={style.iconPath} clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-[11px] text-slate-400 leading-relaxed">{alert.message}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
