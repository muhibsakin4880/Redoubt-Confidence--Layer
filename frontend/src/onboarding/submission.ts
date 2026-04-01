import type { SubmissionMeta } from './types'

export const createSubmissionReferenceId = () => `#RDT-2026-${Math.floor(1000 + Math.random() * 9000)}`

export const formatSubmissionDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

export const buildSubmissionMeta = (date = new Date()): SubmissionMeta => ({
    referenceId: createSubmissionReferenceId(),
    submittedDate: formatSubmissionDate(date)
})
