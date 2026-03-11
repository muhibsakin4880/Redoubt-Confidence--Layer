import { useEffect, useMemo, useRef, useState } from 'react'

type OnboardingStep = {
    id: number
    title: string
    description: string
}

const onboardingSteps: OnboardingStep[] = [
    {
        id: 1,
        title: 'Identify Your Organisation',
        description: 'Basic professional details to get started'
    },
    {
        id: 2,
        title: 'Define Your Intent',
        description: 'Help us understand how you plan to use the network'
    },
    {
        id: 3,
        title: 'Verify Affiliation',
        description: 'Confirm your organisational identity'
    },
    {
        id: 4,
        title: 'Access Confirmed',
        description: 'Your participant profile is ready'
    }
]

const freeEmailProviders = new Set([
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'protonmail.com'
])

const allowedFileExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const maxFileSizeBytes = 5 * 1024 * 1024

export default function BreachOnboarding() {
    const currentStep = 3
    const currentStepContent = onboardingSteps[currentStep - 1]
    const linkedInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
    const [isLinkedInConnected, setIsLinkedInConnected] = useState(false)
    const [isDraggingFile, setIsDraggingFile] = useState(false)
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [primaryPurpose, setPrimaryPurpose] = useState('')
    const [acknowledgmentOne, setAcknowledgmentOne] = useState(false)
    const [acknowledgmentTwo, setAcknowledgmentTwo] = useState(false)
    const [acknowledgmentThree, setAcknowledgmentThree] = useState(false)

    const workEmail = 'participant@redoubt-enterprise.com'

    useEffect(() => {
        return () => {
            if (linkedInTimerRef.current) {
                clearTimeout(linkedInTimerRef.current)
            }
        }
    }, [])

    const handleLinkedInConnect = () => {
        if (isLinkedInLoading || isLinkedInConnected) return

        setIsLinkedInLoading(true)

        linkedInTimerRef.current = setTimeout(() => {
            setIsLinkedInLoading(false)
            setIsLinkedInConnected(true)
        }, 2000)
    }

    const handleFileSelection = (file: File | null | undefined) => {
        if (!file) return

        const fileExtension = file.name.split('.').pop()?.toLowerCase()

        if (!fileExtension || !allowedFileExtensions.has(fileExtension)) {
            setUploadError('Only PDF, JPG, and PNG files are accepted.')
            setUploadedFileName(null)
            return
        }

        if (file.size > maxFileSizeBytes) {
            setUploadError('File size exceeds 5MB limit.')
            setUploadedFileName(null)
            return
        }

        setUploadError(null)
        setUploadedFileName(file.name)
    }

    const handleFileDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault()
        setIsDraggingFile(false)
        handleFileSelection(event.dataTransfer.files?.[0])
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelection(event.target.files?.[0])
    }

    const hasNonFreeWorkEmail = useMemo(() => {
        const domain = workEmail.split('@')[1]?.toLowerCase()
        return Boolean(domain) && !freeEmailProviders.has(domain)
    }, [workEmail])

    const primaryPurposeQualified = primaryPurpose.trim().length >= 150
    const hasCompletedVerification = isLinkedInConnected || Boolean(uploadedFileName)
    const allAcknowledgmentsChecked = acknowledgmentOne && acknowledgmentTwo && acknowledgmentThree

    const trustScore =
        (hasNonFreeWorkEmail ? 25 : 0) +
        (isLinkedInConnected ? 30 : 0) +
        (uploadedFileName ? 25 : 0) +
        (primaryPurposeQualified ? 20 : 0)

    const trustScoreBarColorClass =
        trustScore <= 40 ? 'bg-red-500' : trustScore <= 70 ? 'bg-amber-400' : 'bg-emerald-500'

    const canSubmitForReview = hasCompletedVerification && allAcknowledgmentsChecked

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0F1E]/90 px-4 py-8 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0A0F1E] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)]">
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[#2D6EF5]/90 shadow-[0_0_28px_6px_rgba(45,110,245,0.55)]" />
                <p className="absolute left-6 top-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#2D6EF5]">Redoubt</p>

                <div className="space-y-8 p-6 sm:p-8">
                    <header className="space-y-5 pt-8">
                        <div className="flex items-center gap-2">
                            {onboardingSteps.map((step) => {
                                const stateClass =
                                    step.id < currentStep
                                        ? 'bg-white'
                                        : step.id === currentStep
                                          ? 'bg-[#2D6EF5]'
                                          : 'bg-slate-700'

                                return <div key={step.id} className={`h-1.5 flex-1 rounded-full ${stateClass}`} />
                            })}
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-[22px] font-bold leading-tight text-white">{currentStepContent.title}</h2>
                            <p className="text-[13px] text-slate-400">{currentStepContent.description}</p>
                        </div>
                    </header>

                    <div className="space-y-6 rounded-xl border border-slate-700/80 bg-[#0D1528] p-5 transition-[opacity,transform] duration-500 ease-out sm:p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <article className="rounded-xl border border-slate-700 bg-[#111B33] p-4">
                                <h3 className="text-base font-semibold text-white">Connect with LinkedIn</h3>
                                <p className="mt-1 text-sm text-slate-400">Instantly verify your organisational affiliation</p>

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
                                            className="rounded-lg bg-[#2D6EF5] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#205BE0] disabled:cursor-not-allowed disabled:bg-[#2D6EF5]/60"
                                        >
                                            {isLinkedInLoading ? 'Connecting...' : 'Connect LinkedIn'}
                                        </button>
                                    )}
                                </div>
                            </article>

                            <article className="rounded-xl border border-slate-700 bg-[#111B33] p-4">
                                <h3 className="text-base font-semibold text-white">Upload Proof of Affiliation</h3>
                                <p className="mt-1 text-sm text-slate-400">PDF, JPG or PNG only. Max 5MB.</p>

                                <label
                                    htmlFor="affiliation-proof-upload"
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setIsDraggingFile(true)
                                    }}
                                    onDragLeave={() => setIsDraggingFile(false)}
                                    onDrop={handleFileDrop}
                                    className={`mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors duration-200 ${
                                        isDraggingFile
                                            ? 'border-[#2D6EF5] bg-[#2D6EF5]/10'
                                            : 'border-slate-600 bg-[#0C1427] hover:border-[#2D6EF5]/70'
                                    }`}
                                >
                                    <span className="text-sm text-slate-300">Drag and drop a file here</span>
                                    <span className="mt-1 text-xs text-slate-400">or click to browse</span>
                                </label>

                                <input
                                    id="affiliation-proof-upload"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileInputChange}
                                    className="sr-only"
                                />

                                {uploadedFileName && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                        <span aria-hidden="true">✓</span>
                                        <span className="break-all">{uploadedFileName}</span>
                                    </div>
                                )}

                                {uploadError && <p className="mt-3 text-xs text-red-300">{uploadError}</p>}
                            </article>
                        </div>

                        <section className="space-y-4 rounded-xl border border-slate-700 bg-[#101A30] p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-white">Participant Trust Profile</p>
                                <p className="text-sm font-semibold text-white">{trustScore}%</p>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/80">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${trustScoreBarColorClass}`}
                                    style={{ width: `${trustScore}%` }}
                                />
                            </div>

                            <p className="text-xs text-slate-400">Work email on file: {workEmail}</p>

                            <div className="space-y-2">
                                <label htmlFor="primary-purpose" className="text-sm text-slate-300">
                                    Primary Purpose
                                </label>
                                <textarea
                                    id="primary-purpose"
                                    value={primaryPurpose}
                                    onChange={(event) => setPrimaryPurpose(event.target.value)}
                                    rows={4}
                                    className="w-full resize-none rounded-lg border border-slate-600 bg-[#0C1427] px-3 py-2 text-sm text-white outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-[#2D6EF5]"
                                    placeholder="Describe your primary purpose for participating in Redoubt."
                                />
                                <p className="text-xs text-slate-400">{primaryPurpose.trim().length}/150 characters</p>
                            </div>
                        </section>

                        <section className="space-y-3 rounded-xl border border-slate-700 bg-[#101A30] p-4 sm:p-5">
                            <h3 className="text-sm font-semibold text-white">Legal &amp; Governance Acknowledgment</h3>

                            <label className="flex items-start gap-3 text-[13px] text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={acknowledgmentOne}
                                    onChange={(event) => setAcknowledgmentOne(event.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-transparent text-[#2D6EF5] focus:ring-[#2D6EF5]"
                                />
                                <span>I confirm that I am authorised to represent [Organisation Name] on this platform.</span>
                            </label>

                            <label className="flex items-start gap-3 text-[13px] text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={acknowledgmentTwo}
                                    onChange={(event) => setAcknowledgmentTwo(event.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-transparent text-[#2D6EF5] focus:ring-[#2D6EF5]"
                                />
                                <span>
                                    I agree to the{' '}
                                    <a href="#" onClick={(event) => event.preventDefault()} className="text-[#2D6EF5] underline">
                                        Redoubt Data Governance Policy
                                    </a>{' '}
                                    and accept that all data access is logged, governed, and subject to contributor permissions.
                                </span>
                            </label>

                            <label className="flex items-start gap-3 text-[13px] text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={acknowledgmentThree}
                                    onChange={(event) => setAcknowledgmentThree(event.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-transparent text-[#2D6EF5] focus:ring-[#2D6EF5]"
                                />
                                <span>
                                    I acknowledge that data obtained through this platform may not be redistributed, resold, or
                                    used beyond the stated purpose without explicit written consent.
                                </span>
                            </label>
                        </section>
                    </div>

                    <footer className="flex flex-col-reverse gap-3 border-t border-slate-700/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#2D6EF5] hover:text-white"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            disabled={!canSubmitForReview}
                            className="rounded-lg bg-[#2D6EF5] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#205BE0] disabled:cursor-not-allowed disabled:bg-[#2D6EF5]/50"
                        >
                            Submit for Review
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    )
}

