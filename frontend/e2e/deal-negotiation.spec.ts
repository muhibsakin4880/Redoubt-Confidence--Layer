import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
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
        window.localStorage.setItem(keys.workspaceRole, 'buyer')
    }, authStorageKeys)
    await page.reload()
}

test.describe('deal negotiation history', () => {
    test('access request detail links into the negotiation log', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/access-requests/cl-204')
        await expect(page.getByRole('heading', { name: 'Connected deal surfaces' })).toBeVisible()

        await page.getByRole('link', { name: 'Open negotiation history' }).click()

        await expect(page).toHaveURL(/\/deals\/DL-1001\/negotiation$/)
        await expect(page.getByRole('heading', { name: 'Clarification & Negotiation History' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Structured Q/A and clarification thread' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'First-class scope history' })).toBeVisible()
    })

    test('evaluation dossier links into the negotiation history surface', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/deals/DL-1002')
        await page.getByRole('link', { name: 'Open negotiation history' }).click()

        await expect(page).toHaveURL(/\/deals\/DL-1002\/negotiation$/)
        await expect(page.getByText('Replay entitlement window narrowed for the first evaluation', { exact: true })).toBeVisible()
        await expect(page.getByText('Commercial and policy edits', { exact: true })).toBeVisible()
    })
})
