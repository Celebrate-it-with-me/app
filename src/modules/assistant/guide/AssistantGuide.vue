<script setup>
/**
 * "Tu siguiente paso": the one floating button of the organizer panel. It suggests the single next action (from
 * `assistant/next`), opens a sheet with it, and carries the way to ask for help (the support sheet). Only the organizer's
 * shell mounts it: never the public invitation, the admin or a support (impersonation) session.
 *
 * Quiet by design: it never opens by itself (one small welcome bubble, once), the pink dot goes out once the step was seen,
 * and on work screens, while reading down the page or when she asks ("Ocultar por hoy") it shrinks to an icon.
 * Without a usable plan (loading, error, other event types, viewers) it is just the help icon.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { CircleCheck, LifeBuoy, Sparkles } from 'lucide-vue-next'
import { useToast } from '@/ui'
import { floatingBarSpace } from '@/composables/useFloatingBarSpace'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'
import SupportSheet from '@/modules/support/components/SupportSheet.vue'
import { isButtonHidden, nextTucked } from '@/modules/support/utils/supportContext'
import { useAssistantStore } from '../stores/useAssistantStore'
import { resolveTaskRoute } from '../utils/assistant'
import AssistantGuideSheet from './AssistantGuideSheet.vue'
import {
  SNOOZE_DAYS,
  countdown as countdownOf,
  getSeenKey,
  guideView,
  hasNewDot,
  isCompactForSession,
  isCompactRoute,
  isHelpOnlyRoute,
  markWelcomed,
  setCompactForSession,
  setSeenKey,
  toneFor,
  wasWelcomed
} from './guideUtils'

const { t, locale } = useI18n()
const route = useRoute()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()
const impersonation = useImpersonationStore()
const store = useAssistantStore()
const { next, nextStatus } = storeToRefs(store)

const event = computed(() => eventsStore.activeEvent)
const eventId = computed(() => event.value?.id ?? null)
// Only owners and editors act on the plan; a viewer only gets the help.
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const tone = computed(() => toneFor(eventsStore.eventTypes.find(type => type.id === event.value?.eventType)?.slug))

// On the Inicio the help icon is not floating: it sits in the header's dock (`#shell-help-dock`, drawn by the layout on
// that route), so it never covers the blocks of the page at any width. Without the dock (tests, other shells) it floats.
const HELP_DOCK_ID = 'shell-help-dock'
const dockEl = ref(null)
const findDock = () => (dockEl.value = isHelpOnlyRoute(route.path) ? document.getElementById(HELP_DOCK_ID) : null)

const view = computed(() => {
  // On the Inicio the steps live in "Lo que toca ahora": only the help icon stays.
  if (isHelpOnlyRoute(route.path)) return { kind: 'help' }
  if (!eventId.value || !canEdit.value || nextStatus.value !== 'ready' || store.eventId !== eventId.value) return { kind: 'help' }
  return guideView(next.value)
})
const target = computed(() => {
  if (view.value.kind === 'setDate') return resolveTaskRoute('@edit-event', eventId.value)
  if (view.value.kind === 'task') return resolveTaskRoute(view.value.task.route, eventId.value)
  return null
})

// ---- data -------------------------------------------------------------------------------------------------------
const load = (force = false) => {
  if (eventId.value && canEdit.value) store.fetchNext({ eventId: eventId.value, lang: locale.value, force })
}
watch([eventId, canEdit], () => load(), { immediate: true })
watch(() => route.fullPath, () => load())
watch(locale, () => load(true))
const onVisible = () => document.visibilityState === 'visible' && load()

// ---- the pink dot -----------------------------------------------------------------------------------------------
const seenKey = ref(null)
watch(eventId, id => (seenKey.value = id ? getSeenKey(id) : null), { immediate: true })
const markSeen = () => {
  if (view.value.kind !== 'task' || !eventId.value) return
  seenKey.value = view.value.task.key
  setSeenKey(eventId.value, view.value.task.key)
}
const showDot = computed(() => hasNewDot(view.value, seenKey.value))

// ---- how it looks -----------------------------------------------------------------------------------------------
const guideOpen = ref(false)
const supportOpen = ref(false)
const compactSession = ref(isCompactForSession())
const tucked = ref(false)
const compact = computed(() => isCompactRoute(route.path) || compactSession.value || tucked.value)
const variant = computed(() => {
  if (view.value.kind === 'help') return 'help'
  if (view.value.kind === 'allSet') return 'calm'
  return compact.value ? 'icon' : 'pill'
})

let lastY = 0
const onScroll = () => {
  if (welcome.value) dismissWelcome() // reading down the page is an answer: the bubble goes
  const y = window.scrollY
  tucked.value = nextTucked({ tucked: tucked.value, lastY, y })
  lastY = y
}

// Another modal, or a long field with the focus, makes it step aside (the save button must stay reachable).
const foreignDialogOpen = ref(false)
const focusedElement = ref(null)
const ownOpen = computed(() => guideOpen.value || supportOpen.value)
const hidden = computed(() => (ownOpen.value ? false : isButtonHidden({ foreignDialogOpen: foreignDialogOpen.value, focusedElement: focusedElement.value })))
const checkDialogs = () => {
  foreignDialogOpen.value = !ownOpen.value && Boolean(document.querySelector('[role="dialog"], [role="alertdialog"]'))
}
const onFocusIn = e => (focusedElement.value = e.target)
const onFocusOut = () => (focusedElement.value = null)

// ---- welcome bubble: once in the life of the browser, never over a work screen or a button -----------------------
const WELCOME_MS = 6000
const welcome = ref(false)
let welcomeTimer
let welcomeHide

/** True when the bubble, drawn above the trigger, would cover something she can press or type in (a CTA, a filter, a field). */
const welcomeCoversControl = () => {
  const box = triggerRef.value?.getBoundingClientRect()
  if (!box) return false
  const width = Math.min(256, window.innerWidth - 32)
  const bubble = { left: box.right - width, right: box.right, top: box.top - 8 - 96, bottom: box.top - 8 }
  const overlaps = r => r.width > 0 && r.height > 0 && r.left < bubble.right && r.right > bubble.left && r.top < bubble.bottom && r.bottom > bubble.top
  const hitsControl = [...document.querySelectorAll('main a[href], main button, main input, main select, main textarea, main [role="tab"], main [role="combobox"]')].some(el => overlaps(el.getBoundingClientRect()))
  return hitsControl || welcomeCoversText(overlaps)
}
/** Same for readable text: the lines of text actually drawn (not their wide block boxes) must stay clear of the bubble (ORG-027). */
const welcomeCoversText = overlaps => {
  const main = document.querySelector('main')
  if (!main) return false
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.nodeValue.trim()) continue
    range.selectNodeContents(node)
    if ([...(range.getClientRects?.() ?? [])].some(overlaps)) return true
  }
  return false
}
const scheduleWelcome = () => {
  if (welcome.value || wasWelcomed() || variant.value !== 'pill' || !showDot.value) return
  clearTimeout(welcomeTimer)
  welcomeTimer = setTimeout(() => {
    if (variant.value !== 'pill' || ownOpen.value) return
    // Over a control it would hide it: not now, and it is not spent, so a calmer screen can still show it.
    if (welcomeCoversControl()) return
    welcome.value = true
    markWelcomed()
    welcomeHide = setTimeout(() => (welcome.value = false), WELCOME_MS)
  }, 1500)
}
watch([variant, showDot], scheduleWelcome, { immediate: true })
watch(() => route.fullPath, scheduleWelcome) // skipped over a control: try again on the next screen
// The layout draws (or removes) the dock with the route: look for it once that render is done.
watch(() => route.path, () => nextTick(findDock), { flush: 'post' })
const dismissWelcome = () => {
  welcome.value = false
  clearTimeout(welcomeHide)
}

let observer
onMounted(() => {
  findDock()
  lastY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('focusin', onFocusIn)
  document.addEventListener('focusout', onFocusOut)
  document.addEventListener('visibilitychange', onVisible)
  observer = new MutationObserver(checkDialogs)
  observer.observe(document.body, { childList: true })
  checkDialogs()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('focusin', onFocusIn)
  document.removeEventListener('focusout', onFocusOut)
  document.removeEventListener('visibilitychange', onVisible)
  observer?.disconnect()
  clearTimeout(welcomeTimer)
  clearTimeout(welcomeHide)
})

// ---- opening and closing ----------------------------------------------------------------------------------------
const triggerRef = ref(null)
const focusTrigger = async () => {
  await nextTick()
  triggerRef.value?.focus()
}
const onTrigger = () => {
  dismissWelcome()
  if (variant.value === 'help') supportOpen.value = true
  else {
    guideOpen.value = true
    load(true)
  }
}
watch(guideOpen, value => {
  if (value) markSeen()
})
// A new step may arrive while the sheet is open (she did one): it counts as seen.
watch(() => view.value.task?.key, () => guideOpen.value && markSeen())
watch(supportOpen, value => {
  if (!value) {
    focusedElement.value = null
    nextTick(checkDialogs)
    focusTrigger()
  }
})

const closeGuide = () => (guideOpen.value = false)
const openHelp = async () => {
  guideOpen.value = false
  await nextTick()
  supportOpen.value = true
}
const hideToday = () => {
  compactSession.value = true
  setCompactForSession(true)
  guideOpen.value = false
  success(t('assistantGuide.hiddenToast'))
  focusTrigger()
}

// ---- acting -----------------------------------------------------------------------------------------------------
const busy = computed(() => view.value.kind === 'task' && store.isBusy(view.value.task.key))
const celebrating = ref(false)

const messageOf = e => {
  const status = e?.response?.status
  if (e?.response?.data?.code === 'impersonation_blocked') return t('app.assistant.errors.impersonation')
  if (status === 429) return t('app.assistant.errors.tooMany')
  if (status === 403) return t('app.assistant.errors.forbidden')
  return t('app.assistant.errors.generic')
}
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

async function markDone() {
  if (view.value.kind !== 'task' || busy.value) return
  try {
    await store.actOnTask(view.value.task.key, 'done')
  } catch (e) {
    showError(messageOf(e))
    return
  }
  // A short golden "done" moment, then the next step takes its place (no delay when she prefers less motion).
  celebrating.value = true
  await Promise.all([store.refresh(), wait(reducedMotion() ? 0 : 850)])
  celebrating.value = false
}

async function snooze() {
  if (view.value.kind !== 'task' || busy.value) return
  try {
    await store.actOnTask(view.value.task.key, 'snooze', { days: SNOOZE_DAYS })
    success(t('assistantGuide.snoozedToast'))
    await store.refresh()
  } catch (e) {
    showError(messageOf(e))
  }
}

const label = computed(() => (view.value.kind === 'task' ? t('assistantGuide.pill.withTitle', { title: view.value.task.title }) : t('assistantGuide.pill.label')))
const iconLabel = computed(() => {
  if (variant.value === 'help') return t('support.open')
  if (variant.value === 'calm') return t('assistantGuide.pill.calm')
  return label.value
})
const countdown = computed(() => countdownOf(next.value))
</script>

<template>
  <div v-if="!impersonation.active">
    <Teleport v-if="dockEl" :to="dockEl">
      <button
        ref="triggerRef"
        type="button"
        data-testid="guide-trigger"
        data-variant="help"
        data-docked="true"
        :aria-label="t('support.open')"
        :title="t('support.button')"
        aria-haspopup="dialog"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-rose-700 transition-colors duration-150 ease-out hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 active:bg-rose-100 motion-reduce:transition-none"
        @click="onTrigger"
      >
        <LifeBuoy class="h-5 w-5 shrink-0" aria-hidden="true" />
      </button>
    </Teleport>
    <Transition
      v-else
      enter-active-class="transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none"
      leave-active-class="transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="translate-y-2 opacity-0"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-show="!hidden"
        class="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom,0px)+var(--assistant-lift,0px))] z-40 flex flex-col items-end gap-2 transition-[bottom] duration-200 ease-out motion-reduce:transition-none lg:bottom-[calc(1.5rem+var(--assistant-lift,0px))] lg:right-6"
        :style="{ '--assistant-lift': `${floatingBarSpace}px` }"
        data-testid="assistant-guide"
        :data-variant="variant"
      >
        <Transition
          enter-active-class="transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none"
          leave-active-class="transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none"
          enter-from-class="translate-y-1 opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="welcome"
            class="relative w-64 max-w-[calc(100vw-2rem)] rounded-xl bg-ink-900 p-3 pr-3 text-sm text-cream-50 shadow-pop"
            role="status"
            data-testid="guide-welcome"
          >
            <p>{{ t('assistantGuide.welcome') }}</p>
            <button type="button" class="mt-1 inline-flex min-h-11 items-center font-semibold text-gold-300 underline-offset-4 hover:underline" @click="dismissWelcome">
              {{ t('assistantGuide.welcomeOk') }}
            </button>
          </div>
        </Transition>

        <button
          ref="triggerRef"
          type="button"
          data-testid="guide-trigger"
          :data-variant="variant"
          :aria-label="iconLabel"
          :title="variant === 'help' ? t('support.button') : label"
          aria-haspopup="dialog"
          class="relative flex h-12 items-center justify-center gap-2 rounded-full border text-sm font-semibold shadow-pop transition-[opacity,translate,background-color] duration-200 ease-out hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 active:bg-rose-100 motion-reduce:transition-none"
          :class="[
            variant === 'pill' ? 'max-w-[calc(100vw-2rem)] border-rose-200 bg-white pl-4 pr-5 text-rose-700' : 'w-12 shrink-0',
            variant === 'calm' ? 'border-line bg-cream-50 text-success-700' : variant === 'help' ? 'border-rose-600 bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800' : 'border-rose-200 bg-white text-rose-700'
          ]"
          @click="onTrigger"
        >
          <LifeBuoy v-if="variant === 'help'" class="h-5 w-5 shrink-0" aria-hidden="true" />
          <CircleCheck v-else-if="variant === 'calm'" class="h-5 w-5 shrink-0" aria-hidden="true" />
          <Sparkles v-else class="h-5 w-5 shrink-0 text-gold-500" aria-hidden="true" />
          <span v-if="variant === 'pill'" class="truncate">{{ t('assistantGuide.pill.label') }}</span>
          <span v-if="showDot" class="absolute -right-0.5 -top-0.5 h-3.5 w-3.5" data-testid="guide-dot" aria-hidden="true">
            <!-- A soft ring that grows and fades (transform + opacity only); with reduced motion only the still dot is left. -->
            <span class="guide-pulse absolute inset-0 rounded-full bg-rose-500 motion-reduce:hidden" data-testid="guide-pulse"></span>
            <span class="absolute inset-0 rounded-full border-2 border-white bg-rose-500"></span>
          </span>
        </button>
      </div>
    </Transition>

    <p class="sr-only" role="status" aria-live="polite">{{ showDot && !guideOpen ? t('assistantGuide.newDot') : '' }}</p>

    <AssistantGuideSheet
      v-model:open="guideOpen"
      :view="view"
      :progress="next?.progress"
      :countdown="countdown"
      :tone="tone"
      :target="target"
      :can-edit="canEdit"
      :busy="busy"
      :celebrating="celebrating"
      @go="closeGuide"
      @done="markDone"
      @snooze="snooze"
      @help="openHelp"
      @hide="hideToday"
      @close-focus="focusTrigger"
    />
    <SupportSheet v-model:open="supportOpen" />
  </div>
</template>
