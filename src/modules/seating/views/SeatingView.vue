<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, Plus, Trash2 } from 'lucide-vue-next'
import { UiButton, UiCard, UiModal, UiPageHeader, UiStat, UiTabs, UiPage } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useSeatingController } from '@/modules/seating/composables/useSeatingController'
import ModuleTemplateNotice from '@/modules/template-picker/components/ModuleTemplateNotice.vue'
import ModuleTemplateGate from '@/modules/template-picker/components/ModuleTemplateGate.vue'
import SeatingTablesList from '@/modules/seating/components/SeatingTablesList.vue'
import SeatingTableDetails from '@/modules/seating/components/SeatingTableDetails.vue'
import SeatingUnassignedGuests from '@/modules/seating/components/SeatingUnassignedGuests.vue'
import SeatingTableFormModal from '@/modules/seating/components/SeatingTableFormModal.vue'
import SeatingDeleteTableModal from '@/modules/seating/components/SeatingDeleteTableModal.vue'
import SeatingRemoveGuestModal from '@/modules/seating/components/SeatingRemoveGuestModal.vue'
import SeatingSeatSheet from '@/modules/seating/components/SeatingSeatSheet.vue'
import SeatingExportModal from '@/modules/seating/components/SeatingExportModal.vue'
import SeatingClearAllModal from '@/modules/seating/components/SeatingClearAllModal.vue'

const { t } = useI18n()
const c = useSeatingController()
const eventsStore = useEventsStore()

const showExport = ref(false)
const eventLocale = computed(() => (eventsStore.activeEvent?.locale === 'en' ? 'en' : 'es'))
const tabs = computed(() => [
  { value: 'tables', label: t('app.seating.tabs.tables'), count: c.tables.value.length },
  { value: 'unassigned', label: t('app.seating.tabs.unassigned'), count: c.unassigned.value.length }
])
const panel = value => (c.tab.value === value ? 'block' : 'hidden lg:block')
</script>

<template>
  <UiPage width="wide">
    <UiPageHeader :title="t('app.seating.title')" :subtitle="t('app.seating.subtitle')">
      <template #actions>
        <div class="flex flex-wrap gap-2">
        <UiButton variant="secondary" @click="showExport = true">
          <Download class="h-4 w-4" aria-hidden="true" />
          {{ t('app.seating.export.button') }}
        </UiButton>
        <UiButton @click="c.openCreate()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.seating.newTable') }}
        </UiButton>
        </div>
      </template>
    </UiPageHeader>
    <ModuleTemplateGate module="seating" />

    <div class="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
      <UiStat :label="t('app.seating.stats.tables')" :value="c.tables.value.length" tone="rose" />
      <UiStat
        :label="t('app.seating.stats.seated')"
        :value="`${c.seatedCount.value}/${c.totalSeats.value}`"
        :hint="t('app.seating.stats.seatedHint', { count: c.freeSeats.value }, c.freeSeats.value)"
        tone="success"
      />
      <UiStat
        :label="t('app.seating.stats.pending')"
        :value="c.unassigned.value.length"
        :hint="t('app.seating.stats.pendingHint', { n: c.statusCounts.value['not-attending'] })"
        tone="gold"
      />
    </div>

    <UiTabs
      class="mt-6 lg:hidden"
      fill
      :model-value="c.tab.value"
      :tabs="tabs"
      @update:model-value="val => (c.tab.value = val)"
    />

    <div class="mt-4 grid grid-cols-1 gap-6 pb-24 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:pb-8">
      <section :class="panel('tables')" aria-labelledby="seating-tables-title">
        <h2 id="seating-tables-title" class="mb-3 hidden font-heading text-xl text-ink-900 lg:block">
          {{ t('app.seating.tables.title') }}
        </h2>
        <SeatingTablesList
          :tables="c.tables.value"
          :selected-id="c.selectedTable.value?.id ?? null"
          :loading="c.loading.value"
          :failed="c.loadFailed.value"
          @select="c.selectTable"
          @edit="c.openEdit"
          @delete="table => (c.tableToDelete.value = table)"
          @create="c.openCreate()"
          @retry="c.load()"
        />
        <UiButton
          v-if="c.seatedCount.value > 0"
          class="mt-4"
          block
          variant="ghost"
          @click="c.showClearAll.value = true"
        >
          <Trash2 class="h-4 w-4 text-danger-700" aria-hidden="true" />
          {{ t('app.seating.clearAll.open') }}
        </UiButton>
      </section>

      <section v-if="c.isDesktop.value" class="lg:sticky lg:top-4">
        <UiCard
          :title="c.selectedTable.value ? c.selectedTable.value.name : t('app.seating.details.title')"
          heading-level="h2"
          :subtitle="c.selectedTable.value ? t('app.seating.details.title') : ''"
        >
          <SeatingTableDetails
            :table="c.selectedTable.value"
            :companion-name="c.companionName"
            @remove-guest="g => (c.guestToRemove.value = g)"
            @move-guest="c.openMove"
          />
        </UiCard>
      </section>

      <section :class="panel('unassigned')" aria-labelledby="seating-unassigned-title">
        <h2 id="seating-unassigned-title" class="mb-3 font-heading text-xl text-ink-900">
          {{ t('app.seating.unassigned.title') }}
          <span class="text-sm font-body text-ink-500">({{ c.unassigned.value.length }})</span>
        </h2>
        <div class="lg:max-h-[75vh] lg:overflow-y-auto lg:pr-1">
          <SeatingUnassignedGuests
            :guests="c.visibleUnassigned.value"
            :total="c.unassigned.value.length"
            :hidden-count="c.hiddenCount.value"
            :counts="c.statusCounts.value"
            :search="c.search.value"
            :status="c.status.value"
            :selected-ids="c.selectedIds.value"
            :all-selected="c.allVisibleSelected.value"
            :has-tables="c.tables.value.length > 0"
            :companion-name="c.companionName"
            :group-size="c.groupSize"
            :busy="c.saving.value"
            @update:search="val => (c.search.value = val)"
            @update:status="val => (c.status.value = val)"
            @seat="c.openSeat"
            @toggle="c.toggleSelect"
            @toggle-group="c.toggleGroup"
            @toggle-all="c.toggleAllVisible()"
            @seat-selected="c.openSeatSelected()"
            @clear-selection="c.clearSelection()"
            @show-more="c.showMore()"
          />
        </div>
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
        :companion-name="c.companionName"
        @remove-guest="g => (c.guestToRemove.value = g)"
        @move-guest="c.openMove"
        @assign="c.goAssign()"
      />
    </UiModal>

    <SeatingSeatSheet
      :guests="c.seatSheet.value?.guests ?? []"
      :from-table="c.seatSheet.value?.fromTable ?? null"
      :tables="c.tables.value"
      :preferred-id="c.selectedTable.value?.id ?? null"
      :saving="c.saving.value"
      @close="c.closeSeat()"
      @pick="c.seatAt"
    />
    <SeatingExportModal
      v-model:open="showExport"
      :event-id="eventsStore.activeEvent?.id ?? 0"
      :event-locale="eventLocale"
      :has-menu="!!eventsStore.activeEventHasMenu"
    />
    <SeatingClearAllModal
      :open="c.showClearAll.value"
      :count="c.seatedCount.value"
      :saving="c.saving.value"
      @close="c.showClearAll.value = false"
      @confirm="c.confirmClearAll()"
    />

    <SeatingTableFormModal
      :open="c.showFormModal.value"
      :table="c.editingTable.value"
      :saving="c.saving.value"
      @update:open="val => (c.showFormModal.value = val)"
      @save="c.saveTable"
    >
      <template #notice>
        <ModuleTemplateNotice v-if="c.blocked.value" class="mb-4" :event-id="eventsStore.activeEvent?.id" module="seating" :template-name="c.blocked.value.templateName" />
      </template>
    </SeatingTableFormModal>
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
  </UiPage>
</template>
