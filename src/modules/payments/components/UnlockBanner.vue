<script setup>
/**
 * The one invitation to unlock everything, at the top of a screen that has locked things (ORG-005): a single button
 * with the price the API quotes ("Desbloquea todo por $79 · pago único"). The locked rows below only show a padlock and a name.
 * Hidden for anyone who cannot pay (only the owner can) and once the event is unlocked.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock } from 'lucide-vue-next'
import { useCanUnlock } from '@/composables/useCanUnlock'
import { useUnlockPrice } from '../composables/useUnlockPrice'

const props = defineProps({
  eventId: { type: [Number, String], default: null }
})
const emit = defineEmits(['unlock'])
const { t } = useI18n()
const { canUnlock } = useCanUnlock()
const { price, unlocked } = useUnlockPrice(() => props.eventId, { enabled: canUnlock })

const label = computed(() => (price.value ? t('unlockBanner.withPrice', { price: price.value }) : t('unlockBanner.noPrice')))
</script>

<template>
  <button
    v-if="canUnlock && !unlocked"
    type="button"
    class="flex min-h-11 w-full items-center gap-3 rounded-xl bg-gold-100 px-4 py-3 text-left text-base font-semibold text-ink-900 transition-colors hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-rose-600"
    data-testid="unlock-banner"
    @click="emit('unlock')"
  >
    <Lock class="h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
    <span class="min-w-0 flex-1">{{ label }}</span>
  </button>
</template>
