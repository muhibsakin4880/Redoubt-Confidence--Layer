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
    await page.getByPlaceholder('Your organization').fill(completedStep1.organizationName)
    await page.getByPlaceholder('name@organization.com').fill(completedStep1.officialWorkEmail)
    await page.getByPlaceholder('Research lead, ML engineer, analyst...').fill(completedStep1.roleInOrganization)
    await page.getByPlaceholder('Healthcare, mobility, climate...').fill(completedStep1.industryDomain)
    await page.getByPlaceholder('Country').fill(completedStep1.country)
}

test.describe('participant onboarding', () => {
    test('mock sign-in still works when onboarding has not started', async ({ page }) => {
        await seedAppState(page)

        await page.goto('/login')

        await expect(page.getByRole('heading', { name: 'System Authentication' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Access Request Required' })).not.toBeVisible()

        await page.getByPlaceholder('Authorized Corporate Email or Node ID').fill(completedStep1.officialWorkEmail)
        await page.getByRole('button', { name: 'Verify Identity →' }).click()
        await page.getByRole('button', { name: /Authenticate via Okta \/ Microsoft Entra/i }).click()

        await expect(page).toHaveURL(/\/dashboard$/)
    })

    test('request access starts a fresh onboarding flow instead of resuming a prior submission', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
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

        await page.getByRole('button', { name: /Request Platform Access|Request Access/i }).first().click()

        await expect(page).toHaveURL(/\/onboarding\/step1$/)
        await expect(page.getByRole('heading', { name: 'Organization & Identity' })).toBeVisible()
        await expect(page.getByPlaceholder('Your organization')).toHaveValue('')
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
                intendedUsage: ['Research']
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
        await page.getByPlaceholder('INV-XXXXXX').fill('123')
        await page.getByRole('button', { name: 'Continue to Step 2' }).click()

        await expect(page).toHaveURL(/\/onboarding\/step1$/)
        await expect(page.getByText(/Please complete all required fields with a valid corporate email\./)).toBeVisible()
    })

    test('step 4 keeps progress disabled until LinkedIn, DNS, and both uploads are complete', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research'],
                participationIntent: completedParticipation,
                legalAcknowledgment: completedLegalAcknowledgment
            }
        })

        await page.goto('/onboarding/step4')
        await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled()
        await expect(page.getByRole('button', { name: 'Connect LinkedIn' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Verify DNS Record' })).toBeVisible()
        await expect(page.getByText('Upload Proof of Affiliation')).toBeVisible()
        await expect(page.getByText('Upload Authorization / Compliance Letter')).toBeVisible()
    })

    test('a completed onboarding submission lands on the onboarding confirmation screen and still allows mock console access', async ({ page }) => {
        await seedAppState(page, {
            onboarding: {
                step1: completedStep1,
                intendedUsage: ['Research', 'Analytics'],
                participationIntent: completedParticipation,
                legalAcknowledgment: completedLegalAcknowledgment
            }
        })

        await page.goto('/onboarding/step4')

        await page.getByRole('button', { name: 'Connect LinkedIn' }).click()
        await expect(page.getByText('Affiliation Confirmed')).toBeVisible()

        await page.getByRole('button', { name: 'Verify DNS Record' }).click()
        await expect(page.getByText('Domain Verified')).toBeVisible()

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

        await page.getByRole('button', { name: 'Next' }).click()
        await expect(page).toHaveURL(/\/onboarding\/step5$/)
        await expect(page.getByRole('heading', { name: 'Final Review & Commitments' })).toBeVisible()

        await page.getByRole('checkbox', { name: /I will use approved data only/i }).check()
        await page.getByRole('checkbox', { name: /I will not share, resell, or redistribute/i }).check()
        await page.getByRole('checkbox', { name: /I will follow Redoubt governance requirements/i }).check()

        await page.getByRole('button', { name: 'Submit Application' }).click()

        await expect(page).toHaveURL(/\/onboarding\/confirmation$/)
        await expect(page.getByRole('heading', { name: 'Participant Onboarding' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Application Submitted' })).toBeVisible()
        await expect(page.getByText('In review', { exact: true })).toBeVisible()
        await expect(page.getByText(/#RDT-2026-\d{4}/)).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Participant Console' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'View Application Status' })).toBeVisible()

        await page.goto('/onboarding/step1')
        await expect(page).toHaveURL(/\/onboarding\/confirmation$/)

        await page.getByRole('link', { name: 'View Application Status' }).click()
        await expect(page).toHaveURL(/\/application-status$/)
        await expect(page.getByRole('heading', { name: 'Application Status' })).toBeVisible()

        await page.getByRole('link', { name: 'Open Participant Console' }).click()
        await expect(page).toHaveURL(/\/login$/)
        await expect(page.getByText('Application review is still pending.')).toBeVisible()

        await page.getByPlaceholder('Authorized Corporate Email or Node ID').fill(completedStep1.officialWorkEmail)
        await page.getByRole('button', { name: 'Verify Identity →' }).click()
        await page.getByRole('button', { name: /Authenticate via Okta \/ Microsoft Entra/i }).click()

        await expect(page).toHaveURL(/\/dashboard$/)
    })
})
