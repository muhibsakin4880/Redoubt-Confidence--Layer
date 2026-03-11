import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'Redoubt:onboarding:verification'
const allowedFileExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const maxFileSizeBytes = 5 * 1024 * 1024

const steps = [
    'Organization & Identity',
    'Intended Platform Usage',
    'Participation Intent',
    'Verification & Credentials',
    'Compliance Commitment',
    'Submission Confirmation'
]

type VerificationSnapshot = {
    linkedInConnected: boolean
    affiliationFileName: string | null
    authorizationFileName: string | null
}

const getStoredSnapshot = (): VerificationSnapshot => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
        return {
            linkedInConnected: false,
            affiliationFileName: null,
            authorizationFileName: null
        }
    }
    try {
        const parsed = JSON.parse(stored) as Partial<VerificationSnapshot>
        return {
            linkedInConnected: Boolean(parsed.linkedInConnected),
            affiliationFileName: parsed.affiliationFileName ?? null,
            authorizationFileName: parsed.authorizationFileName ?? null
        }
    } catch {
        return {
            linkedInConnected: false,
            affiliationFileName: null,
            authorizationFileName: null
        }
    }
}

export default function OnboardingStep4() {
    const navigate = useNavigate()
    const snapshot = getStoredSnapshot()
    const linkedInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
    const [isLinkedInConnected, setIsLinkedInConnected] = useState(snapshot.linkedInConnected)
    const [affiliationFileName, setAffiliationFileName] = useState<string | null>(snapshot.affiliationFileName)
    const [authorizationFileName, setAuthorizationFileName] = useState<string | null>(snapshot.authorizationFileName)
    const [affiliationError, setAffiliationError] = useState<string | null>(null)
    const [authorizationError, setAuthorizationError] = useState<string | null>(null)
    const [dragTarget, setDragTarget] = useState<'affiliation' | 'authorization' | null>(null)
    const [showError, setShowError] = useState(false)

    useEffect(() => {
        return () => {
            if (linkedInTimerRef.current) {
                clearTimeout(linkedInTimerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                linkedInConnected: isLinkedInConnected,
                affiliationFileName,
                authorizationFileName
            })
        )
    }, [isLinkedInConnected, affiliationFileName, authorizationFileName])

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

    const stepReady = isLinkedInConnected && Boolean(affiliationFileName) && Boolean(authorizationFileName)

    const handleNext = () => {
        if (!stepReady) {
            setShowError(true)
            return
        }
        setShowError(false)
        navigate('/onboarding/step5')
    }

    const handleBack = () => {
        navigate('/onboarding/step3')
    }

    const fillMockData = () => {
        setIsLinkedInConnected(true)
        setAffiliationFileName('affiliation-proof.pdf')
        setAuthorizationFileName('authorization-letter.pdf')
        setAffiliationError(null)
        setAuthorizationError(null)
        setShowError(false)
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Participant Onboarding</h1>
                    <p className="text-slate-400">Security and confidence infrastructure intake for controlled participation.</p>
                </div>

                <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-2">
                    {steps.map((title, idx) => {
                        const currentStep = idx + 1
                        const active = currentStep === 4
                        const done = currentStep < 4
                        return (
                            <div
                                key={title}
                                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                                    active
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                        : done
                                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                            : 'border-slate-700 bg-slate-800/70 text-slate-400'
                                }`}
                            >
                                <div className="uppercase tracking-[0.1em] mb-1">Step {currentStep}</div>
                                <div>{title}</div>
                            </div>
                        )
                    })}
                </div>

                <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-5 mb-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">Verification &amp; Credentials</h2>
                        <span className="text-xs uppercase tracking-[0.14em] text-amber-200">Required</span>
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

                    {showError && !stepReady && (
                        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                            Please complete LinkedIn verification and upload both documents before continuing.
                        </div>
                    )}
                </section>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={fillMockData}
                        className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white transition-colors text-sm"
                    >
                        Use mock data
                    </button>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!stepReady}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
