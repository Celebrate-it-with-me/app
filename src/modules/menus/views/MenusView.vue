<script setup>
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { UiPageHeader, UiButton, UiBadge } from '@/ui'
import MenusTable from '@/modules/menus/components/MenusTable.vue'
import GuestsMenu from '@/modules/menus/components/GuestsMenu.vue'
import { useMenusView } from '@/modules/menus/composables/useMenusView'

const { t } = useI18n()
const { loading, guestMenuCount, createMenu } = useMenusView()
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <UiPageHeader :title="t('app.menus.title')" :subtitle="t('app.menus.subtitle')">
      <template #actions>
        <UiButton :disabled="loading" @click="createMenu">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.menus.add') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <section class="mt-6" aria-labelledby="menus-options-title">
      <h2 id="menus-options-title" class="font-heading text-xl text-ink-900">{{ t('app.menus.optionsTitle') }}</h2>
      <MenusTable class="mt-3" :loading="loading" />
    </section>

    <section class="mt-10" aria-labelledby="menus-guests-title">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="menus-guests-title" class="font-heading text-xl text-ink-900">{{ t('app.menus.guestsTitle') }}</h2>
        <UiBadge v-if="guestMenuCount">{{ t('app.menus.guestCount', { n: guestMenuCount }, guestMenuCount) }}</UiBadge>
      </div>
      <GuestsMenu class="mt-3" :loading="loading" />
    </section>
  </div>
</template>
