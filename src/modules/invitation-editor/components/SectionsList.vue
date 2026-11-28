<script setup>
import { useI18n } from 'vue-i18n'
import { ArrowDown, ArrowUp, Lock } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { UiButton, UiSwitch } from '@/ui'
import { canMove, isClosingPinned, pick } from '../utils/editorFields'

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
const unlock = () => router.push({ name: 'unlock', params: { module: 'full' } })
const toggleDisabled = section => props.readOnly || section.required || (moduleLocked(section) && !section.enabled)
</script>

<template>
  <ol class="flex flex-col divide-y divide-line rounded-xl border border-line bg-white" data-testid="sections">
    <li v-for="section in sections" :key="section.type" class="flex flex-col gap-2 py-3 pl-4 lg:pr-4 max-[360px]:pl-3 max-[360px]:py-2 fab-safe" :data-section="section.type">
      <div class="flex min-h-14 items-center gap-2 max-[360px]:min-h-20 max-[360px]:gap-1">
        <div class="min-w-0 flex-1">
          <UiSwitch
            :model-value="section.enabled"
            :label="name(section)"
            :description="section.required ? t('invitationEditor.sections.required') : ''"
            :disabled="toggleDisabled(section)"
            @update:model-value="emit('toggle', section.type)"
          />
        </div>
        <div class="flex shrink-0 items-center max-[360px]:gap-0.5" data-testid="section-controls">
          <UiButton
            v-if="moduleLocked(section)"
            variant="ghost"
            size="sm"
            icon
            :aria-label="t('invitationEditor.field.lockedAria', { name: name(section) })"
            data-testid="section-locked"
            class="h-11 w-11 max-[360px]:h-10 max-[360px]:w-10"
            @click="unlock"
          >
            <Lock class="h-4 w-4 text-gold-700" aria-hidden="true" />
          </UiButton>
          <div class="flex max-[360px]:flex-col">
            <UiButton
              variant="ghost"
              size="md"
              icon
              :disabled="readOnly || busy || !canMove(sections, section.type, -1)"
              :aria-label="t('invitationEditor.sections.moveUp', { name: name(section) })"
              data-testid="move-up"
              class="max-[360px]:h-10 max-[360px]:w-10"
              @click="emit('move', section.type, -1)"
            >
              <ArrowUp class="h-4 w-4" aria-hidden="true" />
            </UiButton>
            <UiButton
              variant="ghost"
              size="md"
              icon
              :disabled="readOnly || busy || !canMove(sections, section.type, 1)"
              :aria-label="t('invitationEditor.sections.moveDown', { name: name(section) })"
              data-testid="move-down"
              class="max-[360px]:h-10 max-[360px]:w-10"
              @click="emit('move', section.type, 1)"
            >
              <ArrowDown class="h-4 w-4" aria-hidden="true" />
            </UiButton>
          </div>
        </div>
      </div>
      <p v-if="isClosingPinned(section)" class="flex items-center gap-2 text-sm text-ink-600" data-testid="closing-pinned">
        <Lock class="h-3.5 w-3.5 text-gold-700" aria-hidden="true" />
        {{ t('invitationEditor.sections.closingLast') }}
      </p>
    </li>
  </ol>
</template>
