<script setup lang="ts">
import { RouterView } from 'vue-router'
import { UiToaster } from '@/ui'
import MaintenanceNotice from '@/modules/maintenance/components/MaintenanceNotice.vue'
import EmailVerifyDialog from '@/modules/email-verification/components/EmailVerifyDialog.vue'
</script>

<template>
  <MaintenanceNotice />
  <RouterView />
  <EmailVerifyDialog />
  <UiToaster />
</template>
