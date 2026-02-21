<script setup>
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { computed, ref } from 'vue'
import CFCompanionsList from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/CFCompanionsList.vue'
import CFConfirmCompanion from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/CFConfirmCompanion.vue'

const emit = defineEmits(['goToPrevious', 'goToNext'])
const templateStore = useTemplateStore()
const currentCompanion = ref(null)

const readyForNext = computed(() => {
  return !templateStore.guest?.companions?.some(companion => companion.rsvpStatus === 'pending')
})

const setCurrentCompanion = companion => {
  currentCompanion.value = companion
}

const goToPrevious = () => {
  emit('goToPrevious')
}

const goToNext = () => {
  emit('goToNext')
}

const handleCompanionConfirmed = companion => {
  templateStore.guest?.companions.forEach(comp => {
    if (companion.id === comp.id) {
      comp.name = companion.name
      comp.email = companion.email
      comp.phone = companion.phone
      comp.rsvpStatus = companion.rsvpStatus
    }
  })

  currentCompanion.value = null
}
</script>

<template>
  <div class="w-full">
    <div v-if="!currentCompanion" class="companions-list w-full">
      <CFCompanionsList @set-current-companion="setCurrentCompanion" />

      <div class="w-full flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
        <button
          class="w-full sm:w-auto px-10 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all order-2 sm:order-1"
          @click="goToPrevious()"
        >
          Atrás
        </button>

        <button
          v-if="readyForNext"
          class="w-full sm:w-auto px-10 py-3 bg-gradient-to-l from-blue-800 to-red-800 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all order-1 sm:order-2"
          @click="goToNext()"
        >
          Siguiente
        </button>
      </div>
    </div>

    <div v-if="currentCompanion" class="confirm-companion w-full">
      <CFConfirmCompanion
        :current-companion="currentCompanion"
        @confirmed="handleCompanionConfirmed"
      />
    </div>
  </div>
</template>

<style scoped></style>
