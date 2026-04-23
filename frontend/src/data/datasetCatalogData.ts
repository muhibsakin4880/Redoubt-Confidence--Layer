import type { RequestReviewState } from '../domain/accessContract'
import {
    DATASET_TRUST_PROFILE_LIBRARY,
    type DatasetTrustProfile
} from '../domain/datasetTrustProfile'
import {
    buildDatasetDetailFromProviderSubmission,
    buildDatasetDiscoverySummaryFromProviderSubmission,
    getProviderDatasetSubmissionByDatasetId,
    loadProviderDatasetSubmissions
} from '../domain/providerDatasetSubmission'

export type VerificationStatus = 'Attested' | 'Under Review'
export type AccessType = 'Restricted' | 'Approved access required'

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
    trustProfile: DatasetTrustProfile
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

export type DatasetDiscoverySummary = {
    id: number
    detailId?: string
    title: string
    timeRange: string
    description: string
    bestFor: string
    domain: string
    dataType: string
    geography: string
    confidenceScore: number
    providerTrustScore: number
    verificationStatus: VerificationStatus
    lastUpdated: string
    size: string
    coverage: string
    completeness: number
    freshness: number
    consistency: number
    accessType: AccessType
    sampleSchema: { field: string; type: string }[]
    confidenceSummary: string
    contributorTrust: string
    contributionHistory: string
    trustProfile: DatasetTrustProfile
}

export type DatasetQualitySchemaRisk = 'safe' | 'gray' | 'high'
export type DatasetQualitySchemaAccess = 'metadata' | 'aggregated' | 'restricted'
export type DatasetQualitySchemaResidency = 'global' | 'local'

export type DatasetQualitySchemaRow = {
    field: string
    type: string
    sampleValue: string
    risk: DatasetQualitySchemaRisk
    access: DatasetQualitySchemaAccess
    residency: DatasetQualitySchemaResidency
    nullPercent: number
}

export type DatasetQualityPreview = {
    sourceNetwork: string
    coverageWindow: string
    geographyLabel: string
    completenessNarrative: string
    consistencyNarrative: string
    validationNarrative: string
    escalationStatus: string
    schemaRows: DatasetQualitySchemaRow[]
}

export type DatasetCatalogRecord = Omit<DatasetDiscoverySummary, 'sampleSchema'> & {
    accessPackageId: string
    detail: Omit<DatasetDetail, 'trustProfile'>
    qualityPreview: DatasetQualityPreview
}

const previewField = (field: string, type: string, note?: string) => (note ? { field, type, note } : { field, type })

const schemaRow = (
    field: string,
    type: string,
    sampleValue: string,
    risk: DatasetQualitySchemaRisk,
    access: DatasetQualitySchemaAccess,
    residency: DatasetQualitySchemaResidency,
    nullPercent: number
): DatasetQualitySchemaRow => ({
    field,
    type,
    sampleValue,
    risk,
    access,
    residency,
    nullPercent
})

export const DATASET_CATALOG: DatasetCatalogRecord[] = [
    {
        id: 1,
        title: 'Global Climate Observations 2020-2024',
        timeRange: '2020-2024',
        description: 'Harmonized temperature, precipitation, wind, and atmospheric metrics from 5,000+ stations.',
        bestFor: 'Climate risk modeling, resilience scoring, and global baseline analysis.',
        domain: 'Climate',
        dataType: 'Time-series',
        geography: 'Global',
        confidenceScore: 96,
        providerTrustScore: 94,
        verificationStatus: 'Attested',
        lastUpdated: '2026-02-15',
        size: '2.4 TB',
        coverage: '1.2M records',
        completeness: 96,
        freshness: 94,
        consistency: 95,
        accessType: 'Approved access required',
        confidenceSummary: 'Stable ingest with anomaly gating; near-real-time freshness and cross-source reconciliation.',
        contributorTrust: 'Reviewed Participant',
        contributionHistory: '12 integrity checks',
        accessPackageId: 'platform-clean-room-standard',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.climateObservations,
        detail: {
            id: '1',
            title: 'Global Climate Observations 2020-2024',
            description:
                'Consolidated temperature, precipitation, wind, and atmospheric measurements from ground stations and satellite feeds with harmonized schemas for production-grade climate analysis.',
            category: 'Climate Science',
            size: '2.4 TB',
            recordCount: '1.2M records',
            lastUpdated: '2026-02-15',
            confidenceScore: 96,
            confidenceSummary: 'Stable ingest with anomaly gating, near-real-time freshness, and cross-source reconciliation keep this package in the highest confidence lane.',
            contributorTrust: 'Reviewed Participant',
            contributionHistory: '12 integrity checks',
            quality: {
                completeness: 96,
                freshnessScore: 94,
                freshnessNote: 'Hourly deltas land continuously, with a full cross-provider reconciliation pass every 24 hours.',
                consistency: 95,
                validationStatus: 'Automated QA passed; manual station reconciliation monthly'
            },
            accessNotes: [
                'Provide the intended climate or resilience workflow so Redoubt can scope workspace controls and review criteria.',
                'Access is delivered through a governed workspace with monitored query and export policies.',
                'Operational support responds within one business day for approved requests.'
            ],
            providerNotes: [
                'Provider identity is shielded behind the managed exchange, while uptime and integrity evidence are shown as reviewed signals.',
                'Rollback procedures and anomaly alerts are active across the ingest pipeline.',
                'Cross-source calibration reports are refreshed on a rolling monthly basis.'
            ],
            access: {
                status: 'REQUEST_APPROVED',
                allowedUsage: [
                    'Scenario modeling and forecast validation',
                    'Operational dashboards and climate-adjusted planning',
                    'Derived works with attribution and no raw redistribution'
                ],
                instructions: [
                    'Workspace-only access is enabled; direct raw export remains disabled by default.',
                    'API credentials are scoped to approved endpoints and logged per session.',
                    'Any attempt to join with sensitive local datasets is reviewed before approval.'
                ],
                expiration: 'Access review on 2026-08-31',
                usageLimits: 'API: 60k calls/day; Workspace compute: 160 GPU hours/month'
            },
            preview: {
                aiSummary: 'Coverage is stable across major regions, freshness remains inside SLA, and reconciliation controls reduce cross-source drift before delivery.',
                qualityNotes: [
                    'Mandatory weather fields remain above 95% completeness across the rolling 90-day window.',
                    'Freshness deviations are auto-flagged and held from buyer workspaces until corrected.',
                    'Cross-source normalization keeps unit and scale drift below operational thresholds.'
                ],
                riskFlags: [
                    'Seasonal variance still appears in a subset of coastal wind feeds.',
                    'Some alpine stations publish late during severe weather events.'
                ],
                confidenceBand: 'high',
                sampleSchema: [
                    previewField('station_id', 'string', 'Stable identifier across station groups'),
                    previewField('timestamp_utc', 'datetime', 'ISO 8601 UTC timestamp'),
                    previewField('temperature_c', 'float', 'Calibrated to provider reference curves'),
                    previewField('precip_mm', 'float'),
                    previewField('wind_speed_ms', 'float'),
                    previewField('source_network', 'string', 'Originating station or satellite network')
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
                    'Coastal wind variance requires post-processing in a small subset of grids',
                    'High-altitude microclimates remain sparse outside major station networks'
                ],
                suggestedUseCases: [
                    'Climate-adjusted demand forecasting',
                    'Resilience scoring and catastrophe modeling',
                    'Production dashboards with fresh environmental signals'
                ],
                structureQuality: 95,
                anomalyRisk: 6,
                recordCountRange: '1.1M - 1.3M records (rolling)'
            }
        },
        qualityPreview: {
            sourceNetwork: 'Ground stations, satellite weather feeds, and regional climate exchanges',
            coverageWindow: '2020-2024',
            geographyLabel: 'Global coverage',
            completenessNarrative: 'Required fields stay filled across station clusters, time slices, and forecast reconciliation passes.',
            consistencyNarrative: 'Schema and unit normalization remain aligned across providers before anything reaches buyer preview.',
            validationNarrative: 'Anomaly detection, duplicate suppression, and station-health scoring run on each ingest window.',
            escalationStatus: 'No escalation queues are open for the current delivery cycle.',
            schemaRows: [
                schemaRow('station_id', 'String', '["NOAA-1427","ECMWF-9921"]', 'safe', 'metadata', 'global', 0),
                schemaRow('timestamp_utc', 'Timestamp', '["2026-02-15T14:00:00Z"]', 'safe', 'metadata', 'global', 0),
                schemaRow('temperature_c', 'Float', '["18.4","20.1"]', 'safe', 'metadata', 'global', 0.4),
                schemaRow('precip_mm', 'Float', '["0.0","12.2"]', 'safe', 'metadata', 'global', 1.2),
                schemaRow('wind_speed_ms', 'Float', '["4.8","15.7"]', 'gray', 'aggregated', 'global', 2.1),
                schemaRow('station_lat_lon', 'GeoPoint', '["52.5200,13.4050"]', 'gray', 'aggregated', 'local', 1.7)
            ]
        }
    },
    {
        id: 2,
        title: 'Urban Mobility Sensor Streams',
        timeRange: '2023-2026 rolling',
        description: 'Speed, occupancy, and flow metrics from smart-city sensors across 50 metros.',
        bestFor: 'Network planning, congestion modeling, and city-scale mobility forecasting.',
        domain: 'Mobility',
        dataType: 'Streaming',
        geography: 'North America, EU, APAC',
        confidenceScore: 91,
        providerTrustScore: 87,
        verificationStatus: 'Attested',
        lastUpdated: '2026-02-14',
        size: '1.8 TB',
        coverage: '920K sensors',
        completeness: 92,
        freshness: 90,
        consistency: 89,
        accessType: 'Restricted',
        confidenceSummary: 'High availability with minor variance during peak hours; governed streaming channel.',
        contributorTrust: 'Established Participant',
        contributionHistory: '8 deliveries, zero disputes',
        accessPackageId: 'governed-streaming-restricted',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.mobilityTelemetry,
        detail: {
            id: '2',
            title: 'Urban Mobility Sensor Streams',
            description:
                'Continuously refreshed traffic speed, occupancy, and flow telemetry from municipal sensor grids, curbside counters, and transit operations feeds across major metropolitan corridors.',
            category: 'Mobility Analytics',
            size: '1.8 TB',
            recordCount: '920K active sensors',
            lastUpdated: '2026-02-14',
            confidenceScore: 91,
            confidenceSummary: 'Availability is strong across partner metros, though rush-hour spikes still create small pockets of delayed telemetry.',
            contributorTrust: 'Established Participant',
            contributionHistory: '8 deliveries, zero disputes',
            quality: {
                completeness: 92,
                freshnessScore: 90,
                freshnessNote: 'Most regions land inside a 15-minute window; a few partner networks batch hourly during overnight maintenance.',
                consistency: 89,
                validationStatus: 'Streaming QA active; regional sensor drift review every two weeks'
            },
            accessNotes: [
                'Requests should name target metros and whether curb, road, or transit telemetry is required.',
                'Access is limited to governed streaming sessions; raw coordinate exports are disabled.',
                'Location joins that could increase re-identification risk require additional review.'
            ],
            providerNotes: [
                'Municipal and transit partners are reviewed through managed agreements rather than direct buyer contact.',
                'Streaming incident notifications are shared through Redoubt during significant metro outages.',
                'Regional maintenance windows can temporarily shift freshness from real time to hourly.'
            ],
            access: {
                status: 'REVIEW_IN_PROGRESS',
                allowedUsage: [
                    'Traffic forecasting and network optimization',
                    'Transit and curb utilization analysis',
                    'Derived congestion signals without raw resale'
                ],
                instructions: [
                    'Clean-room access only; direct sensor-level exports are disabled.',
                    'Metro selection is provisioned after request approval and regional governance checks.',
                    'Query result thresholds prevent releasing tiny slices that expose sensitive movement patterns.'
                ],
                expiration: 'Review target on 2026-09-15',
                usageLimits: 'Streaming sessions: 4 concurrent metros; 30 days retained query history'
            },
            preview: {
                aiSummary: 'The stream is healthy for corridor-level and metro-level analysis, with the main caveat being modest freshness variance during partner maintenance windows.',
                qualityNotes: [
                    'Most metros publish complete occupancy and flow metrics through the last 30 days.',
                    'Rush-hour buffering causes short latency spikes in three partner regions.',
                    'Cross-metro field harmonization is stable, but curbside counter metadata remains partially normalized.'
                ],
                riskFlags: [
                    'A subset of transit-linked sensors still publishes hourly instead of near real time.',
                    'Fine-grained location joins remain restricted to protect movement privacy.'
                ],
                confidenceBand: 'medium',
                sampleSchema: [
                    previewField('sensor_id', 'string', 'Stable sensor or segment identifier'),
                    previewField('region', 'string', 'Metro or corridor grouping'),
                    previewField('timestamp_utc', 'datetime'),
                    previewField('avg_speed_kph', 'float'),
                    previewField('occupancy_ratio', 'float'),
                    previewField('flow_count', 'int')
                ],
                freshnessLabel: '15 minute typical lag; hourly in a small subset of metros',
                completenessLabel: '92% of core telemetry fields present',
                decision: 'production',
                strengths: [
                    'Broad metro coverage with stable availability',
                    'Governed streaming access for live operational analysis',
                    'Low dispute history across prior buyer evaluations'
                ],
                limitations: [
                    'Curbside metadata is still being normalized in a few cities',
                    'Fine-grained geolocation remains aggregation-only in preview and evaluation'
                ],
                suggestedUseCases: [
                    'Congestion forecasting',
                    'Transit operations planning',
                    'City-scale mobility network simulation'
                ],
                structureQuality: 91,
                anomalyRisk: 12,
                recordCountRange: '850K - 950K active sensors (rolling)'
            }
        },
        qualityPreview: {
            sourceNetwork: 'Municipal road sensors, transit operations feeds, and curbside counters',
            coverageWindow: '2023-2026 rolling',
            geographyLabel: 'North America, EU, APAC',
            completenessNarrative: 'Core speed, occupancy, and flow fields stay filled across most partner metros, with the biggest variance concentrated in curbside programs.',
            consistencyNarrative: 'Schema harmonization is stable at the corridor and region level, but curb asset taxonomies still require a small normalization layer.',
            validationNarrative: 'Latency, drift, and duplicate-event checks run continuously before the governed stream is exposed to buyers.',
            escalationStatus: 'One metro maintenance notice is active, but no blocking validation incidents are open.',
            schemaRows: [
                schemaRow('sensor_id', 'String', '["MTR-00451","SEG-9124"]', 'safe', 'metadata', 'global', 0),
                schemaRow('region', 'String', '["Chicago","Madrid"]', 'safe', 'metadata', 'global', 0),
                schemaRow('timestamp_utc', 'Timestamp', '["2026-02-14T09:15:00Z"]', 'safe', 'metadata', 'global', 0),
                schemaRow('avg_speed_kph', 'Float', '["31.2","48.9"]', 'safe', 'aggregated', 'global', 1.3),
                schemaRow('occupancy_ratio', 'Float', '["0.61","0.78"]', 'gray', 'aggregated', 'local', 2.4),
                schemaRow('segment_geohash', 'String', '["dr5regw"]', 'high', 'restricted', 'local', 0.8)
            ]
        }
    },
    {
        id: 3,
        title: 'Financial Market Tick Data',
        timeRange: '2024-2026 rolling',
        description: 'Microsecond-level trades and quotes from major equity venues.',
        bestFor: 'Market microstructure studies, execution analysis, and signal research.',
        domain: 'Finance',
        dataType: 'Tick / time-series',
        geography: 'US, EU',
        confidenceScore: 95,
        providerTrustScore: 98,
        verificationStatus: 'Attested',
        lastUpdated: '2026-02-12',
        size: '3.2 TB',
        coverage: '450M ticks',
        completeness: 97,
        freshness: 93,
        consistency: 94,
        accessType: 'Approved access required',
        confidenceSummary: 'Tight latency distribution; reconciled across venues; anomaly filters for outliers.',
        contributorTrust: 'High-Confidence Participant',
        contributionHistory: '18 reviewed pushes',
        accessPackageId: 'market-tick-vault',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.marketData,
        detail: {
            id: '3',
            title: 'Financial Market Tick Data',
            description:
                'Microsecond-level trades and quotes from major equity venues with venue normalization, sequencing repair, and outlier suppression tuned for execution analysis and market-structure research.',
            category: 'Market Data',
            size: '3.2 TB',
            recordCount: '450M ticks',
            lastUpdated: '2026-02-12',
            confidenceScore: 95,
            confidenceSummary: 'Venue reconciliation and timing repair keep the feed in a high-confidence state for execution-sensitive research.',
            contributorTrust: 'High-Confidence Participant',
            contributionHistory: '18 reviewed pushes',
            quality: {
                completeness: 97,
                freshnessScore: 93,
                freshnessNote: 'The consolidated feed lands inside a five-minute post-close repair window, with intraday deltas refreshed continuously.',
                consistency: 94,
                validationStatus: 'Cross-venue reconciliation passed; post-close sequencing audit daily'
            },
            accessNotes: [
                'Describe the target strategy or evaluation workflow so permitted use and replay depth can be scoped correctly.',
                'Market data is provisioned in a governed research environment with rate limits and watermarking.',
                'High-frequency export paths require explicit approval beyond the baseline package.'
            ],
            providerNotes: [
                'Venue and aggregator relationships are reviewed behind managed sourcing controls.',
                'Outlier suppression and sequencing repair logs are available in governed review sessions.',
                'Buyers receive operational notices if any venue falls behind consolidated SLAs.'
            ],
            access: {
                status: 'REQUEST_APPROVED',
                allowedUsage: [
                    'Execution analysis and slippage research',
                    'Signal backtesting in governed environments',
                    'Derived analytics with attribution and no raw redistribution'
                ],
                instructions: [
                    'Approved buyers receive workspace-based access with replay and aggregation guardrails.',
                    'Raw packet export is disabled; only governed query and replay tools are enabled.',
                    'Advanced depth or venue-specific scopes require a follow-up approval step.'
                ],
                expiration: 'Access review on 2026-10-01',
                usageLimits: 'Replay: 12 concurrent sessions; Query history retained for 45 days'
            },
            preview: {
                aiSummary: 'The dataset is suitable for latency-sensitive research, with strong completeness, stable sequencing repair, and only narrow gaps during exchange-specific outages.',
                qualityNotes: [
                    'Trade and quote fields remain above 97% completeness in the rolling sample.',
                    'Venue repair closes most sequence gaps within the post-close SLA.',
                    'Latency outliers are filtered before buyer access packages are published.'
                ],
                riskFlags: [
                    'Short exchange halts can create isolated burst gaps in event density.',
                    'Venue-specific order identifiers remain hidden outside governed replay.'
                ],
                confidenceBand: 'high',
                sampleSchema: [
                    previewField('symbol', 'string', 'Canonical ticker symbol'),
                    previewField('ts', 'datetime', 'Microsecond event timestamp'),
                    previewField('price', 'decimal'),
                    previewField('size', 'int'),
                    previewField('side', 'string'),
                    previewField('venue_code', 'string', 'Normalized venue label')
                ],
                freshnessLabel: 'Continuous intraday refresh with a 5 minute post-close repair window',
                completenessLabel: '97% trade and quote fields present',
                decision: 'production',
                strengths: [
                    'Tight latency distribution and stable venue repair',
                    'Strong provider trust and delivery history',
                    'Suitable for replay-heavy governed research'
                ],
                limitations: [
                    'Venue identifiers are partially abstracted in the free preview',
                    'High-depth replay scopes require additional approval'
                ],
                suggestedUseCases: [
                    'Execution quality benchmarking',
                    'Market microstructure analysis',
                    'Signal research inside governed replay workspaces'
                ],
                structureQuality: 96,
                anomalyRisk: 7,
                recordCountRange: '430M - 470M ticks (rolling)'
            }
        },
        qualityPreview: {
            sourceNetwork: 'Major equity venues and consolidated quote feeds',
            coverageWindow: '2024-2026 rolling',
            geographyLabel: 'US, EU',
            completenessNarrative: 'Trade and quote fields remain highly complete across the consolidated feed, with only short outage-related bursts dropping below target.',
            consistencyNarrative: 'Venue normalization, clock repair, and sequence stitching remain within research-grade thresholds.',
            validationNarrative: 'Outlier detection, sequence repair, and venue reconciliation run continuously with a daily post-close audit.',
            escalationStatus: 'No unresolved venue integrity incidents are open for the current delivery set.',
            schemaRows: [
                schemaRow('symbol', 'String', '["AAPL","SAP"]', 'safe', 'metadata', 'global', 0),
                schemaRow('ts', 'Timestamp', '["2026-02-12T14:31:02.000412Z"]', 'safe', 'metadata', 'global', 0),
                schemaRow('price', 'Decimal', '["182.44","143.18"]', 'safe', 'aggregated', 'global', 0.2),
                schemaRow('size', 'Integer', '["100","450"]', 'safe', 'aggregated', 'global', 0.2),
                schemaRow('venue_code', 'String', '["XNYS","XETR"]', 'gray', 'aggregated', 'local', 0),
                schemaRow('order_reference', 'String', '["9f82e3c1..."]', 'high', 'restricted', 'local', 0.1)
            ]
        }
    },
    {
        id: 4,
        title: 'Clinical Outcomes (De-identified)',
        timeRange: '2018-2025',
        description: 'Aggregated, de-identified outcomes across multiple clinical trials.',
        bestFor: 'Outcomes research, trial benchmarking, and privacy-preserving cohort analysis.',
        domain: 'Healthcare',
        dataType: 'Tabular',
        geography: 'Global',
        confidenceScore: 92,
        providerTrustScore: 91,
        verificationStatus: 'Under Review',
        lastUpdated: '2026-02-10',
        size: '780 GB',
        coverage: '3.1M patient encounters',
        completeness: 90,
        freshness: 88,
        consistency: 91,
        accessType: 'Restricted',
        confidenceSummary: 'De-identification and k-anonymity applied; under review for additional privacy controls.',
        contributorTrust: 'Reviewed Participant',
        contributionHistory: '5 secure submissions',
        accessPackageId: 'clinical-safe-haven',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.clinicalResearch,
        detail: {
            id: '4',
            title: 'Clinical Outcomes (De-identified)',
            description:
                'Aggregated outcomes, treatment-arm performance, and follow-up windows across multiple clinical programs with de-identification, k-anonymity controls, and governance checkpoints tuned for regulated research.',
            category: 'Clinical Research',
            size: '780 GB',
            recordCount: '3.1M patient encounters',
            lastUpdated: '2026-02-10',
            confidenceScore: 92,
            confidenceSummary: 'The package is analytically strong, but additional privacy controls remain in active review before full approval.',
            contributorTrust: 'Reviewed Participant',
            contributionHistory: '5 secure submissions',
            quality: {
                completeness: 90,
                freshnessScore: 88,
                freshnessNote: 'Sponsor refreshes arrive monthly, with manual privacy review before the newest cohorts are released.',
                consistency: 91,
                validationStatus: 'Clinical QA passed; privacy review enhancements in progress'
            },
            accessNotes: [
                'Requests must identify the trial, therapeutic area, or outcome questions being evaluated.',
                'Only approved analysts inside a governed safe-haven workspace can access row-level outputs.',
                'All exports remain aggregated until the current privacy review closes.'
            ],
            providerNotes: [
                'Clinical contributors are reviewed through sponsor and institution review managed by Redoubt.',
                'The latest refresh is analytically complete but still carries additional privacy review checkpoints.',
                'Regulated workflows receive audit evidence and residency controls inside the safe-haven environment.'
            ],
            access: {
                status: 'REVIEW_IN_PROGRESS',
                allowedUsage: [
                    'Cohort and endpoint benchmarking',
                    'Trial performance and outcome analysis',
                    'Derived clinical analytics without row-level redistribution'
                ],
                instructions: [
                    'Access is limited to a governed safe-haven workspace with strict output review.',
                    'Row-level exports are disabled while the current privacy enhancement review remains open.',
                    'Therapeutic-area scoping is required before access can be provisioned.'
                ],
                expiration: 'Review target on 2026-07-20',
                usageLimits: 'Safe-haven: 20 approved analysts; Aggregate export review on every request'
            },
            preview: {
                aiSummary: 'Clinical outcomes and treatment-arm metrics are analytically useful, but output controls remain stricter while privacy enhancements are under review.',
                qualityNotes: [
                    'Encounter and follow-up coverage remain strong across most programs in the latest release.',
                    'Latest cohorts are held until manual privacy checks complete.',
                    'Outcome definitions are standardized, though sponsor-specific metadata remains partially normalized.'
                ],
                riskFlags: [
                    'Additional privacy review is still open for small-cohort release controls.',
                    'Certain cohort dimensions remain aggregation-only until output policies are finalized.'
                ],
                confidenceBand: 'medium',
                sampleSchema: [
                    previewField('trial_id', 'string', 'Stable study identifier'),
                    previewField('arm', 'string'),
                    previewField('outcome_flag', 'boolean'),
                    previewField('time_to_event_days', 'int'),
                    previewField('cohort_band', 'string'),
                    previewField('region_group', 'string')
                ],
                freshnessLabel: 'Monthly refresh with manual privacy release',
                completenessLabel: '90% of regulated outcome fields present',
                decision: 'experimental',
                strengths: [
                    'Strong cohort and outcome coverage for regulated analysis',
                    'Governed safe-haven delivery with audit controls',
                    'De-identification already applied across the release set'
                ],
                limitations: [
                    'Additional privacy controls are still being finalized',
                    'Some cohort slices remain aggregation-only until review closes'
                ],
                suggestedUseCases: [
                    'Clinical outcomes benchmarking',
                    'Trial performance review',
                    'Privacy-preserving therapeutic analysis'
                ],
                structureQuality: 90,
                anomalyRisk: 16,
                recordCountRange: '2.9M - 3.2M encounters'
            }
        },
        qualityPreview: {
            sourceNetwork: 'Clinical trial sponsors, research institutions, and governed outcomes registries',
            coverageWindow: '2018-2025',
            geographyLabel: 'Global',
            completenessNarrative: 'Outcome and follow-up fields are broadly complete, but small-cohort suppression can reduce visible density in preview slices.',
            consistencyNarrative: 'Study and endpoint definitions are mostly standardized, with a small number of sponsor-specific cohort descriptors still being normalized.',
            validationNarrative: 'Clinical QA, privacy suppression checks, and output-risk scoring run before governed preview updates are released.',
            escalationStatus: 'Privacy enhancement review remains open and is currently the only blocking governance item.',
            schemaRows: [
                schemaRow('trial_id', 'String', '["TR-1102","TR-8841"]', 'safe', 'metadata', 'global', 0),
                schemaRow('arm', 'String', '["control","dose_b"]', 'safe', 'metadata', 'global', 0.4),
                schemaRow('outcome_flag', 'Boolean', '["true","false"]', 'safe', 'aggregated', 'global', 0.2),
                schemaRow('time_to_event_days', 'Integer', '["42","188"]', 'gray', 'aggregated', 'local', 3.7),
                schemaRow('site_code', 'String', '["EU-14","US-08"]', 'high', 'restricted', 'local', 1.1),
                schemaRow('cohort_band', 'String', '["adult_stage_2"]', 'gray', 'aggregated', 'local', 2.5)
            ]
        }
    },
    {
        id: 5,
        title: 'Satellite Land Use Dataset 2023',
        timeRange: '2022-2023',
        description: 'Satellite imagery and land use classification data from Landsat and Sentinel-2 missions.',
        bestFor: 'Land-use classification, geospatial monitoring, and climate adaptation mapping.',
        domain: 'Climate',
        dataType: 'Geospatial',
        geography: 'Global',
        confidenceScore: 88,
        providerTrustScore: 82,
        verificationStatus: 'Attested',
        lastUpdated: '2026-01-20',
        size: '450 GB',
        coverage: '2.8M tiles',
        completeness: 88,
        freshness: 85,
        consistency: 87,
        accessType: 'Approved access required',
        confidenceSummary: 'Multi-spectral analysis with ground truthing; some regions have incomplete coverage.',
        contributorTrust: 'Established Participant',
        contributionHistory: '6 reviewed submissions',
        accessPackageId: 'geospatial-evaluation-room',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.geospatialImagery,
        detail: {
            id: '5',
            title: 'Satellite Land Use Dataset 2023',
            description:
                'Satellite imagery tiles and land-use classifications derived from Landsat and Sentinel-2 programs, packaged for geospatial monitoring, adaptation planning, and model benchmarking with governed evaluation controls.',
            category: 'Geospatial Climate',
            size: '450 GB',
            recordCount: '2.8M tiles',
            lastUpdated: '2026-01-20',
            confidenceScore: 88,
            confidenceSummary: 'Classification quality is solid across core regions, but cloud cover and sparse ground truthing create a few lower-confidence pockets.',
            contributorTrust: 'Established Participant',
            contributionHistory: '6 reviewed submissions',
            quality: {
                completeness: 88,
                freshnessScore: 85,
                freshnessNote: 'Quarterly classification refreshes land after imagery QA and cloud-mask review.',
                consistency: 87,
                validationStatus: 'Imagery QA passed; regional ground-truth reconciliation quarterly'
            },
            accessNotes: [
                'Specify whether the focus is classification benchmarking, mapping, or model training support.',
                'Preview includes metadata and representative tiles only; raw imagery is governed inside evaluation workspaces.',
                'High-resolution export requests require a separate approval step.'
            ],
            providerNotes: [
                'Imagery and derived labels are reviewed through managed contributor review.',
                'Regional gaps are flagged when cloud contamination or missing ground truth reduces confidence.',
                'Class taxonomy updates are versioned and shared inside governed workspaces.'
            ],
            access: {
                status: 'REQUEST_APPROVED',
                allowedUsage: [
                    'Land-use classification benchmarking',
                    'Climate adaptation mapping',
                    'Derived geospatial products with attribution and no raw redistribution'
                ],
                instructions: [
                    'Governed workspace access includes representative tile preview and classification analytics.',
                    'Raw imagery export is disabled by default; derivative outputs require review.',
                    'High-resolution tile extraction must be requested separately.'
                ],
                expiration: 'Access review on 2026-09-30',
                usageLimits: 'Workspace storage: 2 TB; Export approval required for any raster extract'
            },
            preview: {
                aiSummary: 'Classification quality is strong enough for evaluation and benchmark work, but buyers should account for cloud contamination and uneven ground-truth density in a few regions.',
                qualityNotes: [
                    'Major agricultural and urban classes remain stable across the release set.',
                    'Cloud masks and quality flags remove the noisiest tiles from preview.',
                    'Ground-truth density varies by region and affects the lowest-confidence classes.'
                ],
                riskFlags: [
                    'Cloud contamination still lowers confidence in some tropical regions.',
                    'Rare land-use classes have thinner ground-truth coverage outside benchmark geographies.'
                ],
                confidenceBand: 'medium',
                sampleSchema: [
                    previewField('tile_id', 'string', 'Stable raster tile identifier'),
                    previewField('acquisition_date', 'date'),
                    previewField('land_use_class', 'string'),
                    previewField('ndvi', 'float'),
                    previewField('latitude', 'float'),
                    previewField('longitude', 'float')
                ],
                freshnessLabel: 'Quarterly refresh after imagery QA',
                completenessLabel: '88% of classification and metadata fields present',
                decision: 'experimental',
                strengths: [
                    'Strong global coverage for major land-use classes',
                    'Governed evaluation path for model and mapping workflows',
                    'Representative tile preview available before paid evaluation'
                ],
                limitations: [
                    'Cloud contamination affects a subset of regions',
                    'Rare classes have uneven ground-truth density'
                ],
                suggestedUseCases: [
                    'Land-use classification benchmarking',
                    'Climate adaptation mapping',
                    'Geospatial monitoring model evaluation'
                ],
                structureQuality: 89,
                anomalyRisk: 18,
                recordCountRange: '2.6M - 2.9M tiles'
            }
        },
        qualityPreview: {
            sourceNetwork: 'Landsat, Sentinel-2, and curated ground-truth programs',
            coverageWindow: '2022-2023',
            geographyLabel: 'Global',
            completenessNarrative: 'Core classification and imagery metadata are broadly available, though cloud masking and sparse ground truth reduce usable density in a few regions.',
            consistencyNarrative: 'Class taxonomies remain stable across the release, but a handful of regional labels still require version-aware interpretation.',
            validationNarrative: 'Cloud-mask QA, tile integrity checks, and class-distribution monitoring run before new imagery is released.',
            escalationStatus: 'No blocking ingestion incidents are active; regional confidence notes remain informational.',
            schemaRows: [
                schemaRow('tile_id', 'String', '["S2-31TCJ-20231014"]', 'safe', 'metadata', 'global', 0),
                schemaRow('acquisition_date', 'Date', '["2023-10-14"]', 'safe', 'metadata', 'global', 0),
                schemaRow('land_use_class', 'String', '["urban_low_density"]', 'safe', 'aggregated', 'global', 1.4),
                schemaRow('ndvi', 'Float', '["0.62","0.14"]', 'safe', 'aggregated', 'global', 2.2),
                schemaRow('latitude', 'Float', '["40.7306"]', 'gray', 'aggregated', 'local', 0),
                schemaRow('longitude', 'Float', '["-73.9352"]', 'gray', 'aggregated', 'local', 0)
            ]
        }
    },
    {
        id: 6,
        title: 'Consumer Behavior Analytics Q4',
        timeRange: 'Q4 2025',
        description: 'Consumer spending patterns and product preferences across demographic segments.',
        bestFor: 'Retail demand planning, audience segmentation, and market basket analysis.',
        domain: 'Finance',
        dataType: 'Tabular',
        geography: 'North America',
        confidenceScore: 79,
        providerTrustScore: 76,
        verificationStatus: 'Under Review',
        lastUpdated: '2026-01-25',
        size: '320 GB',
        coverage: '45M households',
        completeness: 82,
        freshness: 78,
        consistency: 80,
        accessType: 'Restricted',
        confidenceSummary: 'Aggregated from retail loyalty cards; under review for anonymization compliance.',
        contributorTrust: 'Reviewed Participant',
        contributionHistory: '4 secure submissions',
        accessPackageId: 'retail-insights-clean-room',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.retailPanel,
        detail: {
            id: '6',
            title: 'Consumer Behavior Analytics Q4',
            description:
                'Quarterly spending, category preference, and demographic segment analytics aggregated from retailer loyalty programs and panel data under active anonymization and governance review.',
            category: 'Consumer Insights',
            size: '320 GB',
            recordCount: '45M households',
            lastUpdated: '2026-01-25',
            confidenceScore: 79,
            confidenceSummary: 'The package is useful for directional demand and basket analysis, but anonymization review and segment sparsity keep it below the highest confidence bands.',
            contributorTrust: 'Reviewed Participant',
            contributionHistory: '4 secure submissions',
            quality: {
                completeness: 82,
                freshnessScore: 78,
                freshnessNote: 'Quarterly refresh cadence remains intact, but the latest release is still moving through anonymization checks.',
                consistency: 80,
                validationStatus: 'Aggregation QA passed; anonymization compliance review in progress'
            },
            accessNotes: [
                'Requests should describe the retail or demand-planning use case and target product categories.',
                'Preview is aggregation-only while the current anonymization review remains open.',
                'Fine-grained segment cuts require extra governance review before approval.'
            ],
            providerNotes: [
                'Retail contributor relationships are reviewed through the managed exchange.',
                'Anonymization controls are being tightened before broader evaluation approval.',
                'Sparse demographic slices may be suppressed or merged in governed delivery.'
            ],
            access: {
                status: 'REVIEW_IN_PROGRESS',
                allowedUsage: [
                    'Demand planning and category trend analysis',
                    'Market basket and segmentation research',
                    'Derived planning outputs with no raw or household-level redistribution'
                ],
                instructions: [
                    'Access remains limited to aggregated clean-room analysis.',
                    'Household-level extracts are unavailable while anonymization review is open.',
                    'Demographic slices below threshold are automatically suppressed.'
                ],
                expiration: 'Review target on 2026-06-30',
                usageLimits: 'Aggregation-only outputs; no household-level export path'
            },
            preview: {
                aiSummary: 'This package is useful for directional retail analysis, but the current release remains governed more tightly while anonymization and sparse-segment controls are finalized.',
                qualityNotes: [
                    'Category-level spend coverage is stable across major retailers in the panel.',
                    'Sparse demographic bands are suppressed or merged to reduce re-identification risk.',
                    'Freshness trails the faster operational datasets because releases are quarterly.'
                ],
                riskFlags: [
                    'Anonymization compliance review is still open for a subset of segment combinations.',
                    'Low-density demographic slices are not available outside aggregate preview.'
                ],
                confidenceBand: 'low',
                sampleSchema: [
                    previewField('household_id', 'string', 'Hashed identifier in governed workflows only'),
                    previewField('category', 'string'),
                    previewField('spend_amount', 'decimal'),
                    previewField('demographic_segment', 'string'),
                    previewField('purchase_week', 'date'),
                    previewField('channel_group', 'string')
                ],
                freshnessLabel: 'Quarterly refresh; latest release still in anonymization review',
                completenessLabel: '82% of target retail fields present',
                decision: 'experimental',
                strengths: [
                    'Useful directional demand and basket signals',
                    'Broad retailer panel coverage',
                    'Clear governance posture for segment-sensitive data'
                ],
                limitations: [
                    'Anonymization review is still active',
                    'Sparse demographic slices are heavily suppressed'
                ],
                suggestedUseCases: [
                    'Retail demand planning',
                    'Category performance analysis',
                    'Market basket research with governed aggregates'
                ],
                structureQuality: 81,
                anomalyRisk: 27,
                recordCountRange: '42M - 45M households'
            }
        },
        qualityPreview: {
            sourceNetwork: 'Retail loyalty panels, purchase telemetry, and governed market-insight providers',
            coverageWindow: 'Q4 2025',
            geographyLabel: 'North America',
            completenessNarrative: 'Core spend and category fields are available across the panel, but demographic enrichment remains intentionally suppressed in low-density segments.',
            consistencyNarrative: 'Retail category mapping is mostly stable, though retailer-specific taxonomies still need a normalization layer in a small subset of categories.',
            validationNarrative: 'Aggregation QA, sparsity checks, and anonymization scoring run before any preview refresh is exposed.',
            escalationStatus: 'Anonymization compliance review remains open and blocks household-level access.',
            schemaRows: [
                schemaRow('category', 'String', '["snacks","pet_care"]', 'safe', 'metadata', 'global', 0.8),
                schemaRow('spend_amount', 'Decimal', '["24.81","112.40"]', 'safe', 'aggregated', 'global', 1.1),
                schemaRow('purchase_week', 'Date', '["2025-11-17"]', 'safe', 'metadata', 'global', 0),
                schemaRow('channel_group', 'String', '["club","ecommerce"]', 'gray', 'aggregated', 'global', 1.5),
                schemaRow('demographic_segment', 'String', '["suburban_family"]', 'gray', 'aggregated', 'local', 4.8),
                schemaRow('household_id', 'String', '["hh_9c31d0..."]', 'high', 'restricted', 'local', 0)
            ]
        }
    },
    {
        id: 7,
        title: 'Genomics Research Dataset v2',
        timeRange: '2019-2025',
        description: 'Gene expression data and variant calling from research institutions and biobanks.',
        bestFor: 'Biomarker discovery, translational research, and reproducibility-sensitive studies.',
        domain: 'Healthcare',
        dataType: 'Genomic',
        geography: 'Global',
        confidenceScore: 94,
        providerTrustScore: 96,
        verificationStatus: 'Attested',
        lastUpdated: '2026-02-01',
        size: '1.5 TB',
        coverage: '125K samples',
        completeness: 94,
        freshness: 92,
        consistency: 95,
        accessType: 'Approved access required',
        confidenceSummary: 'Peer-reviewed literature and reproducibility references are cited in the demo packet; ethics coverage still requires reviewer confirmation.',
        contributorTrust: 'High-Confidence Participant',
        contributionHistory: '15 reviewed pushes',
        accessPackageId: 'genomics-controlled-enclave',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.genomicsResearch,
        detail: {
            id: '7',
            title: 'Genomics Research Dataset v2',
            description:
                'Gene expression measurements, variant calls, and cohort metadata from reviewed institutions and biobanks, packaged for reproducibility-sensitive translational and biomarker research inside tightly governed environments.',
            category: 'Genomics Research',
            size: '1.5 TB',
            recordCount: '125K samples',
            lastUpdated: '2026-02-01',
            confidenceScore: 94,
            confidenceSummary: 'Reproducibility evidence and ethics review references support this package, though live approvals still need reviewer confirmation.',
            contributorTrust: 'High-Confidence Participant',
            contributionHistory: '15 reviewed pushes',
            quality: {
                completeness: 94,
                freshnessScore: 92,
                freshnessNote: 'Institutional releases are versioned quarterly, with validation and ethics attestation before publication.',
                consistency: 95,
                validationStatus: 'Reproducibility checks passed; ethics attestations current'
            },
            accessNotes: [
                'Describe the biomarker or translational workflow and whether cohort-level or variant-level analysis is required.',
                'Access is provisioned inside a controlled enclave with no raw export path.',
                'Secondary data joins must be pre-approved before the enclave is provisioned.'
            ],
            providerNotes: [
                'Biobank and institution evidence is validated through Redoubt rather than direct buyer contact.',
                'Ethics approvals and reproducibility artifacts are maintained alongside each release.',
                'Rare variant workflows receive additional oversight inside the enclave.'
            ],
            access: {
                status: 'REQUEST_APPROVED',
                allowedUsage: [
                    'Biomarker discovery and validation',
                    'Translational and reproducibility research',
                    'Derived genomic analytics with no raw redistribution'
                ],
                instructions: [
                    'Controlled-enclave access only; raw export and copy-out paths are disabled.',
                    'Variant-level exploration is logged and thresholded inside the enclave.',
                    'External cohort joins require pre-approval before activation.'
                ],
                expiration: 'Access review on 2026-11-15',
                usageLimits: 'Enclave seats: 12 analysts; Derived result export via governance review only'
            },
            preview: {
                aiSummary: 'This dataset is well suited for governed biomarker and translational research, with strong reproducibility evidence and clear limits around rare-variant handling.',
                qualityNotes: [
                    'Expression and cohort coverage remain strong across the published releases.',
                    'Variant normalization and reproducibility checks are versioned with each refresh.',
                    'Rare variant and cohort joins remain the highest-governance workflows.'
                ],
                riskFlags: [
                    'Rare-variant slices require tighter governance and may not be previewed directly.',
                    'Some cohort dimensions stay aggregated until enclave access begins.'
                ],
                confidenceBand: 'high',
                sampleSchema: [
                    previewField('sample_id', 'string', 'Governed sample identifier'),
                    previewField('gene_id', 'string'),
                    previewField('expression_value', 'float'),
                    previewField('variant_call', 'string'),
                    previewField('patient_cohort', 'string'),
                    previewField('tissue_group', 'string')
                ],
                freshnessLabel: 'Quarterly validated release with current ethics attestation',
                completenessLabel: '94% of target genomic fields present',
                decision: 'production',
                strengths: [
                    'Strong reproducibility and ethics evidence',
                    'High provider trust and delivery history',
                    'Controlled enclave supports governed advanced analysis'
                ],
                limitations: [
                    'Rare-variant exploration is tightly governed',
                    'Some cohort dimensions remain aggregate-only until enclave activation'
                ],
                suggestedUseCases: [
                    'Biomarker discovery',
                    'Translational research',
                    'Reproducibility-sensitive genomic analysis'
                ],
                structureQuality: 96,
                anomalyRisk: 9,
                recordCountRange: '120K - 128K samples'
            }
        },
        qualityPreview: {
            sourceNetwork: 'Reviewed biobanks, research institutions, and governed genomics programs',
            coverageWindow: '2019-2025',
            geographyLabel: 'Global',
            completenessNarrative: 'Expression, cohort, and metadata coverage remain strong across published releases, with governance limiting the sparsest rare-variant dimensions.',
            consistencyNarrative: 'Gene and variant normalization is stable across institutions, supported by reproducibility checks before each release.',
            validationNarrative: 'Ethics attestation, reproducibility validation, and rare-variant risk scoring run before governed preview is refreshed.',
            escalationStatus: 'No outstanding ethics or reproducibility incidents are open for the current release.',
            schemaRows: [
                schemaRow('sample_id', 'String', '["GS-18442","GS-44710"]', 'safe', 'metadata', 'global', 0),
                schemaRow('gene_id', 'String', '["BRCA1","TP53"]', 'safe', 'metadata', 'global', 0),
                schemaRow('expression_value', 'Float', '["8.14","2.03"]', 'safe', 'aggregated', 'global', 0.5),
                schemaRow('patient_cohort', 'String', '["immune_responder"]', 'gray', 'aggregated', 'local', 1.9),
                schemaRow('tissue_group', 'String', '["lung","blood"]', 'gray', 'aggregated', 'local', 0.8),
                schemaRow('variant_call', 'String', '["c.68_69delAG"]', 'high', 'restricted', 'local', 0.3)
            ]
        }
    },
    {
        id: 8,
        title: 'Smart Grid Energy Patterns',
        timeRange: '2024-2026 rolling',
        description: 'Energy consumption patterns from smart meters and grid sensors across utilities.',
        bestFor: 'Grid reliability analysis, utility forecasting, and energy optimization models.',
        domain: 'Energy',
        dataType: 'Time-series',
        geography: 'US, EU',
        confidenceScore: 91,
        providerTrustScore: 89,
        verificationStatus: 'Attested',
        lastUpdated: '2026-02-13',
        size: '890 GB',
        coverage: '4.2M meters',
        completeness: 91,
        freshness: 88,
        consistency: 90,
        accessType: 'Approved access required',
        confidenceSummary: 'Real-time grid monitoring with anomaly detection; some residential data anonymized.',
        contributorTrust: 'Reviewed Participant',
        contributionHistory: '10 reviewed submissions',
        accessPackageId: 'utility-grid-governed-room',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.utilityTelemetry,
        detail: {
            id: '8',
            title: 'Smart Grid Energy Patterns',
            description:
                'Time-series energy consumption and grid telemetry from smart meters and utility sensors, packaged for reliability analysis, forecasting, and controlled optimization research inside governed workspaces.',
            category: 'Energy Analytics',
            size: '890 GB',
            recordCount: '4.2M meters',
            lastUpdated: '2026-02-13',
            confidenceScore: 91,
            confidenceSummary: 'The package is reliable for utility forecasting and optimization, with anonymization and localized outage handling already built into delivery.',
            contributorTrust: 'Reviewed Participant',
            contributionHistory: '10 reviewed submissions',
            quality: {
                completeness: 91,
                freshnessScore: 88,
                freshnessNote: 'Grid telemetry lands near real time, while residential anonymization and outage reconciliation can add brief delays.',
                consistency: 90,
                validationStatus: 'Meter QA passed; outage reconciliation and anonymization active'
            },
            accessNotes: [
                'Identify whether the target workflow is reliability modeling, demand forecasting, or optimization research.',
                'Access is governed and anonymized; direct household-level interpretation is not exposed.',
                'Region-specific utility scopes are provisioned after approval.'
            ],
            providerNotes: [
                'Utility relationships are managed through Redoubt and shown through delivery evidence reviewed in the demo flow.',
                'Residential identifiers are masked before governed delivery.',
                'Localized outage events may reduce freshness briefly while reconciliation completes.'
            ],
            access: {
                status: 'REQUEST_APPROVED',
                allowedUsage: [
                    'Grid reliability and load forecasting',
                    'Utility optimization and anomaly research',
                    'Derived operational analytics with attribution and no raw redistribution'
                ],
                instructions: [
                    'Governed workspace access is enabled with anonymized residential telemetry.',
                    'Region-specific scopes are configured after request approval.',
                    'Direct household export or re-identification workflows are prohibited.'
                ],
                expiration: 'Access review on 2026-10-10',
                usageLimits: 'Workspace compute: 100 GPU hours/month; 6 concurrent utility scopes'
            },
            preview: {
                aiSummary: 'Smart-grid telemetry is ready for governed forecasting and reliability research, with the main caveat being slightly slower release in windows where outage reconciliation is still running.',
                qualityNotes: [
                    'Consumption and voltage coverage remain strong across utility partners.',
                    'Residential identifiers are masked before governed preview is refreshed.',
                    'Outage reconciliation can briefly delay a subset of regional updates.'
                ],
                riskFlags: [
                    'Localized outage events can slow the newest utility refreshes.',
                    'Some regional meter groupings remain aggregate-only outside governed workspaces.'
                ],
                confidenceBand: 'medium',
                sampleSchema: [
                    previewField('meter_id', 'string', 'Anonymized meter identifier'),
                    previewField('timestamp_utc', 'datetime'),
                    previewField('consumption_kwh', 'float'),
                    previewField('voltage', 'float'),
                    previewField('frequency', 'float'),
                    previewField('utility_region', 'string')
                ],
                freshnessLabel: 'Near real time; slower during outage reconciliation',
                completenessLabel: '91% of grid telemetry fields present',
                decision: 'production',
                strengths: [
                    'Strong utility coverage for governed forecasting workflows',
                    'Residential anonymization built into delivery',
                    'Useful for reliability and optimization research'
                ],
                limitations: [
                    'Localized outages can delay the newest refreshes',
                    'Fine-grained regional slices remain more restricted than aggregate preview'
                ],
                suggestedUseCases: [
                    'Load forecasting',
                    'Grid reliability analysis',
                    'Utility optimization modeling'
                ],
                structureQuality: 92,
                anomalyRisk: 11,
                recordCountRange: '4.0M - 4.3M meters'
            }
        },
        qualityPreview: {
            sourceNetwork: 'Utility smart meters, grid sensors, and governed energy telemetry feeds',
            coverageWindow: '2024-2026 rolling',
            geographyLabel: 'US, EU',
            completenessNarrative: 'Core consumption and grid telemetry fields remain stable, while outage reconciliation can briefly reduce density in the newest windows.',
            consistencyNarrative: 'Meter and utility schemas are normalized before delivery, with a small amount of region-specific label cleanup still happening during refresh.',
            validationNarrative: 'Telemetry QA, outage reconciliation, and anonymization checks run before buyer preview is updated.',
            escalationStatus: 'No blocking utility incidents are active; one regional refresh is in monitored reconciliation.',
            schemaRows: [
                schemaRow('meter_id', 'String', '["mtr_1a992d","mtr_771bc8"]', 'safe', 'metadata', 'global', 0),
                schemaRow('timestamp_utc', 'Timestamp', '["2026-02-13T08:45:00Z"]', 'safe', 'metadata', 'global', 0),
                schemaRow('consumption_kwh', 'Float', '["2.44","8.91"]', 'safe', 'aggregated', 'global', 1.1),
                schemaRow('voltage', 'Float', '["118.4","231.1"]', 'safe', 'aggregated', 'global', 1.7),
                schemaRow('utility_region', 'String', '["midwest_iso","iberia"]', 'gray', 'aggregated', 'local', 0.5),
                schemaRow('service_point_geohash', 'String', '["dp3wjq"]', 'high', 'restricted', 'local', 0.2)
            ]
        }
    },
]

export const DATASET_DISCOVERY_SUMMARIES: DatasetDiscoverySummary[] = DATASET_CATALOG.map(({ detail, qualityPreview, accessPackageId, ...summary }) => ({
    ...summary,
    sampleSchema: detail.preview.sampleSchema.map(({ field, type }) => ({ field, type }))
}))

export const DATASET_DETAILS: Record<string, DatasetDetail> = Object.fromEntries(
    DATASET_CATALOG.map(record => [record.detail.id, { ...record.detail, trustProfile: record.trustProfile }])
) as Record<string, DatasetDetail>

export const DATASET_QUALITY_PREVIEW_BY_ID: Record<string, DatasetQualityPreview> = Object.fromEntries(
    DATASET_CATALOG.map(record => [record.detail.id, record.qualityPreview])
) as Record<string, DatasetQualityPreview>

export const DATASET_ACCESS_PACKAGE_IDS_BY_DATASET_ID: Record<string, string> = Object.fromEntries(
    DATASET_CATALOG.map(record => [record.detail.id, record.accessPackageId])
) as Record<string, string>

export const getDatasetCatalogRecordById = (id?: string | number) => {
    if (id === undefined || id === null) return null
    const normalizedId = String(id)
    return DATASET_CATALOG.find(record => String(record.id) === normalizedId) ?? null
}

export const getDatasetDetailById = (id?: string | number): DatasetDetail | null => {
    if (id === undefined || id === null) return null
    const providerSubmission = getProviderDatasetSubmissionByDatasetId(id)
    return DATASET_DETAILS[String(id)] ?? (
        providerSubmission ? buildDatasetDetailFromProviderSubmission(providerSubmission) : null
    )
}

export const getDatasetQualityPreviewById = (id?: string | number) => getDatasetCatalogRecordById(id)?.qualityPreview ?? null

export const getAllDatasetDetails = (): DatasetDetail[] => [
    ...Object.values(DATASET_DETAILS),
    ...loadProviderDatasetSubmissions().map(buildDatasetDetailFromProviderSubmission)
]

export const loadDatasetDiscoverySummaries = (): DatasetDiscoverySummary[] => [
    ...DATASET_DISCOVERY_SUMMARIES,
    ...loadProviderDatasetSubmissions().map(buildDatasetDiscoverySummaryFromProviderSubmission)
]
