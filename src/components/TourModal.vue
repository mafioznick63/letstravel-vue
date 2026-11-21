<script setup>
import { ref, computed, onMounted } from 'vue'
import { money, nightsWord, MAX_QTY } from '../utils/format.js'

const props = defineProps({
  product: { type: Object, required: true },
  weather: { type: Object, default: null },
})

const emit = defineEmits(['close', 'confirm'])

const MEALS = [
  { id: 'BB', label: 'Тільки сніданки (BB)', perNight: 0 },
  { id: 'HB', label: 'Напівпансіон (HB)', perNight: 25 },
  { id: 'AI', label: 'All Inclusive (AI)', perNight: 55 },
]

const NIGHT_OPTIONS = computed(() => {
  const set = new Set([5, 7, 10, 14, props.product.nights])
  return [...set].sort((a, b) => a - b)
})

const nights = ref(props.product.nights)
const mealId = ref('BB')
const guests = ref(1)
const dialog = ref(null)

const selectedMeal = computed(() => MEALS.find((m) => m.id === mealId.value) || MEALS[0])

// Реактивний перерахунок ціни за 1 особу залежно від ночей і харчування
const unitPrice = computed(() => {
  const basePerNight = props.product.price / props.product.nights
  return Math.round(basePerNight * nights.value + selectedMeal.value.perNight * nights.value)
})

const totalPrice = computed(() => unitPrice.value * guests.value)

function addConfigured() {
  emit('confirm', {
    product: props.product,
    nights: nights.value,
    meal: selectedMeal.value.label,
    unitPrice: unitPrice.value,
    qty: guests.value,
  })
}

onMounted(() => dialog.value?.focus())
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div
      ref="dialog"
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`cfg-${product.id}`"
      tabindex="-1"
      @keydown.esc="emit('close')"
    >
      <div class="modal-head">
        <h2 :id="`cfg-${product.id}`">{{ product.name }}</h2>
        <button class="close" type="button" aria-label="Закрити" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="preview">
          <img :src="product.image" :alt="product.country">
          <div>
            <p class="muted">{{ product.country }} · {{ product.category }}</p>
            <p v-if="weather" class="weather-line">
              Зараз на курорті: <strong>{{ weather.icon }} {{ weather.temp > 0 ? `+${weather.temp}` : weather.temp }}°C</strong>
            </p>
          </div>
        </div>

        <div class="group">
          <span class="label">Тривалість туру</span>
          <div class="pills">
            <button
              v-for="n in NIGHT_OPTIONS"
              :key="n"
              type="button"
              class="pill"
              :class="{ 'pill--active': nights === n }"
              @click="nights = n"
            >
              {{ n }} {{ nightsWord(n) }}
            </button>
          </div>
        </div>

        <div class="group">
          <span class="label">Харчування</span>
          <div class="meals">
            <label v-for="m in MEALS" :key="m.id" class="meal-opt" :class="{ 'meal-opt--active': mealId === m.id }">
              <input v-model="mealId" type="radio" :value="m.id">
              <span>{{ m.label }}</span>
              <small class="muted">{{ m.perNight === 0 ? 'у вартості' : `+${money(m.perNight)} / ніч` }}</small>
            </label>
          </div>
        </div>

        <div class="group row-between">
          <span class="label">Кількість туристів</span>
          <div class="qty">
            <button type="button" :disabled="guests <= 1" @click="guests--">−</button>
            <span>{{ guests }}</span>
            <button type="button" :disabled="guests >= MAX_QTY" @click="guests++">+</button>
          </div>
        </div>

        <div class="summary">
          <div>
            <span class="muted">Ціна за 1 особу:</span>
            <strong>{{ money(unitPrice) }}</strong>
          </div>
          <div class="summary-total">
            <span>Разом ({{ guests }} ос.):</span>
            <strong>{{ money(totalPrice) }}</strong>
          </div>
        </div>

        <button class="btn btn--block" type="button" @click="addConfigured">
          Додати в кошик · {{ money(totalPrice) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(0 0 0 / 0.55);
}
.modal {
  width: min(100%, 32rem);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: var(--radius);
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: 0 1.5rem 3rem rgb(0 0 0 / 0.3);
  outline: none;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.modal-head h2 {
  margin: 0;
  font-size: 1.2rem;
}
.close {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
}
.modal-body {
  display: grid;
  gap: 1.1rem;
  padding: 1.25rem;
}
.preview {
  display: flex;
  gap: 0.9rem;
  align-items: center;
}
.preview img {
  width: 5.5rem;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.preview p {
  margin: 0.15rem 0;
}
.weather-line {
  font-size: 0.9rem;
}
.group {
  display: grid;
  gap: 0.45rem;
}
.label {
  font-weight: 700;
  font-size: 0.95rem;
}
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.pill {
  padding: 0.4rem 0.8rem;
  border: 2px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.pill--active {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--on-primary);
}
.meals {
  display: grid;
  gap: 0.45rem;
}
.meal-opt {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  cursor: pointer;
}
.meal-opt small {
  margin-left: auto;
}
.meal-opt--active {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.qty {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.qty button {
  width: 2.4rem;
  height: 2.4rem;
  border: 2px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.qty span {
  min-width: 1.8rem;
  text-align: center;
  font-weight: 800;
}
.summary {
  display: grid;
  gap: 0.3rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
}
.summary div {
  display: flex;
  justify-content: space-between;
}
.summary-total {
  padding-top: 0.4rem;
  border-top: 1px solid var(--border);
  font-size: 1.2rem;
  color: var(--primary-dark);
}
</style>