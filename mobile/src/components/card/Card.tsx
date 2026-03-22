import { View, TouchableOpacity, ViewStyle } from 'react-native'
import { colors, radius } from '../../design-system/tokens'

interface CardProps {
  children: React.ReactNode
  accent?: boolean
  onPress?: () => void
  style?: ViewStyle
}

export function Card({ children, accent = false, onPress, style }: CardProps) {
  const content = (
    <View
      style={[
        {
          borderRadius: radius.lg,
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: colors.border.default,
        },
        style,
      ]}
    >
      {accent && <View style={{ height: 2, backgroundColor: colors.primary }} />}
      {children}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}
