<script setup>
/**
 * Public invitation at /i/:slug/:code. One renderer for every template: the API returns the
 * ordered sections and the theme, and this view only maps section types to components and
 * applies the theme as CSS variables.
 */
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import i18n, { LOCALES } from '@/locales/i18n'
import { provideInvitation, useInvitationData } from '../composables/useInvitation'
import { themeVars } from '../composables/useInvitationTheme'
import { loadThemeFonts } from '../composables/useInvitationFonts'
import { SECTION_COMPONENTS as COMPONENTS } from '../composables/sectionComponents'
import InvitationLangSwitch from '../components/InvitationLangSwitch.vue'
import InvitationState from '../components/InvitationState.vue'
import { PackageSection, usePackageTheme } from '../package'

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

const requestedLang = computed(() => (LOCALES.includes(route.query.lang) ? route.query.lang : undefined))
watch(requestedLang, lang => load(lang), { immediate: true })

const sections = computed(() => (invitation.value?.sections ?? []).filter(item => COMPONENTS[item.type]))
const vars = computed(() => themeVars(invitation.value?.theme))

function changeLanguage(lang) {
  router.replace({ query: { ...route.query, lang } })
}
context.changeLanguage = changeLanguage

/** Is this section drawn from the package AST? Order, activation and plan already decided `sections`. */
const fromPackage = section => pkg.usable.value && section.render === 'package' && !!pkg.templates.value[section.type]

// Development only: ?pkg=classic|botanical[&wedding=1] renders the cover from a fixture package.
const devFixtures = import.meta.env.DEV ? import.meta.glob('../package/fixtures/[a-z]*.js') : {}
if (import.meta.env.DEV) {
  watch(invitation, async inv => {
    const name = route.query.pkg
    if (!inv || inv.__dev || typeof name !== 'string' || !/^[a-z]+$/.test(name)) return
    const load = devFixtures[`../package/fixtures/${name}.js`]
    if (load) invitation.value = { ...(await load()).default(inv, { wedding: route.query.wedding === '1' }), __dev: true }
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
    class="inv-root relative min-h-svh bg-inv-surface font-inv-body text-inv-ink antialiased"
    :style="vars"
    :data-inv-theme="pkg.slug.value"
    :data-inv-pkg="pkg.usable.value ? pkg.state.value : undefined"
  >
    <template v-if="status === 'ready' && invitation">
      <nav class="absolute top-3 right-3 z-10" :aria-label="tt('language')">
        <InvitationLangSwitch :current="locale" :label="tt('language')" @change="changeLanguage" />
      </nav>
      <main>
        <template v-for="(section, index) in sections" :key="section.type">
          <PackageSection
            v-if="fromPackage(section)"
            :ast="pkg.templates.value[section.type]"
            :section="section"
            :position="index + 1"
            :count="sections.length"
            :base="pkg.base.value"
            :strings="pkg.strings.value"
          />
          <!-- With a package active every section gets the same position hooks, so decoration follows the real order. -->
          <div
            v-else-if="pkg.usable.value"
            :data-inv-section="section.type"
            :data-inv-position="index + 1"
            :data-inv-parity="(index + 1) % 2 === 0 ? 'even' : 'odd'"
          >
            <component :is="COMPONENTS[section.type]" :section="section" />
          </div>
          <component :is="COMPONENTS[section.type]" v-else :section="section" />
        </template>
      </main>
    </template>
    <InvitationState v-else :status="status" @retry="load(requestedLang)" />
  </div>
</template>
