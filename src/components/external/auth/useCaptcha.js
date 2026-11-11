import { onMounted, onUnmounted, ref } from 'vue'

/**
 * hCaptcha widget rendered into `#hcaptcha-container` (script tag lives in index.html).
 * In the local environment the token is not required.
 */
export function useCaptcha() {
  const token = ref(null)
  const required = import.meta.env.VITE_APP_ENVIRONMENT !== 'local'
  const siteKey = import.meta.env.VITE_APP_HCAPTCHA_SITE_KEY

  let poll
  let widgetId = null

  /** Call after a failed submit: hCaptcha tokens are single-use. */
  function reset() {
    token.value = null
    if (window.hcaptcha && widgetId !== null) window.hcaptcha.reset(widgetId)
  }

  onMounted(() => {
    window.onCaptchaSuccess = value => {
      token.value = value
    }
    if (!siteKey || !document.getElementById('hcaptcha-container')) return
    // api.js loads async/defer: it may land after this view mounts. Retry for up to ~10 s.
    let tries = 0
    const render = () => {
      if (window.hcaptcha) {
        widgetId = window.hcaptcha.render('hcaptcha-container', { sitekey: siteKey, callback: window.onCaptchaSuccess })
        return
      }
      if (tries++ < 50) poll = setTimeout(render, 200)
    }
    render()
  })

  onUnmounted(() => {
    clearTimeout(poll)
    delete window.onCaptchaSuccess
  })

  return { token, required, siteKey, reset, isReady: () => !required || Boolean(token.value) }
}
