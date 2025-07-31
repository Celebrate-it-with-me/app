<!-- VideoBackgroundPage.vue -->
<template>
  <div class="video-background-page">
    <video ref="myVideo" autoplay muted playsinline class="video-background">
      <source src="../../public/videos/beauty.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div class="content">
      <!-- Your page content goes here -->
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$refs.myVideo.onended = () => {
      this.handleEndVideo()
    }
  },

  methods: {
    handleEndVideo() {
      this.$emit('videoEnded')
    }
  }
}
</script>

<style scoped>
/* Component-specific styles go here */
.video-background-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  position: relative;
  z-index: 1;
  /* Add styling for your content */
}
</style>
