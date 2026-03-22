import { useState, useEffect, useCallback } from 'react'
import { api, setToken, clearToken, getToken } from '../services/api'
import type { User, AuthResponse } from '../types'

const USER_KEY = 'equobra_user'

import * as SecureStore from 'expo-secure-store'

async function persistUser(user: User) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
}

async function loadUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const [token, stored] = await Promise.all([getToken(), loadUser()])
      if (token && stored) setUser(stored)
      setLoading(false)
    }
    init()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password })
    await setToken(res.token)
    await persistUser(res.user)
    setUser(res.user)
    return res.user
  }, [])

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'professional' | 'contractor',
    profession?: string,
  ) => {
    const res = await api.post<AuthResponse>('/api/auth/register', {
      name, email, password, role, profession,
    })
    await setToken(res.token)
    await persistUser(res.user)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    await clearToken()
    await SecureStore.deleteItemAsync(USER_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback(async (updates: Partial<User>) => {
    const updated = await api.patch<User>('/api/users/me', updates)
    await persistUser(updated)
    setUser(updated)
    return updated
  }, [])

  return { user, loading, login, register, logout, updateUser }
}
