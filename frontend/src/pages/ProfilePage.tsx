import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

type DomainOption = 'Climate' | 'Finance' | 'Healthcare' | 'Mobility'
type AccessPreference = 'Metadata & summaries only' | 'Aggregated / anonymized data' | 'Full raw dataset access'

type NotificationItem = {
    id: string
    label: string
    enabled: boolean
}

const sessionData = [
    { id: 'session-1', device: 'Chrome on Windows 11', location: 'New York, US', status: 'Current session' },
    { id: 'session-2', device: 'Edge on Windows 11', location: 'Boston, US', status: '2 days ago' },
    { id: 'session-3', device: 'Mobile Safari on iOS', location: 'Chicago, US', status: '7 days ago' }
]

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
    { id: 'security-alerts', label: 'Security alerts', enabled: true },
    { id: 'request-updates', label: 'Access request updates', enabled: true },
    { id: 'product-announcements', label: 'Platform announcements', enabled: false }
]

const STORAGE_TWO_FACTOR_ENABLED = 'Redoubt:profile:twoFactorEnabled'
const STORAGE_NOTIFICATION_SETTINGS = 'Redoubt:profile:notificationSettings'
const STORAGE_SELECTED_DOMAINS = 'Redoubt:profile:selectedDomains'
const STORAGE_DEFAULT_ACCESS = 'Redoubt:profile:defaultAccessPreference'

const generateInviteCode = (prefix = 'REDO') => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let body = ''
    for (let i = 0; i < 6; i += 1) {
        const randomIndex =
            typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
                ? crypto.getRandomValues(new Uint32Array(1))[0] % alphabet.length
                : Math.floor(Math.random() * alphabet.length)
        body += alphabet[randomIndex]
    }
    return `${prefix}-${body}`
}

export default function ProfilePage() {
    const { signOut } = useAuth()
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(() => {
        const stored = localStorage.getItem(STORAGE_TWO_FACTOR_ENABLED)
        if (stored === null) return true
        return stored === 'true'
    })
    const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
        const stored = localStorage.getItem(STORAGE_NOTIFICATION_SETTINGS)
        if (!stored) return DEFAULT_NOTIFICATIONS
        try {
            const parsed = JSON.parse(stored) as Record<string, unknown>
            if (!parsed || typeof parsed !== 'object') return DEFAULT_NOTIFICATIONS
            return DEFAULT_NOTIFICATIONS.map((item) => ({
                ...item,
                enabled: typeof parsed[item.id] === 'boolean' ? (parsed[item.id] as boolean) : item.enabled
            }))
        } catch {
            return DEFAULT_NOTIFICATIONS
        }
    })
    const [selectedDomains, setSelectedDomains] = useState<DomainOption[]>(() => {
        const stored = localStorage.getItem(STORAGE_SELECTED_DOMAINS)
        if (!stored) return ['Climate', 'Healthcare']
        try {
            const parsed = JSON.parse(stored)
            if (!Array.isArray(parsed)) return ['Climate', 'Healthcare']
            const allowed = new Set<DomainOption>(['Climate', 'Finance', 'Healthcare', 'Mobility'])
            return parsed.filter((value): value is DomainOption => typeof value === 'string' && allowed.has(value as DomainOption))
        } catch {
            return ['Climate', 'Healthcare']
        }
    })
    const [defaultAccessPreference, setDefaultAccessPreference] = useState<AccessPreference>(() => {
        const stored = localStorage.getItem(STORAGE_DEFAULT_ACCESS)
        if (!stored) return 'Aggregated / anonymized data'
        const allowed = new Set<AccessPreference>([
            'Metadata & summaries only',
            'Aggregated / anonymized data',
            'Full raw dataset access'
        ])
        return allowed.has(stored as AccessPreference) ? (stored as AccessPreference) : 'Aggregated / anonymized data'
    })
    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [inviteCopied, setInviteCopied] = useState(false)

    useEffect(() => {
        localStorage.setItem(STORAGE_TWO_FACTOR_ENABLED, String(isTwoFactorEnabled))
    }, [isTwoFactorEnabled])

    useEffect(() => {
        const settings = Object.fromEntries(notifications.map((item) => [item.id, item.enabled]))
        localStorage.setItem(STORAGE_NOTIFICATION_SETTINGS, JSON.stringify(settings))
    }, [notifications])

    useEffect(() => {
        localStorage.setItem(STORAGE_SELECTED_DOMAINS, JSON.stringify(selectedDomains))
    }, [selectedDomains])

    useEffect(() => {
        localStorage.setItem(STORAGE_DEFAULT_ACCESS, defaultAccessPreference)
    }, [defaultAccessPreference])

    const toggleDomain = (domain: DomainOption) => {
        setSelectedDomains((current) =>
            current.includes(domain) ? current.filter((item) => item !== domain) : [...current, domain]
        )
    }

    const toggleNotification = (id: string) => {
        setNotifications((current) =>
            current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
        )
    }

    const handleGenerateInvite = () => {
        setInviteCopied(false)
        setInviteCode(generateInviteCode())
    }

    const handleCopyInvite = async () => {
        if (!inviteCode) return
        try {
            await navigator.clipboard.writeText(inviteCode)
            setInviteCopied(true)
            setTimeout(() => setInviteCopied(false), 2000)
        } catch {
            setInviteCopied(false)
        }
    }

    return (
        <div className="mx-auto max-w-[1500px] px-4 md:px-6 py-6 md:py-8 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Profile & Settings</h1>
                    <p className="text-slate-400">
                        Securely manage account identity, security controls, and platform preferences.
                    </p>
                </div>
                <button
                    onClick={signOut}
                    className="px-4 py-2 rounded-lg border border-slate-700 hover:border-rose-500 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                >
                    Sign Out
                </button>
            </div>

            <section className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 shadow-lg p-6 md:p-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-2xl md:text-3xl font-semibold">
                            AU
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-semibold leading-tight">Avery Underwood</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-slate-300">Northbridge Research Labs</span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Verified
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">Verified Participant since February 2026</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Active Session
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 font-medium">Trust Level</span>
                        <span className="text-emerald-300 font-semibold">87% Trust Level</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '87%' }} />
                    </div>
                </div>
            </section>

            <div className="mt-5 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5">
                <SectionCard title="Account Information" action={<EditIconButton label="Edit account details" />}>
                    <div className="divide-y divide-slate-800">
                        <InfoRow
                            label="Email"
                            value={
                                <span className="inline-flex items-center gap-2">
                                    avery.underwood@northbridge.ai
                                    <span className="inline-flex items-center gap-1 text-emerald-300 text-xs">
                                        <CheckIcon className="w-4 h-4" />
                                        Verified
                                    </span>
                                </span>
                            }
                        />
                        <InfoRow label="Organization" value="Northbridge Research Labs" />
                        <InfoRow label="Role / Position" value="Senior Data Scientist" />
                        <InfoRow label="Joined Date" value="February 12, 2026" />
                        <InfoRow label="Last Login" value="Today, 09:14 UTC" />
                    </div>
                </SectionCard>

                <SectionCard title="Security Settings">
                    <div className="space-y-5">
                        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <ToggleSwitch enabled={isTwoFactorEnabled} onToggle={() => setIsTwoFactorEnabled((prev) => !prev)} />
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-300">Two-Factor Authentication</p>
                                    <p className="text-xs text-emerald-300">Enabled</p>
                                </div>
                            </div>
                            <EditIconButton label="Edit two-factor settings" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-200">Active Sessions</h3>
                                <EditIconButton label="Edit session settings" />
                            </div>
                            <div className="space-y-2">
                                {sessionData.map((session) => (
                                    <div
                                        key={session.id}
                                        className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5 flex items-center justify-between gap-3"
                                    >
                                        <div>
                                            <p className="text-sm text-slate-200">{session.device}</p>
                                            <p className="text-xs text-slate-400">
                                                {session.location} - {session.status}
                                            </p>
                                        </div>
                                        <button className="text-xs px-2.5 py-1.5 rounded-md border border-slate-700 text-slate-300 hover:border-rose-500 hover:text-white transition-colors">
                                            Sign out
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                                <div className="font-mono text-sm text-slate-300">br_live_••••••••••••••••••••••</div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Generate New Key</button>
                                    <button className="px-3 py-1.5 rounded-lg border border-rose-500/50 text-rose-400 text-sm font-medium hover:bg-rose-500/10 transition-colors">Revoke</button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-2">
                                <span>1,247 calls</span>
                                <span>8 datasets</span>
                                <span>2h ago</span>
                            </div>
                            <p className="text-xs text-slate-500">Your key is private. Never share it.</p>
                        </div>
                    </div>
                </SectionCard>
            </div>

            <div className="mt-5 space-y-5">
                <SectionCard title="Invitations">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Generate a single-use invite code for a vetted participant.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleGenerateInvite}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                            >
                                Generate Invite Code
                            </button>
                            {inviteCode && (
                                <button
                                    type="button"
                                    onClick={handleCopyInvite}
                                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 text-sm font-semibold hover:border-blue-500 hover:text-white transition-colors"
                                >
                                    {inviteCopied ? 'Copied' : 'Copy code'}
                                </button>
                            )}
                        </div>
                        {inviteCode && (
                            <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 font-mono text-sm text-slate-100">
                                {inviteCode}
                            </div>
                        )}
                        <p className="text-xs text-slate-500">
                            Invite codes are tied to your verified organization and expire after first use.
                        </p>
                    </div>
                </SectionCard>
                <SectionCard title="Preferences">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-slate-200">Notification Preferences</h3>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <ToggleSwitch
                                            enabled={notification.enabled}
                                            onToggle={() => toggleNotification(notification.id)}
                                        />
                                        <span className="text-sm text-slate-300">{notification.label}</span>
                                    </div>
                                    <EditIconButton label={`Edit ${notification.label}`} />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-200">Preferred Data Domains</h3>
                                <EditIconButton label="Edit preferred domains" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(['Climate', 'Finance', 'Healthcare', 'Mobility'] as DomainOption[]).map((domain) => {
                                    const selected = selectedDomains.includes(domain)
                                    return (
                                        <button
                                            key={domain}
                                            type="button"
                                            onClick={() => toggleDomain(domain)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                                selected
                                                    ? 'bg-blue-500/20 border-blue-500 text-blue-100'
                                                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500'
                                            }`}
                                        >
                                            {domain}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-200">Default Access Preference</h3>
                                <EditIconButton label="Edit default access preference" />
                            </div>
                            <select
                                value={defaultAccessPreference}
                                onChange={(event) => setDefaultAccessPreference(event.target.value as AccessPreference)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                            >
                                <option>Metadata & summaries only</option>
                                <option>Aggregated / anonymized data</option>
                                <option>Full raw dataset access</option>
                            </select>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Activity Summary">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <StatTile label="Datasets Contributed" value="3" />
                        <StatTile label="Access Requests" value="7" />
                        <StatTile label="Approved" value="4" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-200">Recent Activity</p>
                        <p className="text-xs text-slate-400">Reviewed quality report for Mobility Sensor Pack v2.</p>
                        <p className="text-xs text-slate-400">Submitted access request for Climate Benchmark Set A.</p>
                        <p className="text-xs text-slate-400">Rotated API key for production integration.</p>
                    </div>
                </SectionCard>
            </div>
        </div>
    )
}

type SectionCardProps = {
    title: string
    action?: ReactNode
    children: ReactNode
}

function SectionCard({ title, action, children }: SectionCardProps) {
    return (
        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 shadow-lg p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    )
}

type InfoRowProps = {
    label: string
    value: ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-sm text-slate-200 mt-1">{value}</p>
            </div>
            <EditIconButton label={`Edit ${label}`} />
        </div>
    )
}

type ToggleSwitchProps = {
    enabled: boolean
    onToggle: () => void
}

function ToggleSwitch({ enabled, onToggle }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={enabled}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-colors ${
                enabled ? 'bg-blue-600' : 'bg-slate-700'
            }`}
        >
            <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    )
}

type StatTileProps = {
    label: string
    value: string
}

function StatTile({ label, value }: StatTileProps) {
    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-3 text-center">
            <p className="text-lg font-semibold text-slate-100">{value}</p>
            <p className="text-[11px] text-slate-400 leading-tight mt-1">{label}</p>
        </div>
    )
}

type EditIconButtonProps = {
    label: string
}

function EditIconButton({ label }: EditIconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 transition-colors"
        >
            <EditIcon className="w-4 h-4" />
        </button>
    )
}

function EditIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M4 20h4l10-10-4-4L4 16v4z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M13 7l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function CheckIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M20 7L9 18l-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
