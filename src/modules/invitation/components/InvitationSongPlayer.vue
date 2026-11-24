<script setup>
/**
 * Popup with Spotify's embedded player for one song. It is a bottom sheet on a phone and a centred card
 * from `sm` up. Rendered in place (no portal), like the gallery viewer, so it inherits the `--inv-*`
 * variables of the invitation (and of a template package) from `.inv-root`. The iframe exists only while
 * the popup is open: nothing is requested from Spotify before the guest taps "Listen".
 */
import { computed, nextTick } from 'vue'
import { DialogRoot, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui'
import { ExternalLink, X } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import { safeHttpsUrl } from '../composables/safeUrl'
import { spotifyEmbedSrc, spotifyOpenUrl, spotifyTrackId } from '../composables/spotifyTrack'
import InvitationPanel from './InvitationPanel.vue'

const props = defineProps({
  /** The song to play, or null when the popup is closed. */
  song: { type: Object, default: null },
  /** The button that opened it; it gets the focus back on close. */
  opener: { type: Object, default: null }
})
const emit = defineEmits(['close'])

const { tt } = useInvitationContext()

const trackId = computed(() => spotifyTrackId(props.song))
const open = computed(() => !!props.song && !!trackId.value)
const cover = computed(() => safeHttpsUrl(props.song?.thumbnailUrl))
const initial = computed(() => [...(props.song?.title || '?')][0].toUpperCase())

function onOpenChange(value) {
  if (!value) emit('close')
}

function restoreFocus(event) {
  event.preventDefault()
  const element = props.opener
  nextTick(() => {
    if (element?.isConnected) element.focus()
  })
}
</script>

<template>
  <DialogRoot :open="open" @update:open="onOpenChange">
    <DialogOverlay class="inv-player__overlay fixed inset-0 z-50 bg-inv-deep/70" />
    <DialogContent
      v-if="open"
      class="inv-player fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg focus:outline-none sm:inset-y-0 sm:flex sm:items-center sm:px-4"
      aria-modal="true"
      @close-auto-focus="restoreFocus"
    >
      <InvitationPanel class="inv-player__sheet w-full !rounded-b-none !p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] font-inv-body text-inv-ink sm:!rounded-b-[1.75rem] sm:!p-6">
        <DialogClose
          class="absolute right-0 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full text-inv-ink-soft transition-[background-color,color] duration-150 ease-out hover:bg-inv-ink/5 hover:text-inv-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
          :aria-label="tt('songs.player.close')"
        >
          <X class="h-5 w-5" aria-hidden="true" />
        </DialogClose>

        <div class="flex items-center gap-3 pr-10">
          <span class="inv-songs__cover flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-inv-primary/10 font-inv-heading text-2xl text-inv-primary">
            <img v-if="cover" :src="cover" alt="" width="64" height="64" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
            <template v-else>{{ initial }}</template>
          </span>
          <div class="min-w-0">
            <DialogTitle class="font-inv-heading text-xl leading-tight text-balance">{{ song.title }}</DialogTitle>
            <DialogDescription class="mt-0.5 truncate text-sm text-inv-ink-soft">{{ song.artist }}</DialogDescription>
          </div>
        </div>

        <iframe
          :src="spotifyEmbedSrc(trackId)"
          :title="tt('songs.player.frameTitle', { title: song.title })"
          height="152"
          allow="encrypted-media"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          class="mt-4 block h-[152px] w-full rounded-xl border-0"
          data-testid="song-player-frame"
        />

        <div class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p class="min-w-0 flex-1 text-xs text-inv-ink-soft text-pretty">{{ tt('songs.player.note') }}</p>
          <a
            :href="spotifyOpenUrl(trackId)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-inv-primary-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
            data-testid="song-player-open"
          >
            {{ tt('songs.player.openInSpotify') }}
            <ExternalLink class="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </InvitationPanel>
    </DialogContent>
  </DialogRoot>
</template>

<style scoped>
/* Enter only (opacity/transform, ease-out); the leave is instant so the iframe is gone at once. */
@keyframes inv-player-fade {
  from { opacity: 0; }
}
@keyframes inv-player-rise {
  from { opacity: 0; transform: translateY(2rem); }
}
@keyframes inv-player-pop {
  from { opacity: 0; transform: scale(0.97); }
}
.inv-player__overlay {
  animation: inv-player-fade 200ms ease-out;
}
.inv-player__sheet {
  animation: inv-player-rise 260ms cubic-bezier(0.23, 1, 0.32, 1);
}
@media (min-width: 40rem) {
  .inv-player__sheet {
    animation-name: inv-player-pop;
  }
}
@media (prefers-reduced-motion: reduce) {
  .inv-player__overlay,
  .inv-player__sheet {
    animation: none;
  }
}
</style>
