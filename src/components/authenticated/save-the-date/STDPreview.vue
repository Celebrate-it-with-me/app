<script setup>

import { computed } from 'vue'
import STDCountDown from '@/components/authenticated/save-the-date/STDCountDown.vue'
import STDAddToCalendar from '@/components/authenticated/save-the-date/STDAddToCalendar.vue'

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
    class="event-handle w-[70%] rounded-lg border-4 border-gray-900 dark:border-gray-800
          flex flex-col justify-center items-center"
    :style="backgroundStyle"
  >
    <div class="titles-section flex flex-col justify-center items-center">
      <h1
        v-if="stdConfig?.stdTitle"
        class="text-2xl text-white font-semibold"
      >
        {{ stdConfig.stdTitle }}
      </h1>
      <h3
        v-if="stdConfig?.stdSubTitle"
        class="text-xl text-white font-normal"
      >
        {{ stdConfig.stdSubTitle }}
      </h3>
    </div>

    <div
      v-if="stdConfig?.useCountdown"
      class="std-countdown mt-10">
      <STDCountDown />
    </div>

    <div
      v-if="stdConfig?.useAddToCalendar"
      class="std-addToCalendar mt-10"
    >
      <STDAddToCalendar />
    </div>

  </div>
</template>

<style scoped>

</style>
