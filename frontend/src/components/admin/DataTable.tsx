type Column<T> = {
    key: keyof T | string
    label: string
    render?: (item: T) => React.ReactNode
    width?: string
}

type DataTableProps<T> = {
    columns: Column<T>[]
    data: T[]
    title: string
    badge?: string
    badgeColor?: 'cyan' | 'emerald' | 'amber' | 'red'
    footer?: React.ReactNode
}

const badgeColorMap = {
    cyan: 'bg-cyan-500/10 text-cyan-400/80 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400/80 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400/80 border-red-500/20',
}

export default function DataTable<T extends Record<string, unknown>>({ 
    columns, 
    data, 
    title, 
    badge, 
    badgeColor = 'cyan',
    footer 
}: DataTableProps<T>) {
    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">{title}</h2>
                    {badge && (
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${badgeColorMap[badgeColor]}`}>
                            <span className="text-[9px] font-semibold tracking-wider">{badge}</span>
                        </div>
                    )}
                </div>
                {footer}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-950/40">
                        <tr className="text-[9px] font-semibold text-slate-600 tracking-[0.12em] uppercase">
                            {columns.map((col) => (
                                <th key={String(col.key)} className={`text-left px-5 py-3 font-medium ${col.width || ''}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors duration-150">
                                {columns.map((col) => (
                                    <td key={String(col.key)} className="px-5 py-4">
                                        {col.render 
                                            ? col.render(item) 
                                            : String(item[col.key as keyof T] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
