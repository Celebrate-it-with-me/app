<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileSpreadsheet, TriangleAlert, Upload } from 'lucide-vue-next'
import { UiModal, UiButton, UiBadge, UiInput, UiCheckbox, UiSkeleton, useToast } from '@/ui'
import GuestLimitNotice from '@/components/internal/limits/GuestLimitNotice.vue'
import { planLimitFrom } from '@/utils/planLimit'
import RosterService from '../services/RosterService'
import {
  ACCEPT, editableRows, errorKey, fileProblem, filterRows, hasFamilies, importPayload, previewErrorCode, summarize, withEdit
} from '../utils/guestImport'

const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], default: null }
})
const emit = defineEmits(['update:open', 'imported'])
const { t } = useI18n()
const { success, error: showError } = useToast()

const stage = ref('pick') // pick | reading | preview
const fileError = ref('')
const dragging = ref(false)
const rows = ref([])
const filter = ref('all')
const saving = ref(false)
const limitInfo = ref(null)
const fileInput = ref(null)
const fileName = ref('')

watch(
  () => props.open,
  open => {
    if (open) reset()
  }
)

function reset() {
  stage.value = 'pick'
  fileError.value = ''
  rows.value = []
  filter.value = 'all'
  limitInfo.value = null
  fileName.value = ''
  dragging.value = false
}

async function downloadTemplate() {
  try {
    const blob = await RosterService.importTemplate(props.eventId)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quinvite-invitados.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    showError(t('app.guestImport.templateError'))
  }
}

async function pick(file) {
  fileError.value = ''
  const problem = fileProblem(file)
  if (problem) {
    fileError.value = t(errorKey(problem))
    return
  }
  fileName.value = file.name
  stage.value = 'reading'
  try {
    const result = await RosterService.importPreview(props.eventId, file)
    if (!result.rows?.length) {
      fileError.value = t(errorKey('empty_file'))
      stage.value = 'pick'
      return
    }
    rows.value = editableRows(result.rows)
    filter.value = 'all'
    stage.value = 'preview'
  } catch (e) {
    fileError.value = t(errorKey(previewErrorCode(e)))
    stage.value = 'pick'
  }
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file) pick(file)
}
function onDrop(event) {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) pick(file)
}

const counts = computed(() => summarize(rows.value))
const visible = computed(() => filterRows(rows.value, filter.value))
const showFamilies = computed(() => hasFamilies(rows.value))
const chips = computed(() => [
  { key: 'all', n: counts.value.all },
  { key: 'ready', n: counts.value.ready },
  { key: 'problems', n: counts.value.problems },
  { key: 'duplicates', n: counts.value.duplicates }
].filter(chip => chip.key === 'all' || chip.n > 0 || chip.key === 'ready'))

function edit(row, patch) {
  const index = rows.value.findIndex(r => r.line === row.line)
  if (index >= 0) rows.value[index] = withEdit(rows.value[index], patch)
}
function toggle(row, include) {
  const index = rows.value.findIndex(r => r.line === row.line)
  // A row with problems cannot be included until it is fixed.
  if (index >= 0 && !(include && rows.value[index].problems.length)) rows.value[index] = { ...rows.value[index], include }
}
function setFilter(key) {
  filter.value = filter.value === key && key !== 'all' ? 'all' : key
}

async function confirm() {
  if (!counts.value.selected || saving.value) return
  saving.value = true
  limitInfo.value = null
  try {
    const result = await RosterService.importGuests(props.eventId, importPayload(rows.value).rows)
    const parts = [t('app.guestImport.done', { n: result.created }, result.created)]
    if (result.families) parts.push(t('app.guestImport.doneFamilies', { n: result.families }, result.families))
    if (result.skipped) parts.push(t('app.guestImport.doneSkipped', { n: result.skipped }, result.skipped))
    success(parts.join(' · '))
    emit('imported', result)
    emit('update:open', false)
  } catch (e) {
    const limit = planLimitFrom(e)
    if (limit) limitInfo.value = limit
    else showError(t('app.guestImport.importError'))
  } finally {
    saving.value = false
  }
}

const problemText = row => row.problems.map(p => t(`app.guestImport.problems.${p}`)).join(' · ')
const confirmLabel = computed(() => t('app.guestImport.confirm', { n: counts.value.selected }, counts.value.selected))
</script>

<template>
  <UiModal :open="open" :title="t('app.guestImport.title')" :size="stage === 'preview' ? 'full' : 'lg'" @update:open="emit('update:open', $event)">
    <!-- 1. Choose a file -->
    <div v-if="stage !== 'preview'" class="space-y-4">
      <p class="text-base text-ink-700">{{ t('app.guestImport.pickText') }}</p>

      <div v-if="stage === 'reading'" class="space-y-3" role="status" :aria-label="t('app.guestImport.reading')">
        <p class="text-sm font-medium text-ink-700">{{ t('app.guestImport.reading') }}</p>
        <UiSkeleton class="h-14" />
        <UiSkeleton class="h-14" />
      </div>

      <template v-else>
        <div
          class="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors"
          :class="dragging ? 'border-rose-400 bg-rose-50' : 'border-line-strong bg-cream-50'"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="onDrop"
        >
          <Upload class="h-8 w-8 text-rose-600" aria-hidden="true" />
          <p class="font-heading text-lg text-ink-900">{{ t('app.guestImport.dropTitle') }}</p>
          <p class="text-sm text-ink-500">{{ t('app.guestImport.dropOr') }}</p>
          <UiButton @click="fileInput.click()">
            <FileSpreadsheet class="h-4 w-4" aria-hidden="true" />
            {{ t('app.guestImport.choose') }}
          </UiButton>
          <input ref="fileInput" type="file" class="sr-only" tabindex="-1" :accept="ACCEPT" data-testid="import-file" @change="onFileChange" />
          <p class="text-sm text-ink-500">{{ t('app.guestImport.formats') }}</p>
        </div>

        <p v-if="fileError" class="flex items-start gap-2 rounded-xl bg-danger-50 p-3 text-sm text-danger-700" role="alert">
          <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {{ fileError }}
        </p>

        <div class="flex flex-col gap-1 text-sm text-ink-500">
          <p>{{ t('app.guestImport.columns') }}</p>
          <UiButton variant="link" size="sm" class="self-start" @click="downloadTemplate">{{ t('app.guestImport.template') }}</UiButton>
        </div>
      </template>
    </div>

    <!-- 2. Preview -->
    <div v-else class="space-y-4">
      <p class="flex items-center gap-2 text-sm text-ink-700">
        <FileSpreadsheet class="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
        <span class="min-w-0 truncate">{{ fileName }}</span>
      </p>

      <div class="flex flex-wrap gap-2" role="group" :aria-label="t('app.guestImport.filtersLabel')">
        <button
          v-for="chip in chips"
          :key="chip.key"
          type="button"
          class="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-rose-600"
          :class="filter === chip.key ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-line-strong bg-white text-ink-700'"
          :aria-pressed="filter === chip.key"
          @click="setFilter(chip.key)"
        >
          {{ t(`app.guestImport.summary.${chip.key === 'problems' ? 'problems' : chip.key}`) }}
          <span class="font-semibold">{{ chip.n }}</span>
        </button>
        <span v-if="counts.assumedUs" class="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-gold-300 bg-gold-50 px-3.5 text-sm font-medium text-gold-700">
          {{ t('app.guestImport.summary.assumedUs') }}
          <span class="font-semibold">{{ counts.assumedUs }}</span>
        </span>
      </div>

      <p v-if="counts.assumedUs" class="text-sm text-ink-700">{{ t('app.guestImport.assumedHint') }}</p>
      <p v-if="showFamilies" class="text-sm text-ink-700">{{ t('app.guestImport.familiesHint') }}</p>

      <GuestLimitNotice v-if="limitInfo" variant="add" :info="limitInfo" />

      <p v-if="!visible.length" class="rounded-xl border border-line p-4 text-center text-sm text-ink-500">{{ t('app.guestImport.noRows') }}</p>

      <!-- Phones: cards -->
      <ul class="space-y-3 md:hidden">
        <li
          v-for="row in visible"
          :key="`c${row.line}`"
          class="rounded-xl border p-3"
          :class="row.problems.length ? 'border-danger-300 bg-danger-50' : row.duplicate ? 'border-line bg-cream-50' : 'border-line bg-white'"
        >
          <div class="flex items-center justify-between gap-2">
            <UiCheckbox :model-value="row.include" :disabled="!!row.problems.length" :label="t('app.guestImport.row', { n: row.line })" @update:model-value="toggle(row, $event)" />
            <div class="flex flex-wrap justify-end gap-1">
              <UiBadge v-if="row.duplicate" size="sm">{{ t('app.guestImport.badges.duplicate') }}</UiBadge>
              <UiBadge v-if="row.phoneNote === 'assumed_us'" tone="gold" size="sm">{{ t('app.guestImport.badges.assumed') }}</UiBadge>
            </div>
          </div>
          <div class="mt-2 space-y-2">
            <UiInput :model-value="row.name" :aria-label="t('app.guestImport.nameLabel', { n: row.line })" :invalid="row.problems.includes('name_missing')" maxlength="120" @update:model-value="edit(row, { name: $event })" />
            <UiInput :model-value="row.phoneInput" type="tel" inputmode="tel" :aria-label="t('app.guestImport.phoneLabel', { n: row.line })" :invalid="row.problems.includes('phone_invalid')" @update:model-value="edit(row, { phoneInput: $event })" />
          </div>
          <p v-if="row.email || row.family" class="mt-2 text-sm text-ink-500 break-words">
            <span v-if="row.email">{{ row.email }}</span>
            <span v-if="row.email && row.family"> · </span>
            <span v-if="row.family">{{ t('app.guestImport.columnsHead.family') }}: {{ row.family }}</span>
          </p>
          <p v-if="row.problems.length" class="mt-2 text-sm font-medium text-danger-700">{{ problemText(row) }}</p>
        </li>
      </ul>

      <!-- md and up: table -->
      <div v-if="visible.length" class="hidden overflow-x-auto rounded-xl border border-line md:block">
        <table class="w-full text-left text-sm">
          <thead class="bg-cream-100 text-ink-700">
            <tr>
              <th scope="col" class="w-12 px-3 py-2 font-semibold"><span class="sr-only">{{ t('app.guestImport.columnsHead.include') }}</span></th>
              <th scope="col" class="px-3 py-2 font-semibold">{{ t('app.guestImport.columnsHead.name') }}</th>
              <th scope="col" class="px-3 py-2 font-semibold">{{ t('app.guestImport.columnsHead.phone') }}</th>
              <th scope="col" class="px-3 py-2 font-semibold">{{ t('app.guestImport.columnsHead.email') }}</th>
              <th v-if="showFamilies" scope="col" class="px-3 py-2 font-semibold">{{ t('app.guestImport.columnsHead.family') }}</th>
              <th scope="col" class="px-3 py-2 font-semibold">{{ t('app.guestImport.columnsHead.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in visible"
              :key="`t${row.line}`"
              class="border-t border-line align-top"
              :class="row.problems.length ? 'bg-danger-50' : row.duplicate ? 'bg-cream-50' : ''"
            >
              <td class="px-3 py-2">
                <UiCheckbox :model-value="row.include" :disabled="!!row.problems.length" @update:model-value="toggle(row, $event)">
                  <span class="sr-only">{{ t('app.guestImport.include', { name: row.name }) }}</span>
                </UiCheckbox>
              </td>
              <td class="px-3 py-2">
                <UiInput :model-value="row.name" :aria-label="t('app.guestImport.nameLabel', { n: row.line })" :invalid="row.problems.includes('name_missing')" maxlength="120" @update:model-value="edit(row, { name: $event })" />
              </td>
              <td class="px-3 py-2">
                <UiInput :model-value="row.phoneInput" type="tel" inputmode="tel" :aria-label="t('app.guestImport.phoneLabel', { n: row.line })" :invalid="row.problems.includes('phone_invalid')" @update:model-value="edit(row, { phoneInput: $event })" />
              </td>
              <td class="max-w-40 break-words px-3 py-3 text-ink-700">{{ row.email }}</td>
              <td v-if="showFamilies" class="px-3 py-3 text-ink-700">{{ row.family }}</td>
              <td class="px-3 py-3">
                <div class="flex flex-wrap gap-1">
                  <span v-if="row.problems.length" class="text-sm font-medium text-danger-700">{{ problemText(row) }}</span>
                  <UiBadge v-else-if="row.duplicate" size="sm">{{ t('app.guestImport.badges.duplicate') }}</UiBadge>
                  <UiBadge v-else tone="success" size="sm">{{ t('app.guestImport.badges.ok') }}</UiBadge>
                  <UiBadge v-if="row.phoneNote === 'assumed_us'" tone="gold" size="sm">{{ t('app.guestImport.badges.assumed') }}</UiBadge>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-sm text-ink-500">{{ t('app.guestImport.selected', { n: counts.selected, total: counts.all }) }}</p>
    </div>

    <template #footer>
      <template v-if="stage === 'preview'">
        <UiButton variant="ghost" :disabled="saving" @click="reset">{{ t('app.guestImport.otherFile') }}</UiButton>
        <UiButton :loading="saving" :disabled="!counts.selected" @click="confirm">{{ counts.selected ? confirmLabel : t('app.guestImport.nothingSelected') }}</UiButton>
      </template>
      <UiButton v-else variant="ghost" @click="emit('update:open', false)">{{ t('app.guestImport.cancel') }}</UiButton>
    </template>
  </UiModal>
</template>
