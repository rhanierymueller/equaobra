import { z } from 'zod'

export const opportunitySchema = z.object({
  contractorName: z.string().max(100),
  companyName: z.string().max(200).optional(),
  avatarInitials: z.string().max(5),
  obraDescription: z.string().min(10).max(5000),
  obraLocation: z.string().min(2).max(200),
  lat: z.number().optional(),
  lng: z.number().optional(),
  obraStart: z.string().max(50).optional(),
  obraDuration: z.string().max(50).optional(),
  lookingForProfessions: z.array(z.string().max(100)).min(1).max(20),
  contactEmail: z.string().email().max(255),
  contactPhone: z.string().max(20).optional(),
})

export type OpportunityInput = z.infer<typeof opportunitySchema>

export function deserializeOpportunity(opp: {
  id: string
  contractorId: string
  contractorName: string
  companyName: string | null
  avatarInitials: string
  obraDescription: string
  obraLocation: string
  lat: number | null
  lng: number | null
  obraStart: string | null
  obraDuration: string | null
  lookingForProfessions: string
  contactEmail: string
  contactPhone: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}) {
  let professions: string[] = []
  try {
    professions = JSON.parse(opp.lookingForProfessions) as string[]
  } catch {
    professions = []
  }
  return { ...opp, lookingForProfessions: professions }
}
