import { CWM_API } from './axios'

class UserService {
  async login({ email, password, remember, device, hcaptcha_token}) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(async () => {
      return await CWM_API.post('login', {
        email,
        password,
        remember,
        device,
        hcaptcha_token
      })
    })
  }


  async register({ name, email, password, hcaptcha_token }) {
    return await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    }).then(
      async () => await CWM_API.post('register', {
        name,
        email,
        password,
        hcaptcha_token
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

  async updateProfile({ name, phone, avatar }) {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('phone', phone)
    formData.append('avatar', avatar)

    return await CWM_API.post('user/update-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async refreshUser() {
    return await CWM_API.get('user')
  }

  async updatePreferences({
                            language,
                            timezone,
                            dateFormat,
                            visualTheme,
                            notifyByEmail,
                            notifyBySms,
                            smartTips
                          }) {
    return await CWM_API.post('user/preferences', {
      language,
      timezone,
      dateFormat,
      visualTheme,
      notifyByEmail,
      notifyBySms,
      smartTips
    })
  }

  async getUserPreferences() {
    return await CWM_API.get('user/preferences')
  }

  async changeUserPassword({ currentPassword, newPassword, newPasswordConfirmation }) {
    return await CWM_API.post('user/update-password', {
      currentPassword,
      newPassword,
      newPasswordConfirmation
    })
  }

  async setup2FA() {
    return await CWM_API.get('user/2fa/setup')
  }

  async verifyAndEnable2FA(authCode) {
    return await CWM_API.post('user/2fa/enable', {
      code: authCode
    })
  }

  async get2FAStatus() {
    return await CWM_API.get('user/2fa/status')
  }

  async getBackupCodes() {
    return await CWM_API.get('user/2fa/recovery-codes')
  }

  async disable2FA() {
    return await CWM_API.post('user/2fa/disable')
  }

  async logOut() {
    return await CWM_API.post('logout')
  }
}

export default new UserService()
