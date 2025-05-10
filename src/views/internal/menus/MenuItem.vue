<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import { ref } from 'vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useMenusStore } from '@/stores/useMenusStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const showConfirmDeleteMenuItemModal = ref(false)
const menuStore = useMenusStore()
const notifications = useNotificationStore()

const removeMenuItem = () => {
  showConfirmDeleteMenuItemModal.value = true
}

const confirmRemoveItem = async () => {
  try {
    const response = await menuStore.removeMenuItem(props.item)

    if (response.status === 200) {
      await menuStore.loadMenu()
      notifications.addNotification({
        type: 'success',
        message: 'Menu item removed successfully.',
      })
    }

  } catch (e) {
    console.error(e)
  } finally {
    showConfirmDeleteMenuItemModal.value = false
  }
}

</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <p class="text-lg font-medium text-gray-900">{{ item.name }}</p>
        <p class="text-sm text-gray-600">{{ item.notes }}</p>
        <p
          v-if="item.diet_type"
          class="text-xs text-green-600 italic"
        >
          {{ item.diet_type }}
        </p>
      </div>
      <div>
        <CButton
          @click="removeMenuItem"
          variant="danger"
        >
          Remove
        </CButton>
      </div>
    </div>
  </div>
  <CConfirmModal
    v-model="showConfirmDeleteMenuItemModal"
    title="Are you sure?"
    message="Are you sure you want to delete this menu item?"
    @confirm="confirmRemoveItem"
  />
</template>

<style scoped>

</style>
