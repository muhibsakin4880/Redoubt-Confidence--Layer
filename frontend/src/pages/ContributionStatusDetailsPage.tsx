import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAccessPackageForContribution } from '../data/datasetAccessPackageData'
import { buildDealPath, getDealRouteRecordByDatasetId } from '../data/dealDossierData'
import {
    getContributionRecordById,
    isProviderSubmittedContribution,
    pipelineStateStyles,
    statusStyles,
    validationStages,
    type ContributionChecklistItem,
    type ContributionOperationalModule,
    type ContributionRecord,
    type ContributionStatus,
    type ContributionTone,
    type PipelineState
} from '../data/contributionStatusData'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'

const statusPageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const statusPageShellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const statusSectionClass = dashboardSpacingTokens['section-gap']
const statusSectionIntroClass = dashboardSpacingTokens['section-intro']
const statusPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] before:content-['']`
const statusCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding-compact']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] before:content-['']`
const statusHeroClass = `${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`
const primaryActionButtonClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding']}`
const secondaryActionButtonClass = `inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`

const statusText = {
    eyebrow: dashboardTypographyTokens['text-eyebrow'],
    heroEyebrow: dashboardTypographyTokens['text-hero-eyebrow'],
    heroTitle: dashboardTypographyTokens['text-hero-title'],
    sectionTitle: dashboardTypographyTokens['text-section-title'],
    panelTitle: dashboardTypographyTokens['text-panel-title'],
    itemTitle: dashboardTypographyTokens['text-item-title'],
    body: dashboardTypographyTokens['text-body'],
    bodyStrong: dashboardTypographyTokens['text-body-strong'],
    meta: dashboardTypographyTokens['text-muted'],
    metaStrong: dashboardTypographyTokens['text-muted-strong'],
    value: dashboardTypographyTokens['text-value']
} as const

export default function ContributionStatusDetailsPage() {
    const { id } = useParams<'id'>()
    const contribution = getContributionRecordById(id)

    if (!contribution) {
        return (
            <div className={statusPageClass}>
                <div className={dashboardComponentTokens['page-background']} />
                <div className={statusPageShellClass}>
                    <section className={statusSectionClass}>
                        <div className={statusHeroClass}>
                            <div className="relative max-w-3xl">
                                <div className={statusText.heroEyebrow}>Dataset status</div>
                                <h1 className={`mt-2 ${statusText.heroTitle}`}>Dataset record not found</h1>
                                <p className={`mt-3 max-w-2xl ${statusText.bodyStrong}`}>
                                    The provider dataset route is available, but this dataset id does not match an active dataset record in the current demo workspace.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link to="/provider/dashboard" className={primaryActionButtonClass}>
                                        Back to Provider Dashboard
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )
    }

    const statusMeta = getContributionStatusMeta(contribution.status)
    const dealRoute = getDealRouteRecordByDatasetId(contribution.datasetId)
    const accessPackage = contribution.status === 'Approved' || contribution.status === 'Restricted' || isProviderSubmittedContribution(contribution.id)
        ? getAccessPackageForContribution(contribution.id)
        : null

    return (
        <div data-contribution-status-id={contribution.id} className={statusPageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={statusPageShellClass}>
                <section className={statusSectionClass} aria-labelledby="contribution-status-hero">
                    <div className={`${statusHeroClass} ${statusMeta.heroSurfaceClassName}`}>
                        <div className={`pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full blur-3xl ${statusMeta.heroOrbClassName}`} />
                        <div className={`pointer-events-none absolute right-6 top-4 h-44 w-44 rounded-full blur-3xl ${statusMeta.heroHaloClassName}`} />

                        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.92fr)]">
                            <div>
                                <Link
                                    to="/provider/dashboard"
                                    className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Provider Dashboard
                                </Link>

                                <div className={`mt-5 ${statusText.heroEyebrow}`}>Dataset status</div>
                                <h1 id="contribution-status-hero" className={`mt-2 ${statusText.heroTitle}`}>
                                    {contribution.title}
                                </h1>
                                <p className={`mt-3 max-w-3xl ${statusText.bodyStrong}`}>
                                    {contribution.statusPage.heroSummary}
                                </p>
                                <p className={`mt-3 max-w-3xl ${statusText.body}`}>
                                    {contribution.statusPage.operationalPosture}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${statusStyles[contribution.status]}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.dotClassName}`} />
                                        {contribution.status}
                                    </span>
                                    <HeroMetricChip label="Submission" value={contribution.submissionId} />
                                    <HeroMetricChip label="Uploaded" value={contribution.uploadedAt} />
                                    <HeroMetricChip label="Records" value={contribution.records} />
                                    <HeroMetricChip label="Last update" value={contribution.statusPage.lastUpdated} />
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link to="/provider/dashboard" className={primaryActionButtonClass}>
                                        Back to Provider Dashboard
                                    </Link>
                                    <Link to="/provider/institution-review" className={secondaryActionButtonClass}>
                                        Institution review
                                    </Link>
                                    {contribution.statusPage.secondaryAction && !dealRoute ? (
                                        <Link to={contribution.statusPage.secondaryAction.to} className={secondaryActionButtonClass}>
                                            {contribution.statusPage.secondaryAction.label}
                                        </Link>
                                    ) : null}
                                    {dealRoute ? (
                                        <>
                                            <Link to={buildDealPath(dealRoute.dealId, 'dossier')} className={secondaryActionButtonClass}>
                                                Request Evaluation
                                            </Link>
                                            <Link to={buildDealPath(dealRoute.dealId, 'provider-packet')} className={secondaryActionButtonClass}>
                                                Open provider packet
                                            </Link>
                                        </>
                                    ) : null}
                                </div>
                            </div>

                            <StatusPanel
                                eyebrow="Action console"
                                title="What needs attention now"
                                description="A compact operating view of the current owner, live posture, and next move."
                                className={statusMeta.panelAccentClassName}
                            >
                                <div className="grid gap-3">
                                    <QuickSignal label="Owner / reviewer" value={contribution.statusPage.ownerLabel} />
                                    <QuickSignal label="Live posture" value={contribution.accessActivity} />
                                    <QuickSignal label="Next action" value={contribution.statusPage.nextAction} />
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <MetricMiniCard
                                        label="Reliability"
                                        value={`${contribution.performance.avgReliability}%`}
                                        toneClassName={statusMeta.valueClassName}
                                    />
                                    <MetricMiniCard
                                        label={contribution.status === 'Approved' ? 'Approved requests' : 'Requests observed'}
                                        value={
                                            contribution.status === 'Approved'
                                                ? `${contribution.performance.approvedRequests}`
                                                : `${contribution.performance.totalRequests}`
                                        }
                                        toneClassName="text-slate-100"
                                    />
                                </div>
                            </StatusPanel>
                        </div>
                    </div>
                </section>

                <section className={statusSectionClass} aria-labelledby="status-action-row">
                    <div className={statusSectionIntroClass}>
                        <h2 id="status-action-row" className={statusText.sectionTitle}>First action row</h2>
                        <p className={`mt-2 ${statusText.body}`}>This row answers where the submission is, what needs attention, and what should happen next.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        {contribution.statusPage.actionConsole.map(item => (
                            <ActionConsoleCard key={item.label} item={item} />
                        ))}
                    </div>
                </section>

                <section className={statusSectionClass} aria-labelledby="status-validation">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.88fr)]">
                        <StatusPanel
                            eyebrow="Validation pipeline"
                            title="Pipeline progression"
                            description={`Progress tracker for ${contribution.title}.`}
                            id="status-validation"
                        >
                            <div className="grid gap-3 md:grid-cols-5">
                                {validationStages.map((stage, index) => {
                                    const state = contribution.validationPipeline[index] ?? 'pending'
                                    return (
                                        <PipelineStageCard
                                            key={stage}
                                            stage={stage}
                                            state={state}
                                            isLast={index === validationStages.length - 1}
                                        />
                                    )
                                })}
                            </div>
                        </StatusPanel>

                        <div className="space-y-6">
                            <StatusPanel
                                eyebrow={contribution.feedback.length > 0 ? 'Reviewer findings' : 'Findings'}
                                title={contribution.feedback.length > 0 ? 'Active findings' : 'No active findings'}
                                description={
                                    contribution.feedback.length > 0
                                        ? 'The issues or warnings currently attached to this dataset submission.'
                                        : 'The current review run is not carrying an active issue list.'
                                }
                            >
                                <FindingsPanel contribution={contribution} />
                            </StatusPanel>

                            <StatusPanel
                                eyebrow="Operator checklist"
                                title={contribution.statusPage.checklistTitle}
                                description="The short list of things an operator or contributor should keep in view for this status."
                            >
                                <div className="space-y-3">
                                    {contribution.statusPage.checklist.map(item => (
                                        <ChecklistRow key={item.title} item={item} />
                                    ))}
                                </div>
                            </StatusPanel>
                        </div>
                    </div>
                </section>

                <section className={statusSectionClass} aria-labelledby="status-operational-modules">
                    <div className={statusSectionIntroClass}>
                        <h2 id="status-operational-modules" className={statusText.sectionTitle}>Operational modules</h2>
                        <p className={`mt-2 ${statusText.body}`}>Status-specific operating context so each dataset submission state feels purposeful rather than generic.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                        {accessPackage ? <AccessPackagePanel contribution={contribution} /> : null}
                        {contribution.statusPage.modules.map(module => (
                            <OperationalModulePanel key={`${module.eyebrow}-${module.title}`} module={module} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

function HeroMetricChip({ label, value }: { label: string; value: string }) {
    return (
        <span className={`inline-flex items-center gap-2 ${dashboardRadiusTokens['radius-pill']} ${dashboardComponentTokens['metric-chip']} px-3 py-2 text-xs font-medium text-slate-200`}>
            <span className="uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className="text-slate-100">{value}</span>
        </span>
    )
}

function QuickSignal({ label, value }: { label: string; value: string }) {
    return (
        <div className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
            <div className={statusText.eyebrow}>{label}</div>
            <div className={`mt-2 ${statusText.bodyStrong}`}>{value}</div>
        </div>
    )
}

function MetricMiniCard({
    label,
    value,
    toneClassName
}: {
    label: string
    value: string
    toneClassName: string
}) {
    return (
        <div className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
            <div className={statusText.eyebrow}>{label}</div>
            <div className={`mt-2 text-xl font-semibold tracking-[-0.04em] ${toneClassName}`}>{value}</div>
        </div>
    )
}

function ActionConsoleCard({
    item
}: {
    item: ContributionRecord['statusPage']['actionConsole'][number]
}) {
    const toneMeta = getContributionToneMeta(item.tone)

    return (
        <article className={`${statusCardClass} ${toneMeta.surfaceClassName}`}>
            <div className="relative">
                <div className={`${statusText.eyebrow} ${toneMeta.labelClassName}`}>{item.label}</div>
                <div className={`mt-3 text-[1.55rem] font-semibold tracking-[-0.05em] ${toneMeta.valueClassName}`}>{item.value}</div>
                <p className={`mt-3 ${statusText.body}`}>{item.detail}</p>
            </div>
        </article>
    )
}

function PipelineStageCard({
    stage,
    state,
    isLast
}: {
    stage: string
    state: PipelineState
    isLast: boolean
}) {
    const style = pipelineStateStyles[state]

    return (
        <div className="relative">
            <div className={`h-full min-h-[126px] rounded-2xl border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-4 ${style.text}`}>
                <div className="flex items-center gap-2">
                    <span className={`inline-block h-3 w-3 rounded-full border ${style.dot}`} />
                    <span className="text-[11px] uppercase tracking-[0.14em]">{getPipelineStateLabel(stage, state)}</span>
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-100">{stage}</div>
                <p className={`mt-3 ${statusText.meta}`}>{getPipelineStateDetail(stage, state)}</p>
            </div>
            {!isLast ? (
                <span className={`absolute right-[-0.4rem] top-1/2 hidden h-[2px] w-3 -translate-y-1/2 md:block ${style.line}`} />
            ) : null}
        </div>
    )
}

function FindingsPanel({ contribution }: { contribution: ContributionRecord }) {
    if (contribution.feedback.length === 0) {
        return (
            <div className="rounded-[24px] border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-4">
                <div className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" aria-hidden="true" />
                    <div>
                        <div className={statusText.itemTitle}>{contribution.statusPage.emptyFindingsLabel}</div>
                        <p className={`mt-2 ${statusText.body}`}>
                            Automated validation is not surfacing a current issue list for this dataset submission status.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {contribution.feedback.map(issue => (
                <div
                    key={`${issue.type}-${issue.detail}`}
                    className={`rounded-[24px] border px-4 py-4 text-sm ${issue.severity === 'warning' ? 'border-amber-500/25 bg-amber-500/[0.08] text-amber-100' : 'border-rose-500/25 bg-rose-500/[0.08] text-rose-100'}`}
                >
                    <div className="flex items-start gap-3">
                        <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${issue.severity === 'warning' ? 'bg-amber-300' : 'bg-rose-300'}`}
                            aria-hidden="true"
                        />
                        <div>
                            <div className="font-semibold">{issue.type}</div>
                            <div className="mt-2 text-sm leading-6 opacity-90">{issue.detail}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function ChecklistRow({ item }: { item: ContributionChecklistItem }) {
    const toneMeta = getContributionToneMeta(item.tone)

    return (
        <div className={`${statusCardClass} ${toneMeta.surfaceClassName}`}>
            <div className="relative flex gap-3">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneMeta.dotClassName}`} aria-hidden="true" />
                <div>
                    <div className={statusText.itemTitle}>{item.title}</div>
                    <p className={`mt-2 ${statusText.body}`}>{item.detail}</p>
                </div>
            </div>
        </div>
    )
}

function AccessPackagePanel({ contribution }: { contribution: ContributionRecord }) {
    const accessPackage = getAccessPackageForContribution(contribution.id)

    return (
        <article className={`${statusPanelClass} ${contribution.status === 'Restricted' ? 'border-violet-400/20' : 'border-emerald-400/20'}`}>
            <div className={statusText.eyebrow}>Access package posture</div>
            <h3 className={`mt-2 ${statusText.panelTitle}`}>
                {contribution.status === 'Restricted' ? 'Restricted route controls' : 'Approved route controls'}
            </h3>
            <p className={`mt-2 ${statusText.body}`}>
                Live package terms pulled from the dataset access configuration already attached to this record.
            </p>

            <div className="mt-4 grid gap-3">
                <PackageFacet label="Access method" value={accessPackage.accessMethod.label} />
                <PackageFacet label="Delivery" value={accessPackage.deliveryDetail.label} />
                <PackageFacet label="Field access" value={accessPackage.fieldAccess.label} />
                <PackageFacet label="Geography" value={accessPackage.geography.label} />
                <PackageFacet label="Redistribution" value={accessPackage.advancedRights.redistribution} />
                <PackageFacet label="Audit logging" value={accessPackage.advancedRights.auditLogging} />
            </div>
        </article>
    )
}

function PackageFacet({ label, value }: { label: string; value: string }) {
    return (
        <div className={`rounded-[20px] border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
            <div className={statusText.eyebrow}>{label}</div>
            <div className={`mt-2 ${statusText.bodyStrong}`}>{value}</div>
        </div>
    )
}

function OperationalModulePanel({ module }: { module: ContributionOperationalModule }) {
    const toneMeta = getContributionToneMeta(module.tone)

    return (
        <article className={`${statusPanelClass} ${toneMeta.panelBorderClassName}`}>
            <div className={`${statusText.eyebrow} ${toneMeta.labelClassName}`}>{module.eyebrow}</div>
            <h3 className={`mt-2 ${statusText.panelTitle}`}>{module.title}</h3>
            <p className={`mt-2 ${statusText.body}`}>{module.description}</p>

            <div className="mt-4 grid gap-3">
                {module.items.map(item => (
                    <div key={`${item.label}-${item.value}`} className={`${statusCardClass} ${toneMeta.surfaceClassName}`}>
                        <div className={statusText.eyebrow}>{item.label}</div>
                        <div className={`mt-2 ${statusText.bodyStrong}`}>{item.value}</div>
                    </div>
                ))}
            </div>
        </article>
    )
}

function StatusPanel({
    eyebrow,
    title,
    description,
    children,
    id,
    className = ''
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    id?: string
    className?: string
}) {
    return (
        <section className={`${statusPanelClass} ${className}`.trim()} aria-labelledby={id}>
            <div className={statusText.eyebrow}>{eyebrow}</div>
            <h2 id={id} className={`mt-2 ${statusText.panelTitle}`}>
                {title}
            </h2>
            <p className={`mt-2 ${statusText.body}`}>{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function getContributionStatusMeta(status: ContributionStatus) {
    switch (status) {
        case 'Processing':
            return {
                heroSurfaceClassName: 'shadow-[0_35px_90px_-48px_rgba(59,130,246,0.28)]',
                heroOrbClassName: 'bg-blue-400/14',
                heroHaloClassName: 'bg-blue-300/10',
                panelAccentClassName: 'border-blue-400/20 bg-[#0E1729]/88',
                dotClassName: 'bg-blue-300',
                valueClassName: 'text-blue-200'
            }
        case 'Needs fixes':
            return {
                heroSurfaceClassName: 'shadow-[0_35px_90px_-48px_rgba(245,158,11,0.26)]',
                heroOrbClassName: 'bg-amber-400/14',
                heroHaloClassName: 'bg-amber-300/10',
                panelAccentClassName: 'border-amber-400/20 bg-[#171326]/88',
                dotClassName: 'bg-amber-300',
                valueClassName: 'text-amber-200'
            }
        case 'Restricted':
            return {
                heroSurfaceClassName: 'shadow-[0_35px_90px_-48px_rgba(167,139,250,0.26)]',
                heroOrbClassName: 'bg-violet-400/14',
                heroHaloClassName: 'bg-violet-300/10',
                panelAccentClassName: 'border-violet-400/20 bg-[#14132A]/88',
                dotClassName: 'bg-violet-300',
                valueClassName: 'text-violet-200'
            }
        case 'Rejected':
            return {
                heroSurfaceClassName: 'shadow-[0_35px_90px_-48px_rgba(244,63,94,0.24)]',
                heroOrbClassName: 'bg-rose-400/14',
                heroHaloClassName: 'bg-rose-300/10',
                panelAccentClassName: 'border-rose-400/20 bg-[#1A1226]/88',
                dotClassName: 'bg-rose-300',
                valueClassName: 'text-rose-200'
            }
        default:
            return {
                heroSurfaceClassName: 'shadow-[0_35px_90px_-48px_rgba(16,185,129,0.26)]',
                heroOrbClassName: 'bg-emerald-400/14',
                heroHaloClassName: 'bg-emerald-300/10',
                panelAccentClassName: 'border-emerald-400/20 bg-[#0E1729]/88',
                dotClassName: 'bg-emerald-300',
                valueClassName: 'text-emerald-200'
            }
    }
}

function getContributionToneMeta(tone: ContributionTone) {
    switch (tone) {
        case 'healthy':
            return {
                dotClassName: 'bg-emerald-300',
                labelClassName: 'text-emerald-200',
                valueClassName: 'text-emerald-200',
                surfaceClassName: 'border-emerald-500/20 bg-emerald-500/[0.05]',
                panelBorderClassName: 'border-emerald-400/20'
            }
        case 'progress':
            return {
                dotClassName: 'bg-blue-300',
                labelClassName: 'text-blue-200',
                valueClassName: 'text-blue-200',
                surfaceClassName: 'border-blue-500/20 bg-blue-500/[0.05]',
                panelBorderClassName: 'border-blue-400/20'
            }
        case 'attention':
            return {
                dotClassName: 'bg-amber-300',
                labelClassName: 'text-amber-200',
                valueClassName: 'text-amber-200',
                surfaceClassName: 'border-amber-500/20 bg-amber-500/[0.05]',
                panelBorderClassName: 'border-amber-400/20'
            }
        case 'restricted':
            return {
                dotClassName: 'bg-violet-300',
                labelClassName: 'text-violet-200',
                valueClassName: 'text-violet-200',
                surfaceClassName: 'border-violet-500/20 bg-violet-500/[0.05]',
                panelBorderClassName: 'border-violet-400/20'
            }
        case 'critical':
            return {
                dotClassName: 'bg-rose-300',
                labelClassName: 'text-rose-200',
                valueClassName: 'text-rose-200',
                surfaceClassName: 'border-rose-500/20 bg-rose-500/[0.05]',
                panelBorderClassName: 'border-rose-400/20'
            }
        default:
            return {
                dotClassName: 'bg-slate-400',
                labelClassName: 'text-slate-300',
                valueClassName: 'text-slate-100',
                surfaceClassName: 'border-slate-500/20 bg-slate-900/40',
                panelBorderClassName: 'border-slate-400/10'
            }
    }
}

function getPipelineStateLabel(stage: string, state: PipelineState) {
    if (stage === 'Compliance review' && state === 'pending') {
        return 'Awaiting review'
    }
    if (stage === 'Quality evaluation' && state === 'blocked') {
        return 'Blocked'
    }
    return state.charAt(0).toUpperCase() + state.slice(1)
}

function getPipelineStateDetail(stage: string, state: PipelineState) {
    if (stage === 'Schema analysis' && state === 'current') {
        return 'Field normalization and partition typing are currently active.'
    }
    if (stage === 'Quality evaluation' && state === 'blocked') {
        return 'The run cannot progress until the contributor corrects the flagged quality defects.'
    }
    if (stage === 'Compliance review' && state === 'pending') {
        return 'Compliance screening will begin after the quality gate clears.'
    }
    if (stage === 'Compliance review' && state === 'complete') {
        return 'Policy, residency, and exposure review are complete for this run.'
    }
    if (stage === 'Approved for access' && state === 'complete') {
        return 'Access packaging is active for approved participant workflows.'
    }
    if (state === 'complete') {
        return 'This stage has cleared for the current submission.'
    }
    if (state === 'pending') {
        return 'This stage has not started yet.'
    }
    return 'This stage is the current operating checkpoint.'
}
