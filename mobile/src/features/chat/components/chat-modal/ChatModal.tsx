import { useState, useEffect, useRef } from 'react'
import { View, TouchableOpacity, Modal, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius } from '../../../../design-system/tokens'
import { Text, Avatar } from '../../../../components'
import { api } from '../../../../services/api'
import { useAuth } from '../../../../hooks/useAuth'
import type { User } from '../../../../types'

interface ChatMessage {
  id: string
  senderId: string
  text: string
  timestamp: string
}

interface ChatModalProps {
  prof: User | null
  visible: boolean
  onClose: () => void
}

export function ChatModal({ prof, visible, onClose }: ChatModalProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [convId, setConvId] = useState<string | null>(null)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (!visible || !prof || !user) return
    api.get<Array<{ id: string; professionalId: string; contractorId: string; messages: ChatMessage[] }>>('/api/chats')
      .then(chats => {
        const conv = chats.find(c => c.professionalId === prof.id || c.contractorId === prof.id)
        if (conv) {
          setConvId(conv.id)
          setMessages(conv.messages ?? [])
        }
      })
      .catch(() => {})
  }, [visible, prof?.id])

  const handleSend = async () => {
    if (!text.trim() || !user || !prof) return
    setSending(true)
    try {
      let cId = convId
      if (!cId) {
        const conv = await api.post<{ id: string }>('/api/chats', {
          professionalId: prof.id,
          professionalName: prof.name,
        })
        cId = conv.id
        setConvId(cId)
      }
      const msg = await api.post<ChatMessage>(`/api/chats/${cId}/messages`, { text: text.trim() })
      setMessages(prev => [...prev, msg])
      setText('')
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao enviar mensagem.')
    } finally {
      setSending(false)
    }
  }

  if (!prof) return null

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.backgroundCard }}>
        <View style={{ alignItems: 'center', paddingTop: 12 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.text.disabled }} />
        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: colors.border.default,
        }}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <Avatar name={prof.name} size={36} borderRadius={10} />
          <View style={{ flex: 1 }}>
            <Text weight="bold" size="base" color="primary">{prof.name}</Text>
            <Text weight="regular" size="sm" color="muted">
              {prof.professions?.[0] ?? prof.profession}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, padding: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
        >
          {messages.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="chatbubble-outline" size={40} color={colors.border.light} />
              <Text weight="regular" size="md" color="hint" style={{ marginTop: 10 }}>
                Inicie a conversa
              </Text>
            </View>
          ) : messages.map(m => {
            const mine = m.senderId === user?.id
            return (
              <View key={m.id} style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <View style={{
                  maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8,
                  borderRadius: radius.lg,
                  borderBottomRightRadius: mine ? 4 : radius.lg,
                  borderBottomLeftRadius: mine ? radius.lg : 4,
                  backgroundColor: mine ? colors.primary : 'rgba(255,255,255,0.09)',
                }}>
                  <Text weight="regular" size="base" color="primary">{m.text}</Text>
                </View>
                <Text
                  weight="regular"
                  size="xs"
                  color="hint"
                  style={{ marginTop: 2, marginHorizontal: 4 }}
                >
                  {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )
          })}
          <View style={{ height: 8 }} />
        </ScrollView>

        <View style={{
          flexDirection: 'row', alignItems: 'flex-end', gap: 8,
          paddingHorizontal: 16, paddingVertical: 12,
          borderTopWidth: 1, borderTopColor: colors.border.default,
        }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Mensagem..."
            placeholderTextColor={colors.text.hint}
            multiline
            style={{
              flex: 1, borderRadius: radius.xxl,
              paddingHorizontal: 14, paddingVertical: 10,
              color: colors.text.primary, fontFamily: 'Inter_400Regular', fontSize: 14,
              backgroundColor: 'rgba(255,255,255,0.07)',
              borderWidth: 1, borderColor: colors.border.light,
              maxHeight: 100,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width: 42, height: 42, borderRadius: 21,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: text.trim() ? colors.primary : 'rgba(255,255,255,0.08)',
            }}
          >
            {sending ? (
              <ActivityIndicator color={colors.text.primary} size="small" />
            ) : (
              <Ionicons name="send" size={18} color={text.trim() ? colors.text.primary : colors.text.hint} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
