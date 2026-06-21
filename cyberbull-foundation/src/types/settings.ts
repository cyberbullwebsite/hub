export type LanguageCode = 'nl' | 'en' | (string & {})

export interface GlobalSettings {
  defaultLanguage: LanguageCode
  availableLanguages: LanguageCode[]
  registrationEnabled: boolean
  maintenanceMode: boolean
  announcement: string
}

export interface AuthSettings {
  registrationMode: 'open' | 'restricted'
  allowedDomains: string[]
  passwordMinLength: number
}

export interface UISettings {
  theme: 'light' | 'dark'
  colors: {
    primary: string
    success: string
  }
}

export interface FeatureFlags {
  [key: string]: boolean
}

export interface AppSettings {
  global: GlobalSettings
  auth: AuthSettings
  ui: UISettings
  featureFlags: FeatureFlags
}
