import { Link, useParams } from 'react-router-dom'
import { getAccessPackageForContribution } from '../data/datasetAccessPackageData'
import { buildDealPath, getDealRouteRecordByDatasetId } from '../data/dealDossierData'
import { getContributionRecordById, statusStyles } from '../data/contributionStatusData'

type SummaryItem = {
    label: string
    value: string
}

export default function ContributionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const dataset = getContributionRecordById(id)

    if (!dataset) {
        return (
            <div className="container mx-auto space-y-6 px-4 py-10 text-white">
                <Link
                    to="/provider/dashboard"
                    className="inline-flex items-center text-sm text-slate-400 transition-colors hover:text-white"
                >
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Provider Dashboard
                </Link>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl">
                    <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Provider dataset</div>
                    <h1 className="mt-2 text-2xl font-bold">Dataset record not found</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                        This provider dataset route is available, but the requested dataset id does not match an active record in the demo workspace.
                    </p>
                </div>
            </div>
        )
    }

    const accessPackage = getAccessPackageForContribution(dataset.id)
    const dealRoute = getDealRouteRecordByDatasetId(dataset.datasetId)

    const submissionTerms: SummaryItem[] = [
        { label: 'Access method', value: accessPackage.accessMethod.label },
        { label: 'Delivery detail', value: accessPackage.deliveryDetail.label },
        { label: 'Field access', value: accessPackage.fieldAccess.label },
        { label: 'Usage rights', value: accessPackage.usageRights.label },
        { label: 'Term', value: accessPackage.term.label },
        { label: 'Geography', value: accessPackage.geography.label },
        { label: 'Exclusivity', value: accessPackage.exclusivity.label }
    ]

    const securityControls: SummaryItem[] = [
        { label: 'Encryption', value: accessPackage.security.encryption },
        { label: 'Masking', value: accessPackage.security.masking },
        { label: 'Watermarking', value: accessPackage.security.watermarking },
        { label: 'Revocation rights', value: accessPackage.security.revocation }
    ]

    const advancedRights: SummaryItem[] = [
        { label: 'Audit logging', value: accessPackage.advancedRights.auditLogging },
        { label: 'Attribution', value: accessPackage.advancedRights.attribution },
        { label: 'Redistribution', value: accessPackage.advancedRights.redistribution },
        { label: 'Volume pricing', value: accessPackage.advancedRights.volumePricing }
    ]

    const providerPackageOverview = [
        accessPackage.accessMethod.providerSummary,
        accessPackage.deliveryDetail.providerSummary
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div data-provider-dataset-id={dataset.id} className="container mx-auto space-y-8 px-4 py-10 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Link
                    to="/provider/dashboard"
                    className="inline-flex items-center text-sm text-slate-400 transition-colors hover:text-white"
                >
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Provider Dashboard
                </Link>
                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/provider/institution-review"
                        className="inline-flex items-center justify-center rounded-lg border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-500/20"
                    >
                        Open Institution Review
                    </Link>
                    <Link
                        to={`/provider/datasets/${dataset.id}/status`}
                        className="inline-flex items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-400 hover:bg-cyan-500/15"
                    >
                        Open Dataset Status
                    </Link>
                    {dealRoute ? (
                        <>
                            <Link
                                to={buildDealPath(dealRoute.dealId, 'dossier')}
                                className="inline-flex items-center justify-center rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                            >
                                Open Evaluation Dossier
                            </Link>
                            <Link
                                to={buildDealPath(dealRoute.dealId, 'provider-packet')}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400"
                            >
                                Open provider packet
                            </Link>
                        </>
                    ) : null}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Provider dataset</div>
                        <h1 className="mt-2 text-2xl font-bold">{dataset.title}</h1>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div>
                                <span className="text-slate-400">Submission ID: </span>
                                <span className="text-slate-200">{dataset.submissionId}</span>
                            </div>
                            <div>
                                <span className="text-slate-400">Dataset ID: </span>
                                <span className="text-slate-200">{dataset.datasetId}</span>
                            </div>
                            <div>
                                <span className="text-slate-400">Uploaded: </span>
                                <span className="text-slate-200">{dataset.uploadedAt}</span>
                            </div>
                        </div>
                    </div>
                    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusStyles[dataset.status]}`}>
                        {dataset.status}
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard label="Total Requests" value={String(dataset.performance.totalRequests)} />
                    <MetricCard label="Approved Requests" value={String(dataset.performance.approvedRequests)} valueClassName="text-emerald-200" />
                    <MetricCard label="Access Events" value={String(dataset.performance.accessEvents)} valueClassName="text-cyan-200" />
                    <MetricCard label="Reliability Score" value={`${dataset.performance.avgReliability}%`} valueClassName="text-cyan-200" />
                </div>

                <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/45 p-5">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Operational snapshot</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <SnapshotFacet label="Records" value={dataset.records} />
                        <SnapshotFacet label="Payload size" value={dataset.size} />
                        <SnapshotFacet label="Live posture" value={dataset.accessActivity} />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl">
                <div className="max-w-3xl">
                    <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Submission package</div>
                    <h2 className="mt-2 text-xl font-semibold">Current Access, Security, And Governance Terms</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Review the provider package attached to this dataset record. Buyer-facing access terms stay aligned with the same controls
                        configured during the upload flow.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-3">
                    <ContributionSummaryCard
                        eyebrow="Access"
                        title="Submission Terms"
                        description={providerPackageOverview}
                        items={submissionTerms}
                        eyebrowClassName="text-cyan-200/80"
                    />
                    <ContributionSummaryCard
                        eyebrow="Security"
                        title="Security Controls"
                        description="Encryption, masking, watermarking, and revocation settings currently applied to approved buyer sessions."
                        items={securityControls}
                        eyebrowClassName="text-emerald-200/80"
                    />
                    <ContributionSummaryCard
                        eyebrow="Governance"
                        title="Advanced Rights"
                        description="Commercial governance controls that accompany the active access package for this dataset."
                        items={advancedRights}
                        eyebrowClassName="text-amber-200/80"
                    />
                </div>
            </div>
        </div>
    )
}

function MetricCard({
    label,
    value,
    valueClassName = ''
}: {
    label: string
    value: string
    valueClassName?: string
}) {
    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</div>
            <div className={`mt-1 text-3xl font-semibold ${valueClassName}`.trim()}>{value}</div>
        </div>
    )
}

function SnapshotFacet({ label, value }: SummaryItem) {
    return (
        <div className="rounded-xl border border-white/8 bg-slate-900/70 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm font-medium text-slate-100">{value}</div>
        </div>
    )
}

function ContributionSummaryCard({
    eyebrow,
    title,
    description,
    items,
    eyebrowClassName
}: {
    eyebrow: string
    title: string
    description: string
    items: SummaryItem[]
    eyebrowClassName: string
}) {
    return (
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/45 p-5">
            <div className={`text-[11px] uppercase tracking-[0.18em] ${eyebrowClassName}`}>{eyebrow}</div>
            <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            <div className="mt-5 grid gap-3">
                {items.map(item => (
                    <div key={item.label} className="rounded-xl border border-white/8 bg-slate-900/70 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                        <div className="mt-2 text-sm font-medium text-slate-100">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
