<script setup>
import CWMModal from '@/components/UI/Modal/CWMModal.vue'
import { computed, ref, watch } from 'vue'
import { FwbButton } from 'flowbite-vue'
import { useGuestsStore } from '@/modules/guests/stores/useGuestStore'
import UpdateCompanionType from '@/components/UI/Modal/companions/UpdateCompanionType.vue'
import NoCompanion from '@/components/UI/Modal/companions/NoCompanion.vue'
import NoNamedCompanion from '@/components/UI/Modal/companions/NoNamedCompanion.vue'
import NamedCompanion from '@/components/UI/Modal/companions/NamedCompanion.vue'

const emit = defineEmits(['closeModal'])
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const guestStore = useGuestsStore()
const showModal = ref(props.open)
const viewSelected = ref('showCompanions')

const companionType = computed(() => guestStore.currentGuest.companionType)

const handleClose = () => {
  viewSelected.value = 'showCompanions'
  emit('closeModal')
}

const changeViewSelected = view => {
  viewSelected.value = view
}

watch(
  () => props.open,
  newValue => {
    showModal.value = newValue
  }
)
</script>

<template>
  <CWMModal :show-modal="showModal" :size="'6xl'" @close="handleClose">
    <template #header> Companions List </template>

    <template #body>
      <div
        v-if="viewSelected === 'showCompanions'"
        class="flex flex-col justify-end items-center w-full mb-5"
      >
        <div class="w-full flex justify-end items-center mb-5">
          <fwb-button color="dark" @click="changeViewSelected('editCompanionType')">
            Companion Type
          </fwb-button>
        </div>

        <div class="w-full flex justify-start items-center mb-5">
          <NoCompanion v-if="companionType === 'no_companion'" />

          <NoNamedCompanion v-if="companionType === 'no_named'" />

          <NamedCompanion v-if="companionType === 'named'" />
        </div>
      </div>

      <UpdateCompanionType
        v-else-if="viewSelected === 'editCompanionType'"
        @cancel="viewSelected = 'companionList'"
        @completed="handleClose"
      />
    </template>

    <template #footer>
      <div class="flex justify-end">
        <div class="action-container flex gap-x-2">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-6 rounded-md"
            @click="handleClose"
          >
            Close
          </button>
        </div>
      </div>
    </template>
  </CWMModal>
</template>

<style scoped></style>
