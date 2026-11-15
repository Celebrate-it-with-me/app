<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ServerCrash } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const { t } = useI18n()
const router = useRouter()

const reload = () => window.location.reload()
const goDashboard = () => router.push('/dashboard')
</script>

<template>
  <ErrorLayout :title="t('errorPages.c500.heading')" :subtitle="t('errorPages.c500.subheading')">
    <ErrorState
      :icon="ServerCrash"
      icon-bg-class="bg-rose-50"
      icon-color-class="text-rose-600"
      :title="t('errorPages.c500.title')"
      :message="t('errorPages.c500.message')"
      :hint="t('errorPages.c500.hint')"
      :primary-action-text="t('errorPages.c500.primary')"
      :secondary-action-text="t('errorPages.c500.secondary')"
      @primary="reload"
      @secondary="goDashboard"
    />
  </ErrorLayout>
</template>
