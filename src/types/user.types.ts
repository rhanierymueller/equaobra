export type UserRole = 'contratante' | 'profissional'

export interface Address {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  number?: string
  complement?: string
  lat?: number
  lng?: number
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole                // primary role (kept for compatibility)
  roles?: UserRole[]            // multi-role: can be both profissional AND contratante
  profession?: string           // legacy / primary profession (kept for compatibility)
  professions?: string[]        // multi-profession list
  hourlyRate?: number
  showHourlyRate?: boolean      // if false, shows "A combinar"
  avatarUrl?: string
  createdAt: string
  // ── Address
  address?: Address             // professional address
  companyAddress?: Address      // contractor/company address (only when also contratante)
  // ── Contractor / Empreiteiro fields
  companyName?: string
  cnpj?: string
  website?: string
  instagram?: string
  facebook?: string
}

export interface AuthUser extends User {
  token: string
}
