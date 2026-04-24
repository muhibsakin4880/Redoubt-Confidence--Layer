import DatasetDetailPanel from './DatasetDetailPanel'

type GuardrailState = {
    allowed: boolean
    reason: string
}

type DatasetSecureAccessPanelProps = {
    escrowWindow: string
    onEscrowWindowChange: (value: string) => void
    escrowActive: boolean
    onActivateEscrow: () => void
    startEscrowGuardrail: GuardrailState
    releasePaymentGuardrail: GuardrailState
    disputeRefundGuardrail: GuardrailState
}

export default function DatasetSecureAccessPanel({
    escrowWindow,
    onEscrowWindowChange,
    escrowActive,
    onActivateEscrow,
    startEscrowGuardrail,
    releasePaymentGuardrail,
    disputeRefundGuardrail
}: DatasetSecureAccessPanelProps) {
    return (
        <DatasetDetailPanel
            title="Secure Access Options"
            badge={
                <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Access Options</span>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-md border border-emerald-500/25 bg-slate-950/60 p-4">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-sm border border-emerald-500/20 bg-emerald-500/10">
                                    <svg className="h-4 w-4 text-emerald-200/90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-base font-semibold text-white">Escrow Access</p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Payment held until you verify data quality
                                    </p>
                                </div>
                            </div>
                        </div>
                        <span className="mb-3 inline-flex items-center gap-1 rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                            <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.5L10 14.9 5.05 16.7l.95-5.5-4-3.9 5.53-.8L10 1.5z" />
                            </svg>
                            Recommended
                        </span>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-slate-500">
                                    Escrow window
                                </label>
                                <select
                                    value={escrowWindow}
                                    onChange={(event) => onEscrowWindowChange(event.target.value)}
                                    className="w-full rounded-sm border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                                >
                                    <option value="24 hours">24 hours</option>
                                    <option value="48 hours">48 hours (higher escrow hold)</option>
                                    <option value="72 hours">72 hours (largest escrow hold)</option>
                                </select>
                            </div>
                            <p className="text-xs text-slate-400">Full refund if unsatisfied</p>
                            <button
                                disabled={!startEscrowGuardrail.allowed}
                                className={`w-full rounded-sm px-3 py-2.5 text-sm font-semibold transition-colors transition-transform duration-100 active:scale-95 ${
                                    startEscrowGuardrail.allowed
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'cursor-not-allowed border border-slate-800 bg-slate-900/80 text-slate-500'
                                }`}
                                onClick={onActivateEscrow}
                            >
                                Put on Escrow
                            </button>
                            <p className={`text-[11px] ${startEscrowGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                {startEscrowGuardrail.allowed
                                    ? 'Escrow can be activated for this approved request.'
                                    : startEscrowGuardrail.reason}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-md border border-slate-700/70 bg-slate-950/40 p-4">
                        <div className="mb-3 flex items-start gap-3">
                            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-sm border border-slate-700 bg-slate-800/60">
                                <svg className="h-4 w-4 text-slate-200/90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <div>
                                <p className="text-base font-semibold text-white">Direct Secure Access</p>
                                <p className="mt-1 text-xs text-slate-400">Immediate access, no refund</p>
                            </div>
                        </div>
                        <p className="mb-3 text-xs text-amber-200/70">
                            Higher risk - known providers only
                        </p>
                        <button className="w-full rounded-sm border border-slate-600 px-3 py-2.5 text-sm text-slate-200 transition-colors hover:border-slate-400 hover:text-white">
                            Direct Secure Access
                        </button>
                    </div>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-500">
                    Redoubt holds payment in escrow and releases to provider only after evaluation org confirmation or window expiry.
                </p>

                {escrowActive ? (
                    <div className="rounded-sm border border-amber-500/30 bg-amber-500/10 p-4">
                        <div className="mb-3 flex items-center justify-between text-sm text-amber-200">
                            <span className="font-semibold">Escrow Active - 23:47:12 remaining</span>
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        </div>
                        <div className="grid gap-2">
                            <button
                                disabled={!releasePaymentGuardrail.allowed}
                                className={`w-full rounded-sm px-3 py-2 text-sm font-semibold transition-colors ${
                                    releasePaymentGuardrail.allowed
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                        : 'cursor-not-allowed border border-slate-800 bg-slate-900/80 text-slate-500'
                                }`}
                            >
                                Confirm & Release Payment
                            </button>
                            <p className={`text-[11px] ${releasePaymentGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                {releasePaymentGuardrail.allowed
                                    ? 'Payment release is currently permitted by lifecycle policy.'
                                    : releasePaymentGuardrail.reason}
                            </p>
                            <button
                                disabled={!disputeRefundGuardrail.allowed}
                                className={`w-full rounded-sm px-3 py-2 text-sm font-semibold transition-colors ${
                                    disputeRefundGuardrail.allowed
                                        ? 'border border-rose-500/60 text-rose-200 hover:bg-rose-500/10'
                                        : 'cursor-not-allowed border border-slate-800 bg-slate-900/80 text-slate-500'
                                }`}
                            >
                                Dispute & Refund
                            </button>
                            <p className={`text-[11px] ${disputeRefundGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                {disputeRefundGuardrail.allowed
                                    ? 'Dispute remains available until escrow is settled.'
                                    : disputeRefundGuardrail.reason}
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>
        </DatasetDetailPanel>
    )
}
