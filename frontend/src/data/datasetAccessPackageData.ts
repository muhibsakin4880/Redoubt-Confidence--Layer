import { DATASET_ACCESS_PACKAGE_IDS_BY_DATASET_ID } from './datasetCatalogData'

export type AccessPackageFacet = {
    label: string
    buyerSummary?: string
    providerSummary?: string
}

export type DatasetAccessPackage = {
    id: string
    accessMethod: AccessPackageFacet
    deliveryDetail: AccessPackageFacet
    fieldAccess: AccessPackageFacet
    usageRights: AccessPackageFacet
    term: AccessPackageFacet
    geography: AccessPackageFacet
    exclusivity: AccessPackageFacet
    security: {
        encryption: string
        masking: string
        watermarking: string
        revocation: string
    }
    advancedRights: {
        auditLogging: string
        attribution: string
        redistribution: string
        volumePricing: string
    }
}

const ACCESS_PACKAGES: Record<string, DatasetAccessPackage> = {
    'platform-clean-room-standard': {
        id: 'platform-clean-room-standard',
        accessMethod: {
            label: 'Platform Only',
            buyerSummary: 'Governed workspace access only for approved buyers.',
            providerSummary: 'Approved buyers are confined to a governed Redoubt workspace.'
        },
        deliveryDetail: {
            label: 'Secure clean room',
            buyerSummary: 'Delivery is configured as a secure clean-room session with no open export path.',
            providerSummary: 'Delivery remains limited to secure clean-room sessions.'
        },
        fieldAccess: { label: 'Analytics pack' },
        usageRights: { label: 'Research use' },
        term: { label: '12 months' },
        geography: { label: 'Dual region' },
        exclusivity: { label: 'Non-exclusive' },
        security: {
            encryption: 'AES-256 at rest + TLS 1.3 in transit',
            masking: 'Automatic PII masking',
            watermarking: 'Invisible watermarking enabled on approved extracts',
            revocation: 'Provider can revoke access at any time'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Required',
            redistribution: 'Not Allowed',
            volumePricing: 'Disabled'
        }
    },
    'governed-streaming-restricted': {
        id: 'governed-streaming-restricted',
        accessMethod: {
            label: 'Governed stream',
            buyerSummary: 'Metro-scoped governed streaming sessions are enabled after review.',
            providerSummary: 'Approved buyers consume an audited mobility stream inside Redoubt controls.'
        },
        deliveryDetail: {
            label: 'Regional stream sessions',
            buyerSummary: 'Delivery stays inside governed metro-specific streaming workspaces with no raw coordinate export.',
            providerSummary: 'Data is exposed only through region-approved stream sessions.'
        },
        fieldAccess: { label: 'Operational telemetry pack' },
        usageRights: { label: 'Planning and analytics' },
        term: { label: '6 months' },
        geography: { label: 'Region-scoped' },
        exclusivity: { label: 'Non-exclusive' },
        security: {
            encryption: 'TLS 1.3 transport + encrypted workspace storage',
            masking: 'Coordinate aggregation and low-density suppression',
            watermarking: 'Query result watermarking on governed exports',
            revocation: 'Metro scopes can be revoked per region'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Required',
            redistribution: 'Not Allowed',
            volumePricing: 'Disabled'
        }
    },
    'market-tick-vault': {
        id: 'market-tick-vault',
        accessMethod: {
            label: 'Replay workspace',
            buyerSummary: 'Approved buyers receive governed replay and query access for execution research.',
            providerSummary: 'Delivery stays inside a replay-capable vault workspace with strict query controls.'
        },
        deliveryDetail: {
            label: 'Low-latency governed vault',
            buyerSummary: 'Delivery supports replay-heavy analysis with no raw packet export path.',
            providerSummary: 'Venue-sensitive content remains in a high-control vault environment.'
        },
        fieldAccess: { label: 'Trade and quote pack' },
        usageRights: { label: 'Research and benchmarking' },
        term: { label: '9 months' },
        geography: { label: 'US / EU venue scope' },
        exclusivity: { label: 'Non-exclusive' },
        security: {
            encryption: 'Hardware-backed key isolation + TLS 1.3',
            masking: 'Venue-sensitive identifiers masked outside governed replay',
            watermarking: 'Query and replay watermarking enabled',
            revocation: 'Replay scope revocable by venue package'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Required',
            redistribution: 'Not Allowed',
            volumePricing: 'Tiered'
        }
    },
    'clinical-safe-haven': {
        id: 'clinical-safe-haven',
        accessMethod: {
            label: 'Safe-haven workspace',
            buyerSummary: 'Regulated clinical analysis happens inside a reviewed safe-haven environment.',
            providerSummary: 'Buyer activity is limited to a monitored safe-haven with output review.'
        },
        deliveryDetail: {
            label: 'Privacy-reviewed enclave',
            buyerSummary: 'Only approved analysts can work inside the enclave; outputs are reviewed before release.',
            providerSummary: 'Clinical data never leaves the privacy-reviewed enclave directly.'
        },
        fieldAccess: { label: 'Outcome and cohort pack' },
        usageRights: { label: 'Regulated research use' },
        term: { label: '6 months' },
        geography: { label: 'Residency constrained' },
        exclusivity: { label: 'Non-exclusive' },
        security: {
            encryption: 'Encrypted enclave storage + isolated compute',
            masking: 'Cohort suppression and row-level export controls',
            watermarking: 'Output watermarking with reviewer attestation',
            revocation: 'Access revoked automatically on governance breach'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Not Required',
            redistribution: 'Not Allowed',
            volumePricing: 'Disabled'
        }
    },
    'geospatial-evaluation-room': {
        id: 'geospatial-evaluation-room',
        accessMethod: {
            label: 'Evaluation room',
            buyerSummary: 'Governed access includes representative tile review and class-level analytics.',
            providerSummary: 'Imagery and labels remain in a governed evaluation workspace.'
        },
        deliveryDetail: {
            label: 'Raster review workspace',
            buyerSummary: 'Tile preview, class analytics, and model evaluation happen inside the workspace; raw export needs approval.',
            providerSummary: 'High-resolution raster extracts stay behind an approval step.'
        },
        fieldAccess: { label: 'Tile and class pack' },
        usageRights: { label: 'Evaluation and mapping' },
        term: { label: '12 months' },
        geography: { label: 'Global' },
        exclusivity: { label: 'Non-exclusive' },
        security: {
            encryption: 'Encrypted raster storage + signed session access',
            masking: 'Coordinate precision controls on preview exports',
            watermarking: 'Tile and derivative watermarking enabled',
            revocation: 'Raster extract rights revocable independently'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Required',
            redistribution: 'Restricted',
            volumePricing: 'Tiered'
        }
    },
    'retail-insights-clean-room': {
        id: 'retail-insights-clean-room',
        accessMethod: {
            label: 'Aggregate clean room',
            buyerSummary: 'Buyer analysis is limited to governed aggregated workflows while anonymization review is open.',
            providerSummary: 'Retail panel data is exposed only through aggregate-safe outputs.'
        },
        deliveryDetail: {
            label: 'Aggregation-only workspace',
            buyerSummary: 'No household-level export path is enabled; only reviewed aggregate outputs leave the workspace.',
            providerSummary: 'Suppression thresholds are enforced automatically before outputs are released.'
        },
        fieldAccess: { label: 'Category and segment pack' },
        usageRights: { label: 'Planning analytics' },
        term: { label: '3 months' },
        geography: { label: 'North America' },
        exclusivity: { label: 'Non-exclusive' },
        security: {
            encryption: 'Encrypted clean-room storage + scoped analyst access',
            masking: 'Household suppression and demographic thresholding',
            watermarking: 'Aggregate export watermarking enabled',
            revocation: 'Access revoked if anonymization rules are breached'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Required',
            redistribution: 'Not Allowed',
            volumePricing: 'Disabled'
        }
    },
    'genomics-controlled-enclave': {
        id: 'genomics-controlled-enclave',
        accessMethod: {
            label: 'Controlled enclave',
            buyerSummary: 'Variant-level research is provisioned inside a tightly governed genomics enclave.',
            providerSummary: 'All advanced exploration stays inside the enclave with no copy-out path.'
        },
        deliveryDetail: {
            label: 'Genomics enclave',
            buyerSummary: 'Expression and cohort analysis are supported, but rare-variant workflows remain heavily controlled.',
            providerSummary: 'Rare-variant and cohort joins remain enclave-only and fully audited.'
        },
        fieldAccess: { label: 'Expression and variant pack' },
        usageRights: { label: 'Biomedical research' },
        term: { label: '12 months' },
        geography: { label: 'Residency reviewed' },
        exclusivity: { label: 'Non-exclusive' },
        security: {
            encryption: 'Isolated enclave compute + encrypted artifact store',
            masking: 'Rare-variant suppression outside approved sessions',
            watermarking: 'Derived result watermarking with cohort thresholds',
            revocation: 'Session revocation tied to policy and ethics controls'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Not Required',
            redistribution: 'Not Allowed',
            volumePricing: 'Disabled'
        }
    },
    'utility-grid-governed-room': {
        id: 'utility-grid-governed-room',
        accessMethod: {
            label: 'Governed utility room',
            buyerSummary: 'Approved buyers receive anonymized grid telemetry inside a governed utility workspace.',
            providerSummary: 'Utility feeds stay inside a monitored room with scoped regional access.'
        },
        deliveryDetail: {
            label: 'Anonymized telemetry workspace',
            buyerSummary: 'Consumption, voltage, and reliability analysis are supported without exposing household identity.',
            providerSummary: 'Regional scopes and anonymization rules are enforced before access is activated.'
        },
        fieldAccess: { label: 'Grid telemetry pack' },
        usageRights: { label: 'Reliability and forecasting' },
        term: { label: '9 months' },
        geography: { label: 'US / EU utility scope' },
        exclusivity: { label: 'Non-exclusive' },
        security: {
            encryption: 'Encrypted telemetry storage + regional key controls',
            masking: 'Residential identity masking and geohash restriction',
            watermarking: 'Output watermarking on approved extracts',
            revocation: 'Regional utility scopes are revocable independently'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Required',
            redistribution: 'Not Allowed',
            volumePricing: 'Tiered'
        }
    }
}

const CONTRIBUTION_ACCESS_PACKAGE_BY_ID: Record<string, string> = {
    'cn-1003': 'platform-clean-room-standard'
}

const DEFAULT_ACCESS_PACKAGE = ACCESS_PACKAGES['platform-clean-room-standard']

export function getAccessPackageForDataset(datasetId: string) {
    return ACCESS_PACKAGES[DATASET_ACCESS_PACKAGE_IDS_BY_DATASET_ID[datasetId] ?? DEFAULT_ACCESS_PACKAGE.id] ?? DEFAULT_ACCESS_PACKAGE
}

export function getAccessPackageForContribution(contributionId?: string) {
    if (!contributionId) return DEFAULT_ACCESS_PACKAGE
    return ACCESS_PACKAGES[CONTRIBUTION_ACCESS_PACKAGE_BY_ID[contributionId] ?? DEFAULT_ACCESS_PACKAGE.id] ?? DEFAULT_ACCESS_PACKAGE
}
