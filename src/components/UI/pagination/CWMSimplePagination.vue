<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowLeftIcon } from '@heroicons/vue/16/solid'
import { ArrowRightIcon } from '@heroicons/vue/16/solid'

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
  return Math.ceil(props.totalItems / perPage.value)
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
  if (page < 1 || page > totalPages.value) {
    return
  }
  currentPage.value = page
}
</script>

<template>
  <div class="pagination-container w-[90%] flex flex-row justify-between mt-1">
    <div
      class="previous-section font-normal flex flex-row items-center gap-x-2"
      :class="
        currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
      "
      @click="changePage(currentPage - 1)"
    >
      <ArrowLeftIcon class="w-6 h-6" />
      Previous
    </div>
    <div class="number-containers flex gap-x-2">
      <span v-for="page in totalPages" :key="page" :class="currentPage === page" class="">
        <button
          :class="
            currentPage === page
              ? 'flex items-center justify-center px-3 h-8 font-normal text-gray-700 border-b border-gray-900'
              : 'flex items-center justify-center px-3 h-8 leading-tight text-gray-400 bg-white'
          "
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </span>
    </div>
    <div
      class="next-section font-normal flex flex-row items-center gap-x-2"
      :class="
        currentPage === totalPages
          ? 'text-gray-200 cursor-not-allowed'
          : 'text-gray-700 cursor-pointer'
      "
      @click="changePage(currentPage + 1)"
    >
      Next
      <ArrowRightIcon class="w-6 h-6" />
    </div>
  </div>
</template>

<style scoped></style>
