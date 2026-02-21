<script setup>
import { useRouter } from 'vue-router'
import { ShieldOff } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const router = useRouter()

const goDashboard = () => router.push('/dashboard')
const goBack = () => router.back()
</script>

<template>
  <ErrorLayout title="Access Denied" subtitle="You don’t have permission to view this page.">
    <ErrorState
      :icon="ShieldOff"
      icon-bg-class="bg-red-50"
      icon-color-class="text-red-600"
      title="Access Denied"
      message="You do not have permission to access this resource."
      hint="If you believe this is a mistake, contact the event owner or try switching events."
      primary-action-text="Back to Dashboard"
      secondary-action-text="Go Back"
      @primary="goDashboard"
      @secondary="goBack"
    />
  </ErrorLayout>
</template>
