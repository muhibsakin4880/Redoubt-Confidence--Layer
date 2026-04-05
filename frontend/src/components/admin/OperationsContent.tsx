import { Link } from 'react-router-dom'
import {
    adminVisibilityBoundaries,
    approvalBlockers,
    deploymentSurfaces,
    evidencePacks,
    sharedResponsibilityPlatforms
} from '../../data/adminEvidenceData'

const blockerTone = {
    High: 'border-red-500/30 bg-red-500/10 text-red-200',
    Medium: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    Low: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
} as const

export function OperationsContent() {
    const readyEnvironments = deploymentSurfaces.filter((surface) => surface.evaluationStatus.toLowerCase().includes('ready')).length
    const blockedEnvironments = deploymentSurfaces.filter((surface) => surface.evidenceStatus.toLowerCase().includes('blocked')).length
    const readyEvidencePacks = evidencePacks.filter((pack) => pack.status === 'Ready').length

    const summaryCards = [
        {
            label: 'Protected Evaluation Environments',
            value: deploymentSurfaces.length.toString(),
            detail: 'Review environments currently tracked for approval readiness and final control clearance.'
        },
        {
            label: 'Environments Near Signoff',
            value: readyEnvironments.toString(),
            detail: 'Deployment surfaces that can move forward once the remaining approval note closes.'
        },
        {
            label: 'Residency or Evidence Blocks',
            value: blockedEnvironments.toString(),
            detail: 'Environments held because residency language or evidence posture is incomplete.'
        },
        {
            label: 'Ready Evidence Packs',
            value: readyEvidencePacks.toString(),
            detail: 'Environment posture is strongest when the pack and deployment story are both ready.'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-12 gap-5">
                {summaryCards.map((card) => (
                    <article key={card.label} className="col-span-3 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                        <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">{card.value}</p>
                        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{card.detail}</p>
                    </article>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-5">
                <section className="col-span-8 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Protected Evaluation Environments</h2>
                            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                Deployment mode, residency posture, evidence state, and the current blocker for each active governance review.
                            </p>
                        </div>
                        <Link
                            to="/admin/security-compliance"
                            className="rounded-md border border-cyan-500/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400/80 transition hover:border-cyan-500/50 hover:bg-cyan-500/10"
                        >
                            Open control matrix
                        </Link>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/35">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-950/70 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">Organization</th>
                                    <th className="px-4 py-3 text-left">Cloud</th>
                                    <th className="px-4 py-3 text-left">Deployment Mode</th>
                                    <th className="px-4 py-3 text-left">Residency Posture</th>
                                    <th className="px-4 py-3 text-left">Evaluation Status</th>
                                    <th className="px-4 py-3 text-left">Evidence Status</th>
                                    <th className="px-4 py-3 text-left">Owner</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {deploymentSurfaces.map((surface) => (
                                    <tr key={surface.id} className="align-top hover:bg-slate-800/30">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-[11px] font-semibold text-slate-200">{surface.organization}</p>
                                                <p className="mt-1 text-[10px] text-cyan-300">{surface.reviewId}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[10px] text-slate-300">{surface.cloud}</td>
                                        <td className="px-4 py-3 text-[10px] leading-relaxed text-slate-300">{surface.deploymentMode}</td>
                                        <td className="px-4 py-3 text-[10px] leading-relaxed text-slate-400">{surface.residencyPosture}</td>
                                        <td className="px-4 py-3 text-[10px] leading-relaxed text-slate-300">{surface.evaluationStatus}</td>
                                        <td className="px-4 py-3 text-[10px] leading-relaxed text-slate-400">{surface.evidenceStatus}</td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-slate-300">{surface.owner}</p>
                                                <Link
                                                    to={`/admin/application-review/${surface.reviewId}`}
                                                    className="inline-flex rounded-md border border-slate-700/80 bg-slate-800/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-300 transition hover:bg-slate-700/70"
                                                >
                                                    Open review
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="col-span-4 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Approval Blockers</h2>
                            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                The blockers most likely to delay final approval or regional deployment readiness.
                            </p>
                        </div>
                        <Link
                            to="/admin/audit-trail"
                            className="rounded-md border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700/70"
                        >
                            Open audit trail
                        </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                        {approvalBlockers.map((blocker) => (
                            <article key={blocker.id} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{blocker.reviewId}</p>
                                        <h3 className="mt-1 text-[12px] font-semibold text-slate-100">{blocker.organization}</h3>
                                    </div>
                                    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${blockerTone[blocker.severity]}`}>
                                        {blocker.severity}
                                    </span>
                                </div>
                                <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{blocker.blocker}</p>
                                <p className="mt-3 text-[9px] text-slate-500">{blocker.owner} · due {blocker.deadline}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-12 gap-5">
                <section className="col-span-7 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Shared-Responsibility Deployment Patterns</h2>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                        The infrastructure baseline may vary by platform, but the governance review logic and evidence requirements remain consistent.
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {sharedResponsibilityPlatforms.map((platform) => (
                            <article key={platform.platform} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-[13px] font-semibold text-slate-100">{platform.platform}</h3>
                                    <span className="rounded-md border border-slate-700/80 bg-slate-800/60 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                                        shared model
                                    </span>
                                </div>
                                <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{platform.redoubtFocus}</p>
                                <p className="mt-3 text-[10px] leading-relaxed text-slate-500">{platform.residencyNote}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="col-span-5 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Least-Privilege Operator View</h2>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                        Operations teams need environment posture, blockers, and evidence state, not unrestricted content access.
                    </p>

                    <div className="mt-4 space-y-3">
                        {adminVisibilityBoundaries.map((boundary) => (
                            <article key={boundary.title} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <h3 className="text-[12px] font-semibold text-slate-100">{boundary.title}</h3>
                                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{boundary.detail}</p>
                                <p className="mt-3 text-[10px] text-emerald-200">Visible: {boundary.visibleToAdmins}</p>
                                <p className="mt-2 text-[10px] text-slate-500">Held back: {boundary.hiddenFromAdmins}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
