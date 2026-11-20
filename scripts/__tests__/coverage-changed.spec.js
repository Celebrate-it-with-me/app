import { describe, it, expect } from 'vitest'
import { parseDiff, executableLines, computeChanged } from '../coverage-changed.mjs'

const diff = [
  'diff --git a/src/a.js b/src/a.js',
  '--- a/src/a.js',
  '+++ b/src/a.js',
  '@@ -3,0 +4,2 @@ fn',
  '+x',
  '+y',
  '@@ -10 +12 @@',
  '+z',
  '@@ -20,2 +21,0 @@',
  'diff --git a/src/old.js b/src/old.js',
  '--- a/src/old.js',
  '+++ /dev/null',
  '@@ -1,3 +0,0 @@'
].join('\n')

const entry = {
  statementMap: {
    0: { start: { line: 4 }, end: { line: 4 } },
    1: { start: { line: 5 }, end: { line: 5 } },
    2: { start: { line: 12 }, end: { line: 12 } },
    3: { start: { line: 12 }, end: { line: 12 } }
  },
  s: { 0: 1, 1: 0, 2: 1, 3: 0 }
}

describe('coverage-changed', () => {
  it('parses added and modified lines, ignoring deletions and deleted files', () => {
    const m = parseDiff(diff)
    expect([...m.get('src/a.js')]).toEqual([4, 5, 12])
    expect(m.has('src/old.js')).toBe(false)
  })

  it('treats a line as covered only when all its statements ran', () => {
    expect(executableLines(entry).get(12)).toBe(false)
    expect(executableLines(entry).get(4)).toBe(true)
  })

  it('computes per-file and total percentages and lists uncovered lines', () => {
    const r = computeChanged(parseDiff(diff), { '/app/work/src/a.js': entry })
    expect(r.files).toEqual([{ file: 'src/a.js', covered: 1, total: 3, uncovered: [5, 12] }])
    expect(r.pct).toBeCloseTo(33.33, 1)
  })

  it('ignores files without executable changed lines or not measured, and is 100 % when empty', () => {
    const changed = new Map([['src/b.js', new Set([1])], ['src/a.js', new Set([99])]])
    const r = computeChanged(changed, { '/x/src/a.js': entry })
    expect(r.files).toEqual([])
    expect(r.pct).toBe(100)
  })
})
