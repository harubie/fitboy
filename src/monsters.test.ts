import { describe, expect, it } from 'vitest'
import { addDays } from './logic'
import { canFuse, currentForm, freeze, fuse, initialMonsters, monsterXp, neglectDays, reconcile, thaw } from './monsters'
import { FORM_BY_ID } from './pet'
import type { CheckIn, Monster, Monsters } from './types'

const today = '2026-10-26'
const first = () => 0 // rng that always picks the first branch

/** n consecutive days ending `end` (inclusive) with the given status. */
function days(n: number, end = today, status: CheckIn = 'workout'): Record<string, CheckIn> {
  return Object.fromEntries(Array.from({ length: n }, (_, i) => [addDays(end, -i), status]))
}
const log = (checkIns: Record<string, CheckIn>) => ({ sessions: [], checkIns })

const egg = (since: string): Monsters => ({
  active: { id: 'a', born: since, forms: ['egg'], base: 0, since },
  cryo: [],
  dex: ['egg'],
})

describe('reconcile', () => {
  it('counts a newly backdated workout within the active period and reduces neglect after a backdated rest day', () => {
    const roster = egg(addDays(today, -6))
    const corrected = log({ [addDays(today, -3)]: 'workout', [addDays(today, -1)]: 'rest' })
    const ms = reconcile(roster, corrected, today, first)
    expect(monsterXp(ms.active, corrected, today)).toBe(1)
    expect(neglectDays(ms.active, corrected, today)).toBe(1)
    expect(currentForm(ms.active).id).toBe('hatchling')
  })
  it('does not award backdated workouts before activation to a new egg', () => {
    const corrected = log({ [addDays(today, -1)]: 'workout' })
    expect(monsterXp(egg(today).active, corrected, today)).toBe(0)
  })
  it('evolves through each stage as workouts add up, along the tree', () => {
    const l = log(days(21))
    const ms = reconcile(egg(addDays(today, -20)), l, today, first)
    expect(ms.active.forms).toEqual(['egg', 'hatchling', 'sprout', 'gremlin', 'brute'])
    expect(ms.dex).toEqual(['egg', 'hatchling', 'sprout', 'gremlin', 'brute'])
  })

  it('picks branches using the random source', () => {
    const ms = reconcile(egg(addDays(today, -6)), log(days(7)), today, () => 0.99)
    expect(currentForm(ms.active).id).toBe('frostbun')
  })

  it('rest days keep the streak but do not feed the monster', () => {
    const l = log({ ...days(3, today, 'rest'), [addDays(today, -3)]: 'workout' })
    const ms = reconcile(egg(addDays(today, -3)), l, today, first)
    expect(monsterXp(ms.active, l, today)).toBe(1)
    expect(currentForm(ms.active).id).toBe('hatchling')
  })

  it('returns the same object when nothing changes', () => {
    const ms = reconcile(egg(today), log({}), today, first)
    expect(reconcile(ms, log({}), today, first)).toBe(ms)
  })

  it('devolves one stage after a week of neglect, only once per neglect spell', () => {
    const lastDay = addDays(today, -7)
    const l = log(days(21, lastDay))
    const start = egg(addDays(lastDay, -20))
    const grown = reconcile(start, l, lastDay, first)
    expect(currentForm(grown.active).id).toBe('brute')

    expect(neglectDays(grown.active, l, addDays(today, -1))).toBe(6)
    expect(currentForm(reconcile(grown, l, addDays(today, -1), first).active).id).toBe('brute')

    const neglected = reconcile(grown, l, today, first)
    expect(currentForm(neglected.active).id).toBe('gremlin')
    expect(monsterXp(neglected.active, l, today)).toBe(7)
    expect(reconcile(neglected, l, addDays(today, 5), first).active.forms).toEqual(neglected.active.forms)
  })

  it('catches up on growth before applying neglect', () => {
    const l = log(days(21, addDays(today, -8)))
    const ms = reconcile(egg(addDays(today, -28)), l, today, first)
    expect(ms.active.forms).toEqual(['egg', 'hatchling', 'sprout', 'gremlin'])
    expect(monsterXp(ms.active, l, today)).toBe(7)
  })

  it('never devolves below Baby I', () => {
    const l = log(days(1, '2026-01-01'))
    const ms = reconcile(egg('2026-01-01'), l, '2026-01-01', first)
    expect(reconcile(ms, l, today, first).active.forms).toEqual(['egg', 'hatchling'])
  })
})

describe('cryo sleep', () => {
  it('freezes progress and starts a new egg that does not eat today’s workout twice', () => {
    const l = log(days(7))
    const grown = reconcile(egg(addDays(today, -6)), l, today, first)
    const frozen = freeze(grown, l, today)
    expect(frozen.active.forms).toEqual(['egg'])
    expect(monsterXp(frozen.active, l, today)).toBe(0)
    expect(monsterXp(frozen.cryo[0], l, addDays(today, 30))).toBe(7)
    expect(reconcile(frozen, l, today, first).active.forms).toEqual(['egg'])
  })

  it('thaw swaps the frozen monster back in with its progress', () => {
    const l = log(days(7))
    const frozen = freeze(reconcile(egg(addDays(today, -6)), l, today, first), l, today)
    const id = frozen.cryo[0].id
    const later = addDays(today, 3)
    const l2 = log({ ...days(7), ...days(3, later) })
    const back = thaw(frozen, id, l2, later)
    expect(currentForm(back.active).id).toBe('gremlin')
    expect(monsterXp(back.active, l2, later)).toBe(7)
    expect(back.cryo).toHaveLength(1)
    expect(back.cryo[0].forms[0]).toBe('egg')
  })
})

describe('fusion', () => {
  const ultimate = (id: string, active: boolean): Monster => ({
    id,
    born: '2026-01-01',
    forms: ['egg', 'hatchling', 'sprout', 'gremlin', 'brute', 'beast', 'legend'],
    base: 150,
    since: active ? today : undefined,
  })

  it('fuses two Ultimates into the Chimera and consumes the partner', () => {
    const ms: Monsters = { active: ultimate('a', true), cryo: [ultimate('b', false)], dex: [] }
    expect(canFuse(ms.active, ms.cryo[0])).toBe(true)
    const fused = fuse(ms, 'b', log({}), today)
    expect(currentForm(fused.active).id).toBe('chimera')
    expect(FORM_BY_ID.chimera.stage).toBe(7)
    expect(monsterXp(fused.active, log({}), today)).toBe(200)
    expect(fused.cryo).toEqual([])
    expect(fused.dex).toContain('chimera')
  })

  it('refuses to fuse non-Ultimates', () => {
    const ms: Monsters = { active: ultimate('a', true), cryo: [{ ...ultimate('b', false), forms: ['egg'] }], dex: [] }
    expect(fuse(ms, 'b', log({}), today)).toBe(ms)
  })
})

describe('initialMonsters', () => {
  it('starts the first egg at the beginning of the current streak', () => {
    const l = log(days(4, addDays(today, -1)))
    const ms = reconcile(initialMonsters(l, today), l, today, first)
    expect(ms.active.born).toBe(addDays(today, -4))
    expect(currentForm(ms.active).id).toBe('sprout')
  })
})
