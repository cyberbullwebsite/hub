function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]/g, '')
}

export function buildCyberBullEmail(username: string, domain: string) {
  return `${normalize(username)}@${normalize(domain)}`
}

export function generateCyberBullUsername(firstName: string, lastName: string) {
  const first = normalize(firstName).replace(/[^a-z]/g, '')
  const last = normalize(lastName).replace(/[^a-z]/g, '')

  if (!first && !last) return ''
  if (!last) return `${first.slice(0, 2)}`
  if (!first) return `${last}`

  return `${last}${first.slice(0, 2)}`
}

export function isLikelyDomain(value: string) {
  const normalized = normalize(value)
  return normalized.length > 0 && normalized.includes('.') && !normalized.startsWith('.') && !normalized.endsWith('.')
}
