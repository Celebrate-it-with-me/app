<script setup>
/**
 * The support sheet: the person writes what she needs. The screen, event, plan, browser, language and viewport go along
 * automatically (see utils/supportContext). It has no button of its own: the floating guide (modules/assistant/guide) opens it.
 */
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { CircleCheck } from 'lucide-vue-next'
import { UiButton, UiField, UiModal, UiTextarea } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import SupportService from '../services/SupportService'
import { MESSAGE_MAX, MESSAGE_MIN, buildContext, buildPayload, errorKeyFor, validateMessage } from '../utils/supportContext'

const open = defineModel('open', { type: Boolean, default: false })

const { t, locale } = useI18n()
const route = useRoute()
const eventsStore = useEventsStore()

const message = ref('')
const touched = ref(false)
const sending = ref(false)
const sent = ref(false)
const errorKey = ref('')

const validation = computed(() => validateMessage(message.value))
const shownError = computed(() => {
  if (errorKey.value) return t(`support.errors.${errorKey.value}`)
  if (touched.value && validation.value) return t(`support.errors.${validation.value}`, { min: MESSAGE_MIN, max: MESSAGE_MAX })
  return ''
})

const textareaWrap = ref(null)
watch(open, async value => {
  if (!value) return
  message.value = ''
  touched.value = false
  sent.value = false
  errorKey.value = ''
  await nextTick()
  textareaWrap.value?.querySelector('textarea')?.focus()
})

const submit = async () => {
  touched.value = true
  errorKey.value = ''
  if (validation.value || sending.value) return
  sending.value = true
  try {
    const event = eventsStore.activeEvent
    const context = buildContext({
      route,
      event,
      locale: locale.value,
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    })
    await SupportService.send(buildPayload({ message: message.value, event, context }))
    sent.value = true
  } catch (error) {
    errorKey.value = errorKeyFor(error)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <UiModal v-model:open="open" :title="sent ? t('support.sentTitle') : t('support.title')" :description="sent ? '' : t('support.description')" size="sm">
    <div v-if="sent" class="flex flex-col items-center gap-3 py-4 text-center" role="status">
      <CircleCheck class="h-10 w-10 text-success-700" aria-hidden="true" />
      <p class="text-base text-ink-700">{{ t('support.sentText') }}</p>
    </div>
    <form v-else id="support-form" novalidate @submit.prevent="submit">
      <UiField :label="t('support.messageLabel')" :error="shownError" :hint="t('support.contextNote')" required>
        <div ref="textareaWrap">
          <UiTextarea
            v-model="message"
            :rows="5"
            :maxlength="MESSAGE_MAX"
            :placeholder="t('support.placeholder')"
            @blur="touched = true"
          />
        </div>
      </UiField>
    </form>
    <template #footer>
      <template v-if="sent">
        <UiButton @click="open = false">{{ t('support.close') }}</UiButton>
      </template>
      <template v-else>
        <UiButton variant="ghost" :disabled="sending" @click="open = false">{{ t('support.cancel') }}</UiButton>
        <UiButton type="submit" form="support-form" :loading="sending">{{ t('support.send') }}</UiButton>
      </template>
    </template>
  </UiModal>
</template>
