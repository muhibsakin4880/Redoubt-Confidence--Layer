import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    participantOnboardingPaths,
    participantOnboardingVerificationSummary
} from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { isStep4Complete } from '../onboarding/flow'
import {
    emptyVerificationSnapshot,
    onboardingStorageKeys,
    readOnboardingValue,
    writeOnboardingValue
} from '../onboarding/storage'
import type { AuthenticationMethod, RightsPackage } from '../onboarding/types'

const accessTypeOptions = [
    { value: 'metadata_only', label: 'Metadata Only' },
    { value: 'aggregated', label: 'Aggregated / Anonymized Data' },
    { value: 'api_access', label: 'API Access (controlled)' },
    { value: 'clean_room', label: 'Clean Room / Governed Workspace' },
    { value: 'full_raw', label: 'Full Raw Access (with approval)' }
]

const durationOptions = [
    { value: '3_months', label: '3 months' },
    { value: '6_months', label: '6 months' },
    { value: '12_months', label: '12 months' },
    { value: '24_months', label: '24 months' },
    { value: 'custom', label: 'Custom' }
]

const usagePurposeOptions = [
    { value: 'research', label: 'Research & Analysis' },
    { value: 'commercial', label: 'Commercial / Product Development' },
    { value: 'internal_analytics', label: 'Internal Analytics' },
    { value: 'model_training', label: 'Model Training' },
    { value: 'other', label: 'Others' }
]

const regionOptions = [
    { value: 'eu', label: 'EU' },
    { value: 'usa', label: 'USA' },
    { value: 'gcc', label: 'GCC' },
    { value: 'apac', label: 'APAC' },
    { value: 'latam', label: 'LATAM' },
    { value: 'mena', label: 'MENA' }
]

const emptyRightsPackage: RightsPackage = {
    accessType: '',
    duration: '',
    usagePurposes: [],
    otherUsagePurpose: '',
    geographicRestriction: 'global',
    selectedRegions: [],
    fieldRestrictions: [],
    additionalConditions: {
        attributionRequired: false,
        auditLoggingMandatory: false,
        noRedistribution: false
    },
    advancedConditions: {
        redistributionRights: 'not_allowed',
        auditLoggingRequirement: 'mandatory',
        attributionRequirement: 'required',
        volumeBasedPricing: false,
        volumePricingAdjustment: 0,
        volumePricingUnit: 'tb'
    }
}

const getAccessLabel = (value: string) => accessTypeOptions.find(o => o.value === value)?.label ?? value
const getDurationLabel = (value: string, customValue?: string) => {
    if (value === 'custom' && customValue) return customValue
    return durationOptions.find(o => o.value === value)?.label ?? value
}
const getUsageLabel = (value: string) => usagePurposeOptions.find(o => o.value === value)?.label ?? value
const getRegionLabel = (value: string) => regionOptions.find(o => o.value === value)?.label ?? value

const allowedFileExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const maxFileSizeBytes = 5 * 1024 * 1024

export default function OnboardingStep4() {
    const navigate = useNavigate()
    const snapshot = readOnboardingValue(onboardingStorageKeys.verification, emptyVerificationSnapshot)
    const linkedInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const dnsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
    const [isLinkedInConnected, setIsLinkedInConnected] = useState(snapshot.linkedInConnected)
    const [isDNSVerifying, setIsDNSVerifying] = useState(false)
    const [isDomainVerified, setIsDomainVerified] = useState(snapshot.domainVerified)
    const [affiliationFileName, setAffiliationFileName] = useState<string | null>(snapshot.affiliationFileName)
    const [authorizationFileName, setAuthorizationFileName] = useState<string | null>(snapshot.authorizationFileName)
    const [authenticationMethod, setAuthenticationMethod] = useState<AuthenticationMethod | null>(snapshot.authenticationMethod)
    const [ssoDomain, setSSODomain] = useState(snapshot.ssoDomain)
    const [affiliationError, setAffiliationError] = useState<string | null>(null)
    const [authorizationError, setAuthorizationError] = useState<string | null>(null)
    const [dragTarget, setDragTarget] = useState<'affiliation' | 'authorization' | null>(null)
    const [showError, setShowError] = useState(false)
    const [corporateDomain, setCorporateDomain] = useState('')
    const [domainVerificationStep, setDomainVerificationStep] = useState<1 | 2 | 3>(1)
    const [verificationCode, setVerificationCode] = useState('')
    const [rightsPackage, setRightsPackage] = useState<RightsPackage>(snapshot.rightsPackage ?? { ...emptyRightsPackage })
    const [newFieldName, setNewFieldName] = useState('')
    const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false)

    useEffect(() => {
        if (!verificationCode) {
            const randomCode = 'RDT-' + Math.random().toString(36).substring(2, 10)
            setVerificationCode(randomCode)
        }
    }, [verificationCode])

    useEffect(() => {
        return () => {
            if (linkedInTimerRef.current) {
                clearTimeout(linkedInTimerRef.current)
            }
            if (dnsTimerRef.current) {
                clearTimeout(dnsTimerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        writeOnboardingValue(onboardingStorageKeys.verification, {
            linkedInConnected: isLinkedInConnected,
            domainVerified: isDomainVerified,
            affiliationFileName,
            authorizationFileName,
            authenticationMethod,
            ssoDomain,
            rightsPackage
        })
    }, [isLinkedInConnected, isDomainVerified, affiliationFileName, authorizationFileName, authenticationMethod, ssoDomain, rightsPackage])

    const handleLinkedInConnect = () => {
        if (isLinkedInLoading || isLinkedInConnected) return
        setIsLinkedInLoading(true)
        linkedInTimerRef.current = setTimeout(() => {
            setIsLinkedInLoading(false)
            setIsLinkedInConnected(true)
        }, 1600)
    }

    const handleDNSVerification = () => {
        if (isDNSVerifying || isDomainVerified) return
        setDomainVerificationStep(3)
        setIsDNSVerifying(true)
        dnsTimerRef.current = setTimeout(() => {
            setIsDNSVerifying(false)
            setIsDomainVerified(true)
        }, 2000)
    }

    const handleFileSelection = (file: File | null | undefined, target: 'affiliation' | 'authorization') => {
        if (!file) return

        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        const setFileName = target === 'affiliation' ? setAffiliationFileName : setAuthorizationFileName
        const setError = target === 'affiliation' ? setAffiliationError : setAuthorizationError

        if (!fileExtension || !allowedFileExtensions.has(fileExtension)) {
            setError('Only PDF, JPG, and PNG files are accepted.')
            setFileName(null)
            return
        }

        if (file.size > maxFileSizeBytes) {
            setError('File size exceeds 5MB limit.')
            setFileName(null)
            return
        }

        setError(null)
        setFileName(file.name)
    }

    const handleFileDrop = (event: React.DragEvent<HTMLLabelElement>, target: 'affiliation' | 'authorization') => {
        event.preventDefault()
        setDragTarget(null)
        handleFileSelection(event.dataTransfer.files?.[0], target)
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>, target: 'affiliation' | 'authorization') => {
        handleFileSelection(event.target.files?.[0], target)
    }

    const handleAuthenticationMethodSelect = (method: AuthenticationMethod) => {
        setAuthenticationMethod(method)
    }

    const stepReady = isStep4Complete({
        linkedInConnected: isLinkedInConnected,
        domainVerified: isDomainVerified,
        affiliationFileName,
        authorizationFileName,
        authenticationMethod,
        ssoDomain,
        rightsPackage
    })

    const handleNext = () => {
        if (!stepReady) {
            setShowError(true)
            return
        }

        setShowError(false)
        navigate(participantOnboardingPaths.step5)
    }

    const handleBack = () => {
        navigate(participantOnboardingPaths.step3)
    }

    const fillMockData = () => {
        setIsLinkedInConnected(true)
        setIsDomainVerified(true)
        setAffiliationFileName('affiliation-proof.pdf')
        setAuthorizationFileName('authorization-letter.pdf')
        setAuthenticationMethod('hardware_key')
        setSSODomain('')
        setAffiliationError(null)
        setAuthorizationError(null)
        setShowError(false)
        setRightsPackage({
            accessType: 'clean_room',
            duration: '12_months',
            usagePurposes: ['research', 'model_training'],
            otherUsagePurpose: '',
            geographicRestriction: 'specific',
            selectedRegions: ['eu', 'usa'],
            fieldRestrictions: [{ fieldName: 'email', restriction: 'masked' }, { fieldName: 'ssn', restriction: 'restricted' }],
            additionalConditions: {
                attributionRequired: true,
                auditLoggingMandatory: true,
                noRedistribution: true
            }
        })
    }

    const updateRightsPackage = (updates: Partial<RightsPackage>) => {
        setRightsPackage(prev => ({ ...prev, ...updates }))
    }

    const toggleUsagePurpose = (value: string) => {
        const purposes = rightsPackage.usagePurposes.includes(value)
            ? rightsPackage.usagePurposes.filter(p => p !== value)
            : [...rightsPackage.usagePurposes, value]
        updateRightsPackage({ usagePurposes: purposes })
    }

    const toggleRegion = (value: string) => {
        const regions = rightsPackage.selectedRegions.includes(value)
            ? rightsPackage.selectedRegions.filter(r => r !== value)
            : [...rightsPackage.selectedRegions, value]
        updateRightsPackage({ selectedRegions: regions })
    }

    const addFieldRestriction = () => {
        if (!newFieldName.trim()) return
        updateRightsPackage({
            fieldRestrictions: [...rightsPackage.fieldRestrictions, { fieldName: newFieldName.trim(), restriction: 'restricted' }]
        })
        setNewFieldName('')
    }

    const removeFieldRestriction = (index: number) => {
        updateRightsPackage({
            fieldRestrictions: rightsPackage.fieldRestrictions.filter((_, i) => i !== index)
        })
    }

    const updateFieldRestriction = (index: number, restriction: 'restricted' | 'masked') => {
        const updated = [...rightsPackage.fieldRestrictions]
        updated[index] = { ...updated[index], restriction }
        updateRightsPackage({ fieldRestrictions: updated })
    }

    const updateAdditionalCondition = (key: keyof RightsPackage['additionalConditions'], value: boolean) => {
        updateRightsPackage({
            additionalConditions: { ...rightsPackage.additionalConditions, [key]: value }
        })
    }

    const updateAdvancedCondition = <T extends keyof RightsPackage['advancedConditions']>(
        key: T,
        value: RightsPackage['advancedConditions'][T]
    ) => {
        updateRightsPackage({
            advancedConditions: { ...rightsPackage.advancedConditions, [key]: value }
        })
    }

    const buildPreviewText = () => {
        const parts: string[] = []
        if (rightsPackage.accessType) {
            parts.push(`Buyers will get: ${getAccessLabel(rightsPackage.accessType)}`)
        }
        if (rightsPackage.duration) {
            parts.push(`for ${getDurationLabel(rightsPackage.duration, (rightsPackage as any).customDuration)}`)
        }
        if (rightsPackage.usagePurposes.length > 0) {
            const labels = rightsPackage.usagePurposes.map(getUsageLabel)
            if (rightsPackage.otherUsagePurpose) labels.push(rightsPackage.otherUsagePurpose)
            parts.push(`for ${labels.join(', ')} purpose${labels.length > 1 ? 's' : ''}`)
        }
        if (rightsPackage.geographicRestriction === 'specific' && rightsPackage.selectedRegions.length > 0) {
            const regions = rightsPackage.selectedRegions.map(getRegionLabel).join(', ')
            parts.push(`limited to ${regions}`)
        } else if (rightsPackage.geographicRestriction === 'global') {
            parts.push('available globally')
        }
        const conditions: string[] = []
        if (rightsPackage.additionalConditions.attributionRequired) conditions.push('attribution required')
        if (rightsPackage.additionalConditions.auditLoggingMandatory) conditions.push('audit logging mandatory')
        if (rightsPackage.additionalConditions.noRedistribution) conditions.push('no redistribution')
        if (conditions.length > 0) parts.push(`with ${conditions.join(', ')}`)
        if (rightsPackage.fieldRestrictions.length > 0) {
            const restricted = rightsPackage.fieldRestrictions.filter(f => f.restriction === 'restricted').map(f => f.fieldName)
            const masked = rightsPackage.fieldRestrictions.filter(f => f.restriction === 'masked').map(f => f.fieldName)
            const fieldParts: string[] = []
            if (restricted.length > 0) fieldParts.push(`${restricted.join(', ')} restricted`)
            if (masked.length > 0) fieldParts.push(`${masked.join(', ')} masked`)
            parts.push(`field restrictions: ${fieldParts.join('; ')}`)
        }
        return parts.length > 0 ? parts.join('. ') + '.' : 'Configure the rights package to see a preview here.'
    }

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step4}>
            <OnboardingPageLayout activeStep={4}>
                <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-5 mb-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">Verification &amp; Credentials</h2>
                        <span className="text-xs uppercase tracking-[0.14em] text-amber-200">Required</span>
                    </div>
                    <p className="text-sm text-slate-400">{participantOnboardingVerificationSummary}</p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-white">Connect LinkedIn</h3>
                                <span className="text-xs text-amber-300">Required</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Confirm the public professional profile tied to your organizational role.
                            </p>

                            <div className="mt-4">
                                {isLinkedInConnected ? (
                                    <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                                        <span aria-hidden="true">✓</span>
                                        <span>Affiliation Confirmed</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleLinkedInConnect}
                                        disabled={isLinkedInLoading}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/60"
                                    >
                                        {isLinkedInLoading ? 'Connecting...' : 'Connect LinkedIn'}
                                    </button>
                                )}
                            </div>
                        </article>

                        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-white">Corporate Domain Verification</h3>
                                <span className="text-xs text-amber-300">Required</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Verify the domain associated with your work email using a DNS TXT record check.
                            </p>

                            <div className="mt-4 space-y-4">
                                {domainVerificationStep === 1 && (
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                            Step 1: Enter your corporate domain
                                        </label>
                                        <input
                                            type="text"
                                            value={corporateDomain}
                                            onChange={(e) => setCorporateDomain(e.target.value)}
                                            placeholder="yourcompany.com"
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                )}

                                {domainVerificationStep >= 2 && corporateDomain && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                            Step 2: DNS verification
                                        </div>
                                        <p className="text-sm text-slate-300 mb-2">
                                            Add this TXT record to your DNS settings to verify ownership:
                                        </p>
                                        <div className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 font-mono text-sm text-emerald-400">
                                            redoubt-verify={verificationCode}
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Ask your IT team to add this record. Verification may take up to 24 hours.
                                        </p>
                                    </div>
                                )}

                                {domainVerificationStep === 3 && (
                                    <div>
                                        {isDNSVerifying ? (
                                            <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>Verification Pending...</span>
                                            </div>
                                        ) : isDomainVerified ? (
                                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                                                <span aria-hidden="true">✓</span>
                                                <span>Domain Verified</span>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {domainVerificationStep === 1 && corporateDomain && (
                                    <button
                                        type="button"
                                        onClick={() => setDomainVerificationStep(2)}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                    >
                                        Continue to DNS Setup
                                    </button>
                                )}

                                {domainVerificationStep === 2 && (
                                    <button
                                        type="button"
                                        onClick={handleDNSVerification}
                                        disabled={isDNSVerifying}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDNSVerifying ? 'Verifying...' : 'Verify Domain'}
                                    </button>
                                )}
                            </div>
                        </article>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-white">Upload Proof of Affiliation</h3>
                                <span className="text-xs text-amber-300">Required</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Upload a badge, staff profile, or other document that supports your organisational affiliation. PDF, JPG or PNG only. Max 5MB.
                            </p>

                            <label
                                htmlFor="affiliation-proof-upload"
                                onDragOver={(event) => {
                                    event.preventDefault()
                                    setDragTarget('affiliation')
                                }}
                                onDragLeave={() => setDragTarget(null)}
                                onDrop={(event) => handleFileDrop(event, 'affiliation')}
                                className={`mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors duration-200 ${
                                    dragTarget === 'affiliation'
                                        ? 'border-blue-500/80 bg-blue-500/10'
                                        : 'border-slate-600 bg-slate-900 hover:border-blue-500/70'
                                }`}
                            >
                                <span className="text-sm text-slate-300">Drag and drop a file here</span>
                                <span className="mt-1 text-xs text-slate-400">or click to browse</span>
                            </label>

                            <input
                                id="affiliation-proof-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(event) => handleFileInputChange(event, 'affiliation')}
                                className="sr-only"
                            />

                            {affiliationFileName && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                    <span aria-hidden="true">✓</span>
                                    <span className="break-all">{affiliationFileName}</span>
                                </div>
                            )}

                            {affiliationError && <p className="mt-3 text-xs text-amber-300">{affiliationError}</p>}
                        </article>

                        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-white">Upload Authorization / Compliance Letter</h3>
                                <span className="text-xs text-amber-300">Required</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Upload the approval or authority document that covers this access request. Examples: DPA, IRB approval, or letter of authority.
                            </p>

                            <label
                                htmlFor="authorization-proof-upload"
                                onDragOver={(event) => {
                                    event.preventDefault()
                                    setDragTarget('authorization')
                                }}
                                onDragLeave={() => setDragTarget(null)}
                                onDrop={(event) => handleFileDrop(event, 'authorization')}
                                className={`mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors duration-200 ${
                                    dragTarget === 'authorization'
                                        ? 'border-blue-500/80 bg-blue-500/10'
                                        : 'border-slate-600 bg-slate-900 hover:border-blue-500/70'
                                }`}
                            >
                                <span className="text-sm text-slate-300">Drag and drop a file here</span>
                                <span className="mt-1 text-xs text-slate-400">or click to browse</span>
                            </label>

                            <input
                                id="authorization-proof-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(event) => handleFileInputChange(event, 'authorization')}
                                className="sr-only"
                            />

                            {authorizationFileName && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                    <span aria-hidden="true">✓</span>
                                    <span className="break-all">{authorizationFileName}</span>
                                </div>
                            )}

                            {authorizationError && <p className="mt-3 text-xs text-amber-300">{authorizationError}</p>}
                        </article>
                    </div>

                    <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-white">Authentication Setup</h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Choose how you will log in to Redoubt. This cannot be changed after submission.
                                </p>
                            </div>
                            <span className="text-xs text-amber-300">Required</span>
                        </div>

                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                            <label
                                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                                    authenticationMethod === 'sso'
                                        ? 'border-blue-500/80 bg-blue-500/10'
                                        : 'border-slate-700 bg-slate-950/60 hover:border-blue-500/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="authentication-method"
                                    className="sr-only"
                                    checked={authenticationMethod === 'sso'}
                                    onChange={() => handleAuthenticationMethodSelect('sso')}
                                />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.5 1.5 3.5-4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Okta / Microsoft Entra (SSO)</h4>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Authenticate using your organization's SSO provider
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`mt-1 h-4 w-4 rounded-full border ${
                                            authenticationMethod === 'sso'
                                                ? 'border-blue-400 bg-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.22)]'
                                                : 'border-slate-600 bg-transparent'
                                        }`}
                                    />
                                </div>

                                {authenticationMethod === 'sso' && (
                                    <div className="mt-4 space-y-2 rounded-lg border border-blue-500/30 bg-slate-900/70 p-3">
                                        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                            SSO Domain
                                        </label>
                                        <input
                                            type="text"
                                            value={ssoDomain}
                                            onChange={(event) => setSSODomain(event.target.value)}
                                            placeholder="yourcompany.okta.com or login.microsoftonline.com/..."
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                        />
                                        <p className="text-xs text-slate-500">Your IT team can provide this</p>
                                    </div>
                                )}
                            </label>

                            <label
                                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                                    authenticationMethod === 'hardware_key'
                                        ? 'border-emerald-500/70 bg-emerald-500/10'
                                        : 'border-slate-700 bg-slate-950/60 hover:border-emerald-500/40'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="authentication-method"
                                    className="sr-only"
                                    checked={authenticationMethod === 'hardware_key'}
                                    onChange={() => handleAuthenticationMethodSelect('hardware_key')}
                                />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Hardware Key (YubiKey / WebAuthn)</h4>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Use a physical security key for maximum security
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`mt-1 h-4 w-4 rounded-full border ${
                                            authenticationMethod === 'hardware_key'
                                                ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.22)]'
                                                : 'border-slate-600 bg-transparent'
                                        }`}
                                    />
                                </div>

                                {authenticationMethod === 'hardware_key' && (
                                    <div className="mt-4 rounded-lg border border-emerald-500/30 bg-slate-900/70 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm text-slate-200">
                                                You will register your hardware key on your first login. Please have your key ready.
                                            </p>
                                            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                                                Highest Security
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                            ⚠️ Personal email providers (Gmail, Outlook personal, Yahoo) are not accepted. A verified corporate domain is required to proceed.
                        </div>

                        <div className="mt-4 rounded-lg border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                            ⓘ Your selected authentication method will be shown on your Trust Profile and contributes to your overall Trust Score. Hardware Key authentication provides the highest trust score boost (+8 points).
                        </div>
                    </article>

                    <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between gap-3 mb-1">
                            <div>
                                <h3 className="text-base font-semibold text-white">Privacy & Access Controls</h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Set how buyers can access and use this dataset
                                </p>
                            </div>
                            <span className="text-xs uppercase tracking-[0.14em] text-blue-300">Optional</span>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-3 mt-5">
                            <div className="lg:col-span-2 space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                        Access Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {accessTypeOptions.map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => updateRightsPackage({ accessType: option.value })}
                                                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                                    rightsPackage.accessType === option.value
                                                        ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                        : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-blue-500/50 hover:text-slate-200'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                        Duration
                                    </label>
                                    <select
                                        value={rightsPackage.duration === 'custom' && (rightsPackage as any).customDuration ? 'custom' : rightsPackage.duration}
                                        onChange={e => {
                                            if (e.target.value === 'custom') {
                                                updateRightsPackage({ duration: 'custom', customDuration: '' })
                                            } else {
                                                updateRightsPackage({ duration: e.target.value })
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select duration</option>
                                        {durationOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    {rightsPackage.duration === 'custom' && (
                                        <input
                                            type="text"
                                            value={(rightsPackage as any).customDuration || ''}
                                            onChange={e => updateRightsPackage({ customDuration: e.target.value })}
                                            placeholder="Enter custom duration (e.g., 18 months)"
                                            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                        Usage Purpose
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {usagePurposeOptions.map(option => (
                                            <label
                                                key={option.value}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
                                                    rightsPackage.usagePurposes.includes(option.value)
                                                        ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                        : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-blue-500/50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={rightsPackage.usagePurposes.includes(option.value)}
                                                    onChange={() => toggleUsagePurpose(option.value)}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {rightsPackage.usagePurposes.includes('other') && (
                                        <input
                                            type="text"
                                            value={rightsPackage.otherUsagePurpose}
                                            onChange={e => updateRightsPackage({ otherUsagePurpose: e.target.value })}
                                            placeholder="Specify other purpose..."
                                            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                        Geographic Restriction
                                    </label>
                                    <div className="flex gap-3 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => updateRightsPackage({ geographicRestriction: 'global', selectedRegions: [] })}
                                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                                rightsPackage.geographicRestriction === 'global'
                                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                                                    : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-500/50'
                                            }`}
                                        >
                                            Global
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateRightsPackage({ geographicRestriction: 'specific' })}
                                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                                rightsPackage.geographicRestriction === 'specific'
                                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                                                    : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-500/50'
                                            }`}
                                        >
                                            Specific Regions
                                        </button>
                                    </div>
                                    {rightsPackage.geographicRestriction === 'specific' && (
                                        <div className="flex flex-wrap gap-2">
                                            {regionOptions.map(option => (
                                                <label
                                                    key={option.value}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
                                                        rightsPackage.selectedRegions.includes(option.value)
                                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                                                            : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-500/50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={rightsPackage.selectedRegions.includes(option.value)}
                                                        onChange={() => toggleRegion(option.value)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                        Field Level Restrictions
                                    </label>
                                    {rightsPackage.fieldRestrictions.length > 0 && (
                                        <div className="space-y-2 mb-3">
                                            {rightsPackage.fieldRestrictions.map((field, index) => (
                                                <div key={index} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2">
                                                    <span className="text-sm text-slate-200 flex-1 font-mono">{field.fieldName}</span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateFieldRestriction(index, 'restricted')}
                                                            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                                                                field.restriction === 'restricted'
                                                                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                                                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'
                                                            }`}
                                                        >
                                                            Restricted
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateFieldRestriction(index, 'masked')}
                                                            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                                                                field.restriction === 'masked'
                                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'
                                                            }`}
                                                        >
                                                            Masked
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFieldRestriction(index)}
                                                        className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newFieldName}
                                            onChange={e => setNewFieldName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFieldRestriction() } }}
                                            placeholder="Field name (e.g., email, ssn)"
                                            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={addFieldRestriction}
                                            disabled={!newFieldName.trim()}
                                            className="px-3 py-2 rounded-lg border border-slate-600 text-sm text-slate-300 hover:border-blue-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                        Additional Conditions
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'attributionRequired' as const, label: 'Attribution required' },
                                            { key: 'auditLoggingMandatory' as const, label: 'Audit logging mandatory' },
                                            { key: 'noRedistribution' as const, label: 'No redistribution allowed' }
                                        ].map(({ key, label }) => (
                                            <label
                                                key={key}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                                                    rightsPackage.additionalConditions[key]
                                                        ? 'border-blue-500 bg-blue-500/10'
                                                        : 'border-slate-700 bg-slate-900/70 hover:border-blue-500/50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={rightsPackage.additionalConditions[key]}
                                                    onChange={() => updateAdditionalCondition(key, !rightsPackage.additionalConditions[key])}
                                                />
                                                <span className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                                    rightsPackage.additionalConditions[key]
                                                        ? 'border-blue-400 bg-blue-400'
                                                        : 'border-slate-600'
                                                }`}>
                                                    {rightsPackage.additionalConditions[key] && (
                                                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className="text-sm text-slate-200">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvancedDrawer(true)}
                                        className="w-full rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-500/10 to-slate-900/80 px-5 py-4 text-left hover:border-purple-400/60 hover:from-purple-500/15 hover:to-slate-900/90 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-purple-200 group-hover:text-purple-100">
                                                    Advanced Rights & Conditions
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    Legal, audit, redistribution and governance controls
                                                </div>
                                            </div>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 group-hover:bg-purple-500/20 group-hover:border-purple-400/60 transition-all">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="sticky top-4 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.12em] mb-3">
                                        Preview
                                    </h4>
                                    <div className="text-sm text-slate-300 leading-relaxed space-y-2">
                                        <p>{buildPreviewText()}</p>
                                    </div>
                                    {rightsPackage.accessType && (
                                        <div className="mt-4 pt-4 border-t border-slate-700/60">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>This preview will be shown to potential buyers</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>

                    {showAdvancedDrawer && (
                        <div className="fixed inset-0 z-50 flex justify-end">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdvancedDrawer(false)} />
                            <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto">
                                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Advanced Rights & Conditions</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">Legal & Governance Controls</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAdvancedDrawer(false)}
                                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <div className="text-sm font-medium text-white mb-3">Redistribution Rights</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: 'allowed' as const, label: 'Allowed' },
                                                { value: 'not_allowed' as const, label: 'Not Allowed' }
                                            ].map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => updateAdvancedCondition('redistributionRights', option.value)}
                                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                                        rightsPackage.advancedConditions.redistributionRights === option.value
                                                            ? 'border-purple-500/60 bg-purple-500/10 text-purple-100'
                                                            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-white mb-3">Audit Logging Requirement</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: 'mandatory' as const, label: 'Mandatory' },
                                                { value: 'optional' as const, label: 'Optional' }
                                            ].map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => updateAdvancedCondition('auditLoggingRequirement', option.value)}
                                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                                        rightsPackage.advancedConditions.auditLoggingRequirement === option.value
                                                            ? 'border-purple-500/60 bg-purple-500/10 text-purple-100'
                                                            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-white mb-3">Attribution Requirement</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: 'required' as const, label: 'Required' },
                                                { value: 'not_required' as const, label: 'Not Required' }
                                            ].map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => updateAdvancedCondition('attributionRequirement', option.value)}
                                                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                                        rightsPackage.advancedConditions.attributionRequirement === option.value
                                                            ? 'border-purple-500/60 bg-purple-500/10 text-purple-100'
                                                            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-700 pt-6">
                                        <div className="text-sm font-medium text-white mb-4">Data Volume Scaling</div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-300">Enable volume-based pricing</span>
                                                <button
                                                    type="button"
                                                    aria-pressed={rightsPackage.advancedConditions.volumeBasedPricing}
                                                    onClick={() => updateAdvancedCondition('volumeBasedPricing', !rightsPackage.advancedConditions.volumeBasedPricing)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                        rightsPackage.advancedConditions.volumeBasedPricing
                                                            ? 'bg-purple-500 ring-1 ring-purple-300/40'
                                                            : 'bg-slate-700 ring-1 ring-slate-500/60'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                                            rightsPackage.advancedConditions.volumeBasedPricing ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            {rightsPackage.advancedConditions.volumeBasedPricing && (
                                                <div className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
                                                    <div>
                                                        <label className="text-xs text-slate-400 mb-1.5 block">Base price adjustment</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                value={rightsPackage.advancedConditions.volumePricingAdjustment}
                                                                onChange={(e) => updateAdvancedCondition('volumePricingAdjustment', parseFloat(e.target.value) || 0)}
                                                                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                                                placeholder="0"
                                                            />
                                                            <select
                                                                value={rightsPackage.advancedConditions.volumePricingUnit}
                                                                onChange={(e) => updateAdvancedCondition('volumePricingUnit', e.target.value as 'tb' | 'million_records')}
                                                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                                            >
                                                                <option value="tb">per TB</option>
                                                                <option value="million_records">per million records</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-4">
                                    <button
                                        onClick={() => setShowAdvancedDrawer(false)}
                                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showError && !stepReady && (
                        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                            Please complete LinkedIn, DNS verification, both required uploads, and authentication setup before continuing.
                        </div>
                    )}
                </section>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={fillMockData}
                        className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white transition-colors text-sm"
                    >
                        Use mock data
                    </button>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!stepReady}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
