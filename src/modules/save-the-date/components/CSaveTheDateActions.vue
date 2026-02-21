<template>
  <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
    <CButton
      variant="gradient"
      class="px-10 h-14 rounded-2xl shadow-xl shadow-purple-500/20"
      :disabled="saving"
      @click="$emit('save')"
    >
      <Save v-if="!saving" class="w-5 h-5 mr-2" />
      <span
        v-else
        class="w-5 h-5 mr-2 animate-spin border-2 border-white/30 border-t-white rounded-full"
      ></span>
      <span class="font-bold text-lg">{{ saving ? 'Saving Changes...' : 'Save Changes' }}</span>
    </CButton>
  </div>
</template>

<script setup>
import { Save } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'

defineProps({
  saving: {
    type: Boolean,
    default: false
  }
})

defineEmits(['save'])
</script>
