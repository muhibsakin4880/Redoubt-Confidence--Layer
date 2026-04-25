import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import DemoEscrowControls from '../components/demo/DemoEscrowControls'
import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from '../domain/accessContract'
import { canPerformBuyerEscrowAction } from '../domain/actionGuardrails'
import {
    getCanonicalDemoEscrowScenario,
    isCanonicalDemoEscrowRecord,
    saveCanonicalDemoEscrowState,
    setDemoStage,
    type DemoEscrowScenario
} from '../domain/demoEscrowScenario'
import {
    loadEscrowCheckouts,
    loadEscrowCheckoutTransactions,
    outcomeStageMeta,
    releaseEscrowToProvider,
    saveEscrowCheckout
} from '../domain/escrowCheckout'

type EscrowStatus = Extract<
    ContractLifecycleState,
    'REQUEST_SUBMITTED' | 'FUNDS_HELD' | 'ACCESS_ACTIVE' | 'RELEASE_PENDING' | 'RELEASED_TO_PROVIDER' | 'DISPUTE_OPEN'
>

type AccessMethod = 'platform' | 'download'
type FilterTab = 'All' | 'Active' | 'Pending' | 'Release Pending' | 'Disputed' | 'Released'
type GovernanceTone = 'neutral' | 'positive' | 'caution' | 'critical'

type EscrowTransaction = {
    id: string
    dataset: string
    buyer: string
    provider: string
    amount: string
    accessMethod: AccessMethod
    status: EscrowStatus
}

const filterTabs: FilterTab[] = ['All', 'Active', 'Pending', 'Release Pending', 'Disputed', 'Released']
const rowsPerPageOptions = [6, 8, 10, 12]
const feedbackTags = ['Accurate schema', 'Clean data', 'As described', 'Fast access', 'Schema mismatch', 'Poor quality']

const seedEscrowTransactions: EscrowTransaction[] = [
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

const activeDisputes = [
    {
        id: 'ESC-2026-006',
        dataset: 'Satellite Land Use 2024',
        raisedBy: 'part_anon_008',
        reason: 'Data schema mismatch from description',
        raised: '2026-03-09',
        status: 'Under Investigation'
    }
] as const

const statusStyles: Record<EscrowStatus, { badge: string; text: string; dot: string; row: string }> = {
    REQUEST_SUBMITTED: { badge: 'border-slate-500/40 bg-slate-500/10 text-slate-300', text: CONTRACT_STATE_LABELS.REQUEST_SUBMITTED, dot: 'bg-slate-400', row: 'hover:bg-slate-800/55' },
    FUNDS_HELD: { badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300', text: CONTRACT_STATE_LABELS.FUNDS_HELD, dot: 'bg-amber-400', row: 'hover:bg-amber-500/[0.035]' },
    ACCESS_ACTIVE: { badge: 'border-blue-500/40 bg-blue-500/10 text-blue-300', text: CONTRACT_STATE_LABELS.ACCESS_ACTIVE, dot: 'bg-blue-400', row: 'hover:bg-blue-500/[0.03]' },
    RELEASE_PENDING: { badge: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300', text: CONTRACT_STATE_LABELS.RELEASE_PENDING, dot: 'bg-indigo-400', row: 'hover:bg-indigo-500/[0.035]' },
    RELEASED_TO_PROVIDER: { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', text: CONTRACT_STATE_LABELS.RELEASED_TO_PROVIDER, dot: 'bg-emerald-400', row: 'hover:bg-emerald-500/[0.03]' },
    DISPUTE_OPEN: { badge: 'border-rose-500/40 bg-rose-500/10 text-rose-300', text: CONTRACT_STATE_LABELS.DISPUTE_OPEN, dot: 'bg-rose-400', row: 'bg-rose-500/[0.03] hover:bg-rose-500/[0.055]' }
}

const accessMethodStyles: Record<AccessMethod, { badge: string; token: string; label: string }> = {
    platform: { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', token: 'PL', label: 'Platform Only' },
    download: { badge: 'border-blue-500/40 bg-blue-500/10 text-blue-300', token: 'DL', label: 'Platform + Download' }
}

const shellPanelClass = 'rounded-[1.75rem] border border-slate-800/90 bg-slate-950/45 shadow-[0_24px_90px_rgba(3,8,20,0.45)] backdrop-blur-sm'
const quietPanelClass = 'rounded-[1.45rem] border border-slate-800/90 bg-slate-900/40 shadow-[0_16px_50px_rgba(3,8,20,0.35)]'
const metricPanelClass = 'rounded-[1.2rem] border border-slate-800/90 bg-slate-950/45 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
const actionButtonClass = 'inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-cyan-500/40 hover:text-cyan-100'
const ledgerPanelClass = "relative overflow-hidden rounded-[2rem] border border-slate-700/75 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.78))] shadow-[0_34px_120px_rgba(3,8,20,0.58),0_12px_36px_rgba(8,15,32,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.045),transparent)] before:content-['']"

export default function EscrowCenterPage() {
    const location = useLocation()
    const isDemo = location.pathname.startsWith('/demo/')
    const [recordsVersion, setRecordsVersion] = useState(0)
    const escrowCheckoutRecords = useMemo(() => loadEscrowCheckouts(), [recordsVersion])
    const escrowTransactions = useMemo(() => [...loadEscrowCheckoutTransactions(), ...seedEscrowTransactions], [recordsVersion])
    const [selectedId, setSelectedId] = useState(() => loadEscrowCheckoutTransactions()[0]?.id ?? 'ESC-2026-003')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(8)
    const [activeFilter, setActiveFilter] = useState<FilterTab>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)
    const [starRating, setStarRating] = useState(0)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [comment, setComment] = useState('')
    const [showSuccessToast, setShowSuccessToast] = useState(false)

    const applyDemoScenario = (scenario: DemoEscrowScenario) => {
        setActiveFilter('All')
        setSearchQuery('')
        setCurrentPage(1)
        setSelectedId(scenario.checkoutRecord?.escrowId ?? '')
        setRecordsVersion(current => current + 1)
    }

    useEffect(() => {
        if (!isDemo) return
        saveCanonicalDemoEscrowState()
        applyDemoScenario(getCanonicalDemoEscrowScenario())
    }, [isDemo])

    const checkoutRecordByEscrowId = useMemo(
        () => new Map(escrowCheckoutRecords.map(record => [record.escrowId, record])),
        [escrowCheckoutRecords]
    )

    const filteredTransactions = useMemo(() => {
        const base =
            activeFilter === 'All'
                ? escrowTransactions
                : activeFilter === 'Active'
                  ? escrowTransactions.filter(transaction => transaction.status === 'ACCESS_ACTIVE')
                  : activeFilter === 'Pending'
                    ? escrowTransactions.filter(transaction => transaction.status === 'REQUEST_SUBMITTED' || transaction.status === 'FUNDS_HELD')
                    : activeFilter === 'Release Pending'
                      ? escrowTransactions.filter(transaction => transaction.status === 'RELEASE_PENDING')
                      : activeFilter === 'Disputed'
                        ? escrowTransactions.filter(transaction => transaction.status === 'DISPUTE_OPEN')
                        : escrowTransactions.filter(transaction => transaction.status === 'RELEASED_TO_PROVIDER')

        const query = searchQuery.trim().toLowerCase()
        if (!query) return base

        return base.filter(transaction =>
            [transaction.id, transaction.dataset, transaction.buyer, transaction.provider, transaction.amount, statusStyles[transaction.status].text]
                .some(value => value.toLowerCase().includes(query))
        )
    }, [activeFilter, escrowTransactions, searchQuery])

    useEffect(() => {
        setCurrentPage(1)
    }, [activeFilter, rowsPerPage, searchQuery])

    useEffect(() => {
        if (filteredTransactions.length === 0) return
        if (!filteredTransactions.some(transaction => transaction.id === selectedId)) {
            setSelectedId(filteredTransactions[0].id)
        }
    }, [filteredTransactions, selectedId])

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage)), [filteredTransactions.length, rowsPerPage])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        return filteredTransactions.slice(startIndex, startIndex + rowsPerPage)
    }, [currentPage, filteredTransactions, rowsPerPage])

    const selectedTransaction = useMemo(
        () => escrowTransactions.find(transaction => transaction.id === selectedId) ?? escrowTransactions[0],
        [escrowTransactions, selectedId]
    )

    const selectedCheckoutRecord = useMemo(
        () => escrowCheckoutRecords.find(record => record.escrowId === selectedTransaction?.id) ?? null,
        [escrowCheckoutRecords, selectedTransaction]
    )

    const releasePaymentGuardrail = useMemo(() => canPerformBuyerEscrowAction('release_payment', selectedTransaction.status), [selectedTransaction.status])
    const openDisputeGuardrail = useMemo(() => canPerformBuyerEscrowAction('open_dispute', selectedTransaction.status), [selectedTransaction.status])
    const extendWindowGuardrail = useMemo(() => canPerformBuyerEscrowAction('extend_window', selectedTransaction.status), [selectedTransaction.status])

    const activeCount = useMemo(() => escrowTransactions.filter(transaction => transaction.status === 'ACCESS_ACTIVE').length, [escrowTransactions])
    const heldCount = useMemo(() => escrowTransactions.filter(transaction => transaction.status === 'REQUEST_SUBMITTED' || transaction.status === 'FUNDS_HELD').length, [escrowTransactions])
    const releasePendingCount = useMemo(() => escrowTransactions.filter(transaction => transaction.status === 'RELEASE_PENDING').length, [escrowTransactions])
    const disputesCount = activeDisputes.length
    const protectedDealCount = escrowCheckoutRecords.length
    const automaticCreditCount = useMemo(() => escrowCheckoutRecords.filter(record => record.outcomeProtection.credits.status === 'issued').length, [escrowCheckoutRecords])
    const totalValue = useMemo(() => escrowTransactions.reduce((sum, transaction) => sum + parseInt(transaction.amount.replace('$', ''), 10), 0), [escrowTransactions])
    const releaseQueueLead = useMemo(() => escrowTransactions.find(transaction => transaction.status === 'RELEASE_PENDING') ?? null, [escrowTransactions])
    const disputeLead = useMemo(() => activeDisputes.find(dispute => dispute.id === selectedTransaction.id) ?? activeDisputes[0] ?? null, [selectedTransaction.id])
    const pageStartIndex = filteredTransactions.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const pageEndIndex = Math.min(currentPage * rowsPerPage, filteredTransactions.length)
    const hasFilteredResults = filteredTransactions.length > 0
    const pageValue = useMemo(() => paginatedTransactions.reduce((sum, transaction) => sum + parseInt(transaction.amount.replace('$', ''), 10), 0), [paginatedTransactions])
    const selectedCaseTone = getGovernanceTone(selectedTransaction.status, selectedCheckoutRecord?.outcomeProtection.credits.status === 'issued')
    const selectedCaseSummary = getSelectedCaseSummary(selectedTransaction.status, releasePaymentGuardrail.allowed, selectedCheckoutRecord?.outcomeProtection.credits.status === 'issued')

    const toggleTag = (tag: string) => {
        setSelectedTags(previous => (previous.includes(tag) ? previous.filter(value => value !== tag) : [...previous, tag]))
    }

    const handleSubmitFeedback = () => {
        setShowFeedbackModal(false)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
    }

    const handleReleaseSelectedCheckout = () => {
        if (!selectedCheckoutRecord || selectedCheckoutRecord.lifecycleState !== 'RELEASE_PENDING') return
        if (isDemo && isCanonicalDemoEscrowRecord(selectedCheckoutRecord)) {
            applyDemoScenario(setDemoStage('released'))
            setShowSuccessToast(true)
            setTimeout(() => setShowSuccessToast(false), 3000)
            return
        }
        const nextRecord = releaseEscrowToProvider(selectedCheckoutRecord)
        saveEscrowCheckout(nextRecord)
        setRecordsVersion(current => current + 1)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#060C16] text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_78%_12%,rgba(99,102,241,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_26%)]" />
            {showSuccessToast && (
                <div className="fixed right-4 top-4 z-50 rounded-xl border border-emerald-400/70 bg-emerald-600/90 px-4 py-3 text-sm font-medium text-white shadow-2xl">
                    Payment released successfully
                </div>
            )}
            <div className="relative mx-auto max-w-[1680px] space-y-5 px-4 py-8 sm:px-6 xl:px-8">
                <header className={`${shellPanelClass} px-5 py-5 sm:px-6`}>
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] xl:items-end">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Escrow Center
                            </div>
                            <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.045em] text-white sm:text-[2.3rem]">
                                Escrow Center
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                Operate the escrow ledger, review the current case, and monitor release or dispute exposure without leaving the working surface.
                            </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                            <HeaderSignal label="Cases requiring attention" value={`${releasePendingCount + disputesCount + heldCount}`} accent="caution" />
                            <HeaderSignal label="Protected evaluations" value={`${protectedDealCount}`} accent="positive" />
                        </div>
                    </div>
                </header>

                {isDemo && <DemoEscrowControls onScenarioChange={applyDemoScenario} />}

                <section aria-labelledby="escrow-kpis" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricTile label="Access active" value={`${activeCount}`} detail="Live cases in governed access" />
                    <MetricTile label="Held or pending" value={`${heldCount}`} detail="Still waiting on release readiness" />
                    <MetricTile label="Release pending" value={`${releasePendingCount}`} detail="Buyer validation already completed" />
                    <MetricTile label="Disputes" value={`${disputesCount}`} detail="Escalated cases under review" tone="critical" />
                    <MetricTile label="Value in escrow" value={`$${totalValue.toLocaleString()}`} detail="Total protected exposure across the ledger" tone="positive" />
                </section>
                <section className={`${quietPanelClass} px-5 py-5 sm:px-6`} aria-labelledby="governance-watch">
                    <div className="flex flex-col gap-2 border-b border-slate-800/90 pb-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Governance watch</div>
                            <h2 id="governance-watch" className="mt-2 text-lg font-semibold text-white">
                                Governance watch
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm text-slate-400">
                                Keep release readiness, protected evaluation posture, and dispute exposure visible without opening a separate control workspace.
                            </p>
                        </div>
                        <span className="rounded-full border border-slate-700/80 bg-slate-950/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                            Main page governance summary
                        </span>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                        <GovernanceCard
                            tone="positive"
                            label="Protected evaluations"
                            value={`${protectedDealCount} live`}
                            detail={
                                automaticCreditCount > 0
                                    ? `${automaticCreditCount} automatic credit case${automaticCreditCount === 1 ? '' : 's'} already tracked in escrow.`
                                    : 'Outcome-protected deals remain visible, but no auto-credit case is open right now.'
                            }
                        />
                        <GovernanceCard
                            tone={releasePendingCount > 0 ? 'caution' : 'neutral'}
                            label="Release queue"
                            value={releaseQueueLead ? `${releasePendingCount} waiting` : 'No queued release'}
                            detail={
                                releaseQueueLead
                                    ? `${releaseQueueLead.id} is the next case ready for payout once the release gate clears.`
                                    : 'No escrow record is currently sitting in a release-pending state.'
                            }
                        />
                        <GovernanceCard
                            tone={disputesCount > 0 ? 'critical' : 'neutral'}
                            label="Dispute watch"
                            value={disputesCount > 0 ? `${disputesCount} escalated` : 'No disputes'}
                            detail={
                                disputeLead
                                    ? `${disputeLead.id} remains open for ${disputeLead.dataset} after a schema-mismatch escalation.`
                                    : 'The ledger currently has no escalated dispute requiring buyer attention.'
                            }
                        />
                    </div>
                </section>
                <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.62fr)_minmax(360px,0.94fr)]">
                    <section className={ledgerPanelClass} aria-labelledby="escrow-ledger">
                        <div className="relative border-b border-slate-800/90 px-7 py-7 sm:px-9 sm:py-8">
                            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Primary workspace</div>
                                    <h2 id="escrow-ledger" className="mt-3 text-[1.72rem] font-semibold tracking-[-0.045em] text-white sm:text-[1.95rem]">
                                        Escrow ledger
                                    </h2>
                                    <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-400">
                                        Review the active ledger, focus one case at a time, and keep release or dispute decisions tied to the selected record.
                                    </p>
                                </div>
                                <div className="rounded-[1.5rem] border border-slate-700/80 bg-slate-950/45 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_36px_rgba(3,8,20,0.2)]">
                                    <div className="flex flex-wrap gap-2">
                                    {filterTabs.map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveFilter(tab)}
                                            className={`min-h-[2.95rem] rounded-[1.1rem] border px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] transition-all ${
                                                activeFilter === tab
                                                    ? 'border-cyan-400/45 bg-[linear-gradient(180deg,rgba(56,189,248,0.2),rgba(14,116,144,0.12))] text-cyan-50 shadow-[0_12px_28px_rgba(8,145,178,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]'
                                                    : 'border-transparent bg-slate-950/15 text-slate-400 hover:border-slate-700/80 hover:bg-slate-900/65 hover:text-slate-200'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px] xl:items-end">
                                <label className="flex min-h-[5.85rem] w-full max-w-[52rem] flex-col justify-end">
                                    <span className="sr-only">Search escrow records</span>
                                    <div className="flex min-h-[3.65rem] items-center gap-3 rounded-[1.45rem] border border-slate-700/85 bg-slate-950/55 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_36px_rgba(3,8,20,0.26)] transition-colors focus-within:border-cyan-500/40">
                                        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500">
                                            <path d="M8.5 3.5a5 5 0 1 0 3.182 8.857l3.23 3.23 1.06-1.06-3.23-3.23A5 5 0 0 0 8.5 3.5Zm0 1.5a3.5 3.5 0 1 1 0 7.001A3.5 3.5 0 0 1 8.5 5Z" fill="currentColor" />
                                        </svg>
                                        <input
                                            value={searchQuery}
                                            onChange={event => setSearchQuery(event.target.value)}
                                            placeholder="Search ID, dataset, buyer, provider"
                                            className="w-full bg-transparent text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none"
                                        />
                                    </div>
                                </label>
                                <label className="flex min-h-[5.85rem] w-full max-w-[240px] flex-col justify-end xl:justify-self-end">
                                    <span className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Rows</span>
                                    <div className="relative flex min-h-[3.65rem] items-center rounded-[1.35rem] border border-slate-700/85 bg-slate-950/55 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_36px_rgba(3,8,20,0.26)]">
                                        <select
                                            value={rowsPerPage}
                                            onChange={event => setRowsPerPage(parseInt(event.target.value, 10))}
                                            className="block w-full cursor-pointer appearance-none bg-transparent pr-8 text-sm font-semibold leading-none text-slate-100 focus:outline-none"
                                        >
                                            {rowsPerPageOptions.map(option => (
                                                <option key={option} value={option} className="bg-[#0B1220] text-white">
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500">
                                            <path d="m5.5 7.5 4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                                        </svg>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-[1040px] w-full table-fixed text-left text-sm">
                                <colgroup>
                                    <col className="w-[12%]" />
                                    <col className="w-[21%]" />
                                    <col className="w-[18%]" />
                                    <col className="w-[11%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[11%]" />
                                    <col className="w-[13%]" />
                                </colgroup>
                                <thead className="border-b border-slate-800/90 bg-slate-950/70 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Escrow</th>
                                        <th className="px-4 py-3 font-medium">Dataset</th>
                                        <th className="px-4 py-3 font-medium">Parties</th>
                                        <th className="px-4 py-3 font-medium">Amount</th>
                                        <th className="px-4 py-3 font-medium">Protection</th>
                                        <th className="px-4 py-3 font-medium">Access</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900/90">
                                    {paginatedTransactions.map(row => (
                                        <EscrowLedgerRow
                                            key={row.id}
                                            row={row}
                                            checkoutRecord={checkoutRecordByEscrowId.get(row.id) ?? null}
                                            isSelected={row.id === selectedId}
                                            onSelect={() => setSelectedId(row.id)}
                                        />
                                    ))}
                                    {paginatedTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                                                No escrow transactions match this filter and search query.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-800/90 bg-slate-950/45 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="text-xs text-slate-400">
                                {hasFilteredResults ? (
                                    <>
                                        Showing {pageStartIndex}-{pageEndIndex} of {filteredTransactions.length} records. Page value:{' '}
                                        <span className="font-mono font-semibold text-cyan-300">${pageValue.toLocaleString()}</span>
                                    </>
                                ) : (
                                    'No records in this view.'
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(previous => Math.max(1, previous - 1))}
                                    disabled={!hasFilteredResults || currentPage === 1}
                                    className={`rounded-lg border px-2.5 py-1.5 text-xs ${
                                        !hasFilteredResults || currentPage === 1
                                            ? 'cursor-not-allowed border-slate-800 text-slate-600'
                                            : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                                    }`}
                                >
                                    Prev
                                </button>
                                <span className="text-xs text-slate-400">
                                    Page {hasFilteredResults ? currentPage : 0} / {hasFilteredResults ? totalPages : 0}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(previous => Math.min(totalPages, previous + 1))}
                                    disabled={!hasFilteredResults || currentPage === totalPages}
                                    className={`rounded-lg border px-2.5 py-1.5 text-xs ${
                                        !hasFilteredResults || currentPage === totalPages
                                            ? 'cursor-not-allowed border-slate-800 text-slate-600'
                                            : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside className={`${shellPanelClass} p-5 sm:p-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto`} aria-labelledby="selected-case">
                        <div className="border-b border-slate-800/90 pb-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Secondary context</div>
                            <h2 id="selected-case" className="mt-2 text-lg font-semibold text-white">
                                Selected case
                            </h2>
                            <div className="mt-3 text-base font-semibold text-white">{selectedTransaction.dataset}</div>
                            <div className="mt-1 text-xs font-medium text-cyan-300">{selectedTransaction.id}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${accessMethodStyles[selectedTransaction.accessMethod].badge}`}>
                                    <span className="font-semibold tracking-[0.1em]">{accessMethodStyles[selectedTransaction.accessMethod].token}</span>
                                    {accessMethodStyles[selectedTransaction.accessMethod].label}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyles[selectedTransaction.status].badge}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[selectedTransaction.status].dot}`} />
                                    {statusStyles[selectedTransaction.status].text}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${selectedCaseTone.badge}`}>
                                    {selectedCaseTone.label}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-slate-400">{selectedCaseSummary}</p>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                            <FactTile label="Escrow amount" value={selectedTransaction.amount} />
                            <FactTile label="Review window" value={selectedCheckoutRecord ? `${selectedCheckoutRecord.configuration.reviewWindowHours} hours` : 'Legacy record'} />
                            <FactTile label="Provider" value={selectedTransaction.provider} mono />
                            <FactTile label="Buyer" value={selectedTransaction.buyer} mono />
                        </div>

                        <section className={`mt-5 ${quietPanelClass} p-4`}>
                            <div className="text-sm font-semibold text-white">Operational monitor</div>
                            <div className="mt-4 space-y-3">
                                <InspectorRow label="Release gate" value={releasePaymentGuardrail.allowed ? 'Open' : 'Locked'} tone={releasePaymentGuardrail.allowed ? 'text-emerald-300' : 'text-amber-300'} />
                                <InspectorRow label="Dispute path" value={openDisputeGuardrail.allowed ? 'Available' : 'Closed'} tone={openDisputeGuardrail.allowed ? 'text-rose-300' : 'text-slate-300'} />
                                <InspectorRow label="Window extension" value={extendWindowGuardrail.allowed ? 'Available' : 'Closed'} tone={extendWindowGuardrail.allowed ? 'text-blue-300' : 'text-slate-300'} />
                                <InspectorRow label="Integrity watch" value={selectedCaseTone.value} tone={selectedCaseTone.valueTone} />
                            </div>
                        </section>

                        <section className={`mt-5 ${quietPanelClass} p-4`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold text-white">Outcome protection</div>
                                    <div className="mt-1 text-xs text-slate-400">
                                        Outcome-protected deals show evaluation commitments and credit posture directly inside the case inspector.
                                    </div>
                                </div>
                                {selectedCheckoutRecord ? (
                                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                                        {outcomeStageMeta[selectedCheckoutRecord.outcomeProtection.stage].label}
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                                        Standard escrow
                                    </span>
                                )}
                            </div>

                            {selectedCheckoutRecord ? (
                                <>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                        <FactTile label="Evaluation fee" value={selectedCheckoutRecord.outcomeProtection.evaluationFeeUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} />
                                        <FactTile label="Metadata preview" value={selectedCheckoutRecord.outcomeProtection.metadataPreviewIncluded ? 'Included' : 'Not included'} />
                                        <FactTile label="Schema version" value={selectedCheckoutRecord.outcomeProtection.commitments.schemaVersion} mono />
                                        <FactTile label="Freshness floor" value={`${selectedCheckoutRecord.outcomeProtection.commitments.confidenceFloor}%`} />
                                    </div>
                                    <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-950/55 px-4 py-3 text-xs text-slate-300">
                                        {selectedCheckoutRecord.outcomeProtection.engine.summary}
                                    </div>
                                    {selectedCheckoutRecord.outcomeProtection.credits.status === 'issued' && (
                                        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-100">
                                            {selectedCheckoutRecord.outcomeProtection.credits.reason} Credit: {selectedCheckoutRecord.outcomeProtection.credits.amountUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="mt-4 rounded-xl border border-dashed border-slate-700/90 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
                                    This record belongs to the legacy escrow set. Protected evaluation commitments appear only on deals started through Escrow-Native Checkout.
                                </div>
                            )}
                        </section>

                        <section className={`mt-5 ${quietPanelClass} p-4`}>
                            <div className="text-sm font-semibold text-white">Case actions</div>
                            <div className="mt-4 space-y-3">
                                <ActionControl
                                    buttonLabel="Confirm and Release Payment"
                                    description={releasePaymentGuardrail.allowed ? selectedCheckoutRecord?.lifecycleState === 'RELEASE_PENDING' ? 'Buyer validation completed. Release is unlocked by the current outcome-protection policy.' : 'Release is available for this escrow state.' : releasePaymentGuardrail.reason}
                                    tone={releasePaymentGuardrail.allowed ? 'primary' : 'disabled'}
                                    onClick={() => {
                                        if (selectedCheckoutRecord?.lifecycleState === 'RELEASE_PENDING') {
                                            handleReleaseSelectedCheckout()
                                            return
                                        }
                                        setShowFeedbackModal(true)
                                    }}
                                    disabled={!releasePaymentGuardrail.allowed}
                                />
                                <ActionControl
                                    buttonLabel="Initiate Dispute"
                                    description={openDisputeGuardrail.allowed ? 'Dispute can be opened while access is active or pending release.' : openDisputeGuardrail.reason}
                                    tone={openDisputeGuardrail.allowed ? 'critical' : 'disabled'}
                                    disabled={!openDisputeGuardrail.allowed}
                                />
                                <ActionControl
                                    buttonLabel="Extend Window"
                                    description={extendWindowGuardrail.allowed ? 'Window extension is available for this contract stage.' : extendWindowGuardrail.reason}
                                    tone={extendWindowGuardrail.allowed ? 'secondary' : 'disabled'}
                                    disabled={!extendWindowGuardrail.allowed}
                                />
                            </div>
                        </section>
                    </aside>
                </section>
            </div>
            {showFeedbackModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
                    <div className={`${shellPanelClass} w-full max-w-md p-6`}>
                        <h2 className="text-xl font-semibold text-white">Rate Your Experience</h2>
                        <p className="mt-1 text-sm text-slate-400">{selectedTransaction.dataset} - {selectedTransaction.id}</p>
                        <p className="mt-1 text-xs text-slate-500">Your feedback directly impacts the provider's trust score</p>

                        <div className="mt-5">
                            <div className="mb-2 text-xs text-slate-400">Overall Dataset Quality</div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setStarRating(star)} className="text-2xl transition-colors">
                                        {starRating >= star ? '⭐' : '☆'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-2 text-xs text-slate-400">Select all that apply</div>
                            <div className="flex flex-wrap gap-2">
                                {feedbackTags.map(tag => {
                                    const isSelected = selectedTags.includes(tag)
                                    const isNegative = tag === 'Schema mismatch' || tag === 'Poor quality'
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`rounded-full border px-2 py-1 text-xs transition-colors ${
                                                isSelected
                                                    ? isNegative
                                                        ? 'border-rose-500/40 bg-rose-500/20 text-rose-200'
                                                        : 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200'
                                                    : 'border-slate-600 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {isSelected ? 'OK' : ''} {tag}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-2 text-xs text-slate-400">Optional comment</div>
                            <textarea
                                value={comment}
                                onChange={event => setComment(event.target.value.slice(0, 300))}
                                placeholder="Describe your experience..."
                                className="h-20 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
                            />
                            <div className="mt-1 text-right text-[10px] text-slate-500">{comment.length}/300</div>
                        </div>

                        <div className="mt-4 text-xs text-slate-500">Info: Your rating updates the provider's trust score within 24 hours. Ratings are anonymous.</div>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="flex-1 rounded-xl border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white"
                            >
                                Skip and Release
                            </button>
                            <button
                                onClick={handleSubmitFeedback}
                                className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                            >
                                Submit and Release
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function HeaderSignal({ label, value, accent }: { label: string; value: string; accent: 'positive' | 'caution' }) {
    const accentClass = accent === 'positive' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-amber-500/30 bg-amber-500/10 text-amber-100'
    return (
        <div className={`rounded-2xl border px-4 py-3 ${accentClass}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
            <div className="mt-2 text-sm font-semibold">{value}</div>
        </div>
    )
}

function MetricTile({
    label,
    value,
    detail,
    tone = 'neutral'
}: {
    label: string
    value: string
    detail: string
    tone?: GovernanceTone
}) {
    return (
        <div className={`${metricPanelClass} ${getTonePanelClass(tone)}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</div>
            <div className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-white">{value}</div>
            <div className="mt-2 text-xs text-slate-400">{detail}</div>
        </div>
    )
}

function GovernanceCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: GovernanceTone
}) {
    return (
        <article className={`${metricPanelClass} ${getTonePanelClass(tone)}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</div>
            <div className="mt-2 text-base font-semibold text-white">{value}</div>
            <div className="mt-2 text-sm leading-6 text-slate-400">{detail}</div>
        </article>
    )
}

function EscrowLedgerRow({
    row,
    checkoutRecord,
    isSelected,
    onSelect
}: {
    row: EscrowTransaction
    checkoutRecord: ReturnType<typeof loadEscrowCheckouts>[number] | null
    isSelected: boolean
    onSelect: () => void
}) {
    const statusStyle = statusStyles[row.status]
    const accessStyle = accessMethodStyles[row.accessMethod]

    return (
        <tr className={`cursor-pointer align-top transition-colors ${statusStyle.row} ${isSelected ? 'bg-cyan-500/[0.09] ring-1 ring-inset ring-cyan-500/30' : ''}`} onClick={onSelect}>
            <td className="px-4 py-3.5">
                <div className="font-mono text-xs font-semibold text-cyan-300">{row.id}</div>
            </td>
            <td className="px-4 py-3.5">
                <div className="pr-2 text-sm font-semibold text-white">{row.dataset}</div>
            </td>
            <td className="px-4 py-3.5">
                <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="font-mono">{row.buyer}</div>
                    <div className="font-mono">{row.provider}</div>
                </div>
            </td>
            <td className="px-4 py-3.5 text-sm font-semibold text-slate-200">{row.amount}</td>
            <td className="px-4 py-3.5">
                {checkoutRecord ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        {outcomeStageMeta[checkoutRecord.outcomeProtection.stage].label}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[10px] font-medium text-slate-400">
                        Standard escrow
                    </span>
                )}
            </td>
            <td className="px-4 py-3.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${accessStyle.badge}`}>
                    <span className="font-semibold tracking-[0.1em]">{accessStyle.token}</span>
                    {accessStyle.label}
                </span>
            </td>
            <td className="px-4 py-3.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusStyle.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                    {statusStyle.text}
                </span>
            </td>
            <td className="px-4 py-3.5 text-right">
                <button
                    onClick={event => {
                        event.stopPropagation()
                        onSelect()
                    }}
                    className={actionButtonClass}
                >
                    Open
                </button>
            </td>
        </tr>
    )
}

function FactTile({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className={`${metricPanelClass} px-4 py-3`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</div>
            <div className={`mt-2 text-sm font-semibold text-white ${mono ? 'font-mono' : ''}`}>{value}</div>
        </div>
    )
}

function InspectorRow({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-400">{label}</span>
            <span className={`font-medium ${tone}`}>{value}</span>
        </div>
    )
}

function ActionControl({
    buttonLabel,
    description,
    tone,
    onClick,
    disabled
}: {
    buttonLabel: string
    description: string
    tone: 'primary' | 'secondary' | 'critical' | 'disabled'
    onClick?: () => void
    disabled?: boolean
}) {
    const buttonClassName =
        tone === 'primary'
            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
            : tone === 'critical'
              ? 'border border-rose-500/50 text-rose-200 hover:bg-rose-500/10'
              : tone === 'secondary'
                ? 'border border-blue-500/50 text-blue-200 hover:bg-blue-500/10'
                : 'cursor-not-allowed border border-slate-700 bg-slate-800/60 text-slate-400'

    return (
        <div>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${buttonClassName}`}
            >
                {buttonLabel}
            </button>
            <p className={`mt-2 text-[11px] ${disabled ? 'text-amber-300' : 'text-slate-500'}`}>{description}</p>
        </div>
    )
}

function getTonePanelClass(tone: GovernanceTone) {
    switch (tone) {
        case 'positive':
            return 'border-emerald-500/20'
        case 'caution':
            return 'border-amber-500/20'
        case 'critical':
            return 'border-rose-500/20'
        default:
            return ''
    }
}

function getGovernanceTone(status: EscrowStatus, hasCredit: boolean | undefined) {
    if (status === 'DISPUTE_OPEN') {
        return {
            badge: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
            label: 'Escalated case',
            value: 'Dispute open',
            valueTone: 'text-rose-300'
        }
    }
    if (hasCredit) {
        return {
            badge: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
            label: 'Protected credit',
            value: 'Credit issued',
            valueTone: 'text-amber-300'
        }
    }
    if (status === 'RELEASE_PENDING') {
        return {
            badge: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200',
            label: 'Release ready',
            value: 'Awaiting payout',
            valueTone: 'text-indigo-300'
        }
    }
    if (status === 'RELEASED_TO_PROVIDER') {
        return {
            badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
            label: 'Closed record',
            value: 'Released',
            valueTone: 'text-emerald-300'
        }
    }
    if (status === 'ACCESS_ACTIVE') {
        return {
            badge: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
            label: 'Live access',
            value: 'Under watch',
            valueTone: 'text-blue-300'
        }
    }
    return {
        badge: 'border-slate-600 bg-slate-800/80 text-slate-200',
        label: 'Pre-release',
        value: 'In review',
        valueTone: 'text-slate-300'
    }
}

function getSelectedCaseSummary(status: EscrowStatus, releaseOpen: boolean, hasCredit: boolean | undefined) {
    if (status === 'DISPUTE_OPEN') {
        return 'This escrow is already escalated. Release and extension actions stay subordinate to dispute handling until the investigation closes.'
    }
    if (hasCredit) {
        return 'A protected commitment missed during evaluation, so the case is still visible with automatic-credit posture attached.'
    }
    if (status === 'RELEASE_PENDING' && releaseOpen) {
        return 'Buyer validation is complete and the case is sitting in the final payout lane.'
    }
    if (status === 'ACCESS_ACTIVE') {
        return 'Access is live and still governed, so the main decision is whether the current session should continue, extend, or move into dispute.'
    }
    if (status === 'RELEASED_TO_PROVIDER') {
        return 'This escrow has already completed provider release and now sits in closed-record monitoring.'
    }
    return 'This case is still moving through initial hold and review controls before live access or release can happen.'
}
