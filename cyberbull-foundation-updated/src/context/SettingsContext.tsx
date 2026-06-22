import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { AppSettings, AuthSettings, FeatureFlags, GlobalSettings, UISettings } from '@/types/settings'

type SettingsState = AppSettings

type SettingsContextValue = {
  settings: SettingsState
  loading: boolean
}

const defaultSettings: SettingsState = {
  global: {
    defaultLanguage: 'nl',
    availableLanguages: ['nl', 'en'],
    registrationEnabled: true,
    maintenanceMode: false,
    announcement: '',
  },
  auth: {
    registrationMode: 'open',
    allowedDomains: [],
    passwordMinLength: 8,
  },
  ui: {
    theme: 'light',
    colors: {
      primary: '#1674ea',
      success: '#2fa943',
    },
  },
  featureFlags: {},
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
        const data = snapshot.data() as Partial<GlobalSettings> | undefined
        setSettings((current) => ({
          ...current,
          global: { ...defaultSettings.global, ...(data ?? {}) },
        }))
        setLoading(false)
      }, () => setLoading(false)),
      onSnapshot(doc(db, 'settings', 'auth'), (snapshot) => {
        const data = snapshot.data() as Partial<AuthSettings> | undefined
        setSettings((current) => ({
          ...current,
          auth: { ...defaultSettings.auth, ...(data ?? {}) },
        }))
        setLoading(false)
      }, () => setLoading(false)),
      onSnapshot(doc(db, 'settings', 'ui'), (snapshot) => {
        const data = snapshot.data() as Partial<UISettings> | undefined
        setSettings((current) => ({
          ...current,
          ui: {
            ...defaultSettings.ui,
            ...(data ?? {}),
            colors: {
              ...defaultSettings.ui.colors,
              ...(data?.colors ?? {}),
            },
          },
        }))
        setLoading(false)
      }, () => setLoading(false)),
      onSnapshot(doc(db, 'settings', 'featureFlags'), (snapshot) => {
        const data = snapshot.data() as FeatureFlags | undefined
        setSettings((current) => ({
          ...current,
          featureFlags: data ?? defaultSettings.featureFlags,
        }))
        setLoading(false)
      }, () => setLoading(false)),
    ]

    return () => unsubscribers.forEach((unsub) => unsub())
  }, [])

  const value = useMemo(() => ({ settings, loading }), [settings, loading])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used inside SettingsProvider')
  return context
}
