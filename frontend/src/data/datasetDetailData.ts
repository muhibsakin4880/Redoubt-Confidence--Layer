import type { RequestReviewState } from '../domain/accessContract'

export type DatasetDetail = {
    id: string
    title: string
    description: string
    category: string
    size: string
    recordCount: string
    lastUpdated: string
    confidenceScore: number
    confidenceSummary: string
    contributorTrust: string
    contributionHistory: string
    quality: {
        completeness: number
        freshnessScore: number
        freshnessNote: string
        consistency: number
        validationStatus: string
    }
    accessNotes: string[]
    providerNotes: string[]
    access: {
        status: RequestReviewState
        allowedUsage: string[]
        instructions: string[]
        expiration: string
        usageLimits: string
    }
    preview: {
        aiSummary: string
        qualityNotes: string[]
        riskFlags: string[]
        confidenceBand: 'high' | 'medium' | 'low'
        sampleSchema: { field: string; type: string; note?: string }[]
        freshnessLabel: string
        completenessLabel: string
        decision: 'production' | 'experimental'
        strengths: string[]
        limitations: string[]
        suggestedUseCases: string[]
        structureQuality: number
        anomalyRisk: number
        recordCountRange: string
    }
}

export type RequestStatus = DatasetDetail['access']['status']

export const DATASET_DETAILS: Record<string, DatasetDetail> = {
    '1': {
        id: '1',
        title: 'Global Climate Observations 2020-2024',
        description:
            'Consolidated temperature, precipitation, wind, and atmospheric measurements from 5,000+ ground stations and satellites with harmonized schemas.',
        category: 'Climate Science',
        size: '2.4 TB',
        recordCount: '1.2M records',
        lastUpdated: '2024-02-15',
        confidenceScore: 96,
        confidenceSummary: 'Score reflects near-real-time ingestion, anomaly flagging, and cross-source consistency checks.',
        contributorTrust: 'High Confidence Participant',
        contributionHistory: '18 verified pushes - zero disputes',
        quality: {
            completeness: 97,
            freshnessScore: 94,
            freshnessNote: 'Live ingest with hourly deltas; full reconciliation every 24h.',
            consistency: 95,
            validationStatus: 'Automated QA passed; manual spot checks monthly'
        },
        accessNotes: [
            'Submit a short use-case summary so we can scope delivery and controls.',
            'Our team responds within one business day with next steps.',
            'Access is provisioned in a governed workspace with activity logging.'
        ],
        providerNotes: [
            'Provider verified for secure handling and uptime commitments.',
            'Identity withheld; communication routed through managed support.',
            'Data pipeline monitored with integrity alerts and rollback paths.'
        ],
        access: {
            status: 'REVIEW_IN_PROGRESS',
            allowedUsage: [
                'Model training and validation',
                'Exploratory analysis and dashboards',
                'Derived works with attribution and no raw sharing'
            ],
            instructions: [
                'Access provided through a governed workspace; raw exports disabled.',
                'API keys scoped to this dataset with hourly rate limits.',
                'Usage monitored for anomaly detection and revoked on policy breaches.'
            ],
            expiration: 'Access review on 2024-06-30',
            usageLimits: 'API: 50k calls/day; Workspace compute: 120 GPU hours/month'
        },
        preview: {
            aiSummary: 'Data shows stable coverage across regions with minimal latency spikes. Freshness meets SLA with automated anomaly gating.',
            qualityNotes: [
                'Completeness above 95% for mandatory fields in the last 90 days.',
                'Freshness deviations auto-flagged; no outages in last 30 days.',
                'Cross-source reconciliation reduces unit drift and scaling errors.'
            ],
            riskFlags: ['Minor seasonal variance in coastal wind sensors; calibrated in post-processing.'],
            confidenceBand: 'high',
            sampleSchema: [
                { field: 'station_id', type: 'string', note: 'Stable ID across providers' },
                { field: 'timestamp_utc', type: 'datetime', note: 'ISO 8601' },
                { field: 'temperature_c', type: 'float', note: 'Calibrated; +/-0.2C typical error' },
                { field: 'precip_mm', type: 'float' },
                { field: 'wind_speed_ms', type: 'float' }
            ],
            freshnessLabel: '< 1 hour lag on latest ingest',
            completenessLabel: '96% required fields present',
            decision: 'production',
            strengths: [
                'Near-real-time ingest with anomaly gating',
                'Cross-source reconciliation to reduce drift',
                'Consistent schema across geographies'
            ],
            limitations: [
                'Seasonal variance in coastal wind sensors',
                'Sparse coverage in high-altitude microclimates'
            ],
            suggestedUseCases: [
                'Production-grade climate dashboards',
                'Weather-informed demand forecasting',
                'Model retraining with fresh signals'
            ],
            structureQuality: 94,
            anomalyRisk: 6,
            recordCountRange: '1.1M - 1.3M records (rolling)'
        }
    }
}

export const DEFAULT_DATASET = DATASET_DETAILS['1']

export const qualityColor = (score: number) => {
    if (score >= 95) return 'bg-green-400'
    if (score >= 90) return 'bg-blue-400'
    if (score >= 80) return 'bg-yellow-400'
    return 'bg-orange-400'
}

export const decisionLabel = (decision: DatasetDetail['preview']['decision']) =>
    decision === 'production'
        ? { text: 'Recommended for production research', classes: 'bg-emerald-500/15 border-emerald-400 text-emerald-200' }
        : { text: 'Suitable for experimentation only', classes: 'bg-amber-500/15 border-amber-400 text-amber-200' }

export const confidenceLevel = (score: number) => {
    if (score >= 97) return { label: 'Enterprise Grade', classes: 'bg-emerald-500/15 border-emerald-400 text-emerald-200' }
    if (score >= 93) return { label: 'High', classes: 'bg-green-500/15 border-green-400 text-green-200' }
    if (score >= 88) return { label: 'Moderate', classes: 'bg-amber-500/15 border-amber-400 text-amber-200' }
    return { label: 'Low', classes: 'bg-orange-500/15 border-orange-400 text-orange-200' }
}
