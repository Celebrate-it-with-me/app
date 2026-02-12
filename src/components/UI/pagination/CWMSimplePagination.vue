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
  <div
    class="pagination-container w-full max-w-4xl flex flex-row justify-between mt-2 items-center px-2"
  >
    <div
      class="previous-section font-bold flex flex-row items-center gap-x-1 transition-colors"
      :class="
        currentPage === 1
          ? 'text-[#7FB9C9]/40 cursor-not-allowed'
          : 'text-[#2F6F8F] cursor-pointer hover:text-[#123B5A]'
      "
      @click="changePage(currentPage - 1)"
    >
      <ChevronLeft class="w-5 h-5" />
      <span class="hidden sm:inline">Anterior</span>
    </div>

    <div class="number-containers flex gap-x-0.5">
      <span v-for="page in totalPages" :key="page">
        <button
          class="flex items-center justify-center w-7 h-7 rounded-full text-xs transition-all"
          :class="
            currentPage === page
              ? 'bg-gradient-to-r from-[#123B5A] to-[#2F6F8F] text-white font-bold shadow-sm'
              : 'text-[#2F6F8F] hover:bg-[#7FB9C9]/10'
          "
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </span>
    </div>

    <div
      class="next-section font-bold flex flex-row items-center gap-x-1 transition-colors"
      :class="
        currentPage === totalPages
          ? 'text-[#7FB9C9]/40 cursor-not-allowed'
          : 'text-[#2F6F8F] cursor-pointer hover:text-[#123B5A]'
      "
      @click="changePage(currentPage + 1)"
    >
      <span class="hidden sm:inline">Siguiente</span>
      <ChevronRight class="w-5 h-5" />
    </div>
  </div>
</template>

<style scoped></style>
