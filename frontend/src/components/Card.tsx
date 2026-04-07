import type { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`rounded-[12px] border border-white/10 bg-slate-800/30 p-4 ${className}`}>
            {children}
        </div>
    )
}
