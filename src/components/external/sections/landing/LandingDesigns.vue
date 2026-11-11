<script setup>
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/ui'
import InvitationCard from '@/components/external/art/InvitationCard.vue'
import { useReveal } from '@/composables/useReveal'

const { t, tm } = useI18n()
const themes = ['clasica', 'jardin', 'noche']
const { root } = useReveal()
</script>

<template>
  <section id="disenos" ref="root" class="relative scroll-mt-20 overflow-hidden bg-pattern-lattice py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="max-w-2xl">
        <h2 class="font-heading text-3xl text-ink-900 sm:text-4xl text-balance">{{ t('designs.title') }}</h2>
        <p class="mt-3 text-lg text-ink-500">{{ t('designs.subtitle') }}</p>
      </div>

      <!-- Phones: a swipeable row. Larger screens: three columns. -->
      <ul
        class="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:px-0"
      >
        <li
          v-for="(item, i) in tm('designs.items')"
          :key="themes[i]"
          data-reveal
          :style="{ '--i': i }"
          class="group w-[76%] shrink-0 snap-center sm:w-auto"
        >
          <div class="transition-transform duration-300 ease-out group-hover:-translate-y-1.5 [@media(hover:none)]:group-hover:translate-y-0">
            <InvitationCard :theme="themes[i]" :name="item.name" :date="item.date" :place="item.place" :question="t('mock.question')" :yes="t('mock.yes')" />
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <div>
              <p class="font-heading text-xl text-ink-900">{{ item.title }}</p>
              <p class="text-sm text-ink-500">{{ item.text }}</p>
            </div>
            <UiBadge :tone="item.premium ? 'gold' : 'neutral'" size="sm">
              {{ item.premium ? t('designs.premium') : t('designs.free') }}
            </UiBadge>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
