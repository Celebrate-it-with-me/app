<script setup>
/**
 * "Vestimenta": the style (`dressCodeType`), the indications and the reserved colours of `GET dress-code`. Each colour is
 * a swatch WITH its name next to it (the palette's translated name, or the hex as text when it is a custom colour), so
 * no colour is told by its swatch alone. Without a dress code: an empty state with the way to define it (owner decision).
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Shirt } from 'lucide-vue-next'
import { UiButton, UiCard, UiEmptyState, UiSkeleton } from '@/ui'
import DashboardBlock from './DashboardBlock.vue'
import { dressCodeSummary } from './dashboardLogic'

const props = defineProps({
  /** `GET dress-code` payload (null until it loads). */
  dressCode: { type: Object, default: null },
  /** loading | ready | error */
  status: { type: String, default: 'loading' },
  canEdit: { type: Boolean, default: false }
})
defineEmits(['retry'])

const { t, te } = useI18n()
const summary = computed(() => dressCodeSummary(props.dressCode))
const typeName = computed(() => {
  const type = summary.value.type
  const key = `app.dressCode.types.${type}.name`
  return type && te(key) ? t(key) : type
})
const colorName = color => (color.key ? t(`app.dressCode.palette.${color.key}`) : color.hex.toUpperCase())
const colorsLabel = computed(() => t('app.dashboard.dress.reservedLabel', { colors: summary.value.colors.map(colorName).join(', ') }))
</script>

<template>
  <UiCard as="section" :title="t('app.dashboard.dress.title')" heading-level="h2" data-testid="dashboard-dress">
    <template v-if="status === 'ready' && !summary.empty" #actions>
      <router-link
        to="/dashboard/dress-code"
        class="inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600"
      >{{ canEdit ? t('app.dashboard.dress.edit') : t('app.dashboard.dress.view') }}</router-link>
    </template>

    <DashboardBlock :status="status" :error-text="t('app.dashboard.dress.error')" @retry="$emit('retry')">
      <template #skeleton>
        <div class="flex flex-col gap-3" data-testid="dress-skeleton">
          <UiSkeleton width="6rem" height="1.25rem" />
          <UiSkeleton :lines="2" />
          <div class="flex gap-4">
            <UiSkeleton v-for="n in 2" :key="n" circle width="1.75rem" height="1.75rem" />
          </div>
        </div>
      </template>

      <UiEmptyState
        v-if="summary.empty"
        compact
        :title="t('app.dashboard.dress.emptyTitle')"
        :description="canEdit ? t('app.dashboard.dress.emptyText') : t('app.dashboard.dress.emptyViewer')"
        data-testid="dress-empty"
      >
        <template #icon><Shirt class="h-6 w-6" aria-hidden="true" /></template>
        <UiButton v-if="canEdit" to="/dashboard/dress-code">{{ t('app.dashboard.dress.emptyCta') }}</UiButton>
      </UiEmptyState>

      <div v-else class="flex flex-col gap-3">
        <p v-if="typeName" class="text-base font-semibold text-ink-900" data-testid="dress-type">{{ typeName }}</p>
        <p v-if="summary.description" class="text-sm leading-relaxed text-ink-700 break-words" data-testid="dress-description">{{ summary.description }}</p>
        <div v-if="summary.colors.length">
          <h3 class="font-body text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">{{ t('app.dashboard.dress.reserved') }}</h3>
          <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-2" :aria-label="colorsLabel" data-testid="dress-colors">
            <li v-for="color in summary.colors" :key="color.hex" class="flex min-h-7 items-center gap-2 text-sm text-ink-700" :data-hex="color.hex">
              <span class="h-7 w-7 shrink-0 rounded-full ring-1 ring-line-strong ring-inset" :style="{ backgroundColor: color.hex }" aria-hidden="true"></span>
              <span :class="color.key ? '' : 'font-mono text-xs'" data-testid="dress-color-name">{{ colorName(color) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardBlock>
  </UiCard>
</template>
