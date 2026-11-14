<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { TriangleAlert } from 'lucide-vue-next'
import { UiModal, UiButton, UiField, UiInput, UiSkeleton } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import AccountDeletionService from '../services/AccountDeletionService'
import { deletionError } from '../utils'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['update:open'])

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const step = ref(1)
const preview = ref(null)
const loadingPreview = ref(false)
const previewFailed = ref(false)
const email = ref('')
const password = ref('')
const fieldErrors = ref({ email: '', current_password: '' })
const alertMessage = ref('')
const blocked = ref(false)
const submitting = ref(false)
const stepRoot = ref(null)
const alertEl = ref(null)

const hasPassword = computed(() => preview.value?.hasPassword !== false)
const counts = computed(() => preview.value?.events ?? { published: 0, unpublished: 0, collaborating: 0 })
const hasAnyEvent = computed(() => counts.value.published + counts.value.unpublished + counts.value.collaborating > 0)
const emailMatches = computed(() => email.value.trim().toLowerCase() === String(preview.value?.email ?? '').toLowerCase())
const canContinue = computed(() => emailMatches.value && (!hasPassword.value || password.value.length > 0))
const title = computed(() => t(`accountDeletion.steps.${step.value}.title`))

async function loadPreview() {
  loadingPreview.value = true
  previewFailed.value = false
  try {
    const response = await AccountDeletionService.preview()
    preview.value = response.data.data
  } catch {
    previewFailed.value = true
  } finally {
    loadingPreview.value = false
  }
}

function reset() {
  step.value = 1
  preview.value = null
  email.value = ''
  password.value = ''
  fieldErrors.value = { email: '', current_password: '' }
  alertMessage.value = ''
  blocked.value = false
  submitting.value = false
}

watch(
  () => props.open,
  open => {
    if (!open) return
    reset()
    loadPreview()
  },
  { immediate: true }
)

/** Keyboard and screen readers land on the new step, not on a button that disappeared. */
async function goTo(next) {
  step.value = next
  alertMessage.value = ''
  await nextTick()
  stepRoot.value?.focus()
}

function close() {
  if (submitting.value) return
  emit('update:open', false)
}

function onOpenChange(value) {
  if (!value) close()
}

function toConfirm() {
  fieldErrors.value = { email: '', current_password: '' }
  if (!canContinue.value) {
    if (!emailMatches.value) fieldErrors.value.email = t('accountDeletion.errors.emailMismatch')
    else fieldErrors.value.current_password = t('accountDeletion.errors.passwordRequired')
    return
  }
  goTo(3)
}

async function confirm() {
  submitting.value = true
  alertMessage.value = ''
  try {
    await AccountDeletionService.destroy({
      email: email.value.trim(),
      currentPassword: hasPassword.value ? password.value : ''
    })
  } catch (e) {
    const failure = deletionError(e)
    submitting.value = false
    if (failure.field) {
      fieldErrors.value = { email: '', current_password: '', [failure.field]: t(failure.messageKey) }
      await goTo(2)
      return
    }
    blocked.value = Boolean(failure.blocking)
    alertMessage.value = t(failure.messageKey, failure.params ?? {})
    await nextTick()
    alertEl.value?.scrollIntoView?.({ block: 'nearest' })
    return
  }
  // The server already closed the session: clear the local state without calling logout again.
  await userStore.logOut()
  emit('update:open', false)
  await router.push({ name: 'account-deleted' })
}
</script>

<template>
  <UiModal :open="open" :title="title" size="md" :close-label="t('common.close')" @update:open="onOpenChange">
    <div ref="stepRoot" tabindex="-1" class="flex flex-col gap-4 focus:outline-none" data-testid="deletion-step">
      <p class="text-sm font-semibold text-ink-500" aria-live="polite">
        {{ t('accountDeletion.stepOf', { step, total: 3 }) }}
      </p>

      <!-- Step 1: what will happen -->
      <template v-if="step === 1">
        <div v-if="loadingPreview" class="flex flex-col gap-3" aria-busy="true">
          <UiSkeleton class="h-5 w-3/4" />
          <UiSkeleton class="h-20 w-full" />
          <UiSkeleton class="h-5 w-2/3" />
        </div>

        <div v-else-if="previewFailed" role="alert" class="rounded-lg border border-danger-500/40 bg-danger-50 p-4 text-base text-danger-700">
          <p>{{ t('accountDeletion.errors.preview') }}</p>
          <UiButton variant="secondary" size="sm" class="mt-3" @click="loadPreview">{{ t('accountDeletion.retry') }}</UiButton>
        </div>

        <template v-else-if="preview">
          <p class="text-base text-ink-700 text-balance">{{ t('accountDeletion.intro') }}</p>
          <ul class="flex flex-col gap-3 text-base text-ink-700">
            <li v-if="counts.published > 0">
              {{ t('accountDeletion.published', { n: counts.published, days: preview.archiveDays }, counts.published) }}
            </li>
            <li v-if="counts.unpublished > 0">
              {{ t('accountDeletion.unpublished', { n: counts.unpublished }, counts.unpublished) }}
            </li>
            <li v-if="counts.collaborating > 0">
              {{ t('accountDeletion.collaborating', { n: counts.collaborating }, counts.collaborating) }}
            </li>
            <li v-if="!hasAnyEvent">{{ t('accountDeletion.noEvents') }}</li>
            <li>{{ t('accountDeletion.personal') }}</li>
            <li>{{ t('accountDeletion.invoices') }}</li>
          </ul>
          <p v-if="preview.pendingPurchases > 0" class="rounded-lg bg-gold-100 p-3 text-sm text-ink-700" role="status">
            {{ t('accountDeletion.pendingNote') }}
          </p>
          <div class="flex gap-3 rounded-lg border border-danger-500/40 bg-danger-50 p-3 text-danger-700">
            <TriangleAlert class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p class="text-base font-semibold">{{ t('accountDeletion.irreversible') }}</p>
          </div>
        </template>
      </template>

      <!-- Step 2: prove it is her -->
      <form v-else-if="step === 2" class="flex flex-col gap-4" novalidate @submit.prevent="toConfirm">
        <p class="text-base text-ink-700">{{ t('accountDeletion.typeEmailIntro') }}</p>
        <p class="break-all rounded-lg bg-cream-100 px-3 py-2 font-semibold text-ink-900" data-testid="account-email">
          {{ preview?.email }}
        </p>
        <UiField :label="t('accountDeletion.emailLabel')" :hint="t('accountDeletion.emailHint')" :error="fieldErrors.email" id="deletion_email">
          <UiInput v-model="email" type="email" autocomplete="off" autocapitalize="off" spellcheck="false" />
        </UiField>
        <UiField
          v-if="hasPassword"
          :label="t('accountDeletion.passwordLabel')"
          :error="fieldErrors.current_password"
          id="deletion_password"
        >
          <UiInput v-model="password" type="password" autocomplete="current-password" />
        </UiField>
        <button type="submit" class="hidden" tabindex="-1" aria-hidden="true" />
      </form>

      <!-- Step 3: last chance -->
      <template v-else>
        <p class="text-base text-ink-700 text-balance">{{ t('accountDeletion.finalText') }}</p>
        <p class="break-all rounded-lg bg-cream-100 px-3 py-2 font-semibold text-ink-900">{{ preview?.email }}</p>
        <div class="flex gap-3 rounded-lg border border-danger-500/40 bg-danger-50 p-3 text-danger-700">
          <TriangleAlert class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p class="text-base font-semibold">{{ t('accountDeletion.irreversible') }}</p>
        </div>
        <p v-if="alertMessage" ref="alertEl" role="alert" class="rounded-lg border border-danger-500/40 bg-white p-3 text-base text-danger-700">
          {{ alertMessage }}
        </p>
      </template>
    </div>

    <template #footer>
      <template v-if="step === 1">
        <UiButton variant="secondary" @click="close">{{ t('accountDeletion.keep') }}</UiButton>
        <UiButton variant="danger" :disabled="loadingPreview || previewFailed || !preview" @click="goTo(2)">
          {{ t('common.continue') }}
        </UiButton>
      </template>
      <template v-else-if="step === 2">
        <UiButton variant="secondary" @click="goTo(1)">{{ t('common.back') }}</UiButton>
        <UiButton variant="danger" :disabled="!canContinue" @click="toConfirm">{{ t('common.continue') }}</UiButton>
      </template>
      <template v-else>
        <UiButton variant="secondary" :disabled="submitting" @click="goTo(2)">{{ t('common.back') }}</UiButton>
        <UiButton variant="danger" :loading="submitting" :disabled="blocked" @click="confirm">
          {{ t('accountDeletion.confirmButton') }}
        </UiButton>
      </template>
    </template>
  </UiModal>
</template>
