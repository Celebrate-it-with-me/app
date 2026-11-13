<script setup>
/**
 * Fixed notice at the top of the organizer shell during a support session: who is being viewed, how long is left and
 * the way out. Tells the layout its height (--imp-banner-h) so the sticky sidebar can sit below it.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ShieldAlert } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import { useImpersonationStore } from '../stores/useImpersonationStore'
import { formatCountdown, remainingSeconds } from '../utils/impersonation'
import { endSupportSession } from '../utils/endSession'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const imp = useImpersonationStore()

const root = ref(null)
const now = ref(Date.now())
const leaving = ref(false)
let timer = null
let observer = null

const seconds = computed(() => remainingSeconds(imp.expiresAt, now.value))
const low = computed(() => seconds.value <= 300)

const tick = () => {
  now.value = Date.now()
  if (seconds.value <= 0) endSupportSession(router, { expired: true })
}

const leave = async () => {
  leaving.value = true
  await endSupportSession(router)
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
  if (root.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--imp-banner-h', `${root.value?.offsetHeight ?? 0}px`)
    })
    observer.observe(root.value)
  }
})

onBeforeUnmount(() => {
  clearInterval(timer)
  observer?.disconnect()
  document.documentElement.style.removeProperty('--imp-banner-h')
})
</script>

<template>
  <div
    ref="root"
    role="region"
    :aria-label="t('impersonation.region')"
    class="border-b border-gold-500 bg-gold-100 text-gold-700"
  >
    <div class="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-6">
      <ShieldAlert class="hidden h-5 w-5 shrink-0 sm:block" aria-hidden="true" />
      <div class="min-w-0 flex-1 text-sm leading-snug">
        <p class="truncate font-semibold">
          {{ t('impersonation.viewingAs', { name: userStore.name || t('impersonation.thisUser') }) }}
        </p>
        <p class="truncate text-xs sm:text-sm">
          {{ t('impersonation.supportSession') }} ·
          <span :class="low ? 'font-semibold text-danger-700' : ''">
            {{ t('impersonation.endsIn') }}
            <span class="tabular-nums" role="timer" :aria-label="t('impersonation.endsInLabel', { time: formatCountdown(seconds) })">{{ formatCountdown(seconds) }}</span>
          </span>
        </p>
      </div>
      <UiButton size="sm" variant="secondary" :loading="leaving" @click="leave">{{ t('impersonation.exit') }}</UiButton>
    </div>
  </div>
</template>
