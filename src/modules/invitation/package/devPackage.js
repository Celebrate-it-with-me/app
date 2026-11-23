/**
 * Development only (loaded with a dynamic import behind import.meta.env.DEV): `?pkg=classic|botanical[&pkgv=1.0.0][&wedding=1]`
 * dresses the loaded invitation with an example package served by the dev server from dev-packages/.
 * Never part of a production build.
 */
export async function applyDevPackage(invitation, name, { wedding = false, version = '1.0.0' } = {}) {
  if (!/^[a-z][a-z0-9-]{1,31}$/.test(name)) return invitation
  if (!/^\d+\.\d+\.\d+$/.test(version)) return invitation
  const response = await fetch(`/template-packages/${name}/${version}/payload.json`)
  if (!response.ok) return invitation
  const { devTheme, ...pkg } = await response.json()
  const event = wedding ? { ...invitation.event, name: 'Julieta & Camilo', typeSlug: 'wedding' } : invitation.event
  const types = new Set(Object.keys(pkg.templates ?? {}))
  return {
    ...invitation,
    event,
    theme: { ...invitation.theme, ...(devTheme ?? {}), package: pkg },
    sections: invitation.sections.map(section => {
      if (!types.has(section.type)) return section
      const next = { ...section, render: 'package' }
      if (section.type === 'cover') {
        next.data = { ...section.data, eventName: event.name }
        if (wedding && devTheme?.weddingText) Object.assign(next, { title: null, text: devTheme.weddingText, data: { ...next.data, description: null } })
      }
      return next
    })
  }
}
