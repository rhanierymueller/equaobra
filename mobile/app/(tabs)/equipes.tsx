import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, fonts, radius } from '../../src/design-system/tokens'
import { useTeams } from '../../src/hooks/useTeams'
import type { Team, TeamMember } from '../../src/types'

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: `${colors.success}15`, text: colors.success },
    planning: { bg: `${colors.primary}15`, text: colors.primary },
    completed: { bg: 'rgba(255,255,255,0.08)', text: 'rgba(245,240,235,0.4)' },
  }
  const labels: Record<string, string> = {
    active: 'Ativa',
    planning: 'Planejamento',
    completed: 'Concluída',
  }
  const c = statusColors[status] ?? statusColors.planning
  return (
    <View
      className="px-2 py-0.5 rounded-full"
      style={{ backgroundColor: c.bg, borderWidth: 1, borderColor: c.text + '40' }}
    >
      <Text style={{ color: c.text, fontSize: 10, fontFamily: fonts.semiBold }}>
        {labels[status] ?? status}
      </Text>
    </View>
  )
}

function CreateTeamModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean
  onClose: () => void
  onCreate: (name: string, obraName: string, location: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [obraName, setObraName] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setObraName('')
    setLocation('')
  }

  const handleCreate = async () => {
    if (!name.trim() || !obraName.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha o nome da equipe e da obra.')
      return
    }
    setSaving(true)
    try {
      await onCreate(name.trim(), obraName.trim(), location.trim())
      reset()
      onClose()
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a equipe.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ backgroundColor: colors.backgroundCard }}>
        <View className="items-center pt-3 pb-1">
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          />
        </View>
        <View
          className="flex-row items-center justify-between px-5 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border.default }}
        >
          <TouchableOpacity
            onPress={() => {
              reset()
              onClose()
            }}
          >
            <Text
              style={{ color: 'rgba(245,240,235,0.5)', fontSize: 14, fontFamily: fonts.regular }}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 16 }}>
            Nova Equipe
          </Text>
          <TouchableOpacity onPress={handleCreate} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 14 }}>
                Criar
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-5 pt-5" keyboardShouldPersistTaps="handled">
          {[
            {
              label: 'NOME DA EQUIPE',
              value: name,
              set: setName,
              placeholder: 'Ex: Equipe Blumenau 01',
            },
            {
              label: 'OBRA / PROJETO',
              value: obraName,
              set: setObraName,
              placeholder: 'Ex: Residencial Vista Verde',
            },
            {
              label: 'LOCALIZAÇÃO',
              value: location,
              set: setLocation,
              placeholder: 'Ex: Blumenau, SC',
            },
          ].map((field) => (
            <View key={field.label} className="mb-4">
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: fonts.semiBold,
                  color: 'rgba(245,240,235,0.5)',
                  marginBottom: 8,
                }}
              >
                {field.label}
              </Text>
              <TextInput
                value={field.value}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor="rgba(245,240,235,0.25)"
                className="rounded-xl px-4 py-3.5 text-white text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  fontFamily: fonts.regular,
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

function CostCalculator({ members, totalHours }: { members: TeamMember[]; totalHours: number }) {
  const [days, setDays] = useState('0')
  const [ratePerHour, setRatePerHour] = useState('75')
  const [expanded, setExpanded] = useState(false)

  const d = parseFloat(days) || 0
  const r = parseFloat(ratePerHour) || 0
  const totalCost = members.length * r * (d > 0 ? d * 8 : totalHours)

  return (
    <View
      style={{
        marginBottom: 16,
        borderRadius: radius.lg,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: colors.border.default,
      }}
    >
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="calculator-outline" size={16} color={colors.primary} />
          <Text style={{ color: 'white', fontFamily: fonts.bold, fontSize: 14 }}>
            Calculadora de custo
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.text.muted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text.muted,
                  fontSize: 10,
                  fontFamily: fonts.bold,
                  marginBottom: 6,
                }}
              >
                DIAS TRABALHADOS
              </Text>
              <TextInput
                value={days}
                onChangeText={setDays}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(245,240,235,0.2)"
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  color: 'white',
                  fontSize: 14,
                  fontFamily: fonts.regular,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.09)',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text.muted,
                  fontSize: 10,
                  fontFamily: fonts.bold,
                  marginBottom: 6,
                }}
              >
                R$/HORA POR MEMBRO
              </Text>
              <TextInput
                value={ratePerHour}
                onChangeText={setRatePerHour}
                keyboardType="numeric"
                placeholder="75"
                placeholderTextColor="rgba(245,240,235,0.2)"
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  color: 'white',
                  fontSize: 14,
                  fontFamily: fonts.regular,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.09)',
                }}
              />
            </View>
          </View>
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: `${colors.primary}10`,
              borderWidth: 1,
              borderColor: `${colors.primary}25`,
            }}
          >
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
            >
              <Text
                style={{ color: 'rgba(245,240,235,0.5)', fontSize: 12, fontFamily: fonts.regular }}
              >
                {members.length} membros × R${r}/h × {d > 0 ? `${d} dias × 8h` : `${totalHours}h`}
              </Text>
            </View>
            <Text style={{ color: colors.primary, fontFamily: fonts.extraBold, fontSize: 22 }}>
              R${' '}
              {totalCost.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text
              style={{
                color: 'rgba(245,240,235,0.35)',
                fontSize: 11,
                marginTop: 2,
                fontFamily: fonts.regular,
              }}
            >
              custo total estimado
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

function TeamDetailModal({
  team,
  visible,
  onClose,
  onAddMember,
  onRemoveMember,
}: {
  team: Team | null
  visible: boolean
  onClose: () => void
  onAddMember: (teamId: string, name: string, profession: string) => Promise<void>
  onRemoveMember: (teamId: string, memberId: string) => void
}) {
  const [addingMember, setAddingMember] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [memberProfession, setMemberProfession] = useState('')
  const [saving, setSaving] = useState(false)

  if (!team) return null

  const totalLogs = (team.workLogs ?? []).length
  const totalHours = (team.workLogs ?? []).reduce((s, l) => s + l.hours, 0)

  const handleAddMember = async () => {
    if (!memberName.trim() || !memberProfession.trim()) return
    setSaving(true)
    try {
      await onAddMember(team.id, memberName.trim(), memberProfession.trim())
      setMemberName('')
      setMemberProfession('')
      setAddingMember(false)
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o membro.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ backgroundColor: colors.backgroundCard }}>
        <View className="items-center pt-3 pb-1">
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          />
        </View>
        <View
          className="flex-row items-center justify-between px-5 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border.default }}
        >
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={20} color="rgba(245,240,235,0.5)" />
          </TouchableOpacity>
          <Text
            style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 16 }}
            numberOfLines={1}
          >
            {team.obraName}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row gap-3 py-4">
            {[
              { label: 'Membros', value: team.members.length },
              { label: 'Pontos', value: totalLogs },
              { label: 'Horas', value: `${totalHours}h` },
            ].map((s) => (
              <View
                key={s.label}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
              >
                <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.text.primary }}>
                  {s.value}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 2,
                    color: colors.text.muted,
                    fontFamily: fonts.regular,
                  }}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          <CostCalculator members={team.members} totalHours={totalHours} />

          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 16 }}>
              Membros
            </Text>
            <TouchableOpacity
              onPress={() => setAddingMember(!addingMember)}
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{
                backgroundColor: `${colors.primary}15`,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              }}
            >
              <Ionicons name="add" size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 12, fontFamily: fonts.semiBold }}>
                Adicionar
              </Text>
            </TouchableOpacity>
          </View>

          {addingMember && (
            <View
              className="mb-4 p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <TextInput
                value={memberName}
                onChangeText={setMemberName}
                placeholder="Nome do profissional"
                placeholderTextColor="rgba(245,240,235,0.25)"
                className="rounded-xl px-4 py-3 text-white text-sm mb-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  fontFamily: fonts.regular,
                }}
              />
              <TextInput
                value={memberProfession}
                onChangeText={setMemberProfession}
                placeholder="Profissão"
                placeholderTextColor="rgba(245,240,235,0.25)"
                className="rounded-xl px-4 py-3 text-white text-sm mb-3"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  fontFamily: fonts.regular,
                }}
              />
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => {
                    setAddingMember(false)
                    setMemberName('')
                    setMemberProfession('')
                  }}
                  className="flex-1 py-2.5 rounded-xl items-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <Text
                    style={{
                      color: 'rgba(245,240,235,0.5)',
                      fontSize: 13,
                      fontFamily: fonts.regular,
                    }}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddMember}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{ color: 'white', fontFamily: fonts.bold, fontSize: 13 }}>
                      Adicionar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {team.members.length === 0 ? (
            <View
              className="py-8 items-center mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12 }}
            >
              <Text
                style={{ color: 'rgba(245,240,235,0.3)', fontSize: 13, fontFamily: fonts.regular }}
              >
                Nenhum membro ainda
              </Text>
            </View>
          ) : (
            <View className="gap-2 mb-6">
              {team.members.map((m) => (
                <View
                  key={m.id}
                  className="flex-row items-center gap-3 p-3 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderWidth: 1,
                    borderColor: colors.border.default,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: `${colors.primary}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: `${colors.primary}35`,
                    }}
                  >
                    <Text
                      style={{ color: colors.primary, fontFamily: fonts.extraBold, fontSize: 13 }}
                    >
                      {m.avatarInitials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontFamily: fonts.semiBold,
                        fontSize: 14,
                      }}
                    >
                      {m.name}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: colors.text.muted, fontFamily: fonts.regular }}
                    >
                      {m.profession}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Remover membro', `Remover ${m.name}?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Remover',
                          style: 'destructive',
                          onPress: () => onRemoveMember(team.id, m.id),
                        },
                      ])
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="remove-circle-outline" size={18} color="rgba(229,57,53,0.5)" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}

export default function EquipesScreen() {
  const { teams, loading, refresh, createTeam, addMember, removeMember } = useTeams()
  const [createVisible, setCreateVisible] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const handleCreate = async (name: string, obraName: string, location: string) => {
    await createTeam({ name, obraName, location, status: 'active' })
  }

  const handleAddMember = async (teamId: string, name: string, profession: string) => {
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    const updated = await addMember(teamId, {
      name,
      profession,
      avatarInitials: initials,
      professionalId: '',
    })
    setSelectedTeam(updated)
  }

  const handleRemoveMember = (teamId: string, memberId: string) => {
    removeMember(teamId, memberId)
    setSelectedTeam((prev) =>
      prev ? { ...prev, members: prev.members.filter((m) => m.id !== memberId) } : prev,
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <View>
          <Text
            style={{
              color: colors.text.primary,
              fontFamily: fonts.bold,
              fontSize: 24,
              letterSpacing: -0.5,
            }}
          >
            Equipes
          </Text>
          <Text
            style={{
              fontSize: 14,
              marginTop: 2,
              color: colors.text.muted,
              fontFamily: fonts.regular,
            }}
          >
            {teams.length} equipe{teams.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setCreateVisible(true)}
          className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={{ color: 'white', fontFamily: fonts.bold, fontSize: 13 }}>Nova</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {teams.length === 0 ? (
          <View
            className="py-16 items-center rounded-2xl mt-4"
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Ionicons name="people-outline" size={48} color={colors.text.disabled} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.medium,
                marginTop: 16,
                marginBottom: 4,
                color: colors.text.muted,
              }}
            >
              Nenhuma equipe ainda
            </Text>
            <Text
              style={{
                fontSize: 12,
                marginBottom: 20,
                color: 'rgba(245,240,235,0.2)',
                fontFamily: fonts.regular,
              }}
            >
              Crie uma equipe para começar
            </Text>
            <TouchableOpacity
              onPress={() => setCreateVisible(true)}
              className="flex-row items-center gap-1.5 px-5 py-2.5 rounded-xl"
              style={{
                backgroundColor: `${colors.primary}20`,
                borderWidth: 1,
                borderColor: `${colors.primary}40`,
              }}
            >
              <Ionicons name="add" size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 13 }}>
                Criar equipe
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          teams.map((team) => {
            const totalHours = (team.workLogs ?? []).reduce((s, l) => s + l.hours, 0)
            return (
              <TouchableOpacity
                key={team.id}
                onPress={() => setSelectedTeam(team)}
                className="rounded-2xl overflow-hidden mb-3"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
              >
                <View style={{ height: 2, backgroundColor: colors.primary }} />
                <View className="p-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text
                        style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 16 }}
                        numberOfLines={1}
                      >
                        {team.obraName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          marginTop: 2,
                          color: colors.text.muted,
                          fontFamily: fonts.regular,
                        }}
                      >
                        {team.name}
                      </Text>
                      {team.location ? (
                        <View className="flex-row items-center gap-1 mt-1">
                          <Ionicons name="location-outline" size={10} color={colors.text.muted} />
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.text.muted,
                              fontFamily: fonts.regular,
                            }}
                          >
                            {team.location}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <StatusBadge status={team.status} />
                  </View>

                  <View className="flex-row gap-4">
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'rgba(245,240,235,0.3)',
                          fontFamily: fonts.regular,
                        }}
                      >
                        Membros
                      </Text>
                      <Text
                        style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.text.primary }}
                      >
                        {team.members.length}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'rgba(245,240,235,0.3)',
                          fontFamily: fonts.regular,
                        }}
                      >
                        Horas registradas
                      </Text>
                      <Text
                        style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.text.primary }}
                      >
                        {totalHours}h
                      </Text>
                    </View>
                    <View className="flex-1 items-end">
                      <View className="flex-row -space-x-2">
                        {team.members.slice(0, 4).map((m, i) => (
                          <View
                            key={m.id}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              backgroundColor: `${colors.primary}30`,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 1.5,
                              borderColor: colors.backgroundCard,
                              marginLeft: i > 0 ? -8 : 0,
                              zIndex: team.members.length - i,
                            }}
                          >
                            <Text
                              style={{
                                color: colors.primary,
                                fontSize: 9,
                                fontFamily: fonts.extraBold,
                              }}
                            >
                              {m.avatarInitials}
                            </Text>
                          </View>
                        ))}
                        {team.members.length > 4 && (
                          <View
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 1.5,
                              borderColor: colors.backgroundCard,
                              marginLeft: -8,
                            }}
                          >
                            <Text
                              style={{
                                color: 'rgba(245,240,235,0.5)',
                                fontSize: 9,
                                fontFamily: fonts.bold,
                              }}
                            >
                              +{team.members.length - 4}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <CreateTeamModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreate={handleCreate}
      />

      <TeamDetailModal
        team={selectedTeam}
        visible={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />
    </SafeAreaView>
  )
}
