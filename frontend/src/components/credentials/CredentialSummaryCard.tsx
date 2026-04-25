import { useMemo } from 'react'
import CredentialStatusBadge from './CredentialStatusBadge'
import {
    type EphemeralCredential,
    getCredentialStatus,
    formatCredentialExpiry
} from '../../domain/ephemeralCredentialStore'

type Props = {
    credential: EphemeralCredential
}

const scopeLabels: Record<string, string> = {
    'dataset:read': 'Dataset Read',
    'query:clean-room': 'Clean Room Query',
    'audit:write': 'Audit Write',
    'export:none': 'No Raw Export',
    'egress:blocked': 'Egress Blocked',
    'watermark:required': 'Watermark Required',
    'policy:enforced': 'Policy Enforced'
}

export default function CredentialSummaryCard({ credential }: Props) {
    const nowMs = useMemo(() => Date.now(), [])
    const status = getCredentialStatus(credential, nowMs)
    const timeRemaining = formatCredentialExpiry(credential, nowMs)

    const issuedTimestamp = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
            timeZoneName: 'short'
        }).format(new Date(credential.issuedAt))
    }, [credential.issuedAt])

    const expiryTimestamp = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
            timeZoneName: 'short'
        }).format(new Date(credential.expiresAt))
    }, [credential.expiresAt])

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Scoped Evaluation Credential
                    </div>
                    <div className="mt-2 font-mono text-lg font-semibold text-white">
                        {credential.id}
                    </div>
                </div>
                <CredentialStatusBadge status={status} />
            </div>

            <div className="mt-4 grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Time Remaining
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-100">
                            {timeRemaining}
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Issued
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-100">
                            {issuedTimestamp}
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Expires
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-100">
                        {expiryTimestamp}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Scopes
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {credential.scopes.slice(0, 4).map(scope => (
                        <span
                            key={scope}
                            className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-cyan-100"
                        >
                            {scopeLabels[scope] || scope}
                        </span>
                    ))}
                    {credential.scopes.length > 4 && (
                        <span className="rounded-full border border-slate-600/70 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                            +{credential.scopes.length - 4} more
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}