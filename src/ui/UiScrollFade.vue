<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * A horizontal scroller without the scrollbar. A soft fade at the edge says "there is more this way", and shows
 * only while there is. Put one row of content inside (tabs, chips); it keeps its own width (`w-max min-w-full`).
 */
const scroller = ref(null)
const canLeft = ref(false)
const canRight = ref(false)

function update() {
  const el = scroller.value
  if (!el) return
  canLeft.value = el.scrollLeft > 1
  canRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

let observer = null
onMounted(() => {
  update()
  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(update)
  observer.observe(scroller.value)
  if (scroller.value.firstElementChild) observer.observe(scroller.value.firstElementChild)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="relative min-w-0">
    <div ref="scroller" class="no-scrollbar overflow-x-auto" @scroll.passive="update">
      <slot />
    </div>
    <span
      v-if="canLeft"
      class="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-cream-100 to-transparent"
      data-testid="fade-left"
      aria-hidden="true"
    />
    <span
      v-if="canRight"
      class="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-cream-100 to-transparent"
      data-testid="fade-right"
      aria-hidden="true"
    />
  </div>
</template>
