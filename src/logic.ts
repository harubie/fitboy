import type { AppData, CheckIn, Meal, Session, SetLog, WorkoutDay } from './types'

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
    .reduce((t, m) => ({ calories: t.calories + m.calories, protein: t.protein + m.protein }), {
      calories: 0,
      protein: 0,
    })
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

/** Next day in the rotation after the most recently logged session. */
export function nextWorkout(routine: WorkoutDay[], sessions: Session[]): WorkoutDay | undefined {
  if (routine.length === 0) return undefined
  for (let i = sessions.length - 1; i >= 0; i--) {
    const idx = routine.findIndex((d) => d.id === sessions[i].dayId)
    if (idx !== -1) return routine[(idx + 1) % routine.length]
  }
  return routine[0]
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

/** Sets from the most recent session that included this exercise. */
export function lastSets(sessions: Session[], exerciseId: string): SetLog[] | undefined {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const e = sessions[i].entries.find((x) => x.exerciseId === exerciseId)
    if (e && e.sets.length) return e.sets
  }
  return undefined
}

export function formatSets(sets: SetLog[], unit: string): string {
  return sets.map((s) => `${s.weight}${unit}×${s.reps}`).join(', ')
}

const ex = (name: string, sets: number, reps: string) => ({ id: uid(), name, sets, reps })

export function defaultData(): AppData {
  return {
    settings: { calorieGoal: 2500, proteinGoal: 150, unit: 'kg' },
    meals: [],
    sessions: [],
    checkIns: {},
    routine: [
      {
        id: uid(),
        name: 'Push',
        exercises: [ex('Bench Press', 3, '6-10'), ex('Overhead Press', 3, '8-10'), ex('Tricep Pushdown', 3, '10-15')],
      },
      {
        id: uid(),
        name: 'Pull',
        exercises: [ex('Deadlift', 3, '5'), ex('Lat Pulldown', 3, '8-12'), ex('Barbell Curl', 3, '10-12')],
      },
      {
        id: uid(),
        name: 'Legs',
        exercises: [ex('Squat', 3, '6-10'), ex('Romanian Deadlift', 3, '8-10'), ex('Calf Raise', 3, '12-15')],
      },
    ],
  }
}
