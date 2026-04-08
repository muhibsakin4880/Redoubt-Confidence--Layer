import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
} as const

const datasetStorageKeys = {
    shortlist: 'Redoubt:datasets:shortlist',
    compare: 'Redoubt:datasets:compare'
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

test.describe('participant dataset discovery', () => {
    test('supports buyer filtering, sorting, empty-state reset, and detail routing', async ({ page }) => {
        await seedParticipantSession(page)
        const resultsRegion = page.getByRole('region', { name: 'Decision-ready results' })

        await page.goto('/datasets')

        await expect(page.getByRole('heading', { name: 'Dataset Discovery' })).toBeVisible()
        await expect(page.getByText('Showing 8 of 8 datasets')).toBeVisible()

        await page.getByRole('button', { name: 'Filter domain Healthcare' }).click()
        await expect(page.getByRole('button', { name: 'Filter domain Healthcare' })).toHaveAttribute('aria-pressed', 'true')
        await expect(page.getByText('Showing 2 of 8 datasets')).toBeVisible()

        await page.getByLabel('Sort datasets').selectOption('most-recent')
        await expect(resultsRegion.locator('article[aria-label^="Dataset card for"]').first()).toContainText('Clinical Outcomes (De-identified)')

        await page.getByLabel('Sort datasets').selectOption('highest-confidence')
        await expect(resultsRegion.locator('article[aria-label^="Dataset card for"]').first()).toContainText('Genomics Research Dataset v2')

        await page.getByPlaceholder('Search by title, use case, domain, or confidence summary').fill('zzzz-no-match')
        await expect(page.getByText('No datasets match these filters')).toBeVisible()

        await page.getByRole('button', { name: 'Reset filters' }).first().click()
        await expect(page.getByText('Showing 8 of 8 datasets')).toBeVisible()

        await page.getByRole('link', { name: 'View details for Global Climate Observations 2020-2024' }).click()
        await expect(page).toHaveURL(/\/datasets\/1$/)
        await expect(page.getByRole('heading', { name: 'Global Climate Observations 2020-2024' })).toBeVisible()
    })

    test('persists shortlist and compare state across reloads and enforces the compare cap', async ({ page }) => {
        await seedParticipantSession(page)
        const globalClimateCard = page.getByRole('article', { name: 'Dataset card for Global Climate Observations 2020-2024' })
        const marketTickCard = page.getByRole('article', { name: 'Dataset card for Financial Market Tick Data' })
        const genomicsCard = page.getByRole('article', { name: 'Dataset card for Genomics Research Dataset v2' })
        const smartGridCard = page.getByRole('article', { name: 'Dataset card for Smart Grid Energy Patterns' })
        const shortlistRegion = page.getByRole('region', { name: 'Review shortlist' })
        const compareRegion = page.getByRole('region', { name: 'Compare datasets' })

        await page.goto('/datasets')
        await expect(page.getByText('Showing 8 of 8 datasets')).toBeVisible()

        await globalClimateCard.getByRole('button', { name: 'Add Global Climate Observations 2020-2024 to shortlist' }).click()
        await globalClimateCard.getByRole('button', { name: 'Add Global Climate Observations 2020-2024 to compare' }).click()
        await marketTickCard.getByRole('button', { name: 'Add Financial Market Tick Data to compare' }).click()
        await genomicsCard.getByRole('button', { name: 'Add Genomics Research Dataset v2 to compare' }).click()

        await expect(smartGridCard.getByRole('button', { name: 'Add Smart Grid Energy Patterns to compare' })).toBeDisabled()
        await expect(shortlistRegion.getByText('Global Climate Observations 2020-2024')).toBeVisible()
        await expect(compareRegion.getByText('3 of 3 selected')).toBeVisible()

        await expect.poll(async () => {
            return await page.evaluate(({ shortlist, compare }) => {
                return {
                    shortlist: window.localStorage.getItem(shortlist),
                    compare: window.localStorage.getItem(compare)
                }
            }, datasetStorageKeys)
        }).toEqual({
            shortlist: '[1]',
            compare: '[1,3,7]'
        })

        await page.reload()
        await expect(shortlistRegion.getByText('Global Climate Observations 2020-2024')).toBeVisible()
        await expect(compareRegion.getByText('Financial Market Tick Data').first()).toBeVisible()
        await expect(compareRegion.getByText('Genomics Research Dataset v2').first()).toBeVisible()
    })
})
