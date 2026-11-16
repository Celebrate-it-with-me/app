<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, CloudOff, LoaderCircle, TriangleAlert } from 'lucide-vue-next'

const props = defineProps({
  /** 'idle' | 'saving' | 'saved' | 'offline' | 'error' */
  status: { type: String, default: 'idle' }
})
defineEmits(['retry'])
const { t } = useI18n()

const view = computed(
  () =>
    ({
      saving: { icon: LoaderCircle, spin: true, tone: 'text-ink-500', key: 'saving' },
      saved: { icon: Check, spin: false, tone: 'text-success-700', key: 'saved' },
      offline: { icon: CloudOff, spin: false, tone: 'text-warning-700', key: 'offline' },
      error: { icon: TriangleAlert, spin: false, tone: 'text-danger-700', key: 'error' }
    })[props.status] ?? null
)
</script>

<template>
  <!-- A live region that exists from the start, so screen readers announce the change of state. -->
  <p class="flex min-h-6 items-center gap-1.5 text-sm" role="status" aria-live="polite" data-testid="save-indicator" :data-status="status">
    <template v-if="view">
      <component :is="view.icon" class="h-4 w-4 shrink-0" :class="[view.tone, view.spin && 'animate-spin motion-reduce:animate-none']" aria-hidden="true" />
      <span :class="view.tone">{{ t(`invitationEditor.save.${view.key}`) }}</span>
      <button v-if="status === 'error'" type="button" class="font-semibold text-rose-600 underline-offset-4 hover:underline" @click="$emit('retry')">
        {{ t('invitationEditor.save.retry') }}
      </button>
    </template>
  </p>
</template>
