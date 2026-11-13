<script setup>
import { useI18n } from 'vue-i18n'
import { ImageIcon, Plus } from 'lucide-vue-next'
import { UiButton, UiEmptyState, UiPageHeader, UiSkeleton, UiStat } from '@/ui'
import { useMemoriesController } from '@/modules/sweet-memories/composables/useMemoriesController'
import { openPhotoViewer } from '@/modules/sweet-memories/utils/viewer'
import MemoriesFilters from '@/modules/sweet-memories/components/MemoriesFilters.vue'
import MemoriesPhotoCard from '@/modules/sweet-memories/components/MemoriesPhotoCard.vue'
import MemoryFormModal from '@/modules/sweet-memories/components/MemoryFormModal.vue'
import MemoriesDeleteModal from '@/modules/sweet-memories/components/MemoriesDeleteModal.vue'

const { t } = useI18n()
const c = useMemoriesController()
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <UiPageHeader :title="t('app.memories.title')" :subtitle="t('app.memories.subtitle')">
      <template #actions>
        <UiButton @click="c.openCreate()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.memories.add') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <div v-if="c.loading.value" class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true">
      <UiSkeleton v-for="n in 4" :key="n" height="14rem" />
    </div>

    <UiEmptyState
      v-else-if="c.memories.value.length === 0"
      class="mt-6"
      :title="t('app.memories.empty.title')"
      :description="t('app.memories.empty.text')"
    >
      <template #icon><ImageIcon class="h-6 w-6" aria-hidden="true" /></template>
      <UiButton @click="c.openCreate()">
        <Plus class="h-4 w-4" aria-hidden="true" />
        {{ t('app.memories.empty.cta') }}
      </UiButton>
    </UiEmptyState>

    <template v-else>
      <div class="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <UiStat :label="t('app.memories.stats.total')" :value="c.stats.value.total" tone="rose" />
        <UiStat :label="t('app.memories.stats.visible')" :value="c.stats.value.visible" tone="success" />
        <UiStat :label="t('app.memories.stats.hidden')" :value="c.stats.value.hidden" tone="neutral" />
      </div>

      <MemoriesFilters
        class="mt-6"
        v-model:search="c.search.value"
        v-model:year="c.year.value"
        v-model:sort="c.sort.value"
        :years="c.years.value"
      />

      <UiEmptyState
        v-if="c.visibleMemories.value.length === 0"
        compact
        class="mt-4"
        :title="t('app.memories.filters.noResultsTitle')"
        :description="t('app.memories.filters.noResultsText')"
      >
        <UiButton variant="secondary" @click="c.clearFilters()">{{ t('app.memories.filters.clear') }}</UiButton>
      </UiEmptyState>

      <ul v-else class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <li v-for="memory in c.visibleMemories.value" :key="memory.id" class="min-w-0">
          <MemoriesPhotoCard
            :memory="memory"
            @view="openPhotoViewer"
            @edit="c.openEdit"
            @delete="m => (c.memoryToDelete.value = m)"
          />
        </li>
      </ul>
    </template>

    <MemoryFormModal
      :open="c.showFormModal.value"
      :memory="c.editingMemory.value"
      :saving="c.saving.value"
      :file-error="c.fileError.value"
      @update:open="val => (c.showFormModal.value = val)"
      @save="c.saveMemory"
    />
    <MemoriesDeleteModal
      :memory="c.memoryToDelete.value"
      :saving="c.saving.value"
      @close="c.memoryToDelete.value = null"
      @confirm="c.confirmDelete"
    />
  </div>
</template>
