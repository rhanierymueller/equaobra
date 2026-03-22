import type { TextProps as RNTextProps } from 'react-native'
import { Text as RNText, StyleSheet } from 'react-native'

import { colors, fonts, fontSize as fontSizes } from '../../design-system/tokens'

type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold'
type FontSize = keyof typeof fontSizes
type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'hint'
  | 'disabled'
  | 'white'
  | 'accent'
  | 'success'
  | 'danger'
  | 'whatsapp'
  | 'star'

const colorMap: Record<TextColor, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  muted: colors.text.muted,
  hint: colors.text.hint,
  disabled: colors.text.disabled,
  white: colors.text.primary,
  accent: colors.primary,
  success: colors.success,
  danger: colors.danger,
  whatsapp: colors.whatsapp,
  star: colors.star,
}

interface TextProps extends RNTextProps {
  weight?: FontWeight
  size?: FontSize
  color?: TextColor
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
  letterSpacing?: number
}

export function Text({
  weight = 'regular',
  size,
  color = 'primary',
  align,
  lineHeight,
  letterSpacing,
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        {
          fontFamily: fonts[weight],
          color: colorMap[color],
        },
        size != null && { fontSize: fontSizes[size] },
        align != null && { textAlign: align },
        lineHeight != null && { lineHeight },
        letterSpacing != null && { letterSpacing },
        style,
      ]}
      {...props}
    />
  )
}
