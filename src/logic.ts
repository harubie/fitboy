import type { AppData, CheckIn, Exercise, Meal, Session, SetLog, WorkoutDay } from './types'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return dateKey(new Date(y, m - 1, d + n))
}

export function totalsFor(meals: Meal[], date: string) {
  return meals
    .filter((m) => m.date === date)
    .reduce(
      (t, m) => ({
        calories: t.calories + m.calories,
        protein: t.protein + m.protein,
      }),
      {
        calories: 0,
        protein: 0,
      },
    )
}

/** Most recent distinct meals (by name), newest first — for quick re-adding. */
export function recentMeals(meals: Meal[], limit = 8): Meal[] {
  const seen = new Set<string>()
  const out: Meal[] = []
  for (let i = meals.length - 1; i >= 0 && out.length < limit; i--) {
    const key = meals[i].name.trim().toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(meals[i])
  }
  return out
}

/** The plan you trained most recently (or the first plan) — what "Start workout" on Base opens. */
export function quickStartPlan(routine: WorkoutDay[], sessions: Session[]): WorkoutDay | undefined {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const day = routine.find((d) => d.id === sessions[i].dayId)
    if (day) return day
  }
  return routine[0]
}

export function planStats(sessions: Session[], dayId: string): { count: number; last?: string } {
  let count = 0
  let last: string | undefined
  for (const s of sessions) {
    if (s.dayId !== dayId) continue
    count++
    if (!last || s.date > last) last = s.date
  }
  return { count, last }
}

/** Effective status for a date: a logged session counts as a workout. */
export function statusFor(data: Pick<AppData, 'sessions' | 'checkIns'>, date: string): CheckIn | undefined {
  if (data.sessions.some((s) => s.date === date)) return 'workout'
  return data.checkIns[date]
}

/**
 * Consecutive days with a workout or rest check-in, ending today
 * (or yesterday, if today hasn't been checked in yet).
 */
export function streak(data: Pick<AppData, 'sessions' | 'checkIns'>, today: string = dateKey()): number {
  let day = statusFor(data, today) ? today : addDays(today, -1)
  let count = 0
  while (statusFor(data, day)) {
    count++
    day = addDays(day, -1)
  }
  return count
}

/** Workout days (rest days excluded) in each unbroken run of check-ins, oldest first. */
export function workoutRuns(data: Pick<AppData, 'sessions' | 'checkIns'>): number[] {
  const dates = [...new Set([...Object.keys(data.checkIns), ...data.sessions.map((s) => s.date)])].sort()
  const runs: number[] = []
  let prev: string | undefined
  for (const d of dates) {
    const s = statusFor(data, d)
    if (!s) continue
    if (!prev || addDays(prev, 1) !== d) runs.push(0)
    if (s === 'workout') runs[runs.length - 1]++
    prev = d
  }
  return runs
}

/** Sets from the most recent session that included this exercise. */
export function lastSets(sessions: Session[], exerciseId: string): SetLog[] | undefined {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const e = sessions[i].entries.find((x) => x.exerciseId === exerciseId)
    if (e && e.sets.length) return e.sets
  }
  return undefined
}

export function formatSets(sets: SetLog[], unit: string, timed = false): string {
  return sets
    .map((s) => {
      const amount = timed ? `${s.reps}s` : String(s.reps)
      return s.weight > 0 ? `${s.weight}${unit}×${amount}` : timed ? amount : `BW×${amount}`
    })
    .join(', ')
}

const ex = (name: string, sets: number, reps: string, more: Partial<Exercise> = {}): Exercise => ({
  id: uid(),
  name,
  sets,
  reps,
  ...more,
})

export const FULL_BODY_NAME = '90-Day Full Body'

/** 3 sessions a week, same workout each time, ~13 weeks. */
export function fullBodyDay(): WorkoutDay {
  return {
    id: uid(),
    name: FULL_BODY_NAME,
    exercises: [
      ex('Lat Pulldowns', 3, '10-12', {
        target: 'Back & Biceps',
        effort: '2 RIR',
        rest: 90,
        cue: 'Pull the bar to your collarbone using your elbows.',
      }),
      ex('Dumbbell Bicep Curls', 3, '10-12', {
        target: 'Biceps',
        effort: '2 RIR',
        rest: 75,
        cue: 'Turn your palms fully upward as you lift the weight.',
      }),
      ex('Goblet Squats', 3, '10-12', {
        target: 'Legs & Glutes',
        effort: '2 RIR',
        rest: 105,
        cue: 'Hold a dumbbell vertically against your chest; sit deep.',
      }),
      ex('Dumbbell Chest Press', 3, '10-12', {
        target: 'Chest & Shoulders',
        effort: '2 RIR',
        rest: 90,
        cue: 'Lie flat on a bench; press the weights straight up.',
      }),
      ex('Cable Crunches', 3, '12-15', {
        target: 'Upper Abs',
        effort: '1-2 RIR',
        rest: 75,
        cue: 'Kneel, hold rope to head, curl your spine downward.',
      }),
      ex("Captain's Chair Raises", 3, '12-15', {
        target: 'Lower Abs',
        effort: '1-2 RIR',
        rest: 75,
        cue: 'Support your arms; curl your pelvis up to your chest.',
      }),
      ex('Plank', 3, '30', {
        target: 'Deep Core',
        effort: 'Max effort',
        rest: 60,
        cue: 'Keep your body in a straight line; squeeze your glutes.',
        timed: true,
      }),
    ],
  }
}

export function defaultData(): AppData {
  return {
    settings: { calorieGoal: 2500, proteinGoal: 150, unit: 'kg', meterStyle: 'pixel' },
    meals: [],
    sessions: [],
    checkIns: {},
    routine: [fullBodyDay()],
  }
}

/** How many of `n` segments to light up (capped at n; 0 if no goal). */
export function litSegments(value: number, goal: number, n: number): number {
  if (goal <= 0 || value <= 0) return 0
  return Math.min(n, Math.max(1, Math.round((value / goal) * n)))
}
