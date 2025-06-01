<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
</script>

<template>
  <CCard class="max-w-md w-full p-8 shadow-xl">
    <div>
      <div class="text-center mb-10">
        <div class="image-container mb-4">
          <img
            src="@/assets/images/commons/logo_primary.png"
            alt="Celebrate it with me logo"
            class="w-64 h-auto mx-auto"
          />
        </div>

        <h1 class="text-3xl font-display font-bold text-gray-700 mb-4">Password Updated</h1>
        <p class="text-sm text-text-light">
          Your password has been updated, you can login with your new password.
        </p>
        <div class="flex justify-center mt-4">
          <router-link to="/sign-in">
            <CButton type="button" class="w-full">Sign In</CButton>
          </router-link>
        </div>
      </div>
    </div>
  </CCard>
</template>

<style scoped></style>
