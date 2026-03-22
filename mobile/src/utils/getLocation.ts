import type { User } from '../types'

export function getLocation(user: User): string {
  const addr = user.address
  if (addr?.city) return [addr.city, addr.state].filter(Boolean).join(', ')
  return ((user as Record<string, unknown>).location as string) ?? ''
}
