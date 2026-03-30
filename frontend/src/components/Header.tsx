import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type PublicNavItem = {
    label: string
    href?: string
    to?: string
}

const publicNav: PublicNavItem[] = [
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Security', href: '/#security' },
    { label: 'Solutions', to: '/solutions' },
    { label: 'Evaluate', href: '/#how-it-works' }
]

export default function Header() {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { signOut, startOnboarding } = useAuth()

    const hideBrand = location.pathname === '/login'

    const handleRequestAccess = () => {
        startOnboarding()
        setIsMobileOpen(false)
        navigate('/onboarding')
    }

    const renderNavItems = (isMobile = false) => (
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-8 text-sm'}`}>
            {publicNav.map(item => {
                if (item.to) {
                    return (
                        <Link
                            key={`${item.label}-${item.to}`}
                            to={item.to}
                            className="text-slate-300 hover:text-white transition-colors"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            {item.label}
                        </Link>
                    )
                }

                return (
                    <a
                        key={`${item.label}-${item.href}`}
                        href={item.href}
                        className="text-slate-300 hover:text-white transition-colors"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        {item.label}
                    </a>
                )
            })}
        </div>
    )

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                {!hideBrand ? (
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <span className="text-white font-semibold text-lg">Redoubt</span>
                    </Link>
                ) : (
                    <div />
                )}

                <nav className="hidden md:flex items-center gap-8 text-sm">
                    {renderNavItems(false)}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link
                        to="/login"
                        onClick={() => signOut()}
                        className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                        Sign In
                    </Link>
                    <button
                        onClick={handleRequestAccess}
                        className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
                    >
                        Talk to Team
                    </button>
                </div>

                <div className="flex items-center gap-3 md:hidden">
                    <button
                        className="text-slate-200 active:scale-95 transition-transform duration-100"
                        onClick={() => setIsMobileOpen(prev => !prev)}
                        aria-label="Toggle navigation"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {isMobileOpen && (
                <div className="border-t border-slate-800 bg-slate-900/95 px-6 py-4 md:hidden">
                    {renderNavItems(true)}
                    <div className="mt-4 flex flex-col gap-3">
                        <Link
                            to="/login"
                            onClick={() => {
                                signOut()
                                setIsMobileOpen(false)
                            }}
                            className="text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <button
                            onClick={handleRequestAccess}
                            className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
                        >
                            Talk to Team
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}
