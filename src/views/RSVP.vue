<script setup lang="ts">
import TheRsvp from "@/components/TheRsvp.vue";
import VideoComponent from "@/components/VideoComponent.vue";
import {ref} from "vue";
import {FwbAlert} from "flowbite-vue";

const showVideo = ref(true);

const handleVideoEnded = () => {
  showVideo.value = false;
}

</script>

<template>
  <main>
    <VideoComponent
        v-if="showVideo"
        @video-ended="handleVideoEnded"
    />

    <TheRsvp v-else/>
  </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.alert-container {
  padding: 10px;
}

</style>
