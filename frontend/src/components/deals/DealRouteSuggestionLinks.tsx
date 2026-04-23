import { Link } from 'react-router-dom'
import {
    DEAL_SURFACE_META,
    type DealSurfaceKey,
    type DemoDealSurfaceKey
} from '../../data/dealDossierData'
import { loadDealRouteContexts } from '../../domain/dealDossier'

type DealRouteSuggestionLinksProps = {
    surface?: DealSurfaceKey
    demo?: boolean
}

const demoSurfaces = new Set<DealSurfaceKey>(['dossier', 'provider-packet', 'output-review'])

export default function DealRouteSuggestionLinks({
    surface = 'dossier',
    demo = false
}: DealRouteSuggestionLinksProps) {
    const contexts = loadDealRouteContexts()

    return (
        <div className="mt-6 flex flex-wrap gap-3">
            {contexts.map(context => {
                const demoSurface = demoSurfaces.has(surface) ? surface as DemoDealSurfaceKey : null
                const href = demo && demoSurface
                    ? context.demoTargets[demoSurface]
                    : context.routeTargets[surface]
                const isPlaceholder = context.surfaceAvailability[surface] === 'placeholder'

                return (
                    <Link
                        key={`${context.seed.dealId}-${surface}`}
                        to={href}
                        className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                    >
                        <span>{context.seed.dealId} · {context.dataset?.title ?? context.seed.label}</span>
                        {isPlaceholder ? (
                            <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-amber-100">
                                Placeholder
                            </span>
                        ) : null}
                        <span className="sr-only">Open {DEAL_SURFACE_META[surface].label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
