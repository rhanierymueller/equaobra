import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  role: z.enum(['profissional', 'contratante']),
  roles: z.array(z.enum(['profissional', 'contratante'])).min(1),
  profession: z.string().max(100).optional(),
  professions: z.array(z.string().max(100)).max(20).optional(),
  hourlyRate: z.number().positive().optional(),
  phone: z.string().max(20).optional(),
  companyName: z.string().max(200).optional(),
  cnpj: z.string().max(18).optional(),
  addrCep: z.string().max(10).optional(),
  addrStreet: z.string().max(200).optional(),
  addrNeighborhood: z.string().max(100).optional(),
  addrCity: z.string().max(100).optional(),
  addrState: z.string().max(2).optional(),
  addrNumber: z.string().max(20).optional(),
  addrLat: z.number().optional(),
  addrLng: z.number().optional(),
  compAddrCep: z.string().optional(),
  compAddrStreet: z.string().optional(),
  compAddrNeighborhood: z.string().optional(),
  compAddrCity: z.string().optional(),
  compAddrState: z.string().optional(),
  compAddrNumber: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['profissional', 'contratante']).optional(),
  roles: z
    .array(z.enum(['profissional', 'contratante']))
    .min(1)
    .optional(),
  profession: z.string().max(100).optional(),
  professions: z.array(z.string().max(100)).max(20).optional(),
  hourlyRate: z.number().positive().nullable().optional(),
  showHourlyRate: z.boolean().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().max(1000).optional(),
  available: z.boolean().optional(),
  phone: z.string().nullable().optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  companyName: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  addrCep: z.string().nullable().optional(),
  addrStreet: z.string().nullable().optional(),
  addrNeighborhood: z.string().nullable().optional(),
  addrCity: z.string().nullable().optional(),
  addrState: z.string().nullable().optional(),
  addrNumber: z.string().nullable().optional(),
  addrLat: z.number().nullable().optional(),
  addrLng: z.number().nullable().optional(),
  compAddrCep: z.string().nullable().optional(),
  compAddrStreet: z.string().nullable().optional(),
  compAddrNeighborhood: z.string().nullable().optional(),
  compAddrCity: z.string().nullable().optional(),
  compAddrState: z.string().nullable().optional(),
  compAddrNumber: z.string().nullable().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function sanitizeUser(user: {
  id: string
  name: string
  email: string
  role: string
  roles: string
  profession: string | null
  professions: string | null
  hourlyRate: number | null
  showHourlyRate: boolean
  avatarUrl: string | null
  bio: string | null
  rating: number
  reviewCount: number
  available: boolean
  phone: string | null
  tags: string | null
  companyName: string | null
  cnpj: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  addrCep: string | null
  addrStreet: string | null
  addrNeighborhood: string | null
  addrCity: string | null
  addrState: string | null
  addrNumber: string | null
  addrLat: number | null
  addrLng: number | null
  compAddrCep: string | null
  compAddrStreet: string | null
  compAddrNeighborhood: string | null
  compAddrCity: string | null
  compAddrState: string | null
  compAddrNumber: string | null
  createdAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roles: safeJsonParse<string[]>(user.roles, []),
    profession: user.profession,
    professions: safeJsonParse<string[]>(user.professions, []),
    hourlyRate: user.hourlyRate,
    showHourlyRate: user.showHourlyRate,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    rating: user.rating,
    reviewCount: user.reviewCount,
    available: user.available,
    phone: user.phone,
    tags: safeJsonParse<string[]>(user.tags, []),
    companyName: user.companyName,
    cnpj: user.cnpj,
    website: user.website,
    instagram: user.instagram,
    facebook: user.facebook,
    address: user.addrCity
      ? {
          cep: user.addrCep,
          street: user.addrStreet,
          neighborhood: user.addrNeighborhood,
          city: user.addrCity,
          state: user.addrState,
          number: user.addrNumber,
          lat: user.addrLat,
          lng: user.addrLng,
        }
      : null,
    companyAddress: user.compAddrCity
      ? {
          cep: user.compAddrCep,
          street: user.compAddrStreet,
          neighborhood: user.compAddrNeighborhood,
          city: user.compAddrCity,
          state: user.compAddrState,
          number: user.compAddrNumber,
        }
      : null,
    createdAt: user.createdAt,
  }
}
