export interface Opportunity {
  id: string
  contractorId: string
  contractorName: string
  companyName?: string
  avatarInitials?: string
  obraLocation: string
  obraDescription?: string
  obraStart?: string
  obraDuration?: string
  lookingForProfessions: string[]
  active: boolean
  createdAt: string
}

export interface Interest {
  id: string
  contractorId: string
  professionalId: string
  professionalName: string
  professionalInitials: string
  profession?: string
  location?: string
  rating?: number
  createdAt: string
}
