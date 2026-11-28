<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import { ROLES } from '../utils/collaborators'

defineProps({
  /** Roles to explain, in order. */
  roles: { type: Array, default: () => ROLES },
  /** `page`: three boxes from 768 px, a collapsible list below. `plain`: always an open list (inside the invite dialog). */
  variant: { type: String, default: 'page' }
})

const { t } = useI18n()
const open = ref(false)
</script>

<template>
  <div data-testid="role-help">
    <template v-if="variant === 'page'">
      <button
        type="button"
        class="relative mt-3.5 inline-flex min-h-8 items-center gap-1.5 rounded-md text-[13px] font-semibold text-wine-800 hover:text-wine-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 touch-target md:hidden"
        :aria-expanded="open"
        aria-controls="role-help-list"
        data-testid="role-help-toggle"
        @click="open = !open"
      >
        <Info class="h-4 w-4" aria-hidden="true" />{{ t('app.collaborators.roleHelpToggle') }}
      </button>
      <ul
        id="role-help-list"
        :class="['gap-1.5 md:mt-[18px] md:grid md:grid-cols-3 md:gap-2.5', open ? 'mt-2 grid' : 'hidden']"
        data-testid="role-help-list"
      >
        <li v-for="role in roles" :key="role" class="rounded-xl bg-cream-50 px-3.5 py-3 text-[13px] text-ink-700">
          <span class="font-semibold text-ink-900">{{ t(`app.collaborators.roles.${role}`) }}</span>
          <span class="mt-0.5 block">{{ t(`app.collaborators.roleHelp.${role}`) }}</span>
        </li>
      </ul>
    </template>
    <ul v-else class="flex flex-col gap-1.5" data-testid="role-help-list">
      <li v-for="role in roles" :key="role" class="rounded-xl bg-cream-50 px-3.5 py-3 text-[13px] text-ink-700">
        <span class="font-semibold text-ink-900">{{ t(`app.collaborators.roles.${role}`) }}</span>
        <span class="mt-0.5 block">{{ t(`app.collaborators.roleHelp.${role}`) }}</span>
      </li>
    </ul>
  </div>
</template>
