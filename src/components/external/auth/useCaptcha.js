import { onMounted, onUnmounted, ref } from 'vue'

/**
 * hCaptcha widget rendered into `#hcaptcha-container`. The hCaptcha script is only loaded when a
 * screen that uses the widget (login, registration) mounts, not on every page of the app.
 * In the local environment the token is not required.
 */
const HCAPTCHA_SRC = 'https://js.hcaptcha.com/1/api.js'

function loadHcaptchaScript() {
  if (typeof document === 'undefined' || document.querySelector(`script[src="${HCAPTCHA_SRC}"]`)) return
  const script = document.createElement('script')
  script.src = HCAPTCHA_SRC
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

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
    loadHcaptchaScript()
    // api.js loads async: it lands after this view mounts. Retry for up to ~10 s.
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
