<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { money, currency, rates, nightsWord } from '../utils/format.js'

const props = defineProps({
  products: { type: Array, required: true },
  weatherMap: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['add', 'configure'])

const mapEl = ref(null)
let map = null
let layerGroup = null

function renderMarkers() {
  if (!map || !layerGroup) return
  layerGroup.clearLayers()

  const bounds = []
  props.products.forEach((p) => {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return

    const icon = L.divIcon({
      className: 'tour-pin-wrap',
      html: `<div class="tour-pin">${money(p.price)}</div>`,
      iconSize: [72, 28],
      iconAnchor: [36, 14],
    })

    const w = props.weatherMap[p.id]
    const weatherHtml = w
      ? `<span class="pop-weather">${w.icon} ${w.temp > 0 ? `+${w.temp}` : w.temp}°C</span>`
      : ''

    const popupHtml = `
      <div class="tour-popup">
        <img src="${p.image}" alt="${p.country}">
        <div class="pop-body">
          <div class="pop-top">
            <small>${p.country} · ${p.nights} ${nightsWord(p.nights)}</small>
            ${weatherHtml}
          </div>
          <strong>${p.name}</strong>
          <div class="pop-price">${money(p.price)}</div>
          <div class="pop-actions">
            <button type="button" data-action="add" data-id="${p.id}">У кошик</button>
            <button type="button" class="pop-cfg" data-action="configure" data-id="${p.id}">⚙️</button>
          </div>
        </div>
      </div>
    `

    L.marker([p.lat, p.lng], { icon }).bindPopup(popupHtml, { maxWidth: 240 }).addTo(layerGroup)
    bounds.push([p.lat, p.lng])
  })

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 6 })
  }
}

function onMapClick(e) {
  const btn = e.target.closest('button[data-action]')
  if (!btn) return
  const id = Number(btn.dataset.id)
  const product = props.products.find((p) => p.id === id)
  if (!product) return
  if (btn.dataset.action === 'add') emit('add', product)
  if (btn.dataset.action === 'configure') emit('configure', product)
}

onMounted(() => {
  map = L.map(mapEl.value, { scrollWheelZoom: false }).setView([36, 20], 3)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)

  layerGroup = L.layerGroup().addTo(map)
  renderMarkers()
})

watch([() => props.products, () => props.weatherMap, currency, rates], renderMarkers, { deep: true })

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="map-card">
    <div ref="mapEl" class="map-box" @click="onMapClick"></div>
  </div>
</template>

<style scoped>
.map-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}
.map-box {
  width: 100%;
  height: clamp(24rem, 62vh, 38rem);
  z-index: 1;
}
:deep(.tour-pin-wrap) {
  background: transparent;
  border: none;
}
:deep(.tour-pin) {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--primary);
  color: var(--on-primary);
  font-weight: 800;
  font-size: 0.82rem;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.3);
  border: 2px solid #fff;
  transition: transform 0.15s;
}
:deep(.tour-pin:hover) {
  transform: scale(1.1);
}
:deep(.tour-popup) {
  width: 210px;
  font-family: inherit;
}
:deep(.tour-popup img) {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 0.45rem;
  margin-bottom: 0.45rem;
}
:deep(.pop-top) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  margin-bottom: 0.2rem;
}
:deep(.pop-price) {
  margin: 0.35rem 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}
:deep(.pop-actions) {
  display: flex;
  gap: 0.35rem;
}
:deep(.pop-actions button) {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: none;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
:deep(.pop-actions .pop-cfg) {
  flex: 0 0 auto;
  background: #e2e8f0;
  color: #0f172a;
}
</style>