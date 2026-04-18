import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail'
} as const

const onboardingStorageKeys = {
    step1: 'Redoubt:onboarding:step1',
    intendedUsage: 'Redoubt:onboarding:intendedUsage',
    useCaseSummary: 'Redoubt:onboarding:useCaseSummary',
    participationIntent: 'Redoubt:onboarding:participationIntent',
    legalAcknowledgment: 'Redoubt:onboarding:legalAcknowledgment',
    verification: 'Redoubt:onboarding:verification',
    compliance: 'Redoubt:onboarding:compliance',
    submissionMeta: 'Redoubt:onboarding:submissionMeta'
} as const

const completedStep1 = {
    organizationName: 'Northwind Research',
    officialWorkEmail: 'ops@northwindresearch.com',
    inviteCode: '',
    roleInOrganization: 'Research Lead',
    industryDomain: 'Healthcare AI',
    country: 'United States'
}

const completedParticipation = ['Access datasets', 'Collaborate']
const completedUseCaseSummary =
    'We want to benchmark regulated healthcare datasets for internal research validation inside the Redoubt demo workflow.'

const completedLegalAcknowledgment = {
    authorizedRepresentative: true,
    governancePolicyAccepted: true,
    nonRedistributionAcknowledged: true
}

type SeedOptions = {
    auth?: Partial<Record<keyof typeof authStorageKeys, string>>
    onboarding?: Partial<Record<keyof typeof onboardingStorageKeys, unknown>>
}

async function seedAppState(page: Page, options: SeedOptions = {}) {
    await page.goto('/')
    await page.evaluate(({ auth, onboarding }) => {
        window.localStorage.clear()

        Object.entries(auth).forEach(([key, value]) => {
            if (typeof value === 'string') {
                window.localStorage.setItem(key, value)
            }
        })

        Object.entries(onboarding).forEach(([key, value]) => {
            window.localStorage.setItem(key, JSON.stringify(value))
        })
    }, {
        auth: {
            [authStorageKeys.accessStatus]: 'not_started',
            [authStorageKeys.isAuthenticated]: 'false',
            [authStorageKeys.onboardingInitiated]: 'true',
            [authStorageKeys.applicantEmail]: '',
            ...Object.fromEntries(
                Object.entries(options.auth ?? {}).map(([key, value]) => [authStorageKeys[key as keyof typeof authStorageKeys], value])
            )
        },
        onboarding: Object.fromEntries(
            Object.entries(options.onboarding ?? {}).map(([key, value]) => [onboardingStorageKeys[key as keyof typeof onboardingStorageKeys], value])
        )
    })
    await page.reload()
}

async function fillStep1WithoutInviteCode(page: Page) {
    await page.getByPlaceholder('Your legal or operating organization name').fill(completedStep1.organizationName)
    await page.getByPlaceholder('name@organization.com').fill(completedStep1.officialWorkEmail)
    await page.getByPlaceholder('Research lead, security engineering, compliance operations...').fill(completedStep1.roleInOrganization)
    await page.getByPlaceholder('Healthcare, public sector, mobility...').fill(completedStep1.industryDomain)
    await page.getByPlaceholder('Country or region').fill(completedStep1.country)
}

test.describe('participant onboarding', () => {
    test('mock sign-in still works when onboarding has not started', async ({ page }) => {
        await seedAppState(page)

        await page.goto('/login')

        await expect(page.getByRole('heading', { name: 'Secure Node Entry' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Access Request Required' })).not.toBeVisible()
        await expect(page.getByText('Mock mode accepts any non-empty value here.')).toBeVisible()

        await page.getByPlaceholder('you@yourcompany.com').fill('mock-demo-credential')
        await page.getByRole('button', { name: 'Continue →' }).click()
        await expect(page.getByRole('heading', { name: 'Identity Lookup Complete' })).toBeVisible()
        await expect(page.getByText(/the SSO path continues to a DNS TXT login-key screen/i)).toBeVisible()
        await page.getByRole('button', { name: 'Continue with SSO' }).click()
        await expect(page.getByRole('heading', { name: 'DNS TXT Login Key' })).toBeVisible()
        await expect(page.getByText(/Mock mode accepts any non-empty DNS TXT login key here\./)).toBeVisible()
        await page.getByPlaceholder('redoubt-verify=RDT-...').fill('mock-txt-key')
        await page.getByRole('button', { name: 'Sign in with DNS TXT login key' }).click()

        await expect(page).toHaveURL(/\/dashboard$/)
    })

    test('authenticated participant routes show the refreshed Redoubt branding', async ({ page }) => {
        await seedAppState(page, {
            auth: {
                accessStatus: 'approved',
                isAuthenticated: 'true',
                onboardingInitiated: 'false',
                applicantEmail: completedStep1.officialWorkEmail
            }
        })

        await page.goto('/participant-console')

        const consoleHeader = page.getByLabel('Participant console header')
        await expect(consoleHeader.getByText('Redoubt', { exact: true })).toBeVisible()
        await expect(consoleHeader.getByText('Redoubt Workspace', { exact: true })).toHaveCount(0)
    })

    test('request access starts a fresh onboarding flow instead of resuming a prior submission', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
                useCaseSummary: completedUseCaseSummary,
                participationIntent: completedParticipation,
                legalAcknowledgment: completedLegalAcknowledgment,
                verification: {
                    linkedInConnected: true,
                    domainVerified: true,
                    affiliationFileName: 'affiliation-proof.pdf',
                    authorizationFileName: 'authorization-letter.pdf'
                },
                compliance: {
                    responsibleDataUsage: true,
                    noUnauthorizedSharing: true,
                    platformCompliancePolicies: true
                },
                submissionMeta: {
                    referenceId: '#RDT-2026-1001',
                    submittedDate: 'April 2, 2026'
                }
            }
        })

        await page.getByRole('button', { name: /Request Pilot Access|Request Platform Access|Request Access/i }).first().click()

        await expect(page).toHaveURL(/\/onboarding\/step1$/)
        await expect(page.getByRole('heading', { name: 'Organization & Identity' })).toBeVisible()
        await expect(page.getByPlaceholder('Your legal or operating organization name')).toHaveValue('')
    })

    test('entry route resumes at the first incomplete onboarding step', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1
            }
        })

        await page.goto('/onboarding')

        await expect(page).toHaveURL(/\/onboarding\/step2$/)
        await expect(page.getByRole('heading', { name: 'Intended Platform Usage' })).toBeVisible()
    })

    test('deep links to later steps redirect to the earliest unmet prerequisite', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
                useCaseSummary: completedUseCaseSummary
            }
        })

        await page.goto('/onboarding/step4')

        await expect(page).toHaveURL(/\/onboarding\/step3$/)
        await expect(page.getByRole('heading', { name: 'Participation Intent' })).toBeVisible()
    })

    test('step 1 accepts a blank invite code when the required identity fields are valid', async ({ page }) => {
        await seedAppState(page)
        await page.goto('/onboarding/step1')

        await fillStep1WithoutInviteCode(page)
        await page.getByRole('button', { name: 'Continue to Step 2' }).click()

        await expect(page).toHaveURL(/\/onboarding\/step2$/)
    })

    test('step 1 rejects a short invite code even when the rest of the form is valid', async ({ page }) => {
        await seedAppState(page)
        await page.goto('/onboarding/step1')

        await fillStep1WithoutInviteCode(page)
        await page.getByPlaceholder('Enter if provided').fill('123')
        await page.getByRole('button', { name: 'Continue to Step 2' }).click()

        await expect(page).toHaveURL(/\/onboarding\/step1$/)
        await expect(
            page.getByText(/To continue, complete the organization identity fields and provide a valid corporate email\./)
        ).toBeVisible()
    })

    test('step 2 requires both usage tags and a reviewer-facing use case summary before continuing', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1
            }
        })

        await page.goto('/onboarding/step2')

        const nextButton = page.getByRole('button', { name: 'Continue to Step 3' })
        await expect(nextButton).toBeDisabled()

        await page.getByRole('button', { name: /^Research\b/ }).click()
        await expect(nextButton).toBeDisabled()

        await page.locator('#use-case-summary').fill('Need data.')
        await expect(page.getByText('Add a bit more detail so reviewers can understand the exact request.')).toBeVisible()
        await expect(nextButton).toBeDisabled()

        await page.locator('#use-case-summary').fill(completedUseCaseSummary)
        await expect(nextButton).toBeEnabled()

        await nextButton.click()
        await expect(page).toHaveURL(/\/onboarding\/step3$/)
    })

    test('step 3 explains that dataset controls are configured later during dataset onboarding', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
                useCaseSummary: completedUseCaseSummary
            }
        })

        await page.goto('/onboarding/step3')

        await page.getByRole('button', { name: 'Contribute datasets' }).click()

        await expect(page.getByText(/Dataset privacy, access controls, and commercial terms are configured later in dataset onboarding\./)).toBeVisible()
        await expect(page.getByText(/This participant application only verifies who your team is and what kind of platform participation you are requesting\./)).toBeVisible()
    })

    test('step 4 keeps progress disabled until verification, uploads, and auth setup are complete', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
                useCaseSummary: completedUseCaseSummary,
                participationIntent: completedParticipation,
                legalAcknowledgment: completedLegalAcknowledgment
            }
        })

        await page.goto('/onboarding/step4')

        await expect(page.getByRole('button', { name: 'Continue to Step 5' })).toBeDisabled()
        await expect(page.getByRole('button', { name: 'Connect LinkedIn' })).toBeVisible()
        await expect(page.getByPlaceholder('yourcompany.com')).toBeVisible()
        await expect(page.getByText('Drag and drop affiliation evidence')).toBeVisible()
        await expect(page.getByText('Drag and drop authorization evidence')).toBeVisible()
        await expect(page.getByText('Expected authentication method after approval')).toBeVisible()
        await expect(page.getByText(`Submitted work email: ${completedStep1.officialWorkEmail}`)).toBeVisible()
        await expect(page.getByText(`Expected domain: ${completedStep1.officialWorkEmail.split('@')[1]}`)).toBeVisible()
        await expect(page.getByText('Current packet status')).toBeVisible()
        await expect(page.getByText('Privacy & Access Controls')).toHaveCount(0)
    })

    test('step 4 blocks mismatched domains and removes stale sso references when switching auth methods', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
                useCaseSummary: completedUseCaseSummary,
                participationIntent: completedParticipation,
                legalAcknowledgment: completedLegalAcknowledgment
            }
        })

        await page.goto('/onboarding/step4')

        await page.getByPlaceholder('yourcompany.com').fill('security.northwindresearch.com')
        await expect(page.getByText('Mock mode accepts any non-empty demo domain here.').first()).toBeVisible()
        await expect(page.getByRole('button', { name: 'Continue to DNS setup' })).toBeEnabled()
        await page.getByRole('button', { name: 'Continue to DNS setup' }).click()
        await expect(page.getByText('DNS verification token')).toBeVisible()
        await expect(page.getByText('redoubt-verify=RDT-', { exact: false })).toBeVisible()

        await page.locator('label').filter({ hasText: 'Okta / Microsoft Entra (SSO)' }).click()
        await expect(page.getByText('Save this DNS TXT record')).toBeVisible()
        await expect(page.getByText('It will be your login key after approval.')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Copy login key' })).toBeVisible()
        await page.getByPlaceholder('yourcompany.okta.com or login.microsoftonline.com/...').fill('northwind.okta.com')
        await page.locator('label').filter({ hasText: 'Hardware key (YubiKey / WebAuthn)' }).click()
        await expect(page.getByText('Your physical security key is your credential.')).toBeVisible()
        await expect(
            page.getByText('DNS verification still proves organization control, but the DNS TXT record is not used to sign in when Hardware Key is selected.')
        ).toBeVisible()
        await expect(page.getByText('Save this DNS TXT record')).toHaveCount(0)

        await page.getByRole('button', { name: 'Connect LinkedIn' }).click()
        await expect(page.getByText(/LinkedIn verification succeeded\./)).toBeVisible()
        await page.getByRole('button', { name: 'Verify domain' }).click()
        await expect(page.getByText(/Domain verification succeeded\./)).toBeVisible()
        await expect(page.getByRole('button', { name: 'Copy token' })).toBeVisible()
        await expect(page.getByText(/Keep a copy of the TXT record used to verify/)).toBeVisible()

        await page.locator('#affiliation-proof-upload').setInputFiles({
            name: 'affiliation-proof.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('affiliation-proof')
        })
        await page.locator('#authorization-proof-upload').setInputFiles({
            name: 'authorization-letter.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('authorization-letter')
        })

        await expect(page.getByText('Save This Key Now')).toHaveCount(0)
        await expect(page.getByText('permanent login credential')).toHaveCount(0)
        await expect(page.getByText('I have saved my key')).toHaveCount(0)

        await page.getByRole('button', { name: 'Continue to Step 5' }).click()
        await expect(page).toHaveURL(/\/onboarding\/step5$/)
        await expect(page.getByText('Submitted work email', { exact: true })).toBeVisible()
        await expect(page.getByText(completedStep1.officialWorkEmail).first()).toBeVisible()
        await expect(page.getByText('Expected domain', { exact: true })).toBeVisible()
        await expect(page.getByText('security.northwindresearch.com').first()).toBeVisible()
        await expect(page.getByText('Domain alignment', { exact: true })).toBeVisible()
        await expect(page.getByText('Mock accepted', { exact: true }).first()).toBeVisible()
        await expect(page.getByText('SSO reference:')).toHaveCount(0)
    })

    test('step 4 shows reviewer-reference hardware key details when hardware key is selected', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
                useCaseSummary: completedUseCaseSummary,
                participationIntent: completedParticipation,
                legalAcknowledgment: completedLegalAcknowledgment
            }
        })

        await page.goto('/onboarding/step4')

        await page.locator('label').filter({ hasText: 'Hardware key (YubiKey / WebAuthn)' }).click()

        await expect(page.locator('label[for="hardware-key-type"]')).toBeVisible()
        await page.locator('#hardware-key-type').selectOption('YubiKey Bio Series')
        await expect(page.locator('#hardware-key-type')).toHaveValue('YubiKey Bio Series')

        await expect(page.locator('label[for="hardware-key-reference"]')).toBeVisible()
        await page.locator('#hardware-key-reference').fill('YK-5C-NFC-7781')
        await expect(page.locator('#hardware-key-reference')).toHaveValue('YK-5C-NFC-7781')

        await expect(page.getByText('Your physical security key is your credential.')).toBeVisible()
        await expect(page.getByText('Save this DNS TXT record')).toHaveCount(0)
        await expect(page.getByText(/This helps reviewers/)).toBeVisible()
        await expect(page.getByText(/Physical key enrollment and/)).toBeVisible()
        await expect(page.getByText('HIGH ASSURANCE')).toBeVisible()
    })

    test('declared sso login uses the DNS TXT token screen before sign-in', async ({ page }) => {
        await seedAppState(page, {
            auth: {
                accessStatus: 'pending',
                applicantEmail: completedStep1.officialWorkEmail
            },
            onboarding: {
                step1: completedStep1,
                verification: {
                    linkedInConnected: true,
                    domainVerified: true,
                    affiliationFileName: 'affiliation-proof.pdf',
                    authorizationFileName: 'authorization-letter.pdf',
                    authenticationMethod: 'sso',
                    ssoDomain: 'northwind.okta.com',
                    corporateDomain: 'northwindresearch.com',
                    dnsVerificationToken: 'redoubt-verify=RDT-SSO12345'
                }
            }
        })

        await page.goto('/login')

        await page.getByPlaceholder('you@yourcompany.com').fill(completedStep1.officialWorkEmail)
        await page.getByRole('button', { name: 'Continue →' }).click()
        await expect(page.getByRole('heading', { name: 'Identity Lookup Complete' })).toBeVisible()
        await expect(page.getByText('Okta / Microsoft Entra (SSO)')).toBeVisible()
        await page.getByRole('button', { name: 'Continue with SSO' }).click()

        await expect(page.getByRole('heading', { name: 'DNS TXT Login Key' })).toBeVisible()
        await expect(page.getByText('Enter DNS TXT verification token as login key')).toBeVisible()
        await expect(page.getByText('northwind.okta.com')).toBeVisible()
        await page.getByPlaceholder('redoubt-verify=RDT-...').fill('mock-sso-key')
        await page.getByRole('button', { name: 'Sign in with DNS TXT login key' }).click()

        await expect(page).toHaveURL(/\/dashboard$/)
    })

    test('legacy verificationKey storage still hydrates the dns verification token setup state', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
                useCaseSummary: completedUseCaseSummary,
                participationIntent: completedParticipation,
                legalAcknowledgment: completedLegalAcknowledgment,
                verification: {
                    corporateDomain: 'northwindresearch.com',
                    verificationKey: 'redoubt-verify=RDT-LEGACY42'
                }
            }
        })

        await page.goto('/onboarding/step4')

        await expect(page.getByText('DNS verification token')).toBeVisible()
        await expect(page.getByText('redoubt-verify=RDT-LEGACY42')).toBeVisible()
    })

    test('a completed onboarding submission lands on the onboarding confirmation screen and still allows mock console access', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research', 'Analytics'],
                useCaseSummary: completedUseCaseSummary,
                participationIntent: completedParticipation,
                legalAcknowledgment: completedLegalAcknowledgment
            }
        })

        await page.goto('/onboarding/step4')

        await page.getByRole('button', { name: 'Connect LinkedIn' }).click()
        await expect(page.getByText(/LinkedIn verification succeeded\./)).toBeVisible()

        await page.getByPlaceholder('yourcompany.com').fill('northwindresearch.com')
        await page.getByRole('button', { name: 'Continue to DNS setup' }).click()
        await expect(page.getByText('DNS verification token')).toBeVisible()
        await page.getByRole('button', { name: 'Verify domain' }).click()
        await expect(page.getByText(/Domain verification succeeded\./)).toBeVisible()
        await expect(page.getByText('Save This Key Now')).toHaveCount(0)

        await page.locator('#affiliation-proof-upload').setInputFiles({
            name: 'affiliation-proof.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('affiliation-proof')
        })
        await page.locator('#authorization-proof-upload').setInputFiles({
            name: 'authorization-letter.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('authorization-letter')
        })

        await expect(page.getByText('affiliation-proof.pdf')).toBeVisible()
        await expect(page.getByText('authorization-letter.pdf')).toBeVisible()
        await page.locator('label').filter({ hasText: 'Hardware key (YubiKey / WebAuthn)' }).click()

        await page.getByRole('button', { name: 'Continue to Step 5' }).click()
        await expect(page).toHaveURL(/\/onboarding\/step5$/)
        await expect(page.getByRole('heading', { name: 'Final Review & Submission' })).toBeVisible()
        await expect(page.getByText(completedUseCaseSummary)).toBeVisible()
        await expect(page.getByText('Hardware key (YubiKey / WebAuthn)', { exact: true })).toBeVisible()
        await expect(page.getByText('Login key: Physical security key')).toBeVisible()

        await page.getByRole('checkbox', { name: /Responsible data usage/i }).check()
        await page.getByRole('checkbox', { name: /No unauthorized sharing/i }).check()
        await page.getByRole('checkbox', { name: /Platform and compliance policy alignment/i }).check()

        await page.getByRole('button', { name: 'Submit application for review' }).click()

        await expect(page).toHaveURL(/\/onboarding\/confirmation$/)
        await expect(page.getByRole('heading', { name: 'Application Submitted' }).first()).toBeVisible()
        await expect(page.getByText('In review', { exact: true })).toBeVisible()
        await expect(page.getByText(/#RDT-2026-\d{4}/)).toBeVisible()
        await expect(page.getByText('Ready for reviewer handoff').first()).toBeVisible()
        await expect(page.getByText('Login key: Physical security key')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'What Happens Next' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Participant Console' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'View Application Status' })).toBeVisible()

        await page.goto('/onboarding/step1')
        await expect(page).toHaveURL(/\/onboarding\/confirmation$/)

        await page.getByRole('link', { name: 'View Application Status' }).click()
        await expect(page).toHaveURL(/\/application-status$/)
        await expect(page.getByRole('heading', { name: 'Application Status' })).toBeVisible()
        await expect(page.getByText('Verification package')).toBeVisible()
        await expect(page.getByText('Ready for review')).toBeVisible()

        await page.getByRole('link', { name: 'Open Participant Console' }).click()
        await expect(page).toHaveURL(/\/login$/)
        await expect(page.getByText('Application review is still pending.')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Secure Node Entry' })).toBeVisible()

        await page.getByPlaceholder('you@yourcompany.com').fill(completedStep1.officialWorkEmail)
        await page.getByRole('button', { name: 'Continue →' }).click()
        await expect(page.getByRole('heading', { name: 'Identity Lookup Complete' })).toBeVisible()
        await expect(page.getByText(/Declared method/i)).toBeVisible()
        await expect(page.getByText('Hardware Key (WebAuthn / YubiKey)')).toBeVisible()
        await expect(page.getByText(/hardware-key path stays a local frontend demo/i)).toBeVisible()
        await page.getByRole('button', { name: 'Continue with hardware key demo' }).click()

        await expect(page).toHaveURL(/\/dashboard$/)

        const participantDashboardLink = page.getByRole('link', { name: 'Open participant dashboard' })
        await expect(page.getByText('Redoubt Workspace', { exact: true })).toHaveCount(0)
        await expect(participantDashboardLink.getByText('Participant Console', { exact: true })).toBeVisible()

        await participantDashboardLink.click()
        await expect(page).toHaveURL(/\/dashboard$/)
    })
})
