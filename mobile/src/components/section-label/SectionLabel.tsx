import { ViewStyle } from 'react-native'
import { fonts, colors } from '../../design-system/tokens'
import { Text } from '../text/Text'

interface SectionLabelProps {
  label: string
  style?: ViewStyle
}

export function SectionLabel({ label, style }: SectionLabelProps) {
  return (
    <Text
      weight="bold"
      size="xs"
      color="muted"
      letterSpacing={0.5}
      style={style}
    >
      {label}
    </Text>
  )
}
