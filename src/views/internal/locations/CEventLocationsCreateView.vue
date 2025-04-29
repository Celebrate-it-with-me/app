<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">
        Event Locations
      </CHeading>
    </div>

    <CCard class="w-full max-w-5xl mx-auto">
      <template #title>
        Add New Event Location
      </template>

      <Form :validation-schema="validationSchema" @submit="onSubmit">
        <div class="w-full flex justify-start flex-wrap mt-4">
          <div class="w-full relative">
            <CInput
              name="autocomplete"
              label="Search Location"
              placeholder="Type the place name..."
              ref="autocompleteInput"
              id="autocomplete-input"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <CInput
            v-model="localLocation.name"
            name="name"
            label="Location Name"
            placeholder="Ej: Ballroom A"
            id="location-name"
            show-error
            disabled
          />

          <CInput
            v-model="localLocation.address"
            name="address"
            label="Address"
            placeholder="Av. 1234, Johnson St."
            id="location-address"
            show-error
            disabled
          />

          <CInput
            v-model="localLocation.city"
            name="city"
            label="City"
            placeholder="Miami"
            id="location-city"
            show-error
            disabled
          />

          <CInput
            v-model="localLocation.state"
            name="state"
            label="State"
            placeholder="Florida"
            id="location-state"
            show-error
            disabled
          />

          <CInput
            v-model="localLocation.zipCode"
            name="zipCode"
            label="Zip Code / Postal Code"
            placeholder="12345"
            id="location-zip"
            show-error
            disabled
          />

          <CInput
            v-model="localLocation.country"
            name="country"
            label="Country"
            placeholder="United States"
            id="location-country"
            show-error
            disabled
          />

          <CInput
            v-model="localLocation.latitude"
            name="latitude"
            label="Latitude"
            placeholder="25.7617"
            type="number"
            id="location-latitude"
            show-error
            disabled
          />

          <CInput
            v-model="localLocation.longitude"
            name="longitude"
            label="Longitude"
            placeholder="-80.1918"
            type="number"
            id="location-longitude"
            show-error
            disabled
          />

          <CToggle
            v-model="localLocation.isDefault"
            name="is_default"
            label="Is Main Location?" />
        </div>

        <div class="mt-6 flex justify-end">
          <CButton variant="primary" type="submit" >
            Create Location
          </CButton>
        </div>
      </Form>

      <!-- Location Map Preview -->
      <div v-if="showMap" class="mt-10">
        <h2 class="text-2xl font-semibold mb-4">Location Preview 🗺️</h2>
        <div ref="mapElement" class="w-full h-[400px] rounded-lg shadow-md" />
      </div>

    </CCard>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { Form } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader } from '@googlemaps/js-api-loader'
import { useRoute } from 'vue-router'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const route = useRoute()
const eventId = route.params.id || null

const autocompleteInput = ref(null)
const mapElement = ref(null)
const autocomplete = ref(null)
const mapInstance = ref(null)
const markerInstance = ref(null)
const showMap = ref(false)

const localLocation = reactive({
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  latitude: null,
  longitude: null,
  isDefault: false,
})

const validationSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  is_default: z.boolean().default(false),
}))

const onSubmit = async (values) => {
  try {
    await $api.post(`/events/${eventId}/locations`, values)
    toast.success('Location created successfully.')
  } catch (e) {
    toast.error('An error occurred while saving the location.')
    console.error(e)
  }
}

onMounted(async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  await loader.load()

  const input = autocompleteInput.value?.$el.querySelector('input')
  if (!input) return

  autocomplete.value = new google.maps.places.Autocomplete(input, {
    fields: ['address_components', 'geometry', 'name'],
    types: ['establishment'],
  })

  autocomplete.value.addListener('place_changed', async () => {
    const place = autocomplete.value.getPlace()
    if (!place.address_components) return

    const components = place.address_components.reduce((acc, comp) => {
      const type = comp.types[0]
      if (type === 'locality') acc.city = comp.long_name
      if (type === 'administrative_area_level_1') acc.state = comp.short_name
      if (type === 'country') acc.country = comp.long_name
      if (type === 'postal_code') acc.zip_code = comp.long_name
      return acc
    }, { city: '', state: '', country: '', zip_code: '' })

    localLocation.name = place.name || ''
    localLocation.address = place.formatted_address || ''
    localLocation.city = components.city
    localLocation.state = components.state
    localLocation.zipCode = components.zip_code
    localLocation.country = components.country
    localLocation.latitude = place.geometry?.location?.lat()
    localLocation.longitude = place.geometry?.location?.lng()

    const lat = place.geometry?.location?.lat()
    const lng = place.geometry?.location?.lng()

    if (lat && lng) {
      showMap.value = true

      await nextTick()

      if (!mapInstance.value) {
        mapInstance.value = new google.maps.Map(mapElement.value, {
          center: { lat, lng },
          zoom: 15,
        })
      } else {
        mapInstance.value.setCenter({ lat, lng })
      }

      if (markerInstance.value) {
        markerInstance.value.setMap(null)
      }

      markerInstance.value = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.value,
      })
    }
  })
})
</script>
