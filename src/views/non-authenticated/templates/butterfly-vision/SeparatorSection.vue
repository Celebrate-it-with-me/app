<script setup lang="ts">

</script>

<template>
  <div
    class="separator-container bg-[#F3EAFFFF] py-10 px-5"
  >
    <p class="text-sm text-gray-800 text-center text-separator font-quicksand">
      <slot></slot>
    </p>
  </div>
</template>

<style scoped>
.text-separator {
  font-weight: 600;
  font-size: 1.1rem; /* 14px */
  line-height: 1.75rem; /* 20px */
  color: #333;
}
</style>
