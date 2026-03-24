import { useMemo, useState } from 'react'
import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from '../domain/accessContract'
import LifecycleGuidancePanel from '../components/LifecycleGuidancePanel'
import { canPerformBuyerEscrowAction } from '../domain/actionGuardrails'
import SecurityAuditTimeline from '../components/SecurityAuditTimeline'
import ContractHealthPanel from '../components/ContractHealthPanel'
import TransitionImpactPanel from '../components/TransitionImpactPanel'
import ExecutionRunbookPanel from '../components/ExecutionRunbookPanel'
import ControlTowerPanel from '../components/ControlTowerPanel'
import ResilienceInsightsPanel from '../components/ResilienceInsightsPanel'
import PolicyAttestationPanel from '../components/PolicyAttestationPanel'
import DecisionGatePanel from '../components/DecisionGatePanel'

type EscrowStatus = Extract<
    ContractLifecycleState,
    'REQUEST_SUBMITTED' | 'FUNDS_HELD' | 'ACCESS_ACTIVE' | 'RELEASE_PENDING' | 'RELEASED_TO_PROVIDER' | 'DISPUTE_OPEN'
>

type AccessMethod = 'platform' | 'download'

type EscrowTransaction = {
    id: string
    dataset: string
    buyer: string
    provider: string
    amount: string
    accessMethod: AccessMethod
    status: EscrowStatus
}

const escrowTransactions: EscrowTransaction[] = [
    { id: 'ESC-2026-001', dataset: 'Global Climate 2020-2024', buyer: 'part_anon_042', provider: 'anon_provider_003', amount: '$299', accessMethod: 'platform', status: 'REQUEST_SUBMITTED' },
    { id: 'ESC-2026-002', dataset: 'Financial Tick Data', buyer: 'part_anon_017', provider: 'anon_provider_007', amount: '$499', accessMethod: 'platform', status: 'FUNDS_HELD' },
    { id: 'ESC-2026-003', dataset: 'Clinical Outcomes Delta', buyer: 'part_anon_089', provider: 'anon_provider_012', amount: '$799', accessMethod: 'download', status: 'ACCESS_ACTIVE' },
    { id: 'ESC-2026-004', dataset: 'Consumer Behavior Analytics', buyer: 'part_anon_031', provider: 'anon_provider_005', amount: '$399', accessMethod: 'platform', status: 'ACCESS_ACTIVE' },
    { id: 'ESC-2026-005', dataset: 'Genomics Research Dataset', buyer: 'part_anon_056', provider: 'anon_provider_009', amount: '$599', accessMethod: 'download', status: 'RELEASED_TO_PROVIDER' },
    { id: 'ESC-2026-006', dataset: 'Satellite Land Use 2024', buyer: 'part_anon_008', provider: 'anon_provider_002', amount: '$249', accessMethod: 'platform', status: 'DISPUTE_OPEN' },
    { id: 'ESC-2026-007', dataset: 'Healthcare Claims 2023', buyer: 'part_anon_015', provider: 'anon_provider_011', amount: '$899', accessMethod: 'download', status: 'ACCESS_ACTIVE' },
    { id: 'ESC-2026-008', dataset: 'IoT Sensor Network Data', buyer: 'part_anon_028', provider: 'anon_provider_004', amount: '$349', accessMethod: 'platform', status: 'RELEASE_PENDING' },
    { id: 'ESC-2026-009', dataset: 'Retail Transaction Logs', buyer: 'part_anon_063', provider: 'anon_provider_008', amount: '$449', accessMethod: 'platform', status: 'FUNDS_HELD' }
]

const statusStyles: Record<EscrowStatus, { badge: string; text: string }> = {
    REQUEST_SUBMITTED: { badge: 'border-slate-500/40 bg-slate-500/10 text-slate-300', text: CONTRACT_STATE_LABELS.REQUEST_SUBMITTED },
    FUNDS_HELD: { badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300', text: CONTRACT_STATE_LABELS.FUNDS_HELD },
    ACCESS_ACTIVE: { badge: 'border-blue-500/40 bg-blue-500/10 text-blue-300', text: CONTRACT_STATE_LABELS.ACCESS_ACTIVE },
    RELEASE_PENDING: { badge: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300', text: CONTRACT_STATE_LABELS.RELEASE_PENDING },
    RELEASED_TO_PROVIDER: { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', text: CONTRACT_STATE_LABELS.RELEASED_TO_PROVIDER },
    DISPUTE_OPEN: { badge: 'border-rose-500/40 bg-rose-500/10 text-rose-300', text: CONTRACT_STATE_LABELS.DISPUTE_OPEN }
}

const accessMethodStyles: Record<AccessMethod, { badge: string; icon: string }> = {
    platform: { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', icon: '🔒' },
    download: { badge: 'border-blue-500/40 bg-blue-500/10 text-blue-300', icon: '⬇️' }
}

const filterTabs = ['All', 'Active', 'Pending', 'Release Pending', 'Disputed', 'Released'] as const
type FilterTab = (typeof filterTabs)[number]
const feedbackTags = ['Accurate schema', 'Clean data', 'As described', 'Fast access', 'Schema mismatch', 'Poor quality']
const activeDisputes = [
    { id: 'ESC-2026-006', dataset: 'Satellite Land Use 2024', raisedBy: 'part_anon_008', reason: 'Data schema mismatch from description', raised: '2026-03-09', status: 'Under Investigation' }
]

export default function EscrowCenterPage() {
    const [selectedId, setSelectedId] = useState('ESC-2026-003')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [activeFilter, setActiveFilter] = useState<FilterTab>('All')
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)
    const [starRating, setStarRating] = useState(0)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [comment, setComment] = useState('')
    const [showSuccessToast, setShowSuccessToast] = useState(false)

    const selectedTransaction = useMemo(() => {
        return escrowTransactions.find(item => item.id === selectedId) ?? escrowTransactions[2]
    }, [selectedId])
    const releasePaymentGuardrail = useMemo(
        () => canPerformBuyerEscrowAction('release_payment', selectedTransaction.status),
        [selectedTransaction.status]
    )
    const openDisputeGuardrail = useMemo(
        () => canPerformBuyerEscrowAction('open_dispute', selectedTransaction.status),
        [selectedTransaction.status]
    )
    const extendWindowGuardrail = useMemo(
        () => canPerformBuyerEscrowAction('extend_window', selectedTransaction.status),
        [selectedTransaction.status]
    )

    const filteredTransactions = useMemo(() => {
        if (activeFilter === 'All') return escrowTransactions
        if (activeFilter === 'Active') return escrowTransactions.filter(t => t.status === 'ACCESS_ACTIVE')
        if (activeFilter === 'Pending') return escrowTransactions.filter(t => t.status === 'REQUEST_SUBMITTED' || t.status === 'FUNDS_HELD')
        if (activeFilter === 'Release Pending') return escrowTransactions.filter(t => t.status === 'RELEASE_PENDING')
        if (activeFilter === 'Disputed') return escrowTransactions.filter(t => t.status === 'DISPUTE_OPEN')
        return escrowTransactions.filter(t => t.status === 'RELEASED_TO_PROVIDER')
    }, [activeFilter])
    const buyerPortfolioDigests = useMemo(
        () =>
            filteredTransactions.map(transaction => ({
                contractId: transaction.id,
                state: transaction.status,
                role: 'buyer' as const
            })),
        [filteredTransactions]
    )

    const totalPageValue = useMemo(() => {
        return filteredTransactions.reduce((sum, t) => sum + parseInt(t.amount.replace('$', ''), 10), 0)
    }, [filteredTransactions])

    const summaryStats = useMemo(() => {
        const activeEscrows = escrowTransactions.filter(t => t.status === 'ACCESS_ACTIVE').length
        const pendingReview = escrowTransactions.filter(t => t.status === 'REQUEST_SUBMITTED' || t.status === 'FUNDS_HELD').length
        const released = escrowTransactions.filter(t => t.status === 'RELEASED_TO_PROVIDER').length
        const disputes = escrowTransactions.filter(t => t.status === 'DISPUTE_OPEN').length
        const totalValue = escrowTransactions.reduce((sum, t) => sum + parseInt(t.amount.replace('$', ''), 10), 0)

        return [
            { label: 'Access Active', value: `${activeEscrows}` },
            { label: 'Pending Review/Hold', value: `${pendingReview}` },
            { label: 'Released Cases', value: `${released}` },
            { label: 'Disputes', value: `${disputes}` },
            { label: 'Total Value in Escrow', value: `$${totalValue.toLocaleString()}` }
        ]
    }, [])

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    const handleSubmitFeedback = () => {
        setShowFeedbackModal(false)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-6 text-white">
            {showSuccessToast && (
                <div className="fixed top-4 right-4 z-50 bg-emerald-600/90 border border-emerald-400 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse">
                    Payment released successfully ✓
                </div>
            )}

            <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Escrow Center
                    </div>
                    <h1 className="mt-3 text-3xl font-bold">Escrow Center</h1>
                    <p className="text-slate-400 text-sm mt-1">Secure transaction management for all dataset access requests</p>
                </div>
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
                    Escrow protections active across all transactions
                </div>
            </header>

            <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {summaryStats.map(stat => (
                    <div key={stat.label} className="bg-slate-900/70 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</div>
                        <div className="text-2xl font-semibold mt-2">{stat.value}</div>
                    </div>
                ))}
            </section>

            <ResilienceInsightsPanel
                digests={buyerPortfolioDigests}
                compact
                title="Buyer Portfolio Resilience"
            />

            <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Escrow Transactions</h2>
                        </div>
                        <div className="flex gap-1">
                            {filterTabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveFilter(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        activeFilter === tab
                                            ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
                                            : 'border border-slate-700 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-900/90 text-xs uppercase text-slate-400">
                                <tr>
                                    <th className="px-3 py-3 font-medium">Request ID</th>
                                    <th className="px-3 py-3 font-medium">Dataset</th>
                                    <th className="px-3 py-3 font-medium">Buyer</th>
                                    <th className="px-3 py-3 font-medium">Provider</th>
                                    <th className="px-3 py-3 font-medium">Amount</th>
                                    <th className="px-3 py-3 font-medium">Access Method</th>
                                    <th className="px-3 py-3 font-medium">Status</th>
                                    <th className="px-3 py-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredTransactions.map(row => {
                                    const isSelected = row.id === selectedId
                                    const statusStyle = statusStyles[row.status]
                                    const accessStyle = accessMethodStyles[row.accessMethod]
                                    return (
                                        <tr
                                            key={row.id}
                                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-slate-700/50' : 'hover:bg-slate-800/50'}`}
                                            onClick={() => setSelectedId(row.id)}
                                        >
                                            <td className="px-3 py-3 text-cyan-300 font-mono text-xs">{row.id}</td>
                                            <td className="px-3 py-3 text-slate-200">{row.dataset}</td>
                                            <td className="px-3 py-3 text-slate-400 font-mono text-xs">{row.buyer}</td>
                                            <td className="px-3 py-3 text-slate-400 font-mono text-xs">{row.provider}</td>
                                            <td className="px-3 py-3 text-slate-200 font-mono">{row.amount}</td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${accessStyle.badge}`}>
                                                    {accessStyle.icon} {row.accessMethod === 'platform' ? 'Platform Only' : 'Platform + Download'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle.badge}`}>
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            row.status === 'ACCESS_ACTIVE'
                                                                ? 'bg-blue-400 animate-pulse'
                                                                : row.status === 'DISPUTE_OPEN'
                                                                  ? 'bg-rose-400'
                                                                  : row.status === 'FUNDS_HELD' || row.status === 'REQUEST_SUBMITTED'
                                                                    ? 'bg-amber-400'
                                                                    : row.status === 'RELEASE_PENDING'
                                                                      ? 'bg-indigo-400'
                                                                      : row.status === 'RELEASED_TO_PROVIDER'
                                                                        ? 'bg-emerald-400'
                                                                        : 'bg-slate-400'
                                                        }`}
                                                    />
                                                    {statusStyle.text}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <button className="px-2 py-1 rounded border border-slate-600 text-xs text-slate-300 hover:border-cyan-500 hover:text-cyan-200 transition-colors">
                                                    VIEW
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-900/50">
                        <div className="text-xs text-slate-400">Total Escrow Value (this page): <span className="text-cyan-300 font-mono font-semibold">${totalPageValue.toLocaleString()}</span></div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">10 per page</span>
                            <button className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:text-white">Prev</button>
                            <button className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-1 text-xs text-cyan-200">1</button>
                            <button className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:text-white">2</button>
                            <button className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:text-white">3</button>
                            <button className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:text-white">Next</button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold">Escrow Detail — {selectedTransaction.id}</h2>
                        <p className="text-xs text-slate-400 mt-1">Active escrow monitoring for {selectedTransaction.dataset}</p>
                        <div className="mt-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${accessMethodStyles[selectedTransaction.accessMethod].badge}`}>
                                {accessMethodStyles[selectedTransaction.accessMethod].icon} {selectedTransaction.accessMethod === 'platform' ? 'Platform Only' : 'Platform + Download'}
                            </span>
                        </div>
                    </div>

                    <LifecycleGuidancePanel role="buyer" state={selectedTransaction.status} compact title="Contract Guidance" />
                    <ContractHealthPanel
                        contractId={selectedTransaction.id}
                        state={selectedTransaction.status}
                        compact
                        title="Escrow Integrity Monitor"
                    />
                    <TransitionImpactPanel
                        contractId={selectedTransaction.id}
                        state={selectedTransaction.status}
                        role="buyer"
                        compact
                        title="Action Impact Simulator"
                    />
                    <ControlTowerPanel
                        contractId={selectedTransaction.id}
                        state={selectedTransaction.status}
                        role="buyer"
                        compact
                        title="Buyer Control Tower"
                    />
                    <PolicyAttestationPanel
                        contractId={selectedTransaction.id}
                        state={selectedTransaction.status}
                        role="buyer"
                        compact
                        title="Buyer Policy Attestation"
                    />
                    <DecisionGatePanel
                        contractId={selectedTransaction.id}
                        state={selectedTransaction.status}
                        role="buyer"
                        compact
                        title="Buyer Decision Gate"
                    />
                    <ExecutionRunbookPanel
                        contractId={selectedTransaction.id}
                        state={selectedTransaction.status}
                        role="buyer"
                        compact
                        title="Execution Runbook"
                    />

                    <SecurityAuditTimeline
                        contractId={selectedTransaction.id}
                        state={selectedTransaction.status}
                        compact
                        title="Status + Policy Timeline"
                    />

                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Escrow window</span>
                            <span className="text-amber-300 font-mono font-medium">47:23:11 remaining</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Access type</span>
                            <span className="text-slate-200">48 hours Extended</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                        <div className="text-sm font-medium text-slate-200 mb-2">Monitoring Summary</div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <div>API calls made: 23</div>
                            <div>Export attempts: 0</div>
                            <div>Policy violations: 0</div>
                            <div className="text-emerald-300">Status: Clean ✓</div>
                        </div>
                    </div>

                    {selectedTransaction.accessMethod === 'download' && (
                        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                            <div className="text-sm font-medium text-slate-200 mb-3">Download Access</div>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-emerald-400">✓</span> Encrypted Download Available
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">|</span> AES-256 encrypted | Watermarked
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">|</span> Valid for: 24 hours after release
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">|</span> Downloads remaining: 1 of 1
                                </div>
                                <button 
                                    disabled
                                    className="w-full mt-2 rounded-lg bg-blue-600/50 px-3 py-2 text-xs font-medium text-blue-200 cursor-not-allowed"
                                >
                                    Download Dataset
                                </button>
                                <div className="text-[10px] text-slate-500 text-center">Provider will be notified on download</div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <button 
                            onClick={() => setShowFeedbackModal(true)}
                            disabled={!releasePaymentGuardrail.allowed}
                            className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                releasePaymentGuardrail.allowed
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                    : 'cursor-not-allowed border border-slate-600 bg-slate-700/60 text-slate-400'
                            }`}
                        >
                            Confirm & Release Payment
                        </button>
                        <p className={`text-[11px] ${releasePaymentGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                            {releasePaymentGuardrail.allowed
                                ? 'Release is available for this escrow state.'
                                : releasePaymentGuardrail.reason}
                        </p>
                        <button
                            disabled={!openDisputeGuardrail.allowed}
                            className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                openDisputeGuardrail.allowed
                                    ? 'border border-rose-500/50 text-rose-200 hover:bg-rose-500/10'
                                    : 'cursor-not-allowed border border-slate-600 bg-slate-700/60 text-slate-400'
                            }`}
                        >
                            Initiate Dispute
                        </button>
                        <p className={`text-[11px] ${openDisputeGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                            {openDisputeGuardrail.allowed
                                ? 'Dispute can be opened while access is active or pending release.'
                                : openDisputeGuardrail.reason}
                        </p>
                        <button
                            disabled={!extendWindowGuardrail.allowed}
                            className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                extendWindowGuardrail.allowed
                                    ? 'border border-blue-500/50 text-blue-200 hover:bg-blue-500/10'
                                    : 'cursor-not-allowed border border-slate-600 bg-slate-700/60 text-slate-400'
                            }`}
                        >
                            Extend Window
                        </button>
                        <p className={`text-[11px] ${extendWindowGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                            {extendWindowGuardrail.allowed
                                ? 'Window extension is available for this contract stage.'
                                : extendWindowGuardrail.reason}
                        </p>
                    </div>
                </div>
            </section>

            {showFeedbackModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-semibold">Rate Your Experience</h2>
                        <p className="text-sm text-slate-400 mt-1">{selectedTransaction.dataset} — {selectedTransaction.id}</p>
                        <p className="text-xs text-slate-500 mt-1">Your feedback directly impacts the provider's trust score</p>

                        <div className="mt-5">
                            <div className="text-xs text-slate-400 mb-2">Overall Dataset Quality</div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setStarRating(star)}
                                        onMouseEnter={() => setStarRating(star)}
                                        onMouseLeave={() => {}}
                                        className="text-2xl transition-colors"
                                    >
                                        {starRating >= star ? '⭐' : '☆'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="text-xs text-slate-400 mb-2">Select all that apply</div>
                            <div className="flex flex-wrap gap-2">
                                {feedbackTags.map(tag => {
                                    const isSelected = selectedTags.includes(tag)
                                    const isNegative = tag === 'Schema mismatch' || tag === 'Poor quality'
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                                                isSelected
                                                    ? isNegative
                                                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                                                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                                                    : 'border-slate-600 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {isSelected ? '✓' : ''} {tag}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="text-xs text-slate-400 mb-2">Optional comment</div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value.slice(0, 300))}
                                placeholder="Describe your experience..."
                                className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                            />
                            <div className="text-[10px] text-slate-500 text-right mt-1">{comment.length}/300</div>
                        </div>

                        <div className="mt-4 text-xs text-slate-500">
                            ⓘ Your rating updates the provider's trust score within 24 hours. Ratings are anonymous.
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="flex-1 rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white"
                            >
                                Skip & Release
                            </button>
                            <button
                                onClick={handleSubmitFeedback}
                                className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-medium text-white"
                            >
                                Submit & Release
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Active Disputes</h2>
                        <p className="text-xs text-slate-500">Escalations requiring review</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {activeDisputes.map(dispute => (
                        <div key={dispute.id} className="bg-slate-900/70 border border-rose-500/30 rounded-xl p-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="text-sm font-semibold text-white">{dispute.id} | {dispute.dataset}</div>
                                    <div className="text-xs text-slate-400">Raised by: {dispute.raisedBy}</div>
                                    <div className="text-xs text-slate-400">Reason: "{dispute.reason}"</div>
                                    <div className="text-xs text-slate-500">Raised: {dispute.raised}</div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-medium text-amber-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    {dispute.status}
                                </span>
                            </div>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-400 hover:text-white">
                                    View Evidence
                                </button>
                                <button className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-medium text-white">
                                    Arbitrate: Refund Buyer
                                </button>
                                <button className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-medium text-white">
                                    Arbitrate: Disburse Funds
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
