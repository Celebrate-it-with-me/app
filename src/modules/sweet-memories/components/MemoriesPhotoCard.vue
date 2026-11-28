<script setup>
import { useI18n } from 'vue-i18n'
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next'
import { UiDropdown } from '@/ui'

const props = defineProps({
  memory: { type: Object, required: true }
})
const emit = defineEmits(['view', 'edit', 'delete', 'toggle-visible'])
const { t } = useI18n()

const name = () => props.memory.title || t('app.memories.card.untitled')
const menuItems = () => [
  { label: t('app.memories.card.edit', { title: name() }), icon: Pencil, onSelect: () => emit('edit', props.memory) },
  {
    label: t(props.memory.visible ? 'app.memories.card.hide' : 'app.memories.card.show'),
    icon: props.memory.visible ? EyeOff : Eye,
    onSelect: () => emit('toggle-visible', props.memory)
  },
  { label: t('app.memories.card.delete', { title: name() }), icon: Trash2, danger: true, separator: true, onSelect: () => emit('delete', props.memory) }
]
</script>

<template>
  <article class="relative overflow-hidden rounded-[14px] border border-cream-200 bg-white">
    <button
      type="button"
      class="block aspect-[4/3] w-full cursor-zoom-in bg-cream-100 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-600"
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
    </button>

    <button
      type="button"
      class="touch-target absolute left-2.5 top-2.5 inline-flex h-[26px] items-center gap-1.5 rounded-full bg-white/90 px-[9px] text-[11px] font-semibold shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
      :class="memory.visible ? 'text-success-700' : 'text-ink-500'"
      :aria-pressed="!!memory.visible"
      :aria-label="t(memory.visible ? 'app.memories.card.toggleHide' : 'app.memories.card.toggleShow', { title: name() })"
      @click="emit('toggle-visible', memory)"
    >
      <component :is="memory.visible ? Eye : EyeOff" class="h-3.5 w-3.5" aria-hidden="true" />
      {{ t(memory.visible ? 'app.memories.card.visible' : 'app.memories.card.hidden') }}
    </button>

    <UiDropdown :items="menuItems()">
      <template #trigger>
        <button
          type="button"
          class="touch-target absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
          :aria-label="t('app.memories.card.menu', { title: name() })"
        >
          <MoreHorizontal class="h-4 w-4" aria-hidden="true" />
        </button>
      </template>
    </UiDropdown>

    <div class="px-2.5 pb-2.5 pt-2 md:px-3 md:pb-3 md:pt-2.5">
      <h3 class="line-clamp-2 font-heading text-[15px] leading-tight text-ink-900 md:text-base">{{ name() }}</h3>
      <p v-if="memory.description" class="mt-1 line-clamp-2 text-[13px] text-ink-500">{{ memory.description }}</p>
    </div>
  </article>
</template>
