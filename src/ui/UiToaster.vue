<script setup>
import {
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastViewport
} from 'reka-ui'
import { CircleCheck, CircleAlert, TriangleAlert, Info, X } from 'lucide-vue-next'
import { useToast } from './useToast'
import { cx } from './utils'
import { uiText } from './i18n'

const { toasts, dismiss } = useToast()

function runAction(item) {
  try {
    item.action.onClick?.()
  } finally {
    dismiss(item.id)
  }
}

const TONES = {
  neutral: { icon: Info, classes: 'text-info-500' },
  success: { icon: CircleCheck, classes: 'text-success-500' },
  warning: { icon: TriangleAlert, classes: 'text-warning-500' },
  danger: { icon: CircleAlert, classes: 'text-danger-500' }
}
</script>

<template>
  <ToastProvider :label="uiText('common.notifications')">
    <ToastRoot
      v-for="item in toasts"
      :key="item.id"
      :duration="item.duration"
      class="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-pop data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out"
      @update:open="open => !open && dismiss(item.id)"
    >
      <component
        :is="(TONES[item.tone] ?? TONES.neutral).icon"
        :class="cx('mt-0.5 h-5 w-5 shrink-0', (TONES[item.tone] ?? TONES.neutral).classes)"
        aria-hidden="true"
      />
      <div class="min-w-0 flex-1">
        <ToastTitle class="text-base font-semibold text-ink-900">{{ item.title }}</ToastTitle>
        <ToastDescription v-if="item.description" class="mt-0.5 text-sm text-ink-500">
          {{ item.description }}
        </ToastDescription>
        <ToastAction
          v-if="item.action"
          :alt-text="item.action.altText || item.action.label"
          class="mt-2 inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold text-rose-600 hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-rose-500"
          @click="runAction(item)"
        >
          {{ item.action.label }}
        </ToastAction>
      </div>
      <ToastClose class="-mr-1 -mt-1 rounded-full p-1 text-ink-400 hover:bg-cream-200" :aria-label="uiText('common.close')">
        <X class="h-4 w-4" aria-hidden="true" />
      </ToastClose>
    </ToastRoot>
    <ToastViewport
      class="pointer-events-none fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-100 flex max-w-md flex-col gap-2 sm:inset-x-auto sm:right-6 sm:top-auto sm:bottom-6"
    />
  </ToastProvider>
</template>
