<template>
  <CCard class="w-full max-w-5xl mx-auto">
    <template #title>Review & Confirm</template>

    <div class="space-y-8">
      <!-- Carousel -->
      <CCarousel
        v-if="images.length"
        :images="images.map(img => img.url)"
        :autoplay="true"
        :autoplay-delay="4000"
        :show-dots="true"
        :show-arrows="true"
        width="w-full"
        height="h-64"
        transition-effect="fade"
      />

      <!-- Map Preview -->
      <CMapPreview
        v-if="locationData.latitude && locationData.longitude"
        :lat="locationData.latitude"
        :lng="locationData.longitude"
      />

      <!-- Location Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div>
          <p><strong>Name:</strong> {{ locationData.name }}</p>
          <p><strong>Address:</strong> {{ locationData.address }}</p>
          <p><strong>City:</strong> {{ locationData.city }}</p>
          <p><strong>State:</strong> {{ locationData.state }}</p>
          <p><strong>Zip Code:</strong> {{ locationData.zipCode }}</p>
          <p><strong>Country:</strong> {{ locationData.country }}</p>
          <p><strong>Is Main Location:</strong> {{ locationData.isDefault ? 'Yes' : 'No' }}</p>
        </div>

        <div>
          <p><strong>Latitude:</strong> {{ locationData.latitude }}</p>
          <p><strong>Longitude:</strong> {{ locationData.longitude }}</p>
          <p><strong>Place ID:</strong> {{ locationData.placeId }}</p>
        </div>
      </div>
    </div>
  </CCard>
</template>

<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CCarousel from '@/components/UI/carousel/CCarousel.vue'
import CMapPreview from '@/components/UI/google/CMapPreview.vue'

defineProps({
  locationData: { type: Object, required: true },
  images: { type: Array, required: true }
})
</script>
