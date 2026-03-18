import { Link, useNavigate } from 'react-router-dom'
import { ChangeEvent, DragEvent, FormEvent, useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

// --- Animated counter hook ---
function useCountUp(target: number, duration = 1500, start = false) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime: number | null = null
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            setCount(Math.floor(progress * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [target, duration, start])
    return count
}

// --- Intersection observer hook ---
function useInView(threshold = 0.2) {
    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true) },
            { threshold }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [threshold])
    return { ref, inView }
}

export default function HomePage() {
    const { startOnboarding, signIn, signOut } = useAuth()
    const navigate = useNavigate()
    const [wizardOpen, setWizardOpen] = useState(false)
    const [wizardStep, setWizardStep] = useState(1)
    const [heroVisible, setHeroVisible] = useState(false)
    const statsRef = useInView()

    useEffect(() => {
        const timer = setTimeout(() => setHeroVisible(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const datasetsCount = useCountUp(12400, 1800, statsRef.inView)
    const verifiedCount = useCountUp(98, 1200, statsRef.inView)
    const partnersCount = useCountUp(340, 1600, statsRef.inView)

    // Hero animations handled via heroVisible state
    const handleRequestPlatformAccess = () => {
        startOnboarding()
        navigate('/onboarding')
    }

    const handleSignInFromLanding = () => {
        signOut()
    }

    const handleWizardProceed = (data: BasicInfoFormState) => {
        console.debug('Step 1 submission', data)
        setWizardStep(2)
    }

    const handleWizardCancel = () => {
        setWizardOpen(false)
        setWizardStep(1)
    }

    const handleSubmitAccessRequest = (data: AccessIntentFormState) => {
        console.debug('Step 2 access intent submission', data)
        setWizardStep(3)
    }

    const handleEnterDashboard = () => {
        signIn()
        setWizardOpen(false)
        setWizardStep(1)
        navigate('/dashboard')
    }

    const handleReviewProfile = () => {
        signIn()
        setWizardOpen(false)
        setWizardStep(1)
        navigate('/profile')
    }

    return (
        <div className="relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                .Redoubt-font { font-family: 'Syne', sans-serif; }
                .body-font { font-family: 'DM Sans', sans-serif; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(32px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(3deg); }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
                    70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(59,130,246,0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes grid-move {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(40px); }
                }
                @keyframes orb-drift {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.05); }
                    66% { transform: translate(-20px, 15px) scale(0.95); }
                }

                .animate-fadeUp { animation: fadeUp 0.7s ease forwards; }
                .animate-fadeIn { animation: fadeIn 0.6s ease forwards; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-pulse-ring { animation: pulse-ring 2.5s ease-in-out infinite; }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
                    background-size: 200% auto;
                    animation: shimmer 3s linear infinite;
                }
                .animate-orb { animation: orb-drift 12s ease-in-out infinite; }

                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }

                .glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(148, 163, 184, 0.08);
                    transition: all 0.3s ease;
                }
                .glass-card:hover {
                    border-color: rgba(59, 130, 246, 0.3);
                    background: rgba(15, 23, 42, 0.8);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 60px rgba(59, 130, 246, 0.1);
                }

                .step-connector::after {
                    content: '';
                    position: absolute;
                    top: 32px;
                    left: calc(50% + 40px);
                    width: calc(100% - 80px);
                    height: 1px;
                    background: linear-gradient(90deg, rgba(59,130,246,0.4), rgba(59,130,246,0.1));
                }

                .hero-bg {
                    background-color: #050C1F;
                    background-image: linear-gradient(180deg, #050C1F 0%, #020817 100%);
                }

                .hero-glow {
                    background: radial-gradient(closest-side at 50% 42%, rgba(70, 220, 230, 0.25) 0%, rgba(20, 30, 40, 0.1) 40%, transparent 70%);
                    filter: blur(70px);
                }

                .hero-shield {
                    filter: drop-shadow(0 0 30px rgba(72, 219, 229, 0.45)) drop-shadow(0 0 70px rgba(14, 42, 80, 0.45));
                }

                .hero-title {
                    background: #00E5FF;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: 0.14em;
                    text-shadow: 0 0 18px rgba(0, 229, 255, 0.35), 0 0 36px rgba(0, 229, 255, 0.22);
                }

                .hero-tagline {
                    color: #4dd6d6;
                    letter-spacing: 0.16em;
                    text-shadow: 0 0 14px rgba(77, 214, 214, 0.25);
                }

                .hero-btn-primary {
                    background: linear-gradient(135deg, #12305c 0%, #1f4f7a 100%);
                    transition: all 0.3s ease;
                    box-shadow: 0 16px 36px rgba(16, 60, 90, 0.45);
                }
                .hero-btn-primary:hover {
                    background: linear-gradient(135deg, #1b4d7a 0%, #2ac3cf 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 20px 44px rgba(42, 195, 207, 0.35);
                }

                .hero-btn-secondary {
                    background: rgba(11, 18, 26, 0.75);
                    border: 1px solid rgba(77, 214, 214, 0.35);
                    transition: all 0.3s ease;
                }
                .hero-btn-secondary:hover {
                    border-color: rgba(77, 214, 214, 0.65);
                    background: rgba(77, 214, 214, 0.08);
                    transform: translateY(-2px);
                }

                .hero-trust {
                    color: #9aa3ad;
                }
                .hero-trust-check {
                    color: #d7dde4;
                }

                .text-shimmer {
                    background: linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #ffffff 60%, #93c5fd 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }

                .btn-primary {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    transition: all 0.3s ease;
                }
                .btn-primary::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #3b82f6, #60a5fa);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .btn-primary:hover::before { opacity: 1; }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(59,130,246,0.4); }

                .btn-secondary {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.15);
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                .btn-secondary:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }

                .grid-bg {
                    background-image:
                        linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
                    background-size: 60px 60px;
                    animation: grid-move 8s linear infinite;
                }

                .stat-card {
                    background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05));
                    border: 1px solid rgba(59,130,246,0.15);
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    border-color: rgba(59,130,246,0.4);
                    transform: translateY(-2px);
                }

                .opacity-0-init { opacity: 0; }
            `}</style>

            {wizardOpen && (
                <OnboardingWizardOverlay
                    step={wizardStep}
                    onCancel={handleWizardCancel}
                    onProceed={handleWizardProceed}
                    onSubmitReview={() => {
                        console.debug('Submitted for review')
                        setWizardStep(4)
                    }}
                    onBackToStep1={() => setWizardStep(1)}
                    onBackToStep2={() => setWizardStep(2)}
                    onSubmitAccessRequest={handleSubmitAccessRequest}
                    onEnterDashboard={handleEnterDashboard}
                    onReviewProfile={handleReviewProfile}
                />
            )}

            <div aria-hidden={wizardOpen} className={wizardOpen ? 'hidden' : 'body-font'}>

                {/* ═══════════════════════════════════════
                    HERO SECTION
                ═══════════════════════════════════════ */}
                <section className="hero-bg relative min-h-screen flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 hero-glow" aria-hidden="true" />

                    <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div
                                className={`relative mx-auto mb-3 md:mb-4 lg:mb-4 w-56 h-56 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] pb-14 md:pb-20 lg:pb-24 overflow-visible opacity-0-init ${heroVisible ? 'animate-fadeUp' : ''}`}
                                style={{ opacity: heroVisible ? undefined : 0 }}
                            >
                                <svg viewBox="0 0 240 300" className="w-full h-full hero-shield overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="shieldOuter" x1="120" y1="0" x2="120" y2="280" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#10294b"/>
                                            <stop offset="1" stopColor="#0a1323"/>
                                        </linearGradient>
                                        <linearGradient id="shieldInner" x1="120" y1="40" x2="120" y2="240" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#0f2442"/>
                                            <stop offset="1" stopColor="#091322"/>
                                        </linearGradient>
                                        <filter id="circuitGlow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                        <filter id="shieldGlow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="6" result="softGlow"/>
                                            <feMerge>
                                                <feMergeNode in="softGlow"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <path
                                        d="M120 10L24 60v86c0 78 46 132 96 144 50-12 96-66 96-144V60L120 10z"
                                        fill="url(#shieldOuter)"
                                        stroke="#0f3a7a"
                                        strokeWidth="4"
                                        filter="url(#shieldGlow)"
                                    />
                                    <path
                                        d="M120 44L66 74v72c0 58 34 98 54 108 20-10 54-50 54-108V74L120 44z"
                                        fill="url(#shieldInner)"
                                        stroke="#0b2552"
                                        strokeWidth="3"
                                    />
                                    <g stroke="#4dd6d6" strokeLinecap="round" strokeLinejoin="round" filter="url(#circuitGlow)">
                                        <path d="M58 198 C96 192 114 172 134 150" strokeWidth="8" />
                                        <path d="M50 160 C90 156 110 138 130 120" strokeWidth="8" />
                                        <path d="M62 124 C100 120 122 104 148 90" strokeWidth="8" />
                                    </g>
                                    <path d="M148 90 L180 78 L162 108 Z" fill="#4dd6d6" filter="url(#circuitGlow)" />
                                    <circle cx="58" cy="198" r="7" fill="#4dd6d6" filter="url(#circuitGlow)" />
                                    <circle cx="50" cy="160" r="7" fill="#4dd6d6" filter="url(#circuitGlow)" />
                                    <circle cx="62" cy="124" r="7" fill="#4dd6d6" filter="url(#circuitGlow)" />
                                </svg>
                            </div>

                            <h1
                                className={`Redoubt-font hero-title text-6xl md:text-7xl lg:text-8xl font-extrabold uppercase opacity-0-init ${heroVisible ? 'animate-fadeUp delay-100' : ''}`}
                                style={{ opacity: heroVisible ? undefined : 0 }}
                            >
                                REDOUBT
                            </h1>

                            <p
                                className={`hero-tagline text-xs md:text-sm lg:text-base mt-5 uppercase font-semibold opacity-0-init ${heroVisible ? 'animate-fadeUp delay-200' : ''}`}
                                style={{ opacity: heroVisible ? undefined : 0 }}
                            >
                                LAYERED DEFENSE FOR DATA CONFIDENCE
                            </p>

                            <div
                                className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center opacity-0-init ${heroVisible ? 'animate-fadeUp delay-300' : ''}`}
                                style={{ opacity: heroVisible ? undefined : 0 }}
                            >
                                <Link
                                    to="/login"
                                    onClick={handleSignInFromLanding}
                                    className="hero-btn-primary px-8 py-4 text-white font-semibold rounded-xl text-lg"
                                >
                                    Sign In →
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleRequestPlatformAccess}
                                    className="hero-btn-secondary px-8 py-4 text-white/90 font-semibold rounded-xl text-lg"
                                >
                                    Request Platform Access
                                </button>
                            </div>

                            <div
                                className={`mt-12 opacity-0-init ${heroVisible ? 'animate-fadeIn delay-400' : ''}`}
                                style={{ opacity: heroVisible ? undefined : 0 }}
                            >
                                <h3 className="text-center text-xl font-semibold text-white mb-6">
                                    Enterprise-Grade Compliance, Inherited by Design
                                </h3>
                                <p className="text-center text-sm text-slate-400 max-w-xl mx-auto mb-8">
                                    Redoubt is built entirely on AWS Enterprise infrastructure — inheriting SOC 2 Type II, ISO 27001, HIPAA eligibility, and GDPR alignment without compromise.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    {[
                                        { title: 'SOC 2 Type II', subtitle: 'Inherited via AWS', type: 'blue' },
                                        { title: 'ISO 27001', subtitle: 'Inherited via AWS', type: 'blue' },
                                        { title: 'HIPAA + GDPR', subtitle: 'HIPAA eligible via AWS. GDPR aligned via EU-West-1 data residency.', type: 'green' }
                                    ].map((badge) => (
                                        <div
                                            key={badge.title}
                                            className={`flex flex-col items-center rounded-xl border px-6 py-4 min-w-[160px] ${
                                                badge.type === 'blue'
                                                    ? 'border-blue-500/40 bg-blue-500/10'
                                                    : 'border-emerald-500/40 bg-emerald-500/10'
                                            }`}
                                        >
                                            <span className={`text-sm font-semibold ${
                                                badge.type === 'blue' ? 'text-blue-200' : 'text-emerald-200'
                                            }`}>
                                                {badge.title}
                                            </span>
                                            <span className={`text-xs mt-1 ${
                                                badge.type === 'blue' ? 'text-blue-300/70' : 'text-emerald-300/70'
                                            }`}>
                                                {badge.subtitle}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-center text-xs text-slate-500 italic mt-6">
                                    Technical security liability rests with AWS. Redoubt focuses on trust, access, and audit integrity.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    STATS SECTION
                ═══════════════════════════════════════ */}
                <section className="py-16" style={{ background: 'linear-gradient(180deg, #050C1F 0%, #020817 100%)' }}>
                    <div ref={statsRef.ref} className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
                            {[
                                { value: datasetsCount.toLocaleString() + '+', label: 'Verified Datasets', demo: true, icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )},
                                { value: verifiedCount + '%', label: 'Accuracy Rate', demo: true, icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                )},
                                { value: partnersCount + '+', label: 'Trusted Partners', demo: true, icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                )},
                            ].map((stat) => (
                                <div key={stat.label} className="glass rounded-2xl p-6 text-center cyber-glow relative">
                                    {stat.demo && (
                                        <div className="absolute top-3 right-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-[10px] font-medium text-amber-300">
                                                Demo
                                            </span>
                                        </div>
                                    )}
                                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                                        {stat.icon}
                                    </div>
                                    <div className="Redoubt-font text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                                    <div className="text-slate-400 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    HOW IT WORKS SECTION
                ═══════════════════════════════════════ */}
                <section className="py-24" style={{ background: 'linear-gradient(180deg, #020817 0%, #050C1F 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-20">
                                <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">Process</p>
                                <h2 className="Redoubt-font text-4xl md:text-5xl font-bold text-white mb-4">
                                    How It Works
                                </h2>
                                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                    Our automated pipeline ensures every dataset meets the highest standards
                                </p>
                            </div>

                            <div className="grid md:grid-cols-4 gap-6 relative">
                                {/* Glowing cyan connector line */}
                                <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                                    <div className="absolute top-0 left-0 w-[calc(33.33%-12px)] h-px bg-gradient-to-r from-cyan-400 to-transparent" />
                                    <div className="absolute top-0 right-0 w-[calc(33.33%-12px)] h-px bg-gradient-to-l from-cyan-400 to-transparent" />
                                </div>

                                {[
                                    { num: '01', title: 'Controlled Dataset Onboarding', desc: 'Participants submit datasets with metadata and documentation for verification', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    )},
                                    { num: '02', title: 'AI Quality Verification', desc: 'Automated AI systems check data quality, completeness, and consistency', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    )},
                                    { num: '03', title: 'Confidence Scoring', desc: 'Each dataset receives a comprehensive confidence score based on multiple factors', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )},
                                    { num: '04', title: 'Secure Access', desc: 'Approved participants access datasets with full audit trails and security controls', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    )},
                                ].map((step, i) => (
                                    <div key={step.num} className="glass rounded-2xl p-6 relative cyber-glow" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500 text-white text-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                                                {step.num}
                                            </div>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/30 bg-cyan-500/10">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <h3 className="Redoubt-font text-lg font-semibold text-white mb-3">{step.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    TRUST & VERIFICATION SECTION
                ═══════════════════════════════════════ */}
                <section className="py-24" style={{ background: 'linear-gradient(180deg, #050C1F 0%, #020817 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <div className="w-16 h-px mx-auto mb-4 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                                <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">Security</p>
                                <h2 className="Redoubt-font text-4xl md:text-5xl font-bold text-white mb-4">
                                    Trust & <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>Verification</span>
                                </h2>
                                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                    Multi-layered verification ensures secure, trustworthy collaboration without marketplace risks
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {[
                                    { title: 'AI Dataset Validation', desc: 'Automated AI systems validate data quality, detect anomalies, and ensure consistency', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    )},
                                    { title: 'Provider Verification', desc: 'All data providers undergo identity verification and credentialing processes', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    )},
                                    { title: 'Confidence Scores', desc: 'Transparent scoring system showing quality, completeness, and reliability metrics', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )},
                                    { title: 'Secure Dataset Access', desc: 'Enterprise-grade security with role-based access and complete audit trails', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    )},
                                ].map((card) => (
                                    <div key={card.title} className="glass rounded-2xl p-6 cyber-glow border-cyan-500/20 hover:border-cyan-500/50">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-cyan-400 mb-5 border border-cyan-500/30 bg-cyan-500/10">
                                            {card.icon}
                                        </div>
                                        <h3 className="Redoubt-font text-lg font-semibold text-white mb-3">{card.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    BUILT FOR EVERY TEAM SECTION
                ═══════════════════════════════════════ */}
                <section className="py-24" style={{ background: 'linear-gradient(180deg, #020817 0%, #050C1F 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <div className="w-16 h-px mx-auto mb-4 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                                <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">Solutions</p>
                                <h2 className="Redoubt-font text-4xl md:text-5xl font-bold text-white mb-4">
                                    Built for Every <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>Team</span>
                                </h2>
                                <p className="text-slate-400 text-lg">Tailored solutions for diverse data needs</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {[
                                    { title: 'Researchers', desc: 'Verified datasets for academic research with citation support', to: '/solutions#researchers', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    )},
                                    { title: 'AI & ML Teams', desc: 'Training data with quality validation and bias detection', to: '/solutions#ai-ml-teams', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    )},
                                    { title: 'Enterprises', desc: 'Enterprise-grade security and compliance for critical applications', to: '/solutions#enterprises', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    )},
                                    { title: 'Contribute Data', desc: 'Participants can contribute datasets with verification, governance, and audit trails', to: '/solutions#data-providers', icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    )},
                                ].map((card) => (
                                    <Link key={card.title} to={card.to} className="glass rounded-2xl p-6 cyber-glow border-cyan-500/20 hover:border-cyan-500/50 group block">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-cyan-400 mb-5 border border-cyan-500/30 bg-cyan-500/10 transition-transform group-hover:scale-110">
                                            {card.icon}
                                        </div>
                                        <h3 className="Redoubt-font text-lg font-semibold text-white mb-3">{card.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-4">{card.desc}</p>
                                        <span className="text-sm font-medium text-cyan-400 relative overflow-hidden inline-flex items-center gap-1 group-hover:text-cyan-300">
                                            Learn more 
                                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    WHY NOW SECTION
                ═══════════════════════════════════════ */}
                <section className="py-20" style={{ background: 'linear-gradient(180deg, #020817 0%, #050C1F 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-4">Why Now</p>
                            <h2 className="Redoubt-font text-3xl md:text-5xl font-bold text-white mb-4">
                                The data trust crisis is here
                            </h2>
                            <p className="text-slate-400 text-base md:text-lg">
                                Regulated industries are losing billions to data breaches, compliance failures, and unverified data pipelines
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
                                <div className="text-4xl font-bold text-white">$4.45M</div>
                                <p className="mt-2 text-sm text-slate-400">
                                    Average cost of a healthcare data breach in 2025
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
                                <div className="text-4xl font-bold text-white">68%</div>
                                <p className="mt-2 text-sm text-slate-400">
                                    Of AI models fail due to unverified training data
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
                                <div className="text-4xl font-bold text-white">3.2x</div>
                                <p className="mt-2 text-sm text-slate-400">
                                    Increase in data compliance violations since 2023
                                </p>
                            </div>
                        </div>

                        <p className="mt-6 text-center text-sm text-blue-300/70 italic">
                            Redoubt exists because trust cannot be an afterthought.
                        </p>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    WHO CAN JOIN TODAY SECTION
                ═══════════════════════════════════════ */}
                <section className="py-20" style={{ background: 'linear-gradient(180deg, #050C1F 0%, #020817 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-4">Who Can Join Today</p>
                            <h2 className="Redoubt-font text-3xl md:text-5xl font-bold text-white mb-4">
                                Built for teams who move fast on compliance
                            </h2>
                            <p className="text-slate-400 text-base md:text-lg">
                                Redoubt is currently accepting verified participants from these sectors — no SOC 2 audit required on your end.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: '🏥', title: 'Healthcare AI Startups', description: 'Clinical data, imaging, diagnostics pipelines' },
                                { icon: '💳', title: 'Fintech Startups', description: 'Financial risk, fraud, market data' },
                                { icon: '🔬', title: 'Research Institutions', description: 'Academic and clinical research datasets' },
                                { icon: '🎓', title: 'Universities', description: 'Student research, scientific data sharing' },
                                { icon: '🌍', title: 'Climate & Environmental Firms', description: 'Satellite, emissions, land use data' },
                                { icon: '🧬', title: 'Early Stage Biotech', description: 'Genomics, drug discovery, trial data' }
                            ].map((card) => (
                                <div key={card.title} className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-xl hover:border-emerald-500/30 transition-colors">
                                    <div className="text-4xl mb-4">{card.icon}</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                                    <p className="text-sm text-slate-400 mb-4">{card.description}</p>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        Accepting Now
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/10">
                            <p className="text-center text-xs text-slate-500">
                                Large enterprises, government agencies, and regulated financial institutions will be onboarded following Redoubt's SOC 2 Type II certification — expected Q3 2027.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    FINAL CTA SECTION
                ═══════════════════════════════════════ */}
                <section className="py-24 relative overflow-hidden"
                         style={{ background: 'linear-gradient(135deg, #020817 0%, #0a1628 50%, #020817 100%)' }}>
                    <div className="absolute inset-0"
                         style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
                    <div className="absolute inset-0 grid-bg opacity-20" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-xl bg-black/70 border border-cyan-500/30">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                                <span className="text-cyan-200 text-sm font-medium">Secured Onboarding Platform</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Satoshi Black', 'Syne', sans-serif" }}>
                                Participation requires
                                <span className="block" style={{ textShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}>verification & approval</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-cyan-300 font-semibold mb-3 opacity-0-init animate-fadeIn" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.4)' }}>
                                Layered Defense for Data Confidence
                            </p>
                            <p className="text-cyan-300 text-sm mb-3 font-medium">Invitation permitted — secured onboarding mandatory</p>
                            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                                Secure data access only after identity, use-case verification, and our rigorous secured onboarding procedure. Invitations are permitted for qualified participants in a controlled network.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/login"
                                    onClick={handleSignInFromLanding}
                                    className="btn-primary relative z-10 px-8 py-4 text-[#050C1F] font-semibold rounded-xl text-lg cyber-glow"
                                >
                                    <span className="relative z-10">Sign In →</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleRequestPlatformAccess}
                                    className="px-8 py-4 text-white font-semibold rounded-xl text-lg backdrop-blur-xl bg-black/50 border border-cyan-500/50 hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                                >
                                    Request Platform Access
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// TYPES & CONSTANTS (unchanged from original)
// ═══════════════════════════════════════════════════════

type BasicInfoFormState = {
    workEmail: string
    fullName: string
    organizationName: string
    role: string
}

type AccessIntentFormState = {
    domains: string[]
    primaryPurpose: string
    accessType: string
    usageFrequency: string
}

type OnboardingWizardOverlayProps = {
    step: number
    onCancel: () => void
    onProceed: (data: BasicInfoFormState) => void
    onSubmitReview: () => void
    onBackToStep1: () => void
    onBackToStep2: () => void
    onSubmitAccessRequest: (data: AccessIntentFormState) => void
    onEnterDashboard: () => void
    onReviewProfile: () => void
}

const ROLE_OPTIONS = ['Researcher', 'Data Scientist', 'Engineer', 'Analyst', 'Other']
const DOMAIN_OPTIONS = [
    'Climate & Environment',
    'Finance & Markets',
    'Healthcare & Life Sciences',
    'Urban Mobility & Sensors',
    'Other'
]
const ACCESS_TYPE_OPTIONS = [
    'Metadata & summaries only',
    'Aggregated / anonymized data',
    'Full raw dataset access (subject to approval)'
]
const USAGE_FREQUENCY_OPTIONS = [
    'Occasional / Research',
    'Regular analysis',
    'High-volume / Production use'
]

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// ═══════════════════════════════════════════════════════
// ONBOARDING WIZARD (unchanged from original)
// ═══════════════════════════════════════════════════════

function OnboardingWizardOverlay({
                                     step,
                                     onCancel,
                                     onSubmitReview,
                                     onBackToStep1,
                                     onBackToStep2,
                                     onSubmitAccessRequest,
                                     onEnterDashboard,
                                     onReviewProfile,
                                     onProceed,
                                 }: OnboardingWizardOverlayProps) {
    const [form, setForm] = useState<BasicInfoFormState>({
        workEmail: '',
        fullName: '',
        organizationName: '',
        role: 'Researcher'
    })
    const [accessIntent, setAccessIntent] = useState<AccessIntentFormState>({
        domains: [],
        primaryPurpose: '',
        accessType: ACCESS_TYPE_OPTIONS[0],
        usageFrequency: USAGE_FREQUENCY_OPTIONS[0]
    })
    const [touched, setTouched] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)

    const updateField = (key: keyof BasicInfoFormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const readyStep1 =
        isValidEmail(form.workEmail.trim()) &&
        form.fullName.trim().length > 0 &&
        form.organizationName.trim().length > 0 &&
        form.role.trim().length > 0

    const handleSubmitStep1 = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setTouched(true)
        if (!readyStep1) return
        onProceed(form)
    }

    const acceptFile = (file: File) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
        const isAllowedType = allowedTypes.includes(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name)
        if (!isAllowedType) {
            setFileError('Only PDF, JPG, or PNG files are allowed.')
            setSelectedFile(null)
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setFileError('File size must be under 5MB.')
            setSelectedFile(null)
            return
        }
        setSelectedFile(file)
        setFileError(null)
    }

    const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) acceptFile(file)
    }

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault()
        setDragActive(false)
        const file = event.dataTransfer.files?.[0]
        if (file) acceptFile(file)
    }

    const toggleDomain = (domain: string) => {
        setAccessIntent((prev) => ({
            ...prev,
            domains: prev.domains.includes(domain)
                ? prev.domains.filter((selected) => selected !== domain)
                : [...prev.domains, domain]
        }))
    }

    const handleSubmitStep4 = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSubmitAccessRequest(accessIntent)
    }

    const trustLevel = 45
    const trustColor = trustLevel >= 70 ? 'bg-emerald-500' : trustLevel >= 50 ? 'bg-blue-500' : 'bg-amber-400'
    const wizardTitle =
        step === 1
            ? 'Participant Verification - Basic Info'
            : step === 2
                ? 'Access Intent & Use Case'
                : step === 3
                    ? 'Advanced Organization Verification'
                    : 'Verification Complete'

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen flex items-start justify-center py-6 md:py-10 px-4 md:px-8">
                <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-800 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Step {step} of 4</p>
                            <h2 className="text-xl md:text-2xl font-semibold text-white">{wizardTitle}</h2>
                        </div>
                        <div className="hidden sm:block text-slate-400 text-sm">Step {step} of 4</div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSubmitStep1} className="px-6 md:px-8 py-6 space-y-6">
                            <div className="grid gap-4">
                                <label className="space-y-2">
                                    <span className="block text-sm font-semibold text-slate-200">
                                        Work Email <span className="text-blue-300">*</span>
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        autoFocus
                                        value={form.workEmail}
                                        onChange={(e) => updateField('workEmail', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="name@company.com"
                                    />
                                </label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <label className="space-y-2">
                                        <span className="block text-sm font-semibold text-slate-200">
                                            Full Name <span className="text-blue-300">*</span>
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            value={form.fullName}
                                            onChange={(e) => updateField('fullName', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Your full name"
                                        />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="block text-sm font-semibold text-slate-200">
                                            Organization Name <span className="text-blue-300">*</span>
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            value={form.organizationName}
                                            onChange={(e) => updateField('organizationName', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Organization"
                                        />
                                    </label>
                                </div>
                                <label className="space-y-2">
                                    <span className="block text-sm font-semibold text-slate-200">Position / Role</span>
                                    <select
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        value={form.role}
                                        onChange={(e) => updateField('role', e.target.value)}
                                    >
                                        {ROLE_OPTIONS.map((option) => (
                                            <option key={option}>{option}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-sm text-slate-400">
                                    Access is restricted to verified participants from reputed organizations.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setForm({ workEmail: 'demo@trusted.org', fullName: 'Demo User', organizationName: 'Trusted Labs', role: 'Researcher' })}
                                    className="text-xs text-blue-300 hover:text-blue-200 underline"
                                >
                                    Autofill demo data
                                </button>
                            </div>
                            {touched && !readyStep1 && (
                                <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                                    Please complete all required fields with a valid work email to continue.
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                                <button type="submit" className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                                    Proceed to Verification
                                </button>
                                <button type="button" onClick={onCancel} className="text-slate-300 hover:text-white text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : step === 2 ? (
                        <Step3AccessIntent
                            value={accessIntent}
                            onToggleDomain={toggleDomain}
                            onChange={setAccessIntent}
                            onBack={onBackToStep1}
                            onSubmit={handleSubmitStep4}
                        />
                    ) : step === 3 ? (
                        <div className="px-6 md:px-8 py-6 space-y-6">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-300">Step 3 of 4</p>
                                <h3 className="text-xl font-semibold text-white">Verify your organization to gain access</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                    <h4 className="text-lg font-semibold text-white">Connect with LinkedIn</h4>
                                    <p className="text-sm text-slate-400">Securely confirm your organizational affiliation via LinkedIn.</p>
                                    <button className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                                        Connect LinkedIn (mock)
                                    </button>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                    <h4 className="text-lg font-semibold text-white">Upload Proof of Affiliation</h4>
                                    <p className="text-sm text-slate-400">PDF, JPG, or PNG only. Max 5MB.</p>
                                    <label
                                        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={handleDrop}
                                        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 py-10 cursor-pointer transition-colors ${dragActive ? 'border-blue-400 bg-blue-500/5' : 'border-slate-700 bg-slate-900'}`}
                                    >
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileInput} />
                                        <div className="text-slate-200 font-semibold">{selectedFile ? selectedFile.name : 'Drag & drop file or click to browse'}</div>
                                        <div className="text-xs text-slate-500">PDF, JPG, PNG | Max 5MB</div>
                                    </label>
                                    {fileError && (
                                        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">{fileError}</div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <span>Current Trust Level: {trustLevel}%</span>
                                    <span className="text-slate-500">Live estimate</span>
                                </div>
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${trustColor}`} style={{ width: `${Math.min(trustLevel, 100)}%` }} />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                                <button type="button" onClick={onSubmitReview} className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                                    Submit for Review
                                </button>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button type="button" onClick={onBackToStep2} className="flex-1 sm:flex-none px-4 py-3 rounded-lg border border-slate-700 text-slate-200 hover:border-blue-500">Back</button>
                                    <button type="button" onClick={onCancel} className="flex-1 sm:flex-none px-4 py-3 rounded-lg border border-transparent text-slate-300 hover:text-white">Cancel</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Step4VerificationComplete onEnterDashboard={onEnterDashboard} onReviewProfile={onReviewProfile} />
                    )}
                </div>
            </div>
        </div>
    )
}

type Step4VerificationCompleteProps = {
    onEnterDashboard: () => void
    onReviewProfile: () => void
}

function Step4VerificationComplete({ onEnterDashboard, onReviewProfile }: Step4VerificationCompleteProps) {
    const trustScore = 85
    return (
        <div className="px-6 md:px-8 py-8 space-y-7">
            <div className="space-y-5 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-semibold text-white">Welcome to the Data Access Layer</h3>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Your participant profile has been verified.<br />
                        You now have access as a verified participant from a reputed organization.
                    </p>
                </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Trust Score: {trustScore}%</span>
                    <span className="text-emerald-400 font-medium">Verified</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${trustScore}%` }} />
                </div>
            </div>
            <p className="text-sm text-slate-400 text-center">All data access remains private and governed by platform policies.</p>
            <div className="flex flex-col items-center gap-4">
                <button type="button" onClick={onEnterDashboard} className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                    Enter Dashboard
                </button>
                <button type="button" onClick={onReviewProfile} className="text-sm text-slate-300 hover:text-white underline underline-offset-4">
                    Review My Profile
                </button>
            </div>
        </div>
    )
}

type Step3AccessIntentProps = {
    value: AccessIntentFormState
    onToggleDomain: (domain: string) => void
    onChange: (next: AccessIntentFormState) => void
    onBack: () => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function Step3AccessIntent({ value, onToggleDomain, onChange, onBack, onSubmit }: Step3AccessIntentProps) {
    return (
        <form onSubmit={onSubmit} className="px-6 md:px-8 py-6 space-y-6">
            <div className="space-y-1">
                <p className="text-sm text-slate-300">Step 2 of 4</p>
                <h3 className="text-xl font-semibold text-white">Tell us how you plan to use the platform</h3>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Domain of Interest</h4>
                <div className="flex flex-wrap gap-2">
                    {DOMAIN_OPTIONS.map((option) => {
                        const selected = value.domains.includes(option)
                        return (
                            <button key={option} type="button" onClick={() => onToggleDomain(option)}
                                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${selected ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500'}`}>
                                {option}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Primary Purpose</h4>
                <textarea value={value.primaryPurpose} onChange={(event) => onChange({ ...value, primaryPurpose: event.target.value })} rows={4} placeholder="Briefly describe your intended use case..." className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none" />
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Type of Access Needed</h4>
                <div className="space-y-2">
                    {ACCESS_TYPE_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-800 px-3 py-2">
                            <input type="radio" name="access-type" checked={value.accessType === option} onChange={() => onChange({ ...value, accessType: option })} className="accent-blue-500" />
                            <span className="text-slate-200 text-sm">{option}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Expected Usage Frequency</h4>
                <select value={value.usageFrequency} onChange={(event) => onChange({ ...value, usageFrequency: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none">
                    {USAGE_FREQUENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <button type="submit" className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">Proceed</button>
                <button type="button" onClick={onBack} className="w-full sm:w-auto px-5 py-3 rounded-lg border border-slate-700 text-slate-200 hover:border-blue-500 transition-colors">Back</button>
            </div>
        </form>
    )
}









