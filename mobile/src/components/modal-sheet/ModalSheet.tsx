import { Ionicons } from '@expo/vector-icons'
import type { ModalProps } from 'react-native'
import { View, Modal, TouchableOpacity } from 'react-native'

import { colors, fonts } from '../../design-system/tokens'
import { Text } from '../text/Text'

interface ModalSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  children: React.ReactNode
  animationType?: ModalProps['animationType']
}

function HandleBar() {
  return (
    <View style={{ alignItems: 'center', paddingTop: 12 }}>
      <View
        style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.text.disabled }}
      />
    </View>
  )
}

export function ModalSheet({
  visible,
  onClose,
  title,
  leftAction,
  rightAction,
  children,
  animationType = 'slide',
}: ModalSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.backgroundCard }}>
        <HandleBar />
        {title && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border.default,
            }}
          >
            {leftAction ?? (
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
            <Text weight="bold" size="xl">
              {title}
            </Text>
            {rightAction ?? <View style={{ width: 20 }} />}
          </View>
        )}
        {children}
      </View>
    </Modal>
  )
}
