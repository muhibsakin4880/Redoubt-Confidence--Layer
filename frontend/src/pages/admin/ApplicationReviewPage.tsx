import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'

type Tone = 'green' | 'amber' | 'red' | 'blue'

type OverviewItem = {
    label: string
    value: string
}

type StepField = {
    label: string
    value: string
    preview?: boolean
}

type SubmissionStep = {
    id: number
    title: string
    status: string
    tone: Tone
    fields: StepField[]
}

type RiskFactor = {
    factor: string
    score: string
    status: string
    tone: Tone
}

const toneBadgeClasses: Record<Tone, string> = {
    green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    red: 'border-red-500/40 bg-red-500/10 text-red-200',
    blue: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
}

const decisionButtonClasses: Record<'approve' | 'flag' | 'reject', string> = {
    approve: 'border-emerald-500/50 bg-emerald-500/12 text-emerald-200 hover:bg-emerald-500/18',
    flag: 'border-amber-500/50 bg-amber-500/12 text-amber-200 hover:bg-amber-500/18',
    reject: 'border-red-500/50 bg-red-500/12 text-red-200 hover:bg-red-500/18'
}

export default function ApplicationReviewPage() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const { appId } = useParams<{ appId: string }>()
    const applicantId = appId ?? 'APP-3390'

    const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({
        1: true,
        2: false,
        3: false,
        4: false,
        5: false
    })

    const overviewItems: OverviewItem[] = [
        { label: 'Organization', value: 'Meridian Systems' },
        { label: 'Applicant ID', value: applicantId },
        { label: 'Access Type', value: 'Data Provider' },
        { label: 'Applied', value: '2026-03-23 09:38:02' },
        { label: 'Industry', value: 'Financial Analytics' },
        { label: 'Country', value: 'UAE' }
    ]

    const submissionSteps: SubmissionStep[] = [
        {
            id: 1,
            title: 'Organization & Identity',
            status: 'Verified ✅',
            tone: 'green',
            fields: [
                { label: 'Organization name', value: 'Meridian Systems' },
                { label: 'Work email', value: 'admin@meridiansystems.ae' },
                { label: 'Invite code', value: 'REDO-2026' },
                { label: 'Role', value: 'Chief Data Officer' },
                { label: 'Industry', value: 'Financial Analytics' },
                { label: 'Country', value: 'UAE' }
            ]
        },
        {
            id: 2,
            title: 'Intended Platform Usage',
            status: 'High Compliance Tier ⚠️',
            tone: 'amber',
            fields: [
                { label: 'Selected category', value: 'Financial & Quantitative Modeling' },
                { label: 'Sub-options', value: 'Risk Modeling, Predictive Analytics' },
                { label: 'Jurisdiction', value: 'UAE (PDPL)' },
                { label: 'TTL', value: '90 days' },
                { label: 'External APIs/LLMs', value: 'No' },
                { label: 'Compliance tier triggered', value: 'High Compliance (Stricter Audit)' }
            ]
        },
        {
            id: 3,
            title: 'Participation Intent',
            status: 'Signed ✅',
            tone: 'green',
            fields: [
                { label: 'Role', value: 'Data Provider (Contribute & Monetize)' },
                { label: 'Legal acknowledgments', value: 'All 3 signed ✅' },
                { label: 'Electronic signature', value: 'John Mitchell' },
                { label: 'Signed at', value: '2026-03-23 09:35:44' }
            ]
        },
        {
            id: 4,
            title: 'Verification & Credentials',
            status: 'Pending Review 🟡',
            tone: 'amber',
            fields: [
                { label: 'Corporate Domain', value: 'meridiansystems.ae — Verified ✅' },
                { label: 'Corporate Registry Document', value: 'meridian_trade_license.pdf', preview: true },
                { label: 'Signed DPO/Legal Mandate', value: 'meridian_dpa_signed.pdf', preview: true }
            ]
        },
        {
            id: 5,
            title: 'Zero-Trust Pipeline Agreement',
            status: 'Acknowledged ✅',
            tone: 'green',
            fields: [
                { label: 'All 3 checkboxes', value: 'Acknowledged ✅' },
                { label: 'Submitted', value: '2026-03-23 09:37:58' },
                { label: 'IP logged', value: '185.58.142.44' },
                { label: 'Device fingerprint', value: 'Cryptographically recorded' }
            ]
        }
    ]

    const riskFactors: RiskFactor[] = [
        { factor: 'Domain Verification', score: '95/100', status: 'Passed ✅', tone: 'green' },
        { factor: 'Document Authenticity', score: '60/100', status: 'Pending Review 🟡', tone: 'amber' },
        { factor: 'Jurisdiction Risk', score: '55/100', status: 'Medium Risk 🟡', tone: 'amber' },
        { factor: 'Usage Intent', score: '82/100', status: 'Low Risk ✅', tone: 'green' },
        { factor: 'Compliance Tier', score: '45/100', status: 'High Compliance ⚠️', tone: 'amber' }
    ]

    const summaryText = [
        'Financial data provider from UAE. High compliance tier triggered by jurisdiction.',
        'Document authenticity pending manual verification.',
        'Recommend secondary review before approval.'
    ].join('\n')

    const toggleStep = (stepId: number) => {
        setOpenSteps(prev => ({
            ...prev,
            [stepId]: !prev[stepId]
        }))
    }

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    return (
        <AdminLayout title="APPLICATION REVIEW" subtitle="ONBOARDING COMPLIANCE REVIEW">
            <div className="space-y-6">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/admin/onboarding-queue')}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-800/70 transition-colors"
                        >
                            ← Back to Onboarding Queue
                        </button>

                        <div>
                            <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">Application Review</h1>
                            <p className="mt-1 text-sm text-slate-400">{applicantId} | Meridian Systems</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${toneBadgeClasses.amber}`}>
                            Risk Score: 67
                        </span>
                        <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${toneBadgeClasses.amber}`}>
                            Flagged
                        </span>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Applicant Overview</h2>
                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {overviewItems.map(item => (
                            <div key={item.label} className="rounded-md border border-slate-800/80 bg-slate-950/40 px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                                <p className="mt-1 text-[12px] font-medium text-slate-200">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="space-y-1">
                        <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Submission Review</h2>
                        <p className="text-sm text-slate-200">Step-by-Step Submission</p>
                    </div>

                    <div className="mt-4 space-y-3">
                        {submissionSteps.map(step => {
                            const isOpen = Boolean(openSteps[step.id])
                            return (
                                <article key={step.id} className="overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/35">
                                    <button
                                        onClick={() => toggleStep(step.id)}
                                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Step {step.id}</p>
                                            <p className="text-[13px] font-semibold text-slate-100">{step.title}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${toneBadgeClasses[step.tone]}`}>
                                                {step.status}
                                            </span>
                                            <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="grid grid-cols-1 gap-2 border-t border-slate-800/70 p-4 lg:grid-cols-2">
                                            {step.fields.map(field => (
                                                <div key={`${step.id}-${field.label}`} className="rounded-md border border-slate-800/80 bg-slate-950/45 px-3 py-2">
                                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{field.label}</p>
                                                    <div className="mt-1.5 flex items-center justify-between gap-3">
                                                        <p className="text-[12px] font-medium text-slate-200 leading-relaxed">{field.value}</p>
                                                        {field.preview && (
                                                            <button className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wide transition-colors ${toneBadgeClasses.blue} hover:bg-cyan-500/20`}>
                                                                Preview
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">AI Risk Assessment</h2>
                            <p className="text-sm text-slate-200">Automated Risk Analysis</p>
                        </div>
                        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-[0.13em] text-amber-200/80">Overall Score</p>
                            <p className="mt-1 text-3xl font-semibold text-amber-200">67/100</p>
                        </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/35">
                        <div className="grid grid-cols-12 border-b border-slate-800/80 bg-slate-950/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            <span className="col-span-6">Factor</span>
                            <span className="col-span-2">Score</span>
                            <span className="col-span-4">Status</span>
                        </div>
                        {riskFactors.map(row => (
                            <div key={row.factor} className="grid grid-cols-12 items-center border-b border-slate-800/60 px-3 py-2.5 text-[11px] last:border-b-0">
                                <span className="col-span-6 text-slate-200">{row.factor}</span>
                                <span className="col-span-2 font-mono text-slate-300">{row.score}</span>
                                <span className="col-span-4">
                                    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold tracking-wide ${toneBadgeClasses[row.tone]}`}>
                                        {row.status}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-800/80 bg-slate-950/45 p-3">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">AI Summary</p>
                        <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-200">{summaryText}</pre>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="space-y-1">
                        <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Admin Decision</h2>
                        <p className="text-sm text-slate-200">Review Decision</p>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="internal-note" className="text-[11px] font-medium text-slate-300">
                            Internal Note (optional)
                        </label>
                        <textarea
                            id="internal-note"
                            placeholder="Add review notes for audit trail..."
                            className="mt-2 h-28 w-full resize-y rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/70"
                        />
                    </div>

                    <div className="mt-4 space-y-3">
                        <button className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${decisionButtonClasses.approve}`}>
                            <p className="text-[12px] font-semibold">Approve Application</p>
                            <p className="mt-1 text-[11px] text-emerald-100/80">Grant access and notify applicant</p>
                        </button>

                        <button className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${decisionButtonClasses.flag}`}>
                            <p className="text-[12px] font-semibold">Flag for Secondary Review</p>
                            <p className="mt-1 text-[11px] text-amber-100/80">Escalate to compliance team</p>
                        </button>

                        <button className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${decisionButtonClasses.reject}`}>
                            <p className="text-[12px] font-semibold">Reject Application</p>
                            <p className="mt-1 text-[11px] text-red-100/80">Deny access and notify applicant</p>
                        </button>
                    </div>

                    <p className="mt-4 text-[11px] text-slate-500">
                        All decisions are cryptographically logged and cannot be modified.
                    </p>
                </section>
            </div>
        </AdminLayout>
    )
}
