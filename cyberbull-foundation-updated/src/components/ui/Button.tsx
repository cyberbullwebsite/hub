import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'success' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
  children?: ReactNode
}

export function Button({ className, variant = 'primary', isLoading, children, disabled, ...props }: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'cyber-button-primary'
      : variant === 'success'
        ? 'cyber-button-success'
        : variant === 'secondary'
          ? 'cyber-button-secondary'
          : 'inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100'

  return (
    <button type={props.type ?? 'button'} className={cn(variantClass, className)} disabled={disabled || isLoading} {...props}>
      {children}
    </button>
  )
}
