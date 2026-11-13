<script setup>
import { useI18n } from 'vue-i18n'
import { EyeOff, Pencil, Trash2 } from 'lucide-vue-next'
import { UiBadge } from '@/ui'

const props = defineProps({
  memory: { type: Object, required: true }
})
const emit = defineEmits(['view', 'edit', 'delete'])
const { t } = useI18n()

const name = () => props.memory.title || t('app.memories.card.untitled')
</script>

<template>
  <article class="overflow-hidden rounded-xl border border-line bg-white">
    <button
      type="button"
      class="relative block aspect-square w-full bg-cream-100 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-600"
      :aria-label="t('app.memories.card.view', { title: name() })"
      @click="emit('view', memory)"
    >
      <img
        :src="memory.thumbnailPath || memory.imagePath"
        :alt="name()"
        loading="lazy"
        class="h-full w-full object-cover"
        :class="memory.visible ? '' : 'opacity-60'"
      />
      <UiBadge v-if="!memory.visible" size="sm" tone="neutral" class="absolute left-2 top-2">
        <EyeOff class="h-3 w-3" aria-hidden="true" />
        {{ t('app.memories.card.hidden') }}
      </UiBadge>
    </button>

    <div class="p-3 pb-1">
      <div class="min-w-0">
        <h3 class="line-clamp-2 text-base font-medium text-ink-900">{{ name() }}</h3>
        <p v-if="memory.year" class="text-sm text-ink-500">{{ memory.year }}</p>
        <p v-if="memory.description" class="mt-1 line-clamp-2 text-sm text-ink-700">{{ memory.description }}</p>
      </div>
    </div>
    <div class="flex justify-end px-1 pb-1">
      <div class="flex">
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 outline-none hover:bg-cream-100 focus-visible:ring-2 focus-visible:ring-rose-600"
          :aria-label="t('app.memories.card.edit', { title: name() })"
          @click="emit('edit', memory)"
        >
          <Pencil class="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-lg text-danger-700 outline-none hover:bg-danger-50 focus-visible:ring-2 focus-visible:ring-rose-600"
          :aria-label="t('app.memories.card.delete', { title: name() })"
          @click="emit('delete', memory)"
        >
          <Trash2 class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </article>
</template>
