<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed, ref } from 'vue'
import ConfirmCompanion from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/ConfirmCompanion.vue'
import CompanionsList from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/CompanionsList.vue'

const emit = defineEmits(['goToPrevious', 'goToNext'])
const templateStore = useTemplateStore()
const currentCompanion = ref(null)

const readyForNext = computed(() => {
  return !templateStore.guest?.companions?.some(
    (companion) => companion.rsvpStatus === 'pending'
  )
})

const setCurrentCompanion = (companion) => {
  currentCompanion.value = companion
}

const goToPrevious = () => {
  emit('goToPrevious')
}

const goToNext = () => {
  emit('goToNext')
}

const handleCompanionConfirmed = (companion) => {
  templateStore.guest?.companions.forEach((comp) => {
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
  <div class="w-full flex flex-row justify-center items-start">
    <div
      class="companions-list w-full"
      v-if="!currentCompanion"
    >
      <CompanionsList
        @set-current-companion="setCurrentCompanion"
      />

      <div class="w-full flex flex-row justify-end my-2 gap-x-2">
        <button
          class="px-6 py-2 border-2 font-bold mr-2"
          style="font-family: inherit; color: #9a929e; background-color: transparent; border-color: #9a929e; border-radius: 8px;"
          @click="goToPrevious()"
        >
          Back
        </button>

        <button
          v-if="readyForNext"
          class="px-6 py-2 border-2 font-bold mr-2"
          style="font-family: inherit; color: #dba3ff; background-color: transparent; border-color: #dba3ff; border-radius: 8px;"
          @click="goToNext()"
        >
          Next
        </button>
      </div>
    </div>

    <div
      class="confirm-companion w-full"
      v-if="currentCompanion"
    >
      <ConfirmCompanion
        :current-companion="currentCompanion"
        @confirmed="handleCompanionConfirmed"
      />
    </div>


  </div>
</template>

<style scoped></style>
