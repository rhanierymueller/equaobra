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

const PROFESSIONS = [
  'Pedreiro',
  'Eletricista',
  'Encanador',
  'Pintor',
  'Carpinteiro',
  'Serralheiro',
  'Gesseiro',
  'Arquiteto',
  'Engenheiro Civil',
  'Outro',
]

export default function RegisterScreen() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'professional' | 'contractor'>('professional')
  const [profession, setProfession] = useState('')
  const [showProfessions, setShowProfessions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos')
      return
    }
    if (role === 'professional' && !profession) {
      setError('Selecione sua profissão')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        role,
        profession || undefined,
      )
      router.replace('/(tabs)/ponto')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao cadastrar')
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
        <View className="flex-1 px-6 pt-16 pb-10">
          <View className="items-center mb-8">
            <View className="flex-row items-center gap-3 mb-1">
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: 36, height: 36 }}
                resizeMode="contain"
              />
              <Text className="text-white font-bold text-2xl" style={{ letterSpacing: -1 }}>
                EQUA<Text style={{ color: PRIMARY }}>OBRA</Text>
              </Text>
            </View>
          </View>

          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text className="text-white font-bold text-xl mb-1">Criar conta</Text>
            <Text className="text-sm mb-5" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Comece a usar a EquaObra
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

            <View
              className="flex-row mb-5 rounded-xl overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              {(['professional', 'contractor'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  className="flex-1 py-3 items-center"
                  style={{ backgroundColor: role === r ? PRIMARY : 'transparent' }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: role === r ? 'white' : 'rgba(245,240,235,0.4)' }}
                  >
                    {r === 'professional' ? 'Profissional' : 'Contratante'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mb-4">
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: 'rgba(245,240,235,0.5)' }}
              >
                NOME
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome completo"
                placeholderTextColor="rgba(245,240,235,0.25)"
                autoCapitalize="words"
                className="rounded-xl px-4 py-3.5 text-white text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </View>

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
                className="rounded-xl px-4 py-3.5 text-white text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </View>

            <View className="mb-4">
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: 'rgba(245,240,235,0.5)' }}
              >
                SENHA
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="rgba(245,240,235,0.25)"
                secureTextEntry
                className="rounded-xl px-4 py-3.5 text-white text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </View>

            {role === 'professional' && (
              <View className="mb-5">
                <Text
                  className="text-xs font-semibold mb-2"
                  style={{ color: 'rgba(245,240,235,0.5)' }}
                >
                  PROFISSÃO
                </Text>
                <TouchableOpacity
                  onPress={() => setShowProfessions(!showProfessions)}
                  className="rounded-xl px-4 py-3.5 flex-row justify-between items-center"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: profession ? 'white' : 'rgba(245,240,235,0.25)' }}
                  >
                    {profession || 'Selecione sua profissão'}
                  </Text>
                  <Text style={{ color: 'rgba(245,240,235,0.4)' }}>
                    {showProfessions ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                {showProfessions && (
                  <View
                    className="mt-2 rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {PROFESSIONS.map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => {
                          setProfession(p)
                          setShowProfessions(false)
                        }}
                        className="px-4 py-3"
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: 'rgba(255,255,255,0.05)',
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: profession === p ? PRIMARY : 'rgba(245,240,235,0.7)' }}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: PRIMARY, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Criar conta</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Já tem conta?
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-bold" style={{ color: PRIMARY }}>
                  Entrar
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
