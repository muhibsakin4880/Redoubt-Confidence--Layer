import { useState } from 'react'

const certifications = [
    { id: 'soc2', name: 'SOC 2 Type II', color: 'bg-emerald-500' },
    { id: 'hipaa', name: 'HIPAA', color: 'bg-blue-500' },
    { id: 'gdpr', name: 'GDPR', color: 'bg-purple-500' },
    { id: 'iso27001', name: 'ISO 27001', color: 'bg-orange-500' },
]

const complianceMappings: Record<string, { title: string; controls: string[] }> = {
    soc2: {
        title: 'SOC 2 Type II',
        controls: [
            'Purpose-based access controls (CC6.1)',
            'Audit trail logging (CC7.2)',
            'Encrypted data transmission (CC6.7)',
            'Quarterly access reviews (CC6.3)',
        ],
    },
    hipaa: {
        title: 'HIPAA',
        controls: [
            'Protected evaluation rooms (164.312(e)(1))',
            'Purpose-limited data access (164.502(d))',
            'Audit controls (164.312(b))',
            'Transmission security (164.312(e)(2))',
        ],
    },
    gdpr: {
        title: 'GDPR',
        controls: [
            'Purpose limitation enforcement (Art. 5)',
            'Data minimization controls (Art. 5)',
            'Lawful basis documentation (Art. 6)',
            'Right to erasure workflow (Art. 17)',
        ],
    },
    iso27001: {
        title: 'ISO 27001',
        controls: [
            'Access control policy (A.9)',
            'Cryptographic controls (A.10)',
            'Information classification (A.8)',
            'Audit logging (A.12)',
        ],
    },
}

export default function TrustBadges() {
    const [expandedCert, setExpandedCert] = useState<string | null>(null)

    return (
        <div className="bg-slate-800/50 border-y border-slate-700/50 py-6">
            <div className="container mx-auto px-4">
                <div className="text-center mb-4">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Compliance Framework Support</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {certifications.map((cert) => (
                            <button
                                key={cert.id}
                                onClick={() => setExpandedCert(expandedCert === cert.id ? null : cert.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium
                                    transition-all duration-200 border
                                    ${expandedCert === cert.id
                                        ? 'bg-slate-700 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400 hover:bg-slate-700'
                                    }
                                `}
                            >
                                <span className={`w-2 h-2 rounded-full ${cert.color}`} />
                                {cert.name}
                                <svg
                                    className={`w-3 h-3 transition-transform ${expandedCert === cert.id ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>

                {expandedCert && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-slate-900/80 border border-slate-600 rounded-lg p-4 max-w-2xl mx-auto">
                            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                How Redoubt meets {complianceMappings[expandedCert].title}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {complianceMappings[expandedCert].controls.map((control, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                                        <span className="text-cyan-400 mt-0.5">✓</span>
                                        <span>{control}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-500 text-xs mt-3 italic">
                                * This demo illustrates the governed workflow. Actual certification would follow pilot completion.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
