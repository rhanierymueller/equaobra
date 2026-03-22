import type { UserRole } from './user.types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  role: UserRole
  roles: UserRole[]
  profession: string
  hourlyRate: string
  companyName: string
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  addressNumber: string
  companyCep: string
  companyStreet: string
  companyNeighborhood: string
  companyCity: string
  companyState: string
  companyAddressNumber: string
  password: string
  confirmPassword: string
}

export interface FormFieldError {
  message: string
}

export type LoginErrors = Partial<Record<keyof LoginCredentials, FormFieldError>>
export type RegisterErrors = Partial<Record<keyof RegisterCredentials, FormFieldError>>

export type AuthMode = 'login' | 'register'
