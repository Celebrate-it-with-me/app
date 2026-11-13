<script setup>
/**
 * Floating help button of the organizer shell: opens a small sheet where the person writes what she needs.
 * The screen, event, plan, browser, language and viewport go along automatically (see utils/supportContext).
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { CircleCheck, LifeBuoy } from 'lucide-vue-next'
import { UiButton, UiField, UiModal, UiTextarea } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import SupportService from '../services/SupportService'
import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  buildContext,
  buildPayload,
  errorKeyFor,
  isButtonHidden,
  validateMessage
} from '../utils/supportContext'

const { t, locale } = useI18n()
const route = useRoute()
const eventsStore = useEventsStore()

const triggerRef = ref(null)
const open = ref(false)
const message = ref('')
const touched = ref(false)
const sending = ref(false)
const sent = ref(false)
const errorKey = ref('')

const foreignDialogOpen = ref(false)
const focusedElement = ref(null)

// Another modal (a Reka dialog in the body that is not our sheet) or a long field with focus: step aside.
const hidden = computed(() =>
  open.value ? false : isButtonHidden({ foreignDialogOpen: foreignDialogOpen.value, focusedElement: focusedElement.value })
)

const checkDialogs = () => {
  foreignDialogOpen.value = !open.value && Boolean(document.querySelector('[role="dialog"], [role="alertdialog"]'))
}
const onFocusIn = event => { focusedElement.value = event.target }
const onFocusOut = () => { focusedElement.value = null }

let observer
onMounted(() => {
  document.addEventListener('focusin', onFocusIn)
  document.addEventListener('focusout', onFocusOut)
  observer = new MutationObserver(checkDialogs)
  observer.observe(document.body, { childList: true })
  checkDialogs()
})
onBeforeUnmount(() => {
  document.removeEventListener('focusin', onFocusIn)
  document.removeEventListener('focusout', onFocusOut)
  observer?.disconnect()
})

const validation = computed(() => validateMessage(message.value))
const shownError = computed(() => {
  if (errorKey.value) return t(`support.errors.${errorKey.value}`)
  if (touched.value && validation.value) return t(`support.errors.${validation.value}`, { min: MESSAGE_MIN, max: MESSAGE_MAX })
  return ''
})

const textareaWrap = ref(null)
watch(open, async value => {
  if (value) {
    message.value = ''
    touched.value = false
    sent.value = false
    errorKey.value = ''
    await nextTick()
    textareaWrap.value?.querySelector('textarea')?.focus()
  } else {
    // Give the focus back to the button that opened the sheet.
    focusedElement.value = null
    await nextTick()
    checkDialogs()
    triggerRef.value?.focus()
  }
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
  <Transition
    enter-active-class="transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none"
    leave-active-class="transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none"
    enter-from-class="translate-y-2 opacity-0"
    leave-to-class="translate-y-2 opacity-0"
  >
    <button
      v-show="!hidden"
      ref="triggerRef"
      type="button"
      data-testid="support-help-button"
      class="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-rose-600 text-white shadow-pop transition-colors hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 active:bg-rose-800 lg:bottom-6 lg:right-6 lg:w-auto lg:px-5"
      :aria-label="t('support.open')"
      aria-haspopup="dialog"
      @click="open = true"
    >
      <LifeBuoy class="h-5 w-5 shrink-0" aria-hidden="true" />
      <span class="hidden text-sm font-semibold lg:inline">{{ t('support.button') }}</span>
    </button>
  </Transition>

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
