import { Link, NavLink, Outlet } from 'react-router-dom'
import PermissionGateMark from '../components/PermissionGateMark'
import ParticipantQuickActions from '../components/ParticipantQuickActions'

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
        title: 'OVERVIEW',
        items: [
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Guided Tour', to: '/guided-tour' }
        ]
    },
    {
        title: 'BUYER WORKFLOW',
        items: [
            { label: 'Datasets', to: '/datasets' },
            { label: 'Access Requests', to: '/access-requests' },
            { label: 'Escrow Center', to: '/escrow-center' },
            { label: 'Compliance Passport', to: '/compliance-passport' },
            { label: 'Rights Quote Builder', to: '/datasets/1/rights-quote' }
        ]
    },
    {
        title: 'PROVIDER WORKFLOW',
        items: [
            { label: 'Provider Dashboard', to: '/provider/dashboard' },
            { label: 'Contributions', to: '/contributions' }
        ]
    },
    {
        title: 'TRUST & CONSENT',
        items: [
            { label: 'Trust Profile', to: '/trust-profile' },
            { label: 'Trust Score History', to: '/trust-score-history' },
            { label: 'Consent', to: '/consent-tracker' }
        ]
    },
    {
        title: 'COMPLIANCE OPS',
        items: [
            { label: 'Audit Trail', to: '/audit-trail' },
            { label: 'Compliance', to: '/compliance-locker' }
        ]
    },
    {
        title: 'SECURITY',
        items: [
            { label: 'Security', to: '/security-ops' },
            { label: 'Incident Response', to: '/admin/incident-response' }
        ]
    },
    {
        title: 'INTEGRATIONS',
        items: [
            { label: 'Pipelines', to: '/pipelines' },
            { label: 'Usage Analytics', to: '/usage-analytics' }
        ]
    },
    {
        title: 'ACCOUNT',
        items: [
            { label: 'Platform Status', to: '/status' },
            { label: 'Profile / Settings', to: '/profile' },
            { label: 'Deployment Model', to: '/deployment-model' }
        ]
    }
]

export default function AppLayout() {
    const consoleFocusRingClass =
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
    const shellHeaderHeightClass = 'h-[72px]'
    const shellHeaderBorderClass = 'border-b border-cyan-500/20'
    const shellBrandLinkClass = `flex items-center gap-3 rounded-xl ${consoleFocusRingClass}`
    const shellBrandIconClass =
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.12)]'

    return (
        <div className="relative h-screen overflow-hidden bg-slate-900 text-white">
            <a
                href="#app-main-content"
                className={`fixed left-4 top-4 z-[60] -translate-y-16 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-transform focus:translate-y-0 ${consoleFocusRingClass}`}
            >
                Skip to main content
            </a>
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl md:flex">
                <div className="flex h-full w-full flex-col overflow-hidden">
                    <div className={`${shellHeaderHeightClass} ${shellHeaderBorderClass} flex items-center px-5`}>
                        <Link to="/dashboard" className={`${shellBrandLinkClass} w-full`}>
                            <span className={shellBrandIconClass}>
                                <PermissionGateMark className="h-6 w-6" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[11px] uppercase tracking-[0.2em] text-slate-500">Participant Console</span>
                                <span className="mt-1 block truncate text-sm font-semibold text-slate-100 transition-colors hover:text-blue-300">
                                    Redoubt
                                </span>
                            </span>
                        </Link>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-4">
                        {navGroups.map((group, groupIndex) => (
                            <div key={group.title} className={`${groupIndex > 0 ? 'border-t border-slate-800/80 pt-3' : ''} space-y-2`}>
                                <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.title}</p>
                                <div className="space-y-1">
                                    {group.items.map(item => (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            className={({ isActive }) =>
                                                `block px-4 py-3 rounded-xl text-sm transition-all duration-200 ${consoleFocusRingClass} ${
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
                </div>
            </aside>

            <div className="relative h-full min-w-0 md:pl-[260px]">
                <header className={`fixed inset-x-0 top-0 z-30 ${shellHeaderHeightClass} ${shellHeaderBorderClass} bg-black/80 backdrop-blur-xl md:left-[260px]`}>
                    <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className={shellBrandLinkClass} aria-label="Open participant dashboard">
                                <span className={`${shellBrandIconClass} h-9 w-9 sm:h-10 sm:w-10`}>
                                    <PermissionGateMark className="h-5 w-5 sm:h-6 sm:w-6" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] uppercase tracking-[0.2em] text-slate-500">Participant Console</span>
                                    <span className="mt-1 block truncate text-sm font-semibold text-slate-100">Redoubt</span>
                                </span>
                            </Link>
                        </div>

                        <nav className="flex shrink-0 items-center gap-2 sm:gap-3" aria-label="Participant console tools">
                            <button
                                type="button"
                                className={`relative rounded-[12px] border border-slate-700 bg-slate-900 px-2.5 py-2 text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white sm:px-3 ${consoleFocusRingClass}`}
                                aria-label="Open notifications"
                            >
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.42L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className={`rounded-[12px] border border-slate-700 bg-slate-900 px-2.5 py-2 text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white sm:px-3 ${consoleFocusRingClass}`}
                                aria-label="Open help and guidance"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 115.82 1c0 2-3 3-3 3" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <Link
                                to="/profile"
                                className={`flex items-center gap-2 rounded-[12px] border border-slate-700 bg-slate-900 px-2.5 py-2 text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white sm:gap-3 sm:px-3 ${consoleFocusRingClass}`}
                                aria-label="Open profile settings"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-slate-950">
                                    RP
                                </span>
                                <span className="hidden text-left md:block">
                                    <span className="block text-sm font-medium text-slate-100">Profile</span>
                                    <span className="block text-xs text-slate-500">Settings</span>
                                </span>
                            </Link>
                        </nav>
                    </div>
                </header>

                <main
                    id="app-main-content"
                    tabIndex={-1}
                    className="h-full overflow-y-auto overscroll-y-contain pb-40 pt-[72px] md:pb-44 lg:pb-8 lg:pr-0 xl:pr-28"
                >
                    <div className="min-h-[calc(100vh-72px)]">
                        <Outlet />
                    </div>
                </main>
            </div>

            <ParticipantQuickActions />
        </div>
    )
}

