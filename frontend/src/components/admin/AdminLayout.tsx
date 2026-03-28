import { Link, useLocation, useNavigate } from 'react-router-dom'
import LogoMark from '../LogoMark'
import { useAuth } from '../../contexts/AuthContext'

type MenuItem = {
    label: string
    icon: string
    path?: string
}

const menuItems: MenuItem[] = [
    { label: 'Dashboard Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/admin/dashboard' },
    { label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', path: '/admin/user-management' },
    { label: 'Provider & Dataset', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', path: '/admin/provider-dataset' },
    { label: 'Security & Compliance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', path: '/admin/security-compliance' },
    { label: 'Operations', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01', path: '/admin/operations' },
    { label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', path: '/admin/notifications' },
    { label: 'Onboarding Queue', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', path: '/admin/onboarding-queue' },
    { label: 'AI Interrogation Logs', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', path: '/admin/ai-interrogation-logs' },
    { label: 'Escrow Vault', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', path: '/admin/escrow-vault' },
    { label: 'Active Ephemeral Tokens', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', path: '/admin/ephemeral-tokens' },
    { label: 'Audit Trail', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', path: '/admin/audit-trail' },
    { label: 'Incident Response', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', path: '/admin/incident-response' },
]

type AdminLayoutProps = {
    children: React.ReactNode
    title: string
    subtitle?: string
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const handleLogout = () => {
        signOut()
        navigate('/admin/login')
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <aside className="w-56 bg-gradient-to-b from-slate-950/95 to-slate-950 border-r border-slate-800/50 flex flex-col backdrop-blur-xl overflow-hidden">
                <div className="p-5 border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                        <LogoMark className="w-9 h-9" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-slate-300 tracking-[0.15em]">REDOUBT</span>
                            <span className="text-[9px] text-slate-600 tracking-[0.2em] mt-0.5">ADMIN CONSOLE</span>
                        </div>
                    </div>
                </div>

                <div className="px-3 pt-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-800/50 rounded-lg mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-medium text-slate-400 tracking-wider">SYSTEM SECURE</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => item.path && navigate(item.path)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-medium tracking-wide transition-all duration-200 rounded-lg ${
                                isActive(item.path || '')
                                    ? 'bg-slate-800/80 text-slate-200 shadow-lg shadow-black/20'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
                            }`}
                        >
                            <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-800/60 mt-auto">
                    <button
                        onClick={() => navigate('/admin/settings')}
                        className={`w-full flex items-center gap-2.5 px-2 py-2 text-[10px] font-medium tracking-wider rounded-md border transition-all duration-200 mb-3 ${
                            isActive('/admin/settings')
                                ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                : 'border-slate-800/60 text-slate-500 hover:text-slate-300 hover:border-slate-700/80 hover:bg-slate-900/60'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.427 1.756 2.925 0 3.352a1.724 1.724 0 00-1.066 2.572c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.427 1.756-2.925 1.756-3.352 0a1.724 1.724 0 00-2.572-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.427-1.756-2.925 0-3.352a1.724 1.724 0 001.066-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75A3.75 3.75 0 1012 8.25a3.75 3.75 0 000 7.5z" />
                        </svg>
                        <span>SETTINGS</span>
                    </button>

                    <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-900/40 rounded-md border border-slate-800/30">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-[9px] text-slate-600 font-medium tracking-wider">ENCRYPTED SESSION</span>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[13px] font-semibold text-slate-200 tracking-[0.08em]">{title}</h1>
                        <div className="w-px h-4 bg-slate-800" />
                        <span className="text-[10px] text-slate-600 font-medium tracking-wider">{subtitle}</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500/80 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                            <span className="text-[10px] font-medium text-slate-400 tracking-wider">OPERATIONAL</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600">{new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium tracking-wider text-slate-500 hover:text-slate-300 border border-slate-800/60 hover:border-slate-700/80 rounded-md transition-all duration-200"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            SIGN OUT
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
