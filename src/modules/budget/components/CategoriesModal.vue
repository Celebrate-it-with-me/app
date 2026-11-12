<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2, Check } from 'lucide-vue-next'
import { UiModal, UiInput, UiButton } from '@/ui'

const props = defineProps({
  open: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'add', 'rename', 'remove'])
const { t } = useI18n()

const names = ref({})
const fresh = ref('')

watch(
  () => [props.open, props.categories],
  () => {
    names.value = Object.fromEntries(props.categories.map(c => [c.id, c.name]))
  },
  { immediate: true }
)

function add() {
  const name = fresh.value.trim()
  if (!name) return
  emit('add', name)
  fresh.value = ''
}
</script>

<template>
  <UiModal :open="open" :title="t('app.budget.categories.title')" :description="t('app.budget.categories.text')" size="md" @update:open="emit('update:open', $event)">
    <ul class="space-y-2">
      <li v-for="category in categories" :key="category.id" class="flex items-center gap-2">
        <UiInput v-model="names[category.id]" :aria-label="t('app.budget.categories.name')" maxlength="80" class="flex-1" />
        <UiButton
          v-if="names[category.id] && names[category.id].trim() !== category.name"
          variant="secondary"
          size="sm"
          icon
          :aria-label="t('app.budget.categories.rename')"
          @click="emit('rename', { id: category.id, name: names[category.id].trim() })"
        >
          <Check class="h-4 w-4" aria-hidden="true" />
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          icon
          :disabled="category.itemCount > 0"
          :title="category.itemCount > 0 ? t('app.budget.categories.inUse') : ''"
          :aria-label="t('app.budget.categories.remove', { name: category.name })"
          @click="emit('remove', category)"
        >
          <Trash2 class="h-4 w-4" aria-hidden="true" />
        </UiButton>
      </li>
    </ul>
    <form class="mt-4 flex gap-2" novalidate @submit.prevent="add">
      <UiInput v-model="fresh" :aria-label="t('app.budget.categories.new')" :placeholder="t('app.budget.categories.new')" maxlength="80" class="flex-1" />
      <UiButton type="submit" :loading="saving" :disabled="!fresh.trim()">{{ t('app.budget.categories.add') }}</UiButton>
    </form>
    <template #footer>
      <UiButton @click="emit('update:open', false)">{{ t('app.budget.done') }}</UiButton>
    </template>
  </UiModal>
</template>
