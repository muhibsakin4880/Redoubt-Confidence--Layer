import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { DEFAULT_DATASET, DATASET_DETAILS, RequestStatus, confidenceLevel, decisionLabel } from '../data/datasetDetailData'
import { requestReviewStateLabel } from '../domain/accessContract'

const STATUS_STEPS = [
    {
        id: 'REVIEW_IN_PROGRESS',
        title: 'Pending review',
        description: 'Team reviews purpose, controls, and delivery options.'
    },
    {
        id: 'REQUEST_APPROVED',
        title: 'Approved',
        description: 'Access configured with scoped keys and workspace policies.'
    },
    {
        id: 'REQUEST_REJECTED',
        title: 'Rejected',
        description: 'Request declined with rationale and alternatives.'
    }
] as const

export default function DatasetDetailPage() {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const dataset = (id && DATASET_DETAILS[id]) || DEFAULT_DATASET
    const [requestStatus, setRequestStatus] = useState<RequestStatus>(dataset.access.status)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [intendedUsage, setIntendedUsage] = useState('')
    const [duration, setDuration] = useState('90 days')
    const [orgType, setOrgType] = useState('research')
    const [usageScale, setUsageScale] = useState('medium')
    const [affiliation, setAffiliation] = useState('')
    const [complianceChecked, setComplianceChecked] = useState(false)
    const [escrowWindow, setEscrowWindow] = useState('24 hours')
    const [escrowActive, setEscrowActive] = useState(false)
    const openRequestModal = () => setShowRequestModal(true)

    useEffect(() => {
        setRequestStatus(dataset.access.status)
        setIntendedUsage('')
        setDuration('90 days')
        setOrgType('research')
        setUsageScale('medium')
        setAffiliation('')
        setComplianceChecked(false)
        setEscrowWindow('24 hours')
        setEscrowActive(false)
    }, [dataset])

    useEffect(() => {
        const shouldAutoOpen = Boolean((location.state as { openAccessRequest?: boolean } | null)?.openAccessRequest)

        if (!shouldAutoOpen) return

        openRequestModal()
        navigate(location.pathname, { replace: true, state: null })
    }, [location.pathname, location.state, navigate])

    const handleSubmitRequest = () => {
        setRequestStatus('REVIEW_IN_PROGRESS')
        setShowRequestModal(false)
    }

    return (
        <div className="bg-slate-900 text-white">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-800">
                <div className="container mx-auto px-4 py-10 md:py-14">
                    <div className="mb-6 flex items-center gap-3 text-sm text-slate-400">
                        <Link to="/datasets" className="hover:text-white transition-colors">
                            Datasets
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-white">{dataset.title}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-200">
                                    {dataset.category}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-400 text-green-300 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-300" />
                                    Provider verified
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{dataset.title}</h1>
                            <p className="text-slate-300 text-lg mb-6 max-w-3xl">
                                {dataset.description}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                                    <div className="text-xs uppercase text-slate-500 mb-1">Size</div>
                                    <div className="text-lg font-semibold text-white">{dataset.size}</div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                                    <div className="text-xs uppercase text-slate-500 mb-1">Records</div>
                                    <div className="text-lg font-semibold text-white">{dataset.recordCount}</div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                                    <div className="text-xs uppercase text-slate-500 mb-1">Last Updated</div>
                                    <div className="text-lg font-semibold text-white">{dataset.lastUpdated}</div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                                    <div className="text-xs uppercase text-slate-500 mb-1">Domain</div>
                                    <div className="text-lg font-semibold text-white">{dataset.category}</div>
                                </div>
                            </div>

                            <div className="mt-4 bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Contributor trust</span>
                                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-200">
                                        {dataset.contributorTrust}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    {dataset.contributionHistory}
                                </div>
                            </div>

                            <div className="mt-8">
                                <Link
                                    to={`/datasets/${dataset.id}/quality-breakdown`}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                                >
                                    View Quality Breakdown
                                </Link>
                            </div>
                        </div>

                        {/* Confidence Panel */}
                        <div className="w-full lg:max-w-sm bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-slate-400">Overall Confidence Score</div>
                                    <div className="text-3xl font-bold text-white">{dataset.confidenceScore}%</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full border text-xs ${confidenceLevel(dataset.confidenceScore).classes}`}>
                                    {confidenceLevel(dataset.confidenceScore).label}
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3">
                                <div
                                    className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-green-300"
                                    style={{ width: `${dataset.confidenceScore}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                                    <div className="text-slate-400">Completeness</div>
                                    <div className="text-white font-semibold">{dataset.quality.completeness}%</div>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                                    <div className="text-slate-400">Freshness</div>
                                    <div className="text-white font-semibold">{dataset.quality.freshnessScore}%</div>
                                </div>
                            </div>
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Freshness</span>
                                    <span className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-400/40 rounded-full px-2 py-1">
                                        {dataset.preview.freshnessLabel}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Completeness</span>
                                    <span className="text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-400/40 rounded-full px-2 py-1">
                                        {dataset.preview.completenessLabel}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Quality badge</span>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${dataset.preview.confidenceBand === 'high'
                                            ? 'bg-emerald-500/10 border-emerald-400 text-emerald-200'
                                            : dataset.preview.confidenceBand === 'medium'
                                                ? 'bg-amber-500/10 border-amber-400 text-amber-200'
                                                : 'bg-orange-500/10 border-orange-400 text-orange-200'
                                        }`}>
                                        {dataset.preview.confidenceBand === 'high' ? 'High quality' : dataset.preview.confidenceBand === 'medium' ? 'Medium quality' : 'Experimental'}
                                    </span>
                                </div>
                                <div className={`text-xs text-center px-3 py-2 rounded-lg border ${decisionLabel(dataset.preview.decision).classes}`}>
                                    {decisionLabel(dataset.preview.decision).text}
                                </div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 text-center">AI Confidence Verified Dataset</div>
                            </div>
                            {requestStatus !== 'REQUEST_APPROVED' && (
                                <div className="text-xs text-slate-400 border border-slate-700 rounded-lg px-3 py-2 bg-slate-900/80">
                                    Preview only until access is approved. No raw data is exposed; provider identity stays private.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Access Section */}
            <div className="container mx-auto px-4 pb-14">
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
                    <svg className="h-4 w-4 text-cyan-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-white">All Access Requests are Audited</span>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-9">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Left Column - Access Info, Request Status, Provider Transparency */}
                        <div className="lg:w-2/3 space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-xl font-semibold">Access</h3>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400 text-blue-200 text-xs">
                                        Guided process
                                    </span>
                                </div>
                                <p className="text-slate-300 max-w-2xl mb-4">
                                    Request access with context on intended use. We scope delivery, controls, and data handling together - no open marketplace listing.
                                </p>
                                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                                    {dataset.accessNotes.map(note => (
                                        <li key={note}>{note}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <h4 className="text-lg font-semibold text-white">Request status</h4>
                                    <span className="text-slate-500 text-sm">Transparent milestones, no provider exposure.</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {STATUS_STEPS.map(step => {
                                        const isActive = step.id === requestStatus
                                        return (
                                            <div
                                                key={step.id}
                                                className={`rounded-xl border p-5 ${isActive
                                                        ? 'border-blue-400 bg-blue-500/10 shadow-lg'
                                                        : 'border-slate-700 bg-slate-900/60'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-white">{step.title}</span>
                                                    <span
                                                        className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`}
                                                    />
                                                </div>
                                                <p className="text-sm text-slate-400">{step.description}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-400 text-green-200 text-xs">
                                        Provider verified
                                    </span>
                                    <span className="text-slate-400 text-sm">Identity protected; delivery handled by platform.</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Provider Transparency</h3>
                                <p className="text-slate-300 mb-5">
                                    Essential information to evaluate trust without exposing the provider's identity.
                                </p>
                                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {dataset.providerNotes.map(note => (
                                        <div key={note} className="bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-200">
                                            {note}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Current Status & Secure Access Options */}
                        <div className="lg:w-1/3 space-y-6">
                            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm text-slate-400">Current status</div>
                                    <span
                                        className={`px-3 py-1 rounded-full border text-xs ${requestStatus === 'REQUEST_APPROVED'
                                                ? 'bg-green-500/15 border-green-400 text-green-200'
                                                : requestStatus === 'REVIEW_IN_PROGRESS'
                                                    ? 'bg-yellow-500/15 border-yellow-400 text-yellow-200'
                                                    : 'bg-red-500/15 border-red-400 text-red-200'
                                            }`}
                                    >
                                        {requestReviewStateLabel(requestStatus)}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-sm">
                                    {requestStatus === 'REQUEST_APPROVED' && 'Access configured. Review scope and instructions below.'}
                                    {requestStatus === 'REVIEW_IN_PROGRESS' && 'We received your request. A reviewer will follow up with controls and delivery steps.'}
                                    {requestStatus === 'REQUEST_REJECTED' && 'Request declined. We can suggest alternate sources or share summary stats.'}
                                </p>
                            </div>

                            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-base font-semibold text-white">Secure Access Options</h4>
                                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Access Options</span>
                                </div>

                                {/* Side-by-side access option cards */}
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Escrow Access */}
                                    <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-5">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-start gap-3">
                                                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
                                                    <svg className="h-4 w-4 text-emerald-200/90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                                <div>
                                                    <p className="text-base font-semibold text-white">Escrow Access</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Payment held until you verify data quality
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 mb-3">
                                            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.5L10 14.9 5.05 16.7l.95-5.5-4-3.9 5.53-.8L10 1.5z" />
                                            </svg>
                                            Recommended
                                        </span>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                                                    Escrow window
                                                </label>
                                                <select
                                                    value={escrowWindow}
                                                    onChange={(event) => setEscrowWindow(event.target.value)}
                                                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                                                >
                                                    <option value="24 hours">24 hours</option>
                                                    <option value="48 hours">48 hours (+10%)</option>
                                                    <option value="72 hours">72 hours (+20%)</option>
                                                </select>
                                            </div>
                                            <p className="text-xs text-slate-400">Full refund if unsatisfied</p>
<button
                                                 className="w-full px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors transition-transform duration-100 active:scale-95"
                                                 onClick={() => setEscrowActive(true)}
                                             >
                                                Put on Escrow
                                            </button>
                                        </div>
                                    </div>

                                    {/* Direct Secure Access */}
                                    <div className="rounded-2xl border border-slate-600/50 bg-slate-950/40 p-5">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-800/60">
                                                <svg className="h-4 w-4 text-slate-200/90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-base font-semibold text-white">Direct Secure Access</p>
                                                <p className="text-xs text-slate-400 mt-1">Immediate access, no refund</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-amber-200/70 mb-3">
                                            Higher risk - known providers only
                                        </p>
                                        <button className="w-full px-3 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-200 hover:border-slate-400 hover:text-white transition-colors">
                                            Direct Secure Access
                                        </button>
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Redoubt holds payment in escrow and releases to provider only after buyer confirmation or window expiry.
                                </p>

                                {escrowActive && (
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                                        <div className="flex items-center justify-between text-sm text-amber-200 mb-3">
                                            <span className="font-semibold">Escrow Active - 23:47:12 remaining</span>
                                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                        </div>
                                        <div className="grid gap-2">
                                            <button className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-semibold text-white">
                                                Confirm & Release Payment
                                            </button>
                                            <button className="w-full rounded-lg border border-rose-500/60 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/10">
                                                Dispute & Refund
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-slate-500">
                                Provider identity remains shielded; communication is routed through the platform.
                            </div>
                        </div>
                    </div>

                    {requestStatus === 'REQUEST_APPROVED' && (
                                <div className="bg-slate-900/60 border border-green-500/30 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-green-200 mb-3">
                                <span className="w-2 h-2 rounded-full bg-green-300" />
                                <span className="font-semibold">Access granted view</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="text-white font-semibold">Access modes</h4>
                                    <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                                        <li>Preview-only access</li>
                                        <li>Limited records access</li>
                                        <li>API-limited access</li>
                                        <li>Full secure access (upon approval)</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-white font-semibold">Allowed usage scope</h4>
                                    <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                                        {dataset.access.allowedUsage.map(item => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                    <div className="text-sm text-slate-300 mt-2">
                                        <div><span className="text-slate-500">Expiration:</span> {dataset.access.expiration}</div>
                                        <div><span className="text-slate-500">Usage limits:</span> {dataset.access.usageLimits}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-slate-400">
                                Identity is disclosed only with your consent. Access is granted based on trust, compliance, and intended usage.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
<div
                         className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-transform duration-100 active:scale-95"
                         onClick={() => setShowRequestModal(false)}
                     />
                    <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Request Access</h3>
                                <p className="text-slate-400 text-sm">
                                    Share intended use to route approval. Provider identity remains private.
                                </p>
                            </div>
                            <button
                                className="text-slate-500 hover:text-white"
                                onClick={() => setShowRequestModal(false)}
                                aria-label="Close request modal"
                            >
                                X
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Organization / affiliation (optional)</label>
                                <select
                                    value={orgType}
                                    onChange={(e) => setOrgType(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="research">Research / academic</option>
                                    <option value="enterprise">Enterprise / corporate</option>
                                    <option value="startup">Startup / product team</option>
                                    <option value="public">Public sector / NGO</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Intended usage</label>
                                <textarea
                                    value={intendedUsage}
                                    onChange={(e) => setIntendedUsage(e.target.value)}
                                    rows={4}
                                    placeholder="Summarize the workflows, models, or analysis you plan to run (no identities)."
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Estimated usage scale</label>
                                <select
                                    value={usageScale}
                                    onChange={(e) => setUsageScale(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="low">Low (evaluation / POC)</option>
                                    <option value="medium">Medium (team workflows)</option>
                                    <option value="high">High (production workloads)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Duration needed</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="30 days">30 days</option>
                                    <option value="90 days">90 days</option>
                                    <option value="6 months">6 months</option>
                                    <option value="12 months">12 months</option>
                                    <option value="ongoing">Ongoing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Affiliation (optional but encouraged)</label>
                                <input
                                    value={affiliation}
                                    onChange={(e) => setAffiliation(e.target.value)}
                                    placeholder="Team, company, or lab name"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <label className="flex items-start gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={complianceChecked}
                                    onChange={() => setComplianceChecked(prev => !prev)}
                                />
                                <span>Access is granted based on trust, compliance, and intended usage. I acknowledge platform policies.</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500"
                                onClick={() => setShowRequestModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                                onClick={handleSubmitRequest}
                                disabled={!complianceChecked || !intendedUsage}
                            >
                                Submit secure request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

