<template>
  <div
    class="h-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <template v-if="comment">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md"
            >
              {{ comment.authorInitials || getInitials(comment.authorName) }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ comment.authorName }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                  {{ authorIsOrganizer ? 'Organizer' : 'Guest' }}
                </span>
                <span class="text-xs text-gray-400">{{ formatDate(comment.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="p-2 hover:bg-gray-100 rounded-xl transition-all"
              :class="comment.is_pinned ? 'text-amber-500' : 'text-gray-400'"
              :title="comment.is_pinned ? 'Unpin' : 'Pin'"
              @click="$emit('toggle-pin', comment)"
            >
              <Pin :class="['w-5 h-5', comment.is_pinned ? 'fill-amber-500' : '']" />
            </button>
            <button
              class="p-2 hover:bg-gray-100 rounded-xl transition-all"
              :class="comment.is_favorite ? 'text-pink-500' : 'text-gray-400'"
              :title="comment.is_favorite ? 'Unfavorite' : 'Favorite'"
              @click="$emit('toggle-favorite', comment)"
            >
              <Star :class="['w-5 h-5', comment.is_favorite ? 'fill-pink-500' : '']" />
            </button>
          </div>
        </div>

        <!-- Status Control -->
        <div class="flex items-center gap-2 p-1 bg-gray-50 rounded-xl w-fit">
          <button
            v-for="status in ['visible', 'hidden']"
            :key="status"
            class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize"
            :class="[
              comment.status?.toLowerCase() === status
                ? getStatusActiveClass(status)
                : 'text-gray-500 hover:text-gray-700'
            ]"
            @click="$emit('update-status', { id: comment.id, status })"
          >
            {{ status }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-grow p-6 overflow-y-auto custom-scrollbar">
        <div class="bg-gray-50 rounded-2xl p-6 text-gray-800 leading-relaxed whitespace-pre-wrap">
          {{ comment.comment }}
        </div>

        <div class="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
          <div class="flex items-center gap-4">
            <button
              class="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
            >
              <ExternalLink class="w-4 h-4" />
              Open public page
            </button>
            <button
              class="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
            >
              <Copy class="w-4 h-4" />
              Copy guest link
            </button>
          </div>

          <button
            class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
            @click="$emit('delete', comment)"
          >
            <Trash2 class="w-4 h-4" />
            Delete Comment
          </button>
        </div>
      </div>
    </template>

    <!-- No Comment Selected State -->
    <div v-else class="flex-grow flex flex-col items-center justify-center p-12 text-center">
      <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
        <MessageSquare class="w-10 h-10 text-gray-200" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Select a comment</h3>
      <p class="text-gray-500 max-w-[280px]">
        Choose a comment from the list to view its full details and manage its visibility.
      </p>
    </div>
  </div>
</template>

<script setup>
import { Pin, Star, Trash2, ExternalLink, Copy, MessageSquare } from 'lucide-vue-next'
import { computed } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'

const props = defineProps({
  comment: {
    type: Object,
    default: null
  }
})

defineEmits(['update-status', 'toggle-pin', 'toggle-favorite', 'delete'])

const eventStore = useEventsStore()

const authorIsOrganizer = computed(() => {
  return eventStore.activeEvent?.organizer?.id === props.comment?.author?.id
})

const getInitials = name => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatDate = dateStr => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const getStatusActiveClass = status => {
  switch (status) {
    case 'visible':
      return 'bg-white text-green-600 shadow-sm'
    case 'pending':
      return 'bg-white text-amber-600 shadow-sm'
    case 'hidden':
      return 'bg-white text-red-600 shadow-sm'
    default:
      return 'bg-white text-purple-600 shadow-sm'
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-200 rounded-full;
}
</style>
