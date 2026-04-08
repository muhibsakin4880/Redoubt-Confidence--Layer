type SkeletonProps = {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

export function Skeleton({ className = '', variant = 'rectangular', width, height }: SkeletonProps) {
    const baseClass = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg'
    
    return (
        <div
            className={`animate-pulse bg-slate-700/50 ${baseClass} ${className}`}
            style={{
                width: width ?? '100%',
                height: height ?? (variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '20px')
            }}
            aria-hidden="true"
        />
    )
}

export function DatasetCardSkeleton() {
    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#22304D]/90 bg-[#10192E]/92 px-4 py-4 shadow-[0_24px_60px_-42px_rgba(2,6,23,0.95)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[#22304D]/70 bg-slate-950/45 px-4 py-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-3 h-6 w-16" />
                    <Skeleton className="mt-2 h-3 w-24" />
                </div>
                <div className="rounded-[20px] border border-[#22304D]/70 bg-slate-950/45 px-4 py-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-3 h-6 w-16" />
                    <Skeleton className="mt-2 h-3 w-20" />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16 rounded-[18px]" />
                <Skeleton className="h-16 rounded-[18px]" />
                <Skeleton className="h-16 rounded-[18px]" />
            </div>

            <div className="mt-4 rounded-[20px] border border-[#22304D]/70 bg-slate-950/45 px-4 py-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <Skeleton className="mt-3 h-3 w-2/3" />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <Skeleton className="h-11 w-32 rounded-2xl" />
                <Skeleton className="h-11 w-32 rounded-2xl" />
                <Skeleton className="h-11 flex-1 rounded-2xl" />
            </div>
        </div>
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-5">
            <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="mt-4 w-16 h-8" />
        </div>
    )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-slate-800">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <Skeleton className="w-full h-5" />
                </td>
            ))}
        </tr>
    )
}

export function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-700/80 bg-slate-800/70 p-5">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="w-3/4 h-5" />
                    <Skeleton className="w-1/2 h-4" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-5/6 h-4" />
                <Skeleton className="w-4/5 h-4" />
            </div>
        </div>
    )
}
