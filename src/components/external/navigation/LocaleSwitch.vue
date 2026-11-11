<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { LOCALES, setLocale } from '@/locales/i18n'
import { routeTitle } from '@/router/authGuard'
import { cx } from '@/ui/utils'

const { locale, t } = useI18n()
const route = useRoute()

function change(code) {
  setLocale(code)
  document.title = routeTitle(route)
}
</script>

<template>
  <div
    class="inline-flex items-center rounded-full border border-line bg-white p-0.5 text-xs font-semibold"
    role="group"
    :aria-label="t('common.language')"
  >
    <button
      v-for="code in LOCALES"
      :key="code"
      type="button"
      :class="
        cx(
          'rounded-full px-2.5 py-1 uppercase transition-colors',
          locale === code ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900'
        )
      "
      :aria-pressed="locale === code"
      @click="change(code)"
    >
      {{ code }}
    </button>
  </div>
</template>
