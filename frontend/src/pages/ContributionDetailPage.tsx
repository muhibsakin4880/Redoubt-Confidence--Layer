import { Link } from 'react-router-dom'

export default function ContributionDetailPage() {
    const buyerActivity = [
        { id: 'buyer_anon_001', date: '2026-02-20', amount: '$299', status: 'Active' },
        { id: 'buyer_anon_002', date: '2026-02-18', amount: '$299', status: 'Active' },
        { id: 'buyer_anon_003', date: '2026-02-15', amount: '$299', status: 'Expired' },
    ]

    return (
        <div className="container mx-auto px-4 py-10 text-white space-y-8">
            <Link
                to="/contributions"
                className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors"
            >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Contributions
            </Link>

            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Financial Tick Delta Batch</h1>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm">
                            <div>
                                <span className="text-slate-400">Submission ID: </span>
                                <span className="text-slate-200">BRE-DS-2026-1003</span>
                            </div>
                            <div>
                                <span className="text-slate-400">Dataset ID: </span>
                                <span className="text-slate-200">ds_finance_2026_a8f3k2</span>
                            </div>
                        </div>
                    </div>
                    <span className="inline-flex whitespace-nowrap px-3 py-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 text-emerald-200 text-xs font-medium">
                        Approved
                    </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                        <div className="text-slate-400 text-xs uppercase tracking-[0.12em]">Total Requests</div>
                        <div className="text-3xl font-semibold mt-1">42</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                        <div className="text-slate-400 text-xs uppercase tracking-[0.12em]">Approved Access</div>
                        <div className="text-3xl font-semibold mt-1 text-emerald-200">28</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                        <div className="text-slate-400 text-xs uppercase tracking-[0.12em]">Revenue Earned</div>
                        <div className="text-3xl font-semibold mt-1 text-emerald-200">$2,240</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                        <div className="text-slate-400 text-xs uppercase tracking-[0.12em]">Reliability Score</div>
                        <div className="text-3xl font-semibold mt-1 text-cyan-200">94%</div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Recent Buyer Activity</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-xs uppercase tracking-[0.08em] text-slate-400 border-b border-slate-700">
                            <tr>
                                <th className="py-3 pr-4 text-left font-medium">Buyer ID</th>
                                <th className="py-3 px-4 text-left font-medium">Access Date</th>
                                <th className="py-3 px-4 text-left font-medium">Amount Paid</th>
                                <th className="py-3 pl-4 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {buyerActivity.map((buyer) => (
                                <tr key={buyer.id} className="hover:bg-slate-800/60 transition-colors">
                                    <td className="py-3 pr-4 text-slate-200">{buyer.id}</td>
                                    <td className="py-3 px-4 text-slate-300">{buyer.date}</td>
                                    <td className="py-3 px-4 text-slate-300">{buyer.amount}</td>
                                    <td className="py-3 pl-4">
                                        <span className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium ${
                                            buyer.status === 'Active' 
                                                ? 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                                                : 'border border-slate-600 bg-slate-800 text-slate-400'
                                        }`}>
                                            {buyer.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
