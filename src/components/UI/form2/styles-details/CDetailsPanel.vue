<template>
  <div class="rounded-md relative">
    <div class="flex justify-end">
      <button
        @click="showTitleDetails = !showTitleDetails"
        class="absolute right-2 top-1/2 -translate-y-1/2"
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
import { ref } from 'vue'
import { Settings } from 'lucide-vue-next'

defineProps({ title: String, disabled: Boolean })

const showTitleDetails = ref(false)
</script>
