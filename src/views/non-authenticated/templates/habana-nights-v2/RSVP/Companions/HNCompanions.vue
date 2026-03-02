<script setup>
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { computed, ref } from 'vue'
import HNCompanionsList from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/HNCompanionsList.vue'
import HNConfirmCompanion from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/HNConfirmCompanion.vue'

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
      <HNCompanionsList @set-current-companion="setCurrentCompanion" />

      <div class="w-full flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
        <button class="hn-btn-secondary order-2 sm:order-1" @click="goToPrevious()">Atrás</button>

        <button v-if="readyForNext" class="hn-btn-primary order-1 sm:order-2" @click="goToNext()">
          Siguiente
        </button>
      </div>
    </div>

    <div v-if="currentCompanion" class="confirm-companion w-full">
      <HNConfirmCompanion
        :current-companion="currentCompanion"
        @confirmed="handleCompanionConfirmed"
      />
    </div>
  </div>
</template>

<style scoped>
.hn-btn-primary {
  width: 100%;
  padding: 0.875rem 2.5rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
  color: #0b1220;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.hn-btn-primary:hover {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35);
  transform: translateY(-1px);
}

.hn-btn-secondary {
  width: 100%;
  padding: 0.875rem 2.5rem;
  background: transparent;
  color: #f8f1e7;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.hn-btn-secondary:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

@media (min-width: 640px) {
  .hn-btn-primary,
  .hn-btn-secondary {
    width: auto;
  }
}
</style>
