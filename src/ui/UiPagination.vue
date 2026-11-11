<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cx } from './utils'

const props = defineProps({
  page: { type: Number, default: 1 },
  pages: { type: Number, default: 1 },
  prevLabel: { type: String, default: 'Anterior' },
  nextLabel: { type: String, default: 'Siguiente' }
})
const emit = defineEmits(['update:page'])

/** Up to 5 page numbers around the current one; the rest collapses into "…". */
const items = computed(() => {
  const { page, pages } = props
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1)
  const set = new Set([1, pages, page, page - 1, page + 1].filter(n => n >= 1 && n <= pages))
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
})

function go(n) {
  if (n >= 1 && n <= props.pages && n !== props.page) emit('update:page', n)
}

const btn =
  'flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:text-ink-300'
</script>

<template>
  <nav class="flex items-center justify-between gap-2" aria-label="Paginación">
    <button type="button" :class="cx(btn, 'gap-1 text-ink-700 hover:bg-cream-200')" :disabled="page <= 1" @click="go(page - 1)">
      <ChevronLeft class="h-4 w-4" aria-hidden="true" />
      <span class="hidden sm:inline">{{ prevLabel }}</span>
    </button>
    <div class="flex items-center gap-1">
      <template v-for="(item, i) in items" :key="i">
        <span v-if="item === '…'" class="px-1 text-ink-400">…</span>
        <button
          v-else
          type="button"
          :class="cx(btn, item === page ? 'bg-rose-600 text-white' : 'text-ink-700 hover:bg-cream-200')"
          :aria-current="item === page ? 'page' : undefined"
          @click="go(item)"
        >
          {{ item }}
        </button>
      </template>
    </div>
    <button type="button" :class="cx(btn, 'gap-1 text-ink-700 hover:bg-cream-200')" :disabled="page >= pages" @click="go(page + 1)">
      <span class="hidden sm:inline">{{ nextLabel }}</span>
      <ChevronRight class="h-4 w-4" aria-hidden="true" />
    </button>
  </nav>
</template>
