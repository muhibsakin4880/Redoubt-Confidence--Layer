const freeEmailProviders = new Set([
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'protonmail.com'
])

export const MIN_USE_CASE_SUMMARY_LENGTH = 30
export const MAX_USE_CASE_SUMMARY_LENGTH = 280

export const isWorkEmail = (value: string) => /^[^\s@]+@[^\s@]+$/.test(value)

export const getEmailDomain = (value: string) => value.trim().split('@')[1]?.toLowerCase() ?? ''

export const normalizeCorporateDomain = (value: string) => value.trim().toLowerCase()

export const isCorporateEmail = (value: string) => {
    if (!isWorkEmail(value)) return false

    const domain = getEmailDomain(value)
    return Boolean(domain) && !freeEmailProviders.has(domain)
}

export const doesCorporateDomainMatchEmail = (email: string, corporateDomain: string) => {
    const emailDomain = getEmailDomain(email)
    const normalizedCorporateDomain = normalizeCorporateDomain(corporateDomain)

    return Boolean(emailDomain) && emailDomain === normalizedCorporateDomain
}

export const isInviteCodeValid = (value: string) => {
    const trimmedValue = value.trim()
    return trimmedValue.length === 0 || trimmedValue.length >= 6
}

export const isUseCaseSummaryValid = (value: string) => {
    const trimmedValue = value.trim()
    return (
        trimmedValue.length >= MIN_USE_CASE_SUMMARY_LENGTH &&
        trimmedValue.length <= MAX_USE_CASE_SUMMARY_LENGTH
    )
}
