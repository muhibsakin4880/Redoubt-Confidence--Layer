type LogoMarkProps = {
    className?: string
}

const AZURE = '#1E6CFF'
const OBSIDIAN = '#0B0F14'

export default function LogoMark({ className }: LogoMarkProps) {
    return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <rect x="6" y="6" width="10" height="36" fill={AZURE} />
            <rect x="16" y="6" width="22" height="16" fill={AZURE} />
            <rect x="16" y="22" width="14" height="8" fill={AZURE} />
            <polygon points="16 30 30 30 42 42 28 42" fill={AZURE} />
            <rect x="22" y="10" width="10" height="8" fill={OBSIDIAN} />
        </svg>
    )
}
