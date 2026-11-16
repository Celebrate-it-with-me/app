<script setup>
/**
 * Cover photo (and any other `image` field): shows the current photo or the "no photo" state. Choosing, uploading and
 * the focus screen come from `ImageFieldActions` (Lira B, step 5.7); this component only renders the result.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImageOff } from 'lucide-vue-next'
import ImageFieldActions from './ImageFieldActions.vue'

const props = defineProps({
  field: { type: Object, required: true },
  eventId: { type: [Number, String], default: null },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['changed'])
const { t } = useI18n()

const broken = ref(false)
watch(() => props.field.value?.thumbUrl ?? props.field.value?.url, () => (broken.value = false))

const src = computed(() => (broken.value ? null : (props.field.value?.thumbUrl ?? props.field.value?.url ?? null)))
const focus = computed(() => props.field.value?.focus ?? '50% 50%')
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex h-40 w-32 items-center justify-center overflow-hidden rounded-lg border border-line bg-cream-100" data-testid="image-preview">
      <!-- Decorative: the name of the celebrant is already in the heading of the invitation. -->
      <img v-if="src" :src="src" alt="" class="h-full w-full object-cover" :style="{ objectPosition: focus }" @error="broken = true" />
      <div v-else class="flex flex-col items-center gap-2 px-3 text-center text-ink-500">
        <ImageOff class="h-6 w-6" aria-hidden="true" />
        <span class="text-sm">{{ t('invitationEditor.image.empty') }}</span>
      </div>
    </div>
    <p v-if="!src" class="text-sm text-ink-500">{{ t('invitationEditor.image.emptyHelp') }}</p>
    <ImageFieldActions :field="field" :event-id="eventId" :disabled="disabled" @changed="value => emit('changed', value)" />
  </div>
</template>
