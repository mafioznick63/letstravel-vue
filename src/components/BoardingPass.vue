<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { money } from '../utils/format.js'

const props = defineProps({
  order: { type: Object, required: true },
})

defineEmits(['close'])

const qrUrl = ref('')

onMounted(async () => {
  const routes = props.order.items.map((i) => `${i.country} (${i.qty} ос.)`).join(', ')
  const payload = [
    `LET'S TRAVEL E-VOUCHER`,
    `Booking: ${props.order.code}`,
    `Passenger: ${props.order.name}`,
    `Date: ${props.order.date}`,
    `Tours: ${routes}`,
    `Total: ${money(props.order.total)}`,
  ].join('\n')

  try {
    qrUrl.value = await QRCode.toDataURL(payload, { width: 150, margin: 1 })
  } catch {
    qrUrl.value = ''
  }
})
</script>

<template>
  <div class="ticket">
    <div class="ticket-top">
      <div class="brand">✈️ Let's Travel</div>
      <span class="code">{{ order.code }}</span>
    </div>

    <div class="ticket-body">
      <p class="eyebrow">Електронний ваучер бронювання</p>
      <h3>{{ order.name }}</h3>

      <dl class="grid-info">
        <div>
          <dt>Виліт</dt>
          <dd>{{ order.date }}</dd>
        </div>
        <div>
          <dt>Сума</dt>
          <dd>{{ money(order.total) }}</dd>
        </div>
      </dl>

      <ul class="tour-list">
        <li v-for="(item, idx) in order.items" :key="idx">
          <strong>{{ item.name }}</strong>
          <span class="muted"> — {{ item.qty }} ос. ({{ item.nights }} ноч.{{ item.meal ? `, ${item.meal}` : '' }})</span>
        </li>
      </ul>
    </div>

    <div class="ticket-tear" aria-hidden="true"></div>

    <div class="ticket-bottom">
      <img v-if="qrUrl" :src="qrUrl" alt="QR-код бронювання" class="qr">
      <div class="qr-text">
        <p><strong>Готово до подорожі!</strong></p>
        <p class="muted">Проскануйте QR-код або збережіть номер <strong>{{ order.code }}</strong>. Копію надіслано на {{ order.email }}.</p>
      </div>
    </div>

    <div class="ticket-actions">
      <button class="btn btn--block" type="button" @click="$emit('close')">Повернутися до каталогу</button>
    </div>
  </div>
</template>

<style scoped>
.ticket {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
  box-shadow: 0 0.75rem 2rem rgb(0 0 0 / 0.12);
}
.ticket-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.1rem;
  background: var(--primary);
  color: var(--on-primary);
  font-weight: 800;
}
.code {
  padding: 0.15rem 0.55rem;
  border-radius: 0.4rem;
  background: rgb(255 255 255 / 0.2);
  font-family: monospace;
  font-size: 0.95rem;
}
.ticket-body {
  padding: 1.1rem;
}
.eyebrow {
  margin: 0 0 0.2rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.ticket-body h3 {
  margin: 0 0 0.85rem;
  font-size: 1.25rem;
}
.grid-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 0 0 0.9rem;
  padding: 0.7rem;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
}
.grid-info dt {
  font-size: 0.8rem;
  color: var(--muted);
}
.grid-info dd {
  margin: 0;
  font-weight: 800;
  color: var(--primary-dark);
}
.tour-list {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.9rem;
  display: grid;
  gap: 0.3rem;
}
.ticket-tear {
  border-top: 2px dashed var(--border);
  margin-inline: 0.75rem;
}
.ticket-bottom {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.1rem;
}
.qr {
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 0.5rem;
  background: #fff;
  padding: 0.25rem;
  flex-shrink: 0;
}
.qr-text p {
  margin: 0 0 0.35rem;
  font-size: 0.88rem;
}
.ticket-actions {
  padding: 0 1.1rem 1.1rem;
}
</style>