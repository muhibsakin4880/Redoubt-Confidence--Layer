import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ResponsibilityNotice } from '../components/trust/TrustLayer'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import DealProgressTracker from '../components/DealProgressTracker'
import { DATASET_DETAILS, getDatasetDetailById } from '../data/datasetDetailData'
import { buildCompliancePassport, passportStatusMeta } from '../domain/compliancePassport'
import { buildDealProgressModel } from '../domain/dealProgress'
import { loadEscrowCheckoutByQuoteId } from '../domain/escrowCheckout'
import {
    buildRightsQuote,
    buildRightsUsageGuidance,
    deliveryModeOptions,
    durationOptions,
    exclusivityOptions,
    fieldPackOptions,
    formatUsd,
    geographyOptions,
    getDefaultRightsQuoteForm,
    loadRightsQuotes,
    saveRightsQuote,
    seatBandOptions,
    supportOptions,
    usageRightOptions,
    type QuoteDeliveryMode,
    type QuoteDuration,
    type QuoteExclusivity,
    type QuoteFieldPack,
    type QuoteGeography,
    type QuoteSupport,
    type QuoteUsageRight,
    type RightsQuoteForm
} from '../domain/rightsQuoteBuilder'

const AdvancedConditionsDrawer = ({
    isOpen,
    onClose,
    form,
    updateForm
}: {
    isOpen: boolean
    onClose: () => void
    form: RightsQuoteForm
    updateForm: <T extends keyof RightsQuoteForm>(field: T, value: RightsQuoteForm[T]) => void
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto">
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Advanced Rights & Conditions</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Legal & Governance Controls</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <div className="text-sm font-medium text-white mb-3">Redistribution Rights</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'allowed', label: 'Allowed' },
                                { value: 'not_allowed', label: 'Not Allowed' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => updateForm('redistributionRights', option.value as 'allowed' | 'not_allowed')}
                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                        form.redistributionRights === option.value
                                            ? 'border-purple-500/60 bg-purple-500/10 text-purple-100'
                                            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-white mb-3">Audit Logging Requirement</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'mandatory', label: 'Mandatory' },
                                { value: 'optional', label: 'Optional' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => updateForm('auditLoggingRequirement', option.value as 'mandatory' | 'optional')}
                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                        form.auditLoggingRequirement === option.value
                                            ? 'border-purple-500/60 bg-purple-500/10 text-purple-100'
                                            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-white mb-3">Attribution Requirement</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'required', label: 'Required' },
                                { value: 'not_required', label: 'Not Required' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => updateForm('attributionRequirement', option.value as 'required' | 'not_required')}
                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                        form.attributionRequirement === option.value
                                            ? 'border-purple-500/60 bg-purple-500/10 text-purple-100'
                                            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-700 pt-6">
                        <div className="text-sm font-medium text-white mb-4">Data Volume Scaling</div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Enable volume-based pricing</span>
                                <button
                                    type="button"
                                    aria-pressed={form.volumeBasedPricing}
                                    onClick={() => updateForm('volumeBasedPricing', !form.volumeBasedPricing)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                        form.volumeBasedPricing
                                            ? 'bg-purple-500 ring-1 ring-purple-300/40'
                                            : 'bg-slate-700 ring-1 ring-slate-500/60'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                            form.volumeBasedPricing ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {form.volumeBasedPricing && (
                                <div className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1.5 block">Base price adjustment</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={form.volumePricingAdjustment}
                                                onChange={(e) => updateForm('volumePricingAdjustment', parseFloat(e.target.value) || 0)}
                                                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                                placeholder="0"
                                            />
                                            <select
                                                value={form.volumePricingUnit}
                                                onChange={(e) => updateForm('volumePricingUnit', e.target.value as 'tb' | 'million_records')}
                                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                            >
                                                <option value="tb">per TB</option>
                                                <option value="million_records">per million records</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function RightsQuoteBuilderPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const routeDataset = getDatasetDetailById(id)
    const dataset = routeDataset ?? Object.values(DATASET_DETAILS)[0]
    const passport = useMemo(() => buildCompliancePassport(), [])
    const [form, setForm] = useState<RightsQuoteForm>(() => getDefaultRightsQuoteForm(passport))
    const [notice, setNotice] = useState<string | null>(null)
    const [quoteVersion, setQuoteVersion] = useState(0)
    const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false)
    const statusMeta = passportStatusMeta(passport.status)

    const quote = useMemo(() => buildRightsQuote(dataset, form, passport), [dataset, form, passport, quoteVersion])
    const usageGuidance = useMemo(() => buildRightsUsageGuidance(dataset, quote), [dataset, quote])
    const savedQuotes = useMemo(() => loadRightsQuotes(dataset.id), [dataset.id, quoteVersion])
    const persistedCheckout = useMemo(() => loadEscrowCheckoutByQuoteId(quote.id), [quote.id, quoteVersion])
    const dealProgress = useMemo(
        () =>
            buildDealProgressModel({
                passport,
                quote,
                checkoutRecord: persistedCheckout
            }),
        [passport, persistedCheckout, quote]
    )

    const updateForm = <T extends keyof RightsQuoteForm>(field: T, value: RightsQuoteForm[T]) => {
        setForm(current => ({ ...current, [field]: value }))
        setNotice(null)
    }

    const persistQuote = () => {
        const savedQuote = buildRightsQuote(dataset, form, passport)
        saveRightsQuote(savedQuote)
        setQuoteVersion(current => current + 1)
        return savedQuote
    }

    const handleSaveQuote = () => {
        const savedQuote = persistQuote()
        setNotice(`Terms ${savedQuote.id} saved. Valid until ${new Date(savedQuote.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`)
    }

    const handleProceedToCheckout = () => {
        const savedQuote = persistQuote()
        navigate(`/datasets/${dataset.id}/escrow-checkout`, {
            state: {
                quoteId: savedQuote.id
            }
        })
    }

    if (!routeDataset) {
        return (
            <DatasetUnavailableState
                contextLabel="Evaluation Terms"
                detail="Redoubt could not locate the dataset tied to this evaluation-terms route. Return to Dataset Discovery and reopen the dataset from the matched results list."
            />
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_78%_0%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_48%_80%,rgba(16,185,129,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link to="/datasets" className="hover:text-white transition-colors">Datasets</Link>
                    <span>/</span>
                    <Link to={`/datasets/${dataset.id}`} className="hover:text-white transition-colors">{dataset.title}</Link>
                    <span>/</span>
                    <span className="text-slate-200">Evaluation Terms</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Evaluation Terms Builder
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Configure Evaluation Terms</h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            This builder defines the evaluation terms: delivery mode, field access,
                            usage rights, exclusivity, geography, term, and support expectations. Creating and saving terms is free; evaluation fees begin only when protected evaluation starts.
                        </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusMeta.classes}`}>
                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                        Passport {passport.passportId} · {statusMeta.label}
                    </div>
                </header>

                <div className="mt-8">
                    <DealProgressTracker model={dealProgress} compact />
                </div>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-cyan-500/25 bg-cyan-500/8 p-5 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Reusable compliance passport applied</h2>
                                    <p className="mt-1 text-sm text-slate-200/80">
                                        Pricing and reviewer readiness reflect reusable identity, legal, and verification context from your passport.
                                    </p>
                                    <p className="mt-3 text-xs leading-5 text-cyan-50/75">
                                        Passport reuse helps organize review context in this demo. It does not grant legal approval or guaranteed access.
                                    </p>
                                </div>
                                <Link
                                    to="/compliance-passport"
                                    className="rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    Open passport
                                </Link>
                            </div>
                        </div>

                        <BuilderSection
                            title="Delivery Mode"
                            description="How the dataset is delivered has the biggest impact on price and risk."
                        >
                            <OptionGrid
                                options={deliveryModeOptions}
                                value={form.deliveryMode}
                                onChange={(value) => updateForm('deliveryMode', value as QuoteDeliveryMode)}
                            />
                        </BuilderSection>

                        <BuilderSection
                            title="Field Access"
                            description="Price expands as the permitted schema gets broader and more sensitive."
                        >
                            <OptionGrid
                                options={fieldPackOptions}
                                value={form.fieldPack}
                                onChange={(value) => updateForm('fieldPack', value as QuoteFieldPack)}
                            />
                        </BuilderSection>

                        <BuilderSection
                            title="Usage Rights"
                            description="Rights terms have more impact than raw volume in regulated data evaluations."
                        >
                            <OptionGrid
                                options={usageRightOptions}
                                value={form.usageRight}
                                onChange={(value) => updateForm('usageRight', value as QuoteUsageRight)}
                            />
                        </BuilderSection>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <BuilderSection title="Term" description="Longer rights windows compound total value.">
                                <OptionGrid
                                    compact
                                    options={durationOptions}
                                    value={form.duration}
                                    onChange={(value) => updateForm('duration', value as QuoteDuration)}
                                />
                            </BuilderSection>

                            <BuilderSection title="Geography" description="Broader territorial rights increase deal value and review scope.">
                                <OptionGrid
                                    compact
                                    options={geographyOptions}
                                    value={form.geography}
                                    onChange={(value) => updateForm('geography', value as QuoteGeography)}
                                />
                            </BuilderSection>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <BuilderSection title="Exclusivity" description="Exclusivity is priced separately because it constrains future supply.">
                                <OptionGrid
                                    compact
                                    options={exclusivityOptions}
                                    value={form.exclusivity}
                                    onChange={(value) => updateForm('exclusivity', value as QuoteExclusivity)}
                                />
                            </BuilderSection>

                            <BuilderSection title="Support Tier" description="Standard support is included. Priority and mission-critical support are usually tied to annual or enterprise evaluation agreements.">
                                <OptionGrid
                                    compact
                                    options={supportOptions}
                                    value={form.support}
                                    onChange={(value) => updateForm('support', value as QuoteSupport)}
                                />
                            </BuilderSection>
                        </div>

                        <BuilderSection
                            title="Team Scope & Validation Window"
                            description="These settings shape evaluation and escrow behavior."
                        >
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div>
                                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Seat band</div>
                                    <OptionGrid
                                        compact
                                        options={seatBandOptions}
                                        value={form.seatBand}
                                        onChange={(value) => updateForm('seatBand', value as RightsQuoteForm['seatBand'])}
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Validation window</div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {[24, 48, 72].map(hours => (
                                            <button
                                                key={hours}
                                                type="button"
                                                onClick={() => updateForm('validationWindowHours', hours as RightsQuoteForm['validationWindowHours'])}
                                                className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                                                    form.validationWindowHours === hours
                                                        ? 'border-cyan-400/60 bg-cyan-500/12 text-cyan-100'
                                                        : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-slate-500/50'
                                                }`}
                                            >
                                                <div className="text-sm font-semibold">{hours} hours</div>
                                                <div className="mt-1 text-xs text-slate-400">Buyer verification period before release.</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </BuilderSection>

                        <button
                            onClick={() => setShowAdvancedDrawer(true)}
                            className="w-full rounded-2xl border border-purple-500/30 bg-purple-500/5 px-5 py-4 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-purple-200">Advanced Rights & Conditions</div>
                                    <div className="text-xs text-slate-400 mt-0.5">Legal & Governance Controls</div>
                                </div>
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </div>

                    <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/92 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Estimated Terms</div>
                                    <h2 className="mt-1 text-2xl font-semibold text-white">{formatUsd(quote.totalUsd)}</h2>
                                </div>
                                <span
                                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                                        quote.riskBand === 'controlled'
                                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                                            : quote.riskBand === 'heightened'
                                                ? 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                                : 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                                    }`}
                                >
                                    {quote.riskBand}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <SummaryStat label="Escrow hold" value={formatUsd(quote.escrowHoldUsd)} />
                                <SummaryStat label="Evaluation fee" value={formatUsd(Math.max(quote.totalUsd * 0.1, 750))} />
                                <SummaryStat label="Terms expire" value={new Date(quote.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                <SummaryStat label="Discount" value={quote.discountUsd > 0 ? formatUsd(quote.discountUsd) : 'None'} />
                                <SummaryStat label="Passport applied" value={quote.passportApplied ? 'Yes' : 'No'} />
                            </div>

                            <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                Terms generation is free. Evaluation fees begin only when this package moves into protected evaluation, and provider settlement fees are applied only after a successful engagement.
                            </div>

                            <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Usage rights summary</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {quote.rightsSummary.map(item => (
                                        <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
                                    {usageGuidance.usageRightsSummary.map(item => (
                                        <li key={item} className="rounded-xl border border-white/6 bg-slate-900/60 px-3 py-2.5">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4">
                                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Prohibited use</div>
                                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-200">
                                    {usageGuidance.prohibitedUses.map(item => (
                                        <li key={item} className="rounded-xl border border-rose-500/15 bg-slate-950/45 px-3 py-2.5">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <ResponsibilityNotice
                                className="mt-4"
                                title="Licensed use only"
                                message="Quote terms describe licensed use and delivery scope in this demo. They do not prove ownership, lawful basis, or chain-of-title."
                            />

                            <div className="mt-5 space-y-3">
                                {quote.breakdown.map(line => (
                                    <div key={line.label} className="rounded-xl border border-white/8 bg-slate-950/45 px-4 py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-white">{line.label}</div>
                                            <div className={`text-sm font-semibold ${line.amountUsd >= 0 ? 'text-slate-100' : 'text-emerald-200'}`}>
                                                {line.amountUsd >= 0 ? formatUsd(line.amountUsd) : `-${formatUsd(Math.abs(line.amountUsd))}`}
                                            </div>
                                        </div>
                                        <div className="mt-1 text-xs text-slate-400">{line.detail}</div>
                                    </div>
                                ))}
                            </div>

                            {notice && (
                                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                    {notice}
                                </div>
                            )}

                            <div className="mt-5 grid gap-3">
                                <button
                                    type="button"
                                    onClick={handleSaveQuote}
                                    className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    Save Free Terms
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProceedToCheckout}
                                    className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-400"
                                >
                                    Proceed To Protected Evaluation
                                </button>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/92 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Saved Terms</h2>
                                    <p className="mt-1 text-sm text-slate-400">Recent saved packages for this dataset. Saving terms does not start billing.</p>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300">
                                    {savedQuotes.length}
                                </span>
                            </div>

                            <div className="mt-4 space-y-3">
                                {savedQuotes.length > 0 ? (
                                    savedQuotes.slice(0, 4).map(savedQuote => (
                                        <div key={savedQuote.id} className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-sm font-semibold text-white">{savedQuote.id}</div>
                                                <div className="text-sm font-semibold text-cyan-100">{formatUsd(savedQuote.totalUsd)}</div>
                                            </div>
                                            <div className="mt-2 text-xs text-slate-400">
                                                {savedQuote.rightsSummary.slice(0, 3).join(' · ')}
                                            </div>
                                            <div className="mt-2 text-[11px] text-slate-500">
                                                Saved {new Date(savedQuote.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-5 text-sm text-slate-400">
                                        No saved quotes yet. Configure rights, save one, and it will appear here.
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>
                </section>
            </div>

            <AdvancedConditionsDrawer
                isOpen={showAdvancedDrawer}
                onClose={() => setShowAdvancedDrawer(false)}
                form={form}
                updateForm={updateForm}
            />
        </div>
    )
}

function BuilderSection({
    title,
    description,
    children
}: {
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <section className="rounded-3xl border border-white/10 bg-[#0a1526]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
            <div className="mt-5">{children}</div>
        </section>
    )
}

function OptionGrid({
    options,
    value,
    onChange,
    compact = false
}: {
    options: Array<{ value: string; label: string; detail?: string }>
    value: string
    onChange: (value: string) => void
    compact?: boolean
}) {
    return (
        <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
            {options.map(option => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                        value === option.value
                            ? 'border-cyan-400/60 bg-cyan-500/12 text-cyan-100'
                            : 'border-white/10 bg-slate-950/45 text-slate-300 hover:border-slate-500/50'
                    }`}
                >
                    <div className="text-sm font-semibold">{option.label}</div>
                    {option.detail && <div className="mt-1 text-xs text-slate-400">{option.detail}</div>}
                </button>
            ))}
        </div>
    )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm font-semibold text-white">{value}</div>
        </div>
    )
}
