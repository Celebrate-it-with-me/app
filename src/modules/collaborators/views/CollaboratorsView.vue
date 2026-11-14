<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Info, UserPlus, UsersRound } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiSkeleton, UiEmptyState, UiModal, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import CollaboratorsService from '@/services/CollaboratorsService'
import CollaboratorRow from '../components/CollaboratorRow.vue'
import InviteCollaboratorModal from '../components/InviteCollaboratorModal.vue'
import { canManage, isFreePlan, normalizeCollaborator, sortCollaborators } from '../utils/collaborators'

const { t } = useI18n()
const { success, error: showError } = useToast()
const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()

const event = computed(() => eventsStore.activeEvent)
const manage = computed(() => canManage(event.value, eventsStore.hasPermission))
const free = computed(() => isFreePlan(event.value))

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
  if (route.query.invite && manage.value) inviteOpen.value = true
})
watch(() => event.value?.id, load)

function openInvite() {
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
    showError(e.response?.data?.message && e.response.status < 500 ? e.response.data.message : t(failKey))
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
  <div v-if="event">
    <UiPageHeader :title="t('app.collaborators.title')" :subtitle="t('app.collaborators.subtitle')">
      <template v-if="manage" #actions>
        <UiButton @click="openInvite"><UserPlus class="h-5 w-5" aria-hidden="true" />{{ t('app.collaborators.add') }}</UiButton>
      </template>
    </UiPageHeader>

    <!-- Informational only: the plan's limit is enforced by the API when someone is invited. -->
    <p
      v-if="free"
      class="mb-4 flex items-start gap-3 rounded-lg border border-info-500/30 bg-info-50 p-4 text-sm text-info-700"
      role="note"
      data-testid="free-plan-note"
    >
      <Info class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{{ t('app.collaborators.freeNotice') }}</span>
    </p>

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
        <UiButton v-if="manage" @click="openInvite">{{ t('app.collaborators.add') }}</UiButton>
      </UiEmptyState>

      <ul v-else class="divide-y divide-line" :aria-label="t('app.collaborators.title')">
        <CollaboratorRow v-for="row in rows" :key="row.key" :row="row" :manage="manage" :busy="busyKey === row.key" @action="onAction" />
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
  </div>
</template>
