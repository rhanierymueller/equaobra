import { z } from 'zod'

export const opportunitySchema = z.object({
  contractorName: z.string(),
  companyName: z.string().optional(),
  avatarInitials: z.string(),
  obraDescription: z.string().min(10),
  obraLocation: z.string().min(2),
  lat: z.number().optional(),
  lng: z.number().optional(),
  obraStart: z.string().optional(),
  obraDuration: z.string().optional(),
  lookingForProfessions: z.array(z.string()).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
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
  return { ...opp, lookingForProfessions: JSON.parse(opp.lookingForProfessions) as string[] }
}
