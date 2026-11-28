<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as zod from 'zod'
import { Check } from 'lucide-vue-next'
import { toTypedSchema } from '@/utils/zodTypedSchema'
import { normalizePhone } from '@/utils/phone'
import { useUserStore } from '@/stores/useUserStore'
import { SUPPORT_EMAIL, mailtoLink } from '@/config/brand'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { AVATAR_ACCEPT, AVATAR_UPLOAD_MAX_BYTES, AVATAR_PICK_MAX_BYTES, avatarFileProblem } from '@/utils/avatarCrop'
import ProfilePhotoDialog from '@/components/internal/settings/ProfilePhotoDialog.vue'
import { UiCard, UiField, UiInput, UiButton, UiAvatar, useToast } from '@/ui'

const { t } = useI18n()
const { success, error } = useToast()
const userStore = useUserStore()
const saving = ref(false)
const mailto = computed(() => mailtoLink({ subject: t('account.profile.emailSubject') }))
const mb = bytes => Math.round(bytes / 1024 / 1024)

const { handleSubmit, defineField, errors, meta, resetForm, setFieldError } = useForm({
  validationSchema: computed(() => toTypedSchema(
    zod.object({
      name: zod.string({ message: t('validation.nameRequired') }).trim().min(1, t('validation.nameRequired')),
      phone: zod
        .string()
        .optional()
        .refine(value => normalizePhone(value) !== null, { message: t('account.profile.phoneInvalid') })
    })
  )),
  initialValues: { name: '', phone: '' }
})
const [name] = defineField('name')
const [phone] = defineField('phone')
const dirty = computed(() => meta.value.dirty)

const avatar = useUserAvatar()
const hasPhoto = computed(() => Boolean(avatar.src.value))

onMounted(() => resetForm({ values: { name: userStore.name ?? '', phone: userStore.phone ?? '' } }))

const onSubmit = handleSubmit(async values => {
  saving.value = true
  try {
    const response = await userStore.updateProfile({ name: values.name.trim(), phone: normalizePhone(values.phone) })
    if (response.status === 200) {
      await userStore.refreshUser()
      resetForm({ values: { name: userStore.name ?? '', phone: userStore.phone ?? '' } })
      success(t('account.profile.savedToast'))
    } else {
      error(t('account.saveError'))
    }
  } catch (e) {
    const fieldErrors = e.response?.data?.errors ?? {}
    if (fieldErrors.phone) setFieldError('phone', t('account.profile.phoneInvalid'))
    else if (fieldErrors.name) setFieldError('name', t('validation.nameRequired'))
    else error(t('account.saveError'))
  } finally {
    saving.value = false
  }
})

// ---- photo: pick, crop (centred square, shown as a circle) and upload; or remove -------------------------------------
const fileInput = ref(null)
const photoOpen = ref(false)
const photoSrc = ref('')
const photoBusy = ref(false)
const removing = ref(false)

const revoke = () => {
  if (photoSrc.value) URL.revokeObjectURL(photoSrc.value)
  photoSrc.value = ''
}
onBeforeUnmount(revoke)

const closePhoto = () => {
  photoOpen.value = false
  revoke()
}

const onPick = event => {
  const file = event.target.files?.[0]
  event.target.value = '' // the same file can be chosen again
  if (!file) return
  const problem = avatarFileProblem(file)
  if (problem === 'type') return error(t('account.profile.photo.invalidType'))
  if (problem === 'size') return error(t('account.profile.photo.tooBig', { max: mb(AVATAR_PICK_MAX_BYTES) }))
  revoke()
  photoSrc.value = URL.createObjectURL(file)
  photoOpen.value = true
}

// Saves the photo on its own: it keeps the name and phone already stored, never what is half typed in the form.
const sendPhoto = async payload => {
  const response = await userStore.updateProfile({ name: userStore.name ?? '', phone: userStore.phone ?? '', ...payload })
  if (response.status !== 200) throw new Error('profile-update-failed')
  await userStore.refreshUser()
}

const onCrop = async file => {
  if (file.size > AVATAR_UPLOAD_MAX_BYTES) return error(t('account.profile.photo.tooBig', { max: mb(AVATAR_UPLOAD_MAX_BYTES) }))
  photoBusy.value = true
  try {
    await sendPhoto({ avatar: file })
    closePhoto()
    success(t('account.profile.photo.saved'))
  } catch {
    error(t('account.profile.photo.error'))
  } finally {
    photoBusy.value = false
  }
}

const onUnreadable = () => {
  closePhoto()
  error(t('account.profile.photo.unreadable'))
}

const removePhoto = async () => {
  removing.value = true
  try {
    await sendPhoto({ removeAvatar: true })
    success(t('account.profile.photo.removed'))
  } catch {
    error(t('account.profile.photo.error'))
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <UiCard :title="t('account.profile.title')" :subtitle="t('account.profile.text')" heading-level="h2">
    <form id="account-profile-form" class="flex flex-col gap-5" novalidate @submit="onSubmit">
      <div class="flex items-start gap-4">
        <UiAvatar :name="avatar.name.value" :src="avatar.src.value" :alt="avatar.alt.value" size="xl" class="shrink-0" />
        <div class="min-w-0">
          <p class="font-heading text-xl break-words text-ink-900" data-testid="profile-name">{{ userStore.name }}</p>
          <p class="text-sm text-ink-500 [overflow-wrap:anywhere]">{{ userStore.email }}</p>
          <div class="mt-1 flex flex-wrap gap-x-4">
            <button
              type="button"
              class="inline-flex min-h-11 items-center rounded text-[13px] font-semibold text-rose-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
              data-testid="photo-change"
              @click="fileInput.click()"
            >
              {{ t('account.profile.changePhoto') }}
            </button>
            <button
              v-if="hasPhoto"
              type="button"
              class="inline-flex min-h-11 items-center rounded text-[13px] font-semibold text-rose-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 disabled:opacity-50"
              :disabled="removing"
              data-testid="photo-remove"
              @click="removePhoto"
            >
              {{ t('account.profile.removePhoto') }}
            </button>
          </div>
          <input ref="fileInput" type="file" class="hidden" :accept="AVATAR_ACCEPT" data-testid="photo-input" @change="onPick" />
        </div>
      </div>

      <UiField :label="t('account.profile.name')" :error="errors.name" id="account_name" required>
        <UiInput v-model="name" autocomplete="name" />
      </UiField>

      <UiField :label="t('account.profile.email')" id="account_email">
        <UiInput :model-value="userStore.email" type="email" disabled />
        <template #hint>
          <i18n-t keypath="account.profile.emailHint" scope="global">
            <template #email>
              <a :href="mailto" class="font-medium text-rose-700 underline underline-offset-2" data-testid="email-change-link">{{ SUPPORT_EMAIL }}</a>
            </template>
          </i18n-t>
        </template>
      </UiField>

      <UiField :label="t('account.profile.phone')" :hint="t('account.profile.phoneHint')" :error="errors.phone" id="account_phone">
        <UiInput v-model="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+1 305 555 0123" />
      </UiField>

      <div class="flex items-center justify-end gap-3" :class="dirty ? 'max-md:hidden' : ''" data-testid="profile-save-row">
        <p v-if="!dirty" class="flex items-center gap-1.5 text-[13px] text-ink-500" data-testid="profile-all-saved">
          <Check class="h-4 w-4 text-success-500" aria-hidden="true" />
          {{ t('account.profile.allSaved') }}
        </p>
        <p v-else class="text-[13px] text-ink-900" data-testid="profile-unsaved" role="status">{{ t('account.profile.unsaved') }}</p>
        <UiButton type="submit" :loading="saving" :disabled="!dirty">{{ t('account.save') }}</UiButton>
      </div>
    </form>
  </UiCard>

  <!-- Phones with unsaved changes: the save button stays in reach above the bottom navigation (there is no assistant button on this page). -->
  <div
    v-if="dirty"
    class="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-20 flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-card md:hidden"
    data-testid="profile-save-bar"
  >
    <span class="min-w-0 text-sm leading-tight text-ink-900">{{ t('account.profile.unsaved') }}</span>
    <UiButton size="sm" type="submit" form="account-profile-form" :loading="saving">{{ t('account.profile.saveShort') }}</UiButton>
  </div>

  <ProfilePhotoDialog :open="photoOpen" :src="photoSrc" :busy="photoBusy" @update:open="value => !value && closePhoto()" @confirm="onCrop" @unreadable="onUnreadable" />
</template>
