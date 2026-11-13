<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2 } from 'lucide-vue-next'
import { UiBadge, UiButton, UiModal, useToast } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const { t, te } = useI18n()
const toast = useToast()
const menuStore = useMenusStore()
const showConfirm = ref(false)
const removing = ref(false)

const dietLabel = diet => (te(`app.menus.diets.${diet}`) ? t(`app.menus.diets.${diet}`) : diet)

const confirmRemoveItem = async () => {
  removing.value = true
  try {
    const response = await menuStore.removeMenuItem(props.item)

    if (response.status === 200) {
      const id = menuStore.currentMenu.id
      await menuStore.loadMenus()
      await menuStore.setCurrentMenu(id)
      toast.success(t('app.menus.itemRemoved'))
    }
    showConfirm.value = false
  } catch {
    toast.error(t('app.menus.itemRemoveError'))
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="flex items-start gap-3 p-4">
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-base font-medium text-ink-900">{{ item.name }}</p>
        <UiBadge v-if="item.diet_type && item.diet_type !== 'regular'" tone="success" size="sm">{{ dietLabel(item.diet_type) }}</UiBadge>
      </div>
      <p class="mt-0.5 text-sm text-ink-500">{{ item.notes || t('app.menus.noNotes') }}</p>
    </div>
    <UiButton variant="ghost" icon :aria-label="t('app.menus.removeItemAria', { name: item.name })" class="text-danger" @click="showConfirm = true">
      <Trash2 class="h-5 w-5" aria-hidden="true" />
    </UiButton>
  </div>

  <UiModal v-model:open="showConfirm" :title="t('app.menus.removeItemTitle')" :description="t('app.menus.removeItemText')" size="sm">
    <template #footer>
      <UiButton variant="secondary" @click="showConfirm = false">{{ t('app.menus.cancel') }}</UiButton>
      <UiButton variant="danger" :loading="removing" @click="confirmRemoveItem">{{ t('app.menus.remove') }}</UiButton>
    </template>
  </UiModal>
</template>
