<script setup>
/**
 * Public invitation at /i/:slug/:code. One renderer for every template: the API returns the
 * ordered sections and the theme, and this view only maps section types to components and
 * applies the theme as CSS variables.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import i18n, { LOCALES } from '@/locales/i18n'
import { provideInvitation, useInvitationData } from '../composables/useInvitation'
import { themeVars } from '../composables/useInvitationTheme'
import { loadThemeFonts } from '../composables/useInvitationFonts'
import { SECTION_COMPONENTS as COMPONENTS } from '../composables/sectionComponents'
import InvitationLangSwitch from '../components/InvitationLangSwitch.vue'
import InvitationState from '../components/InvitationState.vue'
import InvitationSections from '../components/InvitationSections.vue'
import { PackageLayout, layoutIsValid, usePackageTheme, useIntegrityGuard, ENGINE } from '../package'

const route = useRoute()
const router = useRouter()

const context = useInvitationData(
  () => route.params.slug,
  () => route.params.code
)
const { status, invitation, locale, tt, load } = context
provideInvitation(context)

// Template packages: sections marked render:'package' draw from an AST; the rest are untouched.
const pkg = usePackageTheme(() => invitation.value?.theme?.package)

// Runtime guard: if the package CSS makes a system block unusable, its CSS is dropped (back to Clásica).
const rootEl = ref(null)
useIntegrityGuard({ root: rootEl, active: computed(() => pkg.state.value === 'ready' && status.value === 'ready'), onViolation: pkg.reject })

// A code that does not open anything sends the visitor to the access screen with the code and the error,
// without saying whether the event exists.
watch(status, value => {
  if (value !== 'notFound') return
  router.replace({ name: 'invitation-access', params: { slug: route.params.slug }, query: { code: route.params.code, error: 'invalid' } })
})

const requestedLang = computed(() => (LOCALES.includes(route.query.lang) ? route.query.lang : undefined))
watch(requestedLang, lang => load(lang), { immediate: true })

const sections = computed(() => (invitation.value?.sections ?? []).filter(item => COMPONENTS[item.type]))
const vars = computed(() => themeVars(invitation.value?.theme))

function changeLanguage(lang) {
  router.replace({ query: { ...route.query, lang } })
}
context.changeLanguage = changeLanguage

/** What the sections need from the package while it is usable (CSS loading or ready). */
const usable = computed(() =>
  pkg.usable.value ? { templates: pkg.templates.value, base: pkg.base.value, strings: pkg.strings.value } : null
)
/** `layout.html`, only with exactly one `<q-sections>` (otherwise the plain stack of sections is drawn). */
const layout = computed(() => (usable.value && pkg.layout.value && layoutIsValid(pkg.layout.value) ? pkg.layout.value : null))

// Development only: ?pkg=classic|botanical[&wedding=1] dresses the invitation with an example package (never in a build).
if (import.meta.env.DEV) {
  watch(invitation, async inv => {
    const name = route.query.pkg
    if (!inv || inv.__dev || typeof name !== 'string') return
    const { applyDevPackage } = await import('../package/devPackage')
    invitation.value = { ...(await applyDevPackage(inv, name, { wedding: route.query.wedding === '1' })), __dev: true }
  })
}

// Invitations are private: keep them out of search engines and give the tab a useful title.
let robots
const previousLang = document.documentElement.lang
onMounted(() => {
  robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex, nofollow'
  document.head.appendChild(robots)
})
onUnmounted(() => {
  robots?.remove()
  document.documentElement.lang = previousLang || i18n.global.locale.value
})
watch(
  [invitation, locale],
  () => {
    if (!invitation.value) return
    document.title = invitation.value.event.name
    document.documentElement.lang = locale.value
    // The Clásica theme writes names and short phrases in a script face loaded on demand. A package brings its own fonts.
    if (!invitation.value.theme?.package || pkg.state.value === 'failed') {
      loadThemeFonts({ script: 'Pinyon Script', ...invitation.value.theme?.fonts })
    }
  },
  { immediate: true }
)
watch(pkg.state, state => {
  if (state === 'failed' && invitation.value) loadThemeFonts({ script: 'Pinyon Script', ...invitation.value.theme?.fonts })
})
</script>

<template>
  <div
    ref="rootEl"
    class="inv-root relative min-h-svh bg-inv-surface font-inv-body text-inv-ink antialiased"
    :style="vars"
    :data-inv-theme="pkg.slug.value ?? 'classic'"
    :data-inv-stage="invitation?.stage === 'save_the_date' ? 'save_the_date' : 'invitation'"
    :data-inv-engine="ENGINE"
    :data-inv-pkg="pkg.usable.value ? pkg.state.value : undefined"
  >
    <template v-if="status === 'ready' && invitation">
      <nav class="absolute top-3 right-3 z-10" :aria-label="tt('language')">
        <InvitationLangSwitch :current="locale" :label="tt('language')" @change="changeLanguage" />
      </nav>
      <main>
        <PackageLayout v-if="layout" :ast="layout" :base="usable.base" :strings="usable.strings">
          <InvitationSections :sections="sections" :pkg="usable" />
        </PackageLayout>
        <InvitationSections v-else :sections="sections" :pkg="usable" />
      </main>
    </template>
    <InvitationState v-else :status="status" @retry="load(requestedLang)" />
  </div>
</template>
