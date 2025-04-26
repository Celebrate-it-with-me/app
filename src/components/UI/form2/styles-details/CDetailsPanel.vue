<template>
  <div ref="panelRef" class="rounded-md relative">
    <div :class="`flex justify-${position}`">
      <button
        @click="showTitleDetails = !showTitleDetails"
        :class="{
          'cursor-not-allowed': disabled,
          'cursor-pointer text-primary': !disabled
        }"
        :disabled="disabled"
      >
        <span class="settings-group relative">
          <Settings class="w-4 h-4" />
          <span class="absolute opacity-0 group-hover:opacity-100 transition text-xs bg-black text-white px-2 py-1 rounded shadow-md top-full mt-2">
            Customize style
          </span>
        </span>
      </button>
    </div>

    <div
      v-if="showTitleDetails"
      class="absolute z-10 top-full mt-2 w-72 bg-white border rounded-lg shadow-xl p-4"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Settings } from 'lucide-vue-next'

defineProps({
  title: String,
  disabled: Boolean,
  position: {
    type: String,
    default: 'end'
  }
})

const showTitleDetails = ref(false)
const panelRef = ref(null)

function handleClickOutside(event) {
  if (panelRef.value && !panelRef.value.contains(event.target)) {
    showTitleDetails.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
