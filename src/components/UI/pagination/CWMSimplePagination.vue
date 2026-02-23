<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  totalItems: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Number,
    default: 1
  },
  perPageOptions: {
    type: Array,
    required: false,
    default: () => [5, 10, 20, 50, 100]
  }
})

const perPage = ref(props.perPageOptions[0])
const currentPage = ref(props.modelValue)

const totalPages = computed(() => {
  const pages = Math.ceil(props.totalItems / perPage.value)
  return Number.isFinite(pages) && pages > 0 ? pages : 1
})

watch(
  () => props.modelValue,
  newValue => {
    currentPage.value = newValue
  }
)

watch(currentPage, newValue => {
  emit('update:modelValue', newValue)
})

const changePage = page => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

/**
 * Smart pagination:
 * - Always shows: 1, last
 * - Shows window around current
 * - Adds ellipsis tokens
 */
const pagesToRender = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const windowSize = 1 // pages around current
  const left = Math.max(2, current - windowSize)
  const right = Math.min(total - 1, current + windowSize)

  const pages = [1]

  if (left > 2) pages.push('ellipsis-left')

  for (let p = left; p <= right; p++) pages.push(p)

  if (right < total - 1) pages.push('ellipsis-right')

  pages.push(total)

  return pages
})

const isFirst = computed(() => currentPage.value === 1)
const isLast = computed(() => currentPage.value === totalPages.value)
</script>

<template>
  <nav v-if="totalItems > 0" class="hn-pagination w-full max-w-full mt-6" aria-label="Pagination">
    <div class="hn-pagination-shell">
      <!-- Prev -->
      <button
        type="button"
        class="hn-nav-btn"
        :class="isFirst ? 'is-disabled' : ''"
        :disabled="isFirst"
        @click="changePage(currentPage - 1)"
      >
        <ChevronLeft class="w-5 h-5" />
        <span class="hidden sm:inline">Anterior</span>
      </button>

      <!-- Numbers -->
      <div class="hn-pages" role="list">
        <template v-for="p in pagesToRender" :key="String(p)">
          <span v-if="String(p).startsWith('ellipsis')" class="hn-ellipsis" aria-hidden="true">
            …
          </span>

          <button
            v-else
            type="button"
            class="hn-page-btn"
            :class="Number(p) === currentPage ? 'is-active' : ''"
            :aria-current="Number(p) === currentPage ? 'page' : undefined"
            @click="changePage(Number(p))"
          >
            {{ p }}
          </button>
        </template>
      </div>

      <!-- Next -->
      <button
        type="button"
        class="hn-nav-btn"
        :class="isLast ? 'is-disabled' : ''"
        :disabled="isLast"
        @click="changePage(currentPage + 1)"
      >
        <span class="hidden sm:inline">Siguiente</span>
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Container: never bleed into next section */
.hn-pagination {
  font-family: 'Montserrat', sans-serif;
}

/* Glass row */
.hn-pagination-shell {
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  padding: 0.75rem 0.9rem;

  background: rgba(17, 24, 39, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 14px;

  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.35),
    0 0 80px rgba(232, 93, 74, 0.06),
    0 0 60px rgba(212, 175, 55, 0.05);

  overflow: hidden;
}

/* Prev/Next buttons */
.hn-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  padding: 0.55rem 0.75rem;
  border-radius: 12px;

  border: 1px solid rgba(212, 175, 55, 0.16);
  background: rgba(11, 18, 32, 0.35);

  color: rgba(248, 241, 231, 0.92);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}

.hn-nav-btn:hover:not(.is-disabled) {
  transform: translateY(-1px);
  border-color: rgba(212, 175, 55, 0.28);
  background: rgba(11, 18, 32, 0.48);
  box-shadow: 0 0 28px rgba(212, 175, 55, 0.08);
}

.hn-nav-btn.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Pages: allow wrap + safe horizontal scroll on tiny widths */
.hn-pages {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;

  flex: 1 1 auto;
  min-width: 0;

  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.hn-pages::-webkit-scrollbar {
  display: none;
}

.hn-ellipsis {
  color: rgba(148, 163, 184, 0.8);
  font-size: 0.95rem;
  padding: 0 0.25rem;
}

/* Page buttons */
.hn-page-btn {
  flex: 0 0 auto;

  width: 34px;
  height: 34px;
  border-radius: 999px;

  border: 1px solid rgba(212, 175, 55, 0.14);
  background: rgba(11, 18, 32, 0.22);

  color: rgba(148, 163, 184, 0.95);
  font-size: 0.78rem;
  font-weight: 700;

  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.hn-page-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(212, 175, 55, 0.26);
  background: rgba(11, 18, 32, 0.35);
  color: rgba(248, 241, 231, 0.95);
}

.hn-page-btn.is-active {
  border-color: rgba(212, 175, 55, 0.42);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(232, 93, 74, 0.14) 100%);
  color: #f8f1e7;
  box-shadow: 0 0 22px rgba(212, 175, 55, 0.14);
}

/* Small screens: keep it compact */
@media (max-width: 420px) {
  .hn-pagination-shell {
    padding: 0.65rem 0.75rem;
    gap: 0.5rem;
  }
  .hn-page-btn {
    width: 32px;
    height: 32px;
  }
  .hn-nav-btn {
    padding: 0.5rem 0.6rem;
  }
}
</style>
