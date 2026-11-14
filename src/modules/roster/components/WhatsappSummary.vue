<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MESSAGE_VIEW } from '../utils/whatsapp'

const props = defineProps({ summary: { type: Object, default: null } })
const { t } = useI18n()

const KEYS = ['queued', 'sent', 'delivered', 'read', 'failed']
const items = computed(() => KEYS.map(key => ({ key, icon: MESSAGE_VIEW[key].icon, value: props.summary?.[key] ?? 0 })))
</script>

<template>
  <section v-if="summary && summary.total" class="mt-4 rounded-2xl border border-line bg-white p-4" :aria-label="t('app.whatsapp.summary.label')">
    <p class="font-heading text-lg text-ink-900">{{ t('app.whatsapp.summary.title', { n: summary.total }, summary.total) }}</p>
    <ul class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
      <li v-for="item in items" :key="item.key" class="rounded-xl bg-cream-100 px-3 py-2" :class="item.key === 'failed' && item.value ? 'bg-danger-50' : ''">
        <p class="flex items-center gap-1.5 text-xs text-ink-700">
          <component :is="item.icon" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {{ t(`app.whatsapp.state.${item.key}`) }}
        </p>
        <p class="font-heading text-xl text-ink-900">{{ item.value }}</p>
      </li>
    </ul>
  </section>
</template>
