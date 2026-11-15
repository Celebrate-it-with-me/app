<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { LogIn } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const { t } = useI18n()
const router = useRouter()

const goLogin = () => router.push('/login')
const goHome = () => router.push('/')
</script>

<template>
  <ErrorLayout :title="t('errorPages.c401.heading')" :subtitle="t('errorPages.c401.subheading')">
    <ErrorState
      :icon="LogIn"
      icon-bg-class="bg-amber-50"
      icon-color-class="text-amber-600"
      :title="t('errorPages.c401.title')"
      :message="t('errorPages.c401.message')"
      :hint="t('errorPages.c401.hint')"
      :primary-action-text="t('errorPages.c401.primary')"
      :secondary-action-text="t('errorPages.c401.secondary')"
      @primary="goLogin"
      @secondary="goHome"
    />
  </ErrorLayout>
</template>
