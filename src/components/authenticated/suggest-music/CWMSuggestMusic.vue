<script setup>
import CWMMusicPlayer from '@/components/authenticated/suggest-music/MusicPlayer/CWMMusicPlayer.vue'
import CWMSuggestedMusic from '@/components/authenticated/suggest-music/SuggestedMusic/CWMSuggestedMusic.vue'
</script>

<template>
  <section class="event-rsvp">
    <div
      class="my-events-container mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <CWMSuggestedMusic />

      <CWMMusicPlayer
        v-if="false"
      />
    </div>
  </section>
</template>

<style scoped>

</style>
