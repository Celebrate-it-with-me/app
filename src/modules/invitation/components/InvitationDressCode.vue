<script setup>
import { computed, onMounted, ref } from 'vue'
import { Shirt } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import { colorLabel, swatchFor } from '../composables/colorNames'
import { bankUrl } from '@/modules/dress-code/utils/dressCodeForm'
import { isHex } from '../composables/useInvitationTheme'
import InvitationSection from './InvitationSection.vue'

const props = defineProps({
  section: { type: Object, required: true },
  /** swatches (colour circles, default) | plain (names only) */
  variant: { type: String, default: 'swatches' }
})

const { invitation, tt, locale } = useInvitationContext()

const data = computed(() => props.section.data)
/** Same words as the organizer's setup, in the invitation language. */
const typeLabel = computed(() => tt(`dressCode.types.${data.value.type}`))
const reservedLabel = computed(() =>
  tt(invitation.value.event.typeSlug === 'wedding' ? 'dressCode.reservedWedding' : 'dressCode.reservedQuince')
)
/** The type is already the headline ("Formal"): a description that opens by restating it ("Vestimenta formal.") loses that sentence. */
const escapeRe = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const description = computed(() => {
  const text = (data.value.description ?? '').trim()
  if (!text) return ''
  const restated = new RegExp(`^(?:vestimenta|etiqueta|dress code|attire)?\\s*${escapeRe(typeLabel.value)}\\s*(?:[.:;!-]\\s*|$)`, 'iu')
  return text.replace(restated, '').trim()
})
// Every color gets a visible name; a hex code is named by its nearest known color, or shown as the code when none is close.
const swatches = list =>
  (list ?? []).map(value => {
    const swatch = swatchFor(value)
    const code = isHex(String(value).trim())
    return { key: String(value), swatch, label: colorLabel(value, locale.value) ?? String(value).trim().toUpperCase(), isCode: code && !colorLabel(value, locale.value) }
  })
const palettes = computed(() =>
  [
    { id: 'reserved', label: reservedLabel.value, avoid: true, colors: swatches(data.value.reservedColors) },
    { id: 'suggested', label: tt('dressCode.suggested'), avoid: false, colors: swatches(data.value.suggestedColors) }
  ].filter(palette => palette.colors.length)
)
/** Own uploads come with a URL; photo bank picks are served from the app. */
const images = computed(() =>
  (data.value.images ?? [])
    .map(image => ({ ...image, src: image.source === 'bank' ? bankUrl(manifest.value, image.bankKey) : image.url }))
    .filter(image => image.src)
)
const manifest = ref({})
onMounted(async () => {
  if (!(data.value.images ?? []).some(image => image.source === 'bank')) return
  try {
    manifest.value = await (await fetch('/dress-code-bank/manifest.json')).json()
  } catch {
    manifest.value = {}
  }
})
</script>

<template>
  <InvitationSection id="dress-code" :title="section.title" :text="section.text">
    <div class="inv-dresscode flex flex-col items-center" :data-variant="variant">
      <span
        class="inv-badge flex h-14 w-14 items-center justify-center rounded-full bg-inv-primary/10 text-inv-primary ring-1 ring-inv-accent/50"
      >
        <Shirt class="h-6 w-6" aria-hidden="true" />
      </span>
      <p class="mt-4 font-inv-script text-5xl text-inv-primary-ink sm:text-6xl">{{ typeLabel }}</p>
      <p v-if="description" class="mx-auto mt-4 max-w-prose text-lg text-inv-ink-soft text-pretty">
        {{ description }}
      </p>
    </div>

    <div v-for="palette in palettes" :key="palette.id" class="inv-dresscode__palette mt-10">
      <p class="text-sm font-medium text-inv-ink-soft">{{ palette.label }}</p>
      <ul class="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-5">
        <li v-for="color in palette.colors" :key="color.key" class="inv-dresscode__color flex w-24 flex-col items-center gap-2 text-center">
          <span v-if="color.swatch && variant !== 'plain'" class="relative flex h-14 w-14 items-center justify-center">
            <span
              class="h-14 w-14 rounded-full shadow-soft ring-1 ring-inv-ink/15 ring-offset-2 ring-offset-inv-surface"
              :style="{ backgroundColor: color.swatch }"
              aria-hidden="true"
            />
            <span v-if="palette.avoid" class="absolute h-0.5 w-[4.25rem] -rotate-45 rounded-full bg-inv-ink ring-1 ring-inv-surface" aria-hidden="true" />
          </span>
          <span :class="['text-sm leading-tight text-inv-ink-soft text-balance', color.isCode && 'font-mono text-xs']">{{ color.label }}</span>
          <span v-if="palette.avoid" class="inv-dresscode__avoid rounded-full bg-inv-ink/10 px-2 py-0.5 text-xs font-medium text-inv-ink">{{ tt('dressCode.avoid') }}</span>
        </li>
      </ul>
    </div>

    <ul v-if="images.length" class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <li v-for="(image, index) in images" :key="index" class="aspect-[3/4] overflow-hidden rounded-xl bg-inv-primary/10">
        <img :src="image.src" alt="" class="h-full w-full object-cover" loading="lazy" />
      </li>
    </ul>
  </InvitationSection>
</template>
