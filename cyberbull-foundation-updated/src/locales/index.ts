import { en } from './en'
import { nl } from './nl'

export const translations = { nl, en } as const

export type TranslationLanguage = keyof typeof translations
export type TranslationSet = (typeof translations)[TranslationLanguage]

export function getTranslation(language: string) {
  return language === 'en' ? en : nl
}
