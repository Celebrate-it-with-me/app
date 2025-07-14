<template>
  <section class="w-full max-w-5xl mx-auto mt-10 space-y-6 px-4 mb-4">
    <div class="text-center">
      <h2 class="text-6xl font-gvibes font-bold text-purple-middle">
        Event Location
      </h2>
      <p class="text-gray-500 mt-2">{{ location.name }}</p>
      <p class="text-lg font-medium text-gray-800 dark:text-gray-200">
        {{ location.address }}, {{ location.city }}, {{ location.state }} {{ location.zipCode }}, {{ location.country }}
      </p>
    </div>

    <div class="bg-white dark:bg-gray-900 shadow-md rounded-2xl overflow-hidden">
      <CMapPreview
        :lat="Number(location.latitude)"
        :lng="Number(location.longitude)"
        class="w-full h-[300px]"
      />
      <div class="p-6 space-y-4 text-center md:text-left">
        <div class="flex justify-center md:justify-start">
          <a
            :href="googleMapsUrl"
            target="_blank"
            class="inline-block bg-primary text-white px-5 py-2 rounded-lg shadow hover:bg-pink-600 transition"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import CCarousel from '@/components/UI/carousel/CCarousel.vue'
import CMapPreview from '@/components/UI/google/CMapPreview.vue'
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const templateStore = useTemplateStore()

const location = computed(() => {
  return templateStore.event?.eventLocations[0] ?? {}
})

const images = computed(() => {
  return templateStore.event?.eventLocations[0]?.images ?? []
})

const imagesUrl = computed(() => {
  return images.value.map((image) => image.path)
})

const googleMapsUrl = computed(() => {
  const name = location.value?.name || ''
  const lat = location.value?.latitude || ''
  const lng = location.value?.longitude || ''

  const q =  encodeURIComponent(`${name}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
})
</script>
