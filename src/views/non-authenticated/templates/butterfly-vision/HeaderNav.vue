<script setup>
import CWMHamburger from '@/views/non-authenticated/templates/butterfly-vision/SVGs/CWMHamburger.vue'

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)

// Define a reactive variable to store the hash value
const currentHash = computed(() => {
  return route.hash
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleClick = hash => {
  menuOpen.value = false
  if (hash) {
    window.location.hash = hash
  }
}
</script>

<template>
  <header
    class="header__nav-mobile lg:hidden fixed top-0 right-0 z-50 w-full"
    :class="{ 'h-screen': menuOpen }"
  >
    <div class="flex justify-end px-4 pt-6">
      <div
        class="hamburger-container p-2 border border-rose-200 rounded-lg flex items-center justify-center bg-rose-100/30 focus:outline-none"
      >
        <CWMHamburger color="#800080" width="24" height="24" @click="toggleMenu" />
      </div>
    </div>
    <Transition
      enter-active-class="transition ease-out duration-800"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-800"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <nav v-if="menuOpen" class="mt-3 w-full flex justify-center w-full h-[calc(100vh-12%)]">
        <div
          class="border-rose-100 bg-white bg-opacity-95 md:bg-white border-y dark:bg-gray-800 dark:border-gray-600 w-[96%] flex items-center justify-center rounded-md flex-col h-full"
        >
          <div
            class="flex-1 px-4 py-5 mx-auto text-[#744d9d] dark:text-white text-center flex items-center justify-center"
          >
            <ul class="space-y-2">
              <li>
                <a class="block p-3" @click="handleClick('#sectionHome')">
                  <p class="font-semibold">Home</p>
                </a>
              </li>
              <li>
                <a class="block p-3" @click="handleClick('#sectionSTD')">
                  <div class="font-semibold">Save the Date</div>
                </a>
              </li>
              <li>
                <a class="block p-3" @click="handleClick('#sectionItinerario')">
                  <div class="font-semibold">Itinerario</div>
                </a>
              </li>
              <li>
                <a class="block p-3" @click="handleClick('#sectionSweetMemories')">
                  <div class="font-semibold">Sweet Memories</div>
                </a>
              </li>
              <li>
                <a class="block p-3 rounded-lg" @click="handleClick('#sectionRSVP')">
                  <div class="font-semibold">RSVP</div>
                </a>
              </li>
              <li>
                <a class="block p-3 rounded-lg" @click="handleClick('#sectionSong')">
                  <div class="font-semibold">Canciones</div>
                </a>
              </li>
              <li>
                <a class="block p-3 rounded-lg" @click="handleClick('#sectionComments')">
                  <div class="font-semibold">Comentarios</div>
                </a>
              </li>
              <li>
                <a class="block p-3 rounded-lg" @click="handleClick('#sectionContact')">
                  <div class="font-semibold">Contacto</div>
                </a>
              </li>
            </ul>
          </div>
          <div class="header-log flex justify-center mt-auto mb-8">
            <img src="@/assets/images/img/logo2.svg" alt="" />
          </div>
        </div>
      </nav>
    </Transition>
  </header>

  <header
    id="page-header"
    class="hidden lg:flex flex items-center justify-center py-2 fixed top-0 left-0 w-full shadow-md bg-white z-50"
  >
    <div class="header-navigation flex items-center gap-x-4 font-Jost">
      <nav class="">
        <ul class="flex gap-x-4">
          <li
            class="cursor-pointer text-rose transition-colors duration-300"
            :class="{ active: currentHash === '#sectionHome' }"
          >
            <a href="#sectionHome">HOME</a>
          </li>
          <li
            class="cursor-pointer text-rose transition-colors duration-300"
            :class="{ active: currentHash === '#sectionSTD' }"
          >
            <a href="#sectionSTD">SAVE THE DATE</a>
          </li>
          <li
            class="cursor-pointer text-rose transition-colors duration-300"
            :class="{ active: currentHash === '#sectionItinerario' }"
          >
            <a href="#sectionItinerario">ITINERARIO</a>
          </li>
          <li
            class="cursor-pointer text-rose transition-colors duration-300"
            :class="{ active: currentHash === '#sectionSweetMemories' }"
          >
            <a href="#sectionSweetMemories">SWEET MEMORIES</a>
          </li>
        </ul>
      </nav>
      <div class="header-log">
        <img src="@/assets/images/img/logo2.svg" alt="" />
      </div>
      <nav>
        <ul class="flex gap-x-4">
          <li
            class="cursor-pointer text-rose transition-colors duration-300"
            :class="{ active: currentHash === '#sectionRSVP' }"
          >
            <a href="#sectionRSVP">RSVP</a>
          </li>
          <li
            class="cursor-pointer text-rose transition-colors duration-300"
            :class="{ active: currentHash === '#sectionSong' }"
          >
            <a href="#sectionSong">CANCIONES</a>
          </li>
          <li
            class="cursor-pointer text-rose transition-colors duration-300"
            :class="{ active: currentHash === '#sectionComments' }"
          >
            <a href="#sectionComments">COMENTARIOS</a>
          </li>
          <li
            class="cursor-pointer text-rose transition-colors duration-300"
            :class="{ active: currentHash === '#sectionContact' }"
          >
            <a href="#sectionContact">CONTACTO</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.text-rose {
  color: #dba3ff;

  &:hover {
    color: #8e57bd;
  }
}

.cursor-pointer.active {
  color: #6207ac;
}

@media screen and (max-width: 1093px) {
  .header-navigation {
    font-size: 13px;
  }
}
</style>
