import { Link } from 'react-router-dom'
import type { RequestStatus } from '../../data/datasetDetailData'
import type { RightsQuote } from '../../domain/rightsQuoteBuilder'
import DatasetDetailPanel from './DatasetDetailPanel'

type DatasetRequestStatusPanelProps = {
    datasetId: string
    requestStatus: RequestStatus
    statusSteps: ReadonlyArray<{
        id: RequestStatus
        title: string
        description: string
    }>
    requestSectionDescription: string
    minimumTrustNeedsReview: boolean
    minimumTrustLabel: string
    requestEntryLabel: string
    onOpenRequestModal: () => void
    onOpenRiskAssessment: () => void
    onApplyPassportAndRequest: () => void
    onApplyQuoteAndRequest: () => void
    compliancePassportId: string
    compliancePassportCompletionPercent: number
    passportStatus: {
        label: string
        detail: string
        classes: string
    }
    latestSavedQuote: RightsQuote | null
}

const quoteExpiryFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
})

const getRequestStatusClasses = (requestStatus: RequestStatus) => {
    if (requestStatus === 'REQUEST_APPROVED') {
        return 'bg-green-500/15 border-green-400 text-green-200'
    }
    if (requestStatus === 'REVIEW_IN_PROGRESS') {
        return 'bg-yellow-500/15 border-yellow-400 text-yellow-200'
    }
    return 'bg-red-500/15 border-red-400 text-red-200'
}

const getRequestStatusDetail = (requestStatus: RequestStatus) => {
    if (requestStatus === 'REQUEST_APPROVED') {
        return 'Access configured. Review scope, quote posture, and settlement controls before widening usage.'
    }
    if (requestStatus === 'REVIEW_IN_PROGRESS') {
        return 'We received your request. A reviewer will follow up with controls, scope, and delivery steps.'
    }
    return 'Request declined. We can suggest alternate sources or share summary stats.'
}

export default function DatasetRequestStatusPanel({
    datasetId,
    requestStatus,
    statusSteps,
    requestSectionDescription,
    minimumTrustNeedsReview,
    minimumTrustLabel,
    requestEntryLabel,
    onOpenRequestModal,
    onOpenRiskAssessment,
    onApplyPassportAndRequest,
    onApplyQuoteAndRequest,
    compliancePassportId,
    compliancePassportCompletionPercent,
    passportStatus,
    latestSavedQuote
}: DatasetRequestStatusPanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Request control"
            title="Request, progress, and settlement"
            description="Move from review request into rights packaging, governed checkout, and escrow-backed validation without leaving the dataset surface."
        >
            <div className="space-y-4">
                <div className="rounded-md border border-slate-800 bg-slate-950/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-400">Current status</div>
                        <span className={`rounded-sm border px-3 py-1 text-xs ${getRequestStatusClasses(requestStatus)}`}>
                            {requestStatus === 'REQUEST_APPROVED'
                                ? 'Approved'
                                : requestStatus === 'REVIEW_IN_PROGRESS'
                                  ? 'Pending review'
                                  : 'Rejected'}
                        </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{getRequestStatusDetail(requestStatus)}</p>
                </div>

                <div className="rounded-md border border-slate-800 bg-slate-950/45 p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Request entry</div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{requestSectionDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={onOpenRequestModal}
                            className={`rounded-sm px-4 py-2.5 text-sm font-semibold ${
                                minimumTrustNeedsReview
                                    ? 'border border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/20'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {requestEntryLabel}
                        </button>
                        <Link
                            to={`/datasets/${datasetId}/rights-quote`}
                            className="rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                        >
                            Build Rights Quote
                        </Link>
                        <Link
                            to={`/datasets/${datasetId}/escrow-checkout`}
                            state={latestSavedQuote ? { quoteId: latestSavedQuote.id } : undefined}
                            className="rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
                        >
                            Escrow-Native Checkout
                        </Link>
                    </div>

                    <div
                        className={`mt-4 rounded-sm border px-4 py-3 text-xs ${
                            minimumTrustNeedsReview
                                ? 'border-amber-400/25 bg-amber-500/8 text-amber-100'
                                : 'border-cyan-400/20 bg-cyan-500/8 text-cyan-100'
                        }`}
                    >
                        {minimumTrustNeedsReview
                            ? `${minimumTrustLabel} before live access can be approved. The request stays open, but it routes to review-first handling.`
                            : 'Minimum trust fields are documented in the current demo packet, but access still follows provider review and configured controls.'}
                    </div>
                </div>

                <div className="grid gap-2">
                    {statusSteps.map(step => {
                        const isActive = step.id === requestStatus

                        return (
                            <div
                                key={step.id}
                                className={`rounded-sm border p-3 ${
                                    isActive
                                        ? 'border-blue-400/50 bg-blue-500/10'
                                        : 'border-slate-800 bg-slate-950/55'
                                }`}
                            >
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-white">{step.title}</span>
                                    <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`} />
                                </div>
                                <p className="text-sm leading-6 text-slate-400">{step.description}</p>
                            </div>
                        )
                    })}
                </div>

                <div className="rounded-md border border-cyan-500/30 bg-cyan-500/5 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-4 w-4 text-cyan-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                        </svg>
                        <div className="min-w-0">
                            <div className="font-semibold text-white">Audit visibility active</div>
                            <div className="mt-1 text-xs leading-5 text-slate-400">
                                Shown as review context in this demo and may still require reviewer confirmation.
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-sm border border-cyan-500/30 bg-slate-950/40 p-3">
                        <div className="text-sm font-semibold text-white">Risk Assessment Workspace</div>
                        <p className="mt-1 text-xs text-slate-300">
                            Detailed risk controls and review components now open in a dedicated page.
                        </p>
                        <button
                            onClick={onOpenRiskAssessment}
                            className="mt-3 rounded-sm border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                        >
                            Risk Assessment
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/8 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-white">Reusable Compliance Passport</div>
                                <div className="mt-1 text-xs text-slate-300">
                                    {compliancePassportId} · {compliancePassportCompletionPercent}% complete
                                </div>
                            </div>
                            <span className={`rounded-sm border px-2.5 py-1 text-[10px] font-semibold ${passportStatus.classes}`}>
                                {passportStatus.label}
                            </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-300">{passportStatus.detail}</p>
                        <p className="mt-3 text-[11px] leading-5 text-slate-400">
                            Passport reuse organizes declared review context. It does not grant access or legal approval.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={onApplyPassportAndRequest}
                                className="rounded-sm bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                            >
                                Use In Request
                            </button>
                            <Link
                                to="/compliance-passport"
                                className="rounded-sm border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-emerald-400/50 hover:bg-white/5"
                            >
                                Open Passport
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-md border border-cyan-500/30 bg-slate-950/55 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-white">Latest Rights Quote</div>
                                <div className="mt-1 text-xs text-slate-400">Commercial terms built from configurable usage rights.</div>
                            </div>
                            {latestSavedQuote ? (
                                <span className="rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-100">
                                    {latestSavedQuote.totalUsd.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        maximumFractionDigits: 0
                                    })}
                                </span>
                            ) : null}
                        </div>

                        {latestSavedQuote ? (
                            <>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {latestSavedQuote.rightsSummary.slice(0, 3).map(item => (
                                        <span key={item} className="rounded-sm border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-200">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-3 text-xs text-slate-400">
                                    Quote {latestSavedQuote.id} · Valid until {quoteExpiryFormatter.format(new Date(latestSavedQuote.expiresAt))}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={onApplyQuoteAndRequest}
                                        className="rounded-sm bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                                    >
                                        Use Quote In Request
                                    </button>
                                    <Link
                                        to={`/datasets/${datasetId}/rights-quote`}
                                        className="rounded-sm border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-cyan-400/50 hover:bg-white/5"
                                    >
                                        Refine Terms
                                    </Link>
                                </div>
                                <div className="mt-4 text-[11px] leading-5 text-slate-500">
                                    Quote terms describe licensed use in this demo. They do not prove ownership, lawful basis, or chain-of-title.
                                </div>
                                <div className="text-[11px] leading-5 text-slate-500">
                                    When you are ready to proceed, use the main <span className="font-semibold text-slate-300">Escrow-Native Checkout</span> action above so this quote is applied through the single checkout path.
                                </div>
                            </>
                        ) : (
                            <div className="mt-3">
                                <p className="text-xs text-slate-400">
                                    No terms saved yet. Build evaluation terms to turn delivery, usage, term, and exclusivity into a reusable package.
                                </p>
                                <Link
                                    to={`/datasets/${datasetId}/rights-quote`}
                                    className="mt-4 inline-flex rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    Build Evaluation Terms
                                </Link>
                                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                                    After terms are ready, continue from the main <span className="font-semibold text-slate-300">Escrow-Native Checkout</span> action above.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-xs text-slate-500">
                    Provider identity remains shielded; communication is routed through the platform.
                </div>
            </div>
        </DatasetDetailPanel>
    )
}
