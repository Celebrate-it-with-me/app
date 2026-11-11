<script setup>
import {
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport
} from 'reka-ui'
import { CircleCheck, CircleAlert, TriangleAlert, Info, X } from 'lucide-vue-next'
import { useToast } from './useToast'
import { cx } from './utils'

const { toasts, dismiss } = useToast()

const TONES = {
  neutral: { icon: Info, classes: 'text-info-500' },
  success: { icon: CircleCheck, classes: 'text-success-500' },
  warning: { icon: TriangleAlert, classes: 'text-warning-500' },
  danger: { icon: CircleAlert, classes: 'text-danger-500' }
}
</script>

<template>
  <ToastProvider :label="'Notificaciones'">
    <ToastRoot
      v-for="item in toasts"
      :key="item.id"
      :duration="item.duration"
      class="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-pop data-[state=closed]:animate-out data-[swipe=end]:animate-out"
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
      </div>
      <ToastClose class="-mr-1 -mt-1 rounded-full p-1 text-ink-400 hover:bg-cream-200" aria-label="Cerrar">
        <X class="h-4 w-4" aria-hidden="true" />
      </ToastClose>
    </ToastRoot>
    <ToastViewport
      class="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex max-w-md flex-col gap-2 sm:left-auto sm:right-6 sm:bottom-6"
    />
  </ToastProvider>
</template>
