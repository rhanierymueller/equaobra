import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text, Avatar, Button, Badge, ModalSheet, SectionLabel } from '../../src/components'
import { colors, radius } from '../../src/design-system/tokens'
import { useAuth } from '../../src/hooks/useAuth'
import { useTeams } from '../../src/hooks/useTeams'
import type { Team, TeamMember, WorkLog } from '../../src/types'

function formatDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function groupLogsByDate(logs: WorkLog[]) {
  const groups: Record<string, WorkLog[]> = {}
  for (const log of logs) {
    const key = log.date
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

const HOUR_PRESETS = [4, 6, 8, 10, 12]

function LogRow({ log, onDelete }: { log: WorkLog; onDelete: () => void }) {
  return (
    <View
      className="flex-row items-center justify-between px-4 py-3 rounded-xl mb-2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: colors.border.default,
      }}
    >
      <View className="flex-1">
        <Text weight="semiBold" size="sm" color="primary">
          {log.memberName}
        </Text>
        {log.note ? (
          <Text size="xs" color="muted" style={{ marginTop: 2 }}>
            {log.note}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-3">
        <View
          className="items-center px-3 py-1 rounded-lg"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <Text weight="bold" size="sm" style={{ color: colors.primary }}>
            {log.hours}h
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color="rgba(229,57,53,0.6)" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

interface AddLogModalProps {
  visible: boolean
  team: Team
  onClose: () => void
  onSave: (memberId: string, memberName: string, hours: number, note: string) => Promise<void>
}

function AddLogModal({ visible, team, onClose, onSave }: AddLogModalProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [hours, setHours] = useState(8)
  const [customHours, setCustomHours] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<'member' | 'hours'>('member')

  useEffect(() => {
    if (visible) {
      setSelectedMember(null)
      setHours(8)
      setCustomHours('')
      setUseCustom(false)
      setNote('')
      setStep('member')
    }
  }, [visible])

  const handleSave = async () => {
    const finalHours = useCustom ? parseFloat(customHours) : hours
    if (!selectedMember) return
    if (!finalHours || finalHours <= 0 || finalHours > 24) {
      Alert.alert('Horas inválidas', 'Informe entre 1 e 24 horas.')
      return
    }
    setSaving(true)
    try {
      await onSave(selectedMember.id, selectedMember.name, finalHours, note.trim())
      onClose()
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o ponto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Registrar Ponto"
      leftAction={
        <TouchableOpacity onPress={onClose}>
          <Text size="sm" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Cancelar
          </Text>
        </TouchableOpacity>
      }
      rightAction={
        <TouchableOpacity
          onPress={step === 'hours' ? handleSave : undefined}
          disabled={step === 'member'}
        >
          {saving ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text
              weight="bold"
              size="sm"
              style={{ color: step === 'hours' ? colors.primary : 'transparent' }}
            >
              Salvar
            </Text>
          )}
        </TouchableOpacity>
      }
    >
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center gap-2 py-4">
          <Ionicons name="construct-outline" size={14} color={colors.primary} />
          <Text weight="semiBold" style={{ color: colors.primary, fontSize: 13 }}>
            {team.obraName}
          </Text>
        </View>

        {step === 'member' ? (
          <>
            <Text weight="bold" size="base" color="primary" style={{ marginBottom: 4 }}>
              Selecione o profissional
            </Text>
            <Text size="sm" color="muted" style={{ marginBottom: 20 }}>
              Escolha quem vai registrar o ponto hoje
            </Text>

            {team.members.length === 0 ? (
              <View className="py-12 items-center">
                <Ionicons name="people-outline" size={40} color="rgba(245,240,235,0.2)" />
                <Text size="sm" style={{ color: 'rgba(245,240,235,0.3)', marginTop: 12 }}>
                  Nenhum membro nesta equipe
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {team.members.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => {
                      setSelectedMember(m)
                      setStep('hours')
                    }}
                    className="flex-row items-center gap-3 p-4 rounded-xl"
                    style={{
                      backgroundColor:
                        selectedMember?.id === m.id
                          ? `${colors.primary}15`
                          : 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor:
                        selectedMember?.id === m.id ? `${colors.primary}40` : colors.border.default,
                    }}
                  >
                    <Avatar name={m.name} size={44} borderRadius={radius.md} />
                    <View className="flex-1">
                      <Text weight="semiBold" size="sm" color="primary">
                        {m.name}
                      </Text>
                      <Text size="xs" color="muted" style={{ marginTop: 2 }}>
                        {m.profession}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="rgba(245,240,235,0.2)" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setStep('member')}
              className="flex-row items-center gap-1 mb-4"
            >
              <Ionicons name="chevron-back" size={16} color="rgba(245,240,235,0.5)" />
              <Text size="sm" style={{ color: 'rgba(245,240,235,0.5)' }}>
                Voltar
              </Text>
            </TouchableOpacity>

            {selectedMember && (
              <View
                className="flex-row items-center gap-3 p-4 rounded-xl mb-6"
                style={{
                  backgroundColor: `${colors.primary}10`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}30`,
                }}
              >
                <Avatar name={selectedMember.name} size={40} borderRadius={10} />
                <View>
                  <Text weight="semiBold" size="sm" color="primary">
                    {selectedMember.name}
                  </Text>
                  <Text size="xs" style={{ color: colors.primary }}>
                    {selectedMember.profession}
                  </Text>
                </View>
              </View>
            )}

            <Text weight="bold" size="base" color="primary" style={{ marginBottom: 4 }}>
              Horas trabalhadas
            </Text>
            <Text size="sm" color="muted" style={{ marginBottom: 20 }}>
              Quantas horas {selectedMember?.name.split(' ')[0]} trabalhou hoje?
            </Text>

            {!useCustom && (
              <View className="flex-row flex-wrap gap-3 mb-5">
                {HOUR_PRESETS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setHours(h)}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: radius.xl,
                      backgroundColor: hours === h ? colors.primary : 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: hours === h ? colors.primary : colors.border.light,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      weight="extraBold"
                      style={{ color: hours === h ? 'white' : colors.text.secondary, fontSize: 18 }}
                    >
                      {h}
                    </Text>
                    <Text
                      style={{
                        color: hours === h ? 'rgba(255,255,255,0.8)' : 'rgba(245,240,235,0.35)',
                        fontSize: 10,
                      }}
                    >
                      horas
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => setUseCustom(true)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: radius.xl,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="add" size={22} color={colors.text.muted} />
                  <Text style={{ color: 'rgba(245,240,235,0.35)', fontSize: 10 }}>outro</Text>
                </TouchableOpacity>
              </View>
            )}

            {useCustom && (
              <View className="mb-5">
                <SectionLabel label="HORAS PERSONALIZADAS" style={{ marginBottom: 8 }} />
                <View className="flex-row items-center gap-3">
                  <TextInput
                    value={customHours}
                    onChangeText={setCustomHours}
                    placeholder="Ex: 7.5"
                    placeholderTextColor={colors.text.hint}
                    keyboardType="decimal-pad"
                    className="flex-1 rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: `${colors.primary}50`,
                      color: 'white',
                      fontSize: 18,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setUseCustom(false)}
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <Text style={{ color: 'rgba(245,240,235,0.5)', fontSize: 12 }}>Presets</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View className="mb-6">
              <SectionLabel label="OBSERVAÇÃO (opcional)" style={{ marginBottom: 8 }} />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Ex: Trabalhou na fundação"
                placeholderTextColor={colors.text.hint}
                multiline
                numberOfLines={3}
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  textAlignVertical: 'top',
                  minHeight: 80,
                  color: 'white',
                  fontSize: 14,
                }}
              />
            </View>

            <Button
              variant="primary"
              icon="checkmark-circle"
              label="Registrar Ponto"
              loading={saving}
              disabled={saving}
              onPress={handleSave}
              size="lg"
              style={{ marginBottom: 24 }}
            />
          </>
        )}
      </ScrollView>
    </ModalSheet>
  )
}

export default function PontoScreen() {
  const { user } = useAuth()
  const { teams, loading, refresh, addWorkLog, removeWorkLog } = useTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? teams[0] ?? null

  useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(teams[0].id)
    }
  }, [teams, selectedTeamId])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const handleSaveLog = async (
    memberId: string,
    memberName: string,
    hours: number,
    note: string,
  ) => {
    if (!selectedTeam) return
    await addWorkLog(selectedTeam.id, memberId, {
      memberName,
      date: todayISO(),
      hours,
      note: note || undefined,
    })
  }

  const handleDeleteLog = (teamId: string, logId: string) => {
    Alert.alert('Remover ponto', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeWorkLog(teamId, logId) },
    ])
  }

  const todayLogs = (selectedTeam?.workLogs ?? []).filter((l) => l.date === todayISO())
  const totalHoursToday = todayLogs.reduce((s, l) => s + l.hours, 0)

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View style={{ height: 3, backgroundColor: colors.primary }} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text weight="bold" size="2xl" color="primary" letterSpacing={-0.5}>
                Bater Ponto
              </Text>
              <Text size="sm" color="muted" style={{ marginTop: 2 }}>
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            </View>
            {user && <Avatar name={user.name} size={40} borderRadius={radius.md} />}
          </View>
        </View>

        {teams.length === 0 ? (
          <View
            className="mx-5 mt-8 py-16 rounded-2xl items-center"
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Ionicons name="people-outline" size={48} color={colors.text.disabled} />
            <Text
              weight="medium"
              size="sm"
              color="muted"
              style={{ marginTop: 16, marginBottom: 4 }}
            >
              Nenhuma equipe criada
            </Text>
            <Text size="xs" style={{ color: 'rgba(245,240,235,0.2)' }}>
              Crie uma equipe na aba Equipes
            </Text>
          </View>
        ) : (
          <>
            {teams.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-5 mb-4"
                contentContainerStyle={{ gap: 8, paddingRight: 20 }}
              >
                {teams.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTeamId(t.id)}
                    className="px-4 py-2 rounded-xl"
                    style={{
                      backgroundColor:
                        selectedTeam?.id === t.id ? colors.primary : 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: selectedTeam?.id === t.id ? colors.primary : colors.border.light,
                    }}
                  >
                    <Text
                      weight="semiBold"
                      style={{
                        color: selectedTeam?.id === t.id ? 'white' : 'rgba(245,240,235,0.6)',
                        fontSize: 13,
                      }}
                    >
                      {t.obraName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {selectedTeam && (
              <>
                <View
                  className="mx-5 mb-4 p-5 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderWidth: 1,
                    borderColor: colors.border.default,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View>
                      <SectionLabel label="HOJE" style={{ marginBottom: 2 }} />
                      <Text weight="bold" size="lg" color="primary">
                        {selectedTeam.obraName}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        weight="extraBold"
                        style={{ color: colors.primary, fontSize: 28, lineHeight: 32 }}
                      >
                        {totalHoursToday}h
                      </Text>
                      <Text size="xs" style={{ color: 'rgba(245,240,235,0.35)' }}>
                        {todayLogs.length} registro{todayLogs.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  {todayLogs.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {todayLogs.map((l) => (
                        <Badge
                          key={l.id}
                          label={`${l.memberName.split(' ')[0]} ${l.hours}h`}
                          variant="primary"
                          size="sm"
                        />
                      ))}
                    </View>
                  )}

                  <Button
                    variant="primary"
                    icon="add-circle"
                    label="Registrar Ponto"
                    onPress={() => setModalVisible(true)}
                  />
                </View>

                {(selectedTeam.workLogs ?? []).length > 0 && (
                  <View className="mx-5 mb-6">
                    <Text weight="bold" size="base" color="primary" style={{ marginBottom: 12 }}>
                      Histórico
                    </Text>
                    {groupLogsByDate(selectedTeam.workLogs ?? []).map(([date, logs]) => {
                      const dayTotal = logs.reduce((s, l) => s + l.hours, 0)
                      return (
                        <View key={date} className="mb-4">
                          <View className="flex-row items-center justify-between mb-2">
                            <SectionLabel
                              label={date === todayISO() ? 'HOJE' : formatDate(date).toUpperCase()}
                            />
                            <Text weight="bold" size="xs" style={{ color: colors.primary }}>
                              {dayTotal}h total
                            </Text>
                          </View>
                          {logs.map((log) => (
                            <LogRow
                              key={log.id}
                              log={log}
                              onDelete={() => handleDeleteLog(selectedTeam.id, log.id)}
                            />
                          ))}
                        </View>
                      )
                    })}
                  </View>
                )}

                {(selectedTeam.workLogs ?? []).length === 0 && (
                  <View
                    className="mx-5 mb-6 py-12 rounded-2xl items-center"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      borderColor: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Ionicons name="time-outline" size={36} color={colors.text.disabled} />
                    <Text
                      size="sm"
                      style={{ color: 'rgba(245,240,235,0.3)', marginTop: 12, marginBottom: 4 }}
                    >
                      Nenhum ponto registrado
                    </Text>
                    <Text size="xs" style={{ color: 'rgba(245,240,235,0.18)' }}>
                      Toque em "Registrar Ponto" para começar
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {selectedTeam && (
        <AddLogModal
          visible={modalVisible}
          team={selectedTeam}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveLog}
        />
      )}
    </SafeAreaView>
  )
}
