import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn('cyber-badge bg-slate-100 text-slate-700', className)}>{children}</span>
}
