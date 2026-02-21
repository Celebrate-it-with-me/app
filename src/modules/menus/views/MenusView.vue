<template>
  <div class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <CHeading
            :level="1"
            weight="black"
            class="text-4xl md:text-5xl text-gray-900 dark:text-white tracking-tight mb-3"
          >
            Event <span class="text-rose">Menus</span>
          </CHeading>
          <p class="text-gray-500 dark:text-gray-400 max-w-xl text-lg leading-relaxed">
            Manage your event menus and track guest selections. Create multiple menu options for
            your guests to choose from.
          </p>
        </div>

        <div class="flex flex-shrink-0">
          <CButton
            variant="gradient"
            class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white shadow-xl shadow-rose/20 px-8 h-14 rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
            :disabled="loading"
            @click="createMenu"
          >
            <PlusCircle class="w-5 h-5 mr-2" />
            <span class="font-bold">Add Menu</span>
          </CButton>
        </div>
      </div>
    </div>

    <!-- Event Menus Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <CHeading :level="2" weight="semibold" class="text-2xl">Menu Options</CHeading>
      </div>
      <MenusTable ref="menusTableRef" @loading="setLoading" />
    </section>

    <!-- Guest Menu Selection Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <CHeading :level="2" weight="semibold" class="text-2xl">Guest Menu Selection</CHeading>
        <div class="flex items-center">
          <span v-if="guestMenuCount" class="text-sm text-gray-600 dark:text-gray-400 mr-4">
            {{ guestMenuCount }} guest selections
          </span>
        </div>
      </div>
      <GuestsMenu ref="guestsMenuRef" @loading="setLoading" />
    </section>
  </div>
</template>

<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { PlusCircle } from 'lucide-vue-next'
import MenusTable from '@/modules/menus/components/MenusTable.vue'
import GuestsMenu from '@/modules/menus/components/GuestsMenu.vue'
import { useMenusView } from '@/modules/menus/composables/useMenusView'

const { loading, menusTableRef, guestsMenuRef, guestMenuCount, createMenu, setLoading } =
  useMenusView()
</script>
