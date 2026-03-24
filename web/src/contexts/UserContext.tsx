'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { clearAuth, getToken } from '@/src/services/api'
import type { User } from '@/src/types/user.types'

interface UserContextValue {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('equobra_user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(readStoredUser)

  const setUser = useCallback((next: User | null) => {
    setUserState(next)
    if (next) {
      localStorage.setItem('equobra_user', JSON.stringify(next))
    } else {
      clearAuth()
    }
  }, [])

  useEffect(() => {
    const token = getToken()
    if (token && !document.cookie.includes('equobra_token=')) {
      document.cookie = `equobra_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    }
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUserState(null)
  }, [])

  return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside UserProvider')
  return ctx
}
