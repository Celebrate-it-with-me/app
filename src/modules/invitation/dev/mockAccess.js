/**
 * DEV only. Stands in for the invitation access endpoints (GET .../access and POST .../access/verify) until the API
 * is wired in every environment. InvitationAccessView loads it with a dynamic import behind `import.meta.env.DEV`,
 * so it never reaches the production bundle.
 * Use `/i/:slug?mock=<scenario>`; the code VAL001 is the only valid one.
 */
export const SCENARIOS = ['named', 'anonymous', 'slow', 'offline', 'limited']

const NEVER = new Promise(() => {})
const failure = (status, data = {}) => Promise.reject({ response: { status, data } })

export function mockAccess(scenario = 'named') {
  return {
    getAccess: async () => {
      if (scenario === 'slow') return NEVER
      if (scenario === 'offline') throw { request: {}, message: 'Network Error' }
      return { data: { data: { organizer_name: scenario === 'anonymous' ? null : 'Marisol' } } }
    },
    verifyAccess: async (_slug, code) => {
      if (scenario === 'limited') return failure(429, { message: 'Too Many Attempts.' })
      if (String(code).toUpperCase() === 'VAL001') return { data: { data: { valid: true, code: 'VAL001' } } }
      return failure(422, { code: 'invalid_code', message: 'Invalid code.' })
    }
  }
}
