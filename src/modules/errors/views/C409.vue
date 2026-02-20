<script setup>
import { useRouter } from 'vue-router'
import { AlertTriangle } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const router = useRouter()

const goEvents = () => router.push('/dashboard/my-events')
const goDashboard = () => router.push('/dashboard')
</script>

<template>
  <ErrorLayout
    title="Conflict Detected"
    subtitle="This resource does not match your current context."
  >
    <ErrorState
      :icon="AlertTriangle"
      icon-bg-class="bg-orange-50"
      icon-color-class="text-orange-600"
      title="409 — Resource Conflict"
      message="This item belongs to a different event or is no longer valid."
      hint="Try switching events or reloading your workspace."
      primary-action-text="My Events"
      secondary-action-text="Dashboard"
      @primary="goEvents"
      @secondary="goDashboard"
    />
  </ErrorLayout>
</template>
