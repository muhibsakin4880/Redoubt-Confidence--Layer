import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ResponsibilityNotice } from '../components/trust/TrustLayer'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import DealProgressTracker from '../components/DealProgressTracker'
import DealConflictBanner from '../components/deals/DealConflictBanner'
import { DATASET_DETAILS, getDatasetDetailById } from '../data/datasetDetailData'
import { buildCompliancePassport, passportStatusMeta } from '../domain/compliancePassport'
import {
    filterOutCanonicalDemoQuotes,
    isCanonicalDemoEscrowRecord
} from '../domain/demoEscrowScenario'
import { buildDealProgressModel } from '../domain/dealProgress'
import { getDealPolicyConflictModelByDatasetId } from '../domain/dealPolicyConflict'
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

// ─── Saved package templates ──────────────────────────────────────────────────

type SavedTemplate = {
    id: string
    title: string
    eyebrow: string
    summary: string
    regionLabel: string
    tone: string
    signals: string[]
    form: RightsQuoteForm
}

const TEMPLATES: SavedTemplate[] = [
    {
        id: 'uae-local-only-evaluation',
        title: 'UAE Local-Only Evaluation',
        eyebrow: 'Residency-Bound',
        summary: 'Single-region governed evaluation for local-only review with no redistribution and visible audit controls.',
        regionLabel: 'UAE local-only operating lane',
        tone: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-100',
        signals: ['Secure clean room', 'Single region', 'Mandatory audit', '24h validation'],
        form: {
            deliveryMode: 'clean_room', fieldPack: 'analytics', usageRight: 'research',
            duration: '90_days', geography: 'single_region', exclusivity: 'none',
            support: 'priority', seatBand: 'team', validationWindowHours: 24,
            redistributionRights: 'not_allowed', auditLoggingRequirement: 'mandatory',
            attributionRequirement: 'required', volumeBasedPricing: false,
            volumePricingAdjustment: 0, volumePricingUnit: 'tb'
        }
    },
    {
        id: 'regulated-buyer-evaluation-package',
        title: 'Regulated Buyer Package',
        eyebrow: 'Review-First',
        summary: 'A stricter evaluation pack for regulated buyers who need sensitive-review scope before any broader delivery discussion.',
        regionLabel: 'Dual-region regulated review lane',
        tone: 'border-cyan-500/30 bg-cyan-500/8 text-cyan-100',
        signals: ['Sensitive review pack', 'Dual region', 'Priority support', '48h validation'],
        form: {
            deliveryMode: 'clean_room', fieldPack: 'sensitive_review', usageRight: 'internal_ai',
            duration: '90_days', geography: 'dual_region', exclusivity: 'none',
            support: 'priority', seatBand: 'department', validationWindowHours: 48,
            redistributionRights: 'not_allowed', auditLoggingRequirement: 'mandatory',
            attributionRequirement: 'required', volumeBasedPricing: false,
            volumePricingAdjustment: 0, volumePricingUnit: 'tb'
        }
    },
    {
        id: 'cross-border-review-required-package',
        title: 'Cross-Border Review Package',
        eyebrow: 'Safeguarded Transfer',
        summary: 'When external review needs a higher-friction approval lane, tighter safeguards, and a longer validation window.',
        regionLabel: 'Cross-border review subject to safeguards',
        tone: 'border-amber-500/30 bg-amber-500/8 text-amber-100',
        signals: ['Aggregated export', 'Global geography', 'Mandatory audit', '72h validation'],
        form: {
            deliveryMode: 'aggregated_export', fieldPack: 'analytics', usageRight: 'commercial_analytics',
            duration: '90_days', geography: 'global', exclusivity: 'none',
            support: 'priority', seatBand: 'department', validationWindowHours: 72,
            redistributionRights: 'not_allowed', auditLoggingRequirement: 'mandatory',
            attributionRequirement: 'required', volumeBasedPricing: false,
            volumePricingAdjustment: 0, volumePricingUnit: 'tb'
        }
    },
    {
        id: 'provider-shielded-evaluation-package',
        title: 'Provider-Shielded Package',
        eyebrow: 'Shielded Intake',
        summary: 'A controlled evaluation path for early-stage buyers where provider identity and direct release stay protected during review.',
        regionLabel: 'Provider-shielded review lane',
        tone: 'border-blue-500/30 bg-blue-500/8 text-blue-100',
        signals: ['Core fields', 'Single region', 'Standard support', 'Provider-shielded'],
        form: {
            deliveryMode: 'clean_room', fieldPack: 'core', usageRight: 'research',
            duration: '30_days', geography: 'single_region', exclusivity: 'none',
            support: 'standard', seatBand: 'team', validationWindowHours: 48,
            redistributionRights: 'not_allowed', auditLoggingRequirement: 'mandatory',
            attributionRequirement: 'required', volumeBasedPricing: false,
            volumePricingAdjustment: 0, volumePricingUnit: 'tb'
        }
    }
]

const doesFormMatchTemplate = (form: RightsQuoteForm, t: RightsQuoteForm) =>
    (Object.keys(t) as Array<keyof RightsQuoteForm>).every(key => form[key] === t[key])

// ─── Advanced conditions drawer ───────────────────────────────────────────────

function AdvancedConditionsDrawer({
    isOpen,
    onClose,
    form,
    updateForm
}: {
    isOpen: boolean
    onClose: () => void
    form: RightsQuoteForm
    updateForm: <K extends keyof RightsQuoteForm>(field: K, value: RightsQuoteForm[K]) => void
}) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex w-full max-w-md flex-col overflow-hidden bg-[#0a1526] border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-white">Advanced Rights & Conditions</h2>
                        <p className="mt-0.5 text-xs text-slate-400">Legal & Governance Controls</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:border-white/20 hover:text-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    <DrawerGroup label="Redistribution Rights">
                        {[{ value: 'not_allowed', label: 'Not Allowed' }, { value: 'allowed', label: 'Allowed' }].map(opt => (
                            <DrawerChoice
                                key={opt.value}
                                label={opt.label}
                                active={form.redistributionRights === opt.value}
                                onClick={() => updateForm('redistributionRights', opt.value as 'allowed' | 'not_allowed')}
                            />
                        ))}
                    </DrawerGroup>

                    <DrawerGroup label="Audit Logging">
                        {[{ value: 'mandatory', label: 'Mandatory' }, { value: 'optional', label: 'Optional' }].map(opt => (
                            <DrawerChoice
                                key={opt.value}
                                label={opt.label}
                                active={form.auditLoggingRequirement === opt.value}
                                onClick={() => updateForm('auditLoggingRequirement', opt.value as 'mandatory' | 'optional')}
                            />
                        ))}
                    </DrawerGroup>

                    <DrawerGroup label="Attribution Requirement">
                        {[{ value: 'required', label: 'Required' }, { value: 'not_required', label: 'Not Required' }].map(opt => (
                            <DrawerChoice
                                key={opt.value}
                                label={opt.label}
                                active={form.attributionRequirement === opt.value}
                                onClick={() => updateForm('attributionRequirement', opt.value as 'required' | 'not_required')}
                            />
                        ))}
                    </DrawerGroup>

                    <div className="border-t border-white/10 pt-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Volume-Based Pricing</p>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-slate-300">Enable volume scaling</span>
                            <button
                                type="button"
                                onClick={() => updateForm('volumeBasedPricing', !form.volumeBasedPricing)}
                                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${form.volumeBasedPricing ? 'bg-cyan-500' : 'bg-slate-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${form.volumeBasedPricing ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        {form.volumeBasedPricing && (
                            <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 space-y-3">
                                <div>
                                    <label className="text-xs text-slate-400">Base price adjustment</label>
                                    <div className="mt-1.5 flex gap-2">
                                        <input
                                            type="number"
                                            value={form.volumePricingAdjustment}
                                            onChange={e => updateForm('volumePricingAdjustment', parseFloat(e.target.value) || 0)}
                                            className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                                        />
                                        <select
                                            value={form.volumePricingUnit}
                                            onChange={e => updateForm('volumePricingUnit', e.target.value as 'tb' | 'million_records')}
                                            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                                        >
                                            <option value="tb">per TB</option>
                                            <option value="million_records">per M records</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/10 px-6 py-4">
                    <button onClick={onClose} className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
                        Apply Conditions
                    </button>
                </div>
            </div>
        </div>
    )
}

function DrawerGroup({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">{children}</div>
        </div>
    )
}

function DrawerChoice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                active
                    ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-100'
                    : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-white/20'
            }`}
        >
            {label}
        </button>
    )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

const panel = 'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'
const eyebrowCls = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500'

function BuilderSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <section className={panel}>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
            <div className="mt-5">{children}</div>
        </section>
    )
}

function OptionCard({
    label,
    detail,
    selected,
    onClick,
    compact = false
}: {
    label: string
    detail?: string
    selected: boolean
    onClick: () => void
    compact?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                selected
                    ? 'border-cyan-400/55 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.07)]'
                    : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-white/20 hover:text-white'
            } ${compact ? '' : ''}`}
        >
            <div className={`text-sm font-semibold ${selected ? 'text-white' : ''}`}>{label}</div>
            {detail && !compact && <div className="mt-1.5 text-xs leading-5 text-slate-400">{detail}</div>}
        </button>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RightsQuoteBuilderPage() {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const isDemo = location.pathname.startsWith('/demo/')

    const routeDataset = getDatasetDetailById(id)
    const dataset = routeDataset ?? Object.values(DATASET_DETAILS)[0]

    const passport = useMemo(() => buildCompliancePassport(), [])
    const [form, setForm] = useState<RightsQuoteForm>(() => getDefaultRightsQuoteForm(passport))
    const [notice, setNotice] = useState<string | null>(null)
    const [quoteVersion, setQuoteVersion] = useState(0)
    const [showAdvanced, setShowAdvanced] = useState(false)

    const statusMeta = passportStatusMeta(passport.status)

    const quote = useMemo(() => buildRightsQuote(dataset, form, passport), [dataset, form, passport, quoteVersion])
    const usageGuidance = useMemo(() => buildRightsUsageGuidance(dataset, quote), [dataset, quote])

    const savedQuotes = useMemo(() => {
        const all = loadRightsQuotes(dataset.id)
        return isDemo ? all : filterOutCanonicalDemoQuotes(all)
    }, [dataset.id, isDemo, quoteVersion])

    const persistedCheckout = useMemo(() => {
        const record = loadEscrowCheckoutByQuoteId(quote.id)
        if (!isDemo && record && isCanonicalDemoEscrowRecord(record)) return null
        return record
    }, [isDemo, quote.id, quoteVersion])

    const dealProgress = useMemo(
        () => buildDealProgressModel({ passport, quote, checkoutRecord: persistedCheckout }),
        [passport, persistedCheckout, quote]
    )

    const conflictModel = useMemo(
        () => getDealPolicyConflictModelByDatasetId({ datasetId: dataset.id, surface: 'quote', form, quote, demo: isDemo }),
        [dataset.id, form, isDemo, quote]
    )

    const activeTemplateId = useMemo(
        () => TEMPLATES.find(t => doesFormMatchTemplate(form, t.form))?.id ?? null,
        [form]
    )

    const evaluationFeeUsd = Math.max(quote.totalUsd * 0.1, 750)

    const updateForm = <K extends keyof RightsQuoteForm>(field: K, value: RightsQuoteForm[K]) => {
        setForm(current => ({ ...current, [field]: value }))
        setNotice(null)
    }

    const persistQuote = () => {
        const saved = buildRightsQuote(dataset, form, passport)
        saveRightsQuote(saved)
        setQuoteVersion(v => v + 1)
        return saved
    }

    const handleApplyTemplate = (t: SavedTemplate) => {
        setForm({ ...t.form })
        setNotice(`Applied template: ${t.title}. Review the populated terms before saving.`)
    }

    const handleSaveQuote = () => {
        const saved = persistQuote()
        setNotice(`Terms ${saved.id} saved. Valid until ${new Date(saved.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`)
    }

    const handleProceedToCheckout = () => {
        const saved = persistQuote()
        navigate(
            isDemo ? `/demo/datasets/${dataset.id}/escrow-checkout` : `/datasets/${dataset.id}/escrow-checkout`,
            { state: { quoteId: saved.id } }
        )
    }

    const riskBandClass = quote.riskBand === 'controlled'
        ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
        : quote.riskBand === 'heightened'
            ? 'border-amber-500/35 bg-amber-500/10 text-amber-200'
            : 'border-rose-500/35 bg-rose-500/10 text-rose-200'

    if (!routeDataset) {
        return (
            <DatasetUnavailableState
                contextLabel="Evaluation Terms"
                detail="Redoubt could not locate the dataset for this evaluation-terms route. Return to Dataset Discovery and reopen the dataset from the results list."
            />
        )
    }

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.09),transparent_34%),radial-gradient(circle_at_80%_4%,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_48%_88%,rgba(16,185,129,0.06),transparent_36%)]" />

            <div className="relative mx-auto max-w-[1680px] px-6 py-10 sm:px-10 lg:px-14">

                {/* ── Header ───────────────────────────────────────────────── */}
                <header className={panel}>
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 max-w-3xl">
                            <nav className="flex items-center gap-2 text-sm text-slate-400">
                                <Link to={isDemo ? '/demo/datasets' : '/datasets'} className="hover:text-white transition-colors">Datasets</Link>
                                <span className="text-slate-600">/</span>
                                <Link to={isDemo ? `/demo/datasets/${dataset.id}` : `/datasets/${dataset.id}`} className="hover:text-white transition-colors">{dataset.title}</Link>
                                <span className="text-slate-600">/</span>
                                <span className="text-slate-200">Evaluation Terms</span>
                            </nav>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className={eyebrowCls}>Evaluation Terms Builder</div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${statusMeta.classes}`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    Passport {passport.passportId} · {statusMeta.label}
                                </span>
                            </div>

                            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Configure Evaluation Terms</h1>
                            <p className="mt-3 text-base leading-7 text-slate-400">
                                Define the delivery mode, field access, usage rights, and governance conditions for protected evaluation.
                                Creating and saving terms is free — the buyer-paid evaluation path starts at checkout.
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col xl:min-w-[180px]">
                            <button
                                onClick={handleSaveQuote}
                                className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                            >
                                Save Free Terms
                            </button>
                            <button
                                onClick={handleProceedToCheckout}
                                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-400"
                            >
                                Proceed to Evaluation
                            </button>
                        </div>
                    </div>
                </header>

                {/* Deal progress + conflict */}
                <div className="mt-5 space-y-4">
                    <DealProgressTracker model={dealProgress} compact />
                    <DealConflictBanner model={conflictModel} />
                </div>

                {/* ── Main grid ─────────────────────────────────────────────── */}
                <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">

                    {/* Left — builder */}
                    <div className="min-w-0 space-y-6">

                        {/* Passport reuse notice */}
                        <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/8 p-5 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-white">Reusable compliance passport applied</div>
                                    <p className="mt-1 text-sm text-slate-300/80">
                                        Pricing and reviewer readiness reflect reusable identity, legal, and verification context from your passport.
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-cyan-100/60">
                                        Passport reuse organises review context in this demo — it does not grant legal approval or guaranteed access.
                                    </p>
                                </div>
                                <Link
                                    to={isDemo ? '/demo/compliance-passport' : '/compliance-passport'}
                                    className="shrink-0 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    Open Passport
                                </Link>
                            </div>
                        </div>

                        {/* Saved Templates */}
                        <section className={panel}>
                            <h2 className="text-xl font-semibold text-white">Saved Package Templates</h2>
                            <p className="mt-1 text-sm text-slate-400">Apply a prepared commercial starting point, then fine-tune the terms below.</p>

                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                {TEMPLATES.map(t => {
                                    const tQuote = buildRightsQuote(dataset, t.form, passport)
                                    const isActive = activeTemplateId === t.id
                                    return (
                                        <article
                                            key={t.id}
                                            className={`rounded-2xl border p-5 transition-colors ${
                                                isActive
                                                    ? 'border-cyan-400/40 bg-cyan-500/8 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
                                                    : 'border-white/10 bg-slate-950/40'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${t.tone}`}>
                                                        {t.eyebrow}
                                                    </span>
                                                    <h3 className="mt-2.5 text-base font-semibold text-white">{t.title}</h3>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-semibold text-cyan-100">{formatUsd(tQuote.totalUsd)}</div>
                                                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-slate-500">{tQuote.riskBand}</div>
                                                </div>
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-slate-300">{t.summary}</p>

                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {t.signals.map(s => (
                                                    <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-3 rounded-xl border border-white/8 bg-slate-900/50 px-3 py-2 text-xs leading-5 text-slate-400">
                                                {tQuote.rightsSummary.slice(0, 3).join(' · ')}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleApplyTemplate(t)}
                                                className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                                                    isActive
                                                        ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                                                        : 'border border-cyan-400/30 bg-cyan-500/8 text-cyan-100 hover:bg-cyan-500/15'
                                                }`}
                                            >
                                                {isActive ? 'Template Applied' : 'Apply Template'}
                                            </button>
                                        </article>
                                    )
                                })}
                            </div>
                        </section>

                        {/* Delivery Mode */}
                        <BuilderSection
                            title="Delivery Mode"
                            description="How the dataset is delivered has the biggest impact on price and risk profile."
                        >
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {deliveryModeOptions.map(opt => (
                                    <OptionCard
                                        key={opt.value}
                                        label={opt.label}
                                        detail={opt.detail}
                                        selected={form.deliveryMode === opt.value}
                                        onClick={() => updateForm('deliveryMode', opt.value as QuoteDeliveryMode)}
                                    />
                                ))}
                            </div>
                        </BuilderSection>

                        {/* Field Access */}
                        <BuilderSection
                            title="Field Access"
                            description="Price expands as the permitted schema gets broader and more sensitive."
                        >
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {fieldPackOptions.map(opt => (
                                    <OptionCard
                                        key={opt.value}
                                        label={opt.label}
                                        detail={opt.detail}
                                        selected={form.fieldPack === opt.value}
                                        onClick={() => updateForm('fieldPack', opt.value as QuoteFieldPack)}
                                    />
                                ))}
                            </div>
                        </BuilderSection>

                        {/* Usage Rights */}
                        <BuilderSection
                            title="Usage Rights"
                            description="Rights terms have more impact than raw volume in regulated data evaluations."
                        >
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {usageRightOptions.map(opt => (
                                    <OptionCard
                                        key={opt.value}
                                        label={opt.label}
                                        detail={opt.detail}
                                        selected={form.usageRight === opt.value}
                                        onClick={() => updateForm('usageRight', opt.value as QuoteUsageRight)}
                                    />
                                ))}
                            </div>
                        </BuilderSection>

                        {/* Term + Geography */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <BuilderSection title="Term Duration" description="Longer rights windows compound total deal value.">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {durationOptions.map(opt => (
                                        <OptionCard
                                            key={opt.value}
                                            label={opt.label}
                                            selected={form.duration === opt.value}
                                            onClick={() => updateForm('duration', opt.value as QuoteDuration)}
                                            compact
                                        />
                                    ))}
                                </div>
                            </BuilderSection>
                            <BuilderSection title="Geography" description="Broader territorial rights increase deal value and review scope.">
                                <div className="grid gap-3">
                                    {geographyOptions.map(opt => (
                                        <OptionCard
                                            key={opt.value}
                                            label={opt.label}
                                            selected={form.geography === opt.value}
                                            onClick={() => updateForm('geography', opt.value as QuoteGeography)}
                                            compact
                                        />
                                    ))}
                                </div>
                            </BuilderSection>
                        </div>

                        {/* Exclusivity + Support */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <BuilderSection title="Exclusivity" description="Exclusivity is priced separately because it constrains future supply.">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {exclusivityOptions.map(opt => (
                                        <OptionCard
                                            key={opt.value}
                                            label={opt.label}
                                            selected={form.exclusivity === opt.value}
                                            onClick={() => updateForm('exclusivity', opt.value as QuoteExclusivity)}
                                            compact
                                        />
                                    ))}
                                </div>
                            </BuilderSection>
                            <BuilderSection title="Support Tier" description="Priority and mission-critical support are usually tied to annual agreements.">
                                <div className="grid gap-3">
                                    {supportOptions.map(opt => (
                                        <OptionCard
                                            key={opt.value}
                                            label={opt.label}
                                            detail={opt.detail}
                                            selected={form.support === opt.value}
                                            onClick={() => updateForm('support', opt.value as QuoteSupport)}
                                            compact
                                        />
                                    ))}
                                </div>
                            </BuilderSection>
                        </div>

                        {/* Team Scope + Validation Window */}
                        <BuilderSection
                            title="Team Scope & Validation Window"
                            description="Seat band shapes access cost. Validation window governs the pre-release buyer confirmation period."
                        >
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div>
                                    <div className={`mb-2 ${eyebrowCls}`}>Seat Band</div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {seatBandOptions.map(opt => (
                                            <OptionCard
                                                key={opt.value}
                                                label={opt.label}
                                                selected={form.seatBand === opt.value}
                                                onClick={() => updateForm('seatBand', opt.value)}
                                                compact
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className={`mb-2 ${eyebrowCls}`}>Validation Window</div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {([24, 48, 72] as const).map(hours => (
                                            <button
                                                key={hours}
                                                type="button"
                                                onClick={() => updateForm('validationWindowHours', hours)}
                                                className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                                                    form.validationWindowHours === hours
                                                        ? 'border-cyan-400/55 bg-cyan-500/10 text-white'
                                                        : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-sm font-semibold">{hours}h</div>
                                                <div className="mt-1 text-xs text-slate-400">Buyer confirmation period</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </BuilderSection>

                        {/* Advanced conditions trigger */}
                        <button
                            onClick={() => setShowAdvanced(true)}
                            className="w-full rounded-3xl border border-white/10 bg-[#0a1526]/88 p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:border-white/20"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold text-white">
                                        Advanced Rights & Conditions
                                        {(form.redistributionRights === 'allowed' || form.auditLoggingRequirement === 'optional' || form.volumeBasedPricing) && (
                                            <span className="ml-2 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                                                Modified
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-400">
                                        Redistribution · Audit Logging · Attribution · Volume Pricing
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                                            {form.redistributionRights === 'not_allowed' ? 'No redistribution' : 'Redistribution allowed'}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                                            {form.auditLoggingRequirement === 'mandatory' ? 'Audit mandatory' : 'Audit optional'}
                                        </span>
                                    </div>
                                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* ── Right rail — price & summary ──────────────────────── */}
                    <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">

                        {/* Estimated Terms card */}
                        <div className={panel}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className={eyebrowCls}>Estimated Terms</div>
                                    <div className="mt-2 text-3xl font-bold tracking-tight text-white">{formatUsd(quote.totalUsd)}</div>
                                </div>
                                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${riskBandClass}`}>
                                    {quote.riskBand}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <StatCell label="Escrow hold" value={formatUsd(quote.escrowHoldUsd)} />
                                <StatCell label="Evaluation fee" value={formatUsd(evaluationFeeUsd)} />
                                <StatCell
                                    label="Terms expire"
                                    value={new Date(quote.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <StatCell
                                    label="Passport discount"
                                    value={quote.discountUsd > 0 ? formatUsd(quote.discountUsd) : 'None'}
                                />
                            </div>

                            {/* Breakdown */}
                            <div className="mt-4 space-y-1.5">
                                {quote.breakdown.map(line => (
                                    <div key={line.label} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/45 px-3 py-2.5">
                                        <div className="min-w-0">
                                            <div className="truncate text-xs font-medium text-white">{line.label}</div>
                                            <div className="mt-0.5 truncate text-[11px] text-slate-500">{line.detail}</div>
                                        </div>
                                        <div className={`shrink-0 text-sm font-semibold ${line.amountUsd < 0 ? 'text-emerald-300' : 'text-slate-100'}`}>
                                            {line.amountUsd >= 0 ? formatUsd(line.amountUsd) : `−${formatUsd(Math.abs(line.amountUsd))}`}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-3 text-xs leading-5 text-emerald-100/90">
                                Saving terms is free and buyer-paid protected evaluation begins at checkout. Provider settlement fees apply only after a successful engagement.
                            </div>

                            {notice && (
                                <div className="mt-3 rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-3 py-2.5 text-xs leading-5 text-cyan-100">
                                    {notice}
                                </div>
                            )}

                            {conflictModel?.blockingCount ? (
                                <div className="mt-3 rounded-2xl border border-rose-500/20 bg-rose-500/8 px-3 py-3 text-xs leading-5 text-rose-100">
                                    One or more policy lanes are blocked. Resolve conflicts before treating this package as approvable.
                                </div>
                            ) : null}

                            <div className="mt-4 grid gap-2">
                                <button
                                    type="button"
                                    onClick={handleSaveQuote}
                                    className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/10 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    Save Free Terms
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProceedToCheckout}
                                    className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(16,185,129,0.2)] hover:bg-emerald-400"
                                >
                                    Proceed to Protected Evaluation
                                </button>
                            </div>
                        </div>

                        {/* Rights summary */}
                        <div className={panel}>
                            <div className={eyebrowCls}>Usage Rights Summary</div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {quote.rightsSummary.map(item => (
                                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200">
                                        {item}
                                    </span>
                                ))}
                            </div>
                            <ul className="mt-3 space-y-1.5">
                                {usageGuidance.usageRightsSummary.map(item => (
                                    <li key={item} className="rounded-xl border border-white/8 bg-slate-950/45 px-3 py-2.5 text-xs leading-5 text-slate-300">
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-3 rounded-2xl border border-rose-500/15 bg-rose-500/8 p-3">
                                <div className={eyebrowCls}>Prohibited use</div>
                                <ul className="mt-2 space-y-1.5">
                                    {usageGuidance.prohibitedUses.map(item => (
                                        <li key={item} className="rounded-xl border border-rose-500/15 bg-slate-950/40 px-3 py-2 text-[11px] leading-5 text-slate-300">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <ResponsibilityNotice
                                className="mt-3"
                                title="Licensed use only"
                                message="Quote terms describe licensed use and delivery scope in this demo. They do not prove ownership, lawful basis, or chain-of-title."
                            />
                        </div>

                        {/* Saved terms */}
                        <div className={panel}>
                            <div className="flex items-center justify-between gap-3">
                                <div className={eyebrowCls}>Saved Terms</div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                                    {savedQuotes.length}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">Recent saved packages for this dataset. Saving does not start billing.</p>

                            <div className="mt-3 space-y-2">
                                {savedQuotes.length > 0 ? (
                                    savedQuotes.slice(0, 4).map(sq => (
                                        <div key={sq.id} className="rounded-2xl border border-white/8 bg-slate-950/45 px-3 py-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="font-mono text-xs font-semibold text-white">{sq.id}</div>
                                                <div className="text-xs font-semibold text-cyan-100">{formatUsd(sq.totalUsd)}</div>
                                            </div>
                                            <div className="mt-1 text-[11px] leading-5 text-slate-400">
                                                {sq.rightsSummary.slice(0, 3).join(' · ')}
                                            </div>
                                            <div className="mt-1 text-[11px] text-slate-600">
                                                {new Date(sq.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-3 py-5 text-center text-xs text-slate-500">
                                        No saved quotes yet. Configure rights and save terms — they will appear here.
                                    </div>
                                )}
                            </div>
                        </div>

                    </aside>
                </div>
            </div>

            <AdvancedConditionsDrawer
                isOpen={showAdvanced}
                onClose={() => setShowAdvanced(false)}
                form={form}
                updateForm={updateForm}
            />
        </div>
    )
}

function StatCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
            <div className="mt-1 text-sm font-semibold text-white">{value}</div>
        </div>
    )
}
