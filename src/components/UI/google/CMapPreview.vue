<template>
  <div
    v-if="lat && lng"
    ref="mapRef"
    class="w-full rounded-lg shadow-md"
    :class="height"
  />
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

const props = defineProps({
  lat: Number,
  lng: Number,
  height: {
    type: String,
    default: 'h-[400px]'
  }
})

const mapRef = ref(null)
const mapInstance = ref(null)
const markerInstance = ref(null)

const initMap = async () => {
  if (!props.lat || !props.lng) return

  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  await loader.load()

  await nextTick()

  if (!mapRef.value) return

  const position = { lat: props.lat, lng: props.lng }

  if (!mapInstance.value) {
    mapInstance.value = new google.maps.Map(mapRef.value, {
      center: position,
      zoom: 15,
    })
  } else {
    mapInstance.value.setCenter(position)
  }

  if (markerInstance.value) markerInstance.value.setMap(null)

  markerInstance.value = new google.maps.Marker({
    position,
    map: mapInstance.value,
  })
}

watch(() => [props.lat, props.lng], initMap, { immediate: true })
</script>
