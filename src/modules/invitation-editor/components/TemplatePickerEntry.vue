<script setup>
/**
 * Where the template selector plugs in (Lira B, step 5.6). This is only the entry point: the card with the current
 * template and the "Cambiar plantilla" button, with the rules the contract gives (§3.1, §6.5):
 * - `templateLocked` (the invitation is published and pinned): the button is disabled, with the reason and a support link.
 * - `open` is emitted on click; the selector (sheet/panel, preview, confirmation, undo) is mounted by whoever replaces
 *   the `#picker` slot or wires the `open` event. After `PUT template` the picker emits `applied` with the new
 *   `GET invitation` payload (the same shape), which the screen takes as the new state.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock, Palette } from 'lucide-vue-next'
import { UiBadge, UiButton, UiCard } from '@/ui'
import { mailtoLink } from '@/config/brand'

const props = defineProps({
  template: { type: Object, required: true },
  templateLocked: { type: Boolean, default: false },
  eventId: { type: [Number, String], default: null },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['open', 'applied'])
const { t } = useI18n()

const supportLink = computed(() =>
  mailtoLink({ subject: t('invitationEditor.template.supportSubject'), body: t('invitationEditor.template.supportBody', { event: props.eventId ?? '' }) })
)
</script>

<template>
  <UiCard padding="md" data-testid="template-card">
    <div class="flex items-center gap-4">
      <div class="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-cream-200 text-ink-400" aria-hidden="true">
        <img v-if="template.previewImage" :src="template.previewImage" alt="" class="h-full w-full object-cover" loading="lazy" />
        <Palette v-else class="h-5 w-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold uppercase tracking-wide text-ink-500">{{ t('invitationEditor.template.label') }}</p>
        <p class="truncate font-heading text-xl text-ink-900" data-testid="template-name">{{ template.name }}</p>
        <UiBadge :tone="template.tier === 'premium' ? 'gold' : 'neutral'" size="sm" class="mt-1">
          <Lock v-if="template.tier === 'premium'" class="mr-1 h-3 w-3" aria-hidden="true" />
          {{ t(`invitationEditor.template.tier.${template.tier === 'premium' ? 'premium' : 'free'}`) }}
        </UiBadge>
      </div>
    </div>

    <p v-if="template.fallbackToClassic" class="mt-4 rounded-lg bg-warning-50 p-3 text-sm text-warning-700" role="status">
      {{ t('invitationEditor.template.fallback') }}
    </p>

    <slot name="picker" :open="() => emit('open')" :applied="state => emit('applied', state)">
      <div class="mt-4">
        <UiButton variant="secondary" block :disabled="templateLocked || disabled" :aria-describedby="templateLocked ? 'template-locked-reason' : undefined" @click="emit('open')">
          {{ t('invitationEditor.template.change') }}
        </UiButton>
        <div v-if="templateLocked" id="template-locked-reason" class="mt-3 text-sm text-ink-600" data-testid="template-locked">
          <p>{{ t('invitationEditor.template.lockedText') }}</p>
          <a :href="supportLink" class="mt-1 inline-block font-semibold text-rose-600 hover:underline">{{ t('invitationEditor.template.contactSupport') }}</a>
        </div>
      </div>
    </slot>
  </UiCard>
</template>
