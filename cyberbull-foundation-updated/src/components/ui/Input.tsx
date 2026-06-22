import React, { type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
}

export function Input({ label, error, helper, leftIcon, className, id, ...props }: InputProps) {
  const inputId = id ?? React.useId()

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={inputId} className="cyber-label block">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">{leftIcon}</div> : null}
        <input
          id={inputId}
          className={cn('cyber-input', leftIcon && 'pl-11', error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10', className)}
          {...props}
        />
      </div>
      {helper && !error ? <p className="text-xs text-slate-500">{helper}</p> : null}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  )
}
