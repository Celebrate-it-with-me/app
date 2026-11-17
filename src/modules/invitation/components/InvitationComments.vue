<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { MessageCircleHeart, Pin } from 'lucide-vue-next'
import InvitationService from '@/services/PublicEvents/InvitationService'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationPanel from './InvitationPanel.vue'
import InvitationButton from './InvitationButton.vue'

const props = defineProps({
  section: { type: Object, required: true },
  /** list (default) | cards */
  variant: { type: String, default: 'list' },
  /** Caps how many messages show at once; "show more" reveals the next ones. */
  max: { type: Number, default: null }
})

const { tt, slug, code, preview } = useInvitationContext()

const data = computed(() => props.section.data ?? {})
const maxLength = computed(() => data.value.maxLength || 500)
const canWrite = computed(() => data.value.canWrite !== false)
const title = computed(() => props.section.title || data.value.heading || tt('comments.title'))
const text = computed(() => props.section.text || data.value.subHeading || null)
const buttonText = computed(() => data.value.buttonText || tt('comments.send'))

const fieldId = useId()
const root = ref(null)

/** idle | loading | ready | error. The list is lazy: it loads when the section scrolls into view. */
const status = ref('idle')
const items = ref([])
const meta = ref({ currentPage: 0, lastPage: 0, total: 0 })
const shown = ref(props.max ?? Infinity)
const loadingMore = ref(false)

const draft = ref('')
const sending = ref(false)
const sent = ref(false)
const errorCode = ref('')

const visible = computed(() => items.value.slice(0, shown.value))
const hasMore = computed(() => items.value.length > shown.value || meta.value.currentPage < meta.value.lastPage)
const remaining = computed(() => maxLength.value - [...draft.value].length)
const tooLong = computed(() => remaining.value < 0)
const emptyDraft = computed(() => draft.value.trim() === '')

async function fetchPage(page) {
  const { data: body } = await InvitationService.listComments({ slug: slug(), code: code(), page })
  return body
}

async function load() {
  if (preview || status.value === 'loading') return
  status.value = 'loading'
  try {
    const body = await fetchPage(1)
    items.value = body.data ?? []
    meta.value = body.meta ?? { currentPage: 1, lastPage: 1, total: items.value.length }
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

async function more() {
  if (items.value.length > shown.value) {
    shown.value += props.max ?? Infinity
    return
  }
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    const body = await fetchPage(meta.value.currentPage + 1)
    const known = new Set(items.value.map(item => item.id))
    items.value = [...items.value, ...(body.data ?? []).filter(item => !known.has(item.id))]
    meta.value = body.meta ?? meta.value
    if (props.max) shown.value = items.value.length
  } catch {
    errorCode.value = 'loadError'
  } finally {
    loadingMore.value = false
  }
}

async function submit() {
  if (preview || sending.value) return
  sent.value = false
  errorCode.value = ''
  if (emptyDraft.value) return void (errorCode.value = 'required')
  if (tooLong.value) return void (errorCode.value = 'too_long')
  sending.value = true
  try {
    const { data: body } = await InvitationService.postComment({ slug: slug(), code: code(), comment: draft.value.trim() })
    // Pinned messages stay on top: the new one goes right after them.
    const firstFree = items.value.findIndex(item => !item.isPinned)
    items.value.splice(firstFree === -1 ? items.value.length : firstFree, 0, body.data)
    meta.value = { ...meta.value, total: meta.value.total + 1 }
    if (status.value !== 'ready') status.value = 'ready'
    draft.value = ''
    sent.value = true
  } catch (error) {
    const response = error?.response
    const first = response?.data?.errors?.comment?.[0]
    const known = ['required', 'too_long']
    if (response?.status === 422) errorCode.value = known.includes(first) ? first : 'generic'
    else if (response?.status === 429) errorCode.value = 'too_many_attempts'
    else if (response?.status === 403) errorCode.value = 'module_locked'
    else if (response?.status === 409 && response.data?.code === 'comments_full') errorCode.value = 'comments_full'
    else errorCode.value = 'generic'
  } finally {
    sending.value = false
  }
}

let observer
onMounted(() => {
  if (preview) return
  if (!('IntersectionObserver' in window) || !root.value) return void load()
  observer = new IntersectionObserver(
    entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      load()
    },
    { rootMargin: '200px' }
  )
  observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

// `loadError` is shown inline next to the list, not in the form.
const listError = computed(() => status.value === 'error' || errorCode.value === 'loadError')
const formError = computed(() => (errorCode.value && errorCode.value !== 'loadError' ? tt(`comments.errors.${errorCode.value}`) : ''))
</script>

<template>
  <InvitationSection id="comments" :title="title" :text="text" variant="alt">
    <div ref="root" class="inv-comments text-left" :data-variant="variant">
      <!-- Write -->
      <InvitationPanel v-if="canWrite" class="inv-comments__form">
        <form novalidate @submit.prevent="submit">
          <label :for="`${fieldId}-comment`" class="block text-sm font-medium text-inv-ink-soft">{{ tt('comments.label') }}</label>
          <textarea
            :id="`${fieldId}-comment`"
            v-model="draft"
            rows="4"
            name="comment"
            autocomplete="off"
            :placeholder="tt('comments.placeholder')"
            :aria-invalid="formError ? 'true' : undefined"
            :aria-describedby="`${fieldId}-hint`"
            class="mt-1 block min-h-28 w-full resize-y rounded-2xl border border-inv-ink/20 bg-inv-surface px-4 py-3 text-base text-inv-ink placeholder:text-inv-ink-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
            @input="sent = false"
          />
          <div :id="`${fieldId}-hint`" class="mt-1 flex items-start justify-between gap-3 text-sm">
            <p v-if="formError" role="alert" class="text-danger-700">{{ formError }}</p>
            <p v-else-if="sent" role="status" class="text-inv-primary-ink">{{ tt('comments.thanks') }}</p>
            <span v-else />
            <span :class="['shrink-0', tooLong ? 'text-danger-700' : 'text-inv-ink-soft']">
              {{ tt('comments.count', { n: [...draft].length, max: maxLength }) }}
            </span>
          </div>
          <p v-if="preview" role="note" class="mt-3 text-center text-sm text-inv-ink-soft">{{ tt('previewNotice') }}</p>
          <InvitationButton type="submit" :loading="sending" :disabled="preview || emptyDraft || tooLong" class="mt-4 w-full">
            {{ sending ? tt('comments.sending') : buttonText }}
          </InvitationButton>
        </form>
      </InvitationPanel>
      <p v-else class="rounded-2xl bg-inv-surface px-4 py-3 text-center text-inv-ink-soft text-pretty ring-1 ring-inv-ink/10">
        {{ tt('comments.readOnly') }}
      </p>

      <!-- Read -->
      <div class="mt-8" aria-live="polite">
        <ul v-if="status === 'loading' || status === 'idle'" class="flex flex-col gap-3" role="status" :aria-label="tt('comments.loading')">
          <li v-for="n in 2" :key="n" class="h-20 animate-pulse rounded-2xl bg-inv-ink/10" />
        </ul>

        <div v-else-if="listError && !items.length" class="rounded-2xl bg-inv-surface px-4 py-5 text-center ring-1 ring-inv-ink/10">
          <p class="text-inv-ink-soft text-pretty">{{ tt('comments.loadError') }}</p>
          <InvitationButton variant="outline" class="mt-4" @click="load">{{ tt('retry') }}</InvitationButton>
        </div>

        <p v-else-if="!items.length" class="flex flex-col items-center gap-3 py-4 text-center text-inv-ink-soft text-pretty">
          <MessageCircleHeart class="h-7 w-7 text-inv-primary" aria-hidden="true" />
          {{ tt('comments.empty') }}
        </p>

        <template v-else>
          <ul :aria-label="tt('comments.list')" :class="variant === 'cards' ? 'grid gap-3 sm:grid-cols-2' : 'flex flex-col gap-3'">
            <li
              v-for="item in visible"
              :key="item.id"
              :class="[
                'inv-comments__item rounded-2xl bg-inv-surface px-5 py-4 ring-1',
                item.isPinned ? 'ring-inv-accent/60' : 'ring-inv-ink/10'
              ]"
            >
              <p class="flex items-center gap-2 font-inv-heading text-lg">
                <span class="min-w-0 truncate">{{ item.author }}</span>
                <span v-if="item.isPinned" class="inline-flex shrink-0 items-center gap-1 font-inv-body text-sm text-inv-primary-ink">
                  <Pin class="h-3.5 w-3.5" aria-hidden="true" />{{ tt('comments.pinned') }}
                </span>
              </p>
              <p class="mt-1 whitespace-pre-line break-words text-inv-ink">{{ item.comment }}</p>
            </li>
          </ul>
          <p v-if="listError" class="mt-3 text-center text-sm text-danger-700">{{ tt('comments.loadError') }}</p>
          <div v-if="hasMore" class="mt-5 text-center">
            <InvitationButton variant="outline" :loading="loadingMore" @click="more">{{ tt('comments.more') }}</InvitationButton>
          </div>
        </template>
      </div>
    </div>
  </InvitationSection>
</template>
