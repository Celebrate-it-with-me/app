<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard, UiButton } from '@/ui'
import DeleteAccountDialog from './DeleteAccountDialog.vue'

const { t } = useI18n()
const open = ref(false)
</script>

<template>
  <UiCard :title="t('accountDeletion.zoneTitle')" :subtitle="t('accountDeletion.zoneText')" heading-level="h2" class="border-danger-500/30">
    <div class="fab-safe">
      <UiButton variant="danger" class="w-full sm:w-auto" @click="open = true">{{ t('accountDeletion.open') }}</UiButton>
    </div>
    <DeleteAccountDialog v-model:open="open" />
  </UiCard>
</template>
