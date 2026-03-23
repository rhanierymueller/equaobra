'use client'

import { useEffect, useState } from 'react'

import type { User } from '@/src/types/user.types'

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('equobra_user')
      if (raw) setUser(JSON.parse(raw) as User)
    } catch {}
    setLoaded(true)
  }, [])

  return { user, loaded }
}
