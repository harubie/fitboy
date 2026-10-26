import { describe, expect, it } from 'vitest'
import {
  FORMS,
  FORM_BY_ID,
  PALETTE,
  SCREEN,
  STAGE_NAMES,
  SUPER,
  formsAtStage,
  framePixels,
  stageFor,
  tierFor,
  tierName,
} from './pet'

describe('evolution tree', () => {
  it('has the Digimon-style shape: 1 / 1 / 1 / 3 / 5 / 7 / 5 / 2', () => {
    expect(STAGE_NAMES.map((_, s) => formsAtStage(s).length)).toEqual([1, 1, 1, 3, 5, 7, 5, 2])
  })

  it('only links each form to forms in the next stage', () => {
    for (const f of FORMS) {
      for (const n of f.next) {
        expect(FORM_BY_ID[n], `${f.id} → ${n}`).toBeDefined()
        expect(FORM_BY_ID[n].stage, `${f.id} → ${n}`).toBe(f.stage + 1)
      }
      if (f.stage < SUPER) expect(f.next.length, `${f.id} has no evolutions`).toBeGreaterThan(0)
    }
  })

  it('can reach every non-fusion form from the egg', () => {
    const seen = new Set<string>(['egg'])
    const queue = ['egg']
    while (queue.length) {
      for (const n of FORM_BY_ID[queue.shift()!].next) {
        if (!seen.has(n)) {
          seen.add(n)
          queue.push(n)
        }
      }
    }
    expect(FORMS.filter((f) => !seen.has(f.id)).map((f) => f.id)).toEqual(['chimera'])
  })
})

describe('stageFor', () => {
  it('maps workouts to stages', () => {
    const w = [0, 1, 2, 3, 6, 7, 20, 21, 49, 50, 99, 100, 199, 200, 5000]
    expect(w.map(stageFor)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7])
  })
})

describe('colour tiers', () => {
  it('change every 100 workouts after Super Ultimate and never run out', () => {
    expect([199, 200, 299, 300, 700, 10_000].map(tierFor)).toEqual([0, 0, 0, 1, 5, 98])
    expect([0, 1, 4, 5, 6].map(tierName)).toEqual(['Emerald', 'Sapphire', 'Obsidian', 'Prismatic', 'Prismatic 2'])
  })
})

describe('sprites', () => {
  it('are rectangular, use known colours and fit on screen in every frame', () => {
    for (const form of FORMS) {
      for (const frame of [0, 1] as const) {
        const rows = form.frames[frame].rows
        expect(new Set(rows.map((r) => r.length)).size, `${form.id} f${frame} widths`).toBe(1)
        for (const ch of rows.join('')) expect(ch === '.' || ch in PALETTE, `${form.id} char ${ch}`).toBe(true)
        for (const asleep of [false, true]) {
          for (const p of framePixels(form.id, frame, asleep, 7)) {
            expect(p.x >= 0 && p.x < SCREEN && p.y >= 0 && p.y < SCREEN, `${form.id} f${frame} off-screen`).toBe(true)
          }
        }
      }
    }
  })
})
