import type { ReactNode } from 'react'

export function FieldNote({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-slate-500">{children}</p>
}
