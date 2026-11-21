<script setup>
// defineModel — скорочений v-model для компонента:
// батько пише v-model:query="query", а тут це звичайна змінна
const query = defineModel('query', { default: '' })
const category = defineModel('category', { default: '' })
const sort = defineModel('sort', { default: 'default' })

defineProps({
  categories: { type: Array, required: true },
  total: { type: Number, default: 0 }, // скільки турів знайдено
})
</script>

<template>
  <div class="filters card">
    <div class="field">
      <label for="search">Пошук за назвою або країною</label>
      <input
        id="search"
        v-model.trim="query"
        type="search"
        placeholder="Наприклад: Греція або Париж"
        autocomplete="off"
      >
    </div>

    <div class="field">
      <label for="sort">Сортування</label>
      <select id="sort" v-model="sort">
        <option value="default">За замовчуванням</option>
        <option value="asc">Спочатку дешевші</option>
        <option value="desc">Спочатку дорожчі</option>
      </select>
    </div>

    <div class="cats" role="group" aria-label="Категорія туру">
      <button
        type="button"
        class="chip"
        :class="{ active: category === '' }"
        :aria-pressed="category === ''"
        @click="category = ''"
      >
        Усі
      </button>
      <button
        v-for="c in categories"
        :key="c"
        type="button"
        class="chip"
        :class="{ active: category === c }"
        :aria-pressed="category === c"
        @click="category = c"
      >
        {{ c }}
      </button>
    </div>

    <p class="found" aria-live="polite">Знайдено турів: <strong>{{ total }}</strong></p>
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}
.field {
  display: grid;
  gap: 0.375rem;
}
.cats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chip {
  min-height: 2.75rem;
  padding: 0.4rem 1rem;
  border: 2px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.chip:hover {
  border-color: var(--primary);
}
.chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}
.found {
  margin: 0;
  color: var(--muted);
}
/* ≥ 48rem: пошук і сортування в один ряд */
@media (min-width: 48rem) {
  .filters {
    grid-template-columns: 2fr 1fr;
    align-items: end;
  }
  .cats,
  .found {
    grid-column: 1 / -1;
  }
}
</style>
