<template>
  <CInput
    :label="label"
    :placeholder="placeholder"
    :id="id"
    ref="inputRef"
    name="places"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import CInput from '@/components/UI/form2/CInput.vue'

const emit = defineEmits(['placeChanged'])

const props = defineProps({
  id: { type: String, default: 'places-autocomplete' },
  label: { type: String, default: 'Search Location' },
  placeholder: { type: String, default: 'Type the place name...' },
  initialValue: { type: String, default: '' },
})

const inputRef = ref(null)

onMounted(async () => {
  const inputEl = inputRef.value?.$el.querySelector('input')
  if (inputEl && props.initialValue) {
    inputEl.value = props.initialValue
  }

  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  await loader.load()

  const input = inputRef.value?.$el.querySelector('input')
  if (!input) return

  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: [ 'place_id', 'name', 'geometry.location', 'address_components'],
    types: ['establishment'],
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    emit('placeChanged', place, place.place_id)
  })
})
</script>
