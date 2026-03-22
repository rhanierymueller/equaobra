import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../design-system/tokens'

interface StarRatingProps {
  rating: number
  size?: number
}

export function StarRating({ rating, size = 11 }: StarRatingProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={i <= Math.round(rating) ? colors.star : colors.text.disabled}
        />
      ))}
      <Text style={{ color: colors.text.muted, fontSize: size - 2, marginLeft: 2 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  )
}
