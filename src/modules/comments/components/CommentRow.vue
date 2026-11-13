<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pin, Star } from 'lucide-vue-next'
import { UiAvatar, UiBadge, UiButton, UiDropdown } from '@/ui'
import { formatTime, statusKey, statusTone } from '../utils/comments'

const props = defineProps({
  comment: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'toggle-pin', 'toggle-favorite'])
const { t, locale } = useI18n()

const items = computed(() => [
  {
    label: t(props.comment.is_pinned ? 'app.comments.unpin' : 'app.comments.pin'),
    icon: Pin,
    onSelect: () => emit('toggle-pin', props.comment)
  },
  {
    label: t(props.comment.is_favorite ? 'app.comments.unfavorite' : 'app.comments.favorite'),
    icon: Star,
    onSelect: () => emit('toggle-favorite', props.comment)
  }
])
</script>

<template>
  <div class="flex items-start gap-1 border-b border-line last:border-0" :class="selected ? 'bg-rose-50' : ''">
    <button
      type="button"
      class="flex min-h-11 min-w-0 flex-1 items-start gap-3 p-4 text-left focus-visible:outline-2 focus-visible:outline-rose-600"
      :aria-label="t('app.comments.open', { name: comment.authorName })"
      :aria-current="selected ? 'true' : undefined"
      @click="emit('select', comment.id)"
    >
      <UiAvatar :name="comment.authorName" class="shrink-0" />
      <span class="min-w-0 flex-1">
        <span class="flex items-center justify-between gap-2">
          <span class="truncate font-medium text-ink-900">{{ comment.authorName }}</span>
          <span class="shrink-0 text-xs text-ink-500">{{ formatTime(comment.created_at, locale) }}</span>
        </span>
        <span class="mt-0.5 line-clamp-2 block text-sm text-ink-700">{{ comment.comment }}</span>
        <span class="mt-2 flex items-center gap-2">
          <UiBadge :tone="statusTone(comment.status)" size="sm" dot>{{ t(`app.comments.status.${statusKey(comment.status)}`) }}</UiBadge>
          <Pin v-if="comment.is_pinned" class="h-4 w-4 text-gold-700" :aria-label="t('app.comments.pinned')" role="img" />
          <Star v-if="comment.is_favorite" class="h-4 w-4 text-rose-600" :aria-label="t('app.comments.favorited')" role="img" />
        </span>
      </span>
    </button>
    <UiDropdown :items="items">
      <template #trigger>
        <UiButton variant="ghost" size="sm" icon class="mr-1 mt-3" :aria-label="t('app.comments.actions', { name: comment.authorName })">
          <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
        </UiButton>
      </template>
    </UiDropdown>
  </div>
</template>
