<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { onMounted, ref } from 'vue'
import HeaderNav from '@/views/non-authenticated/templates/butterfly-vision/HeaderNav.vue'
import HeroSection from '@/views/non-authenticated/templates/butterfly-vision/HeroSection.vue'
import SaveTheDate from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDate.vue'

const templateStore = useTemplateStore()
const showScrollBtn = ref(false)

onMounted(() => {
  showHideScrollButton()
})

const showHideScrollButton = () => {
  window.addEventListener('scroll', () => {
    showScrollBtn.value = window.scrollY > 200;
  })
}

const handleMoveToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

</script>

<template>
  <div class="bg-red-50/10 font-jost h-full min-h-screen">
    <main class="container mx-auto">
      <HeaderNav />

      <HeroSection />

      <SaveTheDate class="mt-10"/>
    </main>
  </div>

  <button
    id="scrollToTopBtn"
    v-if="showScrollBtn"
    class="fixed w-10 h-10 bottom-5 right-5 bg-rose-200 border border-rose-600 text-white text-lg text-bold
            rounded-full shadow-lg hover:bg-rose-600 focus:outline-none hidden"
    @click="handleMoveToTop"
  >
    ↑
  </button>
</template>

<style>
html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  background-color: white;
}

@font-face {
  font-family: 'Jost';
  src: url('@/assets/fonts/Jost-VariableFont_wght.ttf') format('truetype');
}

@font-face {
  font-family: 'Monallesia';
  src: url('@/assets/fonts/monallesiascript.woff2') format("woff");
}

@font-face {
  font-family: 'Great Vibes';
  src: url('@/assets/fonts/GreatVibes-Regular.ttf') format("truetype");
}

section {
  scroll-margin-top: 80px;
}
</style>
