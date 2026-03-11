export default function AboutPage() {
    return (
        <div className="bg-slate-900 text-white">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-800">
                <div className="container mx-auto px-4 py-12 md:py-16 space-y-4 max-w-5xl">
                    <h1 className="text-3xl md:text-4xl font-bold">About the Platform</h1>
                    <p className="text-slate-300 text-lg">
                        Redoubt is an information-protected participation layer: identity-verified participants request access, contribute datasets,
                        and collaborate under governed controls. No marketplace listings, just security, confidence, and auditability.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 space-y-8 max-w-5xl">
                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Security & Confidence</h2>
                    <p className="text-slate-400">
                        Every interaction—requests, approvals, contributions, compliance confirmations—is logged and evaluated for trust.
                        AI-backed quality checks and confidence scores keep datasets verifiable before access is granted.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">How It Works</h2>
                    <ul className="space-y-2 text-slate-300 list-disc pl-5">
                        <li>Participants authenticate and complete onboarding.</li>
                        <li>Onboarded participants can request dataset access or contribute new datasets.</li>
                        <li>Trust and compliance signals inform approvals and ongoing participation rights.</li>
                    </ul>
                </section>
            </div>
        </div>
    )
}

