import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminVisibilityBoundaries, evidenceEvents, evidencePacks, type EvidenceEventStatus, type EvidencePackStatus } from '../../data/adminEvidenceData'

const statusTone: Record<EvidenceEventStatus, string> = {
    Reviewed: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
    Review: 'text-amber-200 bg-amber-500/10 border-amber-500/30',
    Exception: 'text-red-200 bg-red-500/10 border-red-500/30'
}

const packStatusTone: Record<EvidencePackStatus, string> = {
    Ready: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
    'In Review': 'text-amber-200 bg-amber-500/10 border-amber-500/30',
    Blocked: 'text-red-200 bg-red-500/10 border-red-500/30'
}

export default function AdminAuditTrailPage() {
    const [selectedStatus, setSelectedStatus] = useState<'All' | EvidenceEventStatus>('All')

    const filteredEvents = useMemo(() => {
        if (selectedStatus === 'All') return evidenceEvents
        return evidenceEvents.filter((event) => event.status === selectedStatus)
    }, [selectedStatus])

    const reviewedCount = evidenceEvents.filter((event) => event.status === 'Reviewed').length
    const reviewCount = evidenceEvents.filter((event) => event.status === 'Review').length
    const exceptionCount = evidenceEvents.filter((event) => event.status === 'Exception').length

    const summaryCards = [
        {
            label: 'Evidence Events',
            value: evidenceEvents.length.toString(),
            detail: 'Cross-linked review, incident, and approval events held in the admin evidence ledger.'
        },
        {
            label: 'Reviewed Events',
            value: reviewedCount.toString(),
            detail: 'Events ready to support approval, incident closure, or broader evidence review conversations.'
        },
        {
            label: 'Exceptions',
            value: exceptionCount.toString(),
            detail: 'Evidence entries that still require legal, residency, or ethics follow-up.'
        },
        {
            label: 'Pack Handoffs',
            value: evidencePacks.length.toString(),
            detail: 'Evidence packs referenced directly from the review and incident surfaces.'
        }
    ]

    return (
        <AdminLayout title="AUDIT & EVIDENCE TRAIL" subtitle="EVIDENCE EVENTS, EXCEPTION REVIEW & PACK HANDOFFS">
            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-5">
                    {summaryCards.map((card) => (
                        <div key={card.label} className="col-span-3 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                            <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">{card.value}</p>
                            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{card.detail}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-8 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Evidence Event Ledger</h2>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                    A review-focused audit view that emphasizes evidence state, exception handling, and visibility limits.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(['All', 'Reviewed', 'Review', 'Exception'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                                            selectedStatus === status
                                                ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                                                : 'border-slate-700/80 bg-slate-800/60 text-slate-300 hover:bg-slate-700/70'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/35">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-950/70 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Timestamp</th>
                                        <th className="px-4 py-3 text-left">Review</th>
                                        <th className="px-4 py-3 text-left">Organization</th>
                                        <th className="px-4 py-3 text-left">Surface</th>
                                        <th className="px-4 py-3 text-left">Event</th>
                                        <th className="px-4 py-3 text-left">Visibility</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {filteredEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-slate-800/30">
                                            <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{event.timestamp}</td>
                                            <td className="px-4 py-3 text-[10px] font-semibold text-cyan-300">{event.reviewId}</td>
                                            <td className="px-4 py-3 text-[11px] text-slate-200">{event.organization}</td>
                                            <td className="px-4 py-3 text-[10px] text-slate-300">{event.surface}</td>
                                            <td className="px-4 py-3 text-[10px] leading-relaxed text-slate-300">{event.event}</td>
                                            <td className="px-4 py-3 text-[10px] text-slate-500">{event.visibility}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusTone[event.status]}`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredEvents.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-[10px] text-slate-500">
                                                No evidence events match this filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="col-span-4 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Exception Watchlist</h2>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                    The most important evidence blockers still visible to the review team.
                                </p>
                            </div>
                            <Link
                                to="/admin/security-compliance"
                                className="rounded-md border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700/70"
                            >
                                Open controls
                            </Link>
                        </div>

                        <div className="mt-4 space-y-3">
                            {evidencePacks.filter((pack) => pack.status !== 'Ready').map((pack) => (
                                <article key={pack.id} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{pack.reviewId}</p>
                                            <h3 className="mt-1 text-[12px] font-semibold text-slate-100">{pack.name}</h3>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${packStatusTone[pack.status]}`}>
                                            {pack.status}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{pack.blocker ?? pack.scope}</p>
                                    <p className="mt-2 text-[9px] text-slate-500">{pack.organization} · {pack.owner}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-7 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Evidence Pack Handoff</h2>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                    How the same evidence bundle moves between review, audit, and incident-response surfaces.
                                </p>
                            </div>
                            <Link
                                to="/admin/incident-response"
                                className="rounded-md border border-cyan-500/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400/80 transition hover:border-cyan-500/50 hover:bg-cyan-500/10"
                            >
                                Open incident chain
                            </Link>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {evidencePacks.map((pack) => (
                                <article key={pack.id} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{pack.id}</p>
                                            <h3 className="mt-1 text-[12px] font-semibold text-slate-100">{pack.organization}</h3>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${packStatusTone[pack.status]}`}>
                                            {pack.status}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{pack.scope}</p>
                                    <div className="mt-4 space-y-2 text-[10px] text-slate-500">
                                        <p>Review surface: {pack.reviewId}</p>
                                        <p>Owner: {pack.owner}</p>
                                        <p>Updated: {pack.updatedAt}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="col-span-5 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Visibility Rules</h2>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                            Audit surfaces should prove what happened without exposing content that belongs inside protected evaluation boundaries.
                        </p>

                        <div className="mt-4 space-y-3">
                            {adminVisibilityBoundaries.map((boundary) => (
                                <article key={boundary.title} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <h3 className="text-[12px] font-semibold text-slate-100">{boundary.title}</h3>
                                    <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{boundary.detail}</p>
                                    <p className="mt-3 text-[10px] text-emerald-200">Visible: {boundary.visibleToAdmins}</p>
                                    <p className="mt-2 text-[10px] text-slate-500">Held back: {boundary.hiddenFromAdmins}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    )
}
