import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(__dirname, '../style.css'), 'utf8')
const guide = readFileSync(resolve(__dirname, '../modules/assistant/guide/AssistantGuide.vue'), 'utf8')

const rem = name => {
  const m = css.match(new RegExp(`--assistant-fab-${name}:\\s*([\\d.]+)rem`))
  return m ? Number(m[1]) : null
}

describe('assistant button column (fab-safe)', () => {
  it('defines the column as the button width plus the gap, and the reserve as edge plus column', () => {
    expect(rem('size')).toBe(3) // h-12 / w-12 of the button
    expect(rem('gap')).toBe(0.5)
    expect(css).toMatch(/--assistant-fab-col:\s*calc\(var\(--assistant-fab-size\) \+ var\(--assistant-fab-gap\)\)/)
    expect(css).toMatch(/--assistant-fab-reserve:\s*calc\(var\(--assistant-fab-edge\) \+ var\(--assistant-fab-col\)\)/)
  })

  it('moves the edge from 1rem to 1.5rem at 1024 px, like the button', () => {
    expect(rem('edge')).toBe(1)
    expect(css).toMatch(/@media \(min-width: 1024px\) \{\s*:root \{\s*--assistant-fab-edge: 1\.5rem/)
  })

  it('offers fab-safe only below 1024 px, as the column width', () => {
    expect(css).toMatch(/@utility fab-safe \{\s*@media \(max-width: 1023\.98px\) \{\s*padding-right: var\(--assistant-fab-col\)/)
  })

  it('positions the button from the same edge variable and keeps its size', () => {
    expect(guide).toContain('right-(--assistant-fab-edge)')
    expect(guide).toContain('h-12')
    expect(guide).toContain("'w-12 shrink-0'")
  })

  it('is applied to the rows with controls on their right, page by page', () => {
    const files = [
      'modules/roster/utils/roster.js',
      'modules/roster/components/GuestItem.vue',
      'modules/save-the-date/views/SaveTheDateView.vue',
      'modules/invitation-editor/components/SectionsList.vue',
      'modules/assistant/components/PlanTaskRow.vue',
      'modules/padrinos/components/PadrinoCard.vue',
      'modules/comments/components/CommentRow.vue',
      'modules/menus/components/MenuItem.vue',
      'modules/menus/components/MenusTable.vue',
      'modules/seating/components/SeatingTablesList.vue',
      'modules/suggested-music/components/SuggestedMusicSongItem.vue',
      'modules/onboarding/views/StartView.vue',
      'modules/account-deletion/components/DeleteAccountSection.vue'
    ]
    for (const f of files) expect(readFileSync(resolve(__dirname, '..', f), 'utf8'), f).toContain('fab-safe')
  })
})
