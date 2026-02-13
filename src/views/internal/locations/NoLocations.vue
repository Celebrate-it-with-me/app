<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Users2 as UserIcon } from 'lucide-vue-next'
import { useEventsStore } from '@/stores/useEventsStore'
import { useRouter } from 'vue-router'

defineEmits(['addLocation'])

const eventStore = useEventsStore()
const router = useRouter()

const addLocation = async () => {
  await router.push('/dashboard/locations/create')
}
</script>

<template>
  <CCard class="mb-6">
    <div class="p-8 text-center">
      <UserIcon class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Locations</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        <strong>{{ eventStore.activeEventName }}</strong> does not have any Locations yet. You can
        add your location by clicking the button below.
      </p>
      <CButton variant="primary" class="flex items-center mx-auto" @click="addLocation">
        <Plus class="w-5 h-5 mr-2" />
        Add Your Location
      </CButton>
    </div>
  </CCard>
</template>

<style scoped></style>
