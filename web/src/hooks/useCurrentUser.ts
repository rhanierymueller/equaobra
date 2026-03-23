'use client'

import { useState } from 'react'

import type { User } from '@/src/types/user.types'

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('equobra_user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(readStoredUser)

  return { user, setUser }
}
