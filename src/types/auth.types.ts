import type { UserRole } from './user.types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  role: UserRole                // primary role (kept for compat)
  roles: UserRole[]             // multi-role selection
  profession: string
  hourlyRate: string            // stored as string from input, parsed to number when saving
  companyName: string           // contractor company name
  // ── Address (professional)
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  addressNumber: string
  // ── Company address (contratante)
  companyCep: string
  companyStreet: string
  companyNeighborhood: string
  companyCity: string
  companyState: string
  companyAddressNumber: string
  // ── Auth
  password: string
  confirmPassword: string
}

export interface FormFieldError {
  message: string
}

export type LoginErrors = Partial<Record<keyof LoginCredentials, FormFieldError>>
export type RegisterErrors = Partial<Record<keyof RegisterCredentials, FormFieldError>>

export type AuthMode = 'login' | 'register'
