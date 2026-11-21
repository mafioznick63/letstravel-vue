<script setup>
import { ref, computed, onMounted } from 'vue'
import CartItem from './CartItem.vue'
import CheckoutForm from './CheckoutForm.vue'
import BoardingPass from './BoardingPass.vue'
import { money } from '../utils/format.js'

const props = defineProps({
  lines: { type: Array, required: true },
  count: { type: Number, default: 0 },
})
const emit = defineEmits(['close', 'inc', 'dec', 'remove', 'clear'])

const PROMOS = { TRAVEL10: 10, WELCOME5: 5 }

const promoInput = ref('')
const promoPercent = ref(0)
const promoMessage = ref('')
const showCheckout = ref(false)
const order = ref(null)
const panel = ref(null)

const subtotal = computed(() => props.lines.reduce((sum, l) => sum + l.price * l.qty, 0))
const discount = computed(() => Math.round((subtotal.value * promoPercent.value) / 100))
const total = computed(() => subtotal.value - discount.value)

function applyPromo() {
  const code = promoInput.value.trim().toUpperCase()
  if (PROMOS[code]) {
    promoPercent.value = PROMOS[code]
    promoMessage.value = `Промокод застосовано: знижка ${PROMOS[code]} %`
  } else {
    promoPercent.value = 0
    promoMessage.value = 'Такого промокоду немає'
  }
}

function onSubmitted(data) {
  const randomCode = 'LT-' + Math.random().toString(36).slice(2, 7).toUpperCase()
  order.value = {
    ...data,
    code: randomCode,
    total: total.value,
    items: props.lines.map((l) => ({
      name: l.name,
      country: l.country,
      qty: l.qty,
      nights: l.nights,
      meal: l.meal,
    })),
  }
  showCheckout.value = false
  emit('clear')
}

onMounted(() => panel.value?.focus())
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <aside
      ref="panel"
      class="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
      tabindex="-1"
      @keydown.esc="emit('close')"
    >
      <header class="head">
        <h2 id="cart-title">Кошик <small class="muted">({{ count }})</small></h2>
        <button class="close" type="button" aria-label="Закрити кошик" @click="emit('close')">✕</button>
      </header>

      <div class="body">
        <!-- 1. Замовлення оформлено — електронний квиток із QR -->
        <BoardingPass v-if="order" :order="order" @close="emit('close')" />

        <!-- 2. Кошик порожній -->
        <div v-else-if="lines.length === 0" class="status">
          <span class="status__icon" aria-hidden="true">🛒</span>
          <h3>Кошик порожній</h3>
          <p class="muted">Додайте тур із каталогу — і він з'явиться тут.</p>
          <button class="btn" type="button" @click="emit('close')">До каталогу</button>
        </div>

        <!-- 3. Є позиції -->
        <template v-else>
          <ul class="items">
            <CartItem
              v-for="l in lines"
              :key="l.key"
              :item="l"
              @inc="emit('inc', l.key)"
              @dec="emit('dec', l.key)"
              @remove="emit('remove', l.key)"
            />
          </ul>

          <form class="promo" @submit.prevent="applyPromo">
            <label for="promo">Промокод</label>
            <div class="promo-row">
              <input id="promo" v-model="promoInput" placeholder="TRAVEL10" autocomplete="off">
              <button class="btn btn--ghost" type="submit">Застосувати</button>
            </div>
            <p v-if="promoMessage" class="promo-msg" aria-live="polite">{{ promoMessage }}</p>
          </form>

          <dl class="sum">
            <div><dt>Сума</dt><dd>{{ money(subtotal) }}</dd></div>
            <div v-if="discount > 0"><dt>Знижка ({{ promoPercent }} %)</dt><dd>−{{ money(discount) }}</dd></div>
            <div class="sum-total"><dt>Разом</dt><dd>{{ money(total) }}</dd></div>
          </dl>

          <div class="actions" v-if="!showCheckout">
            <button class="btn btn--block" type="button" @click="showCheckout = true">Оформити заявку</button>
            <button class="btn btn--ghost btn--block" type="button" @click="emit('clear')">Очистити кошик</button>
          </div>

          <CheckoutForm v-else @submitted="onSubmitted" @cancel="showCheckout = false" />
        </template>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  background: rgb(0 0 0 / 0.5);
}
.panel {
  display: flex;
  flex-direction: column;
  width: min(100%, 28rem);
  height: 100%;
  background: var(--bg);
  box-shadow: -0.5rem 0 2rem rgb(0 0 0 / 0.25);
  outline: none;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.head h2 {
  margin: 0;
}
.close {
  width: 2.75rem;
  height: 2.75rem;
  border: 2px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  font-size: 1.1rem;
  cursor: pointer;
}
.close:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 2rem;
}
.items {
  display: grid;
  gap: 0.75rem;
}
.promo {
  margin-top: 1.25rem;
}
.promo-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.3rem;
}
.promo-msg {
  margin: 0.4rem 0 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-dark);
}
.sum {
  margin: 1.25rem 0;
  padding: 1rem;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
}
.sum div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.15rem;
}
.sum dt,
.sum dd {
  margin: 0;
}
.sum .sum-total {
  margin-top: 0.4rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary-dark);
}
.actions {
  display: grid;
  gap: 0.5rem;
}
</style>