import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LogoMark from '../components/LogoMark'

const menuItems = [
    { label: 'Dashboard Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/admin/dashboard' },
    { label: 'Onboarding Queue', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', path: '/admin/onboarding-queue' },
    { label: 'AI Interrogation Logs', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', path: '/admin/ai-interrogation-logs' },
    { label: 'Escrow Vault', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', path: '/admin/escrow-vault' },
    { label: 'Active Ephemeral Tokens', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', path: '/admin/ephemeral-tokens' },
    { label: 'Audit Trail', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', path: '/admin/audit-trail' },
    { label: 'Incident Response', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', path: '/admin/incident-response' },
]

const interrogationData = [
    { timestamp: '2026-03-22 14:32:07', vendorId: 'VND-7821', dataset: 'Financial_Records_Q4_2025', status: 'Quarantined', action: 'Block' },
    { timestamp: '2026-03-22 14:31:54', vendorId: 'VND-3390', dataset: 'Customer_PII_Index', status: 'Scanning', action: 'Review' },
    { timestamp: '2026-03-22 14:31:42', vendorId: 'VND-1156', dataset: 'Healthcare_Compliance_Set', status: 'Clean', action: 'Review' },
    { timestamp: '2026-03-22 14:31:29', vendorId: 'VND-8847', dataset: 'E-Commerce_Transactions', status: 'Clean', action: 'Review' },
    { timestamp: '2026-03-22 14:31:15', vendorId: 'VND-2293', dataset: 'Social_Media_Metrics_DB', status: 'Quarantined', action: 'Block' },
    { timestamp: '2026-03-22 14:30:58', vendorId: 'VND-5501', dataset: 'IoT_Sensor_Raw_Data', status: 'Scanning', action: 'Review' },
]

const alertsData = [
    { type: 'critical', message: 'PII detected in Dataset #492' },
    { type: 'warning', message: 'Failed API token attempt from 192.168.1.44' },
    { type: 'critical', message: 'Unusual bulk access pattern detected' },
    { type: 'warning', message: 'Token expiration surge: 847 tokens/hour' },
    { type: 'info', message: 'Scheduled audit backup completed' },
]

export default function AdminDashboard() {
    const { isAuthenticated, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    const handleLogout = () => {
        signOut()
        navigate('/admin/login')
    }

    const getActiveMenu = (path: string) => {
        return location.pathname === path
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Clean':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20">Clean</span>
            case 'Quarantined':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-red-500/10 text-red-400/80 border border-red-500/20">Quarantined</span>
            case 'Scanning':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-amber-500/10 text-amber-400/80 border border-amber-500/20 animate-pulse">Scanning</span>
            default:
                return null
        }
    }

    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'critical':
                return 'border-l-[3px] border-rose-500/60 bg-slate-950/60 backdrop-blur-sm'
            case 'warning':
                return 'border-l-[3px] border-amber-500/50 bg-slate-950/40 backdrop-blur-sm'
            case 'info':
                return 'border-l-[3px] border-cyan-500/40 bg-slate-950/40 backdrop-blur-sm'
            default:
                return ''
        }
    }

    return (
        <div className="min-h-screen bg-[#030712] flex">
            <aside className="w-56 bg-gradient-to-b from-slate-950/95 to-slate-950 border-r border-slate-800/50 flex flex-col backdrop-blur-xl">
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

                <nav className="flex-1 px-3 space-y-0.5">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => item.path && navigate(item.path)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-medium tracking-wide transition-all duration-200 rounded-lg ${
                                getActiveMenu(item.path || '')
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
                        <h1 className="text-[13px] font-semibold text-slate-200 tracking-[0.08em]">{menuItems.find(m => m.path === location.pathname)?.label.toUpperCase() || 'DASHBOARD'}</h1>
                        <div className="w-px h-4 bg-slate-800" />
                        <span className="text-[10px] text-slate-600 font-medium tracking-wider">ADMINISTRATOR ACCESS</span>
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
                    <div className="grid grid-cols-12 gap-5 mb-6">
                        <div className="col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 shadow-2xl shadow-black/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-amber-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">Pending Clearances</span>
                                </div>
                            </div>
                            <span className="text-4xl font-semibold text-slate-100 tracking-tight">127</span>
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] text-slate-600 font-medium tracking-wider">QUEUE UTILIZATION</span>
                                    <span className="text-[9px] text-slate-500 font-medium">34%</span>
                                </div>
                                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-500/60 to-amber-500/30 rounded-full" style={{ width: '34%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 shadow-2xl shadow-black/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-cyan-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">Active Data Tokens</span>
                                </div>
                            </div>
                            <span className="text-4xl font-semibold text-slate-100 tracking-tight">8,472</span>
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] text-slate-600 font-medium tracking-wider">TOKEN UTILIZATION</span>
                                    <span className="text-[9px] text-slate-500 font-medium">72%</span>
                                </div>
                                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500/60 to-cyan-500/30 rounded-full" style={{ width: '72%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 shadow-2xl shadow-black/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">Quarantined</span>
                                </div>
                            </div>
                            <span className="text-4xl font-semibold text-slate-100 tracking-tight">23</span>
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] text-slate-600 font-medium tracking-wider">SECURITY THREATS</span>
                                    <span className="text-[9px] text-slate-500 font-medium">12%</span>
                                </div>
                                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-500/60 to-red-500/30 rounded-full" style={{ width: '12%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 shadow-2xl shadow-black/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">Escrow Volume</span>
                                </div>
                            </div>
                            <span className="text-4xl font-semibold text-slate-100 tracking-tight">$2.4M</span>
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] text-slate-600 font-medium tracking-wider">FUND ALLOCATION</span>
                                    <span className="text-[9px] text-slate-500 font-medium">89%</span>
                                </div>
                                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-500/30 rounded-full" style={{ width: '89%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Live Interrogation Feed</h2>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/60 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-cyan-500/80 rounded-full animate-pulse shadow-[0_0_6px_rgba(6,185,185,0.5)]" />
                                        <span className="text-[9px] font-semibold text-slate-500 tracking-wider">LIVE</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-slate-600 font-medium tracking-wider">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    AI GUARDIAN ACTIVE
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-950/40">
                                        <tr className="text-[9px] font-semibold text-slate-600 tracking-[0.12em] uppercase">
                                            <th className="text-left px-5 py-3 font-medium">Timestamp</th>
                                            <th className="text-left px-5 py-3 font-medium">Vendor ID</th>
                                            <th className="text-left px-5 py-3 font-medium">Dataset Name</th>
                                            <th className="text-left px-5 py-3 font-medium">AI Status</th>
                                            <th className="text-left px-5 py-3 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {interrogationData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors duration-150">
                                                <td className="px-5 py-4 text-[10px] font-mono text-slate-500">{row.timestamp}</td>
                                                <td className="px-5 py-4 text-[10px] font-mono text-cyan-400/80">{row.vendorId}</td>
                                                <td className="px-5 py-4 text-[10px] font-mono text-slate-300">{row.dataset}</td>
                                                <td className="px-5 py-4">{getStatusBadge(row.status)}</td>
                                                <td className="px-5 py-4">
                                                    <button className={`text-[9px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all duration-200 ${
                                                        row.action === 'Block'
                                                            ? 'border border-red-500/30 text-red-400/80 hover:bg-red-500/10 hover:border-red-500/50'
                                                            : 'border border-slate-700/50 text-slate-400/80 hover:bg-slate-800/50 hover:border-slate-600/50'
                                                    }`}>
                                                        {row.action}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Security Alerts</h2>
                                    <span className="text-[9px] font-medium text-slate-600 tracking-wider">LAST 24H</span>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {alertsData.map((alert, idx) => (
                                    <div
                                        key={idx}
                                        className={`px-5 py-3.5 ${getAlertStyle(alert.type)}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {alert.type === 'critical' && (
                                                <div className="w-5 h-5 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-3 h-3 text-red-400/80" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {alert.type === 'warning' && (
                                                <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-3 h-3 text-amber-400/80" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {alert.type === 'info' && (
                                                <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-3 h-3 text-cyan-400/80" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            <span className="text-[11px] text-slate-400 leading-relaxed">{alert.message}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800/40 rounded-xl p-4 shadow-2xl shadow-black/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-900/30 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-semibold text-slate-400 tracking-[0.08em] uppercase">Emergency Controls</h3>
                                    <p className="text-[9px] text-slate-600 mt-0.5 tracking-wider">Requires dual authentication • Immediate effect</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-400/80 border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 hover:border-red-800/60 rounded-lg transition-all duration-200">
                                Global Kill-Switch
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
