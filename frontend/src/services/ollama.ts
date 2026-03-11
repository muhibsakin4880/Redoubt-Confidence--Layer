import type { DatasetDetail } from '../data/datasetDetailData'

type ChatRole = 'assistant' | 'user'

type HistoryMessage = {
    role: ChatRole
    text: string
}

type OllamaMessage = {
    role: 'system' | 'assistant' | 'user'
    content: string
}

type OllamaResponse = {
    message?: {
        content?: string
    }
    error?: string
}

const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434'
const DEFAULT_OLLAMA_MODEL = 'gpt-oss:120b-cloud'
const MAX_HISTORY_MESSAGES = 8

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '')

const ollamaBaseUrl = normalizeBaseUrl(import.meta.env.VITE_OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL)
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL

export const getOllamaConfig = () => ({
    baseUrl: ollamaBaseUrl,
    model: ollamaModel
})

const buildDatasetSystemPrompt = (dataset: DatasetDetail) => {
    const schemaPreview = dataset.preview.sampleSchema.map(field => `${field.field} (${field.type})`).join(', ')
    const allowedUsage = dataset.access.allowedUsage.join('; ')
    const limits = dataset.access.usageLimits

    return [
        'You are the Redoubt Dataset Assistant.',
        'Only answer using the dataset metadata below.',
        'If asked for raw rows, identities, or protected data, refuse and redirect to access request flow.',
        'Keep answers concise and factual.',
        `Dataset title: ${dataset.title}`,
        `Description: ${dataset.description}`,
        `Category: ${dataset.category}`,
        `Last updated: ${dataset.lastUpdated}`,
        `Confidence score: ${dataset.confidenceScore}%`,
        `Completeness: ${dataset.quality.completeness}%`,
        `Freshness: ${dataset.quality.freshnessScore}%`,
        `Consistency: ${dataset.quality.consistency}%`,
        `Validation status: ${dataset.quality.validationStatus}`,
        `Allowed usage: ${allowedUsage}`,
        `Usage limits: ${limits}`,
        `Schema preview: ${schemaPreview}`
    ].join('\n')
}

const toOllamaHistory = (history: HistoryMessage[]): OllamaMessage[] =>
    history.slice(-MAX_HISTORY_MESSAGES).map(message => ({
        role: message.role,
        content: message.text
    }))

export const askDatasetAssistant = async (
    input: string,
    dataset: DatasetDetail,
    history: HistoryMessage[]
) => {
    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: ollamaModel,
            stream: false,
            messages: [
                { role: 'system', content: buildDatasetSystemPrompt(dataset) },
                ...toOllamaHistory(history),
                { role: 'user', content: input }
            ]
        })
    })

    if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}`)
    }

    const data: OllamaResponse = await response.json()
    const text = data.message?.content?.trim()

    if (!text) {
        throw new Error(data.error || 'Ollama returned an empty response')
    }

    return text
}

