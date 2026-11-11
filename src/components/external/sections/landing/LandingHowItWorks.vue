<script setup>
import { useI18n } from 'vue-i18n'
import { Palette, Users, Send } from 'lucide-vue-next'

const { t, tm } = useI18n()
const icons = [Palette, Users, Send]
</script>

<template>
  <section id="como-funciona" class="scroll-mt-20 bg-white py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="font-heading text-3xl text-ink-900 sm:text-4xl">{{ t('how.title') }}</h2>
        <p class="mt-3 text-lg text-ink-500">{{ t('how.subtitle') }}</p>
      </div>
      <ol class="mt-12 grid gap-8 md:grid-cols-3">
        <li v-for="(step, i) in tm('how.steps')" :key="i" class="relative rounded-xl border border-line bg-cream-50 p-6">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <component :is="icons[i]" class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="font-heading text-3xl text-gold-500">{{ i + 1 }}</span>
          </div>
          <h3 class="mt-4 font-body text-lg font-semibold text-ink-900">{{ step.title }}</h3>
          <p class="mt-2 text-base text-ink-500">{{ step.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
