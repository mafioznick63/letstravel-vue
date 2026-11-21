<script setup>
import { reactive, ref, computed } from 'vue'

const emit = defineEmits(['submitted', 'cancel'])

const form = reactive({
  name: '',
  phone: '',
  email: '',
  date: '',
  consent: false,
})

// Помилки показуємо лише після першої спроби відправити форму
const attempted = ref(false)
const today = new Date().toISOString().slice(0, 10)

// computed: помилки рахуються самі з даних форми
const errors = computed(() => {
  const e = {}
  if (form.name.length < 2) e.name = "Вкажіть ім'я (мінімум 2 символи)"
  if (!/^\+?[0-9\s()-]{10,16}$/.test(form.phone)) e.phone = 'Введіть коректний номер телефону'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Введіть коректну пошту'
  if (!form.date) e.date = 'Оберіть бажану дату вильоту'
  else if (form.date < today) e.date = 'Дата не може бути в минулому'
  if (!form.consent) e.consent = 'Потрібна згода на обробку даних'
  return e
})

function submit() {
  attempted.value = true
  if (Object.keys(errors.value).length > 0) return
  emit('submitted', { name: form.name, email: form.email, date: form.date })
}
</script>

<template>
  <!-- novalidate: перевірку робимо самі (computed), щоб тексти були українською -->
  <form class="checkout" novalidate @submit.prevent="submit">
    <h3>Оформлення заявки</h3>

    <div class="field">
      <label for="co-name">Ім'я та прізвище</label>
      <input id="co-name" v-model.trim="form.name" autocomplete="name" :aria-invalid="attempted && !!errors.name">
      <p v-if="attempted && errors.name" class="error" role="alert">{{ errors.name }}</p>
    </div>

    <div class="field">
      <label for="co-phone">Телефон</label>
      <input id="co-phone" v-model.trim="form.phone" type="tel" autocomplete="tel" placeholder="+380…" :aria-invalid="attempted && !!errors.phone">
      <p v-if="attempted && errors.phone" class="error" role="alert">{{ errors.phone }}</p>
    </div>

    <div class="field">
      <label for="co-email">Email</label>
      <input id="co-email" v-model.trim="form.email" type="email" autocomplete="email" :aria-invalid="attempted && !!errors.email">
      <p v-if="attempted && errors.email" class="error" role="alert">{{ errors.email }}</p>
    </div>

    <div class="field">
      <label for="co-date">Бажана дата вильоту</label>
      <input id="co-date" v-model="form.date" type="date" :min="today" :aria-invalid="attempted && !!errors.date">
      <p v-if="attempted && errors.date" class="error" role="alert">{{ errors.date }}</p>
    </div>

    <div class="field">
      <label class="consent">
        <input v-model="form.consent" type="checkbox">
        <span>Погоджуюсь на обробку персональних даних</span>
      </label>
      <p v-if="attempted && errors.consent" class="error" role="alert">{{ errors.consent }}</p>
    </div>

    <div class="row">
      <button class="btn" type="submit">Надіслати заявку</button>
      <button class="btn btn--ghost" type="button" @click="emit('cancel')">Назад</button>
    </div>
  </form>
</template>

<style scoped>
.checkout {
  display: grid;
  gap: 0.9rem;
  margin-top: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}
.checkout h3 {
  margin: 0;
}
.field {
  display: grid;
  gap: 0.3rem;
}
.error {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--danger);
}
input[aria-invalid='true'] {
  border-color: var(--danger);
}
.consent {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  font-weight: 400;
}
.consent input {
  width: 1.5rem;
  height: 1.5rem;
  margin: 0.1rem 0 0;
  flex-shrink: 0;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
