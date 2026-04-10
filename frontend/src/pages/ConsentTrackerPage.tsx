import React from 'react'

type StatusTone = 'ok' | 'warn' | 'alert'

type ConsentRow = {
    participant: string
    dataset: string
    purpose: string
    legalBasis: string
    granted: string
    expires: string
    status: 'Active' | 'Expiring Soon' | 'Expired'
    tone: StatusTone
}

const summaryStats = [
    { label: 'Active Consents', value: '47' },
    { label: 'Expiring This Month', value: '3' },
    { label: 'Revoked', value: '2' },
    { label: 'Pending Review', value: '5' }
]

const consentRows: ConsentRow[] = [
    { participant: 'part_anon_042', dataset: 'Global Climate 2020-2024', purpose: 'ML Training', legalBasis: 'Legitimate Interest', granted: '2026-01-15', expires: '2026-07-15', status: 'Active', tone: 'ok' },
    { participant: 'part_anon_017', dataset: 'Financial Tick Data', purpose: 'Risk Modeling', legalBasis: 'Contractual Necessity', granted: '2026-02-01', expires: '2026-08-01', status: 'Active', tone: 'ok' },
    { participant: 'part_anon_089', dataset: 'Consumer Behavior Analytics', purpose: 'Research', legalBasis: 'Explicit Consent', granted: '2026-02-10', expires: '2026-04-10', status: 'Expiring Soon', tone: 'warn' },
    { participant: 'part_anon_031', dataset: 'Genomics Research Dataset', purpose: 'Academic Research', legalBasis: 'Explicit Consent', granted: '2026-01-20', expires: '2026-03-20', status: 'Expired', tone: 'alert' },
    { participant: 'part_anon_008', dataset: 'Clinical Outcomes Delta', purpose: 'Healthcare Analytics', legalBasis: 'Contractual Necessity', granted: '2026-02-15', expires: '2026-08-15', status: 'Active', tone: 'ok' },
    { participant: 'part_anon_056', dataset: 'Smart Grid Energy', purpose: 'Urban Planning', legalBasis: 'Legitimate Interest', granted: '2026-03-01', expires: '2026-09-01', status: 'Active', tone: 'ok' },
    { participant: 'part_anon_073', dataset: 'Satellite Land Use 2024', purpose: 'Climate Research', legalBasis: 'Explicit Consent', granted: '2026-02-20', expires: '2026-05-20', status: 'Active', tone: 'ok' }
]

const revocations = [
    { participant: 'part_anon_019', dataset: 'Financial Tick Data', revoked: '2026-02-28', reason: 'Purpose expired' },
    { participant: 'part_anon_044', dataset: 'Genomics Research Dataset', revoked: '2026-02-15', reason: 'Participant request' }
]

const toneBadge: Record<StatusTone, string> = {
    ok: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
    warn: 'text-amber-200 bg-amber-500/10 border-amber-500/30',
    alert: 'text-rose-200 bg-rose-500/10 border-rose-500/30'
}

export default function ConsentTrackerPage() {
    const expiredCount = consentRows.filter(row => row.status === 'Expired').length
    const expiringSoonCount = consentRows.filter(row => row.status === 'Expiring Soon').length
    const pendingReviewCount = Number(summaryStats.find(stat => stat.label === 'Pending Review')?.value ?? 0)
    const consentNeedsReview = expiredCount > 0 || expiringSoonCount > 0 || pendingReviewCount > 0

    return (
        <div className="relative min-h-screen bg-[#010915] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Consent & Legal Basis Tracker
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Consent & Legal Basis Tracker</h1>
                        <p className="mt-2 text-slate-400">
                            Purpose-of-use capture, expiration tracking, and revocation management per dataset access request
                        </p>
                    </div>
                    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-[0_0_20px_rgba(16,185,129,0.18)] ${
                        consentNeedsReview
                            ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
                            : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                    }`}>
                        {consentNeedsReview ? 'Reviewer confirmation required' : 'Consent review timeline'}
                    </div>
                </header>

                <section className="mt-10">
                    <div className={`relative overflow-hidden rounded-2xl border px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.18)] ${
                        consentNeedsReview
                            ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/8 to-amber-400/10'
                            : 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10'
                    }`}>
                        <div className={`absolute inset-0 ${
                            consentNeedsReview
                                ? 'bg-[radial-gradient(circle_at_10%_50%,rgba(245,158,11,0.18),transparent_35%)]'
                                : 'bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.25),transparent_35%)]'
                        }`} />
                        <div className="relative flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className={`h-3 w-3 rounded-full animate-pulse ${
                                    consentNeedsReview
                                        ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.9)]'
                                        : 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]'
                                }`} />
                                <div>
                                    <p className={`text-base font-semibold ${consentNeedsReview ? 'text-amber-100' : 'text-emerald-200'}`}>
                                        {consentNeedsReview ? 'Reviewer confirmation required' : 'Consent status looks current'}
                                    </p>
                                    <p className={`text-xs ${consentNeedsReview ? 'text-amber-100/70' : 'text-emerald-100/70'}`}>
                                        {consentNeedsReview
                                            ? `${expiredCount} expired, ${expiringSoonCount} expiring soon, and ${pendingReviewCount} pending review in this demo sample.`
                                            : 'No expiring or revoked records are shown in the current sample.'}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-xs font-medium ${consentNeedsReview ? 'text-amber-100/70' : 'text-emerald-100/70'}`}>
                                Next expiry: April 2026
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-10 grid gap-6 md:grid-cols-4">
                    {summaryStats.map(stat => (
                        <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                            <p className="mt-3 text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[2.2fr_1fr]">
                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-slate-500">
                                    <tr>
                                        {['Participant', 'Dataset', 'Purpose', 'Legal Basis', 'Granted', 'Expires', 'Status'].map(head => (
                                            <th key={head} className="px-4 py-3 whitespace-nowrap">{head}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {consentRows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-white/3">
                                            <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{row.participant}</td>
                                            <td className="px-4 py-3 text-white whitespace-nowrap">{row.dataset}</td>
                                            <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.purpose}</td>
                                            <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.legalBasis}</td>
                                            <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.granted}</td>
                                            <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.expires}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneBadge[row.tone]}`}>
                                                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">Recent Revocations</h3>
                            <span className="text-xs text-slate-500">Review history</span>
                        </div>
                        <div className="space-y-4">
                            {revocations.map(item => (
                                <div key={item.participant} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                    <p className="text-sm font-semibold text-white">{item.participant}</p>
                                    <p className="text-xs text-slate-400">{item.dataset}</p>
                                    <div className="mt-2 text-xs text-slate-300 flex justify-between">
                                        <span>Revoked: {item.revoked}</span>
                                        <span className="text-amber-300">{item.reason}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(59,130,246,0.25)]">Export Consent Report</button>
                        <button className="rounded-lg border border-amber-400 text-amber-200 px-4 py-2 text-sm font-semibold hover:bg-amber-500/10">Review Expiring</button>
                    </div>
                    <p className="text-xs text-slate-500">Consent records are shown as preserved demo history and should still be confirmed by reviewers.</p>
                </section>
            </div>
        </div>
    )
}
