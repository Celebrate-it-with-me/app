<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAppNav } from './useAppNav'
import { cx } from '@/ui/utils'

const { t } = useI18n()
const route = useRoute()
const { byGroup } = useAppNav()

const isActive = to => route.path === to || (to !== '/dashboard' && route.path.startsWith(to + '/'))
</script>

<template>
  <nav class="flex flex-col gap-6 px-3 py-4" :aria-label="t('app.nav.label')">
    <div v-for="group in byGroup" :key="group.group">
      <p class="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
        {{ t(`app.groups.${group.group}`) }}
      </p>
      <ul class="flex flex-col gap-0.5">
        <li v-for="item in group.items" :key="item.key">
          <router-link
            :to="item.to"
            :class="
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.to) ? 'bg-rose-100 text-rose-800' : 'text-ink-700 hover:bg-cream-200 hover:text-ink-900'
              )
            "
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <component :is="item.icon" class="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {{ t(`app.nav.${item.key}`) }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>
