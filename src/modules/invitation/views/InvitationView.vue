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
import InvitationCover from '../components/InvitationCover.vue'
import InvitationLocations from '../components/InvitationLocations.vue'
import InvitationItinerary from '../components/InvitationItinerary.vue'
import InvitationDressCode from '../components/InvitationDressCode.vue'
import InvitationRsvp from '../components/InvitationRsvp.vue'
import InvitationClosing from '../components/InvitationClosing.vue'
import InvitationLangSwitch from '../components/InvitationLangSwitch.vue'
import InvitationState from '../components/InvitationState.vue'

const COMPONENTS = {
  cover: InvitationCover,
  itinerary: InvitationItinerary,
  locations: InvitationLocations,
  dress_code: InvitationDressCode,
  rsvp: InvitationRsvp,
  closing: InvitationClosing
}

const route = useRoute()
const router = useRouter()

const context = useInvitationData(
  () => route.params.slug,
  () => route.params.code
)
const { status, invitation, locale, tt, load } = context
provideInvitation(context)

const requestedLang = computed(() => (LOCALES.includes(route.query.lang) ? route.query.lang : undefined))
watch(requestedLang, lang => load(lang), { immediate: true })

const sections = computed(() => (invitation.value?.sections ?? []).filter(item => COMPONENTS[item.type]))
const vars = computed(() => themeVars(invitation.value?.theme))

function changeLanguage(lang) {
  router.replace({ query: { ...route.query, lang } })
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
    // The Clásica theme writes names and short phrases in a script face loaded on demand.
    loadThemeFonts({ script: 'Pinyon Script', ...invitation.value.theme?.fonts })
  },
  { immediate: true }
)
</script>

<template>
  <div class="inv-root min-h-svh bg-inv-surface font-inv-body text-inv-ink antialiased" :style="vars">
    <template v-if="status === 'ready' && invitation">
      <nav class="fixed top-3 right-3 z-10" :aria-label="tt('language')">
        <InvitationLangSwitch :current="locale" :label="tt('language')" @change="changeLanguage" />
      </nav>
      <main>
        <component :is="COMPONENTS[section.type]" v-for="section in sections" :key="section.type" :section="section" />
      </main>
    </template>
    <InvitationState v-else :status="status" @retry="load(requestedLang)" />
  </div>
</template>
