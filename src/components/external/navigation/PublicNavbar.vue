<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Menu, X } from 'lucide-vue-next'
import QuinviteLogo from '@/components/brand/QuinviteLogo.vue'
import LocaleSwitch from './LocaleSwitch.vue'
import { UiButton } from '@/ui'

const { t } = useI18n()
const route = useRoute()
const open = ref(false)
const menuButton = ref(null)

function closeMenu() {
  if (!open.value) return
  open.value = false
  nextTick(() => menuButton.value?.focus())
}

const links = [
  { label: 'nav.howItWorks', to: { path: '/', hash: '#como-funciona' } },
  { label: 'nav.features', to: { path: '/', hash: '#incluye' } },
  { label: 'nav.pricing', to: { path: '/', hash: '#precios' } },
  { label: 'nav.help', to: '/help' }
]

watch(() => route.fullPath, () => (open.value = false))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line/70 bg-cream-100/90 backdrop-blur" @keydown.esc="closeMenu">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <router-link to="/" class="flex items-center text-ink-900" aria-label="Quinvite" translate="no">
        <QuinviteLogo class="h-8" />
      </router-link>

      <nav class="hidden items-center gap-6 lg:flex" :aria-label="t('nav.primary')">
        <router-link
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
        >
          {{ t(link.label) }}
        </router-link>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <LocaleSwitch />
        <UiButton variant="ghost" size="sm" to="/sign-in">{{ t('common.signIn') }}</UiButton>
        <UiButton size="sm" to="/sign-up">{{ t('common.createEvent') }}</UiButton>
      </div>

      <button
        ref="menuButton"
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-cream-200 lg:hidden"
        :aria-label="t('nav.menu')"
        :aria-expanded="open"
        aria-controls="public-mobile-menu"
        @click="open = !open"
      >
        <X v-if="open" class="h-6 w-6" aria-hidden="true" />
        <Menu v-else class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>

    <div v-if="open" id="public-mobile-menu" class="ui-enter border-t border-line bg-cream-50 px-4 py-4 lg:hidden">
      <nav class="flex flex-col" :aria-label="t('nav.mobile')">
        <router-link
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="rounded-lg px-3 py-3 text-base font-medium text-ink-900 hover:bg-cream-200"
          @click="open = false"
        >
          {{ t(link.label) }}
        </router-link>
      </nav>
      <div class="mt-3 flex flex-col gap-2 border-t border-line pt-4">
        <UiButton block to="/sign-up" @click="open = false">{{ t('common.createEvent') }}</UiButton>
        <UiButton block variant="secondary" to="/sign-in" @click="open = false">{{ t('common.signIn') }}</UiButton>
        <div class="flex justify-center pt-2"><LocaleSwitch /></div>
      </div>
    </div>
  </header>
</template>
