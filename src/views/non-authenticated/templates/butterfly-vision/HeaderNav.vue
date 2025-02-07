<script setup></script>

<template>
  <header
    id="page-header"
    class="flex items-center justify-center py-2 fixed top-0 left-0 w-full shadow-md bg-white z-50"
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
          <li class="cursor-pointer text-gold transition-colors duration-300">
            <a href="#sectionRSVP">RSVP</a>
          </li>
          <li class="cursor-pointer text-gold transition-colors duration-300">
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

.text-gold {
  color: #f3a40a;

  &:hover {
    color: #a67004;
  }
}
</style>
