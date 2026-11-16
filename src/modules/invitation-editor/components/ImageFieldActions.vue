<script setup>
/**
 * Where the cover upload plugs in (Lira B, step 5.7): "Subir foto / Cambiar / Quitar" and the focus screen.
 * It receives the field (with its `aspect`, `minWidth`, `value`) and emits `changed` with the new `fields[].value` so the
 * editor shows it. The photo never goes through `PATCH invitation` (only `focus` does): it has its own endpoint.
 */
import { useI18n } from 'vue-i18n'

defineProps({
  field: { type: Object, required: true },
  eventId: { type: [Number, String], default: null },
  disabled: { type: Boolean, default: false }
})
defineEmits(['changed'])
const { t } = useI18n()
</script>

<template>
  <p class="text-sm text-ink-500" data-testid="image-actions-placeholder">{{ t('invitationEditor.image.soon') }}</p>
</template>
