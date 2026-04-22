import { buildDealDossierProofBundle, type DealArtifactPreviewTone } from './dealArtifactPreview'
import type { DealRouteContext } from './dealDossier'
import {
    buildProviderRightsPacket,
    loadProviderPacketDraft
} from './providerRightsPacket'

export type NegotiationEntryType =
    | 'question'
    | 'answer'
    | 'clarification'
    | 'redline'
    | 'scope_change'
    | 'resolution'

export type NegotiationEntryStatus = 'Open' | 'Needs review' | 'Resolved'
export type NegotiationParty = 'Buyer' | 'Provider' | 'Governance' | 'Commercial'

export type NegotiationThreadEntry = {
    id: string
    type: NegotiationEntryType
    status: NegotiationEntryStatus
    party: NegotiationParty
    title: string
    detail: string
    owner: string
    at: string
    linkedSurfaceLabel?: string
    linkedSurfaceTo?: string
}

export type NegotiationScopeChange = {
    id: string
    title: string
    status: 'Accepted' | 'Needs review' | 'Pending provider reply'
    at: string
    owner: string
    summary: string
    from: string
    to: string
    impact: string
}

export type NegotiationRedline = {
    id: string
    clause: string
    status: 'Open' | 'Provider accepted' | 'Countered'
    owner: string
    at: string
    requestedChange: string
    providerResponse: string
    linkedControl: string
}

export type NegotiationResolvedItem = {
    id: string
    title: string
    resolvedBy: string
    resolvedAt: string
    resolution: string
}

export type NegotiationOpenItem = {
    id: string
    title: string
    owner: string
    detail: string
    tone: DealArtifactPreviewTone
}

export type NegotiationThreadModel = {
    threadId: string
    dealId: string
    title: string
    summary: string
    overallStatus: string
    overallTone: DealArtifactPreviewTone
    nextAction: string
    participantSummary: string[]
    metrics: Array<{
        label: string
        value: string
        detail: string
        tone: DealArtifactPreviewTone
    }>
    entries: NegotiationThreadEntry[]
    scopeChanges: NegotiationScopeChange[]
    redlines: NegotiationRedline[]
    resolvedItems: NegotiationResolvedItem[]
    openItems: NegotiationOpenItem[]
}

type NegotiationSeed = {
    summary: string
    nextAction: string
    participantSummary: string[]
    entries: Array<Omit<NegotiationThreadEntry, 'linkedSurfaceTo'> & {
        linkedSurfaceKey?: 'provider-packet' | 'approval'
        linkedBuyerRoute?: string
    }>
    scopeChanges: NegotiationScopeChange[]
    redlines: NegotiationRedline[]
    resolvedItems: NegotiationResolvedItem[]
}

const THREAD_SEEDS: Record<string, NegotiationSeed> = {
    'DL-1001': {
        summary:
            'The climate evaluation is negotiating how far derived resilience scores can travel, which outputs remain internal-only, and whether GCC-limited processing is enough for the first evaluation lane.',
        nextAction:
            'Lock the downstream output wording to internal planning reports only, then close the provider clarification on GCC-restricted evaluation exports.',
        participantSummary: [
            'Buyer is asking for resilience-model summaries and aggregate flood-risk scoring.',
            'Provider is willing to allow internal planning outputs during evaluation, but not customer-facing dashboards.',
            'Governance is pushing the first evaluation lane toward GCC-only processing until residency wording closes.'
        ],
        entries: [
            {
                id: 'neg-1001-q1',
                type: 'question',
                status: 'Open',
                party: 'Buyer',
                title: 'Can derived resilience scores leave the governed workspace during evaluation?',
                detail:
                    'Buyer wants to know whether scored output tables can be exported for internal briefing decks before the evaluation transitions into a paid amendment.',
                owner: 'Avery Stone',
                at: 'Mar 29, 2026 · 09:14 UTC',
                linkedBuyerRoute: '/datasets/1/rights-quote'
            },
            {
                id: 'neg-1001-c1',
                type: 'clarification',
                status: 'Needs review',
                party: 'Provider',
                title: 'Provider clarified that internal planning reports are allowed, but client-facing scorecards are not.',
                detail:
                    'Provider accepts aggregate internal reporting as long as named analysts stay inside the protected evaluation lane and customer-facing artifacts are excluded from the initial scope.',
                owner: 'Mina Qadri',
                at: 'Mar 29, 2026 · 14:22 UTC',
                linkedSurfaceKey: 'provider-packet'
            },
            {
                id: 'neg-1001-r1',
                type: 'redline',
                status: 'Needs review',
                party: 'Commercial',
                title: 'Commercial team proposed a narrower downstream-output clause.',
                detail:
                    'The current redline replaces “scenario summaries” with “aggregate internal planning summaries” so the first paid evaluation does not imply wider derivative rights.',
                owner: 'Omar Siddiqui',
                at: 'Mar 30, 2026 · 08:36 UTC',
                linkedBuyerRoute: '/datasets/1/rights-quote'
            },
            {
                id: 'neg-1001-s1',
                type: 'scope_change',
                status: 'Needs review',
                party: 'Governance',
                title: 'Scope change proposes GCC-limited evaluation processing for the first cohort.',
                detail:
                    'Governance wants the first evaluation to stay inside GCC processing boundaries until the residency memo is finalized, even though the buyer originally described broader climate-model workflows.',
                owner: 'Faris Noor',
                at: 'Mar 30, 2026 · 16:05 UTC',
                linkedSurfaceKey: 'approval'
            },
            {
                id: 'neg-1001-res1',
                type: 'resolution',
                status: 'Resolved',
                party: 'Governance',
                title: 'Raw climate grid exports remain blocked and the buyer accepted aggregate-only reviewer notes.',
                detail:
                    'This closes the earlier question about sample exports and keeps the evaluation focused on aggregate scenario summaries.',
                owner: 'Salman Farooq',
                at: 'Mar 31, 2026 · 09:11 UTC'
            }
        ],
        scopeChanges: [
            {
                id: 'scope-1001-1',
                title: 'Downstream outputs narrowed to internal planning reports',
                status: 'Needs review',
                at: 'Mar 30, 2026 · 08:36 UTC',
                owner: 'Commercial review',
                summary: 'The initial request described scenario summaries broadly. The proposed scope narrows that to internal-only resilience planning outputs during evaluation.',
                from: 'Scenario summaries and derived risk score distributions',
                to: 'Aggregate internal planning reports and reviewer-visible risk tables only',
                impact: 'Reduces customer-facing ambiguity and keeps the evaluation aligned to the first commercial lane.'
            },
            {
                id: 'scope-1001-2',
                title: 'Evaluation processing lane narrowed to GCC-only review infrastructure',
                status: 'Pending provider reply',
                at: 'Mar 30, 2026 · 16:05 UTC',
                owner: 'Governance review',
                summary: 'The buyer originally described global resilience workflows. Governance is limiting the first evaluation lane until residency handling is fully resolved.',
                from: 'Global resilience-model calibration inside a protected workspace',
                to: 'GCC-limited evaluation processing with export review for any cross-border summary',
                impact: 'Makes the residency conversation explicit and ties the evaluation to a narrower review region.'
            }
        ],
        redlines: [
            {
                id: 'red-1001-1',
                clause: 'Downstream outputs',
                status: 'Countered',
                owner: 'Commercial',
                at: 'Mar 30, 2026 · 08:36 UTC',
                requestedChange: 'Replace “scenario summaries” with “aggregate internal planning summaries during evaluation”.',
                providerResponse: 'Provider agrees in principle, but wants a clean note that customer-facing scorecards require a later amendment.',
                linkedControl: 'Rights package and protected evaluation release note'
            },
            {
                id: 'red-1001-2',
                clause: 'Processing geography',
                status: 'Open',
                owner: 'Governance',
                at: 'Mar 30, 2026 · 16:05 UTC',
                requestedChange: 'Add GCC-only processing language to the first evaluation lane.',
                providerResponse: 'Provider asked whether aggregated model summaries can still be reviewed by non-GCC commercial owners.',
                linkedControl: 'Residency and deployment guardrail'
            }
        ],
        resolvedItems: [
            {
                id: 'res-1001-1',
                title: 'Raw climate grid sample export request closed',
                resolvedBy: 'Governance review',
                resolvedAt: 'Mar 31, 2026 · 09:11 UTC',
                resolution: 'Buyer accepted reviewer-visible aggregate notes instead of any direct grid export.'
            }
        ]
    },
    'DL-1002': {
        summary:
            'The quant replay evaluation is focused on replay-only rights, whether factor diagnostics can appear in external research notes, and how long replay access should remain active before a production amendment.',
        nextAction:
            'Close the replay-retention redline and document that any externally distributed factor commentary still needs a separate rights amendment.',
        participantSummary: [
            'Buyer wants replay diagnostics, factor-validation metrics, and aggregate execution summaries.',
            'Provider is drawing a bright line around replay-only, internal quant research use.',
            'Commercial review is shortening the evaluation term so replay entitlements do not imply broader production use.'
        ],
        entries: [
            {
                id: 'neg-1002-q1',
                type: 'question',
                status: 'Open',
                party: 'Buyer',
                title: 'Can factor diagnostics appear in external client research notes after evaluation?',
                detail:
                    'Buyer is comfortable keeping raw replay data inside the vault, but wants to understand whether derived factor commentary can appear outside the platform.',
                owner: 'Leena Park',
                at: 'Mar 28, 2026 · 11:03 UTC',
                linkedBuyerRoute: '/datasets/3/rights-quote'
            },
            {
                id: 'neg-1002-c1',
                type: 'clarification',
                status: 'Resolved',
                party: 'Provider',
                title: 'Provider confirmed the current package is replay-only and internal-use only.',
                detail:
                    'Factor diagnostics can be reviewed internally during evaluation, but anything that resembles redistribution or external commentary remains outside the current package.',
                owner: 'Jonas Ilyas',
                at: 'Mar 28, 2026 · 15:26 UTC',
                linkedSurfaceKey: 'provider-packet'
            },
            {
                id: 'neg-1002-r1',
                type: 'redline',
                status: 'Needs review',
                party: 'Commercial',
                title: 'Commercial redline proposes a shorter replay window before revalidation.',
                detail:
                    'The original request referenced a broader research horizon. Commercial review wants the replay term tightened to match the 90-day evaluation lane already used elsewhere in the platform.',
                owner: 'Omar Siddiqui',
                at: 'Mar 29, 2026 · 09:42 UTC',
                linkedBuyerRoute: '/datasets/3/rights-quote'
            },
            {
                id: 'neg-1002-res1',
                type: 'resolution',
                status: 'Resolved',
                party: 'Governance',
                title: 'Audit logging and replay-export review were accepted without further edits.',
                detail:
                    'This closes the earlier review queue question around whether replay-derived exports would follow the same reviewer path as raw vault output.',
                owner: 'Faris Noor',
                at: 'Mar 30, 2026 · 10:08 UTC',
                linkedSurfaceKey: 'approval'
            }
        ],
        scopeChanges: [
            {
                id: 'scope-1002-1',
                title: 'Replay entitlement window narrowed for the first evaluation',
                status: 'Accepted',
                at: 'Mar 29, 2026 · 09:42 UTC',
                owner: 'Commercial review',
                summary: 'The request originally implied a broader backtesting horizon. The accepted scope narrows the first evaluation to a 90-day replay lane.',
                from: 'Longer replay horizon for backtesting and factor research',
                to: '90-day governed replay evaluation with required revalidation',
                impact: 'Makes the commercial transition explicit and avoids implying long-term production entitlements.'
            }
        ],
        redlines: [
            {
                id: 'red-1002-1',
                clause: 'External commentary',
                status: 'Countered',
                owner: 'Provider rights review',
                at: 'Mar 28, 2026 · 15:26 UTC',
                requestedChange: 'Add language allowing high-level factor commentary outside the platform.',
                providerResponse: 'Provider declined and asked that all external commentary stay outside the current replay package.',
                linkedControl: 'Provider packet allowed-use boundary'
            },
            {
                id: 'red-1002-2',
                clause: 'Replay term',
                status: 'Open',
                owner: 'Commercial review',
                at: 'Mar 29, 2026 · 09:42 UTC',
                requestedChange: 'Explicitly cap the first evaluation at 90 days before revalidation.',
                providerResponse: 'Provider is comfortable if the cap is paired with a later amendment path for production use.',
                linkedControl: 'Rights quote duration term'
            }
        ],
        resolvedItems: [
            {
                id: 'res-1002-1',
                title: 'Replay-export review path aligned with audit controls',
                resolvedBy: 'Governance review',
                resolvedAt: 'Mar 30, 2026 · 10:08 UTC',
                resolution: 'Derived replay summaries will use the same reviewer queue and watermarking path as other governed exports.'
            }
        ]
    },
    'DL-1003': {
        summary:
            'The mobility evaluation is negotiating planning-only rights, whether aggregate simulation outputs can leave the region, and how clearly the provider needs raw-coordinate restrictions reflected in the first scope.',
        nextAction:
            'Close the live-stream export redline and confirm that aggregate simulation summaries remain planning-only before approval advances.',
        participantSummary: [
            'Buyer wants route-stress scores and simulation summaries for municipal planning.',
            'Provider is keeping raw coordinate joins and unrestricted live stream reuse outside the first evaluation scope.',
            'Governance is treating cross-region simulation summaries as a controlled exception path rather than a default right.'
        ],
        entries: [
            {
                id: 'neg-1003-q1',
                type: 'question',
                status: 'Open',
                party: 'Buyer',
                title: 'Can aggregate simulation summaries be reviewed outside the primary region if raw coordinates never leave the enclave?',
                detail:
                    'Buyer is not asking for raw telemetry movement, but wants to know whether aggregate route-stress metrics can be shared with cross-region planning stakeholders.',
                owner: 'Rania Suleiman',
                at: 'Mar 29, 2026 · 10:12 UTC',
                linkedBuyerRoute: '/datasets/2/rights-quote'
            },
            {
                id: 'neg-1003-c1',
                type: 'clarification',
                status: 'Needs review',
                party: 'Provider',
                title: 'Provider reiterated that raw coordinate joins remain prohibited in the first evaluation.',
                detail:
                    'Provider is open to aggregate planning metrics, but wants the initial scope to say clearly that no direct location joins or live stream copy-out paths are included.',
                owner: 'Faris Nadeem',
                at: 'Mar 29, 2026 · 16:40 UTC',
                linkedSurfaceKey: 'provider-packet'
            },
            {
                id: 'neg-1003-s1',
                type: 'scope_change',
                status: 'Needs review',
                party: 'Governance',
                title: 'Scope change converts the initial ask into a planning-only evaluation lane.',
                detail:
                    'Governance wants the first mobility evaluation to speak only about planning, congestion forecasting, and aggregate route-stress outputs.',
                owner: 'Salman Farooq',
                at: 'Mar 30, 2026 · 09:51 UTC',
                linkedSurfaceKey: 'approval'
            },
            {
                id: 'neg-1003-r1',
                type: 'redline',
                status: 'Open',
                party: 'Commercial',
                title: 'Commercial redline removes live websocket export language from the first evaluation term.',
                detail:
                    'The request currently mentions streaming workflows alongside the workspace. The redline moves live streaming into a later amendment so the first deal stays closer to clean-room evaluation.',
                owner: 'Omar Siddiqui',
                at: 'Mar 30, 2026 · 13:14 UTC',
                linkedBuyerRoute: '/datasets/2/rights-quote'
            },
            {
                id: 'neg-1003-res1',
                type: 'resolution',
                status: 'Resolved',
                party: 'Provider',
                title: 'Provider accepted aggregate route-stress outputs as long as planning-only language remains explicit.',
                detail:
                    'This resolves the earlier ambiguity around whether all simulation outputs were blocked; aggregate planning metrics can move through output review.',
                owner: 'Imran Vohra',
                at: 'Mar 31, 2026 · 08:42 UTC'
            }
        ],
        scopeChanges: [
            {
                id: 'scope-1003-1',
                title: 'Initial mobility scope narrowed to planning-only metrics',
                status: 'Needs review',
                at: 'Mar 30, 2026 · 09:51 UTC',
                owner: 'Governance review',
                summary: 'The buyer’s request referenced simulation and streaming together. The proposed scope narrows the first evaluation to planning-only metrics and forecast outputs.',
                from: 'Streaming websocket access plus simulation outputs for route anomaly analysis',
                to: 'Governed planning metrics, aggregate route-stress scores, and reviewed simulation summaries only',
                impact: 'Keeps the first evaluation aligned with the provider’s planning-only boundaries and lowers export risk.'
            }
        ],
        redlines: [
            {
                id: 'red-1003-1',
                clause: 'Live stream access',
                status: 'Open',
                owner: 'Commercial review',
                at: 'Mar 30, 2026 · 13:14 UTC',
                requestedChange: 'Remove live websocket export language from the initial commercial term.',
                providerResponse: 'Provider prefers to discuss live stream activation only after the planning-only evaluation succeeds.',
                linkedControl: 'Initial delivery and production expansion boundary'
            },
            {
                id: 'red-1003-2',
                clause: 'Cross-region simulation summaries',
                status: 'Countered',
                owner: 'Governance review',
                at: 'Mar 30, 2026 · 15:09 UTC',
                requestedChange: 'Allow aggregate simulation summaries to be routed to approved cross-region stakeholders.',
                providerResponse: 'Provider asked that any cross-region summary remain explicitly review-gated and planning-only.',
                linkedControl: 'Residency and output-review gate'
            }
        ],
        resolvedItems: [
            {
                id: 'res-1003-1',
                title: 'Aggregate route-stress outputs accepted',
                resolvedBy: 'Provider and governance review',
                resolvedAt: 'Mar 31, 2026 · 08:42 UTC',
                resolution: 'Aggregate route-stress metrics can move through output review as long as planning-only language stays explicit.'
            }
        ]
    }
}

const typeLabels: Record<NegotiationEntryType, string> = {
    question: 'Buyer question',
    answer: 'Direct answer',
    clarification: 'Provider clarification',
    redline: 'Redline',
    scope_change: 'Scope change',
    resolution: 'Resolved item'
}

const toneFromStatus = (status: NegotiationEntryStatus): DealArtifactPreviewTone => {
    if (status === 'Resolved') return 'emerald'
    if (status === 'Needs review') return 'amber'
    return 'cyan'
}

const toneFromOpenItem = (detail: string): DealArtifactPreviewTone => {
    if (/missing|blocked|restriction|prohibited|cross-border|export/i.test(detail)) return 'amber'
    return 'cyan'
}

const resolveEntryLink = (
    context: DealRouteContext,
    entry: NegotiationSeed['entries'][number]
) => {
    if (entry.linkedSurfaceKey) {
        return {
            label: entry.linkedSurfaceKey === 'provider-packet' ? 'Provider packet' : 'Approval artifact',
            to: context.routeTargets[entry.linkedSurfaceKey]
        }
    }

    if (entry.linkedBuyerRoute) {
        return {
            label: 'Rights package',
            to: entry.linkedBuyerRoute
        }
    }

    return {}
}

const resolveOverallTone = (openItems: NegotiationOpenItem[], redlines: NegotiationRedline[]) => {
    if (redlines.some(redline => redline.status === 'Open') && openItems.length >= 3) return 'amber'
    if (openItems.length === 0) return 'emerald'
    return 'cyan'
}

export const buildNegotiationThread = (
    context: DealRouteContext
): NegotiationThreadModel => {
    const seed = THREAD_SEEDS[context.seed.dealId]
    const proofBundle = buildDealDossierProofBundle(context)
    const packet = buildProviderRightsPacket(
        context,
        loadProviderPacketDraft(context.seed.dealId)
    )

    const entries = seed.entries.map(entry => {
        const link = resolveEntryLink(context, entry)
        return {
            ...entry,
            linkedSurfaceLabel: link.label,
            linkedSurfaceTo: link.to
        }
    })

    const openItems: NegotiationOpenItem[] = [
        ...entries
            .filter(entry => entry.status !== 'Resolved')
            .map(entry => ({
                id: entry.id,
                title: `${typeLabels[entry.type]} · ${entry.title}`,
                owner: entry.owner,
                detail: entry.detail,
                tone: toneFromStatus(entry.status)
            })),
        ...proofBundle.approvalBlockers.slice(0, 2).map(blocker => ({
            id: blocker.id,
            title: blocker.blocker,
            owner: blocker.owner,
            detail: `Approval blocker still visible in the shared signoff object. Deadline ${blocker.deadline}.`,
            tone: (blocker.severity === 'High' ? 'rose' : 'amber') as DealArtifactPreviewTone
        })),
        ...packet.unresolvedExceptions.slice(0, 2).map(exception => ({
            id: exception.id,
            title: exception.title,
            owner: exception.owner,
            detail: exception.detail,
            tone: toneFromOpenItem(exception.detail)
        }))
    ].slice(0, 6)

    const resolvedCount =
        seed.resolvedItems.length +
        entries.filter(entry => entry.status === 'Resolved').length
    const openCount =
        entries.filter(entry => entry.status !== 'Resolved').length +
        seed.redlines.filter(redline => redline.status !== 'Provider accepted').length
    const overallTone = resolveOverallTone(openItems, seed.redlines)
    const overallStatus =
        overallTone === 'amber'
            ? 'Active negotiation'
            : overallTone === 'emerald'
                ? 'Negotiation closed'
                : 'Clarification thread open'

    return {
        threadId: `NEG-${context.seed.dealId}`,
        dealId: context.seed.dealId,
        title: 'Clarification & Negotiation History',
        summary: seed.summary,
        overallStatus,
        overallTone,
        nextAction: seed.nextAction,
        participantSummary: seed.participantSummary,
        metrics: [
            {
                label: 'Open items',
                value: `${openCount}`,
                detail: 'Questions, clarifications, or redlines still active',
                tone: openCount > 0 ? 'amber' : 'emerald'
            },
            {
                label: 'Scope changes',
                value: `${seed.scopeChanges.length}`,
                detail: 'Structured scope deltas tracked as first-class history',
                tone: 'cyan'
            },
            {
                label: 'Redlines',
                value: `${seed.redlines.length}`,
                detail: 'Commercial or policy wording still under negotiation',
                tone: seed.redlines.some(redline => redline.status === 'Open') ? 'amber' : 'emerald'
            },
            {
                label: 'Resolved items',
                value: `${resolvedCount}`,
                detail: 'Questions or disputes already closed out',
                tone: resolvedCount > 0 ? 'emerald' : 'slate'
            }
        ],
        entries,
        scopeChanges: seed.scopeChanges,
        redlines: seed.redlines,
        resolvedItems: seed.resolvedItems,
        openItems
    }
}
