<script setup>
/**
 * Admin preview at /preview/invitation. It renders the same section components and theme as the
 * public invitation, but from a payload the admin posts into this iframe with postMessage.
 * Nothing here navigates, calls the API or records analytics, and the payload is only ever
 * rendered through the same text bindings and theme sanitising as the real invitation.
 */
import { computed, onErrorCaptured, onMounted, onUnmounted, ref } from 'vue'
import i18n from '@/locales/i18n'
import { invitationHelpers, provideInvitation } from '../composables/useInvitation'
import { themeVars } from '../composables/useInvitationTheme'
import { loadThemeFonts } from '../composables/useInvitationFonts'
import { isValidPayload, parseOrigin } from '../composables/previewMessage'
import { SECTION_COMPONENTS as COMPONENTS } from '../composables/sectionComponents'

const allowedOrigin = parseOrigin(import.meta.env.VITE_ADMIN_URL)

const invitation = ref(null)
const invalid = ref(false)

const context = {
  invitation,
  status: ref('ready'),
  ...invitationHelpers(invitation),
  load: () => {},
  slug: () => '',
  code: () => '',
  preview: true
}
provideInvitation(context)
const { tt, locale } = context

const sections = computed(() =>
  (invitation.value?.sections ?? []).filter(item => item && typeof item === 'object' && COMPONENTS[item.type])
)
const vars = computed(() => themeVars(invitation.value?.theme))

let previous = null

// A payload with the right shape but broken section data must not blank the preview: go back.
onErrorCaptured(() => {
  invalid.value = true
  invitation.value = previous
  return false
})

function onMessage(event) {
  if (!allowedOrigin || event.origin !== allowedOrigin) return
  const message = event.data
  if (!message || typeof message !== 'object' || message.type !== 'qv-preview') return
  if (!isValidPayload(message.payload)) {
    invalid.value = true
    return
  }
  invalid.value = false
  previous = invitation.value
  invitation.value = message.payload
  loadThemeFonts({ script: 'Pinyon Script', ...message.payload.theme?.fonts })
}

let robots
const previousLang = document.documentElement.lang
onMounted(() => {
  robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex'
  document.head.appendChild(robots)
  if (!allowedOrigin) return
  window.addEventListener('message', onMessage)
  window.parent?.postMessage({ type: 'qv-preview-ready' }, allowedOrigin)
})
onUnmounted(() => {
  window.removeEventListener('message', onMessage)
  robots?.remove()
  document.documentElement.lang = previousLang || i18n.global.locale.value
})
</script>

<template>
  <div class="inv-root min-h-svh bg-inv-surface font-inv-body text-inv-ink antialiased" :style="vars">
    <main v-if="!allowedOrigin" class="flex min-h-svh items-center justify-center px-6 text-center">
      <p role="alert">{{ tt('preview.notConfigured') }}</p>
    </main>
    <template v-else-if="invitation">
      <p
        v-if="invalid"
        role="alert"
        class="fixed top-3 left-3 z-10 max-w-xs rounded-2xl bg-inv-surface px-4 py-2 text-sm ring-1 ring-inv-ink/20"
      >
        {{ tt('preview.invalidKept') }}
      </p>
      <main :lang="locale">
        <component :is="COMPONENTS[section.type]" v-for="(section, index) in sections" :key="`${index}-${section.type}`" :section="section" />
      </main>
    </template>
    <main v-else class="flex min-h-svh items-center justify-center px-6 text-center">
      <p v-if="invalid" role="alert">{{ tt('preview.invalid') }}</p>
      <p v-else role="status">{{ tt('preview.waiting') }}</p>
    </main>
  </div>
</template>
