import { describe, it, expect, beforeEach } from 'vitest'
import { loadThemeFonts } from '../composables/useInvitationFonts'

describe('loadThemeFonts', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('never asks Google Fonts for the bundled families and preloads the script face', () => {
    loadThemeFonts({ heading: 'Fraunces', body: 'Figtree', script: 'Pinyon Script' })
    expect(document.head.querySelector('link[href*="fonts.googleapis.com"]')).toBeNull()
    const preload = document.head.querySelector('link[rel="preload"]')
    expect(preload.getAttribute('as')).toBe('font')
    expect(preload.href).toContain('pinyon-script-latin')
  })

  it('preloads once however many times it is called', () => {
    loadThemeFonts({ script: 'Pinyon Script' })
    loadThemeFonts({ script: 'Pinyon Script' })
    expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(1)
  })

  it('still loads other families from Google Fonts once and ignores bad names', () => {
    loadThemeFonts({ a: 'Lora', b: 'Lora', c: 'bad<name>', d: 5 })
    const links = document.head.querySelectorAll('link[rel="stylesheet"]')
    expect(links).toHaveLength(1)
    expect(links[0].href).toContain('family=Lora')
  })
})
