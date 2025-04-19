import { CWM_API } from './axios'

class UserService {
  async login({ email, password, remember, device}) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(async () => {
      return await CWM_API.post('login', {
        email,
        password,
        remember,
        device
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

  async confirmEmail(confirmUrl) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(
      async () => await CWM_API.post(confirmUrl)
    )
  }

  async sendResetPasswordLink(form) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(
      async () => await CWM_API.post('forgot-password', form)
    )
  }

  async checkResetLink(confirmUrl) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(
      async () => await CWM_API.post(confirmUrl)
    )
  }

  async changePassword({email, password, passwordConfirmation}) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(
      async () => await CWM_API.post('reset-password', {
        email,
        password,
        password_confirmation: passwordConfirmation
      })
    )
  }

  async getUserEvents() {
    return await CWM_API.get('events')
  }

  async logOut() {
    return await CWM_API.post('logout')
  }
}

export default new UserService()
