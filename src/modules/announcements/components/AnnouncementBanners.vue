<script setup>
/**
 * Announcements from the team, under the shell header: one banner per announcement (max 3), styled by level with an
 * icon (never color alone). Text is plain text with line breaks, never HTML. The button goes through `safeCta`.
 */
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { Info, Sparkles, TriangleAlert, X } from 'lucide-vue-next'
import { UiButton, useToast } from '@/ui'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'
import { useAnnouncementsStore } from '../stores/useAnnouncementsStore'
import { safeCta } from '../utils/announcements'

const { t, locale } = useI18n()
const { toast } = useToast()
const store = useAnnouncementsStore()
const impersonation = useImpersonationStore()
const { items } = storeToRefs(store)

const LEVELS = {
  info: { icon: Info, box: 'border-line-strong bg-cream-50 text-ink-700', iconBox: 'bg-cream-200 text-ink-700', ring: 'focus-visible:outline-ink-700', hover: 'hover:bg-cream-200' },
  news: { icon: Sparkles, box: 'border-rose-200 bg-rose-50 text-rose-900', iconBox: 'bg-rose-100 text-rose-700', ring: 'focus-visible:outline-rose-700', hover: 'hover:bg-rose-100' },
  warning: { icon: TriangleAlert, box: 'border-warning-500/50 bg-warning-50 text-warning-700', iconBox: 'bg-warning-500/15 text-warning-700', ring: 'focus-visible:outline-warning-700', hover: 'hover:bg-warning-500/15' }
}

const banners = computed(() =>
  items.value.map(a => ({ ...a, style: LEVELS[a.level] ?? LEVELS.info, cta: a.ctaLabel ? safeCta(a.ctaUrl) : null }))
)

// A support session sees what the person sees but cannot dismiss anything in her name.
const canDismiss = a => a.dismissible && !impersonation.active

const refresh = (force = false) => store.load({ lang: locale.value, force })
const onVisible = () => {
  if (document.visibilityState === 'visible') refresh()
}

async function dismiss(a) {
  const ok = await store.dismiss(a.id)
  if (!ok) toast({ title: t('announcements.dismissFailed'), tone: 'warning' })
}

onMounted(() => {
  refresh()
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisible))
</script>

<template>
  <TransitionGroup
    tag="section"
    name="ann"
    :class="['flex flex-col gap-2', banners.length && 'px-3 py-2 sm:px-4 lg:px-6']"
    :aria-label="t('announcements.region')"
    data-testid="announcements"
  >
    <article
      v-for="a in banners"
      :key="a.id"
      :data-level="a.level"
      data-testid="announcement"
      :class="['flex w-full items-start gap-3 rounded-xl border p-3 text-sm', a.style.box]"
    >
      <span :class="['mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', a.style.iconBox]">
        <component :is="a.style.icon" class="h-4 w-4" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <h2 class="break-words font-semibold leading-snug"><span class="sr-only">{{ t(`announcements.level.${a.level}`) }}: </span>{{ a.title }}</h2>
        <p class="mt-0.5 whitespace-pre-line break-words leading-relaxed" data-testid="announcement-body">{{ a.body }}</p>
        <div v-if="a.cta" class="mt-2">
          <UiButton v-if="a.cta.kind === 'internal'" size="sm" variant="secondary" :to="a.cta.href">{{ a.ctaLabel }}</UiButton>
          <a
            v-else
            :href="a.cta.href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-9 items-center rounded-lg border border-line-strong bg-cream-50 px-3 text-sm font-semibold text-ink-900 hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-700"
          >{{ a.ctaLabel }}<span class="sr-only"> {{ t('announcements.opensNewTab') }}</span></a>
        </div>
      </div>
      <button
        v-if="canDismiss(a)"
        type="button"
        :class="['-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2', a.style.hover, a.style.ring]"
        :aria-label="t('announcements.dismiss', { title: a.title })"
        @click="dismiss(a)"
      >
        <X class="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  </TransitionGroup>
</template>

<style scoped>
.ann-enter-active,
.ann-leave-active {
  transition: opacity 200ms ease-out, translate 200ms ease-out;
}
.ann-enter-from,
.ann-leave-to {
  opacity: 0;
  translate: 0 -6px;
}
@media (prefers-reduced-motion: reduce) {
  .ann-enter-active,
  .ann-leave-active {
    transition: none;
  }
}
</style>
