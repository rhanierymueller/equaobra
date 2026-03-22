import { router, Link } from 'expo-router'
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native'

import { useAuth } from '../../src/hooks/useAuth'

const PRIMARY = '#E07B2A'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email.trim().toLowerCase(), password)
      router.replace('/(tabs)/ponto')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-10">
          <View className="items-center mb-12">
            <View className="flex-row items-center gap-3 mb-2">
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
              <Text className="text-white font-bold text-3xl" style={{ letterSpacing: -1 }}>
                EQUA<Text style={{ color: PRIMARY }}>OBRA</Text>
              </Text>
            </View>
            <Text className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Monte sua equipe de obras
            </Text>
          </View>

          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text className="text-white font-bold text-xl mb-1">Entrar</Text>
            <Text className="text-sm mb-6" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Acesse sua conta EquaObra
            </Text>

            {error ? (
              <View
                className="mb-4 p-3 rounded-xl"
                style={{
                  backgroundColor: 'rgba(229,57,53,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(229,57,53,0.2)',
                }}
              >
                <Text style={{ color: '#E53935', fontSize: 13 }}>{error}</Text>
              </View>
            ) : null}

            <View className="mb-4">
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: 'rgba(245,240,235,0.5)' }}
              >
                E-MAIL
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="rgba(245,240,235,0.25)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="rounded-xl px-4 py-3.5 text-white text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </View>

            <View className="mb-6">
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: 'rgba(245,240,235,0.5)' }}
              >
                SENHA
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(245,240,235,0.25)"
                secureTextEntry
                autoComplete="password"
                className="rounded-xl px-4 py-3.5 text-white text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: PRIMARY, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Não tem conta?
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-bold" style={{ color: PRIMARY }}>
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View
            className="mt-4 p-3 rounded-xl items-center"
            style={{
              backgroundColor: 'rgba(224,123,42,0.06)',
              borderWidth: 1,
              borderColor: 'rgba(224,123,42,0.15)',
            }}
          >
            <Text className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
              Demo: contratante@equaobra.com / 123456
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
