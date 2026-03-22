import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts } from '../../design-system/tokens'

type IoniconName = keyof typeof Ionicons.glyphMap

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: string
  icon?: IoniconName
  iconColor?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmColor = colors.primary,
  icon = 'alert-circle-outline',
  iconColor = colors.primary,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ width: '100%', maxWidth: 340, backgroundColor: colors.backgroundModal, borderRadius: 20, borderWidth: 1, borderColor: colors.border.medium, overflow: 'hidden' }}>
          <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: `${iconColor}15`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${iconColor}30` }}>
              <Ionicons name={icon} size={28} color={iconColor} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <Text style={{ color: colors.text.primary, fontFamily: fonts.extraBold, fontSize: 17, textAlign: 'center', marginBottom: 8 }}>
              {title}
            </Text>
            <Text style={{ color: colors.text.muted, fontFamily: fonts.regular, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
              {message}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border.default }}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              style={{ flex: 1, paddingVertical: 15, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.border.default }}>
              <Text style={{ color: colors.text.muted, fontFamily: fonts.semiBold, fontSize: 15 }}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              style={{ flex: 1, paddingVertical: 15, alignItems: 'center' }}>
              {loading ? (
                <ActivityIndicator color={confirmColor} size="small" />
              ) : (
                <Text style={{ color: confirmColor, fontFamily: fonts.bold, fontSize: 15 }}>
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
