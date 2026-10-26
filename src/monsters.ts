import { addDays, statusFor, streak, uid } from './logic'
import { FORM_BY_ID, STAGE_MIN, SUPER, stageFor } from './pet'
import type { AppData, Monster, Monsters } from './types'

type Log = Pick<AppData, 'sessions' | 'checkIns'>

/** Days without care before the monster devolves a stage. */
export const NEGLECT_DAYS = 7
const ULTIMATE = SUPER - 1

const daysBetween = (a: string, b: string) => {
  const [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000)
}

function careDates(log: Log): string[] {
  return [...new Set([...Object.keys(log.checkIns), ...log.sessions.map((s) => s.date)])].sort()
}

function countWorkouts(log: Log, from: string, to: string): number {
  return careDates(log).filter((d) => d >= from && d <= to && statusFor(log, d) === 'workout').length
}

export const currentForm = (m: Monster) => FORM_BY_ID[m.forms[m.forms.length - 1]]

/** Workouts this monster has eaten (only counts while it's the active one). */
export function monsterXp(m: Monster, log: Log, today: string): number {
  return m.base + (m.since ? countWorkouts(log, m.since, today) : 0)
}

/** Most recent day with a workout or rest check-in since the monster became active. */
function lastCare(m: Monster, log: Log, today: string): string | undefined {
  if (!m.since) return undefined
  const since = m.since
  return careDates(log)
    .filter((d) => d >= since && d <= today && statusFor(log, d))
    .at(-1)
}

/** Days since the monster was last cared for (0 = cared for today). */
export function neglectDays(m: Monster, log: Log, today: string): number {
  const ref = lastCare(m, log, today) ?? m.since
  return ref ? Math.max(0, daysBetween(ref, today)) : 0
}

/** True if the monster already devolved for its current neglect streak. */
export function devolvedNow(m: Monster, log: Log, today: string): boolean {
  return !!m.devolvedFor && m.devolvedFor === (lastCare(m, log, today) ?? m.since)
}

function newEgg(log: Log, since: string): Monster {
  return { id: uid(), born: since, forms: ['egg'], base: -countWorkouts(log, since, since), since }
}

/** First roster: the egg starts at the beginning of the current streak so existing progress counts. */
export function initialMonsters(log: Log, today: string): Monsters {
  const n = streak(log, today)
  const end = statusFor(log, today) ? today : addDays(today, -1)
  const since = n > 0 ? addDays(end, -(n - 1)) : today
  return { active: { id: uid(), born: since, forms: ['egg'], base: 0, since }, cryo: [], dex: ['egg'] }
}

/**
 * Bring the active monster up to date: devolve after neglect, then evolve (randomly) for every
 * stage its workouts have reached. Returns the same object when nothing changed.
 */
export function reconcile(ms: Monsters, log: Log, today: string, rng: () => number = Math.random): Monsters {
  let m = ms.active

  const xp = monsterXp(m, log, today)
  let form = currentForm(m)
  const forms = [...m.forms]
  while (stageFor(xp) > form.stage && form.next.length) {
    form = FORM_BY_ID[form.next[Math.floor(rng() * form.next.length)]]
    forms.push(form.id)
  }
  if (forms.length !== m.forms.length) m = { ...m, forms }

  // Neglect is checked after catching up on growth, so a stale monster can't lose earned progress.
  const care = lastCare(m, log, today) ?? m.since
  if (care && daysBetween(care, today) >= NEGLECT_DAYS && m.devolvedFor !== care) {
    m = { ...m, devolvedFor: care }
    if (m.forms.length > 2) {
      const forms = m.forms.slice(0, -1)
      const stage = FORM_BY_ID[forms[forms.length - 1]].stage
      m = { ...m, forms, base: STAGE_MIN[stage] - countWorkouts(log, m.since!, today) }
    }
  }

  const dex = [...new Set([...ms.dex, ...m.forms, ...ms.cryo.flatMap((c) => c.forms)])]
  if (m === ms.active && dex.length === ms.dex.length) return ms
  return { ...ms, active: m, dex }
}

const bank = (m: Monster, log: Log, today: string): Monster => ({
  ...m,
  base: monsterXp(m, log, today),
  since: undefined,
  devolvedFor: undefined,
})

/** Activate a monster from today; today's workout (if any) was already eaten by the previous one. */
const wake = (m: Monster, log: Log, today: string): Monster => ({
  ...m,
  base: m.base - countWorkouts(log, today, today),
  since: today,
})

/** Put the active monster into cryo sleep and start a fresh egg. */
export function freeze(ms: Monsters, log: Log, today: string): Monsters {
  return { ...ms, active: newEgg(log, today), cryo: [...ms.cryo, bank(ms.active, log, today)] }
}

/** Swap a frozen monster with the active one. */
export function thaw(ms: Monsters, id: string, log: Log, today: string): Monsters {
  const target = ms.cryo.find((m) => m.id === id)
  if (!target) return ms
  const cryo = ms.cryo.map((m) => (m.id === id ? bank(ms.active, log, today) : m))
  return { ...ms, active: wake(target, log, today), cryo }
}

export const canFuse = (a: Monster, b: Monster) => currentForm(a).stage === ULTIMATE && currentForm(b).stage === ULTIMATE

/** Fuse the active Ultimate with a frozen Ultimate into the Chimera. The frozen one is consumed. */
export function fuse(ms: Monsters, id: string, log: Log, today: string): Monsters {
  const partner = ms.cryo.find((m) => m.id === id)
  if (!partner || !canFuse(ms.active, partner)) return ms
  const a = ms.active
  const xp = Math.max(monsterXp(a, log, today), STAGE_MIN[SUPER])
  const active = { ...a, forms: [...a.forms, 'chimera'], base: xp - (a.since ? countWorkouts(log, a.since, today) : 0) }
  return {
    active,
    cryo: ms.cryo.filter((m) => m.id !== id),
    dex: [...new Set([...ms.dex, 'chimera'])],
  }
}
