<script setup lang="ts">
import { RouterView } from 'vue-router'
import CWMNotification from '@/components/UI/cwmNotification/CWMNotification.vue'
import { UiToaster } from '@/ui'
import MaintenanceNotice from '@/modules/maintenance/components/MaintenanceNotice.vue'
import 'animate.css'
</script>

<template>
  <MaintenanceNotice />
  <RouterView />
  <CWMNotification />
  <UiToaster />
</template>
