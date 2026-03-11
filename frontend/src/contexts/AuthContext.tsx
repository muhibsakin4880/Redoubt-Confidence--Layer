import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type AccessApplicationStatus = 'not_started' | 'pending' | 'approved'

type AuthContextValue = {
    isAuthenticated: boolean
    accessStatus: AccessApplicationStatus
    onboardingInitiated: boolean
    applicantEmail: string
    signIn: () => boolean
    signOut: () => void
    startOnboarding: () => void
    submitApplication: (officialWorkEmail: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_AUTH = 'Redoubt:isAuthenticated'
const STORAGE_ACCESS_STATUS = 'Redoubt:accessStatus'
const STORAGE_ONBOARDING_INITIATED = 'Redoubt:onboardingInitiated'
const STORAGE_APPLICANT_EMAIL = 'Redoubt:applicantEmail'

// Enable a fully client-side experience when there is no backend.
// Default is ON for development; set VITE_MOCK_AUTH=false to restore strict gating.
const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

const isAccessStatus = (value: string | null): value is AccessApplicationStatus =>
    value === 'not_started' || value === 'pending' || value === 'approved'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const stored = localStorage.getItem(STORAGE_AUTH)
        if (stored !== null) return stored === 'true'
        // Even in mock mode, users should explicitly sign in from the login screen.
        return false
    })
    const [accessStatus, setAccessStatus] = useState<AccessApplicationStatus>(() => {
        const storedStatus = localStorage.getItem(STORAGE_ACCESS_STATUS)
        if (isAccessStatus(storedStatus)) {
            if (MOCK_AUTH && storedStatus === 'pending') return 'approved'
            return storedStatus
        }
        return MOCK_AUTH ? 'approved' : 'not_started'
    })
    const [onboardingInitiated, setOnboardingInitiated] = useState<boolean>(() => {
        const stored = localStorage.getItem(STORAGE_ONBOARDING_INITIATED)
        // Default to false in mock mode so users land on the product instead of the wizard
        if (stored !== null) return stored === 'true'
        return MOCK_AUTH ? false : true
    })
    const [applicantEmail, setApplicantEmail] = useState<string>(() => {
        const stored = localStorage.getItem(STORAGE_APPLICANT_EMAIL)
        if (stored !== null) return stored
        return MOCK_AUTH ? 'demo@redoubt.local' : ''
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_AUTH, String(isAuthenticated))
    }, [isAuthenticated])

    useEffect(() => {
        localStorage.setItem(STORAGE_ACCESS_STATUS, accessStatus)
    }, [accessStatus])

    useEffect(() => {
        localStorage.setItem(STORAGE_ONBOARDING_INITIATED, String(onboardingInitiated))
    }, [onboardingInitiated])

    useEffect(() => {
        localStorage.setItem(STORAGE_APPLICANT_EMAIL, applicantEmail)
    }, [applicantEmail])

    const signIn = () => {
        if (MOCK_AUTH) {
            setAccessStatus('approved')
            setIsAuthenticated(true)
            return true
        }

        if (accessStatus !== 'approved') return false
        setIsAuthenticated(true)
        return true
    }

    const signOut = () => {
        setIsAuthenticated(false)
        localStorage.removeItem(STORAGE_AUTH)
    }

    const startOnboarding = () => {
        if (MOCK_AUTH) {
            // In mock mode allow re-running onboarding end-to-end without manual storage resets.
            setAccessStatus('not_started')
            setOnboardingInitiated(true)
            setIsAuthenticated(false)
            return
        }

        if (accessStatus === 'not_started') {
            setOnboardingInitiated(true)
        }
    }

    const submitApplication = (officialWorkEmail: string) => {
        setApplicantEmail(officialWorkEmail.trim())
        if (MOCK_AUTH) {
            setAccessStatus('approved')
            setOnboardingInitiated(false)
            setIsAuthenticated(false)
            return
        }
        setAccessStatus('pending')
        setOnboardingInitiated(false)
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                accessStatus,
                onboardingInitiated,
                applicantEmail,
                signIn,
                signOut,
                startOnboarding,
                submitApplication
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

