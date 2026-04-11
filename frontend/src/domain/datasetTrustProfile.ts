export type TrustSignalState = 'documented' | 'provider_confirmation' | 'reviewer_confirmation'

export type DatasetTrustSeverity = 'low' | 'medium' | 'high'

export type DatasetTrustRiskLabelKey =
    | 'sensitivity'
    | 'legal_basis'
    | 'rights'
    | 'reidentification'
    | 'audit'
    | 'ethics'

export type DatasetTrustSignal = {
    value: string
    state: TrustSignalState
}

export type DatasetTrustProfile = {
    legalBasis: DatasetTrustSignal
    consentPosture: DatasetTrustSignal
    purposeLimitation: DatasetTrustSignal
    sensitivity: DatasetTrustSignal
    ownershipAndLicense: DatasetTrustSignal
    reidentificationRisk: DatasetTrustSignal
    qualityCaveat: DatasetTrustSignal
    accessControl: DatasetTrustSignal
    auditVisibility: DatasetTrustSignal
    intellectualProperty: DatasetTrustSignal
    ethicalFlags: string[]
    responsibilityBoundary: DatasetTrustSignal
}

export type DatasetTrustRiskLabel = {
    key: DatasetTrustRiskLabelKey
    label: string
    value: string
    state: TrustSignalState
    severity: DatasetTrustSeverity
}

export type DatasetTrustSummaryRow = {
    key: string
    label: string
    value: string
    state: TrustSignalState
    severity: DatasetTrustSeverity
}

export const buildTrustSignal = (
    value: string,
    state: TrustSignalState = 'documented'
): DatasetTrustSignal => ({
    value,
    state
})

export const trustSignalStateLabel = (state: TrustSignalState) => {
    if (state === 'provider_confirmation') return 'Provider confirmation required'
    if (state === 'reviewer_confirmation') return 'Reviewer confirmation required'
    return 'Documented in demo'
}

const trustSignalStatePriority: Record<TrustSignalState, number> = {
    documented: 0,
    provider_confirmation: 1,
    reviewer_confirmation: 2
}

const combineTrustSignalStates = (...states: TrustSignalState[]): TrustSignalState =>
    states.reduce((current, candidate) =>
        trustSignalStatePriority[candidate] > trustSignalStatePriority[current] ? candidate : current
    )

const getStateSeverity = (state: TrustSignalState): DatasetTrustSeverity => {
    if (state === 'reviewer_confirmation') return 'high'
    if (state === 'provider_confirmation') return 'medium'
    return 'low'
}

const highestSeverity = (...severities: DatasetTrustSeverity[]): DatasetTrustSeverity => {
    if (severities.includes('high')) return 'high'
    if (severities.includes('medium')) return 'medium'
    return 'low'
}

const getCompactStateValue = (state: TrustSignalState, documentedLabel = 'Summarized') => {
    if (state === 'provider_confirmation') return 'Provider check'
    if (state === 'reviewer_confirmation') return 'Review'
    return documentedLabel
}

const getSensitivityBand = (value: string) => {
    const normalized = value.toLowerCase()

    if (normalized.includes('medium-to-high')) return 'Med-high'
    if (normalized.includes('high sensitivity')) return 'High'
    if (normalized.includes('medium sensitivity')) return 'Medium'
    if (normalized.includes('low sensitivity')) return 'Low'
    return 'Needs review'
}

const getSensitivitySeverity = (value: string): DatasetTrustSeverity => {
    const band = getSensitivityBand(value)
    if (band === 'High' || band === 'Med-high') return 'high'
    if (band === 'Medium') return 'medium'
    return 'low'
}

const getReidentificationLabel = (signal: DatasetTrustSignal) => {
    const normalized = signal.value.toLowerCase()

    if (signal.state !== 'documented') {
        return getCompactStateValue(signal.state)
    }

    if (normalized.includes('low re-identification risk')) return 'Low'
    if (normalized.includes('high') || normalized.includes('residual identifiability')) return 'High'
    if (normalized.includes('medium')) return 'Medium'
    return 'Elevated'
}

const getReidentificationSeverity = (signal: DatasetTrustSignal): DatasetTrustSeverity => {
    const normalized = signal.value.toLowerCase()
    if (signal.state === 'reviewer_confirmation') return 'high'
    if (signal.state === 'provider_confirmation') return 'medium'
    if (normalized.includes('low re-identification risk')) return 'low'
    if (normalized.includes('high') || normalized.includes('residual identifiability')) return 'high'
    return 'medium'
}

const getEthicsValue = (ethicalFlags: string[]) =>
    ethicalFlags.length > 0 ? `${ethicalFlags.length} flag${ethicalFlags.length === 1 ? '' : 's'}` : 'None surfaced'

const getEthicsRowValue = (ethicalFlags: string[]) =>
    ethicalFlags.length > 0
        ? ethicalFlags.join('; ')
        : 'No additional ethical flags are surfaced in the current demo packet.'

export const getMinimumTrustClarificationState = (profile: DatasetTrustProfile) =>
    combineTrustSignalStates(
        profile.legalBasis.state,
        profile.consentPosture.state,
        profile.ownershipAndLicense.state,
        profile.reidentificationRisk.state,
        profile.accessControl.state,
        profile.auditVisibility.state,
        profile.intellectualProperty.state
    )

export const getDatasetTrustRiskLabels = (profile: DatasetTrustProfile): DatasetTrustRiskLabel[] => {
    const legalBasisState = combineTrustSignalStates(profile.legalBasis.state, profile.consentPosture.state)

    return [
        {
            key: 'sensitivity',
            label: 'Sensitivity',
            value: getSensitivityBand(profile.sensitivity.value),
            state: profile.sensitivity.state,
            severity: getSensitivitySeverity(profile.sensitivity.value)
        },
        {
            key: 'legal_basis',
            label: 'Legal basis',
            value: getCompactStateValue(legalBasisState),
            state: legalBasisState,
            severity: getStateSeverity(legalBasisState)
        },
        {
            key: 'rights',
            label: 'Rights',
            value: getCompactStateValue(profile.ownershipAndLicense.state),
            state: profile.ownershipAndLicense.state,
            severity: getStateSeverity(profile.ownershipAndLicense.state)
        },
        {
            key: 'reidentification',
            label: 'Re-id',
            value: getReidentificationLabel(profile.reidentificationRisk),
            state: profile.reidentificationRisk.state,
            severity: getReidentificationSeverity(profile.reidentificationRisk)
        },
        {
            key: 'audit',
            label: 'Audit',
            value: profile.auditVisibility.state === 'documented' ? 'Visible' : getCompactStateValue(profile.auditVisibility.state),
            state: profile.auditVisibility.state,
            severity: getStateSeverity(profile.auditVisibility.state)
        },
        {
            key: 'ethics',
            label: 'Ethics',
            value: getEthicsValue(profile.ethicalFlags),
            state: 'documented',
            severity: profile.ethicalFlags.length > 0 ? 'high' : 'low'
        }
    ]
}

export const getDatasetTrustSummaryRows = (profile: DatasetTrustProfile): DatasetTrustSummaryRow[] => {
    const legalBasisState = combineTrustSignalStates(profile.legalBasis.state, profile.consentPosture.state)

    return [
        {
            key: 'legal-basis-consent',
            label: 'Legal basis / consent posture',
            value: `${profile.legalBasis.value} ${profile.consentPosture.value}`,
            state: legalBasisState,
            severity: highestSeverity(getStateSeverity(legalBasisState))
        },
        {
            key: 'purpose-limitation',
            label: 'Purpose limitation',
            value: profile.purposeLimitation.value,
            state: profile.purposeLimitation.state,
            severity: getStateSeverity(profile.purposeLimitation.state)
        },
        {
            key: 'sensitivity',
            label: 'Sensitivity',
            value: profile.sensitivity.value,
            state: profile.sensitivity.state,
            severity: getSensitivitySeverity(profile.sensitivity.value)
        },
        {
            key: 'ownership-license',
            label: 'Ownership vs usage rights',
            value: profile.ownershipAndLicense.value,
            state: profile.ownershipAndLicense.state,
            severity: getStateSeverity(profile.ownershipAndLicense.state)
        },
        {
            key: 'reidentification',
            label: 'Re-identification risk',
            value: profile.reidentificationRisk.value,
            state: profile.reidentificationRisk.state,
            severity: getReidentificationSeverity(profile.reidentificationRisk)
        },
        {
            key: 'access-control',
            label: 'Access control posture',
            value: profile.accessControl.value,
            state: profile.accessControl.state,
            severity: getStateSeverity(profile.accessControl.state)
        },
        {
            key: 'audit-visibility',
            label: 'Audit visibility',
            value: profile.auditVisibility.value,
            state: profile.auditVisibility.state,
            severity: getStateSeverity(profile.auditVisibility.state)
        },
        {
            key: 'quality-caveat',
            label: 'Quality caveat',
            value: profile.qualityCaveat.value,
            state: profile.qualityCaveat.state,
            severity: getStateSeverity(profile.qualityCaveat.state)
        },
        {
            key: 'intellectual-property',
            label: 'IP status',
            value: profile.intellectualProperty.value,
            state: profile.intellectualProperty.state,
            severity: getStateSeverity(profile.intellectualProperty.state)
        },
        {
            key: 'ethical-flags',
            label: 'Ethical flags',
            value: getEthicsRowValue(profile.ethicalFlags),
            state: 'documented',
            severity: profile.ethicalFlags.length > 0 ? 'high' : 'low'
        },
        {
            key: 'responsibility-boundary',
            label: 'Responsibility boundary',
            value: profile.responsibilityBoundary.value,
            state: profile.responsibilityBoundary.state,
            severity: getStateSeverity(profile.responsibilityBoundary.state)
        }
    ]
}

export const DATASET_TRUST_PROFILE_LIBRARY = {
    climateObservations: {
        legalBasis: buildTrustSignal(
            'Provider licensing basis is described at a summary level and still needs provider confirmation for live use.',
            'provider_confirmation'
        ),
        consentPosture: buildTrustSignal(
            'No person-level consent signal is surfaced in this demo packet.',
            'provider_confirmation'
        ),
        purposeLimitation: buildTrustSignal('Research, resilience planning, and derived analytics only.'),
        sensitivity: buildTrustSignal('Low sensitivity operational and environmental data.'),
        ownershipAndLicense: buildTrustSignal(
            'Licensed contribution terms are summarized, but ownership chain-of-title still needs provider confirmation.',
            'provider_confirmation'
        ),
        reidentificationRisk: buildTrustSignal('Low re-identification risk in the mock review packet.'),
        qualityCaveat: buildTrustSignal('Coastal and alpine feeds can arrive late during severe weather windows.'),
        accessControl: buildTrustSignal('Governed workspace and scoped API delivery are described.'),
        auditVisibility: buildTrustSignal(
            'Session logging is shown as a demo review cue rather than a legal audit guarantee.',
            'reviewer_confirmation'
        ),
        intellectualProperty: buildTrustSignal(
            'Source and redistribution constraints should be confirmed in the provider agreement.',
            'provider_confirmation'
        ),
        ethicalFlags: [],
        responsibilityBoundary: buildTrustSignal('Provider supplies the source package; Redoubt applies delivery controls and review workflow.')
    },
    mobilityTelemetry: {
        legalBasis: buildTrustSignal(
            'Use is framed as governed operational analytics, but the sharing basis still needs provider confirmation.',
            'provider_confirmation'
        ),
        consentPosture: buildTrustSignal(
            'Location-derived handling assumptions need reviewer confirmation before relying on this mock record.',
            'reviewer_confirmation'
        ),
        purposeLimitation: buildTrustSignal('Planning, forecasting, and aggregate mobility analytics only.'),
        sensitivity: buildTrustSignal('Medium sensitivity because movement patterns can increase identifiability risk.'),
        ownershipAndLicense: buildTrustSignal(
            'License scope is summarized in the demo; ownership and onward-use rights still need provider confirmation.',
            'provider_confirmation'
        ),
        reidentificationRisk: buildTrustSignal(
            'Location joins and dense metro exports need reviewer confirmation.',
            'reviewer_confirmation'
        ),
        qualityCaveat: buildTrustSignal('Low-density zones and late stream reconciliation can reduce representativeness.'),
        accessControl: buildTrustSignal('Region-scoped streaming and governed workspace controls are described.'),
        auditVisibility: buildTrustSignal(
            'Audit visibility is shown for review context, not as proof of complete compliance coverage.',
            'reviewer_confirmation'
        ),
        intellectualProperty: buildTrustSignal('Third-party transit and sensor licensing should be checked in the final agreement.', 'provider_confirmation'),
        ethicalFlags: ['Urban mobility data can raise location-pattern sensitivity concerns.'],
        responsibilityBoundary: buildTrustSignal('Provider defines source rights; Redoubt governs stream delivery, logging, and regional controls.')
    },
    marketData: {
        legalBasis: buildTrustSignal(
            'Commercial market-data licensing is assumed in the mock flow and needs provider confirmation.',
            'provider_confirmation'
        ),
        consentPosture: buildTrustSignal('Consent is generally not the governing concept for this market-data package.'),
        purposeLimitation: buildTrustSignal('Benchmarking, research, and replay analysis only.'),
        sensitivity: buildTrustSignal('Medium sensitivity due to venue and commercial licensing constraints.'),
        ownershipAndLicense: buildTrustSignal(
            'Usage rights are summarized, but venue license boundaries still need provider confirmation.',
            'provider_confirmation'
        ),
        reidentificationRisk: buildTrustSignal('Low person-level re-identification risk; redistribution risk remains material.'),
        qualityCaveat: buildTrustSignal('Post-close reconciliation can adjust sequencing after initial delivery windows.'),
        accessControl: buildTrustSignal('Replay vault controls and query restrictions are documented in the demo.'),
        auditVisibility: buildTrustSignal(
            'Audit events are visible as review cues rather than contractual proof.',
            'reviewer_confirmation'
        ),
        intellectualProperty: buildTrustSignal('Venue, exchange, and derived-work license terms require provider confirmation.', 'provider_confirmation'),
        ethicalFlags: [],
        responsibilityBoundary: buildTrustSignal('Provider carries source licensing; Redoubt governs replay delivery and control enforcement.')
    },
    clinicalResearch: {
        legalBasis: buildTrustSignal(
            'Clinical research handling requires reviewer confirmation of the lawful sharing basis.',
            'reviewer_confirmation'
        ),
        consentPosture: buildTrustSignal(
            'Consent and ethics coverage are summarized only at a mock level and need reviewer confirmation.',
            'reviewer_confirmation'
        ),
        purposeLimitation: buildTrustSignal('Regulated research and reviewed outcome analysis only.'),
        sensitivity: buildTrustSignal('High sensitivity because clinical outcomes can remain regulated even after de-identification.'),
        ownershipAndLicense: buildTrustSignal(
            'Dataset use rights are summarized, but institutional authority and downstream license scope still need provider confirmation.',
            'provider_confirmation'
        ),
        reidentificationRisk: buildTrustSignal(
            'Rare cohorts and small cell outputs require reviewer confirmation before relying on this package.',
            'reviewer_confirmation'
        ),
        qualityCaveat: buildTrustSignal('Cohort refreshes and late coding updates can affect recent records.'),
        accessControl: buildTrustSignal('Safe-haven and output-review controls are documented.'),
        auditVisibility: buildTrustSignal(
            'Audit visibility is presented as review context and should not be read as a legal guarantee.',
            'reviewer_confirmation'
        ),
        intellectualProperty: buildTrustSignal('Clinical source licenses, IRB conditions, and downstream publication rights need provider confirmation.', 'provider_confirmation'),
        ethicalFlags: ['Human-subject review context is required.', 'Clinical use should stay inside approved research scope.'],
        responsibilityBoundary: buildTrustSignal('Provider attests to collection authority; Redoubt governs enclave controls and release review.')
    },
    geospatialImagery: {
        legalBasis: buildTrustSignal(
            'Imagery licensing posture is summarized in the demo and still needs provider confirmation.',
            'provider_confirmation'
        ),
        consentPosture: buildTrustSignal('Consent posture is not expanded in this demo record.'),
        purposeLimitation: buildTrustSignal('Evaluation, mapping, and reviewed derivative workflows only.'),
        sensitivity: buildTrustSignal('Medium sensitivity because precision imagery can elevate misuse risk.'),
        ownershipAndLicense: buildTrustSignal(
            'Raw imagery rights and derivative restrictions still need provider confirmation.',
            'provider_confirmation'
        ),
        reidentificationRisk: buildTrustSignal(
            'High-resolution tiles can increase precision and misuse risk.',
            'reviewer_confirmation'
        ),
        qualityCaveat: buildTrustSignal('Cloud cover and label lag can reduce immediate production readiness in some regions.'),
        accessControl: buildTrustSignal('Workspace review and separate approval for high-resolution export are documented.'),
        auditVisibility: buildTrustSignal('Audit and export traces are shown as demo review cues.', 'reviewer_confirmation'),
        intellectualProperty: buildTrustSignal('Imagery licensing, derivative rights, and third-party basemap constraints need provider confirmation.', 'provider_confirmation'),
        ethicalFlags: ['High-resolution imagery may require additional misuse review.'],
        responsibilityBoundary: buildTrustSignal('Provider carries imagery rights; Redoubt governs workspace review and export controls.')
    },
    retailPanel: {
        legalBasis: buildTrustSignal(
            'Retail panel sharing basis is summarized only at a mock level and needs provider confirmation.',
            'provider_confirmation'
        ),
        consentPosture: buildTrustSignal(
            'Anonymization posture is described, but reviewer confirmation is still required for household-level risk.',
            'reviewer_confirmation'
        ),
        purposeLimitation: buildTrustSignal('Planning analytics and aggregate demand workflows only.'),
        sensitivity: buildTrustSignal('Medium-to-high sensitivity because household-level inference risk can remain.'),
        ownershipAndLicense: buildTrustSignal(
            'Panel usage rights are summarized, while contributor authority and third-party terms still need provider confirmation.',
            'provider_confirmation'
        ),
        reidentificationRisk: buildTrustSignal('Household joins and low-count segments need reviewer confirmation.', 'reviewer_confirmation'),
        qualityCaveat: buildTrustSignal('Anonymization review is still open on a subset of the newest panel refreshes.'),
        accessControl: buildTrustSignal('Aggregate-only clean-room delivery is documented in the mock flow.'),
        auditVisibility: buildTrustSignal('Audit visibility is shown as demo context, not as a compliance certificate.', 'reviewer_confirmation'),
        intellectualProperty: buildTrustSignal('Retail panel licenses and downstream redistribution terms need provider confirmation.', 'provider_confirmation'),
        ethicalFlags: ['Consumer-behavior inference can create sensitivity even when direct identifiers are absent.'],
        responsibilityBoundary: buildTrustSignal('Provider manages source rights; Redoubt governs aggregate release controls and logging.')
    },
    genomicsResearch: {
        legalBasis: buildTrustSignal(
            'Genomics sharing basis and ethics coverage require reviewer confirmation.',
            'reviewer_confirmation'
        ),
        consentPosture: buildTrustSignal(
            'Consent, cohort-use limits, and ethics posture are only summarized in the demo packet.',
            'reviewer_confirmation'
        ),
        purposeLimitation: buildTrustSignal('Biomedical research inside controlled enclave workflows only.'),
        sensitivity: buildTrustSignal('High sensitivity because genomic and rare-variant data can carry residual identifiability risk.'),
        ownershipAndLicense: buildTrustSignal(
            'Institutional data rights and downstream publication terms need provider confirmation.',
            'provider_confirmation'
        ),
        reidentificationRisk: buildTrustSignal(
            'Rare variants and cohort joins require reviewer confirmation and restrictive handling.',
            'reviewer_confirmation'
        ),
        qualityCaveat: buildTrustSignal('Cohort reconciliation and rare-variant suppression can limit some analyses.'),
        accessControl: buildTrustSignal('Controlled enclave, no copy-out, and reviewer attestation cues are documented.'),
        auditVisibility: buildTrustSignal('Audit visibility is shown as review context for the demo.', 'reviewer_confirmation'),
        intellectualProperty: buildTrustSignal('Genomics source licenses and publication restrictions need provider confirmation.', 'provider_confirmation'),
        ethicalFlags: ['Human-subject and cohort-sensitivity review is required.', 'Rare-variant analysis can elevate re-identification risk.'],
        responsibilityBoundary: buildTrustSignal('Provider attests to source authority; Redoubt governs enclave access and release controls.')
    },
    utilityTelemetry: {
        legalBasis: buildTrustSignal(
            'Utility-data licensing and sharing basis still need provider confirmation.',
            'provider_confirmation'
        ),
        consentPosture: buildTrustSignal(
            'Consumer-facing consent posture is not fully exposed in this demo record.',
            'reviewer_confirmation'
        ),
        purposeLimitation: buildTrustSignal('Reliability, forecasting, and operational optimization only.'),
        sensitivity: buildTrustSignal('Medium sensitivity because localized grid telemetry can reveal infrastructure patterns.'),
        ownershipAndLicense: buildTrustSignal(
            'Utility source rights and regional sublicense terms need provider confirmation.',
            'provider_confirmation'
        ),
        reidentificationRisk: buildTrustSignal(
            'Household and service-point precision need reviewer confirmation before any expanded release.',
            'reviewer_confirmation'
        ),
        qualityCaveat: buildTrustSignal('Outage reconciliation can delay the latest regional telemetry windows.'),
        accessControl: buildTrustSignal('Governed utility room, masking, and region-scoped access are documented.'),
        auditVisibility: buildTrustSignal('Audit visibility is described for reviewer context in the demo.', 'reviewer_confirmation'),
        intellectualProperty: buildTrustSignal('Utility contracts and regional operating restrictions need provider confirmation.', 'provider_confirmation'),
        ethicalFlags: ['Critical-infrastructure context may require additional review.'],
        responsibilityBoundary: buildTrustSignal('Provider defines source rights; Redoubt governs anonymization, access controls, and audit visibility.')
    }
} as const satisfies Record<string, DatasetTrustProfile>
