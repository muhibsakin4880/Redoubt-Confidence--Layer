import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import { DATASET_DETAILS, getDatasetDetailById } from '../data/datasetDetailData'
import DealProgressTracker from '../components/DealProgressTracker'
import { buildCompliancePassport, passportStatusMeta } from '../domain/compliancePassport'
import { buildDealProgressModel } from '../domain/dealProgress'
import {
    buildEscrowCheckoutRecord,
    buildEscrowDueUseAgreement,
    checkoutAccessModeMeta,
    confirmOutcomeValidation,
    describeCheckoutPaymentMethod,
    getPlannedCredentialScopes,
    getOutcomeEvaluationFee,
    getPlannedWorkspaceLaunchPath,
    getPlannedWorkspaceName,
    getRecommendedCheckoutConfig,
    issueEscrowScopedCredentials,
    loadEscrowCheckoutByQuoteId,
    outcomeStageMeta,
    paymentMethodMeta,
    provisionEscrowWorkspace,
    releaseEscrowToProvider,
    reviewWindowOptions,
    runOutcomeProtectionEngine,
    saveEscrowCheckout,
    type EscrowCheckoutConfig,
    type EscrowCheckoutRecord,
    type EscrowCheckoutAccessMode,
    type EscrowPaymentMethod,
    type EscrowReviewWindowHours
} from '../domain/escrowCheckout'
import {
    buildRightsQuote,
    formatUsd,
    getDefaultRightsQuoteForm,
    loadRightsQuotes
} from '../domain/rightsQuoteBuilder'

type EscrowCheckoutLocationState = {
    quoteId?: string
} | null

export default function EscrowCheckoutPage() {
    const { id } = useParams()
    const location = useLocation()
    const routeDataset = getDatasetDetailById(id)
    const dataset = routeDataset ?? Object.values(DATASET_DETAILS)[0]
    const passport = useMemo(() => buildCompliancePassport(), [])
    const passportStatus = passportStatusMeta(passport.status)
    const savedQuotes = useMemo(() => loadRightsQuotes(dataset.id), [dataset.id])
    const fallbackQuote = useMemo(
        () => buildRightsQuote(dataset, getDefaultRightsQuoteForm(passport), passport),
        [dataset, passport]
    )
    const availableQuotes = savedQuotes.length > 0 ? savedQuotes : [fallbackQuote]
    const requestedQuoteId = (location.state as EscrowCheckoutLocationState)?.quoteId
    const [selectedQuoteId, setSelectedQuoteId] = useState<string>(
        () =>
            availableQuotes.find(quote => quote.id === requestedQuoteId)?.id ??
            availableQuotes[0]?.id ??
            fallbackQuote.id
    )
    const [recordVersion, setRecordVersion] = useState(0)
    const selectedQuote =
        availableQuotes.find(quote => quote.id === selectedQuoteId) ??
        availableQuotes[0] ??
        fallbackQuote
    const persistedCheckout = useMemo(
        () => loadEscrowCheckoutByQuoteId(selectedQuote.id),
        [selectedQuote.id, recordVersion]
    )
    const [checkoutRecord, setCheckoutRecord] = useState<EscrowCheckoutRecord | null>(persistedCheckout)
    const [config, setConfig] = useState<EscrowCheckoutConfig>(() =>
        persistedCheckout ? persistedCheckout.configuration : getRecommendedCheckoutConfig(selectedQuote)
    )
    const [duaAccepted, setDuaAccepted] = useState(Boolean(persistedCheckout?.dua.accepted))
    const [notice, setNotice] = useState<string | null>(
        savedQuotes.length === 0 ? 'No saved terms were found for this dataset, so evaluation is using a terms package generated from your passport defaults.' : null
    )

    useEffect(() => {
        if (!availableQuotes.some(quote => quote.id === selectedQuoteId)) {
            setSelectedQuoteId(availableQuotes[0]?.id ?? fallbackQuote.id)
        }
    }, [availableQuotes, fallbackQuote.id, selectedQuoteId])

    useEffect(() => {
        setCheckoutRecord(persistedCheckout)
        if (persistedCheckout) {
            setConfig(persistedCheckout.configuration)
            setDuaAccepted(Boolean(persistedCheckout.dua.accepted))
            if (!checkoutRecord || checkoutRecord.id !== persistedCheckout.id) {
                setNotice(`Escrow evaluation ${persistedCheckout.escrowId} is already in progress for these terms.`)
            }
            return
        }

        setConfig(getRecommendedCheckoutConfig(selectedQuote))
        setDuaAccepted(false)
        setNotice(
            savedQuotes.length === 0
                ? 'No saved terms were found for this dataset, so evaluation is using a terms package generated from your passport defaults.'
                : null
        )
    }, [checkoutRecord, persistedCheckout, savedQuotes.length, selectedQuote])

    const duaPreview = useMemo(
        () => buildEscrowDueUseAgreement(dataset, selectedQuote, passport, config),
        [config, dataset, passport, selectedQuote]
    )
    const plannedScopes = useMemo(
        () => getPlannedCredentialScopes(selectedQuote, config.accessMode),
        [config.accessMode, selectedQuote]
    )
    const dealProgress = useMemo(
        () =>
            buildDealProgressModel({
                passport,
                quote: selectedQuote,
                checkoutRecord
            }),
        [checkoutRecord, passport, selectedQuote]
    )
    const configurationLocked = checkoutRecord !== null
    const acceptedForFunding = checkoutRecord ? checkoutRecord.dua.accepted : duaAccepted
    const workspaceReady = checkoutRecord?.workspace.status === 'ready'
    const credentialsIssued = checkoutRecord?.credentials.status === 'issued'
    const outcomeStage = checkoutRecord?.outcomeProtection.stage ?? 'evaluation_pending'
    const outcomeStatus = outcomeStageMeta[outcomeStage]
    const evaluationFeeUsd = checkoutRecord?.outcomeProtection.evaluationFeeUsd ?? getOutcomeEvaluationFee(selectedQuote)
    const outcomeValidation = checkoutRecord?.outcomeProtection.validation ?? {
        status: 'pending' as const,
        issueTypes: [] as EscrowCheckoutRecord['outcomeProtection']['validation']['issueTypes'],
        note: undefined,
        updatedAt: undefined
    }
    const outcomeEngine: EscrowCheckoutRecord['outcomeProtection']['engine'] = checkoutRecord?.outcomeProtection.engine ?? {
        status: 'not_started',
        summary: 'Outcome engine will run automatically once scoped credentials activate the evaluation workspace.',
        findings: []
    }
    const outcomeCredits = checkoutRecord?.outcomeProtection.credits ?? {
        status: 'none',
        amountUsd: 0,
        reason: undefined,
        issuedAt: undefined
    }

    useEffect(() => {
        if (!checkoutRecord || checkoutRecord.credentials.status !== 'issued') return
        if (checkoutRecord.outcomeProtection.engine.status !== 'not_started') return

        const nextRecord = runOutcomeProtectionEngine(checkoutRecord, dataset, selectedQuote)
        saveRecord(
            nextRecord,
            nextRecord.outcomeProtection.engine.status === 'failed'
                ? `${nextRecord.outcomeProtection.engine.summary} ${formatUsd(nextRecord.outcomeProtection.credits.amountUsd)} automatic credit applied and provider payout remains frozen.`
                : `${nextRecord.outcomeProtection.engine.summary} Buyer confirmation is now required before escrow release.`
        )
    }, [checkoutRecord, dataset, selectedQuote])

    const updateConfig = <T extends keyof EscrowCheckoutConfig>(field: T, value: EscrowCheckoutConfig[T]) => {
        if (configurationLocked) return
        setConfig(current => ({ ...current, [field]: value }))
        if (field !== 'paymentMethod') {
            setDuaAccepted(false)
        }
        setNotice(null)
    }

    const saveRecord = (nextRecord: EscrowCheckoutRecord, nextNotice: string) => {
        saveEscrowCheckout(nextRecord)
        setCheckoutRecord(nextRecord)
        setRecordVersion(current => current + 1)
        setNotice(nextNotice)
    }

    if (!routeDataset) {
        return (
            <DatasetUnavailableState
                contextLabel="Escrow Evaluation"
                detail="This escrow-setup route does not point to a known dataset. Return to Dataset Discovery and reopen the dataset before continuing into evaluation setup."
            />
        )
    }

    const handleFundEscrow = () => {
        if (!duaAccepted) return
        const nextRecord = buildEscrowCheckoutRecord(dataset, selectedQuote, passport, config)
        saveRecord(
            nextRecord,
            `${nextRecord.escrowId} funded via ${describeCheckoutPaymentMethod(config.paymentMethod)}. DUA ${nextRecord.dua.version} has been accepted and escrow is now holding ${formatUsd(nextRecord.funding.escrowHoldUsd)}.`
        )
    }

    const handleProvisionWorkspace = () => {
        if (!checkoutRecord || workspaceReady) return
        const nextRecord = provisionEscrowWorkspace(checkoutRecord)
        saveRecord(
            nextRecord,
            `${nextRecord.workspace.workspaceName} is provisioned and ready for governed access.`
        )
    }

    const handleIssueCredentials = () => {
        if (!checkoutRecord || !workspaceReady || credentialsIssued) return
        const nextRecord = issueEscrowScopedCredentials(checkoutRecord)
        saveRecord(
            nextRecord,
            `Scoped credentials ${nextRecord.credentials.credentialId} were issued with ${nextRecord.credentials.tokenTtlMinutes}-minute TTL enforcement.`
        )
    }

    const handleConfirmOutcome = () => {
        if (!checkoutRecord || !credentialsIssued) return
        const nextRecord = confirmOutcomeValidation(
            checkoutRecord,
            'Buyer confirmed that schema and freshness commitments match the contracted deal.'
        )
        saveRecord(
            nextRecord,
            'Buyer validation is complete. Escrow has moved to release-pending status.'
        )
    }

    const handleReleaseEscrow = () => {
        if (!checkoutRecord || checkoutRecord.lifecycleState !== 'RELEASE_PENDING') return
        const nextRecord = releaseEscrowToProvider(checkoutRecord)
        saveRecord(
            nextRecord,
            'Buyer validation passed and escrow has been released to the provider.'
        )
    }

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_50%_84%,rgba(59,130,246,0.10),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link to="/datasets" className="hover:text-white transition-colors">Datasets</Link>
                    <span>/</span>
                    <Link to={`/datasets/${dataset.id}`} className="hover:text-white transition-colors">{dataset.title}</Link>
                    <span>/</span>
                    <span className="text-slate-200">Protected Evaluation Setup</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Protected Evaluation Setup
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Evaluation Setup</h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            This setup turns the evaluation into a governed engagement: it funds escrow, generates the DUA,
                            chooses access mode, sets the review window, provisions the workspace, and issues scoped credentials. Metadata review and terms creation are free; this is where the standard buyer-paid protected evaluation path begins.
                        </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${passportStatus.classes}`}>
                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                        Passport {passport.passportId} · {passportStatus.label}
                    </div>
                </header>

                <div className="mt-8">
                    <DealProgressTracker model={dealProgress} />
                </div>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Rights Package</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Evaluation is anchored to a configurable rights package rather than a flat dataset access.
                                    </p>
                                </div>
                                <Link
                                    to={`/datasets/${dataset.id}/rights-quote`}
                                    className="rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    Refine terms
                                </Link>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {availableQuotes.map(quote => {
                                    const isSelected = quote.id === selectedQuote.id
                                    return (
                                        <button
                                            key={quote.id}
                                            type="button"
                                            disabled={configurationLocked && quote.id !== selectedQuote.id}
                                            onClick={() => setSelectedQuoteId(quote.id)}
                                            className={`rounded-2xl border p-4 text-left transition-colors ${
                                                isSelected
                                                    ? 'border-cyan-400/50 bg-cyan-500/10'
                                                    : 'border-white/10 bg-slate-950/40 hover:border-slate-500/50'
                                            } ${configurationLocked && quote.id !== selectedQuote.id ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{quote.id}</div>
                                                    <div className="mt-1 text-xs text-slate-400">
                                                        {quote.rightsSummary.slice(0, 3).join(' · ')}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-cyan-100">{formatUsd(quote.totalUsd)}</div>
                                                    <div className="mt-1 text-[11px] text-slate-500">
                                                        Escrow hold {formatUsd(quote.escrowHoldUsd)}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Evaluation Configuration</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        These settings are frozen once escrow is funded and become part of the DUA.
                                    </p>
                                </div>
                                {configurationLocked && (
                                    <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                                        Locked after funding
                                    </span>
                                )}
                            </div>

                            <div className="mt-5 grid gap-6">
                                <div>
                                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Access mode</div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {(Object.entries(checkoutAccessModeMeta) as Array<[EscrowCheckoutAccessMode, typeof checkoutAccessModeMeta[EscrowCheckoutAccessMode]]>).map(([value, meta]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                disabled={configurationLocked}
                                                onClick={() => updateConfig('accessMode', value)}
                                                className={`rounded-2xl border p-4 text-left transition-colors ${
                                                    config.accessMode === value
                                                        ? 'border-cyan-400/60 bg-cyan-500/12 text-cyan-100'
                                                        : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-slate-500/50'
                                                } ${configurationLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                                            >
                                                <div className="text-sm font-semibold">{meta.label}</div>
                                                <div className="mt-2 text-xs text-slate-400">{meta.detail}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    <div>
                                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Review window</div>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {reviewWindowOptions.map(hours => (
                                                <button
                                                    key={hours}
                                                    type="button"
                                                    disabled={configurationLocked}
                                                    onClick={() => updateConfig('reviewWindowHours', hours as EscrowReviewWindowHours)}
                                                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                                                        config.reviewWindowHours === hours
                                                            ? 'border-emerald-400/60 bg-emerald-500/12 text-emerald-100'
                                                            : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-slate-500/50'
                                                    } ${configurationLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                                                >
                                                    <div className="text-sm font-semibold">{hours} hours</div>
                                                    <div className="mt-1 text-xs text-slate-400">Buyer validation before release.</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Funding rail</div>
                                        <div className="grid gap-3">
                                            {(Object.entries(paymentMethodMeta) as Array<[EscrowPaymentMethod, typeof paymentMethodMeta[EscrowPaymentMethod]]>).map(([value, meta]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    disabled={configurationLocked}
                                                    onClick={() => updateConfig('paymentMethod', value)}
                                                    className={`rounded-2xl border p-4 text-left transition-colors ${
                                                        config.paymentMethod === value
                                                            ? 'border-amber-400/60 bg-amber-500/12 text-amber-100'
                                                            : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-slate-500/50'
                                                    } ${configurationLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                                                >
                                                    <div className="text-sm font-semibold">{meta.label}</div>
                                                    <div className="mt-2 text-xs text-slate-400">{meta.detail}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Generated DUA</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        The agreement is assembled from the terms, passport, escrow window, and access path.
                                    </p>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300">
                                    {checkoutRecord?.dua.version ?? duaPreview.version}
                                </span>
                            </div>

                            <div className="mt-5 rounded-2xl border border-cyan-500/25 bg-cyan-500/8 p-4">
                                <div className="text-sm font-semibold text-white">{checkoutRecord?.dua.summary ?? duaPreview.summary}</div>
                                <div className="mt-2 text-xs text-slate-300">
                                    Checksum {(checkoutRecord?.dua.checksum ?? duaPreview.checksum)} · Generated{' '}
                                    {new Date(checkoutRecord?.dua.generatedAt ?? duaPreview.generatedAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {(checkoutRecord?.dua.clauses ?? duaPreview.clauses).map(clause => (
                                    <div key={clause} className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm text-slate-200">
                                        {clause}
                                    </div>
                                ))}
                            </div>

                            <label className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm ${
                                duaAccepted || checkoutRecord?.dua.accepted
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                                    : 'border-white/10 bg-slate-950/45 text-slate-200'
                            }`}>
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                                    disabled={configurationLocked}
                                    checked={checkoutRecord?.dua.accepted ?? duaAccepted}
                                    onChange={event => setDuaAccepted(event.target.checked)}
                                />
                                <span>
                                    I accept this DUA, including the escrow release conditions, non-redistribution obligations,
                                    and scoped credential controls.
                                </span>
                            </label>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                            <h2 className="text-xl font-semibold text-white">Provisioning & Credentials</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Funding escrow prepares the governed workspace; credential issuance activates live access.
                            </p>

                            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Workspace</div>
                                    <div className="mt-3 text-lg font-semibold text-white">
                                        {checkoutRecord?.workspace.workspaceName ?? getPlannedWorkspaceName(dataset, config.accessMode)}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-300">
                                        {checkoutRecord?.workspace.workspaceId ?? 'Will be provisioned after funding'}
                                    </div>
                                    <div className="mt-3 text-xs text-slate-400">
                                        Launch path {checkoutRecord?.workspace.launchPath ?? getPlannedWorkspaceLaunchPath(config.accessMode)}
                                    </div>
                                    <div className="mt-4">
                                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                            workspaceReady
                                                ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                                                : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                        }`}>
                                            {workspaceReady ? 'Provisioned' : 'Pending funding'}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Scoped credentials</div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(checkoutRecord?.credentials.scopes ?? plannedScopes).map(scope => (
                                            <span key={scope} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                                                {scope}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-xs text-slate-400">
                                        TTL {(checkoutRecord?.credentials.tokenTtlMinutes ?? (config.accessMode === 'encrypted_download' ? 90 : 180))} minutes
                                    </div>
                                    {checkoutRecord?.credentials.issuedAt && (
                                        <div className="mt-2 text-xs text-slate-400">
                                            Issued {new Date(checkoutRecord.credentials.issuedAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Outcome Protection</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Metadata preview is free, protected evaluation is paid by default, payout waits for evaluation org validation,
                                        and schema or freshness misses automatically create evaluation credits before any production handoff.
                                    </p>
                                </div>
                                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                                    {outcomeStatus.label}
                                </span>
                            </div>

                            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Free metadata preview</div>
                                    <div className="mt-3 text-lg font-semibold text-white">Included</div>
                                    <p className="mt-2 text-sm text-slate-300">
                                        Buyers can inspect confidence, freshness, schema metadata, and AI summaries before entering paid evaluation.
                                    </p>
                                    <Link
                                        to={`/datasets/${dataset.id}/quality-breakdown`}
                                        className="mt-4 inline-flex rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                    >
                                        Open Metadata Preview
                                    </Link>
                                </div>

                                <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Protected evaluation fee</div>
                                    <div className="mt-3 text-lg font-semibold text-white">{formatUsd(evaluationFeeUsd)}</div>
                                    <p className="mt-2 text-sm text-slate-300">
                                        Evaluation happens inside the governed workspace before escrow release, even when the later delivery path moves into production access.
                                    </p>
                                    <div className="mt-3 text-xs text-slate-400">{outcomeStatus.detail}</div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Committed outcome</div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <SummaryStat
                                        label="Schema version"
                                        value={checkoutRecord?.outcomeProtection.commitments.schemaVersion ?? duaPreview.checksum}
                                    />
                                    <SummaryStat
                                        label="Expected fields"
                                        value={String(checkoutRecord?.outcomeProtection.commitments.expectedFieldCount ?? dataset.preview.sampleSchema.length)}
                                    />
                                    <SummaryStat
                                        label="Freshness commitment"
                                        value={checkoutRecord?.outcomeProtection.commitments.freshnessCommitment ?? dataset.preview.freshnessLabel}
                                    />
                                    <SummaryStat
                                        label="Freshness floor"
                                        value={`${checkoutRecord?.outcomeProtection.commitments.confidenceFloor ?? Math.max(75, dataset.quality.freshnessScore - 3)}%`}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-white">Protection engine</div>
                                        <div className="mt-1 text-xs text-slate-400">
                                            Schema count and freshness commitments are checked automatically once the governed workspace is live.
                                        </div>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                        outcomeEngine.status === 'passed'
                                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                                            : outcomeEngine.status === 'failed'
                                                ? 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                                                : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                    }`}>
                                        {outcomeEngine.status === 'passed'
                                            ? 'Checks passed'
                                            : outcomeEngine.status === 'failed'
                                                ? 'Commitment miss'
                                                : 'Armed for evaluation'}
                                    </span>
                                </div>

                                {credentialsIssued ? (
                                    <div className="mt-4 space-y-4">
                                        <div className={`rounded-xl border px-4 py-3 text-sm ${
                                            outcomeEngine.status === 'failed'
                                                ? 'border-rose-500/25 bg-rose-500/10 text-rose-100'
                                                : outcomeEngine.status === 'passed'
                                                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100'
                                                    : 'border-white/8 bg-slate-900/60 text-slate-300'
                                        }`}>
                                            {outcomeEngine.summary}
                                        </div>

                                        {(outcomeEngine.actualFieldCount !== undefined || outcomeEngine.actualFreshnessScore !== undefined) && (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <SummaryStat
                                                    label="Observed fields"
                                                    value={String(outcomeEngine.actualFieldCount ?? 0)}
                                                />
                                                <SummaryStat
                                                    label="Observed freshness"
                                                    value={outcomeEngine.actualFreshnessScore !== undefined ? `${outcomeEngine.actualFreshnessScore}%` : 'Pending'}
                                                />
                                            </div>
                                        )}

                                        {outcomeEngine.findings.length > 0 && (
                                            <div className="grid gap-3">
                                                {outcomeEngine.findings.map(finding => (
                                                    <div key={finding} className="rounded-xl border border-white/8 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                                                        {finding}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {outcomeEngine.lastRunAt && (
                                            <div className="text-xs text-slate-500">
                                                Last engine run{' '}
                                                {new Date(outcomeEngine.lastRunAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-xl border border-white/8 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                                        The protection engine arms itself after scoped credentials are issued for protected evaluation.
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-white">Buyer validation gate</div>
                                        <div className="mt-1 text-xs text-slate-400">
                                            Escrow cannot release until the evaluating organization validates the contracted schema and freshness outcome.
                                        </div>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                        outcomeValidation.status === 'confirmed'
                                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                                            : outcomeValidation.status === 'issue_reported'
                                                ? 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                                                : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                    }`}>
                                        {outcomeValidation.status === 'confirmed'
                                            ? 'Validated'
                                            : outcomeValidation.status === 'issue_reported'
                                                ? 'Issue reported'
                                                : 'Awaiting evaluation org validation'}
                                    </span>
                                </div>

                                {credentialsIssued ? (
                                    <div className="mt-4 grid gap-3">
                                        {outcomeEngine.status === 'passed' && outcomeValidation.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={handleConfirmOutcome}
                                                className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
                                            >
                                                Confirm Buyer Validation
                                            </button>
                                        )}

                                        {outcomeEngine.status === 'not_started' && (
                                            <div className="rounded-xl border border-white/8 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                                                Protected evaluation is live. The engine is still completing its automatic schema and freshness scan.
                                            </div>
                                        )}

                                        {outcomeEngine.status === 'failed' && (
                                            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                                Buyer validation is locked because the protection engine already detected a committed outcome miss and issued automatic credits.
                                            </div>
                                        )}

                                        {outcomeValidation.note && (
                                            <div className="rounded-xl border border-white/8 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                                                {outcomeValidation.note}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-xl border border-white/8 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                                        Buyer validation controls unlock after the protected evaluation workspace is live.
                                    </div>
                                )}
                            </div>

                            {outcomeCredits.status === 'issued' && (
                                <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-white">Automatic credit issued</div>
                                            <div className="mt-1 text-xs text-rose-100/85">{outcomeCredits.reason}</div>
                                        </div>
                                        <div className="text-lg font-semibold text-rose-100">{formatUsd(outcomeCredits.amountUsd)}</div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/92 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Settlement Summary</div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">{formatUsd(selectedQuote.totalUsd)}</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <SummaryStat label="Escrow hold" value={formatUsd(selectedQuote.escrowHoldUsd)} />
                                <SummaryStat label="Evaluation fee" value={formatUsd(evaluationFeeUsd)} />
                                <SummaryStat label="Review window" value={`${config.reviewWindowHours} hours`} />
                                <SummaryStat label="Access mode" value={checkoutAccessModeMeta[config.accessMode].label} />
                                <SummaryStat label="Payment rail" value={paymentMethodMeta[config.paymentMethod].label} />
                            </div>

                            <div className="mt-4 grid gap-3">
                                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                    <span className="font-semibold text-white">Standard Path:</span> buyers are charged for protected evaluation here, and successful programs can move into downstream API or production access pricing.
                                </div>
                                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                                    <span className="font-semibold text-white">Pilot Cohort:</span> selected design partners may receive a fee-waived evaluation through Redoubt&apos;s LOI-backed early-access program. These requests still require feedback participation, commercial intent, a credible production pathway, and a guided team-assisted review with controlled disclosure.
                                </div>
                            </div>

                            {notice && (
                                <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                                    {notice}
                                </div>
                            )}

                            <div className="mt-5 space-y-3">
                                <StepRow
                                    label="DUA accepted"
                                    complete={checkoutRecord?.dua.accepted ?? duaAccepted}
                                    detail="The rights package, review window, and access controls are contract-ready."
                                />
                                <StepRow
                                    label="Escrow funded"
                                    complete={checkoutRecord !== null}
                                    detail="Funds are held before access activates."
                                />
                                <StepRow
                                    label="Workspace provisioned"
                                    complete={workspaceReady}
                                    detail="Governed workspace is created with the selected access path."
                                />
                                <StepRow
                                    label="Scoped credentials issued"
                                    complete={credentialsIssued}
                                    detail="Ephemeral credentials activate access with audit and TTL enforcement."
                                />
                                <StepRow
                                    label="Outcome engine run"
                                    complete={outcomeEngine.status !== 'not_started'}
                                    detail="Schema count and freshness commitments are checked automatically inside the workspace."
                                />
                                <StepRow
                                    label="Buyer validation"
                                    complete={outcomeValidation.status === 'confirmed' || outcomeCredits.status === 'issued'}
                                    detail="Buyer confirms a passing outcome or the platform resolves the miss with automatic credits."
                                />
                            </div>

                            <div className="mt-5 grid gap-3">
                                <button
                                    type="button"
                                    onClick={handleFundEscrow}
                                    disabled={checkoutRecord !== null || !acceptedForFunding}
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                        checkoutRecord !== null
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : !acceptedForFunding
                                                ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                                : 'bg-emerald-500 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-400'
                                    }`}
                                >
                                    {checkoutRecord ? 'Escrow Funded' : '1. Fund Escrow'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProvisionWorkspace}
                                    disabled={!checkoutRecord || workspaceReady}
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                        !checkoutRecord || workspaceReady
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : 'border border-cyan-400/45 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20'
                                    }`}
                                >
                                    {workspaceReady ? 'Workspace Ready' : '2. Provision Workspace'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleIssueCredentials}
                                    disabled={!checkoutRecord || !workspaceReady || credentialsIssued}
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                        !checkoutRecord || !workspaceReady || credentialsIssued
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : 'border border-amber-400/45 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
                                    }`}
                                >
                                    {credentialsIssued ? 'Credentials Issued' : '3. Issue Scoped Credentials'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReleaseEscrow}
                                    disabled={!checkoutRecord || checkoutRecord.lifecycleState !== 'RELEASE_PENDING'}
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                        !checkoutRecord || checkoutRecord.lifecycleState !== 'RELEASE_PENDING'
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : 'bg-white text-slate-950 hover:bg-slate-100'
                                    }`}
                                >
                                    {checkoutRecord?.lifecycleState === 'RELEASED_TO_PROVIDER'
                                        ? 'Escrow Released'
                                        : '4. Release Escrow'}
                                </button>
                            </div>

                            {checkoutRecord?.credentials.expiresAt && (
                                <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                    <div className="text-sm font-semibold text-white">Access is now live</div>
                                    <div className="mt-2 text-xs text-emerald-100/85">
                                        {checkoutRecord.credentials.credentialId} expires{' '}
                                        {new Date(checkoutRecord.credentials.expiresAt).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div className="mt-4 grid gap-3">
                                        <Link
                                            to={checkoutRecord.workspace.launchPath}
                                            className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-slate-100"
                                        >
                                            Launch Governed Workspace
                                        </Link>
                                        <Link
                                            to="/escrow-center"
                                            className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white hover:border-emerald-400/40 hover:bg-white/5"
                                        >
                                            Open Escrow Center
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </section>
                    </aside>
                </section>
            </div>
        </div>
    )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm font-semibold text-slate-100">{value}</div>
        </div>
    )
}

function StepRow({
    label,
    complete,
    detail
}: {
    label: string
    complete: boolean
    detail: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">{label}</div>
                <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                        complete
                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                            : 'border-slate-600 bg-slate-800 text-slate-300'
                    }`}
                >
                    {complete ? 'Done' : 'Pending'}
                </span>
            </div>
            <div className="mt-2 text-xs text-slate-400">{detail}</div>
        </div>
    )
}
