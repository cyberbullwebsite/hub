import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSettings } from './SettingsContext'
import { getTranslation } from '@/locales'
import type { TranslationSet } from '@/locales'

type LanguageContextValue = {
  language: string
  setLanguage: (language: string) => void
  availableLanguages: string[]
  t: TranslationSet
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)
const STORAGE_KEY = 'cyberbull-language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  const [language, setLanguageState] = useState<string>(localStorage.getItem(STORAGE_KEY) ?? settings.global.defaultLanguage)

  useEffect(() => {
    const fromStorage = localStorage.getItem(STORAGE_KEY)
    if (fromStorage) {
      setLanguageState(fromStorage)
      return
    }
    setLanguageState(settings.global.defaultLanguage)
  }, [settings.global.defaultLanguage])

  const setLanguage = (next: string) => {
    setLanguageState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const availableLanguages = useMemo(() => {
    return Array.from(new Set([...(settings.global.availableLanguages ?? []), 'nl', 'en']))
  }, [settings.global.availableLanguages])

  const t = useMemo(() => getTranslation(language), [language])

  const value = useMemo(() => ({ language, setLanguage, availableLanguages, t }), [language, availableLanguages, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
