import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  View, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius } from '../../src/design-system/tokens'
import { api } from '../../src/services/api'
import { getLocation } from '../../src/utils/getLocation'
import { ProfessionalCard, ProfileModal, FilterModal } from '../../src/features/professional/components'
import { Text, Input } from '../../src/components'
import type { User } from '../../src/types'

function getWebView(): unknown {
  try {
    return require('react-native-webview').default ?? null
  } catch {
    return null
  }
}

type MapMarker = {
  id: string
  lat: number
  lng: number
  name: string
  profession: string
  professions: string[]
  rating: number
  location: string
  initials: string
  whatsapp: string
  phone: string
  bio: string
}

const geoCache = new Map<string, { lat: number; lng: number } | null>()

async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  if (geoCache.has(location)) return geoCache.get(location)!
  try {
    const q = encodeURIComponent(location + ', Brasil')
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
      headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'EquaObra/1.0' },
    })
    const data = await res.json()
    const result = data?.[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null
    geoCache.set(location, result)
    return result
  } catch {
    geoCache.set(location, null)
    return null
  }
}

async function buildMarkers(professionals: User[]): Promise<MapMarker[]> {
  const results: MapMarker[] = []
  for (const p of professionals) {
    let lat = p.address?.lat
    let lng = p.address?.lng
    if (!lat) {
      const loc = getLocation(p)
      if (loc) {
        const coords = await geocodeLocation(loc)
        if (coords) { lat = coords.lat; lng = coords.lng }
      }
    }
    if (lat && lng) {
      const profs = p.professions ?? (p.profession ? [p.profession] : [])
      results.push({
        id: p.id, lat, lng,
        name: p.name,
        profession: profs[0] ?? '',
        professions: profs,
        rating: p.rating ?? 0,
        location: getLocation(p),
        initials: p.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase(),
        whatsapp: p.whatsapp ?? '',
        phone: p.phone ?? '',
        bio: p.bio ?? '',
      })
    }
  }
  return results
}

function buildMapHtml(markers: MapMarker[]) {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body,html{width:100%;height:100%;background:${colors.background};overflow:hidden}
#map{width:100%;height:100%}
.leaflet-popup-content-wrapper{background:${colors.backgroundModal};border:1px solid ${colors.border.light};border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.6)}
.leaflet-popup-tip{background:${colors.backgroundModal};border:1px solid ${colors.border.light}}
.leaflet-popup-content{margin:0;padding:0;font-family:-apple-system,sans-serif}
.leaflet-popup-close-button{color:${colors.text.muted}!important;font-size:18px!important;top:8px!important;right:10px!important}
.popup{padding:14px 16px;min-width:220px}
.popup-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.popup-avatar{width:42px;height:42px;border-radius:12px;background:rgba(224,123,42,0.15);border:1.5px solid rgba(224,123,42,0.3);display:flex;align-items:center;justify-content:center;color:${colors.primary};font-weight:800;font-size:15px;flex-shrink:0}
.popup-name{font-weight:800;font-size:15px;color:#fff;line-height:1.2}
.popup-loc{font-size:11px;color:${colors.text.muted};margin-top:2px}
.popup-stars{display:flex;align-items:center;gap:2px;margin-top:3px}
.popup-star{color:${colors.star};font-size:11px}
.popup-star-off{color:${colors.text.disabled};font-size:11px}
.popup-rating{color:${colors.text.muted};font-size:11px;margin-left:3px}
.popup-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px}
.popup-tag{padding:3px 8px;border-radius:12px;background:rgba(224,123,42,0.12);border:1px solid rgba(224,123,42,0.2);color:${colors.primary};font-size:10px;font-weight:600}
.popup-bio{font-size:11px;color:${colors.text.muted};line-height:1.4;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.popup-actions{display:flex;gap:6px}
.popup-btn{flex:1;padding:9px 0;border-radius:10px;border:none;font-size:12px;font-weight:700;cursor:pointer;text-align:center}
.popup-btn-primary{background:${colors.primary};color:#fff}
.popup-btn-wpp{background:rgba(37,211,102,0.1);color:${colors.whatsapp};border:1px solid rgba(37,211,102,0.2)}
#status{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(14,13,11,0.9);color:${colors.primary};font-family:-apple-system,sans-serif;font-size:12px;padding:6px 14px;border-radius:20px;z-index:9999;border:1px solid rgba(224,123,42,0.3)}
</style>
</head><body>
<div id="map"></div>
<div id="status">${markers.length} profissiona${markers.length !== 1 ? 'is' : 'l'} no mapa</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<script>
try{
var markers=${JSON.stringify(markers)};
var map=L.map('map',{attributionControl:false}).setView([-15.78,-47.93],4);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
function msg(data){if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(data));}}
function stars(r){var s='';for(var i=1;i<=5;i++){s+='<span class="'+(i<=Math.round(r)?'popup-star':'popup-star-off')+'">\\u2605</span>';}return s;}
markers.forEach(function(m){
  var icon=L.divIcon({className:'',html:'<div style="background:${colors.primary};color:#fff;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;border:2px solid rgba(255,255,255,0.25);box-shadow:0 3px 12px rgba(0,0,0,0.5)">'+m.initials+'</div>',iconSize:[40,40],iconAnchor:[20,20],popupAnchor:[0,-24]});
  var tags=m.professions.map(function(p){return '<span class="popup-tag">'+p+'</span>';}).join('');
  var popup='<div class="popup">'
    +'<div class="popup-header">'
    +'<div class="popup-avatar">'+m.initials+'</div>'
    +'<div>'
    +'<div class="popup-name">'+m.name+'</div>'
    +(m.location?'<div class="popup-loc">\\ud83d\\udccd '+m.location+'</div>':'')
    +(m.rating>0?'<div class="popup-stars">'+stars(m.rating)+'<span class="popup-rating">'+m.rating.toFixed(1)+'</span></div>':'')
    +'</div></div>'
    +(tags?'<div class="popup-tags">'+tags+'</div>':'')
    +(m.bio?'<div class="popup-bio">'+m.bio+'</div>':'')
    +'<div class="popup-actions">'
    +'<button class="popup-btn popup-btn-primary" onclick="msg({action:\\'open\\',id:\\''+m.id+'\\'})">Ver perfil</button>'
    +(m.whatsapp?'<button class="popup-btn popup-btn-wpp" onclick="msg({action:\\'whatsapp\\',phone:\\''+m.whatsapp.replace(/\\D/g,'')+'\\'})">WhatsApp</button>':'')
    +'</div></div>';
  L.marker([m.lat,m.lng],{icon:icon}).addTo(map).bindPopup(popup,{maxWidth:280,minWidth:220,closeButton:true});
});
if(markers.length===0){document.getElementById('status').textContent='Nenhum profissional com localiza\\u00e7\\u00e3o';}
else if(markers.length===1){map.setView([markers[0].lat,markers[0].lng],12);}
else{map.fitBounds(markers.map(function(m){return[m.lat,m.lng]}),{padding:[50,50]});}
setTimeout(function(){document.getElementById('status').style.display='none';},3000);
}catch(e){document.getElementById('status').textContent='Erro: '+e.message;document.getElementById('status').style.color='red';}
</script></body></html>`
}

export default function ExplorarScreen() {
  const [professionals, setProfessionals] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showFilter, setShowFilter] = useState(false)
  const [selectedProf, setSelectedProf] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [WebView] = useState<unknown>(() => getWebView())
  const [mapHtml, setMapHtml] = useState<string | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const lastFilterKey = useRef('')

  const load = useCallback(async () => {
    try {
      const data = await api.get<User[]>('/api/users/professionals')
      setProfessionals(data)
    } catch {
      setProfessionals([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const allProfessions = useMemo(() => {
    const s = new Set<string>()
    professionals.forEach(p =>
      (p.professions ?? (p.profession ? [p.profession] : [])).forEach(pr => s.add(pr))
    )
    return Array.from(s).sort()
  }, [professionals])

  const filtered = useMemo(() => professionals.filter(p => {
    const profs = p.professions ?? (p.profession ? [p.profession] : [])
    const loc = getLocation(p).toLowerCase()
    const q = search.toLowerCase()
    return (!q || p.name.toLowerCase().includes(q) || loc.includes(q) || profs.some(pr => pr.toLowerCase().includes(q)))
      && (!selectedProf || profs.some(pr => pr.toLowerCase() === selectedProf.toLowerCase()))
      && (!minRating || (p.rating ?? 0) >= minRating)
  }), [professionals, search, selectedProf, minRating])

  useEffect(() => {
    if (viewMode !== 'map' || !WebView) return
    const key = filtered.map(p => p.id).join(',')
    if (key === lastFilterKey.current) return
    lastFilterKey.current = key
    let cancelled = false
    setGeocoding(true)
    setMapHtml(null)
    buildMarkers(filtered).then(markers => {
      if (!cancelled) {
        setMapHtml(buildMapHtml(markers))
        setGeocoding(false)
      }
    }).catch(() => {
      if (!cancelled) { setMapHtml(buildMapHtml([])); setGeocoding(false) }
    })
    return () => { cancelled = true }
  }, [viewMode, filtered, WebView])

  const hasFilters = !!selectedProf || minRating > 0

  const handleOpenProfile = useCallback((prof: User) => {
    setSelectedUser(prof)
    setShowProfile(true)
  }, [])

  const handleCloseProfile = useCallback(() => {
    setShowProfile(false)
    setSelectedUser(null)
  }, [])

  const handleMapMessage = useCallback((e: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(e.nativeEvent.data)
      if (data.action === 'open' && data.id) {
        const found = professionals.find(p => p.id === data.id)
        if (found) { setSelectedUser(found); setShowProfile(true) }
      } else if (data.action === 'whatsapp' && data.phone) {
        Linking.openURL(`https://wa.me/55${data.phone}`)
      }
    } catch {}
  }, [professionals])

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    )
  }

  const WebViewComponent = WebView as React.ComponentType<{
    source: { html: string }
    style: Record<string, unknown>
    javaScriptEnabled: boolean
    domStorageEnabled: boolean
    originWhitelist: string[]
    mixedContentMode: string
    onMessage: (e: { nativeEvent: { data: string } }) => void
  }>

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <Text weight="extraBold" size="4xl" letterSpacing={-0.5}>Explorar</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowFilter(true)}
              style={{
                width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                backgroundColor: hasFilters ? `${colors.primary}20` : 'rgba(255,255,255,0.06)',
                borderWidth: 1, borderColor: hasFilters ? `${colors.primary}50` : colors.border.light,
              }}
            >
              <Ionicons name="options" size={18} color={hasFilters ? colors.primary : colors.text.muted} />
            </TouchableOpacity>
            {!!WebView && (
              <TouchableOpacity
                onPress={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
                style={{
                  width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: viewMode === 'map' ? `${colors.primary}20` : 'rgba(255,255,255,0.06)',
                  borderWidth: 1, borderColor: viewMode === 'map' ? `${colors.primary}50` : colors.border.light,
                }}
              >
                <Ionicons name={viewMode === 'map' ? 'list' : 'map'} size={18} color={viewMode === 'map' ? colors.primary : colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text color="muted" size="md">
          {filtered.length} profissiona{filtered.length !== 1 ? 'is' : 'l'} disponíve{filtered.length !== 1 ? 'is' : 'l'}
        </Text>
      </View>

      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Input
          icon="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Nome, cidade, profissão..."
          onClear={() => setSearch('')}
        />
      </View>

      {hasFilters && (
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {selectedProf ? (
            <TouchableOpacity
              onPress={() => setSelectedProf('')}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.xxl,
                backgroundColor: `${colors.primary}15`, borderWidth: 1, borderColor: `${colors.primary}30`,
              }}
            >
              <Text color="accent" size="sm">{selectedProf}</Text>
              <Ionicons name="close" size={11} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
          {minRating > 0 ? (
            <TouchableOpacity
              onPress={() => setMinRating(0)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.xxl,
                backgroundColor: `${colors.primary}15`, borderWidth: 1, borderColor: `${colors.primary}30`,
              }}
            >
              <Text color="accent" size="sm">{minRating}★ mín</Text>
              <Ionicons name="close" size={11} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {viewMode === 'map' && WebView ? (
        <View style={{ flex: 1 }}>
          {geocoding || !mapHtml ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text color="muted" size="md">Localizando profissionais...</Text>
            </View>
          ) : (
            <WebViewComponent
              source={{ html: mapHtml }}
              style={{ flex: 1, backgroundColor: colors.background }}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              onMessage={handleMapMessage}
            />
          )}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={{ paddingVertical: 64, alignItems: 'center' }}>
              <Ionicons name="search-outline" size={48} color={colors.text.disabled} />
              <Text color="hint" size="base" style={{ marginTop: 16 }}>
                {search || hasFilters ? 'Nenhum profissional encontrado' : 'Nenhum profissional disponível'}
              </Text>
            </View>
          ) : filtered.map(p => (
            <ProfessionalCard key={p.id} prof={p} onPress={() => handleOpenProfile(p)} />
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {showProfile && (
        <ProfileModal prof={selectedUser} visible={showProfile} onClose={handleCloseProfile} />
      )}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        professions={allProfessions}
        selectedProf={selectedProf}
        setSelectedProf={setSelectedProf}
        minRating={minRating}
        setMinRating={setMinRating}
      />
    </SafeAreaView>
  )
}
