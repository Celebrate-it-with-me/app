<script setup lang="ts">

</script>

<template>
  <header class="flex items-center justify-center py-2 w-full">
    <div class="header-logo flex flex-row justify-between items-center w-full">
      <h4 class="text-2xl">Celebrateitwithme Logo</h4>
      <nav>
        <ul class="cursor-pointer flex gap-x-4 justify-center items-center">
          <router-link
            :to="'sign-in'"
            tag="li"
            class="text-gray-500 hover:text-white text-md"
          >
            Sign In
          </router-link>
          <router-link
            :to="'/sign-up'"
            tag="li"
            class="bg-blue-500 py-2 px-5 rounded-md hover:bg-blue-700 font-semibold text-white"
          >
            Sign Up
          </router-link>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>

</style>
