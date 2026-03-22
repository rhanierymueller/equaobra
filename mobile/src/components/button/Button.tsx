import { Ionicons } from '@expo/vector-icons'
import type { ViewStyle } from 'react-native'
import { TouchableOpacity, ActivityIndicator } from 'react-native'

import { colors, fonts, radius } from '../../design-system/tokens'
import { Text } from '../text/Text'

type IoniconName = keyof typeof Ionicons.glyphMap

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'whatsapp'
  | 'success'

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: colors.text.primary },
  secondary: {
    bg: 'rgba(255,255,255,0.07)',
    text: colors.text.primary,
    border: colors.border.medium,
  },
  outline: { bg: 'transparent', text: colors.primary, border: `${colors.primary}40` },
  ghost: { bg: 'transparent', text: colors.text.muted },
  danger: { bg: 'rgba(229,57,53,0.1)', text: colors.danger, border: 'rgba(229,57,53,0.25)' },
  whatsapp: { bg: 'rgba(37,211,102,0.1)', text: colors.whatsapp, border: 'rgba(37,211,102,0.2)' },
  success: { bg: `${colors.success}10`, text: colors.success, border: `${colors.success}30` },
}

interface ButtonProps {
  label: string
  variant?: ButtonVariant
  icon?: IoniconName
  loading?: boolean
  disabled?: boolean
  onPress: () => void
  size?: 'sm' | 'md' | 'lg'
  flex?: boolean
  style?: ViewStyle
}

export function Button({
  label,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  onPress,
  size = 'md',
  flex = false,
  style,
}: ButtonProps) {
  const v = variantStyles[variant]
  const paddingVertical = size === 'sm' ? 9 : size === 'lg' ? 15 : 13
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16
  const textSize = size === 'sm' ? 12 : size === 'lg' ? 15 : 14

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical,
          borderRadius: radius.lg,
          backgroundColor: v.bg,
          opacity: disabled ? 0.4 : 1,
        },
        v.border != null && { borderWidth: 1, borderColor: v.border },
        flex && { flex: 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={iconSize} color={v.text} />}
          <Text
            weight={size === 'sm' ? 'semiBold' : 'bold'}
            style={{ fontSize: textSize, color: v.text }}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}
