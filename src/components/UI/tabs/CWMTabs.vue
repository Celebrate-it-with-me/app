<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/useEventsStore'

const router = useRouter()
const route = useRoute()
const eventStore = useEventsStore()
const props = defineProps({
  tabs: {
    type: Array,
    required: true
  }
})

const currentTabs = computed(() => {
  return props.tabs.map((tab) => {
    let isDisabled = false
    if (tab.id !== 1 && !eventStore.currentEvent) {
      isDisabled = true
    }

    return {
      disabled: isDisabled,
      ...tab
    }
  })
})

const switchTab = async (tab) => {
  if (!tab.disabled) {
    currentTabs.value.forEach((current) => {
      (current.id === tab.id)
        ? current.selected = true
        : current.selected = false
    })
    await router.push(tab.route)
  }
}

</script>

<template>
  <div>
    <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
      <ul
        class="flex flex-wrap -mb-px text-sm font-medium text-center"
        id="default-tab"
        data-tabs-toggle="#default-tab-content"
        role="tablist"
      >
        <li
          v-for="tab in currentTabs"
          :key="tab.id"
          class="me-2"
          role="presentation"
        >
          <button
            :class="['inline-block p-4 rounded-t-lg text-md font-semibold',
              tab.route === route.path
              ? 'text-yellow-300 border-b-2 border-yellow-300 dark:text-yellow-300 dark:border-yellow-300'
                : 'hover:text-gray-600',
              tab.disabled
              ? 'text-gray-600 hover:text-gray-600 cursor-not-allowed'
              : ''
            ]"
            @click="switchTab(tab)"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>
    </div>
    <div id="default-tab-content">
      <div
        class="p-4 rounded-lg"
        role="tabpanel"
      >
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
