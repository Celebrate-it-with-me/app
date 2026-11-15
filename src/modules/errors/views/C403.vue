<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ShieldOff } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const { t } = useI18n()
const router = useRouter()

const goDashboard = () => router.push('/dashboard')
const goBack = () => router.back()
</script>

<template>
  <ErrorLayout :title="t('errorPages.c403.heading')" :subtitle="t('errorPages.c403.subheading')">
    <ErrorState
      :icon="ShieldOff"
      icon-bg-class="bg-red-50"
      icon-color-class="text-red-600"
      :title="t('errorPages.c403.title')"
      :message="t('errorPages.c403.message')"
      :hint="t('errorPages.c403.hint')"
      :primary-action-text="t('errorPages.c403.primary')"
      :secondary-action-text="t('errorPages.c403.secondary')"
      @primary="goDashboard"
      @secondary="goBack"
    />
  </ErrorLayout>
</template>
