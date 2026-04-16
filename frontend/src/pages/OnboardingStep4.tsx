import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    participantOnboardingEstimatedReviewTime,
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
import type { AuthenticationMethod } from '../onboarding/types'

type StatusTone = 'info' | 'neutral' | 'success' | 'warning'
type VerificationFileTarget = 'affiliation' | 'authorization'

const allowedFileExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const maxFileSizeBytes = 5 * 1024 * 1024

const topReviewCards = [
    {
        title: 'Identity match',
        description: 'Reviewers validate that the submitting profile maps to a real professional identity and organizational role.'
    },
    {
        title: 'Domain control',
        description: 'DNS verification proves control of the corporate domain associated with the request and later access identity.'
    },
    {
        title: 'Evidence packet',
        description: 'Affiliation evidence, authorization evidence, and authentication setup become the verification packet used for access governance.'
    }
] as const

const dnsSetupSteps = [
    'Enter the corporate domain tied to the requesting organization.',
    'Ask your IT or DNS administrator to publish the TXT verification record.',
    'Return here and run the verification check after the record propagates.'
] as const

const affiliationExamples = [
    'Employee badge or staff ID',
    'Official staff directory or corporate profile screenshot',
    'Employment confirmation or team roster excerpt'
] as const

const affiliationChecks = [
    'Name and organization line up with the request',
    'Role or affiliation is visible and readable',
    'The document appears current and attributable'
] as const

const authorizationExamples = [
    'Letter of authority from a program lead or executive sponsor',
    'Compliance or legal approval memo',
    'IRB, DPA, or formal approval document covering the request'
] as const

const authorizationChecks = [
    'The request is backed by the organization, not just the individual',
    'The approval scope matches the stated workflow or evaluation',
    'The document identifies an accountable approver or function'
] as const

const afterVerificationSteps = [
    'The completed verification packet is handed to reviewers with your prior identity, use-case, and governance inputs.',
    'Reviewers confirm identity alignment, organization authority, and access-control readiness.',
    'You receive the review decision and any next access steps after manual review.'
] as const

const helperPanelNotes = [
    'Only upload documents relevant to the current request.',
    'Uploaded files are reviewed as evidence for this access application, not as a general document repository.',
    'If a file is outdated, incomplete, or illegible, reviewers may ask for a replacement before approval.'
] as const

const statusChipClassName: Record<StatusTone, string> = {
    info: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
    neutral: 'border-slate-600 bg-slate-800/90 text-slate-300',
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    warning: 'border-amber-400/35 bg-amber-500/10 text-amber-100'
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

function StatusChip({ label, tone }: { label: string; tone: StatusTone }) {
    return (
        <span
            className={cx(
                'inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                statusChipClassName[tone]
            )}
        >
            {label}
        </span>
    )
}

function getFileStatus(fileName: string | null, error: string | null) {
    if (error) {
        return { label: 'Needs replacement', tone: 'warning' as const }
    }

    if (fileName) {
        return { label: 'Uploaded', tone: 'success' as const }
    }

    return { label: 'Missing', tone: 'neutral' as const }
}

function getAuthenticationStatus(authenticationMethod: AuthenticationMethod | null, ssoDomain: string) {
    if (authenticationMethod === 'sso' && ssoDomain.trim().length === 0) {
        return { label: 'Needs configuration', tone: 'warning' as const }
    }

    if (authenticationMethod) {
        return { label: 'Configured', tone: 'success' as const }
    }

    return { label: 'Missing', tone: 'neutral' as const }
}

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
    const [dragTarget, setDragTarget] = useState<VerificationFileTarget | null>(null)
    const [showError, setShowError] = useState(false)
    const [corporateDomain, setCorporateDomain] = useState('')
    const [domainVerificationStep, setDomainVerificationStep] = useState<1 | 2 | 3>(() =>
        snapshot.domainVerified ? 3 : 1
    )
    const [verificationCode, setVerificationCode] = useState('')

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
            ssoDomain
        })
    }, [isLinkedInConnected, isDomainVerified, affiliationFileName, authorizationFileName, authenticationMethod, ssoDomain])

    const handleLinkedInConnect = () => {
        if (isLinkedInLoading || isLinkedInConnected) return

        setIsLinkedInLoading(true)
        linkedInTimerRef.current = setTimeout(() => {
            setIsLinkedInLoading(false)
            setIsLinkedInConnected(true)
            setShowError(false)
        }, 1600)
    }

    const handleDNSVerification = () => {
        if (isDNSVerifying || isDomainVerified) return

        setDomainVerificationStep(3)
        setIsDNSVerifying(true)
        dnsTimerRef.current = setTimeout(() => {
            setIsDNSVerifying(false)
            setIsDomainVerified(true)
            setShowError(false)
        }, 2000)
    }

    const handleFileSelection = (file: File | null | undefined, target: VerificationFileTarget) => {
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
        setShowError(false)
    }

    const handleFileDrop = (event: React.DragEvent<HTMLLabelElement>, target: VerificationFileTarget) => {
        event.preventDefault()
        setDragTarget(null)
        handleFileSelection(event.dataTransfer.files?.[0], target)
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>, target: VerificationFileTarget) => {
        handleFileSelection(event.target.files?.[0], target)
    }

    const handleAuthenticationMethodSelect = (method: AuthenticationMethod) => {
        setAuthenticationMethod(method)
        setShowError(false)
    }

    const authenticationReady =
        Boolean(authenticationMethod) &&
        (authenticationMethod !== 'sso' || ssoDomain.trim().length > 0)
    const stepReady = isStep4Complete({
        linkedInConnected: isLinkedInConnected,
        domainVerified: isDomainVerified,
        affiliationFileName,
        authorizationFileName,
        authenticationMethod,
        ssoDomain
    })

    const linkedInStatus = isLinkedInConnected
        ? { label: 'Verified', tone: 'success' as const }
        : isLinkedInLoading
            ? { label: 'Checking', tone: 'info' as const }
            : { label: 'Missing', tone: 'neutral' as const }
    const dnsStatus = isDomainVerified
        ? { label: 'Verified', tone: 'success' as const }
        : isDNSVerifying
            ? { label: 'Checking', tone: 'info' as const }
            : domainVerificationStep > 1 || corporateDomain
                ? { label: 'In setup', tone: 'warning' as const }
                : { label: 'Missing', tone: 'neutral' as const }
    const affiliationStatus = getFileStatus(affiliationFileName, affiliationError)
    const authorizationStatus = getFileStatus(authorizationFileName, authorizationError)
    const authenticationStatus = getAuthenticationStatus(authenticationMethod, ssoDomain)

    const packetChecklist = [
        {
            label: 'LinkedIn profile verification',
            complete: isLinkedInConnected,
            statusLabel: linkedInStatus.label,
            tone: linkedInStatus.tone
        },
        {
            label: 'Domain / DNS verification',
            complete: isDomainVerified,
            statusLabel: dnsStatus.label,
            tone: dnsStatus.tone
        },
        {
            label: 'Affiliation evidence',
            complete: Boolean(affiliationFileName && !affiliationError),
            statusLabel: affiliationStatus.label,
            tone: affiliationStatus.tone
        },
        {
            label: 'Authorization evidence',
            complete: Boolean(authorizationFileName && !authorizationError),
            statusLabel: authorizationStatus.label,
            tone: authorizationStatus.tone
        },
        {
            label: 'Authentication setup',
            complete: authenticationReady,
            statusLabel: authenticationStatus.label,
            tone: authenticationStatus.tone
        }
    ] as const
    const completedPacketItems = packetChecklist.filter((item) => item.complete).length

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
        setCorporateDomain('demo.redoubt.local')
        setDomainVerificationStep(3)
        setAffiliationFileName('affiliation-proof.pdf')
        setAuthorizationFileName('authorization-letter.pdf')
        setAuthenticationMethod('hardware_key')
        setSSODomain('')
        setAffiliationError(null)
        setAuthorizationError(null)
        setShowError(false)
    }

    const helperPanel = (
        <div className="space-y-4">
            <section className="rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.92)_0%,rgba(15,23,42,0.96)_100%)] p-5 shadow-[0_22px_50px_rgba(8,47,73,0.24)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                    Verification Packet
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">Current packet status</h2>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                    Reviewers use this packet to confirm identity, organization authority, and login-readiness before any protected access is approved.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Packet completion
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">
                            {completedPacketItems}/{packetChecklist.length} items ready
                        </div>
                        <p className="mt-2 text-sm text-slate-300">
                            Verification usually completes within {participantOnboardingEstimatedReviewTime} once the evidence packet is complete.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Privacy note
                        </div>
                        <p className="mt-2 text-sm text-slate-300">
                            Uploaded files should contain only the evidence needed for this request. Avoid unrelated personal or sensitive material.
                        </p>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    {packetChecklist.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                            <span className="text-sm text-slate-200">{item.label}</span>
                            <StatusChip label={item.statusLabel} tone={item.tone} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-slate-900/75 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Accepted evidence examples
                </div>

                <div className="mt-4 space-y-4 text-sm text-slate-300">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                        <div className="font-semibold text-white">Affiliation evidence</div>
                        <ul className="mt-3 space-y-2 text-slate-400">
                            {affiliationExamples.map((example) => (
                                <li key={example}>• {example}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                        <div className="font-semibold text-white">Authorization evidence</div>
                        <ul className="mt-3 space-y-2 text-slate-400">
                            {authorizationExamples.map((example) => (
                                <li key={example}>• {example}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-slate-900/72 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.18)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    What reviewers look for
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                    {helperPanelNotes.map((note) => (
                        <div key={note} className="rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-3">
                            {note}
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-slate-900/72 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.18)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    What happens after verification succeeds
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                    {afterVerificationSteps.map((step) => (
                        <div key={step} className="rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-3">
                            {step}
                        </div>
                    ))}
                </div>

                <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                    Verification exists to protect access governance by ensuring reviewers are working from a confirmed identity, a confirmed organization, and a clearly scoped access method.
                </div>
            </section>
        </div>
    )

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step4}>
            <OnboardingPageLayout
                activeStep={4}
                showDefaultHelperPanel={false}
                helperPanel={helperPanel}
                headerTitle="Verification & Evidence Packet"
                headerSubtitle="Complete identity checks, organization evidence, and access-identity setup so reviewers can validate this request as a protected-access packet."
                pageEyebrow="Participant onboarding · Verification packet"
            >
                <div className="space-y-6">
                    <section className="rounded-[30px] border border-slate-800 bg-slate-900/72 p-6 shadow-[0_22px_50px_rgba(2,6,23,0.24)]">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-3xl">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Zone 1 · why verification exists
                                </div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">Build the reviewer verification packet</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    {participantOnboardingVerificationSummary} This packet protects access governance by verifying the person, the organization, and the identity controls behind the request before protected access review begins.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                    Expected turnaround
                                </div>
                                <div className="mt-2 text-lg font-semibold text-white">
                                    {participantOnboardingEstimatedReviewTime}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            {topReviewCards.map((card) => (
                                <div key={card.title} className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                                    <div className="text-sm font-semibold text-white">{card.title}</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">{card.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[30px] border border-slate-800 bg-slate-900/68 p-6 shadow-[0_22px_50px_rgba(2,6,23,0.22)]">
                        <div className="mb-5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Zone 2 · identity verification
                            </div>
                            <h3 className="mt-2 text-xl font-semibold text-white">Verify identity and corporate domain control</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                These checks confirm the person submitting the request and the corporate domain behind the organization identity.
                            </p>
                        </div>

                        <div className="grid gap-5 xl:grid-cols-2">
                            <article className="rounded-[24px] border border-slate-800 bg-slate-950/75 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold text-white">LinkedIn / profile verification</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            Confirms the public professional profile tied to the person submitting the request.
                                        </p>
                                    </div>
                                    <StatusChip label={linkedInStatus.label} tone={linkedInStatus.tone} />
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Reviewers validate
                                    </div>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                        <li>• The profile identifies a real professional tied to the request.</li>
                                        <li>• Public affiliation aligns with the organization and role stated earlier.</li>
                                        <li>• The identity signal is strong enough to support protected access review.</li>
                                    </ul>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {isLinkedInConnected ? (
                                        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                            LinkedIn verification succeeded. This identity proof is now included in your reviewer packet.
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleLinkedInConnect}
                                            disabled={isLinkedInLoading}
                                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/60"
                                        >
                                            {isLinkedInLoading ? 'Checking profile…' : 'Connect LinkedIn'}
                                        </button>
                                    )}

                                    <p className="text-xs leading-6 text-slate-500">
                                        Use the profile that best represents the professional identity tied to this organization request.
                                    </p>
                                </div>
                            </article>

                            <article className="rounded-[24px] border border-slate-800 bg-slate-950/75 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold text-white">Corporate domain / DNS verification</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            Prove control of the corporate domain associated with the work email and later access identity.
                                        </p>
                                    </div>
                                    <StatusChip label={dnsStatus.label} tone={dnsStatus.tone} />
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        DNS / TXT setup
                                    </div>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                        {dnsSetupSteps.map((step, index) => (
                                            <li key={step}>
                                                <span className="font-semibold text-cyan-300">[{index + 1}]</span> {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {domainVerificationStep === 1 && (
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                Enter corporate domain
                                            </label>
                                            <input
                                                type="text"
                                                value={corporateDomain}
                                                onChange={(event) => setCorporateDomain(event.target.value)}
                                                placeholder="yourcompany.com"
                                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                This should match the organization domain behind the request, not a personal mailbox provider.
                                            </p>
                                        </div>
                                    )}

                                    {domainVerificationStep >= 2 && corporateDomain && (
                                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                TXT record to publish
                                            </div>
                                            <p className="mt-2 text-sm text-slate-300">
                                                Add the following TXT record to the DNS zone for <span className="font-semibold text-white">{corporateDomain}</span>:
                                            </p>
                                            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-emerald-300">
                                                redoubt-verify={verificationCode}
                                            </div>
                                            <p className="mt-3 text-xs leading-6 text-slate-500">
                                                Ask your DNS administrator to add the record at the root or correct verification location for the domain. Propagation can take time before the check succeeds.
                                            </p>
                                        </div>
                                    )}

                                    {domainVerificationStep === 3 && (
                                        <div>
                                            {isDNSVerifying ? (
                                                <div className="inline-flex items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
                                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    <span>Checking TXT record…</span>
                                                </div>
                                            ) : isDomainVerified ? (
                                                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                                    Domain verification succeeded. This domain proof is now included in your reviewer packet.
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        {domainVerificationStep === 1 && corporateDomain && (
                                            <button
                                                type="button"
                                                onClick={() => setDomainVerificationStep(2)}
                                                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                            >
                                                Continue to DNS setup
                                            </button>
                                        )}

                                        {domainVerificationStep === 2 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setDomainVerificationStep(3)}
                                                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500"
                                                >
                                                    I added the TXT record
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleDNSVerification}
                                                    disabled={isDNSVerifying}
                                                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isDNSVerifying ? 'Verifying…' : 'Verify domain'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="rounded-[30px] border border-slate-800 bg-slate-900/66 p-6 shadow-[0_22px_50px_rgba(2,6,23,0.22)]">
                        <div className="mb-5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Zone 3 · organization evidence
                            </div>
                            <h3 className="mt-2 text-xl font-semibold text-white">Add affiliation evidence, authorization evidence, and access identity</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                This zone turns your verification inputs into a review packet. Upload clear evidence, identify an approving authority, and confirm how access will be authenticated if approval is granted.
                            </p>
                        </div>

                        <div className="grid gap-5 xl:grid-cols-2">
                            <article className="rounded-[24px] border border-slate-800 bg-slate-950/75 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold text-white">Affiliation evidence</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            Upload a document showing that you are affiliated with the organization named in this application.
                                        </p>
                                    </div>
                                    <StatusChip label={affiliationStatus.label} tone={affiliationStatus.tone} />
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Accepted examples
                                        </div>
                                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                            {affiliationExamples.map((example) => (
                                                <li key={example}>• {example}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Reviewers check
                                        </div>
                                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                            {affiliationChecks.map((check) => (
                                                <li key={check}>• {check}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <label
                                    htmlFor="affiliation-proof-upload"
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setDragTarget('affiliation')
                                    }}
                                    onDragLeave={() => setDragTarget(null)}
                                    onDrop={(event) => handleFileDrop(event, 'affiliation')}
                                    className={cx(
                                        'mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center transition-colors duration-200',
                                        dragTarget === 'affiliation'
                                            ? 'border-blue-500/80 bg-blue-500/10'
                                            : 'border-slate-600 bg-slate-900 hover:border-blue-500/70'
                                    )}
                                >
                                    <span className="text-sm font-medium text-slate-200">Drag and drop affiliation evidence</span>
                                    <span className="mt-2 text-xs text-slate-400">PDF, JPG, or PNG up to 5MB</span>
                                </label>

                                <input
                                    id="affiliation-proof-upload"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(event) => handleFileInputChange(event, 'affiliation')}
                                    className="sr-only"
                                />

                                {affiliationFileName && (
                                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                                        <span aria-hidden="true">✓</span>
                                        <span className="break-all">{affiliationFileName}</span>
                                    </div>
                                )}

                                {affiliationError && (
                                    <p className="mt-3 text-sm text-amber-200">{affiliationError}</p>
                                )}
                            </article>

                            <article className="rounded-[24px] border border-slate-800 bg-slate-950/75 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold text-white">Authorization evidence</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            Upload the approval document that authorizes this access request or confirms it is covered by the right oversight.
                                        </p>
                                    </div>
                                    <StatusChip label={authorizationStatus.label} tone={authorizationStatus.tone} />
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Accepted examples
                                        </div>
                                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                            {authorizationExamples.map((example) => (
                                                <li key={example}>• {example}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Reviewers check
                                        </div>
                                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                            {authorizationChecks.map((check) => (
                                                <li key={check}>• {check}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Who can upload this
                                    </div>
                                    <p className="mt-2 leading-6">
                                        An authorized representative, program owner, legal contact, compliance lead, or delegated approver inside the organization.
                                    </p>
                                </div>

                                <label
                                    htmlFor="authorization-proof-upload"
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setDragTarget('authorization')
                                    }}
                                    onDragLeave={() => setDragTarget(null)}
                                    onDrop={(event) => handleFileDrop(event, 'authorization')}
                                    className={cx(
                                        'mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center transition-colors duration-200',
                                        dragTarget === 'authorization'
                                            ? 'border-blue-500/80 bg-blue-500/10'
                                            : 'border-slate-600 bg-slate-900 hover:border-blue-500/70'
                                    )}
                                >
                                    <span className="text-sm font-medium text-slate-200">Drag and drop authorization evidence</span>
                                    <span className="mt-2 text-xs text-slate-400">PDF, JPG, or PNG up to 5MB</span>
                                </label>

                                <input
                                    id="authorization-proof-upload"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(event) => handleFileInputChange(event, 'authorization')}
                                    className="sr-only"
                                />

                                {authorizationFileName && (
                                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                                        <span aria-hidden="true">✓</span>
                                        <span className="break-all">{authorizationFileName}</span>
                                    </div>
                                )}

                                {authorizationError && (
                                    <p className="mt-3 text-sm text-amber-200">{authorizationError}</p>
                                )}
                            </article>
                        </div>

                        <div className="mt-5 rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                            Privacy note: only upload evidence needed to prove affiliation or authority for this request. Reviewers use these files for application verification, not broader document retention.
                        </div>

                        <article className="mt-5 rounded-[24px] border border-slate-800 bg-slate-950/75 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="text-base font-semibold text-white">Authentication method / access identity setup</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Choose how approved users will authenticate if the request is granted. This becomes part of the access identity reviewers see.
                                    </p>
                                </div>
                                <StatusChip label={authenticationStatus.label} tone={authenticationStatus.tone} />
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                <label
                                    className={cx(
                                        'cursor-pointer rounded-2xl border p-4 transition-colors',
                                        authenticationMethod === 'sso'
                                            ? 'border-blue-500/80 bg-blue-500/10'
                                            : 'border-slate-700 bg-slate-950/60 hover:border-blue-500/50'
                                    )}
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
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.5 1.5 3.5-4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">Okta / Microsoft Entra (SSO)</h4>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    Use your organization&apos;s SSO identity provider for access control.
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={cx(
                                                'mt-1 h-4 w-4 rounded-full border',
                                                authenticationMethod === 'sso'
                                                    ? 'border-blue-400 bg-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.22)]'
                                                    : 'border-slate-600 bg-transparent'
                                            )}
                                        />
                                    </div>

                                    {authenticationMethod === 'sso' && (
                                        <div className="mt-4 space-y-2 rounded-xl border border-blue-500/30 bg-slate-900/70 p-3">
                                            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                SSO domain or tenant reference
                                            </label>
                                            <input
                                                type="text"
                                                value={ssoDomain}
                                                onChange={(event) => {
                                                    setSSODomain(event.target.value)
                                                    setShowError(false)
                                                }}
                                                placeholder="yourcompany.okta.com or login.microsoftonline.com/..."
                                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Your IT or identity team can provide the correct SSO domain or tenant path.
                                            </p>
                                        </div>
                                    )}
                                </label>

                                <label
                                    className={cx(
                                        'cursor-pointer rounded-2xl border p-4 transition-colors',
                                        authenticationMethod === 'hardware_key'
                                            ? 'border-emerald-500/70 bg-emerald-500/10'
                                            : 'border-slate-700 bg-slate-950/60 hover:border-emerald-500/40'
                                    )}
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
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">Hardware key (YubiKey / WebAuthn)</h4>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    Use a physical security key for the strongest login identity signal.
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={cx(
                                                'mt-1 h-4 w-4 rounded-full border',
                                                authenticationMethod === 'hardware_key'
                                                    ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.22)]'
                                                    : 'border-slate-600 bg-transparent'
                                            )}
                                        />
                                    </div>

                                    {authenticationMethod === 'hardware_key' && (
                                        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-slate-900/70 p-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm text-slate-200">
                                                    The hardware key will be registered on first login if the request is approved.
                                                </p>
                                                <StatusChip label="High assurance" tone="success" />
                                            </div>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                                    Personal email providers are not accepted. A verified corporate domain is required for this step.
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                                    After approval, the selected authentication method becomes the expected login identity for the participant environment.
                                </div>
                            </div>
                        </article>

                        {showError && !stepReady && (
                            <div className="mt-5 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                                Complete LinkedIn verification, domain verification, both evidence uploads, and authentication setup before continuing.
                            </div>
                        )}
                    </section>

                    <section className="flex flex-wrap gap-3 rounded-[24px] border border-slate-800 bg-slate-900/60 px-5 py-4">
                        <button
                            type="button"
                            onClick={fillMockData}
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-blue-500 hover:text-white"
                        >
                            Use mock data
                        </button>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!stepReady}
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Continue to Step 5
                        </button>
                    </section>
                </div>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
