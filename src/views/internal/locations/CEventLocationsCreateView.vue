<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold"> Event Locations </CHeading>
    </div>

    <CCard class="w-full max-w-5xl mx-auto">
      <template #title> Add New Event Location </template>

      <Form :validation-schema="validationSchema" @submit="onSubmit">
        <div
          v-if="Object.keys(formErrors).length"
          class="backendErrors mb-4 p-4 bg-red-100 text-red-700 rounded-lg"
        >
          <ul>
            <li v-for="(error, field) in formErrors" :key="field">
              <strong>{{ error[0] }}</strong>
            </li>

          </ul>
        </div>


        <CPlacesAutocomplete @placeChanged="handlePlace" class="mt-4" />

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

          <CToggle v-model="localLocation.isDefault" name="is_default" label="Is Main Location?" />
        </div>

        <!-- Google Photos Preview with Remove Option -->

        <div v-if="selectedPhotos.length" class="mt-8">
          <h2 class="text-xl font-semibold mb-4">Selected Photos 📸</h2>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="(photo, index) in selectedPhotos"
              :key="index"
              class="relative overflow-hidden rounded-lg shadow-md group"
            >
              <img :src="photo.url" alt="Selected Photo" class="object-cover w-full h-40" />

              <button
                @click="removePhoto(index)"
                class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
                title="Remove Photo"
              >
                <span class="text-xs">✖️</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Add Custom Photos Button -->
        <CUploadFile @add-photos="addCustomPhotos" class="mt-4" />

        <div class="mt-6 flex justify-end">
          <CButton variant="primary" type="submit"> Create Location </CButton>
        </div>
      </Form>

      <CCarousel
        :images="selectedPhotos.map((photo) => photo.url)"
        width="w-1/2"
        height="h-60"
        :autoplay="true"
        :autoplay-delay="5000"
        :show-dots="true"
        :show-arrows="true"
        transition-effect="fade"
      />

      <CMapPreview
        v-if="localLocation.latitude && localLocation.longitude"
        :lat="localLocation.latitude"
        :lng="localLocation.longitude"
      />
    </CCard>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { Form } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useRouter } from 'vue-router'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CCarousel from '@/components/UI/carousel/CCarousel.vue'
import CMapPreview from '@/components/UI/google/CMapPreview.vue'
import CPlacesAutocomplete from '@/components/UI/google/CPlacesAutocomplete.vue'
import CUploadFile from '@/components/UI/form2/CUploadFile.vue'
import { useLocationsStore } from '@/stores/useLocationsStore'
import { useForm } from 'vee-validate'
import { useNotificationStore } from '@/stores/useNotificationStore'

const { setFieldError } = useForm()
const router = useRouter()
const notificationsStore = useNotificationStore()
const formErrors = ref({})

const mapElement = ref(null)
const mapInstance = ref(null)
const markerInstance = ref(null)
const showMap = ref(false)
const selectedPhotos = ref([])
const locationStore = useLocationsStore()

const localLocation = reactive({
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  latitude: null,
  longitude: null,
  isDefault: false
})

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Location name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip_code: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    is_default: z.boolean().default(false)
  })
)

const onSubmit = async () => {
  try {
    const formData = new FormData()

    for (const [key, value] of Object.entries(localLocation)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    }

    const customPhotos = selectedPhotos.value.filter((photo) => photo.type === 'uploaded')
    const googlePhotos = selectedPhotos.value
      .filter((photo) => photo.type === 'google')
      .map((photo) => photo.url)

    customPhotos.forEach((photo, index) => {
      formData.append(`images[${index}]`, photo.file)
    })

    formData.append('google_photos', JSON.stringify(googlePhotos))

    const response = await locationStore.addLocation(formData)

    if (response?.status === 200 || response?.status === 201) {
      notificationsStore.addNotification({
        type: 'success',
        message: 'Location created successfully!'
      })
      await router.push('/dashboard/locations')
    } else {
      handleError(response)
    }
  } catch (e) {
    handleError(e)
  }
}


const handleError = (e) => {
  const status = e?.response?.status
  const data = e?.response?.data

  if (status === 422 && data?.errors) {
    formErrors.value = data?.errors
    for (const field in data.errors) {
      if (data.errors[field]?.[0]) {
        setFieldError(field, data.errors[field][0])
      }
    }

    notificationsStore.addNotification({
      type: 'error',
      message: 'Please correct the errors in the form.'
    })

    // Optional UX tweak: scroll to top or first invalid field
    document.querySelector('[data-invalid="true"]')?.scrollIntoView({ behavior: 'smooth' })

  } else {
    console.error('Unexpected error:', e)
    notificationsStore.addNotification({
      type: 'error',
      message: 'Something went wrong while saving the location. Please try again later.'
    })
  }
}

const handlePlace = (place) => {
  if (!place.address_components) return

  // Google Photos
  const googleUrls = (place.photos?.map((photo) => photo.getUrl({ maxWidth: 800 })) || []).slice(
    0,
    5
  )

  selectedPhotos.value = googleUrls.map((url) => ({
    type: 'google',
    url: url
  }))

  // Components
  const components = place.address_components.reduce(
    (acc, comp) => {
      const type = comp.types[0]
      if (type === 'locality') acc.city = comp.long_name
      if (type === 'administrative_area_level_1') acc.state = comp.short_name
      if (type === 'country') acc.country = comp.long_name
      if (type === 'postal_code') acc.zip_code = comp.long_name
      return acc
    },
    { city: '', state: '', country: '', zip_code: '' }
  )

  // Address
  const street_number =
    place.address_components.find((comp) => comp.types.includes('street_number'))?.long_name || ''
  const route =
    place.address_components.find((comp) => comp.types.includes('route'))?.long_name || ''

  const streetAddress = street_number && route ? `${street_number} ${route}` : route || ''

  localLocation.name = place.name || ''
  localLocation.address = streetAddress
  localLocation.city = components.city
  localLocation.state = components.state
  localLocation.zipCode = components.zip_code
  localLocation.country = components.country
  localLocation.latitude = place.geometry?.location?.lat()
  localLocation.longitude = place.geometry?.location?.lng()

  // Mapa
  const lat = place.geometry?.location?.lat()
  const lng = place.geometry?.location?.lng()

  if (lat && lng) {
    showMap.value = true

    nextTick()

    if (!mapInstance.value) {
      mapInstance.value = new google.maps.Map(mapElement.value, {
        center: { lat, lng },
        zoom: 15
      })
    } else {
      mapInstance.value.setCenter({ lat, lng })
    }

    if (markerInstance.value) {
      markerInstance.value.setMap(null)
    }

    markerInstance.value = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstance.value
    })
  }
}

const addCustomPhotos = (photos) => {
  selectedPhotos.value.push(...photos)
}

const removePhoto = (index) => {
  selectedPhotos.value.splice(index, 1)
}
</script>
