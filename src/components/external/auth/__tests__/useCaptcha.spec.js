import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useCaptcha } from '../useCaptcha'

const SRC = 'https://js.hcaptcha.com/1/api.js'
const scripts = () => document.querySelectorAll(`script[src="${SRC}"]`)

const Host = defineComponent({
  setup() {
    useCaptcha()
    return () => h('div', { id: 'hcaptcha-container' })
  }
})

const FormHost = defineComponent({
  setup() {
    const captcha = useCaptcha()
    return () => h('form', [h('input', { id: 'email' }), h('div', { id: 'hcaptcha-container' }), h('button', { type: 'button', id: 'go', onClick: () => captcha.isReady() })])
  }
})

describe('hCaptcha script loading', () => {
  afterEach(() => {
    scripts().forEach(node => node.remove())
  })

  it('is not part of index.html (it must not load on every page)', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
    expect(html).not.toContain('hcaptcha')
  })

  it('is injected once, only when a screen with the widget mounts and a site key exists', () => {
    import.meta.env.VITE_APP_HCAPTCHA_SITE_KEY = 'site-key'
    const first = mount(Host, { attachTo: document.body })
    const second = mount(Host, { attachTo: document.body })
    expect(scripts()).toHaveLength(1)
    first.unmount()
    second.unmount()
  })

  it('inside a form it waits for the first touch (focus), then loads once', () => {
    import.meta.env.VITE_APP_HCAPTCHA_SITE_KEY = 'site-key'
    const wrapper = mount(FormHost, { attachTo: document.body })
    expect(scripts()).toHaveLength(0)
    wrapper.find('#email').element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    wrapper.find('#email').element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(scripts()).toHaveLength(1)
    wrapper.unmount()
  })

  it('inside a form it also loads when she submits without touching it first', async () => {
    import.meta.env.VITE_APP_HCAPTCHA_SITE_KEY = 'site-key'
    import.meta.env.VITE_APP_ENVIRONMENT = 'production' // the token is mandatory outside local
    const wrapper = mount(FormHost, { attachTo: document.body })
    expect(scripts()).toHaveLength(0)
    await wrapper.find('#go').trigger('click')
    expect(scripts()).toHaveLength(1)
    wrapper.unmount()
  })
})
