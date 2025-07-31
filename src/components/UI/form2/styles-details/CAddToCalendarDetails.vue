<template>
  <CDetailsPanel title="CountDown Styles" :disabled="disabled">
    <div class="grid grid-cols-1 md:grid-cols-1 gap-4 items-end">
      <CHeading :level="4" size="xl">Numbers</CHeading>
      <div class="md:col-span-2">
        <div class="flex items-center gap-2">
          <label
            for="fontColor"
            class="w-[40%] block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Font Size:
          </label>
          <CFontSize v-model="model.fontSize" label="" />
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="flex items-center gap-2">
          <label
            for="fontColor"
            class="w-[40%] block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Color:
          </label>
          <CColor v-model="model.color" />
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="flex items-center gap-2">
          <label
            for="fontColor"
            class="w-[40%] block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Font Weight:
          </label>
          <CFontWeight v-model="model.fontWeight" />
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="flex items-center gap-2">
          <label
            for="fontFamily"
            class="w-[40%] block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Font Family:
          </label>
          <div class="w-[60%]">
            <CSelect
              id="fontFamily"
              v-model="model.fontFamily"
              :options="fonts"
              name="numbersFontFamily"
            />
          </div>
        </div>
      </div>
    </div>
  </CDetailsPanel>
</template>
<script setup lang="ts">
import CDetailsPanel from '@/components/UI/form2/styles-details/CDetailsPanel.vue'
import CColor from '@/components/UI/form2/styles-details/CColor.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CFontSize from '@/components/UI/form2/styles-details/CFontSize.vue'
import CFontWeight from '@/components/UI/form2/styles-details/CFontWeight.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { reactive, watch } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const model = reactive({ ...props.modelValue })

watch(model, () => emit('update:modelValue', model), { deep: true })

const fonts = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Times New Roman, serif'
].map(f => ({ label: f, value: f }))
</script>
