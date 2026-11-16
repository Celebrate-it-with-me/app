import { computed, ref } from 'vue'
import InvitationEditorService from '../services/InvitationEditorService'
import { useAutosave } from './useAutosave'
import {
  canMove,
  classify,
  cleanValue,
  fieldErrorsFrom,
  generalFieldsError,
  moveSection,
  orderedSections,
  sameValue,
  sectionErrorFrom,
  sectionsPayload,
  validateValue
} from '../utils/editorFields'

/**
 * State and actions of the "Tu invitación" screen. The API describes the form (`GET invitation`); this only keeps the
 * values, saves them by field id and reports what the API refused. It never builds `template_config`.
 *
 * `notify({ kind, ...})` tells the view about things worth a toast: 'plan', 'locked', 'sectionError', 'generalError'.
 */
export function useInvitationEditor(eventId, { notify = () => {} } = {}) {
  const data = ref(null)
  const loading = ref(true)
  const loadError = ref(false)
  /** `{ [fieldId]: { code, lang? } }` — from the mirror check or from the API's 422. */
  const fieldErrors = ref({})
  const sectionState = ref('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const sectionError = ref(null)

  const fields = computed(() => data.value?.fields ?? [])
  const groups = computed(() => data.value?.groups ?? [])
  const sections = computed(() => (data.value ? orderedSections(data.value.sections ?? []) : []))
  const locked = computed(() => Boolean(data.value?.state?.templateLocked))
  const fieldById = id => fields.value.find(f => f.id === id)

  const autosave = useAutosave({
    save: body => InvitationEditorService.saveFields(eventId(), body),
    fieldIds: () => fields.value.map(f => f.id),
    errorsFrom: fieldErrorsFrom,
    onSaved(result, ids) {
      // Server wins for the fields it answered, unless the person already typed something newer.
      for (const touched of result?.fields ?? []) {
        const f = fieldById(touched.id)
        if (!f || autosave.isDirty(touched.id)) continue
        f.value = touched.value
        f.isDefault = touched.isDefault ?? sameValue(touched.value, f.default)
      }
      for (const id of ids) {
        if (!autosave.isDirty(id)) delete fieldErrors.value[id]
      }
    },
    onRejected(rejected, error) {
      fieldErrors.value = { ...fieldErrors.value, ...rejected }
      const general = generalFieldsError(error)
      if (general) notify({ kind: 'generalError', code: general })
    },
    onPlanRequired(ids) {
      // The API says these are part of the full event: show them locked, back at the template's value.
      for (const id of ids) {
        const f = fieldById(id)
        if (!f) continue
        f.locked = true
        f.value = structuredClone(f.default)
        f.isDefault = true
      }
      notify({ kind: 'plan', ids })
    },
    onTemplateLocked() {
      if (data.value) data.value.state.templateLocked = true
      notify({ kind: 'locked' })
    }
  })

  async function load() {
    loading.value = true
    loadError.value = false
    try {
      data.value = await InvitationEditorService.get(eventId())
    } catch {
      data.value = null
      loadError.value = true
    } finally {
      loading.value = false
    }
  }

  /** Replace everything with a fresh payload (for instance the answer of `PUT template` that Lira B's picker receives). */
  function applyState(next) {
    data.value = next
    fieldErrors.value = {}
  }

  function setValue(id, raw, { immediate } = {}) {
    const f = fieldById(id)
    if (!f || f.locked) return
    const value = cleanValue(f, raw)
    // The input shows what the person typed at once; saving and validating use the cleaned value.
    f.value = raw
    f.isDefault = sameValue(value, f.default)
    const problem = validateValue(f, value)
    if (problem) {
      fieldErrors.value = { ...fieldErrors.value, [id]: problem }
      return
    }
    const rest = { ...fieldErrors.value }
    delete rest[id]
    fieldErrors.value = rest
    autosave.queue(id, value, { immediate: immediate ?? f.type !== 'text' })
  }

  /** "Back to the template's value": `null` deletes the override. */
  function resetField(id) {
    const f = fieldById(id)
    if (!f || f.locked) return
    f.value = structuredClone(f.default)
    f.isDefault = true
    const rest = { ...fieldErrors.value }
    delete rest[id]
    fieldErrors.value = rest
    autosave.queue(id, null, { immediate: true })
  }

  let sectionQueue = Promise.resolve()
  function persistSections(next, previous) {
    data.value.sections = next
    sectionState.value = 'saving'
    sectionError.value = null
    const body = sectionsPayload(next)
    sectionQueue = sectionQueue.then(async () => {
      try {
        const result = await InvitationEditorService.saveSections(eventId(), body)
        if (Array.isArray(result?.sections)) data.value.sections = result.sections
        sectionState.value = 'saved'
      } catch (error) {
        data.value.sections = previous
        const kind = classify(error)
        sectionState.value = 'error'
        if (kind === 'validation') {
          sectionError.value = sectionErrorFrom(error)
          notify({ kind: 'sectionError', code: sectionError.value?.code })
        } else if (kind === 'locked') {
          data.value.state.templateLocked = true
          notify({ kind: 'locked' })
        } else notify({ kind: 'sectionError', code: 'network' })
      }
    })
    return sectionQueue
  }

  function toggleSection(type) {
    const current = data.value.sections
    const s = current.find(x => x.type === type)
    if (!s || s.required || (s.moduleState === 'locked' && !s.enabled)) return
    return persistSections(current.map(x => (x.type === type ? { ...x, enabled: !x.enabled } : x)), current)
  }

  function shiftSection(type, direction) {
    const current = data.value.sections
    if (!canMove(current, type, direction)) return
    return persistSections(moveSection(current, type, direction), current)
  }

  const saveStatus = computed(() => {
    if (sectionState.value === 'saving' && autosave.status.value !== 'offline') return 'saving'
    return autosave.status.value
  })

  return {
    data, loading, loadError, fields, groups, sections, locked,
    fieldErrors, fieldState: autosave.fieldState, saveStatus, lastSavedAt: autosave.lastSavedAt,
    sectionState, sectionError,
    load, applyState, setValue, resetField, toggleSection, shiftSection,
    retry: autosave.retryNow, flush: autosave.flush, hasPending: autosave.hasPending
  }
}
