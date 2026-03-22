import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
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

const onboardingData = [
    { timestamp: '2026-03-23 09:42:15', applicantId: 'APP-7821', organization: 'Apex Analytics Inc.', accessType: 'Data Consumer', riskScore: 23, status: 'Pending' },
    { timestamp: '2026-03-23 09:38:02', applicantId: 'APP-3390', organization: 'Meridian Systems', accessType: 'Data Provider', riskScore: 67, status: 'Flagged' },
    { timestamp: '2026-03-23 09:15:47', applicantId: 'APP-1156', organization: 'Cascade Data Corp', accessType: 'Data Consumer', riskScore: 45, status: 'Reviewing' },
    { timestamp: '2026-03-23 08:52:33', applicantId: 'APP-8847', organization: 'Vortex Analytics', accessType: 'Data Provider', riskScore: 18, status: 'Pending' },
    { timestamp: '2026-03-23 08:31:19', applicantId: 'APP-2293', organization: 'Horizon Tech LLC', accessType: 'Data Consumer', riskScore: 82, status: 'Flagged' },
    { timestamp: '2026-03-23 08:14:56', applicantId: 'APP-5501', organization: 'Quantum Insights', accessType: 'Data Provider', riskScore: 31, status: 'Reviewing' },
    { timestamp: '2026-03-23 07:48:22', applicantId: 'APP-6624', organization: 'Nexus Dynamics', accessType: 'Data Consumer', riskScore: 12, status: 'Pending' },
    { timestamp: '2026-03-23 07:22:08', applicantId: 'APP-4471', organization: 'Pinnacle Systems', accessType: 'Data Provider', riskScore: 55, status: 'Reviewing' },
]

const activityData = [
    { type: 'approved', message: 'APP-9182 approved by admin@redoubt.io', time: '2m ago' },
    { type: 'review', message: 'APP-3390 flagged for compliance review', time: '8m ago' },
    { type: 'submitted', message: 'New application from Apex Analytics Inc.', time: '12m ago' },
    { type: 'rejected', message: 'APP-7751 rejected - failed KYC check', time: '18m ago' },
    { type: 'review', message: 'APP-1156 under secondary review', time: '25m ago' },
]

export default function OnboardingQueuePage() {
    const { isAuthenticated, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [activeMenu] = useState('Onboarding Queue')

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    const handleLogout = () => {
        signOut()
        navigate('/admin/login')
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-amber-500/10 text-amber-400/80 border border-amber-500/20">{status}</span>
            case 'Reviewing':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-cyan-500/10 text-cyan-400/80 border border-cyan-500/20">{status}</span>
            case 'Flagged':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-red-500/10 text-red-400/80 border border-red-500/20">{status}</span>
            default:
                return null
        }
    }

    const getRiskScoreColor = (score: number) => {
        if (score <= 30) return 'text-emerald-400/80'
        if (score <= 60) return 'text-amber-400/80'
        return 'text-red-400/80'
    }

    const getActivityStyle = (type: string) => {
        switch (type) {
            case 'approved':
                return 'border-l-[3px] border-emerald-500/50 bg-slate-950/40'
            case 'rejected':
                return 'border-l-[3px] border-red-500/50 bg-slate-950/40'
            case 'review':
                return 'border-l-[3px] border-amber-500/50 bg-slate-950/40'
            default:
                return 'border-l-[3px] border-cyan-500/40 bg-slate-950/40'
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'approved':
                return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400/80', path: 'M5 13l4 4L19 7' }
            case 'rejected':
                return { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400/80', path: 'M6 18L18 6M6 6l12 12' }
            case 'review':
                return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400/80', path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' }
            default:
                return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400/80', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
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
                                activeMenu === item.label
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
                            location.pathname === '/admin/settings'
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
                        <h1 className="text-[13px] font-semibold text-slate-200 tracking-[0.08em]">ONBOARDING QUEUE</h1>
                        <div className="w-px h-4 bg-slate-800" />
                        <span className="text-[10px] text-slate-600 font-medium tracking-wider">PARTICIPANT MANAGEMENT</span>
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
                                    <span className="text-[9px] text-slate-600 font-medium tracking-wider">AWAITING REVIEW</span>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">Avg. Processing Time</span>
                                </div>
                            </div>
                            <span className="text-4xl font-semibold text-slate-100 tracking-tight">4.2<span className="text-xl text-slate-500">h</span></span>
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] text-slate-600 font-medium tracking-wider">CYCLE TIME</span>
                                    <span className="text-[9px] text-emerald-500 font-medium">-12%</span>
                                </div>
                                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-500/30 rounded-full" style={{ width: '78%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 shadow-2xl shadow-black/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">Flagged Applications</span>
                                </div>
                            </div>
                            <span className="text-4xl font-semibold text-slate-100 tracking-tight">18</span>
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] text-slate-600 font-medium tracking-wider">REQUIRES ATTENTION</span>
                                    <span className="text-[9px] text-red-500 font-medium">+3</span>
                                </div>
                                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-500/60 to-red-500/30 rounded-full" style={{ width: '14%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 shadow-2xl shadow-black/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">Queue Utilization</span>
                                </div>
                            </div>
                            <span className="text-4xl font-semibold text-slate-100 tracking-tight">72<span className="text-xl text-slate-500">%</span></span>
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] text-slate-600 font-medium tracking-wider">CAPACITY USED</span>
                                    <span className="text-[9px] text-slate-500 font-medium">72%</span>
                                </div>
                                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-500/30 rounded-full" style={{ width: '72%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Onboarding Queue</h2>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/60 rounded-full">
                                        <span className="text-[9px] font-semibold text-slate-500 tracking-wider">8 PENDING</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-slate-600 font-medium tracking-wider">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    COMPLIANCE REVIEW
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-950/40">
                                        <tr className="text-[9px] font-semibold text-slate-600 tracking-[0.12em] uppercase">
                                            <th className="text-left px-5 py-3 font-medium">Timestamp</th>
                                            <th className="text-left px-5 py-3 font-medium">Applicant ID</th>
                                            <th className="text-left px-5 py-3 font-medium">Organization</th>
                                            <th className="text-left px-5 py-3 font-medium">Access Type</th>
                                            <th className="text-left px-5 py-3 font-medium">Risk Score</th>
                                            <th className="text-left px-5 py-3 font-medium">Status</th>
                                            <th className="text-left px-5 py-3 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {onboardingData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors duration-150">
                                                <td className="px-5 py-4 text-[10px] font-mono text-slate-500">{row.timestamp}</td>
                                                <td className="px-5 py-4 text-[10px] font-mono text-cyan-400/80">{row.applicantId}</td>
                                                <td className="px-5 py-4 text-[11px] text-slate-300 font-medium">{row.organization}</td>
                                                <td className="px-5 py-4 text-[10px] text-slate-500">{row.accessType}</td>
                                                <td className="px-5 py-4 text-[10px] font-semibold font-mono">
                                                    <span className={getRiskScoreColor(row.riskScore)}>{row.riskScore}</span>
                                                </td>
                                                <td className="px-5 py-4">{getStatusBadge(row.status)}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button className="text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-cyan-500/30 text-cyan-400/80 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-200">
                                                            Review
                                                        </button>
                                                        <button className="text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-emerald-500/30 text-emerald-400/80 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all duration-200">
                                                            Approve
                                                        </button>
                                                        <button className="text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-red-500/30 text-red-400/80 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200">
                                                            Reject
                                                        </button>
                                                    </div>
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
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Recent Activity</h2>
                                    <span className="text-[9px] font-medium text-slate-600 tracking-wider">LIVE FEED</span>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {activityData.map((activity, idx) => {
                                    const iconStyle = getActivityIcon(activity.type)
                                    return (
                                        <div key={idx} className={`px-5 py-3.5 ${getActivityStyle(activity.type)}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${iconStyle.bg} ${iconStyle.border}`}>
                                                    <svg className={`w-3 h-3 ${iconStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={iconStyle.path} />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[11px] text-slate-400 leading-relaxed block">{activity.message}</span>
                                                    <span className="text-[9px] text-slate-600 mt-1 block">{activity.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
