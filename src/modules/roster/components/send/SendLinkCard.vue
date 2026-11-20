<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Heart } from 'lucide-vue-next'
import { UiSkeleton } from '@/ui'
import { linkHost } from '../../utils/sendWizard'

/**
 * "Así se verá el enlace en WhatsApp" (contract 4b.7): the card WhatsApp draws for the guest's link, from the
 * `linkPreview` of `POST whatsapp/preview` (same source as `/og/...`, so it is not a copy). Nothing is drawn when there
 * is no `linkPreview` (no guests yet, role without access, request failed); the image falls back to the brand mark.
 */
const props = defineProps({
  /** `{ title, description, image, alt, imageWidth, imageHeight }` or null. */
  linkPreview: { type: Object, default: null },
  /** Invitation link of the example guest: only its host is shown, as WhatsApp does. */
  link: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})
const { t } = useI18n()

const broken = ref(false)
watch(() => props.linkPreview?.image, () => (broken.value = false))

const showImage = computed(() => !!props.linkPreview?.image && !broken.value)
// Sizes may be missing: WhatsApp crops to the 1.91:1 of the 1200x630 derivative.
const ratio = computed(() => {
  const { imageWidth: w, imageHeight: h } = props.linkPreview ?? {}
  return w > 0 && h > 0 ? `${w} / ${h}` : '1200 / 630'
})
const alt = computed(() => props.linkPreview?.alt || props.linkPreview?.title || '')
const host = computed(() => linkHost(props.link))
</script>

<template>
  <section v-if="loading || linkPreview" class="mt-4" :aria-label="t('app.whatsapp.wizard.linkCard.label')" :aria-busy="loading" data-testid="link-card">
    <p class="text-xs font-medium uppercase tracking-wide text-ink-500">{{ t('app.whatsapp.wizard.linkCard.label') }}</p>

    <div v-if="loading" class="mt-2 overflow-hidden rounded-xl border border-line bg-white" data-testid="link-card-loading" aria-hidden="true">
      <div class="aspect-[1200/630] w-full animate-pulse bg-cream-300 motion-reduce:animate-none" />
      <div class="space-y-2 p-3">
        <UiSkeleton height="1rem" width="80%" />
        <UiSkeleton height="0.75rem" width="60%" />
      </div>
    </div>

    <div v-else class="mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-soft" data-testid="link-card-ready">
      <img v-if="showImage" :src="linkPreview.image" :alt="alt" :style="{ aspectRatio: ratio }" class="block w-full bg-cream-200 object-cover" loading="lazy" data-testid="link-card-image" @error="broken = true" />
      <div v-else class="flex w-full flex-col items-center justify-center gap-1 bg-cream-200 text-rose-600" :style="{ aspectRatio: ratio }" role="img" :aria-label="t('app.whatsapp.wizard.linkCard.fallbackAlt')" data-testid="link-card-fallback">
        <Heart class="h-8 w-8" aria-hidden="true" />
        <span class="font-heading text-lg text-ink-900">Quinvite</span>
      </div>
      <div class="border-t border-line bg-cream-50 px-3 py-2">
        <p v-if="host" class="truncate text-xs text-ink-500" data-testid="link-card-host">{{ host }}</p>
        <p class="break-words text-sm font-semibold leading-snug text-ink-900" data-testid="link-card-title">{{ linkPreview.title }}</p>
        <p v-if="linkPreview.description" class="mt-0.5 break-words text-sm leading-snug text-ink-500" data-testid="link-card-description">{{ linkPreview.description }}</p>
      </div>
    </div>

    <p v-if="!loading" class="mt-1.5 text-xs text-ink-500">{{ t('app.whatsapp.wizard.linkCard.note') }}</p>
  </section>
</template>
