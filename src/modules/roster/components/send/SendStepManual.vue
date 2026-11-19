<script setup>
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, ExternalLink, MessageCircle } from 'lucide-vue-next'
import { UiButton, useToast } from '@/ui'
import SendWizardService from '../../services/SendWizardService'
import { manualLink, manualProgress, renderMessage } from '../../utils/sendWizard'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  eventName: { type: String, default: '' },
  families: { type: Array, required: true },
  /** Message with {name}, {event} and {link}, chosen in step 2. */
  text: { type: String, required: true }
})
const emit = defineEmits(['changed'])
const { t, d } = useI18n()
const { error: showError } = useToast()

// Moment each family was opened (ISO), seeded from the server and updated as the organizer taps.
const shared = reactive(Object.fromEntries(props.families.map(f => [f.id, f.sharedAt])))
const busy = reactive({})

const messageOf = family => renderMessage(props.text, { name: family.name, event: props.eventName, link: family.link ?? '' })
const urlOf = family => manualLink(family, messageOf(family))
const progress = computed(() => manualProgress(props.families, shared))
const timeOf = iso => d(new Date(iso), { hour: '2-digit', minute: '2-digit' })

async function mark(family) {
  const previous = shared[family.id]
  shared[family.id] = previous ?? new Date().toISOString()
  busy[family.id] = true
  try {
    const row = await SendWizardService.markShared(props.eventId, family.id)
    shared[family.id] = row?.delivery?.sharedAt ?? shared[family.id]
    emit('changed')
  } catch {
    shared[family.id] = previous
    showError(t('app.whatsapp.wizard.manual.markError'))
  } finally {
    busy[family.id] = false
  }
}

async function unmark(family) {
  const previous = shared[family.id]
  shared[family.id] = null
  busy[family.id] = true
  try {
    await SendWizardService.unmarkShared(props.eventId, family.id)
    emit('changed')
  } catch {
    shared[family.id] = previous
    showError(t('app.whatsapp.wizard.manual.markError'))
  } finally {
    busy[family.id] = false
  }
}
</script>

<template>
  <div>
    <h3 class="font-heading text-xl text-ink-900" data-step-title tabindex="-1">{{ t('app.whatsapp.wizard.manual.title', { n: families.length }, families.length) }}</h3>
    <p class="mt-1 text-sm text-ink-500">{{ t('app.whatsapp.wizard.manual.help') }}</p>

    <div class="mt-4" aria-live="polite">
      <div class="flex items-baseline justify-between gap-3 text-sm">
        <p class="font-medium text-ink-900" data-testid="manual-progress">{{ t('app.whatsapp.wizard.manual.progress', { done: progress.done, total: progress.total }) }}</p>
        <p class="text-ink-500">{{ progress.left ? t('app.whatsapp.wizard.manual.left', { n: progress.left }, progress.left) : t('app.whatsapp.wizard.manual.allDone') }}</p>
      </div>
      <div
        class="mt-2 h-2 overflow-hidden rounded-full bg-cream-100"
        role="progressbar"
        :aria-valuenow="progress.done"
        aria-valuemin="0"
        :aria-valuemax="progress.total"
        :aria-label="t('app.whatsapp.wizard.manual.progress', { done: progress.done, total: progress.total })"
      >
        <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-300 ease-out motion-reduce:transition-none" :style="{ transform: `scaleX(${progress.total ? progress.done / progress.total : 0})` }" />
      </div>
    </div>

    <ul class="mt-4 divide-y divide-line rounded-xl border border-line">
      <li v-for="family in families" :key="family.id" class="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3" data-testid="manual-row">
        <div class="min-w-0 sm:flex-1">
          <p class="truncate font-medium text-ink-900">{{ family.name }}</p>
          <p class="truncate text-sm text-ink-500">{{ family.phone || t('app.whatsapp.wizard.manual.noNumber') }} · {{ t('app.roster.people', { n: family.people }, family.people) }}</p>
          <p v-if="family.optedOut" class="mt-0.5 text-xs text-ink-500" data-testid="manual-optedout">{{ t('app.whatsapp.wizard.manual.optedOutNote') }}</p>
          <p v-if="shared[family.id]" class="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-success-700">
            <Check class="h-4 w-4" aria-hidden="true" />
            {{ t('app.whatsapp.wizard.manual.opened', { time: timeOf(shared[family.id]) }) }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <UiButton
            size="sm"
            :variant="shared[family.id] ? 'secondary' : 'primary'"
            :href="urlOf(family)"
            target="_blank"
            rel="noopener"
            :aria-label="t('app.whatsapp.wizard.manual.openLabel', { name: family.name })"
            @click="mark(family)"
          >
            <component :is="shared[family.id] ? ExternalLink : MessageCircle" class="h-4 w-4" aria-hidden="true" />
            {{ shared[family.id] ? t('app.whatsapp.wizard.manual.openAgain') : family.phone ? t('app.whatsapp.wizard.manual.open') : t('app.whatsapp.wizard.manual.pickContact') }}
          </UiButton>
          <UiButton v-if="shared[family.id]" size="sm" variant="ghost" :disabled="busy[family.id]" :aria-label="t('app.whatsapp.wizard.manual.unmarkLabel', { name: family.name })" @click="unmark(family)">
            {{ t('app.whatsapp.wizard.manual.unmark') }}
          </UiButton>
        </div>
      </li>
    </ul>
    <p class="mt-3 text-xs text-ink-500">{{ t('app.whatsapp.wizard.manual.openedHelp') }}</p>
  </div>
</template>
