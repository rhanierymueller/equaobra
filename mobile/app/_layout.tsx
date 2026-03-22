import '../global.css'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useCallback } from 'react'
import { View, Text, TextInput } from 'react-native'

import { colors, fonts } from '../src/design-system/tokens'

const defaultFontStyle = { fontFamily: fonts.regular }
if (Text.defaultProps == null) Text.defaultProps = {}
Text.defaultProps.style = defaultFontStyle
if (TextInput.defaultProps == null) TextInput.defaultProps = {}
TextInput.defaultProps.style = defaultFontStyle

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  })

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {})
  }, [])

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => {})
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutReady}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  )
}
