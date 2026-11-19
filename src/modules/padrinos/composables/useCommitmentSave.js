import { computed, ref } from 'vue'
import { commitmentProblem, withResolutions } from '../utils/padrinos'

/**
 * Saves a padrino's commitments and drives the "was this already paid?" conversation with the API.
 *
 *   submit(commitments) -> 'saved' | 'conflict' | 'exceeds' | 'failed'
 *   resolve(choices)    -> same, retrying the PUT with `{ [budgetItemId]: 'attribute_payments' | 'additional' }`
 *   cancel()            -> forgets everything; nothing was changed in the API (the 409 never writes)
 */
export function useCommitmentSave({ save }) {
  const pending = ref([])
  const conflicts = ref([])
  const exceeded = ref(null)
  const warnings = ref([])
  const busy = ref(false)

  const asking = computed(() => conflicts.value.length > 0)

  function reset() {
    pending.value = []
    conflicts.value = []
    exceeded.value = null
  }

  async function send(commitments) {
    busy.value = true
    try {
      const result = await save(commitments)
      warnings.value = result?.warnings ?? []
      reset()
      return 'saved'
    } catch (e) {
      const problem = commitmentProblem(e)
      if (problem?.type === 'conflict') {
        conflicts.value = problem.conflicts
        exceeded.value = null
        return 'conflict'
      }
      if (problem?.type === 'exceeds') {
        exceeded.value = problem
        return 'exceeds'
      }
      reset()
      return 'failed'
    } finally {
      busy.value = false
    }
  }

  function submit(commitments) {
    reset()
    warnings.value = []
    pending.value = commitments
    return send(commitments)
  }

  function resolve(choices) {
    exceeded.value = null
    return send(withResolutions(pending.value, choices))
  }

  function cancel() {
    reset()
  }

  return { pending, conflicts, exceeded, warnings, busy, asking, submit, resolve, cancel }
}
