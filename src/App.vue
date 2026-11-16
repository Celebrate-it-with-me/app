<script setup lang="ts">
import { RouterView } from 'vue-router'
import { UiToaster } from '@/ui'
import MaintenanceNotice from '@/modules/maintenance/components/MaintenanceNotice.vue'
</script>

<template>
  <MaintenanceNotice />
  <RouterView />
  <UiToaster />
</template>
