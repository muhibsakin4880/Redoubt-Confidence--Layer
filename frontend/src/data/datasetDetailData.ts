export type { DatasetDetail } from './datasetCatalogData'
export { DATASET_DETAILS, getDatasetDetailById } from './datasetCatalogData'

export type RequestStatus = import('./datasetCatalogData').DatasetDetail['access']['status']

export const qualityColor = (score: number) => {
    if (score >= 95) return 'bg-green-400'
    if (score >= 90) return 'bg-blue-400'
    if (score >= 80) return 'bg-yellow-400'
    return 'bg-orange-400'
}

export const decisionLabel = (decision: import('./datasetCatalogData').DatasetDetail['preview']['decision']) =>
    decision === 'production'
        ? { text: 'Recommended for production research', classes: 'bg-emerald-500/15 border-emerald-400 text-emerald-200' }
        : { text: 'Suitable for experimentation only', classes: 'bg-amber-500/15 border-amber-400 text-amber-200' }

export const confidenceLevel = (score: number) => {
    if (score >= 97) return { label: 'Enterprise Grade', classes: 'bg-emerald-500/15 border-emerald-400 text-emerald-200' }
    if (score >= 93) return { label: 'High', classes: 'bg-green-500/15 border-green-400 text-green-200' }
    if (score >= 88) return { label: 'Moderate', classes: 'bg-amber-500/15 border-amber-400 text-amber-200' }
    return { label: 'Low', classes: 'bg-orange-500/15 border-orange-400 text-orange-200' }
}
