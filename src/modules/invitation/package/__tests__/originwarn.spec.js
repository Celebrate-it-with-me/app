import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { usePackageTheme, resetOriginWarning } from '../usePackageTheme'

function mountWith(source) {
  createApp({
    setup() {
      usePackageTheme(() => source.value)
      return () => h('div')
    }
  }).mount(document.createElement('div'))
}

describe('usePackageTheme: rejected origin', () => {
  let warn
  beforeEach(() => {
    resetOriginWarning()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => warn.mockRestore())

  it('warns once with the reason when the CSS origin is dropped, and keeps falling back to Clásica', async () => {
    const source = ref({ slug: 'classic', cssUrl: 'https://evil.test/theme.css', templates: {} })
    mountWith(source)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain('origin is not allowed')
    source.value = { slug: 'classic', cssUrl: 'http://other.test/theme.css', templates: {} }
    await nextTick()
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('stays quiet without a package or without a CSS URL', () => {
    mountWith(ref(null))
    mountWith(ref({ slug: 'classic', templates: {} }))
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when the origin is allowed', () => {
    mountWith(ref({ slug: 'classic', cssUrl: `${window.location.origin}/p/1.0.1/theme.css`, templates: {} }))
    expect(warn).not.toHaveBeenCalled()
  })
})
