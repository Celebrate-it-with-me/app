/**
 * Dev-only door to the in-memory WhatsApp mock (see whatsappMock.js). `import.meta.env.DEV` is a build-time constant, so
 * production bundles drop the dynamic import and the mock chunk. Returns null when the mock is off.
 */
export const getMock = async () => (import.meta.env.DEV && import.meta.env.VITE_WHATSAPP_MOCK ? (await import('./whatsappMock')).mockWhatsapp : null)
