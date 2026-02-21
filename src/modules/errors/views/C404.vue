<script setup>
import { useRouter } from 'vue-router'
import { SearchX } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const router = useRouter()

const goDashboard = () => router.push('/dashboard')
const goBack = () => router.back()
</script>

<template>
  <ErrorLayout title="Page Not Found" subtitle="The resource you are looking for does not exist.">
    <ErrorState
      :icon="SearchX"
      icon-bg-class="bg-blue-50"
      icon-color-class="text-blue-600"
      title="404 — Not Found"
      message="We couldn’t find the page or resource you requested."
      hint="It may have been deleted, moved, or the link is incorrect."
      primary-action-text="Back to Dashboard"
      secondary-action-text="Go Back"
      @primary="goDashboard"
      @secondary="goBack"
    />
  </ErrorLayout>
</template>
