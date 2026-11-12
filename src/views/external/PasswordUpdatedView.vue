<script setup>
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'

const { t } = useI18n()
</script>

<template>
  <AuthCard :title="t('auth.updatedTitle')" :subtitle="t('auth.updatedText')">
    <UiButton block to="/sign-in">{{ t('common.signIn') }}</UiButton>
  </AuthCard>
</template>
