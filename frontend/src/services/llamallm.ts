import type { DatasetDetail } from '../data/datasetDetailData'

type ChatRole = 'assistant' | 'user'

type HistoryMessage = {
    role: ChatRole
    text: string
}

type LlamaCppMessage = {
    role: 'system' | 'assistant' | 'user'
    content: string
}

type LlamaCppResponse = {
    choices?: {
        message: {
            content: string
        }
    }[]
    error?: string
}

const DEFAULT_LLAMACPP_URL = 'http://localhost:8080'
const DEFAULT_MODEL = 'gemma-4-31b-it-Q4_K_M'
const MAX_HISTORY_MESSAGES = 8

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '')

const llamaCppBaseUrl = normalizeBaseUrl(import.meta.env.VITE_LLAMACPP_URL || DEFAULT_LLAMACPP_URL)
const llamaCppModel = import.meta.env.VITE_LLAMACPP_MODEL || DEFAULT_MODEL

export const getLlamaCppConfig = () => ({
    baseUrl: llamaCppBaseUrl,
    model: llamaCppModel
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

const toLlamaCppHistory = (history: HistoryMessage[]): LlamaCppMessage[] =>
    history.slice(-MAX_HISTORY_MESSAGES).map(message => ({
        role: message.role,
        content: message.text
    }))

export const askDatasetAssistantLlamaCpp = async (
    input: string,
    dataset: DatasetDetail,
    history: HistoryMessage[]
) => {
    const response = await fetch(`${llamaCppBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: llamaCppModel,
            messages: [
                { role: 'system', content: buildDatasetSystemPrompt(dataset) },
                ...toLlamaCppHistory(history),
                { role: 'user', content: input }
            ],
            temperature: 0.7,
            stream: false
        })
    })

    if (!response.ok) {
        throw new Error(`LlamaCpp request failed with status ${response.status}`)
    }

    const data: LlamaCppResponse = await response.json()
    const text = data.choices?.[0]?.message?.content?.trim()

    if (!text) {
        throw new Error(data.error || 'LlamaCpp returned an empty response')
    }

    return text
}
