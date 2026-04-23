import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DealProgressTracker from '../components/DealProgressTracker'
import DealApprovalMatrix from '../components/deals/DealApprovalMatrix'
import DealArtifactPreviewGrid from '../components/deals/DealArtifactPreviewGrid'
import DealBlockerBoard, {
    type DealBlockerBoardItem
} from '../components/deals/DealBlockerBoard'
import DealConflictBanner from '../components/deals/DealConflictBanner'
import DealReadinessStrip, {
    type DealReadinessItem
} from '../components/deals/DealReadinessStrip'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import DealRouteSuggestionLinks from '../components/deals/DealRouteSuggestionLinks'
import DealSwitcher from '../components/deals/DealSwitcher'
import {
    buildRequestBasisFields,
    getProviderReviewStatus,
    providerReviewStatusStyles,
    requestStatusLabel,
    statusStyles
} from '../data/workspaceData'
import { describeAccessMode, passportStatusMeta } from '../domain/compliancePassport'
import {
    buildDealDossierProofBundle,
    type DealArtifactPreviewTone,
    type DealDossierProofBundle
} from '../domain/dealArtifactPreview'
import {
    getApprovalArtifactByDealId,
    type ApprovalArtifactModel
} from '../domain/approvalArtifact'
import { buildDealPolicyConflictModel } from '../domain/dealPolicyConflict'
import {
    getDealRouteContextById,
    type DealRouteContext
} from '../domain/dealDossier'
import {
    buildProviderRightsPacket,
    loadProviderPacketDraft,
    type ProviderRightsPacket
} from '../domain/providerRightsPacket'

type DealDossierPageProps = {
    demo?: boolean
}

type DossierTab =
    | 'overview'
    | 'approvals'
    | 'rights-residency'
    | 'evaluation-ops'
    | 'evidence'
    | 'audit'
    | 'commercial'

type OperationalArtifactRecord = {
    id: string
    artifactType: string
    title: string
    status: string
    tone: DealArtifactPreviewTone
    owner: string
    lastUpdated: string
    linkedControl: string
    operationalSignificance: string
    summary: string
    highlights: string[]
}

const surfacePanelClass =
    'rounded-2xl border border-white/10 bg-[#08111f]/92 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.2)] backdrop-blur-xl'

const subtlePanelClass = 'rounded-2xl border border-white/8 bg-slate-950/45 p-4'

const dossierTabs: Array<{ id: DossierTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'rights-residency', label: 'Rights & Residency' },
    { id: 'evaluation-ops', label: 'Evaluation Ops' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'audit', label: 'Audit' },
    { id: 'commercial', label: 'Commercial' }
]

export default function DealDossierPage({
    demo = false
}: DealDossierPageProps) {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)
    const [activeTab, setActiveTab] = useState<DossierTab>('overview')
    const [exportMessage, setExportMessage] = useState<string | null>(null)

    useEffect(() => {
        setActiveTab('overview')
        setExportMessage(null)
    }, [dealId])

    if (!context) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={surfacePanelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Deal dossier not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                            Unknown deal id
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            This deal id is not available in the current workspace.
                        </p>

                        <DealRouteSuggestionLinks demo={demo} />
                    </section>
                </div>
            </div>
        )
    }

    const passportMeta = passportStatusMeta(context.passport.status)
    const requestBasisFields = context.request ? buildRequestBasisFields(context.request) : []
    const quote = context.quote
    const proofBundle = buildDealDossierProofBundle(context)
    const providerPacket = buildProviderRightsPacket(
        context,
        loadProviderPacketDraft(context.seed.dealId)
    )
    const approvalArtifact = getApprovalArtifactByDealId(context.seed.dealId)
    const reviewRecord = approvalArtifact?.reviewRecord ?? null
    const blockers = buildBlockerBoardItems(context, proofBundle, reviewRecord, demo)
    const readinessItems = buildReadinessItems(context, proofBundle, providerPacket, approvalArtifact)
    const artifactRecords = buildOperationalArtifactRecords(
        context,
        proofBundle,
        approvalArtifact
    )
    const auditEvents = [...proofBundle.auditTimeline].reverse()
    const releaseChecklist = context.lifecycleRecord?.releaseReadiness.checklist ?? []
    const signals = context.lifecycleRecord?.signals ?? []
    const conflictModel = buildDealPolicyConflictModel({
        context,
        surface: 'dossier',
        quote: context.quote,
        demo
    })

    const ownerLabel =
        reviewRecord?.owner ??
        context.lifecycleRecord?.recommendedOwner ??
        approvalArtifact?.signoffs.find(signoff => signoff.status !== 'Signed')?.owner ??
        'Deal operations'
    const nextRequiredAction =
        proofBundle.approvalBlockers[0]?.blocker ??
        reviewRecord?.nextAction ??
        context.lifecycleRecord?.nextAction ??
        context.dealProgress.nextAction
    const deadlineLabel = [
        reviewRecord?.reviewDeadlineLabel,
        context.lifecycleRecord?.triageSla
    ]
        .filter(Boolean)
        .join(' · ') || 'No active deadline'
    const lastUpdatedLabel = formatDateLabel(
        context.lifecycleRecord?.updatedAt ??
            context.checkoutRecord?.updatedAt ??
            reviewRecord?.submittedAt ??
            context.request?.lastUpdated ??
            context.dataset?.lastUpdated
    )
    const stageTone = approvalArtifact?.overallTone ?? proofBundle.evaluationState.tone
    const datasetTitle = context.dataset?.title ?? context.seed.label
    const dealTypeLabel = context.routeKind === 'derived' ? 'Generated dataset deal' : 'Configured deal'
    const canOpenApproval = !demo && context.surfaceAvailability.approval === 'available'
    const canOpenNegotiation = !demo && context.surfaceAvailability.negotiation === 'available'
    const canOpenResidencyMemo = !demo && context.surfaceAvailability['residency-memo'] === 'available'
    const canOpenGoLive = !demo && context.surfaceAvailability['go-live'] === 'available'

    const primaryActions = [
        {
            label: 'Review approval artifact',
            to: canOpenApproval ? context.routeTargets.approval : undefined,
            disabled: !canOpenApproval
        },
        {
            label: 'Open provider packet',
            to: demo
                ? context.demoTargets['provider-packet']
                : context.routeTargets['provider-packet']
        },
        {
            label: 'Start escrow checkout',
            to: buildBuyerAwareRoute(
                `/datasets/${context.seed.datasetId}/escrow-checkout`,
                demo
            )
        }
    ]

    const secondaryActions = [
        {
            label: 'View negotiation history',
            to: canOpenNegotiation ? context.routeTargets.negotiation : undefined,
            disabled: !canOpenNegotiation
        },
        {
            label: 'Open output review',
            to: demo
                ? context.demoTargets['output-review']
                : context.routeTargets['output-review']
        },
        {
            label: 'Export dossier summary',
            onClick: () =>
                setExportMessage(
                    'Dossier summary export is available as a frontend placeholder in this workspace.'
                )
        }
    ]

    const connectedLinks = [
        context.dataset
            ? {
                  label: 'Dataset detail',
                  to: buildBuyerAwareRoute(`/datasets/${context.dataset.id}`, demo)
              }
            : null,
        context.request
            ? {
                  label: 'Access request detail',
                  to: buildBuyerAwareRoute(`/access-requests/${context.request.id}`, demo)
              }
            : null,
        {
            label: quote ? 'Refine rights package' : 'Build rights package',
            to: buildBuyerAwareRoute(
                `/datasets/${context.seed.datasetId}/rights-quote`,
                demo
            )
        },
        {
            label: 'Provider packet',
            to: demo
                ? context.demoTargets['provider-packet']
                : context.routeTargets['provider-packet']
        },
        {
            label: 'Output review',
            to: demo
                ? context.demoTargets['output-review']
                : context.routeTargets['output-review']
        },
        canOpenApproval
            ? { label: 'Approval artifact', to: context.routeTargets.approval }
            : null,
        canOpenNegotiation
            ? { label: 'Negotiation history', to: context.routeTargets.negotiation }
            : null,
        canOpenResidencyMemo
            ? {
                  label: 'Residency memo',
                  to: context.routeTargets['residency-memo']
              }
            : null,
        canOpenGoLive ? { label: 'Go-live handoff', to: context.routeTargets['go-live'] } : null
    ].filter((item): item is { label: string; to: string } => Boolean(item))

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link
                        to={demo ? '/demo/deals' : '/deals'}
                        className="transition-colors hover:text-white"
                    >
                        Deals
                    </Link>
                    <span>/</span>
                    <span className="text-slate-200">{context.seed.dealId}</span>
                </div>

                <section className={`${surfacePanelClass} mt-5`}>
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-cyan-300/45 bg-cyan-400/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-50 shadow-[0_0_22px_rgba(34,211,238,0.16)]">
                                    Evaluation Dossier
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                    {context.seed.dealId}
                                </span>
                                <StatusPill tone={stageTone} label={context.currentStageLabel} />
                                {approvalArtifact ? (
                                    <StatusPill
                                        tone={approvalArtifact.overallTone}
                                        label={approvalArtifact.overallStatus}
                                    />
                                ) : null}
                            </div>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-100 sm:text-[2.35rem]">
                                {datasetTitle}
                            </h1>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                    Deal: {context.seed.label}
                                </span>
                                <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                                    {dealTypeLabel}
                                </span>
                            </div>
                            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                                Operator workspace binding the dataset, request basis, approval packet, provider evidence, governed evaluation state, and settlement posture into one controlled deal surface.
                            </p>

                            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <HeaderField
                                    label="Dataset title"
                                    value={datasetTitle}
                                    detail="Catalog dataset name"
                                />
                                <HeaderField
                                    label="Dataset id"
                                    value={context.seed.datasetId}
                                    detail="Catalog dataset id"
                                />
                                <HeaderField
                                    label="Deal id"
                                    value={context.seed.dealId}
                                    detail={context.seed.label}
                                />
                                <HeaderField
                                    label="Deal type"
                                    value={dealTypeLabel}
                                    detail={context.routeKind === 'derived' ? 'Generated from dataset catalog' : 'Curated seeded route'}
                                />
                                <HeaderField
                                    label="Buyer org"
                                    value={context.passport.organization.organizationName}
                                    detail={context.passport.organization.roleInOrganization}
                                />
                                <HeaderField
                                    label="Provider / institution"
                                    value={providerPacket.providerInstitution}
                                    detail={providerPacket.providerType}
                                />
                                <HeaderField
                                    label="Region / residency posture"
                                    value={providerPacket.geography.posture}
                                    detail={
                                        reviewRecord?.residencyRequirement ??
                                        providerPacket.geography.transferReview
                                    }
                                />
                                <HeaderField
                                    label="Current stage"
                                    value={context.currentStageLabel}
                                    detail={context.currentStageDetail}
                                />
                                <HeaderField
                                    label="Owner"
                                    value={ownerLabel}
                                    detail={
                                        reviewRecord?.decisionStatus ??
                                        context.lifecycleRecord?.queue ??
                                        'Deal operations queue'
                                    }
                                />
                                <HeaderField
                                    label="SLA / deadline"
                                    value={deadlineLabel}
                                    detail={
                                        reviewRecord?.nextAction ??
                                        context.lifecycleRecord?.triageReason ??
                                        'No review SLA is currently attached.'
                                    }
                                />
                                <HeaderField
                                    label="Last updated"
                                    value={lastUpdatedLabel}
                                    detail={
                                        proofBundle.evidencePack
                                            ? `${proofBundle.evidencePack.id} evidence pack linked`
                                            : 'No evidence pack linked'
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <DealSwitcher context={context} demo={demo} />
                            <article className="rounded-2xl border border-cyan-500/20 bg-cyan-500/8 p-5">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">
                                    Next required action
                                </div>
                                <div className="mt-3 text-lg font-semibold text-white">
                                    {nextRequiredAction}
                                </div>
                                <p className="mt-3 text-sm leading-6 text-cyan-100/80">
                                    {approvalArtifact?.summary ?? proofBundle.evaluationState.summary}
                                </p>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <CompactMetric
                                        label="Review id"
                                        value={proofBundle.reviewId ?? 'Pending'}
                                    />
                                    <CompactMetric
                                        label="Evidence pack"
                                        value={proofBundle.evidencePack?.id ?? 'Not attached'}
                                    />
                                    <CompactMetric label="Owner" value={ownerLabel} />
                                    <CompactMetric label="Deadline" value={deadlineLabel} />
                                </div>
                            </article>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-white/8 pt-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex flex-wrap gap-3">
                                {primaryActions.map(action => (
                                    <WorkspaceAction
                                        key={action.label}
                                        label={action.label}
                                        to={action.to}
                                        disabled={action.disabled}
                                        primary
                                    />
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {secondaryActions.map(action => (
                                    <WorkspaceAction
                                        key={action.label}
                                        label={action.label}
                                        to={action.to}
                                        disabled={action.disabled}
                                        onClick={action.onClick}
                                    />
                                ))}
                            </div>
                        </div>

                        {exportMessage ? (
                            <div className="mt-3 text-xs text-slate-400">
                                {exportMessage}
                            </div>
                        ) : null}
                    </div>
                </section>

                <div className="mt-4">
                    <DealReadinessStrip items={readinessItems} />
                </div>

                <section className={`${surfacePanelClass} mt-4`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Deal Readiness
                            </div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                Blocker board
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Open blockers stay above the fold because they determine whether the dossier can progress through approval, residency review, or governed evaluation.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <StatusPill
                                tone={blockers.length > 0 ? 'rose' : 'emerald'}
                                label={`${blockers.length} open blocker${blockers.length === 1 ? '' : 's'}`}
                            />
                            {proofBundle.reviewId ? (
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                    {proofBundle.reviewId}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-5">
                        <DealBlockerBoard items={blockers} />
                    </div>
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                        <div className="border-b border-white/10">
                            <div
                                role="tablist"
                                aria-label="Deal dossier sections"
                                className="flex flex-wrap gap-2 pb-3"
                            >
                                {dossierTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        id={`dossier-tab-${tab.id}`}
                                        type="button"
                                        role="tab"
                                        aria-controls={`dossier-panel-${tab.id}`}
                                        aria-selected={activeTab === tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100'
                                                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div
                            id={`dossier-panel-${activeTab}`}
                            role="tabpanel"
                            aria-labelledby={`dossier-tab-${activeTab}`}
                            className="mt-4 space-y-4"
                        >
                            {activeTab === 'overview' ? (
                                <>
                                    <DealConflictBanner model={conflictModel} />

                                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                                        <article className={surfacePanelClass}>
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                                <div>
                                                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                        Operational Status
                                                    </div>
                                                    <h2 className="mt-2 text-xl font-semibold text-white">
                                                        Deal progression
                                                    </h2>
                                                </div>
                                                <StatusPill
                                                    tone={proofBundle.evaluationState.tone}
                                                    label={proofBundle.evaluationState.status}
                                                />
                                            </div>

                                            <div className="mt-4">
                                                <DealProgressTracker
                                                    model={context.dealProgress}
                                                    compact
                                                />
                                            </div>

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <TextListPanel
                                                    title="Current signals"
                                                    items={
                                                        signals.length > 0
                                                            ? signals.slice(0, 4)
                                                            : [
                                                                  'Signals will populate as more review and evaluation records land on the deal.'
                                                              ]
                                                    }
                                                />
                                                <TextListPanel
                                                    title="Release gates"
                                                    items={
                                                        releaseChecklist.length > 0
                                                            ? releaseChecklist.map(item =>
                                                                  item.passed
                                                                      ? `${item.label} passed`
                                                                      : `${item.label} still requires follow-up`
                                                              )
                                                            : [
                                                                  'Release checklist is not yet attached to this deal.'
                                                              ]
                                                    }
                                                />
                                            </div>
                                        </article>

                                        <article className={surfacePanelClass}>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                Deal summary
                                            </div>
                                            <h2 className="mt-2 text-xl font-semibold text-white">
                                                Decision context
                                            </h2>
                                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                                {context.seed.summary}
                                            </p>

                                            <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                    Next action
                                                </div>
                                                <div className="mt-2 text-sm font-semibold text-white">
                                                    {nextRequiredAction}
                                                </div>
                                                <div className="mt-2 text-sm leading-6 text-slate-300">
                                                    {context.currentStageDetail}
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3">
                                                {connectedLinks.map(link => (
                                                    <Link
                                                        key={`${context.seed.dealId}-${link.to}`}
                                                        to={link.to}
                                                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/35 hover:text-cyan-100"
                                                    >
                                                        <span>{link.label}</span>
                                                        <span className="text-xs text-slate-500">
                                                            Open
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </article>
                                    </section>

                                    <section className="grid gap-4 xl:grid-cols-3">
                                        <article className={surfacePanelClass}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                        Dataset summary
                                                    </div>
                                                    <h2 className="mt-2 text-lg font-semibold text-white">
                                                        {context.dataset?.title ?? 'Dataset summary pending'}
                                                    </h2>
                                                </div>
                                                {context.dataset ? (
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[context.dataset.access.status]}`}
                                                    >
                                                        {requestStatusLabel(
                                                            context.dataset.access.status
                                                        )}
                                                    </span>
                                                ) : null}
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                                {context.dataset?.description ??
                                                    'Dataset detail will render here once the seeded route resolves a linked dataset record.'}
                                            </p>

                                            {context.dataset ? (
                                                <>
                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                        <CompactMetric
                                                            label="Category"
                                                            value={context.dataset.category}
                                                        />
                                                        <CompactMetric
                                                            label="Coverage"
                                                            value={context.dataset.recordCount}
                                                        />
                                                        <CompactMetric
                                                            label="Payload size"
                                                            value={context.dataset.size}
                                                        />
                                                        <CompactMetric
                                                            label="Confidence"
                                                            value={`${context.dataset.confidenceScore}%`}
                                                        />
                                                    </div>

                                                    <div className="mt-4 grid gap-3">
                                                        <TextListPanel
                                                            title="Allowed usage"
                                                            items={context.dataset.access.allowedUsage.slice(
                                                                0,
                                                                3
                                                            )}
                                                        />
                                                        <TextListPanel
                                                            title="Access instructions"
                                                            items={context.dataset.access.instructions.slice(
                                                                0,
                                                                3
                                                            )}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <EmptyStateCopy text="Dataset metrics and access instructions will appear once the seeded route resolves a linked dataset record." />
                                            )}
                                        </article>

                                        <article className={surfacePanelClass}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                        Request basis
                                                    </div>
                                                    <h2 className="mt-2 text-lg font-semibold text-white">
                                                        Buyer request
                                                    </h2>
                                                </div>
                                                {context.request ? (
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${providerReviewStatusStyles[getProviderReviewStatus(context.request)]}`}
                                                    >
                                                        {getProviderReviewStatus(context.request)}
                                                    </span>
                                                ) : null}
                                            </div>

                                            {context.request ? (
                                                <div className="mt-4 grid gap-3">
                                                    {requestBasisFields.map(field => (
                                                        <DenseField
                                                            key={`${context.request?.id}-${field.label}`}
                                                            label={field.label}
                                                            value={field.value}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyStateCopy text="Request basis detail will render here once a mapped access request is available for the deal." />
                                            )}
                                        </article>

                                        <article className={surfacePanelClass}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                        Compliance passport
                                                    </div>
                                                    <h2 className="mt-2 text-lg font-semibold text-white">
                                                        Buyer context
                                                    </h2>
                                                </div>
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${passportMeta.classes}`}
                                                >
                                                    {passportMeta.label}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-3">
                                                <DenseField
                                                    label="Organization"
                                                    value={
                                                        context.passport.organization
                                                            .organizationName
                                                    }
                                                />
                                                <DenseField
                                                    label="Role"
                                                    value={
                                                        context.passport.organization
                                                            .roleInOrganization
                                                    }
                                                />
                                                <DenseField
                                                    label="Default term"
                                                    value={context.passport.defaultDuration}
                                                />
                                                <DenseField
                                                    label="Preferred access"
                                                    value={describeAccessMode(
                                                        context.passport.preferredAccessMode
                                                    )}
                                                />
                                            </div>

                                            <div
                                                className={`mt-4 rounded-2xl border px-4 py-3 text-xs leading-5 ${passportMeta.classes}`}
                                            >
                                                {passportMeta.detail}
                                            </div>
                                        </article>
                                    </section>
                                </>
                            ) : null}

                            {activeTab === 'approvals' ? (
                                <>
                                    <section className={surfacePanelClass}>
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                    Approval Packet
                                                </div>
                                                <h2 className="mt-2 text-2xl font-semibold text-white">
                                                    Approval matrix
                                                </h2>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                                    Privacy, legal, governance, provider, and commercial signoff remain tied to the same deal, review id, and governed operating state.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <StatusPill
                                                    tone={
                                                        approvalArtifact?.overallTone ??
                                                        proofBundle.evaluationState.tone
                                                    }
                                                    label={
                                                        approvalArtifact?.overallStatus ??
                                                        'Approval state pending'
                                                    }
                                                />
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                    {approvalArtifact?.signedCount ?? 0}/5 signed
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <DealApprovalMatrix
                                                signoffs={approvalArtifact?.signoffs ?? []}
                                            />
                                        </div>
                                    </section>

                                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
                                        <article className={surfacePanelClass}>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {proofBundle.reviewId ? (
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                        {proofBundle.reviewId}
                                                    </span>
                                                ) : null}
                                                {proofBundle.evidencePack ? (
                                                    <StatusPill
                                                        tone={toneFromEvidenceStatus(
                                                            proofBundle.evidencePack.status
                                                        )}
                                                        label={proofBundle.evidencePack.status}
                                                    />
                                                ) : null}
                                            </div>

                                            <h2 className="mt-3 text-xl font-semibold text-white">
                                                Approval packet status
                                            </h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                {approvalArtifact?.summary ??
                                                    'Approval state will update once signoff lanes and packet records are linked to the dossier.'}
                                            </p>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <CompactMetric
                                                    label="Packet status"
                                                    value={
                                                        approvalArtifact?.packetStatus ??
                                                        'Pending'
                                                    }
                                                />
                                                <CompactMetric
                                                    label="Review status"
                                                    value={
                                                        approvalArtifact?.reviewStatus ??
                                                        context.currentStageLabel
                                                    }
                                                />
                                                <CompactMetric
                                                    label="Evidence pack"
                                                    value={
                                                        proofBundle.evidencePack?.id ??
                                                        'Not attached'
                                                    }
                                                />
                                                <CompactMetric
                                                    label="Owner"
                                                    value={ownerLabel}
                                                />
                                            </div>

                                            {approvalArtifact?.approvalMemoPreview ? (
                                                <div className="mt-4">
                                                    <DealArtifactPreviewGrid
                                                        artifacts={[
                                                            approvalArtifact.approvalMemoPreview
                                                        ]}
                                                    />
                                                </div>
                                            ) : null}
                                        </article>

                                        <div className="space-y-4">
                                            <article className={surfacePanelClass}>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                    Rationale summary
                                                </div>
                                                <h2 className="mt-2 text-xl font-semibold text-white">
                                                    Decision notes
                                                </h2>

                                                <div className="mt-4 space-y-3">
                                                    {(approvalArtifact?.rationaleSummary ?? [
                                                        proofBundle.evaluationState.summary,
                                                        proofBundle.settlementState.summary
                                                    ]).map(item => (
                                                        <div
                                                            key={item}
                                                            className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4 text-sm leading-6 text-slate-200"
                                                        >
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </article>

                                            <article className={surfacePanelClass}>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                    Reference ledger
                                                </div>
                                                <h2 className="mt-2 text-xl font-semibold text-white">
                                                    Linked records
                                                </h2>

                                                <div className="mt-4 grid gap-3">
                                                    {(approvalArtifact?.references ?? [
                                                        {
                                                            label: 'Deal id',
                                                            value: context.seed.dealId
                                                        }
                                                    ]).map(reference => (
                                                        <DenseField
                                                            key={`${reference.label}-${reference.value}`}
                                                            label={reference.label}
                                                            value={reference.value}
                                                        />
                                                    ))}
                                                </div>
                                            </article>
                                        </div>
                                    </section>
                                </>
                            ) : null}

                            {activeTab === 'rights-residency' ? (
                                <>
                                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                                        <article className={surfacePanelClass}>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusPill
                                                    tone={providerPacket.overallTone}
                                                    label={providerPacket.overallStatus}
                                                />
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                    {providerPacket.id}
                                                </span>
                                            </div>

                                            <h2 className="mt-3 text-xl font-semibold text-white">
                                                Provider packet
                                            </h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                {providerPacket.buyerViewSummary}
                                            </p>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <CompactMetric
                                                    label="Institution"
                                                    value={providerPacket.providerInstitution}
                                                />
                                                <CompactMetric
                                                    label="Institution type"
                                                    value={providerPacket.providerType}
                                                />
                                                <CompactMetric
                                                    label="Residency posture"
                                                    value={providerPacket.geography.posture}
                                                />
                                                <CompactMetric
                                                    label="Review id"
                                                    value={
                                                        providerPacket.reviewId ??
                                                        'Not linked'
                                                    }
                                                />
                                            </div>

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <TextListPanel
                                                    title="Named approvers"
                                                    items={providerPacket.namedApprovers.map(
                                                        approver =>
                                                            `${approver.role}: ${approver.name} (${approver.status})`
                                                    )}
                                                />
                                                <TextListPanel
                                                    title="Restricted processing"
                                                    items={providerPacket.geography.restrictedProcessing}
                                                    danger
                                                />
                                            </div>
                                        </article>

                                        <article className={surfacePanelClass}>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                Commercial Scope
                                            </div>
                                            <h2 className="mt-2 text-xl font-semibold text-white">
                                                Rights package
                                            </h2>

                                            {quote ? (
                                                <>
                                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                        <CompactMetric
                                                            label="Quote id"
                                                            value={quote.id}
                                                        />
                                                        <CompactMetric
                                                            label="Total"
                                                            value={formatUsd(quote.totalUsd)}
                                                        />
                                                        <CompactMetric
                                                            label="Escrow hold"
                                                            value={formatUsd(
                                                                quote.escrowHoldUsd
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                        <TextListPanel
                                                            title="Rights summary"
                                                            items={quote.rightsSummary.slice(0, 4)}
                                                        />
                                                        <TextListPanel
                                                            title="Residency controls"
                                                            items={[
                                                                providerPacket.geography.transferReview,
                                                                ...providerPacket.allowedUse.controls.slice(
                                                                    0,
                                                                    2
                                                                )
                                                            ]}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <EmptyStateCopy text="No priced rights package is attached yet. Save the rights package to bring commercial scope and checkout controls onto the deal." />
                                            )}
                                        </article>
                                    </section>

                                    <section className="grid gap-4 xl:grid-cols-2">
                                        <article className={surfacePanelClass}>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                Request basis
                                            </div>
                                            <h2 className="mt-2 text-xl font-semibold text-white">
                                                Requested use and handling basis
                                            </h2>

                                            {context.request ? (
                                                <div className="mt-4 grid gap-3">
                                                    {requestBasisFields.map(field => (
                                                        <DenseField
                                                            key={`${field.label}-${field.value}`}
                                                            label={field.label}
                                                            value={field.value}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyStateCopy text="A mapped request is required before use-basis details can render here." />
                                            )}
                                        </article>

                                        <article className={surfacePanelClass}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                        Residency posture
                                                    </div>
                                                    <h2 className="mt-2 text-xl font-semibold text-white">
                                                        Buyer and provider controls
                                                    </h2>
                                                </div>
                                                <StatusPill
                                                    tone={providerPacket.geography.tone}
                                                    label={providerPacket.geography.posture}
                                                />
                                            </div>

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <TextListPanel
                                                    title="Allowed processing"
                                                    items={
                                                        providerPacket.geography.allowedProcessing
                                                    }
                                                />
                                                <TextListPanel
                                                    title="Transfer review"
                                                    items={[
                                                        providerPacket.geography.transferReview,
                                                        passportMeta.detail
                                                    ]}
                                                    danger={
                                                        providerPacket.geography.tone ===
                                                        'amber'
                                                    }
                                                />
                                            </div>

                                            <div className="mt-4 grid gap-3">
                                                <DenseField
                                                    label="Buyer organization"
                                                    value={
                                                        context.passport.organization
                                                            .organizationName
                                                    }
                                                />
                                                <DenseField
                                                    label="Preferred access"
                                                    value={describeAccessMode(
                                                        context.passport.preferredAccessMode
                                                    )}
                                                />
                                                <DenseField
                                                    label="Review owner"
                                                    value={ownerLabel}
                                                />
                                            </div>
                                        </article>
                                    </section>
                                </>
                            ) : null}

                            {activeTab === 'evaluation-ops' ? (
                                <>
                                    <section className="grid gap-4 xl:grid-cols-2">
                                        <StatusPanel
                                            title={proofBundle.evaluationState.title}
                                            label={proofBundle.evaluationState.label}
                                            status={proofBundle.evaluationState.status}
                                            tone={proofBundle.evaluationState.tone}
                                            summary={proofBundle.evaluationState.summary}
                                            highlights={proofBundle.evaluationState.highlights}
                                            note={proofBundle.evaluationState.note}
                                        />
                                        <StatusPanel
                                            title={proofBundle.settlementState.title}
                                            label={proofBundle.settlementState.label}
                                            status={proofBundle.settlementState.status}
                                            tone={proofBundle.settlementState.tone}
                                            summary={proofBundle.settlementState.summary}
                                            highlights={proofBundle.settlementState.highlights}
                                            note={proofBundle.settlementState.note}
                                        />
                                    </section>

                                    <article className={surfacePanelClass}>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                            Operational status
                                        </div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">
                                            Progress tracker
                                        </h2>
                                        <div className="mt-4">
                                            <DealProgressTracker
                                                model={context.dealProgress}
                                                compact
                                            />
                                        </div>
                                    </article>

                                    <section className="grid gap-4 xl:grid-cols-2">
                                        <article className={surfacePanelClass}>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                Evaluation controls
                                            </div>
                                            <h2 className="mt-2 text-xl font-semibold text-white">
                                                Checkout and workspace state
                                            </h2>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <CompactMetric
                                                    label="Checkout id"
                                                    value={context.checkoutId ?? 'Pending'}
                                                />
                                                <CompactMetric
                                                    label="Escrow hold"
                                                    value={
                                                        context.checkoutRecord
                                                            ? formatUsd(
                                                                  context.checkoutRecord
                                                                      .funding
                                                                      .escrowHoldUsd
                                                              )
                                                            : quote
                                                              ? formatUsd(
                                                                    quote.escrowHoldUsd
                                                                )
                                                              : 'Pending'
                                                    }
                                                />
                                                <CompactMetric
                                                    label="Evaluation fee"
                                                    value={
                                                        context.checkoutRecord
                                                            ? formatUsd(
                                                                  context.checkoutRecord
                                                                      .outcomeProtection
                                                                      .evaluationFeeUsd
                                                              )
                                                            : 'Pending'
                                                    }
                                                />
                                                <CompactMetric
                                                    label="Review window"
                                                    value={
                                                        context.checkoutRecord
                                                            ? `${context.checkoutRecord.configuration.reviewWindowHours} hrs`
                                                            : quote
                                                              ? `${quote.input.validationWindowHours} hrs`
                                                              : 'Pending'
                                                    }
                                                />
                                            </div>

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <TextListPanel
                                                    title="Operational checkpoints"
                                                    items={
                                                        proofBundle.evaluationState.highlights
                                                    }
                                                />
                                                <TextListPanel
                                                    title="Current signals"
                                                    items={
                                                        signals.length > 0
                                                            ? signals.slice(0, 4)
                                                            : [
                                                                  'Operational signals will deepen after checkout and workspace issuance.'
                                                              ]
                                                    }
                                                />
                                            </div>
                                        </article>

                                        <article className={surfacePanelClass}>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                Settlement controls
                                            </div>
                                            <h2 className="mt-2 text-xl font-semibold text-white">
                                                Release checklist
                                            </h2>

                                            {releaseChecklist.length > 0 ? (
                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                    {releaseChecklist.map(item => (
                                                        <div
                                                            key={item.key}
                                                            className={`rounded-2xl border px-4 py-3 ${
                                                                item.passed
                                                                    ? 'border-emerald-400/18 bg-emerald-500/8'
                                                                    : 'border-amber-400/18 bg-amber-500/8'
                                                            }`}
                                                        >
                                                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                                Release gate
                                                            </div>
                                                            <div className="mt-2 text-sm font-semibold text-white">
                                                                {item.label}
                                                            </div>
                                                            <div className="mt-2 text-xs text-slate-300">
                                                                {item.passed
                                                                    ? 'Passed'
                                                                    : 'Requires follow-up'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyStateCopy text="Release gates have not been attached to this dossier yet." />
                                            )}

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <TextListPanel
                                                    title="Settlement detail"
                                                    items={proofBundle.settlementState.highlights}
                                                    danger={
                                                        proofBundle.settlementState.tone ===
                                                        'rose'
                                                    }
                                                />
                                                <TextListPanel
                                                    title="Escalation path"
                                                    items={[
                                                        context.lifecycleRecord?.triageReason ??
                                                            'No escalation path is currently attached.',
                                                        context.lifecycleRecord?.nextAction ??
                                                            'No next action is currently attached.'
                                                    ]}
                                                />
                                            </div>
                                        </article>
                                    </section>
                                </>
                            ) : null}

                            {activeTab === 'evidence' ? (
                                <>
                                    <section className={surfacePanelClass}>
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                    Evidence
                                                </div>
                                                <h2 className="mt-2 text-2xl font-semibold text-white">
                                                    Controlled records
                                                </h2>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                                    Artifacts stay framed as governed records with ownership, linked controls, review references, and operational significance.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                    {artifactRecords.length} records
                                                </span>
                                                {proofBundle.evidencePack ? (
                                                    <StatusPill
                                                        tone={toneFromEvidenceStatus(
                                                            proofBundle.evidencePack.status
                                                        )}
                                                        label={proofBundle.evidencePack.status}
                                                    />
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                            {artifactRecords.map(record => (
                                                <OperationalArtifactCard
                                                    key={record.id}
                                                    record={record}
                                                />
                                            ))}
                                        </div>
                                    </section>

                                    <article className={surfacePanelClass}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                    Artifact previews
                                                </div>
                                                <h2 className="mt-2 text-xl font-semibold text-white">
                                                    Preview surfaces
                                                </h2>
                                            </div>
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                {proofBundle.artifactPreviews.length} previews
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <DealArtifactPreviewGrid
                                                artifacts={proofBundle.artifactPreviews}
                                            />
                                        </div>
                                    </article>
                                </>
                            ) : null}

                            {activeTab === 'audit' ? (
                                <>
                                    <section className={surfacePanelClass}>
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                    Audit
                                                </div>
                                                <h2 className="mt-2 text-2xl font-semibold text-white">
                                                    Audit timeline
                                                </h2>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                                    Each event keeps actor identity, event type, related object, policy impact, incident linkage, and hash reference in one scan-friendly record.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                    {auditEvents.length} events
                                                </span>
                                                {proofBundle.incidentRecord ? (
                                                    <StatusPill
                                                        tone="amber"
                                                        label="Incident-linked evidence"
                                                    />
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            {auditEvents.map(event => (
                                                <AuditEventCard
                                                    key={event.id}
                                                    event={event}
                                                    proofBundle={proofBundle}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                </>
                            ) : null}

                            {activeTab === 'commercial' ? (
                                <>
                                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                                        <article className={surfacePanelClass}>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                Commercial Scope
                                            </div>
                                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                                Priced scope and settlement posture
                                            </h2>

                                            {quote ? (
                                                <>
                                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                        <CompactMetric
                                                            label="Quote id"
                                                            value={quote.id}
                                                        />
                                                        <CompactMetric
                                                            label="Total"
                                                            value={formatUsd(quote.totalUsd)}
                                                        />
                                                        <CompactMetric
                                                            label="Escrow hold"
                                                            value={formatUsd(
                                                                quote.escrowHoldUsd
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                        <TextListPanel
                                                            title="Rights summary"
                                                            items={quote.rightsSummary.slice(0, 4)}
                                                        />
                                                        <TextListPanel
                                                            title="Settlement posture"
                                                            items={
                                                                proofBundle.settlementState.highlights
                                                            }
                                                            danger={
                                                                proofBundle.settlementState.tone ===
                                                                'rose'
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <EmptyStateCopy text="Commercial scope is not priced yet. Create the rights package to move the deal into funded checkout and governed evaluation." />
                                            )}
                                        </article>

                                        <article className={surfacePanelClass}>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                Connected surfaces
                                            </div>
                                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                                Commercial actions
                                            </h2>

                                            <div className="mt-4 grid gap-3">
                                                {connectedLinks.map(link => (
                                                    <Link
                                                        key={`${link.label}-${link.to}`}
                                                        to={link.to}
                                                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/35 hover:text-cyan-100"
                                                    >
                                                        <span>{link.label}</span>
                                                        <span className="text-xs text-slate-500">
                                                            Open
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <CompactMetric
                                                    label="Next action"
                                                    value={nextRequiredAction}
                                                />
                                                <CompactMetric
                                                    label="Request status"
                                                    value={
                                                        context.request
                                                            ? requestStatusLabel(
                                                                  context.request.status
                                                              )
                                                            : 'Pending'
                                                    }
                                                />
                                                <CompactMetric
                                                    label="Commercial owner"
                                                    value={
                                                        approvalArtifact?.signoffs.find(
                                                            signoff =>
                                                                signoff.key === 'commercial'
                                                        )?.owner ?? ownerLabel
                                                    }
                                                />
                                                <CompactMetric
                                                    label="Output review"
                                                    value={
                                                        demo
                                                            ? context.demoTargets[
                                                                  'output-review'
                                                              ]
                                                            : context.routeTargets[
                                                                  'output-review'
                                                              ]
                                                    }
                                                />
                                            </div>
                                        </article>
                                    </section>
                                </>
                            ) : null}
                        </div>
                    </div>

                    <aside className="xl:sticky xl:top-6 xl:self-start">
                        <DealRelationshipRail context={context} demo={demo} />
                    </aside>
                </section>
            </div>
        </div>
    )
}

function HeaderField({
    label,
    value,
    detail
}: {
    label: string
    value: string
    detail: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-3.5 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </div>
            <div className="mt-2 text-sm font-semibold leading-6 text-slate-100">{value}</div>
            <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
        </div>
    )
}

function WorkspaceAction({
    label,
    to,
    onClick,
    disabled = false,
    primary = false
}: {
    label: string
    to?: string
    onClick?: () => void
    disabled?: boolean
    primary?: boolean
}) {
    const className = `inline-flex rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
        primary
            ? 'border-cyan-400/30 bg-cyan-500/12 text-cyan-100 hover:bg-cyan-500/20'
            : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:text-white'
    }`

    if (to && !disabled) {
        return (
            <Link to={to} className={className}>
                {label}
            </Link>
        )
    }

    if (onClick && !disabled) {
        return (
            <button type="button" onClick={onClick} className={className}>
                {label}
            </button>
        )
    }

    return (
        <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-500"
        >
            {label}
        </button>
    )
}

function CompactMetric({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </div>
            <div className="mt-2 text-sm font-semibold leading-6 text-white">{value}</div>
        </div>
    )
}

function DenseField({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function TextListPanel({
    title,
    items,
    danger = false
}: {
    title: string
    items: string[]
    danger?: boolean
}) {
    return (
        <div
            className={`rounded-2xl border px-4 py-4 ${
                danger
                    ? 'border-rose-500/20 bg-rose-500/8'
                    : 'border-white/8 bg-slate-950/45'
            }`}
        >
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {title}
            </div>
            <div className="mt-3 space-y-2">
                {items.map(item => (
                    <div key={item} className="flex gap-2 text-sm leading-6 text-slate-200">
                        <span
                            className={`mt-2 h-1.5 w-1.5 rounded-full ${
                                danger ? 'bg-rose-300' : 'bg-cyan-300'
                            }`}
                        />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function EmptyStateCopy({
    text
}: {
    text: string
}) {
    return (
        <div className="rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-4 py-5 text-sm leading-6 text-slate-400">
            {text}
        </div>
    )
}

function StatusPill({
    tone,
    label
}: {
    tone: DealArtifactPreviewTone
    label: string
}) {
    return (
        <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getToneBadgeClasses(
                tone
            )}`}
        >
            {label}
        </span>
    )
}

function StatusPanel({
    title,
    label,
    status,
    tone,
    summary,
    highlights,
    note
}: {
    title: string
    label: string
    status: string
    tone: DealArtifactPreviewTone
    summary: string
    highlights: string[]
    note?: string
}) {
    return (
        <article className={surfacePanelClass}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {label}
                    </div>
                    <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
                </div>
                <StatusPill tone={tone} label={status} />
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{summary}</p>

            <div className="mt-4">
                <TextListPanel
                    title="Operational detail"
                    items={highlights}
                    danger={tone === 'rose'}
                />
            </div>

            {note ? (
                <div
                    className={`mt-4 rounded-2xl border px-4 py-3 text-xs leading-5 ${getToneNoteClasses(
                        tone
                    )}`}
                >
                    {note}
                </div>
            ) : null}
        </article>
    )
}

function OperationalArtifactCard({
    record
}: {
    record: OperationalArtifactRecord
}) {
    return (
        <article
            className={`rounded-2xl border p-4 ${getTonePanelClasses(record.tone)}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {record.artifactType}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                        {record.title}
                    </h3>
                </div>
                <StatusPill tone={record.tone} label={record.status} />
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-300">
                {record.operationalSignificance}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <CompactMetric label="Owner" value={record.owner} />
                <CompactMetric label="Last updated" value={record.lastUpdated} />
                <CompactMetric
                    label="Linked blocker / review"
                    value={record.linkedControl}
                />
                <CompactMetric
                    label="Operational significance"
                    value={record.summary}
                />
            </div>

            {record.highlights.length > 0 ? (
                <div className="mt-4">
                    <TextListPanel title="Record detail" items={record.highlights.slice(0, 3)} />
                </div>
            ) : null}
        </article>
    )
}

function AuditEventCard({
    event,
    proofBundle
}: {
    event: DealDossierProofBundle['auditTimeline'][number]
    proofBundle: DealDossierProofBundle
}) {
    return (
        <article className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusPill
                            tone={toneFromAuditTone(event.tone)}
                            label={buildAuditEventType(event.action)}
                        />
                        <span className="text-xs text-slate-500">{event.at}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">
                        {event.action}
                    </h3>
                    {event.reason ? (
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            {event.reason}
                        </p>
                    ) : null}
                </div>

                <div className="rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-3 text-xs leading-5 text-slate-300">
                    <div className="font-semibold text-slate-100">Hash pointer</div>
                    <div className="mt-1 break-all">{event.hashPointer}</div>
                </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <CompactMetric
                    label="Actor / owner"
                    value={formatAuditActor(event.actorId)}
                />
                <CompactMetric
                    label="Event type"
                    value={event.lifecycleLabel}
                />
                <CompactMetric
                    label="Related object"
                    value={buildRelatedObject(event)}
                />
                <CompactMetric
                    label="Exception / incident"
                    value={buildExceptionLinkage(event, proofBundle)}
                />
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-3">
                {event.controls.map(control => (
                    <div
                        key={`${event.id}-${control}`}
                        className="rounded-2xl border border-white/8 bg-slate-900/50 px-3 py-3 text-xs leading-5 text-slate-300"
                    >
                        {control}
                    </div>
                ))}
            </div>
        </article>
    )
}

function buildReadinessItems(
    context: DealRouteContext,
    proofBundle: DealDossierProofBundle,
    providerPacket: ProviderRightsPacket,
    approvalArtifact: ApprovalArtifactModel | null
): DealReadinessItem[] {
    return [
        {
            label: 'Approval readiness',
            value: approvalArtifact?.overallStatus ?? 'Pending approval state',
            detail: `${approvalArtifact?.signedCount ?? 0}/5 lanes signed`,
            tone: approvalArtifact?.overallTone ?? proofBundle.evaluationState.tone
        },
        {
            label: 'Rights package status',
            value: context.quote ? context.quote.id : 'Not priced',
            detail: context.quote
                ? formatUsd(context.quote.totalUsd)
                : 'Create the commercial scope package',
            tone: context.checkoutRecord
                ? 'emerald'
                : context.quote
                  ? 'amber'
                  : 'slate'
        },
        {
            label: 'Residency posture',
            value: providerPacket.geography.posture,
            detail: providerPacket.geography.transferReview,
            tone: providerPacket.geography.tone
        },
        {
            label: 'Evaluation readiness',
            value: proofBundle.evaluationState.status,
            detail: proofBundle.evaluationState.highlights[0] ?? proofBundle.evaluationState.summary,
            tone: proofBundle.evaluationState.tone
        },
        {
            label: 'Settlement posture',
            value: proofBundle.settlementState.status,
            detail: proofBundle.settlementState.highlights[0] ?? proofBundle.settlementState.summary,
            tone: proofBundle.settlementState.tone
        }
    ]
}

function buildBlockerBoardItems(
    context: DealRouteContext,
    proofBundle: DealDossierProofBundle,
    reviewRecord: ApprovalArtifactModel['reviewRecord'],
    demo: boolean
): DealBlockerBoardItem[] {
    if (proofBundle.approvalBlockers.length > 0) {
        return proofBundle.approvalBlockers.map(blocker => {
            const lower = blocker.blocker.toLowerCase()
            const routing = getBlockerRouting(lower, context, demo)

            return {
                id: blocker.id,
                title: blocker.blocker,
                severity: blocker.severity,
                owner: blocker.owner,
                deadline: formatDateLabel(blocker.deadline),
                affectedObject: getAffectedObjectLabel(lower),
                impactSummary: getBlockerImpactSummary(lower),
                recommendedAction:
                    reviewRecord?.nextAction ??
                    getBlockerRecommendedAction(lower, context),
                cta: routing
            }
        })
    }

    return (context.lifecycleRecord?.blockers ?? []).slice(0, 4).map((blocker, index) => {
        const lower = blocker.toLowerCase()
        const severity =
            context.lifecycleRecord?.risk === 'critical' || context.lifecycleRecord?.risk === 'high'
                ? 'High'
                : context.lifecycleRecord?.risk === 'medium'
                  ? 'Medium'
                  : 'Low'

        return {
            id: `${context.seed.dealId}-lifecycle-blocker-${index}`,
            title: blocker,
            severity,
            owner: context.lifecycleRecord?.recommendedOwner ?? 'Deal operations',
            deadline:
                reviewRecord?.reviewDeadlineLabel ??
                context.lifecycleRecord?.triageSla ??
                'No deadline attached',
            affectedObject: getAffectedObjectLabel(lower),
            impactSummary:
                context.lifecycleRecord?.triageReason ??
                'Current lifecycle state requires operator intervention before the deal can advance.',
            recommendedAction:
                context.lifecycleRecord?.nextAction ??
                getBlockerRecommendedAction(lower, context),
            cta: getBlockerRouting(lower, context, demo)
        }
    })
}

function buildOperationalArtifactRecords(
    context: DealRouteContext,
    proofBundle: DealDossierProofBundle,
    approvalArtifact: ApprovalArtifactModel | null
): OperationalArtifactRecord[] {
    return proofBundle.artifactPreviews.map(artifact => {
        if (artifact.artifactLabel === 'DUA preview') {
            return {
                id: artifact.id,
                artifactType: artifact.artifactLabel,
                title: artifact.title,
                status: artifact.status,
                tone: artifact.tone,
                owner:
                    context.checkoutRecord?.buyerLabel ??
                    context.passport.organization.organizationName,
                lastUpdated: formatDateLabel(
                    context.checkoutRecord?.dua.acceptedAt ??
                        context.checkoutRecord?.updatedAt
                ),
                linkedControl:
                    context.checkoutRecord?.id ??
                    proofBundle.reviewId ??
                    'No linked review id',
                operationalSignificance:
                    'Locks the funded evaluation terms, workspace controls, and release guardrails into the controlled contract record.',
                summary: artifact.summary,
                highlights: artifact.highlights
            }
        }

        if (artifact.artifactLabel === 'Evidence pack preview') {
            return {
                id: artifact.id,
                artifactType: artifact.artifactLabel,
                title: artifact.title,
                status: artifact.status,
                tone: artifact.tone,
                owner: proofBundle.evidencePack?.owner ?? 'Review operations',
                lastUpdated:
                    proofBundle.evidencePack?.updatedAt ??
                    formatDateLabel(context.lifecycleRecord?.updatedAt),
                linkedControl:
                    proofBundle.evidencePack?.blocker ??
                    (proofBundle.reviewId
                        ? `Review ${proofBundle.reviewId}`
                        : 'No linked blocker'),
                operationalSignificance:
                    'Carries the reviewer-facing evidence needed to clear approval and release decisions without exposing raw data.',
                summary: artifact.summary,
                highlights: artifact.highlights
            }
        }

        if (artifact.artifactLabel === 'Approval memo preview') {
            return {
                id: artifact.id,
                artifactType: artifact.artifactLabel,
                title: artifact.title,
                status: artifact.status,
                tone: artifact.tone,
                owner:
                    approvalArtifact?.reviewRecord?.owner ??
                    context.lifecycleRecord?.recommendedOwner ??
                    'Approval desk',
                lastUpdated: formatDateLabel(
                    context.lifecycleRecord?.updatedAt ??
                        approvalArtifact?.reviewRecord?.reviewDeadline
                ),
                linkedControl:
                    proofBundle.approvalBlockers[0]?.blocker ??
                    (proofBundle.reviewId
                        ? `Review ${proofBundle.reviewId}`
                        : 'No linked review id'),
                operationalSignificance:
                    'Holds the single approval narrative tying privacy, legal, governance, provider, and commercial state together.',
                summary: artifact.summary,
                highlights: artifact.highlights
            }
        }

        return {
            id: artifact.id,
            artifactType: artifact.artifactLabel,
            title: artifact.title,
            status: artifact.status,
            tone: artifact.tone,
            owner: proofBundle.incidentRecord ? 'Incident response' : 'Deal operations',
            lastUpdated: formatDateLabel(
                findIncidentEventTimestamp(proofBundle) ??
                    context.lifecycleRecord?.updatedAt
            ),
            linkedControl:
                proofBundle.incidentRecord?.id ??
                (proofBundle.reviewId
                    ? `Review ${proofBundle.reviewId}`
                    : 'No linked review id'),
            operationalSignificance:
                'Keeps dispute or incident state attached to the deal so settlement and approval teams can operate from the same record.',
            summary: artifact.summary,
            highlights: artifact.highlights
        }
    })
}

function getAffectedObjectLabel(lower: string) {
    if (/residency|privacy|export|region/.test(lower)) return 'Residency Memo'
    if (/registry|provider|authority|authenticity|publication/.test(lower)) {
        return 'Provider Packet'
    }
    if (/rights|legal|commercial|scope|quote/.test(lower)) return 'Commercial Scope'
    if (/workspace|checkout|escrow|evaluation|credential/.test(lower)) {
        return 'Evaluation Ops'
    }
    return 'Approval Packet'
}

function getBlockerImpactSummary(lower: string) {
    if (/residency|privacy|export|region/.test(lower)) {
        return 'Regional handling language is preventing signoff or keeping the release path constrained.'
    }
    if (/registry|provider|authority|authenticity|publication/.test(lower)) {
        return 'Provider legitimacy or packet completeness is holding the dossier in review.'
    }
    if (/rights|legal|commercial|scope|quote/.test(lower)) {
        return 'Commercial scope cannot advance until rights language and signoff rationale align.'
    }
    if (/workspace|checkout|escrow|evaluation|credential/.test(lower)) {
        return 'Governed evaluation controls are incomplete, so approval cannot clear.'
    }
    return 'A named signoff lane remains blocked and the deal cannot advance until it is resolved.'
}

function getBlockerRecommendedAction(
    lower: string,
    context: DealRouteContext
) {
    if (/residency|privacy|export|region/.test(lower)) {
        return 'Resolve the residency language and attach the updated export restriction matrix.'
    }
    if (/registry|provider|authority|authenticity|publication/.test(lower)) {
        return 'Update the provider packet with the missing authenticity or publication evidence.'
    }
    if (/rights|legal|commercial|scope|quote/.test(lower)) {
        return context.quote
            ? 'Amend the rights package and circulate the updated commercial scope for review.'
            : 'Create the initial rights package so the commercial scope can move forward.'
    }
    if (/workspace|checkout|escrow|evaluation|credential/.test(lower)) {
        return (
            context.lifecycleRecord?.nextAction ??
            'Complete checkout or workspace issuance before reopening the signoff lane.'
        )
    }
    return 'Resolve the blocker in the linked approval packet and return the lane to review.'
}

function getBlockerRouting(
    lower: string,
    context: DealRouteContext,
    demo: boolean
): DealBlockerBoardItem['cta'] {
    if (/residency|privacy|export|region/.test(lower)) {
        const available = !demo && context.surfaceAvailability['residency-memo'] === 'available'

        return {
            label: 'Open residency memo',
            to: available ? context.routeTargets['residency-memo'] : undefined,
            disabled: !available
        }
    }

    if (/registry|provider|authority|authenticity|publication/.test(lower)) {
        return {
            label: 'Open provider packet',
            to: demo
                ? context.demoTargets['provider-packet']
                : context.routeTargets['provider-packet']
        }
    }

    if (/rights|legal|commercial|scope|quote/.test(lower)) {
        return {
            label: context.quote ? 'Refine rights package' : 'Build rights package',
            to: buildBuyerAwareRoute(
                `/datasets/${context.seed.datasetId}/rights-quote`,
                demo
            )
        }
    }

    if (/workspace|checkout|escrow|evaluation|credential/.test(lower)) {
        return {
            label: 'Start escrow checkout',
            to: buildBuyerAwareRoute(
                `/datasets/${context.seed.datasetId}/escrow-checkout`,
                demo
            )
        }
    }

    return {
        label: 'Review approval artifact',
        to: !demo && context.surfaceAvailability.approval === 'available'
            ? context.routeTargets.approval
            : undefined,
        disabled: demo || context.surfaceAvailability.approval === 'placeholder'
    }
}

function toneFromEvidenceStatus(status: 'Ready' | 'In Review' | 'Blocked') {
    if (status === 'Ready') return 'emerald'
    if (status === 'Blocked') return 'rose'
    return 'amber'
}

function toneFromAuditTone(
    tone: 'info' | 'success' | 'warning' | 'critical'
): DealArtifactPreviewTone {
    if (tone === 'success') return 'emerald'
    if (tone === 'warning') return 'amber'
    if (tone === 'critical') return 'rose'
    return 'cyan'
}

function findIncidentEventTimestamp(proofBundle: DealDossierProofBundle) {
    if (!proofBundle.incidentRecord) return undefined

    return proofBundle.auditTimeline.find(
        event =>
            event.id.includes(proofBundle.incidentRecord?.id ?? '') ||
            event.action === proofBundle.incidentRecord?.title
    )?.at
}

function buildAuditEventType(action: string) {
    const lower = action.toLowerCase()

    if (/incident|dispute/.test(lower)) return 'Incident'
    if (/evidence pack|registry|review/.test(lower)) return 'Evidence review'
    if (/funds|escrow|release/.test(lower)) return 'Settlement'
    if (/access|session|credential/.test(lower)) return 'Evaluation'
    if (/request|approval/.test(lower)) return 'Approval'

    return 'Lifecycle'
}

function buildRelatedObject(event: DealDossierProofBundle['auditTimeline'][number]) {
    return (
        event.controls.find(control => /^Evidence pack /.test(control)) ??
        event.controls[0] ??
        'Deal lifecycle record'
    )
}

function buildExceptionLinkage(
    event: DealDossierProofBundle['auditTimeline'][number],
    proofBundle: DealDossierProofBundle
) {
    if (
        proofBundle.incidentRecord &&
        (event.id.includes(proofBundle.incidentRecord.id) ||
            event.action === proofBundle.incidentRecord.title)
    ) {
        return `Incident ${proofBundle.incidentRecord.id}`
    }

    return (
        event.controls.find(control => /exception|incident/i.test(control)) ??
        (proofBundle.evidencePack?.status === 'Blocked'
            ? `${proofBundle.evidencePack.id} blocker`
            : 'No linked incident')
    )
}

function formatAuditActor(actorId: string) {
    return actorId
        .replace(/^review_/, 'review ')
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ')
}

function formatUsd(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)
}

function formatDateLabel(value?: string | null) {
    if (!value) return 'Pending'

    let normalized = value.replace(' · ', ' ')
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        normalized = `${normalized}T00:00:00Z`
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})? UTC$/.test(value)) {
        normalized = `${value.replace(' UTC', '').replace(' ', 'T')}Z`
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/.test(normalized)) {
        normalized = `${normalized.replace(' ', 'T')}Z`
    }

    const parsed = Date.parse(normalized)
    if (Number.isNaN(parsed)) return value

    const hasTime = /:\d{2}/.test(value)
    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        ...(hasTime
            ? {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
              }
            : {}),
        timeZone: 'UTC'
    })
    const parts = formatter.formatToParts(new Date(parsed))
    const month = parts.find(part => part.type === 'month')?.value ?? ''
    const day = parts.find(part => part.type === 'day')?.value ?? ''
    const year = parts.find(part => part.type === 'year')?.value ?? ''

    if (!hasTime) return `${month} ${day}, ${year}`

    const hour = parts.find(part => part.type === 'hour')?.value ?? '00'
    const minute = parts.find(part => part.type === 'minute')?.value ?? '00'

    return `${month} ${day}, ${year} · ${hour}:${minute}`
}

function getToneBadgeClasses(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    return 'border-white/12 bg-white/5 text-slate-200'
}

function getToneNoteClasses(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'border-rose-400/22 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/22 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/22 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/22 bg-cyan-500/10 text-cyan-100'
    return 'border-white/10 bg-white/5 text-slate-300'
}

function getTonePanelClasses(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'border-rose-400/18 bg-rose-500/8'
    if (tone === 'amber') return 'border-amber-400/18 bg-amber-500/8'
    if (tone === 'emerald') return 'border-emerald-400/18 bg-emerald-500/8'
    if (tone === 'cyan') return 'border-cyan-400/18 bg-cyan-500/8'
    return 'border-white/8 bg-slate-950/45'
}

function buildBuyerAwareRoute(to: string, demo: boolean) {
    if (!demo) return to
    if (to.startsWith('/datasets/')) return `/demo${to}`
    if (to.startsWith('/access-requests/')) return `/demo${to}`
    if (to === '/compliance-passport') return '/demo/compliance-passport'
    return to
}
