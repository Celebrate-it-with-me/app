<script setup>
import { TrashIcon } from '@heroicons/vue/16/solid'

const emit = defineEmits(['removeCompanion', 'removeQty'])
defineProps({
  type: {
    type: String,
    default: 'no-named'
  },
  list: {
    type: Array,
    default() {
      return []
    }
  },
  qty: {
    type: Number,
    default: 0
  }
})

const handleRemoveClick = (companion) => {
  emit('removeCompanion', companion)
}

const handleRemoveQty = () => {
  emit('removeQty')
}


</script>

<template>
<div class="w-full ">
  <h2 class="text-xl mb-4">List:</h2>
  <div
    class="space-y-2"
    v-if="type === 'no-named'"
  >
    <div class="flex flex-row justify-between items-center">
      <div class="companion-qty">
        <p class="text-md">Companions type: "No Named"</p>
        <p class="text-md">Quantity: {{ qty }} </p>
      </div>

      <button
        type="button"
        class="hover:bg-transparent text-white text-sm font-medium rounded-md bg-transparent text-red-500 hover:text-red-600 transition duration-300"
      >
        <TrashIcon
          class="w-6 h-6"
          @click="handleRemoveQty"
        />
      </button>
    </div>

  </div>
  <div
    v-else
  >
    <p class="text-md">Companions type: "Named"</p>
    <ul>
      <li v-for="(companion, index) in list" :key="index">
        <div class="companion-added flex flex-row gap-x-2 items-center justify-between">
          <p>{{ companion.firstName }} {{ companion.lastName }}</p>
          <span>
              <button
                type="button"
                class="hover:bg-transparent text-white text-sm font-medium rounded-md bg-transparent text-red-500 hover:text-red-600 transition duration-300"
              >
                <TrashIcon
                  class="w-6 h-6"
                  @click="handleRemoveClick(companion)"
                />
              </button>
            </span>
        </div>
      </li>
    </ul>
  </div>
</div>
</template>

<style scoped>

</style>
