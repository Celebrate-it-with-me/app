import axios from 'axios';
import { useUserStore } from '@/stores/useUserStore'

const CWM_API = axios.create({
    baseURL: import.meta.env.VITE_API_URL + 'api/v1/app',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    }
})

CWM_API.interceptors.request.use(
  (config) => {
      const userStore = useUserStore();
      // Todo check pinia is not persisting the userStore
      // Attach the token to the Authorization header if it exists
      if (userStore.token) {
          config.headers.Authorization = `Bearer ${userStore.token}`;
      }

      return config; // Return the modified config
  },
  (error) => {
      // Always reject the promise on request error
      return Promise.reject(error);
  }
);

CWM_API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return onError(error);
    }
)

const onError = (error) => {
    if (error.response.status === 401) {
        console.log(error.message);
    }

    if (error.response.status === 403) {
        console.log(error.message);
    }

    if (error.response.status === 404) {
        console.log(error.message);
    }

    return error;
}

export { CWM_API }
