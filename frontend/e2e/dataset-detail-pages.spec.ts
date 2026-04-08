import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
} as const

const discoveryDatasets = [
    { id: '1', title: 'Global Climate Observations 2020-2024' },
    { id: '2', title: 'Urban Mobility Sensor Streams' },
    { id: '3', title: 'Financial Market Tick Data' },
    { id: '4', title: 'Clinical Outcomes (De-identified)' },
    { id: '5', title: 'Satellite Land Use Dataset 2023' },
    { id: '6', title: 'Consumer Behavior Analytics Q4' },
    { id: '7', title: 'Genomics Research Dataset v2' },
    { id: '8', title: 'Smart Grid Energy Patterns' }
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
        window.localStorage.setItem(keys.workspaceRole, 'buyer')
    }, authStorageKeys)
    await page.reload()
}

test.describe('participant dataset detail journeys', () => {
    test('opens the correct detail page for every discovery card', async ({ page }) => {
        await seedParticipantSession(page)

        for (const dataset of discoveryDatasets) {
            await page.goto('/datasets')
            await expect(page.getByText('Showing 8 of 8 datasets')).toBeVisible()

            await page.getByRole('link', { name: `View details for ${dataset.title}` }).click()

            await expect(page).toHaveURL(new RegExp(`/datasets/${dataset.id}$`))
            await expect(page.getByRole('heading', { name: dataset.title })).toBeVisible()
        }
    })

    test('keeps dataset context on quality, rights, and escrow routes', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/datasets/2/quality-breakdown')
        await expect(page).toHaveURL(/\/datasets\/2\/quality-breakdown$/)
        await expect(page.getByRole('heading', { name: 'Quality Breakdown for Urban Mobility Sensor Streams' })).toBeVisible()

        await page.goto('/datasets/2/rights-quote')
        await expect(page).toHaveURL(/\/datasets\/2\/rights-quote$/)
        await expect(page.getByText('Urban Mobility Sensor Streams').first()).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Configure Evaluation Terms' })).toBeVisible()

        await page.goto('/datasets/3/escrow-checkout')
        await expect(page).toHaveURL(/\/datasets\/3\/escrow-checkout$/)
        await expect(page.getByText('Financial Market Tick Data').first()).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Evaluation Setup' })).toBeVisible()
    })

    test('shows unavailable states instead of falling back to dataset 1', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/datasets/999')
        await expect(page.getByRole('heading', { name: 'Dataset unavailable' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Return to Dataset Discovery' })).toBeVisible()
        await expect(page.getByText('Global Climate Observations 2020-2024')).toHaveCount(0)

        await page.goto('/datasets/999/quality-breakdown')
        await expect(page.getByRole('heading', { name: 'Dataset unavailable' })).toBeVisible()

        await page.goto('/datasets/999/rights-quote')
        await expect(page.getByRole('heading', { name: 'Dataset unavailable' })).toBeVisible()
    })
})
