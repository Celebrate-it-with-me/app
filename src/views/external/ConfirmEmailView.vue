<template>
  <section class="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900 px-4">
    <CCard class="max-w-md w-full text-center p-8 shadow-xl">
      <div v-if="loading" class="text-gray-500 dark:text-gray-300">
        Confirming your email...
      </div>

      <div v-else-if="success" class="flex flex-col text-green-600 dark:text-green-400">
        Your email has been confirmed successfully!
        <CButton class="mt-6" @click="goToLogin">Go to Login</CButton>
      </div>

      <div v-else class="flex flex-col text-red-500 dark:text-red-400">
        The confirmation link is invalid or has expired.
        <CButton class="mt-6" @click="goToHome">Back to Home</CButton>
      </div>
    </CCard>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useUserStore } from '@/stores/useUserStore'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const userStore = useUserStore()

onMounted(async () => {
  await confirmEmail()
})

const goToLogin = () => {
  router.push('/sign-in')
}

const goToHome = () => {
  router.push('/')
}

const confirmEmail = async () => {
  try {
    const confirmUrl = decodeURIComponent(route.query.confirm)

    console.log('checkin url', confirmUrl)
    if (!confirmUrl) {
      loading.value = false
      return
    }

    const response = await userStore.confirmEmail(confirmUrl)

    success.value = response.status === 200;
  } catch (error) {
    console.error('Error confirming email:', error)
    success.value = false
  } finally {
    loading.value = false
  }
}

</script>
