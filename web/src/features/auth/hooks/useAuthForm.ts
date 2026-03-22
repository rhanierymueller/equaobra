'use client'

import { useState, useCallback } from 'react'
import type {
  LoginCredentials,
  LoginErrors,
  RegisterCredentials,
  RegisterErrors,
} from '@/src/types/auth.types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email: string): string | null {
  if (!email) return 'E-mail é obrigatório'
  if (!EMAIL_REGEX.test(email)) return 'Informe um e-mail válido'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return 'Senha é obrigatória'
  if (password.length < 8) return 'Mínimo de 8 caracteres'
  if (!/\d/.test(password)) return 'Deve conter pelo menos um número'
  if (!/[a-zA-Z]/.test(password)) return 'Deve conter pelo menos uma letra'
  return null
}

function validateName(name: string): string | null {
  if (!name) return 'Nome é obrigatório'
  if (name.trim().length < 3) return 'Mínimo de 3 caracteres'
  return null
}

export interface UseLoginFormReturn {
  values: LoginCredentials
  errors: LoginErrors
  touched: Partial<Record<keyof LoginCredentials, boolean>>
  isSubmitting: boolean
  handleChange: (field: keyof LoginCredentials, value: string) => void
  handleBlur: (field: keyof LoginCredentials) => void
  handleSubmit: (onSuccess: (credentials: LoginCredentials) => void) => void
  reset: () => void
}

const LOGIN_INITIAL: LoginCredentials = { email: '', password: '' }

export function useLoginForm(): UseLoginFormReturn {
  const [values, setValues] = useState<LoginCredentials>(LOGIN_INITIAL)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof LoginCredentials, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = useCallback((v: LoginCredentials): LoginErrors => {
    const errs: LoginErrors = {}
    const emailErr = validateEmail(v.email)
    const passErr = v.password ? null : 'Senha é obrigatória'
    if (emailErr) errs.email = { message: emailErr }
    if (passErr) errs.password = { message: passErr }
    return errs
  }, [])

  const handleChange = useCallback((field: keyof LoginCredentials, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      const newVals = { ...values, [field]: value }
      const errs = validate(newVals)
      setErrors(prev => ({ ...prev, [field]: errs[field] }))
    }
  }, [touched, values, validate])

  const handleBlur = useCallback((field: keyof LoginCredentials) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const errs = validate(values)
    setErrors(prev => ({ ...prev, [field]: errs[field] }))
  }, [values, validate])

  const handleSubmit = useCallback((onSuccess: (creds: LoginCredentials) => void) => {
    const allTouched = { email: true, password: true }
    setTouched(allTouched)
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onSuccess(values)
    }, 800)
  }, [values, validate])

  const reset = useCallback(() => {
    setValues(LOGIN_INITIAL)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [])

  return { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset }
}

export interface UseRegisterFormReturn {
  values: RegisterCredentials
  errors: RegisterErrors
  touched: Partial<Record<keyof RegisterCredentials, boolean>>
  isSubmitting: boolean
  handleChange: (field: keyof RegisterCredentials, value: string) => void
  handleBlur: (field: keyof RegisterCredentials) => void
  handleSubmit: (onSuccess: (credentials: RegisterCredentials) => void) => void
  reset: () => void
}

const REGISTER_INITIAL: RegisterCredentials = {
  name: '',
  email: '',
  role: 'profissional',
  roles: [],
  profession: '',
  hourlyRate: '',
  companyName: '',
  cep: '',
  street: '',
  neighborhood: '',
  city: '',
  state: '',
  addressNumber: '',
  companyCep: '',
  companyStreet: '',
  companyNeighborhood: '',
  companyCity: '',
  companyState: '',
  companyAddressNumber: '',
  password: '',
  confirmPassword: '',
}

export function useRegisterForm(): UseRegisterFormReturn {
  const [values, setValues] = useState<RegisterCredentials>(REGISTER_INITIAL)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterCredentials, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = useCallback((v: RegisterCredentials): RegisterErrors => {
    const errs: RegisterErrors = {}
    const nameErr = validateName(v.name)
    const emailErr = validateEmail(v.email)
    const passErr = validatePassword(v.password)
    const confirmErr =
      !v.confirmPassword
        ? 'Confirmação de senha é obrigatória'
        : v.confirmPassword !== v.password
        ? 'As senhas não coincidem'
        : null

    if (v.roles.length === 0) errs.role = { message: 'Selecione um tipo de conta' }

    const isPro = v.roles.includes('profissional')
    const isCont = v.roles.includes('contratante')

    const professionErr = isPro && !v.profession.trim() ? 'Informe sua profissão' : null
    const companyErr = isCont && !v.companyName.trim() ? 'Nome da empresa é obrigatório' : null

    const cepDigits = v.cep.replace(/\D/g, '')
    if (cepDigits.length > 0 && cepDigits.length !== 8) errs.cep = { message: 'CEP deve ter 8 dígitos' }
    if (!cepDigits) errs.cep = { message: 'CEP é obrigatório' }
    if (!v.city.trim()) errs.city = { message: 'Cidade é obrigatória' }

    if (isCont) {
      const compCepDigits = v.companyCep.replace(/\D/g, '')
      if (compCepDigits.length > 0 && compCepDigits.length !== 8) errs.companyCep = { message: 'CEP deve ter 8 dígitos' }
      if (!compCepDigits) errs.companyCep = { message: 'CEP da empresa é obrigatório' }
      if (!v.companyCity.trim()) errs.companyCity = { message: 'Cidade da empresa é obrigatória' }
    }

    if (nameErr) errs.name = { message: nameErr }
    if (emailErr) errs.email = { message: emailErr }
    if (passErr) errs.password = { message: passErr }
    if (confirmErr) errs.confirmPassword = { message: confirmErr }
    if (professionErr) errs.profession = { message: professionErr }
    if (companyErr) errs.companyName = { message: companyErr }
    return errs
  }, [])

  const handleChange = useCallback((field: keyof RegisterCredentials, value: string) => {
    setValues(prev => {
      if (field === 'roles') {
        try {
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed)) return { ...prev, roles: parsed }
        } catch { }
      }
      return { ...prev, [field]: value }
    })
    if (touched[field]) {
      const newVals = { ...values, [field]: value }
      const errs = validate(newVals)
      setErrors(prev => ({ ...prev, [field]: errs[field] }))
    }
    if (field === 'password' && touched.confirmPassword) {
      const newVals = { ...values, [field]: value }
      const errs = validate(newVals)
      setErrors(prev => ({ ...prev, confirmPassword: errs.confirmPassword }))
    }
  }, [touched, values, validate])

  const handleBlur = useCallback((field: keyof RegisterCredentials) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const errs = validate(values)
    setErrors(prev => ({ ...prev, [field]: errs[field] }))
  }, [values, validate])

  const handleSubmit = useCallback((onSuccess: (creds: RegisterCredentials) => void) => {
    const allTouched: Partial<Record<keyof RegisterCredentials, boolean>> = {
      name: true, email: true, role: true, profession: true,
      password: true, confirmPassword: true,
      cep: true, city: true, companyCep: true, companyCity: true, companyName: true,
    }
    setTouched(allTouched)
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onSuccess(values)
    }, 800)
  }, [values, validate])

  const reset = useCallback(() => {
    setValues(REGISTER_INITIAL)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [])

  return { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset }
}
