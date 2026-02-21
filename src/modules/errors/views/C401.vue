<script setup>
import { useRouter } from 'vue-router'
import { LogIn } from 'lucide-vue-next'

import ErrorLayout from '@/modules/errors/views/ErrorLayout.vue'
import ErrorState from '@/modules/errors/components/ErrorState.vue'

const router = useRouter()

const goLogin = () => router.push('/login')
const goHome = () => router.push('/')
</script>

<template>
  <ErrorLayout title="Session Required" subtitle="You must be logged in to continue.">
    <ErrorState
      :icon="LogIn"
      icon-bg-class="bg-amber-50"
      icon-color-class="text-amber-600"
      title="Authentication Required"
      message="Your session has expired or you are not logged in."
      hint="Please sign in to continue using the platform."
      primary-action-text="Go to Login"
      secondary-action-text="Go to Home"
      @primary="goLogin"
      @secondary="goHome"
    />
  </ErrorLayout>
</template>
