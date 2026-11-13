<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { UiButton, UiCard, UiModal, UiPageHeader, UiStat, UiTabs } from '@/ui'
import { useSeatingController } from '@/modules/seating/composables/useSeatingController'
import SeatingTablesList from '@/modules/seating/components/SeatingTablesList.vue'
import SeatingTableDetails from '@/modules/seating/components/SeatingTableDetails.vue'
import SeatingUnassignedGuests from '@/modules/seating/components/SeatingUnassignedGuests.vue'
import SeatingTableFormModal from '@/modules/seating/components/SeatingTableFormModal.vue'
import SeatingDeleteTableModal from '@/modules/seating/components/SeatingDeleteTableModal.vue'
import SeatingRemoveGuestModal from '@/modules/seating/components/SeatingRemoveGuestModal.vue'

const { t } = useI18n()
const c = useSeatingController()

const tabs = computed(() => [
  { value: 'tables', label: t('app.seating.tabs.tables'), count: c.tables.value.length },
  { value: 'unassigned', label: t('app.seating.tabs.unassigned'), count: c.unassigned.value.length }
])
const panel = value => (c.tab.value === value ? 'block' : 'hidden lg:block')
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <UiPageHeader :title="t('app.seating.title')" :subtitle="t('app.seating.subtitle')">
      <template #actions>
        <UiButton @click="c.openCreate()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.seating.newTable') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
      <UiStat :label="t('app.seating.stats.tables')" :value="c.tables.value.length" tone="rose" />
      <UiStat :label="t('app.seating.stats.seated')" :value="`${c.seatedCount.value}/${c.totalSeats.value}`" tone="success" />
      <UiStat :label="t('app.seating.stats.pending')" :value="c.unassigned.value.length" tone="gold" />
    </div>

    <UiTabs
      class="mt-6 lg:hidden"
      fill
      :model-value="c.tab.value"
      :tabs="tabs"
      @update:model-value="val => (c.tab.value = val)"
    />

    <div class="mt-4 grid grid-cols-1 gap-6 lg:mt-6 lg:grid-cols-3 lg:items-start">
      <section :class="panel('tables')" aria-labelledby="seating-tables-title">
        <h2 id="seating-tables-title" class="mb-3 hidden font-heading text-xl text-ink-900 lg:block">
          {{ t('app.seating.tables.title') }}
        </h2>
        <SeatingTablesList
          :tables="c.tables.value"
          :selected-id="c.selectedTable.value?.id ?? null"
          :loading="c.loading.value"
          @select="c.selectTable"
          @edit="c.openEdit"
          @delete="table => (c.tableToDelete.value = table)"
          @create="c.openCreate()"
        />
      </section>

      <section v-if="c.isDesktop.value" >
        <UiCard
          :title="c.selectedTable.value ? c.selectedTable.value.name : t('app.seating.details.title')"
          heading-level="h2"
          :subtitle="c.selectedTable.value ? t('app.seating.details.title') : ''"
        >
          <SeatingTableDetails :table="c.selectedTable.value" @remove-guest="g => (c.guestToRemove.value = g)" />
        </UiCard>
      </section>

      <section :class="panel('unassigned')" aria-labelledby="seating-unassigned-title">
        <h2 id="seating-unassigned-title" class="mb-3 font-heading text-xl text-ink-900">
          {{ t('app.seating.unassigned.title') }}
          <span class="text-sm font-body text-ink-500">({{ c.filteredUnassigned.value.length }})</span>
        </h2>
        <SeatingUnassignedGuests
          :guests="c.filteredUnassigned.value"
          :total="c.unassigned.value.length"
          :search="c.search.value"
          :status="c.status.value"
          :table="c.selectedTable.value"
          :busy="c.saving.value"
          @update:search="val => (c.search.value = val)"
          @update:status="val => (c.status.value = val)"
          @assign="c.assignGuest"
          @go-tables="c.tab.value = 'tables'"
        />
      </section>
    </div>

    <UiModal
      :open="c.showDetailsModal.value && !c.isDesktop.value && !!c.selectedTable.value"
      :title="c.selectedTable.value?.name ?? ''"
      :description="c.selectedTable.value ? t('app.seating.details.title') : ''"
      size="md"
      @update:open="val => (c.showDetailsModal.value = val)"
    >
      <SeatingTableDetails
        :table="c.selectedTable.value"
        show-assign
        @remove-guest="g => (c.guestToRemove.value = g)"
        @assign="c.goAssign()"
      />
    </UiModal>

    <SeatingTableFormModal
      :open="c.showFormModal.value"
      :table="c.editingTable.value"
      :saving="c.saving.value"
      @update:open="val => (c.showFormModal.value = val)"
      @save="c.saveTable"
    />
    <SeatingDeleteTableModal
      :table="c.tableToDelete.value"
      :saving="c.saving.value"
      @close="c.tableToDelete.value = null"
      @confirm="c.confirmDelete()"
    />
    <SeatingRemoveGuestModal
      :guest="c.guestToRemove.value"
      :table="c.selectedTable.value"
      :saving="c.saving.value"
      @close="c.guestToRemove.value = null"
      @confirm="c.confirmRemoveGuest()"
    />
  </div>
</template>
