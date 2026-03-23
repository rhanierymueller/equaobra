import * as SecureStore from 'expo-secure-store'

// TODO: set EXPO_PUBLIC_API_URL in .env for production deploy
// Example: EXPO_PUBLIC_API_URL=https://api.equaobra.com.br
export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

const TOKEN_KEY = 'equobra_token'

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = text
    try {
      msg = JSON.parse(text)?.error ?? text
    } catch {}
    throw new Error(msg || `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
}
