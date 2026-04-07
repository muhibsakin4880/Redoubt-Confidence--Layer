export const dashboardSpacingTokens = {
    'space-2': 'gap-2',
    'space-3': 'gap-3',
    'space-4': 'gap-4',
    'space-6': 'gap-6',
    'stack-3': 'space-y-3',
    'stack-4': 'space-y-4',
    'page-padding': 'px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-8',
    'hero-padding': 'px-5 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-7',
    'section-gap': 'mb-8',
    'section-intro': 'mb-5',
    'panel-padding': 'p-5 sm:p-6',
    'card-padding': 'px-4 py-4 sm:px-5 sm:py-5',
    'card-padding-compact': 'px-4 py-3 sm:px-5 sm:py-4',
    'empty-padding-compact': 'px-3 py-4',
    'chip-padding': 'px-3 py-1.5',
    'button-padding': 'px-4 py-2.5',
    'button-padding-tall': 'px-5 py-3',
    'panel-body-gap': 'mt-4',
    'title-gap': 'mt-2',
    'detail-gap': 'mt-3',
    'meta-gap': 'mt-2'
} as const

export const dashboardRadiusTokens = {
    'radius-sm': 'rounded-lg',
    'radius-md': 'rounded-2xl',
    'radius-lg': 'rounded-[28px]',
    'radius-pill': 'rounded-full'
} as const

export const dashboardShadowTokens = {
    'shadow-card': 'shadow-[0_24px_60px_-42px_rgba(2,6,23,0.95)]',
    'shadow-hero': 'shadow-[0_35px_90px_-48px_rgba(34,211,238,0.32)]',
    'shadow-float': 'shadow-[0_30px_70px_-45px_rgba(2,6,23,0.95)]',
    'shadow-tooltip': 'shadow-[0_16px_30px_-18px_rgba(2,6,23,0.95)]'
} as const

export const dashboardTypographyTokens = {
    'text-eyebrow': 'text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500',
    'text-hero-eyebrow': 'text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-200/70',
    'text-hero-title': 'text-[2rem] font-semibold tracking-[-0.045em] text-slate-50 sm:text-[2.4rem] xl:text-[2.8rem]',
    'text-section-title': 'text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-50',
    'text-panel-title': 'text-[1.05rem] font-semibold tracking-[-0.025em] text-slate-50',
    'text-item-title': 'text-[0.95rem] font-semibold tracking-[-0.02em] text-slate-50',
    'text-body': 'text-sm leading-6 text-slate-400',
    'text-body-strong': 'text-sm leading-6 text-slate-300',
    'text-muted': 'text-xs leading-5 text-slate-500',
    'text-muted-strong': 'text-xs font-medium leading-5 text-slate-300',
    'text-value': 'text-[1.9rem] font-semibold tracking-[-0.06em] text-slate-50'
} as const

export const dashboardColorTokens = {
    'surface-page': 'bg-[#0B1221]',
    'surface-panel': 'bg-[#131B2F]/92 backdrop-blur-sm',
    'surface-card': 'bg-[#10192E]/92',
    'surface-card-soft': 'bg-[#17233B]/70',
    'surface-accent': 'bg-cyan-400/[0.07]',
    'surface-overlay': 'bg-[#09111F]/90',
    'surface-overlay-soft': 'bg-[#0D162A]/80',
    'surface-empty': 'bg-[#10192E]/65',
    'surface-success': 'bg-emerald-500/10',
    'surface-tooltip': 'bg-[#0B1221]',
    'text-primary': 'text-white',
    'text-strong': 'text-slate-100',
    'text-accent': 'text-cyan-300',
    'text-accent-soft': 'text-cyan-200',
    'text-success': 'text-emerald-100',
    'text-inverse': 'text-slate-950',
    'border-subtle': 'border-[#23314F]',
    'border-card': 'border-[#22304D]/90',
    'border-soft': 'border-[#22304D]/70',
    'border-accent': 'border-cyan-400/25',
    'border-success': 'border-emerald-500/30',
    'state-completed-badge': 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    'state-completed-marker': 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    'state-progress-badge': 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
    'state-progress-marker': 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
    'state-upcoming-badge': 'border border-amber-500/30 bg-amber-500/10 text-amber-200',
    'state-upcoming-marker': 'border-amber-500/40 bg-amber-500/15 text-amber-200'
} as const

export const dashboardComponentTokens = {
    'page-background':
        'pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(34,211,238,0.12),transparent_22%),radial-gradient(circle_at_85%_10%,rgba(45,212,191,0.08),transparent_18%),linear-gradient(180deg,rgba(8,15,29,0),rgba(8,15,29,0.65))]',
    'hero-surface':
        'relative overflow-hidden border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(8,15,29,0.96),rgba(17,27,47,0.92)_42%,rgba(12,20,36,0.98))] shadow-[0_35px_90px_-48px_rgba(34,211,238,0.32)]',
    'status-badge': 'border border-emerald-400/20 bg-emerald-400/10 text-xs font-medium text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    'metric-chip': 'border border-white/10 bg-slate-950/45',
    'action-button':
        'inline-flex items-center justify-center bg-cyan-400 text-[13px] font-semibold tracking-[-0.01em] text-[#04101d] shadow-[0_18px_40px_-24px_rgba(34,211,238,0.75)] transition-all duration-200 hover:-translate-y-px hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    'floating-rail': 'pointer-events-auto border border-[#22304D]/90 bg-[#0D1528]/88 p-3 backdrop-blur-2xl',
    'card-soft': 'border border-[#23314F]/90 bg-[#131D33]/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
    tooltip:
        'pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap border border-[#22304D]/90 bg-[#0B1221] px-3 py-2 text-xs font-medium text-slate-100 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
    'empty-border': 'border border-dashed border-[#25324E] bg-[#10192E]/65',
    'placeholder-surface': 'rounded-lg border border-white/6 bg-slate-950/45',
    'icon-well': 'flex h-10 w-10 items-center justify-center rounded-2xl border border-[#23314F] bg-[#0A1324] text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
    'quick-action-button':
        'flex h-12 w-12 items-center justify-center rounded-2xl border border-[#23314F] bg-[#0B1221] text-slate-100 transition-all duration-200 group-hover:-translate-y-px group-hover:border-cyan-400/40 group-hover:bg-cyan-400/10 group-hover:text-cyan-200 group-focus-within:-translate-y-px group-focus-within:border-cyan-400/40 group-focus-within:bg-cyan-400/10 group-focus-within:text-cyan-200',
    'focus-ring':
        'rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    'skeleton-action': 'h-12 w-12 animate-pulse rounded-2xl border border-[#23314F] bg-slate-800/80'
} as const
