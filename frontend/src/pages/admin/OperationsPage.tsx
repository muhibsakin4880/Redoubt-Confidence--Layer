import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { OperationsContent } from '../../components/admin/OperationsContent'
import { useAuth } from '../../contexts/AuthContext'

export default function OperationsPage({
    title = 'Operations',
    subtitle = 'Protected evaluation environments, residency posture, and approval readiness blockers'
}: { title?: string; subtitle?: string }) {
    const auth = useAuth()

    if (!auth.isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    return (
        <AdminLayout title={title} subtitle={subtitle}>
            <OperationsContent />
        </AdminLayout>
    )
}
