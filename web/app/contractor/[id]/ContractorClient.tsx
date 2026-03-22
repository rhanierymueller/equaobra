'use client'

import { ContractorProfile } from '@/src/features/contractor/pages/ContractorProfile'

export function ContractorClient({ id }: { id: string }) {
  return <ContractorProfile id={id} />
}
