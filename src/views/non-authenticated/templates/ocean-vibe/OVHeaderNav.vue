<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import OVCWMHamburger from '@/views/non-authenticated/templates/ocean-vibe/SVGs/OVCWMHamburger.vue'

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
        class="hamburger-container p-2 border border-[#D9C2A3]/50 rounded-lg flex items-center justify-center bg-white/70 backdrop-blur focus:outline-none"
      >
        <OVCWMHamburger color="#123B5A" width="24" height="24" @click="toggleMenu" />
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
          class="border-[#D9C2A3]/30 bg-gradient-to-b from-[#123B5A] to-[#2F6F8F] border-y w-[96%] flex items-center justify-center rounded-md flex-col h-full"
        >
          <div
            class="flex-1 px-4 py-5 mx-auto text-white text-center flex items-center justify-center"
          >
            <ul class="space-y-2">
              <li>
                <a class="block p-3" @click="handleClick('#sectionHome')">
                  <p class="font-semibold tracking-wide">Home</p>
                </a>
              </li>
              <li>
                <a class="block p-3" @click="handleClick('#sectionSTD')">
                  <div class="font-semibold tracking-wide">Save the Date</div>
                </a>
              </li>
              <li>
                <a class="block p-3" @click="handleClick('#sectionItinerario')">
                  <div class="font-semibold tracking-wide">Itinerario</div>
                </a>
              </li>
              <li>
                <a class="block p-3" @click="handleClick('#sectionSweetMemories')">
                  <div class="font-semibold tracking-wide">Sweet Memories</div>
                </a>
              </li>
              <li>
                <a class="block p-3 rounded-lg" @click="handleClick('#sectionRSVP')">
                  <div class="font-semibold tracking-wide">RSVP</div>
                </a>
              </li>
              <li>
                <a class="block p-3 rounded-lg" @click="handleClick('#sectionSong')">
                  <div class="font-semibold tracking-wide">Canciones</div>
                </a>
              </li>
              <li>
                <a class="block p-3 rounded-lg" @click="handleClick('#sectionComments')">
                  <div class="font-semibold tracking-wide">Comentarios</div>
                </a>
              </li>
              <li>
                <a class="block p-3 rounded-lg" @click="handleClick('#sectionContact')">
                  <div class="font-semibold tracking-wide">Contacto</div>
                </a>
              </li>
            </ul>
          </div>
          <!-- Subtle divider line -->
          <div class="w-4/5 h-[1px] bg-[#D9C2A3]/30 mb-4"></div>
          <div class="header-log flex justify-center mt-auto mb-8">
            <p
              class="text-5xl font-bold leading-[1.2] py-2 relative top-[2px] font-white font-gvibes mt-2"
            >
              Mis Quinces
            </p>
          </div>
        </div>
      </nav>
    </Transition>
  </header>

  <header
    id="page-header"
    class="hidden lg:flex flex items-center justify-center py-2 fixed top-0 left-0 w-full shadow-md bg-[#F6FBFD] border-b border-[#D9C2A3]/25 z-50"
  >
    <div class="header-navigation flex items-center gap-x-8 font-Jost">
      <nav class="">
        <ul class="flex gap-x-6">
          <li
            class="cursor-pointer text-[#123B5A]/80 hover:text-[#2F6F8F] hover:underline decoration-[#D9C2A3] transition-colors duration-300 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] rounded"
            :class="{
              'text-[#2F6F8F] underline decoration-[#D9C2A3] decoration-2 underline-offset-4':
                currentHash === '#sectionHome'
            }"
          >
            <a href="#sectionHome">HOME</a>
          </li>
          <li
            class="cursor-pointer text-[#123B5A]/80 hover:text-[#2F6F8F] hover:underline decoration-[#D9C2A3] transition-colors duration-300 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] rounded"
            :class="{
              'text-[#2F6F8F] underline decoration-[#D9C2A3] decoration-2 underline-offset-4':
                currentHash === '#sectionSTD'
            }"
          >
            <a href="#sectionSTD">SAVE THE DATE</a>
          </li>
          <li
            class="cursor-pointer text-[#123B5A]/80 hover:text-[#2F6F8F] hover:underline decoration-[#D9C2A3] transition-colors duration-300 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] rounded"
            :class="{
              'text-[#2F6F8F] underline decoration-[#D9C2A3] decoration-2 underline-offset-4':
                currentHash === '#sectionItinerario'
            }"
          >
            <a href="#sectionItinerario">ITINERARIO</a>
          </li>
          <li
            class="cursor-pointer text-[#123B5A]/80 hover:text-[#2F6F8F] hover:underline decoration-[#D9C2A3] transition-colors duration-300 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] rounded"
            :class="{
              'text-[#2F6F8F] underline decoration-[#D9C2A3] decoration-2 underline-offset-4':
                currentHash === '#sectionSweetMemories'
            }"
          >
            <a href="#sectionSweetMemories">SWEET MEMORIES</a>
          </li>
        </ul>
      </nav>
      <div class="header-log">
        <p
          class="text-5xl font-bold leading-[1.2] py-2 relative top-[2px] text-transparent bg-clip-text bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] font-gvibes"
        >
          Mis Quinces
        </p>
      </div>
      <nav>
        <ul class="flex gap-x-6">
          <li
            class="cursor-pointer text-[#123B5A]/80 hover:text-[#2F6F8F] hover:underline decoration-[#D9C2A3] transition-colors duration-300 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] rounded"
            :class="{
              'text-[#2F6F8F] underline decoration-[#D9C2A3] decoration-2 underline-offset-4':
                currentHash === '#sectionRSVP'
            }"
          >
            <a href="#sectionRSVP">RSVP</a>
          </li>
          <li
            class="cursor-pointer text-[#123B5A]/80 hover:text-[#2F6F8F] hover:underline decoration-[#D9C2A3] transition-colors duration-300 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] rounded"
            :class="{
              'text-[#2F6F8F] underline decoration-[#D9C2A3] decoration-2 underline-offset-4':
                currentHash === '#sectionSong'
            }"
          >
            <a href="#sectionSong">CANCIONES</a>
          </li>
          <li
            class="cursor-pointer text-[#123B5A]/80 hover:text-[#2F6F8F] hover:underline decoration-[#D9C2A3] transition-colors duration-300 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] rounded"
            :class="{
              'text-[#2F6F8F] underline decoration-[#D9C2A3] decoration-2 underline-offset-4':
                currentHash === '#sectionComments'
            }"
          >
            <a href="#sectionComments">COMENTARIOS</a>
          </li>
          <li
            class="cursor-pointer text-[#123B5A]/80 hover:text-[#2F6F8F] hover:underline decoration-[#D9C2A3] transition-colors duration-300 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] rounded"
            :class="{
              'text-[#2F6F8F] underline decoration-[#D9C2A3] decoration-2 underline-offset-4':
                currentHash === '#sectionContact'
            }"
          >
            <a href="#sectionContact">CONTACTO</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
@media screen and (max-width: 1093px) {
  .header-navigation {
    font-size: 13px;
  }
}
</style>
