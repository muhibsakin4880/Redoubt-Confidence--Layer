import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CloudProviderLogo, { getCloudProviderVisuals, type CloudProvider } from '../components/CloudProviderLogo'
import { participantOnboardingPaths } from '../onboarding/constants'

// ──────────────────────────────────────────────────────────────
// HOOKS
// ──────────────────────────────────────────────────────────────
function useInView(threshold = 0.25, rootMargin = '0px 0px -12% 0px') {
    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const node = ref.current
        if (!node || inView) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return
                setInView(true)
                observer.disconnect()
            },
            { threshold, rootMargin }
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [threshold, rootMargin, inView])
    return { ref, inView }
}

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

        updatePreference()

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', updatePreference)
            return () => mediaQuery.removeEventListener('change', updatePreference)
        }

        mediaQuery.addListener(updatePreference)
        return () => mediaQuery.removeListener(updatePreference)
    }, [])

    return prefersReducedMotion
}

function useTypingEffect(text: string, speed = 32, start = false) {
    const [displayed, setDisplayed] = useState('')
    useEffect(() => {
        if (!start) { setDisplayed(''); return }
        if (speed <= 0) { setDisplayed(text); return }
        let i = 0
        const interval = window.setInterval(() => {
            setDisplayed(text.slice(0, i + 1))
            i++
            if (i >= text.length) window.clearInterval(interval)
        }, speed)
        return () => window.clearInterval(interval)
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
function MotionReveal({
    children,
    inView,
    className = '',
    delay = 0,
    reducedMotion = false,
    style,
}: {
    children: React.ReactNode
    inView: boolean
    className?: string
    delay?: number
    reducedMotion?: boolean
    style?: React.CSSProperties
}) {
    return (
        <div
            className={`will-change-[opacity,transform,filter] transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                reducedMotion || inView
                    ? 'opacity-100 translate-y-0 scale-100 blur-0'
                    : 'pointer-events-none opacity-0 translate-y-10 scale-[0.985] blur-[4px]'
            } ${className}`}
            style={{
                transitionDelay: reducedMotion ? '0ms' : `${delay}ms`,
                ...style,
            }}
        >
            {children}
        </div>
    )
}

function TiltCard({
    children,
    className = '',
    disabled = false,
}: {
    children: React.ReactNode
    className?: string
    disabled?: boolean
}) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [transform, setTransform] = useState('')

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (disabled || !cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left)  / rect.width  - 0.5) * 28
        const y = ((e.clientY - rect.top)   / rect.height - 0.5) * -28
        setTransform(`perspective(1300px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.04,1.04,1.04)`)
    }, [disabled])

    const handleMouseLeave = useCallback(() => setTransform(''), [])

    useEffect(() => {
        if (disabled) setTransform('')
    }, [disabled])

    return (
        <div
            ref={cardRef}
            className={`relative transition-all duration-300 ease-out ${className}`}
            style={disabled ? undefined : { transform }}
            onMouseMove={disabled ? undefined : handleMouseMove}
            onMouseLeave={disabled ? undefined : handleMouseLeave}
        >
            {children}
        </div>
    )
}

function ParticleCanvas({ disabled = false }: { disabled?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        if (disabled) return
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
    }, [disabled])

    if (disabled) return null

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
function PermissionGateEmblem({
    visible,
    size = 230,
    className = '',
    center = true,
    animated = true,
}: {
    visible: boolean
    size?: number
    className?: string
    center?: boolean
    animated?: boolean
}) {
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
            className={`${center ? 'mx-auto' : ''} transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                ...(visible && animated ? {
                animation: 'logoFloat 6s ease-in-out infinite, logoGlow 4s ease-in-out infinite'
                } : {}),
            }}
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
                        style={animated ? { transformOrigin: `${CX}px ${CY}px`, animation: ring.anim } : undefined}
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
                                        style={animated ? { animation: `innerPulse ${2 + gi * 0.4}s ease-in-out infinite` } : undefined}
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
                    style={animated ? { animation: 'innerPulse 2s ease-in-out infinite' } : undefined}
                />
                {/* Keyhole stem */}
                <rect x={CX-1} y={CY+4} width="2" height="3.5" rx="0.5"
                    fill="#00E5FF" opacity="0.8"
                />

                {/* Core ambient pulse */}
                <circle cx={CX} cy={CY} r="9"
                    fill="rgba(0,229,255,0.04)"
                    filter="url(#pgLock)"
                    style={animated ? { animation: 'innerPulse 3s ease-in-out infinite' } : undefined}
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
    const prefersReducedMotion = usePrefersReducedMotion()

    const [wizardOpen,  setWizardOpen]  = useState(false)
    const [wizardStep,  setWizardStep]  = useState(1)
    const [heroVisible, setHeroVisible] = useState(false)

    const howItWorksRef = useInView(0.18)
    const trustRef = useInView(0.18)
    const solutionsRef = useInView(0.18)
    const whoCanJoinRef = useInView(0.18)
    const finalCtaRef = useInView(0.18)

    useEffect(() => {
        const timer = window.setTimeout(() => setHeroVisible(true), prefersReducedMotion ? 0 : 80)
        return () => window.clearTimeout(timer)
    }, [prefersReducedMotion])

    const heroReady = prefersReducedMotion || heroVisible
    const taglineText = 'The Missing Layer Between Data Discovery and Trusted Deployment'
    const taglineTyped = useTypingEffect(taglineText, prefersReducedMotion ? 0 : 32, heroReady)

    const heroHighlights = [
        {
            title: 'Confidence Before Access',
            detail: 'Fit, provenance, and handling checks before pilot access.',
        },
        {
            title: 'Protected Evaluation',
            detail: 'Scoped evaluation before broader access opens.',
        },
        {
            title: 'Policy & Approval Alignment',
            detail: 'One workflow for privacy, legal, and governance sign-off.',
        },
    ]

    const trustSignals = ['Secure Evaluation', 'Approval Gates', 'Residency-Aware']

    const sharedResponsibilityCards: Array<{ title: CloudProvider; detail: string }> = [
        {
            title: 'AWS',
            detail: 'Infrastructure controls and resilience inherited from AWS.',
        },
        {
            title: 'Azure',
            detail: 'Identity, regional governance, and workload controls under Azure.',
        },
        {
            title: 'Google Cloud',
            detail: 'Operational controls and protected analytics under Google Cloud.',
        },
        {
            title: 'OCI',
            detail: 'Residency-sensitive deployment and isolation controls under OCI.',
        },
    ]

    const workflowSteps = [
        { num: '01', title: 'Review', desc: 'Examine dataset fit, provenance, and handling requirements.' },
        { num: '02', title: 'Scope', desc: 'Configure rights, geography, duration, and evaluation boundaries before commercial review.' },
        { num: '03', title: 'Request', desc: 'Route the access request through purpose, governance, and approval checkpoints.' },
        { num: '04', title: 'Evaluate', desc: 'Enter protected evaluation with audit visibility before any broader rollout is approved.' },
    ]

    const trustFeatures = [
        { title: 'Dataset Provenance', desc: 'Expose origin, preparation context, and handling notes before a team enters a pilot review.' },
        { title: 'Governed Evaluation', desc: 'Let teams validate dataset fit without treating the first step like a full procurement event.' },
        { title: 'Clean-Room Controls', desc: 'Support protected evaluation with egress controls, temporary credentials, and audit visibility.' },
        { title: 'Residency-Aware Options', desc: 'Handle organizations that need deployment and review paths aligned to stricter enterprise policies.' },
    ]

    const solutionCards = [
        { title: 'Provenance Layer', desc: 'Surface origin, handling context, and confidence signals before teams escalate a dataset into formal review.' },
        { title: 'Rights & Policy Layer', desc: 'Scope duration, geography, delivery mode, and permitted use before access terms become operational.' },
        { title: 'Protected Evaluation Layer', desc: 'Move from metadata review into a controlled clean-room or governed evaluation step before broader rollout.' },
        { title: 'Audit & Residency Layer', desc: 'Keep evidence, approval flow, and deployment constraints visible across cross-organization collaboration.' },
    ]

const joinSegments = [
        'Quant research and risk analytics teams',
        'Data residency & stewardship',
        'Climate and geospatial product teams',
        'Healthcare AI and research leads',
        'Mobility and smart city analytics teams',
        'Utilities and smart-grid analytics teams',
        'Consumer, retail, and commerce analytics teams',
        'NLP, text-corpus, and social-media intelligence teams',
        'Contributing research institutions',
        'Industrial and IoT sensor analytics teams',
    ]

    const workflowContexts = [
        'Privacy and sensitive-data review programs',
        'Consent-heavy research and legal-basis workflows',
        'Third-party data intake and DUA-first diligence workflows',
        'Public-sector and civic data programs (secondary fit)',
    ]

    const handleRequestPlatformAccess = () => {
        startOnboarding()
        navigate(participantOnboardingPaths.entry)
    }
    const handleSignInFromLanding = () => { signOut() }
    const handleWizardCancel = () => { setWizardOpen(false); setWizardStep(1) }
    const handleEnterDashboard = () => { signIn(); setWizardOpen(false); setWizardStep(1); navigate('/dashboard') }
    const handleReviewProfile = () => { signIn(); setWizardOpen(false); setWizardStep(1); navigate('/profile') }

    return (
        <div className="relative overflow-hidden bg-[#050C1F] text-white">

            {/* ── GLOBAL STYLES ── */}
            <style>{`
                .redoubt-font { font-family: 'Syne', 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.2; }
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
                @keyframes heroDrift {
                    0%,100% { transform: translate3d(0,0,0) scale(1); opacity: 0.72; }
                    35% { transform: translate3d(18px,-14px,0) scale(1.06); opacity: 0.94; }
                    70% { transform: translate3d(-16px,12px,0) scale(0.98); opacity: 0.78; }
                }
                @keyframes orbitBreath {
                    0%,100% { transform: scale(1) translateY(0); opacity: 0.45; }
                    50% { transform: scale(1.04) translateY(-10px); opacity: 0.95; }
                }
                @keyframes gridDrift {
                    from { transform: translate3d(0,0,0); }
                    to { transform: translate3d(60px,40px,0); }
                }
                @keyframes titleGlow {
                    0%,100% {
                        background-position: 50% 0%;
                        filter: drop-shadow(0 0 18px rgba(103,232,249,0.35));
                    }
                    50% {
                        background-position: 50% 100%;
                        filter: drop-shadow(0 0 30px rgba(103,232,249,0.55));
                    }
                }
                @keyframes cursorBlink {
                    0%,45% { opacity: 0; }
                    50%,100% { opacity: 1; }
                }
                @keyframes linePulse {
                    0%,100% { opacity: 0.28; transform: scaleX(0.82); }
                    50% { opacity: 0.95; transform: scaleX(1.06); }
                }
                @keyframes signalPulse {
                    0%,100% {
                        transform: scale(1);
                        opacity: 0.75;
                        box-shadow: 0 0 0 0 rgba(103,232,249,0.18);
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 1;
                        box-shadow: 0 0 0 8px rgba(103,232,249,0);
                    }
                }
                @keyframes ctaPulse {
                    0%,100% { transform: scale(0.95); opacity: 0.28; }
                    50% { transform: scale(1.08); opacity: 0.65; }
                }
                @keyframes scrollBounce {
                    0%,100% { transform: translateY(0); }
                    50% { transform: translateY(6px); }
                }

                .hero-grid-lines {
                    background-image:
                        linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px);
                    background-size: 100px 100px;
                    mask-image: linear-gradient(180deg, rgba(0,0,0,0.76), rgba(0,0,0,0.08));
                    animation: gridDrift 24s linear infinite;
                }
                .hero-orb {
                    animation: heroDrift 18s ease-in-out infinite;
                }
                .hero-orb.alt {
                    animation-duration: 24s;
                    animation-delay: -7s;
                }
                .hero-orbit {
                    animation: orbitBreath 16s ease-in-out infinite;
                }
                .hero-orbit.delay {
                    animation-delay: -5s;
                    animation-duration: 20s;
                }
                .hero-orbit.fast {
                    animation-delay: -8s;
                    animation-duration: 12s;
                }
                .hero-wordmark {
                    background-size: 130% 130%;
                    animation: titleGlow 10s ease-in-out infinite;
                }
                .landing-panel {
                    position: relative;
                    overflow: hidden;
                    isolation: isolate;
                    transition: border-color 300ms ease, box-shadow 300ms ease, background-color 300ms ease;
                }
                .landing-panel::before {
                    content: '';
                    position: absolute;
                    inset: -40% -30%;
                    background: linear-gradient(115deg, transparent 32%, rgba(103,232,249,0.16) 48%, transparent 64%);
                    transform: translateX(-140%) rotate(8deg);
                    transition: transform 900ms cubic-bezier(0.22,1,0.36,1), opacity 600ms ease;
                    opacity: 0;
                    pointer-events: none;
                }
                .landing-panel:hover::before {
                    transform: translateX(140%) rotate(8deg);
                    opacity: 1;
                }
                .landing-panel:hover {
                    border-color: rgba(103,232,249,0.28);
                    box-shadow: 0 24px 70px rgba(8,47,73,0.24);
                }
                .step-link {
                    transform-origin: left center;
                    animation: linePulse 2.8s ease-in-out infinite;
                }
                .signal-dot {
                    animation: signalPulse 2.2s ease-in-out infinite;
                }
                .cta-orb {
                    animation: ctaPulse 6s ease-in-out infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                    .motion-safe-home,
                    .landing-panel::before,
                    .step-link,
                    .signal-dot,
                    .cta-orb {
                        animation: none !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>

            {/* ── NAVBAR ── */}
            {!wizardOpen && (
                <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
                    <div className="relative h-16">
                        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
                            <nav className="hidden md:flex items-center gap-8 text-sm">
                                <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How it Works</a>
                                <a href="#security" className="text-slate-300 hover:text-white transition-colors">Security</a>
                                <Link to="/solutions" className="text-slate-300 hover:text-white transition-colors">Solutions</Link>
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
                <section className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-16">
                    <div className="absolute inset-0 bg-[#020814]" />
                    <div className="hero-grid-lines motion-safe-home absolute inset-0 opacity-40" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(34,211,238,0.16)_0%,rgba(34,211,238,0.08)_18%,rgba(5,12,31,0)_56%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,20,0.35)_0%,rgba(2,8,20,0.72)_50%,rgba(2,6,23,0.96)_100%)]" />
                    <div className="hero-orb motion-safe-home absolute left-1/2 top-20 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />
                    <div className="hero-orb alt motion-safe-home absolute left-[10%] top-[28%] h-36 w-36 rounded-full bg-blue-500/10 blur-[110px]" />
                    <div className="hero-orb alt motion-safe-home absolute right-[12%] top-[22%] h-40 w-40 rounded-full bg-cyan-300/10 blur-[120px]" />
                    <ParticleCanvas disabled={prefersReducedMotion} />

                    <div className="relative z-10 mx-auto max-w-6xl px-6">
                        <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-4xl flex-col items-center justify-center text-center">
                            <MotionReveal inView={heroReady} reducedMotion={prefersReducedMotion}>
                                <div className="relative isolate mb-8 sm:mb-10">
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                                        <div className="hero-orbit motion-safe-home h-[30rem] w-[30rem] rounded-full border border-cyan-400/10" />
                                    </div>
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                                        <div className="hero-orbit delay motion-safe-home h-[24rem] w-[24rem] rounded-full border border-cyan-300/10" />
                                    </div>
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                                        <div className="hero-orbit fast motion-safe-home h-[18rem] w-[18rem] rounded-full border border-cyan-200/10" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-cyan-400/12 blur-3xl" />
                                    <div className="absolute inset-4 rounded-full border border-cyan-300/10" />
                                    <div className="relative z-10 scale-[0.82] sm:scale-[0.92] md:scale-100">
                                        <PermissionGateEmblem visible={heroVisible} className="mb-10" />
                                    </div>
                                </div>
                            </MotionReveal>

                            <MotionReveal inView={heroReady} reducedMotion={prefersReducedMotion} delay={80}>
                                <h1 className="hero-wordmark motion-safe-home redoubt-font bg-gradient-to-b from-white via-cyan-100 to-[#67E8F9] bg-clip-text text-[clamp(3.2rem,8vw,5.75rem)] font-extrabold leading-tight tracking-[0.16em] text-transparent [text-shadow:0_0_20px_rgba(103,232,249,0.5),0_0_70px_rgba(14,165,233,0.24)]">
                                    REDOUBT
                                </h1>
                            </MotionReveal>

                            <MotionReveal inView={heroReady} reducedMotion={prefersReducedMotion} delay={150}>
                                <p className="mt-5 min-h-[2rem] redoubt-font text-base font-semibold tracking-[0.08em] text-slate-300 sm:text-lg md:text-xl">
                                    {taglineTyped}
                                    {!prefersReducedMotion && (
                                        <span className="motion-safe-home ml-2 inline-block h-[1.05em] w-px translate-y-1 bg-cyan-100/80 align-middle [animation:cursorBlink_1s_steps(2,end)_infinite]" />
                                    )}
                                </p>
                            </MotionReveal>

                            <MotionReveal inView={heroReady} reducedMotion={prefersReducedMotion} delay={230}>
                                <p className="mt-5 max-w-[65ch] text-xs leading-7 text-slate-200 sm:text-sm md:text-base md:leading-8">
                                    Redoubt is a data confidence layer for governed access, helping organizations evaluate
                                    sensitive external datasets with provenance, policy, and audit context before a pilot begins.
                                </p>
                            </MotionReveal>

                            <MotionReveal inView={heroReady} reducedMotion={prefersReducedMotion} delay={320} className="w-full">
                                <div className="mx-auto mt-8 w-full max-w-[48rem] lg:mt-10">
                                    <div className="relative w-full">
                                        <div className="pointer-events-none absolute left-[24%] top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[78px]" />
                                        <div className="pointer-events-none absolute left-[76%] top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/12 blur-[82px]" />
                                        <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center max-w-md mx-auto">
                                            <Link
                                                to="/login"
                                                onClick={handleSignInFromLanding}
                                                className="inline-flex min-h-[3.5rem] w-full sm:w-auto sm:min-w-[10rem] items-center justify-center rounded-[1.15rem] border border-cyan-300/25 bg-slate-950/72 px-6 py-3 text-sm font-semibold text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_36px_rgba(34,211,238,0.16),0_18px_42px_rgba(2,8,23,0.26)] transition-all duration-300 hover:border-cyan-200/55 hover:bg-cyan-300/12 hover:shadow-[0_0_52px_rgba(34,211,238,0.24),0_20px_46px_rgba(2,8,23,0.28)]"
                                            >
                                                Sign In →
                                            </Link>
                                            <button
                                                onClick={handleRequestPlatformAccess}
                                                className="inline-flex min-h-[3.5rem] w-full sm:w-auto sm:min-w-[14rem] items-center justify-center rounded-[1.15rem] border border-cyan-200/20 bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_44px_rgba(34,211,238,0.34),0_18px_42px_rgba(2,8,23,0.22)] transition-all duration-300 hover:from-cyan-200 hover:via-cyan-300 hover:to-sky-400 hover:shadow-[0_0_58px_rgba(34,211,238,0.42),0_20px_46px_rgba(2,8,23,0.24)]"
                                            >
                                                Request Platform Access
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </MotionReveal>

                            <MotionReveal inView={heroReady} reducedMotion={prefersReducedMotion} delay={420}>
                                <div className="mt-6 flex justify-center">
                                    <div className="flex gap-3">
                                        {trustSignals.map((item, index) => (
                                            <span 
                                                key={item}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-300/12 bg-emerald-500/5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-50"
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" style={{ animationDelay: `${index * 0.18}s` }} />
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </MotionReveal>

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                                <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>

                        </div>

                        <div className="mx-auto mt-8 w-full max-w-5xl lg:mt-10">
                            <div className="relative grid items-stretch gap-3 lg:grid-cols-3">
                                {heroHighlights.map((item, index) => (
                                    <div
                                        key={item.title}
                                        className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
                                    >
                                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-cyan-300" />
                                        <div>
                                            <p className="text-sm font-semibold text-cyan-50">{item.title}</p>
                                            <p className="text-xs text-slate-400">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    HOW IT WORKS
                ════════════════════════════════════════ */}
                <section id="how-it-works" className="py-24 bg-slate-900 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(6,182,212,0.02)_50%,transparent_100%)]" />
                    <div ref={howItWorksRef.ref} className="max-w-6xl mx-auto px-6 relative">
                        <MotionReveal inView={howItWorksRef.inView} reducedMotion={prefersReducedMotion}>
                            <div className="text-center mb-16">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-4">
                                    <span className="signal-dot motion-safe-home h-2 w-2 rounded-full bg-cyan-400"></span>
                                    Workflow
                                </div>
                                <h2 className="redoubt-font text-3xl md:text-4xl font-semibold text-white">Your Governed Path Forward</h2>
                                <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                                    A focused workflow for regulated analytics teams reviewing external datasets before moving into a pilot.
                                </p>
                            </div>
                        </MotionReveal>
                        <div className="relative">
                            <div className="absolute left-8 right-8 top-8 top-[4.5rem] h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent hidden md:block" />
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {workflowSteps.map((step, index) => (
                                    <MotionReveal
                                        key={step.num}
                                        inView={howItWorksRef.inView}
                                        reducedMotion={prefersReducedMotion}
                                        delay={90 + index * 110}
                                    >
                                        <div className="relative flex flex-col items-center h-full">
                                            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-400/40 bg-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                                                <span className="text-lg font-bold text-cyan-300">{step.num}</span>
                                            </div>
                                            <div className="mt-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 w-full backdrop-blur-sm flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                                <p className="text-sm leading-6 text-slate-400">{step.desc}</p>
                                            </div>
                                        </div>
                                    </MotionReveal>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    CAPABILITIES (MERGED)
                ════════════════════════════════════════ */}
                <section id="capabilities" className="relative py-16 bg-slate-950 overflow-hidden">
                    <div ref={trustRef.ref} className="relative max-w-6xl mx-auto px-6">
                        <MotionReveal inView={trustRef.inView} reducedMotion={prefersReducedMotion}>
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
                                    <span className="signal-dot motion-safe-home h-2 w-2 rounded-full bg-emerald-400"></span>
                                    Platform Capabilities
                                </div>
                                <h2 className="redoubt-font text-3xl md:text-4xl font-semibold text-white">What Redoubt Enables</h2>
                                <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                                    A controlled review and evaluation workflow for high-stakes data decisions.
                                </p>
                            </div>
                        </MotionReveal>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">What You Verify</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {trustFeatures.map((item, index) => (
                                        <TiltCard key={item.title} disabled={prefersReducedMotion}>
                                            <div className="group rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm h-full flex flex-col">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed mt-auto">{item.desc}</p>
                                            </div>
                                        </TiltCard>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">How It's Enforced</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {solutionCards.slice(0, 4).map((item, index) => (
                                        <TiltCard key={item.title} disabled={prefersReducedMotion}>
                                            <div className="group rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm h-full flex flex-col">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed mt-auto">{item.desc}</p>
                                            </div>
                                        </TiltCard>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <MotionReveal
                            inView={trustRef.inView}
                            reducedMotion={prefersReducedMotion}
                            delay={240}
                        >
                            <div className="mt-8 flex justify-center">
                                <Link
                                    to="/trust-center"
                                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/15"
                                >
                                    Open Trust Center
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </MotionReveal>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    INFRASTRUCTURE BAND
                ════════════════════════════════════════ */}
                <section className="py-12 bg-slate-900 border-y border-slate-800/50">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Built on Enterprise Infrastructure</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {sharedResponsibilityCards.map((card) => {
                                const visuals = getCloudProviderVisuals(card.title)
                                const isAWS = card.title === 'AWS'
                                return (
                                    <div key={card.title} className="flex flex-col items-center text-center p-4 rounded-xl border border-slate-800/60 bg-slate-950/30 hover:bg-slate-800/30 transition-colors">
                                        <div className={`${isAWS ? 'h-5 w-10' : 'h-6 w-6'} flex items-center justify-center`} style={{ color: visuals.color }}>
                                            <CloudProviderLogo provider={card.title} className={isAWS ? 'h-5 w-10' : ''} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-300 mt-3">{card.title}</span>
                                        <span className="text-xs text-slate-500 mt-2 leading-relaxed">{card.detail}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    WHO CAN JOIN
                ════════════════════════════════════════ */}
                <section id="join" className="py-16 bg-slate-950 relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.08) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    <div ref={whoCanJoinRef.ref} className="max-w-6xl mx-auto px-6 relative">
                        <MotionReveal inView={whoCanJoinRef.inView} reducedMotion={prefersReducedMotion}>
                            <div className="text-center mb-16">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-400/20 text-emerald-300 text-xs font-semibold mb-6">
                                    <span className="signal-dot motion-safe-home h-2 w-2 rounded-full bg-emerald-400"></span>
                                    Supported Contexts
                                </div>
                                <h2 className="redoubt-font text-3xl md:text-4xl font-semibold text-white">Supported Operating Contexts</h2>
                                <p className="mx-auto mt-4 max-w-3xl text-slate-400 text-lg">
                                    The current demo is strongest where teams need confidence, policy, and approval context before broader dataset access is discussed.
                                </p>
                            </div>
                        </MotionReveal>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {joinSegments.map((title, index) => (
                                <MotionReveal
                                    key={title}
                                    inView={whoCanJoinRef.inView}
                                    reducedMotion={prefersReducedMotion}
                                    delay={80 + index * 80}
                                >
                                    <TiltCard disabled={prefersReducedMotion} className="h-full">
                                        <div className="landing-panel group rounded-xl border border-slate-600/40 bg-slate-800/40 p-4 hover:border-emerald-400/30 hover:bg-slate-800/60 transition-all h-full min-h-[80px] flex flex-col justify-between">
                                            <span className="text-white font-medium text-sm line-clamp-2">{title}</span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-emerald-200 mt-2 self-start">
                                                <span
                                                    className="signal-dot motion-safe-home h-1.5 w-1.5 rounded-full bg-emerald-300"
                                                    style={{ animationDelay: `${index * 0.12}s` }}
                                                />
                                                Best Fit
                                            </span>
                                        </div>
                                    </TiltCard>
                                </MotionReveal>
                            ))}
                        </div>
                        <MotionReveal
                            inView={whoCanJoinRef.inView}
                            reducedMotion={prefersReducedMotion}
                            delay={120 + joinSegments.length * 60}
                        >
                            <div className="mt-10">
                                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300 mb-5 text-center">Cross-cutting programs</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {workflowContexts.map((context, index) => (
                                        <TiltCard disabled={prefersReducedMotion} key={context} className="h-full">
                                            <div className="rounded-xl border border-cyan-500/20 bg-slate-800/40 p-3 flex items-center justify-center h-full min-h-[72px]">
                                                <span className="inline-flex items-center gap-2 text-xs font-medium text-cyan-50 text-center line-clamp-2">
                                                    <span
                                                        className="signal-dot motion-safe-home h-1.5 w-1.5 rounded-full bg-cyan-300"
                                                        style={{ animationDelay: `${index * 0.1}s` }}
                                                    />
                                                    {context}
                                                </span>
                                            </div>
                                        </TiltCard>
                                    ))}
                                </div>
                            </div>
                        </MotionReveal>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    FINAL CTA
                ════════════════════════════════════════ */}
                <section className="relative py-24 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]" />
                    <div className="cta-orb motion-safe-home absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/8 blur-[160px]" />
                    <div ref={finalCtaRef.ref} className="relative max-w-4xl mx-auto px-6">
                        <MotionReveal inView={finalCtaRef.inView} reducedMotion={prefersReducedMotion}>
                            <div className="landing-panel rounded-[2.5rem] border border-cyan-500/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.9)_0%,rgba(2,8,20,0.98)_100%)] px-8 py-12 text-center shadow-[0_0_80px_rgba(8,47,73,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-14">
                                <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                                    <span className="signal-dot motion-safe-home h-2 w-2 rounded-full bg-cyan-300" />
                                    Regulated Analytics Pilot Intake
                                </div>
                                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-5">
                                    Exploring a governed dataset pilot?
                                </h2>
                                <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                                    Redoubt is being shaped for teams that need a credible review and evaluation workflow before broader access is discussed, especially where clean-room controls or residency constraints matter.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={handleRequestPlatformAccess}
                                        className="px-8 py-4 bg-cyan-400 text-slate-950 font-semibold rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
                                    >
                                        Request Access
                                    </button>
                                    <Link
                                        to="/login"
                                        onClick={handleSignInFromLanding}
                                        className="px-8 py-4 border border-slate-600 bg-slate-900/60 text-slate-200 font-medium rounded-xl hover:border-cyan-500 hover:text-cyan-300 transition-all"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        </MotionReveal>
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
