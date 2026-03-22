import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { View, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native'

import { Text, Avatar, Badge, Button, StarRating, SectionLabel } from '../../../../components'
import { colors, radius } from '../../../../design-system/tokens'
import type { User } from '../../../../types'
import { getLocation } from '../../../../utils/getLocation'
import { ChatModal } from '../../../chat/components'
import { AddToTeamModal } from '../../../team/components'

interface ProfileModalProps {
  prof: User | null
  visible: boolean
  onClose: () => void
}

export function ProfileModal({ prof, visible, onClose }: ProfileModalProps) {
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showChat, setShowChat] = useState(false)

  if (!prof) return null

  const professions = prof.professions ?? (prof.profession ? [prof.profession] : [])
  const location = getLocation(prof)
  const hourlyRate = (prof as Record<string, unknown>).hourlyRate as number | undefined
  const showHourlyRate = (prof as Record<string, unknown>).showHourlyRate as boolean | undefined
  const tags = (prof as Record<string, unknown>).tags as string[] | undefined

  const handleWhatsApp = () => {
    const number = prof.whatsapp!.replace(/\D/g, '')
    Linking.openURL(`https://wa.me/55${number}`)
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, backgroundColor: colors.backgroundCard }}>
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.text.disabled,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 4,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 }}>
              <View style={{ marginBottom: 12 }}>
                <Avatar name={prof.name} size={80} borderRadius={22} />
              </View>
              <Text weight="extraBold" size="2xl" color="primary" align="center">
                {prof.name}
              </Text>
              {prof.rating && prof.rating > 0 ? (
                <View style={{ marginTop: 6 }}>
                  <StarRating rating={prof.rating} size={15} />
                </View>
              ) : null}
              {location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <Ionicons name="location-outline" size={12} color={colors.text.muted} />
                  <Text weight="regular" size="sm" color="muted">
                    {location}
                  </Text>
                </View>
              ) : null}
              {professions.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 12,
                    justifyContent: 'center',
                  }}
                >
                  {professions.map((p) => (
                    <Badge key={p} label={p} variant="primary" size="md" />
                  ))}
                </View>
              )}
            </View>

            <View style={{ paddingHorizontal: 16, marginBottom: 16, gap: 10 }}>
              <Button
                variant="primary"
                icon="people"
                label="Adicionar à equipe"
                onPress={() => setShowAddTeam(true)}
                size="lg"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button
                  variant="secondary"
                  icon="chatbubble-outline"
                  label="Mensagem"
                  onPress={() => setShowChat(true)}
                  flex
                />

                {prof.whatsapp ? (
                  <Button
                    variant="whatsapp"
                    icon="logo-whatsapp"
                    label="WhatsApp"
                    onPress={handleWhatsApp}
                    flex
                  />
                ) : null}
              </View>
            </View>

            {prof.bio ? (
              <View
                style={{
                  marginHorizontal: 16,
                  marginBottom: 12,
                  padding: 14,
                  borderRadius: radius.lg,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
              >
                <SectionLabel label="SOBRE" style={{ marginBottom: 6 }} />
                <Text weight="regular" size="sm" color="secondary" lineHeight={20}>
                  {prof.bio}
                </Text>
              </View>
            ) : null}

            <View
              style={{
                marginHorizontal: 16,
                marginBottom: 12,
                padding: 14,
                borderRadius: radius.lg,
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: colors.border.default,
              }}
            >
              <SectionLabel label="INFORMAÇÕES" style={{ marginBottom: 10 }} />
              {prof.phone ? (
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}
                >
                  <Ionicons name="call-outline" size={15} color={colors.primary} />
                  <Text weight="regular" size="sm" color="secondary">
                    {prof.phone}
                  </Text>
                </View>
              ) : null}
              {hourlyRate && showHourlyRate !== false ? (
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}
                >
                  <Ionicons name="cash-outline" size={15} color={colors.primary} />
                  <Text weight="regular" size="sm" color="secondary">
                    R$ {hourlyRate}/hora
                  </Text>
                </View>
              ) : null}
              {tags && tags.length > 0 ? (
                <View style={{ marginTop: 4 }}>
                  <SectionLabel label="ESPECIALIDADES" style={{ marginBottom: 8 }} />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {tags.map((t) => (
                      <Badge key={t} label={t} variant="muted" />
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </Modal>

      <AddToTeamModal prof={prof} visible={showAddTeam} onClose={() => setShowAddTeam(false)} />
      <ChatModal prof={prof} visible={showChat} onClose={() => setShowChat(false)} />
    </>
  )
}
