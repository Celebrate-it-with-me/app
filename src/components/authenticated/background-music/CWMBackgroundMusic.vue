<script setup lang="ts">
import CWMBackgroundMusicCreator
  from '@/components/authenticated/background-music/BackgroundMusic/CWMBackgroundMusicCreator.vue'
import CWMBackgroundMusicShow
  from '@/components/authenticated/background-music/BackgroundMusic/CWMBackgroundMusicShow.vue'
</script>

<template>
  <section class="background-music">
    <div
      class="mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <div
        class="flex flex-row gap-x-4 "
      >
        <CWMBackgroundMusicCreator />

        <CWMBackgroundMusicShow />
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
