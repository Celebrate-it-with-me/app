import { CWM_API } from './axios'

class UserService {
  async login({ email, password}) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(async () => {
      return await CWM_API.post('login', {
        email,
        password
      })
    })
  }


  async register({ name, email, password }) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(
      async () => await CWM_API.post('register', {
        name,
        email,
        password
      })
    )
  }
}
