<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">Event Menus</CHeading>
      <CButton variant="primary" @click="createMenu">+ Add Menu</CButton>
    </div>
    <MenusTable />

    <div class="flex items-center justify-between">
      <CHeading :level="3" weight="normal">Guest Menu Selection</CHeading>
    </div>
    <GuestsMenu />
  </div>
</template>

<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useRouter } from 'vue-router'
import MenusTable from '@/views/internal/menus/MenusTable.vue'
import GuestsMenu from '@/views/internal/menus/GuestsMenu.vue'

const router = useRouter()

const createMenu = async () => {
  await router.push('/dashboard/menus/create')
}
</script>
