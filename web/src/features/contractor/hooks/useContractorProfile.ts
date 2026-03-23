'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useInterests } from '@/src/features/opportunity/hooks/useInterests'
import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import type { Opportunity } from '@/src/types/opportunity.types'
import type { TeamMember } from '@/src/types/team.types'
import type { User } from '@/src/types/user.types'

type ChatTarget = Pick<TeamMember, 'professionalId' | 'name' | 'avatarInitials' | 'avatarUrl' | 'profession'>

export function useContractorProfile(id: string) {
  const router = useRouter()
  const { opportunities, publish, updateOpportunity } = useOpportunities()
  const { addInterest } = useInterests(id)
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('equobra_user')
      if (raw) setUser(JSON.parse(raw) as User)
    } catch {}
    setLoaded(true)
  }, [])

  const isMe = loaded && user?.id === id
  const opp: Opportunity | undefined = opportunities.find((o) => o.contractorId === id)

  const displayName = opp
    ? (opp.companyName ?? opp.contractorName)
    : user?.companyName || user?.name || 'Perfil'

  const avatarInitials =
    opp?.avatarInitials ??
    displayName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  function openChatWithContractor() {
    if (!user) {
      router.push('/auth')
      return
    }
    if (opp) {
      addInterest({
        contractorId: id,
        professionalId: user.id,
        professionalName: user.name,
        professionalInitials: user.name
          .split(' ')
          .slice(0, 2)
          .map((n: string) => n[0])
          .join('')
          .toUpperCase(),
        profession: user.professions?.[0] ?? user.profession,
        location: user.address?.city ? `${user.address.city}, ${user.address.state}` : undefined,
        rating: undefined,
      })
    }
    setChatTarget({
      professionalId: id,
      name: displayName,
      profession: 'Contratante',
      avatarInitials,
    })
  }

  function openChatWithCandidate(
    candidateId: string,
    name: string,
    initials: string,
    profession?: string,
  ) {
    if (!user) return
    setChatTarget({
      professionalId: candidateId,
      name,
      profession: profession ?? 'Profissional',
      avatarInitials: initials,
    })
  }

  return {
    user,
    loaded,
    isMe,
    opp,
    displayName,
    avatarInitials,
    chatTarget,
    setChatTarget,
    publish,
    updateOpportunity,
    openChatWithContractor,
    openChatWithCandidate,
  }
}
