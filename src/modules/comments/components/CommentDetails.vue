<script setup>
import { useI18n } from 'vue-i18n'
import { Pin, Star, Trash2 } from 'lucide-vue-next'
import { UiAvatar, UiBadge, UiButton } from '@/ui'
import { formatDateTime, statusKey, statusTone } from '../utils/comments'

const props = defineProps({
  comment: { type: Object, required: true },
  authorLabel: { type: String, default: '' }
})
const emit = defineEmits(['update-status', 'toggle-pin', 'toggle-favorite', 'delete'])
const { t, locale } = useI18n()

const STATUSES = ['visible', 'hidden']
const isCurrent = status => statusKey(props.comment.status) === status
</script>

<template>
  <div>
    <div class="flex items-start gap-3">
      <UiAvatar :name="comment.authorName" size="lg" class="shrink-0" />
      <div class="min-w-0 flex-1">
        <h3 class="font-heading text-xl text-ink-900">{{ comment.authorName }}</h3>
        <div class="mt-1 flex flex-wrap items-center gap-2">
          <UiBadge size="sm">{{ authorLabel }}</UiBadge>
          <UiBadge :tone="statusTone(comment.status)" size="sm" dot>{{ t(`app.comments.status.${statusKey(comment.status)}`) }}</UiBadge>
          <span class="text-sm text-ink-500">{{ formatDateTime(comment.created_at, locale) }}</span>
        </div>
      </div>
      <div class="flex shrink-0 gap-1">
        <UiButton
          variant="ghost"
          size="sm"
          icon
          :aria-pressed="comment.is_pinned"
          :aria-label="t(comment.is_pinned ? 'app.comments.unpin' : 'app.comments.pin')"
          @click="emit('toggle-pin', comment)"
        >
          <Pin class="h-5 w-5" :class="comment.is_pinned ? 'fill-gold-500 text-gold-700' : ''" aria-hidden="true" />
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          icon
          :aria-pressed="comment.is_favorite"
          :aria-label="t(comment.is_favorite ? 'app.comments.unfavorite' : 'app.comments.favorite')"
          @click="emit('toggle-favorite', comment)"
        >
          <Star class="h-5 w-5" :class="comment.is_favorite ? 'fill-rose-600 text-rose-600' : ''" aria-hidden="true" />
        </UiButton>
      </div>
    </div>

    <p class="mt-5 whitespace-pre-wrap break-words rounded-xl bg-cream-100 p-4 text-base leading-relaxed text-ink-900">{{ comment.comment }}</p>

    <div class="mt-5">
      <p class="mb-2 text-sm font-medium text-ink-700">{{ t('app.comments.visibility') }}</p>
      <div class="grid grid-cols-2 gap-2">
        <UiButton
          v-for="status in STATUSES"
          :key="status"
          :variant="isCurrent(status) ? 'primary' : 'secondary'"
          :aria-pressed="isCurrent(status)"
          @click="emit('update-status', { id: comment.id, status })"
        >
          {{ t(`app.comments.status.${status}`) }}
        </UiButton>
      </div>
    </div>

    <div class="mt-5 border-t border-line pt-4">
      <UiButton variant="danger" @click="emit('delete', comment)">
        <Trash2 class="h-4 w-4" aria-hidden="true" />
        {{ t('app.comments.delete') }}
      </UiButton>
    </div>
  </div>
</template>
