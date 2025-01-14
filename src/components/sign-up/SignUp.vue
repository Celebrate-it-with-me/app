<script setup lang="ts">

import Title from '@/components/UI/Title.vue'
import TextField from '@/components/UI/form/TextField.vue'
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
          Sign up to create, explore, and join unforgettable events. Let's make every moment special!
        </Title>
      </div>
      <div class="sign-up-form w-1/2 bg-gray-800 rounded p-10">
        <h3 class="font-semibold text-xl mb-10 text-white">Let's Start!</h3>
        <form >
          <div class="mb-4">
            <TextField
              :placeholder="'Enter your first name'"
              :name="'first_name'"
              :label="'First Name'"
              :class-label="'block text-gray-300 font-medium mb-2'"
              :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
            ></TextField>
          </div>

          <div class="mb-4">
            <TextField
              :placeholder="'Enter your last name'"
              :name="'last_name'"
              :label="'Last Name'"
              :class-label="'block text-gray-300 font-medium mb-2'"
              :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
            ></TextField>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="block text-gray-300 font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              required
              class="w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4 py-2
                    focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700"
              placeholder="Enter your email"
            />
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label for="password" class="block text-gray-300 font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              required
              class="w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4 py-2
                    focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700"
              placeholder="Enter your password"
            />
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg
                    focus:outline-none focus:border-none focus:ring-2 focus:ring-blue-400"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
