<script setup>
import { Form } from 'vee-validate'
import { onMounted, reactive } from 'vue'

const emit = defineEmits(['update:guestMenu', 'update:goBack'])
const props = defineProps({
  menu: {
    type: Object,
    required: true
  },
  guest: {
    type: Object,
    required: true
  }
})

const menuValues = reactive({
  starters: '',
  mains: '',
  desserts: ''
})

const errors = reactive({
  starters: '',
  mains: '',
  desserts: ''
})

const onSubmit = () => {
  errors.starters = ''
  errors.mains = ''
  errors.desserts = ''

  let hasError = false

  if (props.menu.menuItems?.starter?.length && !menuValues.starters) {
    errors.starters = 'Please select a starter'
    hasError = true
  }

  if (props.menu.menuItems?.main?.length && !menuValues.mains) {
    errors.mains = 'Please select a main course'
    hasError = true
  }

  if (props.menu.menuItems?.dessert?.length && !menuValues.desserts) {
    errors.desserts = 'Please select a dessert'
    hasError = true
  }

  if (hasError) return

  emit('update:guestMenu', {
    guestId: props.guest.id,
    selections: {
      starter: menuValues.starters,
      main: menuValues.mains,
      dessert: menuValues.desserts
    }
  })
}

const goBack = () => {
  emit('update:goBack')
}

onMounted(() => {
  if (props.menu.menuItems?.starter?.length === 1) {
    menuValues.starters = props.menu.menuItems.starter[0].id
  }
  if (props.menu.menuItems?.main?.length === 1) {
    menuValues.mains = props.menu.menuItems.main[0].id
  }
  if (props.menu.menuItems?.dessert?.length === 1) {
    menuValues.desserts = props.menu.menuItems.dessert[0].id
  }
})
</script>

<template>
  <div class="space-y-6 mt-6">
    <Form class="space-y-6" @submit="onSubmit">
      <!-- STARTERS -->
      <div v-if="menu.menuItems?.starter?.length">
        <h4 class="text-md font-medium capitalize mb-2 text-gray-700 dark:text-gray-300">
          Starters
        </h4>
        <p v-if="errors.starters" class="text-sm text-red-500 mt-1">{{ errors.starters }}</p>
        <div class="flex flex-wrap gap-4 border-b border-gray-200">
          <label
            v-for="item in menu.menuItems.starter"
            :key="item.id"
            class="flex items-center gap-3 cursor-pointer mt-4 mb-4"
          >
            <span class="relative">
              <input
                :id="`starter-${item.id}`"
                v-model="menuValues.starters"
                type="radio"
                name="starter"
                :value="item.id"
                class="opacity-0 absolute w-5 h-5"
              />
              <span
                class="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center"
                :class="{ 'border-purple-400 bg-purple-400': menuValues.starters === item.id }"
              >
                <span
                  class="w-2.5 h-2.5 bg-purple-600 rounded-full"
                  :class="{ hidden: menuValues.starters !== item.id }"
                ></span>
              </span>
            </span>
            <span class="text-sm text-gray-800 dark:text-gray-200">{{ item.name }}</span>
          </label>
        </div>
      </div>

      <!-- MAINS -->
      <div v-if="menu.menuItems?.main?.length">
        <h4 class="text-md font-medium capitalize mb-2 text-gray-700 dark:text-gray-300">
          Main Course
        </h4>
        <p v-if="errors.mains" class="text-sm text-red-500 mt-1">{{ errors.mains }}</p>
        <div class="flex flex-wrap gap-4 border-b border-gray-200">
          <label
            v-for="item in menu.menuItems.main"
            :key="item.id"
            class="flex items-center gap-3 cursor-pointer my-4"
          >
            <div class="relative">
              <input
                :id="`main-${item.id}`"
                v-model="menuValues.mains"
                type="radio"
                name="main"
                :value="item.id"
                class="opacity-0 absolute w-5 h-5"
              />
              <span
                class="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center"
                :class="{ 'border-purple-400 bg-purple-400': menuValues.mains === item.id }"
              >
                <span
                  class="w-2.5 h-2.5 bg-purple-600 rounded-full"
                  :class="{ hidden: menuValues.mains !== item.id }"
                ></span>
              </span>
            </div>
            <span class="text-sm text-gray-800 dark:text-gray-200">{{ item.name }}</span>
          </label>
        </div>
      </div>

      <!-- DESSERTS -->
      <div v-if="menu.menuItems?.dessert?.length">
        <h4 class="text-md font-medium capitalize mb-2 text-gray-700 dark:text-gray-300">
          Dessert
        </h4>
        <p v-if="errors.mains" class="text-sm text-red-500 mt-1">{{ errors.mains }}</p>
        <div class="flex flex-wrap gap-4">
          <label
            v-for="item in menu.menuItems.dessert"
            :key="item.id"
            class="flex items-center gap-3 cursor-pointer my-4"
          >
            <div class="relative">
              <input
                :id="`dessert-${item.id}`"
                v-model="menuValues.desserts"
                type="radio"
                name="dessert"
                :value="item.id"
                class="opacity-0 absolute w-5 h-5"
              />
              <span
                class="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center"
                :class="{ 'border-purple-400 bg-purple-400': menuValues.desserts === item.id }"
              >
                <span
                  class="w-2.5 h-2.5 bg-purple-600 rounded-full"
                  :class="{ hidden: menuValues.desserts !== item.id }"
                ></span>
              </span>
            </div>
            <span class="text-sm text-gray-800 dark:text-gray-200">{{ item.name }}</span>
          </label>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="action-button w-full flex flex-row justify-between">
        <button
          type="button"
          class="px-6 py-2 border-2 font-bold mr-2 rounded-lg text-gray-500 border-gray-500 hover:bg-gray-100"
          @click="goBack"
        >
          Back
        </button>
        <button
          type="submit"
          class="px-6 py-2 border-2 font-bold rounded-lg text-pink-400 border-pink-400 hover:bg-pink-50"
        >
          Next
        </button>
      </div>
    </Form>
  </div>
</template>
