<script setup>
/**
 * The invitation in miniature inside a phone frame. With an image (the template's preview) it shows that; without one
 * (e.g. the Classic template) it draws a calm stationery card from the brand tokens instead of an empty box.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  /** Preview image URL of the active template; empty for the fallback card. */
  image: { type: String, default: '' },
  name: { type: String, default: '' },
  /** Already formatted date line for the fallback card. */
  dateLabel: { type: String, default: '' }
})

const { t } = useI18n()
const failed = ref(false)
watch(() => props.image, () => (failed.value = false))
const showImage = computed(() => !!props.image && !failed.value)
</script>

<template>
  <div
    class="relative aspect-[9/18.5] w-36 rounded-[2rem] bg-ink-900 p-1.5 shadow-pop sm:w-48 sm:rounded-[2.5rem] sm:p-2"
    data-testid="hero-phone"
    :data-fallback="showImage ? undefined : 'true'"
  >
    <span class="absolute left-1/2 top-2.5 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-ink-700 sm:top-3.5 sm:h-2 sm:w-16" aria-hidden="true"></span>
    <div class="h-full w-full overflow-hidden rounded-[1.5rem] bg-cream-100 sm:rounded-[2rem]">
      <img
        v-if="showImage"
        :src="image"
        :alt="t('app.dashboard.hero.thumbAlt', { name })"
        class="h-full w-full object-cover object-top"
        data-testid="hero-phone-image"
        @error="failed = true"
      />
      <div
        v-else
        class="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-cream-50 via-cream-100 to-rose-100 px-4 text-center"
        data-testid="hero-phone-fallback"
      >
        <span class="h-px w-10 bg-gold-500" aria-hidden="true"></span>
        <p class="font-heading text-lg leading-tight text-ink-900 text-balance sm:text-2xl">{{ name }}</p>
        <p v-if="dateLabel" class="text-xs text-ink-600 first-letter:uppercase sm:text-sm">{{ dateLabel }}</p>
        <span class="h-px w-10 bg-gold-500" aria-hidden="true"></span>
      </div>
    </div>
  </div>
</template>
