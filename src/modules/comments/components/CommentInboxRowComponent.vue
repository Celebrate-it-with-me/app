<template>
  <div
    class="group relative flex items-start gap-4 p-4 cursor-pointer transition-all border-b border-gray-100 last:border-0 hover:bg-gray-50 active:bg-gray-100"
    :class="[
      isSelected
        ? 'bg-purple-50/50 border-l-4 border-l-purple-500'
        : 'border-l-4 border-l-transparent',
      comment.is_pinned ? 'bg-amber-50/30' : ''
    ]"
    @click="$emit('select', comment.id)"
  >
    <!-- Avatar -->
    <div
      class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm"
    >
      {{ comment.authorInitials || getInitials(comment.authorName) }}
    </div>

    <!-- Content -->
    <div class="flex-grow min-w-0">
      <div class="flex items-center justify-between mb-0.5">
        <span class="font-bold text-gray-900 truncate mr-2">{{ comment.authorName }}</span>
        <span class="text-[10px] text-gray-400 whitespace-nowrap">
          {{ formatTime(comment.created_at) }}
        </span>
      </div>

      <p class="text-sm text-gray-600 line-clamp-1 mb-2">
        {{ comment.comment }}
      </p>

      <div class="flex items-center gap-2">
        <CBadge :variant="statusVariant">
          {{ statusLabel }}
        </CBadge>
        <Pin v-if="comment.is_pinned" class="w-3 h-3 text-amber-500 fill-amber-500" />
        <Star v-if="comment.is_favorite" class="w-3 h-3 text-pink-500 fill-pink-500" />
      </div>
    </div>

    <!-- Quick Actions (Hover) -->
    <div
      class="absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-gray-100"
    >
      <button
        class="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        :title="comment.is_pinned ? 'Unpin' : 'Pin'"
        @click.stop="$emit('toggle-pin', comment)"
      >
        <Pin
          :class="[
            'w-4 h-4',
            comment.is_pinned ? 'text-amber-500 fill-amber-500' : 'text-gray-400'
          ]"
        />
      </button>

      <button
        class="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        :title="comment.is_favorite ? 'Unfavorite' : 'Favorite'"
        @click.stop="$emit('toggle-favorite', comment)"
      >
        <Star
          :class="[
            'w-4 h-4',
            comment.is_favorite ? 'text-pink-500 fill-pink-500' : 'text-gray-400'
          ]"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
// All comments in code are in English, as requested.

import { computed } from 'vue'
import { Pin, Star } from 'lucide-vue-next'
import CBadge from '@/components/UI/badges/CBadge.vue'
import { useCommentFormatters } from '@/modules/comments/composables/useCommentFormatters'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'toggle-pin', 'toggle-favorite', 'more'])

const { getInitials, formatTime, getStatusVariant, getStatusLabel } = useCommentFormatters()

const statusVariant = computed(() => getStatusVariant(props.comment.status))
const statusLabel = computed(() => getStatusLabel(props.comment.status))
</script>
