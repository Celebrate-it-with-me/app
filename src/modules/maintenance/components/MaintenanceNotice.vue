<script setup>
/**
 * Everything the person sees about maintenance, in three shapes:
 * - banner: the API says maintenance is on; she can keep working, so it is a dismissible, non-blocking notice;
 * - overlay: a real request got a 503 `maintenance`; full-screen, retries by itself and goes away when the API is back;
 * - guest notice: same 503 on the public invitation; a small notice that never hides what the guest already sees.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { Construction, Wrench, X } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import { useSystemStatusStore } from '../stores/useSystemStatusStore'
import { formatEstimatedEnd } from '../utils/maintenance'

const { t, locale } = useI18n()
const store = useSystemStatusStore()
const { message, estimatedEnd, checking, showBanner, showOverlay, showGuestNotice } = storeToRefs(store)

const text = computed(() => message.value || t('maintenance.defaultMessage'))
const endLabel = computed(() => formatEstimatedEnd(estimatedEnd.value, locale.value))

const overlay = ref(null)
const retryButton = ref(null)
let returnFocusTo = null

// The full-screen notice takes the focus when it opens and hands it back when it closes.
watch(showOverlay, async open => {
  if (open) {
    returnFocusTo = document.activeElement
    await nextTick()
    retryButton.value?.$el?.focus()
  } else if (returnFocusTo?.isConnected) {
    returnFocusTo.focus?.()
    returnFocusTo = null
  }
})

/** Keep Tab inside the overlay: the page behind it is not usable. */
function trapFocus(event) {
  if (event.key !== 'Tab' || !overlay.value) return
  const items = overlay.value.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => store.start())
onBeforeUnmount(() => store.stop())
</script>

<template>
  <div
    v-if="showBanner && !showOverlay && !showGuestNotice"
    role="status"
    data-testid="maintenance-banner"
    class="flex items-start gap-3 border-b border-gold-300 bg-gold-100 px-4 py-2.5 text-sm text-gold-700"
  >
    <Wrench class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
    <p class="min-w-0 flex-1 break-words">
      <span class="font-semibold">{{ t('maintenance.bannerTitle') }}</span>
      {{ text }}
      <span v-if="endLabel" class="block sm:inline">{{ t('maintenance.estimatedEnd', { when: endLabel }) }}</span>
    </p>
    <button
      type="button"
      class="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-gold-300/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-700"
      :aria-label="t('maintenance.dismiss')"
      @click="store.dismiss()"
    >
      <X class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>

  <div
    v-if="showGuestNotice"
    role="alert"
    data-testid="maintenance-guest-notice"
    class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gold-300 bg-gold-100 px-4 py-2.5 text-sm text-gold-700"
  >
    <Wrench class="h-4 w-4 shrink-0" aria-hidden="true" />
    <p class="min-w-0 flex-1 break-words">
      {{ text }}
      <span v-if="endLabel">{{ t('maintenance.estimatedEnd', { when: endLabel }) }}</span>
    </p>
    <UiButton size="sm" variant="secondary" :loading="checking" @click="store.retryNow()">{{ t('maintenance.retry') }}</UiButton>
  </div>

  <Teleport to="body">
    <div
      v-if="showOverlay"
      ref="overlay"
      role="alert"
      aria-labelledby="maintenance-title"
      aria-describedby="maintenance-text"
      data-testid="maintenance-overlay"
      class="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-cream-100 px-4 py-8"
      @keydown="trapFocus"
    >
      <div class="w-full max-w-md text-center">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 text-gold-700">
          <Construction class="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 id="maintenance-title" class="mt-6 font-heading text-3xl font-semibold text-ink-900">{{ t('maintenance.title') }}</h1>
        <p id="maintenance-text" class="mt-3 break-words text-base text-ink-700">{{ text }}</p>
        <p v-if="endLabel" class="mt-3 text-sm font-semibold text-wine-800">{{ t('maintenance.estimatedEnd', { when: endLabel }) }}</p>
        <p class="mt-3 text-sm text-ink-500">{{ t('maintenance.reassure') }}</p>
        <UiButton ref="retryButton" class="mt-8" block :loading="checking" @click="store.retryNow()">
          {{ t('maintenance.retry') }}
        </UiButton>
        <p class="mt-3 text-xs text-ink-500" aria-live="polite">{{ t('maintenance.autoRetry') }}</p>
      </div>
    </div>
  </Teleport>
</template>
