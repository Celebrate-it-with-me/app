#!/usr/bin/env node
/* global process, console */
// Coverage of NEW or MODIFIED lines only (the owner's rule: >= 95 % on changed code).
// Reads coverage/coverage-final.json (run `npm run test:coverage` first) and
// `git diff --unified=0 <base>...HEAD`. Exit 1 when the total is below the threshold.
//
// Env: COVERAGE_BASE (default origin/develop), COVERAGE_CHANGED_THRESHOLD (default 95),
//      COVERAGE_FILE (default coverage/coverage-final.json).
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/** Parses `git diff --unified=0` output into Map<file, Set<lineNumber>> (added/modified lines). */
export function parseDiff(diffText) {
  const changed = new Map()
  let file = null
  for (const line of diffText.split(/\r?\n/)) {
    if (line.startsWith('+++ ')) {
      file = line === '+++ /dev/null' ? null : line.replace(/^\+\+\+ b\//, '')
    } else if (file && line.startsWith('@@')) {
      const m = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line)
      if (!m) continue
      const start = Number(m[1])
      const count = m[2] === undefined ? 1 : Number(m[2])
      if (!changed.has(file)) changed.set(file, new Set())
      for (let i = 0; i < count; i++) changed.get(file).add(start + i)
    }
  }
  return changed
}

/** Builds Map<line, covered> of executable lines from an istanbul file entry. */
export function executableLines(entry) {
  const lines = new Map()
  for (const [id, loc] of Object.entries(entry.statementMap)) {
    const hit = entry.s[id] > 0
    const l = loc.start.line
    lines.set(l, (lines.get(l) ?? true) && hit)
  }
  return lines
}

/** Finds the coverage entry of a repo-relative path (coverage paths may be absolute container paths). */
function findEntry(coverage, rel) {
  const key = Object.keys(coverage).find((k) => k.replace(/\\/g, '/').endsWith('/' + rel))
  return key ? coverage[key] : null
}

/** Returns { files: [{file, covered, total, uncovered[]}], covered, total, pct }. */
export function computeChanged(changed, coverage) {
  const files = []
  let covered = 0
  let total = 0
  for (const [file, set] of changed) {
    const entry = findEntry(coverage, file)
    if (!entry) continue // not measured: locales, routes data, css, tests, excluded paths
    const exec = executableLines(entry)
    let c = 0
    let t = 0
    const uncovered = []
    for (const l of [...set].sort((a, b) => a - b)) {
      if (!exec.has(l)) continue
      t++
      if (exec.get(l)) c++
      else uncovered.push(l)
    }
    if (t === 0) continue
    files.push({ file, covered: c, total: t, uncovered })
    covered += c
    total += t
  }
  return { files, covered, total, pct: total === 0 ? 100 : (covered / total) * 100 }
}

function main() {
  const base = process.env.COVERAGE_BASE || 'origin/develop'
  const threshold = Number(process.env.COVERAGE_CHANGED_THRESHOLD || 95)
  const covFile = process.env.COVERAGE_FILE || 'coverage/coverage-final.json'
  const coverage = JSON.parse(readFileSync(covFile, 'utf8'))
  const diff = execFileSync('git', ['diff', '--unified=0', '--no-color', `${base}...HEAD`], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024
  })
  const r = computeChanged(parseDiff(diff), coverage)
  for (const f of r.files) {
    const pct = ((f.covered / f.total) * 100).toFixed(1)
    console.log(`${pct.padStart(6)}%  ${f.covered}/${f.total}  ${f.file}`)
    if (f.uncovered.length) console.log(`        uncovered lines: ${f.uncovered.join(', ')}`)
  }
  console.log(`\nChanged executable lines: ${r.covered}/${r.total} covered = ${r.pct.toFixed(1)} % (threshold ${threshold} %)`)
  if (r.pct < threshold) {
    console.error('FAIL: changed-code coverage below threshold')
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
