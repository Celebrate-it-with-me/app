<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Ellipsis } from 'lucide-vue-next'
import { useAppNav } from './useAppNav'
import { UiModal } from '@/ui'
import { cx } from '@/ui/utils'

const { t } = useI18n()
const route = useRoute()
const { primary, secondary } = useAppNav()
const moreOpen = ref(false)

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
        <span class="truncate">{{ t(`app.nav.${item.key}`) }}</span>
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
          <component :is="item.icon" class="h-5 w-5 text-rose-700" aria-hidden="true" />
          {{ t(`app.nav.${item.key}`) }}
        </router-link>
      </li>
    </ul>
  </UiModal>
</template>
