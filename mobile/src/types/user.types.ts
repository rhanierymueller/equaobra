export interface User {
  id: string
  name: string
  email: string
  role: 'professional' | 'contractor'
  phone?: string
  bio?: string
  profession?: string
  professions?: string[]
  location?: string
  rating?: number
  avatarUrl?: string
  avatarInitials?: string
  whatsapp?: string
  address?: {
    cep?: string
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    lat?: number
    lng?: number
  }
  companyName?: string
  companyAddress?: {
    cep?: string
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
  }
}

export interface AuthResponse {
  token: string
  user: User
}
