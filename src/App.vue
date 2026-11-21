<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import FilterBar from './components/FilterBar.vue'
import ProductCard from './components/ProductCard.vue'
import CartPanel from './components/CartPanel.vue'
import TourModal from './components/TourModal.vue'
import ToursMap from './components/ToursMap.vue'
import { MAX_QTY, loadRates } from './utils/format.js'
import { fetchWeatherForTours } from './utils/weather.js'

const CART_KEY = 'letstravel-cart'
const THEME_KEY = 'letstravel-theme'
const THEMES = ['auto', 'light', 'dark']

const products = ref([])
const weatherMap = ref({})
const loading = ref(true)
const error = ref('')

const query = ref('')
const category = ref('')
const sort = ref('default')
const viewMode = ref('grid') // 'grid' | 'map'

const cartOpen = ref(false)
const configuring = ref(null) // тур, відкритий у конфігураторі
const cart = ref(loadCart())
const theme = ref(localStorage.getItem(THEME_KEY) || 'auto')

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved
      .filter((l) => l && Number.isInteger(l.id) && Number.isFinite(l.qty) && l.qty > 0)
      .map((l) => ({
        key: l.key || `${l.id}|base`,
        id: l.id,
        qty: l.qty,
        nights: l.nights ?? null,
        meal: l.meal ?? '',
        unitPrice: l.unitPrice ?? null,
      }))
  } catch {
    return []
  }
}

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}products.json`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    products.value = await res.json()
    fetchWeatherForTours(products.value)
      .then((map) => (weatherMap.value = map))
      .catch(() => {})
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
  loadRates()
})

const categories = computed(() => [...new Set(products.value.map((p) => p.category))])

const visible = computed(() => {
  const q = query.value.toLowerCase()
  const list = products.value.filter(
    (p) =>
      (category.value === '' || p.category === category.value) &&
      (q === '' || p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)),
  )
  if (sort.value === 'asc') return list.toSorted((a, b) => a.price - b.price)
  if (sort.value === 'desc') return list.toSorted((a, b) => b.price - a.price)
  return list
})

const cartLines = computed(() =>
  cart.value
    .map((l) => {
      const base = products.value.find((p) => p.id === l.id)
      if (!base) return null
      return {
        ...base,
        key: l.key,
        qty: l.qty,
        nights: l.nights ?? base.nights,
        meal: l.meal || '',
        price: l.unitPrice ?? base.price,
      }
    })
    .filter(Boolean),
)

const cartCount = computed(() => cart.value.reduce((sum, l) => sum + l.qty, 0))

const qtyOf = (id) => cart.value.filter((l) => l.id === id).reduce((s, l) => s + l.qty, 0)

function addToCart(product) {
  const key = `${product.id}|base`
  const line = cart.value.find((l) => l.key === key)
  if (line) line.qty = Math.min(MAX_QTY, line.qty + 1)
  else cart.value.push({ key, id: product.id, qty: 1, nights: product.nights, meal: '', unitPrice: product.price })
}

function addConfiguredTour({ product, nights, meal, unitPrice, qty }) {
  const key = `${product.id}|${nights}|${meal}`
  const line = cart.value.find((l) => l.key === key)
  if (line) line.qty = Math.min(MAX_QTY, line.qty + qty)
  else cart.value.push({ key, id: product.id, qty, nights, meal, unitPrice })
  configuring.value = null
}

function changeQty(key, delta) {
  const line = cart.value.find((l) => l.key === key)
  if (line) line.qty = Math.min(MAX_QTY, Math.max(1, line.qty + delta))
}

function removeFromCart(key) {
  cart.value = cart.value.filter((l) => l.key !== key)
}

function clearCart() {
  cart.value = []
}

function resetFilters() {
  query.value = ''
  category.value = ''
  sort.value = 'default'
}

function cycleTheme() {
  theme.value = THEMES[(THEMES.indexOf(theme.value) + 1) % THEMES.length]
}

watch(cart, (value) => localStorage.setItem(CART_KEY, JSON.stringify(value)), { deep: true })

watch(
  theme,
  (value) => {
    localStorage.setItem(THEME_KEY, value)
    document.documentElement.dataset.theme = value
  },
  { immediate: true },
)

watch([cartOpen, configuring], ([open, cfg]) => {
  document.body.classList.toggle('no-scroll', open || !!cfg)
})
</script>

<template>
  <a class="skip-link" href="#catalog">Перейти до каталогу</a>

  <SiteHeader
    :count="cartCount"
    :theme="theme"
    @open-cart="cartOpen = true"
    @toggle-theme="cycleTheme"
  />

  <main>
    <section class="hero">
      <div class="container">
        <h1>Каталог турів</h1>
        <p class="lead">
          Оберіть напрямок на сітці або карті, налаштуйте умови туру й отримайте електронний QR-ваучер.
        </p>
      </div>
    </section>

    <section id="catalog" class="section container">
      <FilterBar
        v-model:query="query"
        v-model:category="category"
        v-model:sort="sort"
        :categories="categories"
        :total="visible.length"
      />

      <div class="view-switch" role="group" aria-label="Режим відображення каталогу">
        <button
          type="button"
          class="view-btn"
          :class="{ 'view-btn--active': viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          🗂️ Сітка
        </button>
        <button
          type="button"
          class="view-btn"
          :class="{ 'view-btn--active': viewMode === 'map' }"
          @click="viewMode = 'map'"
        >
          🗺️ На карті
        </button>
      </div>

      <p v-if="loading" class="status" role="status">Завантаження турів…</p>

      <div v-else-if="error" class="status status--error" role="alert">
        <span class="status__icon" aria-hidden="true">⚠️</span>
        <h3>Не вдалося завантажити каталог</h3>
        <p class="muted">Помилка: {{ error }}</p>
        <button class="btn" type="button" @click="loadProducts">Спробувати ще</button>
      </div>

      <div v-else-if="visible.length === 0" class="status">
        <span class="status__icon" aria-hidden="true">🔍</span>
        <h3>Нічого не знайдено</h3>
        <p class="muted">Спробуйте змінити пошук або обрати іншу категорію.</p>
        <button class="btn" type="button" @click="resetFilters">Скинути фільтри</button>
      </div>

      <ToursMap
        v-else-if="viewMode === 'map'"
        :products="visible"
        :weather-map="weatherMap"
        @add="addToCart"
        @configure="(p) => (configuring = p)"
      />

      <div v-else class="grid">
        <ProductCard
          v-for="p in visible"
          :key="p.id"
          :product="p"
          :in-cart="qtyOf(p.id)"
          :weather="weatherMap[p.id]"
          @add="addToCart"
          @configure="(tour) => (configuring = tour)"
        />
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>© 2026 Let's Travel · навчальний проєкт, Vue 3</p>
    </div>
  </footer>

  <TourModal
    v-if="configuring"
    :product="configuring"
    :weather="weatherMap[configuring.id]"
    @close="configuring = null"
    @confirm="addConfiguredTour"
  />

  <CartPanel
    v-if="cartOpen"
    :lines="cartLines"
    :count="cartCount"
    @close="cartOpen = false"
    @inc="(key) => changeQty(key, 1)"
    @dec="(key) => changeQty(key, -1)"
    @remove="removeFromCart"
    @clear="clearCart"
  />
</template>

<style scoped>
.view-switch {
  display: inline-flex;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
  padding: 0.25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
}
.view-btn {
  padding: 0.45rem 1rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.view-btn--active {
  background: var(--primary);
  color: var(--on-primary);
}
</style>