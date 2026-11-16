import axios from 'axios'
import { useUserStore } from '@/stores/useUserStore'
import router from '@/router'
import { isAccountSuspended, rememberSupportEmail, supportEmailFrom } from '@/utils/accountSuspended'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'
import { isBlockedError, isEndedError, readBlobBody } from '@/modules/impersonation/utils/impersonation'
import { safeRedirect } from '@/utils/safeRedirect'
import { useToast } from '@/ui'
import i18n from '@/locales/i18n'
import { isModuleLocked, notifyModuleLocked } from '@/utils/moduleLocked'
import { isMaintenanceError } from '@/modules/maintenance/utils/maintenance'
import { useSystemStatusStore } from '@/modules/maintenance/stores/useSystemStatusStore'

const CWM_API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + 'api/v1/app',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

CWM_API.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    const impersonation = useImpersonationStore()

    // A support session lives on its own bearer token and never touches the cookies of the person's normal session.
    if (impersonation.active) {
      config.headers.Authorization = `Bearer ${impersonation.token}`
      config.withCredentials = false
      return config
    }

    const token = getCookie('XSRF-TOKEN')
    if (token) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token)
    }

    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

CWM_API.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    return await onError(error)
  }
)

const onError = async error => {
  await readBlobBody(error)
  if (isBlockedError(error)) {
    // The server decides what a support session may do: tell her kindly and keep the session.
    useToast().toast({ title: i18n.global.t('impersonation.blocked'), tone: 'warning' })
    return Promise.reject(error)
  }
  if (error?.response?.status === 401) {
    const impersonation = useImpersonationStore()
    if (isEndedError(error, impersonation.active)) {
      impersonation.finish()
      if (router.currentRoute.value.name !== 'impersonation-ended') await router.replace({ name: 'impersonation-ended', query: { reason: 'expired' } })
      return Promise.reject(error)
    }
  }
  if (error.response) {
    switch (error.response.status) {
      case 401:
        await handleUnauthorized()
        break
      case 403:
        // A module the plan does not include: an upgrade notice, never the generic forbidden page.
        if (isModuleLocked(error)) {
          notifyModuleLocked(error, { toast: useToast().toast, t: i18n.global.t })
          break
        }
        // The account cannot be deleted while it is support staff: the screen explains it, no redirect.
        if (error.response.data?.code === 'staff_account') break
        // Invitation editor and template selector: 403 plan_required / template_not_available (plan or catalog refusal) is
        // explained by the screen itself, with a way forward; it is not a forbidden page.
        if (['plan_required', 'template_not_available'].includes(error.response.data?.code)) break
        // An expired or tampered signed link (reset password...): the screen explains it, no redirect.
        if (error.response.data?.code === 'invalid_signed_link') break
        if (isAccountSuspended(error)) {
          await handleSuspended(error)
          break
        }
        await router.push('/403')
        console.warn('Forbidden:', error.message)
        break
      case 503:
        // Maintenance mode: a full-screen notice that retries by itself. Any other 503 is left alone.
        if (isMaintenanceError(error)) {
          useSystemStatusStore().handleMaintenanceResponse(error, router.currentRoute.value.path)
        }
        break
      case 404:
        console.warn('Not Found:', error.message)
        break
      case 419:
        console.warn('CSRF Token Mismatch:', error.message)
        break
    }
  }
  return Promise.reject(error)
}

/** A suspended account: close the local session and show the suspended screen (never the generic 403). */
const handleSuspended = async error => {
  const userStore = useUserStore()
  await userStore.logOut()
  rememberSupportEmail(supportEmailFrom(error))
  if (router.currentRoute.value.name !== 'account-suspended') {
    await router.push({ name: 'account-suspended' })
  }
}

const handleUnauthorized = async () => {
  const userStore = useUserStore()
  await userStore.logOut()

  const redirect = safeRedirect(router.currentRoute.value.fullPath)
  await router.push({ name: 'sign-in', query: redirect ? { redirect } : {} })
}

export { CWM_API, onError }
