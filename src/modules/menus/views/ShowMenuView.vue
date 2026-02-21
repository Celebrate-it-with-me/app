<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import MenuItem from '@/modules/menus/components/MenuItem.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CAddMenuItemModal from '@/components/UI/modals/CAddMenuItemModal.vue'
import { useShowMenuController } from '@/modules/menus/composables/useShowMenuController'

const {
  menuStore,
  loading,
  openItemForm,
  starterMenuItems,
  mainMenuItems,
  desertMenuItems,
  addNewMenu,
  menuSelected,
  handleAddMenuItem,
  goToEditMenu,
  handleAddItem
} = useShowMenuController()
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold" class="text-3xl tracking-tight">
        Menu <span class="text-rose">Details</span>
      </CHeading>
      <CButton
        variant="gradient"
        class="bg-gradient-to-r from-rose to-rose-dark text-white px-6 rounded-xl shadow-lg shadow-rose/20"
        @click="addNewMenu"
      >
        + Add Menu
      </CButton>
    </div>

    <section
      v-if="menuSelected"
      class="mx-auto bg-white dark:bg-gray-900/50 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-12"
    >
      <div class="menu-title text-center space-y-4">
        <CHeading :level="3" weight="black" class="text-4xl text-gray-900 dark:text-white">
          {{ menuSelected?.title ?? '' }}
        </CHeading>
        <p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {{ menuSelected?.description ?? '' }}
        </p>

        <div class="pt-6 flex justify-center gap-4">
          <CButton
            class="px-8 h-12 rounded-xl font-bold transition-all hover:-translate-y-0.5"
            @click="handleAddMenuItem"
          >
            Add Menu Item
          </CButton>

          <CButton
            variant="secondary"
            class="px-8 h-12 rounded-xl font-bold border-2 transition-all hover:-translate-y-0.5"
            @click="goToEditMenu"
          >
            Edit Settings
          </CButton>
        </div>
      </div>

      <CLoading v-if="loading" />

      <div class="space-y-16">
        <div v-if="starterMenuItems.length" class="menu-sections">
          <div class="flex items-center gap-4 mb-8">
            <h3 class="text-2xl font-black text-rose uppercase tracking-widest">Starters</h3>
            <div class="h-px flex-1 bg-gradient-to-r from-rose/20 to-transparent"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(item, index) in starterMenuItems" :key="index">
              <MenuItem :item="item" />
            </div>
          </div>
        </div>

        <div v-if="mainMenuItems.length" class="menu-sections">
          <div class="flex items-center gap-4 mb-8">
            <h3 class="text-2xl font-black text-rose uppercase tracking-widest">Main Course</h3>
            <div class="h-px flex-1 bg-gradient-to-r from-rose/20 to-transparent"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(item, index) in mainMenuItems" :key="index">
              <MenuItem :item="item" />
            </div>
          </div>
        </div>

        <div v-if="desertMenuItems.length" class="menu-sections">
          <div class="flex items-center gap-4 mb-8">
            <h3 class="text-2xl font-black text-rose uppercase tracking-widest">Desserts</h3>
            <div class="h-px flex-1 bg-gradient-to-r from-rose/20 to-transparent"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(item, index) in desertMenuItems" :key="index">
              <MenuItem :item="item" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <CAddMenuItemModal
    v-model="openItemForm"
    :menu="menuStore.currentMenu"
    @close="openItemForm = false"
    @submitted="handleAddItem"
  />
</template>
