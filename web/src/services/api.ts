const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('equobra_token')
}

export function setToken(token: string): void {
  localStorage.setItem('equobra_token', token)
  document.cookie = `equobra_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
}

export function clearAuth(): void {
  localStorage.removeItem('equobra_token')
  localStorage.removeItem('equobra_user')
  document.cookie = 'equobra_token=; path=/; max-age=0'
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    clearAuth()
    if (typeof window !== 'undefined') window.location.href = '/auth'
    throw new Error('Sessão expirada')
  }

  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro na requisição')
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => {
    const token = getToken()
    return fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (res.status === 401) {
        clearAuth()
        if (typeof window !== 'undefined') window.location.href = '/auth'
        throw new Error('Sessão expirada')
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro no upload')
      return data as T
    })
  },
}
