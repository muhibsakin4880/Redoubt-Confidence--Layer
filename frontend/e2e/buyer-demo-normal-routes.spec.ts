import { expect, test, type Page } from '@playwright/test'

const storageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
} as const

async function seedParticipantSession(page: Page) {
    await page.goto('/')
    await page.evaluate(keys => {
        window.localStorage.clear()
        window.localStorage.setItem(keys.accessStatus, 'approved')
        window.localStorage.setItem(keys.isAuthenticated, 'true')
        window.localStorage.setItem(keys.onboardingInitiated, 'false')
        window.localStorage.setItem(keys.applicantEmail, 'ops@northwindresearch.com')
        window.localStorage.setItem(keys.isAdmin, 'false')
        window.localStorage.setItem(keys.workspaceRole, 'buyer')
    }, storageKeys)
    await page.reload()
}

test.describe('buyer demo on normal routes', () => {
    test('normal buyer routes expose the visible buyer-demo activation banner', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/escrow-center')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()

        await page.goto('/ephemeral-token')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()

        await page.goto('/datasets/1/escrow-checkout')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()

        await page.goto('/secure-enclave')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()

        await page.goto('/deals/DL-1001/output-review')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()
    })

    test('normal-route checkout drives the canonical buyer demo progression', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/datasets/1/escrow-checkout')

        await page.getByRole('button', { name: 'Load buyer demo' }).click()
        await page.getByRole('button', { name: /Jump to Quote Ready/i }).click()

        await expect(page.getByRole('button', { name: '1. Fund Escrow' })).toBeVisible()
        await page.getByRole('button', { name: '1. Fund Escrow' }).click()
        await page.getByRole('button', { name: '2. Provision Workspace' }).click()
        await page.getByRole('button', { name: '3. Issue Scoped Credentials' }).click()

        await expect(page.getByText('Access is now live')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Confirm Buyer Validation' })).toBeVisible()
        await page.getByRole('button', { name: 'Confirm Buyer Validation' }).click()
        await page.getByRole('button', { name: '4. Release Escrow' }).click()

        await expect(page.getByRole('button', { name: 'Escrow Released' })).toBeVisible()
    })

    test('normal-route buyer demo stays synced across token, workspace, output review, and escrow center', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/ephemeral-token')

        await page.getByRole('button', { name: 'Load happy path' }).click()

        await expect(page.getByText('TOK-DEMO-1001')).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Secure Workspace' })).toBeVisible()

        await page.getByRole('link', { name: 'Open Secure Workspace' }).click()
        await expect(page).toHaveURL(/\/secure-enclave$/)
        await expect(page.getByRole('heading', { name: 'Secure Enclave & Clean Room' })).toBeVisible()
        await expect(page.getByText('Evaluation access active').first()).toBeVisible()

        await page.getByRole('link', { name: 'Review Output' }).click()
        await expect(page).toHaveURL(/\/deals\/DL-1001\/output-review$/)
        await expect(page.getByText('Output pending review').first()).toBeVisible()

        await page.getByRole('link', { name: 'Open Escrow Center' }).click()
        await expect(page).toHaveURL(/\/escrow-center$/)
        await expect(page.getByText('Active demo case')).toBeVisible()
        await expect(page.getByText('Live demo case')).toBeVisible()
    })

    test('reset demo returns the normal buyer routes to their non-demo state', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/ephemeral-token')

        await page.getByRole('button', { name: 'Load happy path' }).click()
        await expect(page.getByText('TOK-DEMO-1001')).toBeVisible()

        await page.getByRole('button', { name: 'Reset demo' }).click()

        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'No active Ephemeral Token' })).toBeVisible()
    })

    test('demo storage does not leak canonical demo quote or escrow ids into normal dataset browsing', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/escrow-center')
        await page.getByRole('button', { name: /Jump to Token Issued/i }).click()

        await page.goto('/datasets/1')
        await expect(page.getByText('QT-DEMO-1001')).toHaveCount(0)
        await expect(page.getByText('ESC-DEMO-1001')).toHaveCount(0)

        await page.goto('/datasets/1/rights-quote')
        await expect(page.getByText('QT-DEMO-1001')).toHaveCount(0)
    })
})
