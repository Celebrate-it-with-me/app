<script setup lang="ts">
import Title from '@/components/UI/Title.vue'
import SignUpForm from '@/components/sign-up/SignUpForm.vue'
import SignInForm from '@/components/sign-in/SignInForm.vue'
</script>

<template>
  <section class="sign-up w-full h-full">
    <div class=" min-w-[600px] min-h-[600px] flex flex-row gap-x-5 justify-center items-center">
      <div class="register-titles w-1/2 p-10 flex flex-col">
        <Title
          :level="'h1'"
          :classes="'text-3xl text-white md:text-4xl font-bold leading-tight mb-6'"
        >
          Celebrate it with <span class="text-yellow-300">me!</span>
        </Title>

        <Title
          :level="'h4'"
          :classes="'text-lg md:text-xl text-gray-500 mb-8'"
        >
          Log in to reconnect, discover new experiences, and make every moment unforgettable. Welcome back!
        </Title>
      </div>

      <SignInForm />

    </div>
  </section>
</template>
