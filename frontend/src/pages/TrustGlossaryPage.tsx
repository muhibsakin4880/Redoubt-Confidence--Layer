import { useMemo, useState } from 'react'

type Category = 'Security' | 'Compliance' | 'Privacy' | 'Trust'

type GlossaryTerm = {
    term: string
    definition: string
    category: Category
}

type GlossarySection = {
    letter: string
    terms: GlossaryTerm[]
}

const categoryStyles: Record<Category, string> = {
    Security: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    Compliance: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    Privacy: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
    Trust: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
}

const glossarySections: GlossarySection[] = [
    {
        letter: 'A',
        terms: [
            {
                term: 'Audit Trail',
                definition:
                    'A chronological, tamper-evident record of all actions taken on the platform. Cannot be modified or deleted.',
                category: 'Compliance'
            }
        ]
    },
    {
        letter: 'C',
        terms: [
            {
                term: 'Confidence Score',
                definition:
                    "A 0-100 rating assigned by Redoubt's AI engine indicating how trustworthy and complete a dataset is.",
                category: 'Trust'
            },
            {
                term: 'Clean Room',
                definition:
                    'An isolated compute environment where data can be analyzed without raw data ever leaving the secure boundary.',
                category: 'Security'
            },
            {
                term: 'Compliance',
                definition: 'Meeting legal and regulatory requirements such as HIPAA, GDPR, or SOC 2.',
                category: 'Compliance'
            }
        ]
    },
    {
        letter: 'D',
        terms: [
            {
                term: 'Data Lineage',
                definition:
                    'The full history of where data came from, how it was transformed, and who has accessed it.',
                category: 'Trust'
            },
            {
                term: 'Differential Privacy',
                definition:
                    'A mathematical technique that adds controlled noise to data so individual records cannot be identified.',
                category: 'Privacy'
            },
            {
                term: 'DLP (Data Loss Prevention)',
                definition:
                    'Automated controls that prevent sensitive data from being copied, downloaded, or shared without approval.',
                category: 'Security'
            }
        ]
    },
    {
        letter: 'E',
        terms: [
            {
                term: 'Egress Control',
                definition:
                    'Rules that govern what data can leave a secure environment. Redoubt blocks unauthorized egress by default.',
                category: 'Security'
            },
            {
                term: 'Enclave',
                definition:
                    'A hardware-protected, isolated compute zone where sensitive data is processed without exposure.',
                category: 'Security'
            }
        ]
    },
    {
        letter: 'P',
        terms: [
            {
                term: 'PHI (Protected Health Information)',
                definition: 'Any health-related data that can identify an individual. Strictly regulated under HIPAA.',
                category: 'Privacy'
            },
            {
                term: 'PII (Personally Identifiable Information)',
                definition:
                    'Any data that can be used to identify a specific person, such as name, email, or date of birth.',
                category: 'Privacy'
            },
            {
                term: 'Provider Anonymity',
                definition:
                    'Redoubt hides the identity of data providers from buyers, and vice versa. Only Redoubt knows both parties.',
                category: 'Trust'
            }
        ]
    },
    {
        letter: 'R',
        terms: [
            {
                term: 'RBAC (Role-Based Access Control)',
                definition:
                    "A system where access permissions are assigned based on a user's role, not individual identity.",
                category: 'Security'
            },
            {
                term: 'Residency Constraint',
                definition:
                    'A rule that prevents data from being stored or transferred outside a specific geographic region.',
                category: 'Compliance'
            }
        ]
    },
    {
        letter: 'T',
        terms: [
            {
                term: 'Trust Score',
                definition:
                    'A 0-100 rating assigned to each Redoubt participant based on their identity verification, data quality, and compliance history.',
                category: 'Trust'
            }
        ]
    },
    {
        letter: 'W',
        terms: [
            {
                term: 'Watermarking',
                definition:
                    'An invisible digital fingerprint embedded in data views that identifies which participant accessed it.',
                category: 'Security'
            }
        ]
    }
]

export default function TrustGlossaryPage() {
    const [search, setSearch] = useState('')

    const filteredSections = useMemo(() => {
        const normalized = search.trim().toLowerCase()
        if (!normalized) return glossarySections

        return glossarySections
            .map(section => ({
                ...section,
                terms: section.terms.filter(term =>
                    `${term.term} ${term.definition}`.toLowerCase().includes(normalized)
                )
            }))
            .filter(section => section.terms.length > 0)
    }, [search])

    return (
        <div className="relative min-h-screen bg-[#050b15] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_88%_0%,rgba(14,116,144,0.12),transparent_38%)]" />
            <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Trust Glossary
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Trust Glossary</h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Plain-language definitions for non-technical stakeholders navigating data trust and compliance
                        </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                        Verified definitions for platform assurance
                    </div>
                </header>

                <section className="mt-8">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1628] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                        <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5c1.93 0 3.68-.71 5.15-1.85z"
                            />
                        </svg>
                        <input
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search terms..."
                            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                        />
                    </div>
                </section>

                <section className="mt-10 space-y-10">
                    {filteredSections.map(section => (
                        <div key={section.letter} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-cyan-200">
                                    {section.letter}
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/60 via-cyan-400/10 to-transparent" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {section.terms.map(term => (
                                    <article
                                        key={term.term}
                                        className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-lg font-semibold text-white">{term.term}</h3>
                                            <span
                                                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${categoryStyles[term.category]}`}
                                            >
                                                {term.category}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm text-slate-300">{term.definition}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    )
}

