import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AdminPage } from '@/pages/AdminPage'
import { AccessDeniedPage } from '@/pages/AccessDeniedPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AdminRoute } from '@/routes/AdminRoute'

export default function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </SettingsProvider>
  )
}

function AppRoutes() {
  const { authReady, error, firebaseUser, profile, loading } = useAuth()

  useEffect(() => {
    if (profile?.theme) {
      document.documentElement.dataset.theme = profile.theme
    }
  }, [profile?.theme])

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-soft-lg">
          Booting CyberBull...
        </div>
      </div>
    )
  }

  if (error && !firebaseUser && !loading) {
    return <AuthPage />
  }

  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
