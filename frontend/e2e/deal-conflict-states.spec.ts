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

async function seedAdminSession(page: Page) {
    await page.goto('/')
    await page.evaluate((keys) => {
        window.localStorage.clear()
        window.localStorage.setItem(keys.accessStatus, 'approved')
        window.localStorage.setItem(keys.isAuthenticated, 'true')
        window.localStorage.setItem(keys.onboardingInitiated, 'false')
        window.localStorage.setItem(keys.applicantEmail, 'admin@redoubt.io')
        window.localStorage.setItem(keys.isAdmin, 'true')
        window.localStorage.setItem(keys.workspaceRole, 'buyer')
    }, authStorageKeys)
    await page.reload()
}

test.describe('rights and residency conflict states', () => {
    test('quote builder shows a denied-usage conflict when replay rights are broadened', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/datasets/3/rights-quote')
        await page.getByRole('button', { name: 'Customer-facing output' }).click()

        await expect(page.getByRole('heading', { name: 'Policy conflicts and conditional lanes' })).toBeVisible()
        await expect(page.getByText('Denied usage rights', { exact: true })).toBeVisible()
        await expect(page.getByText('Replay entitlements do not permit this wider package', { exact: true })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open negotiation history' })).toBeVisible()
    })

    test('evaluation dossier surfaces the seeded cross-border review lane', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/deals/DL-1001')

        await expect(page.getByText('Cross-border review required', { exact: true })).toBeVisible()
        await expect(page.getByText('Wider transfer lanes are still conditional', { exact: true })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open provider packet' }).first()).toBeVisible()
    })

    test('workspace approval view shows the regional reroute conflict state', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/deals/DL-1003/approval')

        await expect(page.getByText('Rerouted to approved regional lane', { exact: true })).toBeVisible()
        await expect(page.getByText('The deal was narrowed into a planning-only regional posture', { exact: true })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open negotiation history' }).first()).toBeVisible()
    })

    test('admin approval alias keeps the same conflict object inside the admin console', async ({ page }) => {
        await seedAdminSession(page)

        await page.goto('/admin/application-review/APP-4471/approval')

        await expect(page.getByText('Rerouted to approved regional lane', { exact: true })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Back to application review' }).first()).toBeVisible()
    })
})
