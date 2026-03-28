import { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { buildAuditDigestSummary, type AuditDigestSummary } from '../../domain/adminAutomation'
import { loadSharedDealLifecycleRecords } from '../../domain/dealLifecycle'

type EventTone = 'ok' | 'warn'

const badgeTone: Record<EventTone, string> = {
    ok: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
    warn: 'text-amber-200 bg-amber-500/10 border-amber-500/30'
}

const fallbackDigest = {
    cards: [
        {
            label: 'Digest Events',
            value: '8',
            detail: 'Presentation-ready admin digest events covering release, rights, token, and dispute flows.'
        },
        {
            label: 'Release Decisions',
            value: '3',
            detail: 'Two release checks cleared and one payout still held for human approval.'
        },
        {
            label: 'Rights Reviews',
            value: '2',
            detail: 'Two rights packages remain visible in governance review lanes.'
        },
        {
            label: 'Flagged Exceptions',
            value: '4',
            detail: 'Credits, token controls, and dispute prep events requiring closer review.'
        }
    ],
    highlights: [
        {
            title: 'Release digest',
            detail: 'One governed payout is ready, one is held for manual approval, and one remains blocked by a protected outcome miss.'
        },
        {
            title: 'Token controls digest',
            detail: 'The system already demonstrates stage-aware token freezing during dispute states and automatic revocation after release.'
        },
        {
            title: 'Dispute prep digest',
            detail: 'A dispute evidence packet is prepared with DUA, quote, engine findings, and recommended next actions for resolution.'
        }
    ],
    events: [
        {
            timestamp: '2026-03-28 14:42 UTC',
            event: 'RELEASE_READY',
            participant: 'part_anon_042',
            dataset: 'Multi-Region Oncology Outcomes',
            purpose: 'Settlement release',
            status: 'CLEARED',
            hash: 'rel8...a103',
            verified: true,
            tone: 'ok' as const
        },
        {
            timestamp: '2026-03-28 14:08 UTC',
            event: 'RELEASE_HELD',
            participant: 'part_anon_017',
            dataset: 'Consolidated Market Tick Archive',
            purpose: 'Settlement release',
            status: 'REVIEW',
            hash: 'rel2...c811',
            verified: true,
            tone: 'warn' as const
        },
        {
            timestamp: '2026-03-28 13:40 UTC',
            event: 'CREDIT_ISSUED',
            participant: 'part_anon_089',
            dataset: 'Payer Claims Benchmark Delta',
            purpose: 'Outcome protection',
            status: 'FLAGGED',
            hash: 'crd3...e220',
            verified: true,
            tone: 'warn' as const
        },
        {
            timestamp: '2026-03-28 13:11 UTC',
            event: 'RIGHTS_FLAGGED',
            participant: 'CP-602441',
            dataset: 'Genomics Validation Cohort',
            purpose: 'Rights governance',
            status: 'REVIEW',
            hash: 'rgt7...b114',
            verified: true,
            tone: 'warn' as const
        },
        {
            timestamp: '2026-03-28 12:58 UTC',
            event: 'RIGHTS_APPROVED',
            participant: 'CP-602441',
            dataset: 'Consumer Credit Risk Signals',
            purpose: 'Rights governance',
            status: 'CLEARED',
            hash: 'rgt1...d905',
            verified: true,
            tone: 'ok' as const
        },
        {
            timestamp: '2026-03-28 12:30 UTC',
            event: 'TOKEN_FROZEN',
            participant: 'part_anon_089',
            dataset: 'Scoped credential',
            purpose: 'Token control',
            status: 'CONTROLLED',
            hash: 'tok5...f610',
            verified: true,
            tone: 'warn' as const
        },
        {
            timestamp: '2026-03-28 11:47 UTC',
            event: 'TOKEN_REVOKED',
            participant: 'part_anon_021',
            dataset: 'Scoped credential',
            purpose: 'Token control',
            status: 'CONTROLLED',
            hash: 'tok9...a874',
            verified: true,
            tone: 'ok' as const
        },
        {
            timestamp: '2026-03-28 11:12 UTC',
            event: 'DISPUTE_PACKET_READY',
            participant: 'part_anon_089',
            dataset: 'Payer Claims Benchmark Delta',
            purpose: 'Dispute prep',
            status: 'ESCALATE',
            hash: 'dsp4...c552',
            verified: true,
            tone: 'warn' as const
        }
    ],
    flaggedCount: 4
} satisfies AuditDigestSummary

export default function AdminAuditTrailPage() {
    const [selectedType, setSelectedType] = useState('All Event Types')
    const auditDigest = useMemo(
        () => buildAuditDigestSummary(loadSharedDealLifecycleRecords()),
        []
    )
    const effectiveDigest = auditDigest.events.length > 0 ? auditDigest : fallbackDigest
    const eventTypes = ['All Event Types', 'Release', 'Credit', 'Rights', 'Token', 'Dispute']

    const displayedEvents = useMemo(() => {
        if (selectedType === 'All Event Types') return effectiveDigest.events
        return effectiveDigest.events.filter(row => row.event.startsWith(selectedType.toUpperCase()))
    }, [effectiveDigest.events, selectedType])

    return (
        <AdminLayout title="AUDIT TRAIL" subtitle="PLATFORM EVENT MONITORING">
            <div className="space-y-6">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
                <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-10">
                    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Audit Trail</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Platform-wide event logging and compliance tracking
                            </p>
                        </div>
                    </header>

                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {effectiveDigest.cards.map(card => (
                            <div key={card.label} className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500">{card.label}</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-200">{card.value}</p>
                                <p className="mt-2 text-xs text-slate-500">{card.detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/35 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-cyan-400">Daily Admin Digest</p>
                                <h2 className="mt-2 text-xl font-semibold text-slate-100">Summarized platform exceptions and automated controls</h2>
                            </div>
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                                {effectiveDigest.flaggedCount} flagged highlight(s)
                            </span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {effectiveDigest.highlights.map(highlight => (
                                <article key={highlight.title} className="rounded-lg border border-slate-800/70 bg-slate-950/45 p-4">
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{highlight.title}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{highlight.detail}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {eventTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                        selectedType === type
                                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                                            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <select className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
                                <option>All Time</option>
                                <option>Today</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-slate-900/30">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-4 py-3 text-left">Timestamp</th>
                                    <th className="px-4 py-3 text-left">Event</th>
                                    <th className="px-4 py-3 text-left">Participant</th>
                                    <th className="px-4 py-3 text-left">Dataset</th>
                                    <th className="px-4 py-3 text-left">Purpose</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Hash</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {displayedEvents.map((row, idx) => (
                                    <tr key={`${row.hash}-${idx}`} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.timestamp}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.event}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.participant}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.dataset}</td>
                                        <td className="px-4 py-3 text-slate-400">{row.purpose}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${row.tone === 'ok' ? badgeTone.ok : badgeTone.warn}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.hash}</td>
                                    </tr>
                                ))}
                                {displayedEvents.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">
                                            No digest events match this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
