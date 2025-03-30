<script setup lang="ts">

</script>

<template>
  <div class="itinerario-container bg-gray-200 mx-auto flex justify-center w-full h-screen min-h-screen bg-pink-300 p-8">
    <div class="timeline-container relative w-full md:w-1/2 wrap overflow-hidden py-10 px-2 bg-gray-200/40 rounded-lg">
      <h2 class="text-gray-900 text-center mb-2 font-bold text-5xl font-gvibes">Itinerario</h2>
      <div class="border-2-2 absolute border-opacity-20 border-gray-700 h-full border" style="left: 50%"></div>
      <!-- right timeline -->
      <div class=" flex flex-col justify-between h-full">
        <div class="mb-8 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12"></div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto font-semibold text-lg text-white">1</h1>
          </div>
          <div class="order-1 bg-[#a377e8] rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-white text-md">Cocktail</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-white text-opacity-100">7:00pm-8:00pm</p>
          </div>
        </div>

        <!-- left timeline -->
        <div class="mb-8 flex justify-between flex-row-reverse items-center w-full left-timeline">
          <div class="order-1 w-5/12"></div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto text-white font-semibold text-lg">2</h1>
          </div>
          <div class="order-1 gold-metallic-animated rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-gray-800 text-xl">Ceremonia</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-gray-600 text-opacity-100">8:00pm-9:30pm</p>
          </div>
        </div>

        <!-- right timeline -->
        <div class="mb-8 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12"></div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto font-semibold text-lg text-white">3</h1>
          </div>
          <div class="order-1 bg-[#a377e8] rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-white text-lg">Cena</h3>
            <p class="text-sm leading-snug tracking-wide text-white text-opacity-100">9:30pm-10:30pm</p>
          </div>
        </div>

        <!-- left timeline -->
        <div class="mb-8 flex justify-between flex-row-reverse items-center w-full left-timeline">
          <div class="order-1 w-5/12"></div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto text-white font-semibold text-lg">4</h1>
          </div>
          <div class="order-1 gold-metallic-animated rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-gray-800 text-lg">Baile Sorpresa</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-gray-600 text-opacity-100">10:30pm-11:00pm</p>
          </div>
        </div>

        <div class="mb-8 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12"></div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto font-semibold text-lg text-white">5</h1>
          </div>
          <div class="order-1 bg-[#a377e8] rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-white text-lg">Hora Loca</h3>
            <p class="text-sm leading-snug tracking-wide text-white text-opacity-100">11:00pm</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.itinerario-container {
  background-image: url("@/assets/images/img/itinerario.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.gold-metallic-animated {
  background: linear-gradient(
    45deg,
    #B8860B 0%,
    #FFD700 35%,
    #FFFDE7 50%,
    #FFD700 65%,
    #B8860B 100%
  );
  background-size: 200% 200%;
}

@keyframes goldShimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

</style>
