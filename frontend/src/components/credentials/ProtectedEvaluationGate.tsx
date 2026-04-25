import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import CredentialSummaryCard from './CredentialSummaryCard'
import CredentialStatusBadge from './CredentialStatusBadge'
import {
    issueEphemeralCredential,
    getCredentialStatus,
    type EphemeralCredential
} from '../../domain/ephemeralCredentialStore'
import { appendCredentialAuditEvent } from '../../domain/credentialAuditStore'

type Props = {
    datasetId: string
    participantId?: string
    dealId?: string
    children: ReactNode
    fallbackRoute?: string
}

const DEFAULT_PARTICIPANT_ID = 'part_anon_current'

export default function ProtectedEvaluationGate({
    datasetId,
    participantId = DEFAULT_PARTICIPANT_ID,
    dealId,
    children,
    fallbackRoute
}: Props) {
    const navigate = useNavigate()
    const [issuedCredential, setIssuedCredential] = useState<EphemeralCredential | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const nowMs = useMemo(() => Date.now(), [refreshKey, issuedCredential])
    const status = issuedCredential ? getCredentialStatus(issuedCredential, nowMs) : null

    const isAccessible = status === 'active' || status === 'expiring'

    const handleIssueCredential = () => {
        const newCredential = issueEphemeralCredential({
            participantId,
            datasetId,
            dealId,
            ttlMinutes: 60
        })

        appendCredentialAuditEvent({
            credentialId: newCredential.id,
            datasetId,
            participantId,
            eventType: 'CREDENTIAL_ISSUED',
            detail: `Short-lived evaluation credential issued for dataset ${datasetId}`,
            severity: 'info'
        })

        setIssuedCredential(newCredential)
        setRefreshKey(v => v + 1)

        if (fallbackRoute) {
            navigate(fallbackRoute)
        }
    }

    if (!issuedCredential) {
        return (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/8 p-6">
                <div className="text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-400">
                        Scoped credential required
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                        Short-Lived Evaluation Credential
                    </h3>
                    <p className="mt-2 max-w-md mx-auto text-sm text-slate-300">
                        Request a short-lived evaluation credential before entering the protected evaluation boundary.
                        This credential enforces policy controls, time limits, and scoped access.
                    </p>
                    <button
                        onClick={handleIssueCredential}
                        className="mt-5 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    >
                        Issue evaluation credential
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'expired') {
        return (
            <div className="rounded-2xl border border-slate-600/50 bg-slate-800/40 p-6">
                <div className="text-center">
                    <CredentialStatusBadge status="expired" />
                    <h3 className="mt-3 text-xl font-semibold text-white">
                        Credential Window Closed
                    </h3>
                    <p className="mt-2 max-w-md mx-auto text-sm text-slate-300">
                        The evaluation credential has expired. Access to this protected dataset is no longer available.
                        Request a new credential to continue evaluation.
                    </p>
                    <button
                        onClick={() => setIssuedCredential(null)}
                        className="mt-5 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    >
                        Request new credential
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'frozen') {
        return (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/8 p-6">
                <div className="text-center">
                    <CredentialStatusBadge status="frozen" />
                    <h3 className="mt-3 text-xl font-semibold text-white">
                        Credential Paused for Policy Review
                    </h3>
                    <p className="mt-2 max-w-md mx-auto text-sm text-slate-300">
                        This credential has been paused for policy review. Access to the protected evaluation
                        boundary is temporarily suspended.
                        {issuedCredential?.reason && <span className="block mt-1 text-amber-200">Reason: {issuedCredential.reason}</span>}
                    </p>
                </div>
            </div>
        )
    }

    if (status === 'revoked') {
        return (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/8 p-6">
                <div className="text-center">
                    <CredentialStatusBadge status="revoked" />
                    <h3 className="mt-3 text-xl font-semibold text-white">
                        Credential Archived
                    </h3>
                    <p className="mt-2 max-w-md mx-auto text-sm text-slate-300">
                        This credential has been archived and is no longer active.
                        {issuedCredential?.reason && <span className="block mt-1 text-rose-200">Reason: {issuedCredential.reason}</span>}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <CredentialSummaryCard credential={issuedCredential} />
            {children}
        </div>
    )
}