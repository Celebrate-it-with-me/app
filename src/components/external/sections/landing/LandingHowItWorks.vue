<script setup>
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()
</script>

<template>
  <section id="como-funciona" class="scroll-mt-20 bg-white py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="max-w-2xl">
        <h2 class="font-heading text-3xl text-ink-900 sm:text-4xl text-balance">{{ t('how.title') }}</h2>
        <p class="mt-3 text-lg text-ink-500">{{ t('how.subtitle') }}</p>
      </div>
      <!-- A real sequence, so the numerals carry information. No cards: a rule and generous space. -->
      <ol class="mt-12 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-8">
        <li v-for="(step, i) in tm('how.steps')" :key="i" class="flex gap-5 md:flex-col md:gap-4">
          <span class="w-9 shrink-0 font-heading text-5xl leading-none text-gold-700 tabular-nums md:w-auto" aria-hidden="true">{{ i + 1 }}</span>
          <div>
            <h3 class="font-body text-lg font-semibold text-ink-900 text-balance">{{ step.title }}</h3>
            <p class="mt-2 max-w-prose text-base text-ink-500">{{ step.text }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
