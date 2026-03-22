import { View, ViewStyle } from 'react-native'
import { colors, fonts } from '../../design-system/tokens'
import { Text } from '../text/Text'
import { getInitials } from '../../utils/getInitials'

interface AvatarProps {
  name: string
  size?: number
  borderRadius?: number
  color?: string
  style?: ViewStyle
}

export function Avatar({
  name,
  size = 44,
  borderRadius = 12,
  color = colors.primary,
  style,
}: AvatarProps) {
  const initials = getInitials(name)
  const fontSize = size * 0.34

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: `${color}20`,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: size > 50 ? 2 : 1.5,
          borderColor: `${color}40`,
        },
        style,
      ]}
    >
      <Text weight="extraBold" style={{ fontSize, color }}>{initials}</Text>
    </View>
  )
}
