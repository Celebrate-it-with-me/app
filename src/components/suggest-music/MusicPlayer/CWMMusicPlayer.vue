<template>
  <div class="w-full max-w-md mx-auto p-4 border border-gray-300 rounded-lg shadow-md bg-gray-900 text-yellow-300">
    <h2 class="text-center text-xl font-semibold mb-4">YouTube Music Player</h2>

    <!-- Track Name -->
    <div class="text-center font-bold mb-2">
      {{ currentTrack.name }}
    </div>

    <!-- YouTube Video -->
    <div class="mb-4">
      <div id="youtube-player" class="aspect-w-16 aspect-h-9 bg-black"></div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center space-x-4 mt-4">
      <button
        class="p-2 bg-yellow-300 text-gray-900 rounded-full hover:bg-yellow-400 transition"
        @click="togglePlayPause"
      >
        <span v-if="!isPlaying">▶</span>
        <span v-else>⏸</span>
      </button>
      <button
        class="p-2 bg-yellow-300 text-gray-900 rounded-full hover:bg-yellow-400 transition"
        @click="nextTrack"
      >
        ⏭
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const YOUTUBE_API_URL = "https://www.youtube.com/iframe_api";

const isPlaying = ref(false); // Tracks the playback state

// Playlist with YouTube video links
const currentTrackIndex = ref(0);
const playlist = ref([
  {
    name: "Track 1 - Lofi Beats",
    src: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    name: "Track 2 - Chill Vibes",
    src: "https://www.youtube.com/watch?v=5qap5aO4i9A",
  },
  {
    name: "Track 3 - Focus Music",
    src: "https://www.youtube.com/watch?v=hHW1oY26kxQ",
  },
]);

const currentTrack = ref(playlist.value[currentTrackIndex.value]); // Current track data

let player = null; // YouTube player instance

// Get YouTube video ID from a URL
const getYouTubeVideoId = (url) => {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/?\n]+\/?.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
};

// Play/Pause the video
const togglePlayPause = () => {
  if (!player) return;

  if (isPlaying.value) {
    player.pauseVideo();
    isPlaying.value = false;
  } else {
    player.playVideo();
    isPlaying.value = true;
  }
};

// Play the next track in the playlist
const nextTrack = () => {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.value.length;
  currentTrack.value = playlist.value[currentTrackIndex.value];

  if (player) {
    player.loadVideoById(getYouTubeVideoId(currentTrack.value.src));
  }
  isPlaying.value = true;
};

// Watch for playlist changes and update the player
watch(currentTrackIndex, () => {
  if (player) {
    player.loadVideoById(getYouTubeVideoId(currentTrack.value.src));
    isPlaying.value = true;
  }
});

// Initialize the YouTube IFrame API
const loadYouTubeApi = () => {
  if (document.getElementById("youtube-iframe-script")) return;

  const script = document.createElement("script");
  script.id = "youtube-iframe-script";
  script.src = YOUTUBE_API_URL;

  // Wait for the script to load
  script.onload = () => {
    if (window.YT && window.YT.Player) {
      initializeYouTubePlayer();
    } else {
      // If the `YT` object is not immediately available, listen for YouTube's API ready event
      window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
    }
  };

  document.body.appendChild(script);
};

// Initialize the YouTube Player
const initializeYouTubePlayer = () => {
  player = new YT.Player("youtube-player", {
    videoId: getYouTubeVideoId(currentTrack.value.src),
    playerVars: {
      autoplay: 1, // Autoplay the first video
      controls: 1,
    },
    events: {
      onStateChange: handlePlayerStateChange,
    },
  });
};

// Handle player state changes (e.g., play, pause, end)
const handlePlayerStateChange = (event) => {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying.value = true;
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying.value = false;
  } else if (event.data === YT.PlayerState.ENDED) {
    nextTrack();
  }
};

onMounted(() => {
  loadYouTubeApi(); // Load the YouTube API when the component is mounted
});
</script>

<style scoped>
/* Styling for aspect ratio */
.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* Ratio for 16:9 */
}
.aspect-w-16 .aspect-h-9 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
