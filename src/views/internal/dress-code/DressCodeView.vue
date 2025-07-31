<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Event Dress Code</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Define the dress code requirements for your event
      </p>
    </div>

    <CPageLoaderV2 v-if="loading"></CPageLoaderV2>

    <template v-else>
      <NoDressCodeView v-if="activeView === 'noDressCode'" @show-dress-code-form="handleShowForm" />

      <DressCodeFormView
        v-if="activeView === 'dressCodeForm'"
        @form-submitted="handleFormSubmitted"
        @form-cancelled="handleFormCancelled"
      />

      <ShowDressCodeView v-if="activeView === 'showDressCode'" @edit-dress-code="handleShowForm" />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDressCodeStore } from '@/stores/useDressCodeStore'
import NoDressCodeView from '@/views/internal/dress-code/NoDressCodeView.vue'
import DressCodeFormView from '@/views/internal/dress-code/DressCodeFormView.vue'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import ShowDressCodeView from '@/views/internal/dress-code/ShowDressCodeView.vue'

const dressCodeStorage = useDressCodeStore()
const hasDressCode = computed(() => dressCodeStorage.hasDressCode)
const activeView = ref('')
const loading = ref(false)

const handleShowForm = () => {
  activeView.value = 'dressCodeForm'
}

const handleFormSubmitted = () => {
  activeView.value = 'showDressCode'
}

const handleFormCancelled = () => {
  activeView.value = 'showDressCode'
}

onMounted(async () => {
  loading.value = true
  await dressCodeStorage.loadDressCode()
  loading.value = false
  activeView.value = hasDressCode.value ? 'showDressCode' : 'noDressCode'
})
</script>
