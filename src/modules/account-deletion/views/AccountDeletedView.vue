<script setup>
import { useI18n } from 'vue-i18n'
import { Heart } from 'lucide-vue-next'
import { UiButton, UiCard } from '@/ui'

const { t } = useI18n()
</script>

<template>
  <section class="flex w-full justify-center">
    <UiCard class="w-full max-w-md" padding="lg">
      <div class="flex flex-col items-center text-center">
        <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <Heart class="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 class="font-heading text-3xl text-ink-900 text-balance">{{ t('accountDeleted.title') }}</h1>
        <p class="mt-3 text-base text-ink-700 text-balance">{{ t('accountDeleted.message') }}</p>
        <p class="mt-2 text-base text-ink-500 text-balance">{{ t('accountDeleted.mail') }}</p>
        <UiButton to="/" block class="mt-6">{{ t('accountDeleted.home') }}</UiButton>
      </div>
    </UiCard>
  </section>
</template>
