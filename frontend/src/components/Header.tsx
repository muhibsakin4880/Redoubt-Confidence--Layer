import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LogoMark from './LogoMark'

type NavItem = { label: string; to: string; primary?: boolean }

const publicNav: NavItem[] = [
    { label: 'Home', to: '/' },
    { label: 'Platform Overview', to: '/about' },
    { label: 'Solutions', to: '/solutions' },
    { label: 'Sign In', to: '/login' }
]

export default function Header() {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { signOut } = useAuth()

    const renderLinks = (isMobile = false) => (
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-6'}`}>
            {publicNav.map(item => {
                const classes = item.primary
                    ? 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium rounded-lg transition-colors text-center'
                    : 'text-sm md:text-base text-slate-300 hover:text-cyan-400 transition-all duration-300'

                return (
                    <Link
                        key={`${item.label}-${item.to}`}
                        to={item.to}
                        className={classes}
                        style={!item.primary ? { textShadow: '0 0 20px rgba(0, 240, 255, 0.3)' } : {}}
                        onClick={() => {
                            if (item.to === '/login') signOut()
                            setIsMobileOpen(false)
                        }}
                    >
                        {item.label}
                    </Link>
                )
            })}
        </div>
    )

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/80 border-b border-cyan-500/30" style={{ height: '88px' }}>
            <nav className="container mx-auto px-8 md:px-16 h-full">
                <div className="flex items-center justify-between h-full">
                    <Link to="/" className="flex items-center gap-5">
                        <LogoMark className="w-8 h-8" />
                        <div className="flex items-center">
                            <span className="text-2xl text-white" style={{ fontFamily: "'Satoshi Black', 'Syne', sans-serif" }}>Redoubt</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3 md:hidden">
                        <button
                            className="text-slate-200"
                            onClick={() => setIsMobileOpen(prev => !prev)}
                            aria-label="Toggle navigation"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        {renderLinks(false)}
                    </div>
                </div>

                {isMobileOpen && (
                    <div className="md:hidden mt-4 border-t border-slate-800 pt-4">
                        {renderLinks(true)}
                    </div>
                )}
            </nav>
        </header>
    )
}


