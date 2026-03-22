import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius } from '../../design-system/tokens'

interface InputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap
  onClear?: () => void
}

export function Input({ icon, onClear, style, ...props }: InputProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.md,
        paddingHorizontal: 12,
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
      }}
    >
      {icon && <Ionicons name={icon} size={16} color={colors.text.hint} />}
      <TextInput
        placeholderTextColor={colors.text.hint}
        style={[
          {
            flex: 1,
            paddingVertical: 11,
            color: colors.text.primary,
            fontFamily: fonts.regular,
            fontSize: 14,
          },
          style,
        ]}
        {...props}
      />
      {onClear && props.value ? (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={16} color={colors.text.hint} />
        </TouchableOpacity>
      ) : null}
    </View>
  )
}
