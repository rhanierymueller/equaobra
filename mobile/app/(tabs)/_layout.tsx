import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'

import { colors, fonts } from '../../src/design-system/tokens'

type IoniconName = keyof typeof Ionicons.glyphMap

function TabIcon({ name, focused, label }: { name: IoniconName; focused: boolean; label: string }) {
  return (
    <View className="items-center pt-1 gap-0.5" style={{ minWidth: 56 }}>
      <Ionicons
        name={focused ? name : (`${name}-outline` as IoniconName)}
        size={22}
        color={focused ? colors.primary : colors.text.muted}
      />
      <Text
        style={{
          fontSize: 10,
          color: focused ? colors.primary : colors.text.muted,
          fontFamily: focused ? fonts.bold : fonts.regular,
        }}
      >
        {label}
      </Text>
      {focused && (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.primary,
            marginTop: 1,
          }}
        />
      )}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundCard,
          borderTopColor: colors.border.default,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      {/* MVP: aba Ponto (WorkLog) oculta temporariamente — reativar quando onboarding estiver validado
      <Tabs.Screen
        name="ponto"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="time" focused={focused} label="Ponto" />,
        }}
      />
      */}
      <Tabs.Screen
        name="ponto"
        options={{
          href: null, // oculta do tab bar sem remover a rota
        }}
      />
      <Tabs.Screen
        name="obras"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="construct" focused={focused} label="Obras" />,
        }}
      />
      <Tabs.Screen
        name="equipes"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} label="Equipes" />,
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} label="Explorar" />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} label="Perfil" />,
        }}
      />
    </Tabs>
  )
}
