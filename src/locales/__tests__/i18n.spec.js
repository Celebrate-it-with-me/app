import { describe, it, expect, beforeEach } from 'vitest'
import i18n from '../i18n'

describe('i18n (vue-i18n 11, composition mode)', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en'
  })

  it('is created in composition mode with en as fallback', () => {
    expect(i18n.mode).toBe('composition')
    expect(i18n.global.fallbackLocale.value).toBe('en')
  })

  it('translates the available locales', () => {
    const { t } = i18n.global

    expect(t('invalidAccessCode')).toBe('Invalid Access Code')

    i18n.global.locale.value = 'es'
    expect(t('invalidAccessCode')).not.toBe('Invalid Access Code')
  })

  it('supports nested keys and falls back to the key when missing', () => {
    const { t } = i18n.global

    expect(t('guestTable.button')).toBe('Next')
    expect(t('does.not.exist')).toBe('does.not.exist')
  })
})
