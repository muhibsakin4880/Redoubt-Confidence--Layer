import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { DATASET_DETAILS, DEFAULT_DATASET, confidenceLevel, qualityColor } from '../data/datasetDetailData'
import { askDatasetAssistant, getOllamaConfig } from '../services/ollama'

type ChatRole = 'assistant' | 'user'
type ChatMessage = {
    id: string
    role: ChatRole
    text: string
}

const buildInitialChatMessages = (datasetTitle: string, confidenceScore: number, freshnessScore: number): ChatMessage[] => [
    {
        id: 'a-welcome',
        role: 'assistant',
        text: "Hi! I'm here to help you understand this dataset. I can answer questions based on its metadata, quality metrics, coverage, and high-level summaries. What would you like to know? (e.g. What is the confidence score? What domains does it cover?)"
    },
    { id: 'u-1', role: 'user', text: 'What is the overall confidence score?' },
    {
        id: 'a-1',
        role: 'assistant',
        text: `The overall confidence score for this dataset is ${confidenceScore}%, based on rolling quality and access reliability metrics.`
    },
    { id: 'u-2', role: 'user', text: 'Is the data fresh?' },
    {
        id: 'a-2',
        role: 'assistant',
        text: `Yes - Freshness is rated at ${freshnessScore}%, meeting SLA with automated anomaly gating.`
    },
    { id: 'u-3', role: 'user', text: 'Can I get raw data samples?' },
    {
        id: 'a-3',
        role: 'assistant',
        text: `Sorry, I can only share metadata and summaries for ${datasetTitle}. Raw data access requires approval through the "Request Access" button.`
    }
]

export default function DatasetQualityBreakdownPage() {
    const { id } = useParams()
    const dataset = (id && DATASET_DETAILS[id]) || DEFAULT_DATASET
    const ollamaConfig = getOllamaConfig()

    const [showConfidence, setShowConfidence] = useState(true)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
        buildInitialChatMessages(dataset.title, dataset.confidenceScore, dataset.quality.freshnessScore)
    )
    const [chatInput, setChatInput] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [chatNotice, setChatNotice] = useState('')
    const chatContainerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        setShowConfidence(true)
        setChatInput('')
        setIsThinking(false)
        setChatNotice('')
        setChatMessages(buildInitialChatMessages(dataset.title, dataset.confidenceScore, dataset.quality.freshnessScore))
    }, [dataset])

    useEffect(() => {
        const chatContainer = chatContainerRef.current
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight
    }, [chatMessages, isThinking])

    const getMockReply = (input: string) => {
        const value = input.toLowerCase()
        if (value.includes('confidence')) {
            return `Current confidence is ${dataset.confidenceScore}%, driven by completeness (${dataset.quality.completeness}%), freshness (${dataset.quality.freshnessScore}%), and consistency (${dataset.quality.consistency}%).`
        }
        if (value.includes('fresh') || value.includes('update')) {
            return `Freshness is ${dataset.quality.freshnessScore}% and latest update is ${dataset.lastUpdated}. ${dataset.quality.freshnessNote}`
        }
        if (value.includes('raw') || value.includes('sample')) {
            return 'I can only share metadata and summaries here. Raw rows are protected and require approved secure access.'
        }
        if (value.includes('domain') || value.includes('cover') || value.includes('category')) {
            return `This dataset is in ${dataset.category} and focuses on: ${dataset.description}`
        }
        return 'Fallback assistant: I can help with confidence score, freshness, consistency, access model, and high-level coverage details.'
    }

    const handleSendChatMessage = () => {
        if (isThinking) return

        const trimmed = chatInput.trim()
        if (!trimmed) return

        const history = chatMessages
        setChatMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed }])
        setChatInput('')
        setChatNotice(`Asking Ollama (${ollamaConfig.model})...`)
        setIsThinking(true)

        askDatasetAssistant(trimmed, dataset, history)
            .then((reply) => {
                setChatMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: reply }])
                setChatNotice(`Connected to Ollama at ${ollamaConfig.baseUrl}`)
            })
            .catch(() => {
                setChatMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: getMockReply(trimmed) }])
                setChatNotice('Ollama unavailable right now. Falling back to local metadata replies.')
            })
            .finally(() => {
                setIsThinking(false)
            })
    }

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="text-sm text-slate-400 mb-2">
                            <Link to="/datasets" className="hover:text-white transition-colors">Datasets</Link>
                            <span className="mx-2 text-slate-600">/</span>
                            <Link to={`/datasets/${dataset.id}`} className="hover:text-white transition-colors">{dataset.title}</Link>
                            <span className="mx-2 text-slate-600">/</span>
                            <span className="text-slate-200">Quality Breakdown</span>
                        </div>
                        <h1 className="text-3xl font-bold">Quality Breakdown for {dataset.title}</h1>
                        <p className="text-slate-400">Signal-by-signal view of the checks backing the confidence score and AI-generated summary.</p>
                    </div>
                    <Link
                        to={`/datasets/${dataset.id}`}
                        className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white transition-colors self-start"
                    >
                        Back to Dataset Detail
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Completeness</span>
                            <span className="text-white font-semibold">{dataset.quality.completeness}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                            <div className={`h-2 rounded-full ${qualityColor(dataset.quality.completeness)}`} style={{ width: `${dataset.quality.completeness}%` }} />
                        </div>
                        <p className="text-sm text-slate-400">Required fields filled across stations and time slices.</p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Data Freshness</span>
                            <span className="text-white font-semibold">{dataset.quality.freshnessScore}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                            <div className={`h-2 rounded-full ${qualityColor(dataset.quality.freshnessScore)}`} style={{ width: `${dataset.quality.freshnessScore}%` }} />
                        </div>
                        <p className="text-sm text-slate-400">{dataset.quality.freshnessNote}</p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Consistency</span>
                            <span className="text-white font-semibold">{dataset.quality.consistency}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                            <div className={`h-2 rounded-full ${qualityColor(dataset.quality.consistency)}`} style={{ width: `${dataset.quality.consistency}%` }} />
                        </div>
                        <p className="text-sm text-slate-400">Schema-aligned across providers with unit normalizations.</p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Validation Status</span>
                            <span className="px-2 py-1 rounded-full bg-green-500/15 border border-green-400 text-green-200 text-xs">
                                {dataset.quality.validationStatus}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Anomaly detection, duplication checks, and reference crosswalks run on each load.
                        </p>
                        <div className="mt-3 text-sm text-slate-300">Escalations: none open</div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">AI insight summary</h3>
                            <span className="text-xs text-slate-400">Ollama-backed</span>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed">{dataset.preview.aiSummary}</p>
                        <div className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-white">Ask AI about this dataset</h4>
                                <span className="text-[11px] text-slate-400">Model: {ollamaConfig.model}</span>
                            </div>

                            <div ref={chatContainerRef} className="h-[460px] overflow-y-auto p-4 space-y-3">
                                {chatMessages.map(message => (
                                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-relaxed border ${
                                                message.role === 'user'
                                                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-100'
                                                    : 'bg-slate-800/90 border-slate-700 text-slate-200'
                                            }`}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 mb-1">Dataset Assistant</div>
                                            )}
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                {isThinking && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[86%] rounded-2xl px-3 py-2 text-sm border bg-slate-800/90 border-slate-700 text-slate-300">
                                            AI is thinking...
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-700/80 p-3 space-y-2">
                                {chatNotice && (
                                    <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                                        {chatNotice}
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleSendChatMessage()
                                            }
                                        }}
                                        placeholder="Ask about confidence, freshness, access policy..."
                                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={handleSendChatMessage}
                                        disabled={isThinking}
                                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">
                            Chat uses your local Ollama endpoint at {ollamaConfig.baseUrl}. If Ollama is unavailable, this panel falls back to deterministic metadata replies.
                        </p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">AI Confidence Engine</h3>
                            <button
                                className="text-xs text-blue-300 hover:text-white"
                                onClick={() => setShowConfidence(prev => !prev)}
                            >
                                {showConfidence ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {showConfidence && (
                            <div className="space-y-4">
                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-300">Confidence level</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${confidenceLevel(dataset.confidenceScore).classes}`}>
                                            {confidenceLevel(dataset.confidenceScore).label}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {[
                                            { label: 'Completeness', value: dataset.preview.structureQuality },
                                            { label: 'Freshness', value: dataset.quality.freshnessScore },
                                            { label: 'Consistency', value: dataset.quality.consistency },
                                            { label: 'Structure quality', value: dataset.preview.structureQuality }
                                        ].map(item => (
                                            <div key={item.label}>
                                                <div className="text-slate-400">{item.label}</div>
                                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400" style={{ width: `${item.value}%` }} />
                                                </div>
                                                <div className="text-xs text-slate-300 mt-1">{item.value}%</div>
                                            </div>
                                        ))}
                                        <div>
                                            <div className="text-slate-400">Anomaly risk</div>
                                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                                <div className="h-full bg-amber-400" style={{ width: `${dataset.preview.anomalyRisk}%` }} />
                                            </div>
                                            <div className="text-xs text-slate-300 mt-1">{dataset.preview.anomalyRisk}% flagged</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 space-y-2">
                                    <div className="text-sm font-semibold text-white">AI evaluation summary</div>
                                    <p className="text-sm text-slate-300">
                                        Dataset shows high structural consistency and recent updates. Missing values exist in ~3% of records. Suitable for analytical workloads; access is gated to protect sensitive dimensions.
                                    </p>
                                </div>

                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 space-y-2">
                                    <div className="text-sm font-semibold text-white">Risk flags</div>
                                    {dataset.preview.riskFlags.length === 0 ? (
                                        <div className="text-sm text-green-200">No active risks detected in preview checks.</div>
                                    ) : (
                                        <ul className="text-sm text-amber-200 space-y-1 list-disc list-inside">
                                            {dataset.preview.riskFlags.map(flag => (
                                                <li key={flag}>{flag}</li>
                                            ))}
                                            <li>Missing fields: ~3% nullable attributes</li>
                                            <li>Sparse coverage in coastal wind sensors</li>
                                        </ul>
                                    )}
                                </div>

                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-white">Preview safety</span>
                                        <span className="text-xs text-slate-400">No raw rows shown</span>
                                    </div>
                                    <div className="text-xs text-slate-300">Record count range: {dataset.preview.recordCountRange}</div>
                                    <div className="text-xs uppercase tracking-wide text-slate-500">Schema glimpse</div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs">
                                            <thead className="text-[10px] uppercase tracking-[0.1em] text-slate-400 border-b border-slate-700">
                                                <tr>
                                                    <th className="py-2 pr-3 text-left font-medium">Field</th>
                                                    <th className="py-2 px-3 text-left font-medium">Type</th>
                                                    <th className="py-2 px-3 text-left font-medium">Sample Value</th>
                                                    <th className="py-2 pl-3 text-left font-medium">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                <tr>
                                                    <td className="py-2 pr-3 text-white">station_id</td>
                                                    <td className="py-2 px-3 text-slate-300">string</td>
                                                    <td className="py-2 px-3 text-slate-300">"STN-00142"</td>
                                                    <td className="py-2 pl-3 text-slate-400">Unique station identifier</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-white">timestamp_utc</td>
                                                    <td className="py-2 px-3 text-slate-300">datetime</td>
                                                    <td className="py-2 px-3 text-slate-300">"2026-01-15 08:00:00"</td>
                                                    <td className="py-2 pl-3 text-slate-400">UTC timestamp of reading</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-white">temperature_c</td>
                                                    <td className="py-2 px-3 text-slate-300">float</td>
                                                    <td className="py-2 px-3 text-slate-300">"23.4"</td>
                                                    <td className="py-2 pl-3 text-slate-400">Temperature in Celsius</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-white">precip_mm</td>
                                                    <td className="py-2 px-3 text-slate-300">float</td>
                                                    <td className="py-2 px-3 text-slate-300">"0.0"</td>
                                                    <td className="py-2 pl-3 text-slate-400">Precipitation in millimeters</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-3 text-white">wind_speed_ms</td>
                                                    <td className="py-2 px-3 text-slate-300">float</td>
                                                    <td className="py-2 px-3 text-slate-300">"4.2"</td>
                                                    <td className="py-2 pl-3 text-slate-400">Wind speed in meters/second</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
