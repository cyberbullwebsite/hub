import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth, configureAuthPersistence } from '@/config/firebase'
import { getUserProfile } from '@/services/userService'
import { loginWithEmailPassword, logoutUser, registerCyberBullAccount, sendResetLink } from '@/services/authService'
import type { AuthProfile } from '@/types/auth'

type AuthContextValue = {
  firebaseUser: FirebaseUser | null
  profile: AuthProfile | null
  loading: boolean
  authReady: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    firstName: string
    lastName: string
    email: string
    password: string
    language: string
  }) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  canAccessAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    configureAuthPersistence()
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Authentication persistence failed.')
      })
      .finally(() => {
        if (active) setAuthReady(true)
      })

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const nextProfile = await getUserProfile(user.uid)
        setProfile(nextProfile)
      } catch (err) {
        setProfile(null)
        setError(err instanceof Error ? err.message : 'Unable to load user profile.')
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (!auth.currentUser) return
    const nextProfile = await getUserProfile(auth.currentUser.uid)
    setProfile(nextProfile)
  }

  const login = async (email: string, password: string) => {
    setError(null)
    await loginWithEmailPassword(email, password)
  }

  const register = async (payload: {
    firstName: string
    lastName: string
    email: string
    password: string
    language: string
  }) => {
    setError(null)
    await registerCyberBullAccount(payload)
  }

  const resetPassword = async (email: string) => {
    setError(null)
    await sendResetLink(email)
  }

  const logout = async () => {
    setError(null)
    await logoutUser()
  }

  const canAccessAdmin = useMemo(() => profile?.role === 'admin' || profile?.role === 'owner', [profile?.role])

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      authReady,
      error,
      login,
      register,
      resetPassword,
      logout,
      refreshProfile,
      canAccessAdmin,
    }),
    [firebaseUser, profile, loading, authReady, error, canAccessAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
