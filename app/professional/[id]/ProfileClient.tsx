'use client'

import { ProfessionalProfile } from '@/src/features/professional/pages/ProfessionalProfile'

export function ProfileClient({ id }: { id: string }) {
  return <ProfessionalProfile id={id} />
}
