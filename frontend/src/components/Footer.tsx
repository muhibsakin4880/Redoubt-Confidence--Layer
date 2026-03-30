import { Link } from 'react-router-dom'
import LogoMark from './LogoMark'
import TrustBadges from './TrustBadges'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-900 border-t border-cyan-500/30 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            <span className="text-cyan-400" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}>Layered Defense for Data Confidence</span>
                        </h3>
                        <p className="text-slate-400 text-sm">
                            A data confidence layer for governed access, protected evaluation, and review-ready controls before a pilot expands.
                        </p>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-white font-semibold text-sm mb-3">Public Pages</h4>
                        <div className="flex flex-col gap-2">
                            <Link to="/about" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">About</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </Link>
                            <Link to="/solutions" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Solutions</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </Link>
                            <Link to="/trust-center" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Trust Center</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </Link>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-white font-semibold text-sm mb-3">Review Path</h4>
                        <div className="flex flex-col gap-2">
                            <Link to="/pilot-walkthrough" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Pilot Walkthrough</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </Link>
                            <Link to="/protected-evaluation" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Protected Evaluation</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </Link>
                            <Link to="/login" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Sign In</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </Link>
                        </div>
                    </div>
                </div>

                <TrustBadges />

                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-slate-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                            © {currentYear} <span className="text-cyan-400" style={{ textShadow: '0 0 8px rgba(34, 211, 238, 0.4)' }}>Layered Defense for Data Confidence</span>. All rights reserved.
                        </p>
                        <Link
                            to="/admin/login"
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-400 text-xs transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>System Admin</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 cyber-glow" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))' }}>
                        <LogoMark className="w-6 h-6" />
                        <span className="text-white font-semibold text-sm" style={{ fontFamily: "'Satoshi Black', 'Syne', sans-serif" }}>Redoubt</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}


