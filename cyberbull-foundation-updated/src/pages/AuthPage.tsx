import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { AuthCard } from '@/components/auth/AuthCard'
import { Logo } from '@/components/ui/Logo'

export function AuthPage() {
  const { firebaseUser, profile, loading } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'

  useEffect(() => {
    document.title = 'CyberBull'
  }, [])

  if (loading && firebaseUser) {
    return (
      <div className="cyber-shell flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 px-4">
        <Logo className="w-52 max-w-[70vw] object-contain sm:w-64" />
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-soft-lg">
          {t.common.loading}
        </div>
      </div>
    )
  }

  if (firebaseUser && profile && profile.accountStatus === 'active') {
    return <Navigate to={from} replace />
  }

  return (
    <div className="cyber-shell flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-center">
        <Logo className="w-52 max-w-[70vw] object-contain sm:w-64" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full"
      >
        <AuthCard />
      </motion.div>
    </div>
  )
}
