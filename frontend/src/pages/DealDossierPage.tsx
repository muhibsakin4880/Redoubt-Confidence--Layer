import { Link, useParams } from 'react-router-dom'
import DealProgressTracker from '../components/DealProgressTracker'
import DealArtifactPreviewGrid from '../components/deals/DealArtifactPreviewGrid'
import DealRelationshipRail from '../components/deals/DealRelationshipRail'
import { SEEDED_DEAL_ROUTES } from '../data/dealDossierData'
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
    type DealArtifactPreviewTone
} from '../domain/dealArtifactPreview'
import { getDealRouteContextById } from '../domain/dealDossier'

type DealDossierPageProps = {
    demo?: boolean
}

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

const severityClasses = {
    Low: 'border-white/12 bg-white/5 text-slate-200',
    Medium: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    High: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
} as const

const auditToneClasses = {
    info: 'border-cyan-400/22 bg-cyan-500/10 text-cyan-100',
    success: 'border-emerald-400/22 bg-emerald-500/10 text-emerald-100',
    warning: 'border-amber-400/22 bg-amber-500/10 text-amber-100',
    critical: 'border-rose-400/22 bg-rose-500/10 text-rose-100'
} as const

export default function DealDossierPage({
    demo = false
}: DealDossierPageProps) {
    const { dealId } = useParams<{ dealId: string }>()
    const context = getDealRouteContextById(dealId)

    if (!context) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Deal dossier not found
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Unknown deal id</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The dossier shell is wired, but this seed id does not exist in the current demo workspace.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {SEEDED_DEAL_ROUTES.map(record => (
                                <Link
                                    key={record.dealId}
                                    to={demo ? `/demo/deals/${record.dealId}` : `/deals/${record.dealId}`}
                                    className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    {record.dealId} · {record.label}
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        )
    }

    const passportMeta = passportStatusMeta(context.passport.status)
    const requestBasisFields = context.request ? buildRequestBasisFields(context.request) : []
    const quote = context.quote
    const quoteValue = quote ? formatUsd(quote.totalUsd) : 'Not priced yet'
    const quoteDetail = quote
        ? `${quote.id} · ${quote.riskBand} rights band`
        : 'Create a rights package to price the deal and move into escrow-native checkout.'
    const blockers = context.lifecycleRecord?.blockers ?? []
    const signals = context.lifecycleRecord?.signals ?? []
    const proofBundle = buildDealDossierProofBundle(context)
    const auditEvents = [...proofBundle.auditTimeline].reverse().slice(0, 7)
    const releaseChecklist = context.lifecycleRecord?.releaseReadiness.checklist ?? []
    const datasetLinks = [
        context.dataset ? { label: 'Open dataset detail', to: buildBuyerAwareRoute(`/datasets/${context.dataset.id}`, demo) } : null,
        context.request ? { label: 'Open request detail', to: buildBuyerAwareRoute(`/access-requests/${context.request.id}`, demo) } : null,
        { label: quote ? 'Refine rights package' : 'Build rights package', to: buildBuyerAwareRoute(`/datasets/${context.seed.datasetId}/rights-quote`, demo) },
        { label: 'Open governed checkout', to: buildBuyerAwareRoute(`/datasets/${context.seed.datasetId}/escrow-checkout`, demo) },
        !demo ? { label: 'Open approval artifact', to: context.routeTargets.approval } : null,
        !demo ? { label: 'Open negotiation history', to: context.routeTargets.negotiation } : null,
        { label: 'Open output review', to: demo ? context.demoTargets['output-review'] : context.routeTargets['output-review'] }
    ].filter((item): item is { label: string; to: string } => Boolean(item))

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link to={demo ? '/demo/deals' : '/deals'} className="transition-colors hover:text-white">
                        Deals
                    </Link>
                    <span>/</span>
                    <span className="text-slate-200">{context.seed.dealId}</span>
                </div>

                <header className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {demo ? 'Public demo dossier shell' : 'Evaluation dossier shell'}
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Evaluation Dossier
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            The canonical deal object that binds the dataset, request basis, reusable compliance context, rights package, approval blockers, governed evaluation state, and settlement posture into one shared view.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                            {context.seed.dealId}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {context.currentStageLabel}
                        </span>
                    </div>
                </header>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Dataset"
                        value={context.dataset?.title ?? 'Pending dataset link'}
                        detail={`datasetId ${context.seed.datasetId}`}
                        tone="cyan"
                    />
                    <SummaryCard
                        label="Request"
                        value={context.request ? requestStatusLabel(context.request.status) : 'Pending request mapping'}
                        detail={context.request?.requestNumber ?? context.seed.requestId}
                        tone="amber"
                    />
                    <SummaryCard
                        label="Passport"
                        value={passportMeta.label}
                        detail={`${context.passport.completionPercent}% complete · ${context.passportId}`}
                        tone="emerald"
                    />
                    <SummaryCard
                        label="Rights package"
                        value={quoteValue}
                        detail={quoteDetail}
                        tone={quote ? 'cyan' : 'amber'}
                    />
                </section>

                <div className="mt-8">
                    <DealProgressTracker model={context.dealProgress} compact />
                </div>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Deal overview</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">{context.seed.label}</h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">{context.seed.summary}</p>
                                </div>
                                <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Current lifecycle</div>
                                    <div className="mt-2 text-lg font-semibold text-white">{context.currentStageLabel}</div>
                                    <div className="mt-2 text-xs leading-5 text-cyan-100/85">{context.currentStageDetail}</div>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                {datasetLinks.map(link => (
                                    <Link
                                        key={`${context.seed.dealId}-${link.to}`}
                                        to={link.to}
                                        className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Dataset summary</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">{context.dataset?.title ?? 'Dataset summary pending'}</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        {context.dataset?.description ?? 'The seeded deal can already resolve a dataset id, but the detailed dataset summary will expand in later steps.'}
                                    </p>
                                </div>
                                {context.dataset ? (
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[context.dataset.access.status]}`}>
                                        {requestStatusLabel(context.dataset.access.status)}
                                    </span>
                                ) : null}
                            </div>

                            {context.dataset ? (
                                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <MetricTile label="Category" value={context.dataset.category} />
                                    <MetricTile label="Coverage" value={context.dataset.recordCount} />
                                    <MetricTile label="Payload size" value={context.dataset.size} />
                                    <MetricTile label="Confidence" value={`${context.dataset.confidenceScore}%`} />
                                </div>
                            ) : null}

                            {context.dataset ? (
                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <ShellList
                                        title="Allowed usage cues"
                                        items={context.dataset.access.allowedUsage.slice(0, 3)}
                                    />
                                    <ShellList
                                        title="Access instructions"
                                        items={context.dataset.access.instructions.slice(0, 3)}
                                    />
                                </div>
                            ) : null}
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Request basis</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Why the buyer is asking</h2>
                                    </div>
                                    {context.request ? (
                                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${providerReviewStatusStyles[getProviderReviewStatus(context.request)]}`}>
                                            {getProviderReviewStatus(context.request)}
                                        </span>
                                    ) : null}
                                </div>

                                {context.request ? (
                                    <div className="mt-5 grid gap-3">
                                        {requestBasisFields.map(field => (
                                            <FieldRow key={`${context.request?.id}-${field.label}`} label={field.label} value={field.value} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyStateCopy text="The dossier shell is ready even when the request mapping is still thin. Later steps will deepen the cross-object proof." />
                                )}
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Compliance passport</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Reusable buyer context</h2>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${passportMeta.classes}`}>
                                        {passportMeta.label}
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <FieldRow label="Organization" value={context.passport.organization.organizationName} />
                                    <FieldRow label="Role" value={context.passport.organization.roleInOrganization} />
                                    <FieldRow label="Default term" value={context.passport.defaultDuration} />
                                    <FieldRow label="Preferred access" value={describeAccessMode(context.passport.preferredAccessMode)} />
                                </div>

                                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-100/90">
                                    {passportMeta.detail}
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Rights package</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Commercial and scope shell</h2>

                                {quote ? (
                                    <div className="mt-5 space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <MetricTile label="Quote id" value={quote.id} />
                                            <MetricTile label="Total" value={formatUsd(quote.totalUsd)} />
                                            <MetricTile label="Escrow hold" value={formatUsd(quote.escrowHoldUsd)} />
                                        </div>

                                        <ShellList title="Rights summary" items={quote.rightsSummary.slice(0, 4)} />
                                    </div>
                                ) : (
                                    <EmptyStateCopy text="No rights quote has been saved yet. This shell is ready to become the canonical deal object as soon as the first priced rights package exists." />
                                )}
                            </article>

                            <article className={panelClass}>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Current lifecycle posture</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">What the deal is waiting on</h2>

                                <div className="mt-5 space-y-4">
                                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/8 px-4 py-4">
                                        <div className="text-sm font-semibold text-white">{context.dealProgress.headline}</div>
                                        <p className="mt-2 text-sm leading-6 text-cyan-100/85">{context.dealProgress.nextAction}</p>
                                    </div>

                                    <ShellList
                                        title="Active blockers"
                                        items={blockers.length > 0 ? blockers.slice(0, 3) : ['No blocking issue is preventing the shell from resolving the current deal state.']}
                                        danger={blockers.length > 0}
                                    />
                                    <ShellList
                                        title="Current signals"
                                        items={signals.length > 0 ? signals.slice(0, 3) : ['Signals will deepen once more quote, approval, and evaluation artifacts are attached.']}
                                    />
                                </div>
                            </article>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <article className={panelClass}>
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Approval blockers</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Evidence pack and review gates</h2>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {proofBundle.reviewId ? (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                {proofBundle.reviewId}
                                            </span>
                                        ) : null}
                                        {proofBundle.evidencePack ? (
                                            <StatusPill tone={toneFromPackStatus(proofBundle.evidencePack.status)} label={proofBundle.evidencePack.status} />
                                        ) : null}
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-300">
                                    {proofBundle.evidencePack?.scope ?? 'This deal already resolves the lifecycle shell, but the attached approval packet is still thin until a seeded review pack is linked.'}
                                </p>

                                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <MetricTile label="Review id" value={proofBundle.reviewId ?? 'Pending'} />
                                    <MetricTile label="Evidence pack" value={proofBundle.evidencePack?.id ?? 'Not attached'} />
                                    <MetricTile label="Owner" value={proofBundle.evidencePack?.owner ?? 'Awaiting owner'} />
                                    <MetricTile label="Updated" value={proofBundle.evidencePack?.updatedAt ?? 'Pending'} />
                                </div>

                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <ShellList
                                        title="Evidence pack contents"
                                        items={
                                            proofBundle.evidencePack?.contents.length
                                                ? proofBundle.evidencePack.contents
                                                : ['Rights packet summaries, deployment notes, and approval rationale will render here once the pack is linked.']
                                        }
                                    />
                                    <ShellList
                                        title="Deployment posture"
                                        items={
                                            proofBundle.deploymentSurface
                                                ? [
                                                    proofBundle.deploymentSurface.deploymentMode,
                                                    proofBundle.deploymentSurface.residencyPosture,
                                                    proofBundle.deploymentSurface.evaluationStatus
                                                ]
                                                : ['Deployment and residency posture will be attached to the review packet in a later step.']
                                        }
                                    />
                                </div>

                                <div className="mt-5 space-y-3">
                                    {proofBundle.approvalBlockers.length > 0 ? (
                                        proofBundle.approvalBlockers.map(blocker => (
                                            <div
                                                key={blocker.id}
                                                className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="max-w-2xl">
                                                        <div className="text-sm font-semibold text-white">{blocker.blocker}</div>
                                                        <div className="mt-2 text-xs leading-5 text-slate-400">
                                                            Owner {blocker.owner} · deadline {blocker.deadline}
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${severityClasses[blocker.severity]}`}>
                                                        {blocker.severity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyStateCopy text="No seeded approval blocker is attached yet. The dossier is ready for deeper signoff and policy exception artifacts in the next phase." />
                                    )}
                                </div>
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{proofBundle.evaluationState.label}</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">{proofBundle.evaluationState.title}</h2>
                                    </div>
                                    <StatusPill tone={proofBundle.evaluationState.tone} label={proofBundle.evaluationState.status} />
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-300">{proofBundle.evaluationState.summary}</p>

                                <div className="mt-5 grid gap-4 md:grid-cols-3">
                                    <MetricTile
                                        label="Escrow hold"
                                        value={context.checkoutRecord ? formatUsd(context.checkoutRecord.funding.escrowHoldUsd) : quote ? formatUsd(quote.escrowHoldUsd) : 'Pending'}
                                    />
                                    <MetricTile
                                        label="Evaluation fee"
                                        value={context.checkoutRecord ? formatUsd(context.checkoutRecord.outcomeProtection.evaluationFeeUsd) : 'Pending'}
                                    />
                                    <MetricTile
                                        label="Review window"
                                        value={context.checkoutRecord ? `${context.checkoutRecord.configuration.reviewWindowHours} hrs` : quote ? `${quote.input.validationWindowHours} hrs` : 'Pending'}
                                    />
                                </div>

                                <div className="mt-5">
                                    <ShellList title="Operational checkpoints" items={proofBundle.evaluationState.highlights} />
                                </div>

                                {proofBundle.evaluationState.note ? (
                                    <div className={`mt-5 rounded-2xl border px-4 py-3 text-xs leading-5 ${getToneNoteClasses(proofBundle.evaluationState.tone)}`}>
                                        {proofBundle.evaluationState.note}
                                    </div>
                                ) : null}
                            </article>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{proofBundle.settlementState.label}</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">{proofBundle.settlementState.title}</h2>
                                    </div>
                                    <StatusPill tone={proofBundle.settlementState.tone} label={proofBundle.settlementState.status} />
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-300">{proofBundle.settlementState.summary}</p>

                                <div className="mt-5">
                                    <ShellList
                                        title="Settlement detail"
                                        items={proofBundle.settlementState.highlights}
                                        danger={proofBundle.settlementState.tone === 'rose'}
                                    />
                                </div>

                                {releaseChecklist.length > 0 ? (
                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        {releaseChecklist.map(item => (
                                            <div
                                                key={item.key}
                                                className={`rounded-2xl border px-4 py-3 ${
                                                    item.passed
                                                        ? 'border-emerald-400/18 bg-emerald-500/8'
                                                        : 'border-amber-400/18 bg-amber-500/8'
                                                }`}
                                            >
                                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                    Release gate
                                                </div>
                                                <div className="mt-2 text-sm font-semibold text-white">{item.label}</div>
                                                <div className="mt-2 text-xs text-slate-300">
                                                    {item.passed ? 'Passed' : 'Still requires follow-up'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                                {proofBundle.settlementState.note ? (
                                    <div className={`mt-5 rounded-2xl border px-4 py-3 text-xs leading-5 ${getToneNoteClasses(proofBundle.settlementState.tone)}`}>
                                        {proofBundle.settlementState.note}
                                    </div>
                                ) : null}
                            </article>

                            <article className={panelClass}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Artifact previews</div>
                                        <h2 className="mt-2 text-xl font-semibold text-white">Deal proof artifacts</h2>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                        {proofBundle.artifactPreviews.length} previews
                                    </span>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-300">
                                    These previews make the deal feel like a governed object instead of a loose collection of pages by showing the contract, evidence, approval, and dispute surfaces side by side.
                                </p>

                                <div className="mt-5">
                                    <DealArtifactPreviewGrid artifacts={proofBundle.artifactPreviews} />
                                </div>
                            </article>
                        </section>

                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Audit timeline</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What the platform has recorded so far</h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                        {auditEvents.length} visible event{auditEvents.length === 1 ? '' : 's'}
                                    </span>
                                    {proofBundle.incidentRecord ? (
                                        <StatusPill tone="amber" label="Incident-linked evidence" />
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {auditEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4"
                                    >
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="max-w-3xl">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${auditToneClasses[event.tone]}`}>
                                                        {event.lifecycleLabel}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{event.at}</span>
                                                </div>
                                                <div className="mt-3 text-sm font-semibold text-white">{event.action}</div>
                                                {event.reason ? (
                                                    <p className="mt-2 text-sm leading-6 text-slate-300">{event.reason}</p>
                                                ) : null}
                                            </div>
                                            <div className="rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-3 text-xs leading-5 text-slate-300">
                                                <div className="font-semibold text-slate-100">Hash pointer</div>
                                                <div className="mt-1 break-all">{event.hashPointer}</div>
                                            </div>
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
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside>
                        <DealRelationshipRail context={context} demo={demo} />
                    </aside>
                </section>
            </div>
        </div>
    )
}

function SummaryCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: 'cyan' | 'amber' | 'emerald'
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-3 text-xl font-semibold ${getToneClass(tone)}`}>{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </article>
    )
}

function MetricTile({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-base font-semibold text-white">{value}</div>
        </div>
    )
}

function FieldRow({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function ShellList({
    title,
    items,
    danger = false
}: {
    title: string
    items: string[]
    danger?: boolean
}) {
    return (
        <div className={`rounded-2xl border px-4 py-4 ${danger ? 'border-rose-500/20 bg-rose-500/8' : 'border-white/8 bg-slate-950/45'}`}>
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{title}</div>
            <div className="mt-3 space-y-2">
                {items.map(item => (
                    <div key={item} className="flex gap-2 text-sm leading-6 text-slate-200">
                        <span className={`mt-2 h-1.5 w-1.5 rounded-full ${danger ? 'bg-rose-300' : 'bg-cyan-300'}`} />
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
        <div className="mt-5 rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-4 py-5 text-sm leading-6 text-slate-400">
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
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getToneBadgeClasses(tone)}`}>
            {label}
        </span>
    )
}

function formatUsd(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)
}

function getToneClass(tone: 'cyan' | 'amber' | 'emerald') {
    if (tone === 'cyan') return 'text-cyan-200'
    if (tone === 'amber') return 'text-amber-200'
    return 'text-emerald-200'
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

function toneFromPackStatus(status: 'Ready' | 'In Review' | 'Blocked'): DealArtifactPreviewTone {
    if (status === 'Ready') return 'emerald'
    if (status === 'Blocked') return 'rose'
    return 'amber'
}

function buildBuyerAwareRoute(to: string, demo: boolean) {
    if (!demo) return to
    if (to.startsWith('/datasets/')) return `/demo${to}`
    if (to.startsWith('/access-requests/')) return `/demo${to}`
    if (to === '/compliance-passport') return '/demo/compliance-passport'
    return to
}
