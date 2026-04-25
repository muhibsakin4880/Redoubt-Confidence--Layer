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

test.describe('demo story coherence', () => {
    test('demo rights quote builder hands off to the demo checkout route', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/datasets/1/rights-quote')
        await page.getByRole('button', { name: 'Proceed To Protected Evaluation' }).click()

        await expect(page).toHaveURL(/\/demo\/datasets\/1\/escrow-checkout$/)
        await expect(page.getByLabel('Demo controls')).toBeVisible()
    })

    test('demo routes keep the same canonical buyer story across stage jumps, navigation, and reloads', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/datasets/1/escrow-checkout')

        await expect(page.getByLabel('Demo controls')).toBeVisible()
        await expect(page.getByText('Presenter narrative')).toBeVisible()
        await page.getByRole('button', { name: 'Reset demo' }).click()

        await expect(
            page.getByLabel('Demo controls').locator('p', {
                hasText: 'Buyer has selected dataset and rights terms, but escrow is not funded yet.'
            })
        ).toBeVisible()

        await page.getByRole('button', { name: /Jump to Escrow Funded/i }).click()
        await page.getByRole('link', { name: 'Open Escrow Center' }).click()

        await expect(page).toHaveURL(/\/demo\/escrow-center$/)
        await expect(page.getByText('Active demo case')).toBeVisible()
        await expect(
            page.getByLabel('Selected case').locator('span').filter({ hasText: 'Escrow Funded' }).first()
        ).toBeVisible()

        await page.reload()
        await expect(page.getByText('Active demo case')).toBeVisible()
        await expect(
            page.getByLabel('Selected case').locator('span').filter({ hasText: 'Escrow Funded' }).first()
        ).toBeVisible()

        await page.getByRole('button', { name: /Jump to Workspace Ready/i }).click()
        await page.getByLabel('Selected case').getByRole('link', { name: 'Secure Workspace' }).click()

        await expect(page).toHaveURL(/\/demo\/secure-enclave$/)
        await expect(page.getByText('Ready for token issue').first()).toBeVisible()
        await expect(page.getByText('/demo/secure-enclave')).toBeVisible()

        await page.reload()
        await expect(page.getByText('Ready for token issue').first()).toBeVisible()

        await page.goto('/demo/escrow-center')
        await page.getByRole('button', { name: /Jump to Token Issued/i }).click()
        await page.getByLabel('Selected case').getByRole('link', { name: 'Ephemeral Token' }).click()

        await expect(page).toHaveURL(/\/demo\/ephemeral-token$/)
        await expect(page.getByText('TOK-DEMO-1001')).toBeVisible()
        await expect(page.getByLabel('Ephemeral Token summary').getByText('Token status').first()).toBeVisible()

        await page.reload()
        await expect(page.getByText('TOK-DEMO-1001')).toBeVisible()

        await page.goto('/demo/escrow-center')
        await page.getByRole('button', { name: /Jump to Release Pending/i }).click()
        await page.getByLabel('Selected case').getByRole('link', { name: 'Output Review' }).click()

        await expect(page).toHaveURL(/\/demo\/deals\/DL-1001\/output-review$/)
        await expect(page.getByText('Output ready for approval / release').first()).toBeVisible()
        await expect(page.getByText('Reviewed outputs only')).toBeVisible()

        await page.reload()
        await expect(page.getByText('Output ready for approval / release').first()).toBeVisible()

        await page.goto('/demo/escrow-center')
        await page.getByRole('button', { name: /Jump to Released/i }).click()
        await expect(
            page.getByLabel('Selected case').locator('span').filter({ hasText: 'Released' }).first()
        ).toBeVisible()
        await page.getByLabel('Selected case').getByRole('link', { name: 'Ephemeral Token' }).click()

        await expect(page).toHaveURL(/\/demo\/ephemeral-token$/)
        await expect(page.getByText('TOK-DEMO-1001')).toBeVisible()
        await expect(page.getByText('This token is no longer usable.').first()).toBeVisible()

        await page.goto('/demo/secure-enclave')
        await expect(page.getByText('Access closed').first()).toBeVisible()

        await page.goto('/demo/deals/DL-1001/output-review')
        await expect(page.getByText('Output approved / released').first()).toBeVisible()
        await expect(page.getByText('Reviewed outputs are approved and escrow is closed.').first()).toBeVisible()
    })

    test('demo canonical state does not force normal buyer routes into demo mode', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/escrow-center')
        await page.getByRole('button', { name: /Jump to Token Issued/i }).click()

        await page.goto('/ephemeral-token')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()
        await expect(page.getByText('TOK-DEMO-1001')).toHaveCount(0)

        await page.goto('/escrow-center')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()
        await expect(page.getByText('Live demo case')).toHaveCount(0)
        await expect(page.getByText('Active demo case')).toHaveCount(0)

        await page.goto('/secure-enclave')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toBeVisible()
        await expect(page.getByText('Buyer Demo · Secure Workspace')).toHaveCount(0)
    })
})
