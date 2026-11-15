<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { AlertTriangle } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const { t } = useI18n()
const router = useRouter()

const goEvents = () => router.push('/dashboard/my-events')
const goDashboard = () => router.push('/dashboard')
</script>

<template>
  <ErrorLayout :title="t('errorPages.c409.heading')" :subtitle="t('errorPages.c409.subheading')">
    <ErrorState
      :icon="AlertTriangle"
      icon-bg-class="bg-orange-50"
      icon-color-class="text-orange-600"
      :title="t('errorPages.c409.title')"
      :message="t('errorPages.c409.message')"
      :hint="t('errorPages.c409.hint')"
      :primary-action-text="t('errorPages.c409.primary')"
      :secondary-action-text="t('errorPages.c409.secondary')"
      @primary="goEvents"
      @secondary="goDashboard"
    />
  </ErrorLayout>
</template>
