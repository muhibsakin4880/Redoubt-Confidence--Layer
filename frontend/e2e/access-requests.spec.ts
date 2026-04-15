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

test.describe('access requests console', () => {
    test('renders the enterprise list console with queue, action rail, and activity log', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/access-requests')

        await expect(page).toHaveURL(/\/access-requests$/)
        await expect(page.getByRole('heading', { name: 'Access requests' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Request queue' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Needs your action now' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Workflow lanes' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Active access routes' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Recent request activity' })).toBeVisible()

        const approvedRow = page.locator('tr').filter({ hasText: 'Financial Market Tick Data' }).first()
        await expect(approvedRow.getByText('Access live')).toBeVisible()
        await expect(approvedRow.getByRole('link', { name: 'Open request' })).toHaveAttribute('href', '/access-requests/fx-320')

        const inReviewRow = page.locator('tr').filter({ hasText: 'Global Climate Observations 2020-2024' }).first()
        await expect(inReviewRow.getByText('Respond to reviewer note')).toBeVisible()
        await expect(inReviewRow.getByRole('link', { name: 'Review note' })).toHaveAttribute('href', '/access-requests/cl-204')

        const rejectedRow = page.locator('tr').filter({ hasText: 'Medical Imaging Dataset - Chest X-Rays' }).first()
        await expect(rejectedRow.getByText('Resubmission required')).toBeVisible()
        await expect(rejectedRow.getByRole('link', { name: 'View reason' })).toHaveAttribute('href', '/access-requests/med-441')
    })

    test('renders the upgraded request review detail console', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/access-requests/cl-204')

        await expect(page).toHaveURL(/\/access-requests\/cl-204$/)
        await expect(page.getByRole('heading', { name: 'Global Climate Observations 2020-2024' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Request summary' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Request basis' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Compliance posture' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Reviewer rationale' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Trust review signals' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Review posture' })).toBeVisible()
        await expect(page.locator('span').filter({ hasText: 'Awaiting clarification' }).first()).toBeVisible()
        await expect(page.getByText('Reviewer requested clarification on intended downstream model outputs.')).toBeVisible()
        await expect(page.getByText('Provider + reviewer queue posture')).toBeVisible()
    })
})
