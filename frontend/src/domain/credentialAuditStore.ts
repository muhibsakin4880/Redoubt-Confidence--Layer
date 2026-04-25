export type CredentialAuditEventType =
    | 'CREDENTIAL_ISSUED'
    | 'CREDENTIAL_ACCESSED'
    | 'CREDENTIAL_EXPIRING'
    | 'CREDENTIAL_EXPIRED'
    | 'CREDENTIAL_FROZEN'
    | 'CREDENTIAL_REVOKED'
    | 'SCOPE_BLOCKED'

export type CredentialAuditSeverity = 'info' | 'warning' | 'critical'

export type CredentialAuditEvent = {
    id: string
    credentialId: string
    datasetId: string
    participantId: string
    eventType: CredentialAuditEventType
    timestamp: string
    detail: string
    severity: CredentialAuditSeverity
}

const CREDENTIAL_AUDIT_KEY = 'Redoubt:credentialAuditEvents'

function generateAuditEventId(): string {
    const chars = 'ABCDEF0123456789'
    const array = new Uint8Array(3)
    crypto.getRandomValues(array)
    const hex = Array.from(array).map(b => chars[b % chars.length]).join('')
    return `AUD-${hex}`
}

export function appendCredentialAuditEvent(event: Omit<CredentialAuditEvent, 'id' | 'timestamp'>): CredentialAuditEvent {
    const fullEvent: CredentialAuditEvent = {
        id: generateAuditEventId(),
        timestamp: new Date().toISOString(),
        ...event
    }

    const store = loadAuditEvents()
    store.push(fullEvent)
    saveAuditEvents(store)

    return fullEvent
}

export function listCredentialAuditEvents(limit?: number): CredentialAuditEvent[] {
    const events = loadAuditEvents()
    const sorted = [...events].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    return limit ? sorted.slice(0, limit) : sorted
}

export function listCredentialAuditEventsForCredential(credentialId: string): CredentialAuditEvent[] {
    return listCredentialAuditEvents().filter(e => e.credentialId === credentialId)
}

export function clearCredentialAuditEvents(): void {
    localStorage.removeItem(CREDENTIAL_AUDIT_KEY)
}

function loadAuditEvents(): CredentialAuditEvent[] {
    try {
        const stored = localStorage.getItem(CREDENTIAL_AUDIT_KEY)
        if (!stored) return []
        return JSON.parse(stored)
    } catch {
        return []
    }
}

function saveAuditEvents(events: CredentialAuditEvent[]): void {
    localStorage.setItem(CREDENTIAL_AUDIT_KEY, JSON.stringify(events))
}