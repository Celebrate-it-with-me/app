<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Ellipsis, LogOut, Lock } from 'lucide-vue-next'
import { useAppNav } from './useAppNav'
import { useSignOut } from './useSignOut'
import { UiModal } from '@/ui'
import { cx } from '@/ui/utils'

const { t } = useI18n()
const route = useRoute()
const { primary, secondary } = useAppNav()
const moreOpen = ref(false)
const signOut = useSignOut()

const isActive = to => route.path === to || (to !== '/dashboard' && route.path.startsWith(to + '/'))
const tab =
  'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[0.7rem] font-medium leading-none'
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream-50/95 backdrop-blur lg:hidden"
    :aria-label="t('app.nav.label')"
  >
    <div class="flex items-stretch px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
      <router-link
        v-for="item in primary"
        :key="item.key"
        :to="item.to"
        :class="cx(tab, isActive(item.to) ? 'text-rose-700' : 'text-ink-500')"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
        <span class="truncate">{{ t(item.labelKey) }}</span>
      </router-link>
      <button v-if="secondary.length" type="button" :class="cx(tab, 'text-ink-500')" @click="moreOpen = true">
        <Ellipsis class="h-5 w-5" aria-hidden="true" />
        <span>{{ t('app.nav.more') }}</span>
      </button>
    </div>
  </nav>

  <UiModal v-model:open="moreOpen" :title="t('app.nav.more')" size="sm">
    <ul class="grid grid-cols-3 gap-2">
      <li v-for="item in secondary" :key="item.key">
        <router-link
          :to="item.to"
          class="flex flex-col items-center gap-2 rounded-lg border border-line bg-cream-50 px-2 py-3 text-center text-xs font-medium text-ink-700 hover:bg-cream-200"
          @click="moreOpen = false"
        >
          <span class="relative">
            <component :is="item.icon" class="h-5 w-5" :class="item.state === 'locked' ? 'text-ink-400' : 'text-rose-700'" aria-hidden="true" />
            <Lock
              v-if="item.state === 'locked'"
              class="absolute -right-2 -top-1.5 h-3 w-3 text-ink-500"
              :aria-label="t('app.nav.premium')"
              role="img"
            />
          </span>
          {{ t(item.labelKey) }}
        </router-link>
      </li>
    </ul>
    <div class="mt-4 border-t border-line pt-3">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-ink-700 hover:bg-cream-200"
        @click="moreOpen = false; signOut()"
      >
        <LogOut class="h-4.5 w-4.5" aria-hidden="true" />
        {{ t('app.user.logout') }}
      </button>
    </div>
  </UiModal>
</template>
