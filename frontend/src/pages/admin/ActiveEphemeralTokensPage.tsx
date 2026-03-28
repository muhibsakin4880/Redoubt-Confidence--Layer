import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { buildTokenControlSummary } from '../../domain/adminAutomation'
import { loadSharedDealLifecycleRecords } from '../../domain/dealLifecycle'

type SummaryTone = 'blue' | 'green' | 'amber' | 'red' | 'gray'
type TokenStatus = 'planned' | 'active' | 'expiring' | 'frozen' | 'revoked'
type FeedFilter = 'all' | 'planned' | 'active' | 'expiring' | 'frozen' | 'revoked'
type ActionTone = 'redSolid' | 'redOutline' | 'amber' | 'blueOutline'

type SummaryCard = {
    label: string
    value: string
    tone: SummaryTone
}

type TokenFeedRow = {
    tokenId: string
    participant: string
    dataset: string
    issued: string
    expires: string
    scope: string
    dealStage: string
    statusLabel: string
    status: TokenStatus
    actionLabel: string
    actionTone: ActionTone
    autoAction: string
}

type AlertCard = {
    tone: 'red' | 'amber'
    token: string
    participant: string
    flag: string
    ipList?: string[]
    actions: Array<{ label: string; tone: ActionTone }>
}

type PolicyRow = {
    policy: string
    value: string
}

type RevocationRow = {
    tokenId: string
    participant: string
    reason: string
    revokedBy: string
    timestamp: string
}

const summaryCards: SummaryCard[] = [
    { label: 'Active Tokens', value: '8,472', tone: 'blue' },
    { label: 'Expiring Soon (< 1hr)', value: '247', tone: 'amber' },
    { label: 'Expired Today', value: '1,893', tone: 'gray' },
    { label: 'Revoked Today', value: '34', tone: 'red' },
    { label: 'Suspicious Activity', value: '7', tone: 'red' }
]

const tokenFeedRows = [
    {
        tokenId: 'TKN-a3f8b2c1',
        participant: 'part_anon_042',
        dataset: 'Clinical Outcomes Delta',
        issued: '14:32:07',
        expires: '15:32:07',
        scope: 'Read-only',
        statusLabel: 'ACTIVE',
        status: 'active',
        actionLabel: 'REVOKE',
        actionTone: 'redOutline'
    },
    {
        tokenId: 'TKN-d9e2f4a7',
        participant: 'part_anon_017',
        dataset: 'Financial Tick Data',
        issued: '14:28:44',
        expires: '14:58:44',
        scope: 'Read + Export',
        statusLabel: 'EXPIRING',
        status: 'expiring',
        actionLabel: 'REVOKE',
        actionTone: 'redOutline'
    },
    {
        tokenId: 'TKN-b7c1e3d5',
        participant: 'part_anon_089',
        dataset: 'Genomics Research Dataset',
        issued: '13:14:22',
        expires: '14:14:22',
        scope: 'Read-only',
        statusLabel: 'SUSPICIOUS',
        status: 'suspicious',
        actionLabel: 'REVOKE',
        actionTone: 'redSolid'
    },
    {
        tokenId: 'TKN-f2a9c8e1',
        participant: 'part_anon_031',
        dataset: 'Consumer Behavior Analytics',
        issued: '14:01:33',
        expires: '16:01:33',
        scope: 'Read-only',
        statusLabel: 'ACTIVE',
        status: 'active',
        actionLabel: 'REVOKE',
        actionTone: 'redOutline'
    },
    {
        tokenId: 'TKN-e4d7b3f9',
        participant: 'part_anon_056',
        dataset: 'Global Climate 2020-2024',
        issued: '13:55:18',
        expires: '15:55:18',
        scope: 'Read + Export',
        statusLabel: 'ACTIVE',
        status: 'active',
        actionLabel: 'REVOKE',
        actionTone: 'redOutline'
    },
    {
        tokenId: 'TKN-c8f1a2d4',
        participant: 'part_anon_008',
        dataset: 'Healthcare IoT Stream',
        issued: '14:44:02',
        expires: '14:59:02',
        scope: 'Read-only',
        statusLabel: 'EXPIRING',
        status: 'expiring',
        actionLabel: 'REVOKE',
        actionTone: 'redOutline'
    },
    {
        tokenId: 'TKN-a1b4c7e2',
        participant: 'part_anon_021',
        dataset: 'Satellite Land Use 2024',
        issued: '12:33:47',
        expires: '14:33:47',
        scope: 'Read-only',
        statusLabel: 'SUSPICIOUS',
        status: 'suspicious',
        actionLabel: 'REVOKE',
        actionTone: 'redSolid'
    },
    {
        tokenId: 'TKN-d3e6f8b5',
        participant: 'part_anon_063',
        dataset: 'Financial Tick Data',
        issued: '14:12:09',
        expires: '15:12:09',
        scope: 'Read-only',
        statusLabel: 'ACTIVE',
        status: 'active',
        actionLabel: 'REVOKE',
        actionTone: 'redOutline'
    }
]

const anomalyCards: AlertCard[] = [
    {
        tone: 'red',
        token: 'TKN-b7c1e3d5',
        participant: 'part_anon_089',
        flag: 'Token accessed from 3 different IP addresses within 10 minutes',
        ipList: ['185.58.142.12', '92.14.233.44', '103.21.58.97'],
        actions: [
            { label: 'Revoke Token', tone: 'redSolid' },
            { label: 'Block Participant', tone: 'redOutline' },
            { label: 'Investigate', tone: 'amber' }
        ]
    },
    {
        tone: 'red',
        token: 'TKN-a1b4c7e2',
        participant: 'part_anon_021',
        flag: 'Unusual bulk query pattern: 847 records accessed in 2 minutes. Threshold: 100 records/minute',
        actions: [
            { label: 'Revoke Token', tone: 'redSolid' },
            { label: 'Block Participant', tone: 'redOutline' },
            { label: 'Investigate', tone: 'amber' }
        ]
    },
    {
        tone: 'amber',
        token: 'TKN-f9c2e5a3',
        participant: 'part_anon_077',
        flag: 'Token scope exceeded: Export attempted on Read-only token',
        actions: [
            { label: 'Revoke Token', tone: 'redSolid' },
            { label: 'Investigate', tone: 'amber' }
        ]
    }
]

const policyRows: PolicyRow[] = [
    { policy: 'Evaluation tokens', value: 'Monitor until buyer validation or TTL expiry' },
    { policy: 'Validated tokens', value: 'Force read-only until payout release completes' },
    { policy: 'Frozen tokens', value: 'Auto-freeze on dispute or outcome-engine miss' },
    { policy: 'Released tokens', value: 'Auto-revoke and archive after settlement closes' }
]

const revocationRows: RevocationRow[] = [
    { tokenId: 'TKN-x9f2c4a1', participant: 'part_anon_033', reason: 'IP anomaly detected', revokedBy: 'Auto-revoke', timestamp: '14:29:44' },
    { tokenId: 'TKN-b3e7d2f8', participant: 'part_anon_071', reason: 'Scope violation', revokedBy: 'Auto-revoke', timestamp: '14:17:22' },
    { tokenId: 'TKN-c1a4f9e6', participant: 'part_anon_019', reason: 'Admin manual revoke', revokedBy: 'admin_001', timestamp: '13:55:08' },
    { tokenId: 'TKN-d8b2e5c3', participant: 'part_anon_044', reason: 'Bulk access threshold exceeded', revokedBy: 'Auto-revoke', timestamp: '13:41:33' },
    { tokenId: 'TKN-e5f7a1b9', participant: 'part_anon_088', reason: 'Session timeout', revokedBy: 'Auto-revoke', timestamp: '13:28:17' }
]

const summaryValueClasses: Record<SummaryTone, string> = {
    blue: 'text-cyan-300',
    green: 'text-emerald-300',
    amber: 'text-amber-300',
    red: 'text-red-300',
    gray: 'text-slate-300'
}

const summaryToneClasses: Record<SummaryTone, string> = {
    blue: 'border-cyan-500/35 bg-cyan-500/10',
    green: 'border-emerald-500/35 bg-emerald-500/10',
    amber: 'border-amber-500/35 bg-amber-500/10',
    red: 'border-red-500/35 bg-red-500/10',
    gray: 'border-slate-600/55 bg-slate-800/40'
}

const statusBadgeClasses: Record<TokenStatus, string> = {
    planned: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
    active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    expiring: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    frozen: 'border-red-500/40 bg-red-500/10 text-red-200',
    revoked: 'border-slate-500/40 bg-slate-500/10 text-slate-300'
}

const actionButtonClasses: Record<ActionTone, string> = {
    redSolid: 'border-red-500/60 bg-red-500/15 text-red-200 hover:bg-red-500/25',
    redOutline: 'border-red-500/45 bg-transparent text-red-200 hover:bg-red-500/12',
    amber: 'border-amber-500/55 bg-amber-500/12 text-amber-200 hover:bg-amber-500/20',
    blueOutline: 'border-cyan-500/55 bg-transparent text-cyan-200 hover:bg-cyan-500/12'
}

const filterTabs: Array<{ key: FeedFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'planned', label: 'Planned' },
    { key: 'active', label: 'Active' },
    { key: 'expiring', label: 'Expiring Soon' },
    { key: 'frozen', label: 'Frozen' },
    { key: 'revoked', label: 'Revoked' }
]

function formatUtcTimestamp(date: Date) {
    return `${date.toISOString().replace('T', ' ').substring(0, 19)} UTC`
}

export default function ActiveEphemeralTokensPage() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState<FeedFilter>('all')
    const [currentTimestamp, setCurrentTimestamp] = useState(() => formatUtcTimestamp(new Date()))
    const tokenControlSummary = useMemo(
        () => buildTokenControlSummary(loadSharedDealLifecycleRecords()),
        []
    )

    const dashboardSummaryCards = useMemo<SummaryCard[]>(() => [
        {
            label: 'Evaluation Stage',
            value: `${tokenControlSummary.dealStageCounts.evaluation}`,
            tone: 'blue'
        },
        {
            label: 'Validated Stage',
            value: `${tokenControlSummary.dealStageCounts.validated}`,
            tone: 'green'
        },
        {
            label: 'Frozen Controls',
            value: `${tokenControlSummary.controlStateCounts.frozen}`,
            tone: 'red'
        },
        {
            label: 'Revoked Tokens',
            value: `${tokenControlSummary.controlStateCounts.revoked}`,
            tone: 'gray'
        },
        {
            label: 'Expiring Soon',
            value: `${tokenControlSummary.controlStateCounts.expiring}`,
            tone: 'amber'
        }
    ], [tokenControlSummary])

    const tokenRows = useMemo<TokenFeedRow[]>(() =>
        tokenControlSummary.rows.map(row => ({
            tokenId: row.tokenId,
            participant: row.participant,
            dataset: row.dataset,
            issued: row.issued,
            expires: row.expires,
            scope: row.scope,
            dealStage: row.stageLabel,
            statusLabel: row.stateLabel,
            status: row.controlState,
            actionLabel:
                row.controlState === 'frozen'
                    ? 'FREEZE'
                    : row.controlState === 'revoked'
                        ? 'ARCHIVED'
                        : row.dealStage === 'validated'
                            ? 'HOLD'
                            : 'MONITOR',
            actionTone:
                row.controlState === 'frozen'
                    ? 'redSolid'
                    : row.controlState === 'revoked'
                        ? 'blueOutline'
                        : row.controlState === 'expiring'
                            ? 'amber'
                            : 'redOutline',
            autoAction: row.autoAction
        })),
    [tokenControlSummary])

    const anomalyCardsDynamic = useMemo<AlertCard[]>(() =>
        tokenControlSummary.anomalyRows.map(row => ({
            tone: row.controlState === 'frozen' ? 'red' : 'amber',
            token: row.tokenId,
            participant: row.participant,
            flag: row.controlReason,
            actions:
                row.controlState === 'frozen'
                    ? [
                        { label: 'Revoke Token', tone: 'redSolid' },
                        { label: 'Block Participant', tone: 'redOutline' },
                        { label: 'Investigate', tone: 'amber' }
                    ]
                    : [
                        { label: 'Tighten Scope', tone: 'amber' },
                        { label: 'Investigate', tone: 'blueOutline' }
                    ]
        })),
    [tokenControlSummary])

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrentTimestamp(formatUtcTimestamp(new Date()))
        }, 1000)
        return () => window.clearInterval(interval)
    }, [])

    const filteredRows = useMemo(() => {
        if (activeFilter === 'all') return tokenRows
        return tokenRows.filter(row => row.status === activeFilter)
    }, [activeFilter, tokenRows])

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    return (
        <AdminLayout title="ACTIVE EPHEMERAL TOKENS" subtitle="REAL-TIME TOKEN SECURITY MONITORING">
            <div className="space-y-6">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Active Ephemeral Tokens</h1>
                        <p className="max-w-3xl text-sm text-slate-400">
                            Real-time oversight of short-lived access credentials, revocation controls, and anomaly detection
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span className="inline-flex items-center gap-2 rounded-md border border-emerald-500/55 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                            LIVE
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{currentTimestamp}</span>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {dashboardSummaryCards.map(card => (
                        <article
                            key={card.label}
                            className={`rounded-xl border p-4 backdrop-blur-xl shadow-2xl shadow-black/25 ${summaryToneClasses[card.tone]}`}
                        >
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                            <p className={`mt-2 text-3xl font-semibold ${summaryValueClasses[card.tone]}`}>{card.value}</p>
                        </article>
                    ))}
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="border-b border-slate-800/60 px-5 py-4">
                        <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Live Token Feed</h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {filterTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveFilter(tab.key)}
                                    className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                        activeFilter === tab.key
                                            ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                            : 'border-slate-700/70 bg-slate-900/50 text-slate-400 hover:border-slate-600/80 hover:text-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1360px]">
                            <thead className="bg-slate-950/45">
                                <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                    <th className="px-4 py-3 text-left">Token ID</th>
                                    <th className="px-4 py-3 text-left">Participant</th>
                                    <th className="px-4 py-3 text-left">Dataset</th>
                                    <th className="px-4 py-3 text-left">Deal Stage</th>
                                    <th className="px-4 py-3 text-left">Issued</th>
                                    <th className="px-4 py-3 text-left">Expires</th>
                                    <th className="px-4 py-3 text-left">Scope</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Auto Control</th>
                                    <th className="px-4 py-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-[11px] text-slate-200">
                                {filteredRows.map(row => (
                                    <tr key={row.tokenId} className="hover:bg-slate-800/25 transition-colors">
                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-cyan-300">{row.tokenId}</td>
                                        <td className="whitespace-nowrap px-4 py-3">{row.participant}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.dataset}</td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className="inline-flex items-center rounded-md border border-slate-700/70 bg-slate-900/60 px-2.5 py-1 text-[10px] font-semibold tracking-[0.11em] text-slate-200">
                                                {row.dealStage}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-300">{row.issued}</td>
                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-300">{row.expires}</td>
                                        <td className="whitespace-nowrap px-4 py-3">{row.scope}</td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-[0.11em] ${statusBadgeClasses[row.status]}`}>
                                                {row.statusLabel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">{row.autoAction}</td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <button className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${actionButtonClasses[row.actionTone]}`}>
                                                {row.actionLabel}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRows.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-[11px] text-slate-500">
                                            No tokens in this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="space-y-1">
                        <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Suspicious Token Activity</h2>
                        <p className="text-lg font-semibold text-slate-100">Anomaly Alerts</p>
                        <p className="text-sm text-slate-400">{anomalyCardsDynamic.length} tokens flagged for stage-aware control review</p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                        {anomalyCardsDynamic.map(card => (
                            <article
                                key={card.token}
                                className={`rounded-lg border bg-slate-950/45 p-4 ${card.tone === 'red' ? 'border-red-500/45' : 'border-amber-500/45'}`}
                            >
                                <div className="space-y-2">
                                    <div className="rounded-md border border-slate-800/80 bg-slate-900/55 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Token</p>
                                        <p className="mt-1 font-mono text-[12px] text-cyan-300">{card.token}</p>
                                    </div>
                                    <div className="rounded-md border border-slate-800/80 bg-slate-900/55 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Participant</p>
                                        <p className="mt-1 text-[12px] text-slate-200">{card.participant}</p>
                                    </div>
                                    <div className={`rounded-md border px-3 py-2 ${card.tone === 'red' ? 'border-red-500/35 bg-red-500/10' : 'border-amber-500/35 bg-amber-500/10'}`}>
                                        <p className={`text-[10px] uppercase tracking-[0.12em] ${card.tone === 'red' ? 'text-red-300/85' : 'text-amber-300/85'}`}>Flag</p>
                                        <p className={`mt-1 text-[12px] leading-relaxed ${card.tone === 'red' ? 'text-red-100/90' : 'text-amber-100/90'}`}>{card.flag}</p>
                                    </div>
                                    {card.ipList && (
                                        <div className="rounded-md border border-slate-800/80 bg-slate-900/55 px-3 py-2">
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">IPs</p>
                                            <div className="mt-1 space-y-1">
                                                {card.ipList.map(ip => (
                                                    <p key={ip} className="font-mono text-[11px] text-slate-300">{ip}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={`mt-3 grid gap-2 ${card.actions.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                    {card.actions.map(action => (
                                        <button
                                            key={`${card.token}-${action.label}`}
                                            className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition-colors ${actionButtonClasses[action.tone]}`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </article>
                        ))}
                        {anomalyCardsDynamic.length === 0 && (
                            <div className="rounded-lg border border-slate-800/70 bg-slate-950/45 px-4 py-8 text-center text-sm text-slate-500 xl:col-span-3">
                                No token anomalies require admin attention right now.
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="border-b border-slate-800/60 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Token Policies</h2>
                            <p className="text-lg font-semibold text-slate-100">Active Token Configuration</p>
                            <p className="text-sm text-slate-400">Current platform-wide token rules</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/settings')}
                            className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${actionButtonClasses.blueOutline}`}
                        >
                            Edit Token Policies
                        </button>
                    </div>
                    <div className="divide-y divide-slate-800/60">
                        {policyRows.map(row => (
                            <div key={row.policy} className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-12 sm:items-center">
                                <p className="sm:col-span-5 text-[12px] text-slate-200">{row.policy}</p>
                                <p className="sm:col-span-4 text-[11px] text-slate-300">{row.value}</p>
                                <div className="sm:col-span-3">
                                    <span className="inline-flex items-center rounded-md border border-emerald-500/45 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-emerald-200">
                                        Active
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="border-b border-slate-800/60 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Revocation Log</h2>
                            <p className="text-lg font-semibold text-slate-100">Recent Revocations</p>
                            <p className="text-sm text-slate-400">{tokenControlSummary.revocations.length} stage-driven revocation or freeze events</p>
                        </div>
                        <button className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${actionButtonClasses.blueOutline}`}>
                            Export Revocation Log
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px]">
                            <thead className="bg-slate-950/45">
                                <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                    <th className="px-4 py-3 text-left">Token ID</th>
                                    <th className="px-4 py-3 text-left">Participant</th>
                                    <th className="px-4 py-3 text-left">Reason</th>
                                    <th className="px-4 py-3 text-left">Revoked By</th>
                                    <th className="px-4 py-3 text-left">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-[11px] text-slate-200">
                                {tokenControlSummary.revocations.map(row => (
                                    <tr key={row.tokenId} className="hover:bg-slate-800/25 transition-colors">
                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-cyan-300">{row.tokenId}</td>
                                        <td className="whitespace-nowrap px-4 py-3">{row.participant}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.reason}</td>
                                        <td className="whitespace-nowrap px-4 py-3">{row.revokedBy}</td>
                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-300">{row.timestamp}</td>
                                    </tr>
                                ))}
                                {tokenControlSummary.revocations.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-[11px] text-slate-500">
                                            No stage-based revocation events have been recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminLayout>
    )
}
