<template>
  <section class="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
    <CCard class="max-w-md w-full p-8 shadow-xl">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-display font-bold text-primary"> Welcome Back</h1>
        <p class="text-sm text-text-light">Sign in to continue planning your event</p>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <CInput label="Email" type="email" placeholder="Enter your email" v-model="form.email" />
        <CInput label="Password" type="password" placeholder="Enter your password" v-model="form.password" />

        <div class="flex justify-between text-sm text-text-light">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.remember" class="form-checkbox" />
            Remember me
          </label>
          <a href="#" class="text-primary hover:underline">Forgot password?</a>
        </div>

        <CButton full type="submit">Sign In</CButton>
      </form>

      <p class="mt-6 text-center text-sm text-text-light">
        Don't have an account?
        <a href="/signup" class="text-primary font-medium hover:underline">Create one</a>
      </p>
    </CCard>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const submitForm = () => {
  console.log('Login submitted:', form)
}
</script>
