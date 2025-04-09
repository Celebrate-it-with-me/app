<script setup>
import { FwbButton } from 'flowbite-vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import { ref } from 'vue'
import UpdateNoNamedCompanionQty from '@/components/UI/Modal/companions/UpdateNoNamedCompanionQty.vue'

const guestStore = useGuestsStore()
const view = ref('message')

const changeView = (newView) => {
  view.value = newView
}

</script>

<template>
  <div>
    <div
      v-if="view === 'message'"
    >
      This guest have {{ guestStore.currentGuest.companionQty }} companions,
      do you want to update this quantity?
      <fwb-button
        @click="changeView('edit')"
      >
        Click to update
      </fwb-button>
    </div>
    <div
      v-if="view === 'edit'"
    >
        <UpdateNoNamedCompanionQty
          @cancel="view = 'message'"
        />
    </div>
  </div>
</template>

<style scoped>

</style>
