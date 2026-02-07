<template>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CInput
        id="guestName"
        v-model="localData.name"
        label="Guest Name"
        name="guestName"
        placeholder="e.g., John Doe"
        :show-error="true"
      />

      <CInput
        id="guestEmail"
        v-model="localData.email"
        label="Email"
        name="guestEmail"
        placeholder="e.g., john@example.com"
      />

      <CInput
        id="guestPhone"
        v-model="localData.phone"
        label="Phone Number (optional)"
        name="guestPhone"
        placeholder="e.g., +1 305 123 4567"
      />

      <CSelect
        v-if="evenHasMenu"
        id="menuSelected"
        v-model="localData.menuSelected"
        name="menuSelected"
        :options="menuStore.menusForSelect"
        label="Select Menu"
        placeholder="Select a menu"
      />
    </div>
  </section>
</template>

<script setup>
import { watch, reactive, onMounted, computed } from 'vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import { useMenusStore } from '@/stores/useMenusStore'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const menuStore = useMenusStore()

onMounted(async () => {
  await menuStore.loadMenus()
})

const localData = reactive({ ...props.modelValue })

watch(localData, val => {
  emit('update:modelValue', val)
})

const evenHasMenu = computed(() => menuStore.hasMenu)
</script>
