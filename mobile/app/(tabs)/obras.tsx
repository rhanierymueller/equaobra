import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, fonts } from '../../src/design-system/tokens'
import { useAuth } from '../../src/hooks/useAuth'
import { useOpportunities } from '../../src/hooks/useOpportunities'
import { api } from '../../src/services/api'
import type { Opportunity } from '../../src/types'

function getWebView(): any {
  try {
    return require('react-native-webview').default ?? null
  } catch {
    return null
  }
}

function buildObrasMapHtml(opportunities: Opportunity[]) {
  const items = opportunities.map((o: any) => ({
    title: o.companyName ?? o.contractorName,
    location: o.obraLocation ?? '',
    professions: (o.lookingForProfessions ?? []).slice(0, 2).join(', '),
    initials: (o.companyName ?? o.contractorName)
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase(),
  }))
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0}body,html,#map{width:100%;height:100%;background:#0D0C0B}
#loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#E07B2A;font-family:sans-serif;font-size:14px;z-index:999}</style>
</head><body>
<div id="loading">Carregando mapa...</div>
<div id="map"></div>
<script>
var items=${JSON.stringify(items)};
var map=L.map('map',{attributionControl:false}).setView([-15.78,-47.93],4);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
var bounds=[];
var pending=items.length;
if(pending===0){document.getElementById('loading').style.display='none';}
items.forEach(function(m){
  if(!m.location){pending--;if(!pending)document.getElementById('loading').style.display='none';return;}
  fetch('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(m.location+', Brasil')+'&format=json&limit=1')
    .then(function(r){return r.json()})
    .then(function(data){
      if(data&&data[0]){
        var lat=parseFloat(data[0].lat),lng=parseFloat(data[0].lon);
        bounds.push([lat,lng]);
        var icon=L.divIcon({className:'',html:'<div style="background:#3B82F6;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;border:2px solid rgba(255,255,255,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.6)">'+m.initials+'</div>',iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-20]});
        L.marker([lat,lng],{icon}).addTo(map).bindPopup('<b style="color:#3B82F6">'+m.title+'</b><br>'+m.location+(m.professions?'<br><i>'+m.professions+'</i>':''));
      }
    }).catch(function(){})
    .finally(function(){pending--;if(!pending){document.getElementById('loading').style.display='none';if(bounds.length>1)map.fitBounds(bounds,{padding:[30,30]});else if(bounds.length===1)map.setView(bounds[0],11);}});
});
</script></body></html>`
}

function formatDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const PROFESSIONS_LIST = [
  'Pedreiro',
  'Eletricista',
  'Encanador',
  'Pintor',
  'Carpinteiro',
  'Azulejista',
  'Gesseiro',
  'Mestre de obras',
  'Servente',
  'Serralheiro',
  'Vidraceiro',
  'Marceneiro',
  'Chaveiro',
  'Soldador',
  'Ar condicionado',
]

function CreateOppModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [duration, setDuration] = useState('')
  const [professions, setProfessions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const toggleProf = (p: string) => {
    setProfessions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  const reset = () => {
    setLocation('')
    setDescription('')
    setStartDate('')
    setDuration('')
    setProfessions([])
  }

  const handleCreate = async () => {
    if (!location.trim() || professions.length === 0) {
      Alert.alert('Campos obrigatórios', 'Informe a localização e ao menos uma profissão.')
      return
    }
    setSaving(true)
    try {
      await api.post('/api/opportunities', {
        obraLocation: location.trim(),
        obraDescription: description.trim() || undefined,
        obraStart: startDate.trim() || undefined,
        obraDuration: duration.trim() || undefined,
        lookingForProfessions: professions,
        active: true,
      })
      reset()
      onCreated()
      onClose()
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível criar a oportunidade.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.backgroundCard }}>
        <View style={{ alignItems: 'center', paddingTop: 12 }}>
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              reset()
              onClose()
            }}
          >
            <Text style={{ color: colors.text.muted, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 16 }}>
            Nova Vaga
          </Text>
          <TouchableOpacity onPress={handleCreate} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 14 }}>
                Publicar
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 20 }} keyboardShouldPersistTaps="handled">
          {[
            {
              label: 'LOCALIZAÇÃO *',
              value: location,
              set: setLocation,
              placeholder: 'Ex: Blumenau, SC',
            },
            {
              label: 'DESCRIÇÃO DA OBRA',
              value: description,
              set: setDescription,
              placeholder: 'Descreva o trabalho...',
              multi: true,
            },
            {
              label: 'DATA DE INÍCIO',
              value: startDate,
              set: setStartDate,
              placeholder: 'Ex: 2026-04-01',
            },
            {
              label: 'DURAÇÃO ESTIMADA',
              value: duration,
              set: setDuration,
              placeholder: 'Ex: 3 meses',
            },
          ].map((f) => (
            <View key={f.label} style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text.muted,
                  fontSize: 11,
                  fontFamily: fonts.bold,
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                {f.label}
              </Text>
              <TextInput
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={colors.text.hint}
                multiline={f.multi}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.text.primary,
                  fontSize: 14,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  textAlignVertical: f.multi ? 'top' : 'center',
                  minHeight: f.multi ? 80 : undefined,
                }}
              />
            </View>
          ))}

          <Text
            style={{
              color: colors.text.muted,
              fontSize: 11,
              fontFamily: fonts.bold,
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            PROFISSÕES NECESSÁRIAS * {professions.length > 0 ? `(${professions.length})` : ''}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {PROFESSIONS_LIST.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => toggleProf(p)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: professions.includes(p)
                    ? colors.primary
                    : 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: professions.includes(p) ? colors.primary : colors.border.light,
                }}
              >
                <Text
                  style={{
                    color: professions.includes(p) ? colors.text.primary : 'rgba(245,240,235,0.6)',
                    fontSize: 13,
                    fontFamily: fonts.semiBold,
                  }}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

function OppCard({
  opp,
  onApply,
  applied,
  isOwn,
  onToggle,
}: {
  opp: Opportunity
  onApply: () => void
  applied: boolean
  isOwn?: boolean
  onToggle?: () => void
}) {
  const initials = (opp.companyName ?? opp.contractorName)
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
  return (
    <View
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: colors.border.default,
      }}
    >
      <View style={{ height: 2, backgroundColor: colors.primary }} />
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: `${colors.primary}20`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: `${colors.primary}40`,
            }}
          >
            <Text style={{ color: colors.primary, fontFamily: fonts.extraBold, fontSize: 15 }}>
              {initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.text.primary, fontFamily: fonts.bold, fontSize: 14 }}
              numberOfLines={1}
            >
              {opp.companyName ?? opp.contractorName}
            </Text>
            {opp.companyName && (
              <Text style={{ color: colors.text.muted, fontSize: 11, marginTop: 1 }}>
                {opp.contractorName}
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Ionicons name="location-outline" size={10} color={colors.text.muted} />
              <Text style={{ color: colors.text.muted, fontSize: 11 }}>{opp.obraLocation}</Text>
            </View>
          </View>
          {applied && !isOwn && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
                backgroundColor: `${colors.success}15`,
                borderWidth: 1,
                borderColor: `${colors.success}30`,
              }}
            >
              <Text style={{ color: colors.success, fontSize: 10, fontFamily: fonts.semiBold }}>
                Candidatado
              </Text>
            </View>
          )}
          {isOwn && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <Text
                style={{ color: 'rgba(245,240,235,0.6)', fontSize: 10, fontFamily: fonts.semiBold }}
              >
                Sua vaga
              </Text>
            </View>
          )}
        </View>

        {opp.obraDescription ? (
          <Text
            style={{
              color: 'rgba(245,240,235,0.55)',
              fontSize: 12,
              marginBottom: 10,
              lineHeight: 17,
            }}
            numberOfLines={2}
          >
            {opp.obraDescription}
          </Text>
        ) : null}

        {(opp.obraStart || opp.obraDuration) && (
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 10 }}>
            {opp.obraStart && (
              <View>
                <Text style={{ color: 'rgba(245,240,235,0.3)', fontSize: 10 }}>Início</Text>
                <Text
                  style={{ color: colors.text.primary, fontSize: 11, fontFamily: fonts.semiBold }}
                >
                  {formatDate(opp.obraStart)}
                </Text>
              </View>
            )}
            {opp.obraDuration && (
              <View>
                <Text style={{ color: 'rgba(245,240,235,0.3)', fontSize: 10 }}>Duração</Text>
                <Text
                  style={{ color: colors.text.primary, fontSize: 11, fontFamily: fonts.semiBold }}
                >
                  {opp.obraDuration}
                </Text>
              </View>
            )}
          </View>
        )}

        {opp.lookingForProfessions.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {opp.lookingForProfessions.slice(0, 4).map((p: string) => (
              <View
                key={p}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 20,
                  backgroundColor: `${colors.primary}10`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}22`,
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 10 }}>{p}</Text>
              </View>
            ))}
            {opp.lookingForProfessions.length > 4 && (
              <Text style={{ color: 'rgba(245,240,235,0.3)', fontSize: 10, paddingVertical: 2 }}>
                +{opp.lookingForProfessions.length - 4}
              </Text>
            )}
          </View>
        )}

        {isOwn ? (
          <TouchableOpacity
            onPress={onToggle}
            style={{
              paddingVertical: 11,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: opp.active ? 'rgba(229,57,53,0.1)' : `${colors.success}10`,
              borderWidth: 1,
              borderColor: opp.active ? 'rgba(229,57,53,0.25)' : `${colors.success}25`,
            }}
          >
            <Text
              style={{
                color: opp.active ? colors.danger : colors.success,
                fontFamily: fonts.bold,
                fontSize: 13,
              }}
            >
              {opp.active ? 'Encerrar vaga' : 'Reabrir vaga'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onApply}
            disabled={applied}
            style={{
              paddingVertical: 11,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: applied ? `${colors.success}10` : colors.primary,
              borderWidth: applied ? 1 : 0,
              borderColor: `${colors.success}30`,
            }}
          >
            <Text
              style={{
                color: applied ? colors.success : colors.text.primary,
                fontFamily: fonts.bold,
                fontSize: 13,
              }}
            >
              {applied ? 'Já candidatado' : 'Demonstrar interesse'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default function ObrasScreen() {
  const { user } = useAuth()
  const { opportunities, loading, refresh, applyToOpportunity } = useOpportunities()
  const [WebView] = useState<any>(() => getWebView())
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState<'all' | 'mine'>('all')

  const isContractor = user?.role === 'contractor'

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const handleApply = async (opp: Opportunity) => {
    if (!user) return
    const initials = user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    try {
      const loc = user.address?.city
        ? [user.address.city, user.address.state].filter(Boolean).join(', ')
        : (user as any).location
      await applyToOpportunity(opp, {
        id: user.id,
        name: user.name,
        initials,
        profession: user.profession,
        location: loc,
        rating: user.rating,
      })
      setAppliedIds((prev) => new Set([...prev, opp.id]))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('já registrado')) setAppliedIds((prev) => new Set([...prev, opp.id]))
    }
  }

  const handleToggleActive = async (opp: Opportunity) => {
    try {
      await api.patch(`/api/opportunities/${opp.id}`, { active: !opp.active })
      await refresh()
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a vaga.')
    }
  }

  const base = useMemo(() => {
    const q = search.toLowerCase()
    return opportunities.filter((o) => {
      if (!o.active && tab !== 'mine') return false
      if (tab === 'mine' && o.contractorId !== user?.id) return false
      if (!q) return true
      return (
        o.obraLocation?.toLowerCase().includes(q) ||
        o.contractorName?.toLowerCase().includes(q) ||
        o.companyName?.toLowerCase().includes(q) ||
        o.lookingForProfessions.some((p: string) => p.toLowerCase().includes(q))
      )
    })
  }, [opportunities, search, tab, user])

  if (loading)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 2,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontFamily: fonts.extraBold,
              fontSize: 24,
              letterSpacing: -0.5,
            }}
          >
            Obras
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {isContractor && (
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${colors.primary}20`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}50`,
                }}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            {!!WebView && (
              <TouchableOpacity
                onPress={() => setViewMode((v) => (v === 'list' ? 'map' : 'list'))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    viewMode === 'map' ? `${colors.primary}20` : 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: viewMode === 'map' ? `${colors.primary}50` : colors.border.light,
                }}
              >
                <Ionicons
                  name={viewMode === 'map' ? 'list' : 'map'}
                  size={18}
                  color={viewMode === 'map' ? colors.primary : colors.text.muted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={{ color: colors.text.muted, fontSize: 13 }}>
          {base.length} vaga{base.length !== 1 ? 's' : ''} disponíve{base.length !== 1 ? 'is' : 'l'}
        </Text>
      </View>

      {isContractor && (
        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 10, gap: 8 }}>
          {(['all', 'mine'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: tab === t ? `${colors.primary}15` : 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: tab === t ? `${colors.primary}40` : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text
                style={{
                  color: tab === t ? colors.primary : colors.text.muted,
                  fontFamily: fonts.semiBold,
                  fontSize: 13,
                }}
              >
                {t === 'all' ? 'Todas' : 'Minhas vagas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 12,
          paddingHorizontal: 12,
          gap: 8,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.09)',
        }}
      >
        <Ionicons name="search" size={16} color="rgba(245,240,235,0.35)" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cidade, profissão, empresa..."
          placeholderTextColor={colors.text.hint}
          style={{ flex: 1, paddingVertical: 11, color: colors.text.primary, fontSize: 14 }}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="rgba(245,240,235,0.3)" />
          </TouchableOpacity>
        ) : null}
      </View>

      {viewMode === 'map' && WebView ? (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ html: buildObrasMapHtml(base) }}
            style={{ flex: 1, backgroundColor: colors.background }}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            mixedContentMode="always"
          />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {base.length === 0 ? (
            <View style={{ paddingVertical: 64, alignItems: 'center' }}>
              <Ionicons name="construct-outline" size={48} color={colors.text.disabled} />
              <Text style={{ color: 'rgba(245,240,235,0.3)', fontSize: 14, marginTop: 16 }}>
                {tab === 'mine'
                  ? 'Você não publicou nenhuma vaga'
                  : search
                    ? 'Nenhuma obra encontrada'
                    : 'Nenhuma vaga disponível'}
              </Text>
              {tab === 'mine' && isContractor && (
                <TouchableOpacity
                  onPress={() => setShowCreate(true)}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: `${colors.primary}15`,
                    borderWidth: 1,
                    borderColor: `${colors.primary}30`,
                  }}
                >
                  <Text style={{ color: colors.primary, fontFamily: fonts.semiBold, fontSize: 13 }}>
                    + Publicar vaga
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            base.map((opp) => (
              <OppCard
                key={opp.id}
                opp={opp}
                applied={appliedIds.has(opp.id)}
                onApply={() => handleApply(opp)}
                isOwn={isContractor && opp.contractorId === user?.id}
                onToggle={() => handleToggleActive(opp)}
              />
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <CreateOppModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refresh}
      />
    </SafeAreaView>
  )
}
