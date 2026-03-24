import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from '../../domain/accessContract'
import LifecycleGuidancePanel from '../../components/LifecycleGuidancePanel'
import { canPerformAdminEscrowAction } from '../../domain/actionGuardrails'
import SecurityAuditTimeline from '../../components/SecurityAuditTimeline'

type SummaryTone = 'blue' | 'green' | 'amber' | 'red'
type TransactionStatus = Extract<
    ContractLifecycleState,
    'ACCESS_ACTIVE' | 'FUNDS_HELD' | 'RELEASE_PENDING' | 'DISPUTE_OPEN' | 'RELEASED_TO_PROVIDER'
>
type FilterTab = 'all' | 'active' | 'fundsHeld' | 'pendingRelease' | 'disputed' | 'released'
type ActionTone = 'blue' | 'green' | 'amber' | 'red' | 'slate'

type SummaryCard = {
    label: string
    value: string
    tone: SummaryTone
}

type TransactionRow = {
    escId: string
    buyer: string
    provider: string
    dataset: string
    amount: string
    statusLabel: string
    status: TransactionStatus
    window: string
    actionLabel: string
    actionTone: ActionTone
}

type DisputeCard = {
    escId: string
    dataset: string
    raisedBy: string
    reason: string
    amount: string
    raisedAt: string
    evidenceSubmitted: string
}

type ReleaseQueueRow = {
    escId: string
    dataset: string
    amount: string
    trigger: string
}

type MonthlyFinancialRow = {
    month: string
    gmv: string
    platformFee: string
    payouts: string
    refunds: string
    net: string
}

const summaryCards: SummaryCard[] = [
    { label: 'Total Escrow Volume', value: '$2.4M', tone: 'blue' },
    { label: 'Active Escrows', value: '47', tone: 'green' },
    { label: 'Pending Release', value: '12', tone: 'amber' },
    { label: 'Disputed', value: '3', tone: 'red' },
    { label: 'Released This Month', value: '89', tone: 'green' }
]

const transactionRows: TransactionRow[] = [
    {
        escId: 'ESC-2026-001',
        buyer: 'part_anon_042',
        provider: 'anon_provider_003',
        dataset: 'Global Climate 2020-2024',
        amount: '$299',
        statusLabel: CONTRACT_STATE_LABELS.ACCESS_ACTIVE,
        status: 'ACCESS_ACTIVE',
        window: '47:23:11',
        actionLabel: 'REVIEW',
        actionTone: 'blue'
    },
    {
        escId: 'ESC-2026-002',
        buyer: 'part_anon_017',
        provider: 'anon_provider_007',
        dataset: 'Financial Tick Data',
        amount: '$499',
        statusLabel: CONTRACT_STATE_LABELS.RELEASE_PENDING,
        status: 'RELEASE_PENDING',
        window: '02:14:33',
        actionLabel: 'RELEASE',
        actionTone: 'green'
    },
    {
        escId: 'ESC-2026-003',
        buyer: 'part_anon_089',
        provider: 'anon_provider_012',
        dataset: 'Clinical Outcomes Delta',
        amount: '$799',
        statusLabel: CONTRACT_STATE_LABELS.DISPUTE_OPEN,
        status: 'DISPUTE_OPEN',
        window: 'Frozen',
        actionLabel: 'RESOLVE',
        actionTone: 'red'
    },
    {
        escId: 'ESC-2026-004',
        buyer: 'part_anon_031',
        provider: 'anon_provider_005',
        dataset: 'Consumer Behavior Analytics',
        amount: '$399',
        statusLabel: CONTRACT_STATE_LABELS.FUNDS_HELD,
        status: 'FUNDS_HELD',
        window: '23:45:00',
        actionLabel: 'REVIEW',
        actionTone: 'blue'
    },
    {
        escId: 'ESC-2026-005',
        buyer: 'part_anon_056',
        provider: 'anon_provider_009',
        dataset: 'Genomics Research Dataset',
        amount: '$599',
        statusLabel: CONTRACT_STATE_LABELS.RELEASE_PENDING,
        status: 'RELEASE_PENDING',
        window: '00:47:22',
        actionLabel: 'RELEASE',
        actionTone: 'green'
    },
    {
        escId: 'ESC-2026-006',
        buyer: 'part_anon_008',
        provider: 'anon_provider_002',
        dataset: 'Satellite Land Use 2024',
        amount: '$249',
        statusLabel: CONTRACT_STATE_LABELS.DISPUTE_OPEN,
        status: 'DISPUTE_OPEN',
        window: 'Frozen',
        actionLabel: 'RESOLVE',
        actionTone: 'red'
    },
    {
        escId: 'ESC-2026-007',
        buyer: 'part_anon_021',
        provider: 'anon_provider_014',
        dataset: 'Healthcare IoT Stream',
        amount: '$899',
        statusLabel: CONTRACT_STATE_LABELS.RELEASED_TO_PROVIDER,
        status: 'RELEASED_TO_PROVIDER',
        window: 'Completed',
        actionLabel: 'VIEW',
        actionTone: 'slate'
    },
    {
        escId: 'ESC-2026-008',
        buyer: 'part_anon_063',
        provider: 'anon_provider_008',
        dataset: 'Smart Grid Energy Data',
        amount: '$349',
        statusLabel: CONTRACT_STATE_LABELS.ACCESS_ACTIVE,
        status: 'ACCESS_ACTIVE',
        window: '71:12:44',
        actionLabel: 'REVIEW',
        actionTone: 'blue'
    }
]

const disputeCards: DisputeCard[] = [
    {
        escId: 'ESC-2026-003',
        dataset: 'Clinical Outcomes Delta',
        raisedBy: 'part_anon_089 (Buyer)',
        reason: 'Data schema does not match description. Expected 15 fields, received 8.',
        amount: '$799',
        raisedAt: '2026-03-22 14:23:11',
        evidenceSubmitted: 'Yes'
    },
    {
        escId: 'ESC-2026-006',
        dataset: 'Satellite Land Use 2024',
        raisedBy: 'part_anon_008 (Buyer)',
        reason: 'Dataset quality below confidence score advertised. Score showed 88, actual quality significantly lower.',
        amount: '$249',
        raisedAt: '2026-03-21 09:14:44',
        evidenceSubmitted: 'No'
    }
]

const releaseQueueRows: ReleaseQueueRow[] = [
    { escId: 'ESC-2026-002', dataset: 'Financial Tick Data', amount: '$499', trigger: 'Window Expired' },
    { escId: 'ESC-2026-005', dataset: 'Genomics Research Dataset', amount: '$599', trigger: 'Buyer Confirmed' },
    { escId: 'ESC-2026-009', dataset: 'Climate Emissions Index', amount: '$199', trigger: 'Auto-release Triggered' }
]

const financialSummaryCards: SummaryCard[] = [
    { label: 'Platform Fees Collected', value: '$24,180 this month', tone: 'green' },
    { label: 'Provider Payouts Pending', value: '$18,440', tone: 'amber' },
    { label: 'Refunds Issued', value: '$1,240 this month', tone: 'red' },
    { label: 'Net Revenue', value: '$22,940 this month', tone: 'blue' }
]

const monthlyFinancialRows: MonthlyFinancialRow[] = [
    { month: 'March 2026', gmv: '$241,800', platformFee: '$24,180', payouts: '$18,440', refunds: '$1,240', net: '$22,940' },
    { month: 'February 2026', gmv: '$198,400', platformFee: '$19,840', payouts: '$15,120', refunds: '$890', net: '$18,950' },
    { month: 'January 2026', gmv: '$167,200', platformFee: '$16,720', payouts: '$12,780', refunds: '$640', net: '$16,080' },
    { month: 'December 2025', gmv: '$134,600', platformFee: '$13,460', payouts: '$10,280', refunds: '$420', net: '$13,040' }
]

const filterTabs: Array<{ key: FilterTab; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'fundsHeld', label: 'Funds Held' },
    { key: 'pendingRelease', label: 'Pending Release' },
    { key: 'disputed', label: 'Disputed' },
    { key: 'released', label: 'Released' }
]

const summaryValueClasses: Record<SummaryTone, string> = {
    blue: 'text-cyan-300',
    green: 'text-emerald-300',
    amber: 'text-amber-300',
    red: 'text-red-300'
}

const summaryAccentClasses: Record<SummaryTone, string> = {
    blue: 'border-cyan-500/35 bg-cyan-500/10',
    green: 'border-emerald-500/35 bg-emerald-500/10',
    amber: 'border-amber-500/35 bg-amber-500/10',
    red: 'border-red-500/35 bg-red-500/10'
}

const statusBadgeClasses: Record<TransactionStatus, string> = {
    ACCESS_ACTIVE: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    FUNDS_HELD: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    RELEASE_PENDING: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200',
    DISPUTE_OPEN: 'border-red-500/40 bg-red-500/10 text-red-200',
    RELEASED_TO_PROVIDER: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
}

const actionButtonClasses: Record<ActionTone, string> = {
    blue: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/18',
    green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/18',
    amber: 'border-amber-500/50 bg-amber-500/10 text-amber-200 hover:bg-amber-500/18',
    red: 'border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/18',
    slate: 'border-slate-600/70 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70'
}
const disabledActionClass =
    'cursor-not-allowed border-slate-700/80 bg-slate-900/60 text-slate-500 hover:bg-slate-900/60'

export default function EscrowVaultPage() {
    const { isAuthenticated } = useAuth()
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
    const pendingReleaseCount = useMemo(
        () => transactionRows.filter(row => row.status === 'RELEASE_PENDING').length,
        []
    )
    const releaseAllPendingGuardrail = useMemo(
        () => canPerformAdminEscrowAction('release_all_pending', 'RELEASE_PENDING', pendingReleaseCount),
        [pendingReleaseCount]
    )
    const transactionStatusByEscId = useMemo(
        () => new Map(transactionRows.map(row => [row.escId, row.status])),
        []
    )

    const currentTimestamp = useMemo(() => {
        return `${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`
    }, [])

    const filteredTransactions = useMemo(() => {
        if (activeFilter === 'all') return transactionRows
        if (activeFilter === 'active') return transactionRows.filter(row => row.status === 'ACCESS_ACTIVE')
        if (activeFilter === 'fundsHeld') return transactionRows.filter(row => row.status === 'FUNDS_HELD')
        if (activeFilter === 'pendingRelease') return transactionRows.filter(row => row.status === 'RELEASE_PENDING')
        if (activeFilter === 'disputed') return transactionRows.filter(row => row.status === 'DISPUTE_OPEN')
        return transactionRows.filter(row => row.status === 'RELEASED_TO_PROVIDER')
    }, [activeFilter])

    const focusedLifecycleState = useMemo<ContractLifecycleState>(() => {
        if (activeFilter === 'active') return 'ACCESS_ACTIVE'
        if (activeFilter === 'fundsHeld') return 'FUNDS_HELD'
        if (activeFilter === 'pendingRelease') return 'RELEASE_PENDING'
        if (activeFilter === 'disputed') return 'DISPUTE_OPEN'
        if (activeFilter === 'released') return 'RELEASED_TO_PROVIDER'
        return filteredTransactions[0]?.status ?? 'REVIEW_IN_PROGRESS'
    }, [activeFilter, filteredTransactions])
    const focusedEscrowId = useMemo(() => filteredTransactions[0]?.escId ?? 'ESC-2026-001', [filteredTransactions])

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    return (
        <AdminLayout title="ESCROW VAULT" subtitle="PLATFORM ESCROW OPERATIONS">
            <div className="space-y-6">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Escrow Vault</h1>
                        <p className="text-sm text-slate-400 max-w-3xl">
                            Platform-wide escrow management, dispute resolution, and financial oversight
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span className="inline-flex items-center rounded-md border border-cyan-500/50 bg-cyan-500/15 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-cyan-200">
                            ENCRYPTED
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{currentTimestamp}</span>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {summaryCards.map(card => (
                        <article
                            key={card.label}
                            className={`rounded-xl border p-4 backdrop-blur-xl shadow-2xl shadow-black/25 ${summaryAccentClasses[card.tone]}`}
                        >
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                            <p className={`mt-2 text-3xl font-semibold ${summaryValueClasses[card.tone]}`}>{card.value}</p>
                        </article>
                    ))}
                </section>

                <LifecycleGuidancePanel role="admin" state={focusedLifecycleState} title="Operations Guidance" />
                <SecurityAuditTimeline
                    contractId={focusedEscrowId}
                    state={focusedLifecycleState}
                    title="Escrow Audit Timeline"
                />

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="px-5 py-4 border-b border-slate-800/60">
                        <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold text-slate-300">Live Escrow Transactions</h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {filterTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveFilter(tab.key)}
                                    className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                        activeFilter === tab.key
                                            ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                            : 'border-slate-700/70 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-600/80'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1180px]">
                            <thead className="bg-slate-950/45">
                                <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                    <th className="text-left px-4 py-3">Esc ID</th>
                                    <th className="text-left px-4 py-3">Buyer</th>
                                    <th className="text-left px-4 py-3">Provider</th>
                                    <th className="text-left px-4 py-3">Dataset</th>
                                    <th className="text-left px-4 py-3">Amount</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-left px-4 py-3">Window</th>
                                    <th className="text-left px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 font-mono text-[11px] text-slate-200">
                                {filteredTransactions.map(row => {
                                    const isReleaseAction = row.actionLabel === 'RELEASE'
                                    const releaseNowGuardrail = canPerformAdminEscrowAction('release_now', row.status)
                                    const actionDisabled = isReleaseAction && !releaseNowGuardrail.allowed

                                    return (
                                        <tr key={row.escId} className="hover:bg-slate-800/25 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-cyan-300">{row.escId}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{row.buyer}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{row.provider}</td>
                                            <td className="px-4 py-3 text-slate-300">{row.dataset}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-100">{row.amount}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusBadgeClasses[row.status]}`}>
                                                    {row.statusLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.window}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    disabled={actionDisabled}
                                                    className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                                        actionDisabled ? disabledActionClass : actionButtonClasses[row.actionTone]
                                                    }`}
                                                >
                                                    {row.actionLabel}
                                                </button>
                                                {actionDisabled && (
                                                    <p className="mt-1 max-w-[180px] text-[10px] text-amber-300">{releaseNowGuardrail.reason}</p>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="space-y-1">
                        <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold text-slate-300">Dispute Resolution Center</h2>
                        <p className="text-lg font-semibold text-slate-100">Active Disputes</p>
                        <p className="text-sm text-slate-400">3 disputes require admin decision</p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {disputeCards.map(dispute => {
                            const disputeState = transactionStatusByEscId.get(dispute.escId) ?? 'DISPUTE_OPEN'
                            const resolveRefundGuardrail = canPerformAdminEscrowAction('resolve_refund', disputeState)
                            const resolveReleaseGuardrail = canPerformAdminEscrowAction('resolve_release', disputeState)
                            const escalateLegalGuardrail = canPerformAdminEscrowAction('escalate_legal', disputeState)

                            return (
                                <article key={dispute.escId} className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                    <div className="space-y-1">
                                        <p className="font-mono text-[11px] text-cyan-300">{dispute.escId}</p>
                                        <h3 className="text-[14px] font-semibold text-slate-100">{dispute.dataset}</h3>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2 text-[11px]">
                                        <div className="rounded-md border border-slate-800/80 bg-slate-900/55 px-3 py-2">
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Raised by</p>
                                            <p className="mt-1 text-slate-200">{dispute.raisedBy}</p>
                                        </div>
                                        <div className="rounded-md border border-red-500/25 bg-red-500/8 px-3 py-2">
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-red-300/80">Reason</p>
                                            <p className="mt-1 text-red-100/90 leading-relaxed">{dispute.reason}</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="rounded-md border border-slate-800/80 bg-slate-900/55 px-3 py-2">
                                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Amount at stake</p>
                                                <p className="mt-1 text-slate-200">{dispute.amount}</p>
                                            </div>
                                            <div className="rounded-md border border-slate-800/80 bg-slate-900/55 px-3 py-2">
                                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Raised</p>
                                                <p className="mt-1 text-slate-200">{dispute.raisedAt}</p>
                                            </div>
                                            <div className="rounded-md border border-slate-800/80 bg-slate-900/55 px-3 py-2">
                                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Evidence submitted</p>
                                                <p className="mt-1 text-slate-200">{dispute.evidenceSubmitted}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        <textarea
                                            placeholder="Internal note"
                                            className="h-24 w-full resize-y rounded-md border border-slate-700/80 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/70"
                                        />
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            <button
                                                disabled={!resolveRefundGuardrail.allowed}
                                                className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition-colors ${
                                                    resolveRefundGuardrail.allowed ? actionButtonClasses.blue : disabledActionClass
                                                }`}
                                            >
                                                Resolve: Refund Buyer
                                            </button>
                                            <button
                                                disabled={!resolveReleaseGuardrail.allowed}
                                                className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition-colors ${
                                                    resolveReleaseGuardrail.allowed ? actionButtonClasses.green : disabledActionClass
                                                }`}
                                            >
                                                Resolve: Release to Provider
                                            </button>
                                            <button
                                                disabled={!escalateLegalGuardrail.allowed}
                                                className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition-colors ${
                                                    escalateLegalGuardrail.allowed ? actionButtonClasses.amber : disabledActionClass
                                                }`}
                                            >
                                                Escalate to Legal
                                            </button>
                                        </div>
                                        {!resolveRefundGuardrail.allowed && (
                                            <p className="text-[10px] text-amber-300">Refund: {resolveRefundGuardrail.reason}</p>
                                        )}
                                        {!resolveReleaseGuardrail.allowed && (
                                            <p className="text-[10px] text-amber-300">Release: {resolveReleaseGuardrail.reason}</p>
                                        )}
                                        {!escalateLegalGuardrail.allowed && (
                                            <p className="text-[10px] text-amber-300">Legal escalation: {escalateLegalGuardrail.reason}</p>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="px-5 py-4 border-b border-slate-800/60 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold text-slate-300">Release Queue</h2>
                            <p className="text-lg font-semibold text-slate-100">Ready for Release</p>
                            <p className="text-sm text-slate-400">Escrows pending manual or auto release</p>
                        </div>
                        <div className="flex flex-col items-start gap-1 sm:items-end">
                            <button
                                disabled={!releaseAllPendingGuardrail.allowed}
                                className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                    releaseAllPendingGuardrail.allowed ? actionButtonClasses.green : disabledActionClass
                                }`}
                            >
                                Release All Pending
                            </button>
                            <p className={`text-[10px] ${releaseAllPendingGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                {releaseAllPendingGuardrail.allowed
                                    ? `${pendingReleaseCount} contracts are ready for release.`
                                    : releaseAllPendingGuardrail.reason}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[920px]">
                            <thead className="bg-slate-950/45">
                                <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                    <th className="text-left px-4 py-3">Esc ID</th>
                                    <th className="text-left px-4 py-3">Dataset</th>
                                    <th className="text-left px-4 py-3">Amount</th>
                                    <th className="text-left px-4 py-3">Release Trigger</th>
                                    <th className="text-left px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 font-mono text-[11px] text-slate-200">
                                {releaseQueueRows.map(row => {
                                    const releaseState = transactionStatusByEscId.get(row.escId) ?? 'RELEASE_PENDING'
                                    const releaseNowGuardrail = canPerformAdminEscrowAction('release_now', releaseState)

                                    return (
                                        <tr key={row.escId} className="hover:bg-slate-800/25 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-cyan-300">{row.escId}</td>
                                            <td className="px-4 py-3">{row.dataset}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{row.amount}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.trigger}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    disabled={!releaseNowGuardrail.allowed}
                                                    className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                                        releaseNowGuardrail.allowed ? actionButtonClasses.green : disabledActionClass
                                                    }`}
                                                >
                                                    Release Now
                                                </button>
                                                {!releaseNowGuardrail.allowed && (
                                                    <p className="mt-1 max-w-[180px] text-[10px] text-amber-300">{releaseNowGuardrail.reason}</p>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="px-5 py-4 border-b border-slate-800/60 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold text-slate-300">Financial Summary</h2>
                            <p className="text-lg font-semibold text-slate-100">Platform Financial Overview</p>
                        </div>
                        <button className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${actionButtonClasses.blue}`}>
                            Export Financial Report
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {financialSummaryCards.map(card => (
                                <article
                                    key={card.label}
                                    className={`rounded-lg border p-3 ${summaryAccentClasses[card.tone]}`}
                                >
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                                    <p className={`mt-2 text-xl font-semibold ${summaryValueClasses[card.tone]}`}>{card.value}</p>
                                </article>
                            ))}
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-950/35">
                            <table className="w-full min-w-[960px]">
                                <thead className="bg-slate-950/60">
                                    <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                        <th className="text-left px-4 py-3">Month</th>
                                        <th className="text-left px-4 py-3">GMV</th>
                                        <th className="text-left px-4 py-3">Platform Fee</th>
                                        <th className="text-left px-4 py-3">Payouts</th>
                                        <th className="text-left px-4 py-3">Refunds</th>
                                        <th className="text-left px-4 py-3">Net</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 font-mono text-[11px] text-slate-200">
                                    {monthlyFinancialRows.map(row => (
                                        <tr key={row.month} className="hover:bg-slate-800/25 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">{row.month}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{row.gmv}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-emerald-300">{row.platformFee}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-amber-300">{row.payouts}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-red-300">{row.refunds}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-cyan-300">{row.net}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    )
}
