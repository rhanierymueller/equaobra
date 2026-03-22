import { useEffect } from 'react'
import { View, ActivityIndicator, InteractionManager } from 'react-native'
import { router } from 'expo-router'
import { getToken } from '../src/services/api'
import * as SecureStore from 'expo-secure-store'

export default function Entry() {
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      try {
        const [token, user] = await Promise.all([
          getToken(),
          SecureStore.getItemAsync('equobra_user'),
        ])
        if (token && user) {
          router.replace('/(tabs)/ponto')
        } else {
          router.replace('/(auth)/login')
        }
      } catch {
        router.replace('/(auth)/login')
      }
    })
    return () => task.cancel()
  }, [])

  return (
    <View className="flex-1 bg-bg items-center justify-center">
      <ActivityIndicator color="#E07B2A" size="large" />
    </View>
  )
}
