<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, Users } from 'lucide-vue-next'
import { UiButton, UiSelect, UiPagination, UiEmptyState, UiSkeleton, useToast } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { useUserStore } from '@/stores/useUserStore'
import { GUEST_FILTERS, PER_PAGE_OPTIONS, chosenName, filterCount, totalPages } from '@/modules/menus/utils/menus'

defineProps({ loading: { type: Boolean, default: false } })

const { t } = useI18n()
const toast = useToast()
const menuStore = useMenusStore()
const userStore = useUserStore()
const reloading = ref(false)
const exporting = ref(false)

const perPageOptions = PER_PAGE_OPTIONS.map(n => ({ value: n, label: String(n) }))
const pages = computed(() => totalPages(menuStore.guestsMeta))

const filters = computed(() =>
  GUEST_FILTERS.map(value => ({ value, label: t(`app.menus.filters.${value}`), count: filterCount(menuStore.summary, value) }))
)

const reload = async action => {
  reloading.value = true
  try {
    await action()
  } catch {
    toast.error(t('app.menus.loadError'))
  } finally {
    reloading.value = false
  }
}

const onFilter = filter => {
  if (filter === menuStore.guestsFilter || reloading.value) return
  return reload(() => menuStore.setGuestsFilter(filter))
}

const onPage = page => {
  menuStore.pageSelected = page
  return reload(() => menuStore.loadGuestsMenu())
}

const onPerPage = value => {
  menuStore.perPage = Number(value)
  menuStore.pageSelected = 1
  return reload(() => menuStore.loadGuestsMenu())
}

const exportMenu = async () => {
  exporting.value = true
  try {
    const response = await menuStore.exportGuestsMenu()
    if (response.status !== 200) throw new Error('export failed')
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guest-menus-${userStore.activeEvent}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  } catch {
    toast.error(t('app.menus.exportError'))
  } finally {
    exporting.value = false
  }
}

const COURSES = [
  { key: 'starterName', label: 'app.menus.types.starter' },
  { key: 'mainName', label: 'app.menus.types.main' },
  { key: 'dessertName', label: 'app.menus.types.dessert' }
]

/** The courses a guest picked, in order; a course nobody picked is left out. */
const choicesOf = guest => COURSES.map(c => ({ label: t(c.label), value: chosenName(guest[c.key]) })).filter(c => c.value)
const emptyList = computed(() => !menuStore.guestsMenu.length)
const emptyAll = computed(() => emptyList.value && menuStore.guestsFilter === 'all')
</script>

<template>
  <div v-if="loading && emptyList" class="space-y-3">
    <UiSkeleton class="h-20" />
    <UiSkeleton class="h-20" />
  </div>

  <UiEmptyState v-else-if="emptyAll" :title="t('app.menus.guestsEmptyTitle')" :description="t('app.menus.guestsEmptyText')">
    <template #icon><Users class="h-6 w-6" aria-hidden="true" /></template>
  </UiEmptyState>

  <div v-else>
    <div class="flex flex-wrap items-center gap-2 fab-safe" role="group" :aria-label="t('app.menus.filtersLabel')">
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        data-testid="guest-filter"
        :aria-pressed="menuStore.guestsFilter === filter.value"
        :class="[
          'touch-target relative inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-rose-600',
          menuStore.guestsFilter === filter.value ? 'border-ink-900 bg-ink-900 text-white' : 'border-cream-300 bg-white text-ink-700 hover:bg-cream-100'
        ]"
        @click="onFilter(filter.value)"
      >
        {{ filter.label }}
        <span v-if="filter.count !== null" class="tabular-nums opacity-70">{{ filter.count }}</span>
      </button>
      <UiButton variant="secondary" size="sm" class="ml-auto shrink-0" :loading="exporting" @click="exportMenu">
        <Download class="h-4 w-4" aria-hidden="true" />
        {{ t('app.menus.export') }}
      </UiButton>
    </div>

    <div class="mt-2.5 overflow-hidden rounded-xl border border-line bg-white shadow-card" :class="reloading && 'opacity-60'">
      <div class="hidden grid-cols-[minmax(0,1.2fr)_130px_minmax(0,2.6fr)] gap-3.5 bg-cream-50 px-4 py-[9px] text-[11px] font-semibold uppercase tracking-[.06em] text-ink-500 md:grid" aria-hidden="true">
        <span>{{ t('app.menus.colGuest') }}</span>
        <span>{{ t('app.menus.colMenu') }}</span>
        <span>{{ t('app.menus.colChoice') }}</span>
      </div>
      <p v-if="emptyList" class="px-4 py-6 text-center text-sm text-ink-500" data-testid="guests-filter-empty">{{ t(`app.menus.filterEmpty.${menuStore.guestsFilter}`) }}</p>
      <ul v-else data-testid="guest-list">
        <li
          v-for="guest in menuStore.guestsMenu"
          :key="guest.id"
          data-testid="guest-row"
          class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1 border-t border-black/[.06] py-3 pl-3.5 pr-3.5 first:border-t-0 md:grid-cols-[minmax(0,1.2fr)_130px_minmax(0,2.6fr)] md:gap-x-3.5 md:py-[11px] md:px-4"
        >
          <p class="min-w-0 text-sm font-medium text-ink-900 [overflow-wrap:anywhere]" :title="guest.email || undefined" data-testid="guest-name">{{ guest.name }}</p>
          <span
            v-if="guest.hasChosen && guest.menuName"
            data-testid="guest-menu"
            :title="guest.menuName"
            class="max-w-[10rem] justify-self-end truncate whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 md:max-w-full md:justify-self-start"
            >{{ guest.menuName }}</span
          >
          <span
            v-else
            data-testid="guest-menu-none"
            class="justify-self-end whitespace-nowrap rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-semibold text-ink-500 md:justify-self-start"
            >{{ t('app.menus.notChosen') }}</span
          >
          <p
            v-if="choicesOf(guest).length"
            data-testid="guest-choices"
            class="col-span-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] text-ink-900 md:col-span-1"
          >
            <span v-for="choice in choicesOf(guest)" :key="choice.label" class="min-w-0 [overflow-wrap:anywhere]"
              ><span class="text-ink-500">{{ choice.label }}:</span> {{ choice.value }}</span
            >
          </p>
        </li>
      </ul>
    </div>

    <div class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div class="flex items-center gap-3">
        <span id="menus-per-page" class="whitespace-nowrap text-sm text-ink-700">{{ t('app.menus.perPage') }}</span>
        <UiSelect :model-value="menuStore.perPage" :options="perPageOptions" class="w-24" aria-labelledby="menus-per-page" @update:model-value="onPerPage" />
      </div>
      <UiPagination v-if="pages > 1" :page="menuStore.pageSelected" :pages="pages" @update:page="onPage" />
    </div>
  </div>
</template>
