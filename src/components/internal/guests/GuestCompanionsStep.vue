<template>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100">Named Companions</h3>

      <div v-for="(companion, index) in named" :key="index" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <CInput
          v-model="companion.name"
          label="Name"
          :placeholder="`e.g. Jane Doe`"
          :name="`companion_name_${index}`"
          :id="`companion_name_${index}`"
        />

        <CInput
          v-model="companion.email"
          label="Email"
          :placeholder="`e.g. janeDoe@gmail.com`"
          :name="`companion_email_${index}`"
          :id="`companion_email_${index}`"
        />

        <CInput
          v-model="companion.phone"
          label="Phone"
          :placeholder="`e.g. 123 456 7890`"
          :name="`companion_phone_${index}`"
          :id="`companion_phone_${index}`"
        />

        <div class="flex gap-2 justify-end md:justify-start pt-2 md:pt-0">
          <CButton
            variant="outline"
            size="sm"
            @click="removeNamedCompanion(index)"
          >Remove</CButton>
        </div>
      </div>

      <div class="flex justify-end">
        <CButton
          size="sm"
          variant="primary"
          @click="addNamedCompanion"
        >+ Add Named Companion</CButton>
      </div>
    </div>

    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100">Unnamed Companions</h3>
      <CInput
        type="number"
        min="0"
        name="unnamed_companions"
        id="unnamed_companions"
        v-model.number="localUnnamedCount"
        placeholder="e.g. 2"
        label="How many unnamed companions?"
      />
    </div>
  </section>
</template>

<script setup>
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { watch, toRefs, ref } from 'vue'

const props = defineProps({
  named: {
    type: Array,
    required: true
  },
  unnamedCount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:named', 'update:unnamedCount'])

const { named } = toRefs(props)
const localUnnamedCount = ref(props.unnamedCount)

const addNamedCompanion = () => {
  emit('update:named', [...named.value, { name: '' }])
}

const removeNamedCompanion = (index) => {
  const updated = [...named.value]
  updated.splice(index, 1)
  emit('update:named', updated)
}

watch(() => props.unnamedCount, (val) => {
  localUnnamedCount.value = val
})

watch(localUnnamedCount, (val) => {
  emit('update:unnamedCount', val)
})

</script>
