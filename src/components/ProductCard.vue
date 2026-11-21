<script setup>
import { money, nightsWord } from '../utils/format.js'

defineProps({
  product: { type: Object, required: true },
  inCart: { type: Number, default: 0 },
  weather: { type: Object, default: null }, // { temp, icon }
})

const emit = defineEmits(['add', 'configure'])
</script>

<template>
  <article class="card product">
    <div class="photo">
      <img
        :src="product.image"
        :alt="`${product.country}: ${product.name}`"
        width="800"
        height="500"
        loading="lazy"
      >
      <span class="badge">{{ product.category }}</span>
      <span v-if="product.hot" class="badge badge--hot">🔥 Гаряче</span>
      <span
        v-if="weather"
        class="badge badge--weather"
        :title="`Зараз у ${product.country}`"
      >
        {{ weather.icon }} {{ weather.temp > 0 ? `+${weather.temp}` : weather.temp }}°C
      </span>
    </div>

    <div class="body">
      <h3>{{ product.name }}</h3>
      <p class="muted meta">{{ product.country }} · {{ product.nights }} {{ nightsWord(product.nights) }}</p>
      <p class="desc">{{ product.description }}</p>

      <div class="foot">
        <p class="price">
          {{ money(product.price) }} <small>/ особа</small>
        </p>
        <div class="btn-group">
          <button
            class="btn btn--ghost btn--sm"
            type="button"
            title="Обрати кількість ночей та харчування"
            @click="emit('configure', product)"
          >
            ⚙️
          </button>
          <button class="btn" type="button" @click="emit('add', product)">
            {{ inCart > 0 ? `У кошику: ${inCart} ✓` : 'Додати в кошик' }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.photo {
  position: relative;
  overflow: hidden;
}
.photo img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  transition: transform 0.4s;
}
@media (hover: hover) {
  .product:hover .photo img {
    transform: scale(1.06);
  }
}
.badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.15rem 0.75rem;
  border-radius: 999px;
  background: var(--surface);
  color: var(--primary-dark);
  font-size: 0.85rem;
  font-weight: 800;
}
.badge--hot {
  left: auto;
  right: 0.75rem;
}
.badge--weather {
  top: auto;
  left: auto;
  right: 0.75rem;
  bottom: 0.75rem;
  background: rgb(15 23 42 / 0.78);
  color: #fff;
  backdrop-filter: blur(4px);
}
.body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.25rem;
}
.meta {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}
.desc {
  flex: 1;
}
.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.btn-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.btn--sm {
  min-width: 2.75rem;
  padding-inline: 0.65rem;
}
.price {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary-dark);
}
.price small {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--muted);
}
</style>