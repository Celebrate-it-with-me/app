import { onMounted, onUnmounted, ref } from 'vue'

/**
 * hCaptcha widget rendered into `#hcaptcha-container`. The hCaptcha script (about 1 MB with its frames) is not loaded when
 * the screen mounts but when the person first touches the form (focus or pointer) or tries to submit, so it never competes
 * with the first paint. The token stays as mandatory as before: only WHEN the script is fetched changes.
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

  /** Downloads the script (once) and draws the widget as soon as `window.hcaptcha` exists. */
  let started = false
  function start() {
    if (started) return
    started = true
    stopWatching()
    if (!siteKey || !document.getElementById('hcaptcha-container')) return
    loadHcaptchaScript()
    // api.js loads async: it lands after this call. Retry for up to ~10 s.
    let tries = 0
    const render = () => {
      if (window.hcaptcha) {
        widgetId = window.hcaptcha.render('hcaptcha-container', { sitekey: siteKey, callback: window.onCaptchaSuccess })
        return
      }
      if (tries++ < 50) poll = setTimeout(render, 200)
    }
    render()
  }

  let form = null
  const TOUCH_EVENTS = ['focusin', 'pointerdown', 'keydown']
  function stopWatching() {
    TOUCH_EVENTS.forEach(name => form?.removeEventListener(name, start))
    form = null
  }

  onMounted(() => {
    window.onCaptchaSuccess = value => {
      token.value = value
    }
    const container = document.getElementById('hcaptcha-container')
    if (!siteKey || !container) return
    // Inside a form: wait for the first touch. Anywhere else there is nothing to wait for.
    form = container.closest('form')
    if (!form) return start()
    TOUCH_EVENTS.forEach(name => form.addEventListener(name, start, { once: true }))
  })

  onUnmounted(() => {
    stopWatching()
    clearTimeout(poll)
    delete window.onCaptchaSuccess
  })

  /** Ready to submit; when it is not, the script is fetched now (submitting before touching the form: autofill, Enter). */
  function isReady() {
    const ready = !required || Boolean(token.value)
    if (!ready) start()
    return ready
  }

  return { token, required, siteKey, reset, isReady }
}
