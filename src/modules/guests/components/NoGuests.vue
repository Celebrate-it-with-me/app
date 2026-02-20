<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { Users2 as UserIcon } from 'lucide-vue-next'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useRouter } from 'vue-router'

defineEmits(['addFirstMemory'])

const eventStore = useEventsStore()
const router = useRouter()

const createGuest = async () => {
  await router.push('/dashboard/guests/create')
}
</script>

<template>
  <CCard class="mb-6">
    <div class="p-8 text-center">
      <UserIcon class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No guests</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        <strong>{{ eventStore.activeEventName }}</strong> does not have any guests yet. You can add
        your first guest by clicking the button below.
      </p>
      <CButton variant="primary" class="flex items-center mx-auto" @click="createGuest">
        <Plus class="w-5 h-5 mr-2" />
        Add Your First Guest
      </CButton>
    </div>
  </CCard>
</template>

<style scoped></style>
