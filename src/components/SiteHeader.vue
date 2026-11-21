<script setup>
import { computed } from 'vue'
import { currency, cycleCurrency, ratesLoaded } from '../utils/format.js'

const props = defineProps({
  count: { type: Number, default: 0 },
  theme: { type: String, default: 'auto' },
})

defineEmits(['open-cart', 'toggle-theme'])

const THEMES = {
  auto: ['🖥️', 'Авто'],
  light: ['☀️', 'Світла'],
  dark: ['🌙', 'Темна'],
}
const CURRENCY_ICONS = { USD: '💵', UAH: '🇺🇦', EUR: '💶' }

const themeIcon = computed(() => THEMES[props.theme][0])
const themeLabel = computed(() => THEMES[props.theme][1])
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="#"><span aria-hidden="true">✈️</span> Let's Travel</a>

      <div class="actions">
        <button
          class="head-btn"
          type="button"
          :title="ratesLoaded ? 'Актуальний курс НБУ' : 'Перемкнути валюту'"
          :aria-label="`Валюта: ${currency}. Натисніть, щоб змінити`"
          @click="cycleCurrency"
        >
          <span aria-hidden="true">{{ CURRENCY_ICONS[currency] }}</span>
          <span>{{ currency }}</span>
        </button>

        <button
          class="head-btn"
          type="button"
          :aria-label="`Тема оформлення: ${themeLabel}. Натисніть, щоб змінити`"
          @click="$emit('toggle-theme')"
        >
          <span aria-hidden="true">{{ themeIcon }}</span>
          <span class="btn-text">{{ themeLabel }}</span>
        </button>

        <button
          class="head-btn head-btn--cart"
          type="button"
          :aria-label="`Відкрити кошик, турів у кошику: ${count}`"
          @click="$emit('open-cart')"
        >
          <span aria-hidden="true">🛒</span>
          <span class="btn-text">Кошик</span>
          <span class="count" aria-hidden="true">{{ count }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-block: 0.5rem;
}
.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary-dark);
  text-decoration: none;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.head-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  padding: 0.4rem 0.9rem;
  border: 2px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.head-btn:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.head-btn--cart {
  border-color: var(--primary);
}
.count {
  display: inline-grid;
  place-items: center;
  min-width: 1.6rem;
  height: 1.6rem;
  padding-inline: 0.35rem;
  border-radius: 999px;
  background: var(--primary);
  color: var(--on-primary);
  font-size: 0.85rem;
}
.btn-text {
  display: none;
}
@media (min-width: 40rem) {
  .btn-text {
    display: inline;
  }
}
</style>