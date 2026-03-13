import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type NavItem = {
    label: string
    to: string
}

type NavGroup = {
    title: string
    items: NavItem[]
}

const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Guided Tour', to: '/guided-tour' }
        ]
    },
    {
        title: 'Data Access',
        items: [
            { label: 'Datasets', to: '/datasets' },
            { label: 'Access Requests', to: '/access-requests' },
            { label: 'Escrow Center', to: '/escrow-center' },
            { label: 'Contributions', to: '/contributions' }
        ]
    },
    {
        title: 'Trust & Consent',
        items: [
            { label: 'Trust Profile', to: '/trust-profile' },
            { label: 'Consent', to: '/consent-tracker' },
            { label: 'Trust Glossary', to: '/trust-glossary' }
        ]
    },
    {
        title: 'Compliance Ops',
        items: [
            { label: 'Audit Trail', to: '/audit-trail' },
            { label: 'Compliance', to: '/compliance-locker' },
            { label: 'Incident Response', to: '/incident-response' }
        ]
    },
    {
        title: 'Security',
        items: [
            { label: 'Security', to: '/security-ops' },
            { label: 'Red Team', to: '/red-team' },
            { label: 'Access Control', to: '/rbac-console' },
            { label: 'Data Classification', to: '/data-classification' },
            { label: 'Secure Enclave', to: '/secure-enclave' }
        ]
    },
    {
        title: 'Integrations',
        items: [
            { label: 'Pipelines', to: '/pipelines' },
            { label: 'Data Lineage', to: '/data-lineage' },
            { label: 'Usage Analytics', to: '/usage-analytics' }
        ]
    },
    {
        title: 'Account',
        items: [
            { label: 'Platform Status', to: '/status' },
            { label: 'Profile / Settings', to: '/profile' },
            { label: 'Deployment Model', to: '/deployment-model' }
        ]
    }
]

export default function AppLayout() {
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const handleSignOut = () => {
        signOut()
        navigate('/', { replace: true })
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-950/80">
                <div className="px-5 py-5 border-b border-slate-800">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <svg
                            className="w-10 h-10 overflow-visible"
                            viewBox="0 0 240 300"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ filter: 'drop-shadow(0 0 12px rgba(72, 219, 229, 0.5)) drop-shadow(0 0 24px rgba(14, 42, 80, 0.5))' }}
                        >
                            <defs>
                                <linearGradient id="dashShieldOuter" x1="120" y1="0" x2="120" y2="300" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#10294b"/>
                                    <stop offset="1" stopColor="#0a1323"/>
                                </linearGradient>
                                <linearGradient id="dashShieldInner" x1="120" y1="40" x2="120" y2="260" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#0f2442"/>
                                    <stop offset="1" stopColor="#091322"/>
                                </linearGradient>
                                <filter id="dashCircuitGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                                <filter id="dashShieldGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="6" result="softGlow"/>
                                    <feMerge>
                                        <feMergeNode in="softGlow"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <path
                                d="M120 10L24 60v86c0 78 46 132 96 144 50-12 96-66 96-144V60L120 10z"
                                fill="url(#dashShieldOuter)"
                                stroke="#0f3a7a"
                                strokeWidth="4"
                                filter="url(#dashShieldGlow)"
                            />
                            <path
                                d="M120 44L66 74v72c0 58 34 98 54 108 20-10 54-50 54-108V74L120 44z"
                                fill="url(#dashShieldInner)"
                                stroke="#0b2552"
                                strokeWidth="3"
                            />
                            <g stroke="#4dd6d6" strokeLinecap="round" strokeLinejoin="round" filter="url(#dashCircuitGlow)">
                                <path d="M58 198 C96 192 114 172 134 150" strokeWidth="8" />
                                <path d="M50 160 C90 156 110 138 130 120" strokeWidth="8" />
                                <path d="M62 124 C100 120 122 104 148 90" strokeWidth="8" />
                            </g>
                            <path d="M148 90 L180 78 L162 108 Z" fill="#4dd6d6" filter="url(#dashCircuitGlow)" />
                            <circle cx="58" cy="198" r="7" fill="#4dd6d6" filter="url(#dashCircuitGlow)" />
                            <circle cx="50" cy="160" r="7" fill="#4dd6d6" filter="url(#dashCircuitGlow)" />
                            <circle cx="62" cy="124" r="7" fill="#4dd6d6" filter="url(#dashCircuitGlow)" />
                        </svg>
                        <span className="text-xl font-bold text-white hover:text-blue-300 transition-colors">Redoubt Workspace</span>
                    </Link>
                    <p className="text-xs text-slate-400 mt-1 ml-11">Participant Console</p>
                </div>
                <nav className="p-4 space-y-4">
                    {navGroups.map((group, groupIndex) => (
                        <div key={group.title} className={`${groupIndex > 0 ? 'border-t border-slate-800/80 pt-3' : ''} space-y-2`}>
                            <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{group.title}</p>
                            <div className="space-y-1">
                                {group.items.map(item => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `block px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                                                    : 'text-slate-400 border border-transparent hover:border-slate-700/50 hover:text-white hover:bg-slate-800/50'
                                            }`
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 min-w-0">
                <header className="h-[76px] border-b border-cyan-500/30 bg-black/80 backdrop-blur-xl">
                    <div className="h-full px-6 flex items-center justify-between">
                        <div className="md:hidden">
                            <Link to="/dashboard" className="text-sm font-semibold text-slate-100">
                                Workspace
                            </Link>
                        </div>
                        <div className="hidden md:block text-sm text-slate-400">Participant workspace</div>
                        <div className="flex items-center gap-3">
<button className="relative p-2 rounded-lg border border-slate-700 text-slate-200 hover:text-white hover:border-blue-500 transition-colors transition-transform duration-100 active:scale-95" aria-label="Notifications">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.42L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                 </svg>
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            </button>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="text-xs text-slate-300">Verified session</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="px-3 py-2 rounded-lg border border-slate-700 hover:border-rose-500 text-sm text-slate-200 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

