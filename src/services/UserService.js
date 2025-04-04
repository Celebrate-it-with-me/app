import { CWM_API } from './axios'

class UserService {
  async login({ email, password, device}) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(async () => {
      return await CWM_API.post('login', {
        email,
        password,
        device
      })
    })
  }


  async register({ firstName, lastName, email, password }) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(
      async () => await CWM_API.post('register', {
        firstName,
        lastName,
        email,
        password
      })
    )
  }

  async logOut() {
    return await CWM_API.post('logout')
  }
}

export default new UserService()
