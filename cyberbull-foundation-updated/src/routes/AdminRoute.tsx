import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading, profile, canAccessAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-soft-lg">
          Loading...
        </div>
      </div>
    )
  }

  if (!firebaseUser || !profile) return <Navigate to="/auth" replace />
  if (!canAccessAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
