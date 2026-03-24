import { Link, useParams } from 'react-router-dom'
import { datasetRequests, requestStatusLabel, statusStyles } from '../data/workspaceData'

export default function AccessRequestDetailPage() {
    const { requestId } = useParams()
    const request = datasetRequests.find((item) => item.id === requestId)

    if (!request) {
        return (
            <div className="container mx-auto px-4 py-10 text-white">
                <section className="max-w-3xl bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                    <h1 className="text-2xl font-semibold mb-2">Request Details</h1>
                    <p className="text-slate-400 mb-6">The requested access record could not be found.</p>
                    <Link
                        to="/access-requests"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                    >
                        Back to Access Requests
                    </Link>
                </section>
            </div>
        )
    }

    const reviewerReason =
        request.status === 'REQUEST_APPROVED'
            ? 'No reviewer feedback required after approval.'
            : request.reviewerFeedback || 'Reviewer feedback is still being prepared.'

    const expectedResolution =
        request.status === 'REVIEW_IN_PROGRESS'
            ? request.expectedResolution || 'Resolution timeline will be shared after reviewer assignment.'
            : 'Not applicable'

    return (
        <div className="container mx-auto px-4 py-10 space-y-6 text-white">
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Request Details</h1>
                        <p className="text-slate-400 text-sm mt-1">Detailed review status and workflow context for this access request.</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-medium w-fit ${statusStyles[request.status]}`}>
                        {requestStatusLabel(request.status)}
                    </span>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <DetailCard label="Request ID / Number" value={request.requestNumber} />
                    <DetailCard label="Dataset Name" value={request.name} />
                    <DetailCard label="Submitted Date" value={request.submittedDate} />
                    <DetailCard label="Last Updated" value={request.lastUpdated} />
                    <DetailCard label="Expected Resolution" value={expectedResolution} />
                    <DetailCard label="Category" value={request.category} />
                </div>

                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                    <h2 className="text-sm uppercase tracking-[0.08em] text-slate-400 mb-2">Reason / Reviewer Feedback</h2>
                    <p className="text-sm text-slate-200 leading-relaxed">{reviewerReason}</p>
                </div>

                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                    <h2 className="text-sm uppercase tracking-[0.08em] text-slate-400 mb-2">Notes / Comments</h2>
                    <p className="text-sm text-slate-200 leading-relaxed">
                        {request.notes || 'No additional notes are currently attached to this request.'}
                    </p>
                </div>

                <div className="mt-6">
                    <Link
                        to="/access-requests"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Access Requests
                    </Link>
                </div>
            </section>
        </div>
    )
}

type DetailCardProps = {
    label: string
    value: string
}

function DetailCard({ label, value }: DetailCardProps) {
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400 mb-1">{label}</p>
            <p className="text-sm text-slate-100">{value}</p>
        </div>
    )
}
