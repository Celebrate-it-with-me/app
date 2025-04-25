<script setup>

import { computed } from 'vue'
import STDCountDown from '@/components/internal/save-the-date/STDCountDown.vue'
import STDAddToCalendar from '@/components/internal/save-the-date/STDAddToCalendar.vue'

const props = defineProps({
  stdConfig: {
    type: [Object, null],
    required: true
  }
})

const backgroundStyle = computed(() => {
  const config = props.stdConfig;

  if (config?.image) {
    if (config?.image instanceof File) {
      const fileUrl = URL.createObjectURL(config?.image);
      return {
        'background-image': `url(${fileUrl})`,
        'background-color': 'transparent',
        'background-size': 'cover',
        'background-position': 'center',
      };
    }

    return {
      'background-image': `url(${config.image})`,
      'background-color': 'transparent',
      'background-size': 'cover',
      'background-position': 'center',
    };
  } else if (config?.backgroundColor) {
    return {
      'background-color': config?.backgroundColor,
    };
  }

  // Default fallback
  return {
    'background-color': 'transparent',
  };
});

</script>

<template>
  <div
    class="event-handle w-full rounded-2xl border-2 border-gray-200 dark:border-gray-100
           flex flex-col justify-center items-center p-6 bg-cover bg-center"
    :style="backgroundStyle"
  >
    <!-- Title + Subtitle Section -->
    <div class="titles-section text-center space-y-2">
      <h1
        v-if="stdConfig?.title"
        class="text-3xl md:text-4xl font-bold text-text"
      >
        {{ stdConfig.title }}
      </h1>

      <h3
        v-if="stdConfig?.message"
        class="text-lg md:text-xl font-medium text-text"
      >
        {{ stdConfig.message }}
      </h3>
    </div>

    <!-- Countdown -->
    <div v-if="stdConfig?.useCountdown" class="mt-8">
      <STDCountDown />
    </div>

    <!-- Add to Calendar -->
    <div v-if="stdConfig?.useAddToCalendar" class="mt-6">
      <STDAddToCalendar />
    </div>
  </div>
</template>


<style scoped>

</style>
