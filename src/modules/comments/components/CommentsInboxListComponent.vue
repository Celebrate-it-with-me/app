<template>
  <div
    class="h-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div
      v-if="comments.length > 0"
      class="flex-grow overflow-y-auto custom-scrollbar"
      @scroll="handleScroll"
    >
      <CommentInboxRowComponent
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :is-selected="selectedId === comment.id"
        @select="$emit('select', $event)"
        @toggle-pin="$emit('toggle-pin', $event)"
        @toggle-favorite="$emit('toggle-favorite', $event)"
        @more="$emit('more', $event)"
      />

      <div v-if="loadingMore" class="p-4 flex justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
      <div v-else ref="loadMoreTrigger" class="h-4 w-full"></div>
    </div>

    <div v-else class="flex-grow flex flex-col items-center justify-center p-8 text-center">
      <SearchX class="w-12 h-12 text-gray-300 mb-4" />
      <h4 class="text-lg font-semibold text-gray-900 mb-1">No comments found</h4>
      <p class="text-sm text-gray-500 max-w-[200px]">
        Try adjusting your search or filters to find what you're looking for.
      </p>
    </div>
  </div>
</template>

<script setup>
import { SearchX } from 'lucide-vue-next'
import CommentInboxRowComponent from '@/modules/comments/components/CommentInboxRowComponent.vue'

const props = defineProps({
  comments: {
    type: Array,
    required: true
  },
  selectedId: {
    type: [String, Number],
    required: false,
    default: null
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'toggle-pin', 'toggle-favorite', 'more', 'load-more'])

const handleScroll = event => {
  const { scrollTop, scrollHeight, clientHeight } = event.target
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    if (!props.loadingMore && props.hasMore) {
      emit('load-more')
    }
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-300;
}
</style>
