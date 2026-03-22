import type { Professional } from '@/src/types/professional.types'

export interface ProfessionalCardProps {
  professional: Professional
  selected?: boolean
  compact?: boolean
  onClick?: (professional: Professional) => void
}
