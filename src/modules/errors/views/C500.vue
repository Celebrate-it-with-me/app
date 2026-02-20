<script setup>
import { useRouter } from 'vue-router'
import { ServerCrash } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const router = useRouter()

const reload = () => window.location.reload()
const goDashboard = () => router.push('/dashboard')
</script>

<template>
  <ErrorLayout title="Server Error" subtitle="Something went wrong on our side.">
    <ErrorState
      :icon="ServerCrash"
      icon-bg-class="bg-rose-50"
      icon-color-class="text-rose-600"
      title="500 — Unexpected Error"
      message="An unexpected error occurred while processing your request."
      hint="Try again in a few seconds. If the problem persists, contact support."
      primary-action-text="Reload Page"
      secondary-action-text="Back to Dashboard"
      @primary="reload"
      @secondary="goDashboard"
    />
  </ErrorLayout>
</template>
