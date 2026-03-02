<script setup>
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { computed, ref } from 'vue'
import OVCompanionsList from '@/views/non-authenticated/templates/ocean-vibe/RSVP/Companions/OVCompanionsList.vue'
import OVConfirmCompanion from '@/views/non-authenticated/templates/ocean-vibe/RSVP/Companions/OVConfirmCompanion.vue'

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
      <OVCompanionsList @set-current-companion="setCurrentCompanion" />

      <div class="w-full flex flex-col sm:flex-row justify-between items-center mt-12 gap-4">
        <button
          class="w-full sm:w-auto px-10 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all uppercase tracking-wide text-xs order-2 sm:order-1"
          @click="goToPrevious()"
        >
          Atrás
        </button>

        <button
          v-if="readyForNext"
          class="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] text-white rounded-2xl font-bold shadow-xl shadow-sky-900/20 hover:shadow-sky-900/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 uppercase tracking-wider text-sm order-1 sm:order-2"
          @click="goToNext()"
        >
          Siguiente
        </button>
      </div>
    </div>

    <div v-if="currentCompanion" class="confirm-companion w-full">
      <OVConfirmCompanion
        :current-companion="currentCompanion"
        @confirmed="handleCompanionConfirmed"
      />
    </div>
  </div>
</template>

<style scoped></style>
