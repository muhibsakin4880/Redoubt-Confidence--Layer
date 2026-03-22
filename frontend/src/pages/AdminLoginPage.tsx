import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const generateSessionId = () => {
    const hex = '0123456789abcdef'
    let result = 'ADM-'
    for (let i = 0; i < 12; i++) {
        if (i === 4 || i === 8) result += '-'
        result += hex[Math.floor(Math.random() * hex.length)]
    }
    return result.toUpperCase()
}

const generateTimestamp = () => {
    const now = new Date()
    return now.toISOString().replace('T', ' ').substring(0, 23) + ' UTC'
}

const MOCK_ADMIN_AUTH = true

export default function AdminLoginPage() {
    const { isAuthenticated, signIn, signOut } = useAuth()
    const navigate = useNavigate()
    const [adminId, setAdminId] = useState('ADMIN_ROOT')
    const [passphrase, setPassphrase] = useState('OVERRIDE_TOKEN_2026')
    const [securityKey, setSecurityKey] = useState('123456')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sessionId] = useState(() => generateSessionId())
    const [timestamp] = useState(() => generateTimestamp())
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const handleSignOut = () => {
        signOut()
        navigate('/admin/login')
    }

    const handleAuthenticate = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!MOCK_ADMIN_AUTH) {
            if (!adminId.trim()) {
                setError('ADMINISTRATOR ID REQUIRED')
                return
            }
            if (!passphrase.trim()) {
                setError('MASTER PASSPHRASE REQUIRED')
                return
            }
            if (!securityKey.trim()) {
                setError('2FA TOKEN REQUIRED')
                return
            }
        }

        setIsLoading(true)
        signIn()
        setTimeout(() => {
            navigate('/admin/dashboard')
        }, 500)
    }

    if (isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-950 via-black to-black" />
                <div className="relative w-full max-w-lg">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-red-950 via-red-900/50 to-red-950 rounded-none opacity-60" />
                    <div className="relative bg-black border border-red-900/60 p-8 space-y-6">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <h1 className="text-xl font-mono font-bold tracking-[0.3em] text-red-400 uppercase">
                                Authentication Active
                            </h1>
                            <p className="text-sm font-mono text-slate-500">Redirecting to admin dashboard...</p>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={handleSignOut}
                                className="text-[10px] font-mono text-slate-500 hover:text-red-400 uppercase tracking-wider transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-950 via-black to-black" />
            
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgaDBMNDAgdjBIeiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] opacity-20" />
            </div>

            <div className="relative w-full max-w-lg">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-red-950 via-red-900/50 to-red-950 rounded-none opacity-60" />
                <div className="absolute -inset-[1px] bg-gradient-to-b from-transparent via-red-900/20 to-transparent" />
                
                <div className="relative bg-black border border-red-900/60 p-8 space-y-6">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-700 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-700 to-transparent" />

                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="relative">
                                <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div className="absolute inset-0 blur-xl bg-red-600/20 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-xl font-mono font-bold tracking-[0.3em] text-red-400 uppercase">
                                OVERSEER
                            </h1>
                            <h2 className="text-sm font-mono tracking-[0.2em] text-slate-500 uppercase">
                                / Admin Portal /
                            </h2>
                        </div>

                        <div className="bg-red-950/30 border border-red-900/40 px-4 py-2">
                            <p className="text-[10px] font-mono text-red-400/80 uppercase tracking-wider leading-relaxed">
                                ⚠ RESTRICTED AREA. UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED AND LOGGED.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAuthenticate} noValidate className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                    Administrator ID
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full pl-10 pr-4 py-3 bg-slate-950 border text-slate-200 font-mono text-sm placeholder:text-slate-700 focus:outline-none transition-all ${
                                            focusedField === 'adminId'
                                                ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                                : 'border-slate-800 hover:border-slate-700'
                                        }`}
                                        placeholder="ENTER_ADMIN_ID"
                                        value={adminId}
                                        onChange={(e) => setAdminId(e.target.value)}
                                        onFocus={() => setFocusedField('adminId')}
                                        onBlur={() => setFocusedField(null)}
                                        disabled={isLoading}
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                    Master Passphrase
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        className={`w-full pl-10 pr-4 py-3 bg-slate-950 border text-slate-200 font-mono text-sm placeholder:text-slate-700 focus:outline-none transition-all ${
                                            focusedField === 'passphrase'
                                                ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                                : 'border-slate-800 hover:border-slate-700'
                                        }`}
                                        placeholder="ENTER_PASSPHRASE"
                                        value={passphrase}
                                        onChange={(e) => setPassphrase(e.target.value)}
                                        onFocus={() => setFocusedField('passphrase')}
                                        onBlur={() => setFocusedField(null)}
                                        disabled={isLoading}
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                    Hardware Security Key / 2FA Token
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full pl-10 pr-4 py-3 bg-slate-950 border text-slate-200 font-mono text-sm placeholder:text-slate-700 focus:outline-none transition-all ${
                                            focusedField === 'securityKey'
                                                ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                                : 'border-slate-800 hover:border-slate-700'
                                        }`}
                                        placeholder="6-DIGIT_TOKEN"
                                        value={securityKey}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                            setSecurityKey(val)
                                        }}
                                        onFocus={() => setFocusedField('securityKey')}
                                        onBlur={() => setFocusedField(null)}
                                        disabled={isLoading}
                                        autoComplete="off"
                                        spellCheck="false"
                                        inputMode="numeric"
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-950/50 border border-red-800 px-4 py-3">
                                <p className="text-xs font-mono text-red-400 uppercase tracking-wider text-center">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative"
                        >
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-red-800 via-red-700 to-red-800 opacity-80" />
                            <div className="relative bg-black border border-red-700/50 px-6 py-3 transition-all duration-300 group-hover:bg-red-950/30 group-hover:border-red-600 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                                <div className="flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="text-sm font-mono font-bold text-red-400 uppercase tracking-[0.2em]">
                                                Initializing Handshake...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span className="text-sm font-mono font-bold text-red-400 uppercase tracking-[0.2em]">
                                                Authenticate Session
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </button>
                    </form>

                    <div className="border-t border-slate-800 pt-4 space-y-2">
                        <div className="bg-slate-950/50 border border-slate-800/50 px-3 py-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono text-slate-600 uppercase">Session ID</span>
                                <span className="text-[10px] font-mono text-slate-500">{sessionId}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] font-mono text-slate-600 uppercase">Timestamp</span>
                                <span className="text-[10px] font-mono text-slate-500">{timestamp}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] font-mono text-slate-600 uppercase">Protocol</span>
                                <span className="text-[10px] font-mono text-red-500/70">TLS 1.3 / MFA-HMAC</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-emerald-500 uppercase">Session Active</span>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-[10px] font-mono text-slate-500 hover:text-red-400 uppercase tracking-wider transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
                                >
                                    ← Standard Access
                                </Link>
                            )}
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-red-500 animate-pulse" />
                                <span className="text-[9px] font-mono text-slate-600 uppercase">Zero-Trust Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
