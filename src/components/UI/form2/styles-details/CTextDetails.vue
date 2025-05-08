<template>
  <CDetailsPanel
    title="Text Styles"
    :disabled="disabled"
  >
    <div class="grid grid-cols-1 md:grid-cols-1 gap-4 items-end">
      <!-- Font Size -->
      <div class="md:col-span-2">
        <div class="flex items-center gap-2">
          <label
            for="fontColor"
            class="w-[40%] block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Font Size:
          </label>
          <CFontSize
            v-model="model.fontSize"
            label=""
          />
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
          <CFontWeight
            v-model="model.fontWeight"
            label=""
          />
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="flex items-center gap-2">
          <label
            for="fontColor"
            class="w-[40%] block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Font Color:
          </label>
          <CColor
            v-model="model.color"
          />
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="flex items-center gap-2">
          <label
            for="textAlign"
            class="w-[40%] block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Text Align:
          </label>
          <div class="w-[60%]">
            <CSelect
              v-model="model.textAlign"
              :options="alignments"
              id="textAlign"
              name="textAlign"
            />
          </div>

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
              v-model="model.fontFamily"
              :options="fonts"
              id="fontFamily"
              name="fontFamily"
            />
          </div>
        </div>
      </div>
    </div>

  </CDetailsPanel>
</template>

<script setup>
import { reactive, watch } from 'vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CDetailsPanel from '@/components/UI/form2/styles-details/CDetailsPanel.vue'
import CFontSize from '@/components/UI/form2/styles-details/CFontSize.vue'
import CColor from '@/components/UI/form2/styles-details/CColor.vue'
import CFontWeight from '@/components/UI/form2/styles-details/CFontWeight.vue'

const props = defineProps({
  modelValue: Object,
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const model = reactive({ ...props.modelValue })

watch(model, () => emit('update:modelValue', model), { deep: true })

const weights = ['normal', 'bold', 'lighter', 'bolder'].map(w => ({ label: w, value: w }))
const alignments = ['left', 'center', 'right'].map(a => ({ label: a, value: a }))
const fonts = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Times New Roman, serif'
].map(f => ({ label: f, value: f }))
</script>
