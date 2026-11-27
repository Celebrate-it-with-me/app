<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Lock, UserPlus, UsersRound } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiSkeleton, UiEmptyState, UiModal, useToast, UiPage } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import CollaboratorsService from '@/services/CollaboratorsService'
import { isModuleLocked } from '@/utils/moduleLocked'
import { unlockPath } from '@/components/internal/shell/navModules'
import CollaboratorRow from '../components/CollaboratorRow.vue'
import InviteCollaboratorModal from '../components/InviteCollaboratorModal.vue'
import { canManage, isCollaboratorsLocked, normalizeCollaborator, sortCollaborators } from '../utils/collaborators'

const { t } = useI18n()
const { success, error: showError } = useToast()
const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()

const event = computed(() => eventsStore.activeEvent)
const manage = computed(() => canManage(event.value, eventsStore.hasPermission))
// Locked by the event's modules, or by a 403 `module_locked` that arrived before the event was refreshed.
const lockedByApi = ref(false)
const locked = computed(() => lockedByApi.value || isCollaboratorsLocked(event.value))

const rows = ref([])
const loading = ref(true)
const loadFailed = ref(false)
const saving = ref(false)
const busyKey = ref('')

const inviteOpen = ref(false)
const confirming = ref(null)

async function load() {
  if (!event.value?.id) return
  loading.value = true
  loadFailed.value = false
  try {
    const { data } = await CollaboratorsService.loadCollaborators({ eventId: event.value.id })
    rows.value = sortCollaborators((data?.data ?? []).map(normalizeCollaborator))
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  load()
  // `/dashboard/collaborators/invite` (the API's suggestion) opens the invitation form.
  if (route.query.invite && manage.value && !locked.value) inviteOpen.value = true
})
watch(() => event.value?.id, load)

function openInvite() {
  if (locked.value) return
  inviteOpen.value = true
}
watch(inviteOpen, open => {
  if (!open && route.query.invite) router.replace({ name: 'collaborators' })
})

/** Run a request, then reload the list. `failKey` is the message for a refusal. */
async function run(request, okKey, failKey) {
  saving.value = true
  try {
    await request()
    await load()
    success(t(okKey))
    return true
  } catch (e) {
    // The axios interceptor already showed the upgrade notice: no second toast, just lock the screen.
    if (isModuleLocked(e)) {
      lockedByApi.value = true
      inviteOpen.value = false
      return false
    }
    if (e.response?.status === 429) showError(t('app.collaborators.tooManyRequests'))
    else showError(e.response?.data?.message && e.response.status < 500 ? e.response.data.message : t(failKey))
    return false
  } finally {
    saving.value = false
    busyKey.value = ''
  }
}

async function invite(form) {
  const ok = await run(
    () => CollaboratorsService.inviteCollaborator({ eventId: event.value.id, ...form }),
    'app.collaborators.invited',
    'app.collaborators.inviteError'
  )
  if (ok) inviteOpen.value = false
}

async function onAction(action, row) {
  const eventId = event.value.id
  if (action === 'remove' || action === 'cancel') {
    confirming.value = { action, row }
    return
  }
  busyKey.value = row.key
  if (action === 'resend') await run(() => CollaboratorsService.resendInvite({ eventId, id: row.id }), 'app.collaborators.resent', 'app.collaborators.actionError')
  else {
    const role = action === 'makeEditor' ? 'editor' : 'viewer'
    await run(() => CollaboratorsService.changeRole({ eventId, userId: row.userId, role }), 'app.collaborators.roleChanged', 'app.collaborators.actionError')
  }
}

async function confirm() {
  const { action, row } = confirming.value
  const eventId = event.value.id
  busyKey.value = row.key
  const ok = await run(
    () => (action === 'cancel' ? CollaboratorsService.cancelInvite({ eventId, id: row.id }) : CollaboratorsService.removeCollaborator({ eventId, userId: row.userId })),
    action === 'cancel' ? 'app.collaborators.cancelled' : 'app.collaborators.removed',
    'app.collaborators.actionError'
  )
  if (ok) confirming.value = null
}

const confirmOpen = computed({
  get: () => confirming.value !== null,
  set: value => {
    if (!value) confirming.value = null
  }
})
</script>

<template>
  <UiPage v-if="event">
    <UiPageHeader :title="t('app.collaborators.title')" :subtitle="t('app.collaborators.subtitle')">
      <template v-if="manage" #actions>
        <UiButton :disabled="locked" @click="openInvite"><UserPlus class="h-5 w-5" aria-hidden="true" />{{ t('app.collaborators.add') }}</UiButton>
      </template>
    </UiPageHeader>

    <!-- The API enforces it too (403 module_locked); this is the warm version of that refusal. -->
    <div
      v-if="locked"
      class="mb-4 flex flex-col gap-4 rounded-lg border border-gold-300 bg-gold-50 p-4 sm:flex-row sm:items-center"
      role="note"
      data-testid="locked-note"
    >
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700" aria-hidden="true">
        <Lock class="h-5 w-5" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-base font-semibold text-ink-900">{{ t('app.collaborators.locked.title') }}</p>
        <p class="mt-0.5 text-sm text-ink-600">{{ t('app.collaborators.locked.text') }}</p>
      </div>
      <UiButton :to="unlockPath('collaborators')" data-testid="locked-cta">{{ t('app.collaborators.locked.cta') }}</UiButton>
    </div>

    <UiCard padding="none" :aria-busy="loading">
      <div v-if="loading" class="flex flex-col gap-3 p-4" role="status" :aria-label="t('app.collaborators.loading')">
        <div v-for="n in 3" :key="n" class="flex items-center gap-3">
          <UiSkeleton circle class="h-10 w-10" />
          <div class="flex-1"><UiSkeleton class="h-4 w-1/2" /><UiSkeleton class="mt-2 h-3 w-1/3" /></div>
        </div>
      </div>

      <UiEmptyState v-else-if="loadFailed" compact :title="t('app.collaborators.loadErrorTitle')" :description="t('app.collaborators.loadError')">
        <UiButton variant="secondary" @click="load">{{ t('app.collaborators.retry') }}</UiButton>
      </UiEmptyState>

      <UiEmptyState v-else-if="!rows.length" compact :title="t('app.collaborators.emptyTitle')" :description="t('app.collaborators.emptyText')">
        <template #icon><UsersRound class="h-6 w-6" /></template>
        <UiButton v-if="manage" :disabled="locked" @click="openInvite">{{ t('app.collaborators.add') }}</UiButton>
      </UiEmptyState>

      <ul v-else class="divide-y divide-line" :aria-label="t('app.collaborators.title')">
        <CollaboratorRow v-for="row in rows" :key="row.key" :row="row" :manage="manage" :locked="locked" :busy="busyKey === row.key" @action="onAction" />
      </ul>
    </UiCard>

    <InviteCollaboratorModal v-model:open="inviteOpen" :saving="saving" @submit="invite" />

    <UiModal
      v-model:open="confirmOpen"
      size="sm"
      :title="confirming ? t(`app.collaborators.confirm.${confirming.action}Title`, { name: confirming.row.name }) : ''"
      :description="confirming ? t(`app.collaborators.confirm.${confirming.action}Text`) : ''"
    >
      <template #footer>
        <UiButton variant="ghost" :disabled="saving" @click="confirming = null">{{ t('app.collaborators.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" data-testid="confirm-action" @click="confirm">
          {{ confirming ? t(`app.collaborators.confirm.${confirming.action}Button`) : '' }}
        </UiButton>
      </template>
    </UiModal>
  </UiPage>
</template>
