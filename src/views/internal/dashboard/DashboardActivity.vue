<script setup>
/**
 * "Actividad reciente": the latest entries of `GET dashboard-logs` (the API sends up to 10; the Inicio draws `max`), each
 * with the initials of who it is about, the sentence in the app's language and "hace…".
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { History } from 'lucide-vue-next'
import { UiAvatar, UiEmptyState, UiSkeleton } from '@/ui'
import DashboardBlock from './DashboardBlock.vue'
import DashboardCard from './DashboardCard.vue'
import { useMinWidth } from '@/composables/useMinWidth'
import { activitySentence, activityTime, activityWho, readableActivity } from './dashboardLogic'

const props = defineProps({
  /** `GET dashboard-logs` rows (null until they load). */
  activity: { type: Array, default: null },
  /** loading | ready | error */
  status: { type: String, default: 'loading' },
  max: { type: Number, default: 5 },
  /** "Now", for the relative times (tests pin it). */
  now: { type: Date, default: null }
})
defineEmits(['retry'])

const { t, locale } = useI18n()
// A phone shows the first 3 and a "Ver todo" that opens the rest in place (there is no full activity screen).
const PHONE_LIMIT = 3
const wide = useMinWidth(640)
const expanded = ref(false)
const all = computed(() => readableActivity(props.activity ?? []).slice(0, props.max))
const collapsible = computed(() => !wide.value && all.value.length > PHONE_LIMIT)
const items = computed(() =>
  (collapsible.value && !expanded.value ? all.value.slice(0, PHONE_LIMIT) : all.value)
    .map(item => ({ id: item.id, who: activityWho(item), text: activitySentence(item, t), when: activityTime(item, locale.value, props.now ?? new Date()), at: item.occurredAt ?? '' }))
)
</script>

<template>
  <DashboardCard :title="t('app.dashboard.feed.title')" data-testid="dashboard-activity">
    <DashboardBlock :status="status" :error-text="t('app.dashboard.feed.error')" @retry="$emit('retry')">
      <template #skeleton>
        <div class="flex flex-col gap-4" data-testid="activity-skeleton">
          <div v-for="n in 3" :key="n" class="flex gap-3">
            <UiSkeleton circle width="2rem" height="2rem" />
            <div class="flex-1"><UiSkeleton :lines="2" /></div>
          </div>
        </div>
      </template>

      <UiEmptyState v-if="!items.length" compact :title="t('app.dashboard.feed.emptyTitle')" :description="t('app.dashboard.feed.emptyText')" data-testid="activity-empty">
        <template #icon><History class="h-6 w-6" aria-hidden="true" /></template>
      </UiEmptyState>

      <ul v-else class="flex flex-col gap-3.5" data-testid="activity-list">
        <li v-for="item in items" :key="item.id" class="flex items-start gap-3" data-testid="activity-item">
          <span aria-hidden="true" class="flex shrink-0" data-testid="activity-initials">
            <UiAvatar v-if="item.who" :name="item.who" size="sm" />
            <span v-else class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-500"><History class="h-4 w-4" /></span>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm leading-[1.45] text-ink-900 break-words">{{ item.text }}</p>
            <p class="mt-0.5 text-xs text-ink-500"><time :datetime="item.at || undefined">{{ item.when }}</time></p>
          </div>
        </li>
      </ul>
      <button
        v-if="collapsible"
        type="button"
        class="mt-2 inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-rose-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
        :aria-expanded="expanded"
        data-testid="activity-toggle"
        @click="expanded = !expanded"
      >
        {{ t(expanded ? 'app.dashboard.feed.showLess' : 'app.dashboard.feed.viewAll') }}
      </button>
    </DashboardBlock>
  </DashboardCard>
</template>
