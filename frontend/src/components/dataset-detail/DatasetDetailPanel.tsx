import type { ReactNode } from 'react'

type DatasetDetailPanelProps = {
    eyebrow?: string
    title: string
    description?: string
    badge?: ReactNode
    action?: ReactNode
    className?: string
    bodyClassName?: string
    children: ReactNode
}

export default function DatasetDetailPanel({
    eyebrow,
    title,
    description,
    badge,
    action,
    className = '',
    bodyClassName = '',
    children
}: DatasetDetailPanelProps) {
    return (
        <section
            className={`rounded-md border border-slate-800 bg-slate-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-5 ${className}`.trim()}
        >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    {eyebrow ? (
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{eyebrow}</div>
                    ) : null}
                    <h2 className={`${eyebrow ? 'mt-1.5' : ''} text-lg font-semibold text-white`.trim()}>{title}</h2>
                    {description ? (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
                    ) : null}
                </div>

                {badge || action ? (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {badge}
                        {action}
                    </div>
                ) : null}
            </div>

            <div className={`mt-4 ${bodyClassName}`.trim()}>{children}</div>
        </section>
    )
}

export function DatasetDetailMetric({
    label,
    value,
    className = '',
    valueClassName = ''
}: {
    label: string
    value: ReactNode
    className?: string
    valueClassName?: string
}) {
    return (
        <div
            className={`rounded-sm border border-slate-800 bg-slate-950/60 px-3 py-2.5 ${className}`.trim()}
        >
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-2 text-sm font-semibold text-white ${valueClassName}`.trim()}>{value}</div>
        </div>
    )
}
