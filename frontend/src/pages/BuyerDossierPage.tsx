import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import CredentialStatusBadge from '../components/credentials/CredentialStatusBadge'
import {
    getDealRouteContextById
} from '../domain/dealDossier'
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
    sectionTitle: 'text-2xl font-semibold tracking-tight text-white',
    eyebrow: 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400',
    chip: 'rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-cyan-100'
}

const TIMELINE_EVENTS = [
    { title: 'Credential issued', detail: 'Short-lived evaluation credential created', state: 'complete' },
    { title: 'Workspace ready', detail: 'Secure evaluation environment prepared', state: 'complete' },
    { title: 'Deal approved', detail: 'Provider approved evaluation terms', state: 'complete' },
    { title: 'Escrow funded', detail: 'Evaluation fee deposited', state: 'complete' },
    { title: 'Rights quote accepted', detail: 'Terms package confirmed', state: 'complete' },
    { title: 'Dataset selected', detail: 'Evaluation target identified', state: 'complete' }
]

const DEFAULT_CREDENTIAL: EphemeralCredential = {
    id: 'TKN-DEMO-A3F8',
    participantId: 'part_anon_current',
    datasetId: '1',
    issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    scopes: ['dataset:read', 'query:clean-room', 'audit:write', 'export:none', 'egress:blocked', 'watermark:required', 'policy:enforced'],
    status: 'active',
    createdFrom: 'gate'
}

export default function BuyerDossierPage({ demo = false }: { demo?: boolean }) {
    const { dealId } = useParams()
    const isDemoRoute = demo || window.location.pathname.startsWith('/demo/')
    const buyerDemoActive = !demo && isBuyerDemoActive()
    const useDemo = isDemoRoute || buyerDemoActive
    
    const [issuedCredential, setIssuedCredential] = useState<EphemeralCredential | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const dealContext = useMemo(() => {
        if (!dealId) return null
        return getDealRouteContextById(dealId)
    }, [dealId])

    const dataset = useMemo(() => {
        if (dealContext?.dataset) return dealContext.dataset
        if (dealContext?.seed?.datasetId) {
            return getDatasetDetailById(dealContext.seed.datasetId)
        }
        const canonicalScenario = getCanonicalDemoEscrowScenario()
        if (canonicalScenario?.checkoutRecord) {
            return getDatasetDetailById(canonicalScenario.checkoutRecord.datasetId)
        }
        return Object.values(DATASET_DETAILS)[0]
    }, [dealContext])

    const routeDataset = dataset

    const credential = useMemo(() => {
        if (issuedCredential) return issuedCredential
        return null
    }, [issuedCredential, refreshKey])

    const nowMs = useMemo(() => Date.now(), [refreshKey])
    const credentialStatus = credential ? getCredentialStatus(credential, nowMs) : null
    const isCredentialActive = credentialStatus === 'active' || credentialStatus === 'expiring'

    const handleIssueCredential = () => {
        const newCredential = issueEphemeralCredential({
            participantId: 'part_anon_current',
            datasetId: routeDataset?.id || '1',
            dealId: dealId,
            ttlMinutes: 60
        })
        setIssuedCredential(newCredential)
        setRefreshKey(v => v + 1)
    }

    const dealRef = dealId || DEMO_ESCROW_CANONICAL_IDS.dealId
    const datasetTitle = routeDataset?.title || 'Dataset'

    if (!routeDataset) {
        return (
            <DatasetUnavailableState
                contextLabel="Buyer Dossier"
                detail="The evaluation dossier could not be found. Return to Datasets and select a dataset to begin evaluation."
            />
        )
    }

    return (
        <div className={STYLES.page}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute right-[-10%] top-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className={STYLES.shell}>
                <div className="space-y-8">
                    {/* Hero Section */}
                    <section className={`${STYLES.card} px-8 py-8`}>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="max-w-4xl space-y-3">
                                <div className="text-sm text-slate-400">
                                    <Link to={useDemo ? '/demo/datasets' : '/datasets'} className="hover:text-white">
                                        Datasets
                                    </Link>
                                    <span className="mx-2 text-slate-600">/</span>
                                    <span className="text-slate-200">Evaluation Dossier</span>
                                </div>

                                <div className={STYLES.eyebrow}>BUYER WORKFLOW · EVALUATION</div>

                                <h1 className="text-4xl font-semibold tracking-tight text-white">
                                    Deal {dealRef} · {datasetTitle}
                                </h1>

                                <p className="text-base text-slate-300">
                                    Temporary evaluation access with governed workspace, credential controls, and output review.
                                </p>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-3">
                                <Link
                                    to={useDemo ? '/demo/datasets' : '/datasets'}
                                    className={STYLES.buttonSecondary}
                                >
                                    Back to Datasets
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Credential & Workspace Cards */}
                    <section className="grid gap-4 md:grid-cols-2">
                        <div className={STYLES.card}>
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <div className={STYLES.eyebrow}>Credential</div>
                                    <div className="mt-2">
                                        {credential ? (
                                            <CredentialStatusBadge status={credentialStatus || 'active'} />
                                        ) : (
                                            <span className="rounded-full border border-slate-600/70 bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                NOT ISSUED
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {credential ? (
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm font-mono text-lg font-semibold text-white">
                                            {credential.id}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {credentialStatus === 'active' ? 'Active' : credentialStatus} · {
                                            Math.max(0, Math.floor((new Date(credential.expiresAt).getTime() - nowMs) / 60000))
                                            }m remaining
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {credential.scopes.slice(0, 4).map(scope => (
                                            <span key={scope} className={STYLES.chip}>
                                                {scope.split(':')[1]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">
                                    No credential issued. Request one to access the protected evaluation environment.
                                </p>
                            )}

                            {!credential && (
                                <button
                                    onClick={handleIssueCredential}
                                    className={`mt-4 w-full ${STYLES.buttonPrimary}`}
                                >
                                    Issue Credential
                                </button>
                            )}
                        </div>

                        <div className={STYLES.card}>
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <div className={STYLES.eyebrow}>Workspace</div>
                                    <div className="mt-2">
                                        <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                                            ● Ready
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-lg font-semibold text-white">
                                        Secure Evaluation Environment
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Access Mode: Clean Room
                                    </div>
                                </div>

                                {isCredentialActive ? (
                                    <Link
                                        to={useDemo ? '/demo/workspace' : '/workspace'}
                                        className={`mt-2 block w-full text-center ${STYLES.buttonPrimary}`}
                                    >
                                        Open Workspace
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-500"
                                    >
                                        Credential Required
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className={`${STYLES.card}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className={STYLES.eyebrow}>Quick Actions</div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            {!credential && (
                                <button
                                    onClick={handleIssueCredential}
                                    className={STYLES.buttonPrimary}
                                >
                                    Issue Credential
                                </button>
                            )}
                            <Link
                                to={isCredentialActive ? (useDemo ? '/demo/workspace' : '/workspace') : '#'}
                                className={`${STYLES.buttonSecondary} ${!isCredentialActive ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                Open Workspace
                            </Link>
                            <Link
                                to={useDemo ? `/demo/deals/${dealRef}/output-review` : `/deals/${dealRef}/output-review`}
                                className={STYLES.buttonSecondary}
                            >
                                Review Output
                            </Link>
                        </div>
                    </section>

                    {/* Deal Status */}
                    <section className={`${STYLES.card}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className={STYLES.eyebrow}>Deal Status</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    <span className="text-lg font-semibold text-white">Evaluation Active</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-400">No blockers</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-emerald-400">80%</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Progress</div>
                            </div>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                            <div className="h-full w-[80%] rounded-full bg-emerald-500" />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                                Dataset Selected
                            </span>
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                                Terms Accepted
                            </span>
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                                Escrow Funded
                            </span>
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                                Workspace Ready
                            </span>
                            {credential && (
                                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200">
                                    Credential Active
                                </span>
                            )}
                        </div>
                    </section>

                    {/* Timeline */}
                    <section className={`${STYLES.card}`}>
                        <div className={STYLES.eyebrow}>Timeline · Recent Events</div>
                        <div className="mt-5 space-y-4">
                            {credential && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="h-3 w-3 rounded-full bg-cyan-400" />
                                        <span className="mt-2 h-full w-px bg-slate-700" />
                                    </div>
                                    <div className="pb-4">
                                        <div className="text-sm font-semibold text-white">Credential issued</div>
                                        <div className="text-xs text-slate-500">2h ago</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                    <span className="mt-2 h-full w-px bg-slate-700" />
                                </div>
                                <div className="pb-4">
                                    <div className="text-sm font-semibold text-white">Workspace ready</div>
                                    <div className="text-xs text-slate-500">2h ago</div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                    <span className="mt-2 h-full w-px bg-slate-700" />
                                </div>
                                <div className="pb-4">
                                    <div className="text-sm font-semibold text-white">Deal approved</div>
                                    <div className="text-xs text-slate-500">3h ago</div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">Escrow funded</div>
                                    <div className="text-xs text-slate-500">3h ago</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}