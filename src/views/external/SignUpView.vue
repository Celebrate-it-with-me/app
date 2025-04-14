<template>
  <section class="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
    <CCard class="max-w-md w-full p-8 shadow-xl">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-display font-bold text-primary">Join Celebrateitwithme</h1>
        <p class="text-sm text-text-light">Create your account and start planning unforgettable events.</p>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <CInput label="Full Name" placeholder="Enter your full name" v-model="form.name" />
        <CInput label="Email" type="email" placeholder="Enter your email" v-model="form.email" />
        <CInput label="Password" type="password" placeholder="Choose a password" v-model="form.password" />

        <CSelect
          label="Select Plan"
          v-model="form.plan"
          :options="plans"
          placeholder="Choose your plan"
        />

        <CButton full type="submit">Sign Up</CButton>
      </form>

      <p class="mt-6 text-center text-sm text-text-light">
        Already have an account?
        <a href="/login" class="text-primary font-medium hover:underline">Sign in</a>
      </p>
    </CCard>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const plans = [
  { label: 'Basic', value: 'basic' },
  { label: 'Premium', value: 'premium' },
  { label: 'Luxury', value: 'luxury' }
]

const form = reactive({
  name: '',
  email: '',
  password: '',
  plan: ''
})

const submitForm = () => {
  console.log('Signup submitted:', form)
}
</script>
