<script setup>
import { useI18n } from 'vue-i18n'
import { Pencil, Plus, UtensilsCrossed } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiBadge, UiEmptyState, UiSkeleton } from '@/ui'
import MenuItem from '@/modules/menus/components/MenuItem.vue'
import AddMenuItemModal from '@/modules/menus/components/AddMenuItemModal.vue'
import { useShowMenuController } from '@/modules/menus/composables/useShowMenuController'

const { t } = useI18n()
const {
  loading,
  openItemForm,
  addingItem,
  itemErrors,
  itemGroups,
  itemCount,
  menuSelected,
  handleAddMenuItem,
  goToEditMenu,
  handleAddItem
} = useShowMenuController()
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div v-if="loading" class="space-y-3">
      <UiSkeleton class="h-16" />
      <UiSkeleton class="h-24" />
      <UiSkeleton class="h-24" />
    </div>

    <UiEmptyState v-else-if="!menuSelected" :title="t('app.menus.notFoundTitle')" :description="t('app.menus.notFoundText')">
      <template #icon><UtensilsCrossed class="h-6 w-6" aria-hidden="true" /></template>
      <UiButton to="/dashboard/menus">{{ t('app.menus.backToMenus') }}</UiButton>
    </UiEmptyState>

    <template v-else>
      <UiPageHeader :title="menuSelected.title" :subtitle="menuSelected.description || ''" back="/dashboard/menus" :back-label="t('app.menus.backToMenus')">
        <template #actions>
          <UiButton variant="secondary" @click="goToEditMenu">
            <Pencil class="h-4 w-4" aria-hidden="true" />
            {{ t('app.menus.editSettings') }}
          </UiButton>
          <UiButton @click="handleAddMenuItem">
            <Plus class="h-4 w-4" aria-hidden="true" />
            {{ t('app.menus.addItem') }}
          </UiButton>
        </template>
      </UiPageHeader>

      <div class="mt-3 flex flex-wrap gap-2">
        <UiBadge :tone="menuSelected.is_default ? 'rose' : 'neutral'">{{ menuSelected.is_default ? t('app.menus.main') : t('app.menus.optional') }}</UiBadge>
        <UiBadge v-if="menuSelected.allow_multiple_choices" tone="info">{{ t('app.menus.multiple') }}</UiBadge>
        <UiBadge v-if="menuSelected.allow_custom_request" tone="gold">{{ t('app.menus.custom') }}</UiBadge>
      </div>

      <UiEmptyState v-if="!itemCount" class="mt-6" :title="t('app.menus.itemsEmptyTitle')" :description="t('app.menus.itemsEmptyText')">
        <template #icon><UtensilsCrossed class="h-6 w-6" aria-hidden="true" /></template>
        <UiButton @click="handleAddMenuItem">{{ t('app.menus.addFirstItem') }}</UiButton>
      </UiEmptyState>

      <div v-else class="mt-6 space-y-8">
        <section v-for="group in itemGroups" :key="group.type" :aria-labelledby="`course-${group.type}`">
          <h2 :id="`course-${group.type}`" class="font-heading text-xl text-ink-900">{{ t(`app.menus.types.${group.type}`) }}</h2>
          <UiCard padding="none" class="mt-3 divide-y divide-line overflow-hidden">
            <MenuItem v-for="item in group.items" :key="item.id" :item="item" />
          </UiCard>
        </section>
      </div>
    </template>

    <AddMenuItemModal v-if="menuSelected" v-model:open="openItemForm" :loading="addingItem" :errors="itemErrors" @submitted="handleAddItem" />
  </div>
</template>
