<script setup>
/**
 * Admin preview at /preview/invitation. It renders the same section components and theme as the
 * public invitation, but from a payload the admin posts into this iframe with postMessage.
 * Nothing here navigates, calls the API or records analytics, and the payload is only ever
 * rendered through the same text bindings and theme sanitising as the real invitation.
 */
import { computed, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue'
import i18n from '@/locales/i18n'
import { invitationHelpers, provideInvitation } from '../composables/useInvitation'
import { themeVars } from '../composables/useInvitationTheme'
import { loadThemeFonts } from '../composables/useInvitationFonts'
import { isValidPayload, parseOrigin } from '../composables/previewMessage'
import { SECTION_COMPONENTS as COMPONENTS } from '../composables/sectionComponents'
import InvitationSections from '../components/InvitationSections.vue'
import { PackageLayout, layoutIsValid, usePackageTheme, useIntegrityGuard, ENGINE } from '../package'

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
  preview: true,
  // The preview language belongs to the payload the admin posts; a package's language switch only changes it locally.
  changeLanguage: lang => {
    if (invitation.value) invitation.value = { ...invitation.value, locale: lang }
  }
}
provideInvitation(context)
const { tt, locale } = context

// Template packages (installed, or an uploaded draft the API serves from staging): the same engine as the public
// invitation, so the reviewer sees exactly what guests will see, including the integrity guard's fallback.
const pkg = usePackageTheme(() => invitation.value?.theme?.package)
const usable = computed(() => (pkg.usable.value ? { templates: pkg.templates.value, base: pkg.base.value, strings: pkg.strings.value } : null))
const layout = computed(() => (usable.value && pkg.layout.value && layoutIsValid(pkg.layout.value) ? pkg.layout.value : null))
const rootEl = ref(null)
const guardProblems = ref(null)
useIntegrityGuard({
  root: rootEl,
  active: computed(() => pkg.state.value === 'ready' && !!invitation.value),
  onViolation: problems => {
    guardProblems.value = problems
    pkg.reject(problems)
  }
})

const sections = computed(() =>
  (invitation.value?.sections ?? []).filter(item => item && typeof item === 'object' && COMPONENTS[item.type])
)
const vars = computed(() => themeVars(invitation.value?.theme))

// Clásica's script face is only loaded when no package is drawn: also when the CSS failed or the guard dropped it.
watch(pkg.state, state => {
  if (state === 'failed' && invitation.value) loadThemeFonts({ script: 'Pinyon Script', ...invitation.value.theme?.fonts })
})

let previous = null

// A payload with the right shape but broken section data must not blank the preview: go back.
onErrorCaptured(() => {
  invalid.value = true
  invitation.value = previous
  return false
})

/**
 * Contract with the admin: only the admin window that embeds this page (`source`), from the configured origin, may
 * send `{ type: 'qv-preview', payload }`. Anything else is ignored without a trace.
 */
function onMessage(event) {
  if (!allowedOrigin || event.origin !== allowedOrigin) return
  if (event.source !== window.parent) return
  const message = event.data
  if (!message || typeof message !== 'object' || message.type !== 'qv-preview') return
  if (!isValidPayload(message.payload)) {
    invalid.value = true
    return
  }
  invalid.value = false
  guardProblems.value = null
  previous = invitation.value
  invitation.value = message.payload
  // A package brings its own fonts; Clásica loads its script face on demand.
  if (!message.payload.theme?.package) loadThemeFonts({ script: 'Pinyon Script', ...message.payload.theme?.fonts })
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
  <div
    ref="rootEl"
    class="inv-root min-h-svh bg-inv-surface font-inv-body text-inv-ink antialiased"
    :style="vars"
    :data-inv-theme="pkg.slug.value ?? 'classic'"
    :data-inv-stage="invitation?.stage === 'save_the_date' ? 'save_the_date' : 'invitation'"
    :data-inv-engine="ENGINE"
    :data-inv-pkg="pkg.usable.value ? pkg.state.value : undefined"
  >
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
      <p
        v-if="guardProblems"
        role="alert"
        data-preview-guard
        class="fixed top-3 right-3 z-30 max-w-xs rounded-2xl bg-inv-surface px-4 py-2 text-sm ring-1 ring-inv-ink/20"
      >
        {{ tt('preview.packageDropped') }}
      </p>
      <main :lang="locale">
        <PackageLayout v-if="layout" :ast="layout" :base="usable.base" :strings="usable.strings">
          <InvitationSections :sections="sections" :pkg="usable" />
        </PackageLayout>
        <InvitationSections v-else :sections="sections" :pkg="usable" />
      </main>
    </template>
    <main v-else class="flex min-h-svh items-center justify-center px-6 text-center">
      <p v-if="invalid" role="alert">{{ tt('preview.invalid') }}</p>
      <p v-else role="status">{{ tt('preview.waiting') }}</p>
    </main>
  </div>
</template>
