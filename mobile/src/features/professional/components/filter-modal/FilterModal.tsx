import { useState, useEffect } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { colors, radius } from '../../../../design-system/tokens'
import { Text, ModalSheet, SectionLabel } from '../../../../components'

interface FilterModalProps {
  visible: boolean
  onClose: () => void
  professions: string[]
  selectedProf: string
  setSelectedProf: (value: string) => void
  minRating: number
  setMinRating: (value: number) => void
}

export function FilterModal({
  visible, onClose, professions,
  selectedProf, setSelectedProf,
  minRating, setMinRating,
}: FilterModalProps) {
  const [localProf, setLocalProf] = useState(selectedProf)
  const [localRating, setLocalRating] = useState(minRating)

  useEffect(() => {
    if (visible) {
      setLocalProf(selectedProf)
      setLocalRating(minRating)
    }
  }, [visible])

  const handleApply = () => {
    setSelectedProf(localProf)
    setMinRating(localRating)
    onClose()
  }

  const handleClear = () => {
    setLocalProf('')
    setLocalRating(0)
  }

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Filtros"
      leftAction={<TouchableOpacity onPress={handleClear}><Text color="muted" size="base">Limpar</Text></TouchableOpacity>}
      rightAction={<TouchableOpacity onPress={handleApply}><Text color="accent" weight="bold" size="base">Aplicar</Text></TouchableOpacity>}
    >
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <SectionLabel label="PROFISSÃO" style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {['', ...professions].map(p => (
            <TouchableOpacity
              key={p || '__all'}
              onPress={() => setLocalProf(p)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.xxl,
                backgroundColor: localProf === p ? colors.primary : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: localProf === p ? colors.primary : colors.border.light,
              }}
            >
              <Text
                color={localProf === p ? 'primary' : 'secondary'}
                weight="semiBold"
                size="sm"
              >
                {p || 'Todas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text
          color="muted"
          weight="bold"
          size="xs"
          style={{ letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' }}
        >
          AVALIAÇÃO MÍNIMA: {localRating > 0 ? `${localRating}★` : 'Qualquer'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[0, 3, 4, 4.5].map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setLocalRating(r)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center',
                backgroundColor: localRating === r ? `${colors.primary}20` : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: localRating === r ? colors.primary : colors.border.light,
              }}
            >
              <Text
                color={localRating === r ? 'accent' : 'muted'}
                weight="bold"
                size="xs"
              >
                {r === 0 ? 'Todas' : `${r}★`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ModalSheet>
  )
}
