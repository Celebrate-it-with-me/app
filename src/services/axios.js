import axios from 'axios'
import { useUserStore } from '@/stores/useUserStore'
import router from '@/router'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { isAccountSuspended, rememberSupportEmail, supportEmailFrom } from '@/utils/accountSuspended'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'
import { isBlockedError, isEndedError, readBlobBody } from '@/modules/impersonation/utils/impersonation'
import { useToast } from '@/ui'
import i18n from '@/locales/i18n'

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
        if (isAccountSuspended(error)) {
          await handleSuspended(error)
          break
        }
        await router.push('/403')
        console.log('Forbidden:', error.message)
        break
      case 404:
        console.log('Not Found:', error.message)
        break
      case 419:
        console.log('CSRF Token Mismatch:', error.message)
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
  const notificationStore = useNotificationStore()

  await userStore.logOut()

  const currentPath = router.currentRoute.value.fullPath
  await router.push({ name: 'sign-in', query: { redirect: currentPath } })
}

export { CWM_API, onError }
