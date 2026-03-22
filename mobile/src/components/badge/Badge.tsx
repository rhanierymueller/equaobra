import { View, ViewStyle } from 'react-native'
import { colors, fonts, radius } from '../../design-system/tokens'
import { Text } from '../text/Text'

type BadgeVariant = 'primary' | 'muted' | 'success' | 'danger' | 'whatsapp'

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: `${colors.primary}12`, text: colors.primary, border: `${colors.primary}25` },
  muted: { bg: 'rgba(255,255,255,0.06)', text: colors.text.secondary, border: colors.border.light },
  success: { bg: `${colors.success}15`, text: colors.success, border: `${colors.success}30` },
  danger: { bg: 'rgba(229,57,53,0.1)', text: colors.danger, border: 'rgba(229,57,53,0.25)' },
  whatsapp: { bg: 'rgba(37,211,102,0.1)', text: colors.whatsapp, border: 'rgba(37,211,102,0.2)' },
}

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  style?: ViewStyle
}

export function Badge({ label, variant = 'primary', size = 'sm', style }: BadgeProps) {
  const v = variantStyles[variant]
  const paddingH = size === 'sm' ? 7 : 12
  const paddingV = size === 'sm' ? 2 : 5
  const fontSize = size === 'sm' ? 10 : 13

  return (
    <View
      style={[
        {
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          borderRadius: radius.xxl,
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
        },
        style,
      ]}
    >
      <Text weight={size === 'sm' ? 'regular' : 'semiBold'} style={{ fontSize, color: v.text }}>
        {label}
      </Text>
    </View>
  )
}
