import { ref } from 'vue'

// Максимальна кількість осіб в одному турі (кошик)
export const MAX_QTY = 10

const CURRENCY_KEY = 'letstravel-currency'
const CURRENCIES = ['USD', 'UAH', 'EUR']
const SYMBOLS = { USD: '$', UAH: '₴', EUR: '€' }

export const currency = ref(localStorage.getItem(CURRENCY_KEY) || 'USD')
export const rates = ref({ USD: 1, UAH: 41.5, EUR: 0.92 }) // резервний курс, якщо API недоступний
export const ratesLoaded = ref(false)

export function cycleCurrency() {
  const next = CURRENCIES[(CURRENCIES.indexOf(currency.value) + 1) % CURRENCIES.length]
  currency.value = next
  localStorage.setItem(CURRENCY_KEY, next)
}

// Завантаження актуального курсу з відкритого API НБУ
export async function loadRates() {
  try {
    const res = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json', {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return
    const data = await res.json()
    const usd = data.find((c) => c.cc === 'USD')?.rate
    const eur = data.find((c) => c.cc === 'EUR')?.rate
    if (usd && eur) {
      rates.value = { USD: 1, UAH: usd, EUR: usd / eur }
      ratesLoaded.value = true
    }
  } catch {
    // якщо немає мережі — працюють резервні курси
  }
}

// Реактивне форматування ціни (базові ціни в products.json — у USD)
export function money(n) {
  const cur = currency.value
  const converted = Math.round(n * (rates.value[cur] ?? 1))
  const formatted = converted.toLocaleString('uk-UA')
  return cur === 'UAH' ? `${formatted} ₴` : `${SYMBOLS[cur]}${formatted}`
}

// Відміна слова «ніч»: 1 ніч, 2–4 ночі, 5+ ночей
export function nightsWord(n) {
  const last = n % 10
  const lastTwo = n % 100
  if (lastTwo >= 11 && lastTwo <= 14) return 'ночей'
  if (last === 1) return 'ніч'
  if (last >= 2 && last <= 4) return 'ночі'
  return 'ночей'
}