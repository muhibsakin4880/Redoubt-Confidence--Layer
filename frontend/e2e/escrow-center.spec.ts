import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin'
} as const

async function seedParticipantSession(page: Page) {
    await page.goto('/')
    await page.evaluate((keys) => {
        window.localStorage.clear()
        window.localStorage.setItem(keys.accessStatus, 'approved')
        window.localStorage.setItem(keys.isAuthenticated, 'true')
        window.localStorage.setItem(keys.onboardingInitiated, 'false')
        window.localStorage.setItem(keys.applicantEmail, 'ops@northwindresearch.com')
        window.localStorage.setItem(keys.isAdmin, 'false')
    }, authStorageKeys)
    await page.reload()
}

test.describe('escrow center', () => {
    test('renders the narrowed escrow operations console', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/escrow-center')

        await expect(page).toHaveURL(/\/escrow-center$/)
        await expect(page.getByRole('heading', { name: 'Escrow Center' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Governance watch' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Escrow ledger' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Selected case' })).toBeVisible()

        await expect(page.getByRole('button', { name: 'Overview', exact: true })).toHaveCount(0)
        await expect(page.getByRole('button', { name: 'Transactions', exact: true })).toHaveCount(0)
        await expect(page.getByRole('button', { name: 'Risk & Controls', exact: true })).toHaveCount(0)
        await expect(page.getByRole('button', { name: 'Disputes', exact: true })).toHaveCount(0)

        await expect(page.getByText('Active Disputes', { exact: true })).toHaveCount(0)
        await expect(page.getByText('Post-evaluation paths', { exact: true })).toHaveCount(0)
    })

    test('keeps ledger selection and dispute filtering functional', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/escrow-center')

        await page.getByRole('button', { name: 'Disputed' }).click()

        const disputeRow = page.locator('tr').filter({ hasText: 'ESC-2026-006' }).first()
        await expect(disputeRow).toBeVisible()
        await disputeRow.click()

        const selectedCase = page.getByLabel('Selected case')
        await expect(selectedCase.getByText('Satellite Land Use 2024', { exact: true })).toBeVisible()
        await expect(selectedCase.getByText('Dispute open', { exact: true })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Confirm and Release Payment' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Initiate Dispute' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Extend Window' })).toBeVisible()
    })
})
