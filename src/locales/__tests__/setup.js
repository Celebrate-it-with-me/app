import { vi } from 'vitest'
import i18n from '../i18n'
import es from '../es'
import en from '../en'

i18n.global.setLocaleMessage('es', es)
i18n.global.setLocaleMessage('en', en)

// Tests assume the package assets live on the page origin; a developer's .env.local may point
// VITE_TEMPLATE_ASSETS_ORIGIN at the API host, which made the package specs fail only on dev machines.
vi.stubEnv('VITE_TEMPLATE_ASSETS_ORIGIN', '')
