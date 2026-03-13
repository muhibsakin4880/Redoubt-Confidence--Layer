import { useState } from 'react'

type PipelinesTab = 'overview' | 'api' | 'sdks' | 'samples' | 'downloads' | 'guardrails'

type Endpoint = {
    method: 'GET' | 'POST' | 'PATCH'
    path: string
    description: string
    auth: string
}

const tabs: Array<{ id: PipelinesTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'api', label: 'API Reference' },
    { id: 'sdks', label: 'SDKs' },
    { id: 'samples', label: 'Code Samples' },
    { id: 'downloads', label: 'Downloads / Links' },
    { id: 'guardrails', label: 'Guardrails' }
]

const endpoints: Endpoint[] = [
    { method: 'GET', path: '/v1/datasets', description: 'List datasets available to current workspace.', auth: 'API key or OAuth token' },
    { method: 'GET', path: '/v1/datasets/{id}', description: 'Fetch metadata, trust metrics, and access policy.', auth: 'API key or OAuth token' },
    { method: 'POST', path: '/v1/uploads', description: 'Create a new dataset upload session.', auth: 'Verified session + scoped key' },
    { method: 'POST', path: '/v1/uploads/{id}/complete', description: 'Finalize upload and trigger validation pipeline.', auth: 'Verified session + scoped key' },
    { method: 'PATCH', path: '/v1/access-requests/{id}', description: 'Update request rationale or usage scope.', auth: 'OAuth token' }
]

const curlExample = `curl -X GET "https://api.redoubt.local/v1/datasets?domain=climate&limit=10" \\
  -H "Authorization: Bearer $REDOUBT_API_KEY" \\
  -H "X-Workspace-Id: ws_participant_001"`

const pythonExample = `from redoubt_sdk import RedoubtClient

client = RedoubtClient(api_key="YOUR_API_KEY", workspace_id="ws_participant_001")
datasets = client.datasets.list(domain="climate", limit=10)
print(datasets[0]["title"])`

const jsExample = `import { RedoubtClient } from "@redoubt/sdk"

const client = new RedoubtClient({
  apiKey: process.env.REDOUBT_API_KEY,
  workspaceId: "ws_participant_001"
})

const datasets = await client.datasets.list({ domain: "climate", limit: 10 })
console.log(datasets[0].title)`

const jsonResponseExample = `{
  "data": [
    {
      "id": "ds_1021",
      "title": "Global Climate Observations 2020-2024",
      "confidenceScore": 96,
      "verificationStatus": "Verified",
      "accessType": "Approved access required"
    }
  ],
  "meta": {
    "limit": 10,
    "nextCursor": "eyJwYWdlIjoyfQ=="
  }
}`

const pythonQuickstart = `from redoubt_sdk import RedoubtClient

client = RedoubtClient(api_key="YOUR_API_KEY", workspace_id="ws_participant_001")

# 1) List datasets
for ds in client.datasets.list(limit=5):
    print(ds["id"], ds["title"])

# 2) Start upload session
upload = client.uploads.create(
    title="Mobility QA Batch",
    domain="Mobility",
    data_type="Time-series"
)

# 3) Upload file and complete
client.uploads.add_file(upload["id"], "./mock-data/mobility_q1.parquet")
client.uploads.complete(upload["id"])`

const jsQuickstart = `import { RedoubtClient } from "@redoubt/sdk"

const client = new RedoubtClient({
  apiKey: process.env.REDOUBT_API_KEY,
  workspaceId: "ws_participant_001"
})

const list = await client.datasets.list({ limit: 5 })
console.log(list.map(x => x.title))

const upload = await client.uploads.create({
  title: "Mobility QA Batch",
  domain: "Mobility",
  dataType: "Time-series"
})

await client.uploads.addFile(upload.id, "./mock-data/mobility_q1.parquet")
await client.uploads.complete(upload.id)`

function methodStyle(method: Endpoint['method']) {
    if (method === 'GET') return 'bg-emerald-500/10 border-emerald-400/50 text-emerald-200'
    if (method === 'POST') return 'bg-blue-500/10 border-blue-400/50 text-blue-200'
    return 'bg-violet-500/10 border-violet-400/50 text-violet-200'
}

function CodeBlock({ label, code }: { label: string; code: string }) {
    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/80 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-700 text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</div>
            <pre className="p-3 text-[12px] leading-relaxed text-slate-200 overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    )
}

export default function PipelinesPage() {
    const [activeTab, setActiveTab] = useState<PipelinesTab>('overview')
    const [isAnnual, setIsAnnual] = useState(false)

    return (
        <div className="cyber-grid-bg min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-12 text-white space-y-12">
            <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">Pipelines</span>
                        <span className="text-xs text-cyan-400">→</span>
                        <span className="text-xs text-cyan-400 font-medium">Overview</span>
                    </div>
                    <h1 className="text-3xl font-bold">Pipelines</h1>
                    <p className="text-slate-400 mt-1">Access and contribute data via our APIs and SDKs.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-200">API v1</span>
                    <span className="px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-200">Verified session enabled</span>
                    <button className="px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_#00F0FF40] transition-all duration-200">
                        ← Back to Dashboard
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-2 shadow-[0_0_15px_#00F0FF30]">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-b-2 border-cyan-400 bg-cyan-500/10 text-white shadow-[0_0_15px_#00F0FF30]'
                                    : 'text-gray-400 hover:text-white hover:shadow-[0_0_15px_#00F0FF30]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_20px_#00F0FF20]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="text-left">
                        <p className="text-lg md:text-xl font-bold text-white">Get your API key in 30 seconds & start querying verified datasets</p>
                        <div className="mt-3 text-sm text-gray-400">
                            1,234 calls this month • 98% avg confidence
                        </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                        <button className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold text-sm transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_25px_#00F0FF70] hover:scale-105">
                            Generate API Key Now
                        </button>
                        <button className="text-xs text-gray-500 hover:text-cyan-400 transition-colors duration-200">
                            Already have one? View your key →
                        </button>
                    </div>
                </div>
            </section>

            {activeTab === 'overview' && (
                <section className="space-y-12">
                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-8 md:p-12 shadow-2xl">
                        <div className="max-w-3xl">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 border-t border-cyan-500/40 pt-4">Redoubt Data Pipeline API</h2>
                            <p className="text-lg md:text-xl text-slate-400 mb-6">Enterprise-grade verified data delivery for platforms, tools, and AI systems</p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 text-sm font-medium">API v1 • Live</span>
                                <span className="px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm font-medium">SOC 2 Compliant</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_#00F0FF40]">
                                <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Discover</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Query metadata, confidence scores, and trust metrics via our read APIs. Filter by domain, data type, and verification status.</p>
                        </div>
                        <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_#00F0FF40]">
                                <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Contribute</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Upload files, finalize submissions, and trigger validation pipelines. All contributions go through our auditable review process.</p>
                        </div>
                        <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_#00F0FF40]">
                                <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Govern</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Use scoped credentials, rate limits, and policy enforcement. Control access with fine-grained permissions and audit logs.</p>
                        </div>
                    </div>

                    <div className="text-center py-8">
                        <h3 className="text-2xl font-semibold text-white mb-2 border-t border-cyan-500/40 pt-4">Built for enterprise data stacks</h3>
                        <p className="text-slate-400 mb-6">Connect Redoubt verified data directly into your existing infrastructure</p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="w-16 h-16 rounded-xl bg-[#1e90ff]/10 border border-[#1e90ff]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_#00F0FF30]">
                                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1e90ff"><path d="M12.999 2L4.754 6.002v11.996L12.999 22l8.246-4.002V6.002L12.999 2zm2.999 14.002l-6.2 2.998-1.8-3.998 6.2-3.002 1.8 4.002zm1.5-6.002l-7.498 3.632-1.753-3.908L17 4.002l6.499 3.998z"/></svg>
                            </div>
                            <div className="w-16 h-16 rounded-xl bg-[#ff6f00]/10 border border-[#ff6f00]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_#00F0FF30]">
                                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#ff6f00"><path d="M12.752 2.417C17.099 2.417 20.704 5.08 20.704 9.63c0 3.45-2.556 5.99-5.914 6.682-.51.105-.882.56-.882 1.096v1.364c0 .624-.504 1.131-1.128 1.131H9.58c-.624 0-1.128-.507-1.128-1.131v-1.364c0-.536-.372-.991-.882-1.096C5.152 15.62 2.596 13.08 2.596 9.63c0-4.55 3.605-7.213 7.952-7.213 2.336 0 4.16.91 5.204 1.712-.372.244-.68.58-.92.972-.576-.408-1.318-.68-2.184-.68zm-.752 2.036c-2.44 0-4.688 1.485-5.896 3.636 1.116 2.26 3.196 4.352 5.664 5.192 1.94-.948 3.612-2.928 4.308-5.192-1.152-1.952-3.132-3.636-5.768-3.636-.62 0-1.204.112-1.736.312.14-.688.26-1.392.26-2.124 0-2.256-1.776-4.088-3.968-4.088-2.192 0-3.968 1.832-3.968 4.088 0 2.256 1.776 4.088 3.968 4.088.244 0 .484-.024.72-.056l.404 1.84c-.576.244-1.12.38-1.68.38z"/></svg>
                            </div>
                            <div className="w-16 h-16 rounded-xl bg-[#fbbc05]/10 border border-[#fbbc05]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_#00F0FF30]">
                                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#fbbc05"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                            </div>
                            <div className="w-16 h-16 rounded-xl bg-[#9c27b0]/10 border border-[#9c27b0]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_#00F0FF30]">
                                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#9c27b0"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-6 border-t border-cyan-500/40 pt-4">Pipeline Access Pricing</h3>
                        
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
                            <button 
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isAnnual ? 'bg-cyan-500 shadow-[0_0_15px_#00F0FF50]' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${isAnnual ? 'left-8' : 'left-1'}`}></div>
                            </button>
                            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-400'}`}>Annual <span className="text-cyan-400">(Save 20%)</span></span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                                <div className="text-lg font-bold text-white mb-2">Starter</div>
                                <div className="text-4xl font-bold text-white mb-1 shadow-[0_0_20px_#00F0FF50]">{isAnnual ? '$400' : '$500'}<span className="text-base font-normal text-gray-400">/mo</span></div>
                                {isAnnual && <div className="text-xs text-cyan-400 mb-1">billed annually</div>}
                                <div className="text-sm text-gray-400 mb-6">{isAnnual ? '1,200' : '1,000'} API calls/month</div>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Basic API access</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Email support</li>
                                </ul>
                                <button className="w-full py-3 rounded-xl border border-cyan-500/50 text-white text-sm font-semibold transition-all duration-300 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_#00F0FF50]">Get Started</button>
                            </div>
                            <div className="rounded-3xl border border-cyan-500/50 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35] relative">
                                <div className="absolute -top-3 right-4 px-4 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 text-xs font-bold shadow-[0_0_15px_#00F0FF50]">Most Popular</div>
                                <div className="text-lg font-bold text-white mb-2">Growth</div>
                                <div className="text-4xl font-bold text-white mb-1 shadow-[0_0_20px_#00F0FF50]">{isAnnual ? '$1,600' : '$2,000'}<span className="text-base font-normal text-gray-400">/mo</span></div>
                                {isAnnual && <div className="text-xs text-cyan-400 mb-1">billed annually</div>}
                                <div className="text-sm text-gray-400 mb-6">{isAnnual ? '12,000' : '10,000'} API calls/month</div>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Full API access</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Priority support</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Custom integrations</li>
                                </ul>
                                <button className="w-full py-3 rounded-xl bg-cyan-500 text-black text-sm font-bold transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_25px_#00F0FF70]">Get Started</button>
                            </div>
                            <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                                <div className="text-lg font-bold text-white mb-2">Enterprise</div>
                                <div className="text-4xl font-bold text-white mb-1 shadow-[0_0_20px_#00F0FF50]">Custom</div>
                                <div className="text-sm text-gray-400 mb-6">Unlimited API calls</div>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Unlimited access</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Dedicated support</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>SLA guarantee</li>
                                </ul>
                                <button className="w-full py-3 rounded-xl border border-cyan-500/50 text-white text-sm font-semibold transition-all duration-300 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_#00F0FF50]">Contact Sales</button>
                            </div>
                        </div>

                        <div className="mt-10 rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl overflow-hidden">
                            <div className="p-4 border-b border-cyan-500/30">
                                <h4 className="text-lg font-bold text-white">Feature Comparison</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-cyan-500/30">
                                            <th className="text-left p-4 text-gray-400 font-medium">Features</th>
                                            <th className="text-center p-4 text-white font-bold">Starter</th>
                                            <th className="text-center p-4 text-cyan-400 font-bold bg-cyan-500/10">Growth</th>
                                            <th className="text-center p-4 text-white font-bold">Enterprise</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-cyan-500/20">
                                            <td className="p-4 text-gray-300">API Calls/month</td>
                                            <td className="p-4 text-center text-white">{isAnnual ? '1,200' : '1,000'}</td>
                                            <td className="p-4 text-center text-cyan-300 bg-cyan-500/10">{isAnnual ? '12,000' : '10,000'}</td>
                                            <td className="p-4 text-center text-white">Unlimited</td>
                                        </tr>
                                        <tr className="border-b border-cyan-500/20">
                                            <td className="p-4 text-gray-300">Confidence Score Access</td>
                                            <td className="p-4 text-center text-white">Basic</td>
                                            <td className="p-4 text-center text-cyan-300 bg-cyan-500/10">Full</td>
                                            <td className="p-4 text-center text-white">Full</td>
                                        </tr>
                                        <tr className="border-b border-cyan-500/20">
                                            <td className="p-4 text-gray-300">Audit Logs</td>
                                            <td className="p-4 text-center text-white">7 days</td>
                                            <td className="p-4 text-center text-cyan-300 bg-cyan-500/10">30 days</td>
                                            <td className="p-4 text-center text-white">Unlimited</td>
                                        </tr>
                                        <tr className="border-b border-cyan-500/20">
                                            <td className="p-4 text-gray-300">Dataset Access</td>
                                            <td className="p-4 text-center text-white">Public</td>
                                            <td className="p-4 text-center text-cyan-300 bg-cyan-500/10">Public + Verified</td>
                                            <td className="p-4 text-center text-white">All Datasets</td>
                                        </tr>
<tr className="border-b border-cyan-500/20">
                                             <td className="p-4 text-gray-300">Dedicated Support</td>
                                             <td className="p-4 text-center text-gray-500">—</td>
                                             <td className="p-4 text-center text-cyan-300 bg-cyan-500/10"><svg className="w-6 h-6 text-cyan-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></td>
                                             <td className="p-4 text-center text-white">24/7</td>
                                         </tr>
<tr className="border-b border-cyan-500/20">
                                             <td className="p-4 text-gray-300">Custom Rate Limits</td>
                                             <td className="p-4 text-center text-gray-500">—</td>
                                             <td className="p-4 text-center text-cyan-300 bg-cyan-500/10"><svg className="w-6 h-6 text-cyan-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></td>
                                             <td className="p-4 text-center text-white"><svg className="w-6 h-6 text-cyan-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></td>
                                         </tr>
                                        <tr className="border-b border-cyan-500/20">
                                            <td className="p-4 text-gray-300">SLA Guarantee</td>
                                            <td className="p-4 text-center text-gray-500">—</td>
                                            <td className="p-4 text-center text-gray-500">—</td>
                                            <td className="p-4 text-center text-white">99.9%</td>
                                        </tr>
<tr>
                                             <td className="p-4 text-gray-300">Custom Integrations</td>
                                             <td className="p-4 text-center text-gray-500">—</td>
                                             <td className="p-4 text-center text-cyan-300 bg-cyan-500/10"><svg className="w-6 h-6 text-cyan-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></td>
                                             <td className="p-4 text-center text-white"><svg className="w-6 h-6 text-cyan-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></td>
                                         </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_30px_#00F0FF20]">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="text-left">
                                <p className="text-2xl md:text-3xl font-bold text-white">Ready to start building?</p>
                                <p className="text-gray-400 mt-2">Get your API key and start querying verified datasets in minutes.</p>
                            </div>
                            <button className="px-8 py-4 rounded-xl bg-cyan-500 text-black font-bold text-lg transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_30px_#00F0FF70] hover:scale-105">
                                Generate My API Key
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'api' && (
                <section className="space-y-6">
                    <div className="rounded-3xl border border-cyan-500/30 bg-black/80 backdrop-blur-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                            <div className="flex-1">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Base URL</div>
                                <div className="flex items-center gap-3">
                                    <code className="text-sm text-cyan-300 font-mono">https://api.redoubt.io/v1</code>
                                    <button className="p-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_15px_#00F0FF40]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="md:border-l md:border-cyan-500/30 md:pl-8">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Auth Header</div>
                                <div className="flex items-center gap-3">
                                    <code className="text-sm text-cyan-300 font-mono">Authorization: Bearer {'{your_api_key}'}</code>
                                    <button className="p-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_15px_#00F0FF40]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 border-t border-cyan-500/40 pt-4">Endpoints</h3>
                        <div className="space-y-3">
                            {[
                                { method: 'GET', path: '/v1/datasets', desc: 'List verified datasets' },
                                { method: 'GET', path: '/v1/datasets/{id}', desc: 'Get dataset metadata' },
                                { method: 'GET', path: '/v1/datasets/{id}/confidence', desc: 'Get confidence score' },
                                { method: 'POST', path: '/v1/access/request', desc: 'Submit access request' },
                                { method: 'GET', path: '/v1/audit/logs', desc: 'Retrieve audit trail' }
                            ].map(endpoint => (
                                <div key={`${endpoint.method}-${endpoint.path}`} className="flex items-center gap-4 rounded-2xl border border-cyan-500/20 bg-black/50 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_#00F0FF25] hover:border-cyan-500/40">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                                        endpoint.method === 'GET' 
                                            ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:shadow-[0_0_15px_#00F0FF40]' 
                                            : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:shadow-[0_0_15px_#10B98140]'
                                    }`}>
                                        {endpoint.method}
                                    </span>
                                    <code className="text-sm text-gray-200 font-mono">{endpoint.path}</code>
                                    <span className="text-sm text-gray-400">{endpoint.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'sdks' && (
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                    <span className="text-yellow-300 font-bold text-lg">Py</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Python SDK</h3>
                            </div>
                            <div className="rounded-lg bg-[#0a1628] border border-cyan-500/20 p-3 mb-5 flex items-center justify-between gap-3">
                                <code className="text-sm text-cyan-300 font-mono">pip install redoubt-sdk</code>
                                <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_15px_#00F0FF50] flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-slate-400 text-sm mb-5 leading-relaxed">Official Python client for data discovery and access workflows</p>
                            <button className="px-4 py-2 rounded-lg border border-cyan-500/50 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_20px_#00F0FF40]">View Docs</button>
                        </div>

                        <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                    <span className="text-blue-300 font-bold text-lg">JS</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white">JavaScript/Node SDK</h3>
                            </div>
                            <div className="rounded-lg bg-[#0a1628] border border-cyan-500/20 p-3 mb-5 flex items-center justify-between gap-3">
                                <code className="text-sm text-cyan-300 font-mono">npm install @redoubt/sdk</code>
                                <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_15px_#00F0FF50] flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-slate-400 text-sm mb-5 leading-relaxed">Node.js client for server-side pipeline integrations</p>
                            <button className="px-4 py-2 rounded-lg border border-cyan-500/50 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_20px_#00F0FF40]">View Docs</button>
                        </div>

                        <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                    <span className="text-orange-300 font-bold text-lg">Ja</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Java SDK</h3>
                                <span className="px-2 py-1 rounded-full bg-slate-800/50 border border-cyan-500/40 text-xs text-cyan-300/80">Coming Soon</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-5 leading-relaxed">Enterprise Java client for Snowflake and Palantir integrations</p>
                            <button className="px-4 py-2 rounded-lg border border-cyan-500/50 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_20px_#00F0FF40]">View Docs</button>
                        </div>

                        <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_#00F0FF35]">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                                    <span className="text-cyan-300 font-bold text-lg">R</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white">R SDK</h3>
                                <span className="px-2 py-1 rounded-full bg-slate-800/50 border border-cyan-500/40 text-xs text-cyan-300/80">Coming Soon</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-5 leading-relaxed">Statistical computing integration for research workflows</p>
                            <button className="px-4 py-2 rounded-lg border border-cyan-500/50 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_20px_#00F0FF40]">View Docs</button>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'samples' && (
                <section className="space-y-6">
                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_#00F0FF35]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">Python</span>
                                <h3 className="text-lg font-semibold text-white">List Verified Datasets</h3>
                            </div>
                            <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_20px_#00F0FF40]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <pre className="rounded-xl bg-[#0F172A] border border-cyan-500/20 p-4 text-sm overflow-x-auto font-mono">
                            <code><span className="text-cyan-400">1</span>  <span className="text-purple-400">import</span> Redoubt<br/>
<span className="text-cyan-400">2</span>  <span className="text-gray-400">client =</span> <span className="text-cyan-400">Redoubt</span>.<span className="text-yellow-300">Client</span>(<span className="text-green-400">api_key</span>=<span className="text-orange-300">"YOUR_KEY"</span>)<br/>
<span className="text-cyan-400">3</span>  datasets = <span className="text-gray-400">client</span>.<span className="text-yellow-300">datasets</span>.<span className="text-blue-300">list</span>(<br/>
<span className="text-cyan-400">4</span>      <span className="text-green-400">domain</span>=<span className="text-orange-300">"healthcare"</span>,<br/>
<span className="text-cyan-400">5</span>      <span className="text-green-400">min_confidence</span>=<span className="text-orange-300">90</span><br/>
<span className="text-cyan-400">6</span>  )</code>
                        </pre>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_#00F0FF35]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">JavaScript</span>
                                <h3 className="text-lg font-semibold text-white">Request Dataset Access</h3>
                            </div>
                            <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_20px_#00F0FF40]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <pre className="rounded-xl bg-[#0F172A] border border-cyan-500/20 p-4 text-sm overflow-x-auto font-mono">
                            <code><span className="text-cyan-400">1</span>  <span className="text-purple-400">const</span> Redoubt = <span className="text-purple-400">require</span>(<span className="text-orange-300">'@redoubt/sdk'</span>);<br/>
<span className="text-cyan-400">2</span>  <span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-cyan-400">Redoubt</span>.<span className="text-yellow-300">Client</span>({'{'}<span className="text-green-400">apiKey</span>{'}'});<br/>
<span className="text-cyan-400">3</span>  <span className="text-purple-400">await</span> client.<span className="text-yellow-300">access</span>.<span className="text-blue-300">request</span>({'{'}<br/>
<span className="text-cyan-400">4</span>      <span className="text-green-400">datasetId</span>: <span className="text-orange-300">'ds_climate_2024'</span>,<br/>
<span className="text-cyan-400">5</span>      <span className="text-green-400">purpose</span>: <span className="text-orange-300">'ML training'</span>,<br/>
<span className="text-cyan-400">6</span>      <span className="text-green-400">duration</span>: <span className="text-orange-300">'90_days'</span><br/>
<span className="text-cyan-400">7</span>  {'}'}{'}'});</code>
                        </pre>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_#00F0FF35]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">Python</span>
                                <h3 className="text-lg font-semibold text-white">Get Confidence Score</h3>
                            </div>
                            <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_20px_#00F0FF40]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <pre className="rounded-xl bg-[#0F172A] border border-cyan-500/20 p-4 text-sm overflow-x-auto font-mono">
                            <code><span className="text-cyan-400">1</span>  score = <span className="text-gray-400">client</span>.<span className="text-yellow-300">datasets</span>.<span className="text-blue-300">confidence</span>(<br/>
<span className="text-cyan-400">2</span>      <span className="text-green-400">dataset_id</span>=<span className="text-orange-300">"ds_finance_tick"</span><br/>
<span className="text-cyan-400">3</span>  )<br/>
<span className="text-cyan-400">4</span>  <span className="text-purple-400">print</span>(<span className="text-orange-300">f</span><span className="text-orange-300">"Score: </span>{'{'}<span className="text-gray-400">score</span>.<span className="text-yellow-300">overall</span>{'}'}<span className="text-orange-300">%"</span>)</code>
                        </pre>
                    </div>
                </section>
            )}

            {activeTab === 'downloads' && (
                <section className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-6 border-t border-cyan-500/40 pt-4">Developer Resources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#00F0FF30]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
<svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                         </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">API Reference PDF</div>
                                        <div className="text-xs text-slate-400">Complete endpoint documentation</div>
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_15px_#00F0FF50]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                            <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#00F0FF30]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
<svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                         </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">SDK Starter Pack</div>
                                        <div className="text-xs text-slate-400">Python + JS SDK with examples</div>
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_15px_#00F0FF50]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                            <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#00F0FF30]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
<svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Postman Collection</div>
                                        <div className="text-xs text-slate-400">Pre-built API request collection</div>
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_15px_#00F0FF50]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                            <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#00F0FF30]">
                                <div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                                         <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                         </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Integration Guide</div>
                                        <div className="text-xs text-slate-400">Step-by-step setup for Snowflake, Databricks</div>
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_15px_#00F0FF50]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white mb-6 border-t border-cyan-500/40 pt-4">External Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a href="https://docs.redoubt.io" target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#00F0FF30]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
<svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Documentation Portal</div>
                                        <div className="text-xs text-cyan-300">docs.redoubt.io</div>
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            <a href="https://github.com/redoubt-io" target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#00F0FF30]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
<svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">GitHub Repository</div>
                                        <div className="text-xs text-cyan-300">github.com/redoubt-io</div>
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            <a href="https://status.redoubt.io" target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#00F0FF30]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
<svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">API Status Page</div>
                                        <div className="text-xs text-cyan-300">status.redoubt.io</div>
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 transition-all duration-300 hover:shadow-[0_0_25px_#00F0FF35]">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="text-base font-medium text-white">Interested in deep integration with your data stack?</div>
                                <div className="text-sm text-slate-400 mt-1">Our partnership team will help you get started.</div>
                            </div>
                            <button className="px-6 py-3 rounded-xl border border-cyan-500/50 text-cyan-300 text-sm font-medium bg-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_25px_#00F0FF60] whitespace-nowrap">
                                Contact Partnership Team
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'guardrails' && (
                <section className="space-y-8">
                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-8 shadow-[0_0_20px_#00F0FF20]">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Pipeline Guardrails</h2>
                            <p className="text-slate-400">
                                Policy-as-code enforcement, preflight checks, and signed pipeline manifests
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-white">All pipeline policies active - 0 violations today</div>
                                <div className="text-xs text-emerald-100/80">Last policy update: March 2026</div>
                            </div>
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                                Active
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: 'Active Policies', value: '12' },
                            { label: 'Preflight Checks Today', value: '847' },
                            { label: 'Blocked Operations', value: '3' },
                            { label: 'Pending Approvals', value: '2' }
                        ].map(stat => (
                            <div key={stat.label} className="rounded-2xl border border-cyan-500/20 bg-black/70 p-5 shadow-[0_0_15px_#00F0FF20]">
                                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{stat.label}</div>
                                <div className="mt-3 text-3xl font-semibold text-white">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 shadow-[0_0_20px_#00F0FF20]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Active Policies</h3>
                                <p className="text-sm text-slate-400">Enforced pipeline guardrails</p>
                            </div>
                            <span className="text-xs text-slate-500">5 policies</span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-xl border border-cyan-500/20">
                            <table className="w-full text-sm">
                                <thead className="bg-cyan-500/10 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Policy</th>
                                        <th className="px-4 py-3 text-left">Scope</th>
                                        <th className="px-4 py-3 text-left">Action</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {[
                                        ['PHI Enclave Check', 'Healthcare datasets', 'Block if PHI leaves enclave'],
                                        ['Export Volume Limit', 'All datasets', 'Block if >10GB per request'],
                                        ['Geographic Residency', 'US-only datasets', 'Block cross-border transfer'],
                                        ['API Rate Limiting', 'All pipelines', 'Block if >100 calls/minute'],
                                        ['Raw Data Export', 'Critical datasets', 'Require dual approval']
                                    ].map(row => (
                                        <tr key={row[0]} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-left font-medium text-white">{row[0]}</td>
                                            <td className="px-4 py-3 text-left text-slate-300">{row[1]}</td>
                                            <td className="px-4 py-3 text-left text-slate-300">{row[2]}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 shadow-[0_0_20px_#00F0FF20]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Recent Preflight Results</h3>
                                <p className="text-sm text-slate-400">Preflight check log</p>
                            </div>
                            <span className="text-xs text-slate-500">5 results</span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-xl border border-cyan-500/20">
                            <table className="w-full text-sm">
                                <thead className="bg-cyan-500/10 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Result</th>
                                        <th className="px-4 py-3 text-left">Dataset</th>
                                        <th className="px-4 py-3 text-left">Check</th>
                                        <th className="px-4 py-3 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {[
                                        ['PASSED', 'Global Climate 2020-2024', 'Export volume check', '09:14:02'],
                                        ['PASSED', 'Financial Tick Data', 'Residency check', '08:47:15'],
                                        ['BLOCKED', 'Clinical Outcomes Delta', 'PHI enclave violation', '08:23:44'],
                                        ['PASSED', 'Consumer Behavior Analytics', 'Rate limit check', '07:55:12'],
                                        ['BLOCKED', 'Genomics Research Dataset', 'Raw export attempted', '07:34:28']
                                    ].map(row => (
                                        <tr key={`${row[0]}-${row[1]}`} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-left">
                                                <span
                                                    className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                                                        row[0] === 'BLOCKED'
                                                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                                                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                                                    }`}
                                                >
                                                    {row[0]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-left text-slate-300">{row[1]}</td>
                                            <td className="px-4 py-3 text-left text-slate-300">{row[2]}</td>
                                            <td className="px-4 py-3 text-right text-slate-300">{row[3]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Signed Pipeline Manifests</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                ['Healthcare Ingest Pipeline v2.1', '2026-03-01', 'b7c2...e445'],
                                ['Finance Export Pipeline v1.4', '2026-02-15', 'c9d1...f332'],
                                ['Climate API Pipeline v3.0', '2026-03-08', 'a3f8...d291']
                            ].map(manifest => (
                                <div key={manifest[0]} className="rounded-2xl border border-cyan-500/20 bg-black/70 p-5 shadow-[0_0_15px_#00F0FF20]">
                                    <div className="text-sm font-semibold text-white">{manifest[0]}</div>
                                    <div className="mt-3 text-xs text-slate-400">Signed: {manifest[1]}</div>
                                    <div className="text-xs text-slate-400">Hash: {manifest[2]}</div>
                                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                        <svg className="h-3 w-3 text-emerald-200" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 011.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Verified
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl p-6 shadow-[0_0_20px_#00F0FF20]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Change Approval History</h3>
                                <p className="text-sm text-slate-400">Recent approvals</p>
                            </div>
                            <span className="text-xs text-slate-500">3 entries</span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-xl border border-cyan-500/20">
                            <table className="w-full text-sm">
                                <thead className="bg-cyan-500/10 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Change</th>
                                        <th className="px-4 py-3 text-left">Owner</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {[
                                        ['Policy updated: Export Volume Limit', 'admin_001', '2026-03-05', 'Approved'],
                                        ['Pipeline deployed: Healthcare v2.1', 'admin_002', '2026-03-01', 'Approved'],
                                        ['Policy created: PHI Enclave Check', 'admin_001', '2026-02-20', 'Approved']
                                    ].map(row => (
                                        <tr key={row[0]} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-left font-medium text-white">{row[0]}</td>
                                            <td className="px-4 py-3 text-left text-slate-300">{row[1]}</td>
                                            <td className="px-4 py-3 text-left text-slate-300">{row[2]}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                                                    {row[3]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}
            </div>
        </div>
    )
}


