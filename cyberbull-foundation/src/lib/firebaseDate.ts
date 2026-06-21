export function asDate(value: unknown): Date | null {
  if (!value || typeof value !== 'object') return null
  const anyValue = value as { seconds?: number; nanoseconds?: number; toDate?: () => Date }
  if (typeof anyValue.toDate === 'function') return anyValue.toDate()
  if (typeof anyValue.seconds === 'number') return new Date(anyValue.seconds * 1000)
  return null
}
