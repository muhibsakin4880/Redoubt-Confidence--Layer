import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type OnboardingFormState = {
    organizationName: string
    officialWorkEmail: string
    inviteCode: string
    roleInOrganization: string
    industryDomain: string
    country: string
    intendedUsage: string[]
    participationIntent: string[]
    responsibleDataUsage: boolean
    noUnauthorizedSharing: boolean
    platformCompliancePolicies: boolean
}

const usageOptions = ['Research', 'AI/ML training', 'Analytics', 'Product development', 'Other usage']
const participationOptions = ['Access datasets', 'Contribute datasets', 'Collaborate', 'Research participation']
const allowedFileExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const maxFileSizeBytes = 5 * 1024 * 1024

const freeEmailProviders = new Set([
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'protonmail.com'
])

const stepTitles = [
    'Organization & Identity',
    'Intended Platform Usage',
    'Participation Intent',
    'Verification & Credentials',
    'Compliance Commitment',
    'Submission Confirmation'
]

const isWorkEmail = (value: string) => /^[^\s@]+@[^\s@]+$/.test(value)
const isCorporateEmail = (value: string) => {
    if (!isWorkEmail(value)) return false
    const domain = value.split('@')[1]?.toLowerCase()
    return Boolean(domain) && !freeEmailProviders.has(domain)
}
const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'
const SUBMISSION_META_STORAGE_KEY = 'Redoubt:onboarding:submissionMeta'
const generateReferenceId = () => `#BRE-2026-${Math.floor(1000 + Math.random() * 9000)}`

const formatSubmissionDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

export default function OnboardingPage() {
    const navigate = useNavigate()
    const { accessStatus, applicantEmail, isAuthenticated, submitApplication } = useAuth()
    const [step, setStep] = useState(1)
    const [step5SubmitUnlockAt, setStep5SubmitUnlockAt] = useState(0)
    const [showStepError, setShowStepError] = useState(false)
    const [applicationReference, setApplicationReference] = useState(() => {
        const stored = localStorage.getItem(SUBMISSION_META_STORAGE_KEY)
        if (!stored) return generateReferenceId()
        try {
            const parsed = JSON.parse(stored) as { referenceId?: string }
            return parsed.referenceId || generateReferenceId()
        } catch {
            return generateReferenceId()
        }
    })
    const [submittedDate, setSubmittedDate] = useState(() => {
        const stored = localStorage.getItem(SUBMISSION_META_STORAGE_KEY)
        if (!stored) return formatSubmissionDate(new Date())
        try {
            const parsed = JSON.parse(stored) as { submittedDate?: string }
            return parsed.submittedDate || formatSubmissionDate(new Date())
        } catch {
            return formatSubmissionDate(new Date())
        }
    })
    const [state, setState] = useState<OnboardingFormState>({
        organizationName: '',
        officialWorkEmail: applicantEmail,
        inviteCode: '',
        roleInOrganization: '',
        industryDomain: '',
        country: '',
        intendedUsage: [],
        participationIntent: [],
        responsibleDataUsage: false,
        noUnauthorizedSharing: false,
        platformCompliancePolicies: false
    })
    const linkedInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
    const [isLinkedInConnected, setIsLinkedInConnected] = useState(false)
    const [affiliationFileName, setAffiliationFileName] = useState<string | null>(null)
    const [authorizationFileName, setAuthorizationFileName] = useState<string | null>(null)
    const [affiliationError, setAffiliationError] = useState<string | null>(null)
    const [authorizationError, setAuthorizationError] = useState<string | null>(null)
    const [dragTarget, setDragTarget] = useState<'affiliation' | 'authorization' | null>(null)

    useEffect(() => {
        return () => {
            if (linkedInTimerRef.current) {
                clearTimeout(linkedInTimerRef.current)
            }
        }
    }, [])

    if (!MOCK_AUTH && accessStatus === 'approved' && isAuthenticated) return <Navigate to="/dashboard" replace />
    if (!MOCK_AUTH && accessStatus === 'approved') return <Navigate to="/login" replace />

    const toggleValue = (field: 'intendedUsage' | 'participationIntent', value: string) => {
        setState(prev => {
            const exists = prev[field].includes(value)
            return { ...prev, [field]: exists ? prev[field].filter(item => item !== value) : [...prev[field], value] }
        })
    }

    const handleLinkedInConnect = () => {
        if (isLinkedInLoading || isLinkedInConnected) return
        setIsLinkedInLoading(true)
        linkedInTimerRef.current = setTimeout(() => {
            setIsLinkedInLoading(false)
            setIsLinkedInConnected(true)
        }, 1600)
    }

    const handleFileSelection = (file: File | null | undefined, target: 'affiliation' | 'authorization') => {
        if (!file) return
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        const setFileName = target === 'affiliation' ? setAffiliationFileName : setAuthorizationFileName
        const setError = target === 'affiliation' ? setAffiliationError : setAuthorizationError

        if (!fileExtension || !allowedFileExtensions.has(fileExtension)) {
            setError('Only PDF, JPG, and PNG files are accepted.')
            setFileName(null)
            return
        }

        if (file.size > maxFileSizeBytes) {
            setError('File size exceeds 5MB limit.')
            setFileName(null)
            return
        }

        setError(null)
        setFileName(file.name)
    }

    const handleFileDrop = (event: React.DragEvent<HTMLLabelElement>, target: 'affiliation' | 'authorization') => {
        event.preventDefault()
        setDragTarget(null)
        handleFileSelection(event.dataTransfer.files?.[0], target)
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>, target: 'affiliation' | 'authorization') => {
        handleFileSelection(event.target.files?.[0], target)
    }

    const fillMockStep1 = () => {
        setState(prev => ({
            ...prev,
            organizationName: 'Demo Corporation',
            officialWorkEmail: 'demo@redoubt.local',
            inviteCode: 'REDO-2026',
            roleInOrganization: 'Senior Data Engineer',
            industryDomain: 'Technology & AI',
            country: 'United States'
        }))
        setShowStepError(false)
    }

    const fillMockStep2 = () => {
        setState(prev => ({
            ...prev,
            intendedUsage: ['Research', 'AI/ML training']
        }))
        setShowStepError(false)
    }

    const fillMockStep3 = () => {
        setState(prev => ({
            ...prev,
            participationIntent: ['Access datasets', 'Collaborate'],
            responsibleDataUsage: true,
            noUnauthorizedSharing: true,
            platformCompliancePolicies: true
        }))
        setShowStepError(false)
    }

    const stepOneReady =
        state.organizationName.trim().length > 0 &&
        isCorporateEmail(state.officialWorkEmail.trim()) &&
        state.inviteCode.trim().length >= 6 &&
        state.roleInOrganization.trim().length > 0 &&
        state.industryDomain.trim().length > 0 &&
        state.country.trim().length > 0

    const stepTwoReady = state.intendedUsage.length > 0
    const stepThreeReady =
        state.participationIntent.length > 0 &&
        state.responsibleDataUsage &&
        state.noUnauthorizedSharing &&
        state.platformCompliancePolicies
    const stepFourReady = isLinkedInConnected && Boolean(affiliationFileName) && Boolean(authorizationFileName)
    const stepFiveReady = state.responsibleDataUsage && state.noUnauthorizedSharing && state.platformCompliancePolicies

    const stepReady =
        step === 1
            ? stepOneReady
            : step === 2
                ? stepTwoReady
                : step === 3
                    ? stepThreeReady
                    : step === 4
                        ? stepFourReady
                        : step === 5
                            ? stepFiveReady
                            : true

    useEffect(() => {
        if (stepReady) setShowStepError(false)
    }, [stepReady, step])

    useEffect(() => {
        if (accessStatus === 'pending' && step !== 6) {
            navigate('/onboarding/confirmation', { replace: true })
        }
    }, [accessStatus, navigate, step])

    const next = () => {
        if (step >= 5) return
        if (!stepReady) {
            setShowStepError(true)
            return
        }
        setShowStepError(false)
        if (step === 4) {
            // Prevent accidental immediate submit when users double-click Continue.
            setStep5SubmitUnlockAt(Date.now() + 400)
            setStep(5)
            return
        }
        setStep(prev => Math.min(prev + 1, 6))
    }

    const back = () => {
        if (step <= 1) return
        setShowStepError(false)
        if (step === 5) setStep5SubmitUnlockAt(0)
        setStep(prev => prev - 1)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (Date.now() < step5SubmitUnlockAt) return
        if (!stepFiveReady) {
            setShowStepError(true)
            return
        }

        const referenceId = generateReferenceId()
        const submissionDate = formatSubmissionDate(new Date())

        localStorage.setItem(
            SUBMISSION_META_STORAGE_KEY,
            JSON.stringify({
                referenceId,
                submittedDate: submissionDate
            })
        )

        submitApplication(state.officialWorkEmail)
        setApplicationReference(referenceId)
        setSubmittedDate(submissionDate)
        setShowStepError(false)
        setStep(6)
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Participant Onboarding</h1>
                    <p className="text-slate-400">Security and confidence infrastructure intake for controlled participation.</p>
                </div>

                <div className="mb-8 overflow-x-auto pb-1">
                    <div className="min-w-[760px] flex items-start">
                        {stepTitles.map((title, idx) => {
                            const currentStep = idx + 1
                            const active = currentStep === step
                            const done = currentStep < step
                            const connectorDone = currentStep < step
                            return (
                                <div key={title} className="flex items-center flex-1 last:flex-none">
                                    <div className="w-32">
                                        <div
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                                                done
                                                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                                                    : active
                                                        ? 'border-blue-400 bg-blue-500/10 text-blue-200 shadow-[0_0_0_3px_rgba(59,130,246,0.25),0_0_18px_rgba(59,130,246,0.35)]'
                                                        : 'border-slate-700 bg-slate-900 text-slate-500'
                                            }`}
                                        >
{done ? (
                                                 <svg
                                                     viewBox="0 0 24 24"
                                                     className="w-6 h-6"
                                                     fill="none"
                                                     stroke="currentColor"
                                                     strokeWidth="2.75"
                                                 >
                                                     <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                 </svg>
                                             ) : (
                                                 currentStep
                                             )}
                                        </div>
                                        <div className="mt-2 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                                            Step {currentStep}
                                        </div>
                                        <div
                                            className={`mt-1 text-xs font-semibold leading-4 ${
                                                done ? 'text-emerald-200' : active ? 'text-blue-100' : 'text-slate-500'
                                            }`}
                                        >
                                            {title}
                                        </div>
                                    </div>
                                    {idx < stepTitles.length - 1 && (
                                        <div
                                            className={`h-[2px] flex-1 mx-2 rounded-full ${
                                                connectorDone ? 'bg-emerald-400/70' : 'bg-slate-700'
                                            }`}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {step === 1 && (
                        <section className="bg-[#0a1628] border border-[rgba(148,163,184,0.08)] rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">Organization & Identity</h2>
                                <button
                                    type="button"
                                    onClick={fillMockStep1}
                                    className="text-[11px] px-2.5 py-1.5 rounded-md border border-slate-500/40 bg-transparent text-slate-300 hover:border-blue-500/70 hover:text-blue-100 transition-colors"
                                >
                                    Use mock data
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Organization name</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.organizationName}
                                        onChange={(e) => setState(prev => ({ ...prev, organizationName: e.target.value }))}
                                        placeholder="Your organization"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Official work email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.officialWorkEmail}
                                        onChange={(e) => setState(prev => ({ ...prev, officialWorkEmail: e.target.value }))}
                                        placeholder="name@organization.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Invite code</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.inviteCode}
                                        onChange={(e) => setState(prev => ({ ...prev, inviteCode: e.target.value }))}
                                        placeholder="INV-XXXXXX"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-500">Optional — we'll verify either way, but this helps us move faster.</p>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Role in organization</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.roleInOrganization}
                                        onChange={(e) => setState(prev => ({ ...prev, roleInOrganization: e.target.value }))}
                                        placeholder="Research lead, ML engineer, analyst..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Industry/domain</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.industryDomain}
                                        onChange={(e) => setState(prev => ({ ...prev, industryDomain: e.target.value }))}
                                        placeholder="Healthcare, mobility, climate..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Country</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.country}
                                        onChange={(e) => setState(prev => ({ ...prev, country: e.target.value }))}
                                        placeholder="Country"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="bg-[#0a1628] border border-[rgba(148,163,184,0.08)] rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">Intended Platform Usage</h2>
                                <button
                                    type="button"
                                    onClick={fillMockStep2}
                                    className="text-[11px] px-2.5 py-1.5 rounded-md border border-slate-500/40 bg-transparent text-slate-300 hover:border-blue-500/70 hover:text-blue-100 transition-colors"
                                >
                                    Use mock data
                                </button>
                            </div>
                            <p className="text-sm text-slate-400">Select all that apply.</p>
                            <div className="flex flex-wrap gap-2">
                                {usageOptions.map(option => {
                                    const active = state.intendedUsage.includes(option)
                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleValue('intendedUsage', option)}
                                            className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                                active
                                                    ? 'bg-blue-500/15 border-blue-400 text-blue-200 shadow-[0_0_0_1px_rgba(96,165,250,0.45),0_0_18px_rgba(59,130,246,0.35)]'
                                                    : 'border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">Participation Intent</h2>
                                <button
                                    type="button"
                                    onClick={fillMockStep3}
                                    className="text-xs px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:border-blue-500 hover:text-white transition-colors"
                                >
                                    Use mock data
                                </button>
                            </div>
                            <p className="text-sm text-slate-400">Choose how your team plans to participate.</p>
                            <div className="flex flex-wrap gap-2">
                                {participationOptions.map(option => {
                                    const active = state.participationIntent.includes(option)
                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleValue('participationIntent', option)}
                                            className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                                active
                                                    ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="pt-2 space-y-4">
                                <h3 className="text-lg font-semibold text-white">Legal &amp; Governance Acknowledgment</h3>

                                <label className="flex items-start gap-3 text-[13px] text-slate-400">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5"
                                        checked={state.responsibleDataUsage}
                                        onChange={(e) =>
                                            setState(prev => ({ ...prev, responsibleDataUsage: e.target.checked }))
                                        }
                                    />
                                    <span>
                                        I confirm that I am authorised to represent [Organisation Name] on this platform.
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 text-[13px] text-slate-400">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5"
                                        checked={state.noUnauthorizedSharing}
                                        onChange={(e) =>
                                            setState(prev => ({ ...prev, noUnauthorizedSharing: e.target.checked }))
                                        }
                                    />
                                    <span>
                                        I agree to the{' '}
                                        <a
                                            href="#"
                                            onClick={(e) => e.preventDefault()}
                                            className="text-blue-400 underline underline-offset-2"
                                        >
                                            Redoubt Data Governance Policy
                                        </a>{' '}
                                        and accept that all data access is logged, governed, and subject to contributor
                                        permissions.
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 text-[13px] text-slate-400">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5"
                                        checked={state.platformCompliancePolicies}
                                        onChange={(e) =>
                                            setState(prev => ({ ...prev, platformCompliancePolicies: e.target.checked }))
                                        }
                                    />
                                    <span>
                                        I acknowledge that data obtained through this platform may not be redistributed,
                                        resold, or used beyond the stated purpose without explicit written consent.
                                    </span>
                                </label>
                            </div>
                        </section>
                    )}

                    {step === 4 && (
                        <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">Verification &amp; Credentials</h2>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200 bg-amber-500/10 border border-amber-400/50 px-2 py-1 rounded-full">
                                    Required
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">
                                Confirm identity and provide authorization documents before we can approve access.
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-base font-semibold text-white">Connect LinkedIn</h3>
                                        <span className="text-xs text-amber-300">Required</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-400">Instantly verify your organizational affiliation.</p>

                                    <div className="mt-4">
                                        {isLinkedInConnected ? (
                                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                                                <span aria-hidden="true">✓</span>
                                                <span>Affiliation Confirmed</span>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleLinkedInConnect}
                                                disabled={isLinkedInLoading}
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/60"
                                            >
                                                {isLinkedInLoading ? 'Connecting...' : 'Connect LinkedIn'}
                                            </button>
                                        )}
                                    </div>
                                </article>

                                <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-base font-semibold text-white">Upload Proof of Affiliation</h3>
                                        <span className="text-xs text-amber-300">Required</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-400">PDF, JPG or PNG only. Max 5MB.</p>

                                    <label
                                        htmlFor="affiliation-proof-upload"
                                        onDragOver={(event) => {
                                            event.preventDefault()
                                            setDragTarget('affiliation')
                                        }}
                                        onDragLeave={() => setDragTarget(null)}
                                        onDrop={(event) => handleFileDrop(event, 'affiliation')}
                                        className={`mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors duration-200 ${
                                            dragTarget === 'affiliation'
                                                ? 'border-blue-500/80 bg-blue-500/10'
                                                : 'border-slate-600 bg-slate-900 hover:border-blue-500/70'
                                        }`}
                                    >
                                        <span className="text-sm text-slate-300">Drag and drop a file here</span>
                                        <span className="mt-1 text-xs text-slate-400">or click to browse</span>
                                    </label>

                                    <input
                                        id="affiliation-proof-upload"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(event) => handleFileInputChange(event, 'affiliation')}
                                        className="sr-only"
                                    />

                                    {affiliationFileName && (
                                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                            <span aria-hidden="true">✓</span>
                                            <span className="break-all">{affiliationFileName}</span>
                                        </div>
                                    )}

                                    {affiliationError && <p className="mt-3 text-xs text-amber-300">{affiliationError}</p>}
                                </article>
                            </div>

                            <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-base font-semibold text-white">Upload Authorization / Compliance Letter</h3>
                                    <span className="text-xs text-amber-300">Required</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-400">
                                    Examples: DPA, IRB approval, or letter of authority.
                                </p>

                                <label
                                    htmlFor="authorization-proof-upload"
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setDragTarget('authorization')
                                    }}
                                    onDragLeave={() => setDragTarget(null)}
                                    onDrop={(event) => handleFileDrop(event, 'authorization')}
                                    className={`mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors duration-200 ${
                                        dragTarget === 'authorization'
                                            ? 'border-blue-500/80 bg-blue-500/10'
                                            : 'border-slate-600 bg-slate-900 hover:border-blue-500/70'
                                    }`}
                                >
                                    <span className="text-sm text-slate-300">Drag and drop a file here</span>
                                    <span className="mt-1 text-xs text-slate-400">or click to browse</span>
                                </label>

                                <input
                                    id="authorization-proof-upload"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(event) => handleFileInputChange(event, 'authorization')}
                                    className="sr-only"
                                />

                                {authorizationFileName && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                        <span aria-hidden="true">✓</span>
                                        <span className="break-all">{authorizationFileName}</span>
                                    </div>
                                )}

                                {authorizationError && <p className="mt-3 text-xs text-amber-300">{authorizationError}</p>}
                            </article>
                        </section>
                    )}

                    {step === 5 && (

                        <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4">
                            <h2 className="text-xl font-semibold">Compliance Commitment</h2>
                            <p className="text-sm text-slate-400">All commitments are required before application submission.</p>

                            <label className="flex items-start gap-3 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={state.responsibleDataUsage}
                                    onChange={(e) => setState(prev => ({ ...prev, responsibleDataUsage: e.target.checked }))}
                                />
                                <span>I agree to responsible data usage.</span>
                            </label>

                            <label className="flex items-start gap-3 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={state.noUnauthorizedSharing}
                                    onChange={(e) => setState(prev => ({ ...prev, noUnauthorizedSharing: e.target.checked }))}
                                />
                                <span>I agree to no unauthorized sharing.</span>
                            </label>

                            <label className="flex items-start gap-3 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={state.platformCompliancePolicies}
                                    onChange={(e) => setState(prev => ({ ...prev, platformCompliancePolicies: e.target.checked }))}
                                />
                                <span>I agree to platform compliance policies.</span>
                            </label>
                        </section>
                    )}

                    {step === 6 && (
                        <section className="rounded-xl border border-slate-700/80 bg-[#0a1628]/85 backdrop-blur-md p-5 space-y-4 shadow-[0_16px_48px_rgba(2,8,23,0.45)]">
                            <div className="relative mx-auto w-36 h-36">
                                <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" />
                                <div className="absolute inset-1 rounded-full border-2 border-emerald-300/35 animate-ping" />
                                <div className="absolute inset-4 rounded-full border border-emerald-300/50" />
                                <div className="relative w-full h-full rounded-full bg-emerald-500/15 border-2 border-emerald-400/70 flex items-center justify-center text-emerald-300">
                                    <svg viewBox="0 0 24 24" className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="2.75">
                                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-semibold text-white">Application Submitted Successfully</h2>
                                <p className="text-sm text-slate-300">
                                    Your application is under review by the Redoubt trust committee.
                                </p>
                            </div>

                            <div className="bg-[#020817] border border-slate-700/80 rounded-xl p-4 md:p-5 space-y-3">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-slate-400">Reference ID</span>
                                    <span className="font-semibold text-slate-100">{applicationReference}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-slate-400">Submitted</span>
                                    <span className="font-semibold text-slate-100">{submittedDate}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-slate-400">Status</span>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-400/40 text-amber-200">
                                        Pending Review
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-slate-400">Estimated review time</span>
                                    <span className="font-semibold text-slate-100">2-3 business days</span>
                                </div>
                            </div>

                            <div className="bg-slate-900/55 border border-slate-700/80 rounded-xl p-4 md:p-5 space-y-3">
                                <h3 className="text-lg font-semibold text-white">What happens next</h3>
                                <ol className="space-y-2 text-sm text-slate-300">
                                    <li>1. Identity &amp; organization verification</li>
                                    <li>2. Trust committee review</li>
                                    <li>3. Access credentials issued via email</li>
                                </ol>
                            </div>

                            <div className="pt-1 flex flex-wrap gap-3">
                                <Link
                                    to="/"
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                                >
                                    Return to Home
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => navigate('/application-status')}
                                    className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-200 hover:text-white font-semibold transition-colors"
                                >
                                    Check Application Status
                                </button>
                            </div>
                        </section>
                    )}

                    {step < 6 && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={back}
                                disabled={step === 1}
                                className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ← Back
                            </button>
                            {step < 5 ? (
                                <button
                                    type="button"
                                    onClick={next}
                                    disabled={step !== 1 && !stepReady}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!stepFiveReady}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Submit Application
                                </button>
                            )}
                        </div>
                    )}
                    {showStepError && !stepReady && step === 1 && (
                        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                            Please complete all fields with a valid corporate email and invite code before continuing.
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}


