import { defineStore } from 'pinia'
import UserService from '../services/UserService'
import { format } from 'date-fns'
import { useEventsStore } from './useEventsStore'
import { smartResetAllStores } from '@/utils/reset'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    userId: '',
    token: null,
    lastLogin: null,
    activeEvent: null,
    justLogin: false,
    preferences: {
      language: '',
      timezone: '',
      visualTheme: '',
      dateFormat: '',
      notifyByEmail: null,
      notifyBySms: null,
      smartTips: null
    }
  }),
  persist: {
    key: 'user-store',
    storage: localStorage
  },
  actions: {
    /**
     * Disable two-factor authentication for the current user
     * @returns {Promise} API response
     */
    async disable2FA() {
      return await UserService.disable2FA()
    },

    /**
     * Get backup codes for two-factor authentication
     * @returns {Promise} API response with backup codes
     */
    async getBackupCodes() {
      return await UserService.getBackupCodes()
    },

    /**
     * Get the current status of two-factor authentication
     * @returns {Promise} API response with 2FA status
     */
    async get2FAStatus() {
      return await UserService.get2FAStatus()
    },

    /**
     * Verify and enable two-factor authentication
     * @param {string} authCode - Authentication code for verification
     * @returns {Promise} API response
     */
    async verifyAndEnable2FA(authCode) {
      return await UserService.verifyAndEnable2FA(authCode)
    },

    /**
     * Set up two-factor authentication
     * @returns {Promise} API response with setup information
     */
    async setup2FA() {
      return await UserService.setup2FA()
    },

    /**
     * Get user preferences
     * @returns {Promise} API response with user preferences
     */
    async getPreferences() {
      return await UserService.getUserPreferences()
    },

    /**
     * Update user preferences
     * @param {Object} preferences - User preferences object
     * @param {string} preferences.language - Preferred language
     * @param {string} preferences.timezone - Preferred timezone
     * @param {string} preferences.dateFormat - Preferred date format
     * @param {string} preferences.visualTheme - Preferred visual theme
     * @param {boolean} preferences.notifyByEmail - Email notification preference
     * @param {boolean} preferences.notifyBySms - SMS notification preference
     * @param {boolean} preferences.smartTips - Smart tips preference
     * @returns {Promise} API response
     */
    async updatePreferences({
      language,
      timezone,
      dateFormat,
      visualTheme,
      notifyByEmail,
      notifyBySms,
      smartTips
    }) {
      return await UserService.updatePreferences({
        language,
        timezone,
        dateFormat,
        visualTheme,
        notifyByEmail,
        notifyBySms,
        smartTips
      })
    },

    /**
     * Set user preferences in local state
     * @param {Object} newPreferences - User preferences object
     */
    setPreferences(newPreferences) {
      this.preferences = {
        language: newPreferences.language,
        timezone: newPreferences.timezone,
        dateFormat: newPreferences.dateFormat,
        visualTheme: newPreferences.visualTheme,
        notifyByEmail: !!newPreferences.notifyByEmail,
        notifyBySms: !!newPreferences.notifyBySms,
        smartTips: !!newPreferences.smartTips
      }
    },

    /**
     * Log in a user
     * @param {Object} credentials - User login credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @param {boolean} credentials.remember - Remember user
     * @param {string} credentials.device - Device information
     * @param {string} credentials.hcaptcha_token - hCaptcha token
     * @returns {Promise} API response
     */
    async login({ email, password, remember, device, hcaptcha_token }) {
      return await UserService.login({ email, password, remember, device, hcaptcha_token })
    },

    /**
     * Log in a user with Google
     * @param {Object} credentials - Google login credentials
     * @param {string} credentials.token - Google auth token
     * @returns {Promise} API response
     */
    async googleLogin({ token }) {
      return await UserService.googleLogin({ token })
    },

    /**
     * Log in a user with Facebook
     * @param {Object} credentials - Facebook login credentials
     * @param {string} credentials.token - Facebook auth token
     * @returns {Promise} API response
     */
    async facebookLogin({ token }) {
      return await UserService.facebookLogin({ token })
    },

    /**
     * Register a new user
     * @param {Object} userData - New user data
     * @param {string} userData.name - User name
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @param {string} userData.hcaptcha_token - hCaptcha token
     * @returns {Promise} API response
     */
    async register({ name, email, password, hcaptcha_token }) {
      return await UserService.register({ name, email, password, hcaptcha_token })
    },

    /**
     * Confirm user email
     * @param {string} confirmUrl - Email confirmation URL
     * @returns {Promise} API response
     */
    async confirmEmail(confirmUrl) {
      return await UserService.confirmEmail(confirmUrl)
    },

    /**
     * Send password reset link
     * @param {Object} form - Form data with email
     * @returns {Promise} API response
     */
    async sendResetPasswordLink(form) {
      return await UserService.sendResetPasswordLink(form)
    },

    /**
     * Check if reset password link is valid
     * @param {string} confirmUrl - Reset password confirmation URL
     * @returns {Promise} API response
     */
    async checkResetLink(confirmUrl) {
      return await UserService.checkResetLink(confirmUrl)
    },

    /**
     * Change password for non-authenticated user (password reset)
     * @param {Object} passwordData - Password change data
     * @param {string} passwordData.email - User email
     * @param {string} passwordData.password - New password
     * @param {string} passwordData.passwordConfirmation - Password confirmation
     * @returns {Promise} API response
     */
    async changePassword({ email, password, passwordConfirmation }) {
      return await UserService.changePassword({ email, password, passwordConfirmation })
    },

    /**
     * Change password for authenticated user
     * @param {Object} passwordData - Password change data
     * @param {string} passwordData.currentPassword - Current password
     * @param {string} passwordData.newPassword - New password
     * @param {string} passwordData.newPasswordConfirmation - New password confirmation
     * @returns {Promise} API response
     */
    async changeUserPassword({ currentPassword, newPassword, newPasswordConfirmation }) {
      return await UserService.changeUserPassword({
        currentPassword,
        newPassword,
        newPasswordConfirmation
      })
    },

    /**
     * Initialize user data in the store
     * @param {Object} userData - User data
     * @param {string} userData.name - User name
     * @param {string} userData.email - User email
     * @param {string} userData.userId - User ID
     * @param {string} userData.token - Authentication token
     * @param {Object} userData.lastLogin - Last login information
     * @param {string|number} userData.activeEvent - Active event ID
     * @param {boolean} userData.justLogin - Flag indicating if user just logged in
     * @param {string} userData.avatar - User avatar URL
     * @param {string} userData.phone - User phone number
     */
    initUserData({ name, email, userId, token, lastLogin, activeEvent, justLogin, avatar, phone }) {
      this.name = name
      this.email = email
      this.userId = userId
      this.token = token
      this.lastLogin = lastLogin
      this.activeEvent = activeEvent
      this.justLogin = justLogin
      this.avatar = avatar
      this.phone = phone
    },

    /**
     * Initialize user events
     * @returns {Promise} API response with user events
     */
    async initUserEvents() {
      return await UserService.getUserEvents()
    },

    /**
     * Log out the current user and reset all stores
     */
    async logOut() {
      smartResetAllStores()
    },

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @param {string} profileData.name - User name
     * @param {string} profileData.phone - User phone number
     * @param {string} profileData.avatar - User avatar URL
     * @returns {Promise} API response
     */
    async updateProfile({ name, phone, avatar }) {
      return await UserService.updateProfile({ name, phone, avatar })
    },

    /**
     * Refresh user data from the API
     * @returns {Promise} API response
     */
    async refreshUser() {
      const response = await UserService.refreshUser()

      if (response.status === 200) {
        const {
          name,
          email,
          id,
          last_active_event_id: activeEvent,
          avatar_url: avatar,
          phone
        } = response.data?.data?.user ?? {}

        this.name = name
        this.email = email
        this.userId = id
        this.lastLogin = null
        this.activeEvent = activeEvent
        this.justLogin = false
        this.avatar = avatar
        this.phone = phone
      }

      return response
    },

    /**
     * Initialize user state including events
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    async initUserState() {
      const eventsStore = useEventsStore()
      await eventsStore.initEvents(this.activeEvent)
    }
  },
  getters: {
    /**
     * Check if user is authenticated
     * @param {Object} state - Store state
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated(state) {
      return state.token != null
    },

    /**
     * Get formatted last login date
     * @returns {string} Formatted last login date or empty string if no login date
     */
    lastLoginDate() {
      if (!this.lastLogin) {
        return ''
      }

      return format(new Date(this.lastLogin.login_time), "MMMM dd, yyyy 'at' h:mm a")
    }
  }
})
