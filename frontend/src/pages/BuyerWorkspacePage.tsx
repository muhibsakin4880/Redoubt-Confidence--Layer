import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    DEMO_ESCROW_CANONICAL_IDS,
    getCanonicalDemoEscrowScenario,
    isBuyerDemoActive
} from '../domain/demoEscrowScenario'
import {
    issueEphemeralCredential,
    getCredentialStatus,
    type EphemeralCredential
} from '../domain/ephemeralCredentialStore'
import {
    getDatasetDetailById,
    DATASET_DETAILS
} from '../data/datasetDetailData'

const STYLES = {
    page: 'min-h-screen bg-slate-950 text-white',
    shell: 'mx-auto max-w-[1680px] px-6 py-12 sm:px-10 lg:px-14',
    card: 'rounded-2xl border border-slate-700/70 bg-slate-800/50 p-5',
    buttonPrimary: 'rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors',
    buttonSecondary: 'rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-400 transition-colors',
    eyebrow: 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400',
    sectionTitle: 'text-xl font-semibold tracking-tight text-white'
}

const DEFAULT_SESSION = {
    sessionId: 'WS-SESSION-A3F8',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    accessMode: 'Clean Room',
    participant: 'part_anon_current'
}

const SESSION_ACTIVITIES = [
    { title: 'Workspace opened', detail: 'Secure evaluation environment initialized', timestamp: '2h ago' },
    { title: 'Credential validated', detail: 'Short-lived token confirmed', timestamp: '2h ago' },
    { title: 'Session active', detail: 'Evaluation environment ready', timestamp: '2h ago' }
]

export default function BuyerWorkspacePage({ demo = false }: { demo?: boolean }) {
    const isDemoRoute = demo || window.location.pathname.startsWith('/demo/')
    const buyerDemoActive = !demo && isBuyerDemoActive()
    const useDemo = isDemoRoute || buyerDemoActive

    const [issuedCredential, setIssuedCredential] = useState<EphemeralCredential | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const dataset = useMemo(() => {
        const canonicalScenario = getCanonicalDemoEscrowScenario()
        if (canonicalScenario?.checkoutRecord) {
            return getDatasetDetailById(canonicalScenario.checkoutRecord.datasetId)
        }
        return Object.values(DATASET_DETAILS)[0]
    }, [])

    const credential = useMemo(() => {
        if (issuedCredential) return issuedCredential
        return null
    }, [issuedCredential, refreshKey])

    const nowMs = useMemo(() => Date.now(), [refreshKey])
    const credentialStatus = credential ? getCredentialStatus(credential, nowMs) : null
    const isCredentialActive = credentialStatus === 'active' || credentialStatus === 'expiring'

    const session = DEFAULT_SESSION

    const handleIssueCredential = () => {
        const newCredential = issueEphemeralCredential({
            participantId: session.participant,
            datasetId: dataset?.id || '1',
            ttlMinutes: 60
        })
        setIssuedCredential(newCredential)
        setRefreshKey(v => v + 1)
    }

    const datasetTitle = dataset?.title || 'Dataset'
    const sessionStarted = new Date(session.startedAt)
    const timeAgo = Math.floor((nowMs - sessionStarted.getTime()) / (60 * 60 * 1000))
    const timeAgoLabel = timeAgo > 0 ? `${timeAgo}h ago` : 'Just now'

    return (
        <div className={STYLES.page}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute right-[-10%] top-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className={STYLES.shell}>
                <div className="space-y-6">
                    {/* Hero Section */}
                    <section className={`${STYLES.card} px-8 py-8`}>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="max-w-4xl space-y-3">
                                <div className="text-sm text-slate-400">
                                    <Link to={useDemo ? '/demo/datasets' : '/datasets'} className="hover:text-white">
                                        Datasets
                                    </Link>
                                    <span className="mx-2 text-slate-600">/</span>
                                    <Link to={useDemo ? '/demo/deals' : '/deals'} className="hover:text-white">
                                        Evaluation Dossier
                                    </Link>
                                    <span className="mx-2 text-slate-600">/</span>
                                    <span className="text-slate-200">Workspace</span>
                                </div>

                                <div className={STYLES.eyebrow}>BUYER WORKFLOW · SECURE WORKSPACE</div>

                                <h1 className="text-3xl font-semibold tracking-tight text-white">
                                    {datasetTitle}
                                </h1>

                                <p className="text-base text-slate-300">
                                    Temporary evaluation environment with scoped access.
                                </p>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-3">
                                <Link
                                    to={useDemo ? '/demo/deals' : '/deals'}
                                    className={STYLES.buttonSecondary}
                                >
                                    Back to Dossier
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Workspace Status Card */}
                    <section className={`${STYLES.card}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className={STYLES.eyebrow}>Workspace</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-2xl font-bold text-emerald-400">Active</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-400">
                                    Access Mode: Clean Room
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-mono text-cyan-400">
                                    {session.sessionId}
                                </div>
                                <div className="text-xs text-slate-500">Session ID</div>
                            </div>
                        </div>
                    </section>

                    {/* Session Details Card */}
                    <section className={`${STYLES.card}`}>
                        <div className={STYLES.eyebrow}>Current Session</div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 px-4 py-3">
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Started</div>
                                <div className="mt-1 text-sm font-semibold text-white">{timeAgoLabel}</div>
                            </div>
                            <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 px-4 py-3">
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Access Mode</div>
                                <div className="mt-1 text-sm font-semibold text-white">{session.accessMode}</div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Active Scopes</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3 py-1 text-xs font-semibold text-cyan-100">
                                    Read
                                </span>
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3 py-1 text-xs font-semibold text-cyan-100">
                                    Query
                                </span>
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3 py-1 text-xs font-semibold text-cyan-100">
                                    Audit
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className={`${STYLES.card}`}>
                        <div className={STYLES.eyebrow}>Quick Actions</div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <button
                                className={STYLES.buttonPrimary}
                                disabled={!isCredentialActive}
                            >
                                Run Query
                            </button>
                            <button
                                className={STYLES.buttonSecondary}
                                disabled={!isCredentialActive}
                            >
                                View Data
                            </button>
                            <button
                                className={STYLES.buttonSecondary}
                                disabled={!isCredentialActive}
                            >
                                Export Summary
                            </button>
                        </div>

                        {!isCredentialActive && (
                            <p className="mt-3 text-xs text-amber-400">
                                Credentials required for workspace actions
                            </p>
                        )}
                    </section>

                    {/* Session Activity */}
                    <section className={`${STYLES.card}`}>
                        <div className={STYLES.eyebrow}>Session Activity</div>

                        <div className="mt-4 space-y-3">
                            {SESSION_ACTIVITIES.map((activity, index) => (
                                <div key={activity.title} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        {index < SESSION_ACTIVITIES.length - 1 && (
                                            <span className="mt-1 h-8 w-px bg-slate-700" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-white">{activity.title}</div>
                                        <div className="text-xs text-slate-400">{activity.detail}</div>
                                        <div className="text-xs text-slate-500 mt-1">{activity.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}