<script setup>
import { reactive, watch } from 'vue'

import CCard from '@/components/UI/cards/CCard.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CMapPreview from '@/components/UI/google/CMapPreview.vue'
import CPlacesAutocomplete from '@/components/UI/google/CPlacesAutocomplete.vue'

const emit = defineEmits(['update:modelValue', 'valid'])

const props = defineProps({
  modelValue: Object,
  initialPlaceName: {
    type: String,
    default: ''
  }
})

const localLocation = reactive({
  name: props.modelValue?.name || '',
  address: props.modelValue?.address || '',
  city: props.modelValue?.city || '',
  state: props.modelValue?.state || '',
  zipCode: props.modelValue?.zipCode || '',
  country: props.modelValue?.country || '',
  latitude: props.modelValue?.latitude || null,
  longitude: props.modelValue?.longitude || null,
  isDefault: props.modelValue?.isDefault || false,
  placeId: props.modelValue?.placeId || ''
})

watch(
  localLocation,
  () => {
    emit('update:modelValue', localLocation)
  },
  { deep: true }
)

const handlePlace = (place) => {
  if (!place.place_id || !place.geometry || !place.address_components) {
    emit('valid', false)
    return
  }

  const components = place.address_components.reduce(
    (acc, comp) => {
      const type = comp.types[0]
      if (type === 'locality') acc.city = comp.long_name
      if (type === 'administrative_area_level_1') acc.state = comp.short_name
      if (type === 'country') acc.country = comp.long_name
      if (type === 'postal_code') acc.zipCode = comp.long_name
      return acc
    },
    { city: '', state: '', country: '', zipCode: '' }
  )

  const street_number =
    place.address_components.find((comp) => comp.types.includes('street_number'))?.long_name || ''

  const route =
    place.address_components.find((comp) => comp.types.includes('route'))?.long_name || ''

  const streetAddress = street_number && route ? `${street_number} ${route}` : route || ''

  localLocation.name = place.name || ''
  localLocation.address = streetAddress
  localLocation.city = components.city
  localLocation.state = components.state
  localLocation.zipCode = components.zipCode
  localLocation.country = components.country
  localLocation.latitude = place.geometry?.location?.lat()
  localLocation.longitude = place.geometry?.location?.lng()
  localLocation.placeId = place.place_id

  emit('update:modelValue', localLocation)
  emit('valid', true)
}
</script>

<template>
  <CCard class="w-full max-w-5xl mx-auto">
    <template #title>Location Details</template>

    <CPlacesAutocomplete
      :initial-value="initialPlaceName"
      @placeChanged="handlePlace"
      class="mt-4"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <CInput
        v-model="localLocation.name"
        name="name"
        label="Location Name"
        disabled
        id="location_name"
      />
      <CInput
        v-model="localLocation.address"
        name="address"
        label="Address"
        disabled
        id="location_address"
      />
      <CInput v-model="localLocation.city" name="city" label="City" disabled id="location_city" />
      <CInput
        v-model="localLocation.state"
        name="state"
        label="State"
        disabled
        id="location_state"
      />
      <CInput
        v-model="localLocation.zipCode"
        name="zipCode"
        label="Zip Code"
        disabled
        id="location_zipCode"
      />
      <CInput
        v-model="localLocation.country"
        name="country"
        label="Country"
        disabled
        id="location_country"
      />
      <CInput
        v-model="localLocation.latitude"
        name="latitude"
        label="Latitude"
        type="number"
        disabled
        id="location_latitude"
      />
      <CInput
        v-model="localLocation.longitude"
        name="longitude"
        label="Longitude"
        type="number"
        disabled
        id="location_longitude"
      />
      <CToggle
        v-model="localLocation.isDefault"
        name="isDefault"
        label="Is Main Location?"
      />
    </div>

    <CMapPreview
      v-if="localLocation.latitude && localLocation.longitude"
      :lat="localLocation.latitude"
      :lng="localLocation.longitude"
    />
  </CCard>
</template>
