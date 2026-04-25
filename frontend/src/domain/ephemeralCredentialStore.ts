export type CredentialStatus = 'planned' | 'active' | 'expiring' | 'expired' | 'frozen' | 'revoked'

export type CredentialScope =
    | 'dataset:read'
    | 'query:clean-room'
    | 'audit:write'
    | 'export:none'
    | 'egress:blocked'
    | 'watermark:required'
    | 'policy:enforced'

export type EphemeralCredential = {
    id: string
    participantId: string
    datasetId: string
    dealId?: string
    issuedAt: string
    expiresAt: string
    scopes: CredentialScope[]
    status: CredentialStatus
    reason?: string
    createdFrom: 'checkout' | 'gate' | 'manual'
}

const EPHEMERAL_CREDENTIALS_KEY = 'Redoubt:ephemeralCredentials'

const STORAGE_KEY = 'Redoubt:demoMode' // Demo mode - clears on refresh

function generateCredentialId(): string {
    const chars = 'ABCDEF0123456789'
    const array = new Uint8Array(4)
    crypto.getRandomValues(array)
    const hex = Array.from(array).map(b => chars[b % chars.length]).join('')
    return `TKN-${hex}`
}

function formatTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short'
    }).format(date)
}

export function issueEphemeralCredential({
    participantId,
    datasetId,
    dealId,
    ttlMinutes = 60
}: {
    participantId: string
    datasetId: string
    dealId?: string
    ttlMinutes?: number
}): EphemeralCredential {
    const now = new Date()
    const expires = new Date(now.getTime() + ttlMinutes * 60 * 1000)

    const scopes: CredentialScope[] = [
        'dataset:read',
        'query:clean-room',
        'audit:write',
        'export:none',
        'egress:blocked',
        'watermark:required',
        'policy:enforced'
    ]

    const credential: EphemeralCredential = {
        id: generateCredentialId(),
        participantId,
        datasetId,
        dealId,
        issuedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        scopes,
        status: 'active',
        createdFrom: dealId ? 'checkout' : 'gate'
    }

    return credential
}

export function listEphemeralCredentials(): EphemeralCredential[] {
    return loadCredentials()
}

export function findCredentialForDataset(datasetId: string): EphemeralCredential | null {
    const credentials = loadCredentials()
    const now = Date.now()

    for (const credential of credentials) {
        const status = getCredentialStatus(credential, now)
        if (credential.datasetId === datasetId && (status === 'active' || status === 'expiring')) {
            return credential
        }
    }

    return null
}

export function findCredentialById(id: string): EphemeralCredential | null {
    const credentials = loadCredentials()
    return credentials.find(c => c.id === id) ?? null
}

export function freezeEphemeralCredential(id: string, reason?: string): EphemeralCredential | null {
    const credentials = loadCredentials()
    const index = credentials.findIndex(c => c.id === id)

    if (index === -1) return null

    credentials[index] = {
        ...credentials[index],
        status: 'frozen',
        reason: reason ?? 'Frozen for policy review'
    }

    saveCredentials(credentials)
    return credentials[index]
}

export function revokeEphemeralCredential(id: string, reason?: string): EphemeralCredential | null {
    const credentials = loadCredentials()
    const index = credentials.findIndex(c => c.id === id)

    if (index === -1) return null

    credentials[index] = {
        ...credentials[index],
        status: 'revoked',
        reason: reason ?? 'Archived after evaluation closure'
    }

    saveCredentials(credentials)
    return credentials[index]
}

export function expireEphemeralCredential(id: string): EphemeralCredential | null {
    const credentials = loadCredentials()
    const index = credentials.findIndex(c => c.id === id)

    if (index === -1) return null

    if (credentials[index].status !== 'frozen' && credentials[index].status !== 'revoked') {
        credentials[index] = {
            ...credentials[index],
            status: 'expired'
        }
        saveCredentials(credentials)
    }

    return credentials[index]
}

export function getCredentialStatus(credential: EphemeralCredential, nowMs: number): CredentialStatus {
    if (credential.status === 'frozen' || credential.status === 'revoked') {
        return credential.status
    }

    const expiresMs = new Date(credential.expiresAt).getTime()
    const tenMinutesMs = 10 * 60 * 1000

    if (nowMs >= expiresMs) {
        return 'expired'
    }

    if (expiresMs - nowMs <= tenMinutesMs) {
        return 'expiring'
    }

    return 'active'
}

export function credentialHasScope(credential: EphemeralCredential, scope: CredentialScope): boolean {
    if (credential.status !== 'active' && credential.status !== 'expiring') {
        return false
    }

    return credential.scopes.includes(scope)
}

export function formatCredentialExpiry(credential: EphemeralCredential, nowMs: number): string {
    const status = getCredentialStatus(credential, nowMs)

    if (status === 'expired') return 'Expired'
    if (status === 'revoked') return 'Revoked'
    if (status === 'frozen') return 'Frozen'

    const expiresMs = new Date(credential.expiresAt).getTime()
    const diffMs = expiresMs - nowMs

    if (diffMs <= 0) return 'Expired'

    const minutes = Math.floor(diffMs / (60 * 1000))
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins}m remaining` : `${hours}h remaining`
    }

    return `${minutes}m remaining`
}

function loadCredentials(): EphemeralCredential[] {
    try {
        const isDemoMode = localStorage.getItem(STORAGE_KEY) === 'true'
        if (isDemoMode) {
            localStorage.removeItem(EPHEMERAL_CREDENTIALS_KEY)
            return []
        }
        const stored = localStorage.getItem(EPHEMERAL_CREDENTIALS_KEY)
        if (!stored) return []
        return JSON.parse(stored)
    } catch {
        return []
    }
}

export function setDemoMode(enabled: boolean): void {
    if (enabled) {
        localStorage.setItem(STORAGE_KEY, 'true')
    } else {
        localStorage.removeItem(STORAGE_KEY)
    }
}

export function isDemoMode(): boolean {
    return localStorage.getItem(STORAGE_KEY) === 'true'
}

function saveCredentials(credentials: EphemeralCredential[]): void {
    const isDemoMode = localStorage.getItem(STORAGE_KEY) === 'true'
    if (isDemoMode) {
        return // Don't save in demo mode
    }
    localStorage.setItem(EPHEMERAL_CREDENTIALS_KEY, JSON.stringify(credentials))
}

// Auto-enable demo mode for development
if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, 'true')
}