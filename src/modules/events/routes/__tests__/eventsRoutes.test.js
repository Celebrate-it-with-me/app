import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import routes from '../events.routes'

function sources(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sources(path)
    return /\.(vue|js|ts)$/.test(name) ? [path] : []
  })
}

describe('event routes', () => {
  it('has no event detail page: the dashboard replaced it', () => {
    expect(routes.some(route => /details/.test(route.path))).toBe(false)
  })

  it('leaves no link or route name pointing at the removed page', () => {
    const root = join(process.cwd(), 'src')
    const offenders = sources(root).filter(file => /events\/[^'"`\s]*\/details|name:\s*['"]event-details['"]|['"]event-details['"]/.test(readFileSync(file, 'utf8')))
    expect(offenders).toEqual([])
  })

  it('edits an event only with the edit_event permission', () => {
    const edit = routes.find(route => route.name === 'edit-event')
    expect(edit.meta.requiredPermission).toContain('edit_event')
  })
})
