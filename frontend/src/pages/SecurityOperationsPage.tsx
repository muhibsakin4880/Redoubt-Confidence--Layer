import {
    ComplianceCertifications,
    RTOPROPanel,
    SecurityPostureGrid,
    SessionSecurityPanel,
    SystemStatusBanner
} from '../components/admin/SecuritySections'

export default function SecurityOperationsPage() {
    return (
        <div className="relative min-h-screen bg-[#010915] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Security & Compliance
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Security Operations</h1>
                        <p className="mt-2 text-slate-400">
                            Illustrative security posture and shared cloud-control references for the Redoubt demo
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.18)]">
                        Continuous controls monitoring active
                    </div>
                </header>

                <section className="mt-10">
                    <SystemStatusBanner />
                </section>

                <section className="mt-10">
                    <SecurityPostureGrid />
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <SessionSecurityPanel />
                    <RTOPROPanel />
                </section>

                <section className="mt-10">
                    <ComplianceCertifications />
                </section>
            </div>
        </div>
    )
}

