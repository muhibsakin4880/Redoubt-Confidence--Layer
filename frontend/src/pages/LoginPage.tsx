import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'
const freeEmailProviders = new Set([
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'protonmail.com'
])

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const isCorporateEmail = (value: string) => {
    if (!isValidEmail(value)) return false
    const domain = value.split('@')[1]?.toLowerCase()
    return Boolean(domain) && !freeEmailProviders.has(domain)
}

export default function LoginPage() {
    const { isAuthenticated, accessStatus, signIn, applicantEmail } = useAuth()
    const [step, setStep] = useState<1 | 2>(1)
    const [email, setEmail] = useState(applicantEmail)
    const [password, setPassword] = useState('')
    const [mfaCode, setMfaCode] = useState('')
    const [rememberDevice, setRememberDevice] = useState(true)
    const [error, setError] = useState<string | null>(null)

    if (isAuthenticated && accessStatus === 'approved') return <Navigate to="/dashboard" replace />

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (step === 1) {
            const trimmedEmail = email.trim().toLowerCase()
            if (!trimmedEmail) {
                setError('Work email is required.')
                return
            }
            if (!isCorporateEmail(trimmedEmail)) {
                setError('Please use a valid corporate work email (no personal email domains).')
                return
            }
            if (!MOCK_AUTH && password.trim().length < 8) {
                setError('Password must be at least 8 characters.')
                return
            }
            if (MOCK_AUTH && password.trim().length === 0) {
                setError('Password is required in this demo flow.')
                return
            }
            setStep(2)
            return
        }

        const trimmedCode = mfaCode.trim()
        if (!/^\d{6}$/.test(trimmedCode)) {
            setError('Enter a valid 6-digit verification code.')
            return
        }

        const signInResult = signIn() as boolean | { accessIntentRequired?: boolean }
        if (!signInResult) return

        const accessIntentRequired =
            typeof signInResult === 'object' && signInResult.accessIntentRequired === true

        if (accessIntentRequired) return
        // Auth state drives redirect via <Navigate /> above.
    }

    if (!MOCK_AUTH && accessStatus === 'pending') {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 space-y-4">
                        <h1 className="text-3xl font-bold text-white text-center">Verification Pending</h1>
                        <p className="text-slate-300 text-center">
                            Application submitted. Access will be granted after verification.
                        </p>
                        <p className="text-sm text-slate-400 text-center">
                            Dashboard and datasets remain locked until approval.
                        </p>
                        <div className="pt-2 flex justify-center">
                            <Link
                                to="/onboarding"
                                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors"
                            >
                                View Application Status
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!MOCK_AUTH && accessStatus !== 'approved') {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 space-y-4">
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
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto">
                <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">Participant Sign In</h1>
                    <p className="text-slate-400 text-center mb-8">
                        Approved participants can access controlled workspace modules.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Step {step} of 2</span>
                            <span className="text-slate-500">MFA required</span>
                        </div>

                        {step === 1 ? (
                            <>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                        Work Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="name@organization.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder={MOCK_AUTH ? 'Enter any password for demo' : 'Enter your password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Personal email domains are blocked for regulated access.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-3">
                                    <p className="text-xs text-slate-400">Signing in as</p>
                                    <p className="text-sm font-semibold text-slate-100 break-all">{email.trim().toLowerCase()}</p>
                                </div>

                                <div>
                                    <label htmlFor="mfa" className="block text-sm font-medium text-slate-300 mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        id="mfa"
                                        inputMode="numeric"
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors tracking-[0.25em] text-center"
                                        placeholder={MOCK_AUTH ? '123456' : 'Enter 6-digit code'}
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                        autoComplete="one-time-code"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        {MOCK_AUTH ? 'Demo: any 6 digits will work.' : 'Use your authenticator app.'}
                                    </p>
                                </div>

                                <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
                                    <span>Remember this device</span>
                                    <input
                                        type="checkbox"
                                        checked={rememberDevice}
                                        onChange={(e) => setRememberDevice(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-500 bg-transparent text-blue-600 focus:ring-blue-500"
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setError(null)
                                        setMfaCode('')
                                        setStep(1)
                                    }}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:border-blue-500 hover:text-white transition-colors"
                                >
                                    Back to credentials
                                </button>
                            </>
                        )}

                        {error && (
                            <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
                        >
                            {step === 1 ? 'Continue' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
