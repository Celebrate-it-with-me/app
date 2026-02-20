<script setup>
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { computed } from 'vue'

const props = defineProps({
  companion: {
    type: Object,
    default: () => {}
  }
})

const menuStore = useMenusStore()

const menuSelected = computed(() => {
  return menuStore.menus?.find(menu => {
    return menu.id === props.companion.menuSelected
  })
})

const eventHasMenu = computed(() => menuStore.hasMenu)
</script>

<template>
  <tr class="border-t border-gray-200 dark:border-gray-700">
    <td class="px-4 py-2">{{ companion.name || 'N/A' }}</td>
    <td class="px-4 py-2">{{ companion.email || 'N/A' }}</td>
    <td class="px-4 py-2">{{ companion.phone || 'N/A' }}</td>
    <td v-if="eventHasMenu" class="px-4 py-2">
      {{ menuSelected?.title || 'N/A' }}
    </td>
  </tr>
</template>

<style scoped></style>
