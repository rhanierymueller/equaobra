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
  obraDuration?: string          // ex: "30 dias", "2 meses"
  lookingForProfessions: string[] // ex: ["Pedreiro", "Eletricista"]
  contactEmail: string
  contactPhone?: string
  createdAt: string
  active: boolean
}
