export interface Opportunity {
  id: string
  contractorId: string
  contractorName: string
  companyName?: string
  avatarInitials: string
  obraDescription: string
  obraLocation: string
  lat?: number
  lng?: number
  obraStart?: string
  obraDuration?: string
  lookingForProfessions: string[]
  contactEmail: string
  contactPhone?: string
  createdAt: string
  active: boolean
}
