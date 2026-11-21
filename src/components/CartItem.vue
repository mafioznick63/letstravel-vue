<script setup>
import { money, nightsWord, MAX_QTY } from '../utils/format.js'

defineProps({
  item: { type: Object, required: true },
})

defineEmits(['inc', 'dec', 'remove'])
</script>

<template>
  <li class="cart-item">
    <img :src="item.image" :alt="item.country" width="160" height="100" loading="lazy">

    <div class="info">
      <h3>{{ item.name }}</h3>
      <p class="muted meta-opt">
        {{ item.nights }} {{ nightsWord(item.nights) }}<span v-if="item.meal"> · {{ item.meal }}</span>
      </p>
      <p class="muted">
        {{ money(item.price) }} × {{ item.qty }} =
        <strong>{{ money(item.price * item.qty) }}</strong>
      </p>
    </div>

    <div class="qty" role="group" :aria-label="`Кількість осіб: ${item.name}`">
      <button type="button" :disabled="item.qty <= 1" aria-label="Менше" @click="$emit('dec')">−</button>
      <span aria-live="polite">{{ item.qty }}</span>
      <button type="button" :disabled="item.qty >= MAX_QTY" aria-label="Більше" @click="$emit('inc')">+</button>
    </div>

    <button
      class="remove"
      type="button"
      :aria-label="`Видалити з кошика: ${item.name}`"
      @click="$emit('remove')"
    >
      🗑 <span>Видалити</span>
    </button>
  </li>
</template>

<style scoped>
.cart-item {
  display: grid;
  grid-template-columns: 5rem 1fr auto;
  gap: 0.5rem 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
}
.cart-item img {
  grid-row: span 2;
  width: 5rem;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 0.5rem;
}
.info {
  grid-column: 2 / 4;
  min-width: 0;
}
.info h3 {
  margin-bottom: 0.15rem;
  font-size: 1rem;
}
.info p {
  margin: 0;
  font-size: 0.9rem;
}
.meta-opt {
  font-size: 0.82rem;
  margin-bottom: 0.15rem !important;
}
.qty {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.qty button,
.remove {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 2px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.qty button:hover:not(:disabled),
.remove:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.qty button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.qty span {
  min-width: 2rem;
  text-align: center;
  font-weight: 800;
}
.remove {
  justify-self: end;
  padding-inline: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>