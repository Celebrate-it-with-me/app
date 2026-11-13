<script setup>
import { computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Lock, Check } from 'lucide-vue-next'
import { UiButton, UiCard } from '@/ui'
import PurchasePanel from '@/modules/payments/components/PurchasePanel.vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { MODULE_VIEWS } from '@/components/internal/shell/navModules'

const { t, te, tm, rt } = useI18n()
const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()

const key = computed(() => String(route.params.module ?? ''))
// Besides locked modules, this screen also explains going over the plan's guest limit.
const isFull = computed(() => key.value === 'full')
const isGuestsLimit = computed(() => key.value === 'guests-limit' || isFull.value)
const eventId = computed(() => eventsStore.activeEvent?.id)
const view = computed(() => (isGuestsLimit.value ? null : (MODULE_VIEWS[key.value] ?? null)))
const state = computed(() =>
  isGuestsLimit.value ? 'locked' : (eventsStore.activeEvent?.modules?.find(m => m.key === key.value)?.state ?? null)
)

// Nothing to unlock here: send the person where they were going, or home if the module is not available.
watchEffect(() => {
  if (isGuestsLimit.value) return
  if (!view.value || !state.value) router.replace('/dashboard')
  else if (state.value === 'active' && view.value.to) router.replace(view.value.to)
})

const moduleName = computed(() => (isGuestsLimit.value ? t('app.nav.guests') : view.value ? t(view.value.labelKey) : ''))
const lead = computed(() => (isFull.value ? t('unlock.full.lead') : isGuestsLimit.value ? t('unlock.guestsLimit.lead') : t('unlock.lead', { module: moduleName.value })))
const benefit = computed(() => {
  if (isFull.value) return t('unlock.full.benefit')
  if (isGuestsLimit.value) return t('unlock.guestsLimit.benefit')
  return te(`unlock.modules.${key.value}`) ? t(`unlock.modules.${key.value}`) : t('unlock.generic')
})
const included = computed(() => tm('pricing.full.items').map(item => rt(item)))
</script>

<template>
  <div v-if="state === 'locked'" class="mx-auto w-full max-w-xl">
    <UiCard padding="lg">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100 text-gold-700">
        <Lock class="h-5 w-5" aria-hidden="true" />
      </div>

      <h1 class="mt-4 font-heading text-3xl text-ink-900 text-balance">{{ lead }}</h1>
      <p class="mt-2 text-base text-ink-600">{{ benefit }}</p>

      <div class="mt-6 border-t border-line pt-5">
        <p class="text-sm font-semibold text-ink-700">{{ t('unlock.includes') }}</p>
        <ul class="mt-3 flex flex-col gap-2">
          <li v-for="item in included" :key="item" class="flex items-start gap-2.5 text-base text-ink-700">
            <Check class="mt-1 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <div class="mt-6 rounded-lg bg-cream-100 p-4">
        <PurchasePanel v-if="eventId" :event-id="eventId" />
        <UiButton class="mt-3" variant="ghost" to="/dashboard">{{ t('unlock.back') }}</UiButton>
      </div>
    </UiCard>
  </div>
</template>
