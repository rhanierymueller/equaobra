import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'

import { Text, ModalSheet } from '../../../../components'
import { colors, radius } from '../../../../design-system/tokens'
import { useTeams } from '../../../../hooks/useTeams'
import type { User } from '../../../../types'
import { getInitials } from '../../../../utils/getInitials'

interface AddToTeamModalProps {
  prof: User | null
  visible: boolean
  onClose: () => void
}

export function AddToTeamModal({ prof, visible, onClose }: AddToTeamModalProps) {
  const { teams, addMember } = useTeams()
  const [saving, setSaving] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())

  if (!prof) return null

  const handleAdd = async (teamId: string) => {
    setSaving(teamId)
    try {
      await addMember(teamId, {
        professionalId: prof.id,
        name: prof.name,
        profession: prof.professions?.[0] ?? prof.profession ?? '',
        avatarInitials: getInitials(prof.name),
        phone: prof.phone,
        whatsapp: prof.whatsapp,
        rating: prof.rating,
        dailyRate: (prof as Record<string, unknown>).hourlyRate
          ? ((prof as Record<string, unknown>).hourlyRate as number) * 8
          : undefined,
      })
      setDone((prev) => new Set([...prev, teamId]))
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível adicionar.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <ModalSheet visible={visible} title="Adicionar à equipe" onClose={onClose}>
      <Text
        color="muted"
        size="md"
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}
      >
        Selecione a equipe para adicionar{' '}
        <Text weight="semiBold" size="md">
          {prof.name}
        </Text>
        :
      </Text>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {teams.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={40} color={colors.text.disabled} />
            <Text color="hint" size="md" style={{ marginTop: 12 }}>
              Nenhuma equipe criada
            </Text>
            <Text color="disabled" size="sm" style={{ marginTop: 4 }}>
              Crie uma equipe na aba Equipes
            </Text>
          </View>
        ) : (
          teams.map((team) => (
            <TouchableOpacity
              key={team.id}
              onPress={() => !done.has(team.id) && handleAdd(team.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: radius.lg,
                marginBottom: 10,
                backgroundColor: done.has(team.id)
                  ? 'rgba(76,175,80,0.08)'
                  : 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: done.has(team.id) ? 'rgba(76,175,80,0.25)' : 'rgba(255,255,255,0.08)',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text weight="semiBold" size="base">
                  {team.name}
                </Text>
                <Text color="muted" size="sm" style={{ marginTop: 2 }}>
                  {team.obraName} · {team.members.length} membros
                </Text>
              </View>
              {saving === team.id ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : done.has(team.id) ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              ) : (
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ModalSheet>
  )
}
