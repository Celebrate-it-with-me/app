import { computed, ref, toValue, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PaymentsService from '../services/PaymentsService'
import { formatMoney } from '../utils/money'

/**
 * The price the API quotes today for unlocking this event (with the launch offer when it is open), for the buttons that
 * lead to the payment. It is a courtesy: if the quote fails the label simply has no price. `unlocked` is true when the
 * API says the event is already paid for.
 */
export function useUnlockPrice(eventId, { enabled = true } = {}) {
  const { locale } = useI18n()
  const quote = ref(null)

  async function load() {
    quote.value = null
    const id = toValue(eventId)
    if (!id || !toValue(enabled)) return
    try {
      quote.value = await PaymentsService.quote(id)
    } catch {
      quote.value = null
    }
  }
  watch(() => [toValue(eventId), toValue(enabled)], load, { immediate: true })

  const price = computed(() => (quote.value ? formatMoney(quote.value.amountCents, quote.value.currency, locale.value) : ''))
  const unlocked = computed(() => Boolean(quote.value?.unlocked))
  return { quote, price, unlocked, reload: load }
}
