<script setup>
import bgImage from '@/assets/images/img/1234123.jpg'
</script>

<template>
  <section
    id="sectionHome"
    class="hero-section flex flex-col items-center justify-center w-full mt-24"
  >
    <!-- Hero Section -->
    <div class="hero relative w-full h-screen overflow-hidden">
      <!-- Parallax Background -->
      <div
        class="parallax-bg absolute inset-0 bg-fixed bg-cover bg-center"
        :style="`background-image: url(${bgImage});`"
      ></div>

      <!-- Foreground Content (Mask) -->
      <div class="absolute inset-0">
        <div class="mask-image"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
}

.mask-image {
  width: 100%;
  height: 100%;
  mix-blend-mode: lighten;

  background-image: url("@/assets/images/img/bg.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
