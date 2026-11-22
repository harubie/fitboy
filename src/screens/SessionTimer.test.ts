/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('pins the active workout timer at the top, clear of the phone safe area', () => {
  const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8')
  const rule = css.match(/\.session-timer\s*\{([^}]*)\}/)?.[1]
  expect(rule).toMatch(/position:\s*fixed/)
  expect(rule).toMatch(/top:\s*.*safe-area-inset-top/)
  expect(rule).toMatch(/z-index:/)
})
