<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiField, UiInput, UiSelect } from '@/ui'
import { ALL_YEARS, SORTS } from '@/modules/sweet-memories/utils/memories'

const props = defineProps({
  search: { type: String, default: '' },
  year: { type: String, default: ALL_YEARS },
  sort: { type: String, default: 'newest' },
  years: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:search', 'update:year', 'update:sort'])
const { t } = useI18n()

const yearOptions = computed(() => [
  { value: ALL_YEARS, label: t('app.memories.filters.allYears') },
  ...props.years.map(y => ({ value: String(y), label: String(y) }))
])
const sortOptions = computed(() => SORTS.map(value => ({ value, label: t(`app.memories.filters.${value}`) })))
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_10rem_13rem]">
    <UiField class="col-span-2 sm:col-span-1" :label="t('app.memories.filters.search')">
      <UiInput
        type="search"
        :model-value="search"
        :placeholder="t('app.memories.filters.searchPlaceholder')"
        autocomplete="off"
        @update:model-value="emit('update:search', $event)"
      />
    </UiField>
    <UiField :label="t('app.memories.filters.year')">
      <UiSelect :model-value="year" :options="yearOptions" @update:model-value="emit('update:year', $event)" />
    </UiField>
    <UiField :label="t('app.memories.filters.sort')">
      <UiSelect :model-value="sort" :options="sortOptions" @update:model-value="emit('update:sort', $event)" />
    </UiField>
  </div>
</template>
