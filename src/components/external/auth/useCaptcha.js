import { onMounted, ref } from 'vue'

/**
 * hCaptcha widget rendered into `#hcaptcha-container` (script tag lives in index.html).
 * In the local environment the token is not required.
 */
export function useCaptcha() {
  const token = ref(null)
  const required = import.meta.env.VITE_APP_ENVIRONMENT !== 'local'
  const siteKey = import.meta.env.VITE_APP_HCAPTCHA_SITE_KEY

  onMounted(() => {
    window.onCaptchaSuccess = value => {
      token.value = value
    }
    const container = document.getElementById('hcaptcha-container')
    if (window.hcaptcha && container && siteKey) {
      window.hcaptcha.render('hcaptcha-container', { sitekey: siteKey, callback: window.onCaptchaSuccess })
    }
  })

  return { token, required, siteKey, isReady: () => !required || Boolean(token.value) }
}
