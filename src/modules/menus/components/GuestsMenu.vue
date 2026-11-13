<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, Users } from 'lucide-vue-next'
import { UiCard, UiButton, UiSelect, UiPagination, UiEmptyState, UiSkeleton, useToast } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { useUserStore } from '@/stores/useUserStore'
import { PER_PAGE_OPTIONS, chosenName, totalPages } from '@/modules/menus/utils/menus'

defineProps({ loading: { type: Boolean, default: false } })

const { t } = useI18n()
const toast = useToast()
const menuStore = useMenusStore()
const userStore = useUserStore()
const reloading = ref(false)
const exporting = ref(false)

const perPageOptions = PER_PAGE_OPTIONS.map(n => ({ value: n, label: String(n) }))
const pages = computed(() => totalPages(menuStore.guestsMeta))

const reload = async () => {
  reloading.value = true
  try {
    await menuStore.loadGuestsMenu()
  } catch {
    toast.error(t('app.menus.loadError'))
  } finally {
    reloading.value = false
  }
}

const onPage = async page => {
  menuStore.pageSelected = page
  await reload()
}

const onPerPage = async value => {
  menuStore.perPage = Number(value)
  menuStore.pageSelected = 1
  await reload()
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
</script>

<template>
  <div v-if="loading && !menuStore.guestsMenu.length" class="space-y-3">
    <UiSkeleton class="h-20" />
    <UiSkeleton class="h-20" />
  </div>

  <UiEmptyState v-else-if="!menuStore.guestsMenu.length" :title="t('app.menus.guestsEmptyTitle')" :description="t('app.menus.guestsEmptyText')">
    <template #icon><Users class="h-6 w-6" aria-hidden="true" /></template>
  </UiEmptyState>

  <div v-else class="space-y-4">
    <div class="flex justify-end">
      <UiButton variant="secondary" :loading="exporting" @click="exportMenu">
        <Download class="h-4 w-4" aria-hidden="true" />
        {{ t('app.menus.export') }}
      </UiButton>
    </div>

    <div :class="reloading && 'opacity-60'">
      <!-- Phones: one card per guest -->
      <ul class="space-y-3 md:hidden">
        <li v-for="guest in menuStore.guestsMenu" :key="guest.id">
          <UiCard>
            <p class="truncate text-base font-medium text-ink-900">{{ guest.name }}</p>
            <p v-if="guest.email" class="truncate text-sm text-ink-500">{{ guest.email }}</p>
            <dl class="mt-3 space-y-1.5 text-sm">
              <div v-for="course in COURSES" :key="course.key" class="flex justify-between gap-3">
                <dt class="text-ink-500">{{ t(course.label) }}</dt>
                <dd class="min-w-0 truncate text-right text-ink-900">{{ chosenName(guest[course.key]) || '—' }}</dd>
              </div>
            </dl>
          </UiCard>
        </li>
      </ul>

      <!-- md and up: table -->
      <UiCard padding="none" class="hidden overflow-hidden md:block">
        <table class="w-full text-left">
          <thead class="border-b border-line bg-cream-100 text-sm text-ink-700">
            <tr>
              <th scope="col" class="px-5 py-3 font-medium">{{ t('app.menus.colGuest') }}</th>
              <th v-for="course in COURSES" :key="course.key" scope="col" class="px-5 py-3 font-medium">{{ t(course.label) }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="guest in menuStore.guestsMenu" :key="guest.id" class="hover:bg-cream-100">
              <td class="px-5 py-3">
                <span class="block font-medium text-ink-900">{{ guest.name }}</span>
                <span v-if="guest.email" class="block text-sm text-ink-500">{{ guest.email }}</span>
              </td>
              <td v-for="course in COURSES" :key="course.key" class="px-5 py-3 text-sm text-ink-900">{{ chosenName(guest[course.key]) || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </UiCard>
    </div>

    <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div class="flex items-center gap-3">
        <span id="menus-per-page" class="whitespace-nowrap text-sm text-ink-700">{{ t('app.menus.perPage') }}</span>
        <UiSelect :model-value="menuStore.perPage" :options="perPageOptions" class="w-24" aria-labelledby="menus-per-page" @update:model-value="onPerPage" />
      </div>
      <UiPagination v-if="pages > 1" :page="menuStore.pageSelected" :pages="pages" @update:page="onPage" />
    </div>
  </div>
</template>
