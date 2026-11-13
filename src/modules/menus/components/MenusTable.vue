<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ChevronRight, Trash2, UtensilsCrossed } from 'lucide-vue-next'
import { UiCard, UiBadge, UiButton, UiModal, UiEmptyState, UiSkeleton, useToast } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'

defineProps({ loading: { type: Boolean, default: false } })

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const menuStore = useMenusStore()

const showConfirmDeleteModal = ref(false)
const menuSelectedForDelete = ref(null)
const deleting = ref(false)

const confirmDeleteMenu = menu => {
  menuSelectedForDelete.value = menu
  showConfirmDeleteModal.value = true
}

const deleteMenu = async () => {
  deleting.value = true
  try {
    const response = await menuStore.deleteMenu(menuSelectedForDelete.value.id)
    if (response.status >= 200 && response.status < 300) {
      await menuStore.loadMenus()
      toast.success(t('app.menus.deleted'))
    }
    showConfirmDeleteModal.value = false
  } catch {
    toast.error(t('app.menus.deleteError'))
  } finally {
    deleting.value = false
  }
}

const goToMenu = menu => router.push(`/dashboard/menus/show/${menu.id}`)
</script>

<template>
  <div v-if="loading && !menuStore.hasMenu" class="space-y-3">
    <UiSkeleton class="h-20" />
    <UiSkeleton class="h-20" />
  </div>

  <UiEmptyState v-else-if="!menuStore.hasMenu" :title="t('app.menus.emptyTitle')" :description="t('app.menus.emptyText')">
    <template #icon><UtensilsCrossed class="h-6 w-6" aria-hidden="true" /></template>
  </UiEmptyState>

  <div v-else>
    <!-- Phones: one card per menu -->
    <ul class="space-y-3 md:hidden">
      <li v-for="menu in menuStore.menus" :key="menu.id">
        <UiCard padding="none" class="overflow-hidden">
          <button
            type="button"
            class="flex min-h-11 w-full items-start gap-3 p-4 text-left transition-colors hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-rose-600"
            @click="goToMenu(menu)"
          >
            <span class="min-w-0 flex-1">
              <span class="block truncate text-base font-medium text-ink-900">{{ menu.title }}</span>
              <span class="mt-0.5 block line-clamp-2 text-sm text-ink-500">{{ menu.description || t('app.menus.noDescription') }}</span>
              <span class="mt-2 flex flex-wrap gap-1.5">
                <UiBadge :tone="menu.is_default ? 'rose' : 'neutral'" size="sm">{{ menu.is_default ? t('app.menus.main') : t('app.menus.optional') }}</UiBadge>
                <UiBadge v-if="menu.allow_multiple_choices" tone="info" size="sm">{{ t('app.menus.multiple') }}</UiBadge>
                <UiBadge v-if="menu.allow_custom_request" tone="gold" size="sm">{{ t('app.menus.custom') }}</UiBadge>
              </span>
            </span>
            <ChevronRight class="mt-0.5 h-5 w-5 shrink-0 text-ink-500" aria-hidden="true" />
          </button>
          <div class="border-t border-line px-4 py-2">
            <UiButton variant="ghost" size="sm" class="text-danger" @click="confirmDeleteMenu(menu)">
              <Trash2 class="h-4 w-4" aria-hidden="true" />
              {{ t('app.menus.delete') }}
            </UiButton>
          </div>
        </UiCard>
      </li>
    </ul>

    <!-- md and up: table -->
    <UiCard padding="none" class="hidden overflow-hidden md:block">
      <table class="w-full text-left">
        <thead class="border-b border-line bg-cream-100 text-sm text-ink-700">
          <tr>
            <th scope="col" class="px-5 py-3 font-medium">{{ t('app.menus.colTitle') }}</th>
            <th scope="col" class="px-5 py-3 font-medium">{{ t('app.menus.colDescription') }}</th>
            <th scope="col" class="px-5 py-3 font-medium">{{ t('app.menus.colOptions') }}</th>
            <th scope="col" class="px-5 py-3 font-medium">{{ t('app.menus.colStatus') }}</th>
            <th scope="col" class="px-5 py-3 text-right font-medium"><span class="sr-only">{{ t('app.menus.colActions') }}</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="menu in menuStore.menus" :key="menu.id" class="hover:bg-cream-100">
            <td class="px-5 py-3 font-medium text-ink-900">{{ menu.title }}</td>
            <td class="max-w-xs truncate px-5 py-3 text-sm text-ink-500">{{ menu.description || t('app.menus.noDescription') }}</td>
            <td class="px-5 py-3">
              <span class="flex flex-wrap gap-1.5">
                <UiBadge v-if="menu.allow_multiple_choices" tone="info" size="sm">{{ t('app.menus.multiple') }}</UiBadge>
                <UiBadge v-if="menu.allow_custom_request" tone="gold" size="sm">{{ t('app.menus.custom') }}</UiBadge>
                <span v-if="!menu.allow_multiple_choices && !menu.allow_custom_request" class="text-sm text-ink-500">&mdash;</span>
              </span>
            </td>
            <td class="px-5 py-3">
              <UiBadge :tone="menu.is_default ? 'rose' : 'neutral'" size="sm">{{ menu.is_default ? t('app.menus.main') : t('app.menus.optional') }}</UiBadge>
            </td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-2">
                <UiButton variant="secondary" size="sm" @click="goToMenu(menu)">{{ t('app.menus.details') }}</UiButton>
                <UiButton variant="ghost" size="sm" class="text-danger" @click="confirmDeleteMenu(menu)">{{ t('app.menus.delete') }}</UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </UiCard>
  </div>

  <UiModal v-model:open="showConfirmDeleteModal" :title="t('app.menus.deleteTitle')" :description="t('app.menus.deleteText')" size="sm">
    <template #footer>
      <UiButton variant="secondary" @click="showConfirmDeleteModal = false">{{ t('app.menus.cancel') }}</UiButton>
      <UiButton variant="danger" :loading="deleting" @click="deleteMenu">{{ t('app.menus.delete') }}</UiButton>
    </template>
  </UiModal>
</template>
