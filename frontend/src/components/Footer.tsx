import LogoMark from './LogoMark'

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
                            A trusted platform for data verification, research access, and dataset management with built-in quality assurance.
                        </p>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">About Us</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Documentation</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">API Reference</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </a>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Privacy Policy</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Terms of Service</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-all duration-300 relative group overflow-hidden">
                                <span className="relative z-10">Contact</span>
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                        © {currentYear} <span className="text-cyan-400" style={{ textShadow: '0 0 8px rgba(34, 211, 238, 0.4)' }}>Layered Defense for Data Confidence</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 cyber-glow" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))' }}>
                        <LogoMark className="w-6 h-6" />
                        <span className="text-white font-semibold text-sm" style={{ fontFamily: "'Satoshi Black', 'Syne', sans-serif" }}>Redoubt</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}


