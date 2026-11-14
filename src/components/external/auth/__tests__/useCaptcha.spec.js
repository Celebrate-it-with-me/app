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
})
