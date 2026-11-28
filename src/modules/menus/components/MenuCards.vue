<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { MoreHorizontal, Pencil, Trash2, UtensilsCrossed } from 'lucide-vue-next'
import { UiBadge, UiButton, UiDropdown, UiModal, UiEmptyState, UiSkeleton, useToast } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { menuChosenCount } from '@/modules/menus/utils/menus'

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
      await Promise.all([menuStore.loadMenus(), menuStore.loadSummary(), menuStore.loadGuestsMenu().catch(() => false)])
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
const goToEdit = menu => router.push(`/dashboard/menus/edit/${menu.id}`)

const chosenLabel = menu => {
  const n = menuChosenCount(menuStore.summary, menu.id)
  if (n === null) return ''
  return n ? t('app.menus.chosenBy', { n }, n) : t('app.menus.chosenByNobody')
}

const itemsFor = menu => [
  { label: t('app.menus.edit'), icon: Pencil, onSelect: () => goToEdit(menu) },
  { label: t('app.menus.delete'), icon: Trash2, danger: true, separator: true, onSelect: () => confirmDeleteMenu(menu) }
]

const cards = computed(() => menuStore.menus)
</script>

<template>
  <div v-if="loading && !menuStore.hasMenu" class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
    <UiSkeleton class="h-36" />
    <UiSkeleton class="h-36" />
  </div>

  <UiEmptyState v-else-if="!menuStore.hasMenu" :title="t('app.menus.emptyTitle')" :description="t('app.menus.emptyText')">
    <template #icon><UtensilsCrossed class="h-6 w-6" aria-hidden="true" /></template>
  </UiEmptyState>

  <ul v-else data-testid="menu-cards" class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
    <li v-for="menu in cards" :key="menu.id" data-testid="menu-card" class="flex min-w-0 flex-col gap-1.5 rounded-xl border border-line bg-white px-4 pb-3 pt-4 shadow-card">
      <div class="flex min-w-0 items-start gap-2">
        <h3 class="min-w-0 flex-1 font-heading text-lg leading-snug text-ink-900 [overflow-wrap:anywhere]">{{ menu.title }}</h3>
        <UiBadge :tone="menu.is_default ? 'rose' : 'neutral'" size="sm" class="shrink-0">{{ menu.is_default ? t('app.menus.main') : t('app.menus.optional') }}</UiBadge>
      </div>
      <p class="line-clamp-2 text-sm text-ink-500">{{ menu.description || t('app.menus.noDescription') }}</p>
      <div v-if="menu.allow_multiple_choices || menu.allow_custom_request" class="flex flex-wrap gap-1.5">
        <UiBadge v-if="menu.allow_multiple_choices" tone="info" size="sm">{{ t('app.menus.multiple') }}</UiBadge>
        <UiBadge v-if="menu.allow_custom_request" tone="gold" size="sm">{{ t('app.menus.custom') }}</UiBadge>
      </div>
      <div class="fab-safe mt-auto flex items-center gap-x-3 gap-y-1 border-t border-black/[.06] pt-2.5">
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5">
          <button
            type="button"
            data-testid="menu-details"
            class="relative text-[13px] font-semibold text-rose-700 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600 touch-target"
            @click="goToMenu(menu)"
          >
            {{ t('app.menus.viewDetails') }}
          </button>
          <span v-if="chosenLabel(menu)" data-testid="menu-chosen" class="text-xs text-ink-500">{{ chosenLabel(menu) }}</span>
        </div>
        <UiDropdown :items="itemsFor(menu)">
          <template #trigger>
            <button
              type="button"
              data-testid="menu-more"
              class="touch-target relative flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-rose-600"
              :aria-label="t('app.menus.moreFor', { name: menu.title })"
            >
              <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
            </button>
          </template>
        </UiDropdown>
      </div>
    </li>
  </ul>

  <UiModal v-model:open="showConfirmDeleteModal" :title="t('app.menus.deleteTitle')" :description="t('app.menus.deleteText')" size="sm">
    <template #footer>
      <UiButton variant="secondary" @click="showConfirmDeleteModal = false">{{ t('app.menus.cancel') }}</UiButton>
      <UiButton variant="danger" :loading="deleting" @click="deleteMenu">{{ t('app.menus.delete') }}</UiButton>
    </template>
  </UiModal>
</template>
