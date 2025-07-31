import axios from 'axios'
import { useUserStore } from '@/stores/useUserStore'
import router from '@/router'
import { useNotificationStore } from '@/stores/useNotificationStore'

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
  if (error.response) {
    switch (error.response.status) {
      case 401:
        await handleUnauthorized()
        break
      case 403:
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

const handleUnauthorized = async () => {
  const userStore = useUserStore()
  const notificationStore = useNotificationStore()

  await userStore.logOut()

  await router.push({ name: 'sign-in' })
}

export { CWM_API }
