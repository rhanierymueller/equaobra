/**
 * Geocoding via Nominatim (OpenStreetMap) — free, no API key needed.
 * Converts address components into lat/lng coordinates.
 */

interface GeoResult {
  lat: number
  lng: number
}

export async function geocodeAddress(parts: {
  street?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  cep?: string | null
}): Promise<GeoResult | null> {
  const { street, neighborhood, city, state, cep } = parts
  if (!city && !cep) return null

  const queries: string[] = []

  if (street && city && state) {
    queries.push(`${street}, ${neighborhood ?? ''}, ${city}, ${state}, Brazil`)
  }
  if (neighborhood && city && state) {
    queries.push(`${neighborhood}, ${city}, ${state}, Brazil`)
  }
  if (city && state) {
    queries.push(`${city}, ${state}, Brazil`)
  }
  if (cep) {
    queries.push(`${cep}, Brazil`)
  }

  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
        q,
        format: 'json',
        limit: '1',
        countrycodes: 'br',
      })}`

      const res = await fetch(url, {
        headers: { 'User-Agent': 'EquaObra/1.0 (geocoding)' },
        signal: AbortSignal.timeout(5000),
      })

      if (!res.ok) continue

      const data = (await res.json()) as { lat: string; lon: string }[]
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return { lat, lng }
        }
      }
    } catch {
      continue
    }
  }

  return null
}
