function weatherIcon(code) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  return '⛈️'
}

// Завантажує поточну температуру для всіх турів одним запитом
export async function fetchWeatherForTours(tours) {
  const withCoords = tours.filter((t) => Number.isFinite(t.lat) && Number.isFinite(t.lng))
  if (withCoords.length === 0) return {}

  const lats = withCoords.map((t) => t.lat).join(',')
  const lngs = withCoords.map((t) => t.lng).join(',')
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,weather_code`

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Weather HTTP ${res.status}`)

  const raw = await res.json()
  const list = Array.isArray(raw) ? raw : [raw]

  const map = {}
  withCoords.forEach((tour, i) => {
    const cur = list[i]?.current
    if (cur && Number.isFinite(cur.temperature_2m)) {
      map[tour.id] = {
        temp: Math.round(cur.temperature_2m),
        icon: weatherIcon(cur.weather_code),
      }
    }
  })
  return map
}