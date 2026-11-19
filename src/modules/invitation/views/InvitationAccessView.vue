<script setup>
/**
 * /i/:slug (a link without the guest code): asks for the code and sends the guest to /i/:slug/:code.
 * It shows only the first name of the organizer, never an email, and looks the same for a slug that does not exist.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { KeyRound } from 'lucide-vue-next'
import { UiButton, UiField, UiInput, UiSkeleton } from '@/ui'
import InvitationService from '@/services/PublicEvents/InvitationService'
import { useInvitationAccess } from '../composables/useInvitationAccess'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Development only: ?mock=named|anonymous|slow|offline|limited stands in for the API (never in a build).
let api = InvitationService
const slug = () => String(route.params.slug)
const first = value => (Array.isArray(value) ? value[0] : value)

const access = useInvitationAccess(slug, {
  initialCode: String(first(route.query.code) ?? ''),
  initialError: String(first(route.query.error) ?? ''),
  // Read at call time, so the development mock (loaded on mount) is the one used.
  api: { getAccess: (...args) => api.getAccess(...args), verifyAccess: (...args) => api.verifyAccess(...args) },
  onValid: code => router.replace({ name: 'invitation', params: { slug: slug(), code } })
})
const { status, organizer, code, error, submitting } = access

const inputBox = ref(null)

const message = computed(() => {
  const name = organizer.value
  switch (error.value) {
    case 'empty':
      return t('invitationAccess.errorEmpty')
    case 'invalid':
      return name ? t('invitationAccess.errorInvalid', { name }) : t('invitationAccess.errorInvalidGeneric')
    case 'limited':
      return t('invitationAccess.errorLimited')
    case 'failed':
      return t('invitationAccess.errorFailed')
    default:
      return ''
  }
})

// Private page: keep it out of search engines.
let robots
onMounted(async () => {
  robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex, nofollow'
  document.head.appendChild(robots)

  if (import.meta.env.DEV && route.query.mock) {
    const { mockAccess } = await import('../dev/mockAccess')
    api = mockAccess(String(route.query.mock))
  }
  access.load()
  inputBox.value?.querySelector('input')?.focus()
})
onUnmounted(() => robots?.remove())
</script>

<template>
  <main class="relative flex min-h-svh flex-col items-center justify-center bg-cream-100 px-4 py-10 text-ink-900">
    <div class="w-full max-w-md">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <KeyRound class="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 class="mt-5 text-center font-heading text-3xl text-balance text-wine-900 sm:text-4xl">
        {{ t('invitationAccess.title') }}
      </h1>
      <p class="mx-auto mt-3 max-w-sm text-center text-base text-ink-700 text-pretty">
        {{ t('invitationAccess.text') }}
      </p>

      <form
        class="mt-8 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6"
        novalidate
        @submit.prevent="access.submit"
      >
        <UiField :label="t('invitationAccess.label')" :error="message" required>
          <div ref="inputBox">
            <UiInput
              :model-value="code"
              size="lg"
              autocomplete="off"
              autocapitalize="characters"
              autocorrect="off"
              spellcheck="false"
              inputmode="text"
              enterkeyhint="go"
              maxlength="32"
              class="text-center font-semibold tracking-widest uppercase"
              :placeholder="t('invitationAccess.placeholder')"
              @update:model-value="access.setCode"
            />
          </div>
        </UiField>
        <UiButton type="submit" size="lg" block class="mt-4" :loading="submitting">
          {{ t('invitationAccess.submit') }}
        </UiButton>
      </form>

      <div class="mt-5 min-h-12 text-center text-sm text-ink-700" aria-live="polite">
        <div v-if="status === 'loading'" role="status" class="mx-auto flex max-w-xs flex-col items-center gap-2">
          <UiSkeleton width="16rem" height="1rem" class="max-w-full" />
          <span class="sr-only">{{ t('invitationAccess.loadingContact') }}</span>
        </div>
        <template v-else-if="status === 'error'">
          <p>{{ t('invitationAccess.contactFailed') }}</p>
          <UiButton variant="link" size="sm" class="mt-1" @click="access.load">
            {{ t('invitationAccess.retry') }}
          </UiButton>
        </template>
        <p v-else-if="organizer" class="text-pretty">
          <i18n-t keypath="invitationAccess.contact" scope="global">
            <template #name>
              <strong class="font-semibold text-ink-900">{{ organizer }}</strong>
            </template>
          </i18n-t>
        </p>
        <p v-else class="text-pretty">{{ t('invitationAccess.contactGeneric') }}</p>
      </div>

      <p class="mt-6 text-center">
        <router-link
          to="/sign-in"
          class="rounded text-sm font-semibold text-rose-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
        >
          {{ t('invitationAccess.signIn') }}
        </router-link>
      </p>
    </div>
  </main>
</template>
