<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowDown, ArrowUp, Lock } from 'lucide-vue-next'
import { UiButton, UiSwitch } from '@/ui'
import { canMove, pick } from '../utils/editorFields'

const props = defineProps({
  sections: { type: Array, required: true },
  readOnly: { type: Boolean, default: false },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits(['toggle', 'move'])
const { t, locale } = useI18n()
const router = useRouter()

const name = section => pick(section.title, locale.value) || t(`invitationEditor.sections.types.${section.type}`)
const moduleLocked = section => section.moduleState === 'locked'
const toggleDisabled = section => props.readOnly || section.required || (moduleLocked(section) && !section.enabled)
const unlock = () => router.push({ name: 'unlock', params: { module: 'full' } })
</script>

<template>
  <ol class="flex flex-col divide-y divide-line rounded-xl border border-line bg-white" data-testid="sections">
    <li v-for="section in sections" :key="section.type" class="flex flex-col gap-2 px-4 py-3" :data-section="section.type">
      <div class="flex items-center gap-2">
        <div class="min-w-0 flex-1">
          <UiSwitch
            :model-value="section.enabled"
            :label="name(section)"
            :description="section.required ? t('invitationEditor.sections.required') : ''"
            :disabled="toggleDisabled(section)"
            @update:model-value="emit('toggle', section.type)"
          />
        </div>
        <div class="flex shrink-0">
          <UiButton
            variant="ghost"
            size="sm"
            icon
            :disabled="readOnly || busy || !canMove(sections, section.type, -1)"
            :aria-label="t('invitationEditor.sections.moveUp', { name: name(section) })"
            data-testid="move-up"
            @click="emit('move', section.type, -1)"
          >
            <ArrowUp class="h-4 w-4" aria-hidden="true" />
          </UiButton>
          <UiButton
            variant="ghost"
            size="sm"
            icon
            :disabled="readOnly || busy || !canMove(sections, section.type, 1)"
            :aria-label="t('invitationEditor.sections.moveDown', { name: name(section) })"
            data-testid="move-down"
            @click="emit('move', section.type, 1)"
          >
            <ArrowDown class="h-4 w-4" aria-hidden="true" />
          </UiButton>
        </div>
      </div>
      <div v-if="moduleLocked(section)" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600" data-testid="section-locked">
        <Lock class="h-3.5 w-3.5 text-gold-700" aria-hidden="true" />
        <span>{{ t('invitationEditor.sections.moduleLocked') }}</span>
        <UiButton variant="link" size="sm" @click="unlock">{{ t('invitationEditor.field.unlock') }}</UiButton>
      </div>
    </li>
  </ol>
</template>
