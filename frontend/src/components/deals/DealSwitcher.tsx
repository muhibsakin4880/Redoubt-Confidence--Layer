import { useNavigate } from 'react-router-dom'
import { loadDealRouteContexts, type DealRouteContext } from '../../domain/dealDossier'

type DealSwitcherProps = {
    context: DealRouteContext
    demo?: boolean
}

export default function DealSwitcher({
    context,
    demo = false
}: DealSwitcherProps) {
    const navigate = useNavigate()
    const contexts = loadDealRouteContexts()
    const generatedCount = contexts.filter(item => item.routeKind === 'derived').length

    return (
        <div className="w-full min-w-0 rounded-2xl border border-white/10 bg-slate-950/55 p-3 lg:w-[360px]">
            <label
                htmlFor="deal-switcher"
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
                Switch evaluation dossier
            </label>
            <select
                id="deal-switcher"
                value={context.seed.dealId}
                onChange={event => {
                    const nextContext = contexts.find(item => item.seed.dealId === event.target.value)
                    if (!nextContext) return
                    navigate(demo ? nextContext.demoTargets.dossier : nextContext.routeTargets.dossier)
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-sm font-semibold text-white outline-none transition-colors hover:border-cyan-400/40 focus:border-cyan-400/60"
            >
                {contexts.map(item => (
                    <option key={item.seed.dealId} value={item.seed.dealId}>
                        {item.seed.dealId} · {item.dataset?.title ?? item.seed.label}
                    </option>
                ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span>{contexts.length} dataset deals</span>
                <span>·</span>
                <span>{generatedCount} generated from dataset catalog</span>
            </div>
        </div>
    )
}
