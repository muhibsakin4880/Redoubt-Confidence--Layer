import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ProtectedEvaluationGate from './ProtectedEvaluationGate'
import { findCredentialForDataset } from '../../domain/ephemeralCredentialStore'

type Props = {
    children: React.ReactNode
}

export default function SecureEnclaveGate({ children }: Props) {
    const { id: datasetId } = useParams()

    const hasCredential = useMemo(() => {
        if (!datasetId) return false
        return findCredentialForDataset(datasetId) !== null
    }, [datasetId])

    if (!datasetId) {
        return <>{children}</>
    }

    return (
        <ProtectedEvaluationGate datasetId={datasetId} fallbackRoute={`/secure-enclave/${datasetId}`}>
            {children}
        </ProtectedEvaluationGate>
    )
}