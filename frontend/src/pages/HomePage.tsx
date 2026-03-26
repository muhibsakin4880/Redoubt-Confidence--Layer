import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

// ──────────────────────────────────────────────────────────────
// HOOKS
// ──────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, start = false) {
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

function useInView(threshold = 0.25) {
    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [threshold])
    return { ref, inView }
}

function useTypingEffect(text: string, speed = 32, start = false) {
    const [displayed, setDisplayed] = useState('')
    useEffect(() => {
        if (!start) { setDisplayed(''); return }
        let i = 0
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i + 1))
            i++
            if (i >= text.length) clearInterval(interval)
        }, speed)
        return () => clearInterval(interval)
    }, [text, speed, start])
    return displayed
}

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
/**
 * Returns an SVG arc path string for a partial circle.
 * Angles are in degrees, measured clockwise from 12-o'clock.
 */
function arcPath(
    cx: number, cy: number, r: number,
    startDeg: number, endDeg: number
): string {
    const toRad = (d: number) => d * Math.PI / 180
    const x1 = cx + r * Math.sin(toRad(startDeg))
    const y1 = cy - r * Math.cos(toRad(startDeg))
    const x2 = cx + r * Math.sin(toRad(endDeg))
    const y2 = cy - r * Math.cos(toRad(endDeg))
    const large = (endDeg - startDeg) > 180 ? 1 : 0
    return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`
}

/** Returns {x, y} of a point on a circle at angle (deg, CW from top). */
function pt(cx: number, cy: number, r: number, deg: number) {
    const rad = deg * Math.PI / 180
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

// ──────────────────────────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────────────────────────
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [transform, setTransform] = useState('')

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left)  / rect.width  - 0.5) * 28
        const y = ((e.clientY - rect.top)   / rect.height - 0.5) * -28
        setTransform(`perspective(1300px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.04,1.04,1.04)`)
    }, [])

    const handleMouseLeave = useCallback(() => setTransform(''), [])

    return (
        <div
            ref={cardRef}
            className={`relative transition-all duration-300 ease-out ${className}`}
            style={{ transform }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    )
}

function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d', { alpha: true })
        if (!ctx) return
        let animationId: number
        const particles: Array<{
            x: number; y: number; vx: number; vy: number; size: number; opacity: number
        }> = []
        const resize = () => {
            canvas.width  = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }
        resize()
        window.addEventListener('resize', resize)
        for (let i = 0; i < 70; i++) {
            particles.push({
                x:       Math.random() * canvas.width,
                y:       Math.random() * canvas.height,
                vx:      (Math.random() - 0.5) * 0.45,
                vy:      (Math.random() - 0.5) * 0.45,
                size:    Math.random() * 2.4 + 0.7,
                opacity: Math.random() * 0.38 + 0.09
            })
        }
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy
                if (p.x < 0) p.x = canvas.width
                if (p.x > canvas.width)  p.x = 0
                if (p.y < 0) p.y = canvas.height
                if (p.y > canvas.height) p.y = 0
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(77,214,214,${p.opacity})`
                ctx.fill()
            })
            animationId = requestAnimationFrame(animate)
        }
        animate()
        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationId)
        }
    }, [])
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-30" />
}

// ──────────────────────────────────────────────────────────────
// PERMISSION GATE EMBLEM
//
// Concept: each ring is an independent verification layer.
// The gaps are active "checkpoints" — a request only reaches
// the secured core (lock) after clearing every gate.
// Rings counter-rotate so alignment is never a given —
// access is never assumed, always earned.
// ──────────────────────────────────────────────────────────────
function PermissionGateEmblem({ visible }: { visible: boolean }) {
    const CX = 110, CY = 110

    const rings = [
        {
            r: 86, color: '#00E5FF', opacity: 0.90, width: 2.4,
            // 3 arcs × 100°, 20° checkpoint gaps at 0° / 120° / 240°
            arcs:  [[10, 110], [130, 230], [250, 350]] as [number,number][],
            gates: [0, 120, 240],
            anim:  'logoSpinCW 32s linear infinite',
        },
        {
            r: 70, color: '#22d3ee', opacity: 0.78, width: 2.0,
            // 2 arcs × 150°, 30° checkpoint gaps at 15° / 195°
            arcs:  [[30, 165], [210, 345]] as [number,number][],
            gates: [15, 195],
            anim:  'logoSpinCCW 22s linear infinite',
        },
        {
            r: 54, color: '#67e8f9', opacity: 0.65, width: 1.7,
            // 4 arcs × 75°, 15° checkpoint gaps at 0° / 90° / 180° / 270°
            arcs:  [[7.5,82.5],[97.5,172.5],[187.5,262.5],[277.5,352.5]] as [number,number][],
            gates: [0, 90, 180, 270],
            anim:  'logoSpinCW 16s linear infinite',
        },
        {
            r: 38, color: '#a5f3fc', opacity: 0.55, width: 1.4,
            // 3 arcs × 100°, 20° checkpoint gaps at 0° / 120° / 240°
            arcs:  [[10, 110], [130, 230], [250, 350]] as [number,number][],
            gates: [0, 120, 240],
            anim:  'logoSpinCCW 12s linear infinite',
        },
    ]

    return (
        <div
            className={`mx-auto mb-10 w-[230px] h-[230px] transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={visible ? {
                animation: 'logoFloat 6s ease-in-out infinite, logoGlow 4s ease-in-out infinite'
            } : {}}
        >
            <svg
                viewBox="0 0 220 220"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
            >
                <defs>
                    <radialGradient id="pgBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%"   stopColor="#0c1e3e" stopOpacity="0.96"/>
                        <stop offset="100%" stopColor="#030c1e" stopOpacity="0.88"/>
                    </radialGradient>
                    <radialGradient id="pgCoreGrad" cx="40%" cy="35%" r="65%">
                        <stop offset="0%"   stopColor="#ffffff"/>
                        <stop offset="60%"  stopColor="#00E5FF"/>
                        <stop offset="100%" stopColor="#0077b6"/>
                    </radialGradient>
                    {/* Soft arc glow */}
                    <filter id="pgGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur"/>
                        <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    {/* Gate checkpoint glow */}
                    <filter id="pgGate" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="1.6" result="b"/>
                        <feMerge>
                            <feMergeNode in="b"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    {/* Inner lock glow */}
                    <filter id="pgLock" x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="5.5" result="outer"/>
                        <feGaussianBlur stdDeviation="2"   result="inner" in="SourceGraphic"/>
                        <feMerge>
                            <feMergeNode in="outer"/>
                            <feMergeNode in="inner"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer ambient halo */}
                <circle cx={CX} cy={CY} r="107"
                    fill="none" stroke="rgba(0,229,255,0.04)" strokeWidth="18"
                />

                {/* Static bezel — 36 tick marks */}
                {Array.from({ length: 36 }, (_, i) => {
                    const isMajor = i % 3 === 0
                    const angle   = i * 10
                    const r1      = isMajor ? 94 : 97
                    const p1 = pt(CX, CY, r1,  angle)
                    const p2 = pt(CX, CY, 102, angle)
                    return (
                        <line key={`tick${i}`}
                            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                            stroke={isMajor ? 'rgba(0,229,255,0.45)' : 'rgba(0,229,255,0.14)'}
                            strokeWidth={isMajor ? 1.2 : 0.5}
                        />
                    )
                })}
                <circle cx={CX} cy={CY} r="103" fill="none" stroke="rgba(0,229,255,0.18)" strokeWidth="0.5"/>
                <circle cx={CX} cy={CY} r="92"  fill="none" stroke="rgba(0,229,255,0.07)" strokeWidth="0.4"/>

                {/* Background disc */}
                <circle cx={CX} cy={CY} r="90"
                    fill="url(#pgBg)" stroke="rgba(0,229,255,0.08)" strokeWidth="0.5"
                />

                {/* Subtle static crosshair guides */}
                {[0, 90, 180, 270].map((deg, i) => {
                    const inner = pt(CX, CY, 20, deg)
                    const outer = pt(CX, CY, 88, deg)
                    return (
                        <line key={`ch${i}`}
                            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                            stroke="rgba(0,229,255,0.05)" strokeWidth="0.4"
                        />
                    )
                })}

                {/* ROTATING PERMISSION RINGS */}
                {rings.map((ring, ri) => (
                    <g key={`ring${ri}`}
                        style={{ transformOrigin: `${CX}px ${CY}px`, animation: ring.anim }}
                    >
                        {/* Arc segments — verified permission zones */}
                        {ring.arcs.map(([s, e], ai) => (
                            <path key={`arc${ri}-${ai}`}
                                d={arcPath(CX, CY, ring.r, s, e)}
                                fill="none"
                                stroke={ring.color}
                                strokeWidth={ring.width}
                                strokeLinecap="round"
                                opacity={ring.opacity}
                                filter="url(#pgGlow)"
                            />
                        ))}

                        {/* Gate pillar ticks at arc endpoints */}
                        {ring.arcs.flatMap(([s, e], ai) =>
                            [s, e].map((deg, di) => {
                                const inner = pt(CX, CY, ring.r - 5, deg)
                                const outer = pt(CX, CY, ring.r + 5, deg)
                                return (
                                    <line key={`pillar${ri}-${ai}-${di}`}
                                        x1={inner.x} y1={inner.y}
                                        x2={outer.x} y2={outer.y}
                                        stroke={ring.color}
                                        strokeWidth={ring.width * 0.85}
                                        strokeLinecap="round"
                                        opacity={ring.opacity * 0.9}
                                        filter="url(#pgGlow)"
                                    />
                                )
                            })
                        )}

                        {/* Checkpoint diamonds — center of each gap */}
                        {ring.gates.map((deg, gi) => {
                            const p = pt(CX, CY, ring.r, deg)
                            const s = 3.8 - ri * 0.4
                            return (
                                <g key={`gate${ri}-${gi}`} filter="url(#pgGate)">
                                    <polygon
                                        points={`${p.x},${p.y-s} ${p.x+s},${p.y} ${p.x},${p.y+s} ${p.x-s},${p.y}`}
                                        fill={ring.color}
                                        opacity="0.85"
                                    />
                                    <circle cx={p.x} cy={p.y} r="1.2"
                                        fill="white" opacity="0.9"
                                        style={{ animation: `innerPulse ${2 + gi * 0.4}s ease-in-out infinite` }}
                                    />
                                </g>
                            )
                        })}
                    </g>
                ))}

                {/* Inner secured core disc */}
                <circle cx={CX} cy={CY} r="20"
                    fill="url(#pgBg)"
                    stroke="rgba(0,229,255,0.45)"
                    strokeWidth="1"
                    filter="url(#pgGlow)"
                />

                {/* Padlock — the secured destination */}
                {/* Shackle */}
                <path
                    d={`M ${CX-6} ${CY-1} L ${CX-6} ${CY-8} Q ${CX-6} ${CY-15} ${CX} ${CY-15} Q ${CX+6} ${CY-15} ${CX+6} ${CY-8} L ${CX+6} ${CY-1}`}
                    fill="none"
                    stroke="url(#pgCoreGrad)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    filter="url(#pgLock)"
                />
                {/* Body */}
                <rect
                    x={CX-8} y={CY-2} width="16" height="12" rx="3"
                    fill="rgba(0,30,70,0.9)"
                    stroke="url(#pgCoreGrad)"
                    strokeWidth="1.8"
                    filter="url(#pgLock)"
                />
                {/* Keyhole circle */}
                <circle cx={CX} cy={CY+3} r="2.2" fill="rgba(0,229,255,0.2)"/>
                {/* Keyhole dot — pulsing */}
                <circle cx={CX} cy={CY+3} r="1.1"
                    fill="#00E5FF"
                    filter="url(#pgLock)"
                    style={{ animation: 'innerPulse 2s ease-in-out infinite' }}
                />
                {/* Keyhole stem */}
                <rect x={CX-1} y={CY+4} width="2" height="3.5" rx="0.5"
                    fill="#00E5FF" opacity="0.8"
                />

                {/* Core ambient pulse */}
                <circle cx={CX} cy={CY} r="9"
                    fill="rgba(0,229,255,0.04)"
                    filter="url(#pgLock)"
                    style={{ animation: 'innerPulse 3s ease-in-out infinite' }}
                />
            </svg>
        </div>
    )
}

// ──────────────────────────────────────────────────────────────
// MAIN HOMEPAGE
// ──────────────────────────────────────────────────────────────
export default function HomePage() {
    const { startOnboarding, signIn, signOut } = useAuth()
    const navigate = useNavigate()

    const [wizardOpen,  setWizardOpen]  = useState(false)
    const [wizardStep,  setWizardStep]  = useState(1)
    const [heroVisible, setHeroVisible] = useState(false)

    const statsRef      = useInView()
    const complianceRef = useInView()
    const trustRef      = useInView()
    const whoCanJoinRef = useInView()

    useEffect(() => {
        const timer = setTimeout(() => setHeroVisible(true), 80)
        return () => clearTimeout(timer)
    }, [])

    const datasetsCount = useCountUp(12400, 1600, statsRef.inView)
    const verifiedCount = useCountUp(98,    1100, statsRef.inView)
    const partnersCount = useCountUp(340,   1400, statsRef.inView)
    const taglineTyped  = 'Layered Defense for Data Confidence'

    const handleRequestPlatformAccess = () => { startOnboarding(); navigate('/onboarding') }
    const handleSignInFromLanding     = () => { signOut() }
    const handleAdminAccessFromLanding = () => { signOut(); navigate('/admin/login') }
    const handleWizardCancel          = () => { setWizardOpen(false); setWizardStep(1) }
    const handleEnterDashboard        = () => { signIn(); setWizardOpen(false); setWizardStep(1); navigate('/dashboard') }
    const handleReviewProfile         = () => { signIn(); setWizardOpen(false); setWizardStep(1); navigate('/profile') }

    return (
        <div className="relative overflow-hidden bg-[#050C1F] text-white">

            {/* ── GLOBAL STYLES ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');

                .redoubt-font { font-family: 'Syne', sans-serif; }
                .body-font    { font-family: 'Inter', system-ui, sans-serif; }

                @keyframes logoSpinCW  { from { transform: rotate(0deg) }   to { transform: rotate(360deg) }  }
                @keyframes logoSpinCCW { from { transform: rotate(0deg) }   to { transform: rotate(-360deg) } }
                @keyframes logoFloat {
                    0%,100% { transform: translateY(0px) }
                    50%     { transform: translateY(-14px) }
                }
                @keyframes logoGlow {
                    0%,100% {
                        filter: drop-shadow(0 0 18px rgba(0,229,255,0.40))
                                drop-shadow(0 0 50px rgba(0,100,200,0.18));
                    }
                    50% {
                        filter: drop-shadow(0 0 50px rgba(0,229,255,0.85))
                                drop-shadow(0 0 100px rgba(0,150,255,0.35));
                    }
                }
                @keyframes innerPulse {
                    0%,100% { opacity: 0.45 }
                    50%     { opacity: 1 }
                }
            `}</style>

            {/* ── NAVBAR ── */}
            {!wizardOpen && (
                <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">R</span>
                            </div>
                            <span className="text-white font-semibold text-lg">Redoubt</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8 text-sm">
                            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How it Works</a>
                            <a href="#security" className="text-slate-300 hover:text-white transition-colors">Security</a>
                            <a href="#solutions" className="text-slate-300 hover:text-white transition-colors">Solutions</a>
                            <a href="#join" className="text-slate-300 hover:text-white transition-colors">Join</a>
                        </nav>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                onClick={handleSignInFromLanding}
                                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <button
                                onClick={handleRequestPlatformAccess}
                                className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
                            >
                                Request Access
                            </button>
                        </div>
                    </div>
                </header>
            )}

            {/* ── WIZARD OVERLAY ── */}
            {wizardOpen && (
                <OnboardingWizardOverlay
                    step={wizardStep}
                    onCancel={handleWizardCancel}
                    onEnterDashboard={handleEnterDashboard}
                    onReviewProfile={handleReviewProfile}
                />
            )}

            {/* ── PAGE BODY ── */}
            <div className={`body-font ${wizardOpen ? 'hidden' : ''}`}>

                {/* ════════════════════════════════════════
                    HERO
                ════════════════════════════════════════ */}
                <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
                    <div className="absolute inset-0 bg-[#020814]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(34,211,238,0.16)_0%,rgba(34,211,238,0.08)_18%,rgba(5,12,31,0)_56%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,20,0.35)_0%,rgba(2,8,20,0.72)_50%,rgba(2,6,23,0.96)_100%)]" />
                    <div className="absolute left-1/2 top-20 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />
                    <div className="absolute left-[10%] top-[28%] h-36 w-36 rounded-full bg-blue-500/10 blur-[110px]" />
                    <div className="absolute right-[12%] top-[22%] h-40 w-40 rounded-full bg-cyan-300/10 blur-[120px]" />
                    <div className="absolute inset-x-0 top-10 flex justify-center">
                        <div className="h-[34rem] w-[34rem] rounded-full border border-cyan-400/10" />
                    </div>
                    <div className="absolute inset-x-0 top-16 flex justify-center">
                        <div className="h-[28rem] w-[28rem] rounded-full border border-cyan-300/10" />
                    </div>
                    <div className="absolute inset-x-0 top-24 flex justify-center">
                        <div className="h-[22rem] w-[22rem] rounded-full border border-cyan-200/10" />
                    </div>
                    <ParticleCanvas />

                    <div className="relative z-10 mx-auto max-w-6xl px-6">
                        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col items-center justify-center text-center">
                            <div className="relative mb-8 sm:mb-10">
                                <div className="absolute inset-0 rounded-full bg-cyan-400/12 blur-3xl" />
                                <div className="absolute inset-4 rounded-full border border-cyan-300/10" />
                                <div className="relative scale-[0.82] sm:scale-[0.92] md:scale-100">
                                    <PermissionGateEmblem visible={heroVisible} />
                                </div>
                            </div>

                            <h1 className="redoubt-font text-[clamp(3.2rem,8vw,5.75rem)] font-extrabold leading-none tracking-[0.16em] text-transparent bg-gradient-to-b from-white via-cyan-100 to-[#67E8F9] bg-clip-text [text-shadow:0_0_20px_rgba(103,232,249,0.5),0_0_70px_rgba(14,165,233,0.24)]">
                                REDOUBT
                            </h1>

                            <p className="mt-5 redoubt-font text-xl font-semibold tracking-[0.08em] text-cyan-50 sm:text-2xl md:text-3xl">
                                {taglineTyped}
                            </p>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300/90 sm:text-base md:text-lg md:leading-8">
                                Secure data access with verified provenance, AI-backed confidence scoring,
                                and zero-trust controls &mdash; built for trusted participants on an AWS shared-responsibility foundation.
                            </p>

                            <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
                                {[
                                    {
                                        title: 'Verified Provenance',
                                        detail: 'Chain every dataset to auditable origin and policy context.',
                                    },
                                    {
                                        title: 'AI Confidence Scoring',
                                        detail: 'Expose trust signals before a request ever reaches production.',
                                    },
                                    {
                                        title: 'Zero-Trust Controls',
                                        detail: 'Gate access by role, purpose, and continuously validated risk on top of AWS shared-responsibility controls.',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left shadow-[0_0_30px_rgba(15,23,42,0.35)] backdrop-blur-md"
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
                                            <p className="text-sm font-semibold text-cyan-50">{item.title}</p>
                                        </div>
                                        <p className="text-sm leading-6 text-slate-400">{item.detail}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                <Link
                                    to="/login"
                                    onClick={handleSignInFromLanding}
                                    className="inline-flex min-w-[220px] items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/12 px-6 py-3.5 text-sm font-semibold text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.18)] transition-all duration-300 hover:border-cyan-200/60 hover:bg-cyan-300/18 hover:shadow-[0_0_40px_rgba(34,211,238,0.28)]"
                                >
                                    Sign In →
                                </Link>
                                <button
                                    onClick={handleRequestPlatformAccess}
                                    className="inline-flex min-w-[220px] items-center justify-center rounded-xl border border-cyan-200/20 bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,0.32)] transition-all duration-300 hover:from-cyan-200 hover:via-cyan-300 hover:to-sky-400 hover:shadow-[0_0_48px_rgba(34,211,238,0.4)]"
                                >
                                    Request Platform Access
                                </button>
                            </div>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                {['SOC2', 'End-to-End Encrypted', 'Zero Marketplace Risk'].map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium tracking-[0.12em] text-emerald-100 uppercase"
                                    >
                                        <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.7)]" />
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <p className="mt-5 text-xs font-medium tracking-[0.08em] text-slate-500 sm:text-sm">
                                Built on AWS under the AWS Shared Responsibility Model.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    STATS
                ════════════════════════════════════════ */}
                <section className="py-14 md:py-16 border-y border-white/10 bg-slate-950/60">
                    <div ref={statsRef.ref} className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                            {[
                                { value: `${datasetsCount.toLocaleString()}+`, label: 'Verified Datasets' },
                                { value: `${verifiedCount}%`, label: 'Accuracy Rate' },
                                { value: `${partnersCount}+`, label: 'Trusted Partners' }
                            ].map((stat, i) => (
                                <div key={i} className="text-center rounded-xl border border-white/5 bg-slate-900/50 px-4 py-5 sm:bg-transparent sm:border-transparent sm:p-0">
                                    <div className="redoubt-font text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-slate-400 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    HOW IT WORKS
                ════════════════════════════════════════ */}
                <section id="how-it-works" className="py-24 bg-slate-950">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="redoubt-font text-3xl font-semibold text-white">How Redoubt Works</h2>
                            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">A streamlined pipeline from dataset submission to verified, secure access.</p>
                        </div>
                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { num: '01', title: 'Submit', desc: 'Upload datasets with metadata and governance documentation' },
                                { num: '02', title: 'Validate', desc: 'AI-powered quality checks detect anomalies and bias' },
                                { num: '03', title: 'Score', desc: 'Receive transparent confidence scores based on multiple factors' },
                                { num: '04', title: 'Access', desc: 'Zero-trust RBAC with complete audit trail' }
                            ].map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="text-cyan-400 text-sm font-mono mb-3">Step {step.num}</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                    <p className="text-slate-400 text-sm">{step.desc}</p>
                                    {i < 3 && (
                                        <div className="hidden md:block absolute top-6 right-0 w-8 h-px bg-slate-700"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    TRUST & VERIFICATION
                ════════════════════════════════════════ */}
                <section id="security" ref={trustRef.ref} className="py-24 bg-slate-900/95">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="redoubt-font text-3xl font-semibold text-white">Trust by Design</h2>
                            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                                Every dataset is validated, scored, and secured before it ever reaches you.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'AI Validation', desc: 'Real-time quality & bias detection' },
                                { title: 'Provider Vetting', desc: 'Identity + credential verification' },
                                { title: 'Confidence Engine', desc: 'Live, transparent scoring' },
                                { title: 'Zero-Trust Access', desc: 'Full audit trail & revocation' }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-400 text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    SOLUTIONS
                ════════════════════════════════════════ */}
                <section id="solutions" className="py-24 bg-slate-950">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="redoubt-font text-3xl font-semibold text-white">Built for Every Team</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'Researchers', desc: 'Academic & clinical datasets' },
                                { title: 'AI/ML Teams', desc: 'High-quality training data' },
                                { title: 'Enterprises', desc: 'Regulated production pipelines' },
                                { title: 'Contributors', desc: 'Earn from verified contributions' }
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-colors">
                                    <h3 className="text-lg font-semibold text-white mb-3">{s.title}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{s.desc}</p>
                                    <a href="#" className="text-cyan-400 text-sm hover:underline">Learn more →</a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    WHO CAN JOIN
                ════════════════════════════════════════ */}
                <section id="join" ref={whoCanJoinRef.ref} className="py-24 bg-slate-900/95">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                Now Open
                            </div>
                            <h2 className="redoubt-font text-3xl font-semibold text-white">Who Can Join</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: 'Healthcare AI Startups' },
                                { title: 'Fintech & Risk Teams' },
                                { title: 'Research Institutions' },
                                { title: 'Universities & Labs' },
                                { title: 'Climate & Environment' },
                                { title: 'Early-Stage Biotech' }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-900 rounded-lg p-5 border border-slate-700 flex items-center justify-between">
                                    <span className="text-white font-medium">{item.title}</span>
                                    <span className="text-emerald-400 text-xs">✓ Open</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    FINAL CTA
                ════════════════════════════════════════ */}
                <section className="py-24 bg-slate-950 border-t border-white/5">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-semibold text-white mb-4">
                            Ready to get started?
                        </h2>
                        <p className="text-slate-400 mb-8">
                            Join the trusted network of organizations leveraging verified data for AI and analytics.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleRequestPlatformAccess}
                                className="px-8 py-3 bg-cyan-400 text-slate-950 font-semibold rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                            >
                                Request Access
                            </button>
                            <Link
                                to="/login"
                                onClick={handleSignInFromLanding}
                                className="px-8 py-3 border border-slate-600 bg-slate-900/60 text-slate-200 font-medium rounded-lg hover:border-cyan-500 hover:text-cyan-300 transition-all"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </section>
            </div>{/* end body-font wrapper */}
        </div>
    )
}

// ──────────────────────────────────────────────────────────────
// ONBOARDING WIZARD OVERLAY
// Paste your complete original wizard JSX here — zero changes needed.
// ──────────────────────────────────────────────────────────────
function OnboardingWizardOverlay({
    step,
    onCancel,
    onEnterDashboard,
    onReviewProfile
}: {
    step:             number
    onCancel:         () => void
    onEnterDashboard: () => void
    onReviewProfile:  () => void
}) {
    return (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4">
                {/* ── Paste your original OnboardingWizardOverlay JSX here ── */}
            </div>
        </div>
    )
}
