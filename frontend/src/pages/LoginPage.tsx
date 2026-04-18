import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { readVerificationSnapshot } from '../onboarding/storage'
import type { AuthenticationMethod } from '../onboarding/types'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'
const sessionCharacters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const authenticationMethodLabels: Record<AuthenticationMethod, string> = {
    sso: 'Okta / Microsoft Entra (SSO)',
    hardware_key: 'Hardware Key (WebAuthn / YubiKey)'
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

const generateSessionId = () => {
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += sessionCharacters[Math.floor(Math.random() * sessionCharacters.length)]
    }
    return result
}

const generateTimestamp = () => {
    const now = new Date()
    return now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
}

type AuthScreen = 'entry' | 'verification' | 'authenticated'

function normalizeVerificationKey(value: string) {
    return value.trim().toLowerCase()
}

function isAcceptedMockVerificationKey(value: string) {
    return value.trim().length > 0
}

function SecurityFooter({ sessionId, timestamp }: { sessionId: string; timestamp: string }) {
    return (
        <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="whitespace-pre-line text-[10px] font-mono leading-relaxed text-slate-500">
                Restricted Enclave.
                {'\n'}
                All authentication attempts,
                {'\n'}
                IP metadata, and device fingerprints
                {'\n'}
                are cryptographically logged.
            </p>
            <p className="mt-3 text-[10px] font-mono text-slate-600">Session ID: RDT-{sessionId}</p>
            <p className="text-[10px] font-mono text-slate-600">Timestamp: {timestamp}</p>
        </div>
    )
}

export default function LoginPage() {
    const { isAuthenticated, accessStatus, signIn, workspaceRole, updateWorkspaceRole } = useAuth()
    const navigate = useNavigate()
    const verificationSnapshot = readVerificationSnapshot()
    const registeredVerificationKey = verificationSnapshot.verificationKey.trim()
    const registeredAuthMethod = verificationSnapshot.authenticationMethod ?? 'sso'
    const [email, setEmail] = useState('')
    const [verificationKey, setVerificationKey] = useState('')
    const [screen, setScreen] = useState<AuthScreen>('entry')
    const [loadingState, setLoadingState] = useState<'resolving' | 'validating' | null>(null)
    const [verificationError, setVerificationError] = useState<string | null>(null)
    const [sessionId] = useState(() => generateSessionId())
    const [timestamp] = useState(() => generateTimestamp())
    const resolvingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hasMockConsoleAccess = MOCK_AUTH && (accessStatus === 'pending' || accessStatus === 'not_started')
    const hasMockReviewAccess = MOCK_AUTH && accessStatus === 'pending'

    if (isAuthenticated && accessStatus === 'approved') {
        const targetPath = workspaceRole === 'provider' || workspaceRole === 'hybrid' 
            ? '/provider/dashboard' 
            : '/dashboard'
        return <Navigate to={targetPath} replace />
    }

    useEffect(() => {
        return () => {
            if (resolvingTimerRef.current) {
                clearTimeout(resolvingTimerRef.current)
            }

            if (validationTimerRef.current) {
                clearTimeout(validationTimerRef.current)
            }
        }
    }, [])

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setVerificationError(null)
        setLoadingState('resolving')
        resolvingTimerRef.current = setTimeout(() => {
            setLoadingState(null)
            setScreen('verification')
        }, 1500)
    }

    const handleVerifyKey = (e: React.FormEvent) => {
        e.preventDefault()
        if (!verificationKey.trim()) return

        setVerificationError(null)
        setLoadingState('validating')
        validationTimerRef.current = setTimeout(() => {
            setLoadingState(null)

            const matchesRegisteredKey =
                registeredVerificationKey &&
                normalizeVerificationKey(verificationKey) === normalizeVerificationKey(registeredVerificationKey)
            const acceptsMockCredential = MOCK_AUTH && isAcceptedMockVerificationKey(verificationKey)

            if (
                registeredVerificationKey &&
                !matchesRegisteredKey &&
                !acceptsMockCredential
            ) {
                setVerificationError('Verification key not recognized. Check your saved credential or DNS TXT record.')
                return
            }

            setScreen('authenticated')
        }, 1500)
    }

    const handleAuthenticate = () => {
        const didSignIn = signIn()
        if (!didSignIn) return

        const isProvider = email.toLowerCase().includes('provider') || email.toLowerCase().includes('contrib')
        updateWorkspaceRole(isProvider ? 'provider' : 'buyer')
        navigate('/dashboard')
    }

    const handleStartOver = () => {
        setScreen('entry')
        setEmail('')
        setVerificationKey('')
        setLoadingState(null)
        setVerificationError(null)
    }

    if (accessStatus === 'pending' && !hasMockReviewAccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
                <div className="relative bg-slate-900 rounded-lg p-8 border border-slate-700 space-y-4 max-w-md w-full">
                    <h1 className="text-3xl font-bold text-white text-center">Verification Pending</h1>
                    <p className="text-slate-300 text-center">
                        Application submitted. Access will be granted after verification.
                    </p>
                    <p className="text-sm text-slate-400 text-center">
                        Dashboard and datasets remain locked until approval.
                    </p>
                    <div className="pt-2 flex justify-center">
                        <Link
                            to="/application-status"
                            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors"
                        >
                            View Application Status
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (accessStatus === 'not_started' && !hasMockConsoleAccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
                <div className="relative bg-slate-800 rounded-lg p-8 border border-slate-700 space-y-4 max-w-md w-full">
                    <h1 className="text-3xl font-bold text-white text-center">Access Request Required</h1>
                    <p className="text-slate-300 text-center">
                        Start from Request Platform Access to begin onboarding.
                    </p>
                    <div className="pt-2 flex justify-center">
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
            <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
            
            <div className="relative bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-md w-full shadow-2xl">
                {hasMockReviewAccess && (
                    <div className="mb-5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                        <div className="font-semibold">Application review is still pending.</div>
                        <div className="mt-1 text-amber-100/80">
                            Mock access is enabled, so you can still enter the participant console while the review UI stays visible.
                        </div>
                        <div className="mt-3">
                            <Link
                                to="/application-status"
                                className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200 hover:text-white transition-colors"
                            >
                                View application status
                            </Link>
                        </div>
                    </div>
                )}

                {screen === 'entry' ? (
                    <form onSubmit={handleContinue} noValidate>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-white mb-1">Secure Node Entry</h1>
                            <p className="text-sm text-slate-400">
                                Enter your verified corporate email to begin authentication
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs uppercase tracking-[0.16em] text-slate-400 mb-2">
                                Corporate Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                placeholder="you@yourcompany.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loadingState === 'resolving'}
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Personal email addresses are not accepted
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loadingState === 'resolving' || !email.trim()}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loadingState === 'resolving' ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Resolving Node...</span>
                                </>
                            ) : (
                                <span>Continue →</span>
                            )}
                        </button>

                    </form>
                ) : screen === 'verification' ? (
                    <form onSubmit={handleVerifyKey} noValidate>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-white mb-1">Verification Key Required</h1>
                            <p className="mx-auto max-w-[17rem] whitespace-pre-line text-sm text-slate-400">
                                Enter the unique verification
                                {'\n'}
                                key generated during your
                                {'\n'}
                                onboarding process.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="verification-key-input" className="block text-xs uppercase tracking-[0.16em] text-slate-400 mb-2">
                                Verification Key
                            </label>
                            <input
                                id="verification-key-input"
                                type="text"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                placeholder="redoubt-verify=RDT-xxxxxxxx"
                                value={verificationKey}
                                onChange={(event) => {
                                    setVerificationKey(event.target.value)
                                    setVerificationError(null)
                                }}
                                disabled={loadingState === 'validating'}
                            />
                        </div>

                        <p className="mb-4 whitespace-pre-line text-xs leading-6 text-slate-500">
                            This key was generated when you
                            {'\n'}
                            verified your corporate domain
                            {'\n'}
                            during onboarding.
                            {'\n'}
                            Check your saved credentials
                            {'\n'}
                            or your DNS TXT records.
                        </p>

                        {verificationError && (
                            <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                                {verificationError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loadingState === 'validating' || !verificationKey.trim()}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loadingState === 'validating' ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Validating Key...</span>
                                </>
                            ) : (
                                <span>Verify Key →</span>
                            )}
                        </button>

                        <div className="mt-4 text-center">
                            <a
                                href="mailto:support@redoubt.io?subject=Lost%20verification%20key"
                                className="whitespace-pre-line text-xs text-slate-500 transition-colors hover:text-slate-300"
                            >
                                Lost your verification key?
                                {'\n'}
                                Contact support →
                            </a>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-emerald-300 mb-1">Identity Confirmed ✓</h1>
                            <p className="mx-auto max-w-[17rem] whitespace-pre-line text-sm text-slate-400">
                                Complete authentication
                                {'\n'}
                                using your registered method.
                            </p>
                        </div>

                        <div className="mb-5 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Registered method</div>
                            <div className="mt-2 text-sm text-white">{authenticationMethodLabels[registeredAuthMethod]}</div>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleAuthenticate}
                                className={cx(
                                    'w-full rounded-lg border px-4 py-4 text-left transition-colors',
                                    registeredAuthMethod === 'sso'
                                        ? 'border-blue-500/70 bg-blue-500/10 hover:bg-blue-500/15'
                                        : 'border-slate-700 bg-slate-950 hover:border-blue-500/50'
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-sm font-semibold text-white">Authenticate via Okta / Microsoft Entra (SSO)</span>
                                    {registeredAuthMethod === 'sso' && (
                                        <span className="rounded-full border border-blue-400/35 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                                            Registered
                                        </span>
                                    )}
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={handleAuthenticate}
                                className={cx(
                                    'w-full rounded-lg border px-4 py-4 text-left transition-colors',
                                    registeredAuthMethod === 'hardware_key'
                                        ? 'border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/15'
                                        : 'border-slate-700 bg-slate-950 hover:border-emerald-500/40'
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-sm font-semibold text-white">Use Hardware Key (WebAuthn / YubiKey)</span>
                                    {registeredAuthMethod === 'hardware_key' && (
                                        <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                                            Registered
                                        </span>
                                    )}
                                </div>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleStartOver}
                            className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Wrong account? ← Start over
                        </button>
                    </div>
                )}

                <SecurityFooter sessionId={sessionId} timestamp={timestamp} />

                <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                    <Link
                        to="/admin"
                        className="text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                        System administrator? Open Admin Console
                    </Link>
                </div>
            </div>
        </div>
    )
}
