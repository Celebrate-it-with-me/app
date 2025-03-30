<script setup>
import CWMHamburger from '@/views/non-authenticated/templates/butterfly-vision/SVGs/CWMHamburger.vue'
</script>

<template>
  <header
    class="header__nav-mobile md:hidden flex items-center justify-end fixed
           top-[25px] left-[-25px] w-full z-50"
  >
    <div
      class="hamburger-container p-2 border border-rose-200 rounded-lg
             flex items-center justify-center bg-rose-100/30 focus:outline-none"
    >
      <CWMHamburger
        color="#800080"
        width="24"
        height="24"
      />
    </div>
  </header>
  <header
    id="page-header"
    class="hidden md:flex flex items-center justify-center py-2 fixed
           top-0 left-0 w-full shadow-md bg-white z-50"
  >
    <div class="header-navigation flex items-center gap-x-4 font-Jost">
      <nav class="">
        <ul class="flex gap-x-4">
          <li class="cursor-pointer text-rose transition-colors duration-300">
            <a href="#sectionHome">HOME</a>
          </li>
          <li class="cursor-pointer text-rose transition-colors duration-300">
            <a href="#sectionGallery">GALLERY</a>
          </li>
        </ul>
      </nav>
      <div class="header-log">
        <img src="@/assets/images/img/logo2.svg" alt="" />
      </div>
      <nav>
        <ul class="flex gap-x-4">
          <li class="cursor-pointer text-rose transition-colors duration-300">
            <a href="#sectionRSVP">RSVP</a>
          </li>
          <li class="cursor-pointer text-rose transition-colors duration-300">
            <a href="#sectionEvent">EVENT</a>
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
</style>
