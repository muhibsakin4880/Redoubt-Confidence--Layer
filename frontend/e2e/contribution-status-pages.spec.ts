import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin'
} as const

const statusScenarios = [
    {
        id: 'cn-1001',
        title: 'Mobility Sensor QA Sample',
        status: 'Processing',
        summary: 'Automated validation is active. Upload integrity checks are complete and schema analysis is now in progress.',
        findingText: 'No active issues in the current validation window.'
    },
    {
        id: 'cn-1002',
        title: 'Climate Station Metadata Patch',
        status: 'Needs fixes',
        summary: 'Validation is paused. The current package must be corrected before the rerun can proceed.',
        findingText: '18% nulls in station altitude and region columns.'
    },
    {
        id: 'cn-1003',
        title: 'Financial Tick Delta Batch',
        status: 'Approved',
        summary: 'Approved for participant access. The current package is live inside a governed replay workspace.',
        findingText: 'No active issues in the current validation window.'
    },
    {
        id: 'cn-1004',
        title: 'Clinical Outcomes Delta',
        status: 'Restricted',
        summary: 'Approved with guardrails. Access is limited to approved healthcare workspaces and reviewed output paths.',
        findingText: 'Latest records lag expected refresh cadence by 48 hours.'
    },
    {
        id: 'cn-1005',
        title: 'Retail Event Enrichment Feed',
        status: 'Rejected',
        summary: 'Rejected after compliance review. This submission will not move into access packaging until the blocking issues are resolved.',
        findingText: 'Primary key duplicates detected in merged partitions.'
    }
] as const

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

test.describe('contribution status pages', () => {
    test('contributions table exposes a status detail link for every status row', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/contributions')

        for (const scenario of statusScenarios) {
            const row = page.locator('tr').filter({ hasText: scenario.title }).first()
            const statusLink = row.getByRole('link', { name: scenario.status })

            await expect(statusLink).toBeVisible()
            await expect(statusLink).toHaveAttribute('href', `/contributions/${scenario.id}/status-details`)
        }
    })

    test('status detail routes render polished status-specific content', async ({ page }) => {
        await seedParticipantSession(page)

        for (const scenario of statusScenarios) {
            await page.goto(`/contributions/${scenario.id}/status-details`)

            await expect(page).toHaveURL(new RegExp(`/contributions/${scenario.id}/status-details$`))
            await expect(page.getByRole('heading', { name: scenario.title })).toBeVisible()
            await expect(page.getByText(scenario.summary, { exact: true })).toBeVisible()
            await expect(page.getByRole('heading', { name: 'First action row' })).toBeVisible()
            await expect(page.getByRole('heading', { name: 'Operational modules' })).toBeVisible()
            await expect(page.getByText(scenario.findingText)).toBeVisible()
            await expect(page.getByText('Detailed contribution tracking is on the way')).toHaveCount(0)
        }
    })

    test('approved status page links to the existing package detail page', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/contributions/cn-1003/status-details')

        const detailLink = page.getByRole('link', { name: 'Open approval package detail' })
        await expect(detailLink).toBeVisible()

        await detailLink.click()

        await expect(page).toHaveURL(/\/contributions\/cn-1003$/)
        await expect(page.getByRole('heading', { name: 'Financial Tick Delta Batch' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Recent Buyer Activity' })).toBeVisible()
    })
})
