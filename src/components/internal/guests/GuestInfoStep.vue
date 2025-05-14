<template>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CInput
        label="Guest Name"
        name="guestName"
        v-model="localData.name"
        placeholder="e.g., John Doe"
        :show-error="true"
        id="guestName"
      />

      <CInput
        label="Email"
        name="guestEmail"
        v-model="localData.email"
        placeholder="e.g., john@example.com"
        id="guestEmail"
      />

      <CInput
        label="Phone Number (optional)"
        name="guestPhone"
        v-model="localData.phone"
        placeholder="e.g., +1 305 123 4567"
        id="guestPhone"
      />

      <CSelect
        v-model="localData.menuSelected"
        id="menuSelected"
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

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const menuStore = useMenusStore()

onMounted(async () => {
  await  menuStore.loadMenus()
})

const emit = defineEmits(['update:modelValue'])
const localData = reactive({ ...props.modelValue })

watch(localData, (val) => {
  emit('update:modelValue', val)
})
</script>
