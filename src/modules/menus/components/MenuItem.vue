<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import { ref } from 'vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
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
      await menuStore.loadMenus()
      await menuStore.setCurrentMenu(menuStore.currentMenu.id)
      notifications.addNotification({
        type: 'success',
        message: 'Menu item removed successfully.'
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
  <div
    class="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-rose/30 dark:hover:border-rose/30 transition-all hover:shadow-lg hover:shadow-rose/5"
  >
    <div class="flex justify-between items-start gap-4">
      <div class="space-y-2 flex-1">
        <div class="flex items-center gap-2">
          <p
            class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-rose transition-colors"
          >
            {{ item.name }}
          </p>
          <span
            v-if="item.diet_type"
            class="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider"
          >
            {{ item.diet_type }}
          </span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {{ item.notes || 'No description available' }}
        </p>
      </div>
      <CButton
        variant="danger"
        class="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-10 w-10 rounded-xl flex items-center justify-center"
        @click="removeMenuItem"
      >
        <span class="sr-only">Remove</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </CButton>
    </div>
  </div>
  <CConfirmModal
    v-model="showConfirmDeleteMenuItemModal"
    title="Remove Menu Item"
    message="Are you sure you want to remove this item? This action cannot be undone."
    @confirm="confirmRemoveItem"
  />
</template>
