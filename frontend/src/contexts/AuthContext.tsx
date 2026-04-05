import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { clearOnboardingState } from '../onboarding/storage'

export type AccessApplicationStatus = 'not_started' | 'pending' | 'approved'

type AuthContextValue = {
    isAuthenticated: boolean
    isAdmin: boolean
    accessStatus: AccessApplicationStatus
    onboardingInitiated: boolean
    applicantEmail: string
    signIn: () => boolean
    signInAdmin: (email: string, password: string) => boolean
    signOut: () => void
    startOnboarding: () => void
    submitApplication: (officialWorkEmail: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_AUTH = 'Redoubt:isAuthenticated'
const STORAGE_ACCESS_STATUS = 'Redoubt:accessStatus'
const STORAGE_ONBOARDING_INITIATED = 'Redoubt:onboardingInitiated'
const STORAGE_APPLICANT_EMAIL = 'Redoubt:applicantEmail'
const STORAGE_IS_ADMIN = 'Redoubt:isAdmin'

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
    const [isAdmin, setIsAdmin] = useState<boolean>(() => {
        const stored = localStorage.getItem(STORAGE_IS_ADMIN)
        if (stored !== null) return stored === 'true'
        return false
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

    useEffect(() => {
        localStorage.setItem(STORAGE_IS_ADMIN, String(isAdmin))
    }, [isAdmin])

    const signIn = () => {
        const canAccessWorkspace =
            accessStatus === 'approved' ||
            (MOCK_AUTH && (accessStatus === 'pending' || accessStatus === 'not_started'))
        if (!canAccessWorkspace) return false
        setIsAuthenticated(true)
        setIsAdmin(false)
        return true
    }

    const signInAdmin = (email: string, password: string) => {
        // Demo admin credentials
        if (email === 'admin@redoubt.io' && password === 'admin123') {
            setIsAuthenticated(true)
            setIsAdmin(true)
            return true
        }
        return false
    }

    const signOut = () => {
        setIsAuthenticated(false)
        setIsAdmin(false)
        localStorage.removeItem(STORAGE_AUTH)
        localStorage.removeItem(STORAGE_IS_ADMIN)
    }

    const startOnboarding = () => {
        if (MOCK_AUTH) {
            // In mock mode allow re-running onboarding end-to-end without manual storage resets.
            clearOnboardingState()
            setAccessStatus('not_started')
            setOnboardingInitiated(true)
            setIsAuthenticated(false)
            setApplicantEmail('')
            return
        }

        if (accessStatus === 'not_started') {
            clearOnboardingState()
            setOnboardingInitiated(true)
            setApplicantEmail('')
        }
    }

    const submitApplication = (officialWorkEmail: string) => {
        setApplicantEmail(officialWorkEmail.trim())
        setAccessStatus('pending')
        setOnboardingInitiated(false)
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isAdmin,
                accessStatus,
                onboardingInitiated,
                applicantEmail,
                signIn,
                signInAdmin,
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
