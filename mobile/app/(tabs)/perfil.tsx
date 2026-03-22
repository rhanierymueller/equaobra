import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '../../src/hooks/useAuth'
import { api } from '../../src/services/api'
import { colors, fonts } from '../../src/design-system/tokens'

const PROFESSIONS_LIST = [
  'Pedreiro', 'Eletricista', 'Encanador', 'Pintor', 'Carpinteiro',
  'Azulejista', 'Gesseiro', 'Mestre de obras', 'Servente', 'Serralheiro',
  'Vidraceiro', 'Marceneiro', 'Soldador', 'Ar condicionado', 'Chaveiro',
]

function Label({ text }: { text: string }) {
  return <Text style={{ color: 'rgba(245,240,235,0.4)', fontSize: 11, fontFamily: fonts.bold, letterSpacing: 0.5, marginBottom: 6 }}>{text}</Text>
}

function Field({ label, value, onChangeText, placeholder, keyboard, multiline, secure }: {
  label: string; value: string; onChangeText: (v: string) => void
  placeholder?: string; keyboard?: any; multiline?: boolean; secure?: boolean
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Label text={label} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor="rgba(245,240,235,0.2)" keyboardType={keyboard ?? 'default'}
        multiline={multiline} secureTextEntry={secure}
        style={{ borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: colors.text.primary, fontSize: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', textAlignVertical: multiline ? 'top' : 'center', minHeight: multiline ? 80 : undefined }} />
    </View>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value) return null
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
      <Ionicons name={icon as any} size={15} color={colors.primary} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'rgba(245,240,235,0.35)', fontSize: 10, fontFamily: fonts.bold, letterSpacing: 0.4 }}>{label}</Text>
        <Text style={{ color: 'rgba(245,240,235,0.8)', fontSize: 13, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  )
}

function PasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => { setCurrent(''); setNext(''); setConfirm('') }

  const handleSave = async () => {
    if (!current || !next || !confirm) { Alert.alert('Atenção', 'Preencha todos os campos.'); return }
    if (next !== confirm) { Alert.alert('Atenção', 'As senhas não coincidem.'); return }
    if (next.length < 6) { Alert.alert('Atenção', 'A nova senha deve ter no mínimo 6 caracteres.'); return }
    setSaving(true)
    try {
      await api.patch('/api/users/me/password', { currentPassword: current, newPassword: next })
      Alert.alert('Sucesso', 'Senha alterada com sucesso!')
      reset(); onClose()
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível alterar a senha.')
    } finally { setSaving(false) }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.backgroundCard }}>
        <View style={{ alignItems: 'center', paddingTop: 12 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
          <TouchableOpacity onPress={() => { reset(); onClose() }}>
            <Text style={{ color: 'rgba(245,240,235,0.5)', fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 16 }}>Alterar Senha</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.primary} size="small" /> : <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 14 }}>Salvar</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 20 }} keyboardShouldPersistTaps="handled">
          <Field label="SENHA ATUAL" value={current} onChangeText={setCurrent} placeholder="Sua senha atual" secure />
          <Field label="NOVA SENHA" value={next} onChangeText={setNext} placeholder="Mínimo 6 caracteres" secure />
          <Field label="CONFIRMAR NOVA SENHA" value={confirm} onChangeText={setConfirm} placeholder="Repita a nova senha" secure />
        </ScrollView>
      </View>
    </Modal>
  )
}

async function lookupCep(cep: string): Promise<{ street: string; neighborhood: string; city: string; state: string } | null> {
  try {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return null
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return { street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }
  } catch { return null }
}

export default function PerfilScreen() {
  const { user, updateUser, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [location, setLocation] = useState(user?.location ?? '')
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp ?? '')
  const [professions, setProfessions] = useState<string[]>(user?.professions ?? (user?.profession ? [user.profession] : []))
  const [hourlyRate, setHourlyRate] = useState((user as any)?.hourlyRate?.toString() ?? '')

  const [cep, setCep] = useState(user?.address?.cep ?? '')
  const [street, setStreet] = useState(user?.address?.street ?? '')
  const [number, setNumber] = useState(user?.address?.number ?? '')
  const [neighborhood, setNeighborhood] = useState(user?.address?.neighborhood ?? '')
  const [city, setCity] = useState(user?.address?.city ?? '')
  const [state, setState] = useState(user?.address?.state ?? '')

  const [companyName, setCompanyName] = useState(user?.companyName ?? '')
  const [cnpj, setCnpj] = useState((user as any)?.cnpj ?? '')
  const [companyWebsite, setCompanyWebsite] = useState((user as any)?.companyWebsite ?? '')

  const initials = user?.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?'
  const isContractor = user?.role === 'contractor'

  const toggleProfession = (p: string) => {
    setProfessions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const handleCepBlur = useCallback(async () => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    const data = await lookupCep(cep)
    if (data) { setStreet(data.street); setNeighborhood(data.neighborhood); setCity(data.city); setState(data.state) }
    setCepLoading(false)
  }, [cep])

  const startEditing = () => {
    setName(user?.name ?? '')
    setPhone(user?.phone ?? '')
    setBio(user?.bio ?? '')
    setLocation(user?.location ?? '')
    setWhatsapp(user?.whatsapp ?? '')
    setProfessions(user?.professions ?? (user?.profession ? [user.profession] : []))
    setHourlyRate((user as any)?.hourlyRate?.toString() ?? '')
    setCep(user?.address?.cep ?? '')
    setStreet(user?.address?.street ?? '')
    setNumber(user?.address?.number ?? '')
    setNeighborhood(user?.address?.neighborhood ?? '')
    setCity(user?.address?.city ?? '')
    setState(user?.address?.state ?? '')
    setCompanyName(user?.companyName ?? '')
    setCnpj((user as any)?.cnpj ?? '')
    setCompanyWebsite((user as any)?.companyWebsite ?? '')
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUser({
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        professions: professions.length > 0 ? professions : undefined,
        profession: professions[0] || undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        address: { cep: cep.trim() || undefined, street: street.trim() || undefined, number: number.trim() || undefined, neighborhood: neighborhood.trim() || undefined, city: city.trim() || undefined, state: state.trim() || undefined },
        companyName: companyName.trim() || undefined,
        cnpj: cnpj.trim() || undefined,
        companyWebsite: companyWebsite.trim() || undefined,
      } as any)
      setEditing(false)
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally { setSaving(false) }
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login') } },
    ])
  }

  if (!user) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></SafeAreaView>

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
          <View style={{ width: 76, height: 76, borderRadius: 20, backgroundColor: `${colors.primary}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: `${colors.primary}50`, marginBottom: 10 }}>
            <Text style={{ color: colors.primary, fontFamily: fonts.extraBold, fontSize: 26 }}>{initials}</Text>
          </View>
          <Text style={{ color: colors.text.primary, fontFamily: fonts.extraBold, fontSize: 20 }}>{user.name}</Text>
          <Text style={{ color: 'rgba(245,240,235,0.4)', fontSize: 13, marginTop: 2 }}>{user.email}</Text>
          <View style={{ marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: `${colors.primary}12`, borderWidth: 1, borderColor: `${colors.primary}28` }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontFamily: fonts.semiBold }}>{isContractor ? 'Contratante' : 'Profissional'}</Text>
          </View>
        </View>

        <View style={{ padding: 20 }}>
          {!editing ? (
            <>
              <View style={{ padding: 16, borderRadius: 16, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 15, marginBottom: 14 }}>Informações</Text>
                <InfoRow icon="person-outline" label="PROFISSÕES" value={(user.professions ?? (user.profession ? [user.profession] : [])).join(' • ') || undefined} />
                <InfoRow icon="cash-outline" label="VALOR/HORA" value={(user as any).hourlyRate ? `R$ ${(user as any).hourlyRate}/hora` : undefined} />
                <InfoRow icon="location-outline" label="LOCALIZAÇÃO" value={user.location} />
                <InfoRow icon="call-outline" label="TELEFONE" value={user.phone} />
                <InfoRow icon="logo-whatsapp" label="WHATSAPP" value={user.whatsapp} />
                <InfoRow icon="document-text-outline" label="BIO" value={user.bio} />
                {user.address?.city && <InfoRow icon="map-outline" label="ENDEREÇO" value={[user.address.street, user.address.number, user.address.city, user.address.state].filter(Boolean).join(', ')} />}
                {isContractor && <InfoRow icon="business-outline" label="EMPRESA" value={user.companyName} />}
                {(user as any).companyWebsite && <InfoRow icon="globe-outline" label="WEBSITE" value={(user as any).companyWebsite} />}
              </View>

              <TouchableOpacity onPress={startEditing}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12, marginBottom: 10, backgroundColor: `${colors.primary}15`, borderWidth: 1, borderColor: `${colors.primary}30` }}>
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 14 }}>Editar perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowPassword(true)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Ionicons name="lock-closed-outline" size={15} color="rgba(245,240,235,0.6)" />
                <Text style={{ color: 'rgba(245,240,235,0.6)', fontFamily: fonts.semiBold, fontSize: 14 }}>Alterar senha</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={{ padding: 16, borderRadius: 16, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 15, marginBottom: 14 }}>Informações básicas</Text>
                <Field label="NOME" value={name} onChangeText={setName} placeholder="Seu nome" />
                <Field label="TELEFONE" value={phone} onChangeText={setPhone} placeholder="(47) 99999-9999" keyboard="phone-pad" />
                <Field label="WHATSAPP" value={whatsapp} onChangeText={setWhatsapp} placeholder="(47) 99999-9999" keyboard="phone-pad" />
                <Field label="LOCALIZAÇÃO" value={location} onChangeText={setLocation} placeholder="Ex: Blumenau, SC" />
                {!isContractor && (
                  <Field label="VALOR/HORA (R$)" value={hourlyRate} onChangeText={setHourlyRate} placeholder="Ex: 75" keyboard="numeric" />
                )}
                <Field label="BIO" value={bio} onChangeText={setBio} placeholder="Sobre você..." multiline />
              </View>

              {!isContractor && (
                <View style={{ padding: 16, borderRadius: 16, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                  <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 15, marginBottom: 4 }}>Profissões</Text>
                  <Text style={{ color: 'rgba(245,240,235,0.35)', fontSize: 12, marginBottom: 12 }}>Selecione todas que se aplicam</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {PROFESSIONS_LIST.map(p => (
                      <TouchableOpacity key={p} onPress={() => toggleProfession(p)}
                        style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: professions.includes(p) ? colors.primary : 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: professions.includes(p) ? colors.primary : 'rgba(255,255,255,0.1)' }}>
                        <Text style={{ color: professions.includes(p) ? colors.text.primary : 'rgba(245,240,235,0.55)', fontSize: 12, fontFamily: fonts.semiBold }}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={{ padding: 16, borderRadius: 16, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 15, marginBottom: 14 }}>Endereço</Text>
                <View style={{ marginBottom: 14 }}>
                  <Label text="CEP" />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput value={cep} onChangeText={setCep} onBlur={handleCepBlur} placeholder="00000-000"
                      placeholderTextColor="rgba(245,240,235,0.2)" keyboardType="numeric"
                      style={{ flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: colors.text.primary, fontSize: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' }} />
                    {cepLoading && <ActivityIndicator color={colors.primary} size="small" style={{ alignSelf: 'center' }} />}
                  </View>
                </View>
                <Field label="RUA" value={street} onChangeText={setStreet} placeholder="Nome da rua" />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}><Field label="NÚMERO" value={number} onChangeText={setNumber} placeholder="Nº" keyboard="numeric" /></View>
                  <View style={{ flex: 2 }}><Field label="BAIRRO" value={neighborhood} onChangeText={setNeighborhood} placeholder="Bairro" /></View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 2 }}><Field label="CIDADE" value={city} onChangeText={setCity} placeholder="Cidade" /></View>
                  <View style={{ flex: 1 }}><Field label="UF" value={state} onChangeText={setState} placeholder="SC" /></View>
                </View>
              </View>

              {isContractor && (
                <View style={{ padding: 16, borderRadius: 16, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                  <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 15, marginBottom: 14 }}>Empresa</Text>
                  <Field label="NOME DA EMPRESA" value={companyName} onChangeText={setCompanyName} placeholder="Razão social ou nome fantasia" />
                  <Field label="CNPJ" value={cnpj} onChangeText={setCnpj} placeholder="00.000.000/0000-00" keyboard="numeric" />
                  <Field label="WEBSITE" value={companyWebsite} onChangeText={setCompanyWebsite} placeholder="https://suaempresa.com.br" keyboard="url" />
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setEditing(false)}
                  style={{ flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ color: 'rgba(245,240,235,0.5)', fontFamily: fonts.semiBold }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={saving}
                  style={{ flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }}>
                  {saving ? <ActivityIndicator color={colors.text.primary} size="small" /> : <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 14 }}>Salvar alterações</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12, backgroundColor: `${colors.danger}08`, borderWidth: 1, borderColor: `${colors.danger}22` }}>
            <Ionicons name="log-out-outline" size={16} color={colors.danger} />
            <Text style={{ color: colors.danger, fontFamily: fonts.bold, fontSize: 14 }}>Sair da conta</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
            <Text style={{ color: 'rgba(245,240,235,0.12)', fontSize: 11 }}>EquaObra v1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      <PasswordModal visible={showPassword} onClose={() => setShowPassword(false)} />
    </SafeAreaView>
  )
}
