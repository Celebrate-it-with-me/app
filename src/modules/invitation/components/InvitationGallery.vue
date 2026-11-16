<script setup>
/**
 * Photo gallery: a grid (or a scroll-snap strip) of buttons that open an accessible viewer.
 * Nothing moves by itself: no autoplay, no auto-advance. Titles and descriptions are plain
 * text bindings, never HTML. Motion comes from the shared `animate-in`, which the global
 * reduced-motion rule switches off.
 */
import { computed, ref } from 'vue'
import { DialogRoot, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'

const props = defineProps({
  section: { type: Object, required: true },
  /** Overrides of the section settings, set by a template package block. */
  layout: { type: String, default: undefined },
  columns: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  captions: { type: Boolean, default: undefined }
})

const { tt } = useInvitationContext()

const photos = computed(() => (Array.isArray(props.section.data?.photos) ? props.section.data.photos : []).slice(0, props.max ?? Infinity))
const total = computed(() => photos.value.length)
const carousel = computed(() => (props.layout ?? props.section.settings?.layout) === 'carousel')
const showCaptions = computed(() => (props.captions ?? props.section.settings?.showCaptions) !== false)
const gridClass = computed(() => ({ 2: 'grid-cols-2 sm:grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' })[props.columns] ?? 'grid-cols-2 sm:grid-cols-3')

const open = ref(false)
const index = ref(0)
const current = computed(() => photos.value[index.value])

const params = position => ({ n: position + 1, total: total.value })
const altFor = (photo, position) => photo.title || photo.description || tt('gallery.photoOf', params(position))
const captionFor = photo => [photo.title, photo.year].filter(Boolean).join(' · ')

function show(position) {
  index.value = position
  open.value = true
}
const move = step => {
  const next = index.value + step
  if (next >= 0 && next < total.value) index.value = next
}

function onKeydown(event) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    move(1)
  }
}

const navButton =
  'absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-inv-surface/90 text-inv-ink shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary disabled:pointer-events-none disabled:opacity-30'
</script>

<template>
  <InvitationSection v-if="total" id="gallery" :title="section.title" :text="section.text">
    <ul
      v-if="!carousel"
:class="['inv-gallery grid gap-3', gridClass]"
      data-layout="grid"
    >
      <li v-for="(photo, position) in photos" :key="photo.id" class="min-w-0">
        <button
          type="button"
          class="inv-gallery__photo block aspect-square w-full overflow-hidden rounded-2xl bg-inv-surface-alt ring-1 ring-inv-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
          :aria-label="tt('gallery.open', params(position))"
          @click="show(position)"
        >
          <img
            :src="photo.url"
            :alt="altFor(photo, position)"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover"
          />
        </button>
        <p v-if="showCaptions && captionFor(photo)" class="mt-2 text-sm text-inv-ink-soft text-pretty">
          {{ captionFor(photo) }}
        </p>
      </li>
    </ul>

    <ul
      v-else
      class="inv-gallery -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-6 pb-2 focus-visible:outline-2 focus-visible:outline-inv-primary"
      data-layout="carousel"
      role="list"
      tabindex="0"
      :aria-label="tt('gallery.carousel')"
    >
      <li v-for="(photo, position) in photos" :key="photo.id" class="w-[72%] shrink-0 snap-center sm:w-64">
        <button
          type="button"
          class="inv-gallery__photo block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-inv-surface-alt ring-1 ring-inv-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
          :aria-label="tt('gallery.open', params(position))"
          @click="show(position)"
        >
          <img
            :src="photo.url"
            :alt="altFor(photo, position)"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover"
          />
        </button>
        <p v-if="showCaptions && captionFor(photo)" class="mt-2 text-sm text-inv-ink-soft text-pretty">
          {{ captionFor(photo) }}
        </p>
      </li>
    </ul>

    <!-- Viewer. Rendered in place (no portal) so it keeps the invitation theme variables. -->
    <DialogRoot v-model:open="open">
      <DialogOverlay class="animate-in fixed inset-0 z-50 bg-inv-deep/80" />
      <DialogContent
        v-if="current"
        class="animate-in fixed inset-0 z-50 flex flex-col items-center justify-center p-4 text-inv-surface focus:outline-none"
        @keydown="onKeydown"
      >
        <DialogTitle class="sr-only">{{ tt('gallery.viewer') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ tt('gallery.photoOf', params(index)) }}</DialogDescription>

        <DialogClose
          class="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-inv-surface/90 text-inv-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
          :aria-label="tt('gallery.close')"
        >
          <X class="h-5 w-5" aria-hidden="true" />
        </DialogClose>

        <figure class="flex max-h-full min-h-0 w-full max-w-4xl flex-col items-center gap-3">
          <img
            :key="current.id"
            :src="current.url"
            :alt="altFor(current, index)"
            decoding="async"
            class="min-h-0 max-w-full flex-1 rounded-xl object-contain"
            style="max-height: calc(100dvh - 9rem)"
          />
          <figcaption class="text-center text-pretty" aria-live="polite">
            <span v-if="showCaptions && captionFor(current)" class="block font-inv-heading text-lg">{{ captionFor(current) }}</span>
            <span v-if="showCaptions && current.description" class="block text-sm text-inv-surface/80">{{ current.description }}</span>
            <span class="mt-1 block text-sm text-inv-surface/80">{{ tt('gallery.photoOf', params(index)) }}</span>
          </figcaption>
        </figure>

        <template v-if="total > 1">
          <button
            type="button"
            :class="[navButton, 'left-3']"
            :disabled="index === 0"
            :aria-label="tt('gallery.previous')"
            @click="move(-1)"
          >
            <ChevronLeft class="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            :class="[navButton, 'right-3']"
            :disabled="index === total - 1"
            :aria-label="tt('gallery.next')"
            @click="move(1)"
          >
            <ChevronRight class="h-6 w-6" aria-hidden="true" />
          </button>
        </template>
      </DialogContent>
    </DialogRoot>
  </InvitationSection>
</template>
