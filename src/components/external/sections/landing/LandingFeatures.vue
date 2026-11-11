<script setup>
import { useI18n } from 'vue-i18n'
import { MessageCircle, Heart, Users, Sparkles } from 'lucide-vue-next'

const { t, tm } = useI18n()
const icons = [MessageCircle, Heart, Users, Sparkles]
</script>

<template>
  <section id="incluye" class="scroll-mt-20 py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 class="mx-auto max-w-2xl text-center font-heading text-3xl text-ink-900 sm:text-4xl text-balance">
        {{ t('features.title') }}
      </h2>
      <div class="mt-12 grid gap-6 sm:grid-cols-2">
        <article
          v-for="(item, i) in tm('features.items')"
          :key="i"
          class="flex gap-4 rounded-xl border border-line bg-white p-6 shadow-soft"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
            <component :is="icons[i]" class="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h3 class="font-body text-lg font-semibold text-ink-900">{{ item.title }}</h3>
            <p class="mt-1.5 text-base text-ink-500">{{ item.text }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
