const freeEmailProviders = new Set([
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'protonmail.com'
])

export const isWorkEmail = (value: string) => /^[^\s@]+@[^\s@]+$/.test(value)

export const isCorporateEmail = (value: string) => {
    if (!isWorkEmail(value)) return false

    const domain = value.split('@')[1]?.toLowerCase()
    return Boolean(domain) && !freeEmailProviders.has(domain)
}

export const isInviteCodeValid = (value: string) => {
    const trimmedValue = value.trim()
    return trimmedValue.length === 0 || trimmedValue.length >= 6
}
