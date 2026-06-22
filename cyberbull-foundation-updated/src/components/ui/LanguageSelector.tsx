import { ChevronDown, Languages } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from './Button'
import { cn } from '@/lib/cn'

export function LanguageSelector() {
  const { language, setLanguage, availableLanguages } = useLanguage()
  const visibleLabel = language === 'en' ? 'English' : 'Nederlands'

  return (
    <details className="group relative">
      <summary className="list-none">
        <Button type="button" variant="secondary" className="min-w-[116px] rounded-full px-4 py-2 text-sm shadow-sm">
          <Languages className="h-4 w-4 text-cyberblue" />
          <span>{visibleLabel}</span>
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </Button>
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft-lg">
        {availableLanguages.map((lang) => {
          const label = lang === 'en' ? 'English' : lang === 'nl' ? 'Nederlands' : lang
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={cn('block w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50', lang === language && 'bg-slate-50 font-semibold text-cyberblue')}
            >
              {label}
            </button>
          )
        })}
      </div>
    </details>
  )
}
