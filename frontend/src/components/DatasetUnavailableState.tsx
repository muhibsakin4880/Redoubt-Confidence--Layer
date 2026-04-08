import { Link } from 'react-router-dom'

type DatasetUnavailableStateProps = {
    contextLabel: string
    title?: string
    detail?: string
}

export default function DatasetUnavailableState({
    contextLabel,
    title = 'Dataset unavailable',
    detail = 'The selected dataset could not be found. Return to Dataset Discovery to choose another record.'
}: DatasetUnavailableStateProps) {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_78%_0%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_52%_80%,rgba(16,185,129,0.08),transparent_32%)]" />
            <div className="relative mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12 lg:px-10">
                <div className="w-full rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.5)] backdrop-blur-xl sm:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                        {contextLabel}
                    </div>
                    <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{detail}</p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/datasets"
                            className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                        >
                            Return to Dataset Discovery
                        </Link>
                        <Link
                            to="/guided-tour"
                            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/30 hover:text-cyan-100"
                        >
                            Open guided tour
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
