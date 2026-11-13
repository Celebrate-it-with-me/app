<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TriangleAlert } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import { planLimitMessage } from '@/utils/planLimit'

const props = defineProps({
  /** `{ limit, total, excess }`: how far over the plan's guest limit the list is. */
  info: { type: Object, required: true },
  /** banner: the guests page, a title and the "keep building" text. publish: next to the publish button. add: a published event cannot take more guests. */
  variant: { type: String, default: 'banner' },
  /** Also offer a link to the guest list (not needed on the guests page itself). */
  withListLink: { type: Boolean, default: false }
})

const { t } = useI18n()

const text = computed(() =>
  props.variant === 'banner'
    ? t(
        'limits.guests.banner',
        { ...props.info, remove: t('limits.guests.removeCount', { n: props.info.excess }, props.info.excess) }
      )
    : planLimitMessage(t, props.info, props.variant === 'add' ? 'add' : 'publish')
)
</script>

<template>
  <section class="rounded-xl border border-gold-300 bg-gold-50 p-4 sm:p-5" role="status">
    <div class="flex items-start gap-3">
      <TriangleAlert class="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
      <div class="min-w-0">
        <h2 v-if="variant === 'banner'" class="font-heading text-lg text-ink-900">{{ t('limits.guests.bannerTitle') }}</h2>
        <p class="text-base text-ink-700" :class="variant === 'banner' && 'mt-1'">{{ text }}</p>
        <div class="mt-3 flex flex-col gap-2 sm:flex-row">
          <UiButton size="sm" to="/dashboard/unlock/guests-limit">{{ t('limits.guests.unlock') }}</UiButton>
          <UiButton v-if="withListLink" size="sm" variant="secondary" to="/dashboard/guests">{{ t('limits.guests.seeGuests') }}</UiButton>
        </div>
      </div>
    </div>
  </section>
</template>
