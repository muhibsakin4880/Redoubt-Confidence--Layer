import type { CredentialStatus } from '../../domain/ephemeralCredentialStore'

type Props = {
    status: CredentialStatus
}

const statusConfig: Record<CredentialStatus, { label: string; className: string }> = {
    planned: {
        label: 'PLANNED',
        className: 'border-slate-600/70 bg-slate-950/45 text-slate-200'
    },
    active: {
        label: 'ACTIVE',
        className: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100'
    },
    expiring: {
        label: 'EXPIRING SOON',
        className: 'border-amber-400/40 bg-amber-500/10 text-amber-100'
    },
    expired: {
        label: 'EXPIRED',
        className: 'border-slate-500/40 bg-slate-500/10 text-slate-200'
    },
    frozen: {
        label: 'FROZEN',
        className: 'border-amber-400/40 bg-amber-500/10 text-amber-100'
    },
    revoked: {
        label: 'REVOKED',
        className: 'border-rose-400/40 bg-rose-500/10 text-rose-100'
    }
}

export default function CredentialStatusBadge({ status }: Props) {
    const config = statusConfig[status]

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${config.className}`}>
            {config.label}
        </span>
    )
}