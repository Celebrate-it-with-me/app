<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { LogOut, Lock } from 'lucide-vue-next'
import { useAppNav } from './useAppNav'
import { useSignOut } from './useSignOut'
import { cx } from '@/ui/utils'

const { t } = useI18n()
const route = useRoute()
const { byGroup } = useAppNav()
const signOut = useSignOut()

const isActive = to => route.path === to || (to !== '/dashboard' && route.path.startsWith(to + '/'))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
  <nav class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 py-4" :aria-label="t('app.nav.label')">
    <div v-for="group in byGroup" :key="group.group">
      <p
        v-if="group.group !== 'main'"
        class="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500"
      >
        {{ t(`app.groups.${group.group}`) }}
      </p>
      <ul class="flex flex-col gap-0.5">
        <li v-for="item in group.items" :key="item.key">
          <router-link
            :to="item.to"
            :class="
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.to)
                  ? 'bg-rose-100 text-rose-800'
                  : item.state === 'locked'
                    ? 'text-ink-500 hover:bg-cream-200 hover:text-ink-900'
                    : 'text-ink-700 hover:bg-cream-200 hover:text-ink-900'
              )
            "
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <component :is="item.icon" class="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            <span class="min-w-0 flex-1 truncate">{{ t(item.labelKey) }}</span>
            <Lock v-if="item.state === 'locked'" class="h-3.5 w-3.5 shrink-0 text-ink-400" :aria-label="t('app.nav.premium')" role="img" />
          </router-link>
        </li>
      </ul>
    </div>
  </nav>

  <div class="border-t border-line/70 px-3 py-3">
    <button
      type="button"
      class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-cream-200 hover:text-ink-900"
      @click="signOut"
    >
      <LogOut class="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
      {{ t('app.user.logout') }}
    </button>
  </div>
  </div>
</template>
