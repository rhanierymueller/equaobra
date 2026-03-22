import { Ionicons } from '@expo/vector-icons'
import { View, Linking } from 'react-native'

import { Text, Avatar, Card, Badge, Button, StarRating } from '../../../../components'
import { colors } from '../../../../design-system/tokens'
import type { User } from '../../../../types'
import { getLocation } from '../../../../utils/getLocation'

interface ProfessionalCardProps {
  prof: User
  onPress: () => void
}

export function ProfessionalCard({ prof, onPress }: ProfessionalCardProps) {
  const professions = prof.professions ?? (prof.profession ? [prof.profession] : [])
  const location = getLocation(prof)

  const handleWhatsApp = () => {
    const number = prof.whatsapp!.replace(/\D/g, '')
    Linking.openURL(`https://wa.me/55${number}`)
  }

  return (
    <Card accent onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <Avatar name={prof.name} size={48} borderRadius={13} />
        <View style={{ flex: 1 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text weight="bold" size="sm" color="primary">
              {prof.name}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.text.hint} />
          </View>
          {professions.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {professions.slice(0, 2).map((p) => (
                <Badge key={p} label={p} />
              ))}
            </View>
          )}
          {location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
              <Ionicons name="location-outline" size={10} color={colors.text.muted} />
              <Text weight="regular" size="xs" color="muted">
                {location}
              </Text>
            </View>
          ) : null}
          {prof.rating && prof.rating > 0 ? (
            <View style={{ marginTop: 4 }}>
              <StarRating rating={prof.rating} />
            </View>
          ) : null}
        </View>
      </View>
      {prof.whatsapp && (
        <View style={{ marginTop: 10 }}>
          <Button
            variant="whatsapp"
            icon="logo-whatsapp"
            label="WhatsApp"
            onPress={handleWhatsApp}
            size="sm"
          />
        </View>
      )}
    </Card>
  )
}
