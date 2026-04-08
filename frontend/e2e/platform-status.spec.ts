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

test.describe('participant platform status', () => {
    test('renders the dense platform status experience for authenticated participants', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/status')

        await expect(page).toHaveURL(/\/status$/)
        await expect(page.getByRole('heading', { name: 'Workspace and platform health' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Today at a glance' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Workflow health' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Active advisories' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Recent incidents and maintenance' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Alerts and support' })).toBeVisible()

        await expect(page.getByText('Workspace availability', { exact: true })).toBeVisible()
        await expect(page.locator('article').filter({ hasText: 'Access review and approvals' }).first()).toBeVisible()
        await expect(page.locator('article').filter({ hasText: 'Evidence ledger compaction' }).first()).toBeVisible()
        await expect(page.getByText('Control monitoring posture', { exact: true })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Save notification preferences' })).toBeVisible()
    })
})
