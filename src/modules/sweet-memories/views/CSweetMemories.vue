<script setup>
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { UiButton, UiPageHeader, UiSkeleton, UiEmptyState, UiPage } from '@/ui'
import { useMemoriesController } from '@/modules/sweet-memories/composables/useMemoriesController'
import { openPhotoViewer } from '@/modules/sweet-memories/utils/viewer'
import MemoriesFilters from '@/modules/sweet-memories/components/MemoriesFilters.vue'
import MemoriesPhotoCard from '@/modules/sweet-memories/components/MemoriesPhotoCard.vue'
import MemoriesAddTile from '@/modules/sweet-memories/components/MemoriesAddTile.vue'
import MemoryFormModal from '@/modules/sweet-memories/components/MemoryFormModal.vue'
import MemoriesDeleteModal from '@/modules/sweet-memories/components/MemoriesDeleteModal.vue'

const { t } = useI18n()
const c = useMemoriesController()

const GRID = 'grid grid-cols-2 gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] md:gap-3.5'
</script>

<template>
  <UiPage>
    <UiPageHeader :title="t('app.memories.title')" :subtitle="t('app.memories.subtitle')">
      <template #actions>
        <UiButton v-if="c.memories.value.length > 0" @click="c.openCreate()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.memories.add') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <div v-if="c.loading.value" class="mt-6" :class="GRID" aria-busy="true">
      <UiSkeleton v-for="n in 4" :key="n" height="14rem" />
    </div>

    <div v-else-if="c.memories.value.length === 0" class="mt-6">
      <MemoriesAddTile large :title="t('app.memories.empty.title')" :text="t('app.memories.empty.text')" :cta="t('app.memories.empty.cta')" @add="c.openCreate()" />
    </div>

    <template v-else>
      <p class="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-sm text-ink-500">
        <span>
          <b class="font-semibold text-ink-900">{{ c.stats.value.total }}</b>
          {{ t('app.memories.summary.total', c.stats.value.total) }}
        </span>
        <span>
          <b class="font-semibold text-ink-900">{{ c.stats.value.visible }}</b>
          {{ t('app.memories.summary.visible', c.stats.value.visible) }}
        </span>
        <button
          type="button"
          class="relative touch-target rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
          :class="c.hiddenOnly.value ? 'font-semibold text-rose-600 underline' : 'hover:text-ink-900'"
          :aria-pressed="c.hiddenOnly.value"
          :aria-label="t('app.memories.summary.showHidden')"
          @click="c.toggleHiddenOnly()"
        >
          <b class="font-semibold text-ink-900">{{ c.stats.value.hidden }}</b>
          {{ t('app.memories.summary.hidden', c.stats.value.hidden) }}
        </button>
      </p>

      <MemoriesFilters
        v-if="c.showFilters.value"
        class="mt-5"
        v-model:search="c.search.value"
        v-model:year="c.year.value"
        :sort="c.sort.value"
        :years="c.years.value"
        @toggle-sort="c.toggleSort()"
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

      <section v-for="(group, gi) in c.groups.value" v-else :key="group.year ?? 'none'" class="mt-[26px]">
        <div class="mb-3 flex items-center gap-3 after:h-px after:flex-1 after:bg-cream-300 after:content-['']">
          <h2 class="font-heading text-2xl leading-none text-ink-900 md:text-[28px]">{{ group.year ?? t('app.memories.year.none') }}</h2>
          <span class="whitespace-nowrap text-[13px] text-ink-500">{{ t('app.memories.year.count', { n: group.items.length }, group.items.length) }}</span>
        </div>
        <ul :class="GRID">
          <li v-for="memory in group.items" :key="memory.id" class="min-w-0">
            <MemoriesPhotoCard
              :memory="memory"
              @view="openPhotoViewer"
              @edit="c.openEdit"
              @toggle-visible="c.toggleVisibility"
              @delete="m => (c.memoryToDelete.value = m)"
            />
          </li>
          <li v-if="gi === c.groups.value.length - 1" class="min-w-0">
            <MemoriesAddTile :title="t('app.memories.addTile.title')" :text="t('app.memories.addTile.hint')" @add="c.openCreate()" />
          </li>
        </ul>
      </section>
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
  </UiPage>
</template>
