<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed, ref } from 'vue'
import ConfirmCompanion from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/ConfirmCompanion.vue'
import CompanionsList from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/CompanionsList.vue'

const emit = defineEmits(['goToPrevious', 'goToNext'])
const templateStore = useTemplateStore()
const currentCompanion = ref(null)

const readyForNext = computed(() => {
  return !templateStore.guest?.companions?.some((companion) => companion.confirmed === 'pending')
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
      comp.firstName = companion.firstName
      comp.lastName = companion.lastName
      comp.email = companion.email
      comp.phoneNumber = companion.phoneNumber
      comp.confirmed = companion.attendingConfirm
      comp.mealPreference = companion.mealPreference
    }
  })

  currentCompanion.value = null
}

</script>

<template>
  <div class="w-full flex flex-row justify-center items-start">
    <CompanionsList
      v-if="!currentCompanion"
      @set-current-companion="setCurrentCompanion"
    />

    <ConfirmCompanion
      v-if="currentCompanion"
      :current-companion="currentCompanion"
      @confirmed="handleCompanionConfirmed"
    />
  </div>

  <div class="w-full flex flex-row justify-end mt-10 gap-x-5">
    <button
      class="px-6 py-2 border-2 font-bold"
      style="font-family: inherit; color: #9a929e; background-color: transparent; border-color: #9a929e; border-radius: 8px;"
      @click="goToPrevious()"
    >
      Back
    </button>

    <button
      v-if="readyForNext"
      class="px-6 py-2 border-2 font-bold"
      style="font-family: inherit; color: #dba3ff; background-color: transparent; border-color: #dba3ff; border-radius: 8px;"
      @click="goToNext()"
    >
      Next
    </button>
  </div>
</template>

<style scoped></style>
